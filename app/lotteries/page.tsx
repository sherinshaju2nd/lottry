"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  ALL_LOTTERIES,
  getLotteryUrl,
  getLotteryLogo,
  getLotteryLogoAlt,
  getLotteriesFromSupabase,
  LotteryRecord,
} from "@/lib/supabase";

const LOTTERY_PRIZE_DEFAULTS: Record<string, { prize: string; price: string }> = {
  BT: { prize: "₹1 Crore", price: "₹50" },
  SS: { prize: "₹75 Lakhs", price: "₹50" },
  DL: { prize: "₹1 Crore", price: "₹50" },
  KN: { prize: "₹80 Lakhs", price: "₹50" },
  SK: { prize: "₹70 Lakhs", price: "₹50" },
  KR: { prize: "₹80 Lakhs", price: "₹50" },
  SM: { prize: "₹70 Lakhs", price: "₹50" },
  XN: { prize: "₹20 Crore", price: "₹400" },
  SB: { prize: "₹10 Crore", price: "₹250" },
  VB: { prize: "₹12 Crore", price: "₹300" },
  MB: { prize: "₹10 Crore", price: "₹250" },
  TH: { prize: "₹25 Crore", price: "₹500" },
  PB: { prize: "₹12 Crore", price: "₹300" },
};

interface LotteryItem {
  code: string;
  name: string;
  nameMl: string;
  day: string;
  is_bumper: boolean;
  jackpot?: string;
  ticket_price?: string;
  draw_time?: string;
  draw_season?: string;
  draw_date?: string;
}

