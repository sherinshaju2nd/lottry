import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dqsoseefmiwyjkgqmphh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_bF2JcJ0IPvCaVgeybXJKGw_JBtrS7sx";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface FirstPrize {
  ticket?: string;
  location?: string;
  agent?: string;
  agency_no?: string;
}

export interface PrizeData {
  consolation?: string[];
  "2nd"?: string[];
  "3rd"?: string[];
  "4th"?: string[];
  "5th"?: string[];
  "6th"?: string[];
  "7th"?: string[];
  "8th"?: string[];
  "9th"?: string[];
  amounts?: Record<string, string>;
  guess?: string[];
  mc?: string[];
}

export interface StructuredDrawResult {
  id?: number;
  draw_date: string;
  draw_name: string;
  draw_code: string;
  lottery_code: string;
  first: FirstPrize;
  prizes: PrizeData;
  created_at?: string;
}

export const WEEKLY_LOTTERIES = [
  { day: "Monday", name: "Bhagyathara", nameMl: "ഭാഗ്യതാരാ", code: "BT", is_bumper: false },
  { day: "Tuesday", name: "Sthree Sakthi", nameMl: "സ്ത്രീശക്തി", code: "SS", is_bumper: false },
  { day: "Wednesday", name: "Dhanalekshmi", nameMl: "ധനലക്ഷ്മി", code: "DL", is_bumper: false },
  { day: "Thursday", name: "Karunya Plus", nameMl: "കാരുണ്യ പ്ലസ്", code: "KN", is_bumper: false },
  { day: "Friday", name: "Suvarna Keralam", nameMl: "സുവർണ്ണ കേരളം", code: "SK", is_bumper: false },
  { day: "Saturday", name: "Karunya", nameMl: "കാരുണ്യ", code: "KR", is_bumper: false },
  { day: "Sunday", name: "Samrudhi", nameMl: "സമൃദ്ധി", code: "SM", is_bumper: false },
];

export const BUMPER_LOTTERIES = [
  {
    day: "Bumper (January)",
    name: "Christmas New Year Bumper",
    nameMl: "ക്രിസ്മസ് ന്യൂ ഇയർ ബംപർ",
    code: "XN",
    is_bumper: true,
    jackpot: "₹20 Crore",
    draw_season: "January",
  },
  {
    day: "Bumper (March)",
    name: "Summer Bumper",
    nameMl: "സമ്മർ ബംപർ",
    code: "SB",
    is_bumper: true,
    jackpot: "₹10 Crore",
    draw_season: "March (Summer)",
  },
  {
    day: "Bumper (May)",
    name: "Vishu Bumper",
    nameMl: "വിഷു ബംപർ",
    code: "VB",
    is_bumper: true,
    jackpot: "₹12 Crore",
    draw_season: "May (Vishu)",
  },
  {
    day: "Bumper (July)",
    name: "Monsoon Bumper",
    nameMl: "മൺസൂൺ ബംപർ",
    code: "MB",
    is_bumper: true,
    jackpot: "₹10 Crore",
    draw_season: "July (Monsoon)",
  },
  {
    day: "Bumper (September)",
    name: "Thiruvonam Bumper",
    nameMl: "തിരുവോണം ബംപർ",
    code: "TH",
    is_bumper: true,
    jackpot: "₹25 Crore",
    draw_season: "September (Onam)",
  },
  {
    day: "Bumper (November)",
    name: "Pooja Bumper",
    nameMl: "പൂജ ബംപർ",
    code: "PB",
    is_bumper: true,
    jackpot: "₹12 Crore",
    draw_season: "November (Pooja/Diwali)",
  },
];

export const LOTTERY_SLUGS: Record<string, string> = {
  // Weekly lotteries
  BT: "bhagyathara",
  SS: "sthreesakthi",
  DL: "dhanalekshmi",
  KN: "karunyaplus",
  SK: "suvarnakeralam",
  KR: "karunya",
  SM: "samrudhi",
  // Bumper lotteries
  XN: "christmas-new-year-bumper",
  SB: "summer-bumper",
  VB: "vishu-bumper",
  MB: "monsoon-bumper",
  TH: "thiruvonam-bumper",
  PB: "pooja-bumper",
};

