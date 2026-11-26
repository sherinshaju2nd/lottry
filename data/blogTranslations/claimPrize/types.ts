import type { BlogTranslationMeta, LabeledItem, SplitText } from "../types";

/** Every visible string of the "How to Claim Kerala Lottery Prize" article body. */
export interface ClaimPrizeCopy {
  intro: string;
  /** Intro sentence with the "Kerala lottery results today" link. */
  introLinked: SplitText;
  afterWinning: {
    title: string;
    p1: string;
    checkHeading: string;
    checks: LabeledItem[];
    p2: string;
  };
  howToClaim: {
    title: string;
    p1: string;
    steps: { title: string; desc: string }[];
    tip: string;
  };
  claimProcess: { title: string; paragraphs: string[] };
  documents: {
    title: string;
    p1: string;
    items: LabeledItem[];
    p2: string;
  };
  prizeMoney: {
    title: string;
    paragraphs: string[];
    warningTitle: string;
    warning: string;
  };
  whereToClaim: {
    title: string;
    p1: string;
    matrixTitle: string;
    /** Exactly three tiers: up to ₹5,000 · ₹5,001–₹1,00,000 · above ₹1,00,000. */
    tiers: LabeledItem[];
    p2: string;
  };
  deadline: {
    title: string;
    p1: string;
    boxTitle: string;
    /** Highlight is rendered bold ("30 days"). */
    box: SplitText;
    p2: string;
  };
  safety: {
    title: string;
    p1: string;
    rulesTitle: string;
    rules: LabeledItem[];
  };
  verification: { title: string; paragraphs: string[] };
  categories: { title: string; paragraphs: string[] };
  checklist: {
    title: string;
    p1: string;
    items: LabeledItem[];
    p2: string;
    /** Closing sentence with the "Kerala lottery results today" link. */
    closingLinked: SplitText;
  };
}

export interface ClaimPrizeTranslation {
  meta: BlogTranslationMeta;
  copy: ClaimPrizeCopy;
}
