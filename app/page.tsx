"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CelebrationIcon from "@mui/icons-material/Celebration";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import confetti from "canvas-confetti";
import {
  WEEKLY_LOTTERIES,
  StructuredDrawResult,
  supabase,
} from "@/lib/supabase";
import ShareButtons from "@/components/ShareButtons";

const searchSchema = yup.object({
  ticketNumber: yup
    .string()
    .required("Please enter a ticket number")
    .min(1, "Please enter a ticket number"),
});

type SearchFormData = yup.InferType<typeof searchSchema>;

interface SearchMatch {
  draw_date: string;
  draw_name: string;
  draw_code: string;
  lottery_code: string;
  prize_tier: string;
  prize_amount?: string;
  ticket_matched: string;
}

export default function HomePage() {
  const [todayLottery, setTodayLottery] = useState(WEEKLY_LOTTERIES[0]);
  const [todayDayName, setTodayDayName] = useState("Sunday");
  const [todayDrawResult, setTodayDrawResult] =
    useState<StructuredDrawResult | null>(null);

  const [searchResults, setSearchResults] = useState<SearchMatch[] | null>(
    null,
  );
  const [searchedQuery, setSearchedQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<
    string | null
  >(null);
  const [recentDrawsMap, setRecentDrawsMap] = useState<
    Record<string, StructuredDrawResult>
  >({});
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [latestPreviousDraw, setLatestPreviousDraw] =
    useState<StructuredDrawResult | null>(null);

  const todayISTDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: yupResolver(searchSchema),
  });

  useEffect(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const istDayName = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
    setTodayDayName(istDayName);
    const matched =
      WEEKLY_LOTTERIES.find(
        (l) => l.day.toLowerCase() === istDayName.toLowerCase(),
      ) || WEEKLY_LOTTERIES[0];
    setTodayLottery(matched);

    // Calculate IST time to determine default banner tab (Before 2:30 PM -> Previous Day Result, After 2:30 PM -> Today's Draw)
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });
      const [hStr, mStr] = timeStr.split(":");
      const istHours = parseInt(hStr, 10);
      const istMinutes = parseInt(mStr, 10);
      const isAfter230PM =
        istHours > 14 || (istHours === 14 && istMinutes >= 30);
      setHeroSlideIndex(isAfter230PM ? 0 : 1);
    } catch {
      setHeroSlideIndex(1);
    }

    async function checkTodayData() {
      try {
        const res = await fetch(`/api/draws?code=${matched.code}`);
        const json = await res.json();
        if (json.success && json.result) {
          setTodayDrawResult(json.result);
        } else {
          setTodayDrawResult(null);
        }
      } catch {
        setTodayDrawResult(null);
      }
    }

    async function loadRecentDrawsMap() {
      try {
        const res = await fetch("/api/draws?type=all");
        const json = await res.json();
        if (
          json.success &&
          Array.isArray(json.results) &&
          json.results.length > 0
        ) {
          const todayISTDate = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });
          // Previous draw is the most recent draw published prior to todayISTDate (or json.results[0] if today is not published)
          const prevDraw =
            json.results.find(
              (d: StructuredDrawResult) => d.draw_date !== todayISTDate,
            ) ||
            json.results[1] ||
            json.results[0];
          setLatestPreviousDraw(prevDraw);

          const map: Record<string, StructuredDrawResult> = {};
          json.results.forEach((draw: StructuredDrawResult) => {
            const code = (draw.lottery_code || "").toUpperCase();
            if (code && !map[code]) {
              map[code] = draw;
            }
          });
          setRecentDrawsMap(map);
        }
      } catch {
        setRecentDrawsMap({});
      }
    }

    checkTodayData();
    loadRecentDrawsMap();

    const channel = supabase
      .channel("realtime-lottery-results")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draw_results" },
        (payload) => {
          if (payload.new) {
            const newRow = payload.new as any;
            setRealtimeNotification(
              `🎉 Live Update: ${newRow.draw_name || "Lottery"} (${newRow.draw_code || ""}) updated for ${newRow.draw_date || "today"}`,
            );
          }
          checkTodayData();
          loadRecentDrawsMap();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#2E7D32", "#FFC107", "#E67E22", "#3B82F6", "#EC4899"],
    });
  };

  const onSearchSubmit = async (data: SearchFormData) => {
    if (heroSlideIndex === 0 && !hasTodayResult) return;
    setIsSearching(true);
    setSearchedQuery(data.ticketNumber);

    const targetLotteryCode =
      heroSlideIndex === 0
        ? todayLottery.code
        : latestPreviousDraw?.lottery_code || "";
    const targetDrawDate =
      heroSlideIndex === 1 ? latestPreviousDraw?.draw_date : undefined;

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(data.ticketNumber.trim())}`,
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.results)) {
        const filteredMatches = json.results.filter((m: SearchMatch) => {
          const matchesCode =
            !targetLotteryCode ||
            m.lottery_code.toLowerCase() === targetLotteryCode.toLowerCase();
          const matchesDate = !targetDrawDate || m.draw_date === targetDrawDate;
          return matchesCode && matchesDate;
        });

        setSearchResults(filteredMatches);
        if (filteredMatches.length > 0) {
          triggerCelebration();
        }
      } else {
        setSearchResults([]);
      }
      setOpenModal(true);
    } catch {
      setSearchResults([]);
      setOpenModal(true);
    } finally {
      setIsSearching(false);
    }
  };

  const getBadgeStyle = (day: string) => {
    if (day.toLowerCase() === todayDayName.toLowerCase()) {
      return {
        bgcolor: "#E8F5E9",
        color: "#2E7D32",
        border: "1px solid #A5D6A7",
      };
    }
    if (day === "Saturday" || day === "Sunday") {
      return { bgcolor: "#FEF3C7", color: "#D97706" };
    }
    return { bgcolor: "#F3F4F6", color: "#4B5563" };
  };

  const hasTodayResult = !!todayDrawResult;

  return (
    <Container
      maxWidth={false}
      sx={{ py: { xs: 3, sm: 5, md: 6 }, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}
    >
      {realtimeNotification && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: "12px" }}
          onClose={() => setRealtimeNotification(null)}
        >
          {realtimeNotification}
        </Alert>
      )}

      {/* Hero Banner Container (2-Slide Carousel: Today's Draw & Yesterday's Result) */}
      <Paper
        elevation={0}
        sx={{
          py: { xs: 4, sm: 5, md: 6 },
          px: { xs: 2.5, sm: 5, md: 7, lg: 8 },
          minHeight: { xs: "auto", md: 440 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: { xs: "20px", sm: "28px" },
          bgcolor: "#F4F6F8",
          border: "1px solid #E5E7EB",
          mb: { xs: 4, sm: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Carousel Tab Switcher at Top of Hero Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 1.5,
            zIndex: 2,
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              onClick={() => setHeroSlideIndex(0)}
              variant={heroSlideIndex === 0 ? "contained" : "outlined"}
              startIcon={<AccessTimeIcon fontSize="small" />}
              sx={{
                bgcolor: heroSlideIndex === 0 ? "#0F5A24" : "#FFFFFF",
                color: heroSlideIndex === 0 ? "#FFFFFF" : "#374151",
                borderColor: heroSlideIndex === 0 ? "#0F5A24" : "#E5E7EB",
                fontWeight: 800,
                borderRadius: "20px",
                px: 2.5,
                py: 0.75,
                fontSize: { xs: "0.75rem", sm: "0.825rem" },
                "&:hover": {
                  bgcolor: heroSlideIndex === 0 ? "#15803D" : "#F3F4F6",
                },
              }}
            >
              Today&apos;s Draw ({todayLottery.name} {todayLottery.code})
            </Button>

            <Button
              size="small"
              onClick={() => setHeroSlideIndex(1)}
              variant={heroSlideIndex === 1 ? "contained" : "outlined"}
              startIcon={<EmojiEventsIcon fontSize="small" />}
              sx={{
                bgcolor: heroSlideIndex === 1 ? "#92400E" : "#FFFFFF",
                color: heroSlideIndex === 1 ? "#FFFFFF" : "#374151",
                borderColor: heroSlideIndex === 1 ? "#92400E" : "#E5E7EB",
                fontWeight: 800,
                borderRadius: "20px",
                px: 2.5,
                py: 0.75,
                fontSize: { xs: "0.75rem", sm: "0.825rem" },
                "&:hover": {
                  bgcolor: heroSlideIndex === 1 ? "#B45309" : "#F3F4F6",
                },
              }}
            >
              Yesterday&apos;s Result{" "}
              {latestPreviousDraw ? `(${latestPreviousDraw.draw_date})` : ""}
            </Button>
          </Box>

          {/* Carousel Slide Indicators & Arrows */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "#6B7280", fontWeight: 700 }}
            >
              {heroSlideIndex === 0
                ? "1 of 2: Today"
                : "2 of 2: Yesterday/Previous"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setHeroSlideIndex((prev) => (prev === 0 ? 1 : 0))}
              sx={{
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                "&:hover": { bgcolor: "#F9FAFB" },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setHeroSlideIndex((prev) => (prev === 0 ? 1 : 0))}
              sx={{
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                "&:hover": { bgcolor: "#F9FAFB" },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* SLIDE 0: TODAY'S DRAW */}
        {heroSlideIndex === 0 && (
          <Box sx={{ width: "100%", position: "relative", zIndex: 1 }}>
            {/* Winner Details Card on Right (When Today's Winner Result is Available - Desktop Only) */}
            {hasTodayResult && todayDrawResult ? (
              <Box
                sx={{
                  display: { xs: "none", lg: "block" },
                  position: "absolute",
                  right: { lg: "20px", xl: "40px" },
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: { lg: 350, xl: 380 },
                  zIndex: 2,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    border: "2px solid #2E7D32",
                    boxShadow: "0 10px 30px rgba(46, 125, 50, 0.15)",
                  }}
                >
                  <Chip
                    icon={
                      <EmojiEventsIcon
                        sx={{ fontSize: "14px !important", color: "#1B5E20" }}
                      />
                    }
                    label={`WINNING TICKET • ${todayDrawResult.draw_date}`}
                    size="small"
                    sx={{
                      bgcolor: "#DCFCE7",
                      color: "#15803D",
                      fontWeight: 800,
                      fontSize: "0.725rem",
                      borderRadius: "12px",
                      mb: 1.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "#15803D", fontWeight: 800, display: "block" }}
                  >
                    1ST PRIZE WINNER TICKET (
                    {todayDrawResult.prizes?.amounts?.["1st"] || "₹70 Lakhs"})
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 900,
                      color: "#0F5A24",
                      mb: 1,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {todayDrawResult.first?.ticket || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", fontWeight: 700 }}
                  >
                    Location:{" "}
                    <strong>{todayDrawResult.first?.location || "N/A"}</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", fontWeight: 700, mt: 0.5 }}
                  >
                    Agent:{" "}
                    <strong>{todayDrawResult.first?.agent || "N/A"}</strong>
                  </Typography>

                  <Button
                    component={Link}
                    href={`/lottery/${todayDrawResult.lottery_code.toLowerCase()}/${encodeURIComponent(todayDrawResult.draw_date)}`}
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      borderRadius: "10px",
                      borderColor: "#2E7D32",
                      color: "#2E7D32",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      "&:hover": { bgcolor: "#E8F5E9", borderColor: "#1B5E20" },
                    }}
                  >
                    View Full Prize List →
                  </Button>
                </Paper>
              </Box>
            ) : (
              /* Faded Preview Card on Right (When Result Not Yet Published) */
              <Box
                sx={{
                  position: "absolute",
                  right: { lg: "20px", xl: "50px" },
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: { lg: 350, xl: 420 },
                  opacity: 0.35,
                  pointerEvents: "none",
                  display: { xs: "none", lg: "block" },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    mb: 2,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#374151", fontWeight: 700 }}
                  >
                    കേരള ലോട്ടറി
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#D97706", fontWeight: 800, mt: 1 }}
                  >
                    #FFC107 ₹70 Laks
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box sx={{ maxWidth: { xs: "100%", lg: 650, xl: 720 } }}>
              {/* Badge */}
              {hasTodayResult ? (
                <Chip
                  icon={
                    <EmojiEventsIcon
                      sx={{ fontSize: "14px !important", color: "#111827" }}
                    />
                  }
                  label="Latest Published Result"
                  sx={{
                    bgcolor: "#FFC107",
                    color: "#111827",
                    fontWeight: 800,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    borderRadius: "20px",
                    mb: 2,
                    px: 1,
                    py: 0.25,
                  }}
                />
              ) : (
                <Chip
                  icon={
                    <AccessTimeIcon
                      sx={{ fontSize: "14px !important", color: "#B45309" }}
                    />
                  }
                  label="Result Coming Soon (3:10 PM)"
                  sx={{
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontWeight: 800,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    borderRadius: "20px",
                    mb: 2,
                    px: 1,
                    py: 0.25,
                    border: "1px solid #FCD34D",
                  }}
                />
              )}

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: "#111827",
                  mb: 0.5,
                  fontSize: {
                    xs: "1.75rem",
                    sm: "2.6rem",
                    md: "3.5rem",
                    lg: "4.25rem",
                  },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {todayLottery.name} {todayLottery.code}
              </Typography>

              {hasTodayResult ? (
                <Typography
                  variant="h6"
                  sx={{
                    color: "#0F5A24",
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.3rem", lg: "1.6rem" },
                  }}
                >
                  Drawn Today ({todayDrawResult.draw_date}), 3:00 PM
                </Typography>
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    color: "#D97706",
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.3rem", lg: "1.6rem" },
                  }}
                >
                  Draw Scheduled Today at 3:00 PM • Results Coming Soon
                </Typography>
              )}

              <Typography
                variant="body2"
                sx={{
                  color: "#4B5563",
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  maxWidth: 600,
                }}
              >
                {hasTodayResult
                  ? `The results for the ${todayLottery.name} ${todayLottery.code} lottery (${todayDrawResult.draw_code}) have been published. Check your ticket number or view full prize breakdown below.`
                  : `Today's draw for ${todayLottery.name} ${todayLottery.code} will take place at 3:00 PM. Full winning results will be published automatically at 3:10 PM.`}
              </Typography>

              {/* Action Row */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  component="form"
                  onSubmit={handleSubmit(onSearchSubmit)}
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.25, sm: 0.75 },
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: { xs: 1.25, sm: 1 },
                      bgcolor: "#FFFFFF",
                      border: errors.ticketNumber
                        ? "2px solid #DC2626"
                        : "1px solid #E5E7EB",
                      borderRadius: "16px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                      maxWidth: 600,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        pl: { xs: 0.5, sm: 1.5 },
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          color: "#6B7280",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ConfirmationNumberIcon fontSize="small" />
                      </Box>
                      <TextField
                        {...register("ticketNumber")}
                        disabled={!hasTodayResult || isSearching}
                        placeholder={
                          hasTodayResult
                            ? `Enter 6-digit ticket for ${todayLottery.name} (${todayLottery.code})...`
                            : `Ticket checker activates at 3:10 PM once results are published`
                        }
                        variant="standard"
                        fullWidth
                        slotProps={{ input: { disableUnderline: true } }}
                        sx={{
                          ml: 1.5,
                          mr: 1,
                          input: {
                            fontSize: { xs: "0.85rem", sm: "0.925rem" },
                            fontWeight: 500,
                          },
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      disabled={!hasTodayResult || isSearching}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: hasTodayResult ? "#0F5A24" : "#9CA3AF",
                        color: "#FFFFFF",
                        px: 3.5,
                        py: { xs: 1.2, sm: 1.35 },
                        borderRadius: { xs: "10px", sm: "12px" },
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        "&:hover": {
                          bgcolor: hasTodayResult ? "#15803D" : "#9CA3AF",
                        },
                      }}
                    >
                      {isSearching
                        ? "Checking..."
                        : hasTodayResult
                          ? "Check Now"
                          : "Result Coming Soon"}
                    </Button>
                  </Paper>

                  {!hasTodayResult ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#B45309",
                        pl: 1,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14 }} /> Ticket checker
                      for {todayLottery.name} ({todayLottery.code}) will be
                      accessible at 3:10 PM once results are published.
                    </Typography>
                  ) : errors.ticketNumber ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "#DC2626", pl: 1.5, fontWeight: 600 }}
                    >
                      {errors.ticketNumber.message}
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: "#0F5A24", pl: 1, fontWeight: 600 }}
                    >
                      ✓ Live Checker active for {todayLottery.name} (
                      {todayLottery.code}) draw result.
                    </Typography>
                  )}
                </Box>

                {hasTodayResult && (
                  <Box sx={{ pt: 0.5 }}>
                    <Button
                      component={Link}
                      href={`/lottery/${todayLottery.code.toLowerCase()}/${encodeURIComponent(todayDrawResult.draw_date)}`}
                      variant="outlined"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        borderColor: "#0F5A24",
                        color: "#0F5A24",
                        fontWeight: 800,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.1, sm: 1 },
                        borderRadius: { xs: "10px", sm: "12px" },
                        width: { xs: "100%", sm: "auto" },
                        textAlign: "center",
                        justifyContent: "center",
                        fontSize: { xs: "0.825rem", sm: "0.95rem" },
                        display: { xs: "none", md: "inline-flex" },
                        "&:hover": {
                          bgcolor: "#E8F5E9",
                          borderColor: "#0F5A24",
                        },
                      }}
                    >
                      View More Details for {todayDrawResult.draw_date} Result
                    </Button>
                  </Box>
                )}

                {hasTodayResult && todayDrawResult && (
                  <Box sx={{ display: { xs: "block", md: "none" }, mt: 3, pt: 3, borderTop: "1px solid #E5E7EB" }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 2 }}>
                      Winning Numbers
                    </Typography>

                    {/* 1st Prize Winner details card (mobile version) */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
                        color: "#FFFFFF",
                        boxShadow: "0 4px 15px rgba(211, 84, 0, 0.15)",
                      }}
                    >
                      <Chip
                        icon={<EmojiEventsIcon sx={{ color: "#FFFFFF !important", fontSize: "14px !important" }} />}
                        label="1ST PRIZE WINNER"
                        size="small"
                        sx={{
                          bgcolor: "rgba(0, 0, 0, 0.25)",
                          color: "#FFFFFF",
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          mb: 1.5,
                          borderRadius: "8px",
                        }}
                      />
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          fontFamily: "monospace",
                          letterSpacing: 1,
                          mb: 0.5,
                        }}
                      >
                        {todayDrawResult.first?.ticket || "N/A"}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, opacity: 0.95, mb: 1.5 }}>
                        Prize: {todayDrawResult.prizes?.amounts?.["1st"] || "₹70 Lakhs"}
                      </Typography>

                      {((todayDrawResult.first?.location && todayDrawResult.first.location.toLowerCase() !== "n/a" && todayDrawResult.first.location.toLowerCase() !== "nan" && todayDrawResult.first.location.toLowerCase() !== "null") || 
                        (todayDrawResult.first?.agent && todayDrawResult.first.agent.toLowerCase() !== "n/a" && todayDrawResult.first.agent.toLowerCase() !== "nan" && todayDrawResult.first.agent.toLowerCase() !== "null")) && (
                        <Box sx={{ display: "flex", borderTop: "1px solid rgba(255, 255, 255, 0.2)", pt: 1.5, gap: 2 }}>
                          {todayDrawResult.first?.location && todayDrawResult.first.location.toLowerCase() !== "n/a" && todayDrawResult.first.location.toLowerCase() !== "nan" && todayDrawResult.first.location.toLowerCase() !== "null" && (
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}>
                                Location
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {todayDrawResult.first.location}
                              </Typography>
                            </Box>
                          )}
                          {todayDrawResult.first?.agent && todayDrawResult.first.agent.toLowerCase() !== "n/a" && todayDrawResult.first.agent.toLowerCase() !== "nan" && todayDrawResult.first.agent.toLowerCase() !== "null" && (
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}>
                                Agent
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {todayDrawResult.first.agent}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Paper>

                    {/* Other Prize Tiers */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {[
                        { key: "consolation", label: "Consolation Prize", badgeBg: "#7F8C8D" },
                        { key: "2nd", label: "2nd Prize", badgeBg: "#D4AF37" },
                        { key: "3rd", label: "3rd Prize", badgeBg: "#2980B9" },
                        { key: "4th", label: "4th Prize", badgeBg: "#8E44AD" },
                        { key: "5th", label: "5th Prize", badgeBg: "#2C3E50" },
                        { key: "6th", label: "6th Prize", badgeBg: "#16A085" },
                        { key: "7th", label: "7th Prize", badgeBg: "#D35400" },
                        { key: "8th", label: "8th Prize", badgeBg: "#C0392B" },
                        { key: "9th", label: "9th Prize", badgeBg: "#7F8C8D" },
                      ].map(({ key, label, badgeBg }) => {
                        const numbers = todayDrawResult.prizes?.[
                          key as keyof typeof todayDrawResult.prizes
                        ] as string[] | undefined;
                        const amount = todayDrawResult.prizes?.amounts?.[key];

                        if (!numbers || numbers.length === 0) return null;

                        return (
                          <Paper
                            key={key}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: "12px",
                              bgcolor: "#FFFFFF",
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: badgeBg }} />
                                {label}
                              </Typography>
                              {amount && (
                                <Chip
                                  label={`Prize: ${amount}`}
                                  size="small"
                                  sx={{ bgcolor: "#F3F4F6", color: "#374151", fontWeight: 700, borderRadius: "6px", fontSize: "0.75rem" }}
                                />
                              )}
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {numbers.map((num, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: "6px",
                                    bgcolor: badgeBg,
                                    color: "#FFFFFF",
                                    fontFamily: "monospace",
                                    fontWeight: 800,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {num}
                                </Box>
                              ))}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* SLIDE 1: YESTERDAY'S / PREVIOUS DRAW RESULT */}
        {heroSlideIndex === 1 && (
          <Box sx={{ width: "100%", position: "relative", zIndex: 1 }}>
            {/* Winner Display Card on Right */}
            <Box
              sx={{
                position: "absolute",
                right: { sm: "10px", md: "20px", lg: "40px" },
                top: "50%",
                transform: "translateY(-50%)",
                width: { sm: 300, md: 360, lg: 400 },
                display: { xs: "none", md: "block" },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #FDE68A",
                  boxShadow: "0 10px 25px rgba(217, 119, 6, 0.12)",
                }}
              >
                <Chip
                  icon={
                    <EmojiEventsIcon
                      sx={{ fontSize: "14px !important", color: "#92400E" }}
                    />
                  }
                  label={`WINNING TICKET • ${latestPreviousDraw?.draw_date || "PREVIOUS"}`}
                  size="small"
                  sx={{
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontWeight: 800,
                    fontSize: "0.725rem",
                    borderRadius: "12px",
                    mb: 1.5,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#B45309", fontWeight: 700, display: "block" }}
                >
                  1ST PRIZE WINNER TICKET
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 900,
                    color: "#92400E",
                    mb: 1,
                  }}
                >
                  {latestPreviousDraw?.first?.ticket || "N/A"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#374151", fontWeight: 700 }}
                >
                  Location:{" "}
                  <strong>
                    {latestPreviousDraw?.first?.location || "N/A"}
                  </strong>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#374151", fontWeight: 700, mt: 0.5 }}
                >
                  Agent:{" "}
                  <strong>{latestPreviousDraw?.first?.agent || "N/A"}</strong>
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ maxWidth: { xs: "100%", md: 650, lg: 750 } }}>
              <Chip
                icon={
                  <EmojiEventsIcon
                    sx={{ fontSize: "14px !important", color: "#92400E" }}
                  />
                }
                label={`Previous Draw Result Published (${latestPreviousDraw?.draw_date || "Yesterday"})`}
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 800,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  borderRadius: "20px",
                  mb: 2,
                  px: 1,
                  py: 0.25,
                  border: "1px solid #FDE68A",
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: "#111827",
                  mb: 0.5,
                  fontSize: {
                    xs: "1.75rem",
                    sm: "2.6rem",
                    md: "3.5rem",
                    lg: "4.25rem",
                  },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {latestPreviousDraw?.draw_name || "Kerala Lottery"}{" "}
                {latestPreviousDraw?.draw_code || ""}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#92400E",
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: "0.95rem", sm: "1.3rem", lg: "1.6rem" },
                }}
              >
                Drawn on {latestPreviousDraw?.draw_date || "Previous Draw"},
                3:00 PM
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#4B5563",
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  maxWidth: 600,
                }}
              >
                Published winning numbers breakdown for{" "}
                {latestPreviousDraw?.draw_name} ({latestPreviousDraw?.draw_code}
                ) drawn on {latestPreviousDraw?.draw_date}. 1st Prize ticket:{" "}
                <strong>{latestPreviousDraw?.first?.ticket || "N/A"}</strong> (
                {latestPreviousDraw?.prizes?.amounts?.["1st"] || "₹70 Lakhs"}).
              </Typography>

              {/* Ticket Search Form for Previous Draw */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Box
                  component="form"
                  onSubmit={handleSubmit(onSearchSubmit)}
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.25, sm: 0.75 },
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: { xs: 1.25, sm: 1 },
                      bgcolor: "#FFFFFF",
                      border: errors.ticketNumber
                        ? "2px solid #DC2626"
                        : "1px solid #FDE68A",
                      borderRadius: "16px",
                      boxShadow: "0 2px 10px rgba(146, 64, 14, 0.08)",
                      maxWidth: 600,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        pl: { xs: 0.5, sm: 1.5 },
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          color: "#92400E",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ConfirmationNumberIcon fontSize="small" />
                      </Box>
                      <TextField
                        {...register("ticketNumber")}
                        disabled={isSearching}
                        placeholder={`Enter 6-digit ticket for ${latestPreviousDraw?.draw_name || "Previous Draw"} (${latestPreviousDraw?.draw_code || ""})...`}
                        variant="standard"
                        fullWidth
                        slotProps={{ input: { disableUnderline: true } }}
                        sx={{
                          ml: 1.5,
                          mr: 1,
                          input: {
                            fontSize: { xs: "0.85rem", sm: "0.925rem" },
                            fontWeight: 500,
                          },
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      disabled={isSearching}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: "#92400E",
                        color: "#FFFFFF",
                        px: 3.5,
                        py: { xs: 1.2, sm: 1.35 },
                        borderRadius: { xs: "10px", sm: "12px" },
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        "&:hover": { bgcolor: "#B45309" },
                      }}
                    >
                      {isSearching ? "Checking..." : "Check Previous Draw"}
                    </Button>
                  </Paper>

                  {errors.ticketNumber ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "#DC2626", pl: 1.5, fontWeight: 600 }}
                    >
                      {errors.ticketNumber.message}
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: "#92400E", pl: 1, fontWeight: 600 }}
                    >
                      ✓ Checking ticket against {latestPreviousDraw?.draw_name}{" "}
                      ({latestPreviousDraw?.draw_code}) draw result from{" "}
                      {latestPreviousDraw?.draw_date}.
                    </Typography>
                  )}
                </Box>
              </Box>

              {latestPreviousDraw && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Button
                    component={Link}
                    href={`/lottery/${latestPreviousDraw.lottery_code.toLowerCase()}/${encodeURIComponent(latestPreviousDraw.draw_date)}`}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: "#92400E",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      px: { xs: 2.5, sm: 4 },
                      py: 1.35,
                      borderRadius: "12px",
                      fontSize: { xs: "0.875rem", sm: "0.975rem" },
                      "&:hover": { bgcolor: "#B45309" },
                    }}
                  >
                    View Full Breakdown for {latestPreviousDraw.draw_date}
                  </Button>

                  <Button
                    component={Link}
                    href={`/lottery/${latestPreviousDraw.lottery_code.toLowerCase()}`}
                    variant="outlined"
                    sx={{
                      borderColor: "#92400E",
                      color: "#92400E",
                      fontWeight: 700,
                      px: 3,
                      py: 1.35,
                      borderRadius: "12px",
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    }}
                  >
                    View All {latestPreviousDraw.draw_name} Archives
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Social Media Share Component */}
      {/* <ShareButtons
        title="Kerala Lottery Result Today - Live 3:10 PM Draw & Ticket Checker"
        text="Check today's Kerala State Lottery results live & verify winning ticket numbers instantly!"
      /> */}

      {/* Weekly Lottery Schedule Section */}
      <Box id="schedule" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#111827",
            mb: 0.5,
            fontSize: { xs: "1.35rem", sm: "1.875rem", lg: "2.25rem" },
          }}
        >
          Weekly Lottery Schedule
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6B7280",
            mb: 3.5,
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Daily draws conducted by the Kerala State Lotteries Department.
        </Typography>

        <Grid container spacing={{ xs: 2.5, sm: 3 }}>
          {WEEKLY_LOTTERIES.map((item) => {
            const isActiveToday =
              item.day.toLowerCase() === todayDayName.toLowerCase();
            const badgeStyle = getBadgeStyle(item.day);
            const latestDraw = recentDrawsMap[item.code];

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.code}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: isActiveToday
                      ? "2px solid #0F5A24"
                      : "1px solid #E5E7EB",
                    bgcolor: "#FFFFFF",
                    boxShadow: isActiveToday
                      ? "0 8px 22px rgba(15, 90, 36, 0.12)"
                      : "0 2px 10px rgba(0,0,0,0.03)",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "#0F5A24",
                      boxShadow: "0 10px 24px rgba(15, 90, 36, 0.16)",
                    },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={`/lottery/${item.code.toLowerCase()}`}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      justifyContent: "space-between",
                      p: 0,
                    }}
                  >
                    <CardContent sx={{ p: 2.5, width: "100%" }}>
                      {/* Top Row: Day Status Chip & Code Pill */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={
                            isActiveToday
                              ? hasTodayResult
                                ? `${item.day} • Published`
                                : `${item.day} • Draws Today`
                              : item.day
                          }
                          size="small"
                          sx={{
                            ...badgeStyle,
                            fontWeight: 800,
                            fontSize: "0.725rem",
                            borderRadius: "12px",
                            px: 1,
                          }}
                        />

                        <Chip
                          label={item.code}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            bgcolor: "#E0F2FE",
                            color: "#0369A1",
                            borderRadius: "8px",
                            fontSize: "0.725rem",
                            height: 22,
                            px: 0.5,
                          }}
                        />
                      </Box>

                      {/* Main Title & Draw Time */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color: isActiveToday ? "#0F5A24" : "#111827",
                          mb: 0.5,
                          fontSize: "1.25rem",
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "#6B7280",
                          fontWeight: 600,
                          display: "block",
                          mb: 2,
                        }}
                      >
                        Draw: 3:00 PM
                      </Typography>

                      {/* Previous Draw / 1st Prize Winner Highlight Box */}
                      {latestDraw ? (
                        latestDraw.draw_date === todayISTDate ? (
                          <Box
                            sx={{
                              bgcolor: "#DCFCE7",
                              p: 1.5,
                              borderRadius: "10px",
                              border: "1px solid #86EFAC",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#15803D",
                                  fontWeight: 800,
                                  fontSize: "0.68rem",
                                }}
                              >
                                TODAY&apos;S RESULT PUBLISHED
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#15803D",
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                }}
                              >
                                {latestDraw.draw_date}
                              </Typography>
                            </Box>
                            {/* Mobile View: Redirect button / instruction text instead of direct ticket */}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: "#15803D",
                                fontSize: "0.775rem",
                                display: { xs: "block", md: "none" },
                              }}
                            >
                              Search ticket or tap to view result →
                            </Typography>
                            {/* Desktop View: Keep direct 1st prize ticket */}
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 900,
                                color: "#0F5A24",
                                letterSpacing: "0.03em",
                                display: { xs: "none", md: "block" },
                              }}
                            >
                              {latestDraw.first?.ticket || "N/A"}
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              bgcolor: "#FEF3C7",
                              p: 1.5,
                              borderRadius: "10px",
                              border: "1px solid #FDE68A",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#B45309",
                                  fontWeight: 800,
                                  fontSize: "0.68rem",
                                }}
                              >
                                LATEST 1ST PRIZE
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#B45309",
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                }}
                              >
                                {latestDraw.draw_date}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 900,
                                color: "#92400E",
                                letterSpacing: "0.03em",
                              }}
                            >
                              {latestDraw.first?.ticket || "N/A"}
                            </Typography>
                          </Box>
                        )
                      ) : (
                        <Box
                          sx={{
                            bgcolor: "#F9FAFB",
                            p: 1.5,
                            borderRadius: "10px",
                            border: "1px solid #F3F4F6",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#6B7280",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Archive Available • Daily 3:10 PM Updates
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    {/* Bottom Action Footer */}
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid #F3F4F6",
                        bgcolor: "#FAFAFA",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#0F5A24",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                        }}
                      >
                        View Archives & Results
                      </Typography>
                      <ArrowForwardIcon
                        sx={{ color: "#0F5A24", fontSize: 16 }}
                      />
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* SEO Content Section */}
      <Box sx={{ mt: 6, mb: 4, pt: 4, borderTop: "1px solid #E5E7EB" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#111827", mb: 2 }}
        >
          Kerala Lottery Results Today – Live Winning Numbers, Prize List & Full
          Draw Details
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          If you're searching for the kerala lottery results today, you've
          landed on the right page. This site publishes the kerala lottery
          result today the moment the official draw closes, so you never have to
          dig through old posts to find your kerala lottery results today
          result. Whether you're tracking today kerala lottery result for a
          routine weekly draw or the kerala lottery ticket result today for a
          specific series, everything here is organised by date, draw name and
          prize tier.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          When Does the Draw Go Live?
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          The lottery result today kerala telecast begins at 2:55 PM on Kairali
          TV, Kaumudy TV and Jai Hind TV, and the full today's kerala lottery
          result sheet — first prize down to consolation — is usually finalised
          between 3:00 PM and 4:30 PM. Our today lottery result kerala table
          refreshes automatically as the Directorate confirms each tier, so the
          kerala result today lottery list you see is always the verified,
          official one.
          <br />
          <br />
          We track the kerala lottery today result and kerala lottery today
          results every day of the week, so the kerala lottery results today
          3.00 pm live update is never more than a few minutes old. For readers
          outside Kerala, the kerala state lottery result today page loads the
          same information as the in-state broadcast.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          Today's Draw, by Lottery Name
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          Kerala runs a different lottery each day. The win win lottery result
          today kerala publishes every Monday, Tuesday belongs to kerala lottery
          result today sthree sakthi, Wednesday to kerala lottery result today
          karunya plus, and Thursday to kerala lottery result today nirmal.
          Friday is kerala lottery result today karunya, and Saturday brings
          kerala lottery result today fifty fifty, also written as fifty fifty
          lottery result today kerala. Sunday rounds out the week with Pournami.
          <br />
          <br />
          Six seasonal bumpers run through the year too, each with its own page
          under kerala lottery result today bumper — including the festive
          kerala lottery result today pooja bumper, which usually carries the
          year's largest jackpot.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          Checking Your Ticket
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          To find the lottery result kerala today for your ticket, use the
          search bar or browse by draw name — the same shortcut works whether
          you typed kerala lottery result on today, today result kerala lottery,
          or today kerala lottery results. Readers who search www kerala lottery
          result today or www kerala lottery results today land on the same live
          table; there's no separate "official" mirror.
          <br />
          <br />
          One honest note: we don't publish a kerala lottery result today
          guessing number. Kerala's draw uses a mechanical Lottis machine, and
          no chart or kerala lottery result today guessing system can predict
          it. What we provide is the confirmed kerala lottery results today live
          results today feed, cross-checked against the government gazette.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          Jackpots and Big Wins
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          The number one thing readers want is the kerala lottery result today
          jackpot, and we lead every page with it. You'll find the kerala
          lottery jackpot result today, the kerala jackpot lottery result today,
          and the jackpot kerala lottery result today figure right at the top of
          today's card. For the biggest draws, our kerala lottery bumper result
          today coverage breaks the jackpot down prize-tier by district, so
          winners can confirm their ticket without the full gazette PDF.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          Why Check Here
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          Between the live kerala lottery result today feed, the by-draw
          archive, and the lottery results today kerala search tool, this page
          answers one question fast: did I win, and how much? That's the whole
          point of publishing the kerala lottery results today the way we do.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          One Page, Every Version of the Search
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}
        >
          Everyone phrases the same search differently, so this page answers all
          of them from one live feed. Whether you typed kerala lottery result
          today result for double confirmation, or searched kerala lottery
          result live today, today kerala lottery result live, or kerala lottery
          today result live, you land on the same table. Older phrasing like
          today lottery results kerala and kerala lottery today results live
          today pulls up the identical kerala state lottery results today feed.
          Even a query like lottery result today kerala lottery result today, or
          the shorter lottery result today kerala lottery result, resolves here.
          And if Monday brought you here, the kerala lottery result today win
          win numbers sit at the top of today's card.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          A Note on Accuracy
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4B5563", mb: 0, lineHeight: 1.7 }}
        >
          Every number on this page is pulled from the official gazette
          published by the Directorate of Kerala State Lotteries, not copied
          from a broadcast transcript or a third-party forum. Draw numbers,
          ticket series and prize amounts are checked twice before publishing,
          and any correction issued by the department after a draw is reflected
          here within minutes. If a figure ever looks off, treat the printed
          gazette as the final word and use this page as a fast pointer to it,
          not a replacement for it.
          <br />
          <br />
          <em>
            Results are published for informational purposes. Always verify
            winning numbers against the official Kerala State Lotteries gazette
            before making any prize claim.
          </em>
        </Typography>
      </Box>

      {/* Ticket Search Result Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: "16px", m: { xs: 2, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#0F5A24",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          <CelebrationIcon sx={{ color: "#FFC107" }} /> Search Results for{" "}
          {heroSlideIndex === 0
            ? `${todayLottery.name} (${todayLottery.code})`
            : `${latestPreviousDraw?.draw_name || "Previous Draw"} (${latestPreviousDraw?.draw_code || ""})`}
          : &quot;{searchedQuery}&quot;
        </DialogTitle>
        <DialogContent dividers>
          {searchResults && searchResults.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert
                severity="success"
                sx={{ fontWeight: 700, borderRadius: "12px" }}
              >
                🎉 CONGRATULATIONS! Matching winning ticket found in{" "}
                {heroSlideIndex === 0
                  ? todayLottery.name
                  : latestPreviousDraw?.draw_name || "lottery"}{" "}
                draw!
              </Alert>

              {searchResults.map((match, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: "12px",
                    bgcolor: "#F9FAFB",
                    border: "1px solid #A5D6A7",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, color: "#0F5A24" }}
                  >
                    {match.prize_tier}{" "}
                    {match.prize_amount ? `(${match.prize_amount})` : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", mt: 0.5 }}
                  >
                    <strong>Draw:</strong> {match.draw_name} ({match.draw_code})
                    on {match.draw_date}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", mt: 0.5 }}
                  >
                    <strong>Matching Ticket Number:</strong>{" "}
                    <Chip
                      label={match.ticket_matched}
                      size="small"
                      color="primary"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "monospace",
                        borderRadius: "8px",
                      }}
                    />
                  </Typography>

                  <Button
                    component={Link}
                    href={`/lottery/${match.lottery_code.toLowerCase()}/${encodeURIComponent(match.draw_date)}`}
                    size="small"
                    sx={{ mt: 1.5, fontWeight: 700, color: "#0F5A24" }}
                  >
                    View Full Draw Breakdown →
                  </Button>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#4B5563", mb: 1 }}>
                No Winning Match Found for{" "}
                {heroSlideIndex === 0
                  ? `${todayLottery.name} (${todayLottery.code})`
                  : `${latestPreviousDraw?.draw_name || "Previous Draw"} (${latestPreviousDraw?.draw_code || ""})`}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Ticket &quot;{searchedQuery}&quot; did not match any winning
                ticket for{" "}
                {heroSlideIndex === 0
                  ? `${todayLottery.name} (${todayLottery.code})`
                  : `${latestPreviousDraw?.draw_name} (${latestPreviousDraw?.draw_code}) draw from ${latestPreviousDraw?.draw_date}`}
                . Please double-check your ticket number.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenModal(false)}
            variant="contained"
            sx={{ bgcolor: "#0F5A24", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
