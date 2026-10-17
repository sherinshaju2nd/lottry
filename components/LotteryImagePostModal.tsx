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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CollectionsIcon from "@mui/icons-material/Collections";
import {
  generateLotteryPostPages,
  downloadLotteryPostSlide,
  downloadAllLotteryPostSlides,
  shareLotteryPostImage,
  InstagramPostPage,
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
  const [pages, setPages] = useState<InstagramPostPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Generate Instagram Post pages whenever modal opens or format changes
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

    generateLotteryPostPages(options)
      .then((generatedPages) => {
        if (isMounted) {
          setPages(generatedPages);
          setActivePageIndex(0);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to render Instagram post pages:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, format, drawResult, lotteryInfo, siteUrl]);

  const activePage = pages[activePageIndex] || pages[0];

  const handleNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex((prev) => prev - 1);
    }
  };

  const handleDownloadCurrentSlide = async () => {
    if (!activePage) return;
    try {
      await downloadLotteryPostSlide(activePage, {
        drawResult,
        lotteryInfo,
        format,
        siteUrl,
      });
      setToastMsg(`Slide ${activePage.pageNumber} downloaded successfully!`);
    } catch (err) {
      console.error("Download error:", err);
      setToastMsg("Failed to download image.");
    }
  };

  const handleDownloadAllSlides = async () => {
    if (pages.length === 0) return;
    try {
      setToastMsg(`Downloading all ${pages.length} Instagram carousel slides...`);
      await downloadAllLotteryPostSlides(pages, {
        drawResult,
        lotteryInfo,
        format,
        siteUrl,
      });
      setToastMsg(`All ${pages.length} slides downloaded successfully!`);
    } catch (err) {
      console.error("Download all error:", err);
      setToastMsg("Failed to download all slides.");
    }
  };

  const handleShare = async () => {
    try {
      const shared = await shareLotteryPostImage(
        {
          drawResult,
          lotteryInfo,
          format,
          siteUrl,
        },
        activePageIndex,
      );
      if (shared) {
        setToastMsg("Result image shared successfully!");
      } else {
        setToastMsg("Slide downloaded! You can now upload it to Instagram or Facebook.");
      }
    } catch (err) {
      console.error("Share error:", err);
      setToastMsg("Could not trigger native share; downloading image.");
      await handleDownloadCurrentSlide();
    }
  };

  const handleCopyImage = async () => {
    if (!activePage) return;
    try {
      if (typeof window !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        const blob = await new Promise<Blob>((resolve, reject) => {
          activePage.canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Blob error"))),
            "image/jpeg",
            0.96,
          );
        });
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopied(true);
        setToastMsg(`Slide ${activePage.pageNumber} copied to clipboard! (Ctrl+V anywhere)`);
        setTimeout(() => setCopied(false), 3000);
      } else {
        await handleDownloadCurrentSlide();
      }
    } catch (err) {
      console.warn("Clipboard write failed, downloading instead:", err);
      await handleDownloadCurrentSlide();
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
                Post Image (900 × 900 Pixels)
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", display: "block" }}>
                {drawTitle} ({drawResult?.draw_code || ""}) • {drawDate} • {pages.length} Slide{pages.length > 1 ? "s" : ""}
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
          {/* Slide Navigation Bar (if multiple slides) */}
          {pages.length > 1 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#0A182F",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "12px",
                p: 1.2,
                mb: 2,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                disabled={activePageIndex === 0}
                onClick={handlePrevPage}
                startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "13px !important" }} />}
                sx={{
                  color: "#38BDF8",
                  borderColor: "rgba(56, 189, 248, 0.4)",
                  fontWeight: 700,
                  textTransform: "none",
                  "&.Mui-disabled": { color: "#475569", borderColor: "rgba(255,255,255,0.08)" },
                }}
              >
                Prev Slide
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CollectionsIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: "#FEF08A", fontSize: "0.95rem" }}>
                  Slide {activePageIndex + 1} of {pages.length}
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                disabled={activePageIndex === pages.length - 1}
                onClick={handleNextPage}
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: "13px !important" }} />}
                sx={{
                  color: "#38BDF8",
                  borderColor: "rgba(56, 189, 248, 0.4)",
                  fontWeight: 700,
                  textTransform: "none",
                  "&.Mui-disabled": { color: "#475569", borderColor: "rgba(255,255,255,0.08)" },
                }}
              >
                Next Slide
              </Button>
            </Box>
          )}

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
                  Generating official 1080x1350 Instagram slides...
                </Typography>
              </Box>
            ) : activePage ? (
              <Box
                component="img"
                src={activePage.dataUrl}
                alt={`Kerala Lottery Result Instagram Post Slide ${activePage.pageNumber}`}
                sx={{
                  maxWidth: "100%",
                  maxHeight: { xs: 480, sm: 600 },
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

          {/* Thumbnail Strip for Carousel Slides */}
          {pages.length > 1 && (
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                mt: 2,
                overflowX: "auto",
                py: 0.5,
              }}
            >
              {pages.map((p, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActivePageIndex(idx)}
                  sx={{
                    cursor: "pointer",
                    border: idx === activePageIndex ? "2px solid #F59E0B" : "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    opacity: idx === activePageIndex ? 1 : 0.6,
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 0.9, borderColor: "#38BDF8" },
                  }}
                >
                  <Box
                    component="img"
                    src={p.dataUrl}
                    alt={`Slide ${idx + 1}`}
                    sx={{ width: 60, height: 75, objectFit: "cover", display: "block" }}
                  />
                </Box>
              ))}
            </Box>
          )}

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
            {copied ? "Copied!" : "Copy Slide"}
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
                px: 2,
                py: 1,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(56, 189, 248, 0.1)",
                  borderColor: "#7DD3FC",
                },
              }}
            >
              Share Slide
            </Button>

            {pages.length > 1 && (
              <Button
                onClick={handleDownloadAllSlides}
                variant="outlined"
                startIcon={<CollectionsIcon />}
                sx={{
                  color: "#FDE047",
                  borderColor: "rgba(253, 224, 71, 0.6)",
                  borderRadius: "10px",
                  px: 2,
                  py: 1,
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "rgba(253, 224, 71, 0.1)",
                    borderColor: "#FDE047",
                  },
                }}
              >
                Download All ({pages.length} Slides)
              </Button>
            )}

            <Button
              onClick={handleDownloadCurrentSlide}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: "#10B981",
                color: "#FFFFFF",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              Download Slide {activePage ? activePage.pageNumber : ""}
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
