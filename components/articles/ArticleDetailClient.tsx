"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ArticleContent from "./ArticleContent";
import ArticleCard from "./ArticleCard";
import NewsletterSignup from "./NewsletterSignup";
import ShareButtons from "@/components/ShareButtons";
import { Article, ArticleSummary, formatArticleDate, getArticleUrl, getCategoryMeta } from "@/lib/articles";
import { extractToc, parseMarkdown } from "@/lib/articleMarkdown";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

interface ArticleDetailClientProps {
  article: Article;
  related: ArticleSummary[];
}

const VIEWED_KEY = "viewed_articles";

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

export default function ArticleDetailClient({ article, related }: ArticleDetailClientProps) {
  const category = getCategoryMeta(article.category);
  const toc = useMemo(() => extractToc(parseMarkdown(article.content)), [article.content]);
  const updatedLater =
    article.updated_at && article.published_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 86_400_000;

  useEffect(() => {
    recordView(article.slug);
    trackEvent({ name: "article_view", params: { slug: article.slug, category: article.category } });
  }, [article.slug, article.category]);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 12, md: 8 } }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
        <Box component="nav" aria-label="Breadcrumb" sx={{ fontSize: "0.85rem", color: "#64748B", mb: 2, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "none" }}>Home</Link>/
          <Link href="/news" style={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "none" }}>News</Link>/
          <Box component="span" aria-current="page" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: { xs: 200, sm: 420 } }}>
            {article.title}
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" } }}>
          {/* Main article */}
          <Box component="article" itemScope itemType="https://schema.org/NewsArticle" sx={{ bgcolor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <Box sx={{ p: { xs: 2.5, md: 5 }, pb: { xs: 2, md: 3 } }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip size="small" label={category.label} component={Link} href="/news" clickable sx={{ fontWeight: 800, bgcolor: category.bg, color: category.color }} />
                {article.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} size="small" label={`#${tag}`} sx={{ fontWeight: 600, bgcolor: "#F1F5F9", color: "#475569" }} />
                ))}
              </Box>

              <Typography component="h1" itemProp="headline" sx={{ fontWeight: 900, fontSize: { xs: "1.65rem", sm: "2rem", md: "2.5rem" }, lineHeight: 1.2, color: "#0F172A", letterSpacing: "-0.01em" }}>
                {article.title}
              </Typography>

              {article.excerpt && (
                <Typography id="quick-answer" sx={{ mt: 2, fontSize: { xs: "1.05rem", md: "1.2rem" }, color: "#475569", lineHeight: 1.65 }}>
                  {article.excerpt}
                </Typography>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 2.5, color: "#64748B", fontSize: "0.9rem" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "#0B3C5D", color: "#FFF", display: "grid", placeItems: "center", fontWeight: 900 }}>
                    {article.author_name.charAt(0).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography itemProp="author" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.9rem" }}>{article.author_name}</Typography>
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      <time dateTime={article.published_at ?? undefined} itemProp="datePublished">{formatArticleDate(article.published_at)}</time>
                      {updatedLater && (
                        <> · Updated <time dateTime={article.updated_at} itemProp="dateModified">{formatArticleDate(article.updated_at)}</time></>
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} /> {article.reading_minutes} min read
                </Box>
              </Box>
            </Box>

            {article.cover_image_url && (
              <Box component="figure" sx={{ m: 0, px: { xs: 0, md: 5 } }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded remote images */}
                <img
                  src={article.cover_image_url}
                  alt={article.cover_image_alt ?? article.title}
                  fetchPriority="high"
                  itemProp="image"
                  style={{ width: "100%", aspectRatio: "1200 / 630", objectFit: "cover", display: "block", borderRadius: 16 }}
                />
              </Box>
            )}

            <Box sx={{ p: { xs: 2.5, md: 5 } }} itemProp="articleBody">
              <ArticleContent markdown={article.content} />

              {article.faqs.length > 0 && (
                <Box id="faqs" component="section" aria-labelledby="faq-heading" sx={{ mt: 5 }}>
                  <Typography id="faq-heading" component="h2" sx={{ fontWeight: 900, fontSize: { xs: "1.35rem", md: "1.6rem" }, mb: 2, color: "#0F172A" }}>
                    Frequently asked questions
                  </Typography>
                  {article.faqs.map((faq, idx) => (
                    <Accordion key={idx} disableGutters elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px !important", mb: 1.25, "&:before": { display: "none" } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography component="h3" sx={{ fontWeight: 800, color: "#0F172A" }}>{faq.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ color: "#475569", lineHeight: 1.7, whiteSpace: "pre-line" }}>{faq.answer}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5, color: "#0F172A" }}>Share this article</Typography>
                <ShareButtons title={article.title} text={article.excerpt || article.title} url={getArticleUrl(article.slug)} variant="inline" />
              </Box>

              <Box sx={{ mt: 4, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button component={Link} href="/news" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px" }}>
                  All news
                </Button>
                <Button component={Link} href="/search" startIcon={<SearchIcon />} variant="contained" sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", bgcolor: "#0B3C5D", "&:hover": { bgcolor: "#0F2C59" } }}>
                  Check your ticket
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Sidebar */}
          <Box component="aside" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {toc.length >= 2 && (
              <Box component="nav" aria-label="Table of contents" sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "18px", border: "1px solid #E2E8F0", position: { lg: "sticky" }, top: { lg: 96 } }}>
                <Typography sx={{ fontWeight: 900, mb: 1.5, color: "#0F172A" }}>In this article</Typography>
                <Box component="ol" sx={{ m: 0, pl: 2.25, display: "grid", gap: 1 }}>
                  {toc.map((item) => (
                    <Box component="li" key={item.id} sx={{ ml: item.level === 3 ? 1.5 : 0, fontSize: "0.9rem" }}>
                      <a href={`#${item.id}`} style={{ color: "#334155", textDecoration: "none", fontWeight: item.level === 2 ? 700 : 500 }}>{item.text}</a>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <NewsletterSignup compact />

            {related.length > 0 && (
              <Box component="section" aria-labelledby="related-heading">
                <Typography id="related-heading" component="h2" sx={{ fontWeight: 900, mb: 1.5, color: "#0F172A", fontSize: "1.1rem" }}>
                  Related articles
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  {related.map((item) => (
                    <ArticleCard key={item.id} article={item} variant="compact" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
