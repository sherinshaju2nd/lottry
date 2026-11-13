import { MetadataRoute } from "next";

const ALLOW_PATHS = [
  "/",
  "/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/kerala-lottery-app",
  "/lotteries",
  "/claim",
  "/guide",
  "/faq",
  "/blog",
  // Result PDFs are linked from every draw page — let them be crawled & indexed
  "/api/pdf/",
  "/.well-known/assetlinks.json",
  "/.well-known/apple-app-site-association",
];

const DISALLOW_PATHS = ["/admin/", "/api/", "/search?*", "/*?highlight=*", "/*?q=*"];

/**
 * AI answer-engine & assistant crawlers (AEO). Allowed so ChatGPT, Claude, Perplexity,
 * Gemini and Copilot can cite this site; private/API paths stay blocked.
 */
const AI_ANSWER_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

/** Scrapers / SEO-tool crawlers that cost bandwidth and send no visitors. */
const BLOCKED_BOTS = [
  "Bytespider",
  "CCBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.keralalotteryresultstoday.in";

  return {
    rules: [
      { userAgent: "*", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: AI_ANSWER_BOTS, allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: BLOCKED_BOTS, disallow: ["/"] },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/feed.xml`],
    host: "www.keralalotteryresultstoday.in",
  };
}
