import type { GuideTranslations } from "../types";
import type { FakeTicketCopy } from "./types";
import { fakeTicketMl } from "./ml";
import { fakeTicketHi } from "./hi";
import { fakeTicketTa } from "./ta";
import { fakeTicketTe } from "./te";

/** "How to Find Fake Kerala Lottery Tickets" in every non-English language (English lives in data/blogs.ts + ./en). */
export const FAKE_TICKET_TRANSLATIONS: GuideTranslations<FakeTicketCopy> = {
  ml: fakeTicketMl,
  hi: fakeTicketHi,
  ta: fakeTicketTa,
  te: fakeTicketTe,
};
