import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET || "kerala_lottery_cron_secret_2026";

  if (authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchAndSyncLatestLottery();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to fetch from indialotteryapi endpoint",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lottery data synced successfully to Supabase",
      data: result.data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET || "kerala_lottery_cron_secret_2026";

  if (authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchAndSyncLatestLottery();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to fetch from indialotteryapi endpoint",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Manual sync executed successfully to Supabase",
      data: result.data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
