"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedIcon from "@mui/icons-material/Verified";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import SecurityIcon from "@mui/icons-material/Security";
import { ARTICLE_PAGE_SIZE, fetchPublishedArticles, formatArticleDate } from "@/lib/articles";
import {
  POST_FILTERS,
  POSTS_TITLE,
  articleToPostCard,
  filterGuides,
  mergePostFeed,
  pickFeaturedPost,
  type PostCardItem,
  type PostFilter,
} from "@/lib/posts";
import PostCard, { getPostCtaLabel } from "./PostCard";

interface PostsFeedClientProps {
  /** All static guides (always available, filtered client-side). */
  guides: PostCardItem[];
  /** First page of published articles from the database (server-rendered). */
  initialArticles: PostCardItem[];
  initialArticleTotal: number;
  /** Article pinned as featured in the admin, if any. */
  pinnedArticle: PostCardItem | null;
  initialError?: string;
}

const LOAD_ERROR = "We couldn't load the latest news. Check your connection and try again.";

const TOOLS = [
  { href: "/search", title: "Ticket Checker", desc: "Instant prize verification", Icon: SearchIcon, bg: "#EFF6FF", fg: "#1D4ED8" },
  { href: "/claim", title: "Prize Claim Offices", desc: "Offices & claim forms", Icon: EmojiEventsIcon, bg: "#FEF3C7", fg: "#D97706" },
  { href: "/kerala-lottery-app", title: "Mobile App", desc: "Scanner & 3 PM results", Icon: SmartphoneIcon, bg: "#F0FDF4", fg: "#16A34A" },
  { href: "/support", title: "Player Safety", desc: "Anti-scam verification", Icon: SecurityIcon, bg: "#FAF5FF", fg: "#9333EA" },
] as const;

