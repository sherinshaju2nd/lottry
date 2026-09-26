"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";

// Icons
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArticleIcon from "@mui/icons-material/Article";
import LinkIcon from "@mui/icons-material/Link";
import BadgeIcon from "@mui/icons-material/Badge";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import BoltIcon from "@mui/icons-material/Bolt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";

import {
  StructuredDrawResult,
  getLotteryUrl,
  getLotteryJackpot,
  hasAnyDrawResult,
  PostponedDraw,
} from "@/lib/supabase";
import { LotteryItem } from "@/app/page";

interface HomeDesktopModernViewProps {
  todayLottery: LotteryItem;
  lotteriesList: LotteryItem[];
  bumperLotteriesList: LotteryItem[];
  todayDayName: string;
  isTodayBumper: boolean;
  todayBumperInfo: any;
  todayDrawResult: StructuredDrawResult | null;
  todayPostponement: PostponedDraw | null;
  allDraws: StructuredDrawResult[];
  recentDrawsMap: Record<string, StructuredDrawResult>;
  latestPreviousDraw: StructuredDrawResult | null;
  isLoading: boolean;
  isAfter3PM: boolean;
  socketStatus: "connecting" | "connected" | "live_updating";
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
    isDrawPassed: boolean;
  };
  todayISTDate: string;
  yesterdayISTDate: string;
  onSearchSubmit: (data: { ticketNumber: string }) => void;
  isSearching: boolean;
  register: any;
  handleSubmit: any;
  setValue: any;
  errors: any;
  heroSlideIndex: number;
  setHeroSlideIndex: (index: number) => void;
}

// Format: "Wednesday, 23 September 2026"
function formatFullDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const d = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
      );
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch {}
  return dateStr;
}

// Format: "23 Sep 2026"
function formatShortDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const d = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
      );
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch {}
  return dateStr;
}

// Format Draw Code e.g. "DL-70"
function formatDrawCode(code?: string, num?: string): string {
  const c = (code || "").toUpperCase();
  const n = (num || "").toUpperCase();
  if (!n) return c;
  if (n.startsWith(c)) return n;
  return `${c}-${n}`;
}

