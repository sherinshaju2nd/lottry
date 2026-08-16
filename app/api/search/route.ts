import { NextRequest, NextResponse } from "next/server";
import { searchTicketsInSupabase, fetchAllDrawResultsFromSupabase } from "@/lib/supabase";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ success: false, error: "Search query required" }, { status: 400 });
  }

  // Auto-sync only if Supabase has no draw results recorded at all
  const currentDraws = await fetchAllDrawResultsFromSupabase();
  if (currentDraws.length === 0) {
    await fetchAndSyncLatestLottery();
  }

  const results = await searchTicketsInSupabase(q);

  return NextResponse.json({
    success: true,
    query: q,
    count: results.length,
    results,
  });
}
