/**
 * Google Analytics 4 (gtag.js) configuration + typed event helper.
 *
 * Stream: "we" — https://www.keralalotteryresultstoday.in (G-GFTHMG5RGQ).
 * Override with NEXT_PUBLIC_GA_MEASUREMENT_ID (comma-separate to send to several properties).
 */

const DEFAULT_GA_MEASUREMENT_ID = "G-GFTHMG5RGQ";

/** All GA4 properties that receive data (de-duplicated, invalid/blank values removed). */
export const GA_MEASUREMENT_IDS = [
  ...new Set(
    (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? DEFAULT_GA_MEASUREMENT_ID)
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^G-[A-Z0-9]+$/.test(id)),
  ),
];

/** Primary ID used to load gtag.js. */
export const GA_MEASUREMENT_ID = GA_MEASUREMENT_IDS[0] ?? DEFAULT_GA_MEASUREMENT_ID;

/** Inline bootstrap for gtag.js — configures every measurement ID once. */
export const getGtagInitScript = (): string => `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${GA_MEASUREMENT_IDS.map((id) => `gtag('config', '${id}');`).join("\n")}
`;

/** Custom events (beyond GA4 enhanced measurement: page views, scrolls, outbound clicks, downloads). */
type AnalyticsEvent =
  | { name: "ticket_search"; params: { search_term: string; source: "home" | "search_page" | "barcode"; results: number } }
  | { name: "ticket_scan"; params: { method: "camera" | "barcode" } }
  | { name: "share"; params: { method: string; content_type: string; item_id?: string } }
  | { name: "newsletter_subscribe"; params: { source: "news_page" | "article" } }
  | { name: "article_view"; params: { slug: string; category: string } };

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/** Sends a GA4 event. Safe on the server and when gtag is blocked (ad blockers). */
export const trackEvent = ({ name, params }: AnalyticsEvent): void => {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch (err: unknown) {
    console.warn("[analytics] event failed:", name, err instanceof Error ? err.message : String(err));
  }
};
