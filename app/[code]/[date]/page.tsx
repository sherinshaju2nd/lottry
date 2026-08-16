"use client";

import React, { useEffect, useState, use, useRef } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import confetti from "canvas-confetti";
import DrawDetailSkeleton from "@/components/skeletons/DrawDetailSkeleton";
import ShareButtons from "@/components/ShareButtons";
import {
  ALL_LOTTERIES,
  StructuredDrawResult,
  PostponedDraw,
  supabase,
  validateTicketMatch,
  findTopPrizePartialHint,
  getSearchFeedbackMessage,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getLotteryUrl,
  formatTicketSearchInput,
} from "@/lib/supabase";

interface SingleCheckerMatch {
  tier: string;
  amount?: string;
  matchedNumber: string;
  seriesNote?: string;
}

interface PageProps {
  params: Promise<{ code: string; date: string }>;
}

interface CheckerWinResult {
  isWinner: boolean;
  matches?: SingleCheckerMatch[];
  message?: string;
}

export default function DedicatedLotteryDateDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const dateParam = decodeURIComponent(resolvedParams.date);
  const router = useRouter();

  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode) || {
    name: `${rawCode} Lottery`,
    nameMl: "",
    code: lotteryCode,
    day: "Scheduled Draw",
  };

  const todayISTDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dateParam);
  const [drawResult, setDrawResult] = useState<StructuredDrawResult | null>(null);
  const [postponement, setPostponement] = useState<PostponedDraw | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAfter3PM, setIsAfter3PM] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCopyTicket = (ticketNum: string) => {
    if (!ticketNum || ticketNum === "PENDING" || ticketNum === "N/A") return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketNum);
    }
    setSnackbarMessage(`Ticket ${ticketNum} copied to clipboard!`);
    setSnackbarOpen(true);
  };

  // Ticket Checker State
  const [checkerTicketInput, setCheckerTicketInput] = useState<string>("");
  const [checkerResult, setCheckerResult] = useState<CheckerWinResult | null>(null);
  const checkerSectionRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadDatesAndResult() {
      setIsLoading(true);
      try {
        const datesRes = await fetch(`/api/draws?code=${lotteryCode}&type=dates&t=${Date.now()}`);
        const datesJson = await datesRes.json();
        const dates: string[] = datesJson.dates || [];
        setAvailableDates(dates);

        const resultRes = await fetch(
          `/api/draws?code=${lotteryCode}&date=${dateParam}&t=${Date.now()}`
        );
        const resultJson = await resultRes.json();
        setDrawResult(resultJson.result || null);
        setPostponement(resultJson.postponement || null);
      } catch {
        setDrawResult(null);
        setPostponement(null);
      } finally {
        setIsLoading(false);
      }
    }

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

    loadDatesAndResult();

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
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.draw_date === dateParam) {
            loadDatesAndResult();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "postponed_draws",
        },
        () => {
          loadDatesAndResult();
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

    // Run the checker logic inline
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

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
      });
    }, 250);
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
        {/* Navigation Bar, Date Selector & Export Actions */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 4,
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
              Schedule
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

        <Box sx={{ mb: 2 }}>
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

        {isLoading ? (
          <DrawDetailSkeleton />
        ) : !drawResult ? (
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
                    : `Official results for today (${selectedDate}) will be updated automatically around 3:10 PM.`
                  : `No published lottery draw was recorded for ${selectedDate}. Check other available dates above.`}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
              >
                Refresh Results Page
              </Button>
            </Paper>
          )
        ) : (
          <>
            {/* 1st Prize Winner Hero Banner */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                mb: 4,
                borderRadius: "16px",
                bgcolor: "#0B3C5D",
                color: "#FFFFFF",
                boxShadow: "0 10px 25px rgba(11, 60, 93, 0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Grid container spacing={3} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Chip
                    icon={<EmojiEventsIcon sx={{ fontSize: "14px !important", color: "#0B3C5D" }} />}
                    label="1ST PRIZE JACKPOT WINNER"
                    size="small"
                    sx={{
                      bgcolor: "#FFC107",
                      color: "#0B3C5D",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 600, mb: 1 }}
                  >
                    Guaranteed 1st Prize Amount: {drawResult.prizes?.amounts?.["1st"] || "₹70,00,000/-"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 900,
                        color: "#FFC107",
                        letterSpacing: "0.08em",
                        fontSize: { xs: "2.2rem", sm: "3.2rem", md: "3.8rem" },
                        lineHeight: 1.1,
                      }}
                    >
                      {drawResult.first?.ticket || "PENDING"}
                    </Typography>
                    {drawResult.first?.ticket && (
                      <Tooltip title="Copy Winning Ticket Number">
                        <IconButton
                          onClick={() => handleCopyTicket(drawResult.first?.ticket || "")}
                          sx={{
                            color: "#FFC107",
                            bgcolor: "rgba(255, 193, 7, 0.15)",
                            "&:hover": { bgcolor: "rgba(255, 193, 7, 0.3)" },
                          }}
                          size="small"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      Winning Location: <strong>{drawResult.first?.location || "N/A"}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      Agent Name: <strong>{drawResult.first?.agent || "N/A"}</strong>
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "#FFC107" }}>
                      Quick Ticket Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2, fontSize: "0.85rem" }}>
                      Have a ticket for this draw? Check if your 6-digit or 4-digit number matches any prize tier instantly below.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() =>
                        checkerSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                      }
                      sx={{
                        bgcolor: "#FFC107",
                        color: "#0B3C5D",
                        fontWeight: 800,
                        textTransform: "none",
                        borderRadius: "6px",
                        width: "100%",
                        "&:hover": { bgcolor: "#FFA000" },
                      }}
                    >
                      Check Ticket Number ↓
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Interactive Ticket Checker Section */}
            <Paper
              ref={checkerSectionRef}
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                mb: 4,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <ConfirmationNumberIcon sx={{ color: "#0B3C5D" }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                  Verify Ticket for This Draw ({selectedDate})
                </Typography>
              </Box>

              <form onSubmit={handleCheckTicketSubmit}>
                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                  <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter ticket e.g. MJ 136429, 136429, or 6429..."
                      value={checkerTicketInput}
                      onChange={(e) => setCheckerTicketInput(formatTicketSearchInput(e.target.value))}
                      slotProps={{
                        input: {
                          sx: {
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: "#0B3C5D",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        py: 1,
                        borderRadius: "6px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#0F2C59" },
                      }}
                    >
                      Check Ticket
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {checkerResult && (
                <Box sx={{ mt: 3 }}>
                  {checkerResult.isWinner ? (
                    <Alert
                      severity="success"
                      icon={<CelebrationIcon fontSize="inherit" />}
                      sx={{ borderRadius: "8px" }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        🎉 Congratulations! Winning Prize Match Found:
                      </Typography>
                      {checkerResult.matches?.map((m, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mt: 0.5 }}>
                          • <strong>{m.tier}</strong> {m.amount ? `(${m.amount})` : ""} - Matched Number: <code>{m.matchedNumber}</code> {m.seriesNote ? `(${m.seriesNote})` : ""}
                        </Typography>
                      ))}
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: "8px" }}>
                      {checkerResult.message}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>

            {/* Complete Prize Breakdown Grid */}
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#111827", mb: 3 }}>
              Complete Prize Breakdown & Winning Numbers
            </Typography>

            <Grid container spacing={3}>
              {prizeTiers.map((tier) => {
                const numbers = (drawResult.prizes as any)?.[tier.key] as string[] | undefined;
                const amount = drawResult.prizes?.amounts?.[tier.key];

                if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
                  return null;
                }

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={tier.key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "10px",
                        border: "1px solid #E5E7EB",
                        bgcolor: "#FFFFFF",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                          pb: 1.5,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: tier.dotBg,
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827" }}>
                            {tier.label}
                          </Typography>
                        </Box>
                        {amount && (
                          <Chip
                            label={amount}
                            size="small"
                            sx={{
                              bgcolor: "#F3F4F6",
                              color: "#374151",
                              fontWeight: 800,
                              borderRadius: "4px",
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {numbers.map((num, idx) => (
                          <Chip
                            key={idx}
                            label={num}
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              letterSpacing: "0.04em",
                              bgcolor: "#F9FAFB",
                              color: "#1F2937",
                              border: "1px solid #E5E7EB",
                              borderRadius: "6px",
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
      </Container>
    </Box>
  );
}
