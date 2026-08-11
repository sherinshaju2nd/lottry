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

  let responseData: any = {};

  if (type === "history" && code) {
    const supabaseResults = await fetchAllDrawResultsFromSupabase();
    const results = supabaseResults.filter(
      (r) => r.lottery_code.toLowerCase() === code.toLowerCase()
    );
    results.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());
    responseData = { success: true, results, count: results.length };
  } else if (type === "dates" && code) {
    const dates = await getDrawDatesFromSupabase(code);
    responseData = { success: true, dates };
  } else if (type === "all") {
    const results = await fetchAllDrawResultsFromSupabase();
    results.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());
    responseData = { success: true, results };
  } else if (code) {
    const result = await getDrawResultFromSupabase(code, date || undefined);
    responseData = { success: true, result };
  } else {
    const results = await fetchAllDrawResultsFromSupabase();
    responseData = { success: true, results };
  }

  const response = NextResponse.json(responseData);
  // Cache response at CDN edge for 2 minutes, allowing stale-while-revalidate for 5 minutes
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=300"
  );
  return response;
}
