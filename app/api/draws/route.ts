import { NextRequest, NextResponse } from "next/server";
import { getLotteryCodeFromSlug, type StructuredDrawResult } from "@/lib/supabase";
import {
  getCachedAllDraws,
  getCachedDrawDates,
  getCachedDrawHistory,
  getCachedDrawSummariesForLottery,
  getCachedDrawSummariesForMonth,
  getCachedDrawSummariesPage,
  getCachedDrawsForDate,
  getCachedHomeDraws,
  getCachedLotteries,
  getCachedPostponedDraws,
  getCachedPostponement,
  getCachedPublishedDrawDates,
  getCachedSingleDraw,
} from "@/lib/drawCache";
import { HOME_DRAWS_PAGE_SIZE, getISTDateOffset } from "@/lib/homeInitialData";

export const dynamic = "force-dynamic";

/**
 * Data: every branch reads through the server data cache (lib/drawCache.ts), which only queries
 * Supabase again after a real change (invalidateDrawData). `generatedAt` is when that data was
 * read from the database, so clients can compare it with live socket updates.
 *
 * CDN caching is chosen by WHAT is requested, not by the time of day:
 * - anything that can contain the newest draws (today's live updates) is cached ≤15s at the
 *   CDN and never in the browser, so new visitors always start from near-live data;
 * - purely historical data (older pages, past months, old dates) never changes during a draw
 *   and is cached for an hour.
 * Pages also get live changes through the Supabase socket, and every response carries
 * `generatedAt` so the client never lets an older cached copy replace newer socket data.
 */
const LIVE_DATA_CACHE = "public, max-age=0, s-maxage=15, stale-while-revalidate=15";
const HISTORICAL_CACHE = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";


/** True when the request can only return draws that are at least 2 days old. */
const isHistoricalRequest = (type: string | null, searchParams: URLSearchParams): boolean => {
  const yesterday = getISTDateOffset(-1);
  if (type === "page") return toNonNegativeInt(searchParams.get("offset"), 0, 100_000) > 0;
  if (type === "month") return (searchParams.get("month") ?? "") < yesterday.slice(0, 7);
  if (type === "date") return (searchParams.get("date") ?? "9999") < yesterday;
  return false;
};

const toNonNegativeInt = (value: string | null, fallback: number, max: number): number => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback;
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

const newestFirst = (draws: StructuredDrawResult[]): StructuredDrawResult[] =>
  [...draws].sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCode = searchParams.get("code");
  const code = rawCode ? getLotteryCodeFromSlug(rawCode) : null;
  const date = searchParams.get("date");
  const type = searchParams.get("type"); // "dates" | "single" | "all" | "history" | "postponed" | "lotteries"

  let responseData: Record<string, unknown> = {};
  // When the returned data was read from the database (set by each branch).
  let generatedAt = new Date(0).toISOString();

  if (type === "postponed") {
    const { data: list, readAt } = await getCachedPostponedDraws(date || undefined);
    responseData = { success: true, list };
    generatedAt = readAt;
  } else if (type === "lotteries") {
    const { data: lotteries, readAt } = await getCachedLotteries();
    responseData = { success: true, lotteries };
    generatedAt = readAt;
  } else if (type === "home") {
    const { draws, total, recentMap, readAt } = await getCachedHomeDraws();
    responseData = { success: true, results: draws, total, recentMap };
    generatedAt = readAt;
  } else if (type === "page") {
    const offset = toNonNegativeInt(searchParams.get("offset"), 0, 100_000);
    const limit = Math.max(1, toNonNegativeInt(searchParams.get("limit"), HOME_DRAWS_PAGE_SIZE, 50));
    const { data: { results, total }, readAt } = await getCachedDrawSummariesPage(offset, limit);
    responseData = { success: true, results, total };
    generatedAt = readAt;
  } else if (type === "month") {
    const month = searchParams.get("month") ?? "";
    const { data: results, readAt } = /^\d{4}-\d{2}$/.test(month)
      ? await getCachedDrawSummariesForMonth(month)
      : { data: [], readAt: generatedAt };
    responseData = { success: true, results };
    generatedAt = readAt;
  } else if (type === "published-dates") {
    const { data: dates, readAt } = await getCachedPublishedDrawDates();
    responseData = { success: true, dates };
    generatedAt = readAt;
  } else if (type === "date") {
    const day = date ?? "";
    const { data: results, readAt } = /^\d{4}-\d{2}-\d{2}$/.test(day)
      ? await getCachedDrawsForDate(day)
      : { data: [], readAt: generatedAt };
    responseData = { success: true, results };
    generatedAt = readAt;
  } else if (type === "lottery-recent" && code) {
    const limit = Math.max(1, toNonNegativeInt(searchParams.get("limit"), 10, 50));
    const { data: results, readAt } = await getCachedDrawSummariesForLottery(code, limit);
    responseData = { success: true, results };
    generatedAt = readAt;
  } else if (type === "history" && code) {
    // Filtered in the database (was: whole table fetched, then filtered here).
    const { data, readAt } = await getCachedDrawHistory(code);
    const results = newestFirst(data);
    responseData = { success: true, results, count: results.length };
    generatedAt = readAt;
  } else if (type === "dates" && code) {
    const { data: dates, readAt } = await getCachedDrawDates(code);
    responseData = { success: true, dates };
    generatedAt = readAt;
  } else if (type === "all") {
    const { data, readAt } = await getCachedAllDraws();
    responseData = { success: true, results: newestFirst(data) };
    generatedAt = readAt;
  } else if (code) {
    const [{ data: result, readAt }, postponement] = await Promise.all([
      getCachedSingleDraw(code, date || undefined),
      date ? getCachedPostponement(date, code) : Promise.resolve(null),
    ]);
    responseData = { success: true, result, postponement };
    generatedAt = readAt;
  } else {
    const { data: results, readAt } = await getCachedAllDraws();
    responseData = { success: true, results };
    generatedAt = readAt;
  }

  const response = NextResponse.json({ ...responseData, generatedAt });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // type=all is the admin list, reloaded right after every admin save: never CDN-cache it, so the
  // admin always sees their change (it is still served from the server data cache, not the DB).
  // `fresh` is sent by pages reacting to a live postponement/lottery change: bypass the CDN copy.
  const bypassCdn = type === "all" || searchParams.has("fresh");
  const cacheControlValue = bypassCdn
    ? "private, no-store"
    : isHistoricalRequest(type, searchParams)
      ? HISTORICAL_CACHE
      : LIVE_DATA_CACHE;

  response.headers.set("Cache-Control", cacheControlValue);
  return response;
}
