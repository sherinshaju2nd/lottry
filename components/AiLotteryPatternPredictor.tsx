"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// MUI Icons
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TableChartIcon from "@mui/icons-material/TableChart";
import BalanceIcon from "@mui/icons-material/Balance";
import RepeatIcon from "@mui/icons-material/Repeat";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import ShareIcon from "@mui/icons-material/Share";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import {
  StructuredDrawResult,
  WEEKLY_LOTTERIES,
} from "@/lib/supabase";
import { LotteryAiPatternAnalysis } from "@/lib/gemini";

interface Props {
  allDraws: StructuredDrawResult[];
  lang: "en" | "ml";
}

const LOADING_STEPS = [
  {
    en: "Scanning past official Gazette draws (1st to 9th prize tiers)...",
    ml: "ഔദ്യോഗിക ഗസറ്റ് ഫലങ്ങൾ (1 മുതൽ 9 വരെയുള്ള സമ്മാനങ്ങൾ) പരിശോധിക്കുന്നു...",
    progress: 25,
  },
  {
    en: "Evaluating digit frequency distributions & repeating pairs...",
    ml: "അക്കങ്ങളുടെ ആവൃത്തിയും ആവർത്തന പാറ്റേണുകളും വിശകലനം ചെയ്യുന്നു...",
    progress: 55,
  },
  {
    en: "AI Engine analyzing high-probability candidate combinations...",
    ml: "AI എഞ്ചിൻ ഉയർന്ന സാധ്യതയുള്ള നമ്പർ കോമ്പിനേഷനുകൾ കണ്ടെത്തുന്നു...",
    progress: 82,
  },
  {
    en: "Compiling strategy breakdown & recommendations report...",
    ml: "ശുപാർശ ചെയ്യുന്ന നമ്പറുകളും സ്ട്രാറ്റജി റിപ്പോർട്ടും തയ്യാറാക്കുന്നു...",
    progress: 96,
  },
];

