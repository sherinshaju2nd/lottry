"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionIcon from "@mui/icons-material/Description";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";
import { StructuredDrawResult, getLotteryUrl } from "@/lib/supabase";

export interface NearMissItem {
  id: string;
  prizeTier: string;
  prizeAmount?: string;
  winningTicket: string;
  winningDigits: string;
  searchedDigits: string;
  matchType: "1_digit" | "2_digits" | "shuffled" | "neighbor";
  tagEn: string;
  tagMl: string;
  diffExplanationEn: string;
  diffIndices: number[];
}

interface JustMissModalProps {
  open: boolean;
  onClose: () => void;
  searchedTicket: string;
  draw?: StructuredDrawResult | null;
}

function formatDisplayDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export default function JustMissModal({
  open,
  onClose,
  searchedTicket,
  draw,
}: JustMissModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "1_digit" | "shuffled" | "2_digits">("all");

  const cleanQueryDigits = useMemo(() => {
    return (searchedTicket || "").replace(/\D/g, "");
  }, [searchedTicket]);

  const nearMissList = useMemo(() => {
    if (!draw || cleanQueryDigits.length < 4) return [];

    const items: NearMissItem[] = [];
    const seenWinningTickets = new Set<string>();

    const checkCandidate = (
      winTicketStr: string,
      tier: string,
      amount?: string
    ) => {
      const winDigits = winTicketStr.replace(/\D/g, "");
      if (!winDigits || seenWinningTickets.has(winTicketStr)) return;

      const q = cleanQueryDigits;
      const w = winDigits;

      // Case 1: 6-digit to 6-digit direct comparison
      if (q.length === 6 && w.length === 6) {
        const diffIndices: number[] = [];
        for (let i = 0; i < 6; i++) {
          if (q[i] !== w[i]) diffIndices.push(i);
        }

        const isNeighbor = Math.abs(Number(q) - Number(w)) === 1;
        const isShuffled =
          q.split("").sort().join("") === w.split("").sort().join("") && q !== w;

        if (isNeighbor) {
          seenWinningTickets.add(winTicketStr);
          items.push({
            id: `${tier}-${winTicketStr}-neighbor`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w,
            searchedDigits: q,
            matchType: "neighbor",
            tagEn: "Consecutive Serial (±1)",
            tagMl: "തൊട്ടടുത്ത നമ്പർ (±1)",
            diffExplanationEn: "Serial difference is only 1 number away from this winning ticket!",
            diffIndices,
          });
          return;
        }

        if (diffIndices.length === 1) {
          seenWinningTickets.add(winTicketStr);
          const idx = diffIndices[0];
          items.push({
            id: `${tier}-${winTicketStr}-1diff`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w,
            searchedDigits: q,
            matchType: "1_digit",
            tagEn: "1 Digit Miss (5 of 6 Match)",
            tagMl: "1 അക്ക വ്യത്യാസം (5 അക്കം ശരി)",
            diffExplanationEn: `Position ${idx + 1}: Drawn '${w[idx]}' instead of your '${q[idx]}'. 5 digits matched exactly!`,
            diffIndices,
          });
          return;
        }

        if (isShuffled) {
          seenWinningTickets.add(winTicketStr);
          items.push({
            id: `${tier}-${winTicketStr}-shuffled`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w,
            searchedDigits: q,
            matchType: "shuffled",
            tagEn: "Shuffled Anagram (All Digits)",
            tagMl: "ഷഫിൾഡ് (എല്ലാ അക്കങ്ങളും ഉണ്ട്)",
            diffExplanationEn: "All 6 digits matched! The numbers appeared in a rearranged order.",
            diffIndices: [0, 1, 2, 3, 4, 5],
          });
          return;
        }

        if (diffIndices.length === 2) {
          seenWinningTickets.add(winTicketStr);
          items.push({
            id: `${tier}-${winTicketStr}-2diff`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w,
            searchedDigits: q,
            matchType: "2_digits",
            tagEn: "2 Digits Miss (4 of 6 Match)",
            tagMl: "2 അക്ക വ്യത്യാസം (4 അക്കം ശരി)",
            diffExplanationEn: `Only 2 digits differed at positions ${diffIndices.map((i) => i + 1).join(" & ")}.`,
            diffIndices,
          });
          return;
        }
      }

      // Case 2: 4-digit tier or 4-digit query suffix comparison
      const q4 = q.slice(-4);
      const w4 = w.slice(-4);

      if (q4.length === 4 && w4.length === 4) {
        const diffIndices: number[] = [];
        for (let i = 0; i < 4; i++) {
          if (q4[i] !== w4[i]) diffIndices.push(i);
        }

        const isShuffled4 =
          q4.split("").sort().join("") === w4.split("").sort().join("") && q4 !== w4;

        if (diffIndices.length === 1) {
          seenWinningTickets.add(winTicketStr);
          const idx = diffIndices[0];
          items.push({
            id: `${tier}-${winTicketStr}-1diff4`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w4,
            searchedDigits: q4,
            matchType: "1_digit",
            tagEn: "1 Digit Miss (3 of 4 Match)",
            tagMl: "1 അക്ക വ്യത്യാസം (3 അക്കം ശരി)",
            diffExplanationEn: `Last 4 digits: drawn '${w4[idx]}' instead of '${q4[idx]}'. 3 digits matched!`,
            diffIndices,
          });
          return;
        }

        if (isShuffled4) {
          seenWinningTickets.add(winTicketStr);
          items.push({
            id: `${tier}-${winTicketStr}-shuffled4`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w4,
            searchedDigits: q4,
            matchType: "shuffled",
            tagEn: "Shuffled 4-Digit Match",
            tagMl: "4 അക്കങ്ങൾ ഷഫിൾഡ് മാച്ച്",
            diffExplanationEn: `All 4 digits matched in shuffled order in ${tier}.`,
            diffIndices,
          });
          return;
        }

        if (diffIndices.length === 2 && items.length < 20) {
          seenWinningTickets.add(winTicketStr);
          items.push({
            id: `${tier}-${winTicketStr}-2diff4`,
            prizeTier: tier,
            prizeAmount: amount,
            winningTicket: winTicketStr,
            winningDigits: w4,
            searchedDigits: q4,
            matchType: "2_digits",
            tagEn: "2 Digits Miss (2 of 4 Match)",
            tagMl: "2 അക്ക വ്യത്യാസം",
            diffExplanationEn: `2 digits differed in ${tier} (${winTicketStr}).`,
            diffIndices,
          });
          return;
        }
      }
    };

    // 1. 1st Prize
    if (draw.first?.ticket && draw.first.ticket !== "N/A") {
      checkCandidate(
        draw.first.ticket,
        "1st Prize",
        draw.prizes?.amounts?.["1st"] || "₹1,00,00,000"
      );
    }

    // 2. Consolation
    if (draw.prizes?.consolation && Array.isArray(draw.prizes.consolation)) {
      draw.prizes.consolation.forEach((tNum) =>
        checkCandidate(
          String(tNum),
          "Consolation Prize",
          draw.prizes?.amounts?.consolation || "₹8,000"
        )
      );
    }

    // 3. Other Tiers
    const tierKeys = [
      { key: "2nd", label: "2nd Prize" },
      { key: "3rd", label: "3rd Prize" },
      { key: "4th", label: "4th Prize" },
      { key: "5th", label: "5th Prize" },
      { key: "6th", label: "6th Prize" },
      { key: "7th", label: "7th Prize" },
      { key: "8th", label: "8th Prize" },
      { key: "9th", label: "9th Prize" },
    ] as const;

    tierKeys.forEach(({ key, label }) => {
      const arr = (draw.prizes as any)?.[key];
      const amt = (draw.prizes as any)?.amounts?.[key];
      if (Array.isArray(arr)) {
        arr.forEach((ticketNum) => {
          checkCandidate(String(ticketNum), label, amt);
        });
      }
    });

    const rankMap: Record<string, number> = {
      neighbor: 1,
      "1_digit": 2,
      shuffled: 3,
      "2_digits": 4,
    };

    return items.sort(
      (a, b) => (rankMap[a.matchType] || 5) - (rankMap[b.matchType] || 5)
    );
  }, [draw, cleanQueryDigits]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return nearMissList;
    if (activeTab === "1_digit") {
      return nearMissList.filter(
        (m) => m.matchType === "1_digit" || m.matchType === "neighbor"
      );
    }
    if (activeTab === "shuffled") {
      return nearMissList.filter((m) => m.matchType === "shuffled");
    }
    if (activeTab === "2_digits") {
      return nearMissList.filter((m) => m.matchType === "2_digits");
    }
    return nearMissList;
  }, [nearMissList, activeTab]);

  const counts = useMemo(() => {
    const oneDigit = nearMissList.filter(
      (m) => m.matchType === "1_digit" || m.matchType === "neighbor"
    ).length;
    const shuffled = nearMissList.filter((m) => m.matchType === "shuffled").length;
    const twoDigits = nearMissList.filter((m) => m.matchType === "2_digits").length;
    return {
      all: nearMissList.length,
      oneDigit,
      shuffled,
      twoDigits,
    };
  }, [nearMissList]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            width: { xs: "calc(100% - 16px)", sm: "100%" },
            maxWidth: { xs: "100%", sm: "540px" },
            m: { xs: 1, sm: 2 },
            borderRadius: { xs: "16px", sm: "20px" },
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            bgcolor: "#F8FAFC",
            maxHeight: { xs: "94vh", sm: "88vh" },
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2, sm: 2.5 },
          bgcolor: "#0B3C5D",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrackChangesIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, color: "#FFFFFF", fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
              Just Miss Analysis
            </Typography>
            <Typography variant="caption" sx={{ color: "#93C5FD", fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.8rem" } }}>
              {draw?.draw_name || draw?.lottery_code || "Lottery Draw"} • {formatDisplayDate(draw?.draw_date)}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#FFFFFF",
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Searched Ticket Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "14px",
            bgcolor: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              YOUR SEARCHED TICKET:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0B3C5D", fontFamily: "monospace" }}>
              {searchedTicket || "—"}
            </Typography>
          </Box>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: "#0B3C5D" }} />}
            label={`${nearMissList.length} Near Misses`}
            sx={{
              bgcolor: "#E0F2FE",
              color: "#0369A1",
              fontWeight: 800,
              borderRadius: "8px",
            }}
          />
        </Paper>

        {/* Tab Filters */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            mb: 2,
            "& .MuiTab-root": {
              minHeight: 38,
              py: 0.75,
              px: 1.5,
              fontWeight: 800,
              fontSize: "0.8rem",
              borderRadius: "10px",
              textTransform: "none",
              mr: 1,
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              "&.Mui-selected": {
                bgcolor: "#0B3C5D",
                color: "#FFFFFF",
                borderColor: "#0B3C5D",
              },
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab value="all" label={`All (${counts.all})`} />
          <Tab
            value="1_digit"
            icon={<TrackChangesIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label={`1 Digit (${counts.oneDigit})`}
          />
          <Tab
            value="shuffled"
            icon={<ShuffleIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label={`Shuffled (${counts.shuffled})`}
          />
          <Tab value="2_digits" label={`2 Digits (${counts.twoDigits})`} />
        </Tabs>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px dashed #CBD5E1",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#475569" }}>
              No near-miss matches in this category
            </Typography>
            <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
              Try viewing &quot;All&quot; to see matches across other difference patterns.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredItems.map((item) => {
              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: "1.5px solid",
                    borderColor:
                      item.matchType === "neighbor"
                        ? "#F59E0B"
                        : item.matchType === "1_digit"
                        ? "#3B82F6"
                        : "#E2E8F0",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Chip
                      icon={<EmojiEventsIcon sx={{ fontSize: 14, color: "#D97706" }} />}
                      label={item.prizeTier}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        bgcolor: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: "6px",
                      }}
                    />
                    <Chip
                      label={item.tagEn}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor:
                          item.matchType === "neighbor"
                            ? "#FEF3C7"
                            : item.matchType === "1_digit"
                            ? "#EFF6FF"
                            : "#F1F5F9",
                        color:
                          item.matchType === "neighbor"
                            ? "#B45309"
                            : item.matchType === "1_digit"
                            ? "#1D4ED8"
                            : "#475569",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  {/* Number Comparison Row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      my: 1,
                      p: 1.25,
                      bgcolor: "#F8FAFC",
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        Winning Number:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 900,
                          color: "#166534",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {item.winningTicket}
                      </Typography>
                    </Box>

                    {item.prizeAmount && (
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                          Prize:
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#166534" }}>
                          {item.prizeAmount}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Difference Explanation */}
                  <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.825rem", fontWeight: 600 }}>
                    💡 {item.diffExplanationEn}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Action Button: View Full Draw Details */}
        {draw && (
          <Box sx={{ mt: 2.5 }}>
            <Link
              href={getLotteryUrl(draw.lottery_code, draw.draw_date)}
              style={{ textDecoration: "none" }}
              onClick={onClose}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<DescriptionIcon />}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0B3C5D",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  py: 1.25,
                  borderRadius: "12px",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0F2C59" },
                }}
              >
                View Full Draw Breakdown Chart ({draw.draw_name || draw.lottery_code})
              </Button>
            </Link>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
