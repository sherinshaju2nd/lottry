"use client";

import React, { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedIcon from "@mui/icons-material/Verified";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PrintIcon from "@mui/icons-material/Print";
import type { BlogPost, BlogDrawContext } from "@/data/blogs";
import { renderBlogContent } from "@/components/blog/blogContentRegistry";
import AuthorBio from "@/components/AuthorBio";

interface Props {
  post: BlogPost;
  /** Draw details from the database (lotteries.draw_date) for posts with a drawLotteryCode. */
  draw?: BlogDrawContext | null;
}

const DEFAULT_CTA: NonNullable<BlogPost["primaryCta"]> = {
  href: "/search",
  label: "Ticket Price Checker",
  heading: "Check Today's Winning Numbers",
  description: "Verify your ticket with the live 3:00 PM Kerala Lottery Results.",
};

export default function BlogPostClient({ post, draw = null }: Props) {
  const [copied, setCopied] = useState(false);
  const articleBody = renderBlogContent(post.slug, draw);
  const cta = post.primaryCta ?? DEFAULT_CTA;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined") {
      const text = `${post.title} - Official Kerala Lottery Guide:\n${window.location.href}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 10 }}>
      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #1E3A8A 100%)",
          color: "#FFFFFF",
          pt: { xs: 4, md: 6 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, fontSize: "0.85rem" }}>
            <Link href="/" style={{ color: "#93C5FD", textDecoration: "none", fontWeight: 600 }}>
              Home
            </Link>
            <span style={{ color: "#64748B" }}>/</span>
            <Link href="/blog" style={{ color: "#93C5FD", textDecoration: "none", fontWeight: 600 }}>
              Blog
            </Link>
            <span style={{ color: "#64748B" }}>/</span>
            <span style={{ color: "#E2E8F0" }}>{post.title}</span>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Chip
              label={post.category}
              sx={{
                bgcolor: "#FDE68A",
                color: "#92400E",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#BFDBFE", fontSize: "0.85rem" }}>
              <AccessTimeIcon sx={{ fontSize: 16 }} />
              <span>{post.readTime}</span>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#BFDBFE", fontSize: "0.85rem" }}>
              <CalendarTodayIcon sx={{ fontSize: 16 }} />
              <span>Published: {post.publishedDate}</span>
            </Box>
            <Chip
              icon={<VerifiedIcon sx={{ "&&": { color: "#34D399", fontSize: 16 } }} />}
              label="Verified Official Info"
              sx={{
                bgcolor: "rgba(52, 211, 153, 0.15)",
                color: "#A7F3D0",
                fontWeight: 700,
                fontSize: "0.75rem",
                border: "1px solid rgba(52, 211, 153, 0.3)",
              }}
            />
          </Box>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.85rem", sm: "2.6rem", md: "3.2rem" },
              lineHeight: 1.25,
              mb: 2.5,
              maxWidth: 950,
            }}
          >
            {post.title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#E2E8F0",
              fontWeight: 400,
              fontSize: { xs: "1rem", sm: "1.15rem" },
              lineHeight: 1.6,
              maxWidth: 900,
              mb: 3.5,
            }}
          >
            {post.description}
          </Typography>

          {/* Author & Action Bar */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              pt: 2.5,
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                component="img"
                src={post.author.avatar}
                alt={post.author.name}
                sx={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(255, 255, 255, 0.3)" }}
              />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#FFFFFF" }}>
                    {post.author.name}
                  </Typography>
                  <VerifiedIcon sx={{ fontSize: 16, color: "#60A5FA" }} />
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#93C5FD" }}>
                  {post.author.role}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<WhatsAppIcon />}
                onClick={handleShareWhatsApp}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  bgcolor: "rgba(37, 211, 102, 0.2)",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(37, 211, 102, 0.35)", borderColor: "#25D366" },
                }}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  fontWeight: 700,
                  textTransform: "none",
                  display: { xs: "none", sm: "inline-flex" },
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                }}
              >
                Print Guide
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content Layout with Sticky Sidebar */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Table of Contents Sticky Sidebar (Desktop) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                position: { md: "sticky" },
                top: { md: 90 },
                zIndex: 10,
                // Keep the whole sidebar reachable on short screens while it floats
                maxHeight: { md: "calc(100vh - 110px)" },
                overflowY: { md: "auto" },
                scrollbarWidth: "thin",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "18px",
                  bgcolor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentIcon sx={{ fontSize: 20 }} />
                  Table of Contents
                </Typography>
                <Box component="nav" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {post.tableOfContents.map((item, idx) => (
                    <Box
                      key={item.id}
                      component="a"
                      href={`#${item.id}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#475569",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        py: 0.5,
                        px: 1,
                        borderRadius: "6px",
                        transition: "all 0.15s ease",
                        "&:hover": { color: "#0B3C5D", bgcolor: "#EFF6FF" },
                      }}
                    >
                      <span style={{ color: "#94A3B8", fontSize: "0.75rem", minWidth: 16 }}>{idx + 1}.</span>
                      <span>{item.title}</span>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Quick Ticket Checker Banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #0F2C59 0%, #1E3A8A 100%)",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FDE68A", mb: 0.5 }}>
                  {cta.heading}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#E2E8F0", mb: 2 }}>
                  {cta.description}
                </Typography>
                <Button
                  component={Link}
                  href={cta.href}
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#D9B310",
                    color: "#0F172A",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "#EAB308" },
                  }}
                >
                  {cta.label}
                </Button>
              </Paper>
            </Box>
          </Grid>

          {/* Article Main Body */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4.5 },
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                lineHeight: 1.8,
              }}
            >
              {/* Article Body (per-post content) */}
              {articleBody}

              {/* Frequently Asked Questions */}
              <Box id="faqs" sx={{ scrollMarginTop: 100 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <HelpOutlineIcon sx={{ color: "#0B3C5D", fontSize: 28 }} />
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                    Frequently Asked Questions
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {post.faqs.map((faq, index) => (
                    <Accordion
                      key={index}
                      defaultExpanded={index === 0}
                      sx={{
                        borderRadius: "12px !important",
                        border: "1px solid #E2E8F0",
                        boxShadow: "none",
                        "&:before": { display: "none" },
                        overflow: "hidden",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#0B3C5D" }} />}
                        sx={{
                          bgcolor: "#F8FAFC",
                          "&:hover": { bgcolor: "#EFF6FF" },
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.98rem" }}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ bgcolor: "#FFFFFF", p: 2.5 }}>
                        <Typography sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.92rem" }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>

              {/* Author bio (E-E-A-T) */}
              <AuthorBio label="Written by" reviewedDate={post.updatedDate} />

              {/* Back to Blog Button */}
              <Box sx={{ mt: 6, pt: 3, borderTop: "1px solid #F1F5F9" }}>
                <Button
                  component={Link}
                  href="/blog"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    color: "#0B3C5D",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Back to All Blog Guides
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
