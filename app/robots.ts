import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const host = "www.keralalotteryresultstoday.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/feed.xml",
          "/llms.txt",
          "/llms-full.txt",
          "/kerala-lottery-app",
          "/lotteries",
          "/claim",
          "/guide",
          "/faq",
          "/analytics",
          "/.well-known/assetlinks.json",
          "/.well-known/apple-app-site-association",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/search?*",
          "/*?highlight=*",
          "/*?q=*",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
          "cohere-ai",
        ],
        allow: [
          "/",
          "/feed.xml",
          "/llms.txt",
          "/llms-full.txt",
          "/kerala-lottery-app",
          "/lotteries",
          "/claim",
          "/guide",
          "/faq",
          "/analytics",
          "/.well-known/assetlinks.json",
          "/.well-known/apple-app-site-association",
        ],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/feed.xml`,
    ],
    host,
  };
}
