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
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        d="M325.3 234.3L104.6 13l280.8 161.2-60.1 59.8z"
        fill="#00E676"
      />
      <path
        d="M47 0C44 2.6 42.2 6.5 42.2 11.2v489.6c0 4.7 1.8 8.6 4.8 11.2l242.3-241.6L47 0z"
        fill="#00B0FF"
      />
      <path
        d="M428.2 202.8l-42.8-24.5-60.1 60.1 60.1 60.1 43.1-24.7c12.3-7.1 19.8-19.8 19.8-35.5s-7.5-28.4-20.1-35.5z"
        fill="#FFD600"
      />
      <path
        d="M104.6 499l280.8-161.2-60.1-59.8L104.6 499z"
        fill="#FF3D00"
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
      viewBox="0 0 170 170"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.59-7.71-11.72-14.01-6.75-10.33-12.01-22.37-15.77-36.14-3.76-13.77-5.64-26.68-5.64-38.73 0-14.28 3.59-26.15 10.78-35.61 7.18-9.46 16.29-14.28 27.32-14.47 5.22 0 11.03 1.34 17.43 4.02 6.4 2.68 10.3 4.08 11.71 4.19 1.19 0 5.4-1.45 12.63-4.35 7.23-2.9 13.06-4.13 17.5-3.69 13.08 1.08 23.36 5.89 30.84 14.43-11.74 7.09-17.46 16.89-17.15 29.41.31 9.9 4.16 18.23 11.55 24.99 7.39 6.76 16.14 10.63 26.26 11.62-2.39 7.33-5.22 14.73-8.48 22.21zM119.22 31.02c0-7.39 2.66-14.39 7.98-21.01 5.32-6.62 11.96-10.74 19.92-12.36.21 1.48.32 2.8.32 3.96 0 7.39-2.77 14.49-8.31 21.3-5.54 6.81-12.18 10.78-19.91 11.91z" />
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
              bgcolor: "#F1F5F9",
              borderRadius: "14px",
              py: 1.3,
              px: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #E2E8F0",
              color: "#64748B",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "#475569" }}>
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
                    color: "#475569",
                    fontWeight: 800,
                    fontSize: "1.1rem",
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
