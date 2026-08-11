"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import ShareButtons from "./ShareButtons";

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
          sx={{ color: "#6B7280", mb: 2.5, maxWidth: 600, mx: "auto" }}
        >
          Your official destination for live Kerala lottery results today, 3:10
          PM winning ticket number verification, weekly schedule, and historical
          draw archives.
        </Typography>

        {/* <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ShareButtons variant="compact" />
        </Box> */}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
            mb: 3,
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
              "&:hover": { color: "#2E7D32" },
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
              "&:hover": { color: "#2E7D32" },
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
              "&:hover": { color: "#2E7D32" },
            }}
          >
            Winning Ticket Checker
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: "#9CA3AF", display: "block" }}
        >
          © 2026 Kerala Lottery Result Today • Kerala Lotteries Results &
          Schedule
        </Typography>
      </Container>
    </Box>
  );
}
