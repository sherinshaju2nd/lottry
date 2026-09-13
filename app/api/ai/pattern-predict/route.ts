import { NextRequest, NextResponse } from "next/server";
import { analyzeLotteryPatternsWithGemini } from "@/lib/gemini";
import {
  fetchAllDrawResultsFromSupabase,
  StructuredDrawResult,
  getCachedAiPatternPrediction,
  saveAiPatternPrediction,
} from "@/lib/supabase";

/**
 * Fast GET endpoint to check / fetch existing cached AI prediction for a lottery
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || searchParams.get("lotteryCode") || "ALL").toUpperCase();
    const countParam = searchParams.get("drawsCount");
    const requestedCount = countParam ? parseInt(countParam, 10) : undefined;

    const cachedRecord = await getCachedAiPatternPrediction(code);

    if (cachedRecord && cachedRecord.analysis) {
      const isUpToDate =
        requestedCount !== undefined
          ? cachedRecord.draws_count === requestedCount
          : true;

      return NextResponse.json({
        success: true,
        cached: true,
        isUpToDate,
        analysis: cachedRecord.analysis,
        drawsCount: cachedRecord.draws_count,
        latestDrawDate: cachedRecord.latest_draw_date,
        cachedAt: cachedRecord.updated_at,
      });
    }

    return NextResponse.json({
      success: false,
      cached: false,
      message: "No cached AI pattern prediction found.",
    });
  } catch (error: any) {
    console.warn("GET pattern-predict cache check note:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check cache." },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint: Smart Caching Pattern Analysis
 * - Cache Hit: Exact draws_count match -> Returns saved analysis (0 Gemini calls)
 * - Cache Miss / Outdated: Invokes Gemini AI, updates DB row, returns fresh analysis
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lotteryName = "All Kerala Lotteries",
      lotteryCode = "ALL",
      draws: providedDraws,
      lang = "en",
      forceRefresh = false,
    } = body;

    let targetDraws: StructuredDrawResult[] = [];

    // If client supplied the filtered draws array directly, use it
    if (Array.isArray(providedDraws) && providedDraws.length > 0) {
      targetDraws = providedDraws;
    } else {
      // Otherwise fetch from database
      const allDraws = await fetchAllDrawResultsFromSupabase(true);
      if (lotteryCode === "ALL") {
        targetDraws = allDraws;
      } else {
        targetDraws = allDraws.filter(
          (d) =>
            d.lottery_code?.toUpperCase() === lotteryCode.toUpperCase() ||
            d.draw_code?.toUpperCase().startsWith(lotteryCode.toUpperCase())
        );
      }
    }

    if (!targetDraws || targetDraws.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No historical draw data available for the selected lottery.",
        },
        { status: 400 }
      );
    }

    const currentDrawCount = targetDraws.length;
    const latestDrawDate = targetDraws[0]?.draw_date;

    let cachedRecord: any = null;
    try {
      cachedRecord = await getCachedAiPatternPrediction(lotteryCode);
    } catch (e) {
      console.warn("Cached record check note:", e);
    }

    // --- STEP 1: Check Database Cache ---
    // If cache exists and draw count matches current draw count, serve from cache with 0 Gemini hits
    if (!forceRefresh && cachedRecord && cachedRecord.analysis) {
      if (cachedRecord.draws_count === currentDrawCount) {
        console.log(
          `[AI Cache HIT] Using saved prediction for ${lotteryCode} (${currentDrawCount} draws). 0 Gemini API calls.`
        );
        return NextResponse.json({
          success: true,
          analysis: cachedRecord.analysis,
          cached: true,
          drawsCount: cachedRecord.draws_count,
          cachedAt: cachedRecord.updated_at,
        });
      }
    }

    // --- STEP 2: Cache Miss or Stale (Draws count increased / Force refresh) -> Call Gemini ---
    console.log(
      `[AI Cache MISS/REFRESH] Calling Gemini API for ${lotteryCode} with ${currentDrawCount} draws (Previous DB count: ${cachedRecord?.draws_count || 0}, forceRefresh: ${forceRefresh}).`
    );

    let freshAnalysis: any = null;
    try {
      freshAnalysis = await analyzeLotteryPatternsWithGemini(
        lotteryName,
        lotteryCode,
        targetDraws,
        lang
      );
    } catch (geminiError: any) {
      console.error("Gemini API call failed:", geminiError);

      // Graceful fallback: If Gemini fails during a refresh but we have older cached data, serve the older cache
      if (cachedRecord && cachedRecord.analysis) {
        console.warn(
          `[AI Fallback] Gemini API unavailable. Serving last known cached analysis for ${lotteryCode}.`
        );
        return NextResponse.json({
          success: true,
          analysis: cachedRecord.analysis,
          cached: true,
          fallback: true,
          drawsCount: cachedRecord.draws_count,
          cachedAt: cachedRecord.updated_at,
          warning: "Serving existing pattern analysis as AI generation is temporarily congested.",
        });
      }

      throw geminiError;
    }

    // --- STEP 3: Atomic Save / Update in Supabase Cache ---
    try {
      await saveAiPatternPrediction({
        lottery_code: lotteryCode,
        lottery_name: lotteryName,
        draws_count: currentDrawCount,
        latest_draw_date: latestDrawDate,
        analysis: freshAnalysis,
      });
      console.log(
        `[AI Cache SAVED] Persisted updated Gemini prediction for ${lotteryCode} (${currentDrawCount} draws) to DB.`
      );
    } catch (saveErr) {
      console.warn("Failed to persist AI prediction to DB cache:", saveErr);
    }

    return NextResponse.json({
      success: true,
      analysis: freshAnalysis,
      cached: false,
      drawsCount: currentDrawCount,
      updatedCache: true,
    });
  } catch (error: any) {
    console.error("Pattern Predict AI API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to analyze lottery patterns.",
      },
      { status: 500 }
    );
  }
}
