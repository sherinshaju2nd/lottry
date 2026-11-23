import { hasAnyDrawResult, type StructuredDrawResult } from "@/lib/supabase";

/**
 * Pure helpers for the homepage's draw state, shared by the server (first render) and the
 * client (HomeLiveClient's loadRecentDrawsMap). Keep these in sync with that function's rules.
 */

/** Today's date in IST as "YYYY-MM-DD". */
export const getISTToday = (): string => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

/** The IST date `offsetDays` from today as "YYYY-MM-DD" (e.g. -1 = yesterday). */
export const getISTDateOffset = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

/**
 * Draws dated before this (i.e. older than yesterday) are "history": they don't change during a
 * live draw, so the server caches them separately from the live/recent draws.
 */
export const getHistoryCutoffDate = (): string => getISTDateOffset(-1);

/** Newest draw per lottery code (input must be newest-first). */
export const buildRecentDrawsMap = (draws: StructuredDrawResult[]): Record<string, StructuredDrawResult> =>
  draws.reduce<Record<string, StructuredDrawResult>>((map, draw) => {
    const code = (draw.lottery_code || "").toUpperCase();
    return code && !map[code] ? { ...map, [code]: draw } : map;
  }, {});

export interface HomeDrawState {
  todayDrawResult: StructuredDrawResult | null;
  latestPreviousDraw: StructuredDrawResult | null;
}

/** Same selection as loadRecentDrawsMap: today's published result, and the most recent earlier draw. */
export const deriveHomeDrawState = (draws: StructuredDrawResult[], today: string): HomeDrawState => ({
  todayDrawResult: draws.find((d) => d.draw_date === today && hasAnyDrawResult(d)) ?? null,
  latestPreviousDraw: draws.find((d) => d.draw_date !== today) || draws[1] || draws[0] || null,
});

/** Draws embedded in the first HTML: enough for the first screen; the full list loads after hydration. */
export const INITIAL_DRAW_COUNT = 16;

/** Rows per homepage list page (first load and every "Load more" request). */
export const HOME_DRAWS_PAGE_SIZE = 20;
