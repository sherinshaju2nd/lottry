/** Lottery URL slug <-> code mapping. Dependency-free so it can run in proxy.ts. */

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
