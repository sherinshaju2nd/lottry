import {
  getAllBlogs,
  getBlogBySlug,
  getBlogPath,
  getTranslatedSlug,
  parseBlogSlug,
  TRANSLATED_LANGUAGES,
  type BlogPost,
} from "@/data/blogs";
import type { BlogLanguage, BlogTranslationMeta } from "@/data/blogTranslations/types";
import { GUIDE_TRANSLATIONS } from "@/data/blogTranslations";

/**
 * Server-only access to every post page, translations included.
 * Kept apart from data/blogs.ts so translated text never ships in client bundles (Navbar, related posts).
 */

const translatePost = (source: BlogPost, language: BlogLanguage, meta: BlogTranslationMeta): BlogPost => {
  const { tocTitles, faqs, ...fields } = meta;
  const slug = getTranslatedSlug(source.slug, language);
  return {
    ...source,
    ...fields,
    slug,
    language,
    translationOf: source.slug,
    sourceCategory: source.category,
    featured: false,
    coverImage: `/blog/${slug}.jpg`,
    tableOfContents: source.tableOfContents.map(({ id, title }) => ({ id, title: tocTitles[id] ?? title })),
    faqs,
    // A sidebar CTA that points at another guide opens that guide in the same language.
    ...(source.primaryCta && { primaryCta: { ...source.primaryCta, href: localizeGuideHref(source.primaryCta.href, language) } }),
  };
};

const localizeGuideHref = (href: string, language: BlogLanguage): string => {
  const target = parseBlogSlug(href.replace(/^\//, ""));
  return target ? getBlogPath(getTranslatedSlug(target.sourceSlug, language)) : href;
};

const getTranslationMeta = (sourceSlug: string, language: BlogLanguage): BlogTranslationMeta | undefined =>
  language === "en" ? undefined : GUIDE_TRANSLATIONS[sourceSlug]?.[language]?.meta;

/** English original or translated page by its URL slug. */
export const getBlogPage = (slug: string): BlogPost | undefined => {
  const parsed = parseBlogSlug(slug);
  const source = parsed && getBlogBySlug(parsed.sourceSlug);
  if (!parsed || !source) return undefined;
  if (parsed.language === "en") return source;
  const meta = getTranslationMeta(source.slug, parsed.language);
  return meta ? translatePost(source, parsed.language, meta) : undefined;
};

/** Every routable post page (static params, sitemap, IndexNow). */
export const getAllBlogPages = (): BlogPost[] =>
  getAllBlogs().flatMap((source) => [
    source,
    ...TRANSLATED_LANGUAGES.flatMap((language) => {
      const meta = getTranslationMeta(source.slug, language);
      return meta ? [translatePost(source, language, meta)] : [];
    }),
  ]);

/** All language versions of a post that actually exist (English first), or [] when untranslated. */
export const getBlogTranslations = (post: BlogPost): BlogPost[] => {
  const sourceSlug = post.translationOf ?? post.slug;
  const group = getAllBlogPages().filter((page) => (page.translationOf ?? page.slug) === sourceSlug);
  return group.length > 1 ? group : [];
};
