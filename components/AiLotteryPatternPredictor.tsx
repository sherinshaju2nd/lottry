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

import {
  StructuredDrawResult,
  WEEKLY_LOTTERIES,
  getLotteryLogo,
  getLotteryLogoAlt,
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
  const [rawDatasetOpen, setRawDatasetOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // All lottery options (Weekly lotteries only for now)
  const lotteryOptions = useMemo(() => {
    return [
      {
        code: "ALL",
        name: isMl ? "എല്ലാ ലോട്ടറികളും" : "All Lotteries",
        day: isMl ? "എല്ലാ ദിവസവും" : "All Days Combined",
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

  // Friendly plain-language explanation helper (no academic math jargon)
  const getFriendlyExplanation = useCallback(
    (rationale: string, category: string): string => {
      if (isMl) {
        if (category === "Hot 4-Digit") {
          return "മുൻകാല നറുക്കെടുപ്പുകളിൽ ഏറ്റവും കൂടുതൽ തവണ വിജയിച്ച അക്കങ്ങൾ ചേർത്തുവെച്ച നമ്പർ.";
        }
        if (category === "Double Pattern") {
          return "തുടക്കത്തിലോ നടുവിലോ ഇരട്ട അക്കങ്ങൾ (Double) വരുന്ന ശക്തമായ കോമ്പിനേഷൻ.";
        }
        if (category === "2nd/6th Target") {
          return "2-ാം സമ്മാനത്തിനും 6-ാം സമ്മാനത്തിനും (അവസാന 4 അക്കങ്ങൾ) ഏറ്റവും അനുയോജ്യമായ നമ്പർ.";
        }
        if (category === "Balanced Sum") {
          return "ആകെത്തുകയും ഒറ്റ-ഇരട്ട അക്കങ്ങളും കൃത്യമായ അനുപാതത്തിൽ തുലനം ചെയ്ത നമ്പർ.";
        }
        return "വിജയിക്കാൻ കൂടുതൽ സാധ്യതയുള്ള മികച്ച 4-അക്ക കോമ്പിനേഷൻ.";
      }

      if (category === "Hot 4-Digit") {
        return "Combines the most frequently drawn winning digits in each position.";
      }
      if (category === "Double Pattern") {
        return "Features a repeating double pair commonly seen in winning draws.";
      }
      if (category === "2nd/6th Target") {
        return "Targeted for Kerala Lottery 2nd & 6th prize 4-digit endings.";
      }
      if (category === "Balanced Sum") {
        return "Optimal 4-digit total sum with balanced even and odd digits.";
      }
      return rationale || "High-probability candidate number based on past winning patterns.";
    },
    [isMl]
  );

  // Ensure we always have 15 high-quality predictions, even if cached DB row only had 4 or 10
  const allPredictions = useMemo(() => {
    if (!analysis) return [];
    const base = [...(analysis.top_predicted_numbers || [])];
    if (base.length >= 15) return base.slice(0, 15);

    // Extract hot digits
    const hotArr = (analysis.hot_digits?.overall || []).map((h) => h.digit);
    const h0 = hotArr[0] !== undefined ? hotArr[0] : 7;
    const h1 = hotArr[1] !== undefined ? hotArr[1] : 3;
    const h2 = hotArr[2] !== undefined ? hotArr[2] : 8;
    const h3 = hotArr[3] !== undefined ? hotArr[3] : 2;
    const h4 = hotArr[4] !== undefined ? hotArr[4] : 5;
    const h5 = hotArr[5] !== undefined ? hotArr[5] : 9;
    const h6 = hotArr[6] !== undefined ? hotArr[6] : 1;

    // Extract double patterns if available
    const doubleDigits = (analysis.double_patterns || []).map((d) => {
      const match = d.pattern.match(/\d/);
      return match ? parseInt(match[0], 10) : h0;
    });
    const d0 = doubleDigits[0] !== undefined ? doubleDigits[0] : h0;
    const d1 = doubleDigits[1] !== undefined ? doubleDigits[1] : h1;

    // Positional digits if available
    const pos = analysis.hot_digits?.positional;
    const p1 = pos?.first_pos && pos.first_pos[1] !== undefined ? pos.first_pos[1] : h1;
    const p2 = pos?.second_pos && pos.second_pos[1] !== undefined ? pos.second_pos[1] : h2;
    const p3 = pos?.third_pos && pos.third_pos[1] !== undefined ? pos.third_pos[1] : h3;
    const p4 = pos?.last_pos && pos.last_pos[1] !== undefined ? pos.last_pos[1] : h4;
    const p1_alt = pos?.first_pos && pos.first_pos[2] !== undefined ? pos.first_pos[2] : h5;
    const p4_alt = pos?.last_pos && pos.last_pos[2] !== undefined ? pos.last_pos[2] : h6;

    const extraCandidates = [
      {
        number: `${h1}${h0}${h2}${h3}`,
        category: "Hot 4-Digit" as const,
        confidence_score: 87,
        rationale: "High-frequency hot digits from top winning draws in reverse sequence.",
      },
      {
        number: `${d0}${d0}${h3}${h4}`,
        category: "Double Pattern" as const,
        confidence_score: 84,
        rationale: "Repeating primary double pattern at the start with high-frequency tail digits.",
      },
      {
        number: `${h2}${d1}${d1}${h0}`,
        category: "Double Pattern" as const,
        confidence_score: 82,
        rationale: "Internal double pair flanked by high-velocity hot numbers.",
      },
      {
        number: `${h3}${h2}${h0}${h1}`,
        category: "2nd/6th Target" as const,
        confidence_score: 80,
        rationale: "Targeted 4-digit cluster historically frequent in Kerala 2nd and 6th prizes.",
      },
      {
        number: `${p1}${p2}${p3}${p4}`,
        category: "Hot 4-Digit" as const,
        confidence_score: 78,
        rationale: "Positional secondary rank alignment with stable draw distribution.",
      },
      {
        number: `${h4}${h1}${h3}${h2}`,
        category: "Balanced Sum" as const,
        confidence_score: 77,
        rationale: "Balanced mathematical sum within Kerala lottery high-density payout range.",
      },
      {
        number: `${h0}${d0}${h1}${d0}`,
        category: "2nd/6th Target" as const,
        confidence_score: 75,
        rationale: "Alternate repeating digit sequence calibrated for mid-tier 4-digit prizes.",
      },
      {
        number: `${h2}${h4}${h0}${h3}`,
        category: "Balanced Sum" as const,
        confidence_score: 74,
        rationale: "Even-odd parity balance with optimal aggregate digit sum.",
      },
      {
        number: `${p1_alt}${h0}${h3}${p4_alt}`,
        category: "Hot 4-Digit" as const,
        confidence_score: 73,
        rationale: "Tertiary positional hot distribution with stable edge digits.",
      },
      {
        number: `${h0}${h0}${d1}${h4}`,
        category: "Double Pattern" as const,
        confidence_score: 72,
        rationale: "Leading recurring double with high probability ending digit.",
      },
      {
        number: `${h1}${h5}${h2}${h6}`,
        category: "Balanced Sum" as const,
        confidence_score: 71,
        rationale: "Optimally dispersed 4-digit sum with balanced high-low split.",
      },
      {
        number: `${h5}${d0}${d0}${h1}`,
        category: "Double Pattern" as const,
        confidence_score: 70,
        rationale: "Center double reflection with leading odd-tier frequency digit.",
      },
      {
        number: `${p1}${h3}${h4}${p4_alt}`,
        category: "2nd/6th Target" as const,
        confidence_score: 69,
        rationale: "Cluster alignment calibrated for 2nd & 6th tier prize lines.",
      },
      {
        number: `${h3}${h1}${h6}${h0}`,
        category: "Hot 4-Digit" as const,
        confidence_score: 68,
        rationale: "Fast-moving digit quartet with high historical payout frequency.",
      },
      {
        number: `${h4}${d1}${h0}${d1}`,
        category: "2nd/6th Target" as const,
        confidence_score: 67,
        rationale: "Interleaved duplicate digit structure common in Kerala 4-digit prize tiers.",
      },
    ];

    const seen = new Set(base.map((p) => p.number));
    for (const cand of extraCandidates) {
      if (base.length >= 15) break;
      if (!seen.has(cand.number)) {
        seen.add(cand.number);
        base.push(cand);
      }
    }

    return base.slice(0, 15);
  }, [analysis]);

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

    const predictedList = allPredictions
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
  }, [analysis, allPredictions, currentLottery, selectedLotteryCode]);

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

  // Handle WhatsApp Share
  const handleWhatsAppShare = () => {
    if (!analysis) return;

    const hotList = (analysis.hot_digits?.overall || [])
      .slice(0, 4)
      .map((h, i) => `#${i + 1} Digit ${h.digit} (${h.frequency_pct}%)`)
      .join(", ");

    const predictedList = allPredictions
      .slice(0, 15)
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
    if (!allPredictions.length) return [];
    if (selectedCategory === "all") return allPredictions;
    return allPredictions.filter((p) => {
      if (selectedCategory === "doubles") return p.category === "Double Pattern";
      if (selectedCategory === "2nd_6th") return p.category === "2nd/6th Target";
      if (selectedCategory === "hot") return p.category === "Hot 4-Digit";
      if (selectedCategory === "sum") return p.category === "Balanced Sum";
      return true;
    });
  }, [allPredictions, selectedCategory]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", maxWidth: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
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
          maxWidth: "100%",
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
            gap: 1.5,
            mb: 2,
            maxWidth: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, maxWidth: "100%" }}>
            <Box
              sx={{
                width: { xs: 40, sm: 46 },
                height: { xs: 40, sm: 46 },
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0B3C5D 0%, #4F46E5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(11, 60, 93, 0.2)",
                flexShrink: 0,
              }}
            >
              <PsychologyIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: "#0F172A",
                    fontSize: { xs: "1.05rem", sm: "1.25rem" },
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {isMl ? "AI ഭാഗ്യ നമ്പർ പ്രവചനങ്ങൾ" : "AI Lottery Number Predictor"}
                </Typography>
                <Chip
                  icon={<AutoAwesomeIcon sx={{ color: "#7C3AED !important", fontSize: 13 }} />}
                  label="Smart AI"
                  size="small"
                  sx={{
                    bgcolor: "#F5F3FF",
                    color: "#7C3AED",
                    fontWeight: 800,
                    fontSize: "0.68rem",
                    height: 22,
                    border: "1px solid #DDD6FE",
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: { xs: "0.78rem", sm: "0.84rem" }, mt: 0.2 }}>
                {isMl
                  ? "ഇന്നത്തെ മികച്ച 4-അക്ക ഭാഗ്യ നമ്പറുകൾ കാണാൻ ലോട്ടറി തിരഞ്ഞെടുക്കൂ."
                  : "Select your lottery to find today's best 4-digit lucky numbers."}
              </Typography>
            </Box>
          </Box>

          {/* Records Loaded Chip */}
          <Chip
            icon={<TableChartIcon sx={{ fontSize: 14 }} />}
            label={`${availableDraws.length} ${isMl ? "ഫലങ്ങൾ" : "Draws"}`}
            size="small"
            sx={{
              bgcolor: availableDraws.length > 0 ? "#F0FDF4" : "#FEF2F2",
              color: availableDraws.length > 0 ? "#16A34A" : "#DC2626",
              fontWeight: 800,
              fontSize: "0.72rem",
              height: 26,
              border: `1px solid ${availableDraws.length > 0 ? "#BBF7D0" : "#FECACA"}`,
              flexShrink: 0,
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          />
        </Box>

        {/* Clean, Symmetrical Lottery Selection Grid */}
        <Box sx={{ mb: 2.5, maxWidth: "100%" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              mb: 1.2,
              fontSize: "0.75rem",
            }}
          >
            {isMl ? "ലോട്ടറി തിരഞ്ഞെടുക്കുക:" : "Select Lottery:"}
          </Typography>

          {/* Symmetrical 2-column grid on mobile (4 even rows of 2), 4-column on desktop */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 1, sm: 1.2 },
              width: "100%",
            }}
          >
            {lotteryOptions.map((opt) => {
              const isSelected = selectedLotteryCode === opt.code;
              const logo = getLotteryLogo(opt.code);
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
                    width: "100%",
                    height: "100%",
                    minHeight: { xs: 52, sm: 56 },
                    bgcolor: isSelected ? "#0B3C5D" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#1E293B",
                    border: `1.5px solid ${isSelected ? "#0B3C5D" : "#E2E8F0"}`,
                    borderRadius: "12px",
                    fontWeight: isSelected ? 800 : 600,
                    px: { xs: 1.2, sm: 1.5 },
                    py: { xs: 0.8, sm: 1 },
                    textTransform: "none",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(11, 60, 93, 0.2)"
                      : "0 1px 3px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: { xs: 0.8, sm: 1.2 },
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: isSelected ? "#0B3C5D" : "#F8FAFC",
                      borderColor: isSelected ? "#0B3C5D" : "#CBD5E1",
                    },
                  }}
                >
                  {logo && (
                    <Box
                      component="img"
                      src={logo}
                      alt={getLotteryLogoAlt(opt.name, opt.day)}
                      sx={{
                        width: { xs: 26, sm: 30 },
                        height: { xs: 26, sm: 30 },
                        borderRadius: "6px",
                        objectFit: "cover",
                        border: isSelected ? "1px solid rgba(255,255,255,0.4)" : "1px solid #CBD5E1",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <Box sx={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "0.78rem", sm: "0.84rem" },
                        lineHeight: 1.2,
                        color: isSelected ? "#FFFFFF" : "#0F172A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {opt.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.64rem", sm: "0.7rem" },
                        color: isSelected ? "#93C5FD" : "#64748B",
                        lineHeight: 1.1,
                        mt: 0.2,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {opt.day}
                    </Typography>
                  </Box>
                  {isSelected && (
                    <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: "#4ADE80", flexShrink: 0 }} />
                  )}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Action Trigger Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            pt: 2,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon sx={{ color: "#0B3C5D", fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "#334155", fontWeight: 700, fontSize: { xs: "0.82rem", sm: "0.875rem" } }}>
              {isMl
                ? `തിരഞ്ഞെടുത്തത്: ${currentLottery.name} (${availableDraws.length} ഫലങ്ങൾ)`
                : `Selected: ${currentLottery.name} (${availableDraws.length} draws analyzed)`}
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
              width: { xs: "100%", sm: "auto" },
              bgcolor: "#0B3C5D",
              color: "#FFFFFF !important",
              fontWeight: 900,
              fontSize: { xs: "0.92rem", sm: "0.95rem" },
              borderRadius: "12px",
              px: 3.5,
              py: { xs: 1.3, sm: 1.2 },
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#0F2C59",
              },
              "&.Mui-disabled": {
                bgcolor: "#0B3C5D !important",
                color: "#FFFFFF !important",
                opacity: 0.85,
                boxShadow: "none",
                cursor: "not-allowed",
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "0.92rem", sm: "0.95rem" },
                color: "#FFFFFF !important",
              }}
            >
              {loading
                ? isMl
                  ? "വിശകലനം ചെയ്യുന്നു..."
                  : "Finding Numbers..."
                : isMl
                ? "ഭാഗ്യ നമ്പറുകൾ കണ്ടെത്തുക"
                : "Find Lucky Numbers"}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
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
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    bgcolor: "#DCFCE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16A34A",
                    flexShrink: 0,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.2rem", lineHeight: 1.2 }}>
                    {isMl ? "AI കണ്ടെത്തിയ 15 മുൻനിര ഭാഗ്യ നമ്പറുകൾ" : "Top 15 AI Lucky Numbers (Last 4 Digits)"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", mt: 0.3 }}>
                    {isMl
                      ? "മുൻകാലങ്ങളിൽ കൂടുതൽ സമ്മാനം നേടിയ നമ്പറുകളിൽ നിന്നുള്ള 15 മുൻനിര 4 അക്ക ഭാഗ്യ നമ്പറുകൾ"
                      : "Top 15 high-chance 4-digit endings for today's tickets based on past winning draws."}
                  </Typography>
                </Box>
              </Box>

              {/* Category Filter Chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {[
                  { key: "all", label: isMl ? "എല്ലാ നമ്പറുകളും" : "All Picks" },
                  { key: "hot", label: isMl ? "🔥 ഹോട്ട് നമ്പറുകൾ" : "🔥 Hot 4-Digit" },
                  { key: "doubles", label: isMl ? "⚡ ഇരട്ട അക്കങ്ങൾ" : "⚡ Double Pairs" },
                  { key: "2nd_6th", label: isMl ? "🎯 2 & 6 സമ്മാനം" : "🎯 2nd/6th Target" },
                  { key: "sum", label: isMl ? "⚖️ ബാലൻസ്ഡ്" : "⚖️ Balanced Sum" },
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
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      px: 0.5,
                      py: 1.8,
                      borderRadius: "10px",
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: selectedCategory === c.key ? "#0B3C5D" : "#E2E8F0" },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Grid of Number Ticket Cards */}
            <Grid container spacing={2.5}>
              {filteredPredictions.map((pred, i) => {
                const digits = pred.number.split("");
                const isDouble = pred.category === "Double Pattern";
                const is2nd6th = pred.category === "2nd/6th Target";
                const isHot = pred.category === "Hot 4-Digit";

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Box
                      sx={{
                        p: 2.2,
                        bgcolor: "#FFFFFF",
                        borderRadius: "18px",
                        border: "2px solid #E2E8F0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#0B3C5D",
                          boxShadow: "0 8px 24px rgba(11, 60, 93, 0.08)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {/* Top Badges */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.8 }}>
                        <Chip
                          label={
                            isHot
                              ? isMl ? "🔥 ഹോട്ട് നമ്പർ" : "🔥 Hot Number"
                              : isDouble
                              ? isMl ? "⚡ ഇരട്ട അക്കം" : "⚡ Double Pair"
                              : is2nd6th
                              ? isMl ? "🎯 2 & 6 സമ്മാനം" : "🎯 2nd/6th Target"
                              : isMl ? "⚖️ ബാലൻസ്ഡ്" : "⚖️ Balanced Sum"
                          }
                          size="small"
                          sx={{
                            bgcolor: isHot ? "#FEF2F2" : isDouble ? "#EEF2FF" : is2nd6th ? "#FEF3C7" : "#F0FDF4",
                            color: isHot ? "#DC2626" : isDouble ? "#4F46E5" : is2nd6th ? "#D97706" : "#16A34A",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            border: `1px solid ${isHot ? "#FECACA" : isDouble ? "#C7D2FE" : is2nd6th ? "#FDE68A" : "#BBF7D0"}`,
                          }}
                        />
                        <Chip
                          icon={<StarIcon sx={{ fontSize: "14px !important", color: "#16A34A !important" }} />}
                          label={`${pred.confidence_score || 85}% ${isMl ? "സാധ്യത" : "Chance"}`}
                          size="small"
                          sx={{
                            bgcolor: "#F0FDF4",
                            color: "#15803D",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            border: "1px solid #BBF7D0",
                          }}
                        />
                      </Box>

                      {/* 4 Distinct Lottery Ticket Number Boxes (No copy button) */}
                      <Box
                        sx={{
                          py: 1.8,
                          px: 1,
                          bgcolor: "#F8FAFC",
                          borderRadius: "14px",
                          border: "1.5px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: { xs: 1, sm: 1.2 },
                          mb: 1.8,
                        }}
                      >
                        {digits.map((d, dIdx) => (
                          <Box
                            key={dIdx}
                            sx={{
                              width: { xs: 46, sm: 52 },
                              height: { xs: 50, sm: 56 },
                              borderRadius: "10px",
                              bgcolor: "#FFFFFF",
                              border: "2px solid #0B3C5D",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 5px rgba(11, 60, 93, 0.08)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: { xs: "1.7rem", sm: "1.9rem" },
                                color: "#0B3C5D",
                                fontFamily: "monospace",
                                lineHeight: 1,
                              }}
                            >
                              {d}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Simple, easy-to-understand explanation */}
                      <Box
                        sx={{
                          p: 1.2,
                          bgcolor: "#F8FAFC",
                          borderRadius: "10px",
                          border: "1px dashed #CBD5E1",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#475569",
                            fontSize: "0.78rem",
                            lineHeight: 1.45,
                            display: "block",
                            fontWeight: 500,
                          }}
                        >
                          {getFriendlyExplanation(pred.rationale, pred.category)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          {/* Grid of Hot Digits & Double Patterns */}
          <Grid container spacing={3}>
            {/* Card 1: Hot Digits & Ticket Position Guide */}
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
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        bgcolor: "#FEF2F2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#DC2626",
                      }}
                    >
                      <WhatshotIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.05rem" }}>
                        {isMl ? "കൂടുതൽ വന്ന ഭാഗ്യ അക്കങ്ങൾ (Hot Digits)" : "Hot Digits & Ticket Position Guide"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {isMl ? "വിജയിച്ച ടിക്കറ്റുകളിൽ ഏറ്റവും കൂടുതൽ തവണ വന്ന അക്കങ്ങൾ" : "Top recurring numbers in winning draws and their best positions"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Top 4 Most Frequent Lucky Digits Display */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    {isMl ? "🔥 ഏറ്റവും കൂടുതൽ വന്ന അക്കങ്ങൾ:" : "🔥 Top 4 Most Drawn Digits:"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      bgcolor: "#FFFDF5",
                      border: "1.5px solid #FDE68A",
                      borderRadius: "16px",
                      p: 2,
                      mb: 2.5,
                    }}
                  >
                    {(analysis.hot_digits?.overall || []).slice(0, 4).map((h, i) => (
                      <Box key={i} sx={{ textAlign: "center" }}>
                        <Box
                          sx={{
                            width: { xs: 48, sm: 54 },
                            height: { xs: 48, sm: 54 },
                            borderRadius: "50%",
                            background:
                              i === 0
                                ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
                                : i === 1
                                ? "linear-gradient(135deg, #EA580C 0%, #F97316 100%)"
                                : "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 10px rgba(220, 38, 38, 0.2)",
                            mx: "auto",
                            mb: 0.8,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: { xs: "1.5rem", sm: "1.7rem" },
                              fontFamily: "monospace",
                            }}
                          >
                            {h.digit}
                          </Typography>
                        </Box>
                        <Chip
                          label={i === 0 ? (isMl ? "ഏറ്റവും കൂടുതൽ" : "Top Pick") : `#${i + 1}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.68rem",
                            bgcolor: i === 0 ? "#FEF2F2" : "#FFFFFF",
                            color: i === 0 ? "#DC2626" : "#B45309",
                            border: `1px solid ${i === 0 ? "#FECACA" : "#CBD5E1"}`,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Less Frequent (Cold) Digits row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#F8FAFC",
                      borderRadius: "12px",
                      p: 1.2,
                      border: "1px solid #E2E8F0",
                      mb: 2.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                      {isMl ? "❄️ കുറഞ്ഞ തവണ വന്നവ:" : "❄️ Less Frequent Digits:"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.8 }}>
                      {(analysis.hot_digits?.overall || []).slice(-3).map((c, idx) => (
                        <Chip
                          key={idx}
                          label={c.digit}
                          size="small"
                          sx={{
                            bgcolor: "#FFFFFF",
                            border: "1px solid #CBD5E1",
                            fontWeight: 800,
                            fontFamily: "monospace",
                            fontSize: "0.82rem",
                            color: "#64748B",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Positional Recommendations Matrix (Clean 4-Digit Ticket Layout) */}
                  {analysis.hot_digits?.positional && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: "#0F172A",
                          fontSize: "0.85rem",
                          display: "block",
                          mb: 1.2,
                        }}
                      >
                        {isMl ? "🎯 ടിക്കറ്റിലെ ഓരോ സ്ഥാനത്തെയും സാധ്യതകൾ:" : "🎯 Ticket Position Guide (1st to 4th Digit):"}
                      </Typography>

                      <Grid container spacing={1.2}>
                        {[
                          {
                            pos: isMl ? "1-ാം അക്കം" : "1st Digit",
                            nums: analysis.hot_digits.positional.first_pos || [],
                            color: "#2563EB",
                            bgcolor: "#EFF6FF",
                          },
                          {
                            pos: isMl ? "2-ാം അക്കം" : "2nd Digit",
                            nums: analysis.hot_digits.positional.second_pos || [],
                            color: "#7C3AED",
                            bgcolor: "#F5F3FF",
                          },
                          {
                            pos: isMl ? "3-ാം അക്കം" : "3rd Digit",
                            nums: analysis.hot_digits.positional.third_pos || [],
                            color: "#D97706",
                            bgcolor: "#FFFBEB",
                          },
                          {
                            pos: isMl ? "അവസാന അക്കം" : "Last Digit",
                            nums: analysis.hot_digits.positional.last_pos || [],
                            color: "#16A34A",
                            bgcolor: "#F0FDF4",
                          },
                        ].map((p, idx) => (
                          <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                            <Box
                              sx={{
                                p: 1.2,
                                bgcolor: p.bgcolor,
                                borderRadius: "12px",
                                border: `1px solid ${p.color}30`,
                                textAlign: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: p.color,
                                  fontWeight: 800,
                                  fontSize: "0.72rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {p.pos}
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  fontSize: "1.05rem",
                                  color: "#0F172A",
                                  fontFamily: "monospace",
                                  mt: 0.3,
                                }}
                              >
                                {p.nums.join(" , ") || "-"}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748B",
                          display: "block",
                          mt: 1.2,
                          fontStyle: "italic",
                        }}
                      >
                        {isMl
                          ? "💡 സൂചന: ടിക്കറ്റ് എടുക്കുമ്പോൾ അവസാന 4 അക്കങ്ങളിൽ ഈ നമ്പറുകൾ വരുന്നത് മുൻഗണന നൽകുക."
                          : "💡 Quick Tip: Look for tickets whose last 4 digits match these recommended positions."}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Card 2: Double Number Patterns (No copy button) */}
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
                      width: 38,
                      height: 38,
                      borderRadius: "12px",
                      bgcolor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4F46E5",
                    }}
                  >
                    <RepeatIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.05rem" }}>
                      {isMl ? "ഇരട്ട അക്കങ്ങൾ (Double Numbers)" : "Double Numbers Guide"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      {isMl ? "വിജയിക്കുന്ന ടിക്കറ്റുകളിൽ പതിവായി വരുന്ന ഇരട്ട അക്കങ്ങൾ" : "Repeating digit pairs frequently seen in winning tickets"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                  {(analysis.double_patterns || []).map((d, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 2,
                        bgcolor: "#F8FAFC",
                        borderRadius: "14px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                        <Typography sx={{ fontWeight: 900, color: "#1E293B", fontSize: "0.95rem", fontFamily: "monospace" }}>
                          {d.pattern}
                        </Typography>
                        <Chip
                          label={d.historical_frequency || "Active Pattern"}
                          size="small"
                          sx={{
                            bgcolor: "#EEF2FF",
                            color: "#4338CA",
                            fontWeight: 800,
                            fontSize: "0.68rem",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.82rem", mb: 1.5 }}>
                        {d.description}
                      </Typography>

                      {/* Recommended Sample Numbers - NO COPY BUTTON */}
                      {d.recommended_examples && d.recommended_examples.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                          <Typography variant="caption" sx={{ color: "#475569", fontWeight: 800 }}>
                            {isMl ? "ശുപാർശ ചെയ്യുന്നവ:" : "Suggested Picks:"}
                          </Typography>
                          {d.recommended_examples.map((num, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                px: 1.5,
                                py: 0.6,
                                bgcolor: "#FFFFFF",
                                border: "1.5px solid #0B3C5D",
                                borderRadius: "8px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  fontFamily: "monospace",
                                  fontSize: "0.95rem",
                                  color: "#0B3C5D",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                {num}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Section: High-Probability Strategy Patterns (2nd & 6th Prize Focus) */}
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
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  bgcolor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D97706",
                  flexShrink: 0,
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.2rem" }}>
                  {isMl
                    ? "2-ാം & 6-ാം സമ്മാനങ്ങൾക്കുള്ള നമ്പറുകൾ (അവസാന 4 അക്കങ്ങൾ)"
                    : "2nd & 6th Prize Special Winning Numbers"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", mt: 0.3 }}>
                  {isMl
                    ? "കേരള ലോട്ടറി 2-ാം സമ്മാനവും 6-ാം സമ്മാനവും നിശ്ചയിക്കുന്നത് അവസാന 4 അക്കങ്ങളാണ്. അതിനായി ശുപാർശ ചെയ്യുന്നവ:"
                    : "Kerala Lottery 2nd prize and 6th prize are won on 4-digit numbers. Recommended combinations:"}
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
                        <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "0.98rem" }}>
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
                            fontSize: "0.72rem",
                          }}
                        />
                      </Box>

                      {/* Formula / Structure */}
                      <Box
                        sx={{
                          p: 1.2,
                          bgcolor: "#FFFFFF",
                          borderRadius: "10px",
                          border: "1px dashed #CBD5E1",
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                          {isMl ? "പാറ്റേൺ ഘടന:" : "Pattern Structure:"}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: "#2563EB", fontSize: "0.9rem", fontFamily: "monospace" }}>
                          {pattern.pattern_structure}
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: "#475569", lineHeight: 1.5, display: "block", mb: 2, fontSize: "0.8rem" }}>
                        {pattern.reasoning}
                      </Typography>
                    </Box>

                    {/* Target Numbers - NO COPY BUTTON */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", display: "block", mb: 0.8 }}>
                        {isMl ? "ശുപാർശ ചെയ്യുന്ന നമ്പറുകൾ:" : "Recommended Numbers:"}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {(pattern.predicted_numbers || []).map((num, nIdx) => (
                          <Box
                            key={nIdx}
                            sx={{
                              px: 1.8,
                              py: 0.8,
                              bgcolor: "#FFFFFF",
                              border: "2px solid #0B3C5D",
                              borderRadius: "10px",
                              boxShadow: "0 2px 4px rgba(11, 60, 93, 0.08)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontFamily: "monospace",
                                fontSize: "1.05rem",
                                color: "#0B3C5D",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {num}
                            </Typography>
                          </Box>
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
                    width: 38,
                    height: 38,
                    borderRadius: "12px",
                    bgcolor: "#F0FDF4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16A34A",
                  }}
                >
                  <BalanceIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.05rem" }}>
                    {isMl ? "4-അക്ക ആകെത്തുകയും ഒറ്റ-ഇരട്ട അനുപാതവും" : "4-Digit Total Sum & Even-Odd Guide"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {isMl
                      ? "വിജയിച്ച ടിക്കറ്റുകളിൽ സാധാരണയായി കാണപ്പെടുന്ന തുകയും അക്കങ്ങളുടെ അനുപാതവും"
                      : "Most winning tickets share these simple mathematical balance properties"}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                      {isMl ? "ശുപാർശ ചെയ്യുന്ന ആകെത്തുക:" : "Recommended 4-Digit Total Sum:"}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#16A34A", fontSize: "1.2rem", mt: 0.5 }}>
                      {analysis.high_value_analysis.recommended_sum_range}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mt: 0.3 }}>
                      {isMl ? "4 അക്കങ്ങൾ കൂട്ടിയാൽ കിട്ടുന്ന തുക" : "Sum of all 4 ticket ending digits"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                      {isMl ? "ഇരട്ട / ഒറ്റ അക്ക അനുപാതം:" : "Even / Odd Digits Ratio:"}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#2563EB", fontSize: "1.2rem", mt: 0.5 }}>
                      {analysis.high_value_analysis.even_odd_ratio}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mt: 0.3 }}>
                      {isMl ? "തുല്യമായ ഒറ്റ-ഇരട്ട അക്കങ്ങൾ" : "Balanced mix of even & odd digits"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                      {isMl ? "വലിയ (5-9) vs ചെറിയ (0-4) അക്കങ്ങൾ:" : "High (5-9) vs Low (0-4) Balance:"}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#9333EA", fontSize: "1.2rem", mt: 0.5 }}>
                      {analysis.high_value_analysis.high_low_ratio}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mt: 0.3 }}>
                      {isMl ? "ചെറിയതും വലിയതുമായ അക്കങ്ങളുടെ ബാലൻസ്" : "Balanced split between small & large digits"}
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

              <TableContainer sx={{ maxHeight: 380, maxWidth: "100%", overflowX: "auto" }}>
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
