import type { GuideTranslations } from "../types";
import type { BankSurrenderCopy } from "./types";
import { bankSurrenderMl } from "./ml";
import { bankSurrenderHi } from "./hi";
import { bankSurrenderTa } from "./ta";
import { bankSurrenderTe } from "./te";

/** "How to Surrender a Kerala Lottery Winning Ticket Through Bank" in every non-English language (English lives in data/blogs.ts + ./en). */
export const BANK_SURRENDER_TRANSLATIONS: GuideTranslations<BankSurrenderCopy> = {
  ml: bankSurrenderMl,
  hi: bankSurrenderHi,
  ta: bankSurrenderTa,
  te: bankSurrenderTe,
};
