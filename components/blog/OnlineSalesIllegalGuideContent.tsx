import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { BlogRecentDraw } from "@/data/blogs";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { OnlineSalesIllegalCopy } from "@/data/blogTranslations/onlineSalesIllegal/types";
import { onlineSalesIllegalCopyEn } from "@/data/blogTranslations/onlineSalesIllegal/en";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import RichText from "./RichText";
import { Callout, CheckList, Lead, P, Section, StepList } from "./GuideBlocks";

/** Whether each "results vs buying" row (copy.resultsVsBuying.rows, same order) is allowed. */
const ROW_ALLOWED = [true, true, true, false, false, false];

export interface OnlineSalesIllegalGuideContentProps {
  recentDraws: BlogRecentDraw[];
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/onlineSalesIllegal. */
  copy?: OnlineSalesIllegalCopy;
  language?: BlogLanguage;
}

const OnlineSalesIllegalGuideContent = ({
  recentDraws,
  copy = onlineSalesIllegalCopyEn,
  language = "en",
}: OnlineSalesIllegalGuideContentProps) => {
  const {
    lead,
    intro,
    whyProhibited,
    departmentStand,
    risks,
    officialDistribution,
    fakeAds,
    resultsVsBuying,
    claimPrize,
    claimDocuments,
    report,
    conclusion,
  } = copy;

  return (
    <>
      <Lead>{lead}</Lead>
      <P>{intro}</P>

      <Section id="why-prohibited" title={whyProhibited.title}>
        <P>{whyProhibited.p1}</P>
        <Callout tone="warning">{whyProhibited.callout}</Callout>
        <P>{whyProhibited.reasonsIntro}</P>
        <CheckList items={whyProhibited.reasons} />
      </Section>

      <Section id="department-stand" title={departmentStand.title}>
        <P>{departmentStand.p1}</P>
        <P>
          <RichText text={departmentStand.p2} language={language} />
        </P>
      </Section>

      <Section id="risks" title={risks.title}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {risks.items.map(({ title, text }) => (
            <Grid key={title} size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
                <Typography sx={{ fontWeight: 800, color: "#991B1B", fontSize: "0.95rem", mb: 0.5 }}>{title}</Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <P>{risks.p1}</P>
      </Section>

      <Section id="official-distribution" title={officialDistribution.title}>
        <P>{officialDistribution.p1}</P>
        <CheckList items={officialDistribution.ticketDetails} />
        <P>
          <RichText text={officialDistribution.p2} language={language} />
        </P>
      </Section>

      <Section id="fake-ads" title={fakeAds.title}>
        <P>{fakeAds.p1}</P>
        <CheckList items={fakeAds.warnings} tone="bad" />
        <P>{fakeAds.p2}</P>
      </Section>

      <Section id="results-vs-buying" title={resultsVsBuying.title}>
        <P>{resultsVsBuying.p1}</P>
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden", mb: 2 }}>
          {resultsVsBuying.rows.map((text, index) => {
            const allowed = ROW_ALLOWED[index] ?? false;
            return (
              <Box
                key={text}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.5, bgcolor: allowed ? "#F0FDF4" : "#FFFFFF", borderTop: index === 0 ? "none" : "1px solid #F1F5F9" }}
              >
                {allowed ? <CheckCircleIcon sx={{ color: "#16A34A" }} /> : <CancelIcon sx={{ color: "#DC2626" }} />}
                <Typography sx={{ fontWeight: 700, fontSize: "0.93rem", color: "#0F172A" }}>{text}</Typography>
              </Box>
            );
          })}
        </Paper>
        <RecentDrawsAnalysis
          draws={recentDraws}
          variant="verify"
          title={resultsVsBuying.drawsTitle}
          intro={resultsVsBuying.drawsIntro}
          language={language}
        />
      </Section>

      <Section id="claim-prize" title={claimPrize.title}>
        <P>{claimPrize.p1}</P>
        <StepList steps={claimPrize.steps} />
        <Callout tone="info">
          <RichText text={claimPrize.callout} language={language} />
        </Callout>
      </Section>

      <Section id="claim-documents" title={claimDocuments.title}>
        <P>{claimDocuments.p1}</P>
        <CheckList items={claimDocuments.items} />
        <P>
          <RichText text={claimDocuments.p2} language={language} />
        </P>
      </Section>

      <Section id="report" title={report.title}>
        <CheckList items={report.items} />
        <P>{report.p1}</P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        <P>{conclusion.p1}</P>
        <P>
          <RichText text={conclusion.p2} language={language} />
        </P>
      </Section>
    </>
  );
};

export default OnlineSalesIllegalGuideContent;
