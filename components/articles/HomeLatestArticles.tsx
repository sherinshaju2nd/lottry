"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PostCard from "@/components/posts/PostCard";
import { PostCardSkeleton } from "@/components/skeletons/SkeletonKit";
import SeeAllPostsTile from "@/components/posts/SeeAllPostsTile";
import { getAllBlogs } from "@/data/blogs";
import { fetchPublishedArticles } from "@/lib/articles";
import { POSTS_PATH, articleToPostCard, guideToPostCard, sortPostsNewestFirst, type PostCardItem } from "@/lib/posts";

/** Max cards fetched: fills the widest row (5) + extra swipe items on phones. */
const ARTICLE_COUNT = 6;

/**
 * Exactly one full row per viewport (MUI breakpoints):
 *   xs  <600   swipeable row (all items, snap-scrolling, next card peeks in)
 *   sm  600+   2 columns · md 900+ 3 · lg 1200+ 4 · xl 1536+ 5
 * Items beyond the column count are hidden with nth-child, so the row is never ragged.
 * The trailing "See all news" tile therefore only appears when there is a free slot.
 */
const COLUMNS = { sm: 2, md: 3, lg: 4, xl: 5 } as const;

const rowSx = {
  display: { xs: "flex", sm: "grid" },
  gridTemplateColumns: {
    sm: `repeat(${COLUMNS.sm}, minmax(0, 1fr))`,
    md: `repeat(${COLUMNS.md}, minmax(0, 1fr))`,
    lg: `repeat(${COLUMNS.lg}, minmax(0, 1fr))`,
    xl: `repeat(${COLUMNS.xl}, minmax(0, 1fr))`,
  },
  gap: { xs: 1.5, sm: 2, lg: 2.5 },
  overflowX: { xs: "auto", sm: "visible" },
  scrollSnapType: { xs: "x mandatory", sm: "none" },
  listStyle: "none",
  my: 0,
  mx: { xs: -2, sm: 0 },
  px: { xs: 2, sm: 0 },
  scrollPaddingLeft: { xs: 16, sm: 0 },
  pb: { xs: 1, sm: 0 },
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  "& > li": { flex: { xs: "0 0 82%", sm: "initial" }, scrollSnapAlign: "start", minWidth: 0, display: "flex" },
  "& > li > *": { flex: 1 },
  "& > li:nth-of-type(n+3)": { display: { sm: "none", md: "flex" } },
  "& > li:nth-of-type(n+4)": { display: { md: "none", lg: "flex" } },
  "& > li:nth-of-type(n+5)": { display: { lg: "none", xl: "flex" } },
  "& > li:nth-of-type(n+6)": { display: { xl: "none" } },
} as const;



/**
 * Home page "Latest news & guides" section (sits between About and FAQ).
 * Loads only when scrolled near, so it never competes with the results above the fold.
 */
export default function HomeLatestArticles() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState<PostCardItem[] | null>(null);

  // Start fetching when the section is ~600px from the viewport.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    // Fallback: some embedded/throttled browsers never deliver observer callbacks.
    const fallback = setTimeout(() => setIsVisible(true), 5000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let active = true;
    (async () => {
      const { articles: latest, error } = await fetchPublishedArticles({ page: 0, pageSize: ARTICLE_COUNT });
      if (!active) return;
      if (error) console.warn("[HomeLatestArticles] could not load articles:", error);
      // Merge editorial guides with the latest database articles, newest first.
      const guides = getAllBlogs().map(guideToPostCard);
      setArticles(sortPostsNewestFirst([...guides, ...latest.map(articleToPostCard)]).slice(0, ARTICLE_COUNT));
    })();
    return () => {
      active = false;
    };
  }, [isVisible]);

  const isLoading = articles === null;
  const hasArticles = (articles?.length ?? 0) > 0;

  // Loaded and nothing published (or the request failed): hide the whole section.
  if (!isLoading && !hasArticles) return null;

  return (
    <Box
      component="section"
      ref={sectionRef}
      aria-labelledby="home-latest-news-heading"
      sx={{ mb: 5, pt: 3, borderTop: "1px solid #F1F5F9" }}
    >
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, mb: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <NewspaperIcon sx={{ color: "#0B3C5D", fontSize: 26 }} />
            <Typography id="home-latest-news-heading" variant="h5" component="h3" sx={{ fontWeight: 900, color: "#0A2540", letterSpacing: "-0.02em" }}>
              Latest Kerala Lottery News &amp; Guides
            </Typography>
          </Box>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mt: 0.5 }}>
            Bumper announcements, prize claim tips and weekly updates from our results desk.
          </Typography>
        </Box>
        <Button
          component={Link}
          href={POSTS_PATH}
          prefetch={false}
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", color: "#0B3C5D", bgcolor: "#EBF5FF", px: 2, flexShrink: 0, "&:hover": { bgcolor: "#DBEAFE" } }}
        >
          View all articles &amp; news
        </Button>
      </Box>

      {isLoading ? (
        <Box component="ul" sx={rowSx} aria-busy="true" aria-label="Loading latest articles">
          {Array.from({ length: ARTICLE_COUNT }, (_, i) => (
            <li key={i}>
              <PostCardSkeleton />
            </li>
          ))}
        </Box>
      ) : hasArticles ? (
        <Box component="ul" sx={rowSx}>
          {articles?.map((article) => (
            <li key={article.id}>
              <PostCard post={article} />
            </li>
          ))}
          {/* Hidden by the nth-of-type rules when the row is already full */}
          <li>
            <SeeAllPostsTile />
          </li>
        </Box>
      ) : null}
    </Box>
  );
}
