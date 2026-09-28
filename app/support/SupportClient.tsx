"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import ShieldIcon from "@mui/icons-material/Shield";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import DevicesIcon from "@mui/icons-material/Devices";
import SpeedIcon from "@mui/icons-material/Speed";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/sherin80";
export const UPI_ID = "sherinshaju80-2@okicici";

const PRESET_AMOUNTS = ["20", "50", "100", "200", "500"];

const ROADMAP_ITEMS = [
  {
    title: "Instant 3:00 PM Live Draw Stream Engine",
    status: "Live in Production",
    statusColor: "#16A34A",
    statusBg: "#DCFCE7",
    desc: "Sub-second synchronized updates direct from official Gorky Bhavan live results.",
  },
  {
    title: "AI Camera Ticket Scanner (OCR 2.0)",
    status: "Ongoing Improvement",
    statusColor: "#D97706",
    statusBg: "#FEF3C7",
    desc: "Offline-first barcode and serial OCR recognition across diverse lighting and crumpled tickets.",
  },
  {
    title: "Voice-Activated Malayalam & Multi-lingual Search",
    status: "In Development",
    statusColor: "#2563EB",
    statusBg: "#EFF6FF",
    desc: "Speak in Malayalam, English, Hindi, or Tamil to verify draw tickets and get winners list.",
  },
  {
    title: "Deep Historical Number Frequency Analytics",
    status: "Upcoming",
    statusColor: "#9333EA",
    statusBg: "#FAF5FF",
    desc: "Advanced mathematical pattern charts, lucky district heatmaps, and recurring 4-digit trends.",
  },
];

const FAQS = [
  {
    q: "How does UPI and GPay payment work?",
    a: "You can directly scan the UPI QR code using Google Pay, PhonePe, Paytm, Super.money, BHIM, or use the UPI ID sherinshaju80-2@okicici for direct instant transfer with zero platform fee.",
  },
  {
    q: "Can I choose my own support amount?",
    a: "Yes! You can click on any preset amount chip (₹20, ₹50, ₹100, ₹200, ₹500) to update the dynamic QR code and UPI link with your desired amount.",
  },
  {
    q: "Why do you need financial support?",
    a: "We provide high-speed 3:00 PM live draw results, ticket checker utilities, AI scanner models, and historical gazette PDF archives completely free of charge. Your support covers server hosting, OCR API costs, domain services, and development time without relying on annoying intrusive pop-up ads.",
  },
  {
    q: "Is Kerala Lottery Results app affiliated with the government?",
    a: "No. We are an independent informational and utility platform built by passionate developers. We do not sell lottery tickets or facilitate gambling. All results are sourced from official government publications.",
  },
];

