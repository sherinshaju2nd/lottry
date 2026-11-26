import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { MinimumAgeCopy } from "@/data/blogTranslations/minimumAge/types";
import { minimumAgeCopyEn } from "@/data/blogTranslations/minimumAge/en";
import { Callout, CheckList, Lead, P, Section } from "./GuideBlocks";
import RichText from "./RichText";

export interface MinimumAgeGuideContentProps {
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/minimumAge. */
  copy?: MinimumAgeCopy;
  language?: BlogLanguage;
}

const MinimumAgeGuideContent = ({ copy = minimumAgeCopyEn, language = "en" }: MinimumAgeGuideContentProps) => {
  const {
    lead,
    quickAnswer,
    whyMinimumAge,
    financialRisks,
    responsiblePlay,
    agentsSellers,
    parents,
    resultsVsPlaying,
    notInvestment,
    buyResponsibly,
    conclusion,
  } = copy;

  return (
    <>
      <Lead>{lead}</Lead>

      <Section id="quick-answer" title={quickAnswer.title}>
        <Callout tone="warning">
          <RichText text={quickAnswer.callout} language={language} />
        </Callout>
      </Section>

      <Section id="why-minimum-age" title={whyMinimumAge.title}>
        <P>{whyMinimumAge.p1}</P>
        <CheckList items={whyMinimumAge.purposes} />
      </Section>

      <Section id="financial-risks" title={financialRisks.title}>
        <P>{financialRisks.p1}</P>
      </Section>

      <Section id="responsible-play" title={responsiblePlay.title}>
        <P>{responsiblePlay.p1}</P>
        <CheckList items={responsiblePlay.habits} />
      </Section>

      <Section id="agents-sellers" title={agentsSellers.title}>
        <P>{agentsSellers.p1}</P>
        <P>
          <RichText text={agentsSellers.p2} language={language} />
        </P>
      </Section>

      <Section id="parents" title={parents.title}>
        <P>{parents.p1}</P>
        <CheckList items={parents.focus} />
      </Section>

      <Section id="results-vs-playing" title={resultsVsPlaying.title}>
        <P>
          <RichText text={resultsVsPlaying.p1} language={language} />
        </P>
      </Section>

      <Section id="not-investment" title={notInvestment.title}>
        <P>{notInvestment.p1}</P>
        <CheckList items={notInvestment.notFor} tone="bad" />
        <P>
          <RichText text={notInvestment.p2} language={language} />
        </P>
      </Section>

      <Section id="buy-responsibly" title={buyResponsibly.title}>
        <P>{buyResponsibly.p1}</P>
        <CheckList items={buyResponsibly.checks} />
        <P>
          <RichText text={buyResponsibly.p2} language={language} />
        </P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        <P>{conclusion.p1}</P>
      </Section>
    </>
  );
};

export default MinimumAgeGuideContent;
