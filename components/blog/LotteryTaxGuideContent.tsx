import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { getBlogPath } from "@/data/blogs";
import { Callout, CheckList, InlineLink, Lead, P, Section } from "./GuideBlocks";

const TAX_RATE = 0.3;

/** Illustrative prize amounts for the 30% table (in rupees). */
const EXAMPLE_PRIZES = [100_000, 500_000, 1_000_000, 5_000_000];

const formatInr = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

const TAX_ROWS = EXAMPLE_PRIZES.map((prize) => {
  const tax = Math.round(prize * TAX_RATE);
  return { prize: formatInr(prize), tax: formatInr(tax), remaining: formatInr(prize - tax) };
});

const UNDERSTAND = [
  "The advertised prize amount.",
  "The selling agent's commission deducted from the prize.",
  "The tax deducted before payment.",
  "The actual amount received.",
  "Any further tax that may apply in your return.",
];
const CHECK_DETAILS = [
  "The original prize amount.",
  "The agent commission deducted.",
  "The tax deducted at source.",
  "The net amount paid.",
  "Payment and deduction records from the prize-paying authority.",
];
const DOCUMENTS = [
  "Winning ticket copy and claim-related documents.",
  "Prize payment confirmation.",
  "TDS certificate, where issued.",
  "Bank statement showing the prize credit.",
  "Income-tax return and supporting records.",
];
const BEFORE_SPENDING = [
  "Pay off high-interest debts, if appropriate.",
  "Set aside money for existing obligations.",
  "Build an emergency fund.",
  "Avoid large impulse purchases.",
  "Get professional financial advice.",
  "Plan long-term savings.",
];
const ADVISER_HELPS = [
  "Explain the tax treatment of lottery winnings.",
  "Review the TDS deducted.",
  "Keep the right records.",
  "Explain filing requirements.",
  "Identify any extra tax (surcharge, cess) due.",
  "Plan how to manage the remaining money.",
];

const cellSx = { px: 2, py: 1.25, fontSize: "0.92rem", borderTop: "1px solid #F1F5F9" } as const;

