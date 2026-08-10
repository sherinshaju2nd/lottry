"use client";

import React, { useState } from "react";
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
import Link from "next/link";
import { WEEKLY_LOTTERIES } from "@/lib/supabase";

const advancedSearchSchema = yup.object({
  ticketNumber: yup
    .string()
    .required("Please enter a ticket number or digits")
    .min(2, "Search query must be at least 2 characters"),
  lotteryCode: yup.string().optional(),
});

type AdvancedSearchInput = yup.InferType<typeof advancedSearchSchema>;

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdvancedSearchInput>({
    resolver: yupResolver(advancedSearchSchema),
    defaultValues: {
      ticketNumber: "",
      lotteryCode: "ALL",
    },
  });

  const selectedCode = watch("lotteryCode");

  const onSubmit = async (data: AdvancedSearchInput) => {
    setIsSearching(true);
    setSearchedTicket(data.ticketNumber);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(data.ticketNumber)}`);
      const json = await res.json();
      let matches: SearchMatch[] = json.results || [];

      if (data.lotteryCode && data.lotteryCode !== "ALL") {
        matches = matches.filter(
          (m) => m.lottery_code.toLowerCase() === data.lotteryCode?.toLowerCase()
        );
      }

      setResults(matches);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: "#1B5E20", mb: 1, fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.6rem" } }}>
          Kerala Lottery Live Ticket Result Checker
        </Typography>
        <Typography variant="body1" sx={{ color: "#4B5563", maxWidth: 640, mx: "auto" }}>
          Official 3:30 PM Kerala Lottery Result Today search engine — verify 1st prize ₹70 Lakhs, consolation prizes, and 2nd–9th prize numbers instantly.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: "12px", bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", mb: 6 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                {...register("ticketNumber")}
                label="Ticket Number or 6-Digit Number"
                placeholder="e.g. 236935 or MJ 236935 or 1638"
                fullWidth
                error={!!errors.ticketNumber}
                helperText={errors.ticketNumber?.message}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filter by Lottery</InputLabel>
                <Select
                  value={selectedCode || "ALL"}
                  onChange={(e) => setValue("lotteryCode", e.target.value as string)}
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
          </Grid>

          <Button
            type="submit"
            disabled={isSearching}
            variant="contained"
            size="large"
            startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            sx={{ bgcolor: "#2E7D32", py: 1.5, fontWeight: 800, fontSize: "1rem", borderRadius: "8px", "&:hover": { bgcolor: "#1B5E20" } }}
          >
            {isSearching ? "Searching Published Results..." : "Check Kerala Lottery Ticket"}
          </Button>
        </Box>
      </Paper>

      {isSearching ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Skeleton variant="text" width={240} height={32} />
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: "12px" }} />
        </Box>
      ) : results !== null ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827" }}>
            Search Results for &quot;{searchedTicket}&quot; ({results.length} match{results.length !== 1 ? "es" : ""})
          </Typography>

          {results.length > 0 ? (
            results.map((match, i) => (
              <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: "12px", bgcolor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Chip
                    icon={<EmojiEventsIcon sx={{ fontSize: "16px !important" }} />}
                    label={match.prize_tier}
                    color="primary"
                    sx={{ fontWeight: 800, borderRadius: "6px" }}
                  />
                  {match.prize_amount && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#2E7D32" }}>
                      Prize: {match.prize_amount}
                    </Typography>
                  )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mt: 1 }}>
                  {match.draw_name} ({match.draw_code})
                </Typography>

                <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                  <strong>Draw Date:</strong> {match.draw_date}
                </Typography>

                <Typography variant="body2" sx={{ color: "#374151", mt: 1, mb: 1.5 }}>
                  <strong>Winning Ticket Number:</strong>{" "}
                  <Chip label={match.ticket_matched} size="small" sx={{ fontFamily: "monospace", fontWeight: 800, bgcolor: "#FEF3C7", color: "#92400E", borderRadius: "4px" }} />
                </Typography>

                <Button
                  component={Link}
                  href={`/lottery/${match.lottery_code.toLowerCase()}/${encodeURIComponent(match.draw_date)}`}
                  size="small"
                  sx={{ fontWeight: 700, color: "#2E7D32" }}
                >
                  View Full Draw Breakdown →
                </Button>
              </Paper>
            ))
          ) : (
            <Alert severity="info" sx={{ borderRadius: "12px" }}>
              No winning tickets matched your query &quot;{searchedTicket}&quot;. Please double check your ticket number or try searching with fewer digits.
            </Alert>
          )}
        </Box>
      ) : null}
    </Container>
  );
}
