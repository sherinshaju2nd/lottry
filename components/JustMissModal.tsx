"use client";

import React, { useState, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DescriptionIcon from "@mui/icons-material/Description";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { StructuredDrawResult } from "@/lib/supabase";

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
  diffExplanationMl: string;
  diffIndices: number[];
}

interface JustMissModalProps {
  open: boolean;
  onClose: () => void;
  searchedTicket: string;
  draw: StructuredDrawResult | null;
  onViewResult?: () => void;
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
  onViewResult,
}: JustMissModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "1_digit" | "shuffled" | "2_digits">("all");

  const cleanQueryDigits = useMemo(() => {
    return searchedTicket.replace(/\D/g, "");
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
        const isShuffled = q.split("").sort().join("") === w.split("").sort().join("") && q !== w;

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
            diffExplanationEn: `Serial difference is only 1 number away from this winning ticket!`,
            diffExplanationMl: `വിജയിച്ച ടിക്കറ്റിൽ നിന്നും വെറും 1 നമ്പറിന്റെ മാത്രം വ്യത്യാസം!`,
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
            diffExplanationMl: `സ്ഥാനം ${idx + 1}: നിങ്ങളുടെ '${q[idx]}' ന് പകരം '${w[idx]}' വന്നു. 5 അക്കങ്ങൾ കൃത്യമായി ഒത്തുപോയി!`,
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
            diffExplanationEn: `All 6 digits matched! The numbers appeared in a rearranged order.`,
            diffExplanationMl: `എല്ലാ 6 അക്കങ്ങളും ലോട്ടറിയിൽ ഉണ്ടായിരുന്നു! ക്രമം മാറിയാണ് വന്നത്.`,
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
            diffExplanationMl: `${diffIndices.map((i) => i + 1).join(", ")} സ്ഥാനങ്ങളിലെ 2 അക്കങ്ങൾ മാത്രമാണ് വ്യത്യാസപ്പെട്ടത്.`,
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

        const isShuffled4 = q4.split("").sort().join("") === w4.split("").sort().join("") && q4 !== w4;

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
            diffExplanationMl: `അവസാന 4 അക്കങ്ങളിൽ 3 എണ്ണം ശരിയായി വന്നു. 1 അക്കം മാത്രം മാറി.`,
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
            diffExplanationMl: `${tier} സമ്മാനത്തിലെ 4 അക്കങ്ങളും മാറിമറിഞ്ഞ് ഒത്തുപോയി.`,
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
            diffExplanationMl: `${tier} ലെ നമ്പറുമായി 2 അക്ക വ്യത്യാസം.`,
            diffIndices,
          });
          return;
        }
      }
    };

    // 1. 1st Prize
    if (draw.first?.ticket && draw.first.ticket !== "N/A" && draw.first.ticket !== "PENDING") {
      checkCandidate(
        draw.first.ticket,
        "1st Prize",
        draw.prizes?.amounts?.["1st"] || "₹80 Lakhs"
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
    const tierKeys = ["2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"] as const;
    tierKeys.forEach((key) => {
      const arr = (draw.prizes as any)?.[key];
      const amt = draw.prizes?.amounts?.[key];
      if (Array.isArray(arr)) {
        arr.forEach((ticketNum) => {
          checkCandidate(String(ticketNum), `${key.toUpperCase()} Prize`, amt);
        });
      }
    });

    // Priority Sort: neighbor -> 1_digit -> shuffled -> 2_digits
    const rankMap: Record<string, number> = {
      neighbor: 1,
      "1_digit": 2,
      shuffled: 3,
      "2_digits": 4,
    };

    return items.sort((a, b) => (rankMap[a.matchType] || 5) - (rankMap[b.matchType] || 5));
  }, [draw, cleanQueryDigits]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return nearMissList;
    if (activeTab === "1_digit") {
      return nearMissList.filter((m) => m.matchType === "1_digit" || m.matchType === "neighbor");
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
            borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
            m: { xs: 0, sm: 2 },
            position: { xs: "fixed", sm: "relative" },
            bottom: { xs: 0, sm: "auto" },
            maxHeight: { xs: "92vh", sm: "88vh" },
            bgcolor: "#F8FAFC",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          },
        },
      }}
    >
      {/* Header Matching Mobile App */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.8,
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              bgcolor: "#0B3C5D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrackChangesIcon sx={{ color: "#FFFFFF", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#0F172A", lineHeight: 1.2 }}>
              🎯 Just Miss Analysis (ജസ്റ്റ് മിസ്സ് നമ്പറുകൾ)
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", mt: 0.2 }}>
              {draw?.draw_name || draw?.lottery_code} • {formatDisplayDate(draw?.draw_date)}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            bgcolor: "#F1F5F9",
            "&:hover": { bgcolor: "#E2E8F0" },
          }}
        >
          <CloseIcon fontSize="small" sx={{ color: "#1E293B" }} />
        </IconButton>
      </Box>

      {/* Ticket Summary Banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#FFFFFF",
          mx: 2,
          mt: 1.8,
          p: 1.8,
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748B", letterSpacing: 0.5 }}>
            YOUR SEARCHED TICKET:
          </Typography>
          <Typography sx={{ fontSize: "1.15rem", fontWeight: 900, color: "#0B3C5D", letterSpacing: 1, mt: 0.2 }}>
            {searchedTicket}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            bgcolor: "#F0F9FF",
            border: "1px solid #BAE6FD",
            px: 1.2,
            py: 0.6,
            borderRadius: "10px",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: "#0B3C5D" }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0B3C5D" }}>
            {nearMissList.length} Near Misses
          </Typography>
        </Box>
      </Box>

      {/* Segmented Filter Tabs Matching Mobile */}
      <Box sx={{ display: "flex", px: 2, mt: 1.5, gap: 0.8 }}>
        <Box
          onClick={() => setActiveTab("all")}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 1,
            borderRadius: "10px",
            bgcolor: activeTab === "all" ? "#0B3C5D" : "#FFFFFF",
            border: activeTab === "all" ? "1px solid #0B3C5D" : "1px solid #E2E8F0",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: activeTab === "all" ? "#FFFFFF" : "#475569" }}>
            All ({counts.all})
          </Typography>
        </Box>

        <Box
          onClick={() => setActiveTab("1_digit")}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.4,
            py: 1,
            borderRadius: "10px",
            bgcolor: activeTab === "1_digit" ? "#0B3C5D" : "#FFFFFF",
            border: activeTab === "1_digit" ? "1px solid #0B3C5D" : "1px solid #E2E8F0",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <TrackChangesIcon sx={{ fontSize: 13, color: activeTab === "1_digit" ? "#FFFFFF" : "#0B3C5D" }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: activeTab === "1_digit" ? "#FFFFFF" : "#475569" }}>
            1 Digit ({counts.oneDigit})
          </Typography>
        </Box>

        <Box
          onClick={() => setActiveTab("shuffled")}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.4,
            py: 1,
            borderRadius: "10px",
            bgcolor: activeTab === "shuffled" ? "#0B3C5D" : "#FFFFFF",
            border: activeTab === "shuffled" ? "1px solid #0B3C5D" : "1px solid #E2E8F0",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <ShuffleIcon sx={{ fontSize: 13, color: activeTab === "shuffled" ? "#FFFFFF" : "#D97706" }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: activeTab === "shuffled" ? "#FFFFFF" : "#475569" }}>
            Shuffled ({counts.shuffled})
          </Typography>
        </Box>

        <Box
          onClick={() => setActiveTab("2_digits")}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 1,
            borderRadius: "10px",
            bgcolor: activeTab === "2_digits" ? "#0B3C5D" : "#FFFFFF",
            border: activeTab === "2_digits" ? "1px solid #0B3C5D" : "1px solid #E2E8F0",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: activeTab === "2_digits" ? "#FFFFFF" : "#475569" }}>
            2 Digits ({counts.twoDigits})
          </Typography>
        </Box>
      </Box>

      {/* Scrollable Results List */}
      <DialogContent sx={{ p: 2, overflowY: "auto" }}>
        {filteredItems.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredItems.map((item) => {
              const isOneDigit = item.matchType === "1_digit" || item.matchType === "neighbor";
              const isShuffled = item.matchType === "shuffled";

              return (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.8,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: isOneDigit
                      ? "1.5px solid #86EFAC"
                      : isShuffled
                      ? "1.5px solid #FDE68A"
                      : "1px solid #E2E8F0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Top Row: Prize Tier & Badge */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        bgcolor: "#FEF3C7",
                        border: "1px solid #FDE68A",
                        px: 1,
                        py: 0.3,
                        borderRadius: "6px",
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 14, color: "#B45309" }} />
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#92400E" }}>
                        {item.prizeTier}
                        {item.prizeAmount ? ` • ${item.prizeAmount}` : ""}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        bgcolor: isOneDigit ? "#DCFCE7" : isShuffled ? "#FEF3C7" : "#F1F5F9",
                        border: isOneDigit
                          ? "1px solid #86EFAC"
                          : isShuffled
                          ? "1px solid #FDE68A"
                          : "1px solid #CBD5E1",
                        px: 1,
                        py: 0.3,
                        borderRadius: "6px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: isOneDigit ? "#166534" : isShuffled ? "#92400E" : "#475569",
                        }}
                      >
                        {item.tagEn}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Character-by-Character Digit Box Visualizer */}
                  <Box
                    sx={{
                      bgcolor: "#F8FAFC",
                      p: 1.5,
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                      mb: 1.2,
                    }}
                  >
                    {/* Row 1: Drawn Win */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", minWidth: 70 }}>
                        Drawn Win:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {item.winningDigits.split("").map((digit, dIdx) => {
                          const isDiff = item.diffIndices.includes(dIdx);
                          return (
                            <Box
                              key={dIdx}
                              sx={{
                                width: 26,
                                height: 28,
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: isDiff ? "#FEE2E2" : "#DCFCE7",
                                border: isDiff ? "1px solid #FCA5A5" : "1px solid #86EFAC",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: 900,
                                  fontSize: "0.85rem",
                                  color: isDiff ? "#DC2626" : "#166534",
                                }}
                              >
                                {digit}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#0B3C5D", fontFamily: "monospace" }}>
                        {item.winningTicket}
                      </Typography>
                    </Box>

                    {/* Row 2: Your Ticket */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.8 }}>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", minWidth: 70 }}>
                        Your Ticket:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {item.searchedDigits.split("").map((digit, dIdx) => {
                          const isDiff = item.diffIndices.includes(dIdx);
                          return (
                            <Box
                              key={dIdx}
                              sx={{
                                width: 26,
                                height: 28,
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: isDiff ? "#FEE2E2" : "#DCFCE7",
                                border: isDiff ? "1px solid #FCA5A5" : "1px solid #86EFAC",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: 900,
                                  fontSize: "0.85rem",
                                  color: isDiff ? "#DC2626" : "#166534",
                                }}
                              >
                                {digit}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748B", fontFamily: "monospace" }}>
                        {cleanQueryDigits}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Explanation Description */}
                  <Typography sx={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600, lineHeight: 1.4 }}>
                    💡 {item.diffExplanationEn}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <InfoOutlinedIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#334155", mb: 0.5 }}>
              No Near Misses in this category
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", maxWidth: 360, mx: "auto" }}>
              Check the full published draw results breakdown below.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Bottom Sticky Action Bar */}
      {onViewResult && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onClose();
              onViewResult();
            }}
            startIcon={<DescriptionIcon />}
            endIcon={<ChevronRightIcon />}
            sx={{
              bgcolor: "#0B3C5D",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.9rem",
              borderRadius: "12px",
              py: 1.3,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
              "&:hover": { bgcolor: "#0F2C59" },
            }}
          >
            View Full Draw Breakdown
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
