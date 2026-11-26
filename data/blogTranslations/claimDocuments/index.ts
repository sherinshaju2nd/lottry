import type { GuideTranslations } from "../types";
import type { ClaimDocumentsCopy } from "./types";
import { claimDocumentsMl } from "./ml";
import { claimDocumentsHi } from "./hi";
import { claimDocumentsTa } from "./ta";
import { claimDocumentsTe } from "./te";

/** "What Documents Are Required to Claim a Kerala Lottery Prize?" in every non-English language (English lives in data/blogs.ts + ./en). */
export const CLAIM_DOCUMENTS_TRANSLATIONS: GuideTranslations<ClaimDocumentsCopy> = {
  ml: claimDocumentsMl,
  hi: claimDocumentsHi,
  ta: claimDocumentsTa,
  te: claimDocumentsTe,
};
