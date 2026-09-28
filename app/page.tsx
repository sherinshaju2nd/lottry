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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
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
  getLotteryLogo,
  getLotteryLogoAlt,
  supabase,
  formatTicketSearchInput,
  hasAnyDrawResult,
  calculateDrawCountdown,
  getIsAfterDrawTime,
  getIsBeforeSwitchTime,
  getIsPollingWindow,
  getDrawTimeDisplay,
} from "@/lib/supabase";
import ShareButtons from "@/components/ShareButtons";
import AiSocialDigestModal from "@/components/AiSocialDigestModal";
import HomeNormalView from "@/components/HomeNormalView";
import HomeDesktopModernView from "@/components/HomeDesktopModernView";
import GridViewIcon from "@mui/icons-material/GridView";
import DashboardIcon from "@mui/icons-material/Dashboard";
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
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));

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
  const todayCodeRef = useRef<string>("");
  const todayDrawResultRef = useRef<StructuredDrawResult | null>(null);
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

  const [allDraws, setAllDraws] = useState<StructuredDrawResult[]>([]);
  const [uiMode, setUiMode] = useState<"normal" | "modern">("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("kerala_lottery_ui_mode");
      if (saved === "normal" || saved === "modern") {
        setUiMode(saved as "normal" | "modern");
      }
    } catch {}

    const handleUiModeChange = (e: any) => {
      const mode = e?.detail?.mode || localStorage.getItem("kerala_lottery_ui_mode");
      if (mode === "normal" || mode === "modern") {
        setUiMode(mode as "normal" | "modern");
      }
    };
    window.addEventListener("kerala_ui_mode_changed", handleUiModeChange);
    return () => {
      window.removeEventListener("kerala_ui_mode_changed", handleUiModeChange);
    };
  }, []);

  const handleSetUiMode = (mode: "normal" | "modern") => {
    setUiMode(mode);
    try {
      localStorage.setItem("kerala_lottery_ui_mode", mode);
      document.documentElement.setAttribute("data-ui-mode", mode);
      window.dispatchEvent(
        new CustomEvent("kerala_ui_mode_changed", { detail: { mode } })
      );
    } catch {}
  };

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

    const initialBumper = BUMPER_LOTTERIES.find(
      (b: any) => b.draw_date === todayISTDate,
    );
    if (initialBumper) {
      todayCodeRef.current = initialBumper.code;
      isTodayBumperRef.current = true;
      setIsTodayBumper(true);
      setTodayBumperInfo(initialBumper as any);
      setTodayLottery({
        day: initialBumper.day || "Bumper Draw",
        name: initialBumper.name,
        nameMl: initialBumper.nameMl || initialBumper.name,
        code: initialBumper.code,
        drawTime: "2:00 PM",
        is_bumper: true,
        jackpot: initialBumper.jackpot || "₹25 Crore",
        ticket_price: "₹500",
        draw_season: initialBumper.draw_season || initialBumper.day,
      });
    } else {
      todayCodeRef.current = matched.code;
      setTodayLottery(matched);
    }

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
              jackpot:
                d.jackpot ||
                WEEKLY_LOTTERIES.find((w) => w.code === d.code)?.jackpot ||
                "₹1 Crore",
              ticket_price:
                d.ticket_price ||
                WEEKLY_LOTTERIES.find((w) => w.code === d.code)?.ticket_price ||
                "₹50",
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
            todayCodeRef.current = todayBumper.code;
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
            // Auto-switch hero tab: 15 mins before 2:00 PM (1:45 PM IST) or later -> Today's Draw (0)
            const isBeforeSwitch = getIsBeforeSwitchTime(true);
            setHeroSlideIndex(isBeforeSwitch ? 1 : 0);
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
            todayCodeRef.current = matchedDb.code;
            setTodayLottery(matchedDb);
            checkTodayData(matchedDb.code);
            // Auto-switch hero tab: 15 mins before 3:00 PM (2:45 PM IST) or later -> Today's Draw (0)
            const isBeforeSwitch = getIsBeforeSwitchTime(false);
            setHeroSlideIndex(isBeforeSwitch ? 1 : 0);
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

    // Calculate IST time to determine default banner tab:
    // Before 15-min threshold (2:45 PM for regular, 1:45 PM for bumper) -> Previous Day Result (1), After threshold -> Today's Draw (0)
    try {
      const isInitialBumper = BUMPER_LOTTERIES.some(
        (b: any) => b.draw_date === todayISTDate,
      );
      const isBeforeSwitch = getIsBeforeSwitchTime(isInitialBumper);
      setHeroSlideIndex(isBeforeSwitch ? 1 : 0);
    } catch {
      setHeroSlideIndex(0);
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
        const targetCode = codeToFetch || todayCodeRef.current;
        if (!targetCode) return;
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
          todayDrawResultRef.current = json.result;
        } else if (!json.result || !hasAnyDrawResult(json.result)) {
          // Never overwrite existing valid confirmed result for today with null
          if (!todayDrawResultRef.current || !hasAnyDrawResult(todayDrawResultRef.current)) {
            setTodayDrawResult(null);
            todayDrawResultRef.current = null;
          }
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
          setAllDraws(json.results);
          const todayDate = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });

          // Check if today's result is in allDraws
          const todayResultFromAll = json.results.find(
            (d: StructuredDrawResult) => d.draw_date === todayDate && hasAnyDrawResult(d)
          );
          if (todayResultFromAll) {
            setTodayDrawResult(todayResultFromAll);
            todayDrawResultRef.current = todayResultFromAll;
          }

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
                  todayDrawResultRef.current = liveStructuredDraw;
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
    <Box sx={{ width: "100%", overflowX: "hidden", minHeight: "100vh", bgcolor: "#FFFFFF" }}>
      {/* 1. Mobile Normal UI (2-column quick grid) */}
      <Box className="home-normal-view" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 }, bgcolor: "#FFFFFF" }}>
        <HomeNormalView
          todayLottery={todayLottery}
          todayISTDate={todayISTDate}
          todayDrawResult={todayDrawResult}
          allDraws={allDraws}
          isLoading={isLoading}
          isTodayBumper={isTodayBumper}
          isAfter3PM={isAfter3PM}
        />
      </Box>

      {/* 2. Modern Dashboard View (Updated New Desktop Design) */}
      <Box className="home-modern-view">
        <HomeDesktopModernView
          todayLottery={todayLottery}
          lotteriesList={lotteriesList}
          bumperLotteriesList={bumperLotteriesList}
          todayDayName={todayDayName}
          isTodayBumper={isTodayBumper}
          todayBumperInfo={todayBumperInfo}
          todayDrawResult={todayDrawResult}
          todayPostponement={todayPostponement}
          allDraws={allDraws}
          recentDrawsMap={recentDrawsMap}
          latestPreviousDraw={latestPreviousDraw}
          isLoading={isLoading}
          isAfter3PM={isAfter3PM}
          socketStatus={socketStatus}
          countdown={countdown}
          todayISTDate={todayISTDate}
          yesterdayISTDate={yesterdayISTDate}
          onSearchSubmit={onSearchSubmit}
          isSearching={isSearching}
          register={register}
          handleSubmit={handleSubmit}
          setValue={setValue}
          errors={errors}
          heroSlideIndex={heroSlideIndex}
          setHeroSlideIndex={setHeroSlideIndex}
        />
      </Box>

      {/* ========================================================================= */}
      {/* SEO & Comprehensive Information Section (Modern Clean Layout)               */}
      {/* ========================================================================= */}
      <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }, pt: 0, pb: 8, bgcolor: "#FFFFFF" }}>
        <Box sx={{ mt: "50px", mb: 4 }}>
          {/* Section Header: Title & Badges */}
          <Box sx={{ mb: { xs: 3.5, md: 4.5 }, textAlign: { xs: "left", md: "center" } }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(11, 60, 93, 0.06)",
                border: "1px solid rgba(11, 60, 93, 0.15)",
                px: 2,
                py: 0.7,
                borderRadius: "30px",
                mb: 2,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16, color: "#0B3C5D" }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  color: "#0B3C5D",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Official 2026 Government Information &amp; Schedule
              </Typography>
            </Box>

            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 900,
                color: "#0A2540",
                fontSize: { xs: "1.6rem", sm: "2.1rem", md: "2.55rem" },
                letterSpacing: "-0.03em",
                lineHeight: 1.25,
                mb: 1.5,
              }}
            >
              Live Kerala Lottery Result Today 2026: Daily Draw Chart
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#475569",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                maxWidth: 820,
                mx: { xs: 0, md: "auto" },
                lineHeight: 1.65,
              }}
            >
              Official live draw timings, daily prize charts, bumper schedules, and claim procedures directly from the Directorate of Kerala State Lotteries (केरल लॉटरी के नतीजे / கேரளா லாட்டரி குலுக்கல்).
            </Typography>
          </Box>

          {/* 1. Quick Facts Bento Grid (6 Interactive Cards) */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: "#F8FAFC",
              borderRadius: "22px",
              border: "1px solid #E2E8F0",
              mb: 5,
              boxShadow: "0 6px 20px rgba(11, 60, 93, 0.03)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 2.5, px: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#0B3C5D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: "#0A2540",
                    fontSize: { xs: "1.02rem", sm: "1.15rem" },
                    letterSpacing: "-0.01em",
                  }}
                >
                  Kerala Lottery Quick Facts &amp; Draw Standards
                </Typography>
              </Box>

              <Chip
                label="Updated for 2026 Cycle"
                size="small"
                sx={{
                  bgcolor: "#DCFCE7",
                  color: "#15803D",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  borderRadius: "20px",
                  border: "1px solid #86EFAC",
                }}
              />
            </Box>

            <Grid container spacing={2}>
              {[
                {
                  icon: <AccessTimeIcon sx={{ color: "#0284C7", fontSize: 22 }} />,
                  iconBg: "#E0F2FE",
                  label: "Today's Live Draw Time",
                  value: "Starts at 2:55 PM IST daily",
                  desc: "Live stream telecast commences from Gorky Bhavan.",
                },
                {
                  icon: <PictureAsPdfIcon sx={{ color: "#DC2626", fontSize: 22 }} />,
                  iconBg: "#FEE2E2",
                  label: "Official Gazette PDF",
                  value: "Published at 4:00 PM IST",
                  desc: "Signed Government Gazette document published daily.",
                },
                {
                  icon: <PlaceIcon sx={{ color: "#059669", fontSize: 22 }} />,
                  iconBg: "#D1FAE5",
                  label: "Live Venue Location",
                  value: "Gorky Bhavan, Trivandrum",
                  desc: "Near Bakery Junction, Thiruvananthapuram, Kerala.",
                },
                {
                  icon: <AccountBalanceIcon sx={{ color: "#2563EB", fontSize: 22 }} />,
                  iconBg: "#DBEAFE",
                  label: "Governing Authority",
                  value: "Directorate of State Lotteries",
                  desc: "Taxes Department, Government of Kerala.",
                },
                {
                  icon: <EmojiEventsIcon sx={{ color: "#D97706", fontSize: 22 }} />,
                  iconBg: "#FEF3C7",
                  label: "Active Draw Schemes",
                  value: "7 Weekly + 6 Seasonal Bumpers",
                  desc: "Bhagyathara, Sthree-Sakthi, Dhanalekshmi & series.",
                },
                {
                  icon: <ConfirmationNumberIcon sx={{ color: "#7C3AED", fontSize: 22 }} />,
                  iconBg: "#EDE9FE",
                  label: "Ticket Price & Format",
                  value: "₹50 Physical Paper Ticket",
                  desc: "Online digital purchase is strictly unauthorized.",
                },
              ].map((fact, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: "16px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.8,
                      transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 25px rgba(11, 60, 93, 0.08)",
                        borderColor: "#93C5FD",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "10px",
                          bgcolor: fact.iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {fact.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: "#64748B",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            fontSize: "0.7rem",
                            display: "block",
                          }}
                        >
                          {fact.label}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: "#0F172A",
                            fontSize: "0.92rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {fact.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        fontSize: "0.82rem",
                        lineHeight: 1.45,
                        mt: 0.3,
                      }}
                    >
                      {fact.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 2. Weekly Schedule & Results Infographic Chart */}
          <Box
            sx={{
              width: "100%",
              maxWidth: 860,
              mx: "auto",
              mb: 5,
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #E2E8F0",
              bgcolor: "#F8FAFC",
              p: { xs: 1.5, sm: 2.5 },
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, px: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonthIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: "#0B3C5D", fontSize: "0.88rem" }}>
                  Weekly Schedule &amp; Results Infographic Poster
                </Typography>
              </Box>
              <Chip
                label="Official Chart"
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 700, fontSize: "0.7rem" }}
              />
            </Box>

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
                borderRadius: "14px",
                bgcolor: "#FFFFFF",
              }}
            />
          </Box>

          {/* 3. Welcome & Streaming Details + Verified Bookmark Callout */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="body1"
              sx={{
                color: "#334155",
                mb: 2,
                lineHeight: 1.8,
                fontSize: { xs: "0.98rem", sm: "1.05rem" },
              }}
            >
              Welcome to <strong>Kerala Lottery Results Today</strong> (केरल लॉटरी के नतीजे / கேரளா லாட்டரி குலுக்கல்), your trusted platform for instant daily draw updates. All draws are conducted by authorized lottery officials live at Gorky Bhavan, Near Bakery Junction, Thiruvananthapuram.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#334155",
                mb: 3,
                lineHeight: 1.8,
                fontSize: { xs: "0.98rem", sm: "1.05rem" },
              }}
            >
              The live streaming commences at <strong>2:55 PM IST</strong>, and winning numbers are drawn live starting at 3:00 PM. Following the draw conclusion, the full official Kerala lottery result chart and signed Gazette PDF are uploaded at <strong>4:00 PM IST</strong>.
            </Typography>

            {/* Bookmark & Verified Domain Callout Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.2, sm: 2.8 },
                borderRadius: "18px",
                background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                border: "1.5px solid #A7F3D0",
                boxShadow: "0 6px 22px rgba(16, 185, 129, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#059669",
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <BookmarkBorderIcon sx={{ fontSize: 24 }} />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: "#065F46", fontWeight: 800, fontSize: "0.95rem", mb: 0.3 }}>
                  Official Verified Bookmark Portal
                </Typography>
                <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.6, fontWeight: 500, fontSize: "0.88rem" }}>
                  Save and bookmark{" "}
                  <Link
                    href="https://www.keralalotteryresultstoday.in/"
                    style={{ color: "#047857", fontWeight: 800, textDecoration: "underline" }}
                  >
                    https://www.keralalotteryresultstoday.in/
                  </Link>{" "}
                  for daily live prize updates, yesterday&apos;s draw archives, and instant ticket barcode scanning.
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* 4. Official Weekly Draw Schedule & Prizes (Modern Glass Table) */}
          <Box sx={{ mb: 5, pt: 3, borderTop: "1px solid #F1F5F9" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
              <Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: 900, color: "#0A2540", letterSpacing: "-0.02em" }}
                >
                  Kerala Lottery Weekly Draw Schedule &amp; Prizes
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                  The Kerala State Lottery Department runs seven regular weekly lotteries across Monday to Sunday.
                </Typography>
              </Box>
              <Chip
                icon={<MilitaryTechIcon sx={{ color: "#D97706 !important" }} />}
                label="1st Prize: ₹1 Crore Guaranteed"
                sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 800, border: "1px solid #FDE68A" }}
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                mb: 2.5,
                boxShadow: "0 4px 18px rgba(11, 60, 93, 0.04)",
              }}
            >
              <TableContainer>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.8, fontSize: "0.85rem" }}>
                        LOTTERY NAME
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.8, fontSize: "0.85rem" }}>
                        DRAW DAY
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.8, fontSize: "0.85rem" }}>
                        CODE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.8, fontSize: "0.85rem" }}>
                        1ST PRIZE JACKPOT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.8, fontSize: "0.85rem" }}>
                        TICKET PRICE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#0B3C5D", py: 1.8, fontSize: "0.85rem", textAlign: "right" }}>
                        ACTION
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
                    ].map((row, idx) => (
                      <TableRow
                        key={row.code}
                        sx={{
                          bgcolor: idx % 2 === 1 ? "#FAFCFF" : "#FFFFFF",
                          transition: "background-color 0.15s ease",
                          "&:hover": { bgcolor: "#F0F7FF" },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800, py: 1.8 }}>
                          <Link
                            href={`/${row.slug}`}
                            style={{
                              color: "#0B3C5D",
                              textDecoration: "none",
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {row.name}
                            <ArrowForwardIcon sx={{ fontSize: 15, color: "#2563EB" }} />
                          </Link>
                        </TableCell>
                        <TableCell sx={{ color: "#334155", fontWeight: 600 }}>{row.day}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.code}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#EFF6FF",
                              color: "#1D4ED8",
                              borderRadius: "8px",
                              border: "1px solid #BFDBFE",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.prize}
                            size="small"
                            icon={<EmojiEventsIcon sx={{ fontSize: "14px !important", color: "#15803D !important" }} />}
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#DCFCE7",
                              color: "#15803D",
                              borderRadius: "8px",
                              border: "1px solid #86EFAC",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#475569", fontWeight: 700 }}>{row.cost}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>
                          <Button
                            component={Link}
                            href={`/${row.slug}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              textTransform: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              py: 0.4,
                              px: 1.4,
                              borderColor: "#CBD5E1",
                              color: "#0B3C5D",
                              "&:hover": { borderColor: "#0B3C5D", bgcolor: "rgba(11, 60, 93, 0.04)" },
                            }}
                          >
                            View Result
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: 1.8,
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <InfoOutlinedIcon sx={{ color: "#64748B", fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: "#475569", lineHeight: 1.5, fontSize: "0.8rem" }}>
                <strong>2026 Active Roster Note:</strong> Previous lotteries from earlier cycles (Fifty-Fifty, Win-Win, Nirmal, Akshaya) have transitioned into the 2026 series (Samrudhi, Suvarna Keralam, Dhanalekshmi, Bhagyathara).
              </Typography>
            </Box>
          </Box>

          {/* 5. Understanding Ticket Prize & Consolation Structure */}
          <Box sx={{ mb: 5, pt: 3, borderTop: "1px solid #F1F5F9" }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontWeight: 900, color: "#0A2540", mb: 1, letterSpacing: "-0.02em" }}
            >
              Understanding the Ticket Prize &amp; Consolation Structure
            </Typography>
            <Typography variant="body1" sx={{ color: "#475569", mb: 3, lineHeight: 1.7 }}>
              Kerala State Lotteries are authentic paper tickets containing a <strong>2-letter Alphabetical Series Code</strong> followed by a <strong>6-digit number</strong> (e.g., <code>BT 123456</code>).
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #FFFDF5 0%, #FEF9C3 100%)",
                    border: "1.5px solid #FDE68A",
                    boxShadow: "0 6px 20px rgba(217, 119, 6, 0.08)",
                    height: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "#F59E0B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                      }}
                    >
                      <MilitaryTechIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#92400E", fontSize: "1.05rem" }}>
                        1st Prize (Jackpot Winning Match)
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#B45309", fontWeight: 700 }}>
                        Exact Series + 6-Digit Number
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.65, mb: 2 }}>
                    Awarded exclusively to the single ticket that matches both the exact alphabetical series letter code and the 6-digit number drawn by the machine.
                  </Typography>

                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", px: 2, py: 0.8, borderRadius: "10px", border: "1px solid #FCD34D" }}>
                    <Typography sx={{ fontFamily: "monospace", fontWeight: 900, color: "#92400E", fontSize: "0.95rem" }}>
                      Example: BT 123456
                    </Typography>
                    <Chip label="₹1,00,00,000" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 800 }} />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #F8FAFF 0%, #EFF6FF 100%)",
                    border: "1.5px solid #BFDBFE",
                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.08)",
                    height: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "#2563EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E40AF", fontSize: "1.05rem" }}>
                        Consolation Prize (₹5,000 Each)
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#1D4ED8", fontWeight: 700 }}>
                        Matching 6 Digits in Remaining Series
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: "#1E3A8A", lineHeight: 1.65, mb: 2 }}>
                    Awarded to all ticket holders possessing the exact same 6-digit number across all non-jackpot printed series letters of that draw.
                  </Typography>

                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", px: 2, py: 0.8, borderRadius: "10px", border: "1px solid #BFDBFE" }}>
                    <Typography sx={{ fontFamily: "monospace", fontWeight: 900, color: "#1E40AF", fontSize: "0.95rem" }}>
                      Example: [Other Series] 123456
                    </Typography>
                    <Chip label="₹5,000 Payout" size="small" sx={{ bgcolor: "#DBEAFE", color: "#1E40AF", fontWeight: 800 }} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* 6. Kerala State Bumper Lotteries (6 Seasonal Editions) */}
          <Box sx={{ mb: 5, pt: 3, borderTop: "1px solid #F1F5F9" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
              <Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: 900, color: "#0A2540", letterSpacing: "-0.02em" }}
                >
                  Kerala State Bumper Lotteries Seasonal Calendar
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                  Massive festive bumper draws held throughout the year with jackpots ranging up to ₹25 Crore.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {[
                { month: "January", emoji: "🎄", name: "Christmas New Year Bumper", slug: "christmas-new-year-bumper", jackpot: "₹20 Crore", color: "#DC2626", bg: "#FEF2F2" },
                { month: "March", emoji: "☀️", name: "Summer Bumper", slug: "summer-bumper", jackpot: "₹10 Crore", color: "#D97706", bg: "#FFFBEB" },
                { month: "May", emoji: "🌸", name: "Vishu Bumper", slug: "vishu-bumper", jackpot: "₹12 Crore", color: "#7C3AED", bg: "#F5F3FF" },
                { month: "July", emoji: "🌧️", name: "Monsoon Bumper", slug: "monsoon-bumper", jackpot: "₹10 Crore", color: "#0284C7", bg: "#F0F9FF" },
                { month: "September", emoji: "🌼", name: "Thiruvonam Bumper", slug: "thiruvonam-bumper", jackpot: "₹25 Crore", color: "#059669", bg: "#ECFDF5" },
                { month: "November", emoji: "🪔", name: "Pooja Bumper", slug: "pooja-bumper", jackpot: "₹12 Crore", color: "#EA580C", bg: "#FFF7ED" },
              ].map((b, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "18px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 25px rgba(11, 60, 93, 0.08)",
                        borderColor: b.color,
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Chip
                          label={`${b.emoji} ${b.month} Draw`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: b.bg,
                            color: b.color,
                            fontSize: "0.72rem",
                            borderRadius: "8px",
                          }}
                        />
                        <Typography sx={{ fontWeight: 900, color: "#15803D", fontSize: "0.95rem" }}>
                          {b.jackpot}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0A2540", mt: 0.5, lineHeight: 1.3 }}>
                        <Link href={`/${b.slug}`} style={{ color: "#0A2540", textDecoration: "none" }}>
                          {b.name}
                        </Link>
                      </Typography>
                    </Box>

                    <Button
                      component={Link}
                      href={`/${b.slug}`}
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        mt: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#0B3C5D",
                        p: 0,
                        justifyContent: "flex-start",
                        "&:hover": { bgcolor: "transparent", color: "#2563EB" },
                      }}
                    >
                      View Bumper Details
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 7. Safety & Anti-Fraud Advisory */}
          <Box
            sx={{
              mb: 5,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "22px",
              bgcolor: "#FFFBEB",
              border: "1.5px solid #FCD34D",
              boxShadow: "0 8px 25px rgba(217, 119, 6, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
              <SecurityIcon sx={{ color: "#D97706", fontSize: 28 }} />
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 900,
                  color: "#92400E",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  letterSpacing: "-0.01em",
                }}
              >
                Government Consumer Protection &amp; Anti-Fraud Advisory
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #FDE68A",
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#DC2626", mb: 0.6, display: "flex", alignItems: "center", gap: 0.8 }}>
                    🚫 No Online Sales
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.6, fontSize: "0.86rem" }}>
                    The Government of Kerala strictly prohibits digital/online sales of lottery tickets. Physical paper tickets are the only valid legal format.
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #FDE68A",
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#D97706", mb: 0.6, display: "flex", alignItems: "center", gap: 0.8 }}>
                    ⚠️ Beware of Fake Apps &amp; Schemes
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.6, fontSize: "0.86rem" }}>
                    Websites or unauthorized portals claiming digital purchases or unofficial &ldquo;Dear Lottery&rdquo; predictions are financial frauds.
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #FDE68A",
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#059669", mb: 0.6, display: "flex", alignItems: "center", gap: 0.8 }}>
                    🛒 Purchase From Registered Agents
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.6, fontSize: "0.86rem" }}>
                    Always buy your genuine paper tickets directly from authorized offline retailers across Kerala at the standard ₹50 price.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* 8. How to Claim Your Prize Money (Tiered Roadmap) */}
          <Box sx={{ mb: 5, pt: 3, borderTop: "1px solid #F1F5F9" }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontWeight: 900, color: "#0A2540", mb: 1, letterSpacing: "-0.02em" }}
            >
              How to Claim Your Prize Money
            </Typography>
            <Typography variant="body1" sx={{ color: "#475569", mb: 3, lineHeight: 1.7 }}>
              Prize claims must be officially filed within <strong>90 days</strong> from the draw date. Sign the back of your ticket immediately upon winning.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                {
                  tier: "Tier 1: Up to ₹5,000",
                  office: "Local Retail Agents",
                  desc: "Claimable instantly directly at any authorized retail lottery shop across Kerala upon ticket handover.",
                  icon: <StorefrontIcon sx={{ color: "#059669" }} />,
                  badge: "Instant Cash Payout",
                },
                {
                  tier: "Tier 2: ₹5,001 – ₹1,00,000",
                  office: "District Lottery Offices",
                  desc: "Must be submitted at any District Lottery Office across Kerala with original identity proofs.",
                  icon: <AccountBalanceWalletIcon sx={{ color: "#2563EB" }} />,
                  badge: "District Office Verification",
                },
                {
                  tier: "Tier 3: Above ₹1,00,000",
                  office: "State Directorate Office",
                  desc: "Must be presented at the Directorate of Kerala State Lotteries at Vikas Bhavan, Thiruvananthapuram.",
                  icon: <AccountBalanceIcon sx={{ color: "#7C3AED" }} />,
                  badge: "Direct Bank Transfer",
                },
              ].map((c, idx) => (
                <Grid size={{ xs: 12, md: 4 }} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                        {c.icon}
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0A2540", fontSize: "0.95rem" }}>
                          {c.tier}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.5, fontSize: "0.85rem", mb: 1.5 }}>
                        {c.desc}
                      </Typography>
                    </Box>
                    <Chip label={c.badge} size="small" sx={{ bgcolor: "#FFFFFF", color: "#0F172A", fontWeight: 700, border: "1px solid #CBD5E1", alignSelf: "flex-start" }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Tax TDS Regulation */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                bgcolor: "#FEF2F2",
                border: "1px solid #FECACA",
                mb: 3,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <GavelIcon sx={{ color: "#DC2626", mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#991B1B", mb: 0.3 }}>
                  Mandatory Tax Deduction at Source (TDS):
                </Typography>
                <Typography variant="body2" sx={{ color: "#7F1D1D", lineHeight: 1.6, fontSize: "0.88rem" }}>
                  All prize payouts exceeding ₹10,000 attract a mandatory flat <strong>30% TDS</strong> under Indian Income Tax Act regulations. A valid PAN card and active bank account are mandatory for payouts.
                </Typography>
              </Box>
            </Paper>

            {/* Required Documents Checklist */}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0A2540", mb: 1.5 }}>
              Mandatory Documents Checklist for Claim Verification:
            </Typography>
            <Grid container spacing={1.5}>
              {[
                "Original winning ticket signed on the back with your contact details",
                "Kerala State Lottery official claim application form with passport photographs",
                "Government Photo ID Proof (Aadhaar Card, PAN Card, Passport, or Voter ID)",
                "Bank Account passbook / cancelled cheque for direct RTGS/NEFT electronic transfer",
              ].map((doc, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      bgcolor: "#F8FAFC",
                      p: 1.8,
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#059669", fontSize: 20, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600, fontSize: "0.86rem" }}>
                      {doc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 9. About Kerala State Lottery (History & Welfare Impact) */}
          <Box sx={{ mb: 5, pt: 3, borderTop: "1px solid #F1F5F9" }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontWeight: 900, color: "#0A2540", mb: 1, letterSpacing: "-0.02em" }}
            >
              About the Kerala State Lottery (History &amp; Social Welfare)
            </Typography>
            <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.8, fontSize: "0.95rem" }}>
              Established over 54 years ago in 1967 under the vision of then Finance Minister <strong>P.K. Kunju Sahib</strong>, the Kerala State Lottery was the very first government-operated lottery system in India. The initiative directly funds state welfare schemes, healthcare subsidies (Karunya Benevolent Fund), government hospitals, and employment for thousands of differently-abled retail agents.
            </Typography>
          </Box>

          {/* 10. Frequently Asked Questions (Collapsible Modern Accordions) */}
          <Box sx={{ pt: 3, borderTop: "1px solid #F1F5F9" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2.5 }}>
              <HelpIcon sx={{ color: "#0B3C5D", fontSize: 26 }} />
              <Typography
                variant="h5"
                component="h3"
                sx={{ fontWeight: 900, color: "#0A2540", letterSpacing: "-0.02em" }}
              >
                Frequently Asked Questions (Kerala Lottery Queries)
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                {
                  num: "01",
                  q: "What is Kerala Lottery?",
                  a: "The Kerala State Lottery is India's first government-run paper lottery scheme established in 1967 by the Directorate of Kerala State Lotteries. It operates 7 regular weekly draws and 6 seasonal bumper lotteries with revenue funding state welfare, hospitals, and public health schemes.",
                },
                {
                  num: "02",
                  q: "How to Get Kerala Lottery Ticket & Can You Buy Online?",
                  a: "Kerala lottery tickets can only be purchased in person as physical paper tickets from government-authorized offline lottery agents across Kerala. The Government of Kerala strictly does NOT sell lottery tickets online, and digital online purchase portals are unauthorized.",
                },
                {
                  num: "03",
                  q: "What is the Price of Kerala Lottery Ticket?",
                  a: "The official ticket price for all 7 standard weekly lotteries (Bhagyathara, Sthree-Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Karunya, and Samrudhi) is ₹50 per paper ticket. Seasonal bumper lottery tickets range from ₹250 to ₹500 depending on the bumper edition.",
                },
                {
                  num: "04",
                  q: "How to See Kerala Lottery Result Today?",
                  a: "You can see today's Kerala lottery result live right here on Kerala Lottery Results Today (https://www.keralalotteryresultstoday.in/). Live drawing starts at 2:55 PM IST, and complete prize chart breakdown is updated by 4:00 PM IST. You can also use our instant Ticket Checker search tool at the top of the page.",
                },
                {
                  num: "05",
                  q: "How to Download Kerala Lottery Result PDF?",
                  a: "To download the official Kerala lottery result PDF and Government Gazette chart, visit any lottery draw result page on our website and tap 'Download Official PDF'. The PDF format includes all winning ticket numbers from 1st prize down to consolation and 9th prize.",
                },
              ].map((faq, idx) => (
                <Accordion
                  key={idx}
                  elevation={0}
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px !important",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(11, 60, 93, 0.02)",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      borderColor: "#93C5FD",
                      boxShadow: "0 6px 20px rgba(11, 60, 93, 0.06)",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#0B3C5D" }} />}
                    sx={{
                      bgcolor: "#F8FAFC",
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      "&.Mui-expanded": { bgcolor: "#EFF6FF" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                      <Chip
                        label={faq.num}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          bgcolor: "#FFFFFF",
                          color: "#0B3C5D",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.72rem",
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#0F172A",
                          fontSize: { xs: "0.92rem", sm: "1.02rem" },
                        }}
                      >
                        {faq.q}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2.5, bgcolor: "#FFFFFF" }}>
                    <Typography
                      sx={{
                        color: "#475569",
                        lineHeight: 1.75,
                        fontSize: { xs: "0.9rem", sm: "0.96rem" },
                      }}
                    >
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
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
      </Box>
    </Box>
  );
}
