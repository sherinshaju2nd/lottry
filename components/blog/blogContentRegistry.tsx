import type { ReactNode } from "react";
import type { BlogRenderContext } from "@/data/blogs";
import { pickCopy, type BlogLanguage } from "@/data/blogTranslations/types";
import { AGENT_COMMISSION_TRANSLATIONS } from "@/data/blogTranslations/agentCommission";
import { BANK_SURRENDER_TRANSLATIONS } from "@/data/blogTranslations/bankSurrender";
import { CLAIM_DOCUMENTS_TRANSLATIONS } from "@/data/blogTranslations/claimDocuments";
import { CLAIM_PRIZE_TRANSLATIONS } from "@/data/blogTranslations/claimPrize";
import { FAKE_TICKET_TRANSLATIONS } from "@/data/blogTranslations/fakeTicket";
import { LOST_TICKET_TRANSLATIONS } from "@/data/blogTranslations/lostTicket";
import { LOTTERY_TAX_TRANSLATIONS } from "@/data/blogTranslations/lotteryTax";
import { MINIMUM_AGE_TRANSLATIONS } from "@/data/blogTranslations/minimumAge";
import { POOJA_BUMPER_2026_TRANSLATIONS } from "@/data/blogTranslations/poojaBumper2026";
import { ONLINE_SALES_ILLEGAL_TRANSLATIONS } from "@/data/blogTranslations/onlineSalesIllegal";
import { SOCIAL_IMPACT_TRANSLATIONS } from "@/data/blogTranslations/socialImpact";
import AgentCommissionGuideContent from "./AgentCommissionGuideContent";
import BankSurrenderGuideContent from "./BankSurrenderGuideContent";
import ClaimDocumentsGuideContent from "./ClaimDocumentsGuideContent";
import ClaimPrizeGuideContent from "./ClaimPrizeGuideContent";
import FakeTicketGuideContent from "./FakeTicketGuideContent";
import LostTicketGuideContent from "./LostTicketGuideContent";
import LotteryTaxGuideContent from "./LotteryTaxGuideContent";
import MinimumAgeGuideContent from "./MinimumAgeGuideContent";
import OnlineSalesIllegalGuideContent from "./OnlineSalesIllegalGuideContent";
import PoojaBumper2026GuideContent from "./PoojaBumper2026GuideContent";
import SocialImpactGuideContent from "./SocialImpactGuideContent";

/**
 * Maps an English source slug (from data/blogs.ts) to its article body in the requested language.
 * Server-only: rendered by app/blog/[slug]/page.tsx so translated copy never reaches client bundles.
 */
const BLOG_CONTENT: Record<string, (ctx: BlogRenderContext, language: BlogLanguage) => ReactNode> = {
  "kerala-lottery-agent-commission-on-winning-tickets": (_ctx, language) => (
    <AgentCommissionGuideContent copy={pickCopy(AGENT_COMMISSION_TRANSLATIONS, language)} language={language} />
  ),
  "kerala-lottery-social-impact-karunya-benevolent-fund": (_ctx, language) => (
    <SocialImpactGuideContent copy={pickCopy(SOCIAL_IMPACT_TRANSLATIONS, language)} language={language} />
  ),
  "minimum-age-to-buy-kerala-lottery-ticket": (_ctx, language) => (
    <MinimumAgeGuideContent copy={pickCopy(MINIMUM_AGE_TRANSLATIONS, language)} language={language} />
  ),
  "kerala-lottery-tax-deduction-on-winnings": (_ctx, language) => (
    <LotteryTaxGuideContent copy={pickCopy(LOTTERY_TAX_TRANSLATIONS, language)} language={language} />
  ),
  "how-to-claim-kerala-lottery-prize": (_ctx, language) => (
    <ClaimPrizeGuideContent copy={pickCopy(CLAIM_PRIZE_TRANSLATIONS, language)} />
  ),
  "pooja-bumper-lottery-2026": ({ draw }, language) => (
    <PoojaBumper2026GuideContent draw={draw} copy={pickCopy(POOJA_BUMPER_2026_TRANSLATIONS, language)} language={language} />
  ),
  "what-happens-if-you-lose-kerala-lottery-ticket": (_ctx, language) => (
    <LostTicketGuideContent copy={pickCopy(LOST_TICKET_TRANSLATIONS, language)} language={language} />
  ),
  "how-to-find-fake-kerala-lottery-tickets": ({ recentDraws }, language) => (
    <FakeTicketGuideContent recentDraws={recentDraws} copy={pickCopy(FAKE_TICKET_TRANSLATIONS, language)} language={language} />
  ),
  "documents-required-to-claim-kerala-lottery-prize": ({ recentDraws }, language) => (
    <ClaimDocumentsGuideContent
      recentDraws={recentDraws}
      copy={pickCopy(CLAIM_DOCUMENTS_TRANSLATIONS, language)}
      language={language}
    />
  ),
  "surrender-kerala-lottery-winning-ticket-through-bank": ({ recentDraws }, language) => (
    <BankSurrenderGuideContent
      recentDraws={recentDraws}
      copy={pickCopy(BANK_SURRENDER_TRANSLATIONS, language)}
      language={language}
    />
  ),
  "why-online-kerala-lottery-ticket-sales-are-illegal": ({ recentDraws }, language) => (
    <OnlineSalesIllegalGuideContent
      recentDraws={recentDraws}
      copy={pickCopy(ONLINE_SALES_ILLEGAL_TRANSLATIONS, language)}
      language={language}
    />
  ),
};

export const renderBlogContent = (
  slug: string,
  ctx: BlogRenderContext = { draw: null, recentDraws: [] },
  language: BlogLanguage = "en",
): ReactNode => {
  const render = BLOG_CONTENT[slug];
  if (!render) {
    console.error(`[blog] No article body registered for slug "${slug}"`);
    return null;
  }
  return render(ctx, language);
};