const LotteryTaxGuideContent = () => (
  <>
    <Lead>
      Winning a Kerala lottery prize can change your life, but the prize announced in the result is not the amount that
      reaches your bank. Tax and other deductions come first. This guide explains how Kerala lottery tax works in India,
      how TDS is applied, and what to plan before spending your prize.
    </Lead>

    <Section id="quick-answer" title="Quick Answer: Tax on Kerala Lottery Winnings">
      <Callout tone="info">
        Lottery winnings in India are taxed at a flat <strong>30%</strong> (Section 115BB), plus surcharge where
        applicable and <strong>4% health and education cess</strong>. Tax is deducted at source under{" "}
        <strong>Section 194B</strong> when winnings exceed ₹10,000. For Kerala lottery prizes, the selling
        agent&apos;s commission is deducted first, so a ₹1 crore first prize is roughly <strong>₹63 lakh</strong>{" "}
        before surcharge and cess.
      </Callout>
    </Section>

    <Section id="tax-on-winnings" title="1. Understanding Tax on Lottery Winnings">
      <P>
        Lottery winnings are a separate category of income under Indian tax rules. They are taxed at a special flat rate
        of 30%, unlike salary income, and the prize-paying authority deducts tax at source (TDS) when the threshold is
        crossed. Deductions and the basic exemption limit generally cannot be set off against lottery winnings.
      </P>
      <P>Every winner should understand the difference between:</P>
      <CheckList items={UNDERSTAND} />
    </Section>

    <Section id="actual-amount" title="2. Why the Actual Prize Amount May Be Different">
      <P>
        Many winners assume the announced prize will be paid in full. At a 30% rate, a ₹10 lakh prize carries ₹3 lakh in
        tax, leaving ₹7 lakh before surcharge, cess or other adjustments:
      </P>
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden", mb: 1.5 }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead" sx={{ bgcolor: "#0B3C5D" }}>
            <tr>
              {["Prize amount", "Illustrative 30% tax", "Amount remaining"].map((head) => (
                <Box component="th" key={head} scope="col" sx={{ px: 2, py: 1.25, textAlign: "left", color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 800 }}>
                  {head}
                </Box>
              ))}
            </tr>
          </Box>
          <tbody>
            {TAX_ROWS.map(({ prize, tax, remaining }) => (
              <tr key={prize}>
                <Box component="td" sx={{ ...cellSx, fontWeight: 700 }}>{prize}</Box>
                <Box component="td" sx={{ ...cellSx, color: "#DC2626" }}>{tax}</Box>
                <Box component="td" sx={{ ...cellSx, color: "#15803D", fontWeight: 700 }}>{remaining}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Paper>
      <Typography sx={{ fontSize: "0.82rem", color: "#64748B", mb: 2.5 }}>
        Illustrative only, using a 30% rate. Final tax depends on surcharge, cess and your circumstances.
      </Typography>
      <P>
        Kerala lottery prizes also carry a selling-agent commission (widely reported as 10% on major prizes), deducted
        before tax. See{" "}
        <InlineLink href={getBlogPath("kerala-lottery-agent-commission-on-winning-tickets")}>how Kerala lottery agent commission works</InlineLink>
        .
      </P>
    </Section>

    <Section id="tds" title="3. Understanding Tax Deducted at Source (TDS)">
      <P>
        TDS means tax is deducted before the income is paid to you. For lottery winnings, the prize-paying authority
        deducts it, so the tax is settled at the time of payment. The Income Tax Department sets a 30% TDS rate on
        lottery winnings above the threshold. Your{" "}
        <InlineLink href={getBlogPath("documents-required-to-claim-kerala-lottery-prize")}>PAN card is part of the claim documents</InlineLink>{" "}
        so the deduction can be credited correctly against your name.
      </P>
    </Section>

    <Section id="check-details" title="4. Why Winners Should Check Their Tax Details Carefully">
      <P>Don&apos;t look only at the amount credited. Check how it was calculated:</P>
      <CheckList items={CHECK_DETAILS} />
      <P>These records help when you file your return or consult a tax professional.</P>
    </Section>

    <Section id="documents" title="5. The Importance of Keeping Tax Documents">
      <CheckList items={DOCUMENTS} />
      <P>Keep them even after the money is received. They prove the amount won, received and taxed.</P>
    </Section>

    <Section id="dont-spend" title="6. Why Lottery Winnings Should Not Be Spent Immediately">
      <P>Know your net amount first. Before spending, consider:</P>
      <CheckList items={BEFORE_SPENDING} />
      <Callout tone="warning">
        Nobody needs to be paid to &quot;release&quot; your prize. Tax is deducted officially at source. Treat calls
        asking for a &quot;tax fee&quot; or &quot;processing charge&quot; as fraud and report them to the cybercrime
        helpline 1930.
      </Callout>
    </Section>

    <Section id="tax-vs-expenses" title="7. Understanding the Difference Between Tax and Other Expenses">
      <P>
        Tax is only one deduction. Loans, family needs, savings goals and big purchases also compete for the money. If
        you plan to buy a house or vehicle, work from the amount left after tax and commitments, not the headline prize.
      </P>
    </Section>

    <Section id="professional-advice" title="8. Why Professional Tax Advice Can Be Helpful">
      <P>A qualified tax professional can:</P>
      <CheckList items={ADVISER_HELPS} />
      <P>Advice is especially useful for large prizes or when you have other income.</P>
    </Section>

    <Section id="planning" title="9. Responsible Financial Planning After Winning">
      <P>
        Treat a win as a chance to improve financial stability, not guaranteed wealth. Plan for immediate needs, future
        goals, savings and family. Be wary of investment offers and money requests from people who hear about your win.
      </P>
      <P>
        Claim on time too: follow the{" "}
        <InlineLink href={getBlogPath("how-to-claim-kerala-lottery-prize")}>step-by-step Kerala lottery prize claim guide</InlineLink>{" "}
        or{" "}
        <InlineLink href={getBlogPath("surrender-kerala-lottery-winning-ticket-through-bank")}>surrender your winning ticket through a bank</InlineLink>
        .
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        The advertised prize is not the final amount you receive. Understand the 30% tax and TDS, check your payment
        details, keep every document and plan before spending. Check your ticket on{" "}
        <InlineLink href="/">Kerala Lottery Results Today</InlineLink>, and consult a professional for advice on your
        own situation.
      </P>
    </Section>
  </>
);

export default LotteryTaxGuideContent;
