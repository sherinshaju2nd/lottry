"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { GooglePlayIcon, AppleIcon, WindowsIcon, PLAY_STORE_URL } from "./DownloadAppModal";

const APP_FEATURES = [
  { icon: NotificationsActiveIcon, text: "Instant 3:00 PM result alerts" },
  { icon: QrCodeScannerIcon, text: "Scan your ticket with the camera" },
  { icon: PictureAsPdfIcon, text: "Result PDFs, even offline" },
];

// iOS & Windows open the existing global install-guide modals (LazyGlobalWidgets listens for these).
const openInstallGuide = (eventName: string) => () => {
  window.dispatchEvent(new CustomEvent(eventName));
};

const PLATFORMS = [
  {
    key: "android",
    label: "Android",
    sub: "Get it on Google Play",
    Icon: GooglePlayIcon,
    accent: "#34D399",
    href: PLAY_STORE_URL,
  },
  {
    key: "ios",
    label: "iPhone (iOS)",
    sub: "Add to Home Screen",
    Icon: AppleIcon,
    accent: "#38BDF8",
    onClick: openInstallGuide("open-ios-install-guide"),
  },
  {
    key: "windows",
    label: "Windows PC",
    sub: "1-click desktop install",
    Icon: WindowsIcon,
    accent: "#00A4EF",
    onClick: openInstallGuide("open-windows-install-guide"),
  },
];

export default function DownloadAppCard() {
  return (
    <Paper
      component="section"
      aria-labelledby="download-app-card-title"
      elevation={0}
      sx={{
        mt: 3,
        p: { xs: 2.5, sm: 3 },
        borderRadius: "20px",
        background: "linear-gradient(135deg, #090D16 0%, #0F172A 100%)",
        color: "#FFFFFF",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Ambient glow (matches the footer app-download banner) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-40%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 340,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.16) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.75 }}>
          <PhoneIphoneIcon sx={{ color: "#38BDF8", fontSize: 22 }} />
          <Typography
            id="download-app-card-title"
            component="h2"
            sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#FFFFFF" }}
          >
            Download Our App
          </Typography>
        </Box>
        <Typography sx={{ color: "#94A3B8", fontSize: "0.86rem", lineHeight: 1.5, mb: 2 }}>
          Free, lightweight and installs in seconds. Get live Kerala lottery results on any device.
        </Typography>

        {/* Platform install buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          {PLATFORMS.map(({ key, label, sub, Icon, accent, href, onClick }) => (
            <Button
              key={key}
              {...(href
                ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" }
                : { onClick })}
              aria-label={`Install on ${label}`}
              sx={{
                justifyContent: "flex-start",
                gap: 1.5,
                px: 1.75,
                py: 1.1,
                borderRadius: "14px",
                textTransform: "none",
                color: "#FFFFFF",
                bgcolor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.12)",
                  borderColor: accent,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </Box>
              <Box sx={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.2 }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", lineHeight: 1.3 }}>{sub}</Typography>
              </Box>
              <ChevronRightIcon sx={{ color: accent, fontSize: 20 }} />
            </Button>
          ))}
        </Box>

        {/* Why install */}
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mb: 2, textAlign: "left" }}>
          {APP_FEATURES.map(({ icon: FeatureIcon, text }) => (
            <Box component="li" key={text} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.4 }}>
              <FeatureIcon sx={{ fontSize: 16, color: "#34D399" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#CBD5E1" }}>{text}</Typography>
            </Box>
          ))}
        </Box>

        <Button
          component={Link}
          href="/kerala-lottery-app"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "#94A3B8",
            "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255, 255, 255, 0.06)" },
          }}
        >
          See all app features
        </Button>
      </Box>
    </Paper>
  );
}
