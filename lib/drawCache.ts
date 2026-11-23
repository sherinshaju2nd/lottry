import { unstable_cache } from "next/cache";
import {
  queryDrawsInDateRange,
  sortDrawsNewestFirst,
  queryDrawDates,
  queryDrawHistory,
  queryDrawSummariesForLottery,
  queryDrawSummariesForMonth,
  queryDrawSummariesPage,
  queryDrawsForDate,
  queryDrawsForLatestDates,
  queryLotteries,
  queryPostponedDraws,
  queryPublishedDrawDates,
  querySingleDraw,
  getStaticLotteryRecords,
  mergeDrawLists,
  type LotteryRecord,
  type PostponedDraw,
  type StructuredDrawResult,
} from "@/lib/supabase";
import {
  HOME_DRAWS_PAGE_SIZE,
  buildRecentDrawsMap,
  getHistoryCutoffDate,
  getISTToday,
} from "@/lib/homeInitialData";

/**
 * SERVER-ONLY change-driven data cache for draw_results / postponed_draws / lotteries.
 *
 * Every read is stored in Next's data cache under one tag and is NOT re-read on a timer:
 * Supabase is only queried again after `invalidateDrawData()` (lib/drawRevalidation.ts) runs,
 * which every write path calls (cron/manual sync when a draw actually changed, admin saves and
 * deletes, and the optional database webhook). So between changes, every visitor, refetch and
 * ticket search is served from the cache with zero database egress.
 *
 * - Failed reads throw inside the cache scope, so a failure is never cached; callers fall back
 *   to a direct (uncached) read.
 * - Each entry records `readAt` (taken before the query) so clients can compare it with socket
 *   commit times and never let a cached copy replace newer live data.
 * - SAFETY_TTL only covers edits made outside the app (e.g. the Supabase dashboard) when the
 *   webhook isn't configured.
 */
export const DRAW_DATA_TAG = "draw-data";
/**
 * Draws older than yesterday (see getHistoryCutoffDate). They never change during a live draw,
 * so they are only re-read when an admin/webhook touches an old draw (or once a day, because the
 * cutoff date is part of the cache key) — not on every live prize update.
 */
export const DRAW_HISTORY_TAG = "draw-history";
const SAFETY_TTL_SECONDS = 6 * 60 * 60;

export interface CachedRead<T> {
  data: T;
  /** ISO time the database was read (before the query ran). */
  readAt: string;
}

const cachedRead = <A extends unknown[], T>(
  key: string,
  query: (...args: A) => Promise<T>,
  tag: string = DRAW_DATA_TAG,
) => {
  const cached = unstable_cache(
    async (...args: A): Promise<CachedRead<T>> => {
      const readAt = new Date().toISOString();
      console.info(`[draw-cache] database read: ${key}`, args.length > 0 ? JSON.stringify(args) : "");
      return { data: await query(...args), readAt };
    },
    [`draw-cache:${key}`],
    { tags: [tag], revalidate: SAFETY_TTL_SECONDS },
  );
  /** Cached read; if the cache layer or the database fails, one direct attempt, then `fallback`. */
  return async (fallback: T, ...args: A): Promise<CachedRead<T>> => {
    try {
      return await cached(...args);
    } catch (err: unknown) {
      console.error(`[draw-cache] ${key} failed, reading directly:`, err instanceof Error ? err.message : String(err));
      const readAt = new Date().toISOString();
      try {
        return { data: await query(...args), readAt };
      } catch (directErr: unknown) {
        console.error(`[draw-cache] ${key} direct read failed:`, directErr instanceof Error ? directErr.message : String(directErr));
        // Epoch stamp: clients never let this fallback replace anything they already have.
        return { data: fallback, readAt: new Date(0).toISOString() };
      }
    }
  };
};