export default function LotteriesPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "bumper">("weekly");
  const [weeklyData, setWeeklyData] = useState<LotteryItem[]>(WEEKLY_LOTTERIES as any);
  const [bumperData, setBumperData] = useState<LotteryItem[]>(BUMPER_LOTTERIES as any);
  const [isLoading, setIsLoading] = useState(true);

  // IST Date & Day
  const todayIST = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const dayStr = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
    return { dateStr, dayStr };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getLotteriesFromSupabase()
      .then((records: LotteryRecord[]) => {
        if (!isMounted) return;
        if (records && records.length > 0) {
          const weekly = records.filter((r) => !r.is_bumper);
          const bumper = records.filter((r) => r.is_bumper);

          if (weekly.length > 0) {
            setWeeklyData(
              weekly.map((r) => ({
                code: r.code,
                name: r.name,
                nameMl: r.name_ml || r.name,
                day: r.day,
                is_bumper: false,
                jackpot: r.jackpot,
                ticket_price: (r as any).ticket_price,
                draw_time: r.draw_time || "3:00 PM",
                draw_season: r.draw_season,
                draw_date: (r as any).draw_date,
              }))
            );
          }
          if (bumper.length > 0) {
            setBumperData(
              bumper.map((r) => ({
                code: r.code,
                name: r.name,
                nameMl: r.name_ml || r.name,
                day: r.day,
                is_bumper: true,
                jackpot: r.jackpot,
                ticket_price: (r as any).ticket_price,
                draw_time: r.draw_time || "2:00 PM",
                draw_season: r.draw_season,
                draw_date: (r as any).draw_date,
              }))
            );
          }
        }
      })
      .catch((e) => {
        console.warn("Failed loading lotteries from DB:", e);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentList = activeTab === "weekly" ? weeklyData : bumperData;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 2.5 }, px: { xs: 1.5, sm: 3 } }}>
      {/* Tab Switcher: Weekly Draws vs Bumper Lotteries (Mobile App Exact Style) */}
      <Box
        sx={{
          display: "flex",
          bgcolor: "#E2E8F0",
          borderRadius: "14px",
          p: "4px",
          mb: 2.5,
          gap: "4px",
        }}
      >
        <Box
          onClick={() => setActiveTab("weekly")}
          role="tab"
          aria-selected={activeTab === "weekly"}
          tabIndex={0}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.1,
            borderRadius: "10px",
            cursor: "pointer",
            userSelect: "none",
            bgcolor: activeTab === "weekly" ? "#0B3C5D" : "transparent",
            color: activeTab === "weekly" ? "#FFFFFF" : "#475569",
            fontWeight: 800,
            fontSize: { xs: "0.825rem", sm: "0.9rem" },
            boxShadow: activeTab === "weekly" ? "0 2px 8px rgba(11, 60, 93, 0.25)" : "none",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: activeTab === "weekly" ? "#0B3C5D" : "rgba(255,255,255,0.4)",
            },
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 18 }} />
          <span>Weekly Draws ({weeklyData.length})</span>
        </Box>

        <Box
          onClick={() => setActiveTab("bumper")}
          role="tab"
          aria-selected={activeTab === "bumper"}
          tabIndex={0}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.1,
            borderRadius: "10px",
            cursor: "pointer",
            userSelect: "none",
            bgcolor: activeTab === "bumper" ? "#0B3C5D" : "transparent",
            color: activeTab === "bumper" ? "#FFFFFF" : "#475569",
            fontWeight: 800,
            fontSize: { xs: "0.825rem", sm: "0.9rem" },
            boxShadow: activeTab === "bumper" ? "0 2px 8px rgba(11, 60, 93, 0.25)" : "none",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: activeTab === "bumper" ? "#0B3C5D" : "rgba(255,255,255,0.4)",
            },
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
          <span>Bumper Lotteries ({bumperData.length})</span>
        </Box>
      </Box>

      {/* Content List */}
      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: "16px",
                border: "1.5px solid #E2E8F0",
                bgcolor: "#FFFFFF",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: "8px" }} />
                <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "8px" }} />
              </Box>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1.5 }} />
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Skeleton variant="rounded" width={130} height={30} sx={{ borderRadius: "8px" }} />
                <Skeleton variant="rounded" width={90} height={30} sx={{ borderRadius: "8px" }} />
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {currentList.map((item) => {
            const isBumper = Boolean(item.is_bumper || activeTab === "bumper");
            const isWeeklyToday = !isBumper && item.day ? item.day.toLowerCase() === todayIST.dayStr.toLowerCase() : false;
            const isBumperToday = isBumper && item.draw_date ? item.draw_date === todayIST.dateStr : false;
            const isDrawToday = isWeeklyToday || isBumperToday;
            const isAnnouncedUpcomingBumper = isBumper && Boolean(item.draw_date) && !isBumperToday;

            const defaultMeta = LOTTERY_PRIZE_DEFAULTS[item.code] || { prize: "₹80 Lakhs", price: "₹50" };
            const jackpotPrize = item.jackpot || defaultMeta.prize;
            const ticketPrice = item.ticket_price || defaultMeta.price;
            const targetUrl = getLotteryUrl(item.code);

            const logo = getLotteryLogo(item.code);

            return (
              <Paper
                key={item.code}
                elevation={0}
                component={Link}
                href={targetUrl}
                sx={{
                  display: "block",
                  textDecoration: "none",
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: "16px",
                  bgcolor: isDrawToday ? "#F0FDF4" : "#FFFFFF",
                  border: isDrawToday ? "1.5px solid #10B981" : "1.5px solid #E2E8F0",
                  boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isDrawToday ? "#059669" : "#0B3C5D",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(11, 60, 93, 0.1)",
                  },
                }}
              >
                {/* Top Badges Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {/* Code Badge */}
                    <Box
                      sx={{
                        bgcolor: "#0B3C5D",
                        color: "#FFFFFF",
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "8px",
                        fontWeight: 900,
                        fontSize: "0.8rem",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.code}
                    </Box>

                    {/* Schedule Day / Season Tag */}
                    {isBumper ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "#EBF5FF",
                          color: "#0B3C5D",
                          px: 1.2,
                          py: 0.4,
                          borderRadius: "8px",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 14 }} />
                        <span>{item.draw_season || item.day || "Annual Bumper"}</span>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: isDrawToday ? "#D1FAE5" : "#EBF5FF",
                          color: isDrawToday ? "#065F46" : "#0B3C5D",
                          px: 1.2,
                          py: 0.4,
                          borderRadius: "8px",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                        }}
                      >
                        <CalendarMonthIcon sx={{ fontSize: 14 }} />
                        <span>{item.day}</span>
                      </Box>
                    )}
                  </Box>

                  {/* Right Status Pill */}
                  {isDrawToday ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        bgcolor: "#DCFCE7",
                        border: "1px solid #86EFAC",
                        color: "#15803D",
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "12px",
                        fontWeight: 900,
                        fontSize: "0.72rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: "#16A34A",
                          animation: "pulseDot 1.5s infinite ease-in-out",
                          "@keyframes pulseDot": {
                            "0%": { transform: "scale(0.9)", opacity: 0.7 },
                            "50%": { transform: "scale(1.3)", opacity: 1 },
                            "100%": { transform: "scale(0.9)", opacity: 0.7 },
                          },
                        }}
                      />
                      <span>DRAWS TODAY</span>
                    </Box>
                  ) : isAnnouncedUpcomingBumper ? (
                    <Box
                      sx={{
                        bgcolor: "#F1F5F9",
                        color: "#475569",
                        px: 1.1,
                        py: 0.4,
                        borderRadius: "6px",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                      }}
                    >
                      {item.draw_date}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "#F1F5F9",
                        color: "#64748B",
                        px: 1,
                        py: 0.35,
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                      <span>{item.draw_time || (isBumper ? "2:00 PM" : "3:00 PM")}</span>
                    </Box>
                  )}
                </Box>

                {/* Main Title Section with Logo */}
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, mb: 1.5 }}>
                  {logo && (
                    <Box
                      component="img"
                      src={logo}
                      alt={getLotteryLogoAlt(item.name, item.day)}
                      sx={{
                        width: { xs: 52, sm: 60 },
                        height: { xs: 52, sm: 60 },
                        borderRadius: "12px",
                        objectFit: "cover",
                        border: "1.5px solid #E2E8F0",
                        bgcolor: "#F8FAFC",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: "1.15rem", sm: "1.25rem" },
                        color: "#0F172A",
                        lineHeight: 1.25,
                      }}
                    >
                      {item.name}
                    </Typography>
                    {item.nameMl && item.nameMl !== item.name && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#64748B",
                          fontSize: "0.85rem",
                          mt: 0.25,
                        }}
                      >
                        {item.nameMl}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Prize & Price Stats Chips */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                  {/* 1st Prize Chip */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      bgcolor: "#EBF5FF",
                      border: "1px solid #BFDBFE",
                      px: 1.2,
                      py: 0.6,
                      borderRadius: "8px",
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 16, color: "#0B3C5D" }} />
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#0B3C5D" }}>
                      1st Prize: <strong style={{ fontWeight: 900 }}>{jackpotPrize}</strong>
                    </Typography>
                  </Box>

                  {/* Ticket Price Chip */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "#F1F5F9",
                      px: 1.1,
                      py: 0.6,
                      borderRadius: "8px",
                    }}
                  >
                    <LocalOfferIcon sx={{ fontSize: 14, color: "#475569" }} />
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>
                      {ticketPrice}
                    </Typography>
                  </Box>
                </Box>

                {/* Announced Date Card (if upcoming bumper) */}
                {isAnnouncedUpcomingBumper && (
                  <Box
                    sx={{
                      bgcolor: "#F8FAFC",
                      borderRadius: "8px",
                      p: 1.2,
                      border: "1px solid #E2E8F0",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: "#64748B",
                        textTransform: "uppercase",
                        display: "block",
                      }}
                    >
                      Announced Draw Date
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 900, color: "#0F172A" }}>
                      {item.draw_date} • {item.draw_time || "2:00 PM"}
                    </Typography>
                  </Box>
                )}

                {/* Bottom Footer Action */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 1.25,
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#94A3B8" }}>
                    {isBumper
                      ? `Annual Bumper • ${item.draw_time || "2:00 PM"}`
                      : `Weekly Draw • ${item.draw_time || "3:00 PM"}`}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Typography sx={{ fontSize: "0.825rem", fontWeight: 800, color: "#0B3C5D" }}>
                      View Results (ഫലങ്ങൾ)
                    </Typography>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        bgcolor: "#EBF5FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronRightIcon sx={{ fontSize: 16, color: "#0B3C5D" }} />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Container>
  );
}
