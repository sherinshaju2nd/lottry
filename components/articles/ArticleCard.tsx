"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ArticleSummary, formatArticleDate, getArticlePath, getCategoryMeta } from "@/lib/articles";

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: "card" | "hero" | "compact";
  priority?: boolean;
}

const CoverImage = ({ article, priority, height }: { article: ArticleSummary; priority?: boolean; height: string | Record<string, string> }) => {
  const category = getCategoryMeta(article.category);
  return article.cover_image_url ? (
    <Box sx={{ position: "relative", width: "100%", height, overflow: "hidden", bgcolor: "#E2E8F0" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded remote images */}
      <img
        src={article.cover_image_url}
        alt={article.cover_image_alt ?? article.title}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="article-card-img"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .35s ease" }}
      />
    </Box>
  ) : (
    <Box
      aria-hidden
      sx={{ width: "100%", height, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}CC 60%, ${category.color}88 100%)` }}
    >
      <NewspaperIcon sx={{ fontSize: 56, color: "rgba(255,255,255,0.85)" }} />
    </Box>
  );
};

const Meta = ({ article }: { article: ArticleSummary }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#64748B", fontSize: "0.8rem", flexWrap: "wrap" }}>
    <time dateTime={article.published_at ?? undefined}>{formatArticleDate(article.published_at)}</time>
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <AccessTimeIcon sx={{ fontSize: 14 }} /> {article.reading_minutes} min read
    </Box>
  </Box>
);

/** Feed card for an article (hero, grid card or compact related-list row). */
export default function ArticleCard({ article, variant = "card", priority }: ArticleCardProps) {
  const category = getCategoryMeta(article.category);
  const href = getArticlePath(article.slug);

  const categoryChip = (
    <Chip size="small" label={category.label} sx={{ alignSelf: "flex-start", fontWeight: 800, bgcolor: category.bg, color: category.color, height: 24, fontSize: "0.72rem" }} />
  );

  const linkSx = {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    borderRadius: "18px",
    overflow: "hidden",
    bgcolor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    height: "100%",
    transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
    "&:hover, &:focus-visible": { boxShadow: "0 12px 32px rgba(15,23,42,0.10)", transform: "translateY(-2px)", borderColor: "#CBD5E1" },
    "&:hover .article-card-img": { transform: "scale(1.04)" },
    "&:focus-visible": { outline: "3px solid #0B3C5D", outlineOffset: 2 },
  } as const;

  if (variant === "hero") {
    return (
      <Box component={Link} href={href} sx={{ ...linkSx, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" } }}>
        <CoverImage article={article} priority={priority} height={{ xs: "210px", sm: "280px", md: "100%" } as unknown as Record<string, string>} />
        <Box sx={{ p: { xs: 2.5, md: 4 }, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1.5, minHeight: { md: 340 } }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip size="small" label="Featured" sx={{ fontWeight: 800, bgcolor: "#FEF3C7", color: "#B45309", height: 24, fontSize: "0.72rem" }} />
            {categoryChip}
          </Box>
          <Typography component="h2" sx={{ fontWeight: 900, fontSize: { xs: "1.35rem", md: "1.8rem" }, lineHeight: 1.25, color: "#0F172A" }}>
            {article.title}
          </Typography>
          {article.excerpt && (
            <Typography sx={{ color: "#475569", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {article.excerpt}
            </Typography>
          )}
          <Meta article={article} />
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "#0B3C5D", fontWeight: 800, mt: 0.5 }}>
            Read article <ArrowForwardIcon fontSize="small" />
          </Box>
        </Box>
      </Box>
    );
  }

  if (variant === "compact") {
    return (
      <Box component={Link} href={href} sx={{ ...linkSx, display: "flex", gap: 1.5, p: 1.25, alignItems: "center" }}>
        <Box sx={{ width: 96, flexShrink: 0, borderRadius: "12px", overflow: "hidden" }}>
          <CoverImage article={article} height="72px" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: "0.92rem", lineHeight: 1.35, color: "#0F172A", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.title}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Meta article={article} />
          </Box>
        </Box>
      </Box>
    );
  }

  const clamp = (lines: number) => ({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }) as const;

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        ...linkSx,
        display: "flex",
        flexDirection: "column",
        "&:hover .article-card-title, &:focus-visible .article-card-title": { color: "#0B5CAD" },
        "&:hover .article-card-arrow, &:focus-visible .article-card-arrow": { transform: "translateX(4px)" },
      }}
    >
      {/* 16:9 cover with overlaid category + reading time */}
      <Box sx={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden" }}>
        <CoverImage article={article} priority={priority} height="100%" />
        <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0) 38%)", pointerEvents: "none" }} />
        <Box
          sx={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.1, py: 0.4, borderRadius: "999px", bgcolor: "rgba(255,255,255,0.94)", boxShadow: "0 2px 8px rgba(15,23,42,0.15)" }}
        >
          <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: category.color }} />
          <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 800, color: category.color, letterSpacing: "0.02em" }}>
            {category.label}
          </Typography>
        </Box>
        <Box
          sx={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.4, borderRadius: "999px", bgcolor: "rgba(15,23,42,0.6)", color: "#FFF", backdropFilter: "blur(4px)" }}
        >
          <AccessTimeIcon sx={{ fontSize: 13 }} />
          <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
            {article.reading_minutes} min
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.9, flex: 1 }}>
        {/* min-height reserves 2 lines so cards in a row line up */}
        <Typography
          component="h3"
          className="article-card-title"
          sx={{ fontWeight: 800, fontSize: "1.02rem", lineHeight: 1.4, minHeight: "2.8em", color: "#0F172A", transition: "color .2s ease", ...clamp(2) }}
        >
          {article.title}
        </Typography>
        {article.excerpt && (
          <Typography sx={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.55, ...clamp(2) }}>
            {article.excerpt}
          </Typography>
        )}
        <Box sx={{ mt: "auto", pt: 1.25, borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography component="time" dateTime={article.published_at ?? undefined} sx={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>
            {formatArticleDate(article.published_at)}
          </Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, color: "#0B3C5D", fontWeight: 800, fontSize: "0.8rem" }}>
            Read
            <ArrowForwardIcon className="article-card-arrow" sx={{ fontSize: 16, transition: "transform .2s ease" }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
