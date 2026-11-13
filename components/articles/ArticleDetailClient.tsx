"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArticleContent from "./ArticleContent";
import ReadingProgress from "./ReadingProgress";
import PostDetailLayout from "@/components/posts/PostDetailLayout";
import PostCard from "@/components/posts/PostCard";
import SeeAllPostsTile from "@/components/posts/SeeAllPostsTile";
import { POSTS_PATH, articleToPostCard } from "@/lib/posts";
import { Article, ArticleSummary, formatArticleDate, getCategoryMeta } from "@/lib/articles";
import { extractToc, parseMarkdown } from "@/lib/articleMarkdown";
import { FOUNDER, isFounderAuthor } from "@/lib/siteAuthor";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

interface ArticleDetailClientProps {
  article: Article;
  related: ArticleSummary[];
}

const VIEWED_KEY = "viewed_articles";
const ARTICLE_ID = "article-body";
/** Max "More articles" cards; keep in sync with RELATED_ARTICLE_LIMIT in app/news/[slug]/page.tsx. */
const RELATED_LIMIT = 6;

/** Counts one view per browser session (best-effort; never blocks rendering). */
const recordView = async (slug: string) => {
  try {
    const viewed: string[] = JSON.parse(sessionStorage.getItem(VIEWED_KEY) ?? "[]");
    if (viewed.includes(slug)) return;
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed, slug].slice(-50)));
  } catch (err: unknown) {
    console.warn("[article] sessionStorage unavailable:", err instanceof Error ? err.message : String(err));
  }
  try {
    const { error } = await supabase.rpc("increment_article_view", { p_slug: slug });
    if (error) throw error;
  } catch (err: unknown) {
    console.warn("[article] view count failed:", err instanceof Error ? err.message : String(err));
  }
};

/**
 * Admin-published article (/news/{slug}) rendered in the same detail design as the
 * editorial guides: dark header, sticky table of contents, ticket-checker card, FAQ, author bio.
 */
export default function ArticleDetailClient({ article, related }: ArticleDetailClientProps) {
  const byFounder = isFounderAuthor(article.author_name);
  const toc = useMemo(
    () =>
      extractToc(parseMarkdown(article.content))
        .filter(({ level }) => level <= 3)
        .map(({ id, text, level }) => ({ id, title: text, level })),
    [article.content],
  );

  useEffect(() => {
    recordView(article.slug);
    trackEvent({ name: "article_view", params: { slug: article.slug, category: article.category } });
  }, [article.slug, article.category]);

  const tags =
    article.tags.length > 0 ? (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 5 }}>
        {article.tags.map((tag) => (
          <Box
            key={tag}
            component="span"
            sx={{ px: 1.25, py: 0.5, borderRadius: "999px", border: "1px solid #E2E8F0", color: "#475569", fontWeight: 600, fontSize: "0.8rem" }}
          >
            #{tag}
          </Box>
        ))}
      </Box>
    ) : null;

  const moreArticles = (
    <Box component="section" aria-labelledby="related-heading" sx={{ mt: { xs: 6, md: 8 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
        <Typography id="related-heading" component="h2" sx={{ fontWeight: 900, color: "#0B3C5D", fontSize: { xs: "1.3rem", md: "1.55rem" } }}>
          {related.length > 0 ? "More articles" : "Explore more"}
        </Typography>
        <Button
          component={Link}
          href={POSTS_PATH}
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", color: "#0B3C5D", bgcolor: "#EBF5FF", px: 2, "&:hover": { bgcolor: "#DBEAFE" } }}
        >
          View all
        </Button>
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          p: 0,
          m: 0,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
          "& > li": { display: "flex" },
          "& > li > *": { flex: 1 },
        }}
      >
        {related.map((item) => (
          <li key={item.id}>
            <PostCard post={articleToPostCard(item)} />
          </li>
        ))}
        {related.length < RELATED_LIMIT && (
          <li>
            <SeeAllPostsTile />
          </li>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <ReadingProgress targetId={ARTICLE_ID} />
      <PostDetailLayout
        title={article.title}
        description={article.excerpt}
        categoryLabel={getCategoryMeta(article.category).label}
        readMinutes={article.reading_minutes}
        publishedLabel={formatArticleDate(article.published_at)}
        publishedIso={article.published_at ?? undefined}
        author={{
          name: article.author_name,
          role: byFounder ? FOUNDER.role : "Contributor",
          avatar: byFounder ? FOUNDER.avatar : undefined,
        }}
        toc={toc}
        faqs={article.faqs}
        authorBioLabel={byFounder ? "Written by" : "Reviewed by"}
        reviewedDate={article.updated_at}
        kindLabel="Article"
        coverImage={article.cover_image_url ? { src: article.cover_image_url, alt: article.cover_image_alt ?? article.title } : undefined}
        bodyId={ARTICLE_ID}
        afterBody={tags}
        footer={moreArticles}
      >
        <ArticleContent markdown={article.content} />
      </PostDetailLayout>
    </>
  );
}
