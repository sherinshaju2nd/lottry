import { NextRequest, NextResponse } from "next/server";
import { searchTicketsInSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ success: false, error: "Search query required" }, { status: 400 });
  }


  const results = await searchTicketsInSupabase(q);

  return NextResponse.json({
    success: true,
    query: q,
    count: results.length,
    results,
  });
}
