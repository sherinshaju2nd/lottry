import type { PrizeData, StructuredDrawResult } from "@/lib/supabase";

/**
 * Derives a unique, factual written summary for a single draw result page.
 * Everything here is computed from the draw's own data (and the previous draw of the
 * same lottery), so every result page carries original analysis rather than only a
 * copied number grid — the main fix for AdSense "low value content".
 */

const PRIZE_TIERS = ["2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"] as const;
type PrizeTier = (typeof PRIZE_TIERS)[number];

const TIER_LABELS: Record<PrizeTier | "consolation", string> = {
  consolation: "Consolation",
  "2nd": "2nd",
  "3rd": "3rd",
  "4th": "4th",
  "5th": "5th",
  "6th": "6th",
  "7th": "7th",
  "8th": "8th",
  "9th": "9th",
};

export interface TierSummary {
  key: PrizeTier | "consolation";
  label: string;
  amount?: string;
  count: number;
}

export interface DrawInsights {
  firstTicket?: string;
  firstSeries?: string;
  firstDigits?: string;
  firstLocation?: string;
  firstAgent?: string;
  firstAgencyNo?: string;
  firstAmount?: string;
  tiers: TierSummary[];
  totalWinningEntries: number;
  /** Digit (0–9) that most often ends the 4-digit winning numbers in this draw. */
  topEndingDigit?: { digit: string; count: number; outOf: number };
  /** Leading digit split of 4-digit winners: how many start 0–4 vs 5–9. */
  lowHighSplit?: { low: number; high: number };
  previous?: {
    date: string;
    drawCode?: string;
    firstTicket?: string;
    firstLocation?: string;
    /** 4-digit endings that won in both this draw and the previous one. */
    repeatedEndings: string[];
    sameFirstSeries: boolean;
    sameFirstLocation: boolean;
  };
}

/** "₹1,00,00,000/-" / "5.000/-" → "₹1,00,00,000" / "₹5,000" */
export const formatPrizeAmount = (raw?: string): string | undefined => {
  const cleaned = raw?.replace(/\/-\s*$/, "").replace(/(\d)\.(\d{3})$/, "$1,$2").replace(/^₹?\s*/, "").trim();
  return cleaned ? `₹${cleaned}` : undefined;
};

const toTitleCase = (value?: string): string | undefined =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase()) || undefined;

/** "KG 501790" → { series: "KG", digits: "501790" } */
const splitTicket = (ticket?: string): { series?: string; digits?: string } => {
  const match = ticket?.trim().match(/^([A-Z]{1,3})\s*-?\s*(\d{4,7})$/i);
  return match ? { series: match[1].toUpperCase(), digits: match[2] } : { digits: ticket?.trim() };
};

/** All 4-digit endings that won in the lower tiers (4th–9th). */
const collectEndings = (prizes?: PrizeData): string[] =>
  PRIZE_TIERS.flatMap((tier) => prizes?.[tier] ?? [])
    .map((n) => n.trim())
    .filter((n) => /^\d{4}$/.test(n));

export const buildDrawInsights = (
  draw: StructuredDrawResult,
  previousDraw?: StructuredDrawResult | null,
): DrawInsights => {
  const { prizes = {}, first = {} } = draw;
  const amounts = prizes.amounts ?? {};
  const { series: firstSeries, digits: firstDigits } = splitTicket(first.ticket);

  const tiers: TierSummary[] = (["consolation", ...PRIZE_TIERS] as const)
    .map((key) => ({
      key,
      label: TIER_LABELS[key],
      amount: formatPrizeAmount(amounts[key]),
      count: prizes[key]?.length ?? 0,
    }))
    .filter(({ count }) => count > 0);

  const totalWinningEntries = tiers.reduce((sum, { count }) => sum + count, first.ticket ? 1 : 0);

  const endings = collectEndings(prizes);
  const digitCounts = endings.reduce<Record<string, number>>(
    (acc, n) => ({ ...acc, [n.at(-1) ?? ""]: (acc[n.at(-1) ?? ""] ?? 0) + 1 }),
    {},
  );
  const [topDigit] = Object.entries(digitCounts).sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
  const low = endings.filter((n) => Number(n[0]) <= 4).length;

  const previousEndings = new Set(collectEndings(previousDraw?.prizes));
  const previousFirst = splitTicket(previousDraw?.first?.ticket);

  return {
    firstTicket: first.ticket?.trim(),
    firstSeries,
    firstDigits,
    firstLocation: toTitleCase(first.location),
    firstAgent: toTitleCase(first.agent),
    firstAgencyNo: first.agency_no?.trim(),
    firstAmount: formatPrizeAmount(amounts["1st"]),
    tiers,
    totalWinningEntries,
    topEndingDigit: topDigit ? { digit: topDigit[0], count: topDigit[1], outOf: endings.length } : undefined,
    lowHighSplit: endings.length > 0 ? { low, high: endings.length - low } : undefined,
    previous: previousDraw
      ? {
          date: previousDraw.draw_date,
          drawCode: previousDraw.draw_code,
          firstTicket: previousDraw.first?.ticket?.trim(),
          firstLocation: toTitleCase(previousDraw.first?.location),
          repeatedEndings: [...new Set(endings.filter((n) => previousEndings.has(n)))].sort(),
          sameFirstSeries: Boolean(firstSeries && firstSeries === previousFirst.series),
          sameFirstLocation: Boolean(
            first.location &&
              previousDraw.first?.location &&
              first.location.trim().toLowerCase() === previousDraw.first.location.trim().toLowerCase(),
          ),
        }
      : undefined,
  };
};
