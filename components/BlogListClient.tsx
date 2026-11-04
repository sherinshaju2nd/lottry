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
import type { BlogPost } from "@/data/blogs";

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
            href={`/blog/${featured.slug}`}
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0B3C5D" }}>
              All Articles &amp; Tutorials
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Guides, official rules, and verification tips for lottery players
            </Typography>
          </Box>
        </Box>

        {/* Blog Posts Grid */}
        <Grid container spacing={3.5}>
          {blogs.map((post) => (
            <Grid key={post.slug} size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper
                elevation={0}
                component={Link}
                href={`/blog/${post.slug}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  textDecoration: "none",
                  color: "inherit",
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "#0B3C5D",
                    boxShadow: "0 12px 28px -6px rgba(11, 60, 93, 0.12)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Chip
                    label={post.category}
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#1E40AF",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94A3B8", fontSize: "0.75rem" }}>
                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                    <span>{post.readTime}</span>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    fontSize: "1.15rem",
                    lineHeight: 1.4,
                    mb: 1.5,
                    flexGrow: 0,
                  }}
                >
                  {post.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    lineHeight: 1.6,
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

                {/* Tags */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2 }}>
                  {post.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        bgcolor: "#F8FAFC",
                        color: "#475569",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        border: "1px solid #E2E8F0",
                      }}
                    />
                  ))}
                </Box>

                {/* Footer of card */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    {post.publishedDate}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#0B3C5D",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                    }}
                  >
                    <span>Read Guide</span>
                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
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
