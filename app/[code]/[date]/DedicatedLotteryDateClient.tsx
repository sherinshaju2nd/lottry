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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CasinoIcon from "@mui/icons-material/Casino";
import confetti from "canvas-confetti";
import ShareButtons from "@/components/ShareButtons";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  StructuredDrawResult,
  FirstPrize,
  PrizeData,
  PostponedDraw,
  supabase,
  validateTicketMatch,
  findTopPrizePartialHint,
  getSearchFeedbackMessage,
  getLotteryUrl,
  getLotteryLogo,
  getLotteryLogoAlt,
  hasAnyDrawResult,
  getIsAfterDrawTime,
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
  ticket_price?: string;
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
  serverTodayDate?: string;
  initialLotteryMeta?: any;
}

function UpcomingBumperCountdownSection({
  lotteryInfo,
  lotteryCode,
  lotterySlug,
  selectedDate,
  lotteryDbMeta,
}: {
  lotteryInfo: LotteryInfoType;
  lotteryCode: string;
  lotterySlug: string;
  selectedDate: string;
  lotteryDbMeta?: any;
}) {
  const isBumper = Boolean(
    lotteryInfo.is_bumper ||
    lotteryCode.startsWith("Bumper") ||
    ["XN", "SB", "VB", "MB", "TH", "PB"].includes(lotteryCode)
  );

  const rawJackpot =
    lotteryDbMeta?.jackpot?.trim() ||
    lotteryInfo.jackpot ||
    (isBumper ? "₹12 Crore" : "₹1 Crore");

  const rawTicketPrice =
    lotteryDbMeta?.ticket_price?.trim() ||
    lotteryInfo.ticket_price ||
    (isBumper ? "₹300" : "₹50");

  const rawDrawTime =
    lotteryDbMeta?.draw_time ||
    (isBumper ? "2:00 PM" : "3:00 PM");

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    isToday: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      try {
        const timePart = isBumper ? "T14:00:00+05:30" : "T15:00:00+05:30";
        const target = new Date(`${selectedDate}${timePart}`).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        const todayStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date());
        const isToday = selectedDate === todayStr;

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isToday });
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft({ days, hours, minutes, seconds, isPast: false, isToday });
        }
      } catch {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isToday: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedDate, isBumper]);

  const logoSrc =
    getLotteryLogo(lotteryCode) ||
    `/lottry-logos/${lotterySlug}.jpg` ||
    "/logo-round-512.png";

  const formattedDate = (() => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00+05:30`));
    } catch {
      return selectedDate;
    }
  })();

  const calendarUrl = (() => {
    const startTime = isBumper ? "083000Z" : "093000Z";
    const endTime = isBumper ? "103000Z" : "110000Z";
    const cleanDate = selectedDate.replace(/-/g, "");
    const title = encodeURIComponent(`Kerala Lottery: ${lotteryInfo.name} Live Draw (${rawJackpot})`);
    const details = encodeURIComponent(
      `Official Kerala State ${lotteryInfo.name} Draw (${selectedDate}). Check live 1st prize winning numbers & Gazette PDF on https://www.keralalotteryresultstoday.in/${lotterySlug}/${selectedDate}`
    );
    const location = encodeURIComponent("Gorky Bhavan, Thiruvananthapuram, Kerala");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}T${startTime}/${cleanDate}T${endTime}&details=${details}&location=${location}`;
  })();

  const prizeStructure = isBumper
    ? [
        { rank: "1st Prize", amount: rawJackpot, winners: "1 Winner", note: "Guaranteed Grand Jackpot Ticket" },
        { rank: "Consolation Prize", amount: "₹1,00,000", winners: "Multiple Series", note: "All other active series matching 1st prize number" },
        { rank: "2nd Prize", amount: "₹1,00,00,000 (₹1 Crore)", winners: "1 or more", note: "Official Kerala Bumper 2nd Tier" },
        { rank: "3rd Prize", amount: "₹10,00,000 (₹10 Lakhs)", winners: "Multiple", note: "Across all series tickets" },
        { rank: "4th Prize", amount: "₹5,000 / ₹1,00,000", winners: "Multiple", note: "Drawn from last digits" },
        { rank: "5th Prize", amount: "₹2,000 / ₹5,000", winners: "Multiple", note: "Last 4 digits match" },
        { rank: "6th Prize", amount: "₹1,000", winners: "Multiple", note: "Last 4 digits match" },
        { rank: "7th Prize", amount: "₹500", winners: "Thousands", note: "Last 4 digits match" },
        { rank: "8th Prize", amount: "₹300", winners: "Tens of thousands", note: "Ticket cost recovery tier" },
      ]
    : [
        { rank: "1st Prize", amount: rawJackpot, winners: "1 Winner", note: "Weekly Draw First Prize" },
        { rank: "Consolation Prize", amount: "₹8,000", winners: "11 Series", note: "Other series matching 1st prize number" },
        { rank: "2nd Prize", amount: "₹10,00,000 / ₹5,00,000", winners: "1 Winner", note: "Official Weekly 2nd Tier" },
        { rank: "3rd Prize", amount: "₹1,00,000", winners: "12 Winners", note: "1 per series" },
        { rank: "4th Prize", amount: "₹5,000", winners: "Multiple", note: "Last 4 digits" },
        { rank: "5th Prize", amount: "₹1,000", winners: "Multiple", note: "Last 4 digits" },
        { rank: "6th Prize", amount: "₹500", winners: "Multiple", note: "Last 4 digits" },
        { rank: "7th Prize", amount: "₹100", winners: "Multiple", note: "Last 4 digits" },
      ];

  const faqs = [
    {
      q: `When will Kerala ${lotteryInfo.name} Result for ${selectedDate} be released?`,
      a: `The live draw ceremony for Kerala State ${lotteryInfo.name} will begin at ${rawDrawTime} IST on ${formattedDate} at Gorky Bhavan, Thiruvananthapuram. The 1st prize winning ticket will be updated live on this page around ${isBumper ? "2:30 PM" : "3:10 PM"}, followed by the full prize chart and official Kerala Gazette PDF.`,
    },
    {
      q: `What is the 1st prize jackpot for ${lotteryInfo.name} on ${selectedDate}?`,
      a: `The guaranteed first prize jackpot is ${rawJackpot}. There are also consolation prizes of ₹1 Lakh (for bumpers) or ₹8,000 (for weekly), and multiple prize tiers down to the last prize tier.`,
    },
    {
      q: `What is the official ticket price for ${lotteryInfo.name}?`,
      a: `The official ticket price is ${rawTicketPrice} (including GST). Genuine Kerala lottery tickets are sold exclusively through registered lottery agents and retail counters across Kerala in paper format. (Online sale of Kerala lottery tickets is prohibited by the Government).`,
    },
    {
      q: `How can I search and verify my ticket number on draw day?`,
      a: `On ${selectedDate}, as soon as results are announced live, you can enter your 4-digit or 6-digit ticket number in our instant Ticket Checker on this page to immediately find out if you won any prize.`,
    },
    {
      q: `How do I claim prize money won in Kerala State Lottery?`,
      a: `Prizes up to ₹1,00,000 can be claimed at any District Lottery Office in Kerala. For prize amounts above ₹1,00,000, winners must surrender the original winning ticket along with PAN Card, Aadhaar Card, claim form, and passport-size photos to the Directorate of State Lotteries in Thiruvananthapuram or authorized Nationalized/State banks within 30 days of the draw.`,
    },
  ];

  return (
    <Box sx={{ mt: 3, mb: 6 }}>
      {/* 1. Hero Showcase Card with Brand Navy & Gold Theme */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "16px", md: "20px" },
          overflow: "hidden",
          border: "1.5px solid #E2E8F0",
          borderTop: isBumper ? "4px solid #F59E0B" : "4px solid #0B3C5D",
          bgcolor: "#FFFFFF",
          p: { xs: 3, sm: 4.5 },
          boxShadow: "0 8px 30px rgba(11, 60, 93, 0.06)",
          position: "relative",
        }}
      >
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          {/* Left Column: Image & Badges */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                p: 1.25,
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                boxShadow: "0 4px 16px rgba(11, 60, 93, 0.08)",
              }}
            >
              <Box
                component="img"
                src={logoSrc}
                alt={getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day)}
                sx={{
                  width: { xs: 160, sm: 200, md: 220 },
                  height: { xs: 160, sm: 200, md: 220 },
                  borderRadius: "12px",
                  objectFit: "cover",
                  display: "block",
                  mx: "auto",
                }}
              />
              <Chip
                icon={<StarIcon sx={{ color: "#D97706 !important", fontSize: 16 }} />}
                label={isBumper ? "GOVERNMENT BUMPER" : "OFFICIAL DRAW"}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  border: "1px solid #F59E0B",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
            </Box>
          </Grid>

          {/* Right Column: Title, Jackpot & Countdown */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
              <Chip
                label={`CODE: ${lotteryCode}`}
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 800 }}
              />
              <Chip
                label={`🗓️ ${formattedDate}`}
                size="small"
                sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 900, border: "1px solid #FCD34D" }}
              />
              <Chip
                label={`⏰ Live Draw: ${rawDrawTime}`}
                size="small"
                sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 800 }}
              />
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.75rem", sm: "2.3rem", md: "2.6rem" },
                color: "#0B3C5D",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Kerala {lotteryInfo.name}
            </Typography>
            <Typography variant="h6" sx={{ color: "#D97706", fontWeight: 700, mb: 2.5 }}>
              {lotteryInfo.nameMl} • Draw Scheduled for {selectedDate}
            </Typography>

            {/* Jackpot Highlight Banner */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: "14px",
                bgcolor: "#FFFDF0",
                border: "1.5px solid #FCD34D",
                boxShadow: "0 2px 10px rgba(245, 158, 11, 0.08)",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: { xs: 38, sm: 46 }, color: "#D97706" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#92400E", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Official 1st Prize Guaranteed Jackpot
                </Typography>
                <Typography variant="h4" sx={{ color: "#B45309", fontWeight: 900, fontSize: { xs: "1.6rem", sm: "2.1rem" } }}>
                  {rawJackpot}
                </Typography>
              </Box>
            </Box>

            {/* Live Countdown Clock */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 800, mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ⏳ Live Draw Commences In:
              </Typography>
              {timeLeft.isPast && timeLeft.isToday ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "#FEF2F2",
                    border: "1.5px solid #EF4444",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#991B1B", fontWeight: 900 }}>
                    🔴 DRAW IN PROGRESS — RESULTS RELEASING LIVE!
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={1.5}>
                  {[
                    { label: "DAYS", value: timeLeft.days },
                    { label: "HOURS", value: timeLeft.hours },
                    { label: "MINUTES", value: timeLeft.minutes },
                    { label: "SECONDS", value: timeLeft.seconds },
                  ].map((unit, idx) => (
                    <Grid size={{ xs: 3 }} key={idx}>
                      <Box
                        sx={{
                          bgcolor: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "12px",
                          p: { xs: 1.25, sm: 1.75 },
                          textAlign: "center",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            color: "#0B3C5D",
                            fontSize: { xs: "1.4rem", sm: "2rem" },
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {String(unit.value).padStart(2, "0")}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#64748B",
                            fontWeight: 800,
                            fontSize: { xs: "0.6rem", sm: "0.75rem" },
                            display: "block",
                            mt: 0.5,
                          }}
                        >
                          {unit.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Interactive Quick CTAs */}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 3 }}>
              <Button
                component="a"
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<NotificationsActiveIcon />}
                sx={{
                  bgcolor: "#0B3C5D",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  borderRadius: "8px",
                  px: 2.5,
                  py: 1,
                  "&:hover": { bgcolor: "#07273D" },
                }}
              >
                Set Draw Reminder
              </Button>
              <Button
                component={Link}
                href="/kerala-lottery-app"
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: "#0B3C5D",
                  color: "#0B3C5D",
                  fontWeight: 800,
                  borderRadius: "8px",
                  px: 2.5,
                  py: 1,
                  "&:hover": { borderColor: "#0B3C5D", bgcolor: "#EFF6FF" },
                }}
              >
                Get Mobile App
              </Button>
              <Button
                component={Link}
                href={getLotteryUrl(lotterySlug)}
                variant="text"
                sx={{ color: "#0B3C5D", fontWeight: 800, px: 2 }}
              >
                View Previous Results →
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Key Specifications Grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {[
          { label: "TICKET PRICE", value: rawTicketPrice, icon: "🎫", desc: "Official Paper Ticket" },
          { label: "DRAW DATE", value: selectedDate, icon: "📅", desc: formattedDate },
          { label: "DRAW VENUE", value: "Gorky Bhavan", icon: "📍", desc: "Near Bakery Jn, Thiruvananthapuram" },
          { label: "DRAW AUTHORITY", value: "Govt of Kerala", icon: "🏛️", desc: "Lotteries Department" },
        ].map((item, idx) => (
          <Grid size={{ xs: 6, md: 3 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                height: "100%",
              }}
            >
              <Typography variant="h5" sx={{ mb: 0.5 }}>{item.icon}</Typography>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", my: 0.2, fontSize: "1.05rem" }}>
                {item.value}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600, display: "block" }}>
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 3. Official Prize Structure Matrix (SEO Table) */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: { xs: 2.5, sm: 4 },
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <EmojiEventsIcon sx={{ color: "#F59E0B", fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0F172A" }}>
              Official {lotteryInfo.name} Prize Structure & Winning Amounts
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
              Complete prize tier breakdown for draw scheduled on {selectedDate}
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.85rem" }}>PRIZE TIER</TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.85rem" }}>PRIZE AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.85rem" }}>WINNERS COUNT</TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.85rem" }}>CRITERIA / NOTE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prizeStructure.map((row, idx) => (
                <TableRow key={idx} sx={{ "&:hover": { bgcolor: "#F1F5F9" }, bgcolor: idx === 0 ? "#FEF9C3" : "inherit" }}>
                  <TableCell sx={{ fontWeight: 800, color: idx === 0 ? "#854D0E" : "#1E293B" }}>
                    {idx === 0 ? "🥇 " : idx === 2 ? "🥈 " : idx === 3 ? "🥉 " : ""}{row.rank}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: idx === 0 ? "#854D0E" : "#0F172A", fontSize: idx === 0 ? "1.05rem" : "0.95rem" }}>
                    {row.amount}
                  </TableCell>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>{row.winners}</TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{row.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 4. Draw Day Timeline & Guidelines */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AccessTimeIcon sx={{ color: "#3B82F6" }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A" }}>
                Draw Day Publishing Schedule
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { time: `${rawDrawTime}`, title: "Manual Draw Commences", desc: "Draw machines initiated under supervision of judges at Gorky Bhavan." },
                { time: isBumper ? "2:30 PM" : "3:10 PM", title: "1st Prize Ticket Announced", desc: "The top jackpot winning ticket number is published live on this website." },
                { time: isBumper ? "3:30 PM" : "3:45 PM", title: "Full Prize Chart Live", desc: "Consolation, 2nd, 3rd, and all lower tier prize numbers are updated." },
                { time: isBumper ? "4:30 PM" : "4:00 PM", title: "Official Gazette PDF", desc: "Government authorized official PDF Gazette is made available for download." },
              ].map((step, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Chip
                    label={step.time}
                    size="small"
                    sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 900, minWidth: 72 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                      {step.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <SecurityIcon sx={{ color: "#10B981" }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A" }}>
                Prize Claim & Tax Guidelines
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                "Winning tickets must be presented intact without mutilation within 30 days of draw date.",
                "Prizes up to ₹1 Lakh can be claimed at any District Lottery Office in Kerala.",
                "Prizes exceeding ₹1 Lakh must be surrendered to the Directorate of Kerala State Lotteries or Nationalized Banks.",
                "A mandatory 30% TDS (Tax Deducted at Source) applies to all winnings above ₹10,000 under Section 194B of the Income Tax Act.",
                "Required documents: Original Ticket with signature on reverse, 2 Passport Photos, PAN Card & Aadhaar Card.",
              ].map((text, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 5. Frequently Asked Questions (FAQ Accordion) */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: { xs: 2.5, sm: 4 },
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <InfoOutlinedIcon sx={{ color: "#6366F1", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0F172A" }}>
            Frequently Asked Questions — {lotteryInfo.name} ({selectedDate})
          </Typography>
        </Box>

        {faqs.map((faq, idx) => (
          <Accordion
            key={idx}
            elevation={0}
            defaultExpanded={idx === 0}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: "10px !important",
              mb: 1.5,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A" }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7, fontWeight: 500 }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
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
  serverTodayDate,
  initialLotteryMeta,
}: DedicatedLotteryDateClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayISTDate =
    serverTodayDate ||
    new Date().toLocaleDateString("en-CA", {
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
    if (typeof navigator !== "undefined") {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(ticketNum);
      }
      if (navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {}
      }
    }
    setSnackbarMessage(`Ticket ${ticketNum} copied to clipboard!`);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const checkTime = () => {
      try {
        setIsAfter3PM(getIsAfterDrawTime(Boolean(lotteryInfo.is_bumper)));
      } catch {
        setIsAfter3PM(false);
      }
    };
    checkTime();
    const timeInterval = setInterval(checkTime, 30000);

    const fetchLatestDetails = async () => {
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
    };

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
        },
        async (payload) => {
          const newRow = payload.new as any;
          if (
            newRow &&
            newRow.draw_date === dateParam &&
            (!newRow.lottery_code ||
              newRow.lottery_code.toUpperCase() === lotteryCode.toUpperCase())
          ) {
            // Immediately parse payload and hydrate UI
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

              const liveDraw: StructuredDrawResult = {
                id: newRow.id,
                draw_date: newRow.draw_date,
                draw_name: newRow.draw_name,
                draw_code: newRow.draw_code,
                lottery_code: newRow.lottery_code,
                first: firstObj,
                prizes: prizesObj,
                created_at: newRow.created_at,
              };
              if (hasAnyDrawResult(liveDraw)) {
                setDrawResult(liveDraw);
              }
            } catch {}

            // Full API verification in background
            fetchLatestDetails();
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
          fetchLatestDetails();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Supabase Socket] Subscribed to ${lotteryCode} - ${dateParam}`);
        }
      });

    // Smart polling backup for live draw date
    const todayDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const pollInterval = setInterval(() => {
      if (dateParam === todayDate && (!drawResult || !hasAnyDrawResult(drawResult))) {
        fetchLatestDetails();
      }
    }, 15000);

    // Browser visibility / Window focus listeners
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkTime();
        fetchLatestDetails();
      }
    };
    const handleFocus = () => {
      checkTime();
      fetchLatestDetails();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timeInterval);
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
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
        bgcolor: "#F8FAFC",
        color: "#111827",
        minHeight: "100vh",
        pt: { xs: 1.5, sm: 3, md: 4 },
        pb: { xs: 12, sm: 10, md: 6 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 3, md: 4, lg: 5 } }}>
        {/* Desktop-only Breadcrumbs */}
        <Box sx={{ mb: 2, display: { xs: "none", md: "block" } }}>
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
              {lotteryInfo.name} Results
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

        {/* Mobile & Tablet App-Style Top Header Banner */}
        <Paper
          elevation={0}
          sx={{
            display: { xs: "block", md: "none" },
            p: 2,
            mb: 2,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 16px rgba(11, 60, 93, 0.15)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                component={Link}
                href={getLotteryUrl(lotterySlug)}
                size="small"
                sx={{
                  color: "#FFFFFF",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              {getLotteryLogo(lotteryCode) && (
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    flexShrink: 0,
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <img
                    src={getLotteryLogo(lotteryCode)!}
                    alt={getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day)}
                    width={38}
                    height={38}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#FFFFFF", lineHeight: 1.2 }}>
                  {drawResult?.draw_name || lotteryInfo.name}
                </Typography>
                {lotteryInfo.nameMl && (
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
                    {lotteryInfo.nameMl}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Mobile Top Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              {drawResult && (
                <IconButton
                  component="a"
                  href={`/api/pdf/${lotteryCode}/${selectedDate}`}
                  download={`kerala-lottery-${lotteryCode}-${selectedDate}.pdf`}
                  size="small"
                  title="Download Official PDF"
                  sx={{
                    color: "#FFFFFF",
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                  }}
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Badges Row */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Chip
              label={drawResult?.draw_code || lotteryInfo.code}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.75rem",
                borderRadius: "6px",
              }}
            />
            <Chip
              label={`📅 ${selectedDate}`}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "6px",
              }}
            />
            <Chip
              label={drawResult ? "🟢 Official Result" : isAfter3PM ? "🔴 Live Drawing" : "🕒 Scheduled"}
              size="small"
              sx={{
                bgcolor: drawResult ? "#DCFCE7" : "#FEF3C7",
                color: drawResult ? "#166534" : "#92400E",
                fontWeight: 800,
                fontSize: "0.75rem",
                borderRadius: "6px",
              }}
            />
          </Box>
        </Paper>

        {/* Desktop-only Navigation Bar & Actions */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
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
              Back to {lotteryInfo.name} Results
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
            }}
          >
            {availableDates.length > 0 && (
              <FormControl
                size="small"
                sx={{
                  minWidth: 200,
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
                  textDecoration: "none",
                  "&:hover": { bgcolor: "#0F2C59" },
                }}
              >
                Download PDF
              </Button>
            )}
          </Box>
        </Box>

        {/* Desktop Page Title */}
        <Box sx={{ mb: 3, display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2.5 }}>
          {getLotteryLogo(lotteryCode) && (
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(11, 60, 93, 0.1)",
                flexShrink: 0,
                bgcolor: "#FFFFFF",
              }}
            >
              <img
                src={getLotteryLogo(lotteryCode)!}
                alt={getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day)}
                width={72}
                height={72}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          )}
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 900,
                color: "#111827",
                fontSize: { xs: "1.5rem", sm: "2.2rem" },
                lineHeight: 1.2,
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
          ) : selectedDate > todayISTDate || (!drawResult && selectedDate === todayISTDate && !isAfter3PM) ? (
            <UpcomingBumperCountdownSection
              lotteryInfo={lotteryInfo}
              lotteryCode={lotteryCode}
              lotterySlug={lotterySlug}
              selectedDate={selectedDate}
              lotteryDbMeta={initialLotteryMeta}
            />
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 6 },
                textAlign: "center",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                mt: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: "#374151", mb: 1, fontWeight: 800 }}>
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
                sx={{ bgcolor: "#0B3C5D", borderRadius: "8px", fontWeight: 700 }}
              >
                View Available {lotteryInfo.name} Draw Dates
              </Button>
            </Paper>
          )
        ) : (
          <>
            {/* Draw Overview Header Card (Desktop View) */}
            <Paper
              elevation={0}
              sx={{
                display: { xs: "none", md: "block" },
                p: 3.5,
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

                <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: "right" }}>
                  <ShareButtons
                    title={`${drawResult.draw_name} (${drawResult.draw_code}) Result - ${drawResult.draw_date}`}
                    text={`Kerala Lottery ${drawResult.draw_name} (${drawResult.draw_code}) results for ${drawResult.draw_date}. 1st Prize (${drawResult.prizes?.amounts?.["1st"] || "₹1 Crore"}): ${drawResult.first?.ticket || "Pending"}`}
                    variant="compact"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 1st Prize Winner Hero Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5, md: 4 },
                mb: { xs: 2.5, sm: 3.5 },
                borderRadius: { xs: "16px", sm: "16px" },
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
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.6rem", sm: "2.2rem", md: "2.6rem" },
                      color: "#FFFFFF",
                      mb: 0.5,
                    }}
                  >
                    {drawResult.prizes?.amounts?.["1st"] || "₹1 Crore"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {drawResult.first?.ticket && drawResult.first.ticket !== "PENDING" && (
                    <Tooltip title="Copy Winning Ticket Number">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => handleCopyTicket(drawResult.first?.ticket || "")}
                        sx={{
                          color: "#FFFFFF",
                          borderColor: "rgba(255,255,255,0.4)",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: { xs: "0.75rem", sm: "0.85rem" },
                          "&:hover": { borderColor: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Copy
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  p: { xs: 2, sm: 2.5 },
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
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block", fontSize: "0.75rem" }}>
                    Winning Ticket Serial Number:
                  </Typography>
                  <Typography
                    variant="h4"
                    onClick={() => handleCopyTicket(drawResult.first?.ticket || "")}
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 900,
                      color: "#FFD54F",
                      fontSize: { xs: "1.4rem", sm: "1.9rem", md: "2.2rem" },
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                    }}
                  >
                    {drawResult.first?.ticket || "PENDING"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 3 }, flexWrap: "wrap" }}>
                  {drawResult.first?.location && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block", fontSize: "0.75rem" }}>
                        Location / District:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                        📍 {drawResult.first.location}
                      </Typography>
                    </Box>
                  )}
                  {drawResult.first?.agent && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block", fontSize: "0.75rem" }}>
                        Selling Agent:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
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
                p: { xs: 2, sm: 3, md: 3.5 },
                mb: { xs: 2.5, sm: 3.5 },
                borderRadius: { xs: "14px", sm: "12px" },
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ConfirmationNumberIcon sx={{ color: "#0B3C5D", fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827" }}>
                  Check Your {drawResult.draw_name} Ticket
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#6B7280", mb: 2, fontSize: "0.85rem" }}>
                Enter ticket number or last 4 digits to instantly check if you won:
              </Typography>

              <Box component="form" onSubmit={handleCheckTicketSubmit} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="e.g. 6429 or AB 123456"
                  value={checkerTicketInput}
                  onChange={(e) => setCheckerTicketInput(e.target.value)}
                  sx={{
                    flex: { xs: "100%", sm: 1 },
                    bgcolor: "#F8FAFC",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#0B3C5D",
                    fontWeight: 800,
                    borderRadius: "8px",
                    px: 3,
                    py: { xs: 1.2, sm: 1 },
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": { bgcolor: "#0F2C59" },
                  }}
                >
                  Verify Ticket
                </Button>
              </Box>

              {checkerResult && (
                <Box sx={{ mt: 2 }}>
                  {checkerResult.isWinner ? (
                    <Alert
                      icon={<CelebrationIcon fontSize="inherit" />}
                      severity="success"
                      sx={{ borderRadius: "10px", fontWeight: 700 }}
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
                    <Alert severity="info" sx={{ borderRadius: "10px" }}>
                      {checkerResult.message || "No match found for this draw."}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>

            {/* Prize Tier Breakdown Tables & Mobile Cards */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 4 }}>
              {prizeTiers.map((tier) => {
                const numbers = (drawResult.prizes as any)?.[tier.key] || [];
                const amount = drawResult.prizes?.amounts?.[tier.key];
                if (!numbers || numbers.length === 0) return null;

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={tier.key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: { xs: "14px", sm: "12px" },
                        border: "1px solid #E2E8F0",
                        bgcolor: "#FFFFFF",
                        height: "100%",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tier.dotBg }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                            {tier.label}
                          </Typography>
                        </Box>
                        {amount && (
                          <Chip
                            label={amount}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#EFF6FF",
                              color: "#1D4ED8",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "repeat(auto-fill, minmax(72px, 1fr))",
                            sm: "repeat(auto-fill, minmax(80px, 1fr))",
                            md: "repeat(auto-fill, minmax(86px, 1fr))",
                          },
                          gap: 1,
                        }}
                      >
                        {numbers.map((num: string, idx: number) => (
                          <Box
                            key={idx}
                            onClick={() => handleCopyTicket(num)}
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 800,
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              bgcolor: "#F8FAFC",
                              color: "#1E293B",
                              border: "1px solid #E2E8F0",
                              borderRadius: "8px",
                              py: 0.8,
                              px: 0.5,
                              textAlign: "center",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              "&:hover": {
                                bgcolor: "#EFF6FF",
                                borderColor: "#3B82F6",
                                color: "#1D4ED8",
                                transform: "scale(1.03)",
                              },
                              "&:active": {
                                bgcolor: "#DBEAFE",
                                transform: "scale(0.97)",
                              },
                            }}
                          >
                            {num}
                          </Box>
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
            {WEEKLY_LOTTERIES.map((item) => {
              const logo = getLotteryLogo(item.code);
              return (
                <Button
                  key={item.code}
                  component={Link}
                  href={getLotteryUrl(item.code)}
                  variant="outlined"
                  size="small"
                  startIcon={
                    logo ? (
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: "5px",
                          overflow: "hidden",
                          display: "inline-flex",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={logo}
                          alt={getLotteryLogoAlt(item.name, item.day)}
                          width={22}
                          height={22}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    ) : null
                  }
                  sx={{
                    color: "#374151",
                    borderColor: "#E5E7EB",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.8,
                    "&:hover": {
                      borderColor: "#0B3C5D",
                      bgcolor: "#F0F7FF",
                      color: "#0B3C5D",
                    },
                  }}
                >
                  {item.name} ({item.day})
                </Button>
              );
            })}
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
