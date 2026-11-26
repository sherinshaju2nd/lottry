import type { LotteryTaxCopy } from "./types";

/** English source text — every translation in this folder must keep exactly this meaning. */
export const lotteryTaxCopyEn: LotteryTaxCopy = {
  lead: "Winning a Kerala lottery prize can change your life, but the prize announced in the result is not the amount that reaches your bank. Tax and other deductions come first. This guide explains how Kerala lottery tax works in India, how TDS is applied, and what to plan before spending your prize.",
  quickAnswer: {
    title: "Quick Answer: Tax on Kerala Lottery Winnings",
    callout:
      "Lottery winnings in India are taxed at a flat **30%** (Section 115BB), plus surcharge where applicable and **4% health and education cess**. Tax is deducted at source under **Section 194B** when winnings exceed ₹10,000. For Kerala lottery prizes, the selling agent's commission is deducted first, so a ₹1 crore first prize is roughly **₹63 lakh** before surcharge and cess.",
  },
  taxOnWinnings: {
    title: "1. Understanding Tax on Lottery Winnings",
    p1: "Lottery winnings are a separate category of income under Indian tax rules. They are taxed at a special flat rate of 30%, unlike salary income, and the prize-paying authority deducts tax at source (TDS) when the threshold is crossed. Deductions and the basic exemption limit generally cannot be set off against lottery winnings.",
    p2: "Every winner should understand the difference between:",
    items: [
      "The advertised prize amount.",
      "The selling agent's commission deducted from the prize.",
      "The tax deducted before payment.",
      "The actual amount received.",
      "Any further tax that may apply in your return.",
    ],
  },
  actualAmount: {
    title: "2. Why the Actual Prize Amount May Be Different",
    p1: "Many winners assume the announced prize will be paid in full. At a 30% rate, a ₹10 lakh prize carries ₹3 lakh in tax, leaving ₹7 lakh before surcharge, cess or other adjustments:",
    tableHeads: { prize: "Prize amount", tax: "Illustrative 30% tax", remaining: "Amount remaining" },
    tableNote: "Illustrative only, using a 30% rate. Final tax depends on surcharge, cess and your circumstances.",
    p2: "Kerala lottery prizes also carry a selling-agent commission (widely reported as 10% on major prizes), deducted before tax. See [how Kerala lottery agent commission works](guide:kerala-lottery-agent-commission-on-winning-tickets).",
  },
  tds: {
    title: "3. Understanding Tax Deducted at Source (TDS)",
    p1: "TDS means tax is deducted before the income is paid to you. For lottery winnings, the prize-paying authority deducts it, so the tax is settled at the time of payment. The Income Tax Department sets a 30% TDS rate on lottery winnings above the threshold. Your [PAN card is part of the claim documents](guide:documents-required-to-claim-kerala-lottery-prize) so the deduction can be credited correctly against your name.",
  },
  checkDetails: {
    title: "4. Why Winners Should Check Their Tax Details Carefully",
    p1: "Don't look only at the amount credited. Check how it was calculated:",
    items: [
      "The original prize amount.",
      "The agent commission deducted.",
      "The tax deducted at source.",
      "The net amount paid.",
      "Payment and deduction records from the prize-paying authority.",
    ],
    p2: "These records help when you file your return or consult a tax professional.",
  },
  documents: {
    title: "5. The Importance of Keeping Tax Documents",
    items: [
      "Winning ticket copy and claim-related documents.",
      "Prize payment confirmation.",
      "TDS certificate, where issued.",
      "Bank statement showing the prize credit.",
      "Income-tax return and supporting records.",
    ],
    p1: "Keep them even after the money is received. They prove the amount won, received and taxed.",
  },
  dontSpend: {
    title: "6. Why Lottery Winnings Should Not Be Spent Immediately",
    p1: "Know your net amount first. Before spending, consider:",
    items: [
      "Pay off high-interest debts, if appropriate.",
      "Set aside money for existing obligations.",
      "Build an emergency fund.",
      "Avoid large impulse purchases.",
      "Get professional financial advice.",
      "Plan long-term savings.",
    ],
    warning:
      "Nobody needs to be paid to \"release\" your prize. Tax is deducted officially at source. Treat calls asking for a \"tax fee\" or \"processing charge\" as fraud and report them to the cybercrime helpline 1930.",
  },
  taxVsExpenses: {
    title: "7. Understanding the Difference Between Tax and Other Expenses",
    p1: "Tax is only one deduction. Loans, family needs, savings goals and big purchases also compete for the money. If you plan to buy a house or vehicle, work from the amount left after tax and commitments, not the headline prize.",
  },
  professionalAdvice: {
    title: "8. Why Professional Tax Advice Can Be Helpful",
    p1: "A qualified tax professional can:",
    items: [
      "Explain the tax treatment of lottery winnings.",
      "Review the TDS deducted.",
      "Keep the right records.",
      "Explain filing requirements.",
      "Identify any extra tax (surcharge, cess) due.",
      "Plan how to manage the remaining money.",
    ],
    p2: "Advice is especially useful for large prizes or when you have other income.",
  },
  planning: {
    title: "9. Responsible Financial Planning After Winning",
    p1: "Treat a win as a chance to improve financial stability, not guaranteed wealth. Plan for immediate needs, future goals, savings and family. Be wary of investment offers and money requests from people who hear about your win.",
    p2: "Claim on time too: follow the [step-by-step Kerala lottery prize claim guide](guide:how-to-claim-kerala-lottery-prize) or [surrender your winning ticket through a bank](guide:surrender-kerala-lottery-winning-ticket-through-bank).",
  },
  conclusion: {
    title: "Conclusion",
    p1: "The advertised prize is not the final amount you receive. Understand the 30% tax and TDS, check your payment details, keep every document and plan before spending. Check your ticket on [Kerala Lottery Results Today](/), and consult a professional for advice on your own situation.",
  },
};
