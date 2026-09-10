"use client";

import React, { useEffect, useState, useRef } from "react";
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
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";
import MicIcon from "@mui/icons-material/Mic";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CelebrationIcon from "@mui/icons-material/Celebration";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PlaceIcon from "@mui/icons-material/Place";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SecurityIcon from "@mui/icons-material/Security";
import confetti from "canvas-confetti";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  ALL_LOTTERIES,
  StructuredDrawResult,
  FirstPrize,
  PrizeData,
  PostponedDraw,
  getLotteryUrl,
  supabase,
  formatTicketSearchInput,
  hasAnyDrawResult,
  calculateDrawCountdown,
  getIsAfterDrawTime,
  getIsPollingWindow,
  getDrawTimeDisplay,
} from "@/lib/supabase";
import ShareButtons from "@/components/ShareButtons";
import AiSocialDigestModal from "@/components/AiSocialDigestModal";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const searchSchema = yup.object({
  ticketNumber: yup
    .string()
    .required("Please enter a ticket number or last 4 digits")
    .test(
      "min-digits",
      "Please enter at least 4 digits (e.g. 6429, 136429, or MJ 136429)",
      (val) => Boolean(val && val.replace(/\D/g, "").length >= 4),
    ),
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

export interface LotteryItem {
  day: string;
  name: string;
  nameMl: string;
  code: string;
  is_bumper?: boolean;
  drawTime?: string;
  jackpot?: string;
  ticket_price?: string;
  draw_season?: string;
  draw_date?: string;
}

export default function HomePage() {
  const [todayLottery, setTodayLottery] = useState<LotteryItem>(
    WEEKLY_LOTTERIES[0],
  );
  const [lotteriesList, setLotteriesList] =
    useState<LotteryItem[]>(WEEKLY_LOTTERIES);
  const [bumperLotteriesList, setBumperLotteriesList] = useState<LotteryItem[]>(
    BUMPER_LOTTERIES as any,
  );
  const [todayDayName, setTodayDayName] = useState("Sunday");
  const [isTodayBumper, setIsTodayBumper] = useState(false);
  const isTodayBumperRef = useRef(false);
  const [todayBumperInfo, setTodayBumperInfo] = useState<any>(null);
  const [todayDrawResult, setTodayDrawResult] =
    useState<StructuredDrawResult | null>(null);
  const [todayPostponement, setTodayPostponement] =
    useState<PostponedDraw | null>(null);

  const [searchResults, setSearchResults] = useState<SearchMatch[] | null>(
    null,
  );
  const [searchedQuery, setSearchedQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [digestModalOpen, setDigestModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeNotification, setRealtimeNotification] = useState<
    string | null
  >(null);
  const [recentDrawsMap, setRecentDrawsMap] = useState<
    Record<string, StructuredDrawResult>
  >({});
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [latestPreviousDraw, setLatestPreviousDraw] =
    useState<StructuredDrawResult | null>(null);
  const [isAfter3PM, setIsAfter3PM] = useState(false);
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "live_updating"
  >("connecting");
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isDrawPassed: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isDrawPassed: false,
  });

  const todayISTDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const yesterdayISTDate = (() => {
    try {
      const now = new Date();
      const istDate = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      );
      istDate.setDate(istDate.getDate() - 1);
      const year = istDate.getFullYear();
      const month = String(istDate.getMonth() + 1).padStart(2, "0");
      const day = String(istDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  })();

  const {
    register,
    handleSubmit,
    setValue,
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

    const updateCountdown = () => {
      try {
        const bumper = isTodayBumperRef.current;
        setIsAfter3PM(getIsAfterDrawTime(bumper));
        const cd = calculateDrawCountdown(bumper);
        setCountdown(cd);
      } catch {
        setIsAfter3PM(false);
        setCountdown({ hours: 0, minutes: 0, seconds: 0, isDrawPassed: true });
      }
    };
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    const timeInterval = setInterval(updateCountdown, 15000);

    async function loadLotteriesFromDb() {
      try {
        const { data, error } = await supabase
          .from("lotteries")
          .select("*")
          .order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          const weeklyMapped = data
            .map((d: any) => ({
              day: d.day,
              name: d.name,
              nameMl: d.name_ml || d.name,
              code: d.code,
              drawTime: d.draw_time || "3:00 PM",
              is_bumper: d.is_bumper ?? d.day.toLowerCase().includes("bumper"),
            }))
            .filter(
              (l: any) =>
                !l.is_bumper && !l.day.toLowerCase().includes("bumper"),
            );

          // Check if today is a scheduled Bumper Lottery draw day
          const todayBumper = data.find(
            (d: any) =>
              (d.is_bumper ||
                (d.day && d.day.toLowerCase().includes("bumper"))) &&
              d.draw_date === todayISTDate,
          );

          if (todayBumper) {
            isTodayBumperRef.current = true;
            setIsTodayBumper(true);
            setTodayBumperInfo(todayBumper);
            setTodayLottery({
              day: todayBumper.day || "Bumper Draw",
              name: todayBumper.name,
              nameMl: todayBumper.name_ml || todayBumper.name,
              code: todayBumper.code,
              drawTime: todayBumper.draw_time || "2:00 PM",
              is_bumper: true,
              jackpot: todayBumper.jackpot || "₹25 Crore",
              ticket_price: todayBumper.ticket_price || "₹500",
              draw_season: todayBumper.draw_season || todayBumper.day,
            });
            checkTodayData(todayBumper.code);
          } else if (weeklyMapped.length > 0) {
            isTodayBumperRef.current = false;
            setIsTodayBumper(false);
            setTodayBumperInfo(null);
            setLotteriesList(weeklyMapped);
            const matchedDb =
              weeklyMapped.find(
                (l: any) => l.day.toLowerCase() === istDayName.toLowerCase(),
              ) ||
              weeklyMapped[0] ||
              WEEKLY_LOTTERIES[0];
            setTodayLottery(matchedDb);
            checkTodayData(matchedDb.code);
          }

          const bumperMapped = data
            .map((d: any) => ({
              day: d.day,
              name: d.name,
              nameMl: d.name_ml || d.name,
              code: d.code,
              drawTime: d.draw_time || "2:00 PM",
              is_bumper: d.is_bumper ?? d.day.toLowerCase().includes("bumper"),
              jackpot:
                d.jackpot ||
                BUMPER_LOTTERIES.find((b) => b.code === d.code)?.jackpot ||
                "₹10 Crore",
              draw_season:
                d.draw_season ||
                BUMPER_LOTTERIES.find((b) => b.code === d.code)?.draw_season ||
                d.day,
              draw_date: d.draw_date || undefined,
              ticket_price: d.ticket_price || undefined,
            }))
            .filter(
              (l: any) => l.is_bumper || l.day.toLowerCase().includes("bumper"),
            );

          if (bumperMapped.length > 0) {
            const monthOrder = ["XN", "SB", "VB", "MB", "TH", "PB"];
            bumperMapped.sort((a: any, b: any) => {
              const ai = monthOrder.indexOf(a.code);
              const bi = monthOrder.indexOf(b.code);
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            });
            setBumperLotteriesList(bumperMapped);
          }
        }
      } catch (e) {
        console.warn("Error fetching lotteries:", e);
      }
    }
    loadLotteriesFromDb();

    // Dynamic reference for today's lottery code to avoid stale closures in socket callbacks
    let currentTodayCode = matched.code;

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

    async function checkTodayPostponement() {
      try {
        const res = await fetch(
          `/api/draws?type=postponed&date=${todayISTDate}&t=${Date.now()}`,
        );
        const json = await res.json();
        if (json.success && json.list && json.list.length > 0) {
          // If today is a Bumper day, only apply postponement if it targets this bumper or ALL
          const validPostpone = json.list.find(
            (p: PostponedDraw) =>
              p.lottery_code === "ALL" ||
              (todayBumperInfo
                ? p.lottery_code === todayBumperInfo.code
                : true),
          );
          setTodayPostponement(validPostpone || null);
        } else {
          setTodayPostponement(null);
        }
      } catch {
        setTodayPostponement(null);
      }
    }

    async function checkTodayData(codeToFetch?: string) {
      try {
        const targetCode = codeToFetch || currentTodayCode;
        const res = await fetch(
          `/api/draws?code=${targetCode}&date=${todayISTDate}&t=${Date.now()}`,
        );
        const json = await res.json();
        if (
          json.success &&
          json.result &&
          json.result.draw_date === todayISTDate &&
          hasAnyDrawResult(json.result)
        ) {
          setTodayDrawResult(json.result);
          // Auto-switch hero banner to Today's Draw when today's result arrives
          setHeroSlideIndex(0);
        } else if (!json.result || !hasAnyDrawResult(json.result)) {
          setTodayDrawResult(null);
        }
      } catch {
        // Keep existing data on transient fetch failure
      }
    }

    async function loadRecentDrawsMap() {
      try {
        const res = await fetch(`/api/draws?type=all&t=${Date.now()}`);
        const json = await res.json();
        if (
          json.success &&
          Array.isArray(json.results) &&
          json.results.length > 0
        ) {
          const todayDate = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });
          // Previous draw is the most recent draw published prior to todayDate (or json.results[0] if today is not published)
          const prevDraw =
            json.results.find(
              (d: StructuredDrawResult) => d.draw_date !== todayDate,
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

    Promise.all([
      checkTodayData(),
      loadRecentDrawsMap(),
      checkTodayPostponement(),
    ]).finally(() => {
      setIsLoading(false);
    });

    // Helper to refresh all today data
    const refreshAllLiveData = () => {
      checkTodayData();
      loadRecentDrawsMap();
      checkTodayPostponement();
    };

    // Live Supabase WebSocket connection with unique channel name
    const channelName = `realtime-web-home-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draw_results" },
        (payload) => {
          if (payload.new) {
            const newRow = payload.new as any;
            if (newRow.draw_date === todayISTDate) {
              setRealtimeNotification(
                `🎉 Live Update: ${newRow.draw_name || "Lottery"} (${newRow.draw_code || ""}) updated for today!`,
              );
              // Auto-focus Hero Banner to Today's Draw on live result stream
              setHeroSlideIndex(0);
              setSocketStatus("live_updating");
              setTimeout(() => setSocketStatus("connected"), 4000);

              // Immediately hydrate state from socket payload
              try {
                let firstObj: FirstPrize = {};
                let prizesObj: PrizeData = {};
                firstObj =
                  typeof newRow.first_prize === "string"
                    ? JSON.parse(newRow.first_prize)
                    : newRow.first_prize || {};
                prizesObj =
                  typeof newRow.prizes === "string"
                    ? JSON.parse(newRow.prizes)
                    : newRow.prizes || {};

                const liveStructuredDraw: StructuredDrawResult = {
                  id: newRow.id,
                  draw_date: newRow.draw_date,
                  draw_name: newRow.draw_name,
                  draw_code: newRow.draw_code,
                  lottery_code: newRow.lottery_code,
                  first: firstObj,
                  prizes: prizesObj,
                  created_at: newRow.created_at,
                };
                if (hasAnyDrawResult(liveStructuredDraw)) {
                  setTodayDrawResult(liveStructuredDraw);
                }
              } catch (e) {
                console.warn("Failed to parse live socket row payload:", e);
              }
            }
          }
          refreshAllLiveData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postponed_draws" },
        () => {
          checkTodayPostponement();
          checkTodayData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lotteries" },
        () => {
          loadLotteriesFromDb();
          checkTodayData();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setSocketStatus("connected");
          console.log("[Supabase Socket] Subscribed to live draw_results updates.");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setSocketStatus("connecting");
        }
      });

    // Intelligent Polling Timer: Poll every 15s during draw window or while result is pending/live
    const pollInterval = setInterval(() => {
      try {
        if (getIsPollingWindow(isTodayBumperRef.current) || !todayDrawResult) {
          refreshAllLiveData();
        }
      } catch {}
    }, 15000);

    // Browser Visibility / Window Focus listeners for instant live updates
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateCountdown();
        refreshAllLiveData();
      }
    };
    const handleWindowFocus = () => {
      updateCountdown();
      refreshAllLiveData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(countdownInterval);
      clearInterval(timeInterval);
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#0B3C5D", "#FFC107", "#E67E22", "#3B82F6", "#EC4899"],
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
      heroSlideIndex === 0 ? todayISTDate : latestPreviousDraw?.draw_date;

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
        bgcolor: "#EBF5FF",
        color: "#0B3C5D",
        border: "1px solid #BFDBFE",
      };
    }
    if (day === "Saturday" || day === "Sunday") {
      return { bgcolor: "#FEF3C7", color: "#D97706" };
    }
    return { bgcolor: "#F3F4F6", color: "#4B5563" };
  };

  const hasTodayResult =
    !!todayDrawResult &&
    todayDrawResult.draw_date === todayISTDate &&
    hasAnyDrawResult(todayDrawResult);

  const renderWinningNumbers = (
    draw: StructuredDrawResult,
    isToday: boolean,
  ) => {
    const hasResults = hasAnyDrawResult(draw);
    if (!hasResults) return null;

    const prizeTiers = [
      { key: "consolation", label: "Consolation Prize", badgeBg: "#7F8C8D" },
      { key: "2nd", label: "2nd Prize", badgeBg: "#D4AF37" },
      { key: "3rd", label: "3rd Prize", badgeBg: "#2980B9" },
      { key: "4th", label: "4th Prize", badgeBg: "#8E44AD" },
      { key: "5th", label: "5th Prize", badgeBg: "#2C3E50" },
      { key: "6th", label: "6th Prize", badgeBg: "#16A085" },
      { key: "7th", label: "7th Prize", badgeBg: "#D35400" },
      { key: "8th", label: "8th Prize", badgeBg: "#C0392B" },
      { key: "9th", label: "9th Prize", badgeBg: "#7F8C8D" },
    ];

    const hasLocation =
      draw.first?.location &&
      draw.first.location.toLowerCase() !== "n/a" &&
      draw.first.location.toLowerCase() !== "nan" &&
      draw.first.location.toLowerCase() !== "null";

    const hasAgent =
      draw.first?.agent &&
      draw.first.agent.toLowerCase() !== "n/a" &&
      draw.first.agent.toLowerCase() !== "nan" &&
      draw.first.agent.toLowerCase() !== "null";

    return (
      <Box
        sx={{
          display: "block",
          mt: 3,
          pt: 3,
          borderTop: "1px solid #E5E7EB",
          width: "100%",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: "#111827", mb: 2 }}
        >
          Winning Numbers
        </Typography>

        {/* 1st Prize Winner details card */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 15px rgba(11, 60, 93, 0.2)",
          }}
        >
          <Chip
            icon={
              <EmojiEventsIcon
                sx={{
                  color: "#D97706 !important",
                  fontSize: "14px !important",
                }}
              />
            }
            label={
              draw.first?.ticket
                ? "1ST PRIZE WINNER"
                : isToday
                ? "1ST PRIZE (DRAWING...)"
                : "1ST PRIZE"
            }
            size="small"
            sx={{
              bgcolor: "#FEF3C7",
              color: "#92400E",
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
            {draw.first?.ticket || (isToday ? "LIVE IN PROGRESS" : "N/A")}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, opacity: 0.95, mb: 1.5 }}
          >
            Prize: {draw.prizes?.amounts?.["1st"] || "₹70 Lakhs"}
          </Typography>

          {(hasLocation || hasAgent) && (
            <Box
              sx={{
                display: "flex",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                pt: 1.5,
                gap: 2,
              }}
            >
              {hasLocation && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      display: "block",
                    }}
                  >
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {draw.first?.location}
                  </Typography>
                </Box>
              )}
              {hasAgent && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      display: "block",
                    }}
                  >
                    Agent
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {draw.first?.agent}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Other Prize Tiers */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {prizeTiers.map(({ key, label, badgeBg }) => {
            const numbers = draw.prizes?.[
              key as keyof typeof draw.prizes
            ] as string[] | undefined;
            const amount = draw.prizes?.amounts?.[key];

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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: badgeBg,
                      }}
                    />
                    {label}
                  </Typography>
                  {amount && (
                    <Chip
                      label={`Prize: ${amount}`}
                      size="small"
                      sx={{
                        bgcolor: "#F3F4F6",
                        color: "#374151",
                        fontWeight: 700,
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.25,
                    justifyContent: "flex-start",
                  }}
                >
                  {numbers.map((num, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: {
                          xs: "calc(50% - 6px)",
                          sm: "calc(33.33% - 8px)",
                          md: "calc(20% - 10px)",
                          lg: "calc(16.66% - 11px)",
                          xl: "calc(12.5% - 11px)",
                        },
                        px: 1.5,
                        py: 1,
                        borderRadius: "8px",
                        bgcolor: "#FFFFFF",
                        border: "1.5px solid #E2E8F0",
                        color: "#0F172A",
                        fontWeight: 900,
                        fontSize: "0.9rem",
                        textAlign: "center",
                        boxSizing: "border-box",
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
    );
  };

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
          bgcolor:
            isTodayBumper && heroSlideIndex === 0 ? "#FFFDF0" : "#F4F6F8",
          border:
            isTodayBumper && heroSlideIndex === 0
              ? "2px solid #F59E0B"
              : "1px solid #E5E7EB",
          boxShadow:
            isTodayBumper && heroSlideIndex === 0
              ? "0 12px 35px rgba(245, 158, 11, 0.2)"
              : "none",
          mb: { xs: 4, sm: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isLoading && (
          <Grid
            container
            spacing={4}
            sx={{ position: "relative", zIndex: 1, alignItems: "center" }}
          >
            {/* Left Content Skeleton */}
            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={28}
                  sx={{ borderRadius: "20px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={28}
                  sx={{ borderRadius: "20px" }}
                />
              </Box>
              <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="85%" height={20} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 4 }} />

              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Skeleton
                  variant="rounded"
                  width={260}
                  height={44}
                  sx={{ borderRadius: "8px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={120}
                  height={44}
                  sx={{ borderRadius: "8px" }}
                />
              </Box>
              <Skeleton
                variant="rounded"
                width={200}
                height={36}
                sx={{ borderRadius: "8px" }}
              />
            </Grid>

            {/* Right Winner Card Skeleton (Desktop only) */}
            <Grid
              size={{ xs: 12, md: 5, lg: 4 }}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Skeleton
                  variant="rounded"
                  width={160}
                  height={24}
                  sx={{ borderRadius: "12px", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  height={16}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={48}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  height={20}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={36}
                  sx={{ borderRadius: "8px" }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Carousel Tab Switcher at Top of Hero Container */}
        <Box
          sx={{
            display: isLoading ? "none" : "flex",
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
                bgcolor: heroSlideIndex === 0 ? "#0B3C5D" : "#FFFFFF",
                color: heroSlideIndex === 0 ? "#FFFFFF" : "#374151",
                borderColor: heroSlideIndex === 0 ? "#0B3C5D" : "#E5E7EB",
                fontWeight: 800,
                borderRadius: "20px",
                px: { xs: 1.5, sm: 2.5 },
                py: 0.75,
                fontSize: { xs: "0.725rem", sm: "0.825rem" },
                "&:hover": {
                  bgcolor: heroSlideIndex === 0 ? "#0F2C59" : "#F3F4F6",
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Today&apos;s Draw ({todayLottery.name} {todayLottery.code})
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Today ({todayLottery.code})
              </Box>
            </Button>

            <Button
              size="small"
              onClick={() => setHeroSlideIndex(1)}
              variant={heroSlideIndex === 1 ? "contained" : "outlined"}
              startIcon={<EmojiEventsIcon fontSize="small" />}
              sx={{
                bgcolor: heroSlideIndex === 1 ? "#0B3C5D" : "#FFFFFF",
                color: heroSlideIndex === 1 ? "#FFFFFF" : "#374151",
                borderColor: heroSlideIndex === 1 ? "#0B3C5D" : "#E5E7EB",
                fontWeight: 800,
                borderRadius: "20px",
                px: { xs: 1.5, sm: 2.5 },
                py: 0.75,
                fontSize: { xs: "0.725rem", sm: "0.825rem" },
                "&:hover": {
                  bgcolor: heroSlideIndex === 1 ? "#0F2C59" : "#F3F4F6",
                },
              }}
            >
              {latestPreviousDraw ? (
                latestPreviousDraw.draw_date === yesterdayISTDate ? (
                  <>
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Yesterday&apos;s Result ({latestPreviousDraw.draw_date})
                    </Box>
                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      Yesterday ({latestPreviousDraw.lottery_code || latestPreviousDraw.draw_code?.split("-")[0] || latestPreviousDraw.draw_date.split("-").slice(1).join("/")})
                    </Box>
                  </>
                ) : (
                  <>
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Previous Result ({latestPreviousDraw.draw_date})
                    </Box>
                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      Previous ({latestPreviousDraw.draw_date.split("-").slice(1).join("/")})
                    </Box>
                  </>
                )
              ) : (
                "Previous Result"
              )}
            </Button>
          </Box>

          {/* Carousel Slide Indicators & Arrows */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "#6B7280", fontWeight: 700, fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
            >
              {heroSlideIndex === 0
                ? "1 of 2: Today"
                : latestPreviousDraw?.draw_date === yesterdayISTDate
                  ? "2 of 2: Yesterday"
                  : `2 of 2: Prev (${latestPreviousDraw?.draw_date ? latestPreviousDraw.draw_date.split("-").slice(1).join("/") : "Draw"})`}
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
        {!isLoading && heroSlideIndex === 0 && (
          <Box sx={{ width: "100%", position: "relative", zIndex: 1 }}>
            <Box sx={{ width: "100%" }}>
              {/* Badges Row with Live Realtime Status Pill */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {isTodayBumper ? (
                  <Chip
                    icon={
                      <AutoAwesomeIcon
                        sx={{ fontSize: "15px !important", color: "#B45309" }}
                      />
                    }
                    label="👑 KERALA BUMPER LOTTERY DRAW TODAY"
                    sx={{
                      bgcolor: "#FEF3C7",
                      color: "#92400E",
                      fontWeight: 900,
                      fontSize: { xs: "0.725rem", sm: "0.8rem" },
                      borderRadius: "20px",
                      px: 1.5,
                      py: 0.35,
                      border: "1.5px solid #F59E0B",
                      boxShadow: "0 2px 10px rgba(245, 158, 11, 0.25)",
                    }}
                  />
                ) : todayPostponement ? (
                  <Chip
                    icon={
                      <EventBusyIcon
                        sx={{ fontSize: "14px !important", color: "#DC2626" }}
                      />
                    }
                    label={`DRAW ${todayPostponement.status.toUpperCase()} TODAY`}
                    sx={{
                      bgcolor: "#FEE2E2",
                      color: "#991B1B",
                      fontWeight: 800,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      borderRadius: "20px",
                      px: 1,
                      py: 0.25,
                      border: "1px solid #FCA5A5",
                    }}
                  />
                ) : hasTodayResult ? (
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
                      px: 1,
                      py: 0.25,
                    }}
                  />
                ) : (
                  <Chip
                    icon={
                      <AccessTimeIcon
                        sx={{
                          fontSize: "14px !important",
                          color: isAfter3PM ? "#1E40AF" : "#B45309",
                        }}
                      />
                    }
                    label={
                      isAfter3PM
                        ? "Drawing in Progress..."
                        : `Result Coming Soon (${todayLottery.drawTime || "3:00 PM"})`
                    }
                    sx={{
                      bgcolor: isAfter3PM ? "#EFF6FF" : "#FEF3C7",
                      color: isAfter3PM ? "#1E40AF" : "#92400E",
                      fontWeight: 800,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      borderRadius: "20px",
                      px: 1,
                      py: 0.25,
                      border: isAfter3PM
                        ? "1px solid #BFDBFE"
                        : "1px solid #FCD34D",
                    }}
                  />
                )}

                {/* Live Socket Connection / Streaming Indicator */}
                {socketStatus === "live_updating" ? (
                  <Chip
                    icon={
                      <AutoAwesomeIcon
                        sx={{
                          fontSize: "14px !important",
                          color: "#B45309",
                        }}
                      />
                    }
                    label="⚡ LIVE STREAMING NUMBERS..."
                    sx={{
                      bgcolor: "#FEF3C7",
                      color: "#92400E",
                      fontWeight: 900,
                      fontSize: { xs: "0.68rem", sm: "0.74rem" },
                      borderRadius: "20px",
                      px: 1,
                      py: 0.25,
                      border: "1.5px solid #F59E0B",
                      boxShadow: "0 0 10px rgba(245, 158, 11, 0.4)",
                    }}
                  />
                ) : socketStatus === "connected" ? (
                  <Chip
                    icon={
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#10B981",
                          boxShadow: "0 0 8px #10B981",
                          ml: 0.5,
                        }}
                      />
                    }
                    label="LIVE SYNC ACTIVE"
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#065F46",
                      fontWeight: 800,
                      fontSize: { xs: "0.66rem", sm: "0.72rem" },
                      borderRadius: "20px",
                      px: 0.8,
                      py: 0.25,
                      border: "1px solid #A7F3D0",
                    }}
                  />
                ) : null}
              </Box>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 900,
                  color: isTodayBumper ? "#78350F" : "#111827",
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

              {/* Gold Bumper Highlight Ribbons */}
              {isTodayBumper && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.2,
                    flexWrap: "wrap",
                    mb: 2,
                    mt: 1,
                  }}
                >
                  <Chip
                    icon={
                      <EmojiEventsIcon
                        sx={{ fontSize: "16px !important", color: "#FFFFFF" }}
                      />
                    }
                    label={`1ST PRIZE: ${todayLottery.jackpot || "₹25 Crore"}`}
                    sx={{
                      bgcolor: "#D97706",
                      color: "#FFFFFF",
                      fontWeight: 900,
                      fontSize: { xs: "0.775rem", sm: "0.875rem" },
                      borderRadius: "10px",
                      py: 1.8,
                      px: 0.8,
                      boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
                    }}
                  />
                  {todayLottery.ticket_price && (
                    <Chip
                      icon={
                        <ConfirmationNumberIcon
                          sx={{ fontSize: "15px !important", color: "#92400E" }}
                        />
                      }
                      label={`TICKET: ${todayLottery.ticket_price}`}
                      sx={{
                        bgcolor: "#FDE68A",
                        color: "#78350F",
                        fontWeight: 800,
                        fontSize: { xs: "0.775rem", sm: "0.85rem" },
                        borderRadius: "10px",
                        py: 1.8,
                        px: 0.8,
                        border: "1px solid #F59E0B",
                      }}
                    />
                  )}
                  <Chip
                    icon={
                      <AccessTimeIcon
                        sx={{ fontSize: "15px !important", color: "#92400E" }}
                      />
                    }
                    label={`DRAW TIME: ${todayLottery.drawTime || "2:00 PM"}`}
                    sx={{
                      bgcolor: "#FEF3C7",
                      color: "#78350F",
                      fontWeight: 800,
                      fontSize: { xs: "0.775rem", sm: "0.85rem" },
                      borderRadius: "10px",
                      py: 1.8,
                      px: 0.8,
                      border: "1px solid #FCD34D",
                    }}
                  />
                </Box>
              )}

              {/* Digital Countdown Timer Box (Active before draw starts) */}
              {!todayPostponement && !hasTodayResult && !countdown.isDrawPassed && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    my: 2,
                    p: { xs: 1.8, sm: 2.2 },
                    borderRadius: "18px",
                    bgcolor: isTodayBumper
                      ? "rgba(254, 243, 199, 0.75)"
                      : "rgba(239, 246, 255, 0.85)",
                    border: isTodayBumper
                      ? "1.5px solid #FCD34D"
                      : "1.5px solid #BFDBFE",
                    maxWidth: 460,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: isTodayBumper ? "#92400E" : "#1E40AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      ⏰ Live Draw Countdown ({todayLottery.drawTime || "3:00 PM"})
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "#6B7280",
                      }}
                    >
                      Official IST
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 1, sm: 1.2 },
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        bgcolor: "#FFFFFF",
                        py: 1.2,
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: "1.3rem", sm: "1.6rem" },
                          color: "#0B3C5D",
                          fontFamily: "monospace",
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.hours).padStart(2, "0")}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          mt: 0.4,
                        }}
                      >
                        Hours
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1.3rem",
                        color: "#9CA3AF",
                      }}
                    >
                      :
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        bgcolor: "#FFFFFF",
                        py: 1.2,
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: "1.3rem", sm: "1.6rem" },
                          color: "#0B3C5D",
                          fontFamily: "monospace",
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.minutes).padStart(2, "0")}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          mt: 0.4,
                        }}
                      >
                        Mins
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1.3rem",
                        color: "#9CA3AF",
                      }}
                    >
                      :
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        bgcolor: "#FFFFFF",
                        py: 1.2,
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: "1.3rem", sm: "1.6rem" },
                          color: "#E11D48",
                          fontFamily: "monospace",
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.seconds).padStart(2, "0")}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: "#E11D48",
                          textTransform: "uppercase",
                          mt: 0.4,
                        }}
                      >
                        Secs
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {todayPostponement ? (
                <Typography
                  variant="h6"
                  sx={{
                    color: "#DC2626",
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.3rem", lg: "1.6rem" },
                  }}
                >
                  Draw {todayPostponement.status.toUpperCase()} ({todayISTDate})
                </Typography>
              ) : hasTodayResult ? (
                <Typography
                  variant="h6"
                  sx={{
                    color: "#0B3C5D",
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.3rem", lg: "1.6rem" },
                  }}
                >
                  Drawn Today ({todayDrawResult.draw_date}),{" "}
                  {todayLottery.drawTime || "3:00 PM"}
                </Typography>
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    color: isTodayBumper
                      ? "#92400E"
                      : isAfter3PM
                        ? "#1E40AF"
                        : "#D97706",
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.3rem", lg: "1.6rem" },
                  }}
                >
                  {isTodayBumper
                    ? `Special Bumper Draw Scheduled Today at ${todayLottery.drawTime || "2:00 PM"} (No regular weekly draw today)`
                    : isAfter3PM
                      ? "Drawing is currently in progress..."
                      : "Draw Scheduled Today at 3:00 PM • Results Coming Soon"}
                </Typography>
              )}

              {todayPostponement ? (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 3,
                    borderRadius: "14px",
                    maxWidth: 600,
                    bgcolor: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    color: "#92400E",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, mb: 0.5 }}
                  >
                    📢 Public Notice: {todayPostponement.reason}
                  </Typography>
                  {todayPostponement.rescheduled_date && (
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      🗓️ Rescheduled Draw Date:{" "}
                      {todayPostponement.rescheduled_date}
                    </Typography>
                  )}
                </Alert>
              ) : (
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
                    : isAfter3PM
                      ? `Today's draw for ${todayLottery.name} ${todayLottery.code} is currently in progress. Results will update shortly.`
                      : `Today's draw for ${todayLottery.name} ${todayLottery.code} will take place at 3:00 PM. Full winning results will be published automatically at 3:10 PM.`}
                </Typography>
              )}

              {!todayPostponement &&
                isAfter3PM &&
                (!hasTodayResult || !todayDrawResult?.first?.ticket) && (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 3,
                      borderRadius: "12px",
                      fontWeight: 700,
                      bgcolor: "#EFF6FF",
                      color: "#1E40AF",
                      border: "1px solid #BFDBFE",
                      maxWidth: 600,
                      "& .MuiAlert-icon": {
                        color: "#3B82F6",
                      },
                    }}
                  >
                    Result will update shortly. Drawing is in progress...
                  </Alert>
                )}

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
                        {...register("ticketNumber", {
                          onChange: (e) => {
                            const formatted = formatTicketSearchInput(
                              e.target.value,
                            );
                            setValue("ticketNumber", formatted, {
                              shouldValidate: true,
                            });
                          },
                        })}
                        disabled={!hasTodayResult || isSearching}
                        placeholder={
                          hasTodayResult
                            ? `Enter ticket e.g. MJ 136429, 136429, or 6429 for ${todayLottery.name}...`
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
                      <Tooltip title="Direct Voice Search (സംസാരിച്ച് പരിശോധിക്കുക)">
                        <IconButton
                          size="small"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("open-ai-voice-assistant", {
                                detail: { startListening: true },
                              }),
                            );
                          }}
                          sx={{
                            color: "#DC2626",
                            bgcolor: "#FEF2F2",
                            p: 0.8,
                            mr: 0.5,
                            border: "1px solid #FECACA",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: "#FEE2E2",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <MicIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Button
                      type="submit"
                      disabled={!hasTodayResult || isSearching}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: hasTodayResult ? "#0B3C5D" : "#9CA3AF",
                        color: "#FFFFFF",
                        px: 3.5,
                        py: { xs: 1.2, sm: 1.35 },
                        borderRadius: { xs: "10px", sm: "12px" },
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        "&:hover": {
                          bgcolor: hasTodayResult ? "#0F2C59" : "#9CA3AF",
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
                      sx={{ color: "#0B3C5D", pl: 1, fontWeight: 600 }}
                    >
                      ✓ Live Checker active for {todayLottery.name} (
                      {todayLottery.code}) draw result.
                    </Typography>
                  )}
                </Box>

                {hasTodayResult &&
                  todayDrawResult &&
                  renderWinningNumbers(todayDrawResult, true)}
              </Box>
            </Box>
          </Box>
        )}

        {/* SLIDE 1: YESTERDAY'S / PREVIOUS DRAW RESULT */}
        {!isLoading && heroSlideIndex === 1 && (
          <Box sx={{ width: "100%", position: "relative", zIndex: 1 }}>
            <Box sx={{ width: "100%" }}>
              <Chip
                icon={
                  <EmojiEventsIcon
                    sx={{ fontSize: "14px !important", color: "#0B3C5D" }}
                  />
                }
                label={
                  latestPreviousDraw
                    ? latestPreviousDraw.draw_date === yesterdayISTDate
                      ? `Yesterday's Draw Result Published (${latestPreviousDraw.draw_date})`
                      : `Previous Draw Result Published (${latestPreviousDraw.draw_date})`
                    : "Previous Draw Result Published"
                }
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "#0B3C5D",
                  fontWeight: 800,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  borderRadius: "20px",
                  mb: 2,
                  px: 1,
                  py: 0.25,
                  border: "1px solid #BFDBFE",
                }}
              />

              <Typography
                variant="h3"
                component="h1"
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
                  color: "#0B3C5D",
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
                        : "1px solid #BFDBFE",
                      borderRadius: "16px",
                      boxShadow: "0 2px 10px rgba(11, 60, 93, 0.08)",
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
                          color: "#0B3C5D",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ConfirmationNumberIcon fontSize="small" />
                      </Box>
                      <TextField
                        {...register("ticketNumber", {
                          onChange: (e) => {
                            const formatted = formatTicketSearchInput(
                              e.target.value,
                            );
                            setValue("ticketNumber", formatted, {
                              shouldValidate: true,
                            });
                          },
                        })}
                        disabled={isSearching}
                        placeholder={`Enter ticket e.g. MJ 136429, 136429, or 6429 for ${latestPreviousDraw?.draw_name || "Previous Draw"}...`}
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
                        bgcolor: "#0B3C5D",
                        color: "#FFFFFF",
                        px: 3.5,
                        py: { xs: 1.2, sm: 1.35 },
                        borderRadius: { xs: "10px", sm: "12px" },
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        "&:hover": { bgcolor: "#0F2C59" },
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
                      sx={{ color: "#0B3C5D", pl: 1, fontWeight: 600 }}
                    >
                      ✓ Checking ticket against {latestPreviousDraw?.draw_name}{" "}
                      ({latestPreviousDraw?.draw_code}) draw result from{" "}
                      {latestPreviousDraw?.draw_date}.
                    </Typography>
                  )}
                </Box>
              </Box>

              {latestPreviousDraw &&
                renderWinningNumbers(latestPreviousDraw, false)}
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
      {!isTodayBumper && (
        <Box id="schedule" sx={{ mb: 6, display: { xs: "none", md: "block" } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#111827",
            mb: 0.5,
            fontSize: { xs: "1.35rem", sm: "1.875rem", lg: "2.25rem" },
          }}
        >
          Kerala Lottery Weekly Draw Schedule & Prizes
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6B7280",
            mb: 3.5,
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          The Kerala State Lottery Department runs seven different weekly
          lotteries. Match your ticket code and draw number using our official
          weekly schedule:
        </Typography>

        <Grid container spacing={{ xs: 2.5, sm: 3 }}>
          {isLoading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={n}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Skeleton variant="rounded" width={80} height={24} />
                      <Skeleton variant="rounded" width={40} height={24} />
                    </Box>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={32}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={24}
                      sx={{ mb: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={60}
                      sx={{ borderRadius: "8px" }}
                    />
                  </Paper>
                </Grid>
              ))
            : lotteriesList.map((item) => {
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
                          ? "2px solid #0B3C5D"
                          : "1px solid #E5E7EB",
                        bgcolor: "#FFFFFF",
                        boxShadow: isActiveToday
                          ? "0 8px 22px rgba(11, 60, 93, 0.12)"
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
                          borderColor: "#0B3C5D",
                          boxShadow: "0 10px 24px rgba(11, 60, 93, 0.16)",
                        },
                      }}
                    >
                      <CardActionArea
                        component={Link}
                        href={getLotteryUrl(item.code)}
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
                              color: isActiveToday ? "#0B3C5D" : "#111827",
                              mb: 0.2,
                              fontSize: "1.25rem",
                            }}
                          >
                            {item.name}
                          </Typography>

                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: isActiveToday ? "#2563EB" : "#4B5563",
                              mb: 0.5,
                              fontSize: "0.9rem",
                            }}
                          >
                            {item.nameMl}
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
                          {isActiveToday ? (
                            latestDraw &&
                            latestDraw.draw_date === todayISTDate &&
                            hasAnyDrawResult(latestDraw) &&
                            isAfter3PM ? (
                              <Box
                                sx={{
                                  bgcolor: "#EBF5FF",
                                  p: 1.5,
                                  borderRadius: "10px",
                                  border: "1px solid #BFDBFE",
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
                                      color: "#0B3C5D",
                                      fontWeight: 800,
                                      fontSize: "0.68rem",
                                    }}
                                  >
                                    TODAY&apos;S RESULT PUBLISHED
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#0B3C5D",
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
                                    color: "#0B3C5D",
                                    fontSize: "0.775rem",
                                    display: { xs: "block", md: "none" },
                                  }}
                                >
                                  Search ticket or tap to view result →
                                </Typography>
                                {/* Desktop View: Keep direct 1st prize ticket or Published badge */}
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontFamily: "monospace",
                                    fontWeight: 900,
                                    color: "#0B3C5D",
                                    letterSpacing: "0.03em",
                                    display: { xs: "none", md: "block" },
                                  }}
                                >
                                  {latestDraw.first?.ticket || "Results Live"}
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  bgcolor: "#FFFBEB",
                                  p: 1.5,
                                  borderRadius: "10px",
                                  border: "1px solid #FCD34D",
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
                                    {isAfter3PM
                                      ? "DRAWING IN PROGRESS"
                                      : "DRAW SCHEDULED TODAY"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#92400E",
                                      fontWeight: 700,
                                      fontSize: "0.68rem",
                                    }}
                                  >
                                    {item.drawTime || "3:00 PM"}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 800,
                                    color: "#92400E",
                                    fontSize: "0.775rem",
                                  }}
                                >
                                  {isAfter3PM
                                    ? "Live draw in progress • Results soon →"
                                    : "Results publish today at 3:10 PM →"}
                                </Typography>
                              </Box>
                            )
                          ) : latestDraw ? (
                            <Box
                              sx={{
                                bgcolor: "#EBF5FF",
                                p: 1.5,
                                borderRadius: "10px",
                                border: "1px solid #BFDBFE",
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
                                    color: "#0B3C5D",
                                    fontWeight: 800,
                                    fontSize: "0.68rem",
                                  }}
                                >
                                  LATEST 1ST PRIZE
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#0B3C5D",
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
                                  color: "#0B3C5D",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                {latestDraw.first?.ticket || "N/A"}
                              </Typography>
                            </Box>
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
                              color: "#0B3C5D",
                              fontWeight: 800,
                              fontSize: "0.78rem",
                            }}
                          >
                            View Archives & Results
                          </Typography>
                          <ArrowForwardIcon
                            sx={{ color: "#0B3C5D", fontSize: 16 }}
                          />
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>
      </Box>
      )}

      {/* Kerala Bumper Lotteries Section */}
      {isTodayBumper && (
        <Box id="bumpers" sx={{ mb: 6, display: { xs: "none", md: "block" } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#EBF5FF",
              color: "#0B3C5D",
              p: 1,
              borderRadius: "10px",
              border: "1px solid #BFDBFE",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#111827",
              fontSize: { xs: "1.35rem", sm: "1.875rem", lg: "2.25rem" },
            }}
          >
            Kerala State Bumper Lotteries
          </Typography>
          <Chip
            label="Bumper Draws"
            size="small"
            sx={{
              bgcolor: "#0B3C5D",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "8px",
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "#6B7280",
            mb: 3.5,
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Beyond the daily draws, massive festival jackpots are organized
          throughout the year. You can download the full bumper result lists
          right here when drawn:
        </Typography>

        <Grid container spacing={{ xs: 2.5, sm: 3 }}>
          {isLoading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "16px",
                      border: "1px solid #E5E7EB",
                      p: 2.5,
                      bgcolor: "#FFFFFF",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Skeleton
                          variant="rounded"
                          width={95}
                          height={24}
                          sx={{ borderRadius: "12px" }}
                        />
                        <Skeleton
                          variant="rounded"
                          width={36}
                          height={24}
                          sx={{ borderRadius: "8px" }}
                        />
                      </Box>
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={32}
                        sx={{ mb: 0.5 }}
                      />
                      <Skeleton
                        variant="text"
                        width="45%"
                        height={22}
                        sx={{ mb: 2 }}
                      />
                      <Skeleton
                        variant="rounded"
                        height={52}
                        sx={{ borderRadius: "10px", mb: 2 }}
                      />
                      <Skeleton
                        variant="rounded"
                        height={44}
                        sx={{ borderRadius: "10px" }}
                      />
                    </Box>
                    <Skeleton
                      variant="rounded"
                      height={36}
                      sx={{ mt: 2, borderRadius: "6px" }}
                    />
                  </Card>
                </Grid>
              ))
            : bumperLotteriesList.map((bumper) => {
                const latestDraw = recentDrawsMap[bumper.code];
                const isAnnouncedUpcoming =
                  !!bumper.draw_date && bumper.draw_date >= todayISTDate;
                const isDrawToday = bumper.draw_date === todayISTDate;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bumper.code}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: "16px",
                        border: isAnnouncedUpcoming
                          ? "2px solid #F59E0B"
                          : "1px solid #E5E7EB",
                        bgcolor: isAnnouncedUpcoming ? "#FFFDF0" : "#FFFFFF",
                        boxShadow: isAnnouncedUpcoming
                          ? "0 8px 25px rgba(245, 158, 11, 0.18)"
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
                          borderColor: isAnnouncedUpcoming
                            ? "#D97706"
                            : "#0B3C5D",
                          boxShadow: isAnnouncedUpcoming
                            ? "0 12px 30px rgba(245, 158, 11, 0.28)"
                            : "0 10px 24px rgba(11, 60, 93, 0.12)",
                        },
                      }}
                    >
                      <CardActionArea
                        component={Link}
                        href={getLotteryUrl(bumper.code)}
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
                          {/* Top Row: Draw Season / Announced Date Badge & Code Pill */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1.5,
                            }}
                          >
                            {isAnnouncedUpcoming ? (
                              <Chip
                                icon={
                                  <AutoAwesomeIcon
                                    sx={{
                                      fontSize: "14px !important",
                                      color: "#B45309",
                                    }}
                                  />
                                }
                                label={
                                  isDrawToday
                                    ? "👑 DRAWS TODAY"
                                    : `👑 DRAW DATE: ${bumper.draw_date}`
                                }
                                size="small"
                                sx={{
                                  bgcolor: "#FEF3C7",
                                  color: "#92400E",
                                  border: "1.5px solid #F59E0B",
                                  fontWeight: 900,
                                  fontSize: "0.725rem",
                                  borderRadius: "12px",
                                  px: 0.5,
                                }}
                              />
                            ) : (
                              <Chip
                                label={bumper.draw_season}
                                size="small"
                                sx={{
                                  bgcolor: "#F3F4F6",
                                  color: "#374151",
                                  border: "1px solid #E5E7EB",
                                  fontWeight: 800,
                                  fontSize: "0.725rem",
                                  borderRadius: "12px",
                                  px: 1,
                                }}
                              />
                            )}

                            <Chip
                              label={bumper.code}
                              size="small"
                              sx={{
                                fontWeight: 900,
                                bgcolor: isAnnouncedUpcoming
                                  ? "#D97706"
                                  : "#0B3C5D",
                                color: "#FFFFFF",
                                borderRadius: "8px",
                                fontSize: "0.725rem",
                                height: 22,
                                px: 0.5,
                              }}
                            />
                          </Box>

                          {/* Main Title & Malayalam Name */}
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 900,
                              color: isAnnouncedUpcoming
                                ? "#78350F"
                                : "#111827",
                              mb: 0.2,
                              fontSize: "1.25rem",
                            }}
                          >
                            {bumper.name}
                          </Typography>

                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: isAnnouncedUpcoming
                                ? "#B45309"
                                : "#0B3C5D",
                              mb: 1.5,
                              fontSize: "0.95rem",
                            }}
                          >
                            {bumper.nameMl}
                          </Typography>

                          {/* Jackpot Box */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              bgcolor: isAnnouncedUpcoming
                                ? "#FEF3C7"
                                : "#EBF5FF",
                              p: 1.25,
                              borderRadius: "10px",
                              border: isAnnouncedUpcoming
                                ? "1px solid #FCD34D"
                                : "1px solid #BFDBFE",
                              mb: 2,
                            }}
                          >
                            <EmojiEventsIcon
                              sx={{
                                color: isAnnouncedUpcoming
                                  ? "#D97706"
                                  : "#0B3C5D",
                                fontSize: 20,
                              }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: isAnnouncedUpcoming
                                    ? "#92400E"
                                    : "#0B3C5D",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  display: "block",
                                  lineHeight: 1.1,
                                }}
                              >
                                1ST PRIZE JACKPOT
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isAnnouncedUpcoming
                                    ? "#78350F"
                                    : "#0B3C5D",
                                  fontWeight: 900,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {bumper.jackpot}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Announced Date vs Result Box */}
                          {isAnnouncedUpcoming ? (
                            isDrawToday &&
                            latestDraw &&
                            latestDraw.draw_date === todayISTDate &&
                            hasAnyDrawResult(latestDraw) &&
                            isAfter3PM ? (
                              <Box
                                sx={{
                                  bgcolor: "#EBF5FF",
                                  p: 1.5,
                                  borderRadius: "10px",
                                  border: "1px solid #BFDBFE",
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
                                      color: "#0B3C5D",
                                      fontWeight: 800,
                                      fontSize: "0.68rem",
                                    }}
                                  >
                                    TODAY&apos;S BUMPER RESULT
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#0B3C5D",
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
                                    color: "#0B3C5D",
                                  }}
                                >
                                  {latestDraw.first?.ticket || "Published"}
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  bgcolor: "#FFFFFF",
                                  p: 1.5,
                                  borderRadius: "10px",
                                  border: "1.5px solid #F59E0B",
                                  boxShadow:
                                    "0 2px 8px rgba(245, 158, 11, 0.1)",
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
                                      fontWeight: 900,
                                      fontSize: "0.7rem",
                                    }}
                                  >
                                    🗓️ ANNOUNCED DRAW DATE
                                  </Typography>
                                  <Chip
                                    label={
                                      isDrawToday ? "DRAWS TODAY" : "UPCOMING"
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor: isDrawToday
                                        ? "#DC2626"
                                        : "#D97706",
                                      color: "#FFFFFF",
                                      fontWeight: 900,
                                      fontSize: "0.65rem",
                                      height: 20,
                                      borderRadius: "6px",
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#78350F",
                                    fontWeight: 900,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {bumper.draw_date} •{" "}
                                  {bumper.drawTime || "2:00 PM"}
                                </Typography>
                                {bumper.ticket_price && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#92400E",
                                      fontWeight: 700,
                                      fontSize: "0.725rem",
                                      display: "block",
                                      mt: 0.25,
                                    }}
                                  >
                                    Ticket: {bumper.ticket_price}
                                  </Typography>
                                )}
                              </Box>
                            )
                          ) : latestDraw ? (
                            <Box
                              sx={{
                                bgcolor: "#FFFFFF",
                                p: 1.5,
                                borderRadius: "10px",
                                border: "1px solid #E5E7EB",
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
                                    color: "#6B7280",
                                    fontWeight: 800,
                                    fontSize: "0.68rem",
                                  }}
                                >
                                  LATEST DRAW RESULT
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#6B7280",
                                    fontWeight: 700,
                                    fontSize: "0.68rem",
                                  }}
                                >
                                  {latestDraw.draw_date}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: 900,
                                  color: "#0B3C5D",
                                }}
                              >
                                {latestDraw.first?.ticket || "Published"}
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                bgcolor: "#FFFFFF",
                                p: 1.5,
                                borderRadius: "10px",
                                border: "1px solid #E5E7EB",
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
                                Annual Draw Archive Available
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
                              color: "#0B3C5D",
                              fontWeight: 800,
                              fontSize: "0.78rem",
                            }}
                          >
                            View Bumper Draw & Breakdown
                          </Typography>
                          <ArrowForwardIcon
                            sx={{ color: "#0B3C5D", fontSize: 16 }}
                          />
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>
      </Box>
      )}

      {/* SEO & Comprehensive Information Section */}
      <Paper
        elevation={0}
        sx={{
          mt: 6,
          mb: 4,
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: { xs: "20px", sm: "24px" },
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Section Pill & Main Title */}
        <Box sx={{ mb: 3.5 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: "14px !important", color: "#0B3C5D" }} />}
            label="DAILY DRAW GUIDE & OFFICIAL CHART"
            size="small"
            sx={{
              bgcolor: "#EBF5FF",
              color: "#0B3C5D",
              fontWeight: 800,
              fontSize: "0.72rem",
              borderRadius: "8px",
              mb: 1.5,
              border: "1px solid #BFDBFE",
            }}
          />
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 900,
              color: "#0B3C5D",
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.1rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            Live Kerala Lottery Result Today 2026: Daily Draw Chart
          </Typography>
        </Box>

        {/* Quick Facts Container */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            bgcolor: "#F8FAFC",
            borderRadius: "16px",
            border: "1.5px solid #0056b3",
            mb: 4,
            boxShadow: "0 4px 15px rgba(0, 86, 179, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <MonetizationOnIcon sx={{ color: "#0056b3", fontSize: 24 }} />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: "#0056b3",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
              }}
            >
              Kerala Lottery Result Today Quick Facts (केरल लॉटरी के नतीजे / கேரளா லாட்டரி குலுக்கல்):
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {[
              {
                icon: <AccessTimeIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />,
                label: "Today's Live Draw Time",
                value: "Starts at 2:55 PM IST daily.",
                bg: "#FFFFFF",
              },
              {
                icon: <PictureAsPdfIcon sx={{ color: "#DC2626", fontSize: 20 }} />,
                label: "Official Chart & Gazette PDF Publication",
                value: "Available at 4:00 PM IST.",
                bg: "#FFFFFF",
              },
              {
                icon: <PlaceIcon sx={{ color: "#059669", fontSize: 20 }} />,
                label: "Live Stream Venue",
                value: "Gorky Bhavan, Near Bakery Junction, Thiruvananthapuram.",
                bg: "#FFFFFF",
              },
              {
                icon: <AccountBalanceIcon sx={{ color: "#2563EB", fontSize: 20 }} />,
                label: "Governing Body",
                value: "Directorate of Kerala State Lotteries (Taxes Dept., Govt. of Kerala).",
                bg: "#FFFFFF",
              },
              {
                icon: <EmojiEventsIcon sx={{ color: "#D97706", fontSize: 20 }} />,
                label: "2026 Active Lotteries",
                value: "7 Weekly Schemes (Samrudhi, Karunya, Suvarna Keralam, Karunya Plus, Dhanalekshmi, Sthree-Sakthi, Bhagyathara) & 6 Seasonal Bumper Series.",
                bg: "#FFFFFF",
              },
              {
                icon: <ConfirmationNumberIcon sx={{ color: "#7C3AED", fontSize: 20 }} />,
                label: "Official Ticket Price & Form",
                value: "₹50 per paper ticket (Standard Weekly Series). Digital online sales are strictly unauthorized.",
                bg: "#FFFFFF",
              },
            ].map((fact, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: fact.bg,
                    border: "1px solid #E2E8F0",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    {fact.icon}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        fontSize: "0.72rem",
                      }}
                    >
                      {fact.label}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#1E293B",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {fact.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Weekly Schedule & Lottery Results Infographic Chart */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 820,
            mx: "auto",
            mb: 4,
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            bgcolor: "#FAFAFA",
            p: { xs: 1, sm: 2 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src="/kerala-lottery-weekly-draw-schedule.jpg"
            alt="Kerala State Lottery Weekly Draw Schedule and Results Chart - Monday to Sunday (Bhagyathara, Sthree Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Karunya, Samrudhi)"
            loading="lazy"
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: 560,
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          />
        </Box>

        {/* Welcome & Streaming Details */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="body1"
            sx={{
              color: "#374151",
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: "0.95rem", sm: "1.025rem" },
            }}
          >
            Welcome to <strong>Kerala Lottery Results Today</strong> (केरल लॉटरी के नतीजे / கேரளா லாட்டரி குலுக்கல்), your trusted portal for daily live updates. The Kerala state lottery draws are held every afternoon live at Gorky Bhavan, Near Bakery Junction, Thiruvananthapuram.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#374151",
              mb: 2.5,
              lineHeight: 1.8,
              fontSize: { xs: "0.95rem", sm: "1.025rem" },
            }}
          >
            The live streaming starts at 2:55 PM, and results are announced on national television networks at 3:00 PM. If you miss the live broadcast, the complete official Kerala lottery result chart and winning numbers list are updated here at 4:00 PM.
          </Typography>

          {/* Bookmark & Domain Callout */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: "12px",
              bgcolor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2.5,
            }}
          >
            <BookmarkBorderIcon sx={{ color: "#16A34A", fontSize: 28, display: { xs: "none", sm: "block" } }} />
            <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.6, fontWeight: 500 }}>
              Bookmark our domain <strong>Kerala Lottery Results Today</strong> (
              <Link
                href="https://www.keralalotteryresultstoday.in/"
                style={{ color: "#15803D", fontWeight: 800, textDecoration: "underline" }}
              >
                https://www.keralalotteryresultstoday.in/
              </Link>
              ) to instantly access today&apos;s winning draw number, view yesterday&apos;s results, or download the historical monthly chart archives.
            </Typography>
          </Paper>
        </Box>

        {/* Official Kerala Lottery Weekly Draw Schedule & Prizes Table */}
        <Box sx={{ mb: 4.5 }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 800, color: "#0B3C5D", mb: 1 }}
          >
            Kerala Lottery Weekly Draw Schedule &amp; Prizes
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
            The Kerala State Lottery Department runs seven different weekly lotteries. Match your ticket code and draw number using our official weekly schedule:
          </Typography>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              mb: 2,
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.5 }}>
                      Lottery Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.5 }}>
                      Day of Draw
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.5 }}>
                      Ticket Code
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.5 }}>
                      1st Prize Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.5 }}>
                      Ticket Cost
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: "BHAGYATHARA", day: "Monday", code: "BT", prize: "₹1 Crore", cost: "₹50", slug: "bhagyathara" },
                    { name: "STHREE-SAKTHI", day: "Tuesday", code: "SS", prize: "₹1 Crore", cost: "₹50", slug: "sthreesakthi" },
                    { name: "DHANALEKSHMI", day: "Wednesday", code: "DL", prize: "₹1 Crore", cost: "₹50", slug: "dhanalekshmi" },
                    { name: "KARUNYA PLUS", day: "Thursday", code: "KN", prize: "₹1 Crore", cost: "₹50", slug: "karunyaplus" },
                    { name: "SUVARNA KERALAM", day: "Friday", code: "SK", prize: "₹1 Crore", cost: "₹50", slug: "suvarnakeralam" },
                    { name: "KARUNYA", day: "Saturday", code: "KR", prize: "₹1 Crore", cost: "₹50", slug: "karunya" },
                    { name: "SAMRUDHI", day: "Sunday", code: "SM", prize: "₹1 Crore", cost: "₹50", slug: "samrudhi" },
                  ].map((row) => (
                    <TableRow key={row.code} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Link
                          href={`/${row.slug}`}
                          style={{ color: "#0B3C5D", textDecoration: "none", fontWeight: 700 }}
                        >
                          {row.name}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ color: "#374151" }}>{row.day}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.code}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: "#EFF6FF", color: "#1D4ED8", borderRadius: "4px" }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#15803D" }}>{row.prize}</TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{row.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Typography
            variant="caption"
            sx={{
              color: "#6B7280",
              display: "block",
              fontStyle: "italic",
              bgcolor: "#F9FAFB",
              p: 1.5,
              borderRadius: "8px",
              border: "1px solid #F3F4F6",
            }}
          >
            (Note: Previous lotteries from the 2020–2025 cycle, such as Fifty-Fifty, Win-Win, Nirmal, and Akshaya, have been updated in our system to reflect the current 2026 active draw roster).
          </Typography>
        </Box>

        {/* Prize Structure & Consolation */}
        <Box sx={{ mb: 4.5, pt: 3, borderTop: "1px solid #F3F4F6" }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 800, color: "#0B3C5D", mb: 1 }}
          >
            Understanding the Ticket Prize &amp; Consolation Structure
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#4B5563", mb: 2.5, lineHeight: 1.7 }}
          >
            Kerala (KL) lotteries are paper raffle tickets printed with a distinct{" "}
            <strong>Alphabetical Series Code</strong> followed by a{" "}
            <strong>6-digit number</strong> (e.g., <code>BT 123456</code>).
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: "14px",
                  bgcolor: "#FFFDF0",
                  border: "1.5px solid #FDE68A",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <MilitaryTechIcon sx={{ color: "#D97706", fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#92400E" }}>
                    1st Prize (Jackpot Winning Match)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.65 }}>
                  Awarded exclusively to the exact alphabetical series letter and 6-digit number combination drawn (e.g., <strong>BT 123456</strong>).
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: "14px",
                  bgcolor: "#EFF6FF",
                  border: "1.5px solid #BFDBFE",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <EmojiEventsIcon sx={{ color: "#2563EB", fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E40AF" }}>
                    Consolation Prize (₹5,000)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#1E3A8A", lineHeight: 1.65 }}>
                  Awarded to ticket holders who hold the exact same 6-digit winning number across all remaining non-winning series letters (e.g., <strong>[AA-ZZ except BT] 123456</strong>).
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Kerala State Bumper Lotteries Seasonal Calendar */}
        <Box sx={{ mb: 4.5, pt: 3, borderTop: "1px solid #F3F4F6" }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 800, color: "#0B3C5D", mb: 1 }}
          >
            Kerala State Bumper Lotteries
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
            Beyond the daily draws, massive festival jackpots are organized throughout the year. You can download the full bumper result lists right here when drawn:
          </Typography>

          <Grid container spacing={2}>
            {[
              { month: "January", name: "Christmas New Year Bumper", slug: "christmas-new-year-bumper", jackpot: "₹20 Crore" },
              { month: "March", name: "Summer Bumper", slug: "summer-bumper", jackpot: "₹10 Crore" },
              { month: "May", name: "Vishu Bumper", slug: "vishu-bumper", jackpot: "₹12 Crore" },
              { month: "July", name: "Monsoon Bumper", slug: "monsoon-bumper", jackpot: "₹10 Crore" },
              { month: "September", name: "Thiruvonam Bumper", slug: "thiruvonam-bumper", jackpot: "₹25 Crore" },
              { month: "November", name: "Pooja Bumper", slug: "pooja-bumper", jackpot: "₹12 Crore" },
            ].map((b, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    transition: "all 0.15s ease",
                    "&:hover": { borderColor: "#0B3C5D", transform: "translateY(-2px)" },
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#D97706", fontWeight: 800, textTransform: "uppercase" }}>
                    📅 {b.month} Draw
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827", mt: 0.25 }}>
                    <Link href={`/${b.slug}`} style={{ color: "#0B3C5D", textDecoration: "none" }}>
                      {b.name}
                    </Link>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#15803D", fontWeight: 700, display: "block", mt: 0.5 }}>
                    Jackpot: {b.jackpot}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Kerala Lottery Ticket Purchasing & Anti-Fraud Advisory */}
        <Box
          sx={{
            mb: 4.5,
            p: { xs: 2.5, sm: 3 },
            borderRadius: "16px",
            bgcolor: "#FFFBEB",
            border: "1.5px solid #FCD34D",
            boxShadow: "0 4px 14px rgba(217, 119, 6, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
            <SecurityIcon sx={{ color: "#D97706", fontSize: 26 }} />
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 800,
                color: "#92400E",
                fontSize: { xs: "1.05rem", sm: "1.2rem" },
              }}
            >
              Kerala Lottery Ticket Purchasing &amp; Safety Advisory
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #FDE68A",
                  height: "100%",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#B45309", mb: 0.5 }}
                >
                  🚫 No Online Sales
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#78350F", lineHeight: 1.6, fontSize: "0.875rem" }}
                >
                  The Government of Kerala does not sell lottery tickets online. Any website or mobile app claiming digital sales is strictly unauthorized.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #FDE68A",
                  height: "100%",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#DC2626", mb: 0.5 }}
                >
                  ⚠️ Beware of Frauds
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#78350F", lineHeight: 1.6, fontSize: "0.875rem" }}
                >
                  Websites or mobile apps offering digital sales of Kerala lotteries or &ldquo;Dear Lottery&rdquo; charts are financial scams.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #FDE68A",
                  height: "100%",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#059669", mb: 0.5 }}
                >
                  🛒 Buy Offline Only
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#78350F", lineHeight: 1.6, fontSize: "0.875rem" }}
                >
                  Always purchase your physical paper tickets from a government-authorized offline retail agent. The official ticket price is ₹50.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* How to Claim Your Prize Money & Verification Documents */}
        <Box sx={{ mb: 4.5, pt: 3, borderTop: "1px solid #F3F4F6" }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 800, color: "#0B3C5D", mb: 1 }}
          >
            How to Claim Your Prize Money
          </Typography>
          <Typography variant="body1" sx={{ color: "#4B5563", mb: 2.5, lineHeight: 1.7 }}>
            Winnings must be officially claimed within <strong>90 days</strong> from the draw date. Be sure to check your numbers carefully and sign the back of your physical ticket immediately.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: "10px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", height: "100%" }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                  Up to ₹5,000
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, fontSize: "0.85rem" }}>
                  Can be claimed directly from any local authorized lottery shop or retail agent across Kerala.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: "10px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", height: "100%" }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                  ₹5,001 to ₹1,00,000
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, fontSize: "0.85rem" }}>
                  Must be processed at any District Lottery Office with identity verification.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: "10px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", height: "100%" }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                  Above ₹1,00,000
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, fontSize: "0.85rem" }}>
                  Must be submitted to the Directorate of Kerala State Lotteries office, located at Vikas Bhavan P.O., Thiruvananthapuram.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: "12px",
              bgcolor: "#FEF2F2",
              border: "1px solid #FECACA",
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#991B1B", mb: 0.5 }}>
              Taxation &amp; TDS Deduction:
            </Typography>
            <Typography variant="body2" sx={{ color: "#7F1D1D", lineHeight: 1.6 }}>
              All prize payouts exceeding ₹10,000 attract a mandatory flat <strong>30% Tax Deduction at Source (TDS)</strong> under Indian tax regulations. A valid PAN card is required for verification.
            </Typography>
          </Paper>

          {/* Documents Required */}
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827", mb: 1.5 }}>
            Documents Required for Prize Verification:
          </Typography>
          <Grid container spacing={1.5}>
            {[
              "Original Winning Ticket (signed on the back)",
              "Kerala Lottery Prize Claim Form and official declaration form",
              "Valid Photo Identity Proof (Aadhaar Card, PAN Card, Voter ID, or Passport)",
              "Bank Account Passbook Copy for direct electronic fund transfer",
            ].map((doc, idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#F9FAFB", p: 1.5, borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0B3C5D" }}>✓</Typography>
                  <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>{doc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* About the Kerala State Lottery */}
        <Box sx={{ mb: 4.5, pt: 3, borderTop: "1px solid #F3F4F6" }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 800, color: "#0B3C5D", mb: 1 }}
          >
            About the Kerala State Lottery
          </Typography>
          <Typography variant="body1" sx={{ color: "#4B5563", lineHeight: 1.8 }}>
            Established 54 years ago in 1967, the Kerala state lottery scheme was envisioned by the then Finance Minister, <strong>P.K. Kunju Sahib</strong>. The initiative was designed to support social welfare programs and provide stable employment. It remains India&apos;s pioneer, fully transparent, government-regulated lottery platform.
          </Typography>
        </Box>

        {/* Frequently Asked Questions (Collapsible Accordions) */}
        <Typography
          variant="h5"
          component="h3"
          sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2.5 }}
        >
          Frequently Asked Questions (Kerala Lottery Queries)
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[
            {
              q: "What is Kerala Lottery?",
              a: "The Kerala State Lottery is India's first government-run paper lottery scheme established in 1967 by the Directorate of Kerala State Lotteries. It operates 7 regular weekly draws and 6 seasonal bumper lotteries with revenue funding state welfare, hospitals, and public health schemes.",
            },
            {
              q: "How to Get Kerala Lottery Ticket & Can You Buy Online?",
              a: "Kerala lottery tickets can only be purchased in person as physical paper tickets from government-authorized offline lottery agents across Kerala. The Government of Kerala strictly does NOT sell lottery tickets online, and digital online purchase portals are unauthorized.",
            },
            {
              q: "What is the Price of Kerala Lottery Ticket?",
              a: "The official ticket price for all 7 standard weekly lotteries (Bhagyathara, Sthree-Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Karunya, and Samrudhi) is ₹50 per paper ticket. Seasonal bumper lottery tickets range from ₹250 to ₹500 depending on the bumper edition.",
            },
            {
              q: "How to See Kerala Lottery Result Today?",
              a: "You can see today's Kerala lottery result live right here on Kerala Lottery Results Today (https://www.keralalotteryresultstoday.in/). Live drawing starts at 2:55 PM IST, and complete prize chart breakdown is updated by 4:00 PM IST. You can also use our instant Ticket Checker search tool at the top of the page.",
            },
            {
              q: "How to Download Kerala Lottery Result PDF?",
              a: "To download the official Kerala lottery result PDF and Government Gazette chart, visit any lottery draw result page on our website and tap 'Download Official PDF'. The PDF format includes all winning ticket numbers from 1st prize down to consolation and 9th prize.",
            },
          ].map((faq, idx) => (
            <Accordion
              key={idx}
              elevation={0}
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px !important",
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#0B3C5D" }} />}
                sx={{
                  bgcolor: "#F9FAFB",
                  px: { xs: 2, sm: 3 },
                  py: 0.5,
                  "&.Mui-expanded": { bgcolor: "#EBF5FF" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <HelpIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#111827",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {faq.q}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#FFFFFF" }}
              >
                <Typography
                  sx={{
                    color: "#4B5563",
                    lineHeight: 1.7,
                    fontSize: { xs: "0.875rem", sm: "0.95rem" },
                  }}
                >
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>

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
            color: "#0B3C5D",
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
                    border: "1px solid #BFDBFE",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, color: "#0B3C5D" }}
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
                    href={getLotteryUrl(match.lottery_code, match.draw_date)}
                    size="small"
                    sx={{ mt: 1.5, fontWeight: 700, color: "#0B3C5D" }}
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
            sx={{ bgcolor: "#0B3C5D", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Daily WhatsApp Status & Telegram Digest Modal */}
      <AiSocialDigestModal
        open={digestModalOpen}
        onClose={() => setDigestModalOpen(false)}
        drawCode={todayDrawResult?.draw_code}
        drawDate={todayDrawResult?.draw_date}
      />
    </Container>
  );
}
