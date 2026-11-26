import type { GuideTranslations } from "../types";
import type { SocialImpactCopy } from "./types";
import { socialImpactMl } from "./ml";
import { socialImpactHi } from "./hi";
import { socialImpactTa } from "./ta";
import { socialImpactTe } from "./te";

/** "The Social Impact of Kerala Lotteries" in every non-English language (English lives in data/blogs.ts + ./en). */
export const SOCIAL_IMPACT_TRANSLATIONS: GuideTranslations<SocialImpactCopy> = {
  ml: socialImpactMl,
  hi: socialImpactHi,
  ta: socialImpactTa,
  te: socialImpactTe,
};