export const SLUG_TO_LOTTERY_CODE: Record<string, string> = {
  // Weekly lotteries (canonical slugs and aliases)
  bhagyathara: "BT",
  bt: "BT",
  sthreesakthi: "SS",
  "sthree-sakthi": "SS",
  ss: "SS",
  dhanalekshmi: "DL",
  dl: "DL",
  karunyaplus: "KN",
  "karunya-plus": "KN",
  kn: "KN",
  suvarnakeralam: "SK",
  "suvarna-keralam": "SK",
  sk: "SK",
  karunya: "KR",
  kr: "KR",
  samrudhi: "SM",
  sm: "SM",
  // Bumper lotteries (canonical slugs and aliases)
  "christmas-new-year-bumper": "XN",
  "christmas-new-year": "XN",
  "xmas-new-year-bumper": "XN",
  xn: "XN",
  "summer-bumper": "SB",
  summer: "SB",
  sb: "SB",
  "vishu-bumper": "VB",
  vishu: "VB",
  vb: "VB",
  "monsoon-bumper": "MB",
  monsoon: "MB",
  mb: "MB",
  "thiruvonam-bumper": "TH",
  thiruvonam: "TH",
  "onam-bumper": "TH",
  th: "TH",
  "pooja-bumper": "PB",
  pooja: "PB",
  pb: "PB",
};

/**
 * Get canonical URL slug for any lottery code or name
 */
export function getLotterySlug(codeOrName: string): string {
  if (!codeOrName) return "bhagyathara";
  const upper = codeOrName.toUpperCase();
  if (LOTTERY_SLUGS[upper]) return LOTTERY_SLUGS[upper];

  const lower = codeOrName.toLowerCase().trim();
  if (SLUG_TO_LOTTERY_CODE[lower]) {
    const code = SLUG_TO_LOTTERY_CODE[lower];
    return LOTTERY_SLUGS[code] || lower;
  }

  return lower.replace(/\s+/g, "").replace(/[^a-z0-9-]/g, "");
}

/**
 * Resolve lottery code from URL slug
 */
export function getLotteryCodeFromSlug(slug: string): string {
  if (!slug) return "BT";
  const lower = slug.toLowerCase().trim();
  if (SLUG_TO_LOTTERY_CODE[lower]) {
    return SLUG_TO_LOTTERY_CODE[lower];
  }
  const upper = slug.toUpperCase().trim();
  if (LOTTERY_SLUGS[upper]) {
    return upper;
  }
  return upper;
}

/**
 * Build canonical clean URL for a lottery (e.g. /bhagyathara or /bhagyathara/2026-08-15)
 */
export function getLotteryUrl(codeOrSlug: string, date?: string): string {
  const slug = getLotterySlug(codeOrSlug);
  if (date) {
    return `/${slug}/${encodeURIComponent(date)}`;
  }
  return `/${slug}`;
}

export const ALL_LOTTERIES = [...WEEKLY_LOTTERIES, ...BUMPER_LOTTERIES];

