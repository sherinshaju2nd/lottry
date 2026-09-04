"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import ShareButtons from "./ShareButtons";

import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  getLotteryUrl,
} from "@/lib/supabase";

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
            alt="kerala-lottery-results-logo"
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
            lineHeight: 1.65,
          }}
        >
          <strong>About Kerala State Lottery:</strong> Established in 1967, the
          Kerala state lottery scheme was envisioned by the then Finance Minister,
          P.K. Kunju Sahib. The initiative was designed to support social welfare
          programs and provide stable employment. It remains India&apos;s
          pioneer, fully transparent, government-regulated lottery platform.
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
            Ticket Price Checker
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
          <Typography
            variant="body2"
            component={Link}
            href="/contact"
            sx={{
              color: "#4B5563",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Contact Us
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
          <Typography
            variant="caption"
            sx={{
              color: "#0B3C5D",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
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
          <Typography
            variant="caption"
            sx={{
              color: "#0B3C5D",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
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

        {/* Multilingual Regional Search Keywords */}
        <Typography
          variant="caption"
          sx={{
            color: "#9CA3AF",
            display: "block",
            maxWidth: 900,
            mx: "auto",
            fontSize: "0.75rem",
            lineHeight: 1.8,
            mb: 3,
            px: 2,
          }}
        >
          (இன்றைய கேரள லாட்டரி முடிவுகள் • आज के केरल लॉटरी के नतीजे • ഇന്നത്തെ കേരള ലോട്ടറി ഫലങ്ങൾ • ಇಂದಿನ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳು • kerala লটাৰীৰ ফলাফল আজি • केरल लॉटरीचो निकाल आयज • ਕੇਰਲ ਲਾਟਰੀ ਦੇ ਅੱਜ ਦੇ ਨਤੀਜੇ • ఈరోజు కేరళ లాటరీ ఫలితాలు)
        </Typography>

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
          <strong>Disclaimer:</strong> Kerala Lottery Results Today (
          <Link
            href="https://www.keralalotteryresultstoday.in/"
            style={{ color: "#9CA3AF" }}
          >
            https://www.keralalotteryresultstoday.in/
          </Link>
          ) provides lottery draw details for informational purposes only. We
          are an independent platform and are not affiliated with the Kerala
          State Lottery Department or any government entity. Ticket holders are
          strictly advised to verify all winning serial numbers against the
          official Government Gazette notification before initiating a claim.
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
