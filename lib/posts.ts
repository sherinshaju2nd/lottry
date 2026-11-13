import { getBlogPath, type BlogPost } from "@/data/blogs";
import {
  ARTICLE_CATEGORIES,
  SITE_URL,
  getArticlePath,
  getCategoryMeta,
  type ArticleCategory,
  type ArticleSummary,
} from "@/lib/articles";
import { FOUNDER, isFounderAuthor } from "@/lib/siteAuthor";

/**
 * Unified "Articles & News" feed: static editorial guides (data/blogs.ts, served at /{slug})
 * and admin-published articles (Supabase `articles`, served at /news/{slug}) rendered as one
 * list at /blog. Post URLs stay where they are; only the listing is shared.
 */

export const POSTS_PATH = "/blog";
export const POSTS_URL = `${SITE_URL}${POSTS_PATH}`;
export const POSTS_TITLE = "Articles & News";

export type PostKind = "guide" | "article";
export type PostFilter = ArticleCategory | "all";

export interface PostCardItem {
  id: string;
  kind: PostKind;
  href: string;
  title: string;
  description: string;
  /** Full ISO timestamp, used for sorting and <time dateTime>. */
  publishedAt: string;
  category: ArticleCategory;
  categoryLabel: string;
  /** Site-relative .jpg (guides, has a .webp twin) or absolute URL (admin uploads). */
  coverImage?: string;
  coverAlt: string;
  readMinutes: number;
  featured: boolean;
  authorName: string;
  authorAvatar?: string;
  /** Lower-cased text used for client-side search of guides. */
  searchText: string;
}

/** Filter tabs shown on the merged page (same categories the admin uses for articles). */
export const POST_FILTERS: { value: PostFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...ARTICLE_CATEGORIES.map(({ value, label }) => ({ value, label })),
];

/** Guide categories (free text in data/blogs.ts) → shared article categories. */
const GUIDE_CATEGORY_MAP: Record<string, ArticleCategory> = {
  "Bumper Guide": "bumper",
  "Claim Guide": "guide",
};

const parseReadMinutes = (readTime: string): number => Number.parseInt(readTime, 10) || 5;

export const guideToPostCard = (post: BlogPost): PostCardItem => {
  const category = GUIDE_CATEGORY_MAP[post.category] ?? "guide";
  return {
    id: `guide:${post.slug}`,
    kind: "guide",
    href: getBlogPath(post.slug),
    title: post.title,
    description: post.description,
    publishedAt: `${post.publishedDate}T09:00:00+05:30`,
    category,
    categoryLabel: getCategoryMeta(category).label,
    coverImage: post.coverImage,
    coverAlt: post.title,
    readMinutes: parseReadMinutes(post.readTime),
    featured: post.featured,
    authorName: post.author.name,
    authorAvatar: post.author.avatar,
    searchText: `${post.title} ${post.description} ${post.category}`.toLowerCase(),
  };
};

export const articleToPostCard = (article: ArticleSummary): PostCardItem => ({
  id: `article:${article.id}`,
  kind: "article",
  href: getArticlePath(article.slug),
  title: article.title,
  description: article.excerpt,
  publishedAt: article.published_at ?? article.updated_at,
  category: article.category,
  categoryLabel: getCategoryMeta(article.category).label,
  coverImage: article.cover_image_url ?? undefined,
  coverAlt: article.cover_image_alt ?? article.title,
  readMinutes: article.reading_minutes,
  featured: article.is_featured,
  authorName: article.author_name,
  authorAvatar: isFounderAuthor(article.author_name) ? FOUNDER.avatar : undefined,
  searchText: `${article.title} ${article.excerpt}`.toLowerCase(),
});

const timeOf = (item: PostCardItem): number => Date.parse(item.publishedAt) || 0;

export const sortPostsNewestFirst = (items: PostCardItem[]): PostCardItem[] =>
  [...items].sort((a, b) => timeOf(b) - timeOf(a));

/** Client-side filter for static guides (articles are filtered by the database query). */
export const filterGuides = (guides: PostCardItem[], filter: PostFilter, search: string): PostCardItem[] => {
  const term = search.trim().toLowerCase();
  return guides.filter(
    (guide) => (filter === "all" || guide.category === filter) && (!term || guide.searchText.includes(term)),
  );
};

/**
 * Merges guides with the article pages loaded so far, newest first. While older article
 * pages are still unloaded, guides older than the oldest loaded article are held back so
 * "Load more" appends in date order instead of reshuffling cards already on screen.
 */
export const mergePostFeed = ({
  guides,
  articles,
  hasMoreArticles,
}: {
  guides: PostCardItem[];
  articles: PostCardItem[];
  hasMoreArticles: boolean;
}): PostCardItem[] => {
  const oldestArticle = articles.at(-1);
  const visibleGuides =
    hasMoreArticles && oldestArticle ? guides.filter((guide) => timeOf(guide) >= timeOf(oldestArticle)) : guides;
  return sortPostsNewestFirst([...visibleGuides, ...articles]);
};

/** Featured slot: a pinned article wins, then the featured guide, then the newest post. */
export const pickFeaturedPost = (
  pinnedArticle: PostCardItem | null,
  guides: PostCardItem[],
  feed: PostCardItem[],
): PostCardItem | null => pinnedArticle ?? guides.find(({ featured }) => featured) ?? feed[0] ?? null;
