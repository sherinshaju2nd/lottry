import { supabase } from "./supabase";

/**
 * Articles feed (table `public.articles`, see
 * supabase/migrations/20261107000000_articles_newsletter.sql).
 * Public reads use the anon client (RLS only exposes published posts);
 * writes go through /api/admin/articles with the service-role client.
 *
 * Mirrored for the mobile app in mobile/src/api/articlesApi.ts — keep types in sync.
 */

export const SITE_URL = "https://www.keralalotteryresultstoday.in";
export const NEWS_BASE_PATH = "/news";

export const ARTICLE_CATEGORIES = [
  { value: "news", label: "Lottery News", color: "#0B3C5D", bg: "#EBF5FF" },
  { value: "guide", label: "Guides", color: "#047857", bg: "#ECFDF5" },
  { value: "tips", label: "Tips & Safety", color: "#B45309", bg: "#FFFBEB" },
  { value: "announcement", label: "Announcements", color: "#BE123C", bg: "#FFF1F2" },
  { value: "bumper", label: "Bumper Updates", color: "#C2410C", bg: "#FFF7ED" },
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]["value"];
export type ArticleStatus = "draft" | "published";

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: ArticleCategory;
  tags: string[];
  author_name: string;
  status: ArticleStatus;
  is_featured: boolean;
  published_at: string | null;
  reading_minutes: number;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  noindex: boolean;
  faqs: ArticleFaq[];
  created_at: string;
  updated_at: string;
}

/** Fields needed for feed cards (no `content`, keeps egress low). */
export type ArticleSummary = Pick<
  Article,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image_url"
  | "cover_image_alt"
  | "category"
  | "tags"
  | "author_name"
  | "is_featured"
  | "published_at"
  | "reading_minutes"
  | "updated_at"
>;

export const ARTICLE_SUMMARY_FIELDS =
  "id,slug,title,excerpt,cover_image_url,cover_image_alt,category,tags,author_name,is_featured,published_at,reading_minutes,updated_at";

export const ARTICLE_PAGE_SIZE = 12;

// ---------------------------------------------------------------------------------------------
// Pure helpers (shared by admin, web pages and API)
// ---------------------------------------------------------------------------------------------

export const getCategoryMeta = (category: string) =>
  ARTICLE_CATEGORIES.find(({ value }) => value === category) ?? ARTICLE_CATEGORIES[0];

export const isArticleCategory = (value: unknown): value is ArticleCategory =>
  typeof value === "string" && ARTICLE_CATEGORIES.some((c) => c.value === value);

export const slugify = (input: string): string =>
  input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");

export const isValidSlug = (slug: string): boolean =>
  /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 120;

/** Plain-text version of the Markdown body (for word counts, descriptions, RSS). */
export const markdownToPlainText = (markdown: string): string =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const countWords = (markdown: string): number => {
  const text = markdownToPlainText(markdown);
  return text ? text.split(" ").length : 0;
};

export const estimateReadingMinutes = (markdown: string): number =>
  Math.max(1, Math.round(countWords(markdown) / 200));

export const getArticlePath = (slug: string): string => `${NEWS_BASE_PATH}/${slug}`;
export const getArticleUrl = (slug: string): string => `${SITE_URL}${getArticlePath(slug)}`;

/** Absolute URL for an image stored either as absolute https URL or site-relative path. */
export const toAbsoluteUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (/^https:\/\//i.test(url)) return url;
  return url.startsWith("/") ? `${SITE_URL}${url}` : undefined;
};

export const isSafeHttpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const formatArticleDate = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

export const isArticleLive = (article: Pick<Article, "status" | "published_at">): boolean =>
  article.status === "published" &&
  Boolean(article.published_at) &&
  new Date(article.published_at ?? "").getTime() <= Date.now();

const normalizeFaqs = (raw: unknown): ArticleFaq[] =>
  Array.isArray(raw)
    ? raw
        .filter(
          (f): f is ArticleFaq =>
            typeof f?.question === "string" && typeof f?.answer === "string",
        )
        .map(({ question, answer }) => ({ question, answer }))
    : [];

export const normalizeArticle = (row: Record<string, unknown>): Article =>
  ({
    ...(row as unknown as Article),
    tags: Array.isArray(row?.tags) ? (row.tags as string[]) : [],
    faqs: normalizeFaqs(row?.faqs),
  }) as Article;

// ---------------------------------------------------------------------------------------------
// Public reads (anon client, RLS = published only)
// ---------------------------------------------------------------------------------------------

export interface ArticleListOptions {
  category?: ArticleCategory | "all";
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ArticleListResult {
  articles: ArticleSummary[];
  total: number;
  error?: string;
}

/** Escapes a value for PostgREST `ilike` inside an `or()` filter. */
const escapeIlike = (value: string): string => value.replace(/[%_,()\\]/g, " ").trim();

export const fetchPublishedArticles = async ({
  category = "all",
  page = 0,
  pageSize = ARTICLE_PAGE_SIZE,
  search = "",
}: ArticleListOptions = {}): Promise<ArticleListResult> => {
  try {
    const from = page * pageSize;
    let query = supabase
      .from("articles")
      .select(ARTICLE_SUMMARY_FIELDS, { count: "exact" })
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (category !== "all") query = query.eq("category", category);
    const term = escapeIlike(search).slice(0, 80);
    if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { articles: (data ?? []) as ArticleSummary[], total: count ?? 0 };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    console.error("[articles] fetchPublishedArticles failed:", message);
    return { articles: [], total: 0, error: message };
  }
};

/** Newest published article pinned as featured in the admin (null when none or on error). */
export const fetchFeaturedArticle = async (): Promise<ArticleSummary | null> => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_SUMMARY_FIELDS)
      .eq("status", "published")
      .eq("is_featured", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as ArticleSummary | null) ?? null;
  } catch (err: unknown) {
    console.error("[articles] fetchFeaturedArticle failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
  if (!isValidSlug(slug)) return null;
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeArticle(data) : null;
  } catch (err: unknown) {
    console.error("[articles] fetchArticleBySlug failed:", err instanceof Error ? err.message : err);
    return null;
  }
};

export const fetchRelatedArticles = async (
  article: Pick<Article, "id" | "category">,
  limit = 3,
): Promise<ArticleSummary[]> => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_SUMMARY_FIELDS)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(12);
    if (error) throw error;
    const rows = (data ?? []) as ArticleSummary[];
    // Same category first, then newest
    return [...rows]
      .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
      .slice(0, limit);
  } catch (err: unknown) {
    console.error("[articles] fetchRelatedArticles failed:", err instanceof Error ? err.message : err);
    return [];
  }
};

/** Lightweight list for sitemap / RSS (indexable posts only). */
export const fetchArticlesForSitemap = async (): Promise<
  Pick<Article, "slug" | "title" | "excerpt" | "category" | "published_at" | "updated_at">[]
> => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("slug,title,excerpt,category,published_at,updated_at")
      .eq("status", "published")
      .eq("noindex", false)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data ?? [];
  } catch (err: unknown) {
    console.error("[articles] fetchArticlesForSitemap failed:", err instanceof Error ? err.message : err);
    return [];
  }
};
