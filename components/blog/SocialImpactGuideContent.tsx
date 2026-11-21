import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { getBlogPath } from "@/data/blogs";
import { Callout, CheckList, InlineLink, Lead, P, Section } from "./GuideBlocks";

const WELFARE_AREAS = [
  "Financial assistance for eligible patients.",
  "Employment for lottery agents and sellers.",
  "Government revenue generation.",
  "Support for selected welfare programmes.",
  "Contribution to the State's economic activity.",
];
const KBF_CONDITIONS = ["Cancer", "Kidney diseases", "Heart diseases", "Haemophilia", "Palliative care"];
const JOBS = [
  "Registered lottery agents.",
  "Local retail ticket sellers.",
  "Sub-agents and permitted distributors.",
  "Printing and distribution workers.",
  "Administrative staff.",
];
const PUBLIC_SPENDING = [
  "Healthcare and medical services.",
  "Education and public institutions.",
  "Infrastructure development.",
  "Social welfare initiatives.",
  "Government administration and other public services.",
];
const CAG_FIGURES = [
  { label: "Lottery receipts", value: "₹12,711.18 cr", color: "#0E7490" },
  { label: "Lottery expenditure", value: "₹11,721.98 cr", color: "#B45309" },
  { label: "Net receipt", value: "₹989.20 cr", color: "#15803D" },
];
const PRECAUTIONS = [
  "Buy original printed tickets from authorised sellers.",
  "Avoid unauthorised online ticket offers.",
  "Keep the original ticket safe.",
  "Check winning numbers carefully.",
  "Never borrow money to buy tickets.",
  "Ignore promises of guaranteed winnings.",
  "Remember that winning is purely chance.",
];

