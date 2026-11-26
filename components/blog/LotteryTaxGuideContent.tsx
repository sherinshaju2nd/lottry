import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { LotteryTaxCopy } from "@/data/blogTranslations/lotteryTax/types";
import { lotteryTaxCopyEn } from "@/data/blogTranslations/lotteryTax/en";
import { Callout, CheckList, Lead, P, Section } from "./GuideBlocks";
import RichText from "./RichText";

const TAX_RATE = 0.3;

/** Illustrative prize amounts for the 30% table (in rupees). */
const EXAMPLE_PRIZES = [100_000, 500_000, 1_000_000, 5_000_000];

const formatInr = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

const TAX_ROWS = EXAMPLE_PRIZES.map((prize) => {
  const tax = Math.round(prize * TAX_RATE);
  return { prize: formatInr(prize), tax: formatInr(tax), remaining: formatInr(prize - tax) };
});

const cellSx = { px: 2, py: 1.25, fontSize: "0.92rem", borderTop: "1px solid #F1F5F9" } as const;

export interface LotteryTaxGuideContentProps {
  copy?: LotteryTaxCopy;
  language?: BlogLanguage;
}

const LotteryTaxGuideContent = ({ copy = lotteryTaxCopyEn, language = "en" }: LotteryTaxGuideContentProps) => {
  const {
    lead,
    quickAnswer,
    taxOnWinnings,
    actualAmount,
    tds,
    checkDetails,
    documents,
    dontSpend,
    taxVsExpenses,
    professionalAdvice,
    planning,
    conclusion,
  } = copy;
  const rich = (text: string) => <RichText text={text} language={language} />;
  const { prize: prizeHead, tax: taxHead, remaining: remainingHead } = actualAmount.tableHeads;

  return (
    <>
      <Lead>{rich(lead)}</Lead>

      <Section id="quick-answer" title={quickAnswer.title}>
        <Callout tone="info">{rich(quickAnswer.callout)}</Callout>
      </Section>

      <Section id="tax-on-winnings" title={taxOnWinnings.title}>
        <P>{rich(taxOnWinnings.p1)}</P>
        <P>{rich(taxOnWinnings.p2)}</P>
        <CheckList items={taxOnWinnings.items} />
      </Section>

      <Section id="actual-amount" title={actualAmount.title}>
        <P>{rich(actualAmount.p1)}</P>
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden", mb: 1.5 }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <Box component="thead" sx={{ bgcolor: "#0B3C5D" }}>
              <tr>
                {[prizeHead, taxHead, remainingHead].map((head) => (
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
        <Typography sx={{ fontSize: "0.82rem", color: "#64748B", mb: 2.5 }}>{actualAmount.tableNote}</Typography>
        <P>{rich(actualAmount.p2)}</P>
      </Section>

      <Section id="tds" title={tds.title}>
        <P>{rich(tds.p1)}</P>
      </Section>

      <Section id="check-details" title={checkDetails.title}>
        <P>{rich(checkDetails.p1)}</P>
        <CheckList items={checkDetails.items} />
        <P>{rich(checkDetails.p2)}</P>
      </Section>

      <Section id="documents" title={documents.title}>
        <CheckList items={documents.items} />
        <P>{rich(documents.p1)}</P>
      </Section>

      <Section id="dont-spend" title={dontSpend.title}>
        <P>{rich(dontSpend.p1)}</P>
        <CheckList items={dontSpend.items} />
        <Callout tone="warning">{rich(dontSpend.warning)}</Callout>
      </Section>

      <Section id="tax-vs-expenses" title={taxVsExpenses.title}>
        <P>{rich(taxVsExpenses.p1)}</P>
      </Section>

      <Section id="professional-advice" title={professionalAdvice.title}>
        <P>{rich(professionalAdvice.p1)}</P>
        <CheckList items={professionalAdvice.items} />
        <P>{rich(professionalAdvice.p2)}</P>
      </Section>

      <Section id="planning" title={planning.title}>
        <P>{rich(planning.p1)}</P>
        <P>{rich(planning.p2)}</P>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        <P>{rich(conclusion.p1)}</P>
      </Section>
    </>
  );
};

export default LotteryTaxGuideContent;
