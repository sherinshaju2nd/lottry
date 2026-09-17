"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import BoltIcon from "@mui/icons-material/Bolt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import StarIcon from "@mui/icons-material/Star";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import GetAppIcon from "@mui/icons-material/GetApp";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.keralalotteryresultstoday.app";

// Google Play Logo SVG
export function GooglePlayIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        d="M3.609 1.814L13.793 12 3.61 22.186A2.433 2.433 0 0 1 3 20.485V3.515c0-.663.226-1.267.609-1.701z"
        fill="#00D2FF"
      />
      <path
        d="M17.183 8.61L13.793 12l3.39 3.39 3.805-2.189c1.096-.631 1.096-1.771 0-2.402l-3.805-2.189z"
        fill="#FFCE00"
      />
      <path
        d="M13.793 12L3.609 1.814c.383-.434.987-.714 1.696-.307l11.878 6.83-3.39 3.663z"
        fill="#00F076"
      />
      <path
        d="M13.793 12l3.39 3.663-11.878 6.83c-.709.407-1.313.127-1.696-.307L13.793 12z"
        fill="#FF3A44"
      />
    </svg>
  );
}

// Apple Logo SVG
export function AppleIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.63 1.35-.56.65-.96 1.7-0.83 2.74 1.01.08 2.02-.47 2.54-1.22z" />
    </svg>
  );
}

// Android Logo SVG
export function AndroidIcon({ size = 20, color = "#00E676" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 4.92 6 7h12c0-2.08-.97-3.74-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
    </svg>
  );
}

// Windows 4-Tile Logo SVG
export function WindowsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M1 1h10v10H1z" fill="#F25022" />
      <path d="M13 1h10v10H13z" fill="#7FBA00" />
      <path d="M1 13h10v10H1z" fill="#00A4EF" />
      <path d="M13 13h10v10H13z" fill="#FFB900" />
    </svg>
  );
}

interface DownloadAppModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "android" | "ios" | "windows";
}

