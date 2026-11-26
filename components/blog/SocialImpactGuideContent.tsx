import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { SocialImpactCopy } from "@/data/blogTranslations/socialImpact/types";
import { socialImpactCopyEn } from "@/data/blogTranslations/socialImpact/en";
import { Callout, CheckList, Lead, P, Section } from "./GuideBlocks";
import RichText from "./RichText";

/** Value colours for the three CAG figures (receipts · expenditure · net receipt). */
const CAG_COLORS = ["#0E7490", "#B45309", "#15803D"];

export interface SocialImpactGuideContentProps {
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/socialImpact. */
  copy?: SocialImpactCopy;
  /** Reader's language, used to resolve `guide:` links in the copy. */
  language?: BlogLanguage;
}

const SocialImpactGuideContent = ({ copy = socialImpactCopyEn, language = "en" }: SocialImpactGuideContentProps) => {
  const {
    lead,
    quickAnswer,
    publicWelfare,
    karunyaFund,
    medicalExpenses,
    employment,
    revenue,
    weakerSections,
    responsiblePlay,
    transparency,
    widerImportance,
    conclusion,
  } = copy;
  const rich = (text: string) => <RichText text={text} language={language} />;

  return (
    <>
      <Lead>{rich(lead)}</Lead>

      <Section id="quick-answer" title={quickAnswer.title}>
        <Callout tone="info">{rich(quickAnswer.callout)}</Callout>
      </Section>

      <Section id="public-welfare" title={publicWelfare.title}>
        <P>{rich(publicWelfare.intro)}</P>
        <CheckList items={publicWelfare.items} />
      </Section>

      <Section id="karunya-fund" title={karunyaFund.title}>
        <P>{karunyaFund.intro}</P>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
          {karunyaFund.conditions.map((condition) => (
            <Box key={condition} sx={{ px: 1.75, py: 0.75, borderRadius: "999px", bgcolor: "#FFF1F2", border: "1px solid #FECDD3", color: "#9F1239", fontWeight: 700, fontSize: "0.88rem" }}>
              {condition}
            </Box>
          ))}
        </Box>
        <P>{rich(karunyaFund.p2)}</P>
      </Section>

      <Section id="medical-expenses" title={medicalExpenses.title}>
        <P>{medicalExpenses.p}</P>
      </Section>

      <Section id="employment" title={employment.title}>
        <P>{employment.intro}</P>
        <CheckList items={employment.items} />
        <P>{employment.p2}</P>
      </Section>

      <Section id="revenue" title={revenue.title}>
        <P>{revenue.intro}</P>
        <CheckList items={revenue.items} />
        <P>{revenue.cagIntro}</P>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {revenue.cagFigures.map(({ label, value }, index) => (
            <Grid key={label} size={{ xs: 12, sm: 4 }}>
              <Paper elevation={0} sx={{ p: 2.25, textAlign: "center", borderRadius: "12px", border: "1.5px solid #E2E8F0" }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748B" }}>{label}</Typography>
                <Typography sx={{ fontSize: "1.35rem", fontWeight: 900, color: CAG_COLORS[index] ?? CAG_COLORS[0] }}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <P>{revenue.p2}</P>
      </Section>

      <Section id="weaker-sections" title={weakerSections.title}>
        <P>{weakerSections.p}</P>
      </Section>

      <Section id="responsible-play" title={responsiblePlay.title}>
        <P>{responsiblePlay.intro}</P>
        <CheckList items={responsiblePlay.items} />
        <P>{rich(responsiblePlay.p2)}</P>
      </Section>

      <Section id="transparency" title={transparency.title}>
        <P>{transparency.p}</P>
      </Section>

      <Section id="wider-importance" title={widerImportance.title}>
        <P>{rich(widerImportance.p)}</P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        <P>{rich(conclusion.p)}</P>
      </Section>
    </>
  );
};

export default SocialImpactGuideContent;
