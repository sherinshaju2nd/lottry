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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import HistoryIcon from "@mui/icons-material/History";
import StyleIcon from "@mui/icons-material/Style";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { ALL_LOTTERIES, StructuredDrawResult, getLotteryUrl } from "@/lib/supabase";
import ModernDatePicker from "@/components/ModernDatePicker";
import SavedWatchlistDrawer from "@/components/SavedWatchlistDrawer";
import ShareButtons from "@/components/ShareButtons";
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSavedWatchlist,
  addToWatchlist,
  SavedTicket,
} from "@/lib/ticket-storage";

const searchSchema = yup.object({
  ticketNumber: yup
    .string()
    .required("Please enter a ticket number or digits")
    .test(
      "has-digits",
      "Please enter at least 4 numeric digits (e.g. 236935, BT 236935, or 6935)",
      (val) => {
        if (!val) return false;
        const digits = val.replace(/\D/g, "");
        return digits.length >= 4;
      },
    ),
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

interface BatchTicketResult {
  ticketNumber: string;
  matches: SearchMatch[];
}

const POPULAR_SERIES = [
  "BT",
  "SM",
  "SK",
  "KN",
  "FF",
  "NR",
  "WA",
  "WB",
  "WC",
  "WD",
  "WE",
];

export default function AdvancedSearchPage() {
  const [results, setResults] = useState<SearchMatch[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTicket, setSearchedTicket] = useState("");
  const [availableDraws, setAvailableDraws] = useState<StructuredDrawResult[]>(
    [],
  );

  // Pro Feature States
  const [searchMode, setSearchMode] = useState<"single" | "batch">("single");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<SavedTicket[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Batch Mode & Range Generator Validation States
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<BatchTicketResult[] | null>(
    null,
  );
  const [batchError, setBatchError] = useState<string | null>(null);

  const [rangeSeries, setRangeSeries] = useState("BT");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);

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
  const currentTicketInput = watch("ticketNumber");

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
    setRecentSearches(getRecentSearches());
    setWatchlist(getSavedWatchlist());
  }, []);

  // --- Single Search Submission ---
  const onSubmit = async (data: SearchInput) => {
    setIsSearching(true);
    const fullQuery = data.ticketNumber.trim();
    setSearchedTicket(fullQuery);

    // Save to recent searches
    const updatedHistory = addRecentSearch(fullQuery);
    setRecentSearches(updatedHistory);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(fullQuery)}`);
      const json = await res.json();
      let matches: SearchMatch[] = json.results || [];

      if (data.lotteryCode && data.lotteryCode !== "ALL") {
        matches = matches.filter(
          (m) =>
            m.lottery_code.toLowerCase() === data.lotteryCode?.toLowerCase(),
        );
      }

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

  // --- Batch Search Execution with Validation ---
  const handleBatchSubmit = async () => {
    setBatchError(null);
    const rawList = batchInput
      .split(/[\n,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    // Filter tickets that contain at least 2 digits
    const validTickets = rawList.filter(
      (t) => t.replace(/\D/g, "").length >= 2,
    );

    if (validTickets.length === 0) {
      setBatchError(
        "Please enter or paste at least 1 valid ticket number containing digits (e.g. BT 236935, 6935).",
      );
      return;
    }

    setIsSearching(true);
    setBatchResults([]);

    try {
      const compiledResults: BatchTicketResult[] = [];

      for (const tNum of validTickets) {
        addRecentSearch(tNum);
        const res = await fetch(`/api/search?q=${encodeURIComponent(tNum)}`);
        const json = await res.json();
        let matches: SearchMatch[] = json.results || [];

        if (selectedCode && selectedCode !== "ALL") {
          matches = matches.filter(
            (m) => m.lottery_code.toLowerCase() === selectedCode.toLowerCase(),
          );
        }

        if (selectedDate && selectedDate.trim()) {
          matches = matches.filter((m) => m.draw_date === selectedDate.trim());
        }

        compiledResults.push({ ticketNumber: tNum, matches });
      }

      setBatchResults(compiledResults);
      setRecentSearches(getRecentSearches());
    } catch {
      setBatchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Range Generator with Validation ---
  const handleGenerateRange = () => {
    setRangeError(null);
    const cleanStart = rangeStart.trim().replace(/\D/g, "");
    const cleanEnd = rangeEnd.trim().replace(/\D/g, "");

    if (!cleanStart || cleanStart.length < 2) {
      setRangeError(
        "Please enter a valid Start Ticket Number with digits (e.g. 100001).",
      );
      return;
    }

    if (!cleanEnd || cleanEnd.length < 2) {
      setRangeError(
        "Please enter a valid End Ticket Number with digits (e.g. 100010).",
      );
      return;
    }

    const startNum = parseInt(cleanStart, 10);
    const endNum = parseInt(cleanEnd, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
      setRangeError("Ticket numbers must contain valid numeric digits.");
      return;
    }

    if (startNum > endNum) {
      setRangeError(
        "Start Ticket Number cannot be greater than End Ticket Number.",
      );
      return;
    }

    if (endNum - startNum > 50) {
      setRangeError("Maximum allowed range bundle is 50 tickets per search.");
      return;
    }

    const generated: string[] = [];
    const seriesPrefix = rangeSeries.trim().toUpperCase();
    const digitLen = Math.max(cleanStart.length, cleanEnd.length, 6);

    for (let i = startNum; i <= endNum; i++) {
      const numStr = String(i).padStart(digitLen, "0");
      generated.push(seriesPrefix ? `${seriesPrefix} ${numStr}` : numStr);
    }

    const existingText = batchInput.trim();
    setBatchInput(
      existingText
        ? `${existingText}\n${generated.join("\n")}`
        : generated.join("\n"),
    );
    setBatchError(null);
    setRangeError(null);
  };

  // --- Helper: Quick Series Tap ---
  const handleSeriesClick = (seriesCode: string) => {
    const current = currentTicketInput || "";
    if (current.toUpperCase().startsWith(seriesCode)) return;

    const digitsOnly = current.replace(/^[A-Z]{1,2}\s*/i, "");
    setValue("ticketNumber", `${seriesCode} ${digitsOnly}`.trim(), {
      shouldValidate: true,
    });
  };

  // --- Helper: Quick Re-check Chip Click ---
  const handleRecentChipClick = (query: string) => {
    setValue("ticketNumber", query, { shouldValidate: true });
    onSubmit({
      ticketNumber: query,
      lotteryCode: selectedCode,
      drawDate: selectedDate,
    });
  };

  // --- Helper: Save to Watchlist ---
  const handleSaveToWatchlist = () => {
    if (!currentTicketInput || !currentTicketInput.trim()) return;
    const digitsOnly = currentTicketInput.replace(/\D/g, "");
    if (digitsOnly.length < 2) {
      alert(
        "Please enter a valid ticket number with digits before saving to watchlist.",
      );
      return;
    }
    const updated = addToWatchlist(
      currentTicketInput.trim(),
      selectedCode || "ALL",
    );
    setWatchlist(updated);
    setDrawerOpen(true);
  };

  const handleReset = () => {
    reset({
      ticketNumber: "",
      lotteryCode: "ALL",
      drawDate: "",
    });
    setResults(null);
    setBatchResults(null);
    setBatchInput("");
    setBatchError(null);
    setRangeError(null);
    setSearchedTicket("");
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const isCurrentSaved = watchlist.some(
    (w) =>
      w.ticketNumber.toLowerCase() ===
      (currentTicketInput || "").trim().toLowerCase(),
  );

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 3, sm: 5, md: 6 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Page Title & Watchlist Counter Bar */}
      <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mb: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={
              <ConfirmationNumberIcon
                sx={{ fontSize: "14px !important", color: "#0B3C5D" }}
              />
            }
            label="Kerala State Lotteries Ticket Checker"
            sx={{
              bgcolor: "#EBF5FF",
              color: "#0B3C5D",
              fontWeight: 800,
              px: 1,
              borderRadius: "20px",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
            }}
          />
          <Chip
            icon={
              <StarIcon
                sx={{ fontSize: "14px !important", color: "#FFC107" }}
              />
            }
            label={`Watchlist (${watchlist.length})`}
            onClick={() => setDrawerOpen(true)}
            sx={{
              bgcolor: "#FEF3C7",
              color: "#92400E",
              fontWeight: 800,
              cursor: "pointer",
              borderRadius: "20px",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
            }}
          />
        </Box>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 900,
            color: "#0B3C5D",
            mb: 1,
            fontSize: { xs: "1.5rem", sm: "2.1rem", md: "2.5rem" },
          }}
        >
          Kerala Lottery Ticket Result Checker
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#4B5563",
            maxWidth: 640,
            mx: "auto",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Verify your ticket number against official published Kerala Lottery
          results. Search single tickets, batch bundles, or scan photos.
        </Typography>

        {/* <ShareButtons
          title="Official Kerala Lottery Winning Ticket Checker Tool"
          text="Search and check Kerala state lottery winning tickets across single, series, and batch tickets!"
        /> */}
      </Box>

      {/* Main Search Container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3.5, md: 4 },
          borderRadius: "16px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          mb: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        {/* Mode Switcher: Single vs Batch */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={searchMode}
            onChange={(_, val) => {
              setSearchMode(val);
              setResults(null);
              setBatchResults(null);
              setBatchError(null);
              setRangeError(null);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 800,
                textTransform: "none",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              },
              "& .Mui-selected": { color: "#0B3C5D" },
              "& .MuiTabs-indicator": { bgcolor: "#0B3C5D", height: 3 },
            }}
          >
            <Tab
              icon={<SearchIcon />}
              iconPosition="start"
              value="single"
              label="Single Ticket Check"
            />
            <Tab
              icon={<StyleIcon />}
              iconPosition="start"
              value="batch"
              label="🎟️ Check Ticket Bundle (Batch)"
            />
          </Tabs>
        </Box>

        {/* --- SINGLE TICKET MODE --- */}
        {searchMode === "single" && (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Input Row */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  {...register("ticketNumber")}
                  label="Ticket Number"
                  placeholder="e.g. BT 236935 or 6935"
                  fullWidth
                  error={!!errors.ticketNumber}
                  helperText={errors.ticketNumber?.message}
                  variant="outlined"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    input: {
                      endAdornment: (
                        <Box sx={{ display: "flex", gap: 0.5, pl: 0.5 }}>
                          <Tooltip
                            title={
                              isCurrentSaved
                                ? "Ticket Saved to Watchlist"
                                : "Save Ticket to Watchlist"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={handleSaveToWatchlist}
                              sx={{
                                color: isCurrentSaved ? "#FFC107" : "#9CA3AF",
                              }}
                            >
                              {isCurrentSaved ? (
                                <StarIcon fontSize="small" />
                              ) : (
                                <StarBorderIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ),
                    },
                  }}
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
                    {ALL_LOTTERIES.map((l) => (
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

            {/* Recent Search History Chips */}
            {recentSearches.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  pt: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#9CA3AF",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <HistoryIcon sx={{ fontSize: 14 }} /> Recent:
                </Typography>
                {recentSearches.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    size="small"
                    onClick={() => handleRecentChipClick(q)}
                    sx={{
                      bgcolor: "#F9FAFB",
                      color: "#4B5563",
                      border: "1px solid #E5E7EB",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#EBF5FF", color: "#0B3C5D" },
                    }}
                  />
                ))}
                <Button
                  size="small"
                  onClick={handleClearHistory}
                  sx={{
                    color: "#9CA3AF",
                    fontSize: "0.7rem",
                    p: 0,
                    minWidth: "auto",
                  }}
                >
                  Clear History
                </Button>
              </Box>
            )}

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
                  bgcolor: "#0B3C5D",
                  flex: 1,
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(11,60,93,0.2)",
                  "&:hover": { bgcolor: "#0F2C59" },
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
        )}

        {/* --- BATCH TICKET BUNDLE MODE --- */}
        {searchMode === "batch" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Range Generator Accordion Box */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#0B3C5D",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <AddIcon fontSize="small" /> Generate Series Range Bundle (e.g.
                BT 100001 to BT 100010)
              </Typography>
              <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    size="small"
                    label="Series Code"
                    value={rangeSeries}
                    onChange={(e) =>
                      setRangeSeries(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. BT"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3.5 }}>
                  <TextField
                    size="small"
                    label="Start Ticket No"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    placeholder="e.g. 100001"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3.5 }}>
                  <TextField
                    size="small"
                    label="End Ticket No"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    placeholder="e.g. 100010"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGenerateRange}
                    sx={{
                      bgcolor: "#0B3C5D",
                      fontWeight: 800,
                      height: 40,
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "#0F2C59" },
                    }}
                  >
                    Generate
                  </Button>
                </Grid>
              </Grid>

              {rangeError && (
                <Alert
                  severity="error"
                  sx={{ mt: 1.5, borderRadius: "8px", fontWeight: 700 }}
                >
                  {rangeError}
                </Alert>
              )}
            </Paper>

            {/* Multiple Tickets Textarea */}
            <Box>
              <TextField
                multiline
                rows={4}
                label="Paste / Enter Multiple Ticket Numbers"
                placeholder="Enter tickets separated by commas or newlines e.g.:&#10;BT 236935&#10;MJ 727218&#10;163842"
                value={batchInput}
                onChange={(e) => {
                  setBatchInput(e.target.value);
                  if (batchError) setBatchError(null);
                }}
                fullWidth
                error={!!batchError}
              />
              {batchError && (
                <Alert
                  severity="error"
                  sx={{ mt: 1, borderRadius: "8px", fontWeight: 700 }}
                >
                  {batchError}
                </Alert>
              )}
            </Box>

            {/* Filter Controls Row */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
                    {ALL_LOTTERIES.map((l) => (
                      <MenuItem key={l.code} value={l.code}>
                        {l.name} ({l.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  value={selectedDate || ""}
                  onChange={(val) => setValue("drawDate", val)}
                  label="Select Draw Date"
                  publishedDates={publishedDateList}
                />
              </Grid>
            </Grid>

            {/* Batch Execution Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                disabled={isSearching}
                onClick={handleBatchSubmit}
                startIcon={
                  isSearching ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SearchIcon />
                  )
                }
                sx={{
                  bgcolor: "#0B3C5D",
                  flex: 1,
                  py: 1.5,
                  fontWeight: 900,
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#0F2C59" },
                }}
              >
                {isSearching
                  ? "Checking Ticket Bundle..."
                  : "Check All Bundle Tickets Now"}
              </Button>

              <Button
                onClick={handleReset}
                variant="outlined"
                size="large"
                sx={{ fontWeight: 700, borderRadius: "10px", px: 3 }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* --- SINGLE RESULTS RENDERING --- */}
      {searchMode === "single" && isSearching && (
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
      )}

      {searchMode === "single" && !isSearching && results !== null && (
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
              <Link
                key={i}
                href={`${getLotteryUrl(match.lottery_code, match.draw_date)}?highlight=${encodeURIComponent(match.ticket_matched)}`}
                style={{ textDecoration: "none" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "12px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    "&:hover": {
                      bgcolor: "#EBF5FF",
                      borderColor: "#BFDBFE",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(11,60,93,0.1)",
                    },
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
                        bgcolor: "#EBF5FF",
                        color: "#0B3C5D",
                        fontWeight: 800,
                        borderRadius: "6px",
                      }}
                    />
                    {match.prize_amount && (
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 900, color: "#0B3C5D" }}
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
                          color: "#0B3C5D",
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

                  <Typography
                    variant="body2"
                    sx={{ mt: 1.5, color: "#0B3C5D", fontWeight: 800 }}
                  >
                    Tap to view full prize breakdown →
                  </Typography>
                </Paper>
              </Link>
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
      )}

      {/* --- BATCH RESULTS RENDERING --- */}
      {searchMode === "batch" && isSearching && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Skeleton variant="text" width={280} height={32} />
          <Skeleton
            variant="rounded"
            height={100}
            sx={{ borderRadius: "12px" }}
          />
          <Skeleton
            variant="rounded"
            height={100}
            sx={{ borderRadius: "12px" }}
          />
        </Box>
      )}

      {searchMode === "batch" && !isSearching && batchResults !== null && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#111827" }}>
            Bundle Search Results ({batchResults.length} Tickets Checked)
          </Typography>

          {batchResults.map((item, index) => {
            const hasMatch = item.matches.length > 0;
            return (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  bgcolor: hasMatch ? "#EBF5FF" : "#FFFFFF",
                  border: hasMatch ? "2px solid #BFDBFE" : "1px solid #E5E7EB",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 900, color: "#111827" }}
                  >
                    Ticket:{" "}
                    <span style={{ color: "#0B3C5D" }}>
                      {item.ticketNumber}
                    </span>
                  </Typography>

                  <Chip
                    label={
                      hasMatch
                        ? `🎉 ${item.matches.length} WINNING MATCH!`
                        : "No Match"
                    }
                    color={hasMatch ? "success" : "default"}
                    sx={{ fontWeight: 900 }}
                  />
                </Box>

                {hasMatch ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    {item.matches.map((m, idx) => (
                      <Link
                        key={idx}
                        href={`${getLotteryUrl(m.lottery_code, m.draw_date)}?highlight=${encodeURIComponent(m.ticket_matched)}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <Alert
                          severity="success"
                          sx={{
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            "&:hover": {
                              bgcolor: "#D1FAE5",
                              transform: "translateX(4px)",
                              boxShadow: "0 2px 8px rgba(11,60,93,0.12)",
                            },
                          }}
                        >
                          <strong>{m.prize_tier}</strong> — {m.draw_name} (
                          {m.draw_code}) on {m.draw_date}. Matched number:{" "}
                          {m.ticket_matched}.
                          {m.prize_amount && (
                            <span>
                              {" "}
                              Prize: <strong>{m.prize_amount}</strong>
                            </span>
                          )}
                          <span style={{ marginLeft: 8, color: "#0B3C5D", fontWeight: 800, fontSize: 13 }}>→ View</span>
                        </Alert>
                      </Link>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    No prize tier matched for this ticket number in published
                    results.
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Saved Watchlist Drawer */}
      <SavedWatchlistDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCheckBatch={(tickets) => {
          setSearchMode("batch");
          setBatchInput(tickets.join("\n"));
        }}
      />
    </Container>
  );
}