export default function AiLotteryPatternPredictor({ allDraws, lang }: Props) {
  const isMl = lang === "ml";

  // Selected lottery filter: "ALL" or code (e.g. "KR", "KN", "BT", etc.)
  const [selectedLotteryCode, setSelectedLotteryCode] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckingCache, setIsCheckingCache] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LotteryAiPatternAnalysis | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [cacheWarning, setCacheWarning] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);
  const [rawDatasetOpen, setRawDatasetOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScrollButtons]);

  const handleScrollLotteries = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollButtons, 350);
    }
  };

  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // All lottery options (Weekly lotteries only for now)
  const lotteryOptions = useMemo(() => {
    return [
      {
        code: "ALL",
        name: isMl ? "എല്ലാ ആഴ്ച നറുക്കെടുപ്പുകളും (All Lotteries)" : "All Weekly Lotteries (Collective)",
        day: isMl ? "മൾട്ടി-വീക്ക് സ്റ്റഡി" : "Multi-Week Cross-Analysis",
        isBumper: false,
      },
      ...WEEKLY_LOTTERIES.map((l) => ({
        code: l.code,
        name: isMl ? `${l.nameMl} (${l.name})` : l.name,
        day: isMl ? `${l.day}` : `${l.day}s`,
        isBumper: false,
      })),
    ];
  }, [isMl]);

  // Find currently selected lottery metadata
  const currentLottery = useMemo(() => {
    return (
      lotteryOptions.find((o) => o.code === selectedLotteryCode) ||
      lotteryOptions[0]
    );
  }, [lotteryOptions, selectedLotteryCode]);

  // Filter draws available in memory for selected lottery
  const availableDraws = useMemo(() => {
    if (selectedLotteryCode === "ALL") {
      return allDraws;
    }
    return allDraws.filter(
      (d) =>
        d.lottery_code?.toUpperCase() === selectedLotteryCode.toUpperCase() ||
        d.draw_code?.toUpperCase().startsWith(selectedLotteryCode.toUpperCase())
    );
  }, [allDraws, selectedLotteryCode]);

  // Auto-check DB cache or generate on lottery selection
  useEffect(() => {
    let isMounted = true;
    async function checkDbCache() {
      if (availableDraws.length === 0) return;
      setIsCheckingCache(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/ai/pattern-predict?code=${encodeURIComponent(selectedLotteryCode)}&drawsCount=${availableDraws.length}`
        );
        const data = await res.json();
        if (isMounted && data.success && data.cached && data.analysis) {
          setAnalysis(data.analysis);
          setIsCached(true);
          setCachedAt(data.cachedAt || null);
          setCacheWarning(null);
        } else if (isMounted && !data.cached) {
          setAnalysis(null);
          setIsCached(false);
          setCachedAt(null);
          setCacheWarning(null);
        }
      } catch (e) {
        console.warn("Auto cache check error:", e);
      } finally {
        if (isMounted) {
          setIsCheckingCache(false);
        }
      }
    }

    checkDbCache();
    return () => {
      isMounted = false;
    };
  }, [selectedLotteryCode, availableDraws.length]);

  // Animated step loader effect
  useEffect(() => {
    if (loading) {
      setLoadingStepIndex(0);
      setLoadingProgress(15);

      const stepInterval = setInterval(() => {
        setLoadingStepIndex((prev) => {
          const next = prev + 1;
          if (next < LOADING_STEPS.length) {
            setLoadingProgress(LOADING_STEPS[next].progress);
            return next;
          }
          return prev;
        });
      }, 1200);

      const smoothProgressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 200);

      return () => {
        clearInterval(stepInterval);
        clearInterval(smoothProgressInterval);
      };
    } else {
      setLoadingProgress(0);
      setLoadingStepIndex(0);
    }
  }, [loading]);

  // Trigger AI Pattern Analysis
  const handleAnalyze = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      setCacheWarning(null);

      try {
        const response = await fetch("/api/ai/pattern-predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lotteryName: currentLottery.name,
            lotteryCode: selectedLotteryCode,
            draws: availableDraws,
            lang,
            forceRefresh,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.error || "Failed to generate AI analysis.");
        }

        setLoadingProgress(100);
        setAnalysis(data.analysis);
        setIsCached(Boolean(data.cached));
        setCachedAt(data.cachedAt || null);
        setCacheWarning(data.warning || null);
      } catch (err: any) {
        console.error("AI Pattern analysis error:", err);
        setError(
          err?.message ||
            (isMl
              ? "വിശകലനം നടത്താൻ സാധിച്ചില്ല. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക."
              : "Could not generate analysis. Please try again in a moment.")
        );
      } finally {
        setLoading(false);
      }
    },
    [currentLottery, selectedLotteryCode, availableDraws, lang, isMl]
  );

  // Handle Copy Number
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNumber(text);
      setTimeout(() => setCopiedNumber(null), 2000);
    }
  };

  // Generate Document Text Content for Download / Clipboard
  const generateDocReportContent = useCallback(() => {
    if (!analysis) return "";

    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const hotList = (analysis.hot_digits?.overall || [])
      .map((h, i) => `#${i + 1} Digit ${h.digit} (${h.frequency_pct}% frequency - ${h.label})`)
      .join("\n");

    const predictedList = (analysis.top_predicted_numbers || [])
      .map(
        (p, i) =>
          `[${i + 1}] Number: ${p.number} | Category: ${p.category} | Confidence: ${p.confidence_score}%\n    Reason: ${p.rationale}`
      )
      .join("\n\n");

    const doublePatternsList = (analysis.double_patterns || [])
      .map(
        (d) =>
          `• ${d.pattern} (${d.type}): ${d.description}\n  Historical Frequency: ${d.historical_frequency}\n  Picks: ${(d.recommended_examples || []).join(", ")}`
      )
      .join("\n\n");

    const strategiesList = (analysis.prize_focus_patterns?.key_patterns || [])
      .map(
        (k, i) =>
          `[Strategy ${i + 1}] ${k.title} (Rank #${k.probability_rank})\n  Structure: ${k.pattern_structure}\n  Recommended: ${(k.predicted_numbers || []).join(", ")}\n  Analysis: ${k.reasoning}`
      )
      .join("\n\n");

    return `================================================================================
KERALA LOTTERY AI PREDICTION & PATTERN ANALYSIS REPORT
================================================================================
Target Scheme   : ${currentLottery.name} (${selectedLotteryCode})
Draws Evaluated : ${analysis.sample_draws_count} Historical Gazette Draws
Report Date     : ${dateStr}
Generated By    : Kerala Lottery AI Predictor Engine
Website         : https://www.keralalotteryresultstoday.in/analytics
================================================================================

1. EXECUTIVE PATTERN SUMMARY:
--------------------------------------------------------------------------------
English:
${analysis.summary}

Malayalam:
${analysis.summary_ml || analysis.summary}

================================================================================
2. TOP AI RECOMMENDED CANDIDATE NUMBERS (4-DIGIT COMBINATIONS):
--------------------------------------------------------------------------------
${predictedList}

================================================================================
3. HOT DIGITS & RECURRING FREQUENCY MATRIX (0 - 9):
--------------------------------------------------------------------------------
${hotList}

Positional Projections:
• 1st Digit: ${(analysis.hot_digits?.positional?.first_pos || []).join(", ") || "N/A"}
• 2nd Digit: ${(analysis.hot_digits?.positional?.second_pos || []).join(", ") || "N/A"}
• 3rd Digit: ${(analysis.hot_digits?.positional?.third_pos || []).join(", ") || "N/A"}
• Last Digit: ${(analysis.hot_digits?.positional?.last_pos || []).join(", ") || "N/A"}

================================================================================
4. REPEATING DOUBLE PATTERNS & SYMMETRY:
--------------------------------------------------------------------------------
${doublePatternsList}

================================================================================
5. HIGH-PROBABILITY PRIZE STRATEGIES (2nd & 6th PRIZE TARGET):
--------------------------------------------------------------------------------
${strategiesList}

================================================================================
6. HIGH-VALUE SUM RANGE & PARITY BALANCE:
--------------------------------------------------------------------------------
• Recommended 4-Digit Sum : ${analysis.high_value_analysis?.recommended_sum_range || "16 - 24"}
• Even / Odd Parity Ratio : ${analysis.high_value_analysis?.even_odd_ratio || "2 Even : 2 Odd"}
• High / Low Ratio (5-9/0-4): ${analysis.high_value_analysis?.high_low_ratio || "2 High : 2 Low"}
• Insight : ${analysis.high_value_analysis?.insight || "Balanced distribution."}

================================================================================
DISCLAIMER:
--------------------------------------------------------------------------------
${analysis.disclaimer || "These predictions and frequency patterns are calculated strictly from official Kerala State Lottery gazette records for informational purposes. Lottery draws are independent random events."}
================================================================================
`;
  }, [analysis, currentLottery, selectedLotteryCode]);

  // Handle Download Document (.doc)
  const handleDownloadDoc = () => {
    if (!analysis) return;
    const docText = generateDocReportContent();
    const blob = new Blob([docText], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanCode = selectedLotteryCode.toLowerCase();
    link.download = `kerala-lottery-ai-prediction-${cleanCode}-${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Copy Full Report Text
  const handleCopyReportDoc = () => {
    if (!analysis) return;
    const docText = generateDocReportContent();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(docText);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2500);
    }
  };

  // Handle WhatsApp Share
  const handleWhatsAppShare = () => {
    if (!analysis) return;

    const hotList = (analysis.hot_digits?.overall || [])
      .slice(0, 4)
      .map((h, i) => `#${i + 1} Digit ${h.digit} (${h.frequency_pct}%)`)
      .join(", ");

    const predictedList = (analysis.top_predicted_numbers || [])
      .slice(0, 5)
      .map((p) => `🎯 *${p.number}* (${p.category} - ${p.confidence_score}% Conf)`)
      .join("\n");

    const shareText = isMl
      ? `🤖 *കേരള ലോട്ടറി AI പാറ്റേൺ പ്രവചന റിപ്പോർട്ട്*\n📌 *ലോട്ടറി:* ${currentLottery.name}\n📊 *പഠിച്ച ഫലങ്ങൾ:* ${analysis.sample_draws_count} നറുക്കെടുപ്പുകൾ\n\n🎯 *AI മുൻനിര ശുപാർശകൾ:*\n${predictedList}\n\n🔥 *ഹോട്ട് ഡിജിറ്റുകൾ:* ${hotList}\n\n📝 *സംഗ്രഹം:* ${analysis.summary_ml || analysis.summary}\n\nമുഴുവൻ AI റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യാൻ:\n👉 https://www.keralalotteryresultstoday.in/analytics`
      : `🤖 *Kerala Lottery AI Pattern Prediction Report*\n📌 *Lottery:* ${currentLottery.name}\n📊 *Draws Evaluated:* ${analysis.sample_draws_count} Gazette Draws\n\n🎯 *Top AI Number Picks:*\n${predictedList}\n\n🔥 *Hot Digits:* ${hotList}\n\n📝 *Summary:* ${analysis.summary}\n\nDownload Full AI Doc Report:\n👉 https://www.keralalotteryresultstoday.in/analytics`;

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  // Filter predicted numbers by category tab
  const filteredPredictions = useMemo(() => {
    if (!analysis?.top_predicted_numbers) return [];
    if (selectedCategory === "all") return analysis.top_predicted_numbers;
    return analysis.top_predicted_numbers.filter((p) => {
      if (selectedCategory === "doubles") return p.category === "Double Pattern";
      if (selectedCategory === "2nd_6th") return p.category === "2nd/6th Target";
      if (selectedCategory === "hot") return p.category === "Hot 4-Digit";
      if (selectedCategory === "sum") return p.category === "Balanced Sum";
      return true;
    });
  }, [analysis, selectedCategory]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Top Setup & Lottery Selector Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          bgcolor: "#FFFFFF",
          borderRadius: "20px",
          border: "1.5px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background aura */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 320,
            height: 320,
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, rgba(59, 130, 246, 0.03) 70%, transparent 100%)",
            pointerEvents: "none",
            borderRadius: "50%",
            transform: "translate(30%, -30%)",
          }}
        />

        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #0B3C5D 0%, #4F46E5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
              }}
            >
              <PsychologyIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: "#0F172A",
                    fontSize: { xs: "1.2rem", md: "1.35rem" },
                    letterSpacing: "-0.01em",
                  }}
                >
                  {isMl ? "AI പാറ്റേൺ & ഡിജിറ്റ് പ്രവചനങ്ങൾ" : "AI Pattern & Digit Predictor"}
                </Typography>
                <Chip
                  icon={<AutoAwesomeIcon sx={{ color: "#7C3AED !important", fontSize: 14 }} />}
                  label="Smart AI Engine"
                  size="small"
                  sx={{
                    bgcolor: "#F5F3FF",
                    color: "#7C3AED",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    border: "1px solid #DDD6FE",
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", mt: 0.25 }}>
                {isMl
                  ? "ഔദ്യോഗിക ഗസറ്റ് ഫലങ്ങളിലെ ആവർത്തനങ്ങൾ പരിശോധിച്ച് ഉയർന്ന സാധ്യതയുള്ള നമ്പറുകളും പാറ്റേണുകളും കണ്ടെത്തുക."
                  : "Statistical frequency analysis, hot digit vectors, double repeating patterns, and 2nd & 6th prize strategies."}
              </Typography>
            </Box>
          </Box>

          {/* Records Loaded Chip */}
          <Chip
            icon={<TableChartIcon sx={{ fontSize: 16 }} />}
            label={`${availableDraws.length} ${isMl ? "ഫലങ്ങൾ ലഭ്യമാണ്" : "Draws Loaded"}`}
            sx={{
              bgcolor: availableDraws.length > 0 ? "#F0FDF4" : "#FEF2F2",
              color: availableDraws.length > 0 ? "#16A34A" : "#DC2626",
              fontWeight: 800,
              fontSize: "0.75rem",
              border: `1px solid ${availableDraws.length > 0 ? "#BBF7D0" : "#FECACA"}`,
            }}
          />
        </Box>

        {/* Lottery Selection Carousel with Left/Right Arrows */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {isMl ? "1. വിശകലനം ചെയ്യേണ്ട ലോട്ടറി തിരഞ്ഞെടുക്കുക:" : "1. Select Weekly Lottery or Scheme to Analyze:"}
            </Typography>

            {/* Mobile Swipe / Arrow Hint */}
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.72rem",
                color: "#64748B",
                fontWeight: 700,
                display: { xs: "inline-flex", sm: "none" },
                alignItems: "center",
                gap: 0.5,
              }}
            >
              ◄ Swipe / Use Arrows ►
            </Typography>
          </Box>

          {/* Carousel with Navigation Arrows */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.8, sm: 1 },
              position: "relative",
            }}
          >
            {/* Left Scroll Arrow */}
            <IconButton
              onClick={() => handleScrollLotteries("left")}
              disabled={!canScrollLeft}
              size="small"
              aria-label="Scroll lotteries left"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
                border: "1.5px solid #CBD5E1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                color: canScrollLeft ? "#0B3C5D" : "#CBD5E1",
                flexShrink: 0,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: canScrollLeft ? "#EFF6FF" : "#FFFFFF",
                  borderColor: canScrollLeft ? "#3B82F6" : "#CBD5E1",
                },
                "&.Mui-disabled": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  opacity: 0.6,
                },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 22 }} />
            </IconButton>

            {/* Horizontally Scrollable Pills Row */}
            <Box
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              sx={{
                display: "flex",
                overflowX: "auto",
                scrollBehavior: "smooth",
                gap: 1.2,
                py: 0.5,
                px: 0.5,
                flex: 1,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {lotteryOptions.map((opt) => {
                const isSelected = selectedLotteryCode === opt.code;
                return (
                  <Button
                    key={opt.code}
                    size="small"
                    onClick={() => {
                      setSelectedLotteryCode(opt.code);
                      if (opt.code !== selectedLotteryCode) {
                        setAnalysis(null);
                      }
                    }}
                    sx={{
                      flexShrink: 0,
                      minWidth: "max-content",
                      bgcolor: isSelected ? "#0B3C5D" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#334155",
                      border: `1.5px solid ${isSelected ? "#0B3C5D" : "#E2E8F0"}`,
                      borderRadius: "12px",
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: "0.8rem",
                      px: 2,
                      py: 0.85,
                      textTransform: "none",
                      boxShadow: isSelected ? "0 4px 12px rgba(11, 60, 93, 0.18)" : "0 1px 2px rgba(0,0,0,0.03)",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isSelected ? "#0B3C5D" : "#F8FAFC",
                        borderColor: isSelected ? "#0B3C5D" : "#CBD5E1",
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "left" }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                        {opt.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: isSelected ? "#93C5FD" : "#64748B",
                          lineHeight: 1.1,
                          mt: 0.25,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt.day}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Box>

            {/* Right Scroll Arrow */}
            <IconButton
              onClick={() => handleScrollLotteries("right")}
              disabled={!canScrollRight}
              size="small"
              aria-label="Scroll lotteries right"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
                border: "1.5px solid #CBD5E1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                color: canScrollRight ? "#0B3C5D" : "#CBD5E1",
                flexShrink: 0,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: canScrollRight ? "#EFF6FF" : "#FFFFFF",
                  borderColor: canScrollRight ? "#3B82F6" : "#CBD5E1",
                },
                "&.Mui-disabled": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  opacity: 0.6,
                },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Action Trigger Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            pt: 2,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon sx={{ color: "#64748B", fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
              {isMl
                ? `തിരഞ്ഞെടുത്തത്: ${currentLottery.name} (${availableDraws.length} നറുക്കെടുപ്പുകൾ)`
                : `Target: ${currentLottery.name} (${availableDraws.length} draws in dataset)`}
            </Typography>
          </Box>

          <Button
            variant="contained"
            disabled={loading || availableDraws.length === 0}
            onClick={() => handleAnalyze(false)}
            startIcon={
              loading ? (
                <CircularProgress size={18} sx={{ color: "#FFFFFF !important" }} />
              ) : (
                <AutoAwesomeIcon sx={{ color: "#FDE047" }} />
              )
            }
            sx={{
              bgcolor: "#0B3C5D",
              color: "#FFFFFF !important",
              fontWeight: 900,
              fontSize: "0.92rem",
              borderRadius: "12px",
              px: 3.5,
              py: 1.25,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#0F2C59",
              },
              "&.Mui-disabled": {
                bgcolor: "#0B3C5D !important",
                color: "#FFFFFF !important",
                opacity: 0.95,
                boxShadow: "none",
                cursor: "not-allowed",
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontWeight: 900,
                fontSize: "0.92rem",
                color: "#FFFFFF !important",
              }}
            >
              {loading
                ? isMl
                  ? "AI വിശകലനം ചെയ്യുന്നു..."
                  : "Analyzing Multi-Draw Patterns..."
                : isMl
                ? "AI വിശകലനം ആരംഭിക്കുക"
                : "Analyze Patterns with AI"}
            </Typography>
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: "14px" }}
          action={
            <Button color="inherit" size="small" onClick={() => handleAnalyze(false)}>
              {isMl ? "വീണ്ടും ശ്രമിക്കുക" : "Retry"}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 2. Skeleton Loader while switching lottery & checking database cache */}
      {isCheckingCache && !loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Skeleton Summary Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: "#0F172A",
              borderRadius: "20px",
              border: "1px solid #334155",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Skeleton variant="rounded" width={160} height={26} sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: "8px" }} />
                <Skeleton variant="rounded" width={120} height={26} sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              </Box>
              <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />
            </Box>
            <Skeleton variant="text" width="96%" height={26} sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 0.5 }} />
            <Skeleton variant="text" width="88%" height={26} sx={{ bgcolor: "rgba(255,255,255,0.08)", mb: 0.5 }} />
            <Skeleton variant="text" width="65%" height={26} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
          </Paper>

          {/* Skeleton Candidate Numbers */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: "#FFFFFF",
              borderRadius: "20px",
              border: "1.5px solid #E2E8F0",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "12px" }} />
                <Box>
                  <Skeleton variant="text" width={220} height={28} />
                  <Skeleton variant="text" width={150} height={18} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rounded" width={50} height={28} sx={{ borderRadius: "16px" }} />
                <Skeleton variant="rounded" width={75} height={28} sx={{ borderRadius: "16px" }} />
                <Skeleton variant="rounded" width={85} height={28} sx={{ borderRadius: "16px" }} />
              </Box>
            </Box>

            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={k}>
                  <Box
                    sx={{
                      p: 2.2,
                      bgcolor: "#FAFAFA",
                      borderRadius: "16px",
                      border: "1.5px solid #E2E8F0",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Skeleton variant="rounded" width={85} height={22} sx={{ borderRadius: "8px" }} />
                      <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: "8px" }} />
                    </Box>
                    <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: "12px", mb: 1.5 }} />
                    <Skeleton variant="text" width="92%" height={18} />
                    <Skeleton variant="text" width="70%" height={18} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Skeleton Hot Digits & Double Patterns */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "#FFFFFF", borderRadius: "20px", border: "1.5px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "10px" }} />
                  <Skeleton variant="text" width={180} height={26} />
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} variant="rounded" width={70} height={42} sx={{ borderRadius: "10px" }} />
                  ))}
                </Box>
                <Skeleton variant="rounded" width="100%" height={75} sx={{ borderRadius: "10px" }} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "#FFFFFF", borderRadius: "20px", border: "1.5px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "10px" }} />
                  <Skeleton variant="text" width={180} height={26} />
                </Box>
                <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: "12px", mb: 1.5 }} />
                <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: "12px" }} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 3. Engaging Animated Step-by-Step Loader during Active Generation */}
      {loading && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            bgcolor: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid #E2E8F0",
            boxShadow: "0 6px 24px rgba(15, 23, 42, 0.05)",
          }}
        >
          {/* Top Loader Status Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563EB",
                }}
              >
                <CircularProgress size={20} sx={{ color: "#2563EB" }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0F172A" }}>
                  {isMl ? "AI പാറ്റേൺ എൻജിൻ പ്രവർത്തിക്കുന്നു..." : "AI Pattern Engine Processing..."}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {isMl
                    ? `${availableDraws.length} ഗസറ്റ് ഫലങ്ങളിലെ സമ്മാന നമ്പറുകൾ പരിശോധിച്ച് പാറ്റേണുകൾ നിർമ്മിക്കുന്നു`
                    : `Evaluating ${availableDraws.length} draws across 1st to 9th prize tiers`}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={`${loadingProgress}%`}
              size="small"
              sx={{
                bgcolor: "#EFF6FF",
                color: "#2563EB",
                fontWeight: 900,
                fontSize: "0.85rem",
                border: "1px solid #BFDBFE",
              }}
            />
          </Box>

          {/* Progress Bar */}
          <Box sx={{ width: "100%", mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={loadingProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#F1F5F9",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #0284C7 0%, #4F46E5 100%)",
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Step-by-Step Progress List */}
          <Grid container spacing={1.5}>
            {LOADING_STEPS.map((step, idx) => {
              const isCompleted = loadingStepIndex > idx;
              const isCurrent = loadingStepIndex === idx;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: isCurrent ? "#F8FAFC" : isCompleted ? "#F0FDF4" : "#FAFAFA",
                      border: `1.5px solid ${isCurrent ? "#93C5FD" : isCompleted ? "#BBF7D0" : "#E2E8F0"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 20 }} />
                    ) : isCurrent ? (
                      <CircularProgress size={16} sx={{ color: "#2563EB" }} />
                    ) : (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid #CBD5E1",
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCompleted ? "#166534" : isCurrent ? "#1E40AF" : "#64748B",
                        lineHeight: 1.3,
                      }}
                    >
                      {isMl ? step.ml : step.en}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* 3. Analysis Results View */}
      {analysis && !loading && !isCheckingCache && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Action Bar: Download Doc / Share Report */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "#FFFFFF",
              borderRadius: "16px",
              border: "1.5px solid #E2E8F0",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DescriptionIcon sx={{ color: "#0B3C5D", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.9rem" }}>
                {isMl ? "AI റിപ്പോർട്ട് ഡൗൺലോഡ് & ഷെയറിംഗ്" : "Export & Share Prediction Report"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {/* Download Doc Button */}
              <Button
                variant="contained"
                size="small"
                onClick={handleDownloadDoc}
                startIcon={<DownloadForOfflineIcon />}
                sx={{
                  bgcolor: "#0B3C5D",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  borderRadius: "10px",
                  px: 2,
                  py: 0.8,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0F2C59" },
                }}
              >
                {isMl ? "ഡോക്യുമെന്റ് ഡൗൺലോഡ്" : "Download Doc (.doc)"}
              </Button>

              {/* Copy Report Doc Text */}
              <Tooltip title={copiedDoc ? (isMl ? "കോപ്പി ചെയ്തു!" : "Copied to Clipboard!") : (isMl ? "മുഴുവൻ റിപ്പോർട്ട് കോപ്പി ചെയ്യുക" : "Copy Report Text")}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopyReportDoc}
                  startIcon={copiedDoc ? <CheckCircleIcon sx={{ color: "#16A34A" }} /> : <ContentCopyIcon />}
                  sx={{
                    color: copiedDoc ? "#16A34A" : "#334155",
                    borderColor: copiedDoc ? "#86EFAC" : "#CBD5E1",
                    bgcolor: copiedDoc ? "#F0FDF4" : "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    borderRadius: "10px",
                    px: 1.8,
                    py: 0.8,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
                  }}
                >
                  {copiedDoc ? (isMl ? "കോപ്പി ചെയ്തു!" : "Copied Doc!") : (isMl ? "ടെക്സ്റ്റ് കോപ്പി" : "Copy Text")}
                </Button>
              </Tooltip>

              {/* WhatsApp Share Button */}
              <Button
                variant="outlined"
                size="small"
                onClick={handleWhatsAppShare}
                startIcon={<WhatsAppIcon sx={{ color: "#25D366" }} />}
                sx={{
                  color: "#0F172A",
                  borderColor: "#CBD5E1",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  borderRadius: "10px",
                  px: 1.8,
                  py: 0.8,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {isMl ? "പങ്കുവെക്കുക" : "Share Doc"}
              </Button>
            </Box>
          </Paper>

          {/* Executive Summary Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: "#0F172A",
              color: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid #334155",
              boxShadow: "0 6px 24px rgba(15, 23, 42, 0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Chip
                  icon={<FlashOnIcon sx={{ color: "#FACC15 !important", fontSize: 16 }} />}
                  label={isMl ? "AI സംഗ്രഹം & വിശകലനം" : "AI EXECUTIVE SUMMARY"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(250, 204, 21, 0.15)",
                    color: "#FACC15",
                    fontWeight: 900,
                    fontSize: "0.72rem",
                    border: "1px solid rgba(250, 204, 21, 0.3)",
                  }}
                />
                {isCached ? (
                  <Chip
                    icon={<CheckCircleIcon sx={{ color: "#4ADE80 !important", fontSize: 14 }} />}
                    label={isMl ? "ഡാറ്റാബേസ് കാഷെ (Instant)" : "DB Cached Analysis"}
                    size="small"
                    sx={{
                      bgcolor: "rgba(74, 222, 128, 0.15)",
                      color: "#4ADE80",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                      border: "1px solid rgba(74, 222, 128, 0.3)",
                    }}
                  />
                ) : (
                  <Chip
                    icon={<AutoAwesomeIcon sx={{ color: "#A78BFA !important", fontSize: 14 }} />}
                    label={isMl ? "പുതിയ AI വിശകലനം" : "Fresh AI Analysis"}
                    size="small"
                    sx={{
                      bgcolor: "rgba(167, 139, 250, 0.15)",
                      color: "#C4B5FD",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                      border: "1px solid rgba(167, 139, 250, 0.3)",
                    }}
                  />
                )}
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                  {analysis.sample_draws_count} {isMl ? "നറുക്കെടുപ്പുകൾ പഠിച്ചു" : "Draws Evaluated"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title={isMl ? "പുതിയ വിശകലനം നിർബന്ധമാക്കുക" : "Force Refresh AI Analysis"}>
                  <IconButton
                    size="small"
                    onClick={() => handleAnalyze(true)}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "#FFFFFF",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {cacheWarning && (
              <Box sx={{ mb: 1.5 }}>
                <Alert
                  severity="info"
                  sx={{
                    py: 0.2,
                    px: 1.5,
                    bgcolor: "rgba(56, 189, 248, 0.15)",
                    color: "#7DD3FC",
                    borderRadius: "8px",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {cacheWarning}
                  </Typography>
                </Alert>
              </Box>
            )}

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.65,
                color: "#E2E8F0",
                fontWeight: 500,
              }}
            >
              {isMl && analysis.summary_ml ? analysis.summary_ml : analysis.summary}
            </Typography>
          </Paper>

          {/* Section: Top AI Recommended Candidate Numbers */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: "#FFFFFF",
              borderRadius: "20px",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    bgcolor: "#DCFCE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16A34A",
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.15rem" }}>
                    {isMl ? "AI ശുപാർശ ചെയ്യുന്ന മുൻനിര നമ്പറുകൾ" : "Top AI Recommended Candidate Numbers"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                    {isMl
                      ? "ഹോട്ട് ഡിജിറ്റുകളും ഡബിൾ പാറ്റേണുകളും സംയോജിപ്പിച്ചുള്ള നമ്പറുകൾ"
                      : "Filtered combinations ranked by mathematical probability score."}
                  </Typography>
                </Box>
              </Box>

              {/* Category Filter Chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {[
                  { key: "all", label: isMl ? "എല്ലാം" : "All" },
                  { key: "doubles", label: isMl ? "ഡബിൾസ്" : "Doubles" },
                  { key: "2nd_6th", label: isMl ? "2nd/6th" : "2nd/6th Target" },
                  { key: "hot", label: isMl ? "ഹോട്ട് 4" : "Hot 4-Digit" },
                  { key: "sum", label: isMl ? "ബാലൻസ്ഡ്" : "Balanced Sum" },
                ].map((c) => (
                  <Chip
                    key={c.key}
                    label={c.label}
                    size="small"
                    onClick={() => setSelectedCategory(c.key)}
                    sx={{
                      bgcolor: selectedCategory === c.key ? "#0B3C5D" : "#F1F5F9",
                      color: selectedCategory === c.key ? "#FFFFFF" : "#475569",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      "&:hover": { bgcolor: selectedCategory === c.key ? "#0B3C5D" : "#E2E8F0" },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Grid of Number Ticket Cards */}
            <Grid container spacing={2}>
              {filteredPredictions.map((pred, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Box
                    sx={{
                      p: 2.2,
                      bgcolor: "#FAFAFA",
                      borderRadius: "16px",
                      border: "1.5px solid #E2E8F0",
                      position: "relative",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
                        borderColor: "#CBD5E1",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Chip
                        label={pred.category}
                        size="small"
                        sx={{
                          bgcolor: "#EFF6FF",
                          color: "#1D4ED8",
                          fontWeight: 800,
                          fontSize: "0.7rem",
                        }}
                      />
                      <Chip
                        label={`${pred.confidence_score || 85}% Conf.`}
                        size="small"
                        sx={{
                          bgcolor: "#F0FDF4",
                          color: "#15803D",
                          fontWeight: 800,
                          fontSize: "0.68rem",
                        }}
                      />
                    </Box>

                    {/* Big Ticket Display */}
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "#FFFFFF",
                        borderRadius: "12px",
                        border: "1.5px solid #0F172A",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "1.6rem",
                          color: "#0F172A",
                          fontFamily: "monospace",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {pred.number}
                      </Typography>

                      <Tooltip
                        title={
                          copiedNumber === pred.number
                            ? isMl
                              ? "കോപ്പി ചെയ്തു!"
                              : "Copied!"
                            : isMl
                            ? "കോപ്പി ചെയ്യുക"
                            : "Copy"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(pred.number)}
                          sx={{
                            bgcolor: copiedNumber === pred.number ? "#DCFCE7" : "#F1F5F9",
                            color: copiedNumber === pred.number ? "#16A34A" : "#334155",
                            "&:hover": { bgcolor: "#E2E8F0" },
                          }}
                        >
                          {copiedNumber === pred.number ? (
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography variant="caption" sx={{ color: "#64748B", lineHeight: 1.4, display: "block" }}>
                      {pred.rationale}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Grid of Hot Digits & Double Patterns */}
          <Grid container spacing={3}>
            {/* Card 1: Hot Digits & Positional Matrix */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1.5px solid #E2E8F0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: "#FEF2F2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#DC2626",
                      }}
                    >
                      <WhatshotIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1rem" }}>
                        {isMl ? "ഹോട്ട് ഡിജിറ്റുകൾ (Hot Digits 0-9)" : "Hot Digits & Frequency Ranking"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {isMl ? "കൂടുതൽ തവണ ആവർത്തിച്ചു വന്ന അക്കങ്ങൾ" : "Top recurring digits across all drawn prize tiers"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Hot Digits Pills */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    {(analysis.hot_digits?.overall || []).map((h, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                          bgcolor: i === 0 ? "#FEF2F2" : i <= 2 ? "#FFFBEB" : "#F8FAFC",
                          border: `1.5px solid ${i === 0 ? "#FECACA" : i <= 2 ? "#FDE68A" : "#E2E8F0"}`,
                          borderRadius: "10px",
                          px: 1.5,
                          py: 0.8,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "1.2rem",
                            color: i === 0 ? "#DC2626" : i <= 2 ? "#D97706" : "#334155",
                            fontFamily: "monospace",
                          }}
                        >
                          {h.digit}
                        </Typography>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              color: i === 0 ? "#B91C1C" : "#64748B",
                              lineHeight: 1,
                            }}
                          >
                            {h.label || "Hot"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", lineHeight: 1 }}>
                            {h.frequency_pct}% freq
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Positional Recommendations Matrix */}
                  {analysis.hot_digits?.positional && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: "#475569",
                          textTransform: "uppercase",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        {isMl ? "സ്ഥാനം അനുസരിച്ചുള്ള സാധ്യതകൾ:" : "Positional Digit Predictions:"}
                      </Typography>

                      <Grid container spacing={1}>
                        {[
                          {
                            pos: isMl ? "1-ാം അക്കം" : "1st Digit",
                            nums: analysis.hot_digits.positional.first_pos || [],
                          },
                          {
                            pos: isMl ? "2-ാം അക്കം" : "2nd Digit",
                            nums: analysis.hot_digits.positional.second_pos || [],
                          },
                          {
                            pos: isMl ? "3-ാം അക്കം" : "3rd Digit",
                            nums: analysis.hot_digits.positional.third_pos || [],
                          },
                          {
                            pos: isMl ? "അവസാന അക്കം" : "Last Digit",
                            nums: analysis.hot_digits.positional.last_pos || [],
                          },
                        ].map((p, idx) => (
                          <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                            <Box
                              sx={{
                                p: 1.2,
                                bgcolor: "#F8FAFC",
                                borderRadius: "10px",
                                border: "1px solid #E2E8F0",
                                textAlign: "center",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#64748B", fontWeight: 700, fontSize: "0.7rem", display: "block" }}
                              >
                                {p.pos}
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  fontSize: "0.95rem",
                                  color: "#0F172A",
                                  fontFamily: "monospace",
                                  mt: 0.3,
                                }}
                              >
                                {p.nums.join(", ") || "-"}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Card 2: Double Number Patterns & Symmetrical Structure */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1.5px solid #E2E8F0",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      bgcolor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4F46E5",
                    }}
                  >
                    <RepeatIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1rem" }}>
                      {isMl ? "ഡബിൾ & റിപ്പീറ്റിംഗ് പാറ്റേണുകൾ" : "Double & Repeating Patterns"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      {isMl ? "തുടർച്ചയായ ജോഡികളും മിറർ പ്രതിഫലനങ്ങളും" : "Consecutive pairs (AA), mirror reflections (ABBA), & repeats"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {(analysis.double_patterns || []).map((d, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.8,
                        bgcolor: "#F8FAFC",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: "0.85rem" }}>
                          {d.pattern}
                        </Typography>
                        <Chip
                          label={d.historical_frequency || "Active"}
                          size="small"
                          sx={{
                            bgcolor: "#EEF2FF",
                            color: "#4338CA",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 1 }}>
                        {d.description}
                      </Typography>

                      {/* Sample copyable numbers */}
                      {d.recommended_examples && d.recommended_examples.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, alignItems: "center" }}>
                          <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700 }}>
                            {isMl ? "ഉദാഹരണങ്ങൾ:" : "Picks:"}
                          </Typography>
                          {d.recommended_examples.map((num, idx) => (
                            <Tooltip
                              key={idx}
                              title={
                                copiedNumber === num
                                  ? isMl
                                    ? "കോപ്പി ചെയ്തു!"
                                    : "Copied!"
                                  : isMl
                                  ? "കോപ്പി ചെയ്യുക"
                                  : "Copy"
                              }
                            >
                              <Chip
                                label={num}
                                size="small"
                                onClick={() => handleCopy(num)}
                                icon={
                                  copiedNumber === num ? (
                                    <CheckCircleIcon sx={{ fontSize: "14px !important", color: "#16A34A !important" }} />
                                  ) : (
                                    <ContentCopyIcon sx={{ fontSize: "12px !important" }} />
                                  )
                                }
                                sx={{
                                  bgcolor: "#FFFFFF",
                                  border: "1px solid #CBD5E1",
                                  fontWeight: 800,
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  "&:hover": { bgcolor: "#F1F5F9" },
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Section: 4 to 5 High-Probability Strategy Patterns (2nd & 6th Prize Focus) */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              bgcolor: "#FFFFFF",
              borderRadius: "20px",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D97706",
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.15rem" }}>
                  {isMl
                    ? "2-ാം, 6-ാം സമ്മാനങ്ങൾ ലക്ഷ്യമിട്ടുള്ള സ്ട്രാറ്റജികൾ"
                    : "Target Strategy Patterns (Focus: 2nd & 6th Prize)"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                  {isMl
                    ? "മുൻകാല ഗസറ്റ് ഫലങ്ങളിലെ അവസാന 4-അക്കങ്ങളുടെ ഘടനാപരമായ വിശകലനം."
                    : "High probability mathematical formulas for 4-digit last numbers based on repeating historical distributions."}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {(analysis.prize_focus_patterns?.key_patterns || []).map((pattern, idx) => (
                <Grid size={{ xs: 12, md: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: idx === 0 ? "#FFFDF5" : "#F8FAFC",
                      borderRadius: "16px",
                      border: `1.5px solid ${idx === 0 ? "#FDE68A" : "#E2E8F0"}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "0.95rem" }}>
                          {pattern.title}
                        </Typography>
                        <Chip
                          icon={<StarIcon sx={{ fontSize: "14px !important", color: "#D97706 !important" }} />}
                          label={`Rank #${pattern.probability_rank || idx + 1}`}
                          size="small"
                          sx={{
                            bgcolor: "#FEF3C7",
                            color: "#92400E",
                            fontWeight: 800,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>

                      {/* Formula / Structure */}
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "#FFFFFF",
                          borderRadius: "8px",
                          border: "1px dashed #CBD5E1",
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                          {isMl ? "പാറ്റേൺ ഘടന:" : "Pattern Structure:"}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: "#2563EB", fontSize: "0.85rem", fontFamily: "monospace" }}>
                          {pattern.pattern_structure}
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: "#475569", lineHeight: 1.5, display: "block", mb: 2 }}>
                        {pattern.reasoning}
                      </Typography>
                    </Box>

                    {/* Target Numbers */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", display: "block", mb: 0.8 }}>
                        {isMl ? "ലക്ഷ്യമിടുന്ന നമ്പറുകൾ:" : "Recommended Numbers:"}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {(pattern.predicted_numbers || []).map((num, nIdx) => (
                          <Tooltip
                            key={nIdx}
                            title={
                              copiedNumber === num
                                ? isMl
                                ? "കോപ്പി ചെയ്തു!"
                                : "Copied!"
                                : isMl
                                ? "കോപ്പി ചെയ്യുക"
                                : "Copy"
                            }
                          >
                            <Chip
                              label={num}
                              onClick={() => handleCopy(num)}
                              icon={
                                copiedNumber === num ? (
                                  <CheckCircleIcon sx={{ fontSize: "16px !important", color: "#16A34A !important" }} />
                                ) : (
                                  <ContentCopyIcon sx={{ fontSize: "14px !important" }} />
                                )
                              }
                              sx={{
                                bgcolor: "#FFFFFF",
                                border: "1.5px solid #94A3B8",
                                fontWeight: 900,
                                fontFamily: "monospace",
                                fontSize: "0.9rem",
                                py: 1.8,
                                px: 0.5,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "#EFF6FF", borderColor: "#3B82F6" },
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Section: High-Value Sum Range & Parity Balance */}
          {analysis.high_value_analysis && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F8FAFC",
                borderRadius: "20px",
                border: "1.5px solid #E2E8F0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#F0FDF4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16A34A",
                  }}
                >
                  <BalanceIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1rem" }}>
                    {isMl ? "ആകെ തുകയും ഓഡ്-ഈവൻ ബാലൻസും" : "High-Value Sum Range & Parity Balance"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {analysis.high_value_analysis.insight ||
                      "Mathematical balance between high (5-9) vs low (0-4) numbers and even/odd parity."}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                      {isMl ? "ശുപാർശ ചെയ്യുന്ന ആകെത്തുക:" : "Recommended 4-Digit Sum:"}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#16A34A", fontSize: "1.1rem", mt: 0.5 }}>
                      {analysis.high_value_analysis.recommended_sum_range}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                      {isMl ? "ഈവൻ / ഓഡ് അനുപാതം:" : "Even / Odd Ratio:"}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#2563EB", fontSize: "1.1rem", mt: 0.5 }}>
                      {analysis.high_value_analysis.even_odd_ratio}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                      {isMl ? "ഹൈ (5-9) vs ലോ (0-4) ബാലൻസ്:" : "High (5-9) vs Low (0-4):"}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#9333EA", fontSize: "1.1rem", mt: 0.5 }}>
                      {analysis.high_value_analysis.high_low_ratio}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Section: Underlying Historical Records Feed Accordion */}
          <Accordion
            expanded={rawDatasetOpen}
            onChange={() => setRawDatasetOpen(!rawDatasetOpen)}
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "16px !important",
              border: "1.5px solid #E2E8F0",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TableChartIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.95rem" }}>
                  {isMl
                    ? `വിശകലനത്തിനായി ഉപയോഗിച്ച മുൻകാല ഫലങ്ങൾ (${availableDraws.length} റെക്കോർഡുകൾ)`
                    : `View Underlying Historical Draws Feed (${availableDraws.length} records analyzed)`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 2 }}>
                {isMl
                  ? "ഈ ഡാറ്റാസെറ്റ് ഔദ്യോഗിക കേരള ഗസറ്റ് ഫലങ്ങളിൽ നിന്നുള്ള 1 മുതൽ 9 വരെയുള്ള എല്ലാ സമ്മാന നമ്പറുകളും ഉൾക്കൊള്ളുന്നു. ഇത് AI എൻജിൻ ഉപയോഗിച്ച് സമഗ്രമായ പാറ്റേൺ പഠനം നടത്തിയതാണ്."
                  : "Transparent dataset compiled from official Kerala Gazette draws containing 1st through 9th prize tiers evaluated by the AI Pattern Engine."}
              </Typography>

              <TableContainer sx={{ maxHeight: 380 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, bgcolor: "#F8FAFC", whiteSpace: "nowrap" }}>Draw & Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: "#F8FAFC" }}>1st Prize</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: "#F8FAFC" }}>2nd Prize</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: "#F8FAFC" }}>3rd – 5th Prizes</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: "#F8FAFC" }}>6th – 9th Prizes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableDraws.slice(0, 30).map((d, i) => {
                      const p = d.prizes || {};
                      const p345 = [
                        ...(p["3rd"] || []),
                        ...(p["4th"] || []),
                        ...(p["5th"] || []),
                      ];
                      const p6789 = [
                        ...(p["6th"] || []),
                        ...(p["7th"] || []),
                        ...(p["8th"] || []),
                        ...(p["9th"] || []),
                      ];

                      return (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize: "0.8rem" }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#0F172A" }}>
                              {d.draw_name || d.draw_code}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64748B" }}>
                              {d.draw_date}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.82rem", fontWeight: 900, color: "#16A34A", fontFamily: "monospace" }}>
                            {d.first?.ticket || "N/A"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", color: "#2563EB", fontWeight: 700, fontFamily: "monospace" }}>
                            {(p["2nd"] || []).join(", ") || "N/A"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.78rem", color: "#475569", fontFamily: "monospace", maxWidth: 220 }}>
                            {p345.length > 0 ? p345.slice(0, 6).join(", ") + (p345.length > 6 ? ` (+${p345.length - 6} more)` : "") : "-"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.78rem", color: "#64748B", fontFamily: "monospace", maxWidth: 260 }}>
                            {p6789.length > 0 ? p6789.slice(0, 8).join(", ") + (p6789.length > 8 ? ` (+${p6789.length - 8} more)` : "") : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* 4. Ready to Analyze Prompt Card if analysis not yet generated */}
      {!analysis && !loading && !isCheckingCache && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, md: 5 },
            bgcolor: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px dashed #CBD5E1",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: "#EFF6FF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563EB",
              mb: 2,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", mb: 1 }}>
            {isMl
              ? `${currentLottery.name} AI പാറ്റേൺ പ്രവചനം തയ്യാറാണ്`
              : `Ready to Generate AI Predictions for ${currentLottery.name}`}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 540, mx: "auto", mb: 3 }}>
            {isMl
              ? `ലഭ്യമായ ${availableDraws.length} ഗസറ്റ് ഫലങ്ങളിലെ 1 മുതൽ 9 വരെയുള്ള സമ്മാനങ്ങൾ പരിശോധിച്ച് 2-ാം, 6-ാം സമ്മാന പാറ്റേണുകളും ഹോട്ട് ഡിജിറ്റുകളും കണ്ടെത്തുക.`
              : `Click below to evaluate ${availableDraws.length} historical gazette records for 2nd & 6th prize targets, hot digits, and high-probability 4-digit combinations.`}
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleAnalyze(false)}
            startIcon={<AutoAwesomeIcon sx={{ color: "#FDE047" }} />}
            sx={{
              bgcolor: "#0B3C5D",
              color: "#FFFFFF !important",
              fontWeight: 900,
              fontSize: "0.95rem",
              borderRadius: "12px",
              px: 4,
              py: 1.3,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
              "&:hover": { bgcolor: "#0F2C59" },
            }}
          >
            {isMl ? "AI വിശകലനം ആരംഭിക്കുക" : "Analyze Patterns with AI"}
          </Button>
        </Paper>
      )}
    </Box>
  );
}
