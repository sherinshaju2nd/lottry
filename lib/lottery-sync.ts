import { saveDrawResultToSupabase, StructuredDrawResult } from "./supabase";

export async function fetchAndSyncLatestLottery(): Promise<{
  success: boolean;
  data?: StructuredDrawResult;
  error?: string;
}> {
  try {
    const res = await fetch("https://indialotteryapi.com/wp-json/klr/v1/latest", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        error: `API HTTP status error: ${res.status} ${res.statusText}`,
      };
    }

    const json = await res.json();

    if (!json || !json.draw_date || !json.draw_code) {
      return {
        success: false,
        error: "Invalid API response structure received",
      };
    }

    const payload = {
      draw_date: json.draw_date,
      draw_name: json.draw_name || "Kerala Lottery",
      draw_code: json.draw_code,
      first: json.first || {},
      prizes: json.prizes || {},
    };

    // Save exclusively to Supabase DB
    await saveDrawResultToSupabase(payload);

    let lottery_code = json.draw_code.split("-")[0].toUpperCase();

    return {
      success: true,
      data: {
        ...payload,
        lottery_code,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch from indialotteryapi";
    return {
      success: false,
      error: msg,
    };
  }
}