let cachedDrawResults: StructuredDrawResult[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const bustDrawResultsCache = () => {
  cachedDrawResults = null;
  lastCacheTime = 0;
};

export async function saveDrawResultToSupabase(data: {
  draw_date: string;
  draw_name: string;
  draw_code: string;
  first: FirstPrize;
  prizes: PrizeData;
}) {
  bustDrawResultsCache();
  let lottery_code = data.draw_code.split("-")[0].toUpperCase();
  let draw_name = data.draw_name;

  // Try to match by code first, then fallback to name against ALL lotteries
  let matched = ALL_LOTTERIES.find((l) => l.code === lottery_code);
  if (!matched) {
    matched = ALL_LOTTERIES.find(
      (l) => l.name.toLowerCase() === data.draw_name.toLowerCase()
    );
  }

  if (!matched) {
    // Special alias matching for bumper draws (e.g. BR code prefixes)
    if (data.draw_name.toLowerCase().includes("thiruvonam") || data.draw_name.toLowerCase().includes("onam")) {
      matched = BUMPER_LOTTERIES[0];
    } else if (data.draw_name.toLowerCase().includes("christmas") || data.draw_name.toLowerCase().includes("new year")) {
      matched = BUMPER_LOTTERIES[1];
    } else if (data.draw_name.toLowerCase().includes("vishu")) {
      matched = BUMPER_LOTTERIES[2];
    } else if (data.draw_name.toLowerCase().includes("pooja")) {
      matched = BUMPER_LOTTERIES[3];
    } else if (data.draw_name.toLowerCase().includes("monsoon")) {
      matched = BUMPER_LOTTERIES[4];
    } else if (data.draw_name.toLowerCase().includes("summer")) {
      matched = BUMPER_LOTTERIES[5];
    }
  }

  if (!matched) {
    console.log(`Skipping save: ${lottery_code} (${data.draw_name}) is not recognized in lotteries list.`);
    return;
  }

  lottery_code = matched.code;
  draw_name = matched.name;

  const rowPayload = {
    draw_date: data.draw_date,
    draw_name,
    draw_code: data.draw_code,
    lottery_code,
    first_prize: data.first || {},
    prizes: data.prizes || {},
    created_at: new Date().toISOString(),
  };

  try {
    // 1. Check if record already exists for (draw_date, lottery_code) to OVERWRITE / UPDATE
    const { data: existing } = await supabase
      .from("draw_results")
      .select("id")
      .eq("draw_date", data.draw_date)
      .eq("lottery_code", lottery_code);

    if (existing && existing.length > 0) {
      const { data: updated, error: updateErr } = await supabase
        .from("draw_results")
        .update(rowPayload)
        .eq("id", existing[0].id)
        .select();

      if (!updateErr && updated && updated.length > 0) {
        return updated[0];
      }
    }

    // 2. Upsert if constraint exists
    const { data: upsertData, error: upsertError } = await supabase
      .from("draw_results")
      .upsert(rowPayload, { onConflict: "draw_date,lottery_code" })
      .select();

    if (!upsertError && upsertData && upsertData.length > 0) {
      return upsertData[0];
    }

    // 3. Fallback Insert
    const { data: inserted } = await supabase
      .from("draw_results")
      .insert(rowPayload)
      .select();

    return inserted ? inserted[0] : null;
  } catch (e) {
    console.warn("Supabase save error:", e);
    return null;
  }
}

export async function getDrawResultFromSupabase(
  lotteryCode: string,
  date?: string,
): Promise<StructuredDrawResult | null> {
  try {
    let query = supabase
      .from("draw_results")
      .select("*")
      .eq("lottery_code", lotteryCode.toUpperCase());
    if (date) {
      query = query.eq("draw_date", date);
    } else {
      query = query.order("draw_date", { ascending: false }).limit(1);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const row = data[0];
      let firstObj: FirstPrize = {};
      let prizesObj: PrizeData = {};

      try {
        firstObj = typeof row.first_prize === "string" ? JSON.parse(row.first_prize) : (row.first_prize || {});
      } catch {
        firstObj = {};
      }

      try {
        prizesObj = typeof row.prizes === "string" ? JSON.parse(row.prizes) : (row.prizes || {});
      } catch {
        prizesObj = {};
      }

      return {
        id: row.id,
        draw_date: row.draw_date,
        draw_name: row.draw_name,
        draw_code: row.draw_code,
        lottery_code: row.lottery_code,
        first: firstObj,
        prizes: prizesObj,
        created_at: row.created_at,
      };
    }
  } catch (e) {
    console.warn("Supabase getDrawResult note:", e);
  }

  return null;
}

export async function getDrawDatesFromSupabase(
  lotteryCode: string,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("draw_results")
      .select("draw_date")
      .eq("lottery_code", lotteryCode.toUpperCase())
      .order("draw_date", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => d.draw_date);
    }
  } catch (e) {
    console.warn("Supabase getDrawDates note:", e);
  }

  return [];
}