export default function HomeDesktopModernView({
  todayLottery,
  lotteriesList,
  bumperLotteriesList,
  todayDayName,
  isTodayBumper,
  todayBumperInfo,
  todayDrawResult,
  todayPostponement,
  allDraws,
  recentDrawsMap,
  latestPreviousDraw,
  isLoading,
  isAfter3PM,
  socketStatus,
  countdown,
  todayISTDate,
  yesterdayISTDate,
  onSearchSubmit,
  isSearching,
  register,
  handleSubmit,
  setValue,
  errors,
  heroSlideIndex,
  setHeroSlideIndex,
}: HomeDesktopModernViewProps) {
  const router = useRouter();
  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<string>(todayISTDate);

  // Calendar View Month State (Full Month Navigation)
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => {
    try {
      const parts = todayISTDate.split("-");
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    } catch {}
    return new Date();
  });

  const isToday = heroSlideIndex === 0;

  // Real today result check (Only true when today's result actually exists in DB)
  const hasTodayResult = useMemo(() => {
    if (!isToday) return true;
    return (
      !!todayDrawResult &&
      todayDrawResult.draw_date === todayISTDate &&
      hasAnyDrawResult(todayDrawResult)
    );
  }, [isToday, todayDrawResult, todayISTDate]);

  const isPostponed = useMemo(() => {
    return isToday && !!todayPostponement;
  }, [isToday, todayPostponement]);

  const isPreDraw = useMemo(() => {
    return (
      isToday &&
      !hasTodayResult &&
      !isAfter3PM &&
      !countdown.isDrawPassed &&
      !isPostponed
    );
  }, [
    isToday,
    hasTodayResult,
    isAfter3PM,
    countdown.isDrawPassed,
    isPostponed,
  ]);

  const isLiveInProgress = useMemo(() => {
    return (
      isToday &&
      !hasTodayResult &&
      (isAfter3PM || countdown.isDrawPassed) &&
      !isPostponed
    );
  }, [
    isToday,
    hasTodayResult,
    isAfter3PM,
    countdown.isDrawPassed,
    isPostponed,
  ]);

  // Active draw data: for Today only use real todayDrawResult, for Previous use latestPreviousDraw / allDraws[0]
  const activeDraw = useMemo<StructuredDrawResult | null>(() => {
    if (isToday) {
      if (hasTodayResult && todayDrawResult) return todayDrawResult;
      return null;
    } else {
      if (latestPreviousDraw) return latestPreviousDraw;
      return allDraws[0] || null;
    }
  }, [isToday, hasTodayResult, todayDrawResult, latestPreviousDraw, allDraws]);

  const currentLotteryName = useMemo(() => {
    if (isToday) return todayLottery.name;
    return (
      activeDraw?.draw_name ||
      latestPreviousDraw?.draw_name ||
      todayLottery.name
    );
  }, [isToday, todayLottery, activeDraw, latestPreviousDraw]);

  const currentLotteryCode = useMemo(() => {
    if (isToday) return todayLottery.code;
    return (
      activeDraw?.lottery_code ||
      activeDraw?.draw_code?.split("-")[0] ||
      todayLottery.code
    );
  }, [isToday, todayLottery, activeDraw]);

  const currentDrawNumber = useMemo(() => {
    if (activeDraw?.draw_code) {
      return activeDraw.draw_code;
    }
    if (isToday && todayDrawResult?.draw_code) {
      return todayDrawResult.draw_code;
    }
    return `${currentLotteryCode}`;
  }, [activeDraw, isToday, todayDrawResult, currentLotteryCode]);

  const currentDrawDate = useMemo(() => {
    if (isToday) return todayISTDate;
    return activeDraw?.draw_date || yesterdayISTDate;
  }, [isToday, todayISTDate, activeDraw, yesterdayISTDate]);

  const currentDrawTime = useMemo(() => {
    if (isTodayBumper && isToday) return todayLottery.drawTime || "2:00 PM";
    return todayLottery.drawTime || "3:00 PM";
  }, [isTodayBumper, isToday, todayLottery]);

  const currentJackpotAmount = useMemo(() => {
    if (isToday) {
      return todayLottery.jackpot || "₹1 Crore";
    }
    return (
      getLotteryJackpot(currentLotteryCode) ||
      todayLottery.jackpot ||
      "₹1 Crore"
    );
  }, [isToday, todayLottery, currentLotteryCode]);

  const currentJackpotInWords = useMemo(() => {
    if (currentJackpotAmount.includes("25")) return "(Twenty Five Crores Only)";
    if (currentJackpotAmount.includes("20")) return "(Twenty Crores Only)";
    if (currentJackpotAmount.includes("12")) return "(Twelve Crores Only)";
    if (currentJackpotAmount.includes("10")) return "(Ten Crores Only)";
    if (currentJackpotAmount.includes("80")) return "(Eighty Lakhs Only)";
    if (currentJackpotAmount.includes("75")) return "(Seventy Five Lakhs Only)";
    if (currentJackpotAmount.includes("70")) return "(Seventy Lakhs Only)";
    return "(One Crore Only)";
  }, [currentJackpotAmount]);

  const firstPrizeTicket = useMemo(() => {
    if (
      activeDraw?.first?.ticket &&
      activeDraw.first.ticket.trim().length > 3
    ) {
      return activeDraw.first.ticket.trim();
    }
    return "";
  }, [activeDraw]);

  const hasFirstPrize = useMemo(() => {
    return !!(
      firstPrizeTicket &&
      firstPrizeTicket.toLowerCase() !== "pending" &&
      firstPrizeTicket.toLowerCase() !== "n/a"
    );
  }, [firstPrizeTicket]);

  const firstPrizeLocation = activeDraw?.first?.location;
  const firstPrizeAgent = activeDraw?.first?.agent;

  // Real consolation prizes from activeDraw ONLY
  const consolationPrizesList = useMemo(() => {
    if (
      activeDraw?.prizes?.consolation &&
      Array.isArray(activeDraw.prizes.consolation) &&
      activeDraw.prizes.consolation.length > 0
    ) {
      return activeDraw.prizes.consolation;
    }
    return [];
  }, [activeDraw]);

  // Dynamic Consolation Prize amount directly from active draw prizes amounts API
  const consolationAmount = useMemo(() => {
    const raw =
      activeDraw?.prizes?.amounts?.["consolation"] ||
      (activeDraw?.prizes?.amounts as any)?.consolation;
    if (raw && typeof raw === "string" && raw.trim().length > 0) {
      let formatted = raw.trim();
      if (!formatted.startsWith("₹")) {
        formatted = `₹${formatted}`;
      }
      if (
        !formatted.endsWith("/-") &&
        !formatted.includes("Lakh") &&
        !formatted.includes("Crore")
      ) {
        formatted = `${formatted}/-`;
      }
      return formatted;
    }
    return isTodayBumper ? "₹5,00,000/-" : "₹8,000/-";
  }, [activeDraw, isTodayBumper]);

  // Real prize tiers from activeDraw ONLY (NO hardcoded fake numbers)
  const allPrizeTiersList = useMemo(() => {
    if (!activeDraw || !activeDraw.prizes) return [];

    const defaultAmounts: Record<string, string> = {
      "2nd": "₹10,00,000/-",
      "3rd": "₹1,00,000/-",
      "4th": "₹5,000/-",
      "5th": "₹1,00,00/-",
      "6th": "₹500/-",
      "7th": "₹200/-",
      "8th": "₹100/-",
      "9th": "₹50/-",
    };

    const tierConfigs = [
      {
        key: "2nd",
        label: "2nd Prize",
        dotBg: "#D97706",
        badgeBg: "#FEF3C7",
        badgeColor: "#B45309",
      },
      {
        key: "3rd",
        label: "3rd Prize",
        dotBg: "#0B3C5D",
        badgeBg: "#EFF6FF",
        badgeColor: "#1D4ED8",
      },
      {
        key: "4th",
        label: "4th Prize",
        dotBg: "#2563EB",
        badgeBg: "#EFF6FF",
        badgeColor: "#1D4ED8",
      },
      {
        key: "5th",
        label: "5th Prize",
        dotBg: "#059669",
        badgeBg: "#ECFDF5",
        badgeColor: "#047857",
      },
      {
        key: "6th",
        label: "6th Prize",
        dotBg: "#0284C7",
        badgeBg: "#E0F2FE",
        badgeColor: "#0369A1",
      },
      {
        key: "7th",
        label: "7th Prize",
        dotBg: "#7C3AED",
        badgeBg: "#F5F3FF",
        badgeColor: "#6D28D9",
      },
      {
        key: "8th",
        label: "8th Prize",
        dotBg: "#475569",
        badgeBg: "#F1F5F9",
        badgeColor: "#334155",
      },
      {
        key: "9th",
        label: "9th Prize",
        dotBg: "#64748B",
        badgeBg: "#F1F5F9",
        badgeColor: "#334155",
      },
    ];

    return tierConfigs
      .map((tier) => {
        const numbers = (activeDraw.prizes as any)?.[tier.key];
        if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
          return null;
        }
        const amount =
          activeDraw.prizes?.amounts?.[tier.key] ||
          defaultAmounts[tier.key] ||
          "";
        return {
          ...tier,
          numbers,
          amount,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      label: string;
      dotBg: string;
      badgeBg: string;
      badgeColor: string;
      numbers: string[];
      amount: string;
    }>;
  }, [activeDraw]);

  // Set of dates that have an actual lottery result
  const availableResultDatesSet = useMemo(() => {
    const set = new Set<string>();
    allDraws.forEach((d) => {
      if (d.draw_date && hasAnyDrawResult(d)) {
        set.add(d.draw_date);
      }
    });
    Object.entries(recentDrawsMap).forEach(([dateKey, draw]) => {
      if (dateKey && hasAnyDrawResult(draw)) {
        set.add(dateKey);
      }
    });
    if (todayDrawResult && hasAnyDrawResult(todayDrawResult)) {
      set.add(todayISTDate);
    }
    if (yesterdayISTDate) {
      set.add(yesterdayISTDate);
    }
    return set;
  }, [
    allDraws,
    recentDrawsMap,
    todayDrawResult,
    todayISTDate,
    yesterdayISTDate,
  ]);

  // Full Month Calendar Generation
  const currentMonthYearHeader = useMemo(() => {
    return calendarViewDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [calendarViewDate]);

  const fullMonthGridDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isYesterday: boolean;
      isSelected: boolean;
      hasResult: boolean;
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, prevDayNum);
      const yyyy = prevDate.getFullYear();
      const mm = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dd = String(prevDayNum).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dateStr,
        dayNum: prevDayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayISTDate,
        isYesterday: dateStr === yesterdayISTDate,
        isSelected: dateStr === selectedCalendarDate,
        hasResult: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const yyyy = year;
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const hasResult = availableResultDatesSet.has(dateStr);

      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayISTDate,
        isYesterday: dateStr === yesterdayISTDate,
        isSelected: dateStr === selectedCalendarDate,
        hasResult,
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const nextDate = new Date(year, month + 1, nextDay);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDay).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dateStr,
        dayNum: nextDay,
        isCurrentMonth: false,
        isToday: dateStr === todayISTDate,
        isYesterday: dateStr === yesterdayISTDate,
        isSelected: dateStr === selectedCalendarDate,
        hasResult: false,
      });
    }

    return days;
  }, [
    calendarViewDate,
    todayISTDate,
    yesterdayISTDate,
    selectedCalendarDate,
    availableResultDatesSet,
  ]);

  const handleCalendarDateClick = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
    if (dateStr === todayISTDate) {
      setHeroSlideIndex(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (dateStr === yesterdayISTDate) {
      setHeroSlideIndex(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const existingDraw =
        allDraws.find((d) => d.draw_date === dateStr) ||
        recentDrawsMap[dateStr];
      if (existingDraw?.lottery_code) {
        router.push(getLotteryUrl(existingDraw.lottery_code, dateStr));
      } else {
        try {
          const parts = dateStr.split("-");
          const d = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
          );
          const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
          const matchingLottery = lotteriesList.find(
            (l) => l.day?.toLowerCase() === dayName.toLowerCase(),
          );
          if (matchingLottery?.code) {
            router.push(getLotteryUrl(matchingLottery.code, dateStr));
          } else {
            router.push(`/search?date=${dateStr}`);
          }
        } catch {
          router.push(`/search?date=${dateStr}`);
        }
      }
    }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#F4F7FB", minHeight: "100vh" }}>
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH HERO BANNER (Edge-to-edge scenic Kerala backwaters)         */}
      {/* ========================================================================= */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "auto", md: "390px" },
          minHeight: "450px",
          position: "relative",
          backgroundImage: "url('/kerala-banner-bg-4k.webp?v=4k')",
          backgroundSize: "cover",
          backgroundPosition: "center 48%",
          backgroundRepeat: "no-repeat",
          pt: { xs: 3, md: 0 },
          pb: 0,
          overflow: "visible",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 247, 251, 0.35) 80%, rgba(255, 247, 251, 0.75) 100%)",
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            px: { xs: 2, sm: 3, md: 5, lg: 6, xl: 8 },
          }}
        >
          {/* Left Script Slogan (Top Left Below Navbar) */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              top: { md: 22, lg: 28 },
              left: { md: 28, lg: 48, xl: 64 },
              transform: "rotate(-5deg)",
              zIndex: 5,
              userSelect: "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Caveat', cursive, sans-serif",
                fontWeight: 700,
                fontSize: { md: "1.7rem", lg: "2.05rem" },
                color: "#4A7C99",
                lineHeight: 1.15,
                textShadow:
                  "0 1px 4px rgba(255,255,255,0.95), 0 0 10px rgba(255,255,255,0.8)",
                letterSpacing: "0.01em",
              }}
            >
              A Small
              <br />
              Ticket
              <br />
              A Brighter
              <br />
              Tomorrow
            </Typography>
          </Box>

          {/* Right Kerala God's Own Land Vector (Top Right Below Navbar) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              position: "absolute",
              top: { md: 22, lg: 28 },
              right: { md: 28, lg: 48, xl: 64 },
              flexDirection: "column",
              alignItems: "flex-end",
              zIndex: 5,
              userSelect: "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 33C16.8 24 20 18 24 13"
                  stroke="#047857"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M19 18C15 16 9 16 6 21"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M21 15C18 12 13 10 9 13"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M23 13C21 9 18 6 13 7"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M24 13C26 9 29 7 34 8"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M24 15C27 12 32 11 35 15"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M22 18C25 17 30 18 32 22"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { md: "1.45rem", lg: "1.7rem" },
                  color: "#0B3C5D",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  textShadow: "0 1px 3px rgba(255,255,255,0.9)",
                }}
              >
                Kerala
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#334155",
                letterSpacing: "0.03em",
                mt: 0.3,
                textShadow: "0 1px 3px rgba(255,255,255,0.9)",
              }}
            >
              God&apos;s Own Land
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: "2px",
                bgcolor: "#10B981",
                mt: 0.4,
                borderRadius: "2px",
              }}
            />
          </Box>

          {/* Center Banner Content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              mb: { xs: 1.5, md: 1 },
            }}
          >
            {/* Draw Pill Toggle Switcher */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                p: "4px",
                borderRadius: "32px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.95)",
                mb: 1.8,
                gap: 0.5,
              }}
            >
              <Button
                size="small"
                onClick={() => setHeroSlideIndex(0)}
                startIcon={
                  <CalendarMonthIcon
                    sx={{
                      fontSize: "18px !important",
                      color: heroSlideIndex === 0 ? "#FFFFFF" : "#1E3A5F",
                    }}
                  />
                }
                sx={{
                  borderRadius: "26px",
                  px: { xs: 2, sm: 2.8 },
                  py: 0.8,
                  fontSize: "0.88rem",
                  fontWeight: heroSlideIndex === 0 ? 800 : 600,
                  textTransform: "none",
                  background:
                    heroSlideIndex === 0
                      ? "linear-gradient(180deg, #0A3C64 0%, #03213A 100%)"
                      : "transparent",
                  color: heroSlideIndex === 0 ? "#FFFFFF" : "#1E3A5F",
                  boxShadow:
                    heroSlideIndex === 0
                      ? "0 3px 10px rgba(3, 33, 58, 0.35)"
                      : "none",
                  "&:hover": {
                    background:
                      heroSlideIndex === 0
                        ? "linear-gradient(180deg, #083355 0%, #021729 100%)"
                        : "rgba(255, 255, 255, 0.6)",
                  },
                }}
              >
                Today&apos;s Draw
              </Button>

              <Button
                size="small"
                onClick={() => setHeroSlideIndex(1)}
                startIcon={
                  <HistoryIcon
                    sx={{
                      fontSize: "19px !important",
                      color: heroSlideIndex === 1 ? "#FFFFFF" : "#1E3A5F",
                    }}
                  />
                }
                sx={{
                  borderRadius: "26px",
                  px: { xs: 2, sm: 2.8 },
                  py: 0.8,
                  fontSize: "0.88rem",
                  fontWeight: heroSlideIndex === 1 ? 800 : 600,
                  textTransform: "none",
                  background:
                    heroSlideIndex === 1
                      ? "linear-gradient(180deg, #0A3C64 0%, #03213A 100%)"
                      : "transparent",
                  color: heroSlideIndex === 1 ? "#FFFFFF" : "#1E3A5F",
                  boxShadow:
                    heroSlideIndex === 1
                      ? "0 3px 10px rgba(3, 33, 58, 0.35)"
                      : "none",
                  "&:hover": {
                    background:
                      heroSlideIndex === 1
                        ? "linear-gradient(180deg, #083355 0%, #021729 100%)"
                        : "rgba(255, 255, 255, 0.6)",
                  },
                }}
              >
                Yesterday&apos;s Result
              </Button>
            </Box>

            {/* Main Heading */}
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                color: "#0A2540",
                fontSize: {
                  xs: "1.85rem",
                  sm: "2.5rem",
                  md: "2.9rem",
                  lg: "3.2rem",
                },
                letterSpacing: "-0.025em",
                textShadow: "0 1px 4px rgba(255,255,255,0.9)",
                mb: 0.8,
              }}
            >
              {isToday
                ? "Kerala Lottery Result Today"
                : "Kerala Lottery Result Yesterday"}
            </Typography>

            {/* Subtitle with dynamic name, code, date & draw time */}
            {isLoading ? (
              <Skeleton
                variant="rounded"
                width={360}
                height={26}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.45)",
                  borderRadius: "8px",
                  mb: 1.2,
                }}
              />
            ) : (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1E3A5F",
                  fontSize: { xs: "0.92rem", sm: "1.1rem", md: "1.18rem" },
                  textShadow: "0 1px 4px rgba(255,255,255,0.9)",
                  mb: 0.8,
                }}
              >
                {currentLotteryName}{" "}
                {currentDrawNumber ? `(${currentDrawNumber})` : ""} •{" "}
                {formatFullDate(currentDrawDate)} • {currentDrawTime}
              </Typography>
            )}

            {/* Status Pill Badge */}
            {isLoading ? (
              <Skeleton
                variant="rounded"
                width={170}
                height={28}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.45)",
                  borderRadius: "20px",
                }}
              />
            ) : isPostponed ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  px: 1.8,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid #FCD34D",
                  boxShadow: "0 2px 6px rgba(217, 119, 6, 0.15)",
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 16, color: "#D97706" }} />
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem" }}>
                  Draw {todayPostponement?.status?.toUpperCase() || "POSTPONED"}{" "}
                  ({todayISTDate})
                </Typography>
              </Box>
            ) : isPreDraw ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "#EFF6FF",
                  color: "#1E40AF",
                  px: 1.8,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid #BFDBFE",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.12)",
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 16, color: "#2563EB" }} />
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem" }}>
                  Live Draw Today at {currentDrawTime} • Results at{" "}
                  {isTodayBumper ? "2:10 PM" : "3:10 PM"}
                </Typography>
              </Box>
            ) : isLiveInProgress ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "#FEF2F2",
                  color: "#991B1B",
                  px: 1.8,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid #FECACA",
                  boxShadow: "0 2px 6px rgba(220, 38, 38, 0.18)",
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#DC2626",
                    animation: "pulseLive 1.4s infinite",
                    "@keyframes pulseLive": {
                      "0%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.4, transform: "scale(1.25)" },
                      "100%": { opacity: 1, transform: "scale(1)" },
                    },
                  }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem" }}>
                  Live Draw In Progress • Drawing Now
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "#D1FAE5",
                  color: "#065F46",
                  px: 1.8,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid #A7F3D0",
                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.15)",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem" }}>
                  {isToday ? "Result Updated" : "Result Confirmed"}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Floating Ticket Search Bar (Overlaps bottom boundary) */}
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmit(onSearchSubmit)}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", md: "960px", lg: "1040px" },
              mx: "auto",
              bgcolor: "#FFFFFF",
              borderRadius: "16px",
              p: { xs: 1.5, sm: 2 },
              border: "1px solid rgba(226, 232, 240, 0.95)",
              boxShadow: "0 14px 35px rgba(11, 60, 93, 0.12)",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              transform: { xs: "none", sm: "translateY(50%)" },
              mb: { xs: 2, sm: 0 },
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Left Ticket Icon & Text */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.8,
                minWidth: { xs: "100%", sm: 260 },
                pl: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "10px",
                  bgcolor: hasTodayResult ? "#0A3C64" : "#94A3B8",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(10, 60, 100, 0.25)",
                }}
              >
                <ConfirmationNumberIcon
                  sx={{ fontSize: 26, transform: "rotate(-10deg)" }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "0.96rem",
                    color: "#0F172A",
                    lineHeight: 1.2,
                  }}
                >
                  Check Your
                  <br />
                  Ticket Number
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#64748B",
                    lineHeight: 1.2,
                    mt: 0.3,
                  }}
                >
                  {hasTodayResult
                    ? "Enter your ticket number to view the result"
                    : `Activates at ${isTodayBumper ? "2:10 PM" : "3:10 PM"} once results are drawn`}
                </Typography>
              </Box>
            </Box>

            {/* Search Input Box */}
            <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
              <TextField
                fullWidth
                disabled={!hasTodayResult || isSearching}
                placeholder={
                  hasTodayResult
                    ? `Enter ticket number (e.g. ${firstPrizeTicket || `${currentLotteryCode} 123456`})`
                    : `Ticket checker activates at ${isTodayBumper ? "2:10 PM" : "3:10 PM"} once results are published`
                }
                {...register("ticketNumber")}
                error={!!errors.ticketNumber}
                helperText={errors.ticketNumber?.message as string}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "50px",
                    borderRadius: "8px",
                    bgcolor: hasTodayResult ? "#FFFFFF" : "#F8FAFC",
                    fontSize: "0.95rem",
                    color: "#0F172A",
                    fontWeight: 600,
                    "& fieldset": {
                      borderColor: "#E2E8F0",
                      borderWidth: "1.5px",
                    },
                    "&:hover fieldset": {
                      borderColor: hasTodayResult ? "#94A3B8" : "#E2E8F0",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0A3C64",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    px: 2,
                    "&::placeholder": {
                      color: "#94A3B8",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            {/* Check Result Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={!hasTodayResult || isSearching}
              endIcon={
                <ArrowForwardIcon sx={{ fontSize: "20px !important" }} />
              }
              sx={{
                height: "50px",
                width: { xs: "100%", sm: "auto" },
                bgcolor: hasTodayResult ? "#0A3C64" : "#94A3B8",
                color: "#FFFFFF",
                fontWeight: 800,
                px: { xs: 3, sm: 4 },
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
                boxShadow: hasTodayResult
                  ? "0 4px 14px rgba(10, 60, 100, 0.25)"
                  : "none",
                "&:hover": {
                  bgcolor: hasTodayResult ? "#062947" : "#94A3B8",
                  boxShadow: hasTodayResult
                    ? "0 6px 18px rgba(10, 60, 100, 0.35)"
                    : "none",
                },
              }}
            >
              {isSearching
                ? "Checking..."
                : hasTodayResult
                  ? "Check Result"
                  : isLiveInProgress
                    ? "Drawing in Progress"
                    : "Result Coming Soon"}
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN GRID SECTION (Left: Winning & Cards, Right: Sidebar)    */}
      {/* ========================================================================= */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          bgcolor: "#FFFFFF",
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
          pt: { xs: 3, sm: "52px", md: "56px" },
          pb: 0,
        }}
      >
        <Grid container spacing={3.5} sx={{ mb: 0 }}>
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Winning Numbers Card & Live Draw / Countdown States      */}
          {/* --------------------------------------------------------------------- */}
          <Grid size={{ xs: 12, lg: 8, xl: 8.2 }}>
            {isLoading ? (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5, xl: 4 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  mb: 0,
                }}
              >
                {/* Header Skeleton */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Skeleton variant="circular" width={42} height={42} />
                    <Box>
                      <Skeleton variant="text" width={190} height={32} />
                      <Skeleton variant="text" width={260} height={20} />
                    </Box>
                  </Box>
                  <Skeleton
                    variant="rounded"
                    width={160}
                    height={32}
                    sx={{ borderRadius: "14px" }}
                  />
                </Box>

                <Skeleton
                  variant="rounded"
                  height={130}
                  sx={{
                    borderRadius: "16px",
                    mb: 3,
                    bgcolor: "#F1F5F9",
                  }}
                />
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5, xl: 4 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  mb: 0,
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <EmojiEventsIcon sx={{ color: "#EAB308", fontSize: 36 }} />
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color: "#0F172A",
                          fontSize: { xs: "1.3rem", sm: "1.55rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {hasTodayResult
                          ? "Winning Numbers"
                          : "Today's Draw Status"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748B", fontWeight: 600, mt: 0.2 }}
                      >
                        {currentLotteryName}{" "}
                        {currentDrawNumber ? `(${currentDrawNumber})` : ""} |{" "}
                        {formatFullDate(currentDrawDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Top-Right Status Badge */}
                  {isPostponed ? (
                    <Chip
                      icon={
                        <WarningAmberIcon
                          sx={{ fontSize: "14px !important", color: "#D97706" }}
                        />
                      }
                      label="Draw Postponed"
                      size="small"
                      sx={{
                        bgcolor: "#FEF3C7",
                        color: "#92400E",
                        border: "1px solid #FCD34D",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "14px",
                      }}
                    />
                  ) : isPreDraw ? (
                    <Chip
                      icon={
                        <AccessTimeIcon
                          sx={{ fontSize: "14px !important", color: "#2563EB" }}
                        />
                      }
                      label={`Draw Scheduled ${currentDrawTime}`}
                      size="small"
                      sx={{
                        bgcolor: "#EFF6FF",
                        color: "#1D4ED8",
                        border: "1px solid #BFDBFE",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "14px",
                      }}
                    />
                  ) : isLiveInProgress ? (
                    <Chip
                      icon={
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#DC2626",
                            animation: "pulseDot 1.2s infinite",
                            "@keyframes pulseDot": {
                              "0%": { opacity: 1 },
                              "50%": { opacity: 0.3 },
                              "100%": { opacity: 1 },
                            },
                          }}
                        />
                      }
                      label="Live Draw In Progress"
                      size="small"
                      sx={{
                        bgcolor: "#FEF2F2",
                        color: "#991B1B",
                        border: "1px solid #FECACA",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "14px",
                      }}
                    />
                  ) : (
                    <Chip
                      icon={
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#10B981",
                          }}
                        />
                      }
                      label={`Result Published ${currentDrawTime}`}
                      size="small"
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#065F46",
                        border: "1px solid #A7F3D0",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "14px",
                      }}
                    />
                  )}
                </Box>

                {/* ============================================================= */}
                {/* CASE A: POSTPONED STATE                                       */}
                {/* ============================================================= */}
                {isPostponed && todayPostponement && (
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 3,
                      p: 2.5,
                      borderRadius: "16px",
                      bgcolor: "#FFFBEB",
                      border: "1.5px solid #FCD34D",
                      color: "#92400E",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, mb: 0.5 }}
                    >
                      📢 Official Notice: {todayPostponement.reason}
                    </Typography>
                    {todayPostponement.rescheduled_date && (
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, mt: 0.5 }}
                      >
                        🗓️ Rescheduled Draw Date:{" "}
                        {todayPostponement.rescheduled_date}
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* ============================================================= */}
                {/* CASE B: PRE-DRAW (BEFORE 3:00 PM) COUNTDOWN & SCHEDULE STATE  */}
                {/* ============================================================= */}
                {isPreDraw && (
                  <Box sx={{ mb: 3 }}>
                    {/* Modern Digital Countdown Timer Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: "16px",
                        background:
                          "linear-gradient(135deg, #0B3C5D 0%, #06283D 100%)",
                        color: "#FFFFFF",
                        mb: 3,
                        boxShadow: "0 10px 28px rgba(11, 60, 93, 0.28)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <HourglassTopIcon
                            sx={{ color: "#FBBF24", fontSize: 22 }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: "1.05rem",
                              color: "#FBBF24",
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            Live Draw Countdown ({currentDrawTime})
                          </Typography>
                        </Box>
                        <Chip
                          label="Official IST Time"
                          size="small"
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.15)",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            borderRadius: "6px",
                          }}
                        />
                      </Box>

                      {/* 3 Digital Countdown Clocks (Hours : Mins : Secs) */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: { xs: 1.5, sm: 2.5 },
                        }}
                      >
                        {/* Hours */}
                        <Box
                          sx={{
                            flex: 1,
                            maxWidth: 140,
                            textAlign: "center",
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            py: { xs: 1.5, sm: 2 },
                            borderRadius: "14px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'Geist Mono', monospace, sans-serif",
                              fontWeight: 900,
                              fontSize: { xs: "2rem", sm: "2.8rem" },
                              color: "#FFFFFF",
                              lineHeight: 1,
                            }}
                          >
                            {String(countdown.hours).padStart(2, "0")}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "rgba(255, 255, 255, 0.75)",
                              textTransform: "uppercase",
                              mt: 0.5,
                              letterSpacing: "0.08em",
                            }}
                          >
                            Hours
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "2rem",
                            color: "rgba(255, 255, 255, 0.4)",
                          }}
                        >
                          :
                        </Typography>

                        {/* Minutes */}
                        <Box
                          sx={{
                            flex: 1,
                            maxWidth: 140,
                            textAlign: "center",
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            py: { xs: 1.5, sm: 2 },
                            borderRadius: "14px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'Geist Mono', monospace, sans-serif",
                              fontWeight: 900,
                              fontSize: { xs: "2rem", sm: "2.8rem" },
                              color: "#FFFFFF",
                              lineHeight: 1,
                            }}
                          >
                            {String(countdown.minutes).padStart(2, "0")}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "rgba(255, 255, 255, 0.75)",
                              textTransform: "uppercase",
                              mt: 0.5,
                              letterSpacing: "0.08em",
                            }}
                          >
                            Minutes
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "2rem",
                            color: "rgba(255, 255, 255, 0.4)",
                          }}
                        >
                          :
                        </Typography>

                        {/* Seconds */}
                        <Box
                          sx={{
                            flex: 1,
                            maxWidth: 140,
                            textAlign: "center",
                            bgcolor: "rgba(251, 191, 36, 0.18)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(251, 191, 36, 0.4)",
                            py: { xs: 1.5, sm: 2 },
                            borderRadius: "14px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'Geist Mono', monospace, sans-serif",
                              fontWeight: 900,
                              fontSize: { xs: "2rem", sm: "2.8rem" },
                              color: "#FBBF24",
                              lineHeight: 1,
                            }}
                          >
                            {String(countdown.seconds).padStart(2, "0")}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "#FDE68A",
                              textTransform: "uppercase",
                              mt: 0.5,
                              letterSpacing: "0.08em",
                            }}
                          >
                            Seconds
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Pre-Draw Jackpot Announcement & Live Publishing Information */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: "16px",
                        bgcolor: "#F8FAFC",
                        border: "1.5px solid #E2E8F0",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 2.5,
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.8,
                          }}
                        >
                          <EmojiEventsIcon
                            sx={{ color: "#D97706", fontSize: 24 }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: "1.1rem",
                              color: "#0F172A",
                            }}
                          >
                            1st Prize: {currentJackpotAmount}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "#475569",
                            fontSize: "0.88rem",
                            lineHeight: 1.6,
                            maxWidth: 520,
                          }}
                        >
                          Today&apos;s official draw for{" "}
                          <strong>
                            {todayLottery.name} ({todayLottery.code})
                          </strong>{" "}
                          will take place at <strong>{currentDrawTime}</strong>.
                          Full winning results will be published automatically
                          right here at{" "}
                          <strong>
                            {isTodayBumper ? "2:10 PM" : "3:10 PM"}
                          </strong>
                          .
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        <Button
                          onClick={() => setHeroSlideIndex(1)}
                          variant="outlined"
                          size="small"
                          startIcon={<HistoryIcon />}
                          sx={{
                            fontWeight: 800,
                            borderRadius: "10px",
                            color: "#0B3C5D",
                            borderColor: "#93C5FD",
                            bgcolor: "#EFF6FF",
                            textTransform: "none",
                            py: 1,
                            px: 2,
                            whiteSpace: "nowrap",
                            "&:hover": {
                              bgcolor: "#DBEAFE",
                              borderColor: "#60A5FA",
                            },
                          }}
                        >
                          View Yesterday&apos;s Results
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* ============================================================= */}
                {/* CASE C: LIVE DRAW IN PROGRESS (AFTER 3:00 PM, DRAWING LIVE)   */}
                {/* ============================================================= */}
                {isLiveInProgress && (
                  <Box sx={{ mb: 3 }}>
                    <Alert
                      severity="info"
                      icon={
                        <BoltIcon sx={{ color: "#E11D48", fontSize: 24 }} />
                      }
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: "14px",
                        bgcolor: "#FEF2F2",
                        border: "1.5px solid #FECACA",
                        color: "#991B1B",
                        fontWeight: 700,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        Drawing is currently in progress at Gorky Bhavan,
                        Thiruvananthapuram...
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.84rem", mt: 0.3, color: "#7F1D1D" }}
                      >
                        Results will update automatically on this page as each
                        prize tier is drawn.
                      </Typography>
                    </Alert>

                    {/* Live Hero Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: "16px",
                        background:
                          "linear-gradient(135deg, #0B3C5D 0%, #06283D 100%)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        gap: 3,
                        boxShadow: "0 10px 28px rgba(11, 60, 93, 0.28)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2.5,
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 68,
                            height: 68,
                            borderRadius: "16px",
                            bgcolor: "rgba(251, 191, 36, 0.15)",
                            border: "1.5px solid rgba(251, 191, 36, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <EmojiEventsIcon
                            sx={{ color: "#FBBF24", fontSize: 38 }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              color: "#FBBF24",
                              fontWeight: 900,
                              fontSize: "0.98rem",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            1st Prize ({currentJackpotAmount})
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "'Geist Mono', monospace, sans-serif",
                              fontWeight: 900,
                              fontSize: { xs: "1.8rem", sm: "2.4rem" },
                              color: "#FFFFFF",
                              letterSpacing: "0.04em",
                              lineHeight: 1.2,
                              mt: 0.5,
                            }}
                          >
                            {hasFirstPrize
                              ? firstPrizeTicket
                              : "DRAWING IN PROGRESS..."}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* ============================================================= */}
                {/* CASE D: PUBLISHED RESULTS (TODAY PUBLISHED OR PREVIOUS DRAW)  */}
                {/* ============================================================= */}
                {hasTodayResult && activeDraw && (
                  <Box>
                    {/* 1st Prize Hero Box (Deep Navy Gradient Box) */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3.5, xl: 4 },
                        borderRadius: "16px",
                        background:
                          "linear-gradient(135deg, #0B3C5D 0%, #06283D 100%)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        gap: 3,
                        mb: 3,
                        boxShadow: "0 10px 28px rgba(11, 60, 93, 0.28)",
                      }}
                    >
                      {/* Left: 1st Prize & Big Ticket Number */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2.5,
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 68,
                            height: 68,
                            borderRadius: "16px",
                            bgcolor: "rgba(251, 191, 36, 0.15)",
                            border: "1.5px solid rgba(251, 191, 36, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <EmojiEventsIcon
                            sx={{ color: "#FBBF24", fontSize: 38 }}
                          />
                        </Box>
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#FBBF24",
                                fontWeight: 900,
                                fontSize: "0.98rem",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              1st Prize
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontFamily: "'Geist Mono', monospace, sans-serif",
                              fontWeight: 900,
                              fontSize: {
                                xs: "2.2rem",
                                sm: "2.8rem",
                                md: "3.2rem",
                                xl: "3.6rem",
                              },
                              color: "#FFFFFF",
                              letterSpacing: "0.04em",
                              lineHeight: 1.1,
                              textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                              userSelect: "text",
                            }}
                          >
                            {hasFirstPrize ? firstPrizeTicket : "PENDING"}
                          </Typography>

                          {/* Winner Location & Agent info if available */}
                          {(firstPrizeLocation || firstPrizeAgent) && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                mt: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              {firstPrizeLocation && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <LocationOnIcon
                                    sx={{ color: "#FDE68A", fontSize: 16 }}
                                  />
                                  <Typography
                                    sx={{
                                      color: "rgba(255, 255, 255, 0.9)",
                                      fontSize: "0.82rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {firstPrizeLocation}
                                  </Typography>
                                </Box>
                              )}
                              {firstPrizeAgent && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <PersonIcon
                                    sx={{ color: "#FDE68A", fontSize: 16 }}
                                  />
                                  <Typography
                                    sx={{
                                      color: "rgba(255, 255, 255, 0.9)",
                                      fontSize: "0.82rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Agent: {firstPrizeAgent}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Vertical Divider */}
                      <Box
                        sx={{
                          display: { xs: "none", sm: "block" },
                          width: "1px",
                          height: 76,
                          bgcolor: "rgba(255, 255, 255, 0.18)",
                        }}
                      />

                      {/* Right: Prize Amount & In Words */}
                      <Box
                        sx={{
                          textAlign: { xs: "left", sm: "right" },
                          minWidth: { sm: 260 },
                        }}
                      >
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.75)",
                            fontWeight: 700,
                            fontSize: "0.92rem",
                          }}
                        >
                          Prize Amount
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: {
                              xs: "1.8rem",
                              sm: "2.2rem",
                              md: "2.6rem",
                              xl: "2.85rem",
                            },
                            color: "#FBBF24",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.15,
                          }}
                        >
                          {currentJackpotAmount}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#FDE68A",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            mt: 0.3,
                          }}
                        >
                          {currentJackpotInWords}
                        </Typography>
                      </Box>
                    </Paper>

                    {/* Consolation Prizes Section (Render only if present in DB) */}
                    {consolationPrizesList.length > 0 && (
                      <Box sx={{ mb: allPrizeTiersList.length > 0 ? 3 : 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.8,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CardGiftcardIcon
                              sx={{ color: "#0B3C5D", fontSize: 22 }}
                            />
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "1rem",
                                color: "#0F172A",
                              }}
                            >
                              Consolation Prizes{" "}
                              {consolationAmount && (
                                <Box
                                  component="span"
                                  sx={{
                                    color: "#64748B",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  ({consolationAmount} each)
                                </Box>
                              )}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "#64748B",
                            }}
                          >
                            {consolationPrizesList.length} Prizes
                          </Typography>
                        </Box>

                        {/* Grid of Consolation Numbers */}
                        <Grid container spacing={1.5}>
                          {consolationPrizesList.map((ticket, idx) => (
                            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={idx}>
                              <Paper
                                elevation={0}
                                sx={{
                                  py: 1.4,
                                  px: 1,
                                  textAlign: "center",
                                  borderRadius: "10px",
                                  bgcolor: "#F8FAFC",
                                  border: "1px solid #E2E8F0",
                                  userSelect: "text",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily:
                                      "'Geist Mono', monospace, sans-serif",
                                    fontWeight: 800,
                                    fontSize: "0.95rem",
                                    color: "#1E293B",
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {ticket}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* All Remaining Prize Tiers List (2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th) */}
                    {allPrizeTiersList.length > 0 && (
                      <Box
                        sx={{ mt: 3, pt: 3, borderTop: "1px dashed #CBD5E1" }}
                      >
                        <Grid container spacing={2.5}>
                          {allPrizeTiersList.map((tier) => {
                            const isHighTier =
                              tier.key === "2nd" || tier.key === "3rd";
                            const isLargeGrid = tier.numbers.length > 15;
                            return (
                              <Grid
                                size={{
                                  xs: 12,
                                  md: isHighTier ? 6 : isLargeGrid ? 12 : 6,
                                }}
                                key={tier.key}
                              >
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: { xs: 2, sm: 2.5 },
                                    borderRadius: "14px",
                                    bgcolor: "#FFFFFF",
                                    border: "1px solid #E2E8F0",
                                    boxShadow:
                                      "0 2px 8px rgba(15, 23, 42, 0.03)",
                                    height: "100%",
                                    transition:
                                      "border-color 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": {
                                      borderColor: "#CBD5E1",
                                      boxShadow:
                                        "0 4px 14px rgba(15, 23, 42, 0.06)",
                                    },
                                  }}
                                >
                                  {/* Tier Header */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 1.8,
                                      flexWrap: "wrap",
                                      gap: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.2,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: "50%",
                                          bgcolor: tier.dotBg,
                                          boxShadow: `0 0 0 3px ${tier.badgeBg}`,
                                        }}
                                      />
                                      <Typography
                                        sx={{
                                          fontWeight: 900,
                                          fontSize: {
                                            xs: "0.95rem",
                                            sm: "1.02rem",
                                          },
                                          color: "#0F172A",
                                        }}
                                      >
                                        {tier.label}
                                      </Typography>
                                      {tier.amount && (
                                        <Chip
                                          label={tier.amount}
                                          size="small"
                                          sx={{
                                            bgcolor: tier.badgeBg,
                                            color: tier.badgeColor,
                                            fontWeight: 800,
                                            fontSize: "0.78rem",
                                            height: 24,
                                            borderRadius: "6px",
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        color: "#64748B",
                                      }}
                                    >
                                      {tier.numbers.length}{" "}
                                      {tier.numbers.length === 1
                                        ? "Prize"
                                        : "Prizes"}
                                    </Typography>
                                  </Box>

                                  {/* Numbers Grid */}
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns: {
                                        xs: isHighTier
                                          ? "repeat(auto-fill, minmax(110px, 1fr))"
                                          : "repeat(auto-fill, minmax(68px, 1fr))",
                                        sm: isHighTier
                                          ? "repeat(auto-fill, minmax(130px, 1fr))"
                                          : "repeat(auto-fill, minmax(78px, 1fr))",
                                        md: isHighTier
                                          ? "repeat(auto-fill, minmax(140px, 1fr))"
                                          : "repeat(auto-fill, minmax(82px, 1fr))",
                                      },
                                      gap: 1,
                                    }}
                                  >
                                    {tier.numbers.map((num, idx) => (
                                      <Box
                                        key={idx}
                                        sx={{
                                          py: isHighTier ? 1.2 : 0.85,
                                          px: 1,
                                          textAlign: "center",
                                          borderRadius: "8px",
                                          bgcolor: "#F8FAFC",
                                          border: "1px solid #E2E8F0",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          userSelect: "text",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontFamily:
                                              "'Geist Mono', monospace, sans-serif",
                                            fontWeight: 800,
                                            fontSize: isHighTier
                                              ? "0.95rem"
                                              : "0.9rem",
                                            color: isHighTier
                                              ? "#0F172A"
                                              : "#1E293B",
                                            letterSpacing: "0.03em",
                                          }}
                                        >
                                          {num}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            )}
          </Grid>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Sidebar (Today's Lottery Info, Quick Links & Calendar)   */}
          {/* --------------------------------------------------------------------- */}
          <Grid size={{ xs: 12, lg: 4, xl: 3.8 }}>
            {isLoading ? (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3, xl: 3.8 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                }}
              >
                {/* Header Skeleton */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Skeleton variant="text" width={150} height={30} />
                  <Skeleton
                    variant="rounded"
                    width={90}
                    height={24}
                    sx={{ borderRadius: "12px" }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Skeleton variant="text" width={100} height={22} />
                      <Skeleton variant="text" width={120} height={22} />
                    </Box>
                  ))}
                </Box>
                <Skeleton
                  variant="rounded"
                  height={42}
                  sx={{ borderRadius: "8px", mb: 3 }}
                />
                <Skeleton
                  variant="rounded"
                  height={260}
                  sx={{ borderRadius: "16px" }}
                />
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3, xl: 3.8 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <CalendarMonthIcon
                      sx={{ color: "#0B3C5D", fontSize: 26 }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1.25rem",
                        color: "#0F172A",
                      }}
                    >
                      {isToday ? "Today's Lottery" : "Draw Details"}
                    </Typography>
                  </Box>

                  {isPostponed ? (
                    <Chip
                      icon={
                        <WarningAmberIcon
                          sx={{ fontSize: "14px !important", color: "#D97706" }}
                        />
                      }
                      label="Postponed"
                      size="small"
                      sx={{
                        bgcolor: "#FEF3C7",
                        color: "#92400E",
                        border: "1px solid #FCD34D",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "12px",
                      }}
                    />
                  ) : isPreDraw ? (
                    <Chip
                      icon={
                        <AccessTimeIcon
                          sx={{ fontSize: "14px !important", color: "#2563EB" }}
                        />
                      }
                      label="Upcoming Draw"
                      size="small"
                      sx={{
                        bgcolor: "#EFF6FF",
                        color: "#1D4ED8",
                        border: "1px solid #BFDBFE",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "12px",
                      }}
                    />
                  ) : isLiveInProgress ? (
                    <Chip
                      icon={
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: "#DC2626",
                            animation: "pulseDot 1.2s infinite",
                          }}
                        />
                      }
                      label="Live Draw"
                      size="small"
                      sx={{
                        bgcolor: "#FEF2F2",
                        color: "#991B1B",
                        border: "1px solid #FECACA",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "12px",
                      }}
                    />
                  ) : (
                    <Chip
                      icon={
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: "#10B981",
                          }}
                        />
                      }
                      label={isToday ? "Result Updated" : "Official Result"}
                      size="small"
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#065F46",
                        border: "1px solid #A7F3D0",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        borderRadius: "12px",
                      }}
                    />
                  )}
                </Box>

                {/* Lottery Key-Value Specs */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {/* Row 1: Lottery Name */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BadgeIcon sx={{ color: "#64748B", fontSize: 19 }} />
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Lottery Name
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "#0F172A",
                      }}
                    >
                      {currentLotteryName} ({currentLotteryCode})
                    </Typography>
                  </Box>

                  {/* Row 2: Draw No */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TrackChangesIcon
                        sx={{ color: "#64748B", fontSize: 19 }}
                      />
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Draw No.
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "#0F172A",
                      }}
                    >
                      {currentDrawNumber || `${currentLotteryCode}`}
                    </Typography>
                  </Box>

                  {/* Row 3: Draw Date */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonthIcon
                        sx={{ color: "#64748B", fontSize: 19 }}
                      />
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Draw Date
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "#0F172A",
                      }}
                    >
                      {formatFullDate(currentDrawDate)}
                    </Typography>
                  </Box>

                  {/* Row 4: Draw Time */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon sx={{ color: "#64748B", fontSize: 19 }} />
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Draw Time
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "#0F172A",
                      }}
                    >
                      {currentDrawTime}
                    </Typography>
                  </Box>
                </Box>

                {/* Divider */}
                <Box sx={{ height: "1px", bgcolor: "#E2E8F0", my: 2.5 }} />

                {/* Quick Links */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <LinkIcon sx={{ color: "#0B3C5D", fontSize: 18 }} />
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "#0F172A",
                      }}
                    >
                      Quick Links
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      component={Link}
                      href={getLotteryUrl(currentLotteryCode)}
                      size="small"
                      startIcon={<ArticleIcon fontSize="small" />}
                      sx={{
                        flex: 1,
                        minWidth: 95,
                        bgcolor: "#F8FAFC",
                        color: "#334155",
                        border: "1px solid #E2E8F0",
                        fontWeight: 700,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.82rem",
                        py: 0.85,
                        "&:hover": {
                          bgcolor: "#F1F5F9",
                          borderColor: "#CBD5E1",
                        },
                      }}
                    >
                      All Results
                    </Button>

                    <Button
                      component={Link}
                      href="/kerala-lottery-app"
                      size="small"
                      startIcon={<MonetizationOnIcon fontSize="small" />}
                      sx={{
                        flex: 1,
                        minWidth: 110,
                        bgcolor: "#F8FAFC",
                        color: "#334155",
                        border: "1px solid #E2E8F0",
                        fontWeight: 700,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.82rem",
                        py: 0.85,
                        "&:hover": {
                          bgcolor: "#F1F5F9",
                          borderColor: "#CBD5E1",
                        },
                      }}
                    >
                      Download App
                    </Button>

                    <Button
                      component="a"
                      href={`/api/pdf/${currentLotteryCode}/${currentDrawDate}`}
                      download={`kerala-lottery-${currentLotteryCode}-${currentDrawDate}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      startIcon={<PictureAsPdfIcon fontSize="small" />}
                      sx={{
                        flex: 1,
                        minWidth: 100,
                        bgcolor: "#F8FAFC",
                        color: "#334155",
                        border: "1px solid #E2E8F0",
                        fontWeight: 700,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.82rem",
                        py: 0.85,
                        "&:hover": {
                          bgcolor: "#F1F5F9",
                          borderColor: "#CBD5E1",
                        },
                      }}
                    >
                      Today&apos;s PDF
                    </Button>
                  </Box>
                </Box>

                {/* Interactive Full Month Calendar Widget */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonthIcon
                        sx={{ color: "#0B3C5D", fontSize: 20 }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.98rem",
                          color: "#0F172A",
                        }}
                      >
                        {currentMonthYearHeader}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCalendarViewDate(
                            (prev) =>
                              new Date(
                                prev.getFullYear(),
                                prev.getMonth() - 1,
                                1,
                              ),
                          )
                        }
                        sx={{
                          width: 30,
                          height: 30,
                          border: "1px solid #E2E8F0",
                          borderRadius: "6px",
                        }}
                      >
                        <ChevronLeftIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCalendarViewDate(
                            (prev) =>
                              new Date(
                                prev.getFullYear(),
                                prev.getMonth() + 1,
                                1,
                              ),
                          )
                        }
                        sx={{
                          width: 30,
                          height: 30,
                          border: "1px solid #E2E8F0",
                          borderRadius: "6px",
                        }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Day Headers Row */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      textAlign: "center",
                      gap: 0.5,
                      mb: 1.2,
                    }}
                  >
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, idx) => (
                        <Typography
                          key={idx}
                          sx={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: "#94A3B8",
                          }}
                        >
                          {day}
                        </Typography>
                      ),
                    )}
                  </Box>

                  {/* Full Month Grid Days */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      textAlign: "center",
                      gap: 0.5,
                    }}
                  >
                    {fullMonthGridDays.map((item, idx) => {
                      const isItemToday = item.dateStr === todayISTDate;
                      const isSelected = item.dateStr === selectedCalendarDate;
                      const isClickable = item.hasResult;

                      return (
                        <Box
                          key={idx}
                          onClick={() => {
                            if (isClickable) {
                              handleCalendarDateClick(item.dateStr);
                            }
                          }}
                          sx={{
                            py: 0.8,
                            cursor: isClickable ? "pointer" : "not-allowed",
                            pointerEvents: isClickable ? "auto" : "none",
                            borderRadius: "50%",
                            width: 34,
                            height: 34,
                            mx: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight:
                              isItemToday || isSelected
                                ? 800
                                : isClickable
                                  ? 700
                                  : 500,
                            fontSize: "0.85rem",
                            transition: "all 0.15s ease",
                            opacity: isClickable ? 1 : 0.3,
                            bgcolor: isItemToday
                              ? "#0B3C5D"
                              : isSelected && isClickable
                                ? "#1E293B"
                                : "transparent",
                            color:
                              isItemToday || (isSelected && isClickable)
                                ? "#FFFFFF"
                                : isClickable
                                  ? "#0F172A"
                                  : "#94A3B8",
                            "&:hover": isClickable
                              ? {
                                  bgcolor:
                                    isItemToday || isSelected
                                      ? "#072840"
                                      : "#F1F5F9",
                                  transform: "scale(1.08)",
                                }
                              : {},
                          }}
                        >
                          {item.dayNum}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
