import type { GuideTranslations } from "../types";
import type { LotteryTaxCopy } from "./types";
import { lotteryTaxMl } from "./ml";
import { lotteryTaxHi } from "./hi";
import { lotteryTaxTa } from "./ta";
import { lotteryTaxTe } from "./te";

/** "Kerala Lottery Tax" in every non-English language (English lives in data/blogs.ts + ./en). */
export const LOTTERY_TAX_TRANSLATIONS: GuideTranslations<LotteryTaxCopy> = {
  ml: lotteryTaxMl,
  hi: lotteryTaxHi,
  ta: lotteryTaxTa,
  te: lotteryTaxTe,
};
