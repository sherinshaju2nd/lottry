"use client";

import React, { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/Share";
import RefreshIcon from "@mui/icons-material/Refresh";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  generateLotteryResultVideo,
  LotteryVideoFormat,
  getLotteryMalayalamName,
} from "@/lib/lotteryVideoGenerator";
import SocialPostMetadataBox from "@/components/SocialPostMetadataBox";

interface LotteryVideoPostModalProps {
  open: boolean;
  onClose: () => void;
  drawResult?: any;
  lotteryInfo?: any;
  siteUrl?: string;
}

export default function LotteryVideoPostModal({
  open,
  onClose,
  drawResult,
  lotteryInfo,
  siteUrl,
}: LotteryVideoPostModalProps) {
  const [format, setFormat] = useState<LotteryVideoFormat>("vertical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState<string>("mp4");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [ytModalOpen, setYtModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Clean up object URL on unmount or new video
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Reset when dialog opens
  useEffect(() => {
    if (open && !videoUrl && !isGenerating) {
      // Auto-start video generation when opened
      startGeneration();
    }
  }, [open, format]);

  const startGeneration = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(0);
    setStatusText("Preparing video animation engine...");

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoBlob(null);

    try {
      const { blob, mimeType } = await generateLotteryResultVideo({
        drawResult,
        lotteryInfo,
        format,
        siteUrl: siteUrl || (typeof window !== "undefined" ? window.location.origin : undefined),
        onProgress: (p, text) => {
          setProgress(p);
          setStatusText(text);
        },
      });

      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setVideoExt(mimeType.includes("mp4") ? "mp4" : "webm");
      setIsGenerating(false);
      setProgress(100);
      setToastMsg("HD Video created! Ready to download and share.");
    } catch (err: any) {
      console.error("Video generation failed:", err);
      setIsGenerating(false);
      setToastMsg("Failed to generate video. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!videoBlob || !videoUrl) return;
    const a = document.createElement("a");
    const code = drawResult?.lottery_code || lotteryInfo?.code || "lottery";
    const date = drawResult?.draw_date || "today";
    const formatName = format === "vertical" ? "reels-shorts" : "youtube";
    a.href = videoUrl;
    a.download = `kerala-lottery-${code.toLowerCase()}-${date}-${formatName}-result.${videoExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setToastMsg("Video downloaded successfully!");
  };

  const handleShare = async () => {
    if (!videoBlob) return;
    const code = drawResult?.lottery_code || lotteryInfo?.code || "lottery";
    const date = drawResult?.draw_date || "today";
    const filename = `kerala-lottery-${code.toLowerCase()}-${date}-result.${videoExt}`;

    try {
      const file = new File([videoBlob], filename, {
        type: videoExt === "mp4" ? "video/mp4" : "video/webm",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${drawResult?.draw_name || "Kerala Lottery"} Result Video - ${date}`,
          text: `Official Kerala State Lottery ${drawResult?.draw_name || ""} results video. Watch all winners!`,
          files: [file],
        });
        setToastMsg("Video shared successfully!");
      } else {
        handleDownload();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
        handleDownload();
      }
    }
  };

  const drawTitle =
    drawResult?.draw_name || lotteryInfo?.name || "Kerala Lottery";
  const drawDate = drawResult?.draw_date || "Today";

  const codeParam =
    drawResult?.lottery_code || lotteryInfo?.code || "kerala-lottery";
  const nameMl = getLotteryMalayalamName(
    codeParam,
    drawTitle,
    lotteryInfo?.nameMl || drawResult?.name_ml || drawResult?.nameMl,
  );
  const jackpotAmt =
    drawResult?.prizes?.amounts?.["1st"] || lotteryInfo?.jackpot || "₹1 CRORE";
  const firstTicket =
    drawResult?.first?.ticket?.trim() || "Announced at 3:00 PM";
  const location = drawResult?.first?.location;
  const agent = drawResult?.first?.agent;
  const resultUrl = `${siteUrl}/${codeParam.toLowerCase()}/${drawDate}`;

  const ytTitle = `Kerala Lottery ${drawTitle} (${drawResult?.draw_code || ""}) Result Today ${drawDate} | ${nameMl} ലോട്ടറി ഫലം #Shorts`;
  const nameHashtag = drawTitle.replace(/[^a-zA-Z0-9]/g, "");
  const codeHashtag = (drawResult?.draw_code || "").replace(/[^a-zA-Z0-9]/g, "");

  const ytHashtags = `#KeralaLottery #KeralaLotteryResult #${nameHashtag} #${codeHashtag} #LotteryResultToday #കേരളലോട്ടറി #ലോട്ടറിറിസൾട്ട് #Shorts #Reels #YouTubeShorts #Trending`;

  const ytDescription = [
    `🎉 Official Kerala State Lottery Result Today!`,
    `കേരള ഭാഗ്യക്കുറി ഇന്നത്തെ ഔദ്യോഗിക ഫലം.`,
    ``,
    `📌 Lottery: ${drawTitle} (${drawResult?.draw_code || ""}) • ${nameMl}`,
    `🗓️ Draw Date: ${drawDate} (3:00 PM Draw)`,
    `🏆 1st Prize Grand Jackpot (${jackpotAmt}): ${firstTicket}`,
    ...(location ? [`📍 Drawn District: ${location}`] : []),
    ...(agent ? [`👤 Selling Agent: ${agent}`] : []),
    ``,
    `🛡️ 100% Verified Kerala Government Gazette Result.`,
    `സമ്മാനാർഹമായ ടിക്കറ്റുകൾ ഔദ്യോഗിക കേരള സർക്കാർ ഗസറ്റുമായി ഒത്തുനോക്കി 30 ദിവസത്തിനകം സമ്മാനം മാറേണ്ടതാണ്.`,
    ``,
    `🌐 Check Live Results & Ticket Checker:`,
    `${resultUrl}`,
    ``,
    ytHashtags,
  ].join("\n");

  const handleDirectYouTubeUpload = () => {
    if (!videoBlob || !videoUrl) {
      setToastMsg("Please wait for video generation to complete.");
      return;
    }

    // 1. Download video file automatically
    handleDownload();

    // 2. Automatically copy Title + Description to clipboard
    const fullPost = `${ytTitle}\n\n${ytDescription}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullPost).catch(() => {});
    }

    // 3. Open YouTube Upload Studio in new tab
    window.open(
      "https://studio.youtube.com/channel/UC/videos/upload?d=ud",
      "_blank",
      "noopener,noreferrer",
    );

    // 4. Open Helper Dialog
    setYtModalOpen(true);
    setToastMsg("Video downloaded & Title/Description copied! YouTube Studio opening...");
  };

  const copyFieldToClipboard = (text: string, fieldKey: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

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
              bgcolor: "#0B1526",
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
            background: "linear-gradient(135deg, #0B3C5D 0%, #111E33 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(45deg, #EF4444, #F59E0B)",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
              }}
            >
              <VideoLibraryIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.1rem" }}
              >
                HD Result Video (Reels, Shorts & YouTube)
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Video Player / Generation Box */}
          <Box
            sx={{
              position: "relative",
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#020713",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              p: { xs: 1, sm: 2 },
              overflow: "hidden",
            }}
          >
            {isGenerating ? (
              <Box sx={{ width: "100%", maxWidth: 440, textAlign: "center", py: 6, px: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#FDE047", mb: 1.5 }}
                >
                  Rendering HD Result Video ({progress}%)
                </Typography>
                <Typography variant="body2" sx={{ color: "#94A3B8", mb: 3 }}>
                  {statusText || "Assembling animated scenes and audio chimes..."}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: "linear-gradient(90deg, #F59E0B, #10B981)",
                    },
                  }}
                />
              </Box>
            ) : videoUrl ? (
              <Box sx={{ width: "100%", textAlign: "center" }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  style={{
                    maxWidth: "100%",
                    maxHeight: format === "vertical" ? 480 : 380,
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Button
                  onClick={startGeneration}
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    bgcolor: "#10B981",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "1rem",
                    py: 1.4,
                    px: 3.5,
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  Generate HD Result Video
                </Button>
              </Box>
            )}
          </Box>

          {/* Social Media Upload Metadata Box (Title, Description, Tags) */}
          <SocialPostMetadataBox
            drawResult={drawResult}
            lotteryInfo={lotteryInfo}
            siteUrl={siteUrl}
            mediaType="video"
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
            onClick={startGeneration}
            disabled={isGenerating}
            startIcon={<RefreshIcon />}
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
            Regenerate
          </Button>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <Button
              onClick={handleDirectYouTubeUpload}
              disabled={!videoBlob || isGenerating}
              variant="contained"
              startIcon={<YouTubeIcon />}
              sx={{
                bgcolor: "#FF0000",
                color: "#FFFFFF",
                borderRadius: "10px",
                px: 2.8,
                py: 1,
                fontWeight: 900,
                fontSize: "0.95rem",
                textTransform: "none",
                boxShadow: "0 4px 16px rgba(255, 0, 0, 0.4)",
                "&:hover": { bgcolor: "#CC0000" },
              }}
            >
              Upload to YouTube
            </Button>

            <Button
              onClick={handleShare}
              disabled={!videoBlob || isGenerating}
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
              Share Video
            </Button>

            <Button
              onClick={handleDownload}
              disabled={!videoBlob || isGenerating}
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
              Download HD Video
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* YouTube Upload Helper Dialog */}
      <Dialog
        open={ytModalOpen}
        onClose={() => setYtModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "18px",
              bgcolor: "#0A182F",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 0, 0, 0.4)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "linear-gradient(90deg, #1A0505 0%, #2D0A0A 100%)",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#FF0000",
                color: "#FFFFFF",
              }}
            >
              <YouTubeIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                Ready for YouTube Upload
              </Typography>
              <Typography variant="caption" sx={{ color: "#86EFAC" }}>
                ✓ Video file downloaded & Title/Description copied!
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setYtModalOpen(false)} sx={{ color: "#94A3B8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: "10px",
              bgcolor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            <CheckIcon sx={{ color: "#10B981", fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: "#D1FAE5", fontWeight: 600 }}>
              The HD video is saved in your <strong>Downloads</strong> folder. Drag it into YouTube Studio!
            </Typography>
          </Box>

          {/* Title Box */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700 }}>
                1️⃣ Video Title (YouTube Title)
              </Typography>
              <Button
                size="small"
                onClick={() => copyFieldToClipboard(ytTitle, "title")}
                startIcon={copiedField === "title" ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                sx={{
                  color: copiedField === "title" ? "#4ADE80" : "#38BDF8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {copiedField === "title" ? "Copied!" : "Copy Title"}
              </Button>
            </Box>
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#030A14",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                fontSize: "0.85rem",
              }}
            >
              {ytTitle}
            </Box>
          </Box>

          {/* Description Box */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700 }}>
                2️⃣ Video Description (With Malayalam & Details)
              </Typography>
              <Button
                size="small"
                onClick={() => copyFieldToClipboard(ytDescription, "desc")}
                startIcon={copiedField === "desc" ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                sx={{
                  color: copiedField === "desc" ? "#4ADE80" : "#38BDF8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {copiedField === "desc" ? "Copied!" : "Copy Description"}
              </Button>
            </Box>
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#030A14",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#CBD5E1",
                fontFamily: "monospace",
                fontSize: "0.78rem",
                whiteSpace: "pre-wrap",
                maxHeight: 140,
                overflowY: "auto",
              }}
            >
              {ytDescription}
            </Box>
          </Box>

          {/* Tags Box */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700 }}>
                3️⃣ Tags / Hashtags
              </Typography>
              <Button
                size="small"
                onClick={() => copyFieldToClipboard(ytHashtags, "tags")}
                startIcon={copiedField === "tags" ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                sx={{
                  color: copiedField === "tags" ? "#4ADE80" : "#38BDF8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {copiedField === "tags" ? "Copied!" : "Copy Tags"}
              </Button>
            </Box>
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#030A14",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#67E8F9",
                fontSize: "0.8rem",
              }}
            >
              {ytHashtags}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)", justifyContent: "space-between" }}>
          <Button
            component="a"
            href="https://studio.youtube.com/channel/UC/videos/upload?d=ud"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<OpenInNewIcon />}
            sx={{
              bgcolor: "#FF0000",
              color: "#FFFFFF",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#CC0000" },
            }}
          >
            Open YouTube Studio
          </Button>

          <Button
            onClick={() => setYtModalOpen(false)}
            variant="outlined"
            sx={{
              color: "#E2E8F0",
              borderColor: "rgba(255, 255, 255, 0.2)",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Done
          </Button>
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
