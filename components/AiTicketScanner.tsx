"use client";

import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

import { useRouter } from "next/navigation";
import BarcodeResultModal from "./BarcodeResultModal";

interface AiTicketScannerProps {
  onTicketDetected?: (ticketNumber: string, lotteryCode?: string, drawDate?: string) => void;
  buttonLabel?: string;
  variant?: "button" | "full" | "dialog-only" | "hidden";
}

// Extract valid Kerala Lottery Ticket digits from barcode or raw text
export function parseKeralaBarcodeText(rawText: string): {
  ticketNumber: string;
  lotteryCode?: string;
} {
  const clean = rawText.trim().toUpperCase();

  // Pattern 1: Format with 2-letter code + 6 digits e.g. "BT 263322", "SS263322", "BT-263322"
  const fullMatch = clean.match(/([A-Z]{2})[\s\-–]?([0-9]{6})/);
  if (fullMatch) {
    return {
      lotteryCode: fullMatch[1],
      ticketNumber: `${fullMatch[1]} ${fullMatch[2]}`,
    };
  }

  // Pattern 2: 6 digits sequence
  const sixDigits = clean.match(/([0-9]{6})/);
  if (sixDigits) {
    return { ticketNumber: sixDigits[1] };
  }

  // Pattern 3: 4 digits sequence
  const fourDigits = clean.match(/([0-9]{4})/);
  if (fourDigits) {
    return { ticketNumber: fourDigits[1] };
  }

  return { ticketNumber: clean };
}

