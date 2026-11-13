import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import ArticleDetailClient from "@/components/articles/ArticleDetailClient";
import { founderPersonSchema, isFounderAuthor } from "@/lib/siteAuthor";
import {
  SITE_URL,
  fetchArticleBySlug,
  fetchArticlesForSitemap,
  fetchRelatedArticles,
  getArticleUrl,
  getCategoryMeta,
  toAbsoluteUrl,
} from "@/lib/articles";

// Admin saves call revalidatePath(`/news/${slug}`); new slugs render on first request.
export const revalidate = 300;
export const dynamicParams = true;

/** "More articles" grid size (2 rows of 3 on desktop). */
const RELATED_ARTICLE_LIMIT = 6;

interface Props {
  params: Promise<{ slug: string }>;
}

/** De-duplicates the article query between generateMetadata and the page render. */
const loadArticle = cache(async (slug: string) => fetchArticleBySlug(slug));

export async function generateStaticParams() {
  const articles = await fetchArticlesForSitemap();
  return articles.slice(0, 50).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) return { title: "Article Not Found", robots: { index: false } };

  const url = article.canonical_url ?? getArticleUrl(article.slug);
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt || undefined;
  const image = toAbsoluteUrl(article.og_image_url ?? article.cover_image_url) ?? `${SITE_URL}/logo-master-1024.png`;

  return {
    title,
    description,
    keywords: [...(article.focus_keyword ? [article.focus_keyword] : []), ...article.tags],
    authors: [{ name: article.author_name }],
    alternates: { canonical: url },
    robots: article.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      title,
      description,
      url,
      siteName: "Kerala Lottery Results Today",
      type: "article",
      locale: "en_IN",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      authors: [article.author_name],
      section: getCategoryMeta(article.category).label,
      tags: article.tags,
      images: [{ url: image, width: 1200, height: 630, alt: article.cover_image_alt ?? article.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();

  const related = await fetchRelatedArticles(article, RELATED_ARTICLE_LIMIT);
  const url = getArticleUrl(article.slug);
  const image = toAbsoluteUrl(article.og_image_url ?? article.cover_image_url) ?? `${SITE_URL}/logo-master-1024.png`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": article.category === "news" || article.category === "announcement" ? "NewsArticle" : "BlogPosting",
    headline: article.title.slice(0, 110),
    description: article.meta_description || article.excerpt,
    url,
    image: [image],
    datePublished: article.published_at,
    dateModified: article.updated_at,
    articleSection: getCategoryMeta(article.category).label,
    keywords: [article.focus_keyword, ...article.tags].filter(Boolean).join(", "),
    wordCount: article.content.split(/\s+/).filter(Boolean).length,
    inLanguage: "en-IN",
    author: isFounderAuthor(article.author_name)
      ? founderPersonSchema
      : { "@type": "Organization", name: article.author_name, url: SITE_URL },
    editor: founderPersonSchema,
    publisher: {
      "@type": "Organization",
      name: "Kerala Lottery Results Today",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-master-1024.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "#quick-answer"] },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  const faqSchema =
    article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema)} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />}
      <ArticleDetailClient article={article} related={related} />
    </>
  );
}
