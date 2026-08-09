import { NextRequest, NextResponse } from "next/server";
import {
  getDrawResultFromSupabase,
  getDrawDatesFromSupabase,
  fetchAllDrawResultsFromSupabase,
  StructuredDrawResult,
} from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const date = searchParams.get("date");
  const type = searchParams.get("type"); // "dates" | "single" | "all" | "history"

  if (type === "history" && code) {
    const supabaseResults = await fetchAllDrawResultsFromSupabase();
    const results = supabaseResults.filter(
      (r) => r.lottery_code.toLowerCase() === code.toLowerCase()
    );
    results.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());
    return NextResponse.json({ success: true, results, count: results.length });
  }

  if (type === "dates" && code) {
    const dates = await getDrawDatesFromSupabase(code);
    return NextResponse.json({ success: true, dates });
  }

  if (type === "all") {
    const results = await fetchAllDrawResultsFromSupabase();
    results.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());
    return NextResponse.json({ success: true, results });
  }

  if (code) {
    const result = await getDrawResultFromSupabase(code, date || undefined);
    return NextResponse.json({ success: true, result });
  }

  const results = await fetchAllDrawResultsFromSupabase();
  return NextResponse.json({ success: true, results });
}