export default function AiTicketScanner({
  onTicketDetected,
  buttonLabel = "Scan Barcode",
  variant = "button",
}: AiTicketScannerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);

  // Result modal state matching mobile app
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [detectedTicket, setDetectedTicket] = useState<string | null>(null);
  const [detectedLotteryCode, setDetectedLotteryCode] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setScannedResult(null);
    setCameraError(null);
  };

  const handleClose = () => {
    stopScanner();
    setOpen(false);
  };

  // Global event listener to open barcode scanner
  useEffect(() => {
    const handleGlobalOpen = () => handleOpen();
    window.addEventListener("open-ai-ticket-scanner", handleGlobalOpen);
    window.addEventListener("open-barcode-scanner", handleGlobalOpen);
    return () => {
      window.removeEventListener("open-ai-ticket-scanner", handleGlobalOpen);
      window.removeEventListener("open-barcode-scanner", handleGlobalOpen);
    };
  }, []);

  // Initialize live camera barcode scanner
  const startScanner = async () => {
    setCameraError(null);
    setScannedResult(null);

    // Wait for DOM container to mount
    await new Promise((resolve) => setTimeout(resolve, 300));
    const readerElem = document.getElementById("kerala-barcode-reader");
    if (!readerElem) return;

    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch {}
      }

      // Instantiate with broad Kerala lottery barcode & QR format support
      const html5QrCode = new Html5Qrcode("kerala-barcode-reader", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 25,
        aspectRatio: undefined,
      };

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleBarcodeSuccess(decodedText);
          },
          () => {
            // continuous frame parsing
          }
        );
      } catch (primaryErr) {
        console.warn("FacingMode 'environment' failed, attempting fallback to available cameras:", primaryErr);
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Select back/rear camera if present, or fallback to first available
          const preferredCam =
            cameras.find((c) => /back|rear|environment|outward/i.test(c.label)) ||
            cameras[cameras.length - 1] ||
            cameras[0];

          await html5QrCode.start(
            preferredCam.id,
            config,
            (decodedText) => {
              handleBarcodeSuccess(decodedText);
            },
            () => {}
          );
        } else {
          throw primaryErr;
        }
      }

      // Safely acquire video track from existing HTMLVideoElement without conflicting getUserMedia
      setTimeout(() => {
        try {
          const videoElem = readerElem.querySelector("video") as HTMLVideoElement | null;
          if (videoElem && videoElem.srcObject) {
            const stream = videoElem.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            if (track) {
              videoTrackRef.current = track;
            }
          }
        } catch {}
      }, 500);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err?.message || "Could not access camera. Please allow camera permissions to scan your ticket barcode."
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    if (videoTrackRef.current) {
      try {
        videoTrackRef.current.stop();
      } catch {}
      videoTrackRef.current = null;
    }
    setTorchOn(false);
  };

  // Toggle camera flashlight
  const toggleTorch = async () => {
    if (!videoTrackRef.current) return;
    try {
      const nextTorch = !torchOn;
      const capabilities: any = videoTrackRef.current.getCapabilities?.() || {};
      if (capabilities.torch) {
        await (videoTrackRef.current as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } else {
        setTorchOn(nextTorch);
      }
    } catch {
      setTorchOn(!torchOn);
    }
  };

  // When barcode is detected successfully
  const handleBarcodeSuccess = (rawText: string) => {
    if (scannedResult) return;
    setScannedResult(rawText);

    // Haptic vibration feedback
    try {
      if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
        window.navigator.vibrate([120, 60, 120]);
      }
    } catch {}

    const { ticketNumber, lotteryCode } = parseKeralaBarcodeText(rawText);

    setTimeout(() => {
      stopScanner();
      setOpen(false);
      if (onTicketDetected) {
        onTicketDetected(ticketNumber, lotteryCode);
      } else {
        setDetectedTicket(ticketNumber);
        setDetectedLotteryCode(lotteryCode || null);
        setResultModalOpen(true);
      }
    }, 600);
  };

  // Manage Camera on open/close
  useEffect(() => {
    if (open) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [open]);

  return (
    <>
      {variant === "button" ? (
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<QrCodeScannerIcon />}
          sx={{
            background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.875rem",
            px: 2.5,
            py: 1.1,
            borderRadius: "12px",
            boxShadow: "0 4px 14px rgba(11, 60, 93, 0.25)",
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(135deg, #07263b 0%, #081C38 100%)",
            },
          }}
        >
          {buttonLabel}
        </Button>
      ) : null}

      {/* Global CSS overrides for html5-qrcode to guarantee 100% full-bleed, perfectly centered camera video without canvas offsets */}
      <style dangerouslySetInnerHTML={{ __html: `
        #kerala-barcode-reader {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #kerala-barcode-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 2 !important;
        }
        #kerala-barcode-reader canvas {
          opacity: 0 !important;
          position: absolute !important;
          pointer-events: none !important;
          z-index: 1 !important;
        }
        #kerala-barcode-reader img {
          display: none !important;
        }
        #kerala-barcode-reader__scan_region {
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #kerala-barcode-reader__header_message {
          display: none !important;
        }
        #kerala-barcode-reader__status_span {
          display: none !important;
        }
      `}} />

      {/* Full-Screen Barcode Scanner Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#070B14",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              m: 0,
              p: 0,
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Top Header Overlay */}
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "rgba(7, 11, 20, 0.96)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 },
            zIndex: 30,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              color: "#FFFFFF",
              bgcolor: "rgba(255, 255, 255, 0.12)",
              width: 42,
              height: 42,
              borderRadius: "50%",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.22)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>

          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8 }}>
              <QrCodeScannerIcon sx={{ fontSize: 20, color: "#00E5FF" }} />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.1rem" }, color: "#FFFFFF", letterSpacing: "0.02em" }}>
                Barcode Ticket Scanner
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 700, letterSpacing: "0.08em" }}>
              SCAN • CHECK • GET RESULTS
            </Typography>
          </Box>

          <IconButton
            onClick={toggleTorch}
            sx={{
              color: torchOn ? "#0F172A" : "#FFFFFF",
              bgcolor: torchOn ? "#FACC15" : "rgba(255, 255, 255, 0.12)",
              width: 42,
              height: 42,
              borderRadius: "50%",
              "&:hover": { bgcolor: torchOn ? "#EAB308" : "rgba(255, 255, 255, 0.22)" },
            }}
          >
            {torchOn ? <FlashOnIcon sx={{ fontSize: 22 }} /> : <FlashOffIcon sx={{ fontSize: 22 }} />}
          </IconButton>
        </DialogTitle>

        {/* Full-Width Camera Body */}
        <DialogContent
          sx={{
            p: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#000000",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top Instruction Pill */}
          <Box
            sx={{
              width: "100%",
              py: 1.5,
              px: 2,
              bgcolor: "rgba(7, 11, 20, 0.8)",
              display: "flex",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: "20px",
                px: 2.2,
                py: 0.6,
              }}
            >
              <Typography sx={{ color: "#E2E8F0", fontSize: { xs: "0.78rem", sm: "0.85rem" }, fontWeight: 700, textAlign: "center" }}>
                Align barcode within the cyan box • ബാർകോഡ് ചട്ടക്കൂടിനുള്ളിൽ വയ്ക്കുക
              </Typography>
            </Box>
          </Box>

          {/* Center Camera Viewport with Reticle & Animated Laser */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* HTML5 Live Video Stream */}
            <div
              id="kerala-barcode-reader"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />

            {/* Centered Reticle with Shaded Mask */}
            <Box
              sx={{
                position: "relative",
                width: { xs: "82%", sm: 340 },
                height: { xs: 180, sm: 200 },
                pointerEvents: "none",
                zIndex: 10,
                boxShadow: "0 0 0 9999px rgba(7, 11, 20, 0.6)",
                borderRadius: "14px",
              }}
            >
              {/* 4 Cyan Corner Brackets (#00E5FF) Matching Mobile App */}
              <Box
                sx={{
                  position: "absolute",
                  top: -2,
                  left: -2,
                  width: 32,
                  height: 32,
                  borderTop: "4px solid #00E5FF",
                  borderLeft: "4px solid #00E5FF",
                  borderTopLeftRadius: "12px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 32,
                  height: 32,
                  borderTop: "4px solid #00E5FF",
                  borderRight: "4px solid #00E5FF",
                  borderTopRightRadius: "12px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -2,
                  left: -2,
                  width: 32,
                  height: 32,
                  borderBottom: "4px solid #00E5FF",
                  borderLeft: "4px solid #00E5FF",
                  borderBottomLeftRadius: "12px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 32,
                  height: 32,
                  borderBottom: "4px solid #00E5FF",
                  borderRight: "4px solid #00E5FF",
                  borderBottomRightRadius: "12px",
                }}
              />

              {/* Animated Laser Beam */}
              <Box
                sx={{
                  position: "absolute",
                  left: 4,
                  right: 4,
                  height: "3px",
                  bgcolor: "#00E5FF",
                  boxShadow: "0 0 14px #00E5FF, 0 0 24px #00E5FF",
                  animation: "laserScanFull 1.8s ease-in-out infinite alternate",
                  "@keyframes laserScanFull": {
                    "0%": { top: 6 },
                    "100%": { top: "calc(100% - 10px)" },
                  },
                }}
              />

              {/* Scanned Success Overlay */}
              {scannedResult && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(7, 11, 20, 0.94)",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 25,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 54, color: "#22C55E", mb: 1 }} />
                  <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: "#FFFFFF" }}>
                    Barcode Scanned!
                  </Typography>
                  <Chip
                    label={scannedResult}
                    sx={{
                      mt: 1,
                      bgcolor: "#22C55E",
                      color: "#FFFFFF",
                      fontWeight: 900,
                      fontSize: "0.95rem",
                      px: 1,
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Error Notice */}
          {cameraError && (
            <Box sx={{ width: "100%", px: 2, zIndex: 20 }}>
              <Alert
                severity="warning"
                icon={<WarningAmberIcon />}
                sx={{ borderRadius: "12px", fontSize: "0.82rem", bgcolor: "#1E293B", color: "#FDE047" }}
              >
                {cameraError}
              </Alert>
            </Box>
          )}

          {/* Bottom Visual Ticket Guide ("WHERE TO SCAN") */}
          <Box
            sx={{
              width: "100%",
              bgcolor: "rgba(7, 11, 20, 0.96)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              py: { xs: 2, sm: 2.5 },
              px: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 20,
            }}
          >
            {/* Divider: SCAN THIS BARCODE */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: 360,
                mb: 1.5,
                gap: 1.5,
              }}
            >
              <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255, 255, 255, 0.15)" }} />
              <Typography
                sx={{
                  color: "#94A3B8",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                SCAN THIS BARCODE (ടിക്കറ്റിലെ ബാർകോഡ്)
              </Typography>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255, 255, 255, 0.15)" }} />
            </Box>

            {/* Clean Sample Barcode Illustration Card with Cyan Corners Matching Mobile App */}
            <Box
              sx={{
                position: "relative",
                p: 1.2,
                bgcolor: "rgba(255, 255, 255, 0.04)",
                borderRadius: "14px",
                border: "1px solid rgba(0, 229, 255, 0.35)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: 320,
              }}
            >
              {/* Four Cyan Mini Corners */}
              <Box sx={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: "2px solid #00E5FF", borderLeft: "2px solid #00E5FF", borderTopLeftRadius: "5px" }} />
              <Box sx={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, borderTop: "2px solid #00E5FF", borderRight: "2px solid #00E5FF", borderTopRightRadius: "5px" }} />
              <Box sx={{ position: "absolute", bottom: 0, left: 0, width: 10, height: 10, borderBottom: "2px solid #00E5FF", borderLeft: "2px solid #00E5FF", borderBottomLeftRadius: "5px" }} />
              <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: "2px solid #00E5FF", borderRight: "2px solid #00E5FF", borderBottomRightRadius: "5px" }} />

              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "8px",
                  px: 2.5,
                  py: 1,
                  width: "100%",
                  maxWidth: 240,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Barcode Graphic Lines */}
                <Box sx={{ display: "flex", alignItems: "center", height: 26, gap: "1.5px", mb: 0.5 }}>
                  {[
                    3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 2, 4, 1, 3,
                    1, 2, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3,
                  ].map((w, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: w,
                        height: "100%",
                        bgcolor: idx % 2 === 0 ? "#0F172A" : "transparent",
                      }}
                    />
                  ))}
                </Box>
                <Typography sx={{ color: "#0F172A", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.12em", fontFamily: "monospace" }}>
                  EIH24US5NXQER09
                </Typography>
              </Box>

              <Typography sx={{ color: "#94A3B8", fontSize: "0.7rem", mt: 0.8, textAlign: "center", fontWeight: 600 }}>
                Hold your camera steady over the barcode printed on your ticket
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Scanned Barcode Result Modal Matching Mobile App */}
      <BarcodeResultModal
        open={resultModalOpen}
        scannedBarcode={detectedTicket}
        targetLotteryCode={detectedLotteryCode}
        onClose={() => setResultModalOpen(false)}
        onRescan={() => {
          setResultModalOpen(false);
          handleOpen();
        }}
      />
    </>
  );
}
