import type { GuideTranslations } from "../types";
import type { ClaimPrizeCopy } from "./types";
import { claimPrizeMl } from "./ml";
import { claimPrizeHi } from "./hi";
import { claimPrizeTa } from "./ta";
import { claimPrizeTe } from "./te";

/** "How to Claim Kerala Lottery Prize" in every non-English language (English lives in data/blogs.ts + ./en). */
export const CLAIM_PRIZE_TRANSLATIONS: GuideTranslations<ClaimPrizeCopy> = {
  ml: claimPrizeMl,
  hi: claimPrizeHi,
  ta: claimPrizeTa,
  te: claimPrizeTe,
};
