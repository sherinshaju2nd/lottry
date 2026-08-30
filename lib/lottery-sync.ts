import { saveDrawResultToSupabase, StructuredDrawResult, ALL_LOTTERIES } from "./supabase";
import { broadcastFirstPrizeResult } from "./broadcaster";

export async function fetchAndSyncLatestLottery(): Promise<{
  success: boolean;
  data?: StructuredDrawResult;
  error?: string;
  broadcast?: any;
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

    const rawDrawCode = String(json.draw_code).trim().toUpperCase();
    const codeMatch = rawDrawCode.match(/^([A-Z]{2,3})/);
    let lottery_code = codeMatch ? codeMatch[1] : rawDrawCode.split("-")[0];
    let draw_name = json.draw_name || "Kerala Lottery";

    // Try to match by code first, then fallback to name against ALL lotteries (Weekly + Bumper)
    let matched = ALL_LOTTERIES.find((l) => l.code === lottery_code);
    if (!matched) {
      const cleanDrawName = draw_name.toLowerCase().replace(/[^a-z0-9]/g, "");
      matched = ALL_LOTTERIES.find((l) => {
        const cleanName = l.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanName === cleanDrawName || cleanDrawName.includes(cleanName) || cleanName.includes(cleanDrawName);
      });
    }

    if (!matched) {
      return {
        success: false,
        error: `Lottery code ${lottery_code} or name "${draw_name}" is not a recognized Kerala lottery in our list`,
      };
    }

    lottery_code = matched.code;
    draw_name = matched.name;

    const payload: StructuredDrawResult = {
      draw_date: json.draw_date,
      draw_name,
      draw_code: json.draw_code,
      lottery_code,
      first: json.first || {},
      prizes: json.prizes || {},
    };

    // Save exclusively to Supabase DB
    await saveDrawResultToSupabase(payload);

    // Auto-broadcast 1st Prize to Telegram Channels/Groups and WhatsApp (runs with smart deduplication)
    let broadcastResult: any = null;
    try {
      broadcastResult = await broadcastFirstPrizeResult(payload);
    } catch (bErr) {
      console.warn("[Broadcast Error during sync]:", bErr);
    }

    return {
      success: true,
      data: payload,
      broadcast: broadcastResult,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch from indialotteryapi";
    return {
      success: false,
      error: msg,
    };
  }
}
