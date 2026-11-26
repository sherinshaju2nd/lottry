import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { LostTicketCopy } from "@/data/blogTranslations/lostTicket/types";
import { lostTicketCopyEn } from "@/data/blogTranslations/lostTicket/en";
import { BODY_SX, Callout, Lead, P, Section, StepList } from "./GuideBlocks";
import RichText from "./RichText";

/** Only the first row of the proof comparison (the original ticket) is accepted on its own. */
const PROOF_ACCEPTED = [true, false, false, false, false];

export interface LostTicketGuideContentProps {
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/lostTicket. */
  copy?: LostTicketCopy;
  language?: BlogLanguage;
}

const LostTicketGuideContent = ({ copy = lostTicketCopyEn, language = "en" }: LostTicketGuideContentProps) => {
  const {
    intro: [lead, ...introRest],
    whatHappens,
    canStillClaim,
    whatToDo,
    claimWithoutTicket,
    photocopy,
    claimRules,
    protectTicket,
    conclusion,
  } = copy;

  return (
    <>
      <Lead>{lead}</Lead>
      {introRest.map((text, index) => (
        <Typography key={index} sx={index === introRest.length - 1 ? { ...BODY_SX, mb: 4 } : BODY_SX}>
          {text}
        </Typography>
      ))}

      <Section id="what-happens" title={whatHappens.title}>
        <P>{whatHappens.p1}</P>
        <P>{whatHappens.p2}</P>
        <Callout tone="warning">{whatHappens.callout}</Callout>
        <P>
          <RichText text={whatHappens.p3} language={language} />
        </P>
      </Section>

      <Section id="can-you-still-claim" title={canStillClaim.title}>
        {canStillClaim.paragraphs.map((text, index) => (
          <P key={index}>{text}</P>
        ))}
      </Section>

      <Section id="what-to-do" title={whatToDo.title}>
        <Typography sx={{ ...BODY_SX, mb: 3 }}>{whatToDo.p1}</Typography>
        <StepList steps={whatToDo.steps} />
        <Typography sx={{ ...BODY_SX, mt: 3 }}>{whatToDo.p2}</Typography>
      </Section>

      <Section id="claim-without-ticket" title={claimWithoutTicket.title}>
        {claimWithoutTicket.paragraphs.map((text, index) => (
          <P key={index}>{text}</P>
        ))}
        <Callout tone="warning">{claimWithoutTicket.callout}</Callout>
      </Section>

      <Section id="photocopy" title={photocopy.title}>
        {photocopy.paragraphs.map((text, index) => (
          <Typography key={index} sx={index === photocopy.paragraphs.length - 1 ? { ...BODY_SX, mb: 3 } : BODY_SX}>
            {text}
          </Typography>
        ))}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden" }}>
          {photocopy.proofs.map(({ item, note }, index) => {
            const accepted = PROOF_ACCEPTED[index] ?? false;
            return (
              <Box
                key={item}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1.75,
                  bgcolor: accepted ? "#F0FDF4" : "#FFFFFF",
                  borderTop: index === 0 ? "none" : "1px solid #F1F5F9",
                }}
              >
                {accepted ? <CheckCircleIcon sx={{ color: "#16A34A" }} /> : <CancelIcon sx={{ color: "#DC2626" }} />}
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>{item}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>{note}</Typography>
                </Box>
              </Box>
            );
          })}
        </Paper>
      </Section>

      <Section id="claim-rules" title={claimRules.title}>
        <Typography sx={{ ...BODY_SX, mb: 3 }}>{claimRules.p1}</Typography>
        <Grid container spacing={2}>
          {claimRules.rules.map(({ label, text }) => (
            <Grid key={label} size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}
              >
                <Typography sx={{ fontWeight: 800, color: "#0B3C5D", fontSize: "0.95rem", mb: 0.5 }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Callout tone="info">
          <RichText text={claimRules.callout} language={language} />
        </Callout>
      </Section>

      <Section id="protect-ticket" title={protectTicket.title}>
        <Typography sx={{ ...BODY_SX, mb: 3 }}>{protectTicket.p1}</Typography>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
          {protectTicket.tips.map(({ label, text }) => (
            <Box component="li" key={label} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 22, mt: 0.25 }} />
              <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>
                <strong>{label}</strong> {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Callout tone="info">{protectTicket.callout}</Callout>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        {conclusion.paragraphs.map((text, index) => (
          <P key={index}>{text}</P>
        ))}
      </Section>
    </>
  );
};

export default LostTicketGuideContent;
