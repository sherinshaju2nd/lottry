import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Accepts the admin session cookie (manual sync from /admin) or `Bearer CRON_SECRET`
// (automation) via isAuthorizedAdmin. No hardcoded fallback secret.
const handleSync = async (req: NextRequest, successMessage: string) => {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchAndSyncLatestLottery();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Failed to fetch from indialotteryapi endpoint",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, message: successMessage, data: result.data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    console.error("[api/sync] Sync failed:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
};

export const GET = (req: NextRequest) =>
  handleSync(req, "Lottery data synced successfully to Supabase");

export const POST = (req: NextRequest) =>
  handleSync(req, "Manual sync executed successfully to Supabase");
