"use client";

import React, { useState, useEffect, useMemo } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
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
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import CasinoIcon from "@mui/icons-material/Casino";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearIcon from "@mui/icons-material/Clear";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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

export default function AnalyticsPage() {
  const [draws, setDraws] = useState<StructuredDrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<"30" | "90" | "all">("30");
  const [activeTab, setActiveTab] = useState<"numbers" | "districts">("numbers");
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [searchNum, setSearchNum] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const isMl = lang === "ml";

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await fetchAllDrawResultsFromSupabase(true);
      setDraws(results || []);
    } catch (e) {
      console.warn("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter draws by selected time horizon
  const filteredDraws = useMemo(() => {
    if (horizon === "30") return draws.slice(0, 30);
    if (horizon === "90") return draws.slice(0, 90);
    return draws;
  }, [draws, horizon]);

  // Compute number frequency statistics
  const numberStats = useMemo(() => {
    const freq4: Record<string, number> = {};
    const freq2: Record<string, number> = {};
    const singleDigitMap: Record<string, number> = {
      "0": 0, "1": 0, "2": 0, "3": 0, "4": 0,
      "5": 0, "6": 0, "7": 0, "8": 0, "9": 0,
    };

    filteredDraws.forEach((draw) => {
      // 1st prize
      if (draw.first?.ticket) {
        const digits = draw.first.ticket.replace(/\D/g, "");
        if (digits.length >= 4) {
          const last4 = digits.slice(-4);
          freq4[last4] = (freq4[last4] || 0) + 1;
        }
        if (digits.length >= 2) {
          const last2 = digits.slice(-2);
          freq2[last2] = (freq2[last2] || 0) + 1;
        }
        if (digits.length > 0) {
          const last1 = digits.slice(-1);
          if (singleDigitMap[last1] !== undefined) singleDigitMap[last1]++;
        }
      }

      // Other prize tiers
      if (draw.prizes) {
        const tiers = [
          "consolation", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th",
        ] as const;

        tiers.forEach((tier) => {
          const arr = (draw.prizes as any)?.[tier];
          if (Array.isArray(arr)) {
            arr.forEach((numStr: string) => {
              const digits = String(numStr).replace(/\D/g, "");
              if (digits.length >= 4) {
                const last4 = digits.slice(-4);
                freq4[last4] = (freq4[last4] || 0) + 1;
              }
              if (digits.length >= 2) {
                const last2 = digits.slice(-2);
                freq2[last2] = (freq2[last2] || 0) + 1;
              }
              if (digits.length > 0) {
                const last1 = digits.slice(-1);
                if (singleDigitMap[last1] !== undefined) singleDigitMap[last1]++;
              }
            });
          }
        });
      }
    });

    const hot4 = Object.entries(freq4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const sorted2 = Object.entries(freq2).sort((a, b) => b[1] - a[1]);
    const hot2 = sorted2.slice(0, 12);
    const cold2 = sorted2.slice(-10).reverse();

    return { hot4, hot2, cold2, singleDigitMap };
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
    const query = searchNum.trim().replace(/\D/g, "");
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
      // Check first prize
      if (draw.first?.ticket) {
        const d = draw.first.ticket.replace(/\D/g, "");
        if (d.endsWith(query) || d === query) {
          totalMatches++;
          tierBreakdown["1st Prize"] = (tierBreakdown["1st Prize"] || 0) + 1;
          matchedDraws.push({
            date: draw.draw_date,
            name: draw.draw_name,
            tier: "1st Prize",
            fullTicket: draw.first.ticket,
          });
        }
      }

      // Check other prizes
      if (draw.prizes) {
        const tiers = [
          "consolation", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th",
        ] as const;
        tiers.forEach((tier) => {
          const arr = (draw.prizes as any)?.[tier];
          if (Array.isArray(arr)) {
            arr.forEach((numStr: string) => {
              const d = String(numStr).replace(/\D/g, "");
              if (d.endsWith(query) || d === query) {
                totalMatches++;
                const tierName = tier === "consolation" ? "Consolation" : `${tier.toUpperCase()} Prize`;
                tierBreakdown[tierName] = (tierBreakdown[tierName] || 0) + 1;
                matchedDraws.push({
                  date: draw.draw_date,
                  name: draw.draw_name,
                  tier: tierName,
                  fullTicket: String(numStr),
                });
              }
            });
          }
        });
      }
    });

    const hitRatePct = filteredDraws.length > 0 ? Math.min(100, Math.round((totalMatches / filteredDraws.length) * 100)) : 0;
    const latestMatch = matchedDraws[0] || null;

    return {
      query,
      totalMatches,
      tierBreakdown,
      hitRatePct,
      latestMatch,
      matchedDraws: matchedDraws.slice(0, 10),
    };
  }, [searchNum, filteredDraws]);

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

  const maxHot4 = numberStats.hot4[0]?.[1] || 1;
  const maxSingle = Math.max(...Object.values(numberStats.singleDigitMap), 1);

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

          {/* Quick Metrics Bar */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(8px)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, fontSize: isMl ? "0.72rem" : "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {isMl ? "ആകെ വിശകലനം" : "DRAWS ANALYZED"}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#FFFFFF", mt: 0.5 }}>
                  {filteredDraws.length}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(8px)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: "#FBBF24", fontWeight: 700, fontSize: isMl ? "0.72rem" : "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {isMl ? "🔥 ടോപ് 4-അക്കം" : "🔥 TOP 4-DIGIT"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mt: 0.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.04em" }}>
                    {numberStats.hot4[0]?.[0] || "—"}
                  </Typography>
                  <Typography component="span" variant="caption" sx={{ color: "#FCD34D", fontWeight: 700, bgcolor: "rgba(251, 191, 36, 0.15)", px: 0.8, py: 0.2, borderRadius: "6px" }}>
                    {numberStats.hot4[0]?.[1] || 0}x
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(8px)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: "#34D399", fontWeight: 700, fontSize: isMl ? "0.72rem" : "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {isMl ? "⚡ ടോപ് 2-അക്ക ജോഡി" : "⚡ TOP 2-DIGIT PAIR"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mt: 0.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.04em" }}>
                    {numberStats.hot2[0]?.[0] || "—"}
                  </Typography>
                  <Typography component="span" variant="caption" sx={{ color: "#6EE7B7", fontWeight: 700, bgcolor: "rgba(52, 211, 153, 0.15)", px: 0.8, py: 0.2, borderRadius: "6px" }}>
                    {numberStats.hot2[0]?.[1] || 0}x
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(8px)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: "#F87171", fontWeight: 700, fontSize: isMl ? "0.72rem" : "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {isMl ? "🏆 മുൻനിര ജില്ല" : "🏆 TOP WINNING DISTRICT"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mt: 0.5, flexWrap: "wrap" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
                      lineHeight: 1.2,
                    }}
                  >
                    {districtStats.topDistrict
                      ? (isMl ? KERALA_DISTRICTS_ML[districtStats.topDistrict.name] || districtStats.topDistrict.name : districtStats.topDistrict.name)
                      : "Palakkad"}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: "#FCA5A5",
                      fontWeight: 800,
                      bgcolor: "rgba(239, 68, 68, 0.2)",
                      px: 0.8,
                      py: 0.2,
                      borderRadius: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {districtStats.topDistrict?.count || 0} {isMl ? "വിജയം" : "wins"}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="lg" sx={{ mt: 3, position: "relative", zIndex: 2 }}>
        {/* Controls Bar: Horizon Selector & View Switcher */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: "16px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
          }}
        >
          {/* Time Horizon Filter Chips */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", mr: 0.5, display: { xs: "none", md: "inline-block" } }}>
              {isMl ? "കാലയളവ്:" : "TIMEFRAME:"}
            </Typography>
            {[
              { key: "30", label: isMl ? "30 നറുക്കെടുപ്പ്" : "Last 30 Draws" },
              { key: "90", label: isMl ? "90 നറുക്കെടുപ്പ്" : "Last 90 Draws" },
              { key: "all", label: isMl ? "മുഴുവൻ ഫലം" : "All Records" },
            ].map((tab) => {
              const active = horizon === tab.key;
              return (
                <Button
                  key={tab.key}
                  size="small"
                  onClick={() => setHorizon(tab.key as any)}
                  sx={{
                    flex: { xs: 1, sm: "none" },
                    bgcolor: active ? "#0B3C5D" : "#F1F5F9",
                    color: active ? "#FFFFFF" : "#475569",
                    fontWeight: 800,
                    fontSize: isMl ? "0.78rem" : "0.8rem",
                    borderRadius: "10px",
                    px: 2,
                    py: 0.7,
                    textTransform: "none",
                    "&:hover": { bgcolor: active ? "#0B3C5D" : "#E2E8F0" },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>

          {/* Main Tab Switcher (Number Trends vs District Heatmap) */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "#F1F5F9",
              p: 0.5,
              borderRadius: "12px",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              onClick={() => setActiveTab("numbers")}
              startIcon={<WhatshotIcon sx={{ color: activeTab === "numbers" ? "#EA580C" : "#64748B", fontSize: 18 }} />}
              sx={{
                flex: { xs: 1, sm: "none" },
                bgcolor: activeTab === "numbers" ? "#FFFFFF" : "transparent",
                color: activeTab === "numbers" ? "#0F172A" : "#64748B",
                fontWeight: 800,
                fontSize: isMl ? "0.78rem" : "0.825rem",
                borderRadius: "10px",
                px: 2.2,
                py: 0.75,
                boxShadow: activeTab === "numbers" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                textTransform: "none",
              }}
            >
              {isMl ? "ഹോട്ട് / കോൾഡ് നമ്പറുകൾ" : "Number Trends"}
            </Button>
            <Button
              onClick={() => setActiveTab("districts")}
              startIcon={<LocationOnIcon sx={{ color: activeTab === "districts" ? "#DC2626" : "#64748B", fontSize: 18 }} />}
              sx={{
                flex: { xs: 1, sm: "none" },
                bgcolor: activeTab === "districts" ? "#FFFFFF" : "transparent",
                color: activeTab === "districts" ? "#0F172A" : "#64748B",
                fontWeight: 800,
                fontSize: isMl ? "0.78rem" : "0.825rem",
                borderRadius: "10px",
                px: 2.2,
                py: 0.75,
                boxShadow: activeTab === "districts" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                textTransform: "none",
              }}
            >
              {isMl ? "ജില്ലാ വിജയികൾ" : "District Heatmap"}
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: "18px" }} />
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: "18px" }} />
          </Box>
        ) : activeTab === "numbers" ? (
          <Grid container spacing={3.5}>
            {/* 1. Hot 4-Digit Endings */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: "#FFEDD5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WhatshotIcon sx={{ color: "#EA580C", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: "#0F172A",
                        fontSize: isMl ? "1.05rem" : "1.15rem",
                      }}
                    >
                      {isMl ? "🔥 കൂടുതൽ വന്ന 4-അക്കങ്ങൾ" : "🔥 Hot 4-Digit Endings"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: isMl ? "0.75rem" : "0.8rem" }}>
                      {isMl
                        ? "കഴിഞ്ഞ നറുക്കെടുപ്പുകളിൽ കൂടുതൽ തവണ വന്ന അവസാന 4 അക്കങ്ങൾ"
                        : "Most recurring last 4 digits drawn across prize tiers"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* 2-Column Responsive Grid for Hot Numbers */}
                <Grid container spacing={2}>
                  {numberStats.hot4.map(([num, count], i) => {
                    const barPct = Math.round((count / maxHot4) * 100);
                    return (
                      <Grid key={num} size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "14px",
                            bgcolor: "#FFF7ED",
                            border: "1px solid #FFEDD5",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#FDBA74",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 16px rgba(234, 88, 12, 0.1)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Chip
                                label={`#${i + 1}`}
                                size="small"
                                sx={{
                                  bgcolor: i === 0 ? "#EA580C" : "#FED7AA",
                                  color: i === 0 ? "#FFFFFF" : "#C2410C",
                                  fontWeight: 900,
                                  fontSize: "0.7rem",
                                  height: 22,
                                }}
                              />
                              <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", letterSpacing: "0.08em" }}>
                                {num}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#EA580C" }}>
                              {count}x {isMl ? "തവണ" : "draws"}
                            </Typography>
                          </Box>

                          {/* Progress Track */}
                          <Box
                            sx={{
                              height: 6,
                              width: "100%",
                              bgcolor: "#FED7AA",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: `${barPct}%`,
                                bgcolor: "#EA580C",
                                borderRadius: "3px",
                                transition: "width 0.5s ease",
                              }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>

            {/* 2. Interactive Number Frequency Checker */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)",
                    }}
                  >
                    <SearchIcon sx={{ color: "#1D4ED8", fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: isMl ? "1.05rem" : "1.15rem" }}>
                      {isMl ? "🔍 ഇൻസ്റ്റന്റ് നമ്പർ പരിശോധന" : "🔍 Instant Number Explorer"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: isMl ? "0.75rem" : "0.8rem" }}>
                      {isMl ? "ഏതെങ്കിലും 2, 3, 4 അക്കങ്ങളുടെ വിജയ ചരിത്രം പരിശോധിക്കുക" : "Check frequency, hit rate & prize tiers for any digits"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Quick Suggestion Pills */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", mb: 0.8 }}>
                    {isMl ? "⚡ പെട്ടെന്ന് പരിശോധിക്കാൻ:" : "⚡ QUICK SUGGESTIONS:"}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {["5593", "5866", "27", "99", "87", "8860"].map((sug) => {
                      const isSelected = searchNum === sug;
                      return (
                        <Chip
                          key={sug}
                          label={sug}
                          size="small"
                          onClick={() => setSearchNum(sug)}
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            bgcolor: isSelected ? "#0B3C5D" : "#F1F5F9",
                            color: isSelected ? "#FFFFFF" : "#334155",
                            border: "1px solid",
                            borderColor: isSelected ? "#0B3C5D" : "#E2E8F0",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              bgcolor: isSelected ? "#0B3C5D" : "#E2E8F0",
                              transform: "translateY(-1px)",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Search Text Input */}
                <TextField
                  fullWidth
                  placeholder={isMl ? "നമ്പർ അടിക്കുക (ഉദാ: 5593, 27)" : "Type 2, 3, or 4 digits (e.g. 5593, 27)..."}
                  value={searchNum}
                  onChange={(e) => setSearchNum(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CasinoIcon sx={{ color: "#3B82F6", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchNum ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchNum("")}>
                            <ClearIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    mb: 2.5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      bgcolor: "#F8FAFC",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      fontSize: "1.05rem",
                      border: "1px solid #E2E8F0",
                      "&.Mui-focused": {
                        bgcolor: "#FFFFFF",
                        borderColor: "#3B82F6",
                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)",
                      },
                    },
                  }}
                />

                {searchResult ? (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Hero Stat Box */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        background: searchResult.totalMatches > 0
                          ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                          : "#F8FAFC",
                        border: "1px solid",
                        borderColor: searchResult.totalMatches > 0 ? "#BFDBFE" : "#E2E8F0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#2563EB", textTransform: "uppercase", fontSize: "0.72rem" }}>
                            {searchResult.query.length}-DIGIT COMBINATION
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0F172A", letterSpacing: "0.08em", mt: 0.2 }}>
                            {searchResult.query}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                          <Chip
                            label={`${searchResult.totalMatches} ${isMl ? "തവണ വിജയം" : "Times Drawn"}`}
                            size="small"
                            sx={{
                              bgcolor: searchResult.totalMatches > 0 ? "#2563EB" : "#94A3B8",
                              color: "#FFFFFF",
                              fontWeight: 900,
                              fontSize: "0.75rem",
                              height: 24,
                            }}
                          />
                          {searchResult.totalMatches > 0 && (
                            <Typography variant="caption" sx={{ display: "block", color: "#1E40AF", fontWeight: 700, mt: 0.5 }}>
                              {searchResult.hitRatePct}% {isMl ? "ഡ്രോകളിൽ സാന്നിധ്യം" : "Draw Hit Rate"}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Prize Tier Breakdown Pills */}
                      {searchResult.totalMatches > 0 && Object.keys(searchResult.tierBreakdown).length > 0 && (
                        <Box sx={{ pt: 1, borderTop: "1px solid rgba(37, 99, 235, 0.15)" }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#1E3A8A", display: "block", mb: 0.8, fontSize: "0.7rem" }}>
                            {isMl ? "സമ്മാനത്തട്ടുകളിലെ സാന്നിധ്യം:" : "PRIZE TIER BREAKDOWN:"}
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                            {Object.entries(searchResult.tierBreakdown).map(([tier, count]) => (
                              <Chip
                                key={tier}
                                label={`${tier}: ${count}x`}
                                size="small"
                                sx={{
                                  bgcolor: "#FFFFFF",
                                  color: "#1E40AF",
                                  fontWeight: 800,
                                  fontSize: "0.7rem",
                                  height: 22,
                                  border: "1px solid #93C5FD",
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Matching History Timeline */}
                    {searchResult.matchedDraws.length > 0 ? (
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", textTransform: "uppercase", fontSize: "0.72rem", mb: 1, display: "block" }}>
                          {isMl ? "സമീപകാല വിജയ ചരിത്രം:" : "RECENT MATCHING DRAWS:"}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 220, overflowY: "auto", pr: 0.5 }}>
                          {searchResult.matchedDraws.map((m, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.2,
                                borderRadius: "10px",
                                bgcolor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                transition: "all 0.15s ease",
                                "&:hover": { bgcolor: "#EFF6FF", borderColor: "#BFDBFE" },
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                                  {m.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem" }}>
                                  {m.date} • {m.tier}
                                </Typography>
                              </Box>
                              <Chip
                                label={m.fullTicket}
                                size="small"
                                sx={{
                                  bgcolor: "#E0F2FE",
                                  color: "#0369A1",
                                  fontWeight: 800,
                                  fontSize: "0.75rem",
                                  height: 22,
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: "12px", fontWeight: 700, fontSize: "0.825rem" }}>
                        {isMl
                          ? `തിരഞ്ഞെടുത്ത ${filteredDraws.length} നറുക്കെടുപ്പുകളിൽ ഈ നമ്പർ വന്നിട്ടില്ല.`
                          : `No winning matches found for '${searchResult.query}' in the selected timeframe.`}
                      </Alert>
                    )}
                  </Box>
                ) : (
                  /* Idle / Empty State Card */
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #F0FDF4 0%, #EFF6FF 100%)",
                      border: "1px dashed #93C5FD",
                      textAlign: "center",
                      my: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 1.5,
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                      }}
                    >
                      <AutoAwesomeIcon sx={{ color: "#2563EB", fontSize: 26 }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
                      {isMl ? "ഏതെങ്കിലും നമ്പർ അടിച്ച് വിശകലനം ചെയ്യുക" : "Instant Historical Pattern Search"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.825rem", maxWidth: 280, mx: "auto", lineHeight: 1.5 }}>
                      {isMl
                        ? "ഒരു 2, 3 അല്ലെങ്കിൽ 4 അക്ക നമ്പർ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മുകളിലുള്ള സൂചനകളിൽ ക്ലിക്ക് ചെയ്യുക."
                        : "Enter any 2, 3, or 4 digit ending or tap a quick suggestion above to see full prize history."}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* 3. Hot 2-Digit Ending Combinations */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: "#D1FAE5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrendingUpIcon sx={{ color: "#059669", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: isMl ? "1.05rem" : "1.15rem" }}>
                      {isMl ? "⚡ ജനപ്രിയ 2-അക്ക അവസാനങ്ങൾ" : "⚡ Hot 2-Digit Pairs"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: isMl ? "0.75rem" : "0.8rem" }}>
                      {isMl ? "കൂടുതൽ സമ്മാനങ്ങളിൽ ആവർത്തിച്ച 2 അക്കങ്ങൾ" : "Most recurrent 2-digit combinations across draws"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {numberStats.hot2.map(([num, count]) => (
                    <Box
                      key={num}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        bgcolor: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        px: 2,
                        py: 1,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)" },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#065F46", letterSpacing: "0.05em" }}>
                        {num}
                      </Typography>
                      <Chip
                        label={`${count} ${isMl ? "തവണ" : "draws"}`}
                        size="small"
                        sx={{
                          bgcolor: "#D1FAE5",
                          color: "#047857",
                          fontWeight: 800,
                          fontSize: "0.72rem",
                          height: 22,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* 4. Cold / Overdue Numbers */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: "#DBEAFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AcUnitIcon sx={{ color: "#2563EB", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: isMl ? "1.05rem" : "1.15rem" }}>
                      {isMl ? "❄️ കുറഞ്ഞ തവണ വന്ന നമ്പറുകൾ (Cold)" : "❄️ Cold / Overdue Pairs"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: isMl ? "0.75rem" : "0.8rem" }}>
                      {isMl ? "ഈ കാലയളവിൽ ഏറ്റവും കുറവ് തവണ മാത്രം വന്ന 2 അക്കങ്ങൾ" : "Least frequently drawn 2-digit pairs in this horizon"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {numberStats.cold2.map(([num, count]) => (
                    <Box
                      key={num}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        bgcolor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        px: 2,
                        py: 1,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)" },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#1E40AF", letterSpacing: "0.05em" }}>
                        {num}
                      </Typography>
                      <Chip
                        label={`${count} ${isMl ? "തവണ" : "only"}`}
                        size="small"
                        sx={{
                          bgcolor: "#DBEAFE",
                          color: "#1D4ED8",
                          fontWeight: 800,
                          fontSize: "0.72rem",
                          height: 22,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* 5. Single Last-Digit (0-9) Frequency Histogram Bar Chart */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BarChartIcon sx={{ color: "#0B3C5D", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: isMl ? "1.05rem" : "1.15rem" }}>
                      {isMl ? "📊 അവസാന അക്ക വിതരണം (0 - 9)" : "📊 Single Last-Digit Distribution (0 - 9)"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: isMl ? "0.75rem" : "0.8rem" }}>
                      {isMl
                        ? "വിജയിച്ച എല്ലാ ലോട്ടറി നമ്പറുകളുടെയും അവസാന അക്കത്തിന്റെ സാന്നിധ്യം"
                        : "Frequency of every single digit (0 to 9) ending a winning ticket"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* Histogram Visualizer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    height: 180,
                    pt: 2,
                    px: { xs: 1, sm: 4 },
                  }}
                >
                  {Object.entries(numberStats.singleDigitMap).map(([digit, count]) => {
                    const heightPct = Math.max(14, Math.round((count / maxSingle) * 100));
                    return (
                      <Box
                        key={digit}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "flex-end",
                          flex: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#64748B", fontSize: "0.75rem", mb: 0.8 }}>
                          {count}
                        </Typography>
                        <Box
                          sx={{
                            width: { xs: 18, sm: 32, md: 42 },
                            height: "100%",
                            bgcolor: "#F1F5F9",
                            borderRadius: "8px 8px 0 0",
                            display: "flex",
                            alignItems: "flex-end",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: `${heightPct}%`,
                              bgcolor: "#0B3C5D",
                              borderRadius: "8px 8px 0 0",
                              transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": { bgcolor: "#10B981" },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 900,
                            color: "#0F172A",
                            mt: 1,
                            fontSize: "1.1rem",
                          }}
                        >
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
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
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
                    bgcolor: "#FEE2E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EmojiEventsIcon sx={{ color: "#DC2626", fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: isMl ? "1.1rem" : "1.25rem" }}>
                    {isMl ? "🏆 1-ാം സമ്മാനം കൂടുതൽ വിറ്റ ജില്ലകൾ" : "🏆 1st Prize Winners by District"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: isMl ? "0.78rem" : "0.825rem" }}>
                    {isMl
                      ? `ആകെ ${districtStats.totalJackpotDraws} നറുക്കെടുപ്പുകളിലെ ജില്ല തിരിച്ചുള്ള ഒന്നാം സമ്മാന വിജയികൾ`
                      : `Distribution of 1st prize tickets across Kerala's 14 districts`}
                  </Typography>
                </Box>
              </Box>

              {/* District Filter Input */}
              <TextField
                size="small"
                placeholder={isMl ? "ജില്ല തിരയുക..." : "Search district..."}
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
                  width: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#F8FAFC" },
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Districts Ranked List */}
            <Grid container spacing={2}>
              {displayedDistricts.map((dist, idx) => {
                const pct = Math.round((dist.count / districtStats.maxCount) * 100);
                const isTop3 = idx < 3 && dist.count > 0;
                const displayName = isMl ? KERALA_DISTRICTS_ML[dist.name] || dist.name : dist.name;

                return (
                  <Grid key={dist.name} size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "14px",
                        bgcolor: isTop3 ? "#FEF2F2" : "#F8FAFC",
                        border: "1px solid",
                        borderColor: isTop3 ? "#FECACA" : "#E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: isTop3 ? "#F87171" : "#CBD5E1",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      {/* Rank Badge */}
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "10px",
                          bgcolor: isTop3 ? "#DC2626" : "#E2E8F0",
                          color: isTop3 ? "#FFFFFF" : "#64748B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}
                      >
                        #{idx + 1}
                      </Box>

                      {/* District Details & Progress Bar */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 900,
                              color: isTop3 ? "#991B1B" : "#1E293B",
                              fontSize: isMl ? "0.95rem" : "1rem",
                            }}
                          >
                            {displayName}
                          </Typography>
                          <Chip
                            label={`${dist.count} ${isMl ? "വിജയികൾ" : dist.count === 1 ? "win" : "wins"}`}
                            size="small"
                            sx={{
                              bgcolor: isTop3 ? "#FEE2E2" : "#E2E8F0",
                              color: isTop3 ? "#DC2626" : "#475569",
                              fontWeight: 900,
                              fontSize: "0.75rem",
                              height: 22,
                            }}
                          />
                        </Box>

                        {/* Progress Bar */}
                        <Box
                          sx={{
                            height: 6,
                            width: "100%",
                            bgcolor: isTop3 ? "#FCA5A5" : "#E2E8F0",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${pct}%`,
                              bgcolor: isTop3 ? "#DC2626" : "#64748B",
                              borderRadius: "3px",
                              transition: "width 0.5s ease",
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* Disclaimer Note */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mt: 4,
            borderRadius: "16px",
            bgcolor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ color: "#64748B", mt: 0.3 }} />
          <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.6, fontSize: isMl ? "0.825rem" : "0.875rem" }}>
            {isMl
              ? "പ്രധാന അറിയിപ്പ്: ഈ സ്ഥിതിവിവരക്കണക്കുകൾ മുൻകാല ഔദ്യോഗിക ഗവൺമെന്റ് ഗസറ്റ് ഫലങ്ങളെ മാത്രം അടിസ്ഥാനമാക്കിയുള്ളതാണ്. കേരള സംസ്ഥാന ഭാഗ്യക്കുറി നറുക്കെടുപ്പ് പൂർണ്ണമായും യാദൃശ്ചികവും (100% Random) ഗവൺമെന്റ് മേൽനോട്ടത്തിൽ നടക്കുന്ന സുതാര്യമായ പ്രക്രിയയുമാണ്."
              : "Important Disclaimer: These analytics and frequency charts are computed purely from official past draw records for historical insights. Kerala Lottery draws are conducted transparently via random mechanical draw machines by the Government of Kerala."}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
