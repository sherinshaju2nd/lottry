import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.keralalotteryresultstoday.in";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/api/sync/"],
      },
      // Explicitly allow major AI search engines and crawler bots
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "Googlebot",
          "Applebot",
          "Applebot-Extended",
          "Bingbot",
          "cohere-ai",
          "Bytespider",
          "CCBot",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/search", "/claim", "/faq", "/guide"],
        disallow: ["/admin/", "/api/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
