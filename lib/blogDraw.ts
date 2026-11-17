import { cache } from "react";
import { supabase, getLotteryUrl, getRecentDrawsFromSupabase } from "@/lib/supabase";
import { formatDrawDateLong, formatDrawDateShort, getTodayIST } from "@/lib/drawIndexing";
import type { BlogDrawContext, BlogRecentDraw } from "@/data/blogs";

/**
 * Builds the draw context for a blog post from `lotteries.draw_date` / `draw_time`
 * (admin-managed). Returns null when the lottery code is unknown or the query fails.
 */
export const getBlogDrawContext = cache(
  async (lotteryCode: string): Promise<BlogDrawContext | null> => {
    try {
      const { data, error } = await supabase
        .from("lotteries")
        .select("draw_date, draw_time")
        .eq("code", lotteryCode)
        .maybeSingle();

      if (error) {
        console.error(`[blog] draw context error for ${lotteryCode}:`, error.message);
        return null;
      }

      const date: string | null = data?.draw_date ?? null;
      return {
        lotteryCode,
        url: date ? getLotteryUrl(lotteryCode, date) : getLotteryUrl(lotteryCode),
        date,
        dateLong: date ? formatDrawDateLong(date) : "the date announced by the Kerala State Lotteries Department",
        dateShort: date ? formatDrawDateShort(date) : "TBA",
        drawTime: data?.draw_time ?? "2:00 PM",
        isUpcoming: date ? date >= getTodayIST() : false,
      };
    } catch (err: unknown) {
      console.error(
        `[blog] draw context exception for ${lotteryCode}:`,
        err instanceof Error ? err.message : String(err),
      );
      return null;
    }
  },
);

/** Days a winning ticket can be surrendered after the draw (Kerala Paper Lotteries (Regulation) Amendment Rules, 2024). */
export const CLAIM_WINDOW_DAYS = 90;

const addDaysISO = (isoDate: string, days: number): string =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

const daysUntil = (fromISO: string, toISO: string): number =>
  Math.round((Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86_400_000);

/**
 * Latest published draws (from draw_results) for the data panels inside guide posts,
 * each with its 90-day surrender deadline. Returns [] when the query fails.
 */
export const getBlogRecentDraws = cache(async (limit = 7): Promise<BlogRecentDraw[]> => {
  try {
    // Over-fetch slightly: duplicate rows (same date + 1st prize ticket under two codes) are dropped below
    const rows = await getRecentDrawsFromSupabase(limit + 3);
    const today = getTodayIST();
    const keyOf = ({ draw_date, draw_code, first }: (typeof rows)[number]) =>
      `${draw_date}|${first?.ticket || draw_code}`;
    // Prefer the row whose draw code matches its lottery code (e.g. KR-776 over a mislabelled KY-776 copy)
    const isConsistent = ({ draw_code, lottery_code }: (typeof rows)[number]) =>
      (draw_code ?? "").startsWith(`${lottery_code}-`);
    const best = new Map<string, (typeof rows)[number]>();
    for (const row of rows.filter(({ draw_date }) => Boolean(draw_date))) {
      const current = best.get(keyOf(row));
      if (!current || (!isConsistent(current) && isConsistent(row))) best.set(keyOf(row), row);
    }
    return [...best.values()]
      .slice(0, limit)
      .map(({ draw_date, draw_name, draw_code, lottery_code, first }) => {
        const claimDeadline = addDaysISO(draw_date, CLAIM_WINDOW_DAYS);
        return {
          name: draw_name ?? lottery_code ?? "Kerala Lottery",
          code: draw_code ?? "",
          date: draw_date,
          dateLong: formatDrawDateLong(draw_date),
          firstTicket: first?.ticket ?? "",
          location: first?.location ?? "",
          url: getLotteryUrl(lottery_code ?? draw_name ?? "", draw_date),
          claimDeadline,
          claimDeadlineLong: formatDrawDateLong(claimDeadline),
          daysLeft: daysUntil(today, claimDeadline),
        };
      });
  } catch (err: unknown) {
    console.error("[blog] recent draws exception:", err instanceof Error ? err.message : String(err));
    return [];
  }
});
