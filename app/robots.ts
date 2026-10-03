import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const host = "www.keralalotteryresultstoday.in";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/feed.xml", "/llms.txt", "/llms-full.txt"],
        disallow: [
          "/admin/",
          "/api/",
          "/search?*",
          "/*?highlight=*",
          "/*?q=*",
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/feed.xml`,
    ],
    host,
  };
}
