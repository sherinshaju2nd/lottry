import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncAllSources, fetchAndSyncFromSource, fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { invalidateDrawData, refreshAfterDrawChange, revalidateDrawPages } from "@/lib/drawRevalidation";

export const dynamic = "force-dynamic";
// "Sync all" calls each source in turn (up to 10 × 12s timeout).
export const maxDuration = 120;

const noStore = { "Cache-Control": "no-store" };

type SyncMode = { kind: "failover" } | { kind: "source"; sourceId: string } | { kind: "all" };

/**
 * Optional JSON body (POST only):
 *   { sourceId: "…" } → sync that one saved API source
 *   { all: true }     → sync every enabled source (priority #1 saved last)
 * Anything else       → normal failover sync (same as the cron).
 */
const readMode = async (req: NextRequest): Promise<SyncMode> => {
  if (req.method !== "POST" || !req.headers.get("content-type")?.includes("application/json")) return { kind: "failover" };
  try {
    const body = (await req.json()) as { sourceId?: unknown; all?: unknown };
    if (body.all === true) return { kind: "all" };
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim().slice(0, 40) : "";
    return sourceId ? { kind: "source", sourceId } : { kind: "failover" };
  } catch (err: unknown) {
    console.warn("[api/sync] ignoring unreadable body:", err instanceof Error ? err.message : String(err));
    return { kind: "failover" };
  }
};

/**
 * Automation calls this route with `Bearer CRON_SECRET` (possibly every minute): refresh only when
 * the data really changed. An admin pressing Sync (session cookie) always refreshes pages and
 * the data cache, so the button still works as a "force refresh".
 */
const isAutomatedCall = (req: NextRequest): boolean =>
  (req.headers.get("authorization") ?? "").toLowerCase().startsWith("bearer ");

const syncAll = async (forceRefresh: boolean) => {
  const outcomes = await fetchAndSyncAllSources();
  const results = outcomes.map(({ sourceId, name, result: { success, error, data, changed } }) => ({
    sourceId,
    name,
    success,
    error,
    data,
    changed,
  }));
  const synced = results.filter(({ success }) => success);

  // Refresh each distinct changed (or, for a manual sync, every synced) draw page once, then
  // clear the data cache once.
  const refreshDraws = new Map(
    synced
      .filter(({ changed }) => forceRefresh || changed !== false)
      .map(({ data }) => [`${data?.lottery_code}:${data?.draw_date}`, data]),
  );
  if (refreshDraws.size > 0) {
    refreshDraws.forEach((draw) => revalidateDrawPages(draw));
    await invalidateDrawData([...refreshDraws.values()]);
  }

  const message = `Synced ${synced.length} of ${results.length} API source(s) to the database.`;
  return NextResponse.json(
    { success: synced.length > 0, message, error: synced.length > 0 ? undefined : message, results },
    { status: synced.length > 0 ? 200 : 502, headers: noStore },
  );
};

// Accepts the admin session cookie (manual sync from /admin) or `Bearer CRON_SECRET`
// (automation) via isAuthorizedAdmin. No hardcoded fallback secret.
const handleSync = async (req: NextRequest, successMessage: string) => {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: noStore });
  }

  try {
    const mode = await readMode(req);
    const forceRefresh = !isAutomatedCall(req);
    if (mode.kind === "all") return await syncAll(forceRefresh);

    const result = mode.kind === "source" ? await fetchAndSyncFromSource(mode.sourceId) : await fetchAndSyncLatestLottery("admin-sync");
    const { success, error, data, source, attempts, changed } = result;

    if (!success) {
      return NextResponse.json(
        { success: false, error: error ?? "Failed to fetch from the API sources", source, attempts },
        { status: 502, headers: noStore },
      );
    }

    // Refresh pages + data cache on a real change, or always when an admin pressed Sync.
    if (forceRefresh || changed !== false) await refreshAfterDrawChange(data);
    return NextResponse.json(
      { success: true, message: successMessage, data, source, attempts, changed: changed !== false },
      { headers: noStore },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    console.error("[api/sync] Sync failed:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: noStore });
  }
};

export const GET = (req: NextRequest) => handleSync(req, "Lottery data synced successfully to Supabase");

export const POST = (req: NextRequest) => handleSync(req, "Manual sync executed successfully to Supabase");