const recentDraws = cachedRead("recent-draws", (from: string) => queryDrawsInDateRange({ from }));
const historyDraws = cachedRead(
  "history-draws",
  (before: string) => queryDrawsInDateRange({ before }),
  DRAW_HISTORY_TAG,
);
const drawHistory = cachedRead("history", queryDrawHistory);
const drawDates = cachedRead("dates", queryDrawDates);
const singleDraw = cachedRead("single", (code: string, date?: string) => querySingleDraw(code, date));
const postponedDraws = cachedRead("postponed", (date?: string) => queryPostponedDraws(date));
const lotteries = cachedRead("lotteries", queryLotteries);
const summariesPage = cachedRead("page", queryDrawSummariesPage);
const summariesMonth = cachedRead("month", queryDrawSummariesForMonth);
const publishedDates = cachedRead("published-dates", queryPublishedDrawDates);
const lotteryRecent = cachedRead("lottery-recent", queryDrawSummariesForLottery);
const drawsForDate = cachedRead("date", queryDrawsForDate);
const latestDates = cachedRead("latest-dates", queryDrawsForLatestDates);

/**
 * Every draw with prize lists, newest first (ticket search, admin list). Built from two cache
 * entries so a live prize update only re-reads yesterday + today (a few KB), never the full
 * history (~360 KB).
 */
export const getCachedAllDraws = async (): Promise<CachedRead<StructuredDrawResult[]>> => {
  const cutoff = getHistoryCutoffDate();
  const [recent, history] = await Promise.all([recentDraws([], cutoff), historyDraws([], cutoff)]);
  return {
    data: sortDrawsNewestFirst([...recent.data, ...history.data]),
    readAt: recent.readAt < history.readAt ? recent.readAt : history.readAt,
  };
};
export const getCachedDrawHistory = (code: string) => drawHistory([], code.toUpperCase());
export const getCachedDrawDates = (code: string) => drawDates([], code.toUpperCase());
export const getCachedSingleDraw = (code: string, date?: string) =>
  singleDraw(null as StructuredDrawResult | null, code.toUpperCase(), date);
export const getCachedPostponedDraws = (date?: string) => postponedDraws([] as PostponedDraw[], date);
export const getCachedDrawSummariesPage = (offset: number, limit: number) =>
  summariesPage({ results: [], total: 0 }, offset, limit);
export const getCachedDrawSummariesForMonth = (month: string) => summariesMonth([], month);
export const getCachedPublishedDrawDates = () => publishedDates([]);
export const getCachedDrawSummariesForLottery = (code: string, limit: number) =>
  lotteryRecent([], code.toUpperCase(), limit);
export const getCachedDrawsForDate = (date: string) => drawsForDate([], date);
export const getCachedDrawsForLatestDates = (dateCount: number, extraDates: string[] = []) =>
  latestDates([], dateCount, extraDates);

/** Lotteries table, or the static list when it is empty/unreachable (same as getLotteriesFromSupabase). */
export const getCachedLotteries = async (): Promise<CachedRead<LotteryRecord[]>> => {
  const read = await lotteries([]);
  return read.data.length > 0 ? read : { ...read, data: getStaticLotteryRecords() };
};

/** Same rule as checkIsDatePostponed, on top of the cached postponement list. */
export const getCachedPostponement = async (date: string, lotteryCode?: string): Promise<PostponedDraw | null> => {
  const { data: list } = await getCachedPostponedDraws(date);
  if (list.length === 0) return null;
  if (!lotteryCode) return list[0] ?? null;
  const code = lotteryCode.toUpperCase();
  return list.find((p) => p.lottery_code.toUpperCase() === code || p.lottery_code.toUpperCase() === "ALL") ?? null;
};

export interface HomeDrawsPayload {
  /** Newest first. Today + the latest previous draw date carry `prizes`; older rows are summaries. */
  draws: StructuredDrawResult[];
  /** Total rows in draw_results, so the list knows whether "Load more" can fetch another page. */
  total: number;
  recentMap: Record<string, StructuredDrawResult>;
  /** When the oldest part of this payload was read from the database. */
  readAt: string;
}

/** Homepage draw data: full rows for the latest 2 dates (+ today) and the first summary page. */
export const getCachedHomeDraws = async (): Promise<HomeDrawsPayload> => {
  const [featured, firstPage] = await Promise.all([
    getCachedDrawsForLatestDates(2, [getISTToday()]),
    getCachedDrawSummariesPage(0, HOME_DRAWS_PAGE_SIZE),
  ]);
  const draws = mergeDrawLists(featured.data, firstPage.data.results);
  return {
    draws,
    total: Math.max(firstPage.data.total, draws.length),
    recentMap: buildRecentDrawsMap(draws),
    readAt: featured.readAt < firstPage.readAt ? featured.readAt : firstPage.readAt,
  };
};
