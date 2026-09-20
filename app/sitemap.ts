import type { MetadataRoute } from "next";
import {
  ALL_LOTTERIES,
  WEEKLY_LOTTERIES,
  fetchDrawResultsForSitemap,
  getLotteryUrl,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Fresh sitemap every 5 minutes

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const { isoDate, weekday } = getTodayISTInfo();

  // 1. Core pages (priority 1.0 for home)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kerala-lottery-app`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/claim`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // 2. Weekly and Bumper lottery archives categories
  const lotteryPages: MetadataRoute.Sitemap = ALL_LOTTERIES.map((l) => ({
    url: `${baseUrl}${getLotteryUrl(l.code)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // 3. Dynamic historic draw results pages
  let drawPages: MetadataRoute.Sitemap = [];
  try {
    const draws = await fetchDrawResultsForSitemap();
    drawPages = draws.map((d) => ({
      url: `${baseUrl}${getLotteryUrl(d.lottery_code, d.draw_date)}`,
      lastModified: d.created_at ? new Date(d.created_at) : new Date(d.draw_date),
      changeFrequency: d.draw_date === isoDate ? ("hourly" as const) : ("monthly" as const),
      priority: d.draw_date === isoDate ? 1.0 : 0.7,
    }));

    // Ensure today's active scheduled draw URL is in sitemap from 00:00 midnight
    const fallback =
      WEEKLY_LOTTERIES.find((l) => l.day.toLowerCase() === weekday.toLowerCase()) ||
      WEEKLY_LOTTERIES[0];
    const todayDrawUrl = `${baseUrl}${getLotteryUrl(fallback.code, isoDate)}`;

    if (!drawPages.some((p) => p.url === todayDrawUrl)) {
      drawPages.unshift({
        url: todayDrawUrl,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 1.0,
      });
    }
  } catch (error) {
    console.error("Error generating dynamic draw sitemap links:", error);
  }

  return [...staticPages, ...lotteryPages, ...drawPages];
}
