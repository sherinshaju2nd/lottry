import HomeLiveClient from "./HomeLiveClient";
import type { StructuredDrawResult } from "@/lib/supabase";
import { getCachedHomeDraws } from "@/lib/drawCache";

// Results syncs call revalidatePath("/") on demand; this is the fallback refresh interval.
export const revalidate = 300;

/**
 * Homepage server entry. Draws come from the server data cache (lib/drawCache.ts), which only
 * re-reads Supabase after a real data change. Only the latest 2 draw dates carry the full prize
 * lists; older list rows are lightweight summaries, and HomeLiveClient pages in more on
 * "Load more". Countdown, live socket updates and search still run in HomeLiveClient.
 */
export default async function HomePage() {
  let initialDraws: StructuredDrawResult[] = [];
  let initialRecentMap: Record<string, StructuredDrawResult> = {};
  let initialTotal = 0;
  // When the draws were read from the database: lets the client tell whether later data is newer.
  let initialGeneratedAt = new Date(0).toISOString();

  try {
    const { draws, total, recentMap, readAt } = await getCachedHomeDraws();
    initialDraws = draws;
    initialRecentMap = recentMap;
    initialTotal = total;
    initialGeneratedAt = readAt;
  } catch (err: unknown) {
    // Never block the page: the client falls back to loading the draws in the browser, as before.
    console.error("[home] initial draws fetch failed:", err instanceof Error ? err.message : String(err));
  }

  return (
    <HomeLiveClient
      initialDraws={initialDraws}
      initialRecentMap={initialRecentMap}
      initialTotal={initialTotal}
      initialGeneratedAt={initialGeneratedAt}
    />
  );
}
