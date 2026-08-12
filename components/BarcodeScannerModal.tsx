"use client";

import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
}

interface WinningResult {
  drawDate: string;
  drawName: string;
  drawCode: string;
  prizeTier: string;
  prizeAmount: string;
  ticketMatched: string;
}

export default function BarcodeScannerModal({ open, onClose }: BarcodeScannerModalProps) {
  const [scannedCode, setScannedCode] = useState<string>("");
  const [manualTicketInput, setManualTicketInput] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkingResult, setCheckingResult] = useState<{
    checked: boolean;
    isWinner: boolean;
    matches: WinningResult[];
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "web-barcode-scanner-region";

  // Fetch unique available draw dates from Supabase
  useEffect(() => {
    async function loadDates() {
      try {
        const { data, error } = await supabase
          .from("draw_results")
          .select("draw_date")
          .order("draw_date", { ascending: false });

        if (!error && data && data.length > 0) {
          const uniqueDates = Array.from(new Set(data.map((d: any) => d.draw_date)));
          setAvailableDates(uniqueDates);
          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching draw dates:", err);
      }
    }
    if (open) {
      loadDates();
    }
  }, [open]);

  // Start html5-qrcode scanner when modal opens
  useEffect(() => {
    let isMounted = true;

    if (open) {
      setCheckingResult(null);
      setScannedCode("");
      setManualTicketInput("");
      setScannerError(null);
      setIsScanning(true);

      const timer = setTimeout(async () => {
        if (!isMounted) return;
        try {
          const html5QrCode = new Html5Qrcode(scannerRegionId, {
            formatsToSupport: [
              0, // CODE_128
              1, // CODE_39
              2, // CODE_93
              4, // EAN_13
              5, // EAN_8
              7, // ITF
              11, // UPC_A
              12, // UPC_E
              14, // QR_CODE
            ],
            verbose: false,
          });
          html5QrCodeRef.current = html5QrCode;

          const config = {
            fps: 20,
            qrbox: { width: 280, height: 110 },
            aspectRatio: 1.777778,
          };

          const onScanSuccess = (decodedText: string) => {
            if (isMounted) {
              setScannedCode(decodedText);
              setManualTicketInput(decodedText);
              stopScanner();
              checkWinningTicketInSupabase(decodedText, selectedDate);
            }
          };

          // Try back camera first
          try {
            await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
          } catch (e1) {
            // Fallback to getting list of available cameras
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const cameraId = cameras[cameras.length - 1].id;
              await html5QrCode.start(cameraId, config, onScanSuccess, () => {});
            } else {
              throw e1;
            }
          }
        } catch (err: any) {
          console.warn("Camera start error:", err);
          if (isMounted) {
            setScannerError(
              "Camera access issue or scanner restricted. Please ensure camera permissions are allowed, or type/paste your ticket below."
            );
            setIsScanning(false);
          }
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [open]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Check ticket number against Supabase
  const checkWinningTicketInSupabase = async (ticket: string, targetDate?: string) => {
    const rawQuery = ticket.trim().toUpperCase();
    if (!rawQuery) return;

    setIsChecking(true);
    setCheckingResult(null);

    const digitsOnly = rawQuery.replace(/\D/g, "");
    const normalizedQuery = rawQuery.replace(/\s+/g, "");
    const querySeries = rawQuery.replace(/\d/g, "").trim();

    try {
      let query = supabase.from("draw_results").select("*");
      if (targetDate) {
        query = query.eq("draw_date", targetDate);
      } else {
        query = query.order("draw_date", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const matches: WinningResult[] = [];

      if (data && data.length > 0) {
        for (const row of data) {
          let firstObj: any = {};
          let prizesObj: any = {};
          try {
            firstObj = typeof row.first_prize === "string" ? JSON.parse(row.first_prize) : row.first_prize || {};
          } catch {
            firstObj = {};
          }
          try {
            prizesObj = typeof row.prizes === "string" ? JSON.parse(row.prizes) : row.prizes || {};
          } catch {
            prizesObj = {};
          }

          // Check 1st Prize
          const firstTicketRaw = (firstObj.ticket || "").trim().toUpperCase();
          const firstTicketNormalized = firstTicketRaw.replace(/\s+/g, "");
          const firstTicketDigits = firstTicketRaw.replace(/\D/g, "");
          const firstSeries = firstTicketRaw.replace(/\d/g, "").trim();
          const matchesFirstSeries = !querySeries || querySeries === firstSeries;

          if (
            firstTicketNormalized &&
            matchesFirstSeries &&
            (firstTicketNormalized === normalizedQuery ||
              (digitsOnly.length === 6 && firstTicketDigits === digitsOnly) ||
              (digitsOnly.length >= 2 && digitsOnly.length < 6 && firstTicketDigits.endsWith(digitsOnly)))
          ) {
            matches.push({
              drawDate: row.draw_date,
              drawName: row.draw_name,
              drawCode: row.draw_code,
              prizeTier: "1st Prize Winner",
              prizeAmount: prizesObj.amounts?.["1st"] || "₹70 Lakhs",
              ticketMatched: firstObj.ticket || rawQuery,
            });
          }

          // Check lower prize tiers
          const tiers = ["consolation", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"] as const;

          for (const tier of tiers) {
            const nums = prizesObj[tier] as string[] | undefined;
            const amount = prizesObj.amounts?.[tier] || "";

            if (nums && Array.isArray(nums)) {
              for (const num of nums) {
                const normNum = num.trim().toUpperCase().replace(/\s+/g, "");
                const numDigits = normNum.replace(/\D/g, "");
                const numSeries = normNum.replace(/\d/g, "").trim();
                const matchesItemSeries = !querySeries || !numSeries || querySeries === numSeries;

                if (
                  matchesItemSeries &&
                  (normNum === normalizedQuery ||
                    (digitsOnly.length === 6 && numDigits === digitsOnly) ||
                    (digitsOnly.length >= 2 && digitsOnly.length < 6 && numDigits.endsWith(digitsOnly)))
                ) {
                  matches.push({
                    drawDate: row.draw_date,
                    drawName: row.draw_name,
                    drawCode: row.draw_code,
                    prizeTier: tier === "consolation" ? "Consolation Prize" : `${tier} Prize`,
                    prizeAmount: amount,
                    ticketMatched: num,
                  });
                }
              }
            }
          }
        }
      }

      setCheckingResult({
        checked: true,
        isWinner: matches.length > 0,
        matches,
      });
    } catch (err: any) {
      console.error("Ticket check error:", err);
      setCheckingResult({
        checked: true,
        isWinner: false,
        matches: [],
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleManualCheck = () => {
    if (manualTicketInput.trim()) {
      checkWinningTicketInSupabase(manualTicketInput.trim(), selectedDate);
    }
  };

  const handleDateSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (manualTicketInput.trim() || scannedCode) {
      checkWinningTicketInSupabase(manualTicketInput.trim() || scannedCode, newDate);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CameraAltIcon sx={{ color: "#0F5A24" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
            Scan Ticket Barcode / QR
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Draw Date Selector */}
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter Draw Date (Optional)"
            value={selectedDate}
            onChange={handleDateSelectChange}
            slotProps={{
              input: {
                startAdornment: <CalendarMonthIcon sx={{ color: "#0F5A24", mr: 1, fontSize: 20 }} />,
              },
            }}
          >
            <MenuItem value="">Check All Draw Dates</MenuItem>
            {availableDates.map((d) => (
              <MenuItem key={d} value={d}>
                {d} Draw
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Live Camera Viewfinder Box */}
        <Box
          sx={{
            width: "100%",
            height: 220,
            bgcolor: "#000000",
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <div id={scannerRegionId} style={{ width: "100%", height: "100%" }} />

          {/* Red horizontal barcode laser line hint overlay */}
          {!scannerError && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "10%",
                right: "10%",
                height: "2px",
                bgcolor: "#EF4444",
                boxShadow: "0 0 8px #EF4444",
                zIndex: 3,
                pointerEvents: "none",
              }}
            />
          )}

          {scannerError && (
            <Typography variant="caption" sx={{ color: "#EF4444", p: 2, textAlign: "center", zIndex: 4 }}>
              {scannerError}
            </Typography>
          )}
        </Box>

        <Alert severity="info" sx={{ py: 0.5, px: 1.5, mb: 2, borderRadius: "8px", fontSize: "0.75rem" }}>
          💡 <strong>Barcode Scanning Hint:</strong> Align the long horizontal 1D barcode on your ticket across the red line.
        </Alert>

        {/* Ticket Input & Manual Check */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Scanned Ticket or e.g. BP 704781"
            value={manualTicketInput}
            onChange={(e) => setManualTicketInput(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={isChecking || !manualTicketInput.trim()}
            onClick={handleManualCheck}
            sx={{ bgcolor: "#0F5A24", color: "#FFFFFF", fontWeight: 800, minWidth: 90 }}
          >
            {isChecking ? <CircularProgress size={20} color="inherit" /> : "Check"}
          </Button>
        </Box>

        {/* Checking Results Alert */}
        {isChecking && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, py: 2 }}>
            <CircularProgress size={24} sx={{ color: "#0F5A24" }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#374151" }}>
              Checking ticket in Supabase database...
            </Typography>
          </Box>
        )}

        {checkingResult && !isChecking && (
          <Box sx={{ mt: 1 }}>
            {checkingResult.isWinner ? (
              <Alert severity="success" icon={<EmojiEventsIcon />} sx={{ borderRadius: "12px" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  🎉 WINNING TICKET MATCH FOUND!
                </Typography>
                {checkingResult.matches.map((m, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 1.5, mt: 1, bgcolor: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0" }}>
                    <Chip label={m.prizeTier} color="success" size="small" sx={{ fontWeight: 800, mb: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: "#15803D" }}>
                      Prize: {m.prizeAmount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#374151", display: "block" }}>
                      {m.drawName} ({m.drawCode}) on {m.drawDate} • Ticket: {m.ticketMatched}
                    </Typography>
                  </Paper>
                ))}
              </Alert>
            ) : (
              <Alert severity="error" icon={<ErrorIcon />} sx={{ borderRadius: "12px" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  No Winning Prize Match Found
                </Typography>
                <Typography variant="caption">
                  Ticket &quot;{manualTicketInput || scannedCode}&quot; did not match any winning prize tiers
                  {selectedDate ? ` for ${selectedDate}` : ""}.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" fullWidth sx={{ borderRadius: "8px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