export default function DownloadAppModal({ open, onClose, defaultTab }: DownloadAppModalProps) {
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "windows">("android");
  const [canPromptDirectly, setCanPromptDirectly] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent;
      const isIOS =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isWin = /Win32|Win64|Windows/.test(ua);

      const hasPrompt = Boolean(
        (window as unknown as { deferredPwaPrompt?: { prompt: () => Promise<void> } }).deferredPwaPrompt
      );
      setCanPromptDirectly(hasPrompt);

      if (defaultTab) {
        setActiveTab(defaultTab);
      } else if (isWin) {
        setActiveTab("windows");
      } else if (isIOS) {
        setActiveTab("ios");
      }
    }
  }, [defaultTab, open]);

  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
  };

  const handleOpenIosGuide = () => {
    onClose();
    window.dispatchEvent(new CustomEvent("open-ios-install-guide"));
  };

  const handleOpenWindowsGuide = () => {
    onClose();
    window.dispatchEvent(new CustomEvent("open-windows-install-guide"));
  };

  const handleDirectWindowsInstall = async () => {
    if (typeof window === "undefined") return;
    const win = window as unknown as {
      deferredPwaPrompt?: {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
      };
    };

    if (win.deferredPwaPrompt) {
      try {
        await win.deferredPwaPrompt.prompt();
        const choice = await win.deferredPwaPrompt.userChoice;
        if (choice.outcome === "accepted") {
          win.deferredPwaPrompt = undefined;
          onClose();
        }
      } catch (err) {
        console.warn("PWA prompt error:", err);
      }
    } else {
      handleOpenWindowsGuide();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: "20px", sm: "24px" },
            p: { xs: 1.5, sm: 3 },
            background: "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 25px 50px -12px rgba(11, 60, 93, 0.25)",
            position: "relative",
            overflow: "hidden",
            maxHeight: "92vh",
          },
        },
      }}
    >
      {/* Decorative Gradient Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(11, 60, 93, 0.12) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          right: 14,
          top: 14,
          color: "#64748B",
          bgcolor: "#F1F5F9",
          "&:hover": { bgcolor: "#E2E8F0", color: "#0F172A" },
          zIndex: 2,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: { xs: 1, sm: 1.5 } }}>
        {/* App Logo & Header */}
        <Box sx={{ textAlign: "center", mt: 0.5, mb: 2 }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 0.75,
              borderRadius: "22px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 10px 25px rgba(15, 90, 36, 0.2)",
              border: "1px solid #E2E8F0",
              mb: 1.5,
            }}
          >
            <Box
              component="img"
              src="/logo-round-192.png"
              alt="Kerala Lottery App Logo"
              sx={{ width: 68, height: 68, borderRadius: "18px" }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<StarIcon sx={{ "&&": { color: "#F59E0B", fontSize: 16 } }} />}
              label="Official Kerala Lottery App"
              size="small"
              sx={{
                bgcolor: "#FEF3C7",
                color: "#92400E",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            />
            <Chip
              label="100% Free"
              size="small"
              sx={{
                bgcolor: "#DCFCE7",
                color: "#166534",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              color: "#0F172A",
              fontSize: { xs: "1.3rem", sm: "1.55rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Kerala Lottery Results Today
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748B",
              mt: 0.5,
              fontSize: "0.875rem",
              maxWidth: 440,
              mx: "auto",
            }}
          >
            കേരള ലോട്ടറി ലൈവ് റിസൾട്ട്, ടിക്കറ്റ് സ്കാനർ, ഗസറ്റ് പി.ഡി.എഫ് — മൊബൈലിലും കമ്പ്യൂട്ടറിലും!
          </Typography>
        </Box>

        {/* Platform Selection Tabs (Android, iOS, Windows PC) */}
        <Box sx={{ mb: 2.5, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              bgcolor: "#F1F5F9",
              p: 0.5,
              borderRadius: "14px",
              display: "flex",
              width: "100%",
              gap: 0.5,
            }}
          >
            <Button
              onClick={() => setActiveTab("android")}
              fullWidth
              size="small"
              startIcon={<AndroidIcon size={18} color={activeTab === "android" ? "#16A34A" : "#64748B"} />}
              sx={{
                borderRadius: "10px",
                py: 0.8,
                px: 1,
                fontWeight: 800,
                fontSize: { xs: "0.75rem", sm: "0.825rem" },
                textTransform: "none",
                bgcolor: activeTab === "android" ? "#FFFFFF" : "transparent",
                color: activeTab === "android" ? "#0F172A" : "#64748B",
                boxShadow: activeTab === "android" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                "&:hover": { bgcolor: activeTab === "android" ? "#FFFFFF" : "#E2E8F0" },
              }}
            >
              Android
            </Button>
            <Button
              onClick={() => setActiveTab("ios")}
              fullWidth
              size="small"
              startIcon={
                <Box sx={{ color: activeTab === "ios" ? "#0F172A" : "#64748B", display: "flex", alignItems: "center" }}>
                  <AppleIcon size={16} />
                </Box>
              }
              sx={{
                borderRadius: "10px",
                py: 0.8,
                px: 1,
                fontWeight: 800,
                fontSize: { xs: "0.75rem", sm: "0.825rem" },
                textTransform: "none",
                bgcolor: activeTab === "ios" ? "#FFFFFF" : "transparent",
                color: activeTab === "ios" ? "#0F172A" : "#64748B",
                boxShadow: activeTab === "ios" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                "&:hover": { bgcolor: activeTab === "ios" ? "#FFFFFF" : "#E2E8F0" },
              }}
            >
              iPhone (iOS)
            </Button>
            <Button
              onClick={() => setActiveTab("windows")}
              fullWidth
              size="small"
              startIcon={<WindowsIcon size={16} />}
              sx={{
                borderRadius: "10px",
                py: 0.8,
                px: 1,
                fontWeight: 800,
                fontSize: { xs: "0.75rem", sm: "0.825rem" },
                textTransform: "none",
                bgcolor: activeTab === "windows" ? "#FFFFFF" : "transparent",
                color: activeTab === "windows" ? "#0F172A" : "#64748B",
                boxShadow: activeTab === "windows" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                "&:hover": { bgcolor: activeTab === "windows" ? "#FFFFFF" : "#E2E8F0" },
              }}
            >
              Windows (PC)
            </Button>
          </Box>
        </Box>

        {/* Feature Badges Grid */}
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            p: 1.5,
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            mb: 2.5,
          }}
        >
          <Grid container spacing={1.25}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <BoltIcon sx={{ color: "#D97706", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.8rem" }}>
                  Live 3:00 PM Results
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <QrCodeScannerIcon sx={{ color: "#0B3C5D", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.8rem" }}>
                  Ticket Prize Checker
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <NotificationsActiveIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.8rem" }}>
                  Instant Alerts
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <PictureAsPdfIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.8rem" }}>
                  Gazette PDF Download
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* TAB CONTENT: Android */}
        {activeTab === "android" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              onClick={handleOpenPlayStore}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#0F172A",
                color: "#FFFFFF",
                py: 1.4,
                px: 2.5,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textTransform: "none",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
                border: "1px solid #334155",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#000000",
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.35)",
                },
              }}
            >
              <GooglePlayIcon size={32} />
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "#94A3B8",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  GET IT ON
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    lineHeight: 1.2,
                    mt: 0.25,
                  }}
                >
                  Google Play Store
                </Typography>
              </Box>
            </Button>

            <Typography
              variant="caption"
              sx={{ textAlign: "center", color: "#64748B", fontSize: "0.775rem" }}
            >
              ✓ Official verified release on Google Play • Instant updates
            </Typography>
          </Box>
        )}

        {/* TAB CONTENT: iOS (iPhone & iPad) */}
        {activeTab === "ios" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: "#0F172A",
                color: "#FFFFFF",
                p: 2.5,
                borderRadius: "16px",
                border: "1px solid #334155",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: "rgba(56, 189, 248, 0.2)",
                    color: "#38BDF8",
                    p: 1,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AppleIcon size={28} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
                    Install Web App on iPhone
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                    ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക (3 Steps)
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  p: 1.5,
                  borderRadius: "10px",
                  mb: 2,
                  fontSize: "0.8rem",
                  color: "#CBD5E1",
                  lineHeight: 1.6,
                }}
              >
                1. Tap <strong>Share</strong> <IosShareIcon sx={{ fontSize: 13, verticalAlign: "middle", color: "#38BDF8" }} /> in Safari<br />
                2. Tap <strong>&quot;Add to Home Screen&quot;</strong> <AddBoxOutlinedIcon sx={{ fontSize: 13, verticalAlign: "middle", color: "#10B981" }} /><br />
                3. Tap <strong>&quot;Add&quot;</strong> in top-right
              </Box>

              <Button
                onClick={handleOpenIosGuide}
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#10B981",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  py: 1.2,
                  borderRadius: "12px",
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                <TouchAppIcon sx={{ fontSize: 20 }} />
                <span>View Full Step-by-Step Guide</span>
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ textAlign: "center", color: "#64748B", fontSize: "0.775rem" }}
            >
              ✓ Fast 1-tap launcher • Native full-screen mode • 0 MB storage
            </Typography>
          </Box>
        )}

        {/* TAB CONTENT: Windows (PC & Laptops) */}
        {activeTab === "windows" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: "#0F172A",
                color: "#FFFFFF",
                p: 2.5,
                borderRadius: "16px",
                border: "1px solid #334155",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: "rgba(0, 164, 239, 0.2)",
                    p: 1,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WindowsIcon size={26} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
                    Install App on Windows (PC)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                    Desktop &amp; Taskbar Standalone App
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  p: 1.5,
                  borderRadius: "10px",
                  mb: 2,
                  fontSize: "0.8rem",
                  color: "#CBD5E1",
                  lineHeight: 1.6,
                }}
              >
                1. Look for the <strong>Install Icon (🖥️ ➕)</strong> in Chrome / Edge address bar<br />
                2. Or click Browser Menu (<strong>⋮</strong> or <strong>...</strong>) &gt; <strong>&quot;Install App&quot;</strong><br />
                3. Click <strong>&quot;Install&quot;</strong> to pin directly to Taskbar
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
                {canPromptDirectly && (
                  <Button
                    onClick={handleDirectWindowsInstall}
                    variant="contained"
                    fullWidth
                    startIcon={<GetAppIcon />}
                    sx={{
                      bgcolor: "#10B981",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      py: 1.2,
                      borderRadius: "12px",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Direct Install
                  </Button>
                )}

                <Button
                  onClick={handleOpenWindowsGuide}
                  variant={canPromptDirectly ? "outlined" : "contained"}
                  fullWidth
                  sx={{
                    bgcolor: canPromptDirectly ? "transparent" : "#0078D7",
                    borderColor: "#38BDF8",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    py: 1.2,
                    borderRadius: "12px",
                    textTransform: "none",
                    "&:hover": { bgcolor: canPromptDirectly ? "rgba(56, 189, 248, 0.15)" : "#005A9E" },
                  }}
                >
                  View Step Guide
                </Button>
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{ textAlign: "center", color: "#64748B", fontSize: "0.775rem" }}
            >
              ✓ Standalone desktop window • Pin to Taskbar &amp; Start Menu • Offline support
            </Typography>
          </Box>
        )}

        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "#94A3B8",
            mt: 2,
            fontSize: "0.75rem",
          }}
        >
          ✓ 100% Free &amp; Safe • Live 3 PM Sync • Official Gazette PDF
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