export default function SupportClient() {
  const [selectedAmount, setSelectedAmount] = useState<string>("50");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const getCleanAmount = (amt: string) => {
    const num = parseFloat(amt);
    if (isNaN(num) || num <= 0) return "50.00";
    return num.toFixed(2);
  };

  const getUpiPayUrl = (amt: string) => {
    const cleanAmt = getCleanAmount(amt);
    return `upi://pay?pa=${UPI_ID}&pn=Sherin%20Shaju&am=${cleanAmt}&cu=INR&tn=Kerala%20Lottery%20App%20Support`;
  };

  useEffect(() => {
    const currentUrl = getUpiPayUrl(selectedAmount);
    QRCode.toDataURL(currentUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("UPI QR Code generation error:", err));
  }, [selectedAmount]);

  const handleOpenBMC = () => {
    window.open(BUY_ME_A_COFFEE_URL, "_blank", "noopener,noreferrer");
  };

  const handleCopyUpi = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setToastMsg(`UPI ID copied: ${UPI_ID} (GPay / PhonePe / Paytm)`);
      setToastOpen(true);
    } catch {
      setToastMsg(`UPI ID: ${UPI_ID}`);
      setToastOpen(true);
    }
  };

  const handleUpiClick = () => {
    if (typeof window !== "undefined") {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const url = getUpiPayUrl(selectedAmount);
      if (isMobile) {
        window.location.href = url;
      } else {
        handleCopyUpi();
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(BUY_ME_A_COFFEE_URL);
      setToastMsg("Buy Me a Coffee link copied to clipboard! ");
      setToastOpen(true);
    } catch {
      setToastMsg("Link: " + BUY_ME_A_COFFEE_URL);
      setToastOpen(true);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Support Kerala Lottery Results Development",
          text: "Support future development and keep Kerala Lottery Results lightning fast & 100% ad-free!",
          url: BUY_ME_A_COFFEE_URL,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 8, md: 12 } }}>
      {/* Toast notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          sx={{ width: "100%", fontWeight: 700, borderRadius: "12px" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>

      {/* Hero Banner with Dark Gold Glow */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #090D16 0%, #171C2D 50%, #0F172A 100%)",
          color: "#FFFFFF",
          pt: { xs: 6, md: 9 },
          pb: { xs: 8, md: 12 },
          px: 2,
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Glow orb */}
        <Box
          sx={{
            position: "absolute",
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "350px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.22) 0%, rgba(234, 88, 12, 0.08) 50%, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="md"
          sx={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <Chip
            icon={
              <AutoAwesomeIcon
                sx={{ fontSize: "16px !important", color: "#F59E0B" }}
              />
            }
            label="SUPPORT FUTURE DEVELOPMENT"
            sx={{
              bgcolor: "rgba(245, 158, 11, 0.15)",
              color: "#FCD34D",
              fontWeight: 800,
              fontSize: "0.78rem",
              letterSpacing: "0.06em",
              mb: 2.5,
              border: "1px solid rgba(245, 158, 11, 0.35)",
              px: 1,
            }}
          />

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.2rem", sm: "3rem", md: "3.5rem" },
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              mb: 2,
              color: "#FFFFFF",
            }}
          >
            Buy Us a Coffee
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              color: "#E2E8F0",
              fontWeight: 700,
              fontSize: { xs: "1.05rem", md: "1.25rem" },
              mb: 2,
            }}
          >
            Fuel the Development of Kerala&apos;s Fastest Lottery Results &amp;
            AI Scanner
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#94A3B8",
              maxWidth: 680,
              mx: "auto",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            We are dedicated to keeping Kerala Lottery Results 100% free,
            lightning-fast, and ad-free. Your kind support helps us maintain
            high-speed 3:00 PM live draw cloud servers, train AI OCR ticket
            models, and ship continuous upgrades.
          </Typography>

          {/* Quick CTA Buttons */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              onClick={handleOpenBMC}
              variant="contained"
              size="large"
              startIcon={
                <LocalCafeIcon sx={{ color: "#000000", fontSize: 24 }} />
              }
              endIcon={
                <OpenInNewIcon sx={{ color: "#000000", fontSize: 18 }} />
              }
              sx={{
                bgcolor: "#FFDD00",
                color: "#000000",
                fontWeight: 900,
                fontSize: "1.05rem",
                px: { xs: 3.5, sm: 4.5 },
                py: 1.5,
                borderRadius: "14px",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(255, 221, 0, 0.4)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#FFE633",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 30px rgba(255, 221, 0, 0.55)",
                },
              }}
            >
              Support on Buy Me a Coffee
            </Button>

            <Button
              onClick={handleShare}
              variant="outlined"
              size="large"
              startIcon={<ShareIcon />}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.95rem",
                px: 3,
                py: 1.5,
                borderRadius: "14px",
                textTransform: "none",
                bgcolor: "rgba(255, 255, 255, 0.06)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "#38BDF8",
                },
              }}
            >
              Share with Friends
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content Container */}
      <Container
        maxWidth="lg"
        sx={{ mt: { xs: -4, md: -6 }, position: "relative", zIndex: 2 }}
      >
        {/* Two-Column Section: Why Support & QR Scan */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Why Support Matters */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                height: "100%",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    bgcolor: "#FEF2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#DC2626",
                  }}
                >
                  <FavoriteIcon />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: "#0F172A",
                      fontSize: "1.35rem",
                    }}
                  >
                    Why Your Support Matters
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748B", fontSize: "0.85rem" }}
                  >
                    Direct impact of your contribution on our platform
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* 1. Servers */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#FEF3C7",
                      color: "#D97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <SpeedIcon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                        fontSize: "0.975rem",
                      }}
                    >
                      Zero-Latency 3:00 PM Live Draw Sync
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontSize: "0.875rem", mt: 0.3 }}
                    >
                      Over 100,000+ users flood the servers at 2:55 PM every
                      day. Your support keeps our real-time database and edge
                      servers blazing fast without lag.
                    </Typography>
                  </Box>
                </Box>

                {/* 2. AI Scanner */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#EBF5FF",
                      color: "#0284C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CameraAltIcon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                        fontSize: "0.975rem",
                      }}
                    >
                      AI Camera Ticket Scanner Models
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontSize: "0.875rem", mt: 0.3 }}
                    >
                      Continuous training of specialized computer vision models
                      for instant barcode and serial OCR verification across
                      varied phone cameras.
                    </Typography>
                  </Box>
                </Box>

                {/* 3. Privacy & Ad-Free */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#F0FDF4",
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShieldIcon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                        fontSize: "0.975rem",
                      }}
                    >
                      100% Ad-Free &amp; Privacy First
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontSize: "0.875rem", mt: 0.3 }}
                    >
                      We refuse intrusive spam ads and paywalls. We believe in
                      providing a clean, respectful, privacy-focused experience
                      for all lottery enthusiasts.
                    </Typography>
                  </Box>
                </Box>

                {/* 4. Cross Platform */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#FAF5FF",
                      color: "#9333EA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <DevicesIcon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                        fontSize: "0.975rem",
                      }}
                    >
                      Mobile &amp; Web Synchronization
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontSize: "0.875rem", mt: 0.3 }}
                    >
                      Maintaining continuous updates across our Android App, iOS
                      PWA, Windows App, and web application seamlessly.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Direct Scan / QR Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "24px",
                background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Chip
                icon={<QrCode2Icon sx={{ color: "#10B981 !important" }} />}
                label="UPI • GPAY SCAN &amp; PAY"
                size="small"
                sx={{
                  bgcolor: "rgba(16, 185, 129, 0.15)",
                  color: "#34D399",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  mb: 2,
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              />

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#FFFFFF",
                  mb: 0.5,
                  fontSize: "1.35rem",
                }}
              >
                Scan to Pay via UPI / GPay
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#94A3B8",
                  fontSize: "0.85rem",
                  mb: 2,
                  maxWidth: 320,
                }}
              >
                Scan with Google Pay, PhonePe, Paytm, Super.money or BHIM to
                support directly.
              </Typography>

              {/* Amount Selection Chips */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <Button
                      key={amt}
                      size="small"
                      onClick={() => setSelectedAmount(amt)}
                      sx={{
                        minWidth: 46,
                        px: 1.2,
                        py: 0.5,
                        borderRadius: "10px",
                        bgcolor: isSelected
                          ? "#10B981"
                          : "rgba(255, 255, 255, 0.08)",
                        color: isSelected ? "#FFFFFF" : "#E2E8F0",
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        border: isSelected
                          ? "1px solid #10B981"
                          : "1px solid rgba(255, 255, 255, 0.15)",
                        "&:hover": {
                          bgcolor: isSelected
                            ? "#059669"
                            : "rgba(255, 255, 255, 0.16)",
                        },
                      }}
                    >
                      ₹{amt}
                    </Button>
                  );
                })}
              </Box>

              {/* QR Code Container */}
              <Box
                onClick={handleUpiClick}
                sx={{
                  p: 2,
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  boxShadow: "0 14px 36px rgba(0,0,0,0.4)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  mb: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.02)",
                    boxShadow: "0 18px 42px rgba(16, 185, 129, 0.3)",
                  },
                }}
              >
                {qrCodeUrl ? (
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="Scan with Google Pay, PhonePe, Paytm or any UPI App"
                    sx={{
                      width: { xs: 175, sm: 185 },
                      height: { xs: 175, sm: 185 },
                      display: "block",
                      borderRadius: "10px",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 185,
                      height: 185,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B", fontWeight: 700 }}
                    >
                      Generating UPI QR Code...
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* UPI ID Pill Box with One-Click Copy */}
              <Box
                sx={{
                  mb: 1.5,
                  px: 2,
                  py: 1,
                  bgcolor: "rgba(255, 255, 255, 0.07)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  maxWidth: 320,
                  width: "100%",
                }}
              >
                <Box sx={{ textAlign: "left", overflow: "hidden" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.7rem",
                      display: "block",
                    }}
                  >
                    UPI ID (Google Pay / GPay)
                  </Typography>
                  <Typography
                    sx={{
                      color: "#FFDD00",
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: { xs: "0.82rem", sm: "0.92rem" },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {UPI_ID}
                  </Typography>
                </Box>

                <Tooltip title="Copy UPI ID">
                  <Button
                    onClick={handleCopyUpi}
                    size="small"
                    variant="contained"
                    startIcon={
                      <ContentCopyIcon sx={{ fontSize: "14px !important" }} />
                    }
                    sx={{
                      minWidth: "auto",
                      bgcolor: "#FFDD00",
                      color: "#000000",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "8px",
                      textTransform: "none",
                      boxShadow: "0 2px 8px rgba(255, 221, 0, 0.3)",
                      "&:hover": { bgcolor: "#FFE633" },
                    }}
                  >
                    Copy
                  </Button>
                </Tooltip>
              </Box>

              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontSize: "0.75rem" }}
              >
                Google Pay (GPay) • PhonePe • Paytm • BHIM • All Banks
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Feature Development Roadmap Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: "24px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            mb: 5,
          }}
        >
          <Box sx={{ mb: 4, textAlign: { xs: "left", sm: "center" } }}>
            <Chip
              label="DEVELOPMENT ROADMAP"
              size="small"
              sx={{
                bgcolor: "#EFF6FF",
                color: "#2563EB",
                fontWeight: 800,
                fontSize: "0.75rem",
                mb: 1,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#0F172A",
                fontSize: { xs: "1.45rem", sm: "1.85rem" },
              }}
            >
              What Your Coffee Funds &amp; Builds
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Track what features are actively in development thanks to our
              generous supporters.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {ROADMAP_ITEMS.map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: "16px",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                        fontSize: "0.98rem",
                        flex: 1,
                        pr: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: item.statusBg,
                        color: item.statusColor,
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        height: 22,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748B",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* FAQs */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: "24px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            mb: 5,
          }}
        >
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#0F172A",
                fontSize: { xs: "1.4rem", sm: "1.75rem" },
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Everything you need to know about supporting Kerala Lottery
              Results development.
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            {FAQS.map((faq, idx) => (
              <Accordion
                key={idx}
                elevation={0}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px !important",
                  mb: 1.5,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#0F172A",
                      fontSize: "0.95rem",
                    }}
                  >
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                      lineHeight: 1.6,
                      fontSize: "0.9rem",
                    }}
                  >
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Paper>

        {/* Heartfelt Note */}
        <Box
          sx={{
            p: 4,
            borderRadius: "20px",
            bgcolor: "#FEF2F2",
            border: "1px solid #FECACA",
            textAlign: "center",
            maxWidth: 700,
            mx: "auto",
          }}
        >
          <FavoriteIcon sx={{ color: "#DC2626", fontSize: 32, mb: 1 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: "#991B1B", mb: 0.5 }}
          >
            Thank You for Believing in Us!
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#7F1D1D", lineHeight: 1.6, fontSize: "0.925rem" }}
          >
            Every coffee you buy keeps our servers humming and fuels our mission
            to build Kerala&apos;s most accurate and delightful lottery
            companion. We are truly grateful for every supporter!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
