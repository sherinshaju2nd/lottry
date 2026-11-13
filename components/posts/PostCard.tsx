"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import CampaignIcon from "@mui/icons-material/Campaign";
import SecurityIcon from "@mui/icons-material/Security";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { ArticleCategory } from "@/lib/articles";
import { formatArticleDate } from "@/lib/articles";
import type { PostCardItem } from "@/lib/posts";

interface CardVisual {
  Icon: typeof MenuBookIcon;
  gradient: string;
}

/** Fallback cover art per category, for posts without an uploaded image. */
const CATEGORY_VISUALS: Record<ArticleCategory, CardVisual> = {
  bumper: { Icon: EmojiEventsIcon, gradient: "linear-gradient(135deg, #B45309 0%, #D97706 55%, #F59E0B 100%)" },
  guide: { Icon: ReceiptLongIcon, gradient: "linear-gradient(135deg, #0B3C5D 0%, #1E40AF 60%, #3B82F6 100%)" },
  news: { Icon: NewspaperIcon, gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 60%, #14B8A6 100%)" },
  announcement: { Icon: CampaignIcon, gradient: "linear-gradient(135deg, #9F1239 0%, #BE123C 60%, #F43F5E 100%)" },
  tips: { Icon: SecurityIcon, gradient: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #A78BFA 100%)" },
};

const COVER_SX = {
  position: "relative",
  aspectRatio: "1200 / 630",
  overflow: "hidden",
  bgcolor: "#E2E8F0",
} as const;

/** Local guide covers ship a .webp twin next to the .jpg. */
const hasWebpTwin = (src: string): boolean => src.startsWith("/") && src.endsWith(".jpg");

/** Card artwork: the post's cover image, or a category gradient with an icon. */
export const PostCover = ({ post, priority = false }: { post: PostCardItem; priority?: boolean }) => {
  const { coverImage, coverAlt, category } = post;
  if (coverImage) {
    const img = (
      <Box
        component="img"
        className="card-cover-art"
        src={coverImage}
        alt={coverAlt}
        width={1200}
        height={630}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
      />
    );
    return (
      <Box sx={COVER_SX}>
        {hasWebpTwin(coverImage) ? (
          <picture>
            <source srcSet={coverImage.replace(/\.jpg$/, ".webp")} type="image/webp" />
            {img}
          </picture>
        ) : (
          img
        )}
      </Box>
    );
  }
  const { Icon, gradient } = CATEGORY_VISUALS[category] ?? CATEGORY_VISUALS.guide;
  return (
    <Box aria-hidden sx={{ ...COVER_SX, background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon className="card-cover-art" sx={{ color: "#FFFFFF", fontSize: 56, opacity: 0.9, transition: "transform 0.4s ease" }} />
    </Box>
  );
};

export const getPostCtaLabel = ({ kind }: PostCardItem): string => (kind === "guide" ? "Read Guide" : "Read Article");

/** Grid card used on /blog, the home page "Latest" row and "More articles" on post pages. */
const PostCard = ({ post, headingLevel = "h3" }: { post: PostCardItem; headingLevel?: "h2" | "h3" }) => (
  <Paper
    elevation={0}
    component={Link}
    href={post.href}
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      textDecoration: "none",
      color: "inherit",
      borderRadius: "18px",
      bgcolor: "#FFFFFF",
      border: "1px solid #E2E8F0",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
      "&:hover": {
        transform: "translateY(-6px)",
        borderColor: "#BFDBFE",
        boxShadow: "0 18px 36px -12px rgba(11, 60, 93, 0.22)",
      },
      "&:hover .card-cover-art": { transform: "scale(1.05)" },
      "&:hover .card-cta": { bgcolor: "#0B3C5D", color: "#FFFFFF" },
      "&:hover .card-cta-arrow": { transform: "translateX(3px)" },
      "&:focus-visible": { outline: "3px solid #93C5FD", outlineOffset: 2 },
    }}
  >
    <PostCover post={post} />

    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: { xs: 2.5, sm: 3 } }}>
      <Typography
        component={headingLevel}
        sx={{
          fontWeight: 800,
          color: "#0F172A",
          fontSize: { xs: "1.08rem", sm: "1.15rem" },
          lineHeight: 1.4,
          mb: 1.25,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#64748B",
          lineHeight: 1.65,
          mb: 2.5,
          flexGrow: 1,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.description}
      </Typography>

      <Box
        sx={{
          pt: 2,
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box
          component="time"
          dateTime={post.publishedAt}
          sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748B", fontSize: "0.8rem", fontWeight: 600 }}
        >
          <CalendarTodayIcon sx={{ fontSize: 14 }} />
          {formatArticleDate(post.publishedAt)}
        </Box>
        <Box
          className="card-cta"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.75,
            borderRadius: "999px",
            bgcolor: "#EFF6FF",
            color: "#0B3C5D",
            fontWeight: 800,
            fontSize: "0.8rem",
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
        >
          <span>{getPostCtaLabel(post)}</span>
          <ArrowForwardIcon className="card-cta-arrow" sx={{ fontSize: 15, transition: "transform 0.2s ease" }} />
        </Box>
      </Box>
    </Box>
  </Paper>
);

export default PostCard;
