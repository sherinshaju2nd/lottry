import type { GuideTranslations } from "../types";
import type { LostTicketCopy } from "./types";
import { lostTicketMl } from "./ml";
import { lostTicketHi } from "./hi";
import { lostTicketTa } from "./ta";
import { lostTicketTe } from "./te";

/** "What Happens If You Lose Your Kerala Lottery Ticket?" in every non-English language (English lives in data/blogs.ts + ./en). */
export const LOST_TICKET_TRANSLATIONS: GuideTranslations<LostTicketCopy> = {
  ml: lostTicketMl,
  hi: lostTicketHi,
  ta: lostTicketTa,
  te: lostTicketTe,
};
