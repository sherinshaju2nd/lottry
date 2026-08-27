"use client";

import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import confetti from "canvas-confetti";

interface AiTicketScannerProps {
  onTicketDetected?: (ticketNumber: string, lotteryCode?: string, drawDate?: string) => void;
  buttonLabel?: string;
  variant?: "button" | "full";
}

export default function AiTicketScanner({
  onTicketDetected,
  buttonLabel = "AI Smart Ticket Scan",
  variant = "button",
}: AiTicketScannerProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setImagePreview(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  const handleClose = () => {
    setOpen(false);
    setIsScanning(false);
  };

  const processImageFile = (file: File) => {
    if (!file) return;
    setErrorMsg(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setImagePreview(base64Data);
      await performAiScan(base64Data, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const performAiScan = async (base64Image: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, mimeType }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "AI could not recognize ticket numbers clearly. Please try again with good lighting.");
      }

      setScanResult(data);

      if (data.isWinner) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore confetti errors in unsupported environments
        }
      }

      if (onTicketDetected && data.ticket?.ticket_number) {
        const fullTicket = data.ticket.series
          ? `${data.ticket.series} ${data.ticket.ticket_number}`
          : data.ticket.ticket_number;
        onTicketDetected(fullTicket, data.ticket.lottery_code, data.ticket.draw_date);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to scan ticket. Please make sure the ticket digits are visible.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleUseTicket = () => {
    if (scanResult?.ticket?.ticket_number && onTicketDetected) {
      const fullTicket = scanResult.ticket.series
        ? `${scanResult.ticket.series} ${scanResult.ticket.ticket_number}`
        : scanResult.ticket.ticket_number;
      onTicketDetected(fullTicket, scanResult.ticket.lottery_code, scanResult.ticket.draw_date);
    }
    handleClose();
  };

  return (
    <>
      {variant === "button" ? (
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<AutoAwesomeIcon sx={{ color: "#FFD700" }} />}
          sx={{
            background: "linear-gradient(135deg, #0B3C5D 0%, #1D2731 100%)",
            color: "#FFFFFF",
            fontWeight: 700,
            px: 2.5,
            py: 1,
            borderRadius: "10px",
            boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #07263b 0%, #0F172A 100%)",
            },
          }}
        >
          {buttonLabel}
        </Button>
      ) : null}

      {/* Hidden file inputs for Camera and Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) processImageFile(e.target.files[0]);
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) processImageFile(e.target.files[0]);
        }}
      />

      {/* AI Scanner Modal Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: "#F59E0B" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
              Gemini Vision Ticket Scanner
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5 }}>
          {/* Action Buttons: Camera Snap or Gallery Upload */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<CameraAltIcon />}
              onClick={() => cameraInputRef.current?.click()}
              sx={{
                bgcolor: "#0B3C5D",
                color: "#FFF",
                fontWeight: 700,
                py: 1.5,
                borderRadius: "12px",
                "&:hover": { bgcolor: "#07263b" },
              }}
            >
              Take Photo
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PhotoLibraryIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderColor: "#D1D5DB",
                color: "#374151",
                fontWeight: 700,
                py: 1.5,
                borderRadius: "12px",
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Upload Photo
            </Button>
          </Box>

          {/* Image Preview & Scanning Pulse */}
          {imagePreview && (
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                borderRadius: "14px",
                overflow: "hidden",
                border: "2px solid #E5E7EB",
                mb: 2.5,
                bgcolor: "#000",
                maxHeight: 280,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={imagePreview}
                alt="Ticket Scan Preview"
                style={{
                  maxHeight: 280,
                  width: "100%",
                  objectFit: "contain",
                }}
              />

              {isScanning && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(11, 60, 93, 0.7)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFF",
                    gap: 1.5,
                  }}
                >
                  <CircularProgress color="inherit" size={42} />
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Gemini AI analyzing ticket details...
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Error Message */}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
              {errorMsg}
            </Alert>
          )}

          {/* AI Extraction & Match Results */}
          {scanResult && !isScanning && (
            <Box sx={{ mt: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "14px",
                  bgcolor: scanResult.isWinner ? "#ECFDF5" : "#F8FAFC",
                  border: `1px solid ${scanResult.isWinner ? "#10B981" : "#E2E8F0"}`,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                    AI Extracted Ticket
                  </Typography>
                  {scanResult.isWinner ? (
                    <Chip
                      icon={<EmojiEventsIcon />}
                      label="WINNING TICKET!"
                      color="success"
                      sx={{ fontWeight: 800 }}
                    />
                  ) : (
                    <Chip label="Ready to Check" size="small" sx={{ fontWeight: 700 }} />
                  )}
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {scanResult.ticket?.series && (
                    <Chip label={`Series: ${scanResult.ticket.series}`} variant="outlined" sx={{ fontWeight: 700 }} />
                  )}
                  {scanResult.ticket?.ticket_number && (
                    <Chip
                      label={`Number: ${scanResult.ticket.ticket_number}`}
                      color="primary"
                      sx={{ fontWeight: 800, bgcolor: "#0B3C5D" }}
                    />
                  )}
                  {scanResult.ticket?.lottery_name && (
                    <Chip label={scanResult.ticket.lottery_name} variant="outlined" />
                  )}
                  {scanResult.ticket?.draw_date && (
                    <Chip label={`Date: ${scanResult.ticket.draw_date}`} variant="outlined" />
                  )}
                </Box>

                {scanResult.isWinner && scanResult.matches?.length > 0 && (
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed #10B981" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#065F46", mb: 0.5 }}>
                      Prize Match Found:
                    </Typography>
                    {scanResult.matches.map((m: any, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: "#047857" }}>
                        • <strong>{m.prize_tier}</strong>: {m.prize_amount || "Prize Confirmed"} ({m.draw_name} - {m.draw_date})
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ color: "#6B7280", fontWeight: 700 }}>
            Cancel
          </Button>
          {scanResult?.ticket?.ticket_number && (
            <Button
              variant="contained"
              onClick={handleUseTicket}
              startIcon={<CheckCircleIcon />}
              sx={{
                bgcolor: "#0B3C5D",
                fontWeight: 700,
                borderRadius: "10px",
                "&:hover": { bgcolor: "#07263b" },
              }}
            >
              Use this Ticket Number
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
