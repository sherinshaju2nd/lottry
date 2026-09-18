import { NextResponse } from "next/server";
import {
  supabase,
  WEEKLY_LOTTERIES,
  getLotterySlug,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 900; // 15 minutes

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

export async function GET() {
  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const { formattedDate, isoDate, weekday } = getTodayISTInfo();

  try {
    const { data: draws, error } = await supabase
      .from("draw_results")
      .select("draw_name, draw_code, lottery_code, draw_date, first, created_at")
      .order("draw_date", { ascending: false })
      .limit(30);

    if (error || !draws) {
      throw error || new Error("Failed to load draws for RSS feed");
    }

    const todayDrawAlreadyRecorded = draws.some((d) => d.draw_date === isoDate);

    // Build today's active draw preview if not yet drawn (e.g. between 12:00 Midnight and 3:00 PM)
    let todayItemXml = "";
    if (!todayDrawAlreadyRecorded) {
      const fallback =
        WEEKLY_LOTTERIES.find((l) => l.day.toLowerCase() === weekday.toLowerCase()) ||
        WEEKLY_LOTTERIES[0];
      const todaySlug = getLotterySlug(fallback.code);
      const todayUrl = `${baseUrl}/${todaySlug}/${isoDate}`;
      const todayTitle = `LIVE: Kerala Lottery Result Today (${formattedDate}) | ${fallback.name} (${fallback.code}) Live Draw at 3:00 PM`;
      const todayDesc = `Today's Kerala State Lottery is ${fallback.name} (${fallback.nameMl}, ${fallback.code}) with a 1st Prize of ${fallback.jackpot || "₹1 Crore"}. Official live draw starts at 3:00 PM IST from Gorky Bhavan, Thiruvananthapuram. Check winning numbers and prize chart live.`;

      todayItemXml = `    <item>
      <title><![CDATA[${todayTitle}]]></title>
      <link>${todayUrl}</link>
      <guid isPermaLink="true">${todayUrl}</guid>
      <description><![CDATA[${todayDesc}]]></description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Kerala Lottery Today</category>
    </item>\n`;
    }

    const itemsXml = draws
      .map((draw) => {
        const slug = getLotterySlug(draw.lottery_code);
        const url = `${baseUrl}/${slug}/${draw.draw_date}`;
        const firstPrizeTicket = draw.first?.ticket ? ` | 1st Prize: ${draw.first.ticket}` : "";
        const title = `${draw.draw_name} (${draw.draw_code || draw.lottery_code}) Results Today ${draw.draw_date}${firstPrizeTicket}`;
        const description = `Live Kerala State Lottery results for ${draw.draw_name} (${draw.draw_code || draw.lottery_code}) held on ${draw.draw_date}. Check winning ticket numbers, prize list breakdown, and gazette status.`;
        const pubDate = draw.created_at
          ? new Date(draw.created_at).toUTCString()
          : new Date(draw.draw_date).toUTCString();

        return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>Kerala Lottery Results</category>
    </item>`;
      })
      .join("\n");

    const latestBuildDate = new Date().toUTCString();

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kerala Lottery Result Today - Official Daily Live Results Feed</title>
    <link>${baseUrl}</link>
    <description>Daily updated Kerala state lottery draw results, winning numbers, prize charts, and pdf publications.</description>
    <language>en-IN</language>
    <lastBuildDate>${latestBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${todayItemXml}${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (err: any) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Kerala Lottery</title><link>${baseUrl}</link><description>Daily Updates</description></channel></rss>`,
      {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
