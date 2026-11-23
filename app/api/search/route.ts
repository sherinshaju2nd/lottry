import { NextRequest, NextResponse } from "next/server";
import { searchTicketsInDraws } from "@/lib/supabase";
import { getCachedAllDraws } from "@/lib/drawCache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ success: false, error: "Search query required" }, { status: 400 });
  }

  // Matched against the server-cached draw list: the database is only read again after a real
  // data change (was: the whole draw_results table downloaded from Supabase on every search).
  const { data: draws } = await getCachedAllDraws();
  const results = searchTicketsInDraws(q, draws);

  return NextResponse.json({
    success: true,
    query: q,
    count: results.length,
    results,
  });
}
