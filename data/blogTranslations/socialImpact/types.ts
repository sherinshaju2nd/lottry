/**
 * Every visible string of "The Social Impact of Kerala Lotteries on Healthcare and Public Welfare".
 * Strings marked "rich" use RichText markup (`**bold**`, `[text](/path)`, `[text](guide:slug)`).
 */
export interface SocialImpactCopy {
  /** Rich. */
  lead: string;
  quickAnswer: {
    title: string;
    /** Rich (bold phrases). */
    callout: string;
  };
  publicWelfare: {
    title: string;
    /** Rich (agent commission guide link). */
    intro: string;
    /** Five items. */
    items: string[];
  };
  karunyaFund: {
    title: string;
    intro: string;
    /** Five condition chips. */
    conditions: string[];
    /** Rich (Karunya / Karunya Plus links). */
    p2: string;
  };
  medicalExpenses: { title: string; p: string };
  employment: {
    title: string;
    intro: string;
    /** Five items. */
    items: string[];
    p2: string;
  };
  revenue: {
    title: string;
    intro: string;
    /** Five items. */
    items: string[];
    cagIntro: string;
    /** Exactly three figures, in order: receipts · expenditure · net receipt. */
    cagFigures: { label: string; value: string }[];
    p2: string;
  };
  weakerSections: { title: string; p: string };
  responsiblePlay: {
    title: string;
    intro: string;
    /** Seven items. */
    items: string[];
    /** Rich (minimum-age and online-sales guide links). */
    p2: string;
  };
  transparency: { title: string; p: string };
  widerImportance: {
    title: string;
    /** Rich (tax guide link). */
    p: string;
  };
  conclusion: {
    title: string;
    /** Rich (results home link). */
    p: string;
  };
}
