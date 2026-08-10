"use client";

import React, { useEffect, useState } from "react";
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
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Link from "next/link";
import { WEEKLY_LOTTERIES, StructuredDrawResult } from "@/lib/supabase";
import ModernDatePicker from "@/components/ModernDatePicker";

const searchSchema = yup.object({
  ticketNumber: yup
    .string()
    .required("Please enter a ticket number or digits")
    .min(2, "Search query must be at least 2 characters"),
  lotteryCode: yup.string().optional(),
  drawDate: yup.string().optional(),
});

type SearchInput = yup.InferType<typeof searchSchema>;

interface SearchMatch {
  draw_date: string;
  draw_name: string;
  draw_code: string;
  lottery_code: string;
  prize_tier: string;
  prize_amount?: string;
  ticket_matched: string;
}

export default function AdvancedSearchPage() {
  const [results, setResults] = useState<SearchMatch[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTicket, setSearchedTicket] = useState("");
  const [availableDraws, setAvailableDraws] = useState<StructuredDrawResult[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SearchInput>({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      ticketNumber: "",
      lotteryCode: "ALL",
      drawDate: "",
    },
  });

  const selectedCode = watch("lotteryCode");
  const selectedDate = watch("drawDate");
  const publishedDateList = Array.from(
    new Set(availableDraws.map((d) => d.draw_date)),
  );

  useEffect(() => {
    async function loadDraws() {
      try {
        const res = await fetch("/api/draws?type=all");
        const json = await res.json();
        if (json.success && Array.isArray(json.results)) {
          setAvailableDraws(json.results);
        }
      } catch {
        setAvailableDraws([]);
      }
    }
    loadDraws();
  }, []);

  const onSubmit = async (data: SearchInput) => {
    setIsSearching(true);
    const fullQuery = data.ticketNumber.trim();
    setSearchedTicket(fullQuery);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(fullQuery)}`);
      const json = await res.json();
      let matches: SearchMatch[] = json.results || [];

      // Filter by lottery code
      if (data.lotteryCode && data.lotteryCode !== "ALL") {
        matches = matches.filter(
          (m) =>
            m.lottery_code.toLowerCase() === data.lotteryCode?.toLowerCase(),
        );
      }

      // Filter by draw date
      if (data.drawDate && data.drawDate.trim()) {
        matches = matches.filter((m) => m.draw_date === data.drawDate?.trim());
      }

      setResults(matches);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    reset({
      ticketNumber: "",
      lotteryCode: "ALL",
      drawDate: "",
    });
    setResults(null);
    setSearchedTicket("");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Chip
          icon={
            <ConfirmationNumberIcon
              sx={{ fontSize: "14px !important", color: "#0F5A24" }}
            />
          }
          label="Kerala State Lotteries Ticket Checker"
          sx={{
            bgcolor: "#E8F5E9",
            color: "#0F5A24",
            fontWeight: 800,
            mb: 1.5,
            px: 1,
            borderRadius: "20px",
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: "#0F5A24",
            mb: 1,
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.6rem" },
          }}
        >
          Kerala Lottery Ticket Result Checker
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#4B5563", maxWidth: 640, mx: "auto" }}
        >
          Verify your ticket number against official published Kerala Lottery
          results. Search by ticket number, lottery name, or select draw date.
        </Typography>
      </Box>

      {/* Main Search Container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: "16px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          mb: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                {...register("ticketNumber")}
                label="Ticket Number or 6-Digit Number"
                placeholder="e.g. 236935 or MJ 236935 or 6935"
                fullWidth
                error={!!errors.ticketNumber}
                helperText={errors.ticketNumber?.message}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3.5 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filter by Lottery</InputLabel>
                <Select
                  value={selectedCode || "ALL"}
                  onChange={(e) =>
                    setValue("lotteryCode", e.target.value as string)
                  }
                  label="Filter by Lottery"
                >
                  <MenuItem value="ALL">All Lotteries</MenuItem>
                  {WEEKLY_LOTTERIES.map((l) => (
                    <MenuItem key={l.code} value={l.code}>
                      {l.name} ({l.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3.5 }}>
              <ModernDatePicker
                value={selectedDate || ""}
                onChange={(val) => setValue("drawDate", val)}
                label="Select Draw Date"
                publishedDates={publishedDateList}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", pt: 1 }}>
            <Button
              type="submit"
              disabled={isSearching}
              variant="contained"
              size="large"
              startIcon={
                isSearching ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SearchIcon />
                )
              }
              sx={{
                bgcolor: "#0F5A24",
                flex: 1,
                py: 1.5,
                fontWeight: 800,
                fontSize: "1rem",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(15,90,36,0.2)",
                "&:hover": { bgcolor: "#15803D" },
              }}
            >
              {isSearching
                ? "Searching Results..."
                : "Check Kerala Lottery Ticket"}
            </Button>

            <Button
              onClick={handleReset}
              variant="outlined"
              size="large"
              startIcon={<RestartAltIcon />}
              sx={{
                borderColor: "#D1D5DB",
                color: "#4B5563",
                fontWeight: 700,
                borderRadius: "10px",
                px: 3,
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Results Rendering */}
      {isSearching ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Skeleton variant="text" width={240} height={32} />
          <Skeleton
            variant="rounded"
            height={130}
            sx={{ borderRadius: "12px" }}
          />
          <Skeleton
            variant="rounded"
            height={130}
            sx={{ borderRadius: "12px" }}
          />
        </Box>
      ) : results !== null ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#111827" }}>
              Search Results for &quot;{searchedTicket}&quot;
            </Typography>
            <Chip
              label={`${results.length} match${results.length !== 1 ? "es" : ""}`}
              color={results.length > 0 ? "success" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </Box>

          {results.length > 0 ? (
            results.map((match, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Chip
                    icon={
                      <EmojiEventsIcon sx={{ fontSize: "16px !important" }} />
                    }
                    label={match.prize_tier}
                    sx={{
                      bgcolor: "#E8F5E9",
                      color: "#0F5A24",
                      fontWeight: 800,
                      borderRadius: "6px",
                    }}
                  />
                  {match.prize_amount && (
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 900, color: "#0F5A24" }}
                    >
                      Prize Amount: {match.prize_amount}
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "#111827", mt: 1 }}
                >
                  {match.draw_name} ({match.draw_code})
                </Typography>

                <Box sx={{ display: "flex", gap: 3, mt: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" sx={{ color: "#4B5563" }}>
                    <strong>Draw Date:</strong>{" "}
                    <CalendarMonthIcon
                      sx={{
                        fontSize: 14,
                        verticalAlign: "middle",
                        mr: 0.5,
                        color: "#0F5A24",
                      }}
                    />
                    {match.draw_date}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    <strong>Winning Ticket Number:</strong>{" "}
                    <Chip
                      label={match.ticket_matched}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 900,
                        bgcolor: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: "4px",
                      }}
                    />
                  </Typography>
                </Box>

                <Button
                  component={Link}
                  href={`/lottery/${match.lottery_code.toLowerCase()}/${encodeURIComponent(match.draw_date)}`}
                  size="small"
                  sx={{ mt: 2, fontWeight: 800, color: "#0F5A24" }}
                >
                  View Full Prize Breakdown for {match.draw_date} →
                </Button>
              </Paper>
            ))
          ) : (
            <Alert
              severity="info"
              sx={{ borderRadius: "12px", border: "1px solid #B3E5FC" }}
            >
              No winning tickets matched your search query &quot;
              {searchedTicket}&quot;. Try selecting &quot;All Lotteries&quot; or
              searching with fewer digits (e.g. 4-digit last numbers).
            </Alert>
          )}
        </Box>
      ) : null}
    </Container>
  );
}
