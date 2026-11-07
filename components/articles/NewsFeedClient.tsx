"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ArticleCard from "./ArticleCard";
import NewsletterSignup from "./NewsletterSignup";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_PAGE_SIZE,
  ArticleCategory,
  ArticleSummary,
  fetchPublishedArticles,
} from "@/lib/articles";

interface NewsFeedClientProps {
  initialArticles: ArticleSummary[];
  initialTotal: number;
  featured: ArticleSummary | null;
  initialError?: string;
}

type Filter = ArticleCategory | "all";

const CardSkeleton = () => (
  <Box sx={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #E2E8F0", bgcolor: "#FFF" }}>
    <Skeleton variant="rectangular" height={190} />
    <Box sx={{ p: 2.25 }}>
      <Skeleton width={90} height={26} />
      <Skeleton height={28} />
      <Skeleton height={20} width="80%" />
    </Box>
  </Box>
);

export default function NewsFeedClient({ initialArticles, initialTotal, featured, initialError }: NewsFeedClientProps) {
  const [category, setCategory] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<ArticleSummary[]>(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);
  const requestId = useRef(0);
  const isFirstRender = useRef(true);

  const isDefaultView = category === "all" && !search.trim();
  // The featured post is shown as the hero on the default view; don't repeat it in the grid.
  const gridArticles = isDefaultView && featured ? articles.filter((a) => a.id !== featured.id) : articles;
  const hasMore = articles.length < total;

  const load = useCallback(async (nextCategory: Filter, nextSearch: string, nextPage: number) => {
    const id = ++requestId.current;
    if (nextPage === 0) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(undefined);
    const result = await fetchPublishedArticles({ category: nextCategory, search: nextSearch, page: nextPage, pageSize: ARTICLE_PAGE_SIZE });
    if (id !== requestId.current) return; // a newer filter won
    if (result.error) {
      setError("We couldn't load articles. Check your connection and try again.");
    } else {
      setArticles((prev) => (nextPage === 0 ? result.articles : [...prev, ...result.articles.filter((a) => !prev.some((p) => p.id === a.id))]));
      setTotal(result.total);
      setPage(nextPage);
    }
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  // Refetch when filters change (debounced for typing)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => load(category, search, 0), search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [category, search, load]);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 12, md: 8 } }}>
      {/* Hero header */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          <Box component="nav" aria-label="Breadcrumb" sx={{ fontSize: "0.85rem", color: "#64748B", mb: 1.5 }}>
            <Box component="a" href="/" sx={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "none" }}>Home</Box>
            {" / "}
            <span aria-current="page">News</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
            <Box>
              <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: "1.75rem", md: "2.4rem" }, color: "#0F172A", lineHeight: 1.2, display: "flex", alignItems: "center", gap: 1.25 }}>
                <NewspaperIcon sx={{ fontSize: { xs: 30, md: 40 }, color: "#0B3C5D" }} /> Kerala Lottery News & Newsletter
              </Typography>
              <Typography sx={{ color: "#475569", mt: 1, maxWidth: 680, lineHeight: 1.65 }}>
                Latest Kerala lottery news, bumper announcements, prize claim guides and safety tips — written by our results desk.
              </Typography>
            </Box>
            <Button component="a" href="/feed.xml" startIcon={<RssFeedIcon />} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", flexShrink: 0 }}>
              RSS feed
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ mt: 3, display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" } }}>
            <Box role="tablist" aria-label="Filter by category" sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 0.5, flex: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
              {[{ value: "all" as const, label: "All" }, ...ARTICLE_CATEGORIES].map(({ value, label }) => {
                const selected = category === value;
                return (
                  <Chip
                    key={value}
                    role="tab"
                    aria-selected={selected}
                    label={label}
                    onClick={() => setCategory(value)}
                    sx={{ fontWeight: 800, flexShrink: 0, bgcolor: selected ? "#0B3C5D" : "#F1F5F9", color: selected ? "#FFFFFF" : "#334155", "&:hover": { bgcolor: selected ? "#0F2C59" : "#E2E8F0" } }}
                  />
                );
              })}
            </Box>
            <TextField
              size="small"
              placeholder="Search articles"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", md: 280 }, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#FFFFFF" } }}
              slotProps={{
                htmlInput: { "aria-label": "Search articles", maxLength: 80 },
                input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> },
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }} action={<Button color="inherit" onClick={() => load(category, search, 0)}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {isDefaultView && featured && (
          <Box sx={{ mb: 4 }}>
            <ArticleCard article={featured} variant="hero" priority />
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
            {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          </Box>
        ) : gridArticles.length === 0 && !(isDefaultView && featured) ? (
          !error && (
            <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: "#FFF", borderRadius: "18px", border: "1px dashed #CBD5E1" }}>
              <NewspaperIcon sx={{ fontSize: 52, color: "#CBD5E1" }} />
              <Typography component="h2" sx={{ fontWeight: 800, mt: 1, color: "#0F172A" }}>
                {isDefaultView ? "No articles published yet" : "No articles match your search"}
              </Typography>
              <Typography sx={{ color: "#64748B", mt: 0.5 }}>
                {isDefaultView ? "Check back soon for the latest Kerala lottery news." : "Try another keyword or category."}
              </Typography>
              {!isDefaultView && (
                <Button onClick={() => { setCategory("all"); setSearch(""); }} sx={{ mt: 2, fontWeight: 800, textTransform: "none" }}>
                  Clear filters
                </Button>
              )}
            </Box>
          )
        ) : (
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
            {gridArticles.map((article, idx) => (
              <li key={article.id}>
                <ArticleCard article={article} priority={idx < 3 && !featured} />
              </li>
            ))}
          </Box>
        )}

        {hasMore && !isLoading && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              disabled={isLoadingMore}
              onClick={() => load(category, search, page + 1)}
              sx={{ fontWeight: 800, textTransform: "none", borderRadius: "12px", px: 4 }}
            >
              {isLoadingMore ? <CircularProgress size={20} /> : "Load more articles"}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 6 }}>
          <NewsletterSignup />
        </Box>
      </Container>
    </Box>
  );
}
