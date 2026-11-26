/**
 * Every visible string of the "Kerala Lottery Tax" article body.
 * Strings are RichText markup: `**bold**`, `[text](/path)`, `[text](guide:slug)`.
 */
export interface LotteryTaxCopy {
  lead: string;
  quickAnswer: { title: string; callout: string };
  taxOnWinnings: { title: string; p1: string; p2: string; items: string[] };
  actualAmount: {
    title: string;
    p1: string;
    /** Column headings of the illustrative 30% table (amounts are computed in the component). */
    tableHeads: { prize: string; tax: string; remaining: string };
    tableNote: string;
    p2: string;
  };
  tds: { title: string; p1: string };
  checkDetails: { title: string; p1: string; items: string[]; p2: string };
  documents: { title: string; items: string[]; p1: string };
  dontSpend: { title: string; p1: string; items: string[]; warning: string };
  taxVsExpenses: { title: string; p1: string };
  professionalAdvice: { title: string; p1: string; items: string[]; p2: string };
  planning: { title: string; p1: string; p2: string };
  conclusion: { title: string; p1: string };
}
