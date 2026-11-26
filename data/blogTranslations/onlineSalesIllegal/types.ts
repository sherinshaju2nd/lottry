/** Every visible string of the "Why Online Kerala Lottery Ticket Sales Are Illegal" article body. */
export interface OnlineSalesIllegalCopy {
  lead: string;
  intro: string;
  whyProhibited: {
    title: string;
    p1: string;
    callout: string;
    reasonsIntro: string;
    reasons: string[];
  };
  departmentStand: {
    title: string;
    p1: string;
    /** RichText: contains the "Kerala Lottery Results Today" link to "/". */
    p2: string;
  };
  risks: {
    title: string;
    items: { title: string; text: string }[];
    p1: string;
  };
  officialDistribution: {
    title: string;
    p1: string;
    ticketDetails: string[];
    /** RichText: contains the fake-ticket guide link. */
    p2: string;
  };
  fakeAds: {
    title: string;
    p1: string;
    warnings: string[];
    p2: string;
  };
  resultsVsBuying: {
    title: string;
    p1: string;
    /** Exactly 6 rows, same order as the component's allowed flags: 3 allowed, then 3 not allowed. */
    rows: string[];
    drawsTitle: string;
    drawsIntro: string;
  };
  claimPrize: {
    title: string;
    p1: string;
    steps: { title: string; desc: string }[];
    /** RichText: contains the bank-surrender guide link. */
    callout: string;
  };
  claimDocuments: {
    title: string;
    p1: string;
    items: string[];
    /** RichText: contains the claim-documents guide link. */
    p2: string;
  };
  report: {
    title: string;
    items: string[];
    p1: string;
  };
  conclusion: {
    title: string;
    p1: string;
    /** RichText: contains the agent-commission guide link. */
    p2: string;
  };
}
