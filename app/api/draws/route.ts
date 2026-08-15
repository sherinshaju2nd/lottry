import { NextRequest, NextResponse } from "next/server";
import {
  getDrawResultFromSupabase,
  getDrawDatesFromSupabase,
  fetchAllDrawResultsFromSupabase,
  getPostponedDraws,
  checkIsDatePostponed,
  getLotteriesFromSupabase,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const date = searchParams.get("date");
  const type = searchParams.get("type"); // "dates" | "single" | "all" | "history" | "postponed" | "lotteries"

  let responseData: any = {};

  if (type === "postponed") {
    const list = await getPostponedDraws(date || undefined);
    responseData = { success: true, list };
  } else if (type === "lotteries") {
    const lotteries = await getLotteriesFromSupabase();
    responseData = { success: true, lotteries };
  } else if (type === "history" && code) {
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
    let postponement = null;
    if (date) {
      postponement = await checkIsDatePostponed(date, code);
    }
    responseData = { success: true, result, postponement };
  } else {
    const results = await fetchAllDrawResultsFromSupabase();
    responseData = { success: true, results };
  }

  const response = NextResponse.json(responseData);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  return response;
}
