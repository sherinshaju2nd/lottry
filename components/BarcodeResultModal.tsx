"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from "@mui/icons-material/Refresh";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import confetti from "canvas-confetti";
import JustMissModal from "./JustMissModal";
import {
  StructuredDrawResult,
  getLotteryUrl,
} from "@/lib/supabase";

export interface SearchMatch {
  lottery_code: string;
  draw_name: string;
  draw_code: string;
  draw_date: string;
  prize_tier: string;
  prize_amount: string;
  ticket_matched: string;
}

interface BarcodeResultModalProps {
  open: boolean;
  scannedBarcode: string | null;
  targetLotteryCode?: string | null;
  onClose: () => void;
  onRescan: () => void;
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export default function BarcodeResultModal({
  open,
  scannedBarcode,
  targetLotteryCode,
  onClose,
  onRescan,
}: BarcodeResultModalProps) {
  const router = useRouter();

  const [availableDraws, setAvailableDraws] = useState<StructuredDrawResult[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [allMatches, setAllMatches] = useState<SearchMatch[] | null>(null);
  const [matchedDrawDetails, setMatchedDrawDetails] = useState<StructuredDrawResult | null>(null);
  const [step, setStep] = useState<"select_date" | "result">("select_date");
  const [isJustMissOpen, setIsJustMissOpen] = useState(false);

  // Fetch recent draws when opened
  useEffect(() => {
    if (open) {
      fetch("/api/draws?type=all")
        .then((res) => res.json())
        .then((data) => {
          if (data.results && Array.isArray(data.results)) {
            setAvailableDraws(data.results);
            if (!selectedDate && data.results.length > 0) {
              setSelectedDate(data.results[0].draw_date);
            }
          }
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open && scannedBarcode) {
      setStep("select_date");
      setAllMatches(null);
      setMatchedDrawDetails(null);
      setIsJustMissOpen(false);
    }
  }, [open, scannedBarcode, targetLotteryCode]);

  const relevantDraws = targetLotteryCode
    ? availableDraws.filter(
        (d) => d.lottery_code?.toUpperCase() === targetLotteryCode.toUpperCase()
      )
    : availableDraws;

  const handleVerifyTicket = async (targetDate: string) => {
    if (!scannedBarcode) return;
    setIsSearching(true);
    setSelectedDate(targetDate);
    setStep("result");

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(scannedBarcode)}`);
      const data = await res.json();
      let results: SearchMatch[] = data.results || [];

      if (targetLotteryCode) {
        results = results.filter(
          (m) => m.lottery_code.toUpperCase() === targetLotteryCode.toUpperCase()
        );
      }
      if (targetDate && targetDate !== "ALL") {
        results = results.filter((m) => m.draw_date === targetDate);
      }

      setAllMatches(results);

      // Find full draw details
      const foundDraw =
        relevantDraws.find((d) => d.draw_date === targetDate) ||
        availableDraws.find((d) => d.draw_date === targetDate) ||
        null;
      setMatchedDrawDetails(foundDraw);

      if (results.length > 0) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#0B3C5D", "#FFC107", "#E67E22", "#3B82F6", "#EC4899"],
        });
      }
    } catch {
      setAllMatches([]);
      setMatchedDrawDetails(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewFullResult = () => {
    const targetDraw =
      matchedDrawDetails ||
      relevantDraws.find((d) => d.draw_date === selectedDate) ||
      relevantDraws[0] ||
      availableDraws[0];

    if (targetDraw && targetDraw.lottery_code && targetDraw.draw_date) {
      onClose();
      router.push(
        `${getLotteryUrl(targetDraw.lottery_code, targetDraw.draw_date)}?highlight=${encodeURIComponent(
          scannedBarcode || ""
        )}`
      );
    }
  };

  const isWinner = allMatches !== null && allMatches.length > 0;
  const digitsOnly = (scannedBarcode || "").replace(/\D/g, "");
  const is4DigitQuery = digitsOnly.length >= 4 && digitsOnly.length < 6;
  const selectedDrawForDate = relevantDraws.find((d) => d.draw_date === selectedDate);

  return (
    <>
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
              bgcolor: "#FFFFFF",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
            },
          },
        }}
      >
        {/* Top Bar Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 2.5 },
            py: 1.8,
            borderBottom: "1px solid #F1F5F9",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#F0F9FF",
              border: "1px solid #BAE6FD",
              px: 1.5,
              py: 0.6,
              borderRadius: "20px",
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 18, color: "#0B3C5D" }} />
            <Typography sx={{ color: "#0B3C5D", fontWeight: 800, fontSize: "0.875rem", letterSpacing: 0.5 }}>
              {scannedBarcode}
            </Typography>
            {targetLotteryCode && (
              <Typography sx={{ color: "#0284C7", fontWeight: 700, fontSize: "0.75rem" }}>
                [{targetLotteryCode}]
              </Typography>
            )}
          </Box>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" sx={{ color: "#64748B" }} />
          </IconButton>
        </Box>

        {/* Scrollable Body */}
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, overflowY: "auto" }}>
          {step === "select_date" ? (
            /* STEP 1: Date Picker & Quick Draw Cards */
            <Box>
              {/* Header Info */}
              <Box sx={{ textAlign: "center", mb: 2.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "rgba(11, 60, 93, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.2,
                  }}
                >
                  <CalendarMonthIcon sx={{ color: "#0B3C5D", fontSize: 26 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5 }}>
                  Select Draw Date
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", maxWidth: 360, mx: "auto" }}>
                  Select the draw date for ticket "{scannedBarcode}" to fetch accurate winning results.
                </Typography>
              </Box>

              {/* 1. Custom Date Picker Row */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", letterSpacing: 0.8, mb: 1 }}>
                  PICK DRAW DATE
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    type="date"
                    size="small"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    sx={{
                      flex: 1,
                      bgcolor: "#F8FAFC",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-root": { borderRadius: "10px", fontWeight: 700 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (selectedDate) {
                        handleVerifyTicket(selectedDate);
                      }
                    }}
                    sx={{
                      bgcolor: "#0B3C5D",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      borderRadius: "10px",
                      px: 2.5,
                      py: 1,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#0F2C59" },
                    }}
                  >
                    Fetch Result
                  </Button>
                </Box>
              </Box>

              {/* 2. OR Divider */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 2 }}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "#E2E8F0" }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8" }}>
                  OR
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "#E2E8F0" }} />
              </Box>

              {/* 3. Quick Draw Horizontal Selection Cards */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", letterSpacing: 0.8 }}>
                    SELECT DRAW TO CHECK
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#3B82F6", fontWeight: 700 }}>
                    Tap to check instantly
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    pb: 1.5,
                    pt: 0.5,
                    "&::-webkit-scrollbar": { height: 4 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 4 },
                  }}
                >
                  {relevantDraws.slice(0, 10).map((draw, idx) => {
                    const isLatest = idx === 0;
                    const isSelected = selectedDate === draw.draw_date;
                    return (
                      <Box
                        key={`${draw.draw_date}-${draw.lottery_code || idx}`}
                        onClick={() => {
                          setSelectedDate(draw.draw_date);
                          handleVerifyTicket(draw.draw_date);
                        }}
                        sx={{
                          minWidth: 150,
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: isSelected ? "#F0FDF4" : "#FFFFFF",
                          border: isSelected ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          flexShrink: 0,
                          "&:hover": {
                            borderColor: "#3B82F6",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(11, 60, 93, 0.1)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              color: isSelected ? "#16A34A" : "#0F172A",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 90,
                            }}
                          >
                            {draw.draw_name || draw.lottery_code}
                          </Typography>
                          {isLatest && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.3,
                                bgcolor: "#DCFCE7",
                                px: 0.6,
                                py: 0.2,
                                borderRadius: "4px",
                              }}
                            >
                              <SparklesIcon sx={{ fontSize: 10, color: "#16A34A" }} />
                              <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "#16A34A" }}>
                                LATEST
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>
                            {formatDisplayDate(draw.draw_date)}
                          </Typography>
                          <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#3B82F6", bgcolor: "#EFF6FF", px: 0.6, py: 0.2, borderRadius: "4px" }}>
                            {draw.lottery_code || "KL"}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          ) : isSearching ? (
            /* LOADING STATE */
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress size={40} sx={{ color: "#0B3C5D", mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A" }}>
                Verifying Ticket Results...
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                Ticket: {scannedBarcode} • Draw: {formatDisplayDate(selectedDate)}
              </Typography>
            </Box>
          ) : isWinner ? (
            /* WINNING RESULT VIEW */
            <Box>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                  color: "#FFFFFF",
                  textAlign: "center",
                  mb: 2.5,
                  boxShadow: "0 6px 20px rgba(22, 163, 74, 0.25)",
                }}
              >
                <Typography sx={{ fontSize: "1.8rem", mb: 0.5 }}>🎉 🏆 ✨</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                  WINNING TICKET MATCH!
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  Congratulations! Your ticket matched a winning prize tier.
                </Typography>
              </Box>

              {allMatches?.map((match, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    border: "1.5px solid #FCD34D",
                    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.12)",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <EmojiEventsIcon sx={{ color: "#D97706", fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0F172A" }}>
                      {match.prize_tier}
                    </Typography>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#16A34A", mb: 1.5 }}>
                    {match.prize_amount || "Winning Prize"}
                  </Typography>

                  <Box sx={{ height: "1px", bgcolor: "#E2E8F0", my: 1.5 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>Matched Number:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#0B3C5D", fontFamily: "monospace" }}>
                        {match.ticket_matched}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>Draw Name:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                        {match.draw_name} ({match.draw_code})
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>Draw Date:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                        {formatDisplayDate(match.draw_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1.5, mt: 2.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleViewFullResult}
                  startIcon={<DescriptionIcon />}
                  sx={{
                    bgcolor: "#0B3C5D",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    borderRadius: "12px",
                    py: 1.2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0F2C59" },
                  }}
                >
                  View Full Result
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setStep("select_date")}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderColor: "#0B3C5D",
                    color: "#0B3C5D",
                    fontWeight: 800,
                    borderRadius: "12px",
                    px: 2.5,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Change Date
                </Button>
              </Box>
            </Box>
          ) : (
            /* NO PRIZE MATCH VIEW */
            <Box>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  textAlign: "center",
                  mb: 2.5,
                }}
              >
                <HighlightOffIcon sx={{ fontSize: 52, color: "#64748B", mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A", mb: 1 }}>
                  No Prize Found for this Draw
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {is4DigitQuery
                    ? `4-digit query "${scannedBarcode}" did not match 4th to 9th Prize tiers. Note: 1st, 2nd, 3rd, and Consolation prizes strictly require entering your full 6-digit ticket number with series.`
                    : `Ticket "${scannedBarcode}" did not match any winning prize in ${matchedDrawDetails?.draw_name || "the draw"} (${formatDisplayDate(selectedDate)}).`}
                </Typography>
              </Box>

              {/* Draw Context Snapshot */}
              {matchedDrawDetails && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                      {matchedDrawDetails.draw_name} ({matchedDrawDetails.draw_code})
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                      {formatDisplayDate(matchedDrawDetails.draw_date)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: "#D97706", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      1st Prize:{" "}
                      <Box component="span" sx={{ fontWeight: 800, color: "#0B3C5D", fontFamily: "monospace" }}>
                        {matchedDrawDetails.first?.ticket || "N/A"}
                      </Box>
                      {matchedDrawDetails.first?.location ? ` (${matchedDrawDetails.first.location})` : ""}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Buttons Row */}
              <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleViewFullResult}
                  startIcon={<DescriptionIcon />}
                  sx={{
                    borderColor: "#0B3C5D",
                    color: "#0B3C5D",
                    fontWeight: 800,
                    borderRadius: "12px",
                    py: 1.2,
                    textTransform: "none",
                  }}
                >
                  View Result
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setIsJustMissOpen(true)}
                  startIcon={<TrackChangesIcon />}
                  sx={{
                    bgcolor: "#E11D48",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    borderRadius: "12px",
                    py: 1.2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#BE123C" },
                  }}
                >
                  Just Miss
                </Button>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={() => setStep("select_date")}
                startIcon={<RefreshIcon />}
                sx={{
                  color: "#0B3C5D",
                  fontWeight: 800,
                  textTransform: "none",
                }}
              >
                Change Draw Date
              </Button>
            </Box>
          )}
        </DialogContent>

        {/* Bottom Action Footer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderTop: "1px solid #F1F5F9",
            bgcolor: "#F8FAFC",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={onRescan}
            startIcon={<CameraAltIcon />}
            sx={{
              borderColor: "#CBD5E1",
              color: "#0B3C5D",
              fontWeight: 800,
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
            }}
          >
            Rescan
          </Button>

          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: "#0F172A",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "10px",
              px: 3,
              textTransform: "none",
              "&:hover": { bgcolor: "#1E293B" },
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Just Miss Analysis Modal */}
      {isJustMissOpen && (
        <JustMissModal
          open={isJustMissOpen}
          onClose={() => setIsJustMissOpen(false)}
          searchedTicket={scannedBarcode || ""}
          draw={matchedDrawDetails || relevantDraws[0] || availableDraws[0]}
          onViewResult={handleViewFullResult}
        />
      )}
    </>
  );
}
