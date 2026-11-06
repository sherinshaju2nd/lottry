import { NextResponse } from "next/server";
import {
  ALL_LOTTERIES,
  fetchDrawResultsForSitemap,
  getAnnouncedBumperDraws,
  getLotteryUrl,
} from "@/lib/supabase";
import { getAllBlogs, getBlogPath } from "@/data/blogs";

export const dynamic = "force-dynamic";

export const INDEXNOW_KEY = "a6e8b2c4d9f148739201567bcde3fa48";
export const HOST_NAME = "www.keralalotteryresultstoday.in";

export async function submitUrlsToIndexNow(customUrls?: string[]) {
  const host = HOST_NAME;
  const baseUrl = `https://${host}`;

  let urlList: string[] = [];

  if (customUrls && customUrls.length > 0) {
    urlList = customUrls;
  } else {
    // Generate complete list of URLs across the site
    const staticPages = [
      baseUrl,
      `${baseUrl}/lotteries`,
      `${baseUrl}/analytics`,
      `${baseUrl}/search`,
      `${baseUrl}/kerala-lottery-app`,
      `${baseUrl}/claim`,
      `${baseUrl}/guide`,
      `${baseUrl}/faq`,
      `${baseUrl}/support`,
      `${baseUrl}/privacy-policy`,
      `${baseUrl}/terms-conditions`,
      `${baseUrl}/contact`,
      `${baseUrl}/blog`,
      ...getAllBlogs().map(({ slug }) => `${baseUrl}${getBlogPath(slug)}`),
    ];

    const categoryPages = ALL_LOTTERIES.map((l) => `${baseUrl}${getLotteryUrl(l.code)}`);

    let drawPages: string[] = [];
    try {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
      const [draws, upcoming] = await Promise.all([
        fetchDrawResultsForSitemap(90), // recent draws only
        getAnnouncedBumperDraws(today),
      ]);
      drawPages = [
        ...upcoming.map(({ code, date }) => `${baseUrl}${getLotteryUrl(code, date)}`),
        ...draws.map((d) => `${baseUrl}${getLotteryUrl(d.lottery_code, d.draw_date)}`),
      ];
    } catch (e) {
      console.warn("IndexNow sitemap fetch note:", e);
    }

    urlList = Array.from(new Set([...staticPages, ...categoryPages, ...drawPages]));
  }

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return {
      success: response.ok,
      status: response.status,
      count: urlList.length,
      urls: urlList,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg,
      count: urlList.length,
    };
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET;

  if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await submitUrlsToIndexNow();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET;

  if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { urlList } = body;
    const result = await submitUrlsToIndexNow(Array.isArray(urlList) ? urlList : undefined);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
