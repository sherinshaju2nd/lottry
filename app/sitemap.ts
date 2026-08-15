import type { MetadataRoute } from "next";
import { ALL_LOTTERIES, fetchDrawResultsForSitemap, getLotteryUrl } from "@/lib/supabase";

export const revalidate = 3600; // Revalidate sitemap cache every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.keralalotteryresultstoday.in";

  // 1. Core pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
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
  ];

  // 2. Weekly and Bumper lottery archives categories
  const lotteryPages = ALL_LOTTERIES.map((l) => ({
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
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating dynamic draw sitemap links:", error);
  }

  return [...staticPages, ...lotteryPages, ...drawPages];
}
