import { saveDrawResultToSupabase, StructuredDrawResult, ALL_LOTTERIES } from "./supabase";
import { broadcastFirstPrizeResult, BroadcastExecutionReport } from "./broadcaster";
import {
  describeAttempts,
  fetchFromSources,
  fetchSource,
  getApiSources,
  summarizeAttempts,
  type SourceAttempt,
  type SourceAttemptSummary,
} from "./apiSources";

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

const errorMessage = (err: unknown, fallback = "Sync failed"): string =>
  err instanceof Error ? err.message : String(err ?? fallback);

/** Maps an API response to a known Kerala lottery, saves it, and broadcasts the 1st prize (deduplicated). */
const saveSourceResponse = async (chosen: SourceAttempt, attemptSummary: SourceAttemptSummary[]): Promise<SyncLotteryResult> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream JSON, validated fields below
  const json = chosen.json as any;
  const sourceName = chosen.source.name;

  const rawDrawCode = String(json.draw_code).trim().toUpperCase();
  const codeMatch = rawDrawCode.match(/^([A-Z]{2,3})/);
  const parsedCode = codeMatch ? codeMatch[1] : rawDrawCode.split("-")[0];
  const apiDrawName: string = json.draw_name ?? "Kerala Lottery";

  // Try to match by code first, then fallback to name against ALL lotteries (Weekly + Bumper)
  const cleanDrawName = apiDrawName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const matched =
    ALL_LOTTERIES.find((l) => l.code === parsedCode) ??
    ALL_LOTTERIES.find((l) => {
      const cleanName = l.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanName === cleanDrawName || cleanDrawName.includes(cleanName) || cleanName.includes(cleanDrawName);
    });

  if (!matched) {
    return {
      success: false,
      error: `${sourceName}: lottery code ${parsedCode} or name "${apiDrawName}" is not a recognized Kerala lottery in our list`,
      source: sourceName,
      attempts: attemptSummary,
    };
  }

  const payload: StructuredDrawResult = {
    draw_date: json.draw_date,
    draw_name: matched.name,
    draw_code: json.draw_code,
    lottery_code: matched.code,
    first: json.first ?? {},
    prizes: json.prizes ?? {},
  };

  // Save exclusively to Supabase DB. Never broadcast or report success for an unsaved result.
  const saved = await saveDrawResultToSupabase(payload);
  if (!saved) {
    return {
      success: false,
      error: `Failed to save ${matched.code} ${json.draw_date} to the database (check SUPABASE_SERVICE_ROLE_KEY).`,
      source: sourceName,
      attempts: attemptSummary,
    };
  }

  // Auto-broadcast 1st Prize to Telegram Channels/Groups and WhatsApp (runs with smart deduplication)
  let broadcastResult: BroadcastExecutionReport | null = null;
  try {
    broadcastResult = await broadcastFirstPrizeResult(payload);
  } catch (bErr: unknown) {
    console.warn("[Broadcast Error during sync]:", errorMessage(bErr));
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
};

/** Cron / header button: all enabled sources in parallel, highest-priority usable answer wins. */
export const fetchAndSyncLatestLottery = async (): Promise<SyncLotteryResult> => {
  try {
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
    return await saveSourceResponse(chosen, attemptSummary);
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, "Failed to fetch from the API sources") };
  }
};

export interface SourceSyncOutcome {
  sourceId: string;
  name: string;
  result: SyncLotteryResult;
}

/**
 * Admin "Sync all": every enabled saved source, one at a time, lowest priority first, so the
 * highest-priority source is written last and its numbers win when sources disagree.
 */
export const fetchAndSyncAllSources = async (): Promise<SourceSyncOutcome[]> => {
  const targets = (await getApiSources()).filter(({ enabled }) => enabled).reverse();
  const outcomes: SourceSyncOutcome[] = [];
  for (const { id, name } of targets) {
    outcomes.push({ sourceId: id, name, result: await fetchAndSyncFromSource(id) });
  }
  return outcomes;
};

/**
 * Admin "Sync" on one row of the API Sources tab: calls only that saved source (enabled or not)
 * and writes its latest draw to the database.
 */
export const fetchAndSyncFromSource = async (sourceId: string): Promise<SyncLotteryResult> => {
  try {
    const source = (await getApiSources()).find(({ id }) => id === sourceId);
    if (!source) {
      return { success: false, error: "This source is not saved yet. Click “Save order & sources” first, then sync." };
    }

    const attempt = await fetchSource(source);
    const attemptSummary = summarizeAttempts([attempt]);
    if (!attempt.ok || !attempt.json) {
      return { success: false, error: `${source.name}: ${attempt.error ?? "no data returned"}`, source: source.name, attempts: attemptSummary };
    }
    return await saveSourceResponse(attempt, attemptSummary);
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, "Failed to sync this source") };
  }
};
