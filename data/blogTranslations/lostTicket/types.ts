import type { LabeledItem } from "../types";

/**
 * Every visible string of the "What Happens If You Lose Your Kerala Lottery Ticket?" article body.
 * Strings marked "rich" use RichText markup (`**bold**`, `[text](/path)`, `[text](guide:slug)`).
 */
export interface LostTicketCopy {
  /** Three intro paragraphs (the first is the lead). */
  intro: string[];
  whatHappens: {
    title: string;
    p1: string;
    p2: string;
    callout: string;
    /** Rich: links "Kerala lottery result" to the results home page. */
    p3: string;
  };
  canStillClaim: { title: string; paragraphs: string[] };
  whatToDo: {
    title: string;
    p1: string;
    /** Exactly five numbered steps. */
    steps: { title: string; desc: string }[];
    p2: string;
  };
  claimWithoutTicket: { title: string; paragraphs: string[]; callout: string };
  photocopy: {
    title: string;
    paragraphs: string[];
    /** Exactly five rows, in order: original ticket (accepted), photocopy, photo/screenshot, remembered number/PDF, police complaint. */
    proofs: { item: string; note: string }[];
  };
  claimRules: {
    title: string;
    p1: string;
    rules: LabeledItem[];
    /** Rich: links to the prize claim guide. */
    callout: string;
  };
  protectTicket: {
    title: string;
    p1: string;
    /** Rendered as "<strong>label</strong> text" (label includes its colon). */
    tips: LabeledItem[];
    callout: string;
  };
  conclusion: { title: string; paragraphs: string[] };
}
