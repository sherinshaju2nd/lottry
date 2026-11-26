import type { LabeledItem } from "../types";

/**
 * Every visible string of the "How to Surrender a Kerala Lottery Winning Ticket Through Bank" article body.
 * Strings marked "RichText" may contain `**bold**` and `[text](href)` markers (see components/blog/RichText.tsx).
 */
export interface BankSurrenderCopy {
  lead: string;
  intro: string;
  verifyTicket: {
    title: string;
    p1: string;
    checks: string[];
    /** RichText: contains the "Kerala lottery results today" link to "/". */
    p2: string;
  };
  eligibleBank: {
    title: string;
    p1: string;
    /** Exactly four bank categories, rendered as tiles. */
    banks: string[];
    callout: string;
  };
  documents: {
    title: string;
    /** RichText: contains the claim-documents checklist guide link. */
    p1: string;
    /** Rendered as numbered cards: "<n>. label" over text. */
    items: LabeledItem[];
    p2: string;
  };
  formV: {
    title: string;
    p1: string;
    fields: string[];
    warning: string;
  };
  reverseSide: {
    title: string;
    paragraphs: string[];
  };
  submitAtBank: {
    title: string;
    p1: string;
    steps: { title: string; desc: string }[];
    callout: string;
  };
  verification: {
    title: string;
    p1: string;
    checks: string[];
    p2: string;
  };
  receiveMoney: {
    title: string;
    p1: string;
    /** RichText: contains the TDS guide link. */
    p2: string;
  };
  deadline: {
    title: string;
    p1: string;
    /** Exactly three highlight tiles (big value + caption). */
    facts: { value: string; label: string }[];
    p2: string;
    recentDrawsTitle: string;
    recentDrawsIntro: string;
  };
  safety: {
    title: string;
    tips: string[];
    /** RichText: contains the fake-ticket guide link. */
    p1: string;
  };
  conclusion: {
    title: string;
    paragraphs: string[];
  };
}
