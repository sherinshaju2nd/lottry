"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import ShareButtons from "./ShareButtons";

import { WEEKLY_LOTTERIES, BUMPER_LOTTERIES, getLotteryUrl } from "@/lib/supabase";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#FFFFFF",
        borderTop: "1px solid #E5E7EB",
        py: 6,
        mt: "auto",
      }}
    >
      <Container
        maxWidth={false}
        sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, textAlign: "center" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box
            component="img"
            src="/logo-round-192.png"
            alt="Kerala Lottery Logo"
            sx={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              objectFit: "contain",
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#4B5563",
            mb: 3,
            maxWidth: 800,
            mx: "auto",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          <strong>About Kerala Lottery:</strong> Kerala State Lottery is a
          government initiative started in 1967 by Finance Minister P.K. Kunju
          Sahib to provide employment and generate revenue for the state&apos;s
          development. It has grown to become one of India&apos;s most
          successful and transparent lottery systems, contributing significantly
          to Kerala&apos;s economy and social welfare programs.
        </Typography>

        {/* 1. Core Page Links */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: { xs: 2, sm: 3 },
            mb: 2.5,
          }}
        >
          <Typography
            variant="body2"
            component={Link}
            href="/"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Home
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/#schedule"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Weekly Draw Schedule
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/search"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Winning Ticket Checker
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/claim"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            How to Claim
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/guide"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Complete Guide
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/faq"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            FAQ
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/terms-conditions"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Terms & Conditions
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/privacy-policy"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Privacy Policy
          </Typography>
        </Box>

        {/* 2. Weekly Lotteries Direct Links */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            mb: 2,
            px: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "#0B3C5D", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Weekly Lotteries:
          </Typography>
          {WEEKLY_LOTTERIES.map((lottery) => (
            <Typography
              key={lottery.code}
              variant="body2"
              component={Link}
              href={getLotteryUrl(lottery.code)}
              sx={{
                color: "#6B7280",
                textDecoration: "none",
                fontSize: "0.825rem",
                fontWeight: 500,
                "&:hover": { color: "#0B3C5D", textDecoration: "underline" },
              }}
            >
              {lottery.name}
            </Typography>
          ))}
        </Box>

        {/* 3. Bumper Lotteries Direct Links */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            mb: 3.5,
            px: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "#0B3C5D", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Bumper Lotteries:
          </Typography>
          {BUMPER_LOTTERIES.map((bumper) => (
            <Typography
              key={bumper.code}
              variant="body2"
              component={Link}
              href={getLotteryUrl(bumper.code)}
              sx={{
                color: "#6B7280",
                textDecoration: "none",
                fontSize: "0.825rem",
                fontWeight: 500,
                "&:hover": { color: "#0B3C5D", textDecoration: "underline" },
              }}
            >
              {bumper.name}
            </Typography>
          ))}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#9CA3AF",
            mb: 3.5,
            maxWidth: 850,
            mx: "auto",
            fontSize: "0.75rem",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          Disclaimer: Kerala Lottery Result Today does not represent any
          government entity. We are not affiliated with any government
          organization and do not facilitate government services through this
          app. Our source of information is publicly available data, including
          official government websites. Users are advised to cross-check all
          information, including potential winnings, with the official
          government gazette for confirmation. Please note, this app does not
          sell lottery tickets and only displays lottery-related data.
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "#9CA3AF", display: "block" }}
        >
          © 2026 Kerala Lottery Result Today All rights reserved•{" "}
          <span style={{ color: "red", fontWeight: 700 }}>
            Important: We never sell tickets. Our role is only to share results.
          </span>
        </Typography>
      </Container>
    </Box>
  );
}
