import { countWords, markdownToPlainText } from "./articles";

/**
 * On-page SEO / AEO checklist shown live in the admin article editor
 * (agentic-seo skill: title & description length, keyword placement, headings,
 * image alt text, internal links, FAQ schema for answer engines).
 */

export interface SeoInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  coverImageUrl: string;
  coverImageAlt: string;
  faqCount: number;
  tags: string[];
}

export interface SeoCheck {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
  weight: number;
}

export const SEO_LIMITS = {
  metaTitleMin: 30,
  metaTitleMax: 60,
  metaDescriptionMin: 120,
  metaDescriptionMax: 160,
  minWords: 300,
} as const;

const includesKeyword = (text: string, keyword: string): boolean =>
  Boolean(keyword) && text.toLowerCase().includes(keyword.toLowerCase());

export const effectiveMetaTitle = ({ metaTitle, title }: Pick<SeoInput, "metaTitle" | "title">): string =>
  (metaTitle || title).trim();

export const effectiveMetaDescription = ({
  metaDescription,
  excerpt,
}: Pick<SeoInput, "metaDescription" | "excerpt">): string => (metaDescription || excerpt).trim();

export const evaluateSeo = (input: SeoInput): { score: number; checks: SeoCheck[] } => {
  const keyword = input.focusKeyword.trim();
  const metaTitle = effectiveMetaTitle(input);
  const metaDescription = effectiveMetaDescription(input);
  const words = countWords(input.content);
  const firstParagraph = markdownToPlainText(input.content.split(/\n\s*\n/)[0] ?? "").slice(0, 300);
  const subheadings = (input.content.match(/^#{1,3}\s+.+$/gm) ?? []).length;
  const internalLinks = (input.content.match(/\]\((\/|https:\/\/www\.keralalotteryresultstoday\.in)/g) ?? []).length;
  const imagesWithoutAlt = (input.content.match(/!\[\s*\]\(/g) ?? []).length;

  const checks: SeoCheck[] = [
    {
      id: "keyword",
      label: "Focus keyword set",
      passed: keyword.length >= 3,
      hint: "Pick the main search phrase, e.g. “Karunya lottery result”.",
      weight: 10,
    },
    {
      id: "title-length",
      label: `SEO title ${SEO_LIMITS.metaTitleMin}–${SEO_LIMITS.metaTitleMax} characters (${metaTitle.length})`,
      passed: metaTitle.length >= SEO_LIMITS.metaTitleMin && metaTitle.length <= SEO_LIMITS.metaTitleMax,
      hint: "Google truncates titles longer than ~60 characters.",
      weight: 12,
    },
    {
      id: "title-keyword",
      label: "Keyword in SEO title",
      passed: includesKeyword(metaTitle, keyword),
      hint: "Put the focus keyword near the start of the title.",
      weight: 12,
    },
    {
      id: "desc-length",
      label: `Meta description ${SEO_LIMITS.metaDescriptionMin}–${SEO_LIMITS.metaDescriptionMax} characters (${metaDescription.length})`,
      passed:
        metaDescription.length >= SEO_LIMITS.metaDescriptionMin &&
        metaDescription.length <= SEO_LIMITS.metaDescriptionMax,
      hint: "A compelling 1–2 sentence summary improves click-through.",
      weight: 10,
    },
    {
      id: "desc-keyword",
      label: "Keyword in meta description",
      passed: includesKeyword(metaDescription, keyword),
      hint: "Search engines bold matching words in the snippet.",
      weight: 8,
    },
    {
      id: "slug-keyword",
      label: "Keyword in URL slug",
      passed: Boolean(keyword) && input.slug.includes(keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
      hint: "Short, keyword-rich slugs rank and share better.",
      weight: 8,
    },
    {
      id: "intro-keyword",
      label: "Keyword in the first paragraph",
      passed: includesKeyword(firstParagraph, keyword),
      hint: "Answer engines quote the opening — state the topic immediately.",
      weight: 8,
    },
    {
      id: "length",
      label: `At least ${SEO_LIMITS.minWords} words (${words})`,
      passed: words >= SEO_LIMITS.minWords,
      hint: "Thin pages rarely rank; cover the topic fully.",
      weight: 10,
    },
    {
      id: "headings",
      label: "Uses subheadings (##)",
      passed: subheadings >= 2,
      hint: "Break content into scannable sections.",
      weight: 6,
    },
    {
      id: "cover",
      label: "Cover image with alt text",
      passed: Boolean(input.coverImageUrl) && input.coverImageAlt.trim().length >= 5,
      hint: "Used for social previews and Google Discover.",
      weight: 6,
    },
    {
      id: "image-alt",
      label: "All inline images have alt text",
      passed: imagesWithoutAlt === 0,
      hint: "Write ![description](url) — alt text helps accessibility and image search.",
      weight: 3,
    },
    {
      id: "internal-links",
      label: "Links to other pages on this site",
      passed: internalLinks >= 1,
      hint: "Link to a result page, /search or another guide, e.g. [check results](/search).",
      weight: 4,
    },
    {
      id: "faq",
      label: "FAQ added (rich results / AEO)",
      passed: input.faqCount >= 2,
      hint: "2+ FAQs generate FAQPage schema used by Google & AI answer engines.",
      weight: 3,
    },
  ];

  const total = checks.reduce((sum, { weight }) => sum + weight, 0);
  const earned = checks.reduce((sum, { weight, passed }) => sum + (passed ? weight : 0), 0);
  return { score: Math.round((earned / total) * 100), checks };
};