const CardSkeleton = () => (
  <Box sx={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
    <Skeleton variant="rectangular" sx={{ aspectRatio: "1200 / 630", height: "auto" }} />
    <Box sx={{ p: 3 }}>
      <Skeleton height={28} />
      <Skeleton height={20} width="85%" />
      <Skeleton height={20} width="60%" />
    </Box>
  </Box>
);

/** Large featured card at the top of the default view (blog design). */
const FeaturedPostCard = ({ post }: { post: PostCardItem }) => (
  <Paper
    elevation={0}
    component={Link}
    href={post.href}
    sx={{
      display: "block",
      position: "relative",
      textDecoration: "none",
      color: "inherit",
      mb: 6,
      borderRadius: "20px",
      bgcolor: "#FFFFFF",
      border: "2px solid #E2E8F0",
      boxShadow: "0 10px 30px -5px rgba(11, 60, 93, 0.08)",
      transition: "all 0.25s ease-in-out",
      overflow: "hidden",
      "&:hover": {
        transform: "translateY(-4px)",
        borderColor: "#0B3C5D",
        boxShadow: "0 20px 40px -10px rgba(11, 60, 93, 0.16)",
      },
    }}
  >
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 140,
        height: 140,
        background: "radial-gradient(circle, rgba(217, 179, 16, 0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <Box sx={{ p: { xs: 3, sm: 4.5 }, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Chip
          label={post.kind === "guide" ? "FEATURED GUIDE" : "FEATURED"}
          sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.05em" }}
        />
        <Chip label={post.categoryLabel} sx={{ bgcolor: "#EFF6FF", color: "#1E40AF", fontWeight: 700, fontSize: "0.72rem" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", fontSize: "0.8rem", ml: "auto" }}>
          <AccessTimeIcon sx={{ fontSize: 16 }} />
          <span>{post.readMinutes} min read</span>
        </Box>
      </Box>

      <Typography
        component="h2"
        sx={{ fontWeight: 900, color: "#0F172A", fontSize: { xs: "1.45rem", sm: "1.9rem", md: "2.1rem" }, lineHeight: 1.3, mb: 1.5 }}
      >
        {post.title}
      </Typography>
      <Typography sx={{ color: "#475569", lineHeight: 1.7, fontSize: { xs: "0.95rem", sm: "1.05rem" }, mb: 3, maxWidth: 900 }}>
        {post.description}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          pt: 2.5,
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {post.authorAvatar ? (
            <Box
              component="img"
              src={post.authorAvatar}
              alt=""
              width={42}
              height={42}
              sx={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid #E2E8F0", objectFit: "cover" }}
            />
          ) : (
            <Box aria-hidden sx={{ width: 42, height: 42, borderRadius: "50%", bgcolor: "#0B3C5D", color: "#FFF", display: "grid", placeItems: "center", fontWeight: 900 }}>
              {post.authorName.charAt(0).toUpperCase()}
            </Box>
          )}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0F172A" }}>{post.authorName}</Typography>
              <VerifiedIcon sx={{ fontSize: 16, color: "#0B3C5D" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748B", fontSize: "0.75rem" }}>
              <CalendarTodayIcon sx={{ fontSize: 13 }} />
              <time dateTime={post.publishedAt}>{formatArticleDate(post.publishedAt)}</time>
            </Box>
          </Box>
        </Box>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            bgcolor: "#0B3C5D",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.875rem",
            px: 2.5,
            py: 1.1,
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(11, 60, 93, 0.25)",
          }}
        >
          {getPostCtaLabel(post)} <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </Box>
  </Paper>
);

/**
 * Merged "Articles & News" page: the blog's card design with the news feed's
 * category filters, search, featured post and paginated "Load more".
 */
export default function PostsFeedClient({
  guides,
  initialArticles,
  initialArticleTotal,
  pinnedArticle,
  initialError,
}: PostsFeedClientProps) {
  const [filter, setFilter] = useState<PostFilter>("all");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<PostCardItem[]>(initialArticles);
  const [articleTotal, setArticleTotal] = useState(initialArticleTotal);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError ? LOAD_ERROR : undefined);
  const requestId = useRef(0);
  const isFirstRender = useRef(true);

  const isDefaultView = filter === "all" && !search.trim();
  const hasMoreArticles = articles.length < articleTotal;

  const feed = useMemo(
    () => mergePostFeed({ guides: filterGuides(guides, filter, search), articles, hasMoreArticles }),
    [guides, filter, search, articles, hasMoreArticles],
  );
  const featured = isDefaultView ? pickFeaturedPost(pinnedArticle, guides, feed) : null;
  // Like the original blog page, the grid lists every post (the featured one included).
  const gridPosts = feed;
  const totalCount = filterGuides(guides, filter, search).length + articleTotal;

  const load = useCallback(async (nextFilter: PostFilter, nextSearch: string, nextPage: number) => {
    const id = ++requestId.current;
    if (nextPage === 0) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(undefined);
    try {
      const result = await fetchPublishedArticles({
        category: nextFilter,
        search: nextSearch,
        page: nextPage,
        pageSize: ARTICLE_PAGE_SIZE,
      });
      if (id !== requestId.current) return; // a newer filter won
      if (result.error) {
        console.error("[PostsFeed] article load failed:", result.error);
        setError(LOAD_ERROR);
        return;
      }
      const cards = result.articles.map(articleToPostCard);
      setArticles((prev) =>
        nextPage === 0 ? cards : [...prev, ...cards.filter((card) => !prev.some(({ id: prevId }) => prevId === card.id))],
      );
      setArticleTotal(result.total);
      setPage(nextPage);
    } catch (err: unknown) {
      console.error("[PostsFeed] article load threw:", err instanceof Error ? err.message : String(err));
      if (id === requestId.current) setError(LOAD_ERROR);
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  // Refetch database articles when filters change (debounced while typing); guides filter instantly.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => load(filter, search, 0), search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [filter, search, load]);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 12, md: 8 } }}>
      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #1E3A8A 100%)",
          color: "#FFFFFF",
          pt: { xs: 5, md: 7 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Box component="nav" aria-label="Breadcrumb" sx={{ fontSize: "0.82rem", color: "#93C5FD", mb: 2 }}>
            <Link href="/" style={{ color: "#93C5FD", textDecoration: "none", fontWeight: 600 }}>
              Home
            </Link>
            <span aria-hidden> / </span>
            <span aria-current="page">{POSTS_TITLE}</span>
          </Box>
          <Chip
            icon={<MenuBookIcon sx={{ "&&": { color: "#FDE68A", fontSize: 16 } }} />}
            label="GUIDES, NEWS & UPDATES"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.12)",
              color: "#FDE68A",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              mb: 2,
              border: "1px solid rgba(253, 230, 138, 0.3)",
            }}
          />
          <Typography
            component="h1"
            sx={{ fontWeight: 900, fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" }, mb: 2, letterSpacing: "-0.02em" }}
          >
            Kerala Lottery {POSTS_TITLE}
          </Typography>
          <Typography
            sx={{ color: "#E2E8F0", maxWidth: 720, mx: "auto", fontSize: { xs: "0.95rem", sm: "1.1rem" }, lineHeight: 1.6 }}
          >
            Step-by-step prize claim guides, bumper lottery updates, announcements and safety tips — written and
            reviewed by our editor.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        {/* Filters + search (from the news feed) */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 4,
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            boxShadow: "0 10px 30px -12px rgba(11, 60, 93, 0.15)",
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
          }}
        >
          <Box
            role="tablist"
            aria-label="Filter by category"
            sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 0.5, flex: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
          >
            {POST_FILTERS.map(({ value, label }) => {
              const selected = filter === value;
              return (
                <Chip
                  key={value}
                  role="tab"
                  aria-selected={selected}
                  label={label}
                  onClick={() => setFilter(value)}
                  sx={{
                    fontWeight: 800,
                    flexShrink: 0,
                    bgcolor: selected ? "#0B3C5D" : "#F1F5F9",
                    color: selected ? "#FFFFFF" : "#334155",
                    "&:hover": { bgcolor: selected ? "#0F2C59" : "#E2E8F0" },
                  }}
                />
              );
            })}
          </Box>
          <TextField
            size="small"
            placeholder="Search articles & news"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", md: 280 }, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#FFFFFF" } }}
            slotProps={{
              htmlInput: { "aria-label": "Search articles and news", maxLength: 80 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: "12px" }}
            action={
              <Button color="inherit" onClick={() => load(filter, search, 0)}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {featured && <FeaturedPostCard post={featured} />}

        {/* Section Heading */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 6, height: 28, borderRadius: 3, background: "linear-gradient(180deg, #D9B310 0%, #F59E0B 100%)" }} />
            <Typography component="h2" sx={{ fontWeight: 900, color: "#0B3C5D", fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
              {isDefaultView ? `All ${POSTS_TITLE}` : "Matching posts"}
            </Typography>
          </Box>
          <Typography
            component="span"
            aria-live="polite"
            sx={{ px: 1.5, py: 0.5, borderRadius: "999px", bgcolor: "#E0F2FE", color: "#0B3C5D", fontWeight: 800, fontSize: "0.78rem", whiteSpace: "nowrap" }}
          >
            {totalCount} {totalCount === 1 ? "post" : "posts"}
          </Typography>
        </Box>

        {/* Posts Grid */}
        {isLoading ? (
          <Grid container spacing={3} aria-busy="true" aria-label="Loading posts">
            {Array.from({ length: 3 }, (_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                <CardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : gridPosts.length > 0 ? (
          <Grid container spacing={3}>
            {gridPosts.map((post) => (
              <Grid key={post.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: "center", borderRadius: "18px", border: "1px dashed #CBD5E1", bgcolor: "#FFFFFF" }}>
            <Typography component="p" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.15rem", mb: 0.5 }}>
              {isDefaultView ? "No posts published yet" : "No posts match your search"}
            </Typography>
            <Typography sx={{ color: "#64748B" }}>
              {isDefaultView ? "New guides and news are added regularly." : "Try another keyword or category."}
            </Typography>
          </Paper>
        )}

        {hasMoreArticles && !isLoading && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              disabled={isLoadingMore}
              onClick={() => load(filter, search, page + 1)}
              sx={{ fontWeight: 800, textTransform: "none", borderRadius: "12px", px: 4 }}
            >
              {isLoadingMore ? <CircularProgress size={20} /> : "Load more posts"}
            </Button>
          </Box>
        )}

        {/* Quick Tools & Related Resources */}
        <Box sx={{ mt: 7 }}>
          <Typography component="h2" sx={{ fontWeight: 900, color: "#0B3C5D", mb: 2.5, textAlign: "center", fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
            Essential Kerala Lottery Tools
          </Typography>
          <Grid container spacing={2.5}>
            {TOOLS.map(({ href, title, desc, Icon, bg, fg }) => (
              <Grid key={href} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  component={Link}
                  href={href}
                  sx={{
                    p: 2.5,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "#0B3C5D", transform: "translateY(-2px)" },
                  }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>{title}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{desc}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
