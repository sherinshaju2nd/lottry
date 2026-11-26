import type { BlogLanguage, GuideTranslation } from "./types";
import { AGENT_COMMISSION_TRANSLATIONS } from "./agentCommission";
import { BANK_SURRENDER_TRANSLATIONS } from "./bankSurrender";
import { CLAIM_DOCUMENTS_TRANSLATIONS } from "./claimDocuments";
import { CLAIM_PRIZE_TRANSLATIONS } from "./claimPrize";
import { FAKE_TICKET_TRANSLATIONS } from "./fakeTicket";
import { LOST_TICKET_TRANSLATIONS } from "./lostTicket";
import { LOTTERY_TAX_TRANSLATIONS } from "./lotteryTax";
import { MINIMUM_AGE_TRANSLATIONS } from "./minimumAge";
import { ONLINE_SALES_ILLEGAL_TRANSLATIONS } from "./onlineSalesIllegal";
import { POOJA_BUMPER_2026_TRANSLATIONS } from "./poojaBumper2026";
import { SOCIAL_IMPACT_TRANSLATIONS } from "./socialImpact";

/** Every translated guide, keyed by English source slug. Server-only: imported by data/blogPages.ts. */
export const GUIDE_TRANSLATIONS: Record<
  string,
  Partial<Record<Exclude<BlogLanguage, "en">, GuideTranslation<unknown>>> | undefined
> = {
  "kerala-lottery-agent-commission-on-winning-tickets": AGENT_COMMISSION_TRANSLATIONS,
  "surrender-kerala-lottery-winning-ticket-through-bank": BANK_SURRENDER_TRANSLATIONS,
  "documents-required-to-claim-kerala-lottery-prize": CLAIM_DOCUMENTS_TRANSLATIONS,
  "how-to-claim-kerala-lottery-prize": CLAIM_PRIZE_TRANSLATIONS,
  "how-to-find-fake-kerala-lottery-tickets": FAKE_TICKET_TRANSLATIONS,
  "what-happens-if-you-lose-kerala-lottery-ticket": LOST_TICKET_TRANSLATIONS,
  "kerala-lottery-tax-deduction-on-winnings": LOTTERY_TAX_TRANSLATIONS,
  "minimum-age-to-buy-kerala-lottery-ticket": MINIMUM_AGE_TRANSLATIONS,
  "why-online-kerala-lottery-ticket-sales-are-illegal": ONLINE_SALES_ILLEGAL_TRANSLATIONS,
  "kerala-lottery-social-impact-karunya-benevolent-fund": SOCIAL_IMPACT_TRANSLATIONS,
  "pooja-bumper-lottery-2026": POOJA_BUMPER_2026_TRANSLATIONS,
};
