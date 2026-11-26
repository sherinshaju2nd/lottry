import type { GuideTranslations } from "../types";
import type { OnlineSalesIllegalCopy } from "./types";
import { onlineSalesIllegalMl } from "./ml";
import { onlineSalesIllegalHi } from "./hi";
import { onlineSalesIllegalTa } from "./ta";
import { onlineSalesIllegalTe } from "./te";

/** "Why Online Kerala Lottery Ticket Sales Are Illegal" in every non-English language (English lives in data/blogs.ts + ./en). */
export const ONLINE_SALES_ILLEGAL_TRANSLATIONS: GuideTranslations<OnlineSalesIllegalCopy> = {
  ml: onlineSalesIllegalMl,
  hi: onlineSalesIllegalHi,
  ta: onlineSalesIllegalTa,
  te: onlineSalesIllegalTe,
};
