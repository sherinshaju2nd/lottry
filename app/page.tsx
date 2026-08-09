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
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import CelebrationIcon from "@mui/icons-material/Celebration";
import confetti from "canvas-confetti";
import { WEEKLY_LOTTERIES, supabase } from "@/lib/supabase";

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
  const [searchResults, setSearchResults] = useState<SearchMatch[] | null>(null);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: yupResolver(searchSchema),
  });

  useEffect(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[new Date().getDay()];
    setTodayDayName(currentDay);
    const matched = WEEKLY_LOTTERIES.find((l) => l.day === currentDay) || WEEKLY_LOTTERIES[6];
    setTodayLottery(matched);

    const channel = supabase
      .channel("realtime-lottery-results")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draw_results" },
        (payload) => {
          if (payload.new) {
            setRealtimeNotification(
              `🎉 New Draw Result Published: ${payload.new.draw_name} (${payload.new.draw_code}) on ${payload.new.draw_date}`
            );
          }
        }
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
    setIsSearching(true);
    setSearchedQuery(data.ticketNumber);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(data.ticketNumber.trim())}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.results) && json.results.length > 0) {
        setSearchResults(json.results);
        triggerCelebration();
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
      return { bgcolor: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" };
    }
    if (day === "Saturday" || day === "Sunday") {
      return { bgcolor: "#FEF3C7", color: "#D97706" };
    }
    return { bgcolor: "#F3F4F6", color: "#4B5563" };
  };

  return (
    <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      {realtimeNotification && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: "12px" }} onClose={() => setRealtimeNotification(null)}>
          {realtimeNotification}
        </Alert>
      )}

      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          py: { xs: 5, sm: 7, md: 8.5 },
          px: { xs: 3.5, sm: 5, md: 7, lg: 8 },
          minHeight: { xs: "auto", md: 440 },
          display: "flex",
          alignItems: "center",
          borderRadius: "28px",
          bgcolor: "#F4F6F8",
          border: "1px solid #E5E7EB",
          mb: 7,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Faded Stacked Lottery Cards Graphic on Right */}
        <Box
          sx={{
            position: "absolute",
            right: { sm: "20px", md: "50px", lg: "80px", xl: "120px" },
            top: "50%",
            transform: "translateY(-50%)",
            width: { sm: 380, md: 450, lg: 520 },
            opacity: 0.35,
            pointerEvents: "none",
            display: { xs: "none", sm: "block" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              mb: 2,
              boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "#374151", fontWeight: 700 }}>
              കേരള ലോട്ടറി
            </Typography>
            <Typography variant="body2" sx={{ color: "#D97706", fontWeight: 800, mt: 1 }}>
              #FFC107 ₹70 Laks
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              ml: 5,
              boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "#374151", fontWeight: 700 }}>
              കേരള ലോട്ടറി
            </Typography>
            <Typography variant="body2" sx={{ color: "#D97706", fontWeight: 800, mt: 1 }}>
              #FFC107 ₹70 Laks
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ maxWidth: { xs: "100%", md: 680, lg: 820 }, position: "relative", zIndex: 1, width: "100%" }}>
          <Chip
            icon={<EmojiEventsIcon sx={{ fontSize: "15px !important", color: "#111827" }} />}
            label="Latest Result"
            sx={{
              bgcolor: "#FFC107",
              color: "#111827",
              fontWeight: 800,
              fontSize: "0.75rem",
              borderRadius: "20px",
              mb: 2.5,
              px: 1,
              py: 0.5,
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: "#111827",
              mb: 0.5,
              fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.5rem", lg: "4.25rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {todayLottery.name} {todayLottery.code}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#0F5A24",
              fontWeight: 800,
              mb: 2.5,
              fontSize: { xs: "1.1rem", sm: "1.4rem", lg: "1.65rem" },
            }}
          >
            Drawn Today, 3:00 PM
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#4B5563",
              mb: 4,
              lineHeight: 1.6,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              maxWidth: 600,
            }}
          >
            The official results for the {todayLottery.name} {todayLottery.code} lottery have been published. Check your ticket number instantly to see if you&apos;ve won.
          </Typography>

          {/* Ticket Search Form */}
          <Box component="form" onSubmit={handleSubmit(onSearchSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 0.75,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: { xs: 1.5, sm: 1 },
                bgcolor: "#FFFFFF",
                border: errors.ticketNumber ? "2px solid #DC2626" : "1px solid #E5E7EB",
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                maxWidth: 600,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1, pl: 1.5, width: "100%" }}>
                <Box sx={{ color: "#6B7280", display: "flex", alignItems: "center" }}>
                  <ConfirmationNumberIcon fontSize="small" />
                </Box>
                <TextField
                  {...register("ticketNumber")}
                  placeholder="Enter your 6-digit ticket number..."
                  variant="standard"
                  fullWidth
                  slotProps={{ input: { disableUnderline: true } }}
                  sx={{ ml: 1.5, mr: 1, input: { fontSize: "0.95rem", fontWeight: 500 } }}
                />
              </Box>

              <Button
                type="submit"
                disabled={isSearching}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0F5A24",
                  color: "#FFFFFF",
                  px: 3.5,
                  py: 1.35,
                  borderRadius: "12px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { bgcolor: "#15803D" },
                }}
              >
                {isSearching ? "Checking..." : "Check Now"}
              </Button>
            </Paper>

            {errors.ticketNumber && (
              <Typography variant="caption" sx={{ color: "#DC2626", pl: 1.5, fontWeight: 600 }}>
                {errors.ticketNumber.message}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Weekly Lottery Schedule Section */}
      <Box id="schedule" sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 0.5, fontSize: { xs: "1.5rem", sm: "1.875rem", lg: "2.25rem" } }}>
          Weekly Lottery Schedule
        </Typography>
        <Typography variant="body1" sx={{ color: "#6B7280", mb: 4, fontSize: { xs: "0.925rem", md: "1rem" } }}>
          Daily draws conducted by the Kerala State Lotteries Department.
        </Typography>

        <Grid container spacing={3}>
          {WEEKLY_LOTTERIES.map((item) => {
            const isFriday = item.day === "Friday";
            const isActiveToday = item.day.toLowerCase() === todayDayName.toLowerCase();
            const badgeStyle = getBadgeStyle(item.day);

            return (
              <Grid size={{ xs: 12, sm: isFriday ? 12 : 6, md: isFriday ? 6 : 3 }} key={item.code}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: isActiveToday ? "2px solid #2E7D32" : "1px solid #E5E7EB",
                    bgcolor: "#FFFFFF",
                    boxShadow: isActiveToday
                      ? "0 6px 18px rgba(46, 125, 50, 0.12)"
                      : "0 2px 8px rgba(0,0,0,0.02)",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "#2E7D32",
                      boxShadow: "0 8px 20px rgba(46, 125, 50, 0.15)",
                    },
                  }}
                >
                  {isFriday && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: 20,
                        bottom: 15,
                        color: "#E5E7EB",
                        opacity: 0.7,
                        pointerEvents: "none",
                      }}
                    >
                      <SavingsOutlinedIcon sx={{ fontSize: 90 }} />
                    </Box>
                  )}

                  <CardActionArea component={Link} href={`/lottery/${item.code.toLowerCase()}`} sx={{ height: "100%", p: 0.5 }}>
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", minHeight: 160 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Chip
                          label={isActiveToday ? `${item.day} • Today` : item.day}
                          size="small"
                          sx={{
                            ...badgeStyle,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            borderRadius: "16px",
                            px: 1,
                          }}
                        />
                        <CalendarTodayOutlinedIcon sx={{ color: isActiveToday ? "#2E7D32" : "#9CA3AF", fontSize: 18 }} />
                      </Box>

                      <Box sx={{ zIndex: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: isActiveToday ? "#1B5E20" : "#111827",
                            mb: 0.5,
                            fontSize: isFriday ? { xs: "1.5rem", sm: "1.75rem" } : "1.25rem",
                          }}
                        >
                          {item.name}
                        </Typography>

                        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
                          Code: {item.code}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Ticket Search Result Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0F5A24", display: "flex", alignItems: "center", gap: 1 }}>
          <CelebrationIcon sx={{ color: "#FFC107" }} /> Ticket Search Results for &quot;{searchedQuery}&quot;
        </DialogTitle>
        <DialogContent dividers>
          {searchResults && searchResults.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity="success" sx={{ fontWeight: 700, borderRadius: "12px" }}>
                🎉 CONGRATULATIONS! Matching winning numbers found!
              </Alert>

              {searchResults.map((match, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#F9FAFB", border: "1px solid #A5D6A7" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F5A24" }}>
                    {match.prize_tier} {match.prize_amount ? `(${match.prize_amount})` : ""}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", mt: 0.5 }}>
                    <strong>Draw:</strong> {match.draw_name} ({match.draw_code}) on {match.draw_date}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", mt: 0.5 }}>
                    <strong>Matching Ticket Number:</strong>{" "}
                    <Chip label={match.ticket_matched} size="small" color="primary" sx={{ fontWeight: 700, fontFamily: "monospace", borderRadius: "8px" }} />
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#4B5563", mb: 1 }}>
                No Winning Match Found
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Ticket &quot;{searchedQuery}&quot; did not match any winning ticket in our published draw records. Please double-check your ticket number.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" sx={{ bgcolor: "#0F5A24", borderRadius: "8px" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
