import type { Metadata } from "next";
import NewsFeedClient from "@/components/articles/NewsFeedClient";
import { ARTICLE_SUMMARY_FIELDS, ArticleSummary, SITE_URL, fetchPublishedArticles, getArticleUrl } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

// Admin saves call revalidatePath("/news"); the timer also publishes scheduled posts.
export const revalidate = 300;

const PAGE_URL = `${SITE_URL}/news`;

export const metadata: Metadata = {
  title: "Kerala Lottery News, Newsletter & Updates",
  description:
    "Latest Kerala lottery news, bumper announcements, prize claim guides, safety tips and the weekly Kerala lottery newsletter.",
  keywords: ["Kerala lottery news", "Kerala lottery newsletter", "Kerala bumper lottery update", "Kerala lottery claim tips"],
  alternates: {
    canonical: PAGE_URL,
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: "Kerala Lottery News, Newsletter & Updates",
    description: "Bumper announcements, claim guides and weekly Kerala lottery round-ups.",
    url: PAGE_URL,
    siteName: "Kerala Lottery Results Today",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Kerala Lottery News & Newsletter" },
};

const fetchFeatured = async (): Promise<ArticleSummary | null> => {
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
    console.error("[news] featured fetch failed:", err instanceof Error ? err.message : err);
    return null;
  }
};

export default async function NewsPage() {
  const [{ articles, total, error }, pinned] = await Promise.all([fetchPublishedArticles({ page: 0 }), fetchFeatured()]);
  // No featured post chosen → newest article is the hero.
  const featured = pinned ?? articles[0] ?? null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: PAGE_URL },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kerala Lottery News & Newsletter",
    url: PAGE_URL,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "Kerala Lottery Results Today", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((a, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: getArticleUrl(a.slug),
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
      <NewsFeedClient
        initialArticles={articles}
        initialTotal={total}
        featured={featured}
        initialError={error ? "We couldn't load articles right now. Please try again." : undefined}
      />
    </>
  );
}
