import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshAfterDrawChange } from "@/lib/drawRevalidation";

export const dynamic = "force-dynamic";

const WATCHED_TABLES = new Set(["draw_results", "postponed_draws", "lotteries"]);

const secretMatches = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Database-change hook (optional). App writes (cron, sync, admin) already clear the draw data
 * cache themselves; this endpoint covers edits made OUTSIDE the app, e.g. in the Supabase
 * dashboard. Configure a Supabase Database Webhook on draw_results / postponed_draws / lotteries
 * (INSERT, UPDATE, DELETE) → POST https://<site>/api/revalidate-draws with header
 * `x-webhook-secret: <DRAW_WEBHOOK_SECRET>`. Without DRAW_WEBHOOK_SECRET set, it is disabled.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.DRAW_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json({ success: false, error: "Webhook not configured" }, { status: 503 });
  }
  if (!secretMatches(req.headers.get("x-webhook-secret") ?? "", expected)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let table = "";
  let record: { lottery_code?: string; draw_date?: string } | null = null;
  try {
    const body = (await req.json()) as {
      table?: string;
      record?: { lottery_code?: string; draw_date?: string } | null;
      old_record?: { lottery_code?: string; draw_date?: string } | null;
    };
    table = body.table ?? "";
    record = body.record ?? body.old_record ?? null;
  } catch (err: unknown) {
    console.warn("[revalidate-draws] unreadable body, refreshing everything:", err instanceof Error ? err.message : String(err));
  }

  if (table && !WATCHED_TABLES.has(table)) {
    return NextResponse.json({ success: true, skipped: true, reason: `table ${table} is not cached` });
  }

  await refreshAfterDrawChange(table === "draw_results" ? record : null);
  return NextResponse.json({ success: true, table: table || "unknown" }, { headers: { "Cache-Control": "no-store" } });
}
