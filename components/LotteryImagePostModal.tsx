"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import InstagramIcon from "@mui/icons-material/Instagram";
import {
  generateLotteryPostDataUrl,
  generateLotteryPostJpegBlob,
  downloadLotteryPostImage,
  shareLotteryPostImage,
  LotteryPostImageOptions,
  LotteryImageFormat,
} from "@/lib/lotteryImageGenerator";
import SocialPostMetadataBox from "@/components/SocialPostMetadataBox";

interface LotteryImagePostModalProps {
  open: boolean;
  onClose: () => void;
  drawResult?: any;
  lotteryInfo?: any;
  siteUrl?: string;
}

export default function LotteryImagePostModal({
  open,
  onClose,
  drawResult,
  lotteryInfo,
  siteUrl,
}: LotteryImagePostModalProps) {
  const [format, setFormat] = useState<LotteryImageFormat>("story");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Generate image whenever modal opens or format changes
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoading(true);

    const options: LotteryPostImageOptions = {
      drawResult,
      lotteryInfo,
      format,
      siteUrl: siteUrl || (typeof window !== "undefined" ? window.location.origin : undefined),
    };

    generateLotteryPostDataUrl(options)
      .then((url) => {
        if (isMounted) {
          setPreviewUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to render lottery post image:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, format, drawResult, lotteryInfo, siteUrl]);

  const handleDownload = async () => {
    try {
      await downloadLotteryPostImage({
        drawResult,
        lotteryInfo,
        format,
        siteUrl,
      });
      setToastMsg("JPG image downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      setToastMsg("Failed to download image.");
    }
  };

  const handleShare = async () => {
    try {
      const shared = await shareLotteryPostImage({
        drawResult,
        lotteryInfo,
        format,
        siteUrl,
      });
      if (shared) {
        setToastMsg("Result image shared successfully!");
      } else {
        setToastMsg("Image downloaded! You can now upload it to Instagram or Facebook.");
      }
    } catch (err) {
      console.error("Share error:", err);
      setToastMsg("Could not trigger native share; downloading image.");
      await handleDownload();
    }
  };

  const handleCopyImage = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        const blob = await generateLotteryPostJpegBlob({
          drawResult,
          lotteryInfo,
          format,
          siteUrl,
        });
        // Modern browsers usually support copying PNG/JPEG to clipboard
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopied(true);
        setToastMsg("Image copied to clipboard! (Ctrl+V / Paste anywhere)");
        setTimeout(() => setCopied(false), 3000);
      } else {
        await handleDownload();
      }
    } catch (err) {
      console.warn("Clipboard write failed, downloading instead:", err);
      await handleDownload();
    }
  };

  const drawTitle =
    drawResult?.draw_name || lotteryInfo?.name || "Kerala Lottery";
  const drawDate =
    drawResult?.draw_date || "Today";

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              bgcolor: "#0F172A",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
            },
          },
        }}
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "linear-gradient(135deg, #0B3C5D 0%, #1E293B 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
                color: "#FFFFFF",
              }}
            >
              <InstagramIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.1rem" }}
              >
                Instagram & Facebook Post Image (JPG)
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", display: "block" }}>
                {drawTitle} ({drawResult?.draw_code || ""}) • {drawDate}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#94A3B8",
              "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Modal Content */}
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {/* Image Preview Area */}
          <Box
            sx={{
              position: "relative",
              minHeight: 380,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#020617",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              p: { xs: 1, sm: 2 },
              overflow: "hidden",
            }}
          >
            {isLoading ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#F59E0B", mb: 2 }} />
                <Typography variant="body2" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                  Generating official social post image...
                </Typography>
              </Box>
            ) : previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt="Kerala Lottery Result Social Post Preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: { xs: 480, sm: 620 },
                  height: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: "#EF4444" }}>
                Could not generate image preview. Please try again.
              </Typography>
            )}
          </Box>

          {/* Social Media Upload Metadata Box (Title, Description, Tags) */}
          <SocialPostMetadataBox
            drawResult={drawResult}
            lotteryInfo={lotteryInfo}
            siteUrl={siteUrl}
            mediaType="image"
          />
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleCopyImage}
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            sx={{
              color: "#E2E8F0",
              bgcolor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              px: 2,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
            }}
          >
            {copied ? "Copied!" : "Copy Image"}
          </Button>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              onClick={handleShare}
              variant="outlined"
              startIcon={<ShareIcon />}
              sx={{
                color: "#38BDF8",
                borderColor: "#38BDF8",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(56, 189, 248, 0.1)",
                  borderColor: "#7DD3FC",
                },
              }}
            >
              Share Image
            </Button>

            <Button
              onClick={handleDownload}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: "#10B981",
                color: "#FFFFFF",
                borderRadius: "10px",
                px: 3,
                py: 1,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              Download JPG
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
