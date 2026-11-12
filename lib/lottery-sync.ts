import { saveDrawResultToSupabase, StructuredDrawResult, ALL_LOTTERIES } from "./supabase";
import { broadcastFirstPrizeResult, BroadcastExecutionReport } from "./broadcaster";
import { describeAttempts, fetchFromSources, getApiSources, summarizeAttempts, type SourceAttemptSummary } from "./apiSources";

export interface SyncLotteryResult {
  success: boolean;
  data?: StructuredDrawResult;
  error?: string;
  broadcast?: BroadcastExecutionReport | null;
  /** Name of the API source whose data was used. */
  source?: string;
  /** Result of every source tried this run (for logs / admin). */
  attempts?: SourceAttemptSummary[];
}

export const fetchAndSyncLatestLottery = async (): Promise<SyncLotteryResult> => {
  try {
    // All enabled sources (admin "API Sources" tab) are called in parallel; failover picks the
    // highest-priority one with prize numbers, else the highest-priority valid response.
    const sources = await getApiSources();
    const { chosen, attempts } = await fetchFromSources(sources);
    const attemptSummary = summarizeAttempts(attempts);

    if (!chosen?.json) {
      return {
        success: false,
        error: `All ${attempts.length} API source(s) failed — ${describeAttempts(attempts)}`,
        attempts: attemptSummary,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream JSON, validated fields below
    const json = chosen.json as any;
    const sourceName = chosen.source.name;

    const rawDrawCode = String(json.draw_code).trim().toUpperCase();
    const codeMatch = rawDrawCode.match(/^([A-Z]{2,3})/);
    let lottery_code = codeMatch ? codeMatch[1] : rawDrawCode.split("-")[0];
    let draw_name = json.draw_name ?? "Kerala Lottery";

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
      first: json.first ?? {},
      prizes: json.prizes ?? {},
    };

    // Save exclusively to Supabase DB. Never broadcast or report success for an unsaved result.
    const saved = await saveDrawResultToSupabase(payload);
    if (!saved) {
      return {
        success: false,
        error: `Failed to save ${lottery_code} ${json.draw_date} to the database (check SUPABASE_SERVICE_ROLE_KEY).`,
      };
    }

    // Auto-broadcast 1st Prize to Telegram Channels/Groups and WhatsApp (runs with smart deduplication)
    let broadcastResult: BroadcastExecutionReport | null = null;
    try {
      broadcastResult = await broadcastFirstPrizeResult(payload);
    } catch (bErr: unknown) {
      const msg = bErr instanceof Error ? bErr.message : String(bErr);
      console.warn("[Broadcast Error during sync]:", msg);
    }

    // Report what is actually stored (admin values may have been kept over empty/shorter API data).
    const storedRow = saved as { first_prize?: StructuredDrawResult["first"]; prizes?: StructuredDrawResult["prizes"] };
    return {
      success: true,
      data: { ...payload, first: storedRow.first_prize ?? payload.first, prizes: storedRow.prizes ?? payload.prizes },
      broadcast: broadcastResult,
      source: sourceName,
      attempts: attemptSummary,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch from indialotteryapi";
    return {
      success: false,
      error: msg,
    };
  }
};
