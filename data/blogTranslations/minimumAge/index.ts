import type { GuideTranslations } from "../types";
import type { MinimumAgeCopy } from "./types";
import { minimumAgeMl } from "./ml";
import { minimumAgeHi } from "./hi";
import { minimumAgeTa } from "./ta";
import { minimumAgeTe } from "./te";

/** "Why Is There a Minimum Age to Buy a Kerala Lottery Ticket?" in every non-English language (English lives in data/blogs.ts + ./en). */
export const MINIMUM_AGE_TRANSLATIONS: GuideTranslations<MinimumAgeCopy> = {
  ml: minimumAgeMl,
  hi: minimumAgeHi,
  ta: minimumAgeTa,
  te: minimumAgeTe,
};
