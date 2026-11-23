import { revalidatePath, revalidateTag } from "next/cache";
import { getLotterySlug } from "./supabase";
import { DRAW_DATA_TAG, DRAW_HISTORY_TAG } from "./drawCache";
import { getHistoryCutoffDate } from "./homeInitialData";

type DrawRef = { lottery_code?: string; draw_date?: string } | null | undefined;

/**
 * Refreshes every cached page that shows a draw result (ISR pages are cached for up to 24h).
 * Call after any successful write of a draw result: cron, manual sync, or per-source sync.
 * Also clear the API data cache (refreshAfterDrawChange does both).
 */
export const revalidateDrawPages = (draw?: DrawRef): void => {
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

/** A database read that started just before a write can finish just after the first invalidation. */
const READ_RACE_WINDOW_MS = 2500;

/**
 * The history cache (draws older than yesterday) only needs clearing when an old draw changed,
 * or when we don't know which draw changed (deletes by id, lottery/postponement edits, webhook
 * without a record). Live syncs of today's/yesterday's draw leave it untouched.
 */
const touchesHistory = (draws: DrawRef[]): boolean =>
  draws.some((draw) => !draw?.draw_date || draw.draw_date < getHistoryCutoffDate());

const expireDrawDataTags = (draws: DrawRef[]): void => {
  try {
    // expire: 0 → the next read goes to the database (no stale copy is served during a live draw).
    revalidateTag(DRAW_DATA_TAG, { expire: 0 });
    if (touchesHistory(draws)) revalidateTag(DRAW_HISTORY_TAG, { expire: 0 });
  } catch (err: unknown) {
    console.warn("[invalidateDrawData] tag revalidation failed:", err instanceof Error ? err.message : String(err));
  }
};

/**
 * Marks the server data cache (lib/drawCache.ts) as changed. Call ONLY after a real database
 * change to draw_results, postponed_draws or lotteries — this is what makes the next request
 * read Supabase; without it every request is served from the cache. Pass the changed draw(s)
 * when known (omit for "unknown", which also clears the history cache).
 *
 * Invalidates twice: immediately, and again after a short wait, so a read that was already in
 * flight when the write committed can't leave an outdated copy in the cache. Await it in the
 * route handler (these are cron/admin routes, so the extra ~2.5s is harmless).
 */
export const invalidateDrawData = async (draws: DrawRef[] = [null]): Promise<void> => {
  expireDrawDataTags(draws);
  await new Promise((resolve) => setTimeout(resolve, READ_RACE_WINDOW_MS));
  expireDrawDataTags(draws);
};

/**
 * Data cache invalidation + page refresh, for routes that changed a draw. The data tags are
 * expired BEFORE the pages, so a page rebuilt right away already reads the new data.
 */
export const refreshAfterDrawChange = async (draw?: DrawRef): Promise<void> => {
  expireDrawDataTags([draw]);
  revalidateDrawPages(draw);
  await invalidateDrawData([draw]);
};