const SocialImpactGuideContent = () => (
  <>
    <Lead>
      Kerala State Lotteries are more than a chance to win a prize. They generate revenue for the State, provide
      livelihoods for agents and sellers, and support healthcare through the Karunya Benevolent Fund. This guide looks
      at the social impact of Kerala lotteries on healthcare, employment and public welfare.
    </Lead>

    <Section id="quick-answer" title="Quick Answer: How Do Kerala Lotteries Help Society?">
      <Callout tone="info">
        Kerala lotteries support society in three main ways: the <strong>Karunya Benevolent Fund</strong> helps eligible
        patients with serious illnesses; the sales network gives <strong>income to more than one lakh people</strong>;
        and net lottery revenue (<strong>₹989.20 crore in 2024–25</strong>, per the CAG) adds to the State&apos;s
        resources for public spending.
      </Callout>
    </Section>

    <Section id="public-welfare" title="1. How Kerala Lotteries Contribute to Public Welfare">
      <P>
        The Government of Kerala runs the lotteries through the State Lotteries Department. Money from ticket sales first
        pays for prizes and{" "}
        <InlineLink href={getBlogPath("kerala-lottery-agent-commission-on-winning-tickets")}>agent commissions</InlineLink>
        . The remaining revenue joins the government&apos;s financial resources. The social contribution covers:
      </P>
      <CheckList items={WELFARE_AREAS} />
    </Section>

    <Section id="karunya-fund" title="2. Karunya Benevolent Fund: Support for Serious Medical Conditions">
      <P>
        The Karunya Benevolent Fund (KBF) gives financial assistance to eligible economically disadvantaged people with
        serious illnesses. The Kerala Health Department describes it as a government assurance scheme supported by funds
        raised through Kerala lotteries. It covers conditions such as:
      </P>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
        {KBF_CONDITIONS.map((condition) => (
          <Box key={condition} sx={{ px: 1.75, py: 0.75, borderRadius: "999px", bgcolor: "#FFF1F2", border: "1px solid #FECDD3", color: "#9F1239", fontWeight: 700, fontSize: "0.88rem" }}>
            {condition}
          </Box>
        ))}
      </Box>
      <P>
        Eligible beneficiaries get treatment through participating hospitals under the scheme. The weekly{" "}
        <InlineLink href="/karunya">Karunya lottery</InlineLink> and{" "}
        <InlineLink href="/karunyaplus">Karunya Plus lottery</InlineLink> share the scheme&apos;s name.
      </P>
    </Section>

    <Section id="medical-expenses" title="3. Financial Support for Families Facing Medical Expenses">
      <P>
        Hospital bills, tests, medicines, surgery and long-term treatment can overwhelm a low-income family. Schemes such
        as the Karunya Benevolent Fund help eligible families with specified serious illnesses, easing the financial
        pressure during a difficult time.
      </P>
    </Section>

    <Section id="employment" title="4. Employment Opportunities Through the Kerala Lottery System">
      <P>The lottery distribution network provides work and income across the State, including for:</P>
      <CheckList items={JOBS} />
      <P>
        Kerala&apos;s 2024 Budget Speech noted that the lottery sector provides income and employment to more than one
        lakh people. Many retail sellers depend on ticket sales as their main livelihood.
      </P>
    </Section>

    <Section id="revenue" title="5. How Lottery Revenue Supports Government Development">
      <P>
        Lottery revenue is an important part of Kerala&apos;s non-tax revenue. It goes into the general budget, not a
        fund reserved for one department, and supports public spending on:
      </P>
      <CheckList items={PUBLIC_SPENDING} />
      <P>The Comptroller and Auditor General&apos;s State Finances Audit Report for 2024–25 shows:</P>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {CAG_FIGURES.map(({ label, value, color }) => (
          <Grid key={label} size={{ xs: 12, sm: 4 }}>
            <Paper elevation={0} sx={{ p: 2.25, textAlign: "center", borderRadius: "12px", border: "1.5px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748B" }}>{label}</Typography>
              <Typography sx={{ fontSize: "1.35rem", fontWeight: 900, color }}>{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <P>
        So most receipts are spent on prizes, commissions and operations. The net receipt is meaningful, but much
        smaller than the headline sales figure.
      </P>
    </Section>

    <Section id="weaker-sections" title="6. Supporting Economically Weaker Sections of Society">
      <P>
        Through the Karunya Benevolent Fund, lottery-linked resources help families who cannot afford treatment.
        Alongside this, the sales network gives income to people working as authorised agents and sellers. Together,
        these show the social and economic role of the lottery system.
      </P>
    </Section>

    <Section id="responsible-play" title="7. The Role of Responsible Lottery Participation">
      <P>
        Social benefits do not make a lottery ticket a way to earn money. Spend only what you can afford to lose and take
        these precautions:
      </P>
      <CheckList items={PRECAUTIONS} />
      <P>
        Lottery participation is for adults only. Read{" "}
        <InlineLink href={getBlogPath("minimum-age-to-buy-kerala-lottery-ticket")}>why there is a minimum age to buy a Kerala lottery ticket</InlineLink>
        , and{" "}
        <InlineLink href={getBlogPath("why-online-kerala-lottery-ticket-sales-are-illegal")}>why online ticket sales are illegal</InlineLink>
        .
      </P>
    </Section>

    <Section id="transparency" title="8. Transparency and Accountability in Lottery Revenue">
      <P>
        Public trust depends on clear reporting of ticket sales, prizes, commissions, costs and net revenue. Independent
        audits such as the CAG report show how much is collected and spent. The Karunya Benevolent Fund has its own
        eligibility rules and procedures so that help reaches eligible beneficiaries.
      </P>
    </Section>

    <Section id="wider-importance" title="9. Why Kerala Lotteries Have a Wider Social Importance">
      <P>
        For authorised sellers, the lottery is a livelihood. For eligible patients, Karunya assistance reduces the cost
        of serious illness. For the government, net lottery revenue is part of the money available for public services.
        Winners contribute too: their prizes are taxed at 30% (see{" "}
        <InlineLink href={getBlogPath("kerala-lottery-tax-deduction-on-winnings")}>Kerala lottery tax on winnings</InlineLink>
        ).
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Kerala State Lotteries contribute to government revenue, create employment and support healthcare through the
        Karunya Benevolent Fund. Understanding this helps people see their wider social and economic role. Check the
        latest draws on <InlineLink href="/">Kerala Lottery Results Today</InlineLink>.
      </P>
    </Section>
  </>
);

export default SocialImpactGuideContent;
