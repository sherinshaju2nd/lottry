"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { AppleIcon } from "./DownloadAppModal";

export default function IosInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Detect if iOS (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // 2. Detect if already in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // 3. Check if user dismissed recently (within 5 days)
    const dismissedAt = localStorage.getItem("ios_pwa_dismissed_time");
    const isRecentlyDismissed =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 5 * 24 * 60 * 60 * 1000;

    if (isIOS && !isStandalone && !isRecentlyDismissed) {
      // Delay prompt slightly for great initial page experience
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem("ios_pwa_dismissed_time", Date.now().toString());
    } catch {}
  };

  const handleOpenGuide = () => {
    window.dispatchEvent(new CustomEvent("open-ios-install-guide"));
  };

  if (!showPrompt) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        left: { xs: 12, sm: "50%" },
        right: { xs: 12, sm: "auto" },
        transform: { sm: "translateX(-50%)" },
        zIndex: 1300,
        maxWidth: 480,
        width: { xs: "auto", sm: 460 },
        bgcolor: "#0F172A",
        color: "#FFFFFF",
        p: 2,
        borderRadius: "18px",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        animation: "slideUp 0.4s ease-out",
        "@keyframes slideUp": {
          "0%": { transform: { xs: "translateY(100%)", sm: "translate(-50%, 100%)" }, opacity: 0 },
          "100%": { transform: { xs: "translateY(0)", sm: "translate(-50%, 0)" }, opacity: 1 },
        },
      }}
    >
      {/* App Icon */}
      <Box
        component="img"
        src="/logo-round-192.png"
        alt="Kerala Lottery Logo"
        sx={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          flexShrink: 0,
        }}
      />

      {/* Text Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              color: "#FFFFFF",
              lineHeight: 1.2,
            }}
          >
            Install on iPhone / iPad
          </Typography>
          <Box sx={{ color: "#38BDF8", display: "inline-flex" }}>
            <AppleIcon size={14} />
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "#94A3B8",
            fontSize: "0.725rem",
            lineHeight: 1.3,
            mt: 0.25,
          }}
        >
          Tap Share <IosShareIcon sx={{ fontSize: 11, verticalAlign: "middle", color: "#38BDF8" }} /> then &quot;Add to Home Screen&quot; <AddBoxOutlinedIcon sx={{ fontSize: 11, verticalAlign: "middle", color: "#10B981" }} />
        </Typography>
      </Box>

      {/* Action Button */}
      <Button
        onClick={handleOpenGuide}
        variant="contained"
        size="small"
        sx={{
          bgcolor: "#10B981",
          color: "#FFFFFF",
          fontWeight: 800,
          fontSize: "0.75rem",
          py: 0.8,
          px: 1.5,
          borderRadius: "10px",
          textTransform: "none",
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "#059669" },
        }}
      >
        How to Install
      </Button>

      {/* Dismiss Button */}
      <IconButton
        onClick={handleDismiss}
        size="small"
        sx={{
          color: "#94A3B8",
          p: 0.5,
          "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255, 255, 255, 0.1)" },
        }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
