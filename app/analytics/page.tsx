"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";

// MUI Icons
import InsightsIcon from "@mui/icons-material/Insights";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  fetchAllDrawResultsFromSupabase,
  StructuredDrawResult,
  ALL_LOTTERIES,
} from "@/lib/supabase";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

const KERALA_DISTRICTS_ML: Record<string, string> = {
  Thiruvananthapuram: "തിരുവനന്തപുരം",
  Kollam: "കൊല്ലം",
  Pathanamthitta: "പത്തനംതിട്ട",
  Alappuzha: "ആലപ്പുഴ",
  Kottayam: "കോട്ടയം",
  Idukki: "ഇടുക്കി",
  Ernakulam: "എറണാകുളം",
  Thrissur: "തൃശ്ശൂർ",
  Palakkad: "പാലക്കാട്",
  Malappuram: "മലപ്പുറം",
  Kozhikode: "കോഴിക്കോട്",
  Wayanad: "വയനാട്",
  Kannur: "കണ്ണൂർ",
  Kasaragod: "കാസർഗോഡ്",
};

const QUICK_PICKS = [
  { num: "5593", bg: "#EEF2FF", text: "#2563EB", border: "#C7D2FE" },
  { num: "5866", bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
  { num: "2749", bg: "#DCFCE7", text: "#16A34A", border: "#BBF7D0" },
  { num: "9924", bg: "#F3E8FF", text: "#9333EA", border: "#E9D5FF" },
  { num: "8712", bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  { num: "8860", bg: "#CCFBF1", text: "#0D9488", border: "#99F6E4" },
  { num: "0096", bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
  { num: "1234", bg: "#EFF6FF", text: "#0284C7", border: "#BAE6FD" },
];

export default function AnalyticsPage() {
  const [draws, setDraws] = useState<StructuredDrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<"30" | "90" | "all">("90");
  const [activeTab, setActiveTab] = useState<"numbers" | "districts">("numbers");
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [districtQuery, setDistrictQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // 4-Digit Wheel State
  const [digits, setDigits] = useState<[number, number, number, number]>([0, 0, 9, 6]);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const isMl = lang === "ml";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await fetchAllDrawResultsFromSupabase(true);
      setDraws(results || []);
    } catch (e) {
      console.warn("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle individual digit increment / decrement / direct change
  const handleDigitChange = (colIndex: number, newVal: number) => {
    const clamped = Math.max(0, Math.min(9, newVal));
    setDigits((prev) => {
      const next = [...prev] as [number, number, number, number];
      next[colIndex] = clamped;
      return next;
    });
  };

  const handleSelectQuickPick = (numStr: string) => {
    const clean = numStr.trim().replace(/\D/g, "");
    const padded = clean.padStart(4, "0").slice(-4);
    const dArr: [number, number, number, number] = [
      parseInt(padded[0], 10) || 0,
      parseInt(padded[1], 10) || 0,
      parseInt(padded[2], 10) || 0,
      parseInt(padded[3], 10) || 0,
    ];
    setDigits(dArr);
    setSubmittedQuery(clean);
  };

  const handleCheckHistory = () => {
    setSubmittedQuery(digits.join(""));
  };

  // Filter draws by selected time horizon
  const filteredDraws = useMemo(() => {
    if (horizon === "30") return draws.slice(0, 30);
    if (horizon === "90") return draws.slice(0, 90);
    return draws;
  }, [draws, horizon]);

  // Compute number frequency statistics
  const numberStats = useMemo(() => {
    const ending4Map: Record<string, number> = {};
    const ending2Map: Record<string, number> = {};
    const singleDigitMap: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
      5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
    };

    let totalPrizesCounted = 0;

    filteredDraws.forEach((draw) => {
      // 1st Prize
      if (draw.first?.ticket && draw.first.ticket !== "N/A" && draw.first.ticket !== "pending") {
        const digitsStr = draw.first.ticket.replace(/\D/g, "");
        if (digitsStr.length >= 4) {
          const e4 = digitsStr.slice(-4);
          ending4Map[e4] = (ending4Map[e4] || 0) + 1;
        }
        if (digitsStr.length >= 2) {
          const e2 = digitsStr.slice(-2);
          ending2Map[e2] = (ending2Map[e2] || 0) + 1;
        }
        const lastD = parseInt(digitsStr.slice(-1), 10);
        if (!isNaN(lastD)) singleDigitMap[lastD]++;
        totalPrizesCounted++;
      }

      // Other Prize Tiers (2nd to 9th, excluding consolation since 1st prize digits are already counted)
      if (draw.prizes) {
        const tiers = [
          "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th",
        ] as const;
        tiers.forEach((tier) => {
          const arr = (draw.prizes as any)?.[tier];
          if (Array.isArray(arr)) {
            arr.forEach((numStr: string) => {
              const d = String(numStr).replace(/\D/g, "");
              if (d.length >= 4) {
                const e4 = d.slice(-4);
                ending4Map[e4] = (ending4Map[e4] || 0) + 1;
              }
              if (d.length >= 2) {
                const e2 = d.slice(-2);
                ending2Map[e2] = (ending2Map[e2] || 0) + 1;
              }
              const lastD = parseInt(d.slice(-1), 10);
              if (!isNaN(lastD)) singleDigitMap[lastD]++;
              totalPrizesCounted++;
            });
          }
        });
      }
    });

    // Top Hot 4-digit numbers
    const hot4 = Object.entries(ending4Map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // Top Hot 2-digit numbers
    const hot2 = Object.entries(ending2Map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // Cold / Least frequent 2-digit numbers
    const cold2 = Object.entries(ending2Map)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 6);

    return { hot4, hot2, cold2, singleDigitMap, totalPrizesCounted };
  }, [filteredDraws]);

  // Compute District Heatmap & Leaderboard
  const districtStats = useMemo(() => {
    const distCounts: Record<string, { count: number; lotteries: string[] }> = {};
    KERALA_DISTRICTS.forEach((d) => {
      distCounts[d] = { count: 0, lotteries: [] };
    });

    let totalJackpotDraws = 0;

    filteredDraws.forEach((draw) => {
      const loc = (draw.first?.location || "").toLowerCase();
      if (loc && loc !== "n/a" && loc !== "pending") {
        totalJackpotDraws++;
        for (const dist of KERALA_DISTRICTS) {
          if (loc.includes(dist.toLowerCase())) {
            distCounts[dist].count += 1;
            distCounts[dist].lotteries.push(draw.draw_name || draw.lottery_code);
            break;
          }
        }
      }
    });

    const ranked = Object.entries(distCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...ranked.map((r) => r.count), 1);
    const topDistrict = ranked[0]?.count > 0 ? ranked[0] : null;

    return { ranked, maxCount, totalJackpotDraws, topDistrict };
  }, [filteredDraws]);

  // Interactive custom number lookup
  const searchResult = useMemo(() => {
    if (!submittedQuery || submittedQuery.length < 2) return null;
    const query = submittedQuery.trim().replace(/\D/g, "");
    if (!query || query.length < 2) return null;

    let totalMatches = 0;
    const tierBreakdown: Record<string, number> = {};
    const matchedDraws: Array<{
      date: string;
      name: string;
      tier: string;
      fullTicket: string;
    }> = [];

    filteredDraws.forEach((draw) => {
      // 1st Prize
      if (draw.first?.ticket && draw.first.ticket !== "N/A" && draw.first.ticket !== "pending") {
        const d = draw.first.ticket.replace(/\D/g, "");
        if (d.endsWith(query) || d === query) {
          totalMatches++;
          tierBreakdown["1st Prize"] = (tierBreakdown["1st Prize"] || 0) + 1;
          matchedDraws.push({
            date: draw.draw_date,
            name: draw.draw_name || draw.lottery_code,
            tier: "1st Prize",
            fullTicket: draw.first.ticket,
          });
        }
      }

      // Other Prizes (2nd to 9th)
      if (draw.prizes) {
        const tiers = [
          "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th",
        ] as const;
        tiers.forEach((tier) => {
          const arr = (draw.prizes as any)?.[tier];
          if (Array.isArray(arr)) {
            arr.forEach((numStr: string) => {
              const d = String(numStr).replace(/\D/g, "");
              if (d.endsWith(query) || d === query) {
                totalMatches++;
                const tierName = `${tier.toUpperCase()} Prize`;
                tierBreakdown[tierName] = (tierBreakdown[tierName] || 0) + 1;
                matchedDraws.push({
                  date: draw.draw_date,
                  name: draw.draw_name || draw.lottery_code,
                  tier: tierName,
                  fullTicket: String(numStr),
                });
              }
            });
          }
        });
      }
    });

    const hitRatePct =
      filteredDraws.length > 0
        ? Math.min(100, Math.round((totalMatches / filteredDraws.length) * 100))
        : 0;

    return {
      query,
      totalMatches,
      tierBreakdown,
      hitRatePct,
      matchedDraws: matchedDraws.slice(0, 8),
    };
  }, [submittedQuery, filteredDraws]);

  // Live Odd/Even & High/Low Pattern Balance Indicator
  const digitBalance = useMemo(() => {
    let odd = 0;
    let even = 0;
    let low = 0; // 0-4
    let high = 0; // 5-9
    let sum = 0;

    digits.forEach((d) => {
      if (d % 2 === 0) even++;
      else odd++;
      if (d >= 5) high++;
      else low++;
      sum += d;
    });

    let balanceScore = 50;
    if (odd === 2 && even === 2) balanceScore += 24;
    else if (odd === 3 || odd === 1) balanceScore += 14;
    else balanceScore += 4;

    if (high === 2 && low === 2) balanceScore += 24;
    else if (high === 3 || high === 1) balanceScore += 14;
    else balanceScore += 4;

    if (sum >= 12 && sum <= 24) balanceScore = Math.min(99, balanceScore + 2);

    let statusText = isMl ? "മികച്ച ബാലൻസ്ഡ് കോമ്പിനേഷൻ" : "Highly Balanced Pattern";
    let statusColor = "#16A34A";
    let bgTint = "#F0FDF4";
    let borderTint = "#BBF7D0";

    if (balanceScore < 70) {
      statusText = isMl ? "അസമീകൃത പാറ്റേൺ (Skewed)" : "Skewed Distribution Pattern";
      statusColor = "#D97706";
      bgTint = "#FFFBEB";
      borderTint = "#FDE68A";
    } else if (balanceScore < 85) {
      statusText = isMl ? "മിതമായ ബാലൻസ്ഡ് പാറ്റേൺ" : "Moderately Balanced Pattern";
      statusColor = "#2563EB";
      bgTint = "#EFF6FF";
      borderTint = "#BFDBFE";
    }

    return {
      odd,
      even,
      low,
      high,
      sum,
      balanceScore,
      statusText,
      statusColor,
      bgTint,
      borderTint,
    };
  }, [digits, isMl]);

  // Filtered districts for search
  const displayedDistricts = useMemo(() => {
    if (!districtQuery.trim()) return districtStats.ranked;
    const q = districtQuery.toLowerCase().trim();
    return districtStats.ranked.filter((d) => {
      const mlName = KERALA_DISTRICTS_ML[d.name] || "";
      return d.name.toLowerCase().includes(q) || mlName.toLowerCase().includes(q);
    });
  }, [districtStats.ranked, districtQuery]);

  // WhatsApp Share Builder
  const handleWhatsAppShare = () => {
    const hot4List = numberStats.hot4
      .slice(0, 5)
      .map(([num, count], i) => `#${i + 1} 🎯 ${num} (${count}x)`)
      .join("\n");

    const topDistName = districtStats.topDistrict
      ? `${districtStats.topDistrict.name} (${districtStats.topDistrict.count} Wins)`
      : "Palakkad";

    const shareText = isMl
      ? `📊 *കേരള ലോട്ടറി സ്റ്റാറ്റിസ്റ്റിക്സ് & ട്രെൻഡ്സ്*\n\n🔥 *കൂടുതൽ തവണ വന്ന 4-അക്കങ്ങൾ:*\n${hot4List}\n\n🏆 *കൂടുതൽ 1-ാം സമ്മാനം നേടിയ ജില്ല:* ${topDistName}\n\nകൂടുതൽ വിവരങ്ങൾ പരിശോധിക്കാൻ: https://www.keralalotteryresultstoday.in/analytics`
      : `📊 *Kerala Lottery Number Trends & Analytics*\n\n🔥 *Top Hot 4-Digit Endings:*\n${hot4List}\n\n🏆 *Top Winning District:* ${topDistName}\n\nCheck full trends & historical numbers:\nhttps://www.keralalotteryresultstoday.in/analytics`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
      {/* Top Banner & Header */}
      <Box
        sx={{
          bgcolor: "#0B3C5D",
          color: "#FFFFFF",
          pt: { xs: 4, md: 5 },
          pb: { xs: 4, md: 4.5 },
          position: "relative",
          borderBottom: "1px solid #1E293B",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            {/* Title & Subtitle */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
                <Chip
                  icon={<InsightsIcon sx={{ color: "#10B981 !important", fontSize: 16 }} />}
                  label={isMl ? "ഡീപ് ഡാറ്റ അനലിറ്റിക്സ്" : "DATA-DRIVEN INSIGHTS"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(16, 185, 129, 0.15)",
                    color: "#34D399",
                    fontWeight: 800,
                    fontSize: isMl ? "0.75rem" : "0.7rem",
                    letterSpacing: "0.05em",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                  }}
                />
                <Chip
                  label={isMl ? "ഓഫീഷ്യൽ ഗസറ്റ് ഫലങ്ങൾ" : "Official Gazette Records"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    color: "#E2E8F0",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: isMl ? "1.65rem" : "1.85rem", sm: "2.3rem", md: "2.6rem" },
                  lineHeight: isMl ? 1.3 : 1.15,
                  letterSpacing: isMl ? "0em" : "-0.02em",
                  color: "#FFFFFF",
                  mb: 1,
                }}
              >
                {isMl ? "കേരള ലോട്ടറി ഫല സ്ഥിതിവിവരക്കണക്കുകൾ" : "Kerala Lottery Statistics & Trend Analytics"}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#94A3B8",
                  fontSize: { xs: isMl ? "0.85rem" : "0.925rem", md: "1rem" },
                  maxWidth: 720,
                  lineHeight: isMl ? 1.6 : 1.5,
                }}
              >
                {isMl
                  ? `കഴിഞ്ഞ ${filteredDraws.length} നറുക്കെടുപ്പുകളിൽ ഏറ്റവും കൂടുതൽ തവണ വന്ന നമ്പറുകൾ, 2-അക്ക ജോഡികൾ, 1-ാം സമ്മാനം കൂടുതൽ വിറ്റ ജില്ലകൾ എന്നിവയുടെ സമഗ്രമായ വിശകലനം.`
                  : `Comprehensive frequency patterns, hot & cold number endings, single-digit distributions, and 1st prize district leaderboards across ${filteredDraws.length} official draws.`}
              </Typography>
            </Box>

            {/* Quick Actions & Language Switch */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", sm: "row" },
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              {/* Language Switch */}
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.12)",
                  p: 0.5,
                  borderRadius: "10px",
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <Button
                  size="small"
                  onClick={() => setLang("en")}
                  sx={{
                    color: lang === "en" ? "#0F172A" : "#E2E8F0",
                    bgcolor: lang === "en" ? "#FFFFFF" : "transparent",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    borderRadius: "7px",
                    px: 1.5,
                    py: 0.5,
                    minWidth: "auto",
                    "&:hover": { bgcolor: lang === "en" ? "#FFFFFF" : "rgba(255,255,255,0.08)" },
                  }}
                >
                  English
                </Button>
                <Button
                  size="small"
                  onClick={() => setLang("ml")}
                  sx={{
                    color: lang === "ml" ? "#0F172A" : "#E2E8F0",
                    bgcolor: lang === "ml" ? "#FFFFFF" : "transparent",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    borderRadius: "7px",
                    px: 1.5,
                    py: 0.5,
                    minWidth: "auto",
                    "&:hover": { bgcolor: lang === "ml" ? "#FFFFFF" : "rgba(255,255,255,0.08)" },
                  }}
                >
                  മലയാളം
                </Button>
              </Box>

              {/* WhatsApp Share Button */}
              <Button
                variant="contained"
                onClick={handleWhatsAppShare}
                startIcon={<WhatsAppIcon sx={{ color: "#25D366" }} />}
                sx={{
                  bgcolor: "rgba(255,255,255,0.12)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 2,
                  py: 0.9,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                {isMl ? "പങ്കുവെക്കുക" : "Share Trends"}
              </Button>

              {/* Copy Link Button */}
              <Tooltip title={copied ? (isMl ? "ലിങ്ക് കോപ്പി ചെയ്തു!" : "Link Copied!") : (isMl ? "ലിങ്ക് കോപ്പി ചെയ്യുക" : "Copy Link")}>
                <IconButton
                  onClick={handleCopyLink}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: copied ? "#10B981" : "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.15)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  {copied ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>

              {/* Refresh Button */}
              <Tooltip title={isMl ? "പുതുക്കുക" : "Refresh Data"}>
                <IconButton
                  onClick={loadData}
                  disabled={loading}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.15)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* Horizon Selector Bar & Tab Switcher */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          {/* Main Tab Switcher */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "#E2E8F0",
              p: 0.5,
              borderRadius: "14px",
              gap: 1,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Button
              onClick={() => setActiveTab("numbers")}
              startIcon={<WhatshotIcon sx={{ color: activeTab === "numbers" ? "#EA580C" : "#64748B" }} />}
              sx={{
                flex: { xs: 1, md: "initial" },
                bgcolor: activeTab === "numbers" ? "#FFFFFF" : "transparent",
                color: activeTab === "numbers" ? "#0F172A" : "#64748B",
                fontWeight: 800,
                fontSize: "0.85rem",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                textTransform: "none",
                boxShadow: activeTab === "numbers" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                "&:hover": { bgcolor: activeTab === "numbers" ? "#FFFFFF" : "rgba(255,255,255,0.5)" },
              }}
            >
              {isMl ? "നമ്പർ ട്രെൻഡുകൾ" : "Number Trends"}
            </Button>

            <Button
              onClick={() => setActiveTab("districts")}
              startIcon={<LocationOnIcon sx={{ color: activeTab === "districts" ? "#DC2626" : "#64748B" }} />}
              sx={{
                flex: { xs: 1, md: "initial" },
                bgcolor: activeTab === "districts" ? "#FFFFFF" : "transparent",
                color: activeTab === "districts" ? "#0F172A" : "#64748B",
                fontWeight: 800,
                fontSize: "0.85rem",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                textTransform: "none",
                boxShadow: activeTab === "districts" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                "&:hover": { bgcolor: activeTab === "districts" ? "#FFFFFF" : "rgba(255,255,255,0.5)" },
              }}
            >
              {isMl ? "ഭാഗ്യ ജില്ലകൾ" : "Lucky Locations"}
            </Button>
          </Box>

          {/* Horizon Selector (30 / 90 / All) */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "#FFFFFF",
              p: 0.5,
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              gap: 0.8,
              width: { xs: "100%", md: "auto" },
            }}
          >
            {[
              { key: "30", label: isMl ? "കഴിഞ്ഞ 30 നറുക്കെടുപ്പുകൾ" : "Last 30 Draws" },
              { key: "90", label: isMl ? "കഴിഞ്ഞ 90 നറുക്കെടുപ്പുകൾ" : "Last 90 Draws" },
              { key: "all", label: isMl ? "മുഴുവൻ ചരിത്രം" : "All History" },
            ].map((tab) => {
              const active = horizon === tab.key;
              return (
                <Button
                  key={tab.key}
                  size="small"
                  onClick={() => setHorizon(tab.key as any)}
                  sx={{
                    flex: { xs: 1, md: "initial" },
                    bgcolor: active ? "#0B3C5D" : "transparent",
                    color: active ? "#FFFFFF" : "#64748B",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    borderRadius: "8px",
                    px: 1.8,
                    py: 0.6,
                    textTransform: "none",
                    "&:hover": { bgcolor: active ? "#0B3C5D" : "#F1F5F9" },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "20px" }} />
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: "20px" }} />
          </Box>
        ) : activeTab === "numbers" ? (
          <Grid container spacing={3}>
            {/* Top Full-Width Interactive 4-Digit Combination Explorer */}
            <Grid size={{ xs: 12 }}>
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
                {/* Header Row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: "#EFF6FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563EB",
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.1rem" }}>
                      {isMl ? "4-അക്ക കോമ്പിനേഷൻ ഹിസ്റ്ററി ചെക്കർ" : "4-Digit Combination History Checker"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                      {isMl
                        ? "നമ്പറുകൾ തിരഞ്ഞെടുത്ത് മുൻകാല നറുക്കെടുപ്പുകളിൽ വന്ന ചരിത്രം പരിശോധിക്കുക"
                        : "Select digits to inspect previous draw occurrences, tier distribution, and balance pattern"}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3} sx={{ alignItems: "center" }}>
                  {/* Left Column: 4 Digit Stepper / Wheels */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: { xs: 1.5, sm: 2 },
                        p: 2,
                        bgcolor: "#F8FAFC",
                        borderRadius: "16px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      {digits.map((digitVal, colIdx) => (
                        <Box
                          key={colIdx}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDigitChange(colIdx, (digitVal + 1) % 10)}
                            sx={{
                              bgcolor: "#FFFFFF",
                              border: "1px solid #E2E8F0",
                              p: 0.5,
                              "&:hover": { bgcolor: "#EFF6FF", borderColor: "#3B82F6" },
                            }}
                          >
                            <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "#2563EB" }} />
                          </IconButton>

                          <Box
                            sx={{
                              width: { xs: 52, sm: 64 },
                              height: { xs: 60, sm: 72 },
                              bgcolor: "#FFFFFF",
                              borderRadius: "14px",
                              border: "2px solid #0B3C5D",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 10px rgba(11, 60, 93, 0.12)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: { xs: "1.8rem", sm: "2.2rem" },
                                fontWeight: 900,
                                color: "#0B3C5D",
                                fontFamily: "monospace",
                              }}
                            >
                              {digitVal}
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => handleDigitChange(colIdx, (digitVal + 9) % 10)}
                            sx={{
                              bgcolor: "#FFFFFF",
                              border: "1px solid #E2E8F0",
                              p: 0.5,
                              "&:hover": { bgcolor: "#EFF6FF", borderColor: "#3B82F6" },
                            }}
                          >
                            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#2563EB" }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>

                    {/* Quick Stepper Hint */}
                    <Typography
                      variant="caption"
                      sx={{ display: "block", textAlign: "center", color: "#94A3B8", mt: 1, fontWeight: 600 }}
                    >
                      {isMl ? "അമ്പടയാളങ്ങൾ ഉപയോഗിച്ച് അക്കങ്ങൾ മാറ്റുക" : "Use arrows to adjust digits (0000 – 9999)"}
                    </Typography>
                  </Grid>

                  {/* Right Column: Live Pattern Balance & Check Action */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    {/* Live Pattern Balance Card */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "14px",
                        bgcolor: digitBalance.bgTint,
                        border: `1px solid ${digitBalance.borderTint}`,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ShowChartIcon sx={{ fontSize: 18, color: digitBalance.statusColor }} />
                          <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: digitBalance.statusColor }}>
                            {digitBalance.balanceScore}% {digitBalance.statusText}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${isMl ? "തുക" : "Sum"}: ${digitBalance.sum}`}
                          size="small"
                          sx={{
                            bgcolor: "#FFFFFF",
                            color: "#0F172A",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            border: `1px solid ${digitBalance.borderTint}`,
                          }}
                        />
                      </Box>

                      {/* Progress Bar */}
                      <Box sx={{ width: "100%", height: 6, bgcolor: "rgba(0,0,0,0.06)", borderRadius: 3, mb: 1.5, overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${digitBalance.balanceScore}%`,
                            height: "100%",
                            bgcolor: digitBalance.statusColor,
                            borderRadius: 3,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>

                      {/* Metric Tags */}
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={`${digitBalance.odd} ${isMl ? "ഒറ്റയക്കം" : "Odd"} : ${digitBalance.even} ${isMl ? "ഇരട്ടയക്കം" : "Even"}`}
                          size="small"
                          sx={{ bgcolor: "#FFFFFF", fontWeight: 700, fontSize: "0.72rem" }}
                        />
                        <Chip
                          label={`${digitBalance.high} ${isMl ? "ഉയർന്നത് (5-9)" : "High"} : ${digitBalance.low} ${isMl ? "കുറഞ്ഞത് (0-4)" : "Low"}`}
                          size="small"
                          sx={{ bgcolor: "#FFFFFF", fontWeight: 700, fontSize: "0.72rem" }}
                        />
                      </Box>
                    </Box>

                    {/* Check History CTA Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCheckHistory}
                      endIcon={<ArrowForwardIosIcon sx={{ fontSize: "14px !important" }} />}
                      sx={{
                        bgcolor: "#0B3C5D",
                        color: "#FFFFFF",
                        fontWeight: 900,
                        fontSize: "0.95rem",
                        py: 1.4,
                        borderRadius: "12px",
                        textTransform: "none",
                        boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
                        "&:hover": { bgcolor: "#0F2C59" },
                      }}
                    >
                      {isMl ? `ചരിത്രം പരിശോധിക്കുക (${digits.join("")})` : `Check History (${digits.join("")})`}
                    </Button>
                  </Grid>
                </Grid>

                {/* Quick Picks Row */}
                <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #F1F5F9" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <FlashOnIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {isMl ? "ദ്രുത നമ്പറുകൾ (Quick Picks):" : "Popular Quick Picks:"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {QUICK_PICKS.map((item) => {
                      const isSelected = submittedQuery === item.num;
                      return (
                        <Chip
                          key={item.num}
                          label={item.num}
                          onClick={() => handleSelectQuickPick(item.num)}
                          clickable
                          sx={{
                            bgcolor: item.bg,
                            color: item.text,
                            border: `1.5px solid ${item.border}`,
                            fontWeight: 900,
                            fontSize: "0.85rem",
                            fontFamily: "monospace",
                            px: 1,
                            transform: isSelected ? "scale(1.05)" : "none",
                            boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Search Results Display Box */}
                {searchResult ? (
                  <Box sx={{ mt: 3, p: 2.5, bgcolor: "#F8FAFC", borderRadius: "16px", border: "1.5px solid #E2E8F0" }}>
                    {/* Hero Stat Box */}
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
                      <Box>
                        <Typography variant="caption" sx={{ color: "#2563EB", fontWeight: 800, letterSpacing: "0.05em" }}>
                          {searchResult.query.length}-DIGIT COMBINATION RESULT
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: "#0F172A", fontFamily: "monospace" }}>
                          {searchResult.query}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Chip
                          label={`${searchResult.totalMatches} ${isMl ? "തവണ വന്നു" : "Times Drawn"}`}
                          sx={{
                            bgcolor: searchResult.totalMatches > 0 ? "#DCFCE7" : "#F1F5F9",
                            color: searchResult.totalMatches > 0 ? "#16A34A" : "#64748B",
                            fontWeight: 900,
                            fontSize: "0.85rem",
                            border: `1px solid ${searchResult.totalMatches > 0 ? "#86EFAC" : "#CBD5E1"}`,
                          }}
                        />
                        {searchResult.totalMatches > 0 && (
                          <Chip
                            label={`${searchResult.hitRatePct}% ${isMl ? "ഹിറ്റ് റേറ്റ്" : "Hit Rate"}`}
                            sx={{
                              bgcolor: "#EFF6FF",
                              color: "#2563EB",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              border: "1px solid #BFDBFE",
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Tier Breakdown Badges */}
                    {searchResult.totalMatches > 0 && Object.keys(searchResult.tierBreakdown).length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                        {Object.entries(searchResult.tierBreakdown).map(([tier, count]) => (
                          <Chip
                            key={tier}
                            label={`${tier}: ${count}x`}
                            size="small"
                            sx={{
                              bgcolor: "#FFFFFF",
                              color: "#0B3C5D",
                              fontWeight: 800,
                              fontSize: "0.75rem",
                              border: "1px solid #CBD5E1",
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Matching Draws List */}
                    {searchResult.matchedDraws.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                          {isMl ? "സമീപകാലത്ത് വന്ന നറുക്കെടുപ്പുകൾ:" : "Recent Matching Draws:"}
                        </Typography>
                        <Grid container spacing={1.5}>
                          {searchResult.matchedDraws.map((m, idx) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: "#FFFFFF",
                                  borderRadius: "10px",
                                  border: "1px solid #E2E8F0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Box sx={{ minWidth: 0, pr: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }} noWrap>
                                    {m.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                                    {m.date} • {m.tier}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={m.fullTicket}
                                  size="small"
                                  sx={{
                                    bgcolor: "#EBF5FF",
                                    color: "#0B3C5D",
                                    fontWeight: 900,
                                    fontFamily: "monospace",
                                    fontSize: "0.8rem",
                                  }}
                                />
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ) : (
                      <Box sx={{ p: 2, textAlign: "center", bgcolor: "#FFFFFF", borderRadius: "10px" }}>
                        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                          {isMl
                            ? `കഴിഞ്ഞ ${filteredDraws.length} നറുക്കെടുപ്പുകളിൽ ഈ നമ്പർ വന്നതായി രേഖപ്പെടുത്തിയിട്ടില്ല.`
                            : `No winning match recorded for this combination in the selected ${filteredDraws.length} draws.`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : null}
              </Paper>
            </Grid>

            {/* Hot 4-Digit Endings */}
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: "#FFEDD5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#EA580C",
                    }}
                  >
                    <WhatshotIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.05rem" }}>
                      {isMl ? "കൂടുതൽ തവണ വന്ന 4-അക്കങ്ങൾ" : "Hot 4-Digit Endings"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                      {isMl ? "എല്ലാ സമ്മാന വിഭാഗങ്ങളിലെയും ആവർത്തനം" : "Most repeated 4-digit combinations"}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={1.5}>
                  {numberStats.hot4.map(([num, count], i) => {
                    const maxHot4 = numberStats.hot4[0]?.[1] || 1;
                    const barPct = Math.round((count / maxHot4) * 100);
                    return (
                      <Grid size={{ xs: 6 }} key={num}>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "#FFF7ED",
                            borderRadius: "12px",
                            border: "1px solid #FFEDD5",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                            <Chip
                              label={`#${i + 1}`}
                              size="small"
                              sx={{
                                height: 20,
                                bgcolor: "#EA580C",
                                color: "#FFFFFF",
                                fontWeight: 900,
                                fontSize: "0.68rem",
                              }}
                            />
                            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: "#0F172A", fontFamily: "monospace" }}>
                              {num}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: "#EA580C" }}>
                              {count}x
                            </Typography>
                          </Box>
                          <Box sx={{ width: "100%", height: 5, bgcolor: "#FED7AA", borderRadius: 2.5, overflow: "hidden" }}>
                            <Box sx={{ width: `${barPct}%`, height: "100%", bgcolor: "#EA580C", borderRadius: 2.5 }} />
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>

            {/* Hot & Cold 2-Digit Pairs */}
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
                  gap: 3,
                }}
              >
                {/* Hot 2-Digit Section */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: "#D1FAE5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#059669",
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0F172A" }}>
                        {isMl ? "കൂടുതൽ തവണ വന്ന 2-അക്കങ്ങൾ" : "Hot 2-Digit Pairs"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                        {isMl ? "മുൻനിരയിൽ നിൽക്കുന്ന അവസാന 2-അക്കങ്ങൾ" : "Top frequent ending 2-digit pairs"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {numberStats.hot2.map(([num, count]) => (
                      <Box
                        key={num}
                        sx={{
                          p: 1,
                          px: 1.5,
                          bgcolor: "#ECFDF5",
                          borderRadius: "10px",
                          border: "1px solid #A7F3D0",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, fontSize: "1rem", color: "#065F46", fontFamily: "monospace" }}>
                          {num}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700 }}>
                          {count} {isMl ? "തവണ" : "draws"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* Cold 2-Digit Section */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: "#DBEAFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#2563EB",
                      }}
                    >
                      <AcUnitIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0F172A" }}>
                        {isMl ? "കുറഞ്ഞ തവണ വന്ന അക്കങ്ങൾ (Cold / Overdue)" : "Cold / Overdue 2-Digit Pairs"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                        {isMl ? "ഏറ്റവും കുറവ് തവണ വന്ന 2-അക്കങ്ങൾ" : "Least frequent ending combinations"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {numberStats.cold2.map(([num, count]) => (
                      <Box
                        key={num}
                        sx={{
                          p: 1,
                          px: 1.5,
                          bgcolor: "#EFF6FF",
                          borderRadius: "10px",
                          border: "1px solid #BFDBFE",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, fontSize: "1rem", color: "#1E40AF", fontFamily: "monospace" }}>
                          {num}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#2563EB", fontWeight: 700 }}>
                          {count} {isMl ? "തവണ" : "draws"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Single Last-Digit (0-9) Frequency Distribution */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1.5px solid #E2E8F0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0B3C5D",
                    }}
                  >
                    <BarChartIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.05rem" }}>
                      {isMl ? "ഒറ്റ അക്ക വിതരണ ചാർട്ട് (0 - 9)" : "Single Last-Digit (0–9) Frequency Distribution"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                      {isMl ? "അവസാന അക്കങ്ങളുടെ ആകെ ആവൃത്തി" : "Total frequency of each unit digit ending"}
                    </Typography>
                  </Box>
                </Box>

                {/* 10-Column Bar Chart */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    height: 180,
                    pt: 2,
                    pb: 1,
                    px: { xs: 0.5, sm: 2 },
                  }}
                >
                  {Object.entries(numberStats.singleDigitMap).map(([digit, count]) => {
                    const maxD = Math.max(...Object.values(numberStats.singleDigitMap), 1);
                    const heightPct = Math.max(15, Math.round((count / maxD) * 100));
                    return (
                      <Box
                        key={digit}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          flex: 1,
                          height: "100%",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#0B3C5D", fontSize: "0.75rem" }}>
                          {count}
                        </Typography>
                        <Box sx={{ width: { xs: 20, sm: 32 }, height: 110, bgcolor: "#F1F5F9", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                          <Box
                            sx={{
                              width: "100%",
                              height: `${heightPct}%`,
                              bgcolor: "#0B3C5D",
                              borderRadius: "8px",
                              transition: "height 0.4s ease",
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "0.95rem", fontFamily: "monospace" }}>
                          {digit}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          /* District Heatmap & Leaderboard Tab */
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1.5px solid #E2E8F0",
                }}
              >
                {/* Header & Search */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
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
                        bgcolor: "#FEE2E2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#DC2626",
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.1rem" }}>
                        {isMl ? "ജില്ലാ അടിസ്ഥാനത്തിലുള്ള 1-ാം സമ്മാന വിജയികൾ" : "District Winner Heatmap & Leaderboard"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                        {isMl
                          ? `കഴിഞ്ഞ ${filteredDraws.length} നറുക്കെടുപ്പുകളിൽ 1-ാം സമ്മാനം കൂടുതൽ ലഭിച്ച ജില്ലകളുടെ റാങ്കിംഗ്`
                          : `Kerala 14-district ranking based on 1st prize tickets sold across ${filteredDraws.length} draws`}
                      </Typography>
                    </Box>
                  </Box>

                  <TextField
                    size="small"
                    placeholder={isMl ? "ജില്ല തിരയുക..." : "Filter district..."}
                    value={districtQuery}
                    onChange={(e) => setDistrictQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      width: { xs: "100%", sm: 220 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                      },
                    }}
                  />
                </Box>

                {/* District List */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {displayedDistricts.map((dist, idx) => {
                    const pct = Math.round((dist.count / districtStats.maxCount) * 100);
                    const isTop3 = idx < 3 && dist.count > 0;
                    const mlName = KERALA_DISTRICTS_ML[dist.name] || dist.name;
                    return (
                      <Box
                        key={dist.name}
                        sx={{
                          p: 2,
                          bgcolor: isTop3 ? "#FFFDF5" : "#FFFFFF",
                          borderRadius: "14px",
                          border: `1.5px solid ${isTop3 ? "#FDE68A" : "#E2E8F0"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {/* Rank Badge */}
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: isTop3 ? "#F59E0B" : "#F1F5F9",
                            color: isTop3 ? "#FFFFFF" : "#64748B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: "0.9rem",
                          }}
                        >
                          #{idx + 1}
                        </Box>

                        {/* District Info & Progress Bar */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                              <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "0.95rem" }}>
                                {isMl ? mlName : dist.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                                {isMl ? dist.name : mlName}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${dist.count} ${isMl ? (dist.count === 1 ? "വിജയം" : "വിജയങ്ങൾ") : (dist.count === 1 ? "Win" : "Wins")}`}
                              size="small"
                              sx={{
                                bgcolor: isTop3 ? "#FEF3C7" : "#F1F5F9",
                                color: isTop3 ? "#92400E" : "#475569",
                                fontWeight: 900,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>

                          <Box sx={{ width: "100%", height: 7, bgcolor: "#F1F5F9", borderRadius: 3.5, overflow: "hidden" }}>
                            <Box
                              sx={{
                                width: `${pct}%`,
                                height: "100%",
                                bgcolor: isTop3 ? "#F59E0B" : "#0B3C5D",
                                borderRadius: 3.5,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Disclaimer Card */}
        <Box
          sx={{
            mt: 4,
            p: 2.5,
            bgcolor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <InfoOutlinedIcon sx={{ color: "#64748B", fontSize: 20, mt: 0.2 }} />
          <Typography variant="caption" sx={{ color: "#64748B", lineHeight: 1.6, fontWeight: 500 }}>
            {isMl
              ? "ശ്രദ്ധിക്കുക: ഈ സ്ഥിതിവിവരക്കണക്കുകൾ മുൻകാല ഔദ്യോഗിക ഗസറ്റ് ഫലങ്ങളുടെ അടിസ്ഥാനത്തിലുള്ള ഗണിതശാസ്ത്രപരമായ വിശകലനം മാത്രമാണ്. കേരള ഭാഗ്യക്കുറി നറുക്കെടുപ്പുകൾ പൂർണ്ണമായും ക്രമരഹിതവും സുതാര്യവുമാണ്. മുൻകാല ആവൃത്തി ഭാവി ഫലങ്ങളെ ഉറപ്പുനൽകുന്നില്ല."
              : "Disclaimer: These frequency statistics and trend analytics are calculated strictly from historical Kerala State Lottery official gazette publications for informational and analytical purposes. Each draw is an independent random event conducted by the Kerala State Lottery Directorate."}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
