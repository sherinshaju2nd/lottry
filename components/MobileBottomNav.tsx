"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import InsightsIcon from "@mui/icons-material/Insights";
import { ALL_LOTTERIES, getLotteryUrl } from "@/lib/supabase";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isHome = pathname === "/";
  const isSearch = pathname === "/search";
  const isLotteries =
    pathname === "/lotteries" ||
    pathname === "/lottery" ||
    pathname.startsWith("/lottery/") ||
    ALL_LOTTERIES.some((l) => pathname.startsWith(getLotteryUrl(l.code)));
  const isAnalytics = pathname === "/analytics";

  const handleOpenScanner = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ai-ticket-scanner"));
    }
  };

  return (
    <Box
      component="nav"
      aria-label="Mobile Navigation Bar"
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1250,
        bgcolor: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 -3px 14px rgba(15, 23, 42, 0.08)",
        alignItems: "center",
        justifyContent: "space-around",
        px: 1,
        py: 0.5,
        pb: "max(6px, env(safe-area-inset-bottom, 6px))",
        height: "calc(58px + max(4px, env(safe-area-inset-bottom, 4px)))",
      }}
    >
      {/* 1. Home Tab */}
      <Box
        component={Link}
        href="/"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          color: isHome ? "#0B3C5D" : "#64748B",
          py: 0.5,
          position: "relative",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Box
          sx={{
            px: 1.6,
            py: 0.3,
            borderRadius: "16px",
            bgcolor: isHome ? "rgba(11, 60, 93, 0.12)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <HomeIcon sx={{ fontSize: 22, color: isHome ? "#0B3C5D" : "#64748B" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: isHome ? 800 : 600,
            mt: 0.2,
            letterSpacing: "-0.01em",
          }}
        >
          Home
        </Typography>
      </Box>

      {/* 2. Search Tab */}
      <Box
        component={Link}
        href="/search"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          color: isSearch ? "#0B3C5D" : "#64748B",
          py: 0.5,
          position: "relative",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Box
          sx={{
            px: 1.6,
            py: 0.3,
            borderRadius: "16px",
            bgcolor: isSearch ? "rgba(11, 60, 93, 0.12)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <SearchIcon sx={{ fontSize: 22, color: isSearch ? "#0B3C5D" : "#64748B" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: isSearch ? 800 : 600,
            mt: 0.2,
            letterSpacing: "-0.01em",
          }}
        >
          Search
        </Typography>
      </Box>

      {/* 3. Center Elevated Animated Scan Button */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          mt: -2.8,
        }}
      >
        <Box
          onClick={handleOpenScanner}
          role="button"
          tabIndex={0}
          aria-label="Open Ticket Camera Scanner"
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(11, 60, 93, 0.35)",
            border: "3px solid #FFFFFF",
            cursor: "pointer",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:active": {
              transform: "scale(0.92)",
            },
          }}
        >
          <CameraAltIcon sx={{ fontSize: 24, color: "#FFFFFF" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 800,
            color: "#0B3C5D",
            mt: 0.3,
            letterSpacing: "-0.01em",
          }}
        >
          Scan
        </Typography>
      </Box>

      {/* 4. Lotteries Tab */}
      <Box
        component={Link}
        href="/lotteries"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          color: isLotteries ? "#0B3C5D" : "#64748B",
          py: 0.5,
          position: "relative",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Box
          sx={{
            px: 1.6,
            py: 0.3,
            borderRadius: "16px",
            bgcolor: isLotteries ? "rgba(11, 60, 93, 0.12)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <ConfirmationNumberIcon
            sx={{ fontSize: 22, color: isLotteries ? "#0B3C5D" : "#64748B" }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: isLotteries ? 800 : 600,
            mt: 0.2,
            letterSpacing: "-0.01em",
          }}
        >
          Lotteries
        </Typography>
      </Box>

      {/* 5. Analytics Tab */}
      <Box
        component={Link}
        href="/analytics"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          color: isAnalytics ? "#0B3C5D" : "#64748B",
          py: 0.5,
          position: "relative",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Box
          sx={{
            px: 1.6,
            py: 0.3,
            borderRadius: "16px",
            bgcolor: isAnalytics ? "rgba(11, 60, 93, 0.12)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <InsightsIcon
            sx={{ fontSize: 22, color: isAnalytics ? "#0B3C5D" : "#64748B" }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: isAnalytics ? 800 : 600,
            mt: 0.2,
            letterSpacing: "-0.01em",
          }}
        >
          Analytics
        </Typography>
      </Box>
    </Box>
  );
}
