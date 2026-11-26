import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { AgentCommissionCopy } from "@/data/blogTranslations/agentCommission/types";
import { agentCommissionCopyEn } from "@/data/blogTranslations/agentCommission/en";
import { Callout, CheckList, Lead, P, Section, StepList } from "./GuideBlocks";
import RichText from "./RichText";

export interface AgentCommissionGuideContentProps {
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/agentCommission. */
  copy?: AgentCommissionCopy;
  language?: BlogLanguage;
}

const AgentCommissionGuideContent = ({ copy = agentCommissionCopyEn, language = "en" }: AgentCommissionGuideContentProps) => {
  const {
    lead,
    quickAnswer,
    whoAreAgents,
    salesCommission,
    winningCommission,
    howItWorks,
    whyAgentMatters,
    agentIncome,
    prizeCategories,
    supportAgents,
    responsibilities,
    conclusion,
  } = copy;
  const rich = (text: string) => <RichText text={text} language={language} />;
  const paragraphs = (items: string[]) => items.map((text) => <P key={text}>{rich(text)}</P>);

  return (
    <>
      <Lead>{rich(lead)}</Lead>

      <Section id="quick-answer" title={quickAnswer.title}>
        <Callout tone="info">{rich(quickAnswer.callout)}</Callout>
      </Section>

      <Section id="who-are-agents" title={whoAreAgents.title}>
        <P>{rich(whoAreAgents.p1)}</P>
        <CheckList items={whoAreAgents.locations} />
        <P>{rich(whoAreAgents.p2)}</P>
      </Section>

      <Section id="sales-commission" title={salesCommission.title}>
        {paragraphs(salesCommission.paragraphs)}
      </Section>

      <Section id="winning-commission" title={winningCommission.title}>
        {paragraphs(winningCommission.paragraphs)}
      </Section>

      <Section id="how-it-works" title={howItWorks.title}>
        <P>{rich(howItWorks.intro)}</P>
        <StepList steps={howItWorks.steps} />
        <Callout tone="warning">{rich(howItWorks.warning)}</Callout>
      </Section>

      <Section id="why-agent-matters" title={whyAgentMatters.title}>
        <P>{rich(whyAgentMatters.intro)}</P>
        <CheckList items={whyAgentMatters.items} />
        <P>{rich(whyAgentMatters.p2)}</P>
      </Section>

      <Section id="agent-income" title={agentIncome.title}>
        <P>{rich(agentIncome.intro)}</P>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {agentIncome.factors.map(({ title, text }) => (
            <Grid key={title} size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <Typography sx={{ fontWeight: 800, color: "#14532D", fontSize: "0.95rem", mb: 0.5 }}>{title}</Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <P>{rich(agentIncome.p2)}</P>
      </Section>

      <Section id="prize-categories" title={prizeCategories.title}>
        <P>{rich(prizeCategories.intro)}</P>
        <CheckList items={prizeCategories.items} />
        <P>{rich(prizeCategories.p2)}</P>
      </Section>

      <Section id="support-agents" title={supportAgents.title}>
        <P>{rich(supportAgents.intro)}</P>
        <CheckList items={supportAgents.tips} />
        <P>{rich(supportAgents.p2)}</P>
      </Section>

      <Section id="responsibilities" title={responsibilities.title}>
        <CheckList items={responsibilities.items} />
        <P>{rich(responsibilities.p2)}</P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        {paragraphs(conclusion.paragraphs)}
      </Section>
    </>
  );
};

export default AgentCommissionGuideContent;
