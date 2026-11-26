/**
 * Every visible string of the "How Kerala Lottery Agents Earn Commission on Winning Tickets" article body.
 * Strings are RichText: `**bold**`, `[text](/path)`, `[text](guide:slug)`.
 */
export interface AgentCommissionCopy {
  lead: string;
  quickAnswer: { title: string; callout: string };
  whoAreAgents: {
    title: string;
    p1: string;
    locations: string[];
    p2: string;
  };
  salesCommission: { title: string; paragraphs: string[] };
  winningCommission: { title: string; paragraphs: string[] };
  howItWorks: {
    title: string;
    intro: string;
    /** Exactly five stages, in order. */
    steps: { title: string; desc: string }[];
    warning: string;
  };
  whyAgentMatters: {
    title: string;
    intro: string;
    items: string[];
    p2: string;
  };
  agentIncome: {
    title: string;
    intro: string;
    /** Card grid: bold title over a short explanation. */
    factors: { title: string; text: string }[];
    p2: string;
  };
  prizeCategories: {
    title: string;
    intro: string;
    items: string[];
    p2: string;
  };
  supportAgents: {
    title: string;
    intro: string;
    tips: string[];
    p2: string;
  };
  responsibilities: {
    title: string;
    items: string[];
    p2: string;
  };
  conclusion: { title: string; paragraphs: string[] };
}
