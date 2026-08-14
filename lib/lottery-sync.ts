import { saveDrawResultToSupabase, StructuredDrawResult, WEEKLY_LOTTERIES } from "./supabase";

export async function fetchAndSyncLatestLottery(): Promise<{
  success: boolean;
  data?: StructuredDrawResult;
  error?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const apiUrl = process.env.LOTTERY_API_URL || "https://indialotteryapi.com/wp-json/klr/v1/latest";
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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

    let lottery_code = json.draw_code.split("-")[0].toUpperCase();
    let draw_name = json.draw_name || "Kerala Lottery";

    // Try to match by code first, then fallback to name
    let matched = WEEKLY_LOTTERIES.find((l) => l.code === lottery_code);
    if (!matched) {
      matched = WEEKLY_LOTTERIES.find(
        (l) => l.name.toLowerCase() === draw_name.toLowerCase()
      );
    }

    if (!matched) {
      return {
        success: false,
        error: `Lottery code ${lottery_code} or name "${draw_name}" is not a weekly lottery in our list`,
      };
    }

    lottery_code = matched.code;
    draw_name = matched.name;

    const payload = {
      draw_date: json.draw_date,
      draw_name,
      draw_code: json.draw_code,
      first: json.first || {},
      prizes: json.prizes || {},
    };

    // Save exclusively to Supabase DB
    await saveDrawResultToSupabase(payload);

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
