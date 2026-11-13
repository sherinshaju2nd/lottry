import type { Metadata } from "next";
import { getAllBlogs } from "@/data/blogs";
import PostsFeedClient from "@/components/posts/PostsFeedClient";
import { SITE_URL, fetchFeaturedArticle, fetchPublishedArticles } from "@/lib/articles";
import { POSTS_TITLE, POSTS_URL, articleToPostCard, guideToPostCard, mergePostFeed } from "@/lib/posts";

// Merged "Articles & News" listing. Admin article saves call revalidatePath("/blog");
// the timer also picks up scheduled articles once their publish time passes.
export const revalidate = 300;

const TITLE = `Kerala Lottery ${POSTS_TITLE} | Claim Guides, Bumper Updates & Tips`;
const DESCRIPTION =
  "Kerala lottery guides and news in one place: step-by-step prize claim instructions, bumper lottery updates, announcements, tax rules and anti-scam safety tips.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Kerala lottery news",
    "Kerala lottery blog",
    "How to claim Kerala lottery",
    "Kerala bumper lottery update",
    "Kerala lottery prize claim guide",
  ],
  alternates: {
    canonical: POSTS_URL,
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: POSTS_URL,
    siteName: "Kerala Lottery Results Today",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function ArticlesAndNewsPage() {
  const guides = getAllBlogs().map(guideToPostCard);
  const [{ articles, total, error }, pinned] = await Promise.all([
    fetchPublishedArticles({ page: 0 }),
    fetchFeaturedArticle(),
  ]);
  const articleCards = articles.map(articleToPostCard);
  const initialFeed = mergePostFeed({ guides, articles: articleCards, hasMoreArticles: articles.length < total });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: POSTS_TITLE, item: POSTS_URL },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Kerala Lottery ${POSTS_TITLE}`,
    url: POSTS_URL,
    description: DESCRIPTION,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "Kerala Lottery Results Today", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: initialFeed.map(({ href, title }, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}${href}`,
        name: title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, collectionSchema]).replace(/</g, "\\u003c") }}
      />
      <PostsFeedClient
        guides={guides}
        initialArticles={articleCards}
        initialArticleTotal={total}
        pinnedArticle={pinned ? articleToPostCard(pinned) : null}
        initialError={error}
      />
    </>
  );
}
