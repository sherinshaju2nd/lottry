"use client";

import React, { useEffect, useState, use } from "react";
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
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import confetti from "canvas-confetti";
import { WEEKLY_LOTTERIES, StructuredDrawResult } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ code: string; date: string }>;
}

interface CheckerWinResult {
  isWinner: boolean;
  tier?: string;
  amount?: string;
  matchedNumber?: string;
  message?: string;
}

export default function DedicatedLotteryDateDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const codeParam = resolvedParams.code.toUpperCase();
  const dateParam = decodeURIComponent(resolvedParams.date);

  const lotteryInfo = WEEKLY_LOTTERIES.find((l) => l.code === codeParam) || {
    name: `${codeParam} Lottery`,
    code: codeParam,
    day: "Scheduled Draw",
  };

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dateParam);
  const [drawResult, setDrawResult] = useState<StructuredDrawResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ticket Checker State
  const [checkerTicketInput, setCheckerTicketInput] = useState<string>("");
  const [checkerResult, setCheckerResult] = useState<CheckerWinResult | null>(null);

  useEffect(() => {
    async function loadDatesAndResult() {
      setIsLoading(true);
      try {
        const datesRes = await fetch(`/api/draws?code=${codeParam}&type=dates`);
        const datesJson = await datesRes.json();
        const dates: string[] = datesJson.dates || [];
        setAvailableDates(dates);

        const resultRes = await fetch(`/api/draws?code=${codeParam}&date=${dateParam}`);
        const resultJson = await resultRes.json();
        setDrawResult(resultJson.result || null);
      } catch {
        setDrawResult(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadDatesAndResult();
  }, [codeParam, dateParam]);

  const handleDateChange = async (event: SelectChangeEvent<string>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setCheckerResult(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/draws?code=${codeParam}&date=${newDate}`);
      const json = await res.json();
      setDrawResult(json.result || null);
    } catch {
      setDrawResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#2E7D32", "#FFC107", "#E67E22", "#3B82F6", "#EC4899"],
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

    const rawQuery = checkerTicketInput.trim().toUpperCase();
    const normalizedQuery = rawQuery.replace(/\s+/g, "");
    const digitsOnly = rawQuery.replace(/\D/g, "");

    let winMatch: CheckerWinResult | null = null;

    // Check 1st Prize
    const firstTicketRaw = (drawResult.first?.ticket || "").trim().toUpperCase();
    const firstTicketNorm = firstTicketRaw.replace(/\s+/g, "");
    const firstTicketDigits = firstTicketRaw.replace(/\D/g, "");

    if (
      firstTicketNorm &&
      (firstTicketNorm === normalizedQuery ||
        firstTicketNorm.includes(normalizedQuery) ||
        (digitsOnly.length >= 2 && firstTicketDigits.endsWith(digitsOnly)) ||
        (digitsOnly.length >= 2 && digitsOnly.endsWith(firstTicketDigits)))
    ) {
      winMatch = {
        isWinner: true,
        tier: "1st Prize",
        amount: drawResult.prizes?.amounts?.["1st"] || "1,00,00,000/-",
        matchedNumber: drawResult.first?.ticket,
      };
    }

    // Check Consolation and 2nd..9th Prizes if not 1st prize
    if (!winMatch) {
      const tiers = [
        "consolation",
        "2nd",
        "3rd",
        "4th",
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
      ] as const;

      for (const tier of tiers) {
        const nums = drawResult.prizes?.[tier] || [];
        const amount = drawResult.prizes?.amounts?.[tier];

        for (const num of nums) {
          const normNum = num.trim().toUpperCase().replace(/\s+/g, "");
          const numDigits = normNum.replace(/\D/g, "");

          if (
            normNum === normalizedQuery ||
            normNum.includes(normalizedQuery) ||
            normalizedQuery.includes(normNum) ||
            (digitsOnly.length >= 2 && numDigits.endsWith(digitsOnly)) ||
            (digitsOnly.length >= 2 && digitsOnly.endsWith(numDigits))
          ) {
            winMatch = {
              isWinner: true,
              tier: tier === "consolation" ? "Consolation Prize" : `${tier} Prize`,
              amount: amount,
              matchedNumber: num,
            };
            break;
          }
        }
        if (winMatch) break;
      }
    }

    if (winMatch) {
      setCheckerResult(winMatch);
      triggerCelebration();
    } else {
      setCheckerResult({
        isWinner: false,
        message: `Ticket "${checkerTicketInput}" did not win a prize in the ${selectedDate} draw.`,
      });
    }
  };

  const prizeTiers = [
    { key: "consolation", label: "Consolation Prize", badgeBg: "#D35400" },
    { key: "2nd", label: "2nd Prize", badgeBg: "#27AE60" },
    { key: "3rd", label: "3rd Prize", badgeBg: "#2980B9" },
    { key: "4th", label: "4th Prize", badgeBg: "#8E44AD" },
    { key: "5th", label: "5th Prize", badgeBg: "#2C3E50" },
    { key: "6th", label: "6th Prize", badgeBg: "#16A085" },
    { key: "7th", label: "7th Prize", badgeBg: "#D35400" },
    { key: "8th", label: "8th Prize", badgeBg: "#C0392B" },
    { key: "9th", label: "9th Prize", badgeBg: "#7F8C8D" },
  ] as const;

  return (
    <Box sx={{ bgcolor: "#F9FAFB", color: "#111827", minHeight: "100vh", py: 6 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Navigation Bar & Date Selector */}
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 4 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              component={Link}
              href={`/lottery/${codeParam.toLowerCase()}`}
              startIcon={<ArrowBackIcon />}
              sx={{ color: "#4B5563", fontWeight: 700, borderRadius: "4px", "&:hover": { color: "#2E7D32" } }}
            >
              Back to {lotteryInfo.name} Archives
            </Button>
            <Button
              component={Link}
              href="/"
              startIcon={<FormatListNumberedIcon />}
              sx={{ color: "#4B5563", fontWeight: 700, borderRadius: "4px", "&:hover": { color: "#2E7D32" } }}
            >
              Schedule
            </Button>
          </Box>

          {availableDates.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 220, bgcolor: "#FFFFFF", borderRadius: "4px" }}>
              <InputLabel sx={{ color: "#6B7280" }}>Select Draw Date</InputLabel>
              <Select
                value={selectedDate}
                onChange={handleDateChange}
                label="Select Draw Date"
                sx={{ color: "#111827", borderRadius: "4px" }}
              >
                {availableDates.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#111827", mb: 0.5, fontSize: { xs: "1.875rem", sm: "2.5rem", md: "2.85rem" } }}>
            {lotteryInfo.name} ({lotteryInfo.code}) - {selectedDate}
          </Typography>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            Official Published Result | Draw Day: <strong>{lotteryInfo.day}</strong> | Draw Time: <strong>3:00 PM</strong>
          </Typography>
        </Box>

        {/* Live Ticket Checker Card for this Draw */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: "16px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <ConfirmationNumberIcon sx={{ color: "#2E7D32" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
              Check Ticket Result for {selectedDate}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2.5 }}>
            Enter your ticket number below to verify if your ticket won a prize in this draw.
          </Typography>

          <Box component="form" onSubmit={handleCheckTicketSubmit} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              value={checkerTicketInput}
              onChange={(e) => setCheckerTicketInput(e.target.value)}
              placeholder="e.g. MJ 236935 or 236935 or 1638"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 260, bg: "#FFFFFF" }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<CelebrationIcon />}
              sx={{ bgcolor: "#2E7D32", color: "#FFFFFF", fontWeight: 800, px: 3.5, py: 1, borderRadius: "8px", "&:hover": { bgcolor: "#1B5E20" } }}
            >
              Check Ticket
            </Button>
          </Box>

          {/* Winner Celebration Alert */}
          {checkerResult && (
            <Box sx={{ mt: 3 }}>
              {checkerResult.isWinner ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <CelebrationIcon sx={{ fontSize: 32, color: "#FFC107" }} />
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      🎉 CONGRATULATIONS! YOU HAVE A WINNING TICKET!
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, opacity: 0.95 }}>
                    Winning Category: <strong>{checkerResult.tier}</strong> {checkerResult.amount ? `(Prize Amount: ${checkerResult.amount})` : ""}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Matching Number: <strong>{checkerResult.matchedNumber}</strong>
                  </Typography>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                  {checkerResult.message}
                </Alert>
              )}
            </Box>
          )}
        </Paper>

        {/* Skeleton Loading State */}
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: "16px" }} />
            <Skeleton variant="rectangular" width={250} height={32} sx={{ borderRadius: "4px", mt: 2 }} />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: "12px" }} />
            ))}
          </Box>
        ) : drawResult ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* 1st Prize Winner Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: "16px",
                background: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
                color: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(211, 84, 0, 0.25)",
              }}
            >
              <Grid container spacing={3} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Chip
                    icon={<EmojiEventsIcon sx={{ color: "#FFFFFF !important" }} />}
                    label="1ST PRIZE WINNER"
                    sx={{ bgcolor: "rgba(0, 0, 0, 0.25)", color: "#FFFFFF", fontWeight: 800, fontSize: "0.75rem", mb: 2, borderRadius: "12px" }}
                  />
                  <Typography variant="h2" sx={{ fontWeight: 900, fontFamily: "monospace", letterSpacing: 2, mb: 1, fontSize: { xs: "2.25rem", sm: "3rem", md: "3.5rem" } }}>
                    {drawResult.first?.ticket || "N/A"}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, opacity: 0.95, fontSize: "1.15rem" }}>
                    Prize Amount: <span style={{ textDecoration: "underline" }}>{drawResult.prizes?.amounts?.["1st"] || "1,00,00,000/-"}</span>
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ bgcolor: "rgba(0, 0, 0, 0.2)", p: 3, borderRadius: "12px", backdropFilter: "blur(10px)" }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}>
                          Location
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {drawResult.first?.location || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}>
                          Agent
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {drawResult.first?.agent || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}>
                          Agency No.
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {drawResult.first?.agency_no || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", pt: 1, fontSize: { xs: "1.5rem", sm: "1.875rem" } }}>
              All Prize Winning Numbers
            </Typography>

            {/* Prize Tiers Stack on White Cards */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {prizeTiers.map(({ key, label, badgeBg }) => {
                const numbers = drawResult.prizes?.[key as keyof typeof drawResult.prizes] as string[] | undefined;
                const amount = drawResult.prizes?.amounts?.[key];

                if (!numbers || numbers.length === 0) return null;

                return (
                  <Paper
                    key={key}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 1.2, fontSize: "1.1rem" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: badgeBg }} />
                        {label}
                      </Typography>
                      {amount && (
                        <Chip
                          label={`Prize: ${amount}`}
                          size="small"
                          sx={{ bgcolor: "#F3F4F6", color: "#374151", fontWeight: 700, borderRadius: "8px" }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                      {numbers.map((num, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: "8px",
                            bgcolor: badgeBg,
                            color: "#FFFFFF",
                            fontFamily: "monospace",
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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

            {/* Guess & MC Numbers */}
            {(drawResult.prizes?.guess?.length || drawResult.prizes?.mc?.length) && (
              <Grid container spacing={3} sx={{ pt: 1 }}>
                {drawResult.prizes?.guess && drawResult.prizes.guess.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", bgcolor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 2 }}>
                        🎯 Guess Numbers
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {drawResult.prizes.guess.map((n, i) => (
                          <Chip key={i} label={n} sx={{ bgcolor: "#F3F4F6", color: "#111827", fontFamily: "monospace", fontWeight: 700, borderRadius: "6px" }} />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {drawResult.prizes?.mc && drawResult.prizes.mc.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", bgcolor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 2 }}>
                        🔢 MC Numbers
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {drawResult.prizes.mc.map((n, i) => (
                          <Chip key={i} label={n} sx={{ bgcolor: "#EEF2FF", color: "#3730A3", fontFamily: "monospace", fontWeight: 800, borderRadius: "6px" }} />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 6, textAlign: "center", bgcolor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <Typography variant="h6" sx={{ color: "#6B7280" }}>
              No draw result recorded for {lotteryInfo.name} ({codeParam}) on {selectedDate}.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
