import { NextRequest, NextResponse } from "next/server";
import { submitUrlsToGoogle } from "@/lib/google-indexing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET || "kerala_lottery_cron_secret_2026";

  if (authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const defaultUrls = [
    "https://www.keralalotteryresultstoday.in",
    "https://www.keralalotteryresultstoday.in/search",
    "https://www.keralalotteryresultstoday.in/kerala-lottery-app",
    "https://www.keralalotteryresultstoday.in/analytics",
    "https://www.keralalotteryresultstoday.in/feed.xml",
  ];

  const results = await submitUrlsToGoogle(defaultUrls);
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    urls: defaultUrls,
    results,
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET || "kerala_lottery_cron_secret_2026";

  if (authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const urls = Array.isArray(body.urls) && body.urls.length > 0
      ? body.urls
      : ["https://www.keralalotteryresultstoday.in"];

    const results = await submitUrlsToGoogle(urls);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      urls,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
