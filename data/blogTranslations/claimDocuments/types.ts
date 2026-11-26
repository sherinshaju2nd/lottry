/**
 * Every visible string of the "What Documents Are Required to Claim a Kerala Lottery Prize?" article body.
 * Strings marked RichText may contain `**bold**` and `[text](href)` markers (see components/blog/RichText.tsx).
 */
export interface ClaimDocumentsCopy {
  lead: string;
  intro: string;
  originalTicket: {
    title: string;
    p1: string;
    checks: string[];
    /** RichText: links to the lost-ticket guide. */
    callout: string;
  };
  identityProof: {
    title: string;
    p1: string;
    documents: string[];
    p2: string;
  };
  photographs: { title: string; p1: string };
  panCard: {
    title: string;
    p1: string;
    checks: string[];
    /** RichText: links to the tax guide. */
    p2: string;
  };
  bankDetails: {
    title: string;
    p1: string;
    documents: string[];
    warning: string;
  };
  claimForm: {
    title: string;
    p1: string;
    fields: string[];
    p2: string;
  };
  addressProof: { title: string; p1: string };
  selfAttested: {
    title: string;
    p1: string;
    fileOrder: string[];
    p2: string;
  };
  howToSubmit: {
    title: string;
    steps: { title: string; desc: string }[];
    /** RichText: links to the bank-surrender guide. */
    bankNote: string;
    recentDrawsTitle: string;
    recentDrawsIntro: string;
  };
  remember: {
    title: string;
    items: string[];
    p1: string;
  };
  conclusion: {
    title: string;
    p1: string;
    /** RichText: links to the results home page. */
    p2: string;
    /** Rendered bold. */
    closing: string;
  };
}
