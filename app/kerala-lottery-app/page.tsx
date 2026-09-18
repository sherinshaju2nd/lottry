"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Tooltip from "@mui/material/Tooltip";

// Icons
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import LaunchIcon from "@mui/icons-material/Launch";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import DevicesIcon from "@mui/icons-material/Devices";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import { GooglePlayIcon, AppleIcon, AndroidIcon, WindowsIcon, PLAY_STORE_URL } from "@/components/DownloadAppModal";
import { supabase, WEEKLY_LOTTERIES } from "@/lib/supabase";

const LOTTERY_PRIZES: Record<string, string> = {
  BT: "₹1,00,00,000 (₹1 Crore)",
  SS: "₹75,00,000 (₹75 Lakhs)",
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

export default function KeralaLotteryAppPage() {
  const [platformTab, setPlatformTab] = useState<"ios" | "windows" | "android">("ios");
  const [detectedOs, setDetectedOs] = useState<string>("iOS");
  const [isDirectInstallReady, setIsDirectInstallReady] = useState<boolean>(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | false>("faq_ios");

  // Video Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);

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

  // Detect User OS & PWA install readiness
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent;
      const isIOS =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isWindows = /Win32|Win64|Windows/.test(ua);
      const isAndroid = /Android/.test(ua);

      if (isIOS) {
        setDetectedOs("iOS");
        setPlatformTab("ios");
      } else if (isWindows) {
        setDetectedOs("Windows");
        setPlatformTab("windows");
      } else if (isAndroid) {
        setDetectedOs("Android");
        setPlatformTab("android");
      } else {
        setDetectedOs("Desktop");
        setPlatformTab("windows");
      }

      // Check if deferred install prompt is available
      const checkPrompt = () => {
        const hasPrompt = Boolean(
          (window as unknown as { deferredPwaPrompt?: { prompt: () => Promise<void> } }).deferredPwaPrompt
        );
        setIsDirectInstallReady(hasPrompt);
      };

      checkPrompt();

      const handlePwaReady = () => {
        setIsDirectInstallReady(true);
      };

      window.addEventListener("pwa-install-ready", handlePwaReady);
      window.addEventListener("beforeinstallprompt", checkPrompt);

      return () => {
        window.removeEventListener("pwa-install-ready", handlePwaReady);
        window.removeEventListener("beforeinstallprompt", checkPrompt);
      };
    }
  }, []);

  // Fetch today's lottery draw for preview badge
  useEffect(() => {
    async function loadTodayDraw() {
      const { isoDate, weekday } = getTodayISTInfo();

      try {
        const { data: postponed } = await supabase
          .from("postponed_draws")
          .select("lottery_code, reason, status")
          .eq("draw_date", isoDate)
          .maybeSingle();

        if (postponed) {
          setTodayDraw({
            name: postponed.reason || "No Draw Today",
            code: "POSTPONED",
            prize: "Draw Postponed / Cancelled",
            isPostponed: true,
          });
          return;
        }

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
        console.error("Error loading today's draw preview:", err);
      }
    }

    loadTodayDraw();
  }, []);

  // Direct Windows/Desktop PWA Install Trigger
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
          setInstallSuccessMessage("App successfully installed on your computer!");
          win.deferredPwaPrompt = undefined;
          setIsDirectInstallReady(false);
        }
      } catch (err) {
        console.warn("PWA prompt error:", err);
      }
    } else {
      // If browser hasn't fired prompt, open the visual guide or advise user
      setInstallSuccessMessage("Look for the Install icon (🖥️ ➕) in your browser address bar or menu!");
      setTimeout(() => setInstallSuccessMessage(null), 6000);
    }
  };

  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const appFeatures = [
    {
      icon: <BoltIcon sx={{ fontSize: 26, color: "#38BDF8" }} />,
      title: "3:00 PM Live Draw Stream",
      titleMl: "തത്സമയ ലൈവ് റിസൾട്ട്",
      desc: "Live ball-by-ball updates at 2:55 PM every day directly as drawn at Gorky Bhavan, Thiruvananthapuram.",
      badge: "Real-Time",
    },
    {
      icon: <QrCodeScannerIcon sx={{ fontSize: 26, color: "#818CF8" }} />,
      title: "Smart Prize Checker",
      titleMl: "സ്മാർട്ട് ടിക്കറ്റ് പ്രൈസ് ചെക്കർ",
      desc: "Enter 4 digits or full serial number to instantly verify 1st to 8th prizes and consolation rewards in 1 second.",
      badge: "Instant Scan",
    },
    {
      icon: <PictureAsPdfIcon sx={{ fontSize: 26, color: "#F472B6" }} />,
      title: "Official Gazette PDF",
      titleMl: "ഗസറ്റ് പി.ഡി.എഫ് ഡൗൺലോഡ്",
      desc: "Download verified official government press-release PDF sheets for every daily & bumper lottery draw.",
      badge: "Official Gazette",
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 26, color: "#34D399" }} />,
      title: "Winning Number Alerts",
      titleMl: "വിന്നിംഗ് പുഷ് നോട്ടിഫിക്കേഷൻ",
      desc: "Instant notification the minute today's 1st prize winning number and full prize chart are announced.",
      badge: "Push Alerts",
    },
    {
      icon: <HistoryEduIcon sx={{ fontSize: 26, color: "#A78BFA" }} />,
      title: "Complete Draw Archives",
      titleMl: "മുൻകാല റിസൾട്ടുകളുടെ ശേഖരം",
      desc: "Search historical results of all 7 weekly draws and seasonal Bumper lotteries (Onam, Vishu, Pooja, Christmas).",
      badge: "Full History",
    },
    {
      icon: <TranslateIcon sx={{ fontSize: 26, color: "#38BDF8" }} />,
      title: "Malayalam & English",
      titleMl: "മലയാളത്തിലും ലഭ്യമാണ്",
      desc: "Clean bilingual interface built for easy navigation in both Malayalam (മലയാളം) and English.",
      badge: "Bilingual",
    },
  ];

  const faqs = [
    {
      id: "faq_ios",
      question: "How do I install the app on iPhone / iPad (iOS)?",
      questionMl: "ഐഫോണിൽ (iOS) ആപ്പ് എങ്ങനെ ഇൻസ്റ്റാൾ ചെയ്യാം?",
      answer:
        "Open this website in Safari, tap the Share icon (📤) in the bottom bar, scroll down and tap 'Add to Home Screen' (➕ / ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക), then tap 'Add' at the top-right. The app instantly appears on your iPhone home screen with 0 MB storage used!",
    },
    {
      id: "faq_win",
      question: "How do I install on Windows 10 / 11 PC?",
      questionMl: "വിൻഡോസ് കമ്പ്യൂട്ടറിൽ (Windows PC) ആപ്പ് എങ്ങനെ ഇൻസ്റ്റാൾ ചെയ്യാം?",
      answer:
        "Click the 'Direct Install on Windows' button on this page. If prompted by Chrome or Edge, click 'Install'. Alternatively, click the computer install icon (🖥️ ➕) in the address bar. The standalone app launches in its own native window and can be pinned to your Taskbar.",
    },
    {
      id: "faq_android",
      question: "Is the app free to download from Google Play Store?",
      questionMl: "ഗൂഗിൾ പ്ലേ സ്റ്റോറിൽ നിന്ന് ആപ്പ് സൗജന്യമാണോ?",
      answer:
        "Yes, the Kerala Lottery Results Today app is 100% free with no subscription or hidden charges. Simply click 'Download on Google Play' or search for 'Kerala Lottery Results Today' on the Play Store.",
    },
    {
      id: "faq_security",
      question: "Does the app consume heavy battery or phone storage?",
      questionMl: "ആപ്പ് കൂടുതൽ സ്റ്റോറേജ് എടുക്കുമോ?",
      answer:
        "Not at all. The iOS and Windows versions use lightweight progressive web technology (0 MB phone storage), while the Android app is optimized under 15 MB for lightning-fast speeds on all mobile networks.",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "#090D16",
        color: "#F1F5F9",
        minHeight: "100vh",
        pb: 10,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Background Ambient Glows */}
      <Box
        sx={{
          position: "fixed",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(14, 116, 144, 0.18) 0%, rgba(99, 102, 241, 0.1) 40%, rgba(9, 13, 22, 0) 75%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "10%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(9, 13, 22, 0) 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Breadcrumb Navigation */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          bgcolor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(12px)",
          py: 1.5,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
              size="small"
              sx={{
                color: "#94A3B8",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.85rem",
                "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255, 255, 255, 0.06)" },
              }}
            >
              Back to Results
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                icon={<DevicesIcon sx={{ "&&": { color: "#38BDF8", fontSize: 15 } }} />}
                label={`Detected: ${detectedOs}`}
                size="small"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  color: "#E2E8F0",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Header */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 4, sm: 6 }, pb: 4 }}>
        <Box sx={{ textAlign: "center", maxWidth: 780, mx: "auto", mb: 4 }}>
          {/* Top Pill Badges */}
          <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
            <Chip
              icon={<StarIcon sx={{ "&&": { color: "#FBBF24", fontSize: 14 } }} />}
              label="4.8 ★ Rated App"
              size="small"
              sx={{
                bgcolor: "rgba(251, 191, 36, 0.1)",
                color: "#FDE68A",
                fontWeight: 800,
                fontSize: "0.75rem",
                border: "1px solid rgba(251, 191, 36, 0.25)",
              }}
            />
            <Chip
              label="100% Free • No Login"
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.06)",
                color: "#E2E8F0",
                fontWeight: 700,
                fontSize: "0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
            <Chip
              icon={<ShieldOutlinedIcon sx={{ "&&": { color: "#34D399", fontSize: 14 } }} />}
              label="0 MB Storage • Instant Access"
              size="small"
              sx={{
                bgcolor: "rgba(52, 211, 153, 0.1)",
                color: "#A7F3D0",
                fontWeight: 700,
                fontSize: "0.75rem",
                border: "1px solid rgba(52, 211, 153, 0.2)",
              }}
            />
          </Box>

          {/* Main Title */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.8rem", md: "3.4rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              mb: 1.5,
            }}
          >
            Get the Official <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kerala Lottery App
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#94A3B8",
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              lineHeight: 1.6,
              maxWidth: 620,
              mx: "auto",
              mb: 2,
            }}
          >
            Live 3:00 PM draw results, instant ticket barcode scanner, official Gazette PDFs, and lucky number alerts on iPhone, Windows PC, and Android.
          </Typography>

          {/* Today's Draw Status Glass Strip */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1,
              borderRadius: "100px",
              bgcolor: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: todayDraw.isPostponed ? "#FBBF24" : "#34D399",
                boxShadow: todayDraw.isPostponed
                  ? "0 0 10px #FBBF24"
                  : "0 0 10px #34D399",
              }}
            />
            <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#E2E8F0", fontWeight: 700 }}>
              Today&apos;s Draw: <strong style={{ color: "#38BDF8" }}>{todayDraw.name}</strong> {todayDraw.code ? `(${todayDraw.code})` : ""}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.8rem", display: { xs: "none", sm: "inline" } }}>
              • {todayDraw.prize}
            </Typography>
          </Box>
        </Box>

        {/* Platform Selector Tabs (iOS Glass Pill Style) */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 0.6,
              borderRadius: "100px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
              gap: 0.5,
            }}
          >
            {/* iOS Button */}
            <Button
              onClick={() => setPlatformTab("ios")}
              sx={{
                borderRadius: "100px",
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: 800,
                textTransform: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.25s ease",
                bgcolor: platformTab === "ios" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                color: platformTab === "ios" ? "#FFFFFF" : "#94A3B8",
                border: platformTab === "ios" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid transparent",
                boxShadow: platformTab === "ios" ? "0 4px 16px rgba(0, 0, 0, 0.25)" : "none",
                "&:hover": {
                  bgcolor: platformTab === "ios" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.06)",
                  color: "#FFFFFF",
                },
              }}
            >
              <AppleIcon size={18} />
              <span>iPhone / iOS</span>
              {detectedOs === "iOS" && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#38BDF8",
                    boxShadow: "0 0 8px #38BDF8",
                  }}
                />
              )}
            </Button>

            {/* Windows PC Button */}
            <Button
              onClick={() => setPlatformTab("windows")}
              sx={{
                borderRadius: "100px",
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: 800,
                textTransform: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.25s ease",
                bgcolor: platformTab === "windows" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                color: platformTab === "windows" ? "#FFFFFF" : "#94A3B8",
                border: platformTab === "windows" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid transparent",
                boxShadow: platformTab === "windows" ? "0 4px 16px rgba(0, 0, 0, 0.25)" : "none",
                "&:hover": {
                  bgcolor: platformTab === "windows" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.06)",
                  color: "#FFFFFF",
                },
              }}
            >
              <WindowsIcon size={16} />
              <span>Windows PC</span>
              {detectedOs === "Windows" && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#38BDF8",
                    boxShadow: "0 0 8px #38BDF8",
                  }}
                />
              )}
            </Button>

            {/* Android Button */}
            <Button
              onClick={() => setPlatformTab("android")}
              sx={{
                borderRadius: "100px",
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: 800,
                textTransform: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.25s ease",
                bgcolor: platformTab === "android" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                color: platformTab === "android" ? "#FFFFFF" : "#94A3B8",
                border: platformTab === "android" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid transparent",
                boxShadow: platformTab === "android" ? "0 4px 16px rgba(0, 0, 0, 0.25)" : "none",
                "&:hover": {
                  bgcolor: platformTab === "android" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.06)",
                  color: "#FFFFFF",
                },
              }}
            >
              <AndroidIcon size={16} color="#34D399" />
              <span>Android</span>
              {detectedOs === "Android" && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#38BDF8",
                    boxShadow: "0 0 8px #38BDF8",
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* PLATFORM 1: iOS TAB (With Video & Short Step-by-Step Guide)   */}
        {/* ============================================================ */}
        {platformTab === "ios" && (
          <Box
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: "28px",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
              transition: "all 0.3s ease",
            }}
          >
            <Grid container spacing={4} sx={{ alignItems: "center" }}>
              {/* Left Column: Short Step Guide & Benefits */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Chip
                      icon={<AppleIcon size={14} />}
                      label="iPhone & iPad Safari Setup"
                      size="small"
                      sx={{
                        bgcolor: "rgba(56, 189, 248, 0.12)",
                        color: "#38BDF8",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                      }}
                    />
                    <Chip
                      label="Takes 5 Seconds"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.06)",
                        color: "#E2E8F0",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      letterSpacing: "-0.02em",
                      mb: 1,
                    }}
                  >
                    How to Install on iPhone (iOS)
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    Follow the short 3-step video or steps below in <strong>Safari</strong> to add the app icon directly to your iPhone home screen with <strong>0 MB storage used</strong>.
                  </Typography>
                </Box>

                {/* 3 Step Cards (iOS Glass Style) */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3.5 }}>
                  {/* Step 1 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 2,
                      borderRadius: "18px",
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.07)",
                        borderColor: "rgba(56, 189, 248, 0.4)",
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        bgcolor: "rgba(56, 189, 248, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        color: "#38BDF8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      1
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}>
                          Tap Share (📤) in Safari
                        </Typography>
                        <IosShareIcon sx={{ fontSize: 16, color: "#38BDF8" }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        Open this website in Safari and tap the <strong>Share button (📤)</strong> at the bottom bar.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Step 2 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 2,
                      borderRadius: "18px",
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.07)",
                        borderColor: "rgba(129, 140, 248, 0.4)",
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        bgcolor: "rgba(129, 140, 248, 0.15)",
                        border: "1px solid rgba(129, 140, 248, 0.3)",
                        color: "#818CF8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      2
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}>
                          Select &quot;Add to Home Screen&quot;
                        </Typography>
                        <AddBoxOutlinedIcon sx={{ fontSize: 16, color: "#818CF8" }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        Scroll down and tap <strong>&quot;Add to Home Screen&quot; (ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക)</strong>.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Step 3 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 2,
                      borderRadius: "18px",
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.07)",
                        borderColor: "rgba(52, 211, 153, 0.4)",
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        bgcolor: "rgba(52, 211, 153, 0.15)",
                        border: "1px solid rgba(52, 211, 153, 0.3)",
                        color: "#34D399",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      3
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}>
                          Tap &quot;Add&quot; in Top-Right
                        </Typography>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#34D399" }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        Tap <strong>&quot;Add&quot;</strong> in the top-right corner. The app icon will appear on your iPhone screen!
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Key iOS Highlights Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                  <Chip
                    icon={<CheckCircleIcon sx={{ "&&": { color: "#38BDF8", fontSize: 15 } }} />}
                    label="Instant 1-Tap 3 PM Live Sync"
                    size="small"
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontWeight: 700 }}
                  />
                  <Chip
                    icon={<CheckCircleIcon sx={{ "&&": { color: "#38BDF8", fontSize: 15 } }} />}
                    label="0 MB Phone Storage Used"
                    size="small"
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontWeight: 700 }}
                  />
                  <Chip
                    icon={<CheckCircleIcon sx={{ "&&": { color: "#38BDF8", fontSize: 15 } }} />}
                    label="Full-Screen Native UI"
                    size="small"
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontWeight: 700 }}
                  />
                </Box>
              </Grid>

              {/* Right Column: Sleek iPhone Frame Video Player */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* iPhone Bezel Mockup Frame */}
                  <Box
                    sx={{
                      width: { xs: 260, sm: 290 },
                      borderRadius: "44px",
                      p: "10px",
                      bgcolor: "#1E293B",
                      border: "3px solid rgba(255, 255, 255, 0.18)",
                      boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top Notch / Dynamic Island */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 80,
                        height: 18,
                        borderRadius: "14px",
                        bgcolor: "#000000",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#1E293B" }} />
                    </Box>

                    {/* Video Player Box */}
                    <Box
                      sx={{
                        borderRadius: "36px",
                        overflow: "hidden",
                        position: "relative",
                        bgcolor: "#000000",
                        aspectRatio: "9/19.5",
                        width: "100%",
                      }}
                    >
                      <video
                        ref={videoRef}
                        src="/ios-install-steps.mp4"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      {/* Video Quick Controls Overlay */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 0.6,
                          borderRadius: "100px",
                          bgcolor: "rgba(15, 23, 42, 0.75)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          zIndex: 5,
                        }}
                      >
                        <Tooltip title={isPlaying ? "Pause" : "Play"}>
                          <IconButton
                            size="small"
                            onClick={togglePlay}
                            sx={{ color: "#FFFFFF", p: 0.6, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
                          >
                            {isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Replay from start">
                          <IconButton
                            size="small"
                            onClick={restartVideo}
                            sx={{ color: "#FFFFFF", p: 0.6, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
                          >
                            <ReplayIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                          <IconButton
                            size="small"
                            onClick={toggleMute}
                            sx={{ color: "#FFFFFF", p: 0.6, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
                          >
                            {isMuted ? <VolumeOffIcon sx={{ fontSize: 16 }} /> : <VolumeUpIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748B",
                      mt: 1.5,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      fontSize: "0.72rem",
                    }}
                  >
                    ▶ Live Visual Guide • Safari PWA Installation
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============================================================ */}
        {/* PLATFORM 2: WINDOWS PC TAB (Direct 1-Click Install Button)   */}
        {/* ============================================================ */}
        {platformTab === "windows" && (
          <Box
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: "28px",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
              transition: "all 0.3s ease",
            }}
          >
            <Grid container spacing={4} sx={{ alignItems: "center" }}>
              {/* Left Column: Direct Install Actions */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={<WindowsIcon size={14} />}
                      label="Windows 10 / 11 Desktop App"
                      size="small"
                      sx={{
                        bgcolor: "rgba(0, 164, 239, 0.12)",
                        color: "#38BDF8",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        border: "1px solid rgba(0, 164, 239, 0.25)",
                      }}
                    />
                    <Chip
                      label={isDirectInstallReady ? "⚡ Ready for 1-Click Install" : "Chrome / Edge PWA"}
                      size="small"
                      sx={{
                        bgcolor: isDirectInstallReady ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.06)",
                        color: isDirectInstallReady ? "#A7F3D0" : "#CBD5E1",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        border: isDirectInstallReady ? "1px solid rgba(52, 211, 153, 0.3)" : "none",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: { xs: "1.6rem", sm: "2.2rem" },
                      letterSpacing: "-0.02em",
                      mb: 1,
                    }}
                  >
                    Install on Windows PC
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.98rem",
                      lineHeight: 1.65,
                      mb: 3,
                    }}
                  >
                    Run Kerala Lottery Results as a standalone desktop application on Windows with 1-click instant launch, Taskbar pinning, and offline capabilities.
                  </Typography>

                  {/* Primary 1-Click Install Button */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 3 }}>
                    <Button
                      onClick={handleDirectWindowsInstall}
                      variant="contained"
                      sx={{
                        py: 1.6,
                        px: 3.5,
                        borderRadius: "16px",
                        fontWeight: 900,
                        fontSize: "1.05rem",
                        textTransform: "none",
                        background: "linear-gradient(135deg, #0078D7 0%, #005A9E 100%)",
                        color: "#FFFFFF",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1.5,
                        boxShadow: "0 12px 28px rgba(0, 120, 215, 0.35)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          background: "linear-gradient(135deg, #0086F0 0%, #0066B3 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 16px 36px rgba(0, 120, 215, 0.45)",
                        },
                      }}
                    >
                      <WindowsIcon size={22} />
                      <span>Direct Install on Windows</span>
                    </Button>
                  </Box>

                  {/* Success or Helper Feedback */}
                  {installSuccessMessage && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        color: "#E0F2FE",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        mb: 3,
                      }}
                    >
                      💡 {installSuccessMessage}
                    </Box>
                  )}

                  {/* Quick Feature Checklist */}
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#38BDF8", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 700 }}>
                          Dedicated Window (No browser clutter)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#38BDF8", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 700 }}>
                          Pin to Taskbar &amp; Start Menu
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#38BDF8", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 700 }}>
                          Lightning Fast 3 PM Live Sync
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#38BDF8", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 700 }}>
                          0 MB Disk Space Overhead
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Right Column: 3-Step Visual Card for Manual Browser Install */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "22px",
                    bgcolor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <DesktopWindowsIcon sx={{ color: "#38BDF8", fontSize: 20 }} />
                    Browser Installation Steps
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Step 1 */}
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                          color: "#38BDF8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "0.8rem",
                          flexShrink: 0,
                        }}
                      >
                        1
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.875rem" }}>
                          Address Bar Install Icon
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", lineHeight: 1.4 }}>
                          In Google Chrome or Microsoft Edge, look for the <strong>Install icon (🖥️ ➕)</strong> on the right side of the address bar.
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step 2 */}
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                          color: "#38BDF8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "0.8rem",
                          flexShrink: 0,
                        }}
                      >
                        2
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.875rem" }}>
                          Or via Menu (⋮ / ...)
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", lineHeight: 1.4 }}>
                          Click browser menu &gt; <strong>&quot;Install Kerala Lottery Results&quot;</strong> (or <em>Apps &gt; Install this site as an app</em>).
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step 3 */}
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                          color: "#34D399",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "0.8rem",
                          flexShrink: 0,
                        }}
                      >
                        3
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.875rem" }}>
                          Pin to Taskbar
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", lineHeight: 1.4 }}>
                          Click <strong>&quot;Install&quot;</strong> — the app runs independently and can be pinned to your Taskbar.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============================================================ */}
        {/* PLATFORM 3: ANDROID TAB (Google Play Store Direct Link)      */}
        {/* ============================================================ */}
        {platformTab === "android" && (
          <Box
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: "28px",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
              transition: "all 0.3s ease",
            }}
          >
            <Grid container spacing={4} sx={{ alignItems: "center" }}>
              {/* Left Column: Play Store Action */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={<AndroidIcon size={14} color="#34D399" />}
                      label="Official Android Release"
                      size="small"
                      sx={{
                        bgcolor: "rgba(52, 211, 153, 0.12)",
                        color: "#A7F3D0",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        border: "1px solid rgba(52, 211, 153, 0.25)",
                      }}
                    />
                    <Chip
                      label="Play Protect Verified"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.06)",
                        color: "#E2E8F0",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: { xs: "1.6rem", sm: "2.2rem" },
                      letterSpacing: "-0.02em",
                      mb: 1,
                    }}
                  >
                    Download on Android
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.98rem",
                      lineHeight: 1.65,
                      mb: 3,
                    }}
                  >
                    Get instant 3:00 PM live draw results, ticket barcode scanner, official Gazette PDFs, and winning push notifications on your Android device.
                  </Typography>

                  {/* Google Play Store Direct Button */}
                  <Button
                    onClick={handleOpenPlayStore}
                    variant="contained"
                    sx={{
                      bgcolor: "#000000",
                      color: "#FFFFFF",
                      py: 1.6,
                      px: 3.5,
                      borderRadius: "16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      textTransform: "none",
                      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        bgcolor: "#111827",
                        transform: "translateY(-2px)",
                        borderColor: "#38BDF8",
                        boxShadow: "0 16px 36px rgba(56, 189, 248, 0.3)",
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
                </Box>
              </Grid>

              {/* Right Column: App Card Preview */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "22px",
                    bgcolor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <Box
                    component="img"
                    src="/logo-round-192.png"
                    alt="Kerala Lottery App Icon"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "20px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      mb: 1.5,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#FFFFFF", mb: 0.25 }}>
                    Kerala Lottery Results Today
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 2 }}>
                    Version 1.0.0 • 100% Free • No Login Needed
                  </Typography>

                  <Button
                    onClick={handleOpenPlayStore}
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      py: 1,
                      borderRadius: "12px",
                      textTransform: "none",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                    }}
                  >
                    Open in Play Store
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* App Key Features Showcase (Frosted Glass Grid) */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mt: 6 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Chip
            label="WHY USERS LOVE OUR APP"
            size="small"
            sx={{
              bgcolor: "rgba(56, 189, 248, 0.1)",
              color: "#38BDF8",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              mb: 1.5,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: "#FFFFFF",
              fontSize: { xs: "1.6rem", sm: "2.2rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Built for Speed, Accuracy &amp; Simplicity
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {appFeatures.map((f, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "22px",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    bgcolor: "rgba(255, 255, 255, 0.06)",
                    borderColor: "rgba(56, 189, 248, 0.35)",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: "14px",
                      bgcolor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "inline-flex",
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Chip
                    label={f.badge}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.06)",
                      color: "#94A3B8",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.05rem", mb: 0.5 }}>
                  {f.title}
                </Typography>

                <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700, fontSize: "0.8rem", mb: 1, display: "block" }}>
                  {f.titleMl}
                </Typography>

                <Typography variant="body2" sx={{ color: "#94A3B8", lineHeight: 1.6, fontSize: "0.875rem", flex: 1 }}>
                  {f.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Frequently Asked Questions (Frosted Glass Accordions) */}
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, mt: 8 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Chip
            label="FAQ"
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.06)",
              color: "#94A3B8",
              fontWeight: 800,
              fontSize: "0.75rem",
              mb: 1.5,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#FFFFFF",
              fontSize: { xs: "1.4rem", sm: "1.8rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Frequently Asked Questions
          </Typography>
        </Box>

        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            expanded={expandedFaq === faq.id}
            onChange={(_e, isExpanded) => setExpandedFaq(isExpanded ? faq.id : false)}
            sx={{
              mb: 1.5,
              borderRadius: "18px !important",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "none",
              color: "#F1F5F9",
              "&:before": { display: "none" },
              "&.Mui-expanded": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(56, 189, 248, 0.35)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#94A3B8" }} />}
              sx={{
                py: 1,
                px: 2.5,
                "& .MuiAccordionSummary-content": { my: 1 },
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}>
                  {faq.question}
                </Typography>
                <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700, fontSize: "0.8rem", display: "block", mt: 0.25 }}>
                  {faq.questionMl}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
              <Typography variant="body2" sx={{ color: "#94A3B8", lineHeight: 1.65, fontSize: "0.9rem" }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
