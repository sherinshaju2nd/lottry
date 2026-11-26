import type { BlogRecentDraw } from "@/data/blogs";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { ClaimDocumentsCopy } from "@/data/blogTranslations/claimDocuments/types";
import { claimDocumentsCopyEn } from "@/data/blogTranslations/claimDocuments/en";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import RichText from "./RichText";
import { Callout, CheckList, Lead, P, Section, StepList } from "./GuideBlocks";

export interface ClaimDocumentsGuideContentProps {
  recentDraws: BlogRecentDraw[];
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/claimDocuments. */
  copy?: ClaimDocumentsCopy;
  language?: BlogLanguage;
}

const ClaimDocumentsGuideContent = ({
  recentDraws,
  copy = claimDocumentsCopyEn,
  language = "en",
}: ClaimDocumentsGuideContentProps) => {
  const {
    lead,
    intro,
    originalTicket,
    identityProof,
    photographs,
    panCard,
    bankDetails,
    claimForm,
    addressProof,
    selfAttested,
    howToSubmit,
    remember,
    conclusion,
  } = copy;

  return (
    <>
      <Lead>{lead}</Lead>
      <P>{intro}</P>

      <Section id="original-ticket" title={originalTicket.title}>
        <P>{originalTicket.p1}</P>
        <CheckList items={originalTicket.checks} />
        <Callout tone="warning">
          <RichText text={originalTicket.callout} language={language} />
        </Callout>
      </Section>

      <Section id="identity-proof" title={identityProof.title}>
        <P>{identityProof.p1}</P>
        <CheckList items={identityProof.documents} />
        <P>{identityProof.p2}</P>
      </Section>

      <Section id="photographs" title={photographs.title}>
        <P>{photographs.p1}</P>
      </Section>

      <Section id="pan-card" title={panCard.title}>
        <P>{panCard.p1}</P>
        <CheckList items={panCard.checks} />
        <P>
          <RichText text={panCard.p2} language={language} />
        </P>
      </Section>

      <Section id="bank-details" title={bankDetails.title}>
        <P>{bankDetails.p1}</P>
        <CheckList items={bankDetails.documents} />
        <Callout tone="danger">{bankDetails.warning}</Callout>
      </Section>

      <Section id="claim-form" title={claimForm.title}>
        <P>{claimForm.p1}</P>
        <CheckList items={claimForm.fields} />
        <P>{claimForm.p2}</P>
      </Section>

      <Section id="address-proof" title={addressProof.title}>
        <P>{addressProof.p1}</P>
      </Section>

      <Section id="self-attested" title={selfAttested.title}>
        <P>{selfAttested.p1}</P>
        <CheckList items={selfAttested.fileOrder} />
        <P>{selfAttested.p2}</P>
      </Section>

      <Section id="how-to-submit" title={howToSubmit.title}>
        <StepList steps={howToSubmit.steps} />
        <P>
          <RichText text={howToSubmit.bankNote} language={language} />
        </P>
        <RecentDrawsAnalysis
          draws={recentDraws}
          variant="deadline"
          title={howToSubmit.recentDrawsTitle}
          intro={howToSubmit.recentDrawsIntro}
          language={language}
        />
      </Section>

      <Section id="remember" title={remember.title}>
        <CheckList items={remember.items} />
        <P>{remember.p1}</P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        <P>{conclusion.p1}</P>
        <P>
          <RichText text={conclusion.p2} language={language} />
        </P>
        <P>
          <strong>{conclusion.closing}</strong>
        </P>
      </Section>
    </>
  );
};

export default ClaimDocumentsGuideContent;
