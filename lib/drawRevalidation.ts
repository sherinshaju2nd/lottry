import { revalidatePath } from "next/cache";
import { getLotterySlug } from "./supabase";

/**
 * Refreshes every cached page that shows a draw result (ISR pages are cached for up to 24h).
 * Call after any successful write of a draw result: cron, manual sync, or per-source sync.
 */
export const revalidateDrawPages = (draw?: { lottery_code?: string; draw_date?: string } | null): void => {
  try {
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    revalidatePath("/analytics");
    const lotterySlug = draw?.lottery_code ? getLotterySlug(draw.lottery_code) : "";
    if (lotterySlug) {
      revalidatePath(`/${lotterySlug}`);
      if (draw?.draw_date) revalidatePath(`/${lotterySlug}/${draw.draw_date}`);
    }
  } catch (err: unknown) {
    console.warn("[revalidateDrawPages] cache refresh failed:", err instanceof Error ? err.message : String(err));
  }
};
