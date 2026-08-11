import { MetadataRoute } from "next";
import { WEEKLY_LOTTERIES, fetchAllDrawResultsFromSupabase } from "@/lib/supabase";

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
  ];

  // 2. Weekly lottery archives categories
  const lotteryPages = WEEKLY_LOTTERIES.map((l) => ({
    url: `${baseUrl}/lottery/${l.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // 3. Dynamic historic draw results pages
  let drawPages: MetadataRoute.Sitemap = [];
  try {
    const draws = await fetchAllDrawResultsFromSupabase();
    drawPages = draws.map((d) => ({
      url: `${baseUrl}/lottery/${d.lottery_code.toLowerCase()}/${d.draw_date}`,
      lastModified: d.created_at ? new Date(d.created_at) : new Date(d.draw_date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating dynamic draw sitemap links:", error);
  }

  return [...staticPages, ...lotteryPages, ...drawPages];
}
