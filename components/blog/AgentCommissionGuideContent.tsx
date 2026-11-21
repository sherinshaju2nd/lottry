import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { getBlogPath } from "@/data/blogs";
import { Callout, CheckList, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const LOCATIONS = [
  "Local shops and commercial areas.",
  "Bus stations and transport hubs.",
  "Marketplaces.",
  "Residential neighbourhoods.",
  "Town centres and busy public areas.",
];
const COMMISSION_STEPS = [
  { title: "Ticket sale", desc: "The authorised agent sells the original printed lottery ticket to a customer." },
  { title: "Customer checks the result", desc: "The customer matches the ticket against the declared Kerala lottery result." },
  {
    title: "Winning ticket is identified",
    desc: "If the ticket wins, the ticket details and the selling agent's information (agency seal on the reverse) are examined during the claim.",
  },
  { title: "Prize claim verification", desc: "The Lottery Department verifies the original ticket and the claim documents." },
  {
    title: "Applicable commission is processed",
    desc: "If the selling agent is eligible under the rules, the commission is processed through the prescribed procedure.",
  },
];
const AGENT_HELP = [
  "Identifying the lottery name and draw number.",
  "Checking the ticket number and series.",
  "Understanding the basic prize-claim process.",
  "Explaining why the original ticket must be kept safe.",
  "Directing winners to the correct claim procedure.",
];
const INCOME_FACTORS = [
  { title: "Tickets sold", text: "Higher sales volume increases the commission earned through ticket distribution." },
  { title: "Customer demand", text: "Popular draws, especially bumper lotteries, attract more buyers." },
  { title: "Location", text: "Stalls in busy areas get more footfall than shops in small villages." },
  { title: "Lottery availability", text: "The mix of daily and bumper lotteries on offer shapes what customers buy." },
  { title: "Winning-ticket commission", text: "Eligible winning tickets can add a selling-agent commission under the rules." },
];
const RULES_DECIDE = [
  "Whether a commission is payable.",
  "The eligible prize category.",
  "The applicable rate or amount.",
  "The procedure for processing the commission.",
  "Any documentation or verification required.",
];
const CUSTOMER_TIPS = [
  "Buy original printed tickets from authorised sellers.",
  "Check the lottery name, draw number and ticket number.",
  "Keep the original ticket safe and unaltered.",
  "Avoid online or WhatsApp ticket offers.",
  "Check the declared result carefully.",
  "Follow the official prize-claim process if you win.",
];
const RESPONSIBILITIES = [
  "Selling tickets only through authorised channels.",
  "Charging the printed ticket price.",
  "Maintaining proper sales records.",
  "Protecting tickets from loss or damage.",
  "Giving customers the original ticket.",
  "Never making misleading winning promises.",
  "Following official instructions and regulations.",
];

const AgentCommissionGuideContent = () => (
  <>
    <Lead>
      Kerala State Lotteries reach buyers through a network of authorised agents and local retail sellers in towns,
      cities and villages. Many people ask how these agents earn, and whether they get extra money when a customer wins.
      This guide explains the Kerala lottery agent commission on ticket sales and on winning tickets.
    </Lead>

    <Section id="quick-answer" title="Quick Answer: How Do Kerala Lottery Agents Earn?">
      <Callout tone="info">
        Agents earn mainly from <strong>commission on ticket sales</strong>. When a ticket they sold wins an eligible
        prize, they may also receive a <strong>selling-agent prize commission</strong>, widely reported as 10% of the
        prize for major and bumper prizes. It is deducted from the prize before the winner is paid, and the exact amount
        depends on the rules in force.
      </Callout>
    </Section>

    <Section id="who-are-agents" title="1. Who Are Kerala Lottery Retail Agents?">
      <P>
        Retail agents are individuals or businesses authorised to sell lottery tickets through the prescribed
        distribution system. They get tickets through approved channels and sell them at the printed price. You will
        find them in:
      </P>
      <CheckList items={LOCATIONS} />
      <P>Their main job is to make tickets available to customers while following the lottery rules.</P>
    </Section>

    <Section id="sales-commission" title="2. How Do Local Lottery Agents Earn Their Commission?">
      <P>
        The main income for a retail agent is commission on ticket sales. Agents do not charge customers a separate
        service fee. They earn a commission on the tickets sold through their authorised distribution arrangement.
      </P>
      <P>
        The rate is set by government rules. What an agent earns depends on the number and value of tickets sold, the
        lottery category and the prescribed rate. Steady sales are what keep an agent&apos;s income stable.
      </P>
    </Section>

    <Section id="winning-commission" title="3. Do Agents Earn Commission When Customers Win?">
      <P>
        Yes, in many cases. Depending on the rules and prize category, the agent who sold a winning ticket may be
        eligible for a selling-agent commission. An agent can therefore earn twice: the regular sales commission, and
        an extra commission on an eligible winning ticket.
      </P>
      <P>
        For winners, the agent&apos;s share is deducted from the prize before{" "}
        <InlineLink href={getBlogPath("kerala-lottery-tax-deduction-on-winnings")}>tax (30% TDS) on lottery winnings</InlineLink>{" "}
        is applied. That is why the amount credited is well below the prize in the result.
      </P>
    </Section>

    <Section id="how-it-works" title="4. How Does the Winning Ticket Commission Work?">
      <P>When a ticket sold by an authorised agent wins, the process usually runs in five stages:</P>
      <StepList steps={COMMISSION_STEPS} />
      <Callout tone="warning">
        The commission is not a fixed amount for every winning ticket. It depends on the lottery regulations and the
        prize category.
      </Callout>
    </Section>

    <Section id="why-agent-matters" title="5. Why Is the Selling Agent Important When a Ticket Wins?">
      <P>When a ticket wins, the agent can help the customer with:</P>
      <CheckList items={AGENT_HELP} />
      <P>
        The agent does not approve or guarantee prize payments. Verification and payment are handled by the Lottery
        Department. Winners should follow the{" "}
        <InlineLink href={getBlogPath("how-to-claim-kerala-lottery-prize")}>official Kerala lottery prize claim procedure</InlineLink>{" "}
        and prepare the{" "}
        <InlineLink href={getBlogPath("documents-required-to-claim-kerala-lottery-prize")}>documents required to claim the prize</InlineLink>
        .
      </P>
    </Section>

    <Section id="agent-income" title="6. How Ticket Sales Affect an Agent's Income">
      <P>Agent income varies with sales, location, demand and the lotteries available:</P>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {INCOME_FACTORS.map(({ title, text }) => (
          <Grid key={title} size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <Typography sx={{ fontWeight: 800, color: "#14532D", fontSize: "0.95rem", mb: 0.5 }}>{title}</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <P>Agents should keep accurate sales records and follow the applicable financial and distribution requirements.</P>
    </Section>

    <Section id="prize-categories" title="7. Do Agents Receive Commission for Every Prize Category?">
      <P>
        Not necessarily. Commission can differ by lottery, prize category and regulation. The official rules decide:
      </P>
      <CheckList items={RULES_DECIDE} />
      <P>Agents should refer to the latest official instructions for their exact entitlement.</P>
    </Section>

    <Section id="support-agents" title="8. How Customers Can Support Authorised Local Lottery Agents">
      <P>
        Buying from authorised agents keeps the regulated paper-ticket system working and lowers the risk of counterfeit
        tickets. Customers should:
      </P>
      <CheckList items={CUSTOMER_TIPS} />
      <P>
        Online sale of Kerala lottery tickets is not permitted. See{" "}
        <InlineLink href={getBlogPath("why-online-kerala-lottery-ticket-sales-are-illegal")}>why online Kerala lottery ticket sales are illegal</InlineLink>{" "}
        and{" "}
        <InlineLink href={getBlogPath("how-to-find-fake-kerala-lottery-tickets")}>how to spot fake Kerala lottery tickets</InlineLink>
        . Checking results on <InlineLink href="/">Kerala Lottery Results Today</InlineLink> is free, but you still need
        the original ticket from an authorised seller to claim a prize.
      </P>
    </Section>

    <Section id="responsibilities" title="9. Responsibilities of Local Lottery Retail Agents">
      <CheckList items={RESPONSIBILITIES} />
      <P>
        Agents must also meet the eligibility rules, including the{" "}
        <InlineLink href={getBlogPath("minimum-age-to-buy-kerala-lottery-ticket")}>18-year age requirement for lottery agents</InlineLink>
        . Responsible agents keep customer trust and help the distribution network run properly.
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Kerala lottery agents earn mainly through commission on authorised ticket sales, with an extra selling-agent
        commission on eligible winning tickets. The amount varies with sales, lottery category, winning tickets and the
        rules in force.
      </P>
      <P>
        The same network also supports thousands of livelihoods. Read more on the{" "}
        <InlineLink href={getBlogPath("kerala-lottery-social-impact-karunya-benevolent-fund")}>social impact of Kerala lotteries</InlineLink>
        .
      </P>
    </Section>
  </>
);

export default AgentCommissionGuideContent;
