import { NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import { fetchAllDrawResultsFromSupabase } from "@/lib/supabase";

export async function GET() {
  const result = await fetchAndSyncLatestLottery();
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  const allDraws = await fetchAllDrawResultsFromSupabase();

  return NextResponse.json({
    success: true,
    message: "Lottery data synced successfully to Supabase",
    data: result.data,
    total_draws_in_db: allDraws.length,
  });
}

export async function POST() {
  const result = await fetchAndSyncLatestLottery();
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  const allDraws = await fetchAllDrawResultsFromSupabase();

  return NextResponse.json({
    success: true,
    message: "Manual sync executed successfully to Supabase",
    data: result.data,
    total_draws_in_db: allDraws.length,
  });
}
