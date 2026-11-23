import { NextRequest, NextResponse } from "next/server";
import { generateSocialMediaDigests } from "@/lib/gemini";
import { getCachedDrawsForLatestDates, getCachedSingleDraw } from "@/lib/drawCache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const date = searchParams.get("date");

    let draw = null;
    if (code) {
      draw = (await getCachedSingleDraw(code, date || undefined)).data;
    } else {
      const { data: all } = await getCachedDrawsForLatestDates(2);
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate social media digest.";
    console.error("AI Digest Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let draw = body.draw;

    if (!draw) {
      const { data: all } = await getCachedDrawsForLatestDates(2);
      if (all && all.length > 0) draw = all[0];
    }

    if (!draw) {
      return NextResponse.json(
        { success: false, error: "No draw results found to generate digest for." },
        { status: 404 }
      );
    }

    const digest = await generateSocialMediaDigests(draw);
    return NextResponse.json({ success: true, digest });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate social media digest.";
    console.error("AI Digest POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
