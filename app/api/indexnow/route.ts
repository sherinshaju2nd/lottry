import { NextResponse } from "next/server";
import { ALL_LOTTERIES, fetchDrawResultsForSitemap, getLotteryUrl } from "@/lib/supabase";

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
      `${baseUrl}/search`,
      `${baseUrl}/app`,
      `${baseUrl}/claim`,
      `${baseUrl}/guide`,
      `${baseUrl}/faq`,
      `${baseUrl}/privacy-policy`,
      `${baseUrl}/terms-conditions`,
      `${baseUrl}/contact`,
    ];

    const categoryPages = ALL_LOTTERIES.map((l) => `${baseUrl}${getLotteryUrl(l.code)}`);

    let drawPages: string[] = [];
    try {
      const draws = await fetchDrawResultsForSitemap();
      drawPages = draws.map((d) => `${baseUrl}${getLotteryUrl(d.lottery_code, d.draw_date)}`);
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      count: urlList.length,
    };
  }
}

export async function GET() {
  const result = await submitUrlsToIndexNow();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { urlList } = body;
    const result = await submitUrlsToIndexNow(Array.isArray(urlList) ? urlList : undefined);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
