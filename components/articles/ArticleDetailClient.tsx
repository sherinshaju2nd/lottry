"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import ArticleContent from "./ArticleContent";
import AuthorBio from "@/components/AuthorBio";
import { isFounderAuthor } from "@/lib/siteAuthor";
import ArticleCard from "./ArticleCard";
import ArticleShareBar from "./ArticleShareBar";
import SeeAllNewsTile from "./SeeAllNewsTile";
import ReadingProgress from "./ReadingProgress";
import { Article, ArticleSummary, NEWS_BASE_PATH, formatArticleDate, getArticleUrl, getCategoryMeta } from "@/lib/articles";
import { extractToc, parseMarkdown } from "@/lib/articleMarkdown";
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

const cardSx = { bgcolor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0" } as const;
const crumbLinkSx = { color: "#0B3C5D", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } } as const;

export default function ArticleDetailClient({ article, related }: ArticleDetailClientProps) {
  const category = getCategoryMeta(article.category);
  const articleUrl = getArticleUrl(article.slug);
  const toc = useMemo(() => extractToc(parseMarkdown(article.content)), [article.content]);
  const updatedLater =
    article.updated_at && article.published_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 86_400_000;

  useEffect(() => {
    recordView(article.slug);
    trackEvent({ name: "article_view", params: { slug: article.slug, category: article.category } });
  }, [article.slug, article.category]);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 12, md: 8 } }}>
      <ReadingProgress targetId={ARTICLE_ID} />

      {/* ===================== Header ===================== */}
      <Box component="header" sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 5 } }}>
          <Box component="nav" aria-label="Breadcrumb">
            <Box component="ol" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5, listStyle: "none", m: 0, p: 0, fontSize: "0.85rem", color: "#64748B" }}>
              <li><Box component={Link} href="/" sx={crumbLinkSx}>Home</Box></li>
              <Box component="li" aria-hidden sx={{ display: "flex" }}><ChevronRightIcon sx={{ fontSize: 16, color: "#CBD5E1" }} /></Box>
              <li><Box component={Link} href={NEWS_BASE_PATH} sx={crumbLinkSx}>News</Box></li>
              <Box component="li" aria-hidden sx={{ display: "flex" }}><ChevronRightIcon sx={{ fontSize: 16, color: "#CBD5E1" }} /></Box>
              <Box component="li" aria-current="page" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: { xs: 180, sm: 480 } }}>
                {article.title}
              </Box>
            </Box>
          </Box>

          <Box sx={{ maxWidth: 860, mt: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              <Box
                component={Link}
                href={NEWS_BASE_PATH}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.5, borderRadius: "999px", bgcolor: category.bg, color: category.color, fontWeight: 800, fontSize: "0.78rem", textDecoration: "none" }}
              >
                <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: category.color }} />
                {category.label}
              </Box>
              {article.tags.slice(0, 3).map((tag) => (
                <Box key={tag} component="span" sx={{ px: 1.1, py: 0.4, borderRadius: "999px", bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.75rem" }}>
                  #{tag}
                </Box>
              ))}
            </Box>

            <Typography
              component="h1"
              itemProp="headline"
              sx={{ fontWeight: 900, fontSize: { xs: "1.85rem", sm: "2.35rem", md: "2.9rem" }, lineHeight: 1.15, color: "#0F172A", letterSpacing: "-0.02em", textWrap: "balance" }}
            >
              {article.title}
            </Typography>

            {article.excerpt && (
              <Typography id="quick-answer" sx={{ mt: 2, fontSize: { xs: "1.05rem", md: "1.22rem" }, color: "#475569", lineHeight: 1.6, maxWidth: 760 }}>
                {article.excerpt}
              </Typography>
            )}

            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 1.5, sm: 2.5 }, mt: 3, color: "#64748B", fontSize: "0.88rem" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box aria-hidden sx={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #0B3C5D, #2563EB)", color: "#FFF", display: "grid", placeItems: "center", fontWeight: 900 }}>
                  {article.author_name.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.92rem", lineHeight: 1.2 }}>{article.author_name}</Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>Kerala Lottery Results Today</Typography>
                </Box>
              </Box>
              <Box aria-hidden sx={{ width: "1px", height: 28, bgcolor: "#E2E8F0", display: { xs: "none", sm: "block" } }} />
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                <time dateTime={article.published_at ?? undefined}>{formatArticleDate(article.published_at)}</time>
                {updatedLater && (
                  <Box component="span" sx={{ color: "#94A3B8" }}>
                    · Updated <time dateTime={article.updated_at}>{formatArticleDate(article.updated_at)}</time>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <AccessTimeIcon sx={{ fontSize: 16 }} /> {article.reading_minutes} min read
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===================== Body (single full-width column) ===================== */}
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Box component="article" id={ARTICLE_ID} sx={{ minWidth: 0 }}>
          {article.cover_image_url && (
            <Box
              component="figure"
              sx={{
                position: "relative",
                m: 0,
                mb: { xs: 3, md: 4 },
                borderRadius: "20px",
                overflow: "hidden",
                bgcolor: "#0F172A",
                boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                isolation: "isolate",
              }}
            >
              {/* Blurred copy fills the side space when the photo is narrower than the frame (portrait images) */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: -1,
                  backgroundImage: `url(${JSON.stringify(article.cover_image_url)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(28px) brightness(0.85)",
                  transform: "scale(1.15)",
                }}
              />
              {/* Whole image at its natural shape — never cropped; height capped so tall images can't flood the screen */}
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded remote images */}
              <img
                src={article.cover_image_url}
                alt={article.cover_image_alt ?? article.title}
                fetchPriority="high"
                style={{ display: "block", width: "100%", height: "auto", maxHeight: "min(70vh, 640px)", objectFit: "contain" }}
              />
            </Box>
          )}

          <Box sx={{ ...cardSx, p: { xs: 2.5, sm: 4, md: 6 } }}>
            {/* Card spans the full width; text keeps a ~80-character measure for readability */}
            <Box sx={{ maxWidth: 860, mx: "auto" }}>
              {toc.length >= 2 && (
                <Box component="nav" aria-label="Table of contents" sx={{ mb: 4, p: { xs: 2, md: 2.5 }, borderRadius: "16px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <Typography sx={{ fontWeight: 900, mb: 1.25, color: "#0F172A", fontSize: "0.95rem" }}>In this article</Typography>
                  <Box component="ol" sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.5, columnGap: 4, gridTemplateColumns: { xs: "1fr", md: toc.length > 4 ? "1fr 1fr" : "1fr" } }}>
                    {toc.map((item) => (
                      <Box component="li" key={item.id} sx={{ ml: item.level === 3 ? 2 : 0, color: "#94A3B8", fontSize: "0.88rem" }}>
                        <Box
                          component="a"
                          href={`#${item.id}`}
                          sx={{ color: "#334155", textDecoration: "none", fontWeight: item.level === 2 ? 700 : 500, lineHeight: 1.5, "&:hover": { color: "#0B5CAD", textDecoration: "underline" } }}
                        >
                          {item.text}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <ArticleContent markdown={article.content} />

              {article.faqs.length > 0 && (
                <Box id="faqs" component="section" aria-labelledby="faq-heading" sx={{ mt: 5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <HelpOutlineIcon sx={{ color: "#0B3C5D" }} />
                    <Typography id="faq-heading" component="h2" sx={{ fontWeight: 900, fontSize: { xs: "1.3rem", md: "1.5rem" }, color: "#0F172A" }}>
                      Frequently asked questions
                    </Typography>
                  </Box>
                  {article.faqs.map((faq, idx) => (
                    <Accordion key={idx} disableGutters elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "14px !important", mb: 1.25, "&:before": { display: "none" }, "&.Mui-expanded": { borderColor: "#BFDBFE", bgcolor: "#F8FBFF" } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.25 }}>
                        <Typography component="h3" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.98rem" }}>{faq.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2.25, pt: 0 }}>
                        <Typography sx={{ color: "#475569", lineHeight: 1.7, whiteSpace: "pre-line" }}>{faq.answer}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {article.tags.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 5 }}>
                  {article.tags.map((tag) => (
                    <Box key={tag} component="span" sx={{ px: 1.25, py: 0.5, borderRadius: "999px", border: "1px solid #E2E8F0", color: "#475569", fontWeight: 600, fontSize: "0.8rem" }}>
                      #{tag}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Author / editor bio (E-E-A-T): founder's own posts say "Written by", others "Reviewed by" */}
              <AuthorBio
                label={isFounderAuthor(article.author_name) ? "Written by" : "Reviewed by"}
                reviewedDate={article.updated_at}
              />

              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #E2E8F0" }}>
                <ArticleShareBar title={article.title} url={articleUrl} slug={article.slug} label="Share this article" />
              </Box>
            </Box>
          </Box>

          {/* Next-step CTA */}
          <Box
            sx={{
              mt: 3,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: "20px",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
              border: "1px solid #FDE68A",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.1rem" }}>Holding a Kerala lottery ticket?</Typography>
              <Typography sx={{ color: "#78350F", fontSize: "0.9rem", mt: 0.25 }}>Check it against every recent draw in seconds.</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
              <Button component={Link} href={NEWS_BASE_PATH} startIcon={<ArrowBackIcon />} variant="outlined" sx={{ fontWeight: 800, textTransform: "none", borderRadius: "12px", borderColor: "#D97706", color: "#92400E", bgcolor: "#FFFFFF", "&:hover": { borderColor: "#B45309", bgcolor: "#FFFBEB" } }}>
                All news
              </Button>
              <Button component={Link} href="/search" startIcon={<SearchIcon />} variant="contained" sx={{ fontWeight: 800, textTransform: "none", borderRadius: "12px", bgcolor: "#0B3C5D", boxShadow: "none", "&:hover": { bgcolor: "#0F2C59" } }}>
                Check your ticket
              </Button>
            </Box>
          </Box>
        </Box>

        {/* ===================== More articles (always shown; tile fills the next slot) ===================== */}
        <Box component="section" aria-labelledby="related-heading" sx={{ mt: { xs: 6, md: 8 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
            <Typography id="related-heading" component="h2" sx={{ fontWeight: 900, color: "#0F172A", fontSize: { xs: "1.3rem", md: "1.55rem" } }}>
              {related.length > 0 ? "More articles" : "Explore more"}
            </Typography>
            <Button component={Link} href={NEWS_BASE_PATH} endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", color: "#0B3C5D", bgcolor: "#EBF5FF", px: 2, "&:hover": { bgcolor: "#DBEAFE" } }}>
              View all
            </Button>
          </Box>
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, "& > li": { display: "flex" }, "& > li > *": { flex: 1 } }}>
            {related.map((item) => (
              <li key={item.id}>
                <ArticleCard article={item} />
              </li>
            ))}
            {related.length < RELATED_LIMIT && (
              <li>
                <SeeAllNewsTile />
              </li>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
