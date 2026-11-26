import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { BlogRecentDraw } from "@/data/blogs";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { BankSurrenderCopy } from "@/data/blogTranslations/bankSurrender/types";
import { bankSurrenderCopyEn } from "@/data/blogTranslations/bankSurrender/en";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import RichText from "./RichText";
import { Callout, CheckList, Lead, P, Section, StepList } from "./GuideBlocks";

export interface BankSurrenderGuideContentProps {
  recentDraws: BlogRecentDraw[];
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/bankSurrender. */
  copy?: BankSurrenderCopy;
  /** Reader's language: resolves guide links and localises the recent-draws table. */
  language?: BlogLanguage;
}

const BankSurrenderGuideContent = ({ recentDraws, copy = bankSurrenderCopyEn, language = "en" }: BankSurrenderGuideContentProps) => {
  const { lead, intro, verifyTicket, eligibleBank, documents, formV, reverseSide, submitAtBank, verification, receiveMoney, deadline, safety, conclusion } =
    copy;

  return (
    <>
      <Lead>{lead}</Lead>
      <P>{intro}</P>

      <Section id="verify-ticket" title={verifyTicket.title}>
        <P>{verifyTicket.p1}</P>
        <CheckList items={verifyTicket.checks} />
        <P>
          <RichText text={verifyTicket.p2} language={language} />
        </P>
      </Section>

      <Section id="eligible-bank" title={eligibleBank.title}>
        <P>{eligibleBank.p1}</P>
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {eligibleBank.banks.map((bank) => (
            <Grid key={bank} size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 1.75, height: "100%", textAlign: "center", borderRadius: "12px", bgcolor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                <Typography sx={{ fontWeight: 800, color: "#312E81", fontSize: "0.9rem" }}>{bank}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Callout tone="info">{eligibleBank.callout}</Callout>
      </Section>

      <Section id="documents" title={documents.title}>
        <P>
          <RichText text={documents.p1} language={language} />
        </P>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {documents.items.map(({ label, text }, index) => (
            <Grid key={label} size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontWeight: 800, color: "#0B3C5D", fontSize: "0.95rem", mb: 0.5 }}>
                  {index + 1}. {label}
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <P>{documents.p2}</P>
      </Section>

      <Section id="form-v" title={formV.title}>
        <P>{formV.p1}</P>
        <CheckList items={formV.fields} />
        <Callout tone="warning">{formV.warning}</Callout>
      </Section>

      <Section id="reverse-side" title={reverseSide.title}>
        {reverseSide.paragraphs.map((text) => (
          <P key={text}>{text}</P>
        ))}
      </Section>

      <Section id="submit-at-bank" title={submitAtBank.title}>
        <P>{submitAtBank.p1}</P>
        <StepList steps={submitAtBank.steps} />
        <Callout tone="info">{submitAtBank.callout}</Callout>
      </Section>

      <Section id="verification" title={verification.title}>
        <P>{verification.p1}</P>
        <CheckList items={verification.checks} />
        <P>{verification.p2}</P>
      </Section>

      <Section id="receive-money" title={receiveMoney.title}>
        <P>{receiveMoney.p1}</P>
        <P>
          <RichText text={receiveMoney.p2} language={language} />
        </P>
      </Section>

      <Section id="deadline" title={deadline.title}>
        <P>{deadline.p1}</P>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {deadline.facts.map(({ value, label }) => (
            <Grid key={value} size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, height: "100%", borderRadius: "12px", bgcolor: "#FEF2F2", border: "1px solid #FECACA", textAlign: "center" }}>
                <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#B91C1C" }}>{value}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#7F1D1D", lineHeight: 1.5 }}>{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <P>{deadline.p2}</P>
        <RecentDrawsAnalysis
          draws={recentDraws}
          variant="deadline"
          title={deadline.recentDrawsTitle}
          intro={deadline.recentDrawsIntro}
          language={language}
        />
      </Section>

      <Section id="safety" title={safety.title}>
        <CheckList items={safety.tips} />
        <P>
          <RichText text={safety.p1} language={language} />
        </P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        {conclusion.paragraphs.map((text) => (
          <P key={text}>{text}</P>
        ))}
      </Section>
    </>
  );
};

export default BankSurrenderGuideContent;
