"use client";

import React from "react";
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

interface DownloadAppModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ open, onClose }: DownloadAppModalProps) {
  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
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
            borderRadius: "20px",
            p: { xs: 1.5, sm: 3 },
            background: "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 25px 50px -12px rgba(11, 60, 93, 0.25)",
            position: "relative",
            overflow: "hidden",
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
        <Box sx={{ textAlign: "center", mt: 1, mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 0.75,
              borderRadius: "22px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 10px 25px rgba(15, 90, 36, 0.2)",
              border: "1px solid #E2E8F0",
              mb: 2,
            }}
          >
            <Box
              component="img"
              src="/logo-round-192.png"
              alt="Kerala Lottery App Logo"
              sx={{ width: 72, height: 72, borderRadius: "18px" }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1 }}>
            <Chip
              icon={<StarIcon sx={{ "&&": { color: "#F59E0B", fontSize: 16 } }} />}
              label="Official Android App"
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
              fontSize: { xs: "1.35rem", sm: "1.6rem" },
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
              fontSize: "0.9rem",
              maxWidth: 420,
              mx: "auto",
            }}
          >
            കേരള ലോട്ടറി ലൈവ് റിസൾട്ട്, ടിക്കറ്റ് സ്കാനർ, ഗസറ്റ് പി.ഡി.എഫ് — വേഗത്തിൽ നിങ്ങളുടെ മൊബൈലിൽ!
          </Typography>
        </Box>

        {/* Feature Badges Grid */}
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            p: 2,
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            mb: 3,
          }}
        >
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BoltIcon sx={{ color: "#D97706", fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.825rem" }}>
                  Live 3:00 PM Results
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <QrCodeScannerIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.825rem" }}>
                  Ticket Prize Checker
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NotificationsActiveIcon sx={{ color: "#16A34A", fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.825rem" }}>
                  Instant Alerts
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PictureAsPdfIcon sx={{ color: "#DC2626", fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.825rem" }}>
                  Gazette PDF Download
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Download Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Google Play Store Button */}
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

          {/* Apple App Store (Coming Soon) Button */}
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              borderRadius: "14px",
              py: 1.4,
              px: 2.5,
              minHeight: 64,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #E2E8F0",
              color: "#64748B",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "#334155", display: "flex", alignItems: "center" }}>
                <AppleIcon size={30} />
              </Box>
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
                  DOWNLOAD ON THE
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#334155",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    lineHeight: 1.2,
                    mt: 0.25,
                  }}
                >
                  Apple App Store
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Coming Soon"
              size="small"
              sx={{
                bgcolor: "#E2E8F0",
                color: "#475569",
                fontWeight: 800,
                fontSize: "0.725rem",
              }}
            />
          </Box>
        </Box>

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
          ✓ Safe & Verified • Fast Updates • No login required
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
