/**
 * Lottery result API sources (server-only).
 *
 * Admins manage an ordered list of source URLs in the "API Sources" admin tab. The list lives in
 * `app_config` under `lottery_api_sources` (not publicly readable). Every source must return the
 * indialotteryapi.com `/klr/v1/latest` JSON shape:
 *   { draw_date, draw_name, draw_code, first: {ticket, location, agent, agency_no},
 *     prizes: { consolation: [], "2nd": [] … "9th": [], amounts: {} } }
 */
import { supabaseServer, updateCronConfigInSupabase } from "./supabase";

export interface ApiSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export const API_SOURCES_CONFIG_KEY = "lottery_api_sources";
export const SOURCE_TIMEOUT_MS = 12_000;
const MAX_SOURCES = 10;

const DEFAULT_URL = process.env.LOTTERY_API_URL ?? "https://indialotteryapi.com/wp-json/klr/v1/latest";

export const DEFAULT_API_SOURCES: ApiSource[] = [
  { id: "indialotteryapi", name: "India Lottery API (current)", url: DEFAULT_URL, enabled: true },
];

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/** Validates admin input. Returns the cleaned list, or an error message. */
export const validateApiSources = (raw: unknown): ApiSource[] | string => {
  if (!Array.isArray(raw)) return "Sources must be a list.";
  if (raw.length === 0) return "Add at least one source.";
  if (raw.length > MAX_SOURCES) return `At most ${MAX_SOURCES} sources.`;

  const seen = new Set<string>();
  const cleaned: ApiSource[] = [];
  for (const [index, item] of raw.entries()) {
    const { id, name, url, enabled } = (item ?? {}) as Record<string, unknown>;
    const cleanUrl = String(url ?? "").trim();
    let parsed: URL;
    try {
      parsed = new URL(cleanUrl);
    } catch (err: unknown) {
      return `Source ${index + 1}: "${cleanUrl}" is not a valid URL (${errorMessage(err)}).`;
    }
    if (!["https:", "http:"].includes(parsed.protocol)) return `Source ${index + 1}: URL must start with https://`;
    if (seen.has(parsed.href)) return `Source ${index + 1}: duplicate URL.`;
    seen.add(parsed.href);

    cleaned.push({
      id: String(id ?? "").trim().slice(0, 40) || `src-${Date.now().toString(36)}-${index}`,
      name: String(name ?? "").trim().slice(0, 60) || parsed.hostname,
      url: parsed.href,
      enabled: enabled !== false,
    });
  }
  if (!cleaned.some((s) => s.enabled)) return "At least one source must be enabled.";
  return cleaned;
};

/** Sources in priority order. Falls back to the built-in default when nothing valid is saved. */
export const getApiSources = async (): Promise<ApiSource[]> => {
  try {
    const { data, error } = await supabaseServer.from("app_config").select("value").eq("key", API_SOURCES_CONFIG_KEY).limit(1);
    if (error) throw new Error(error.message);
    const raw = data?.[0]?.value;
    if (!raw) return DEFAULT_API_SOURCES;
    const parsed = validateApiSources(JSON.parse(raw));
    if (typeof parsed === "string") {
      console.warn(`[apiSources] saved sources invalid (${parsed}); using default.`);
      return DEFAULT_API_SOURCES;
    }
    return parsed;
  } catch (err: unknown) {
    console.warn("[apiSources] could not load sources, using default:", errorMessage(err));
    return DEFAULT_API_SOURCES;
  }
};

export const saveApiSources = async (sources: ApiSource[]): Promise<{ success: boolean; error?: string }> =>
  updateCronConfigInSupabase({ [API_SOURCES_CONFIG_KEY]: JSON.stringify(sources) });

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

export interface SourceAttempt {
  source: ApiSource;
  ok: boolean;
  ms: number;
  status?: number;
  error?: string;
  json?: Record<string, unknown>;
  /** Number of prize tickets in the response (0 = draw not published yet). */
  tickets: number;
  drawCode?: string;
  drawDate?: string;
}

const TICKET_KEYS = ["consolation", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

export const countResponseTickets = (json: Record<string, unknown>): number => {
  const first = (json.first ?? {}) as Record<string, unknown>;
  const prizes = (json.prizes ?? {}) as Record<string, unknown>;
  const firstCount = String(first.ticket ?? "").trim() ? 1 : 0;
  return TICKET_KEYS.reduce((sum, key) => sum + (Array.isArray(prizes[key]) ? (prizes[key] as unknown[]).length : 0), firstCount);
};

/** Fetch one source with its own timeout. Never throws. */
export const fetchSource = async (source: ApiSource, timeoutMs = SOURCE_TIMEOUT_MS): Promise<SourceAttempt> => {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(source.url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Accept: "application/json" },
      signal: controller.signal,
    });
    const ms = Date.now() - started;
    if (!res.ok) {
      const hint = res.status === 522 || res.status === 521 || res.status === 504 ? " (source server down)" : "";
      return { source, ok: false, ms, status: res.status, tickets: 0, error: `HTTP ${res.status}${hint}` };
    }
    const json = (await res.json()) as Record<string, unknown> | null;
    if (!json?.draw_date || !json?.draw_code) {
      return { source, ok: false, ms, status: res.status, tickets: 0, error: "Response is not in the expected format (missing draw_date / draw_code)" };
    }
    return {
      source,
      ok: true,
      ms,
      status: res.status,
      json,
      tickets: countResponseTickets(json),
      drawCode: String(json.draw_code),
      drawDate: String(json.draw_date),
    };
  } catch (err: unknown) {
    const ms = Date.now() - started;
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      source,
      ok: false,
      ms,
      tickets: 0,
      error: aborted ? `No response within ${Math.round(timeoutMs / 1000)}s (source slow or down)` : errorMessage(err),
    };
  } finally {
    clearTimeout(timer);
  }
};

export interface SourcesFetchResult {
  /** Chosen response, or undefined when every source failed. */
  chosen?: SourceAttempt;
  attempts: SourceAttempt[];
}

/**
 * Calls all enabled sources in parallel (a dead source can't slow the cron down) and picks:
 *  1. the highest-priority source whose response has prize numbers, else
 *  2. the highest-priority valid response (draw announced, numbers not out yet).
 */
export const fetchFromSources = async (sources: ApiSource[]): Promise<SourcesFetchResult> => {
  const enabled = sources.filter((s) => s.enabled);
  const attempts = await Promise.all(enabled.map((source) => fetchSource(source)));
  const valid = attempts.filter((a) => a.ok);
  return { chosen: valid.find((a) => a.tickets > 0) ?? valid[0], attempts };
};

export const describeAttempts = (attempts: SourceAttempt[]): string =>
  attempts
    .map((a) => `${a.source.name}: ${a.ok ? `OK ${a.drawCode} (${a.tickets} tickets, ${a.ms}ms)` : a.error}`)
    .join(" | ");

/** Per-source outcome without the raw JSON, safe to log or return to the admin. */
export interface SourceAttemptSummary {
  name: string;
  ok: boolean;
  ms: number;
  status?: number;
  error?: string;
  tickets: number;
  drawCode?: string;
  drawDate?: string;
}

export const summarizeAttempts = (attempts: SourceAttempt[]): SourceAttemptSummary[] =>
  attempts.map(({ source, ok, ms, status, error, tickets, drawCode, drawDate }) => ({
    name: source.name, ok, ms, status, error, tickets, drawCode, drawDate,
  }));
