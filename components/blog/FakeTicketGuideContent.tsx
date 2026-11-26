import type { BlogRecentDraw } from "@/data/blogs";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { FakeTicketCopy } from "@/data/blogTranslations/fakeTicket/types";
import { fakeTicketCopyEn } from "@/data/blogTranslations/fakeTicket/en";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import RichText from "./RichText";
import { Callout, CheckList, Lead, P, Section, StepList } from "./GuideBlocks";

export interface FakeTicketGuideContentProps {
  recentDraws: BlogRecentDraw[];
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/fakeTicket. */
  copy?: FakeTicketCopy;
  language?: BlogLanguage;
}

const FakeTicketGuideContent = ({ recentDraws, copy = fakeTicketCopyEn, language = "en" }: FakeTicketGuideContentProps) => {
  const {
    lead,
    intro,
    printing,
    ticketNumber,
    alterations,
    drawDetails,
    physical,
    sellers,
    compare,
    winningNumber,
    suspect,
    tips,
    conclusion,
  } = copy;
  const rich = (text: string) => <RichText text={text} language={language} />;

  return (
    <>
      <Lead>{rich(lead)}</Lead>
      {intro.map((text) => (
        <P key={text}>{rich(text)}</P>
      ))}

      <Section id="printing-quality" title={printing.title}>
        <P>{rich(printing.p1)}</P>
        <CheckList items={printing.checks} />
        <Callout tone="info">{rich(printing.note)}</Callout>
      </Section>

      <Section id="ticket-number" title={ticketNumber.title}>
        <P>{rich(ticketNumber.p1)}</P>
        <CheckList items={ticketNumber.checks} tone="bad" />
        <P>{rich(ticketNumber.p2)}</P>
      </Section>

      <Section id="alterations" title={alterations.title}>
        <P>{rich(alterations.p1)}</P>
        <CheckList items={alterations.checks} tone="bad" />
        <Callout tone="warning">{rich(alterations.warning)}</Callout>
      </Section>

      <Section id="draw-details" title={drawDetails.title}>
        <P>{rich(drawDetails.p1)}</P>
        <CheckList items={drawDetails.checks} tone="bad" />
        <RecentDrawsAnalysis
          draws={recentDraws}
          variant="verify"
          title={drawDetails.recentTitle}
          intro={drawDetails.recentIntro}
          language={language}
        />
      </Section>

      <Section id="physical-condition" title={physical.title}>
        <P>{rich(physical.p1)}</P>
        <CheckList items={physical.checks} tone="bad" />
        <P>{rich(physical.p2)}</P>
      </Section>

      <Section id="unknown-sellers" title={sellers.title}>
        <P>{rich(sellers.p1)}</P>
        <CheckList items={sellers.checks} tone="bad" />
        <P>{rich(sellers.p2)}</P>
      </Section>

      <Section id="compare-genuine" title={compare.title}>
        <P>{rich(compare.p1)}</P>
        <CheckList items={compare.checks} />
        <P>{rich(compare.p2)}</P>
      </Section>

      <Section id="winning-number" title={winningNumber.title}>
        <P>{rich(winningNumber.p1)}</P>
        <StepList steps={winningNumber.steps} />
      </Section>

      <Section id="suspect-fake" title={suspect.title}>
        <P>{rich(suspect.p1)}</P>
        <CheckList items={suspect.checks} />
        <Callout tone="danger">{rich(suspect.danger)}</Callout>
      </Section>

      <Section id="tips" title={tips.title}>
        <CheckList items={tips.checks} />
        <P>{rich(tips.p1)}</P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        {conclusion.paragraphs.map((text) => (
          <P key={text}>{rich(text)}</P>
        ))}
      </Section>
    </>
  );
};

export default FakeTicketGuideContent;
