import { NextRequest, NextResponse } from "next/server";
import { generateSocialMediaDigests } from "@/lib/gemini";
import { getDrawResultFromSupabase, fetchAllDrawResultsFromSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const date = searchParams.get("date");

    let draw = null;
    if (code) {
      draw = await getDrawResultFromSupabase(code, date || undefined);
    } else {
      const all = await fetchAllDrawResultsFromSupabase();
      if (all && all.length > 0) draw = all[0];
    }

    if (!draw) {
      return NextResponse.json(
        { success: false, error: "No draw results found to generate digest for." },
        { status: 404 }
      );
    }

    const digest = await generateSocialMediaDigests(draw);

    return NextResponse.json({
      success: true,
      draw: {
        draw_name: draw.draw_name,
        draw_code: draw.draw_code,
        draw_date: draw.draw_date,
      },
      digest,
    });
  } catch (error: any) {
    console.error("AI Digest Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate social media digest.",
      },
      { status: 500 }
    );
  }
}