export async function fetchAllDrawResultsFromSupabase(forceRefresh = true): Promise<
  StructuredDrawResult[]
> {
  // Bypassing in-memory cache to guarantee live results
  const now = Date.now();

  try {
    const { data, error } = await supabase
      .from("draw_results")
      .select("*")
      .order("draw_date", { ascending: false });
    if (!error && data && data.length > 0) {
      const results = data.map((row) => {
        let firstObj: FirstPrize = {};
        let prizesObj: PrizeData = {};
        try {
          firstObj = typeof row.first_prize === "string" ? JSON.parse(row.first_prize) : (row.first_prize || {});
        } catch {
          firstObj = {};
        }
        try {
          prizesObj = typeof row.prizes === "string" ? JSON.parse(row.prizes) : (row.prizes || {});
        } catch {
          prizesObj = {};
        }
        return {
          id: row.id,
          draw_date: row.draw_date,
          draw_name: row.draw_name,
          draw_code: row.draw_code,
          lottery_code: row.lottery_code,
          first: firstObj,
          prizes: prizesObj,
          created_at: row.created_at,
        };
      });

      cachedDrawResults = results;
      lastCacheTime = now;
      return results;
    }
  } catch (e) {
    console.warn("Supabase fetchAll note:", e);
  }

  return [];
}

/**
 * Lightweight sitemap-only fetch: only retrieves lottery_code, draw_date, created_at.
 * Uses range-based pagination to bypass Supabase's default 1000-row cap,
 * ensuring ALL draw result pages are included in the sitemap.
 */
export async function fetchDrawResultsForSitemap(): Promise<
  { lottery_code: string; draw_date: string; created_at?: string }[]
