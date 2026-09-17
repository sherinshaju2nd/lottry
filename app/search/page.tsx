"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
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
import AddIcon from "@mui/icons-material/Add";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LayersIcon from "@mui/icons-material/Layers";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ALL_LOTTERIES,
  StructuredDrawResult,
  getLotteryUrl,
  formatTicketSearchInput,
  hasAnyDrawResult,
  supabase,
} from "@/lib/supabase";
import ModernDatePicker from "@/components/ModernDatePicker";
import SavedWatchlistDrawer from "@/components/SavedWatchlistDrawer";
import AiTicketScanner from "@/components/AiTicketScanner";
import JustMissModal from "@/components/JustMissModal";
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSavedWatchlist,
  addToWatchlist,
  SavedTicket,
} from "@/lib/ticket-storage";


function formatDisplayDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

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

export default function AdvancedSearchPage() {
  const [results, setResults] = useState<SearchMatch[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTicket, setSearchedTicket] = useState("");
  const [availableDraws, setAvailableDraws] = useState<StructuredDrawResult[]>([]);

  // Mobile Pro Feature States
  const [searchMode, setSearchMode] = useState<"single" | "batch">("single");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<SavedTicket[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clipboardTicket, setClipboardTicket] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Batch Mode & Range Generator Validation States
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<BatchTicketResult[] | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const [rangeSeries, setRangeSeries] = useState("BT");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [isJustMissOpen, setIsJustMissOpen] = useState(false);
  const [selectedJustMissTicket, setSelectedJustMissTicket] = useState("");

  const singleDrawsScrollRef = React.useRef<HTMLDivElement>(null);
  const batchDrawsScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollDraws = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth",
      });
    }
  };

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
      drawDate: "",
    },
  });

  const currentTicketInput = watch("ticketNumber");

  const publishedDraws = useMemo(() => {
    return availableDraws.filter(
      (d) =>
        Boolean(d.first?.ticket) ||
        (d.prizes && Object.keys(d.prizes).length > 0),
    );
  }, [availableDraws]);

  const publishedDateList = useMemo(() => {
    return Array.from(new Set(availableDraws.map((d) => d.draw_date)));
  }, [availableDraws]);

  const selectedDraw = useMemo(() => {
    return availableDraws.find((d) => d.draw_date === selectedDateFilter) || null;
  }, [availableDraws, selectedDateFilter]);

  const isSelectedDrawPublished = useMemo(() => {
    if (!selectedDateFilter) return true;
    return selectedDraw ? hasAnyDrawResult(selectedDraw) : false;
  }, [selectedDraw, selectedDateFilter]);

  const targetDrawForJustMiss = selectedDraw || publishedDraws[0] || availableDraws[0] || null;

  useEffect(() => {
    async function loadDraws() {
      try {
        const res = await fetch(`/api/draws?type=all&t=${Date.now()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.results)) {
          setAvailableDraws(json.results);
          const withData = json.results.filter(
            (d: StructuredDrawResult) =>
              Boolean(d.first?.ticket) ||
              (d.prizes && Object.keys(d.prizes).length > 0),
          );
          if (withData.length > 0) {
            setSelectedDateFilter((prev) => prev || withData[0].draw_date);
          } else if (json.results.length > 0) {
            setSelectedDateFilter((prev) => prev || json.results[0].draw_date);
          }
        }
      } catch {
        setAvailableDraws([]);
      }
    }
    loadDraws();
    setRecentSearches(getRecentSearches());
    setWatchlist(getSavedWatchlist());

    // Try reading clipboard on load / focus
    const checkClipboard = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.trim().length >= 4 && text.trim().length <= 15) {
            const digits = text.replace(/\D/g, "");
            if (digits.length >= 4) {
              setClipboardTicket(text.trim().toUpperCase());
            }
          }
        }
      } catch {}
    };
    checkClipboard();

    const channelName = `realtime-search-page-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draw_results" },
        () => {
          loadDraws();
        }
      )
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadDraws();
        checkClipboard();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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

      if (selectedDateFilter && selectedDateFilter.trim()) {
        matches = matches.filter((m) => m.draw_date === selectedDateFilter.trim());
      }

      setResults(matches);

      // Trigger Confetti on Winning Match!
      if (matches.length > 0) {
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
          });
        } catch {}
      }
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
      let totalWinners = 0;

      for (const tNum of validTickets) {
        addRecentSearch(tNum);
        const res = await fetch(`/api/search?q=${encodeURIComponent(tNum)}`);
        const json = await res.json();
        let matches: SearchMatch[] = json.results || [];

        if (selectedDateFilter && selectedDateFilter.trim()) {
          matches = matches.filter((m) => m.draw_date === selectedDateFilter.trim());
        }

        if (matches.length > 0) totalWinners++;
        compiledResults.push({ ticketNumber: tNum, matches });
      }

      setBatchResults(compiledResults);
      setRecentSearches(getRecentSearches());

      if (totalWinners > 0) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch {
      setBatchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Range Generator ---
  const handleGenerateRange = () => {
    setRangeError(null);
    const cleanStart = rangeStart.trim().replace(/\D/g, "");
    const cleanEnd = rangeEnd.trim().replace(/\D/g, "");

    if (!cleanStart || cleanStart.length < 2) {
      setRangeError("Please enter a valid Start Ticket Number with digits (e.g. 100001).");
      return;
    }

    if (!cleanEnd || cleanEnd.length < 2) {
      setRangeError("Please enter a valid End Ticket Number with digits (e.g. 100010).");
      return;
    }

    const startNum = parseInt(cleanStart, 10);
    const endNum = parseInt(cleanEnd, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
      setRangeError("Ticket numbers must contain valid numeric digits.");
      return;
    }

    if (startNum > endNum) {
      setRangeError("Start Ticket Number cannot be greater than End Ticket Number.");
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

  // --- Helper: Quick Re-check Chip Click ---
  const handleRecentChipClick = (query: string) => {
    setValue("ticketNumber", query, { shouldValidate: true });
    onSubmit({
      ticketNumber: query,
      drawDate: selectedDateFilter || undefined,
    });
  };

  // --- Helper: Save to Watchlist ---
  const handleSaveToWatchlist = () => {
    if (!currentTicketInput || !currentTicketInput.trim()) return;
    const digitsOnly = currentTicketInput.replace(/\D/g, "");
    if (digitsOnly.length < 2) {
      alert("Please enter a valid ticket number with digits before saving to watchlist.");
      return;
    }
    const updated = addToWatchlist(
      currentTicketInput.trim(),
      "ALL",
    );
    setWatchlist(updated);
    setDrawerOpen(true);
  };

  const handleReset = () => {
    reset({
      ticketNumber: "",
      drawDate: "",
    });
    setSelectedDateFilter(null);
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
      sx={{ py: { xs: 2.5, sm: 4, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Header & Watchlist Top Bar (Desktop & Tablet only, hidden on mobile) */}
      <Box sx={{ mb: { xs: 2.5, sm: 3.5 }, textAlign: "center", display: { xs: "none", sm: "block" } }}>
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
            icon={<ConfirmationNumberIcon sx={{ fontSize: "15px !important", color: "#0B3C5D" }} />}
            label="Kerala Lottery Winning Ticket Checker"
            sx={{
              bgcolor: "#EBF5FF",
              color: "#0B3C5D",
              fontWeight: 800,
              px: 1,
              borderRadius: "20px",
              fontSize: { xs: "0.725rem", sm: "0.8rem" },
            }}
          />
          <Chip
            icon={<StarIcon sx={{ fontSize: "15px !important", color: "#F59E0B" }} />}
            label={`Watchlist (${watchlist.length})`}
            onClick={() => setDrawerOpen(true)}
            sx={{
              bgcolor: "#FEF3C7",
              color: "#92400E",
              fontWeight: 800,
              cursor: "pointer",
              borderRadius: "20px",
              fontSize: { xs: "0.725rem", sm: "0.8rem" },
            }}
          />
        </Box>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 900,
            color: "#0F172A",
            mb: 0.75,
            fontSize: { xs: "1.45rem", sm: "1.9rem", md: "2.3rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Kerala Lottery Ticket Result Checker
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#64748B",
            maxWidth: 600,
            mx: "auto",
            fontSize: { xs: "0.825rem", sm: "0.95rem" },
          }}
        >
          Enter ticket number and select draw date to verify winning status • 1st to 9th Prize Instant Check
        </Typography>
      </Box>

      {/* Main Search Container - Mobile App Exact Card Style */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          borderRadius: { xs: "18px", sm: "22px" },
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          mb: 4,
          boxShadow: "0 10px 30px -5px rgba(11, 60, 93, 0.08)",
        }}
      >
        {/* Mobile App Style Segmented Pill Tab Bar */}
        <Box sx={{ mb: 2.5, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              bgcolor: "#F1F5F9",
              p: 0.6,
              borderRadius: "14px",
              display: "inline-flex",
              width: "100%",
              maxWidth: 480,
            }}
          >
            <Button
              onClick={() => {
                setSearchMode("single");
                setResults(null);
                setBatchResults(null);
              }}
              fullWidth
              startIcon={<ConfirmationNumberIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: "10px",
                py: 1,
                fontWeight: 800,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                textTransform: "none",
                bgcolor: searchMode === "single" ? "#0B3C5D" : "transparent",
                color: searchMode === "single" ? "#FFFFFF" : "#64748B",
                boxShadow: searchMode === "single" ? "0 4px 12px rgba(11,60,93,0.25)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: searchMode === "single" ? "#0B3C5D" : "#E2E8F0",
                },
              }}
            >
              Single Search
            </Button>
            <Button
              onClick={() => {
                setSearchMode("batch");
                setResults(null);
                setBatchResults(null);
              }}
              fullWidth
              startIcon={<LayersIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: "10px",
                py: 1,
                fontWeight: 800,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                textTransform: "none",
                bgcolor: searchMode === "batch" ? "#0B3C5D" : "transparent",
                color: searchMode === "batch" ? "#FFFFFF" : "#64748B",
                boxShadow: searchMode === "batch" ? "0 4px 12px rgba(11,60,93,0.25)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: searchMode === "batch" ? "#0B3C5D" : "#E2E8F0",
                },
              }}
            >
              Batch Search
            </Button>
          </Box>
        </Box>

        {/* --- SINGLE TICKET MODE --- */}
        {searchMode === "single" && (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Ticket Number Label */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  mb: 0.75,
                }}
              >
                Ticket Number <span style={{ color: "#64748B", fontWeight: 600 }}>(ലോട്ടറി നമ്പർ)</span>
              </Typography>

              {/* Input Row with Mobile Action Buttons */}
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <TextField
                    {...register("ticketNumber", {
                      onChange: (e) => {
                        const formatted = formatTicketSearchInput(e.target.value);
                        setValue("ticketNumber", formatted, { shouldValidate: true });
                        if (!formatted.trim()) {
                          setResults(null);
                          setSearchedTicket("");
                        }
                      },
                    })}
                    placeholder="e.g. MJ 136429, 136429, or 6429"
                    fullWidth
                    error={!!errors.ticketNumber}
                    helperText={errors.ticketNumber?.message}
                    variant="outlined"
                    slotProps={{
                      input: {
                        sx: {
                          borderRadius: "12px",
                          bgcolor: "#F8FAFC",
                          fontSize: "0.95rem",
                          "&.Mui-focused": { bgcolor: "#FFFFFF" },
                        },
                        endAdornment: (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {/* Clear Button (X) */}
                            {currentTicketInput && currentTicketInput.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setValue("ticketNumber", "");
                                  setResults(null);
                                  setSearchedTicket("");
                                }}
                                sx={{
                                  p: 0.4,
                                  bgcolor: "#E2E8F0",
                                  color: "#64748B",
                                  "&:hover": { bgcolor: "#CBD5E1", color: "#0F172A" },
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            )}

                            {/* Voice Mic Icon */}
                            <Tooltip title="Voice Search (സംസാരിച്ച് പരിശോധിക്കുക)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("open-ai-voice-assistant", { detail: { startListening: true } })
                                  );
                                }}
                                sx={{
                                  color: "#DC2626",
                                  bgcolor: "#FEF2F2",
                                  "&:hover": { bgcolor: "#FEE2E2" },
                                }}
                              >
                                <MicIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Save to Watchlist Star */}
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
                                  color: isCurrentSaved ? "#F59E0B" : "#94A3B8",
                                  "&:hover": { color: "#F59E0B" },
                                }}
                              >
                                {isCurrentSaved ? (
                                  <StarIcon sx={{ fontSize: 18 }} />
                                ) : (
                                  <StarBorderIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ),
                      },
                    }}
                  />
                </Box>

                {/* Direct Camera Scanner Button (Mobile App Style) */}
                <Tooltip title="Scan Ticket with Camera / Photo">
                  <IconButton
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-ai-ticket-scanner"));
                    }}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      color: "#0B3C5D",
                      bgcolor: "#EFF6FF",
                      border: "1.5px solid #BFDBFE",
                      "&:hover": { bgcolor: "#DBEAFE" },
                    }}
                  >
                    <CameraAltIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>

              </Box>
            </Box>

            {/* Instant Clipboard Paste Banner (Mobile App Style) */}
            {clipboardTicket && clipboardTicket !== currentTicketInput && (
              <Box
                onClick={() => {
                  setValue("ticketNumber", clipboardTicket, { shouldValidate: true });
                  setClipboardTicket(null);
                }}
                sx={{
                  bgcolor: "#EFF6FF",
                  border: "1.5px solid #93C5FD",
                  borderRadius: "12px",
                  p: 1.25,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "#DBEAFE",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Chip
                  label="WhatsApp / SMS"
                  size="small"
                  sx={{
                    bgcolor: "#0B3C5D",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#1E293B", fontSize: "0.825rem", flex: 1 }}>
                  📋 Paste from Clipboard: <strong style={{ color: "#0B3C5D" }}>{clipboardTicket}</strong>
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    bgcolor: "#0B3C5D",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    py: 0.4,
                    px: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                  }}
                >
                  Paste
                </Button>
              </Box>
            )}



            {/* Draw Date Filter Selection */}
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  mb: 0.75,
                }}
              >
                Draw Date Filter <span style={{ color: "#64748B", fontWeight: 600 }}>(തീയതി തിരഞ്ഞെടുക്കുക)</span>
              </Typography>

              <ModernDatePicker
                value={selectedDateFilter || ""}
                onChange={(val) => setSelectedDateFilter(val)}
                label="Select Draw Date / All Draws"
                publishedDates={publishedDateList}
              />
            </Box>

            {/* OR Divider & Published Previous Draws Cards (Mobile App Exact Feature!) */}
            {publishedDraws && publishedDraws.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    my: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1, height: 1, bgcolor: "#E2E8F0" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      mx: 2,
                      fontWeight: 800,
                      color: "#94A3B8",
                      letterSpacing: "0.08em",
                    }}
                  >
                    OR SELECT RECENT DRAW
                  </Typography>
                  <Box sx={{ flex: 1, height: 1, bgcolor: "#E2E8F0" }} />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      fontWeight: 800,
                      color: "#334155",
                      fontSize: "0.8rem",
                    }}
                  >
                    Recent Published Draws <span style={{ color: "#64748B" }}>(സമീപകാല നറുക്കെടുപ്പുകൾ):</span>
                  </Typography>

                  {/* Left & Right Scroll Buttons */}
                  <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                    <IconButton
                      size="small"
                      onClick={() => scrollDraws(singleDrawsScrollRef, "left")}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#FFFFFF",
                        border: "1.5px solid #CBD5E1",
                        color: "#0B3C5D",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        "&:hover": { bgcolor: "#EBF5FF", borderColor: "#0B3C5D" },
                      }}
                      aria-label="Scroll left"
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => scrollDraws(singleDrawsScrollRef, "right")}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#FFFFFF",
                        border: "1.5px solid #CBD5E1",
                        color: "#0B3C5D",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        "&:hover": { bgcolor: "#EBF5FF", borderColor: "#0B3C5D" },
                      }}
                      aria-label="Scroll right"
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  ref={singleDrawsScrollRef}
                  sx={{
                    display: "flex",
                    gap: 1.25,
                    overflowX: "auto",
                    pb: 1,
                    scrollBehavior: "smooth",
                    "&::-webkit-scrollbar": { height: 5 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 4 },
                  }}
                >
                  {publishedDraws.slice(0, 10).map((draw, idx) => {
                    const isSelected = selectedDateFilter === draw.draw_date;
                    return (
                      <Box
                        key={draw.draw_date + (draw.lottery_code || idx)}
                        onClick={() => {
                          setSelectedDateFilter(isSelected ? null : draw.draw_date);
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: isSelected ? "#0B3C5D" : "#E0F2FE",
                          color: isSelected ? "#FFFFFF" : "#0F172A",
                          borderRadius: "12px",
                          py: 1,
                          px: 1.5,
                          border: "1.5px solid",
                          borderColor: isSelected ? "#0F2C59" : "#BAE6FD",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 4px 12px rgba(11,60,93,0.3)" : "none",
                          "&:hover": {
                            bgcolor: isSelected ? "#0B3C5D" : "#BAE6FD",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Box sx={{ mr: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              color: isSelected ? "#FFFFFF" : "#0F172A",
                              lineHeight: 1.2,
                              mb: 0.25,
                            }}
                          >
                            {draw.draw_name || draw.lottery_code}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isSelected ? "#93C5FD" : "#475569",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {formatDisplayDate(draw.draw_date)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 1,
                            height: 26,
                            borderLeft: "1px dashed",
                            borderColor: isSelected ? "rgba(255,255,255,0.4)" : "#93C5FD",
                            mr: 1.5,
                          }}
                        />

                        <Box
                          sx={{
                            bgcolor: isSelected ? "#10B981" : "#0B3C5D",
                            color: "#FFFFFF",
                            px: 1,
                            py: 0.4,
                            borderRadius: "6px",
                            fontWeight: 900,
                            fontSize: "0.7rem",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {draw.lottery_code || "DRAW"}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Action Buttons Row */}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", pt: 1.5 }}>
              <Button
                type="submit"
                disabled={!currentTicketInput?.trim() || isSearching}
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
                  color: "#FFFFFF",
                  flex: { xs: "1 1 100%", sm: "2" },
                  py: 1.5,
                  fontWeight: 900,
                  fontSize: "1rem",
                  borderRadius: "14px",
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(11,60,93,0.25)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "#0F2C59",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 18px rgba(11,60,93,0.35)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#94A3B8",
                    color: "#FFFFFF",
                  },
                }}
              >
                {isSearching ? "Searching Results..." : "Check Winning Status"}
              </Button>

              <AiTicketScanner
                variant="full"
                onTicketDetected={(ticketNum, lCode, dDate) => {
                  setValue("ticketNumber", ticketNum, { shouldValidate: true });
                  if (dDate) setSelectedDateFilter(dDate);
                  onSubmit({
                    ticketNumber: ticketNum,
                    drawDate: dDate || selectedDateFilter || undefined,
                  });
                }}
              />
            </Box>

            {/* --- SINGLE RESULTS RENDERING (INSIDE CARD) --- */}
            {isSearching && (
              <Box sx={{ mt: 3, pt: 3, borderTop: "1.5px dashed #E2E8F0", display: "flex", flexDirection: "column", gap: 2 }}>
                <Skeleton variant="text" width={240} height={32} />
                <Skeleton variant="rounded" height={130} sx={{ borderRadius: "14px" }} />
                <Skeleton variant="rounded" height={130} sx={{ borderRadius: "14px" }} />
              </Box>
            )}

            {!isSearching && results !== null && searchedTicket.trim() !== "" && (
              <Box sx={{ mt: 3, pt: 3, borderTop: "1.5px dashed #E2E8F0", display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Winner Celebration Banner on match */}
                {results.length > 0 && (
                  <Box
                    sx={{
                      bgcolor: "#FEF3C7",
                      border: "1.5px solid #F59E0B",
                      borderRadius: "16px",
                      p: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      boxShadow: "0 8px 24px rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    <EmojiEventsIcon sx={{ color: "#D97706", fontSize: 36 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#92400E", lineHeight: 1.2 }}>
                        🎉 Congratulations! You Won a Prize!
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#78350F", fontSize: "0.85rem", mt: 0.5 }}>
                        Ticket <strong>{searchedTicket}</strong> matched official published prize results! Check details below.
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.15rem" }}>
                    Search Results for &quot;{searchedTicket}&quot;
                  </Typography>
                  <Chip
                    label={`${results.length} match${results.length !== 1 ? "es" : ""}`}
                    color={results.length > 0 ? "success" : "default"}
                    sx={{ fontWeight: 900 }}
                  />
                </Box>

                {results.length > 0 ? (
                  results.map((match, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: "16px",
                        bgcolor: "#FFFFFF",
                        border: "1.5px solid #E2E8F0",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#0B3C5D",
                          boxShadow: "0 10px 25px rgba(11,60,93,0.12)",
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
                          icon={<EmojiEventsIcon sx={{ fontSize: "16px !important", color: "#0B3C5D" }} />}
                          label={match.prize_tier}
                          sx={{
                            bgcolor: "#EBF5FF",
                            color: "#0B3C5D",
                            fontWeight: 900,
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                          }}
                        />
                        {match.prize_amount && (
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 900, color: "#166534", fontSize: "1.1rem" }}
                          >
                            Prize: {match.prize_amount}
                          </Typography>
                        )}
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 900, color: "#0F172A", mt: 0.5, fontSize: "1.05rem" }}
                      >
                        {match.draw_name} ({match.draw_code})
                      </Typography>

                      <Box sx={{ display: "flex", gap: 3, mt: 1, flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
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
                        <Typography variant="body2" sx={{ color: "#334155" }}>
                          <strong>Winning Ticket:</strong>{" "}
                          <Chip
                            label={match.ticket_matched}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 900,
                              bgcolor: "#FEF3C7",
                              color: "#92400E",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                            }}
                          />
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Link
                          href={`${getLotteryUrl(match.lottery_code, match.draw_date)}?highlight=${encodeURIComponent(match.ticket_matched)}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                              bgcolor: "#0B3C5D",
                              color: "#FFFFFF",
                              fontWeight: 900,
                              textTransform: "none",
                              borderRadius: "10px",
                              px: 2,
                              py: 0.75,
                              "&:hover": { bgcolor: "#0F2C59" },
                            }}
                          >
                            View Details & Official Chart
                          </Button>
                        </Link>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Alert
                      severity={
                        !isSelectedDrawPublished &&
                        selectedDateFilter &&
                        selectedDateFilter >= new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
                          ? "warning"
                          : "info"
                      }
                      sx={{ borderRadius: "14px", border: "1px solid", fontWeight: 600 }}
                    >
                      {!isSelectedDrawPublished &&
                      selectedDateFilter === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) ? (
                        <span>
                          <strong>Draw for Today ({selectedDateFilter}) in Progress:</strong> Results are drawn at 3:00 PM and published at 3:10 PM. If today&apos;s draw is not finished yet, please check back shortly!
                        </span>
                      ) : !isSelectedDrawPublished &&
                        selectedDateFilter &&
                        selectedDateFilter > new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) ? (
                        <span>
                          <strong>Upcoming Scheduled Draw:</strong> The draw scheduled for {selectedDateFilter} has not taken place yet.
                        </span>
                      ) : searchedTicket.replace(/\D/g, "").length >= 4 && searchedTicket.replace(/\D/g, "").length < 6 ? (
                        <span>
                          4-digit query &quot;{searchedTicket}&quot; did not match 4th to 9th Prize tiers. <strong>Note:</strong> 1st, 2nd, 3rd, and Consolation prizes strictly require entering your <strong>full 6-digit ticket number with series</strong> (e.g. MJ 136429).
                        </span>
                      ) : (
                        <span>
                          No winning tickets matched your search query &quot;{searchedTicket}&quot;. Check the full draw breakdown or verify with Just Miss analysis.
                        </span>
                      )}
                    </Alert>

                    {/* Action Buttons: View Details & Just Miss */}
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                      {targetDrawForJustMiss && (
                        <Link
                          href={`${getLotteryUrl(targetDrawForJustMiss.lottery_code, targetDrawForJustMiss.draw_date)}?highlight=${encodeURIComponent(searchedTicket)}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Button
                            variant="contained"
                            startIcon={<DescriptionIcon sx={{ color: "#0B3C5D", fontSize: 18 }} />}
                            sx={{
                              bgcolor: "#EBF5FF",
                              border: "1.5px solid #0B3C5D",
                              color: "#0B3C5D",
                              fontWeight: 800,
                              borderRadius: "10px",
                              textTransform: "none",
                              py: 1,
                              px: 2,
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: "#DBEAFE",
                                borderColor: "#0F2C59",
                                boxShadow: "none",
                              },
                            }}
                          >
                            View Result ({targetDrawForJustMiss.draw_name || targetDrawForJustMiss.lottery_code})
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="contained"
                        startIcon={<TrackChangesIcon sx={{ color: "#FFFFFF", fontSize: 18 }} />}
                        onClick={() => {
                          setSelectedJustMissTicket(searchedTicket || currentTicketInput || "");
                          setIsJustMissOpen(true);
                        }}
                        sx={{
                          bgcolor: "#0B3C5D",
                          border: "1.5px solid #0B3C5D",
                          color: "#FFFFFF",
                          fontWeight: 800,
                          borderRadius: "10px",
                          textTransform: "none",
                          py: 1,
                          px: 2.2,
                          boxShadow: "0 4px 12px rgba(11, 60, 93, 0.25)",
                          "&:hover": {
                            bgcolor: "#0F2C59",
                            borderColor: "#0F2C59",
                            boxShadow: "0 6px 16px rgba(11, 60, 93, 0.35)",
                          },
                        }}
                      >
                        Just Miss
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* --- BATCH TICKET BUNDLE MODE --- */}
        {searchMode === "batch" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Range Generator Box */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
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
                <AddIcon fontSize="small" /> Generate Series Range Bundle (e.g. BT 100001 to BT 100010)
              </Typography>
              <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    size="small"
                    label="Series Code"
                    value={rangeSeries}
                    onChange={(e) => setRangeSeries(e.target.value.toUpperCase())}
                    placeholder="e.g. BT"
                    fullWidth
                    slotProps={{ input: { sx: { borderRadius: "10px", bgcolor: "#FFFFFF" } } }}
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
                    slotProps={{ input: { sx: { borderRadius: "10px", bgcolor: "#FFFFFF" } } }}
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
                    slotProps={{ input: { sx: { borderRadius: "10px", bgcolor: "#FFFFFF" } } }}
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
                      borderRadius: "10px",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#0F2C59" },
                    }}
                  >
                    Generate
                  </Button>
                </Grid>
              </Grid>

              {rangeError && (
                <Alert severity="error" sx={{ mt: 1.5, borderRadius: "8px", fontWeight: 700 }}>
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
                slotProps={{ input: { sx: { borderRadius: "12px", bgcolor: "#F8FAFC" } } }}
              />
              {batchError && (
                <Alert severity="error" sx={{ mt: 1, borderRadius: "8px", fontWeight: 700 }}>
                  {batchError}
                </Alert>
              )}
            </Box>

            {/* Draw Date Filter */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  mb: 0.75,
                }}
              >
                Draw Date Filter <span style={{ color: "#64748B", fontWeight: 600 }}>(തീയതി തിരഞ്ഞെടുക്കുക)</span>
              </Typography>
              <ModernDatePicker
                value={selectedDateFilter || ""}
                onChange={(val) => setSelectedDateFilter(val)}
                label="Select Draw Date / All Draws"
                publishedDates={publishedDateList}
              />
            </Box>

            {/* OR Divider & Published Previous Draws Cards in Batch Mode */}
            {publishedDraws && publishedDraws.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    my: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1, height: 1, bgcolor: "#E2E8F0" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      mx: 2,
                      fontWeight: 800,
                      color: "#94A3B8",
                      letterSpacing: "0.08em",
                    }}
                  >
                    OR SELECT RECENT DRAW
                  </Typography>
                  <Box sx={{ flex: 1, height: 1, bgcolor: "#E2E8F0" }} />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      fontWeight: 800,
                      color: "#334155",
                      fontSize: "0.8rem",
                    }}
                  >
                    Recent Published Draws <span style={{ color: "#64748B" }}>(സമീപകാല നറുക്കെടുപ്പുകൾ):</span>
                  </Typography>

                  {/* Left & Right Scroll Buttons */}
                  <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                    <IconButton
                      size="small"
                      onClick={() => scrollDraws(batchDrawsScrollRef, "left")}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#FFFFFF",
                        border: "1.5px solid #CBD5E1",
                        color: "#0B3C5D",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        "&:hover": { bgcolor: "#EBF5FF", borderColor: "#0B3C5D" },
                      }}
                      aria-label="Scroll left"
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => scrollDraws(batchDrawsScrollRef, "right")}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#FFFFFF",
                        border: "1.5px solid #CBD5E1",
                        color: "#0B3C5D",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        "&:hover": { bgcolor: "#EBF5FF", borderColor: "#0B3C5D" },
                      }}
                      aria-label="Scroll right"
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  ref={batchDrawsScrollRef}
                  sx={{
                    display: "flex",
                    gap: 1.25,
                    overflowX: "auto",
                    pb: 1,
                    scrollBehavior: "smooth",
                    "&::-webkit-scrollbar": { height: 5 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 4 },
                  }}
                >
                  {publishedDraws.slice(0, 10).map((draw, idx) => {
                    const isSelected = selectedDateFilter === draw.draw_date;
                    return (
                      <Box
                        key={draw.draw_date + (draw.lottery_code || idx)}
                        onClick={() => {
                          setSelectedDateFilter(isSelected ? null : draw.draw_date);
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: isSelected ? "#0B3C5D" : "#E0F2FE",
                          color: isSelected ? "#FFFFFF" : "#0F172A",
                          borderRadius: "12px",
                          py: 1,
                          px: 1.5,
                          border: "1.5px solid",
                          borderColor: isSelected ? "#0F2C59" : "#BAE6FD",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 4px 12px rgba(11,60,93,0.3)" : "none",
                          "&:hover": {
                            bgcolor: isSelected ? "#0B3C5D" : "#BAE6FD",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Box sx={{ mr: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              color: isSelected ? "#FFFFFF" : "#0F172A",
                              lineHeight: 1.2,
                              mb: 0.25,
                            }}
                          >
                            {draw.draw_name || draw.lottery_code}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isSelected ? "#93C5FD" : "#475569",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {formatDisplayDate(draw.draw_date)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 1,
                            height: 26,
                            borderLeft: "1px dashed",
                            borderColor: isSelected ? "rgba(255,255,255,0.4)" : "#93C5FD",
                            mr: 1.5,
                          }}
                        />

                        <Box
                          sx={{
                            bgcolor: isSelected ? "#10B981" : "#0B3C5D",
                            color: "#FFFFFF",
                            px: 1,
                            py: 0.4,
                            borderRadius: "6px",
                            fontWeight: 900,
                            fontSize: "0.7rem",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {draw.lottery_code || "DRAW"}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Batch Execution Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                disabled={!batchInput.trim() || isSearching}
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
                  fontSize: "1rem",
                  borderRadius: "14px",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0F2C59" },
                  "&.Mui-disabled": {
                    bgcolor: "#94A3B8",
                    color: "#FFFFFF",
                  },
                }}
              >
                {isSearching ? "Checking Ticket Bundle..." : "Check All Bundle Tickets"}
              </Button>
            </Box>

            {/* --- BATCH RESULTS RENDERING (INSIDE CARD) --- */}
            {isSearching && (
              <Box sx={{ mt: 3, pt: 3, borderTop: "1.5px dashed #E2E8F0", display: "flex", flexDirection: "column", gap: 2 }}>
                <Skeleton variant="text" width={280} height={32} />
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: "14px" }} />
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: "14px" }} />
              </Box>
            )}

            {!isSearching && batchResults !== null && (
              <Box sx={{ mt: 3, pt: 3, borderTop: "1.5px dashed #E2E8F0", display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.15rem" }}>
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
                        borderRadius: "14px",
                        bgcolor: hasMatch ? "#ECFDF5" : "#FFFFFF",
                        border: hasMatch ? "2px solid #10B981" : "1px solid #E2E8F0",
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0F172A" }}>
                          Ticket: <span style={{ color: "#0B3C5D" }}>{item.ticketNumber}</span>
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
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                          {item.matches.map((m, idx) => (
                            <Link
                              key={idx}
                              href={`${getLotteryUrl(m.lottery_code, m.draw_date)}?highlight=${encodeURIComponent(m.ticket_matched)}`}
                              style={{ textDecoration: "none", display: "block" }}
                            >
                              <Alert
                                severity="success"
                                sx={{
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  transition: "all 0.18s",
                                  "&:hover": {
                                    bgcolor: "#D1FAE5",
                                    transform: "translateX(4px)",
                                    boxShadow: "0 2px 8px rgba(16,185,129,0.2)",
                                  },
                                }}
                              >
                                <strong>{m.prize_tier}</strong> — {m.draw_name} ({m.draw_code}) on {m.draw_date}. Matched:{" "}
                                <strong>{m.ticket_matched}</strong>.
                                {m.prize_amount && (
                                  <span>
                                    {" "}
                                    Prize: <strong>{m.prize_amount}</strong>
                                  </span>
                                )}
                                <span style={{ marginLeft: 8, color: "#065F46", fontWeight: 800, fontSize: 13 }}>→ View Details</span>
                              </Alert>
                            </Link>
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <Typography variant="body2" sx={{ color: "#64748B" }}>
                            No prize tier matched for this ticket number in published results.
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                            {targetDrawForJustMiss && (
                              <Link
                                href={`${getLotteryUrl(targetDrawForJustMiss.lottery_code, targetDrawForJustMiss.draw_date)}?highlight=${encodeURIComponent(item.ticketNumber)}`}
                                style={{ textDecoration: "none" }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<DescriptionIcon sx={{ color: "#0B3C5D", fontSize: 16 }} />}
                                  sx={{
                                    bgcolor: "#EBF5FF",
                                    border: "1.5px solid #0B3C5D",
                                    color: "#0B3C5D",
                                    fontWeight: 800,
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    py: 0.6,
                                    px: 1.5,
                                    fontSize: "0.8rem",
                                    boxShadow: "none",
                                    "&:hover": {
                                      bgcolor: "#DBEAFE",
                                      borderColor: "#0F2C59",
                                      boxShadow: "none",
                                    },
                                  }}
                                >
                                  View Result
                                </Button>
                              </Link>
                            )}

                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<TrackChangesIcon sx={{ color: "#FFFFFF", fontSize: 16 }} />}
                              onClick={() => {
                                setSelectedJustMissTicket(item.ticketNumber);
                                setIsJustMissOpen(true);
                              }}
                              sx={{
                                bgcolor: "#0B3C5D",
                                border: "1.5px solid #0B3C5D",
                                color: "#FFFFFF",
                                fontWeight: 800,
                                borderRadius: "8px",
                                textTransform: "none",
                                py: 0.6,
                                px: 1.5,
                                fontSize: "0.8rem",
                                boxShadow: "0 2px 8px rgba(11, 60, 93, 0.2)",
                                "&:hover": {
                                  bgcolor: "#0F2C59",
                                  borderColor: "#0F2C59",
                                  boxShadow: "0 4px 12px rgba(11, 60, 93, 0.3)",
                                },
                              }}
                            >
                              Just Miss
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Just Miss Analysis Modal */}
      <JustMissModal
        open={isJustMissOpen}
        onClose={() => setIsJustMissOpen(false)}
        searchedTicket={selectedJustMissTicket || searchedTicket || currentTicketInput || ""}
        draw={targetDrawForJustMiss}
      />

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
