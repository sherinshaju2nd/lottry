"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BoltIcon from "@mui/icons-material/Bolt";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import TranslateIcon from "@mui/icons-material/Translate";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GooglePlayIcon, AppleIcon, PLAY_STORE_URL } from "@/components/DownloadAppModal";
import { supabase, WEEKLY_LOTTERIES } from "@/lib/supabase";

const LOTTERY_PRIZES: Record<string, string> = {
  BT: "₹1,00,00,000 (₹1 Crore)",
  SS: "₹75,00,00,000 (₹75 Lakhs)",
  DL: "₹1,00,00,000 (₹1 Crore)",
  KN: "₹80,00,000 (₹80 Lakhs)",
  SK: "₹1,00,00,000 (₹1 Crore)",
  KR: "₹80,00,000 (₹80 Lakhs)",
  SM: "₹1,00,00,000 (₹1 Crore)",
  BR: "₹25,00,00,000 (₹25 Crore)",
  XN: "₹20,00,00,000 (₹20 Crore)",
  SB: "₹10,00,00,000 (₹10 Crore)",
  VB: "₹12,00,00,000 (₹12 Crore)",
  MB: "₹10,00,00,000 (₹10 Crore)",
  PB: "₹12,00,00,000 (₹12 Crore)",
};

function getTodayISTInfo() {
  const now = new Date();
  const istParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long",
  }).formatToParts(now);

  const day = istParts.find((p) => p.type === "day")?.value || "";
  const month = istParts.find((p) => p.type === "month")?.value || "";
  const year = istParts.find((p) => p.type === "year")?.value || "";
  const weekday = istParts.find((p) => p.type === "weekday")?.value || "";

  const isoDate = `${year}-${month}-${day}`;
  return { isoDate, weekday };
}