> {
  const PAGE_SIZE = 1000;
  const allRows: { lottery_code: string; draw_date: string; created_at?: string }[] = [];
  let from = 0;

  try {
    while (true) {
      const { data, error } = await supabase
        .from("draw_results")
        .select("lottery_code, draw_date, created_at")
        .order("draw_date", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Sitemap fetch error:", error.message);
        break;
      }

      if (!data || data.length === 0) break;

      allRows.push(...data);

      // If fewer rows than PAGE_SIZE were returned, we've reached the end
      if (data.length < PAGE_SIZE) break;

      from += PAGE_SIZE;
    }
  } catch (e) {
    console.error("Sitemap pagination error:", e);
  }

  // Deduplicate by lottery_code + draw_date (in case of duplicates in DB)
  const seen = new Set<string>();
  return allRows.filter((row) => {
    const key = `${row.lottery_code}::${row.draw_date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export interface PrizeMatchResult {
  isMatch: boolean;
  seriesNote?: string;
  exactSeriesMatch: boolean;
}

export function validateTicketMatch(
  queryInput: string,
  prizeNumberStr: string
): PrizeMatchResult {
  const rawQuery = queryInput.trim().toUpperCase();
  const rawPrize = prizeNumberStr.trim().toUpperCase();

  const queryDigits = rawQuery.replace(/\D/g, "");
  const querySeries = rawQuery.replace(/[^A-Z]/gi, "").trim();

  const prizeDigits = rawPrize.replace(/\D/g, "");
  const prizeSeries = rawPrize.replace(/[^A-Z]/gi, "").trim();

  if (!queryDigits || !prizeDigits || queryDigits.length < 4) {
    return { isMatch: false, exactSeriesMatch: false };
  }

  // 1. Check Digits Match
  let digitsMatch = false;

  if (queryDigits === prizeDigits) {
    digitsMatch = true;
  } else if (queryDigits.length === 6 && prizeDigits.length < 6 && prizeDigits.length >= 2) {
    // User typed 6-digit ticket (e.g. 120417), prize is last 4/3/2 digits (e.g. 0417)
    digitsMatch = queryDigits.endsWith(prizeDigits);
  } else if (queryDigits.length < 6 && prizeDigits.length === 6 && queryDigits.length >= 4) {
    // User typed last 4 or 5 digits (e.g. 3322 or 63322), prize is 6-digit (e.g. 263322)
    digitsMatch = prizeDigits.endsWith(queryDigits);
  } else if (queryDigits.length < 6 && prizeDigits.length < 6 && queryDigits.length >= 4 && prizeDigits.length >= 4) {
    // Both are partial (e.g. 4-digit vs 4-digit)
    digitsMatch = queryDigits.endsWith(prizeDigits) || prizeDigits.endsWith(queryDigits);
  }

  if (!digitsMatch) {
    return { isMatch: false, exactSeriesMatch: false };
  }

  // 2. Check Series (first 2 letters)
  if (prizeSeries) {
    if (querySeries) {
      if (querySeries === prizeSeries) {
        return { isMatch: true, exactSeriesMatch: true };
      } else {
        // User specified a series, but it doesn't match the prize series
        return { isMatch: false, exactSeriesMatch: false };
      }
    } else {
      // User entered no series (e.g. 263322). Digits match, but series requirement exists
      return {
        isMatch: true,
        exactSeriesMatch: false,
        seriesNote: `Requires series '${prizeSeries}'`,
      };
    }
  }

  // Prize has no series restriction (e.g. 4-digit prize 0417)
  return { isMatch: true, exactSeriesMatch: true };
}

export async function searchTicketsInSupabase(queryTicket: string) {
  const allResults = await fetchAllDrawResultsFromSupabase();
  const matches: Array<{
    draw_date: string;
    draw_name: string;
    draw_code: string;
    lottery_code: string;
    prize_tier: string;
    prize_amount?: string;
    ticket_matched: string;
    series_note?: string;
  }> = [];

  for (const draw of allResults) {
    if (draw.first?.ticket) {
      const matchRes = validateTicketMatch(queryTicket, draw.first.ticket);
      if (matchRes.isMatch) {
        matches.push({
          draw_date: draw.draw_date,
          draw_name: draw.draw_name,
          draw_code: draw.draw_code,
          lottery_code: draw.lottery_code,
          prize_tier: "1st Prize Winner",
          prize_amount: draw.prizes.amounts?.["1st"] || "1,00,00,000/-",
          ticket_matched: draw.first.ticket,
          series_note: matchRes.seriesNote,
        });
      }
    }

    const tiers = [
      "consolation",
      "2nd",
      "3rd",
      "4th",
      "5th",
      "6th",
      "7th",
      "8th",
      "9th",
    ] as const;

    for (const tier of tiers) {
      const nums = draw.prizes?.[tier] || [];
      const amount = draw.prizes.amounts?.[tier];

      for (const num of nums) {
        const matchRes = validateTicketMatch(queryTicket, num);
        if (matchRes.isMatch) {
          matches.push({
            draw_date: draw.draw_date,
            draw_name: draw.draw_name,
            draw_code: draw.draw_code,
            lottery_code: draw.lottery_code,
            prize_tier: tier === "consolation" ? "Consolation Prize" : `${tier} Prize`,
            prize_amount: amount,
            ticket_matched: num,
            series_note: matchRes.seriesNote,
          });
        }
      }
    }
  }

  return matches;
}

export interface PostponedDraw {
  id?: number;
  draw_date: string;
  lottery_code: string;
  status: string; // 'postponed' | 'cancelled' | 'no_draw' | 'holiday'
  reason: string;
  rescheduled_date?: string | null;
  disable_cron: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LotteryRecord {
  id?: number;
  day: string;
  name: string;
  name_ml?: string;
  code: string;
  draw_time?: string;
  is_bumper?: boolean;
  jackpot?: string;
  ticket_price?: string;
  draw_date?: string;
  draw_season?: string;
  created_at?: string;
}

export interface CronLog {
  id?: number;
  execution_time?: string;
  trigger_source: string;
  status: "success" | "skipped" | "failed";
  message: string;
  details?: any;
  duration_ms?: number;
  created_at?: string;
}

export interface CronConfig {
  cron_enabled: boolean;
  // Weekly Multi-Phase Settings
  cron_start_time: string; // Phase 1 Start (e.g. 15:00)
  cron_phase1_end_time?: string; // Phase 1 End / Phase 2 Start (e.g. 16:00)
  cron_end_time: string; // Phase 2 End (e.g. 17:00)
  cron_frequency_mins: string; // Phase 1 Interval Mins (e.g. 1)
  cron_phase2_frequency_mins?: string; // Phase 2 Interval Mins (e.g. 5)

  // Bumper Multi-Phase Settings
  cron_bumper_start_time: string; // Bumper Phase 1 Start (e.g. 14:00)
  cron_bumper_phase1_end_time?: string; // Bumper Phase 1 End / Phase 2 Start (e.g. 16:00)
  cron_bumper_end_time: string; // Bumper Phase 2 End (e.g. 18:00)
  cron_bumper_frequency_mins?: string; // Bumper Phase 1 Interval Mins (e.g. 1)
  cron_bumper_phase2_frequency_mins?: string; // Bumper Phase 2 Interval Mins (e.g. 5)

  app_url?: string;
  cron_secret?: string;
}

/**
 * Check if a given date has a Bumper Lottery scheduled in Supabase
 */
export async function checkIsBumperDrawDate(date: string): Promise<LotteryRecord | null> {
  try {
    const lotteries = await getLotteriesFromSupabase();
    const bumper = lotteries.find(
      (l) => l.is_bumper && l.draw_date === date
    );
    return bumper || null;
  } catch (e) {
    console.warn("checkIsBumperDrawDate error:", e);
    return null;
  }
}

/**
 * Fetch list of postponed/no-draw dates from Supabase
 */
export async function getPostponedDraws(date?: string): Promise<PostponedDraw[]> {
  try {
    let query = supabase
      .from("postponed_draws")
      .select("*")
      .order("draw_date", { ascending: false });

    if (date) {
      query = query.eq("draw_date", date);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as PostponedDraw[];
    }
  } catch (e) {
    console.warn("Supabase getPostponedDraws note:", e);
  }
  return [];
}

/**
 * Check if a specific date or lottery is marked as postponed/no-draw
 */
export async function checkIsDatePostponed(
  date: string,
  lotteryCode?: string
): Promise<PostponedDraw | null> {
  try {
    const list = await getPostponedDraws(date);
    if (!list || list.length === 0) return null;

    if (lotteryCode) {
      const codeUpper = lotteryCode.toUpperCase();
      const specific = list.find(
        (p) => p.lottery_code.toUpperCase() === codeUpper || p.lottery_code.toUpperCase() === "ALL"
      );
      return specific || null;
    }

    return list[0] || null;
  } catch (e) {
    console.warn("checkIsDatePostponed error:", e);
    return null;
  }
}

/**
 * Save or update a postponed draw entry
 */
export async function savePostponedDraw(
  item: Omit<PostponedDraw, "id" | "created_at" | "updated_at"> & { id?: number }
): Promise<{ success: boolean; data?: PostponedDraw; error?: string }> {
  try {
    const payload = {
      draw_date: item.draw_date,
      lottery_code: (item.lottery_code || "ALL").toUpperCase(),
      status: item.status || "postponed",
      reason: item.reason,
      rescheduled_date: item.rescheduled_date || null,
      disable_cron: item.disable_cron ?? true,
      updated_at: new Date().toISOString(),
    };

    if (item.id) {
      const { data, error } = await supabase
        .from("postponed_draws")
        .update(payload)
        .eq("id", item.id)
        .select();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data?.[0] };
    } else {
      const { data, error } = await supabase
        .from("postponed_draws")
        .upsert(payload, { onConflict: "draw_date,lottery_code" })
        .select();

      if (error) {
        // Fallback insert
        const { data: insData, error: insErr } = await supabase
          .from("postponed_draws")
          .insert(payload)
          .select();
        if (insErr) return { success: false, error: insErr.message };
        return { success: true, data: insData?.[0] };
      }
      return { success: true, data: data?.[0] };
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save postponed draw",
    };
  }
}

/**
 * Delete a postponed draw entry
 */
export async function deletePostponedDraw(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("postponed_draws").delete().eq("id", id);
    return !error;
  } catch (e) {
    console.warn("deletePostponedDraw error:", e);
    return false;
  }
}

/**
 * Fetch all lotteries (weekly + bumper) from Supabase
 */
export async function getLotteriesFromSupabase(): Promise<LotteryRecord[]> {
  try {
    const { data, error } = await supabase
      .from("lotteries")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as LotteryRecord[];
    }
  } catch (e) {
    console.warn("getLotteriesFromSupabase error:", e);
  }
  // Fallback to static lists
  return ALL_LOTTERIES.map((l, idx) => ({
    id: idx + 1,
    day: l.day,
    name: l.name,
    name_ml: l.nameMl,
    code: l.code,
    draw_time: "3:00 PM",
    is_bumper: l.is_bumper,
    jackpot: "jackpot" in l ? (l as any).jackpot : undefined,
    draw_season: "draw_season" in l ? (l as any).draw_season : undefined,
  }));
}

/**
 * Save or update lottery definition (weekly or bumper)
 */
export async function saveLotteryToSupabase(
  lottery: Partial<LotteryRecord>
): Promise<{ success: boolean; data?: LotteryRecord; error?: string }> {
  try {
    const payload = {
      day: lottery.day || (lottery.is_bumper ? `Bumper (${lottery.draw_season || "Special"})` : "Daily"),
      name: lottery.name,
      name_ml: lottery.name_ml || lottery.name,
      code: (lottery.code || "").toUpperCase(),
      draw_time: lottery.draw_time || (lottery.is_bumper ? "2:00 PM" : "3:00 PM"),
      is_bumper: !!lottery.is_bumper,
      jackpot: lottery.jackpot || null,
      ticket_price: lottery.ticket_price || null,
      draw_date: lottery.draw_date || null,
      draw_season: lottery.draw_season || null,
    };

    if (lottery.id) {
      const { data, error } = await supabase
        .from("lotteries")
        .update(payload)
        .eq("id", lottery.id)
        .select();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data?.[0] };
    } else {
      const { data, error } = await supabase
        .from("lotteries")
        .upsert(payload, { onConflict: "code" })
        .select();

      if (error) {
        const { data: insData, error: insErr } = await supabase
          .from("lotteries")
          .insert(payload)
          .select();
        if (insErr) return { success: false, error: insErr.message };
        return { success: true, data: insData?.[0] };
      }
      return { success: true, data: data?.[0] };
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save lottery",
    };
  }
}

/**
 * Delete lottery definition from Supabase
 */
export async function deleteLotteryFromSupabase(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("lotteries").delete().eq("id", id);
    return !error;
  } catch (e) {
    console.warn("deleteLotteryFromSupabase error:", e);
    return false;
  }
}

/**
 * Delete draw result from Supabase
 */
export async function deleteDrawResultFromSupabase(id: number): Promise<boolean> {
  try {
    bustDrawResultsCache();
    const { error } = await supabase.from("draw_results").delete().eq("id", id);
    return !error;
  } catch (e) {
    console.warn("deleteDrawResultFromSupabase error:", e);
    return false;
  }
}

/**
 * Save manual draw result (Weekly or Bumper) with complete prize structure
 */
export async function saveManualDrawResultToSupabase(
  data: StructuredDrawResult
): Promise<{ success: boolean; data?: StructuredDrawResult; error?: string }> {
  try {
    bustDrawResultsCache();
    const rowPayload = {
      draw_date: data.draw_date,
      draw_name: data.draw_name,
      draw_code: data.draw_code,
      lottery_code: data.lottery_code.toUpperCase(),
      first_prize: data.first || {},
      prizes: data.prizes || {},
      created_at: new Date().toISOString(),
    };

    if (data.id) {
      const { data: updated, error } = await supabase
        .from("draw_results")
        .update(rowPayload)
        .eq("id", data.id)
        .select();

      if (error) return { success: false, error: error.message };
      return { success: true, data: updated?.[0] };
    }

    const { data: upserted, error } = await supabase
      .from("draw_results")
      .upsert(rowPayload, { onConflict: "draw_date,lottery_code" })
      .select();

    if (error) {
      const { data: inserted, error: insErr } = await supabase
        .from("draw_results")
        .insert(rowPayload)
        .select();
      if (insErr) return { success: false, error: insErr.message };
      return { success: true, data: inserted?.[0] };
    }

    return { success: true, data: upserted?.[0] };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save draw result",
    };
  }
}

/**
 * Fetch dynamic Cron & App configurations from `app_config`
 */
export async function getCronConfigFromSupabase(): Promise<CronConfig> {
  const defaultConfig: CronConfig = {
    cron_enabled: true,
    cron_start_time: "15:00",
    cron_phase1_end_time: "16:00",
    cron_end_time: "17:00",
    cron_frequency_mins: "1",
    cron_phase2_frequency_mins: "5",
    cron_bumper_start_time: "14:00",
    cron_bumper_phase1_end_time: "16:00",
    cron_bumper_end_time: "18:00",
    cron_bumper_frequency_mins: "1",
    cron_bumper_phase2_frequency_mins: "5",
    app_url: "https://www.keralalotteryresultstoday.in",
    cron_secret: "kerala_lottery_cron_secret_2026",
  };

  try {
    const { data, error } = await supabase.from("app_config").select("*");
    if (!error && data) {
      const configMap: Record<string, string> = {};
      data.forEach((row: { key: string; value: string }) => {
        configMap[row.key] = row.value;
      });

      return {
        cron_enabled: configMap["cron_enabled"] !== "false",
        cron_start_time: configMap["cron_start_time"] || defaultConfig.cron_start_time,
        cron_phase1_end_time: configMap["cron_phase1_end_time"] || defaultConfig.cron_phase1_end_time,
        cron_end_time: configMap["cron_end_time"] || defaultConfig.cron_end_time,
        cron_frequency_mins: configMap["cron_frequency_mins"] || defaultConfig.cron_frequency_mins,
        cron_phase2_frequency_mins: configMap["cron_phase2_frequency_mins"] || defaultConfig.cron_phase2_frequency_mins,
        cron_bumper_start_time: configMap["cron_bumper_start_time"] || defaultConfig.cron_bumper_start_time,
        cron_bumper_phase1_end_time: configMap["cron_bumper_phase1_end_time"] || defaultConfig.cron_bumper_phase1_end_time,
        cron_bumper_end_time: configMap["cron_bumper_end_time"] || defaultConfig.cron_bumper_end_time,
        cron_bumper_frequency_mins: configMap["cron_bumper_frequency_mins"] || defaultConfig.cron_bumper_frequency_mins,
        cron_bumper_phase2_frequency_mins: configMap["cron_bumper_phase2_frequency_mins"] || defaultConfig.cron_bumper_phase2_frequency_mins,
        app_url: configMap["app_url"] || defaultConfig.app_url,
        cron_secret: configMap["cron_secret"] || defaultConfig.cron_secret,
      };
    }
  } catch (e) {
    console.warn("getCronConfigFromSupabase note:", e);
  }

  return defaultConfig;
}

/**
 * Update Cron & App configurations in `app_config`
 */
export async function updateCronConfigInSupabase(
  configs: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const upsertRows = Object.entries(configs).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("app_config")
      .upsert(upsertRows, { onConflict: "key" });

    if (error) {
      console.error("updateCronConfigInSupabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.warn("updateCronConfigInSupabase error:", e);
    return { success: false, error: e?.message || "Unknown update error" };
  }
}

/**
 * Log cron execution to `cron_logs` table (Disabled to stop writing logs)
 */
export async function logCronExecutionInSupabase(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log: Omit<CronLog, "id" | "created_at">
): Promise<void> {
  // Logging disabled
  return;
}

/**
 * Get recent cron execution logs
 */
export async function getCronLogsFromSupabase(limit = 30): Promise<CronLog[]> {
  try {
    const { data, error } = await supabase
      .from("cron_logs")
      .select("*")
      .order("execution_time", { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data as CronLog[];
    }
  } catch (e) {
    console.warn("getCronLogsFromSupabase note:", e);
  }
  return [];
}

