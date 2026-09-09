"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CasinoIcon from "@mui/icons-material/Casino";
import confetti from "canvas-confetti";
import ShareButtons from "@/components/ShareButtons";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  StructuredDrawResult,
  PostponedDraw,
  supabase,
  validateTicketMatch,
  findTopPrizePartialHint,
  getSearchFeedbackMessage,
  getLotteryUrl,
} from "@/lib/supabase";

interface SingleCheckerMatch {
  tier: string;
  amount?: string;
  matchedNumber: string;
  seriesNote?: string;
}

interface CheckerWinResult {
  isWinner: boolean;
  matches?: SingleCheckerMatch[];
  message?: string;
}

interface LotteryInfoType {
  day: string;
  name: string;
  nameMl: string;
  code: string;
  is_bumper?: boolean;
  jackpot?: string;
  draw_season?: string;
}

interface DedicatedLotteryDateClientProps {
  lotteryInfo: LotteryInfoType;
  lotteryCode: string;
  lotterySlug: string;
  dateParam: string;
  initialDrawResult: StructuredDrawResult | null;
  initialAvailableDates: string[];
  initialPostponement: PostponedDraw | null;
  recentOtherDraws: StructuredDrawResult[];
}

export default function DedicatedLotteryDateClient({
  lotteryInfo,
  lotteryCode,
  lotterySlug,
  dateParam,
  initialDrawResult,
  initialAvailableDates,
  initialPostponement,
  recentOtherDraws,
}: DedicatedLotteryDateClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayISTDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const [availableDates] = useState<string[]>(initialAvailableDates);
  const [selectedDate, setSelectedDate] = useState<string>(dateParam);
  const [drawResult, setDrawResult] = useState<StructuredDrawResult | null>(initialDrawResult);
  const [postponement, setPostponement] = useState<PostponedDraw | null>(initialPostponement);
  const [isAfter3PM, setIsAfter3PM] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Ticket Checker State
  const [checkerTicketInput, setCheckerTicketInput] = useState<string>("");
  const [checkerResult, setCheckerResult] = useState<CheckerWinResult | null>(null);
  const checkerSectionRef = useRef<HTMLDivElement>(null);

  // Compute Previous and Next Draw Dates for chronological linking
  const sortedDates = [...availableDates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  const currentIndex = sortedDates.indexOf(dateParam);
  const nextDate = currentIndex > 0 ? sortedDates[currentIndex - 1] : null; // Newer date
  const prevDate =
    currentIndex >= 0 && currentIndex < sortedDates.length - 1
      ? sortedDates[currentIndex + 1]
      : null; // Older date

  const handleCopyTicket = (ticketNum: string) => {
    if (!ticketNum || ticketNum === "PENDING" || ticketNum === "N/A") return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketNum);
    }
    setSnackbarMessage(`Ticket ${ticketNum} copied to clipboard!`);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const checkTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
          hour12: false,
        });
        const [hStr] = timeStr.split(":");
        const hours = parseInt(hStr, 10);
        setIsAfter3PM(hours >= 15);
      } catch {
        setIsAfter3PM(false);
      }
    };
    checkTime();
    const timeInterval = setInterval(checkTime, 30000);

    // Realtime Supabase live update listener
    const channelName = `realtime-details-${lotteryCode}-${dateParam}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draw_results",
          filter: `lottery_code=eq.${lotteryCode}`,
        },
        async (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.draw_date === dateParam) {
            try {
              const res = await fetch(
                `/api/draws?code=${lotteryCode}&date=${dateParam}&t=${Date.now()}`
              );
              const json = await res.json();
              if (json.result) setDrawResult(json.result);
              if (json.postponement) setPostponement(json.postponement);
            } catch (err) {
              console.warn("Failed to refresh draw details:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timeInterval);
    };
  }, [lotteryCode, dateParam]);

  // Auto-highlight ticket from search page navigation
  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (!highlight || !drawResult) return;

    const query = highlight.trim();
    const queryDigits = query.replace(/\D/g, "");
    if (queryDigits.length < 4) return;

    setCheckerTicketInput(query);

    const matchesList: SingleCheckerMatch[] = [];

    if (drawResult.first?.ticket) {
      const matchRes = validateTicketMatch(query, drawResult.first.ticket);
      if (matchRes.isMatch) {
        matchesList.push({
          tier: "1st Prize Winner",
          amount: drawResult.prizes?.amounts?.["1st"] || "1,00,00,000/-",
          matchedNumber: drawResult.first.ticket,
          seriesNote: matchRes.seriesNote,
        });
      }
    }

    const tiers = ["consolation", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"] as const;
    for (const tier of tiers) {
      const nums = drawResult.prizes?.[tier] || [];
      const amount = drawResult.prizes?.amounts?.[tier];
      for (const num of nums) {
        const matchRes = validateTicketMatch(query, num);
        if (matchRes.isMatch) {
          matchesList.push({
            tier: tier === "consolation" ? "Consolation Prize" : `${tier} Prize`,
            amount,
            matchedNumber: num,
            seriesNote: matchRes.seriesNote,
          });
        }
      }
    }

    if (matchesList.length > 0) {
      setCheckerResult({ isWinner: true, matches: matchesList });
      triggerCelebration();
    } else {
      const topHint = findTopPrizePartialHint(query, drawResult);
      setCheckerResult({
        isWinner: false,
        message: getSearchFeedbackMessage(query, dateParam, topHint),
      });
    }

    setTimeout(() => {
      checkerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  }, [drawResult, searchParams, dateParam]);

  const handleDateChange = (event: SelectChangeEvent<string>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setCheckerResult(null);
    router.push(getLotteryUrl(lotterySlug, newDate));
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#0B3C5D", "#FFC107", "#E67E22", "#3B82F6", "#EC4899"],
    });
  };

  const handleCheckTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkerTicketInput.trim() || !drawResult) return;

    const queryInput = checkerTicketInput.trim();
    const queryDigits = queryInput.replace(/\D/g, "");
    if (queryDigits.length < 4) {
      setCheckerResult({
        isWinner: false,
        message: "Please enter at least 4 digits of your ticket number.",
      });
      return;
    }

    const matchesList: SingleCheckerMatch[] = [];

    if (drawResult.first?.ticket) {
      const matchRes = validateTicketMatch(queryInput, drawResult.first.ticket);
      if (matchRes.isMatch) {
        matchesList.push({
          tier: "1st Prize Winner",
          amount: drawResult.prizes?.amounts?.["1st"] || "1,00,00,000/-",
          matchedNumber: drawResult.first.ticket,
          seriesNote: matchRes.seriesNote,
        });
      }
    }

    const tiers = ["consolation", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"] as const;
    for (const tier of tiers) {
      const nums = drawResult.prizes?.[tier] || [];
      const amount = drawResult.prizes?.amounts?.[tier];
      for (const num of nums) {
        const matchRes = validateTicketMatch(queryInput, num);
        if (matchRes.isMatch) {
          matchesList.push({
            tier: tier === "consolation" ? "Consolation Prize" : `${tier} Prize`,
            amount,
            matchedNumber: num,
            seriesNote: matchRes.seriesNote,
          });
        }
      }
    }

    if (matchesList.length > 0) {
      setCheckerResult({
        isWinner: true,
        matches: matchesList,
      });
      triggerCelebration();
    } else {
      const topHint = findTopPrizePartialHint(queryInput, drawResult);
      setCheckerResult({
        isWinner: false,
        message: getSearchFeedbackMessage(queryInput, selectedDate, topHint),
      });
    }
  };

  const prizeTiers = [
    { key: "consolation", label: "Consolation Prize", dotBg: "#64748B" },
    { key: "2nd", label: "2nd Prize", dotBg: "#D97706" },
    { key: "3rd", label: "3rd Prize", dotBg: "#0B3C5D" },
    { key: "4th", label: "4th Prize", dotBg: "#2563EB" },
    { key: "5th", label: "5th Prize", dotBg: "#475569" },
    { key: "6th", label: "6th Prize", dotBg: "#0284C7" },
    { key: "7th", label: "7th Prize", dotBg: "#0B3C5D" },
    { key: "8th", label: "8th Prize", dotBg: "#475569" },
    { key: "9th", label: "9th Prize", dotBg: "#64748B" },
    { key: "guess", label: "Guessing Numbers (ഭാഗ്യ സംഖ്യകൾ)", dotBg: "#8B5CF6" },
    { key: "mc", label: "Machine Center (MC) Numbers", dotBg: "#EC4899" },
  ] as const;

  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        color: "#111827",
        minHeight: "100vh",
        py: { xs: 3, sm: 5, md: 6 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 2.5 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: "#9CA3AF" }} />}
            aria-label="breadcrumb"
          >
            <Link
              href="/"
              style={{
                color: "#6B7280",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Home
            </Link>
            <Link
              href={getLotteryUrl(lotterySlug)}
              style={{
                color: "#6B7280",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {lotteryInfo.name} Archives
            </Link>
            <Typography
              sx={{
                color: "#0B3C5D",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {dateParam} Result
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Navigation Bar, Date Selector & Export Actions */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              component={Link}
              href={getLotteryUrl(lotterySlug)}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "#4B5563",
                fontWeight: 700,
                borderRadius: "6px",
                "&:hover": { color: "#0B3C5D" },
              }}
            >
              Back to {lotteryInfo.name} Archives
            </Button>
            <Button
              component={Link}
              href="/"
              startIcon={<FormatListNumberedIcon />}
              sx={{
                color: "#4B5563",
                fontWeight: 700,
                borderRadius: "6px",
                "&:hover": { color: "#0B3C5D" },
              }}
            >
              Live Schedule
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {availableDates.length > 0 && (
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  bgcolor: "#FFFFFF",
                  borderRadius: "6px",
                }}
              >
                <InputLabel sx={{ color: "#6B7280" }}>
                  Select Draw Date
                </InputLabel>
                <Select
                  value={selectedDate}
                  onChange={handleDateChange}
                  label="Select Draw Date"
                  sx={{
                    color: "#111827",
                    borderRadius: "6px",
                    fontWeight: 700,
                  }}
                >
                  {availableDates.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Direct PDF Download */}
            {drawResult && (
              <Button
                variant="contained"
                component="a"
                href={`/api/pdf/${lotteryCode}/${selectedDate}`}
                download={`kerala-lottery-${lotteryCode}-${selectedDate}.pdf`}
                startIcon={<FileDownloadIcon />}
                sx={{
                  bgcolor: "#0B3C5D",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  borderRadius: "6px",
                  px: 2.5,
                  py: 1,
                  width: { xs: "100%", sm: "auto" },
                  textDecoration: "none",
                  "&:hover": { bgcolor: "#0F2C59" },
                }}
              >
                Download PDF
              </Button>
            )}
          </Box>
        </Box>

        {/* Previous & Next Draw Navigation Links */}
        <Paper
          elevation={0}
          component="nav"
          aria-label="Draw Navigation"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            mb: 4,
            borderRadius: "8px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            gap: 1.5,
          }}
        >
          {prevDate ? (
            <Button
              component={Link}
              href={getLotteryUrl(lotterySlug, prevDate)}
              startIcon={<NavigateBeforeIcon />}
              size="small"
              sx={{
                color: "#0B3C5D",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#EFF6FF" },
              }}
            >
              Previous Result: {prevDate}
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
              Oldest Recorded Result
            </Typography>
          )}

          <Button
            component={Link}
            href={getLotteryUrl(lotterySlug)}
            size="small"
            sx={{
              color: "#6B7280",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            All {lotteryInfo.name} Results
          </Button>

          {nextDate ? (
            <Button
              component={Link}
              href={getLotteryUrl(lotterySlug, nextDate)}
              endIcon={<NavigateNextIcon />}
              size="small"
              sx={{
                color: "#0B3C5D",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#EFF6FF" },
              }}
            >
              Next Result: {nextDate}
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
              Latest Recorded Result
            </Typography>
          )}
        </Paper>

        {/* Page Title */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 900,
              color: "#111827",
              fontSize: { xs: "1.5rem", sm: "2.2rem" },
            }}
          >
            {drawResult?.draw_name || lotteryInfo.name} ({drawResult?.draw_code || lotteryInfo.code}) Result
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#6B7280", mt: 0.5, fontSize: "0.95rem" }}
          >
            Official Kerala State Lottery Winning Numbers for Draw on <strong>{selectedDate}</strong>
          </Typography>
        </Box>

        {!drawResult ? (
          postponement ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                textAlign: "center",
                borderRadius: "16px",
                border: "1.5px solid #FCA5A5",
                bgcolor: "#FFF1F2",
                mt: 3,
                maxWidth: 720,
                mx: "auto",
              }}
            >
              <Chip
                label={`DRAW ${postponement.status.toUpperCase()}`}
                sx={{
                  bgcolor: "#FEE2E2",
                  color: "#991B1B",
                  fontWeight: 900,
                  fontSize: "0.8rem",
                  mb: 2,
                }}
              />
              <Typography variant="h5" sx={{ color: "#991B1B", fontWeight: 900, mb: 1 }}>
                {postponement.status === "holiday"
                  ? "Official Kerala Lottery Holiday"
                  : `Draw Postponed for ${selectedDate}`}
              </Typography>
              <Typography variant="body1" sx={{ color: "#881337", fontWeight: 600, mb: 2 }}>
                📢 Reason: {postponement.reason}
              </Typography>
              {postponement.rescheduled_date && (
                <Box
                  sx={{
                    bgcolor: "#FFFFFF",
                    p: 2,
                    borderRadius: "10px",
                    border: "1px solid #FECDD3",
                    display: "inline-block",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#9F1239", fontWeight: 800 }}>
                    🗓️ Rescheduled Draw Date: <strong>{postponement.rescheduled_date}</strong>
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : selectedDate > todayISTDate ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                textAlign: "center",
                borderRadius: "16px",
                border: "1.5px solid #FCD34D",
                bgcolor: "#FFFDF0",
                mt: 3,
                maxWidth: 720,
                mx: "auto",
              }}
            >
              <Chip
                label="👑 UPCOMING SCHEDULED DRAW"
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 900,
                  fontSize: "0.8rem",
                  mb: 2,
                  border: "1px solid #F59E0B",
                }}
              />
              <Typography variant="h5" sx={{ color: "#78350F", fontWeight: 900, mb: 1 }}>
                Upcoming Draw Scheduled for {selectedDate}
              </Typography>
              <Typography variant="body1" sx={{ color: "#92400E", fontWeight: 600, mb: 3 }}>
                This {lotteryInfo.name} draw is scheduled to be conducted on {selectedDate} at {(lotteryInfo as any).drawTime || "3:00 PM"}. Official winning numbers will be published here live immediately following the draw.
              </Typography>
              <Button
                component={Link}
                href={getLotteryUrl(lotterySlug)}
                variant="outlined"
                sx={{ borderRadius: "8px", fontWeight: 800, borderColor: "#D97706", color: "#B45309" }}
              >
                View Previous {lotteryInfo.name} Archives
              </Button>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                mt: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: "#374151", mb: 1 }}>
                {selectedDate === todayISTDate
                  ? isAfter3PM
                    ? "Draw Results Are Being Published..."
                    : "Results Coming Soon (3:10 PM)"
                  : "Results Not Recorded For This Date"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
                {selectedDate === todayISTDate
                  ? isAfter3PM
                    ? "Live lottery drawing is in progress. Check back in a few minutes or click the refresh button below."
                    : "Official Kerala lottery results begin at 3:00 PM and are published live by 3:10 PM."
                  : "No official draw record is indexed for this specific date in the database."}
              </Typography>
              <Button
                component={Link}
                href={getLotteryUrl(lotterySlug)}
                variant="contained"
                sx={{ bgcolor: "#0B3C5D", borderRadius: "8px" }}
              >
                View Available {lotteryInfo.name} Draw Dates
              </Button>
            </Paper>
          )
        ) : (
          <>
            {/* Draw Overview Header Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                mb: 4,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                    <Chip
                      label={drawResult.draw_code}
                      sx={{
                        bgcolor: "#EFF6FF",
                        color: "#1D4ED8",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                      }}
                    />
                    <Chip
                      label={`Draw Date: ${drawResult.draw_date}`}
                      sx={{
                        bgcolor: "#F3F4F6",
                        color: "#374151",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                      }}
                    />
                    <Chip
                      label="Official State Result"
                      sx={{
                        bgcolor: "#DCFCE7",
                        color: "#166534",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
                    {drawResult.draw_name} ({drawResult.draw_code})
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Live draw verified and recorded from the official Directorate of Kerala State Lotteries notification.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: { xs: "left", md: "right" } }}>
                  <ShareButtons
                    title={`${drawResult.draw_name} (${drawResult.draw_code}) Result - ${drawResult.draw_date}`}
                    text={`Kerala Lottery ${drawResult.draw_name} (${drawResult.draw_code}) results for ${drawResult.draw_date}. 1st Prize (${drawResult.prizes?.amounts?.["1st"] || "₹1 Crore"}): ${drawResult.first?.ticket || "Pending"}`}
                    variant="compact"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 1st Prize Winner Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                mb: 4,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
                color: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(11, 60, 93, 0.2)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Chip
                    icon={<EmojiEventsIcon sx={{ color: "#FFC107 !important", fontSize: "16px !important" }} />}
                    label="1ST PRIZE WINNER"
                    sx={{
                      bgcolor: "rgba(255, 193, 7, 0.2)",
                      color: "#FFD54F",
                      fontWeight: 900,
                      fontSize: "0.8rem",
                      mb: 1.5,
                      border: "1px solid rgba(255, 193, 7, 0.4)",
                    }}
                  />
                  <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: "1.8rem", sm: "2.5rem" }, color: "#FFFFFF", mb: 1 }}>
                    {drawResult.prizes?.amounts?.["1st"] || "₹1 Crore"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {drawResult.first?.ticket && drawResult.first.ticket !== "PENDING" && (
                    <Tooltip title="Copy Winning Ticket Number">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopyTicket(drawResult.first?.ticket || "")}
                        sx={{
                          color: "#FFFFFF",
                          borderColor: "rgba(255,255,255,0.4)",
                          borderRadius: "8px",
                          "&:hover": { borderColor: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Copy Number
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  p: 2.5,
                  borderRadius: "12px",
                  mt: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block" }}>
                    Winning Ticket Serial Number:
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 900,
                      color: "#FFD54F",
                      fontSize: { xs: "1.5rem", sm: "2.2rem" },
                      letterSpacing: "0.08em",
                    }}
                  >
                    {drawResult.first?.ticket || "PENDING"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {drawResult.first?.location && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block" }}>
                        Location / District:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                        📍 {drawResult.first.location}
                      </Typography>
                    </Box>
                  )}
                  {drawResult.first?.agent && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block" }}>
                        Selling Agent:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                        👤 {drawResult.first.agent}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* Instant Draw Ticket Checker Form */}
            <Paper
              elevation={0}
              ref={checkerSectionRef}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                mb: 4,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ConfirmationNumberIcon sx={{ color: "#0B3C5D" }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                  Check Your {drawResult.draw_name} Ticket ({selectedDate})
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#6B7280", mb: 2.5 }}>
                Enter your ticket number or the last 4 digits to instantly check if you have won any prize tier in this specific draw:
              </Typography>

              <Box component="form" onSubmit={handleCheckTicketSubmit} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="e.g. 6429 or AB 123456"
                  value={checkerTicketInput}
                  onChange={(e) => setCheckerTicketInput(e.target.value)}
                  sx={{ flex: { xs: "100%", sm: 1 }, bgcolor: "#F9FAFB", borderRadius: "6px" }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#0B3C5D",
                    fontWeight: 800,
                    borderRadius: "6px",
                    px: 3,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": { bgcolor: "#0F2C59" },
                  }}
                >
                  Verify Ticket
                </Button>
              </Box>

              {checkerResult && (
                <Box sx={{ mt: 2.5 }}>
                  {checkerResult.isWinner ? (
                    <Alert
                      icon={<CelebrationIcon fontSize="inherit" />}
                      severity="success"
                      sx={{ borderRadius: "8px", fontWeight: 700 }}
                    >
                      🎉 CONGRATULATIONS! Matching winning numbers found:
                      <Box sx={{ mt: 1 }}>
                        {checkerResult.matches?.map((m, idx) => (
                          <Typography key={idx} variant="body2" sx={{ fontWeight: 800, color: "#166534" }}>
                            • {m.tier} {m.amount ? `(${m.amount})` : ""} - Number: {m.matchedNumber}
                          </Typography>
                        ))}
                      </Box>
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: "8px" }}>
                      {checkerResult.message || "No match found for this draw."}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>

            {/* Prize Tier Breakdown Tables */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {prizeTiers.map((tier) => {
                const numbers = (drawResult.prizes as any)?.[tier.key] || [];
                const amount = drawResult.prizes?.amounts?.[tier.key];
                if (!numbers || numbers.length === 0) return null;

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={tier.key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: "10px",
                        border: "1px solid #E5E7EB",
                        bgcolor: "#FFFFFF",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tier.dotBg }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827" }}>
                            {tier.label}
                          </Typography>
                        </Box>
                        {amount && (
                          <Chip
                            label={amount}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: "#EFF6FF", color: "#1D4ED8", borderRadius: "4px" }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {numbers.map((num: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={num}
                            onClick={() => handleCopyTicket(num)}
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              bgcolor: "#F3F4F6",
                              color: "#111827",
                              borderRadius: "4px",
                              "&:hover": { bgcolor: "#E5E7EB", cursor: "pointer" },
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

        {/* All Available Draw Dates for this Lottery */}
        {sortedDates.length > 0 && (
          <Paper
            elevation={0}
            component="nav"
            aria-label={`${lotteryInfo.name} Historical Results Links`}
            sx={{
              mt: 5,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CalendarMonthIcon sx={{ color: "#0B3C5D" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                All {lotteryInfo.name} Historical Draw Dates
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
              Quick access to previous {lotteryInfo.name} draw results:
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {sortedDates.map((d) => (
                <Button
                  key={d}
                  component={Link}
                  href={getLotteryUrl(lotterySlug, d)}
                  variant={d === selectedDate ? "contained" : "outlined"}
                  size="small"
                  sx={{
                    borderRadius: "6px",
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: d === selectedDate ? "#0B3C5D" : "transparent",
                    color: d === selectedDate ? "#FFFFFF" : "#374151",
                    borderColor: d === selectedDate ? "#0B3C5D" : "#E5E7EB",
                    "&:hover": {
                      borderColor: "#0B3C5D",
                      bgcolor: d === selectedDate ? "#0F2C59" : "#EFF6FF",
                    },
                  }}
                >
                  📅 {d}
                </Button>
              ))}
            </Box>
          </Paper>
        )}

        {/* Recent Draws across Other Kerala Lotteries (Mesh Internal Links) */}
        {recentOtherDraws.length > 0 && (
          <Paper
            elevation={0}
            component="nav"
            aria-label="Recent Draws from Other Lotteries"
            sx={{
              mt: 4,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CasinoIcon sx={{ color: "#0B3C5D" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                Recent Kerala Lottery Results
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
              Check latest winning numbers from other weekly and bumper lotteries:
            </Typography>

            <Grid container spacing={1.5}>
              {recentOtherDraws
                .filter((d) => !(d.lottery_code === lotteryCode && d.draw_date === dateParam))
                .slice(0, 8)
                .map((d) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`${d.lottery_code}-${d.draw_date}`}>
                    <Box
                      component={Link}
                      href={getLotteryUrl(d.lottery_code, d.draw_date)}
                      sx={{
                        display: "block",
                        p: 1.5,
                        borderRadius: "8px",
                        bgcolor: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "all 0.15s ease-in-out",
                        "&:hover": {
                          bgcolor: "#EFF6FF",
                          borderColor: "#3B82F6",
                          transform: "translateX(2px)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0B3C5D" }}>
                          {d.draw_name}
                        </Typography>
                        <Chip
                          label={d.draw_code}
                          size="small"
                          sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mt: 0.5 }}>
                        📅 {d.draw_date} • 1st: {d.first?.ticket || "N/A"}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        )}

        {/* Cross-Link All Categories */}
        <Paper
          elevation={0}
          component="nav"
          aria-label="All Lottery Categories"
          sx={{
            mt: 4,
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
            Kerala State Lotteries Schedule & Categories
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
            Explore all official Kerala state weekly lotteries and bumper seasonal jackpot draws:
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            {WEEKLY_LOTTERIES.map((item) => (
              <Button
                key={item.code}
                component={Link}
                href={getLotteryUrl(item.code)}
                variant="outlined"
                size="small"
                sx={{
                  color: "#374151",
                  borderColor: "#E5E7EB",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#0B3C5D",
                    bgcolor: "#F0F7FF",
                    color: "#0B3C5D",
                  },
                }}
              >
                {item.name} ({item.day})
              </Button>
            ))}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {BUMPER_LOTTERIES.map((item) => (
              <Button
                key={item.code}
                component={Link}
                href={getLotteryUrl(item.code)}
                variant="outlined"
                size="small"
                sx={{
                  color: "#D97706",
                  borderColor: "#FDE68A",
                  bgcolor: "#FFFBEB",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "#D97706",
                    bgcolor: "#FEF3C7",
                  },
                }}
              >
                🏆 {item.name} ({item.jackpot})
              </Button>
            ))}
          </Box>
        </Paper>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Container>
    </Box>
  );
}
