import HomeLiveClient from "./HomeLiveClient";
import { fetchAllDrawResultsFromSupabase, type StructuredDrawResult } from "@/lib/supabase";
import { INITIAL_DRAW_COUNT, buildRecentDrawsMap } from "@/lib/homeInitialData";

// Results syncs call revalidatePath("/") on demand; this is the fallback refresh interval.
export const revalidate = 300;

/**
 * Homepage server entry. Fetches the latest draws once on the server so the first HTML already
 * contains real results (no grey placeholders / slow Speed Index). Everything interactive —
 * countdown, live socket updates, refetches, search — still runs in HomeLiveClient exactly as before.
 */
export default async function HomePage() {
  let initialDraws: StructuredDrawResult[] = [];
  let initialRecentMap: Record<string, StructuredDrawResult> = {};

  try {
    const all = [...(await fetchAllDrawResultsFromSupabase())].sort(
      (a, b) => Date.parse(b.draw_date) - Date.parse(a.draw_date),
    );
    initialDraws = all.slice(0, INITIAL_DRAW_COUNT);
    // Latest draw for every lottery (incl. bumpers drawn months ago) — 13 entries, small.
    initialRecentMap = buildRecentDrawsMap(all);
  } catch (err: unknown) {
    // Never block the page: the client falls back to loading everything in the browser, as before.
    console.error("[home] initial draws fetch failed:", err instanceof Error ? err.message : String(err));
  }

  return <HomeLiveClient initialDraws={initialDraws} initialRecentMap={initialRecentMap} />;
}
