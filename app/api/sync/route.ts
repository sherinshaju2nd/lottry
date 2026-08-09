import { NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import { fetchAllDrawResultsFromSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await fetchAndSyncLatestLottery();
    const allDraws = await fetchAllDrawResultsFromSupabase();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to fetch from indialotteryapi endpoint",
        total_draws_in_db: allDraws.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lottery data synced successfully to Supabase",
      data: result.data,
      total_draws_in_db: allDraws.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await fetchAndSyncLatestLottery();
    const allDraws = await fetchAllDrawResultsFromSupabase();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to fetch from indialotteryapi endpoint",
        total_draws_in_db: allDraws.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Manual sync executed successfully to Supabase",
      data: result.data,
      total_draws_in_db: allDraws.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error occurred";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
