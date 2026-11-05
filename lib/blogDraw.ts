import { cache } from "react";
import { supabase, getLotteryUrl } from "@/lib/supabase";
import { formatDrawDateLong, formatDrawDateShort, getTodayIST } from "@/lib/drawIndexing";
import type { BlogDrawContext } from "@/data/blogs";

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
