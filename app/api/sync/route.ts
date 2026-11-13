import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncAllSources, fetchAndSyncFromSource, fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { revalidateDrawPages } from "@/lib/drawRevalidation";

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

const syncAll = async () => {
  const outcomes = await fetchAndSyncAllSources();
  const results = outcomes.map(({ sourceId, name, result: { success, error, data } }) => ({ sourceId, name, success, error, data }));
  const synced = results.filter(({ success }) => success);

  // Refresh each distinct draw page once.
  const draws = new Map(synced.map(({ data }) => [`${data?.lottery_code}:${data?.draw_date}`, data]));
  draws.forEach((draw) => revalidateDrawPages(draw));

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
    if (mode.kind === "all") return await syncAll();

    const result = mode.kind === "source" ? await fetchAndSyncFromSource(mode.sourceId) : await fetchAndSyncLatestLottery();
    const { success, error, data, source, attempts } = result;

    if (!success) {
      return NextResponse.json(
        { success: false, error: error ?? "Failed to fetch from the API sources", source, attempts },
        { status: 502, headers: noStore },
      );
    }

    // Manual syncs refresh cached result pages the same way the cron does.
    revalidateDrawPages(data);
    return NextResponse.json({ success: true, message: successMessage, data, source, attempts }, { headers: noStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    console.error("[api/sync] Sync failed:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: noStore });
  }
};

export const GET = (req: NextRequest) => handleSync(req, "Lottery data synced successfully to Supabase");

export const POST = (req: NextRequest) => handleSync(req, "Manual sync executed successfully to Supabase");
