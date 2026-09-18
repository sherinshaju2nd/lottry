import { NextRequest, NextResponse } from "next/server";
import { submitUrlsToIndexNow } from "@/app/api/indexnow/route";
import { submitUrlsToGoogle } from "@/lib/google-indexing";
import {
  supabase,
  WEEKLY_LOTTERIES,
  getLotterySlug,
  logCronExecutionInSupabase,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getTodayISTInfo() {
  const now = new Date();
  const istParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long",
  }).formatToParts(now);

  const day = istParts.find((p) => p.type === "day")?.value || "";
  const month = istParts.find((p) => p.type === "month")?.value || "";
  const year = istParts.find((p) => p.type === "year")?.value || "";
  const weekday = istParts.find((p) => p.type === "weekday")?.value || "";

  const formattedDate = `${day}.${month}.${year}`;
  const isoDate = `${year}-${month}-${day}`;

  return { formattedDate, isoDate, weekday };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const { formattedDate, isoDate, weekday } = getTodayISTInfo();

  try {
    // 1. Identify today's active lottery scheme
    const { data: bumperDraw } = await supabase
      .from("lotteries")
      .select("name, code, is_bumper")
      .eq("draw_date", isoDate)
      .maybeSingle();

    let lotteryCode = bumperDraw?.code || "";
    let lotteryName = bumperDraw?.name || "";

    if (!lotteryCode) {
      const fallback =
        WEEKLY_LOTTERIES.find((l) => l.day.toLowerCase() === weekday.toLowerCase()) ||
        WEEKLY_LOTTERIES[0];
      lotteryCode = fallback.code;
      lotteryName = fallback.name;
    }

    const todaySlug = getLotterySlug(lotteryCode);
    const baseUrl = "https://www.keralalotteryresultstoday.in";

    // 2. High-priority URLs to index at 12:00 Midnight IST
    const midnightUrls = [
      baseUrl,
      `${baseUrl}/${todaySlug}`,
      `${baseUrl}/${todaySlug}/${isoDate}`,
      `${baseUrl}/feed.xml`,
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/analytics`,
      `${baseUrl}/search`,
    ];

    // 3. Submit to IndexNow (Bing, Yahoo, Naver, Seznam) and Google Indexing
    const [indexNowResult, googleResult] = await Promise.allSettled([
      submitUrlsToIndexNow(midnightUrls),
      submitUrlsToGoogle(midnightUrls),
    ]);

    const indexNowData = indexNowResult.status === "fulfilled" ? indexNowResult.value : { success: false };
    const googleData = googleResult.status === "fulfilled" ? googleResult.value : null;

    // 4. Log in Supabase
    const executionTimeMs = Date.now() - startTime;
    await logCronExecutionInSupabase({
      trigger_source: "midnight_seo_cron",
      status: indexNowData.success ? "success" : "failed",
      message: `Midnight 12:00 AM indexing triggered for ${lotteryName} (${lotteryCode}) on ${formattedDate}`,
      details: {
        isoDate,
        weekday,
        lotteryName,
        lotteryCode,
        urls: midnightUrls,
        indexNowStatus: (indexNowData as any)?.status,
        googleIndex: googleData,
      },
      duration_ms: executionTimeMs,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      istDate: formattedDate,
      weekday,
      todayLottery: `${lotteryName} (${lotteryCode})`,
      urlsSubmitted: midnightUrls,
      indexNow: indexNowData,
      google: googleData,
      executionTimeMs,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
