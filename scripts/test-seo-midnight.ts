import { submitUrlsToIndexNow } from "../app/api/indexnow/route";
import { submitUrlsToGoogle } from "../lib/google-indexing";
import { supabase, WEEKLY_LOTTERIES, getLotterySlug } from "../lib/supabase";

async function testMidnightSEO() {
  console.log("=== Testing Midnight SEO & Crawler Pings ===");

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

  console.log(`Current IST Date: ${formattedDate} (${weekday})`);

  const fallback =
    WEEKLY_LOTTERIES.find((l) => l.day.toLowerCase() === weekday.toLowerCase()) ||
    WEEKLY_LOTTERIES[0];

  const todaySlug = getLotterySlug(fallback.code);
  const baseUrl = "https://www.keralalotteryresultstoday.in";

  const urls = [
    baseUrl,
    `${baseUrl}/${todaySlug}`,
    `${baseUrl}/${todaySlug}/${isoDate}`,
    `${baseUrl}/feed.xml`,
    `${baseUrl}/sitemap.xml`,
  ];

  console.log("Target URLs to index:", urls);

  console.log("\n1. Testing Google WebSub / Sitemap Ping / Indexing API...");
  const googleRes = await submitUrlsToGoogle(urls);
  console.log("Google Ping Result:", JSON.stringify(googleRes, null, 2));

  console.log("\n2. Testing IndexNow...");
  const indexNowRes = await submitUrlsToIndexNow(urls);
  console.log("IndexNow Result:", JSON.stringify(indexNowRes, null, 2));

  console.log("\n✅ Midnight SEO Verification Test Complete!");
}

testMidnightSEO().catch(console.error);
