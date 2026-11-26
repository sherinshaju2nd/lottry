/** Shared shapes for translated blog guides (data/blogTranslations/**). */

export type BlogLanguage = "en" | "ml" | "hi" | "ta" | "te";

export interface BlogLanguageInfo {
  /** BCP 47 tag used for hreflang, `lang` and JSON-LD inLanguage. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** Language name written in its own script (e.g. "മലയാളം"). */
  nativeName: string;
  englishName: string;
}

export const BLOG_LANGUAGES: Record<BlogLanguage, BlogLanguageInfo> = {
  en: { hreflang: "en-IN", ogLocale: "en_IN", nativeName: "English", englishName: "English" },
  ml: { hreflang: "ml-IN", ogLocale: "ml_IN", nativeName: "മലയാളം", englishName: "Malayalam" },
  hi: { hreflang: "hi-IN", ogLocale: "hi_IN", nativeName: "हिन्दी", englishName: "Hindi" },
  ta: { hreflang: "ta-IN", ogLocale: "ta_IN", nativeName: "தமிழ்", englishName: "Tamil" },
  te: { hreflang: "te-IN", ogLocale: "te_IN", nativeName: "తెలుగు", englishName: "Telugu" },
};

/** One guide in one language: post-level fields plus the article-body copy. */
export interface GuideTranslation<Copy> {
  meta: BlogTranslationMeta;
  copy: Copy;
}

/** A guide's translations, keyed by language (English lives in data/blogs.ts + the guide's en.ts). */
export type GuideTranslations<Copy> = Record<Exclude<BlogLanguage, "en">, GuideTranslation<Copy>>;

/** Copy for a language, or undefined for English (components then fall back to their en.ts default). */
export const pickCopy = <Copy,>(translations: GuideTranslations<Copy>, language: BlogLanguage): Copy | undefined =>
  language === "en" ? undefined : translations[language].copy;

/** Bold lead-in followed by plain text, e.g. "<strong>PAN Card</strong> Mandatory for TDS". */
export interface LabeledItem {
  label: string;
  text: string;
}

/** Sentence with one highlighted part (a link or bold phrase) in the middle. */
export interface SplitText {
  before: string;
  highlight: string;
  after: string;
}

/** Post-level fields (title, SEO, TOC, FAQs) for a translated guide. */
export interface BlogTranslationMeta {
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  tags: string[];
  readTime: string;
  coverAlt: string;
  /** TOC titles keyed by the section id used in the English post. */
  tocTitles: Record<string, string>;
  faqs: { question: string; answer: string }[];
  /** Label above the language switcher, e.g. "Read this guide in:". */
  switcherLabel: string;
}
