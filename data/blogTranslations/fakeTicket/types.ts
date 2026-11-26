/**
 * Every visible string of the "How to Find Fake Kerala Lottery Tickets" article body.
 * Strings are rendered with RichText, so `**bold**` and `[text](href)` markers must stay intact.
 */
export interface FakeTicketCopy {
  /** Opening lead paragraph (starts with a bold sentence). */
  lead: string;
  /** Two intro paragraphs after the lead. */
  intro: string[];
  printing: { title: string; p1: string; checks: string[]; note: string };
  ticketNumber: { title: string; p1: string; checks: string[]; p2: string };
  alterations: { title: string; p1: string; checks: string[]; warning: string };
  drawDetails: {
    title: string;
    p1: string;
    checks: string[];
    /** Title and intro of the recent-draws table. */
    recentTitle: string;
    recentIntro: string;
  };
  physical: { title: string; p1: string; checks: string[]; p2: string };
  sellers: { title: string; p1: string; checks: string[]; p2: string };
  compare: { title: string; p1: string; checks: string[]; p2: string };
  winningNumber: { title: string; p1: string; steps: { title: string; desc: string }[] };
  suspect: { title: string; p1: string; checks: string[]; danger: string };
  tips: { title: string; checks: string[]; p1: string };
  conclusion: { title: string; paragraphs: string[] };
}
