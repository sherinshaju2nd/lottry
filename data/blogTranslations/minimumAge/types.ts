/**
 * Every visible string of the "Why Is There a Minimum Age to Buy a Kerala Lottery Ticket?" article body.
 * Fields marked "RichText" may contain `**bold**` and `[text](href)` markup (see components/blog/RichText.tsx).
 */
export interface MinimumAgeCopy {
  lead: string;
  quickAnswer: {
    title: string;
    /** RichText. */
    callout: string;
  };
  whyMinimumAge: {
    title: string;
    p1: string;
    purposes: string[];
  };
  financialRisks: {
    title: string;
    p1: string;
  };
  responsiblePlay: {
    title: string;
    p1: string;
    habits: string[];
  };
  agentsSellers: {
    title: string;
    p1: string;
    /** RichText: link to the agent-commission guide. */
    p2: string;
  };
  parents: {
    title: string;
    p1: string;
    focus: string[];
  };
  resultsVsPlaying: {
    title: string;
    /** RichText: link to the results home page. */
    p1: string;
  };
  notInvestment: {
    title: string;
    p1: string;
    notFor: string[];
    /** RichText: link to the tax guide. */
    p2: string;
  };
  buyResponsibly: {
    title: string;
    p1: string;
    checks: string[];
    /** RichText: links to the fake-ticket and online-sales guides. */
    p2: string;
  };
  conclusion: {
    title: string;
    p1: string;
  };
}
