import type { ReactNode } from "react";
import type { BlogRenderContext } from "@/data/blogs";
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
import DrawScheduleGuideContent from "./DrawScheduleGuideContent";
import DigitalPlatformsGuideContent from "./DigitalPlatformsGuideContent";
import ResponsibleSharingGuideContent from "./ResponsibleSharingGuideContent";
import BumperDrawsGuideContent from "./BumperDrawsGuideContent";

/** Maps a blog slug (from data/blogs.ts) to its article body. */
const BLOG_CONTENT: Record<string, (ctx: BlogRenderContext) => ReactNode> = {
  "how-kerala-lottery-draw-dates-are-decided": () => <DrawScheduleGuideContent />,
  "how-digital-platforms-help-access-lottery-information": () => <DigitalPlatformsGuideContent />,
  "responsible-online-lottery-information-sharing": () => <ResponsibleSharingGuideContent />,
  "why-kerala-lottery-bumper-draws-attract-attention": () => <BumperDrawsGuideContent />,
  "kerala-lottery-agent-commission-on-winning-tickets": () => <AgentCommissionGuideContent />,
  "kerala-lottery-social-impact-karunya-benevolent-fund": () => <SocialImpactGuideContent />,
  "minimum-age-to-buy-kerala-lottery-ticket": () => <MinimumAgeGuideContent />,
  "kerala-lottery-tax-deduction-on-winnings": () => <LotteryTaxGuideContent />,
  "how-to-claim-kerala-lottery-prize": () => <ClaimPrizeGuideContent />,
  "pooja-bumper-lottery-2026": ({ draw }) => <PoojaBumper2026GuideContent draw={draw} />,
  "what-happens-if-you-lose-kerala-lottery-ticket": () => <LostTicketGuideContent />,
  "how-to-find-fake-kerala-lottery-tickets": ({ recentDraws }) => <FakeTicketGuideContent recentDraws={recentDraws} />,
  "documents-required-to-claim-kerala-lottery-prize": ({ recentDraws }) => (
    <ClaimDocumentsGuideContent recentDraws={recentDraws} />
  ),
  "surrender-kerala-lottery-winning-ticket-through-bank": ({ recentDraws }) => (
    <BankSurrenderGuideContent recentDraws={recentDraws} />
  ),
  "why-online-kerala-lottery-ticket-sales-are-illegal": ({ recentDraws }) => (
    <OnlineSalesIllegalGuideContent recentDraws={recentDraws} />
  ),
};

export const renderBlogContent = (
  slug: string,
  ctx: BlogRenderContext = { draw: null, recentDraws: [] },
): ReactNode => {
  const render = BLOG_CONTENT[slug];
  if (!render) {
    console.error(`[blog] No article body registered for slug "${slug}"`);
    return null;
  }
  return render(ctx);
};
