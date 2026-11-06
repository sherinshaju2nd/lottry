"use client";

import React from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedIcon from "@mui/icons-material/Verified";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import SecurityIcon from "@mui/icons-material/Security";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { getBlogPath, type BlogPost } from "@/data/blogs";

interface CardVisual {
  Icon: typeof EmojiEventsIcon;
  gradient: string;
}

/** Cover art per post category (category itself is no longer printed on the card). */
const CARD_VISUALS: Record<string, CardVisual> = {
  "Bumper Guide": { Icon: EmojiEventsIcon, gradient: "linear-gradient(135deg, #B45309 0%, #D97706 55%, #F59E0B 100%)" },
  "Claim Guide": { Icon: ReceiptLongIcon, gradient: "linear-gradient(135deg, #0B3C5D 0%, #1E40AF 60%, #3B82F6 100%)" },
};
const DEFAULT_CARD_VISUAL: CardVisual = {
  Icon: MenuBookIcon,
  gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 60%, #14B8A6 100%)",
};

const getCardVisual = (category: string): CardVisual => CARD_VISUALS[category] ?? DEFAULT_CARD_VISUAL;

const COVER_SX = {
  position: "relative",
  aspectRatio: "1200 / 630",
  overflow: "hidden",
  bgcolor: "#E2E8F0",
} as const;

/** Card artwork: the post's illustrated cover (WebP with JPG fallback), or a category gradient. */
const CardCover = ({ post }: { post: BlogPost }) => {
  const { coverImage, title, category } = post;
  if (coverImage) {
    return (
      <Box sx={COVER_SX}>
        <picture>
          <source srcSet={coverImage.replace(/\.jpg$/, ".webp")} type="image/webp" />
          <Box
            component="img"
            className="card-cover-art"
            src={coverImage}
            alt={title}
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
            sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          />
        </picture>
      </Box>
    );
  }
  const { Icon, gradient } = getCardVisual(category);
  return (
    <Box aria-hidden sx={{ ...COVER_SX, background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon className="card-cover-art" sx={{ color: "#FFFFFF", fontSize: 56, opacity: 0.9, transition: "transform 0.4s ease" }} />
    </Box>
  );
};

/** "2026-11-05" → "5 Nov 2026" (UTC so server and client render the same text). */
const formatPostDate = (isoDate: string): string => {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? isoDate
    : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

interface Props {
  blogs: BlogPost[];
  featured?: BlogPost;
}

export default function BlogListClient({ blogs, featured }: Props) {
  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #1E3A8A 100%)",
          color: "#FFFFFF",
          pt: { xs: 5, md: 7 },
          pb: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Chip
            icon={<MenuBookIcon sx={{ "&&": { color: "#FDE68A", fontSize: 16 } }} />}
            label="OFFICIAL GUIDES & ARTICLES"
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
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              mb: 2,
              letterSpacing: "-0.02em",
            }}
          >
            Kerala Lottery Blog &amp; Guides
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#E2E8F0",
              maxWidth: 720,
              mx: "auto",
              fontWeight: 400,
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              lineHeight: 1.6,
            }}
          >
            Verified step-by-step procedures, prize claim tutorials, document checklists, and safety instructions direct from official Kerala State Lotteries rules.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        {/* Featured Post Card */}
        {featured && (
          <Paper
            elevation={0}
            component={Link}
            href={getBlogPath(featured.slug)}
            sx={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              p: { xs: 3, sm: 4.5 },
              mb: 6,
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "2px solid #E2E8F0",
              boxShadow: "0 10px 30px -5px rgba(11, 60, 93, 0.08)",
              transition: "all 0.25s ease-in-out",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "#0B3C5D",
                boxShadow: "0 20px 40px -10px rgba(11, 60, 93, 0.16)",
              },
            }}
          >
            <Box
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

            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Chip
                label="FEATURED GUIDE"
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  letterSpacing: "0.05em",
                }}
              />
              <Chip
                label={featured.category}
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#1E40AF",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", fontSize: "0.8rem", ml: "auto" }}>
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <span>{featured.readTime}</span>
              </Box>
            </Box>

            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 900,
                color: "#0F172A",
                fontSize: { xs: "1.45rem", sm: "1.9rem", md: "2.1rem" },
                lineHeight: 1.3,
                mb: 1.5,
                transition: "color 0.2s ease",
                "&:hover": { color: "#0B3C5D" },
              }}
            >
              {featured.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#475569",
                lineHeight: 1.7,
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                mb: 3,
                maxWidth: 900,
              }}
            >
              {featured.description}
            </Typography>

            {/* Author & CTA */}
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
                <Box
                  component="img"
                  src={featured.author.avatar}
                  alt={featured.author.name}
                  sx={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid #E2E8F0" }}
                />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0F172A" }}>
                      {featured.author.name}
                    </Typography>
                    <VerifiedIcon sx={{ fontSize: 16, color: "#0B3C5D" }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748B", fontSize: "0.75rem" }}>
                    <CalendarTodayIcon sx={{ fontSize: 13 }} />
                    <span>{featured.publishedDate}</span>
                    <span>•</span>
                    <span>{featured.author.role}</span>
                  </Box>
                </Box>
              </Box>

              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0B3C5D",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  px: 3,
                  py: 1.2,
                  borderRadius: "10px",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(11, 60, 93, 0.25)",
                  "&:hover": { bgcolor: "#0F2C59" },
                }}
              >
                Read Complete Guide
              </Button>
            </Box>
          </Paper>
        )}

        {/* Section Heading */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 6, height: 28, borderRadius: 3, background: "linear-gradient(180deg, #D9B310 0%, #F59E0B 100%)" }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 900, color: "#0B3C5D" }}>
              All Articles &amp; Tutorials
            </Typography>
          </Box>
          <Typography
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "999px",
              bgcolor: "#E0F2FE",
              color: "#0B3C5D",
              fontWeight: 800,
              fontSize: "0.78rem",
              whiteSpace: "nowrap",
            }}
          >
            {blogs.length} {blogs.length === 1 ? "guide" : "guides"}
          </Typography>
        </Box>

        {/* Blog Posts Grid */}
        <Grid container spacing={3}>
          {blogs.map((post) => {
            return (
              <Grid key={post.slug} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper
                  elevation={0}
                  component={Link}
                  href={getBlogPath(post.slug)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
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
                  <CardCover post={post} />

                  {/* Body */}
                  <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: { xs: 2.5, sm: 3 } }}>
                    <Typography
                      component="h3"
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

                    {/* Footer */}
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
                        dateTime={post.publishedDate}
                        sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748B", fontSize: "0.8rem", fontWeight: 600 }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                        {formatPostDate(post.publishedDate)}
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
                        <span>Read Guide</span>
                        <ArrowForwardIcon className="card-cta-arrow" sx={{ fontSize: 15, transition: "transform 0.2s ease" }} />
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Quick Tools & Related Resources */}
        <Box sx={{ mt: 7 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0B3C5D", mb: 2.5, textAlign: "center" }}>
            Essential Kerala Lottery Tools
          </Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                component={Link}
                href="/search"
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
                <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SearchIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                    Ticket Checker
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Instant prize verification
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                component={Link}
                href="/claim"
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
                <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmojiEventsIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                    Prize Claim Offices
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Offices &amp; claim forms
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                component={Link}
                href="/kerala-lottery-app"
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
                <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SmartphoneIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                    Mobile App
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Scanner &amp; 3 PM stream
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                component={Link}
                href="/support"
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
                <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#FAF5FF", color: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SecurityIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                    Player Safety
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Anti-scam verification
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