export default function AppPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | false>("faq1");
  const [todayDraw, setTodayDraw] = useState<{
    name: string;
    code: string;
    prize: string;
    isPostponed?: boolean;
  }>(() => {
    const { weekday } = getTodayISTInfo();
    const fallback =
      WEEKLY_LOTTERIES.find(
        (l) => l.day.toLowerCase() === weekday.toLowerCase(),
      ) || WEEKLY_LOTTERIES[0];
    return {
      name: fallback.name,
      code: fallback.code,
      prize: LOTTERY_PRIZES[fallback.code] || "1st Prize: ₹1,00,00,000 (₹1 Crore)",
      isPostponed: false,
    };
  });

  useEffect(() => {
    async function loadTodayDraw() {
      const { isoDate, weekday } = getTodayISTInfo();

      try {
        // 1. Check postponed
        const { data: postponed } = await supabase
          .from("postponed_draws")
          .select("draw_name, reason")
          .eq("original_date", isoDate)
          .maybeSingle();

        if (postponed) {
          setTodayDraw({
            name: postponed.draw_name || "No Draw Today",
            code: "POSTPONED",
            prize: "Draw Postponed / Cancelled",
            isPostponed: true,
          });
          return;
        }

        // 2. Check bumper
        const { data: bumperDraw } = await supabase
          .from("lotteries")
          .select("name, code, jackpot, is_bumper")
          .eq("draw_date", isoDate)
          .maybeSingle();

        if (bumperDraw) {
          setTodayDraw({
            name: bumperDraw.name,
            code: bumperDraw.code,
            prize: `1st Prize: ${bumperDraw.jackpot || LOTTERY_PRIZES[bumperDraw.code] || "Jackpot"}`,
            isPostponed: false,
          });
          return;
        }

        // 3. Check draw_results for today's draw code (e.g. SS-536)
        const { data: drawResult } = await supabase
          .from("draw_results")
          .select("draw_name, draw_code, lottery_code")
          .eq("draw_date", isoDate)
          .maybeSingle();

        if (drawResult && drawResult.draw_name) {
          const lCode = drawResult.lottery_code || drawResult.draw_code?.split("-")[0] || "BT";
          setTodayDraw({
            name: drawResult.draw_name,
            code: drawResult.draw_code || lCode,
            prize: `1st Prize: ${LOTTERY_PRIZES[lCode] || "₹1,00,00,000 (₹1 Crore)"}`,
            isPostponed: false,
          });
          return;
        }

        // 4. Query lotteries table for regular weekday lottery
        const { data: lotteries } = await supabase
          .from("lotteries")
          .select("name, code, jackpot")
          .ilike("day", weekday);

        if (lotteries && lotteries.length > 0) {
          const reg = lotteries[0];
          setTodayDraw({
            name: reg.name,
            code: reg.code,
            prize: `1st Prize: ${reg.jackpot || LOTTERY_PRIZES[reg.code] || "₹1,00,00,000 (₹1 Crore)"}`,
            isPostponed: false,
          });
          return;
        }

        // 5. Fallback from constant
        const fallback =
          WEEKLY_LOTTERIES.find(
            (l) => l.day.toLowerCase() === weekday.toLowerCase(),
          ) || WEEKLY_LOTTERIES[0];

        setTodayDraw({
          name: fallback.name,
          code: fallback.code,
          prize: `1st Prize: ${LOTTERY_PRIZES[fallback.code] || "₹1,00,00,000 (₹1 Crore)"}`,
          isPostponed: false,
        });
      } catch (err) {
        console.error("Error loading today's draw for app page preview:", err);
      }
    }

    loadTodayDraw();
  }, []);

  const handleFaqChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedFaq(isExpanded ? panel : false);
    };

  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kerala Lottery Results Today",
    operatingSystem: "ANDROID",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1280",
    },
    downloadUrl: PLAY_STORE_URL,
    description:
      "Official Kerala Lottery Results Today Android application providing real-time 3:00 PM live draw results, ticket checker scanner, official government Gazette PDF downloads, and lucky number alerts.",
  };

  const appFeatures = [
    {
      icon: <BoltIcon sx={{ fontSize: 32, color: "#D97706" }} />,
      title: "Live 3:00 PM Draw Result Stream",
      titleMl: "തത്സമയ ലൈവ് റിസൾട്ട്",
      desc: "Get instant ball-by-ball updates starting at 2:55 PM every single day directly as numbers are drawn in Thiruvananthapuram.",
      badge: "Real-Time",
      badgeColor: "#FEF3C7",
      badgeText: "#92400E",
    },
    {
      icon: <QrCodeScannerIcon sx={{ fontSize: 32, color: "#0B3C5D" }} />,
      title: "Smart Ticket Prize Checker",
      titleMl: "സ്മാർട്ട് ടിക്കറ്റ് പ്രൈസ് ചെക്കർ",
      desc: "Quickly enter your 4-digit or complete ticket serial number to check if you won 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th or consolation prize.",
      badge: "1-Sec Scan",
      badgeColor: "#E0F2FE",
      badgeText: "#0369A1",
    },
    {
      icon: <PictureAsPdfIcon sx={{ fontSize: 32, color: "#DC2626" }} />,
      title: "Official Gazette PDF Downloads",
      titleMl: "ഗസറ്റ് പി.ഡി.എഫ് ഡൗൺലോഡ്",
      desc: "Download and print clean, verified official government press-release PDF result sheets for every daily and bumper lottery draw.",
      badge: "Official Gazette",
      badgeColor: "#FEE2E2",
      badgeText: "#991B1B",
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 32, color: "#16A34A" }} />,
      title: "Instant Winning Alerts",
      titleMl: "വിന്നിംഗ് പുഷ് നോട്ടിഫിക്കേഷൻ",
      desc: "Never miss a lucky draw! Receive prompt push notifications the moment today's 1st prize winning number and full prize chart are out.",
      badge: "Push Alerts",
      badgeColor: "#DCFCE7",
      badgeText: "#166534",
    },
    {
      icon: <HistoryEduIcon sx={{ fontSize: 32, color: "#7C3AED" }} />,
      title: "Complete Historic Draw Archives",
      titleMl: "മുൻകാല റിസൾട്ടുകളുടെ ശേഖരം",
      desc: "Browse comprehensive historical results of weekly draws (Bhagyathara, Sthree Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Karunya, Samrudhi) and annual Bumpers.",
      badge: "All Lotteries",
      badgeColor: "#F3E8FF",
      badgeText: "#6B21A8",
    },
    {
      icon: <TranslateIcon sx={{ fontSize: 32, color: "#0891B2" }} />,
      title: "Bilingual: English & Malayalam",
      titleMl: "മലയാളത്തിലും ലഭ്യമാണ്",
      desc: "Seamless bilingual interface crafted for easy navigation in both Malayalam (മലയാളം) and English for user convenience across Kerala and India.",
      badge: "Malayalam + English",
      badgeColor: "#CFFAFE",
      badgeText: "#155E75",
    },
  ];

  const faqs = [
    {
      id: "faq1",
      question: "Is the Kerala Lottery Results Today Android App free?",
      questionMl: "ആപ്പ് സൗജന്യമാണോ?",
      answer:
        "Yes, the Kerala Lottery Results Today app is 100% free to download and use from the Google Play Store. There are no subscriptions or hidden charges.",
    },
    {
      id: "faq2",
      question: "How do I download and install the app from Google Play Store?",
      questionMl: "ഗൂഗിൾ പ്ലേ സ്റ്റോറിൽ നിന്ന് ആപ്പ് എങ്ങനെ ഡൗൺലോഡ് ചെയ്യാം?",
      answer:
        "Click the 'Download on Google Play' button on this page or search for 'Kerala Lottery Results Today' on Google Play Store. Tap 'Install' and the app will be ready on your phone in seconds.",
    },
    {
      id: "faq3",
      question: "When are daily lottery results updated in the app?",
      questionMl: "ദിവസേനയുള്ള റിസൾട്ടുകൾ എപ്പോഴാണ് അപ്‌ഡേറ്റ് ആകുന്നത്?",
      answer:
        "Daily lottery draw results start updating live at 2:55 PM every day. The complete official prize list and Government Gazette PDF are available by 4:00 PM.",
    },
    {
      id: "faq4",
      question: "Can I check past and bumper lottery results offline?",
      questionMl: "മുൻകാല റിസൾട്ടുകളും ബംപർ ഫലങ്ങളും കാണാൻ സാധിക്കുമോ?",
      answer:
        "Yes! The app includes complete historical archives for all 7 weekly draws and 6 annual bumper lotteries (Thiruvonam, Vishu, Pooja, Christmas New Year, Monsoon, Summer). Once loaded, results are cached for fast offline viewing.",
    },
    {
      id: "faq5",
      question: "Is there an iOS (iPhone) version available?",
      questionMl: "ഐഫോൺ (iOS) വേർഷൻ ലഭ്യമാണോ?",
      answer:
        "The iOS version is currently in development and will be launching soon on the Apple App Store. iPhone users can bookmark and use our website at https://www.keralalotteryresultstoday.in.",
    },
    {
      id: "faq6",
      question: "Does the app sell lottery tickets online?",
      questionMl: "ആപ്പിലൂടെ ലോട്ടറി ടിക്കറ്റുകൾ ഓൺലൈനായി വിൽക്കുന്നുണ്ടോ?",
      answer:
        "No. We strictly provide lottery draw results and informational tools only. As per Kerala State Lottery Department regulations, online lottery sales are strictly prohibited in Kerala. Always buy physical paper tickets from authorized government agents.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", pb: 8 }}>
      {/* Inject JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header / Breadcrumb */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          py: 2,
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{
                color: "#4B5563",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { color: "#0B3C5D" },
              }}
            >
              Back to Results
            </Button>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              /
            </Typography>
            <Typography variant="body2" sx={{ color: "#0B3C5D", fontWeight: 700 }}>
              Official Mobile App
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0B3C5D 0%, #0F172A 100%)",
          color: "#FFFFFF",
          py: { xs: 6, sm: 8, md: 10 },
        }}
      >
        {/* Glow Spheres */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(11, 60, 93, 0) 70%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            {/* Left Hero Text */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip
                  icon={<StarIcon sx={{ "&&": { color: "#F59E0B", fontSize: 16 } }} />}
                  label="4.8 ★ Rated App"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
                <Chip
                  icon={<VerifiedUserIcon sx={{ "&&": { color: "#10B981", fontSize: 16 } }} />}
                  label="Official Android Release"
                  size="small"
                  sx={{
                    bgcolor: "#10B981",
                    color: "#FFFFFF",
                    fontWeight: 800,
                  }}
                />
                <Chip
                  label="100% Free • No Login"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    color: "#E2E8F0",
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
                  lineHeight: 1.15,
                  mb: 2,
                  letterSpacing: "-0.02em",
                }}
              >
                Fastest Kerala Lottery Results App
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#38BDF8",
                  fontWeight: 800,
                  fontSize: { xs: "1.05rem", sm: "1.25rem" },
                  mb: 1.5,
                }}
              >
                തത്സമയ ലൈവ് റിസൾട്ടുകൾ 3:00 മണിക്ക് നിങ്ങളുടെ ഫോണിൽ!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#CBD5E1",
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: 620,
                }}
              >
                Experience lightning-fast 3:00 PM live Kerala lottery draw results, instant ticket number scanner, official Gazette PDF downloads, and lucky number alerts on your Android device.
              </Typography>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2,
                  mb: 4,
                }}
              >
                {/* Google Play Store Button */}
                <Button
                  onClick={handleOpenPlayStore}
                  variant="contained"
                  sx={{
                    bgcolor: "#000000",
                    color: "#FFFFFF",
                    py: 1.5,
                    px: 3,
                    minHeight: 64,
                    boxSizing: "border-box",
                    borderRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.8,
                    textTransform: "none",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    transition: "all 0.25s ease-in-out",
                    "&:hover": {
                      bgcolor: "#111827",
                      transform: "translateY(-3px)",
                      borderColor: "#10B981",
                      boxShadow: "0 14px 30px rgba(16, 185, 129, 0.3)",
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
                        fontSize: "0.68rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      GET IT ON
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#FFFFFF",
                        fontWeight: 900,
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
                    bgcolor: "#000000",
                    borderRadius: "14px",
                    py: 1.5,
                    px: 3,
                    minHeight: 64,
                    boxSizing: "border-box",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.8,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <Box sx={{ color: "#FFFFFF", display: "flex", alignItems: "center" }}>
                    <AppleIcon size={30} />
                  </Box>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "#94A3B8",
                        fontSize: "0.68rem",
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
                        color: "#FFFFFF",
                        fontWeight: 900,
                        fontSize: "1.15rem",
                        lineHeight: 1.2,
                        mt: 0.25,
                      }}
                    >
                      App Store (iOS)
                    </Typography>
                  </Box>
                  <Chip
                    label="Coming Soon"
                    size="small"
                    sx={{
                      ml: 0.5,
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "#CBD5E1",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      height: 22,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  />
                </Box>
              </Box>

              {/* Micro Trust Points */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 2, sm: 3 },
                  color: "#94A3B8",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18 }} />
                  <span>Free from Virus / Malware</span>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18 }} />
                  <span>Google Play Protect Verified</span>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18 }} />
                  <span>Daily 3 PM Live Sync</span>
                </Box>
              </Box>
            </Grid>

            {/* Right Hero Showcase Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: "relative",
                  mx: "auto",
                  maxWidth: 380,
                  p: 3,
                  borderRadius: "28px",
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  textAlign: "center",
                }}
              >
                <Box
                  component="img"
                  src="/logo-round-192.png"
                  alt="Kerala Lottery App Icon"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "24px",
                    boxShadow: "0 10px 25px rgba(15, 90, 36, 0.4)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    mb: 2,
                  }}
                />

                <Typography variant="h5" sx={{ fontWeight: 900, color: "#FFFFFF", mb: 0.5 }}>
                  Kerala Lottery Results
                </Typography>
                <Typography variant="body2" sx={{ color: "#94A3B8", mb: 2 }}>
                  Version 1.0.0 • Free for Android
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    bgcolor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    mb: 2.5,
                    textAlign: "left",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700 }}>
                      TODAY&apos;S DRAW
                    </Typography>
                    {todayDraw.isPostponed ? (
                      <Chip
                        label="NO DRAW"
                        size="small"
                        sx={{
                          bgcolor: "#EAB308",
                          color: "#000000",
                          fontWeight: 800,
                          height: 18,
                          fontSize: "0.65rem",
                        }}
                      />
                    ) : (
                      <Chip
                        label="LIVE 3:00 PM"
                        size="small"
                        sx={{
                          bgcolor: "#DC2626",
                          color: "#FFFFFF",
                          fontWeight: 800,
                          height: 18,
                          fontSize: "0.65rem",
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                    {todayDraw.name} {todayDraw.code ? `(${todayDraw.code})` : ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: todayDraw.isPostponed ? "#FBBF24" : "#34D399",
                      fontWeight: 700,
                      display: "block",
                      mt: 0.25,
                    }}
                  >
                    {todayDraw.prize}
                  </Typography>
                </Paper>

                <Button
                  onClick={handleOpenPlayStore}
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: "#10B981",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    py: 1.25,
                    borderRadius: "12px",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  Install from Play Store
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Features Grid */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, mt: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip
            label="POWERFUL FEATURES"
            size="small"
            sx={{
              bgcolor: "#EBF5FF",
              color: "#0B3C5D",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              mb: 1.5,
            }}
          />
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 900,
              color: "#111827",
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
              mb: 1.5,
            }}
          >
            Why Choose Our Official App?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6B7280",
              maxWidth: 700,
              mx: "auto",
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
            }}
          >
            Built specifically for lottery ticket buyers, agents, and daily enthusiasts across Kerala for instant, accurate, and transparent results.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {appFeatures.map((f, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: "18px",
                  border: "1px solid #E5E7EB",
                  bgcolor: "#FFFFFF",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.25s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 32px rgba(0, 0, 0, 0.07)",
                    borderColor: "#0B3C5D",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "inline-flex",
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Chip
                    label={f.badge}
                    size="small"
                    sx={{
                      bgcolor: f.badgeColor,
                      color: f.badgeText,
                      fontWeight: 800,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    fontSize: "1.15rem",
                    mb: 0.5,
                  }}
                >
                  {f.title}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#0B3C5D",
                    fontWeight: 800,
                    fontSize: "0.825rem",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  {f.titleMl}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#6B7280",
                    lineHeight: 1.65,
                    fontSize: "0.9rem",
                    flex: 1,
                  }}
                >
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How to Install Steps */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            borderRadius: "24px",
            background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
            border: "1px solid #BAE6FD",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#0B3C5D",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                mb: 1,
              }}
            >
              How to Install in 3 Easy Steps
            </Typography>
            <Typography variant="body2" sx={{ color: "#0369A1", fontWeight: 600 }}>
              ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള ലളിതമായ 3 ഘട്ടങ്ങൾ
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E0F2FE",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: "#0B3C5D",
                    mb: 1.5,
                  }}
                >
                  01
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
                  Open Google Play
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6 }}>
                  Click the &quot;Google Play&quot; download button or search for &quot;Kerala Lottery Results Today&quot; on your Android device.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E0F2FE",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: "#10B981",
                    mb: 1.5,
                  }}
                >
                  02
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
                  Tap Install
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6 }}>
                  Hit &quot;Install&quot; — the lightweight app downloads in just 5 seconds without consuming heavy phone storage or battery.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E0F2FE",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: "#D97706",
                    mb: 1.5,
                  }}
                >
                  03
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
                  Get Live 3 PM Alerts
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6 }}>
                  Open the app, check today&apos;s draw results, scan your lottery ticket, or download the official Government Gazette PDF.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* FAQs Section */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, mt: 8 }}>
        <Box sx={{ maxWidth: 850, mx: "auto" }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Chip
              label="HELP & QUESTIONS"
              size="small"
              sx={{
                bgcolor: "#EBF5FF",
                color: "#0B3C5D",
                fontWeight: 800,
                fontSize: "0.75rem",
                mb: 1.5,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#111827",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                mb: 1,
              }}
            >
              Frequently Asked Questions (FAQ)
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              മൊബൈൽ ആപ്പുമായി ബന്ധപ്പെട്ട പ്രധാന സംശയങ്ങളും ഉത്തരങ്ങളും
            </Typography>
          </Box>

          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expandedFaq === faq.id}
              onChange={handleFaqChange(faq.id)}
              sx={{
                mb: 1.5,
                borderRadius: "14px !important",
                border: "1px solid #E5E7EB",
                boxShadow: "none",
                "&:before": { display: "none" },
                "&.Mui-expanded": {
                  borderColor: "#0B3C5D",
                  boxShadow: "0 4px 14px rgba(11, 60, 93, 0.08)",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#0B3C5D" }} />}
                sx={{
                  py: 1,
                  px: 2.5,
                  "& .MuiAccordionSummary-content": { my: 1 },
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      color: "#111827",
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                    }}
                  >
                    {faq.question}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#0B3C5D",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      display: "block",
                      mt: 0.25,
                    }}
                  >
                    {faq.questionMl}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4B5563",
                    lineHeight: 1.7,
                    fontSize: "0.925rem",
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Bottom Download CTA Bar */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: "24px",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "#FFFFFF",
            textAlign: "center",
            border: "1px solid #334155",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.3)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.5rem", sm: "2.25rem" },
              mb: 1.5,
            }}
          >
            Ready for Instant 3:00 PM Results?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#94A3B8",
              maxWidth: 550,
              mx: "auto",
              mb: 4,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
            }}
          >
            Download the official Android app now and never miss a lucky winning number or official Government Gazette PDF.
          </Typography>

          <Button
            onClick={handleOpenPlayStore}
            variant="contained"
            sx={{
              bgcolor: "#10B981",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: "1.1rem",
              py: 1.6,
              px: 4,
              borderRadius: "16px",
              textTransform: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
              "&:hover": {
                bgcolor: "#059669",
                transform: "translateY(-2px)",
              },
            }}
          >
            <GooglePlayIcon size={28} />
            <span>Download Official App (Free)</span>
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
