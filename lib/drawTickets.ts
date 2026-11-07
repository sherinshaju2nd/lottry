/** Prize tiers and ticket parsing for admin result entry (client + server safe). */

export type PrizeTierKey = "1st" | "consolation" | "2nd" | "3rd" | "4th" | "5th" | "6th" | "7th" | "8th" | "9th";

export interface PrizeTierConfig {
  key: PrizeTierKey;
  label: string;
  defaultAmount: string;
}

/** Display order. Default amounts match the current weekly API payload. */
export const PRIZE_TIERS: readonly PrizeTierConfig[] = [
  { key: "1st", label: "1st Prize", defaultAmount: "1,00,00,000/-" },
  { key: "consolation", label: "Consolation Prize", defaultAmount: "5,000/-" },
  { key: "2nd", label: "2nd Prize", defaultAmount: "25,00,000/-" },
  { key: "3rd", label: "3rd Prize", defaultAmount: "5,00,000/-" },
  { key: "4th", label: "4th Prize", defaultAmount: "5,000/-" },
  { key: "5th", label: "5th Prize", defaultAmount: "2,000/-" },
  { key: "6th", label: "6th Prize", defaultAmount: "1,000/-" },
  { key: "7th", label: "7th Prize", defaultAmount: "500/-" },
  { key: "8th", label: "8th Prize", defaultAmount: "200/-" },
  { key: "9th", label: "9th Prize", defaultAmount: "100/-" },
] as const;

/** "rn802143" / "RN 802143" → "RN 802143" (stored format); "0710" stays "0710". */
export const normalizeTicket = (raw: string): string => {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = compact.match(/^([A-Z]{1,3})(\d+)$/);
  return match ? `${match[1]} ${match[2]}` : compact;
};

/**
 * Parses pasted text (commas, spaces, new lines) into tickets, keeping
 * "RN 802143" together instead of splitting it on the space.
 */
export const parseTicketList = (raw: string): string[] =>
  (raw.toUpperCase().match(/[A-Z]{1,3}\s*\d{4,6}|\d{3,6}/g) ?? []).map(normalizeTicket);

export const formatTicketList = (tickets?: string[]): string => (tickets ?? []).join(", ");

/** "KR-775" → "KR-776" (suggests the next draw code). */
export const nextDrawCode = (code: string): string => {
  const match = code.match(/^(.*?)(\d+)$/);
  return match ? `${match[1]}${Number(match[2]) + 1}` : code;
};

/** What kind of ticket an entry is: full ticket ("RN 802143"), 4-digit ending, or something invalid. */
export type TicketKind = "full" | "ending" | "invalid";

export const classifyTicket = (ticket: string): TicketKind =>
  /^[A-Z]{1,3} \d{6}$/.test(ticket) ? "full" : /^\d{4}$/.test(ticket) ? "ending" : "invalid";

/** Format the official result sheet uses for each tier of a WEEKLY draw. Used for hints only. */
export const EXPECTED_KIND: Record<PrizeTierKey, Exclude<TicketKind, "invalid">> = {
  "1st": "full",
  consolation: "full",
  "2nd": "full",
  "3rd": "full",
  "4th": "ending",
  "5th": "ending",
  "6th": "ending",
  "7th": "ending",
  "8th": "ending",
  "9th": "ending",
};

/**
 * Map of ticket → tiers it appears in, for tickets listed in more than one tier
 * (a Kerala ticket/ending can only win once per draw).
 */
export const findCrossTierDuplicates = (tiers: Partial<Record<PrizeTierKey, string[]>>): Map<string, PrizeTierKey[]> => {
  const owners = new Map<string, PrizeTierKey[]>();
  for (const [key, tickets] of Object.entries(tiers) as [PrizeTierKey, string[]][]) {
    for (const ticket of new Set(tickets ?? [])) {
      owners.set(ticket, [...(owners.get(ticket) ?? []), key]);
    }
  }
  return new Map([...owners].filter(([, keys]) => keys.length > 1));
};

type JsonLike = string | number | boolean | null | undefined | JsonLike[] | { [key: string]: JsonLike };

const isPlainObject = (value: unknown): value is Record<string, JsonLike> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEmptyValue = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim().length === 0) ||
  (Array.isArray(value) && value.length === 0);

/**
 * Merge an API payload over stored data (used by the API sync) so admin-entered results are not lost:
 *  - Lists (prize tickets): the API list replaces the stored list only when it has the SAME OR MORE
 *    items. Admin has 4 tickets → API with 0–3 is ignored, API with 4+ replaces it.
 *  - Text values: an empty API value ("" / null) never replaces a stored value; non-empty API text wins.
 *  - Objects (first_prize, prizes, amounts): merged key by key with the same rules.
 */
export const mergeKeepingStored = <T,>(stored: unknown, incoming: T): T => {
  if (isPlainObject(incoming) && isPlainObject(stored)) {
    const keys = new Set([...Object.keys(stored), ...Object.keys(incoming)]);
    return Object.fromEntries(
      [...keys].map((key) => [key, mergeKeepingStored(stored[key], (incoming as Record<string, JsonLike>)[key])]),
    ) as T;
  }
  if (Array.isArray(incoming) && Array.isArray(stored)) {
    return (incoming.length >= stored.length ? incoming : stored) as T;
  }
  return isEmptyValue(incoming) && !isEmptyValue(stored) ? (stored as T) : incoming;
};

/**
 * Bumpers print full tickets for more tiers than weekly draws (checked against stored results):
 * big bumpers (Thiruvonam, Pooja, Christmas) up to the 5th prize, smaller ones up to the 4th.
 */
const BUMPER_LAST_FULL_TIER: Record<string, number> = { TH: 5, PB: 5, XN: 5, VB: 4, MB: 4, SB: 4 };
const TIER_RANK: Record<PrizeTierKey, number> = {
  "1st": 1, consolation: 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5, "6th": 6, "7th": 7, "8th": 8, "9th": 9,
};

/** Expected ticket format for a tier of a given lottery (weekly or bumper code). Used for hints only. */
export const getExpectedKind = (key: PrizeTierKey, lotteryCode = ""): Exclude<TicketKind, "invalid"> => {
  const lastFull = BUMPER_LAST_FULL_TIER[lotteryCode.toUpperCase()];
  if (lastFull === undefined) return EXPECTED_KIND[key];
  return TIER_RANK[key] <= lastFull ? "full" : "ending";
};

/**
 * Next bumper draw code. Bumper codes run in ONE series across all bumpers
 * (Pooja BR-106 → Christmas BR-107 → … → Thiruvonam BR-111), so use the highest seen.
 */
export const nextBumperDrawCode = (drawCodes: string[]): string | null => {
  const numbers = drawCodes
    .map((code) => code.match(/^BR-?(\d+)$/i)?.[1])
    .filter((n): n is string => Boolean(n))
    .map(Number);
  return numbers.length > 0 ? `BR-${Math.max(...numbers) + 1}` : null;
};
