/**
 * Google Analytics 4 (gtag.js) configuration + typed event helper.
 *
 * Primary stream: "Kerala lottery results" (G-TVZP3L87PD).
 * Override with NEXT_PUBLIC_GA_MEASUREMENT_ID; set NEXT_PUBLIC_GA_LEGACY_MEASUREMENT_ID=""
 * to stop also sending to the older property.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-TVZP3L87PD";

const GA_LEGACY_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_LEGACY_MEASUREMENT_ID ?? "G-2JZL3TDXGE";

/** All GA4 properties that receive data (primary first, de-duplicated, blanks removed). */
export const GA_MEASUREMENT_IDS = [...new Set([GA_MEASUREMENT_ID, GA_LEGACY_MEASUREMENT_ID])].filter(
  (id) => /^G-[A-Z0-9]+$/.test(id),
);

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
  | { name: "share"; params: { method: string; content_type: string; item_id?: string } };

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
