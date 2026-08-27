"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { SocialMediaDigest } from "@/lib/gemini";

interface AiSocialDigestModalProps {
  open: boolean;
  onClose: () => void;
  drawCode?: string;
  drawDate?: string;
}

export default function AiSocialDigestModal({
  open,
  onClose,
  drawCode,
  drawDate,
}: AiSocialDigestModalProps) {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [digest, setDigest] = useState<SocialMediaDigest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      loadDigest();
    }
  }, [open, drawCode, drawDate]);

  const loadDigest = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = drawCode
        ? `/api/ai/digest?code=${drawCode}&date=${drawDate || ""}`
        : `/api/ai/digest`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.digest) {
        setDigest(data.digest);
      } else {
        throw new Error(data.error || "Failed to generate AI digest.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load social digest.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const shareToWhatsApp = (text: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToTelegram = (text: string) => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent("https://www.keralalotteryresultstoday.in")}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const playVoiceScript = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ml-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#0B3C5D",
          color: "#FFF",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: "#FFD700" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            AI Daily WhatsApp & Telegram Digest
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#FFF" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ p: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress sx={{ color: "#0B3C5D" }} />
            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 700 }}>
              Gemini AI generating daily viral social share templates...
            </Typography>
          </Box>
        ) : errorMsg ? (
          <Alert severity="error" sx={{ my: 2, borderRadius: "10px" }}>
            {errorMsg}
          </Alert>
        ) : digest ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Platform Tabs */}
            <Tabs
              value={currentTab}
              onChange={(_, val) => setCurrentTab(val)}
              variant="fullWidth"
              sx={{
                borderBottom: "1px solid #E2E8F0",
                "& .MuiTab-root": { fontWeight: 800, textTransform: "none" },
              }}
            >
              <Tab icon={<WhatsAppIcon sx={{ color: "#25D366" }} />} iconPosition="start" label="WhatsApp (മലയാളം)" />
              <Tab icon={<WhatsAppIcon sx={{ color: "#25D366" }} />} iconPosition="start" label="WhatsApp (English)" />
              <Tab icon={<TelegramIcon sx={{ color: "#0088cc" }} />} iconPosition="start" label="Telegram Post" />
            </Tabs>

            {/* Tab 0: WhatsApp Malayalam */}
            {currentTab === 0 && (
              <Box sx={{ pt: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: "#E7F8EE",
                    border: "1px solid #A7F3D0",
                    borderRadius: "14px",
                    whiteSpace: "pre-line",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "#064E3B",
                    maxHeight: 250,
                    overflowY: "auto",
                    mb: 2,
                  }}
                >
                  {digest.whatsapp_malayalam}
                </Paper>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    onClick={() => shareToWhatsApp(digest.whatsapp_malayalam)}
                    sx={{ bgcolor: "#25D366", color: "#FFF", fontWeight: 800, "&:hover": { bgcolor: "#1EBE5D" } }}
                  >
                    Share to WhatsApp Status
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={copiedKey === "wa_ml" ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                    onClick={() => handleCopy(digest.whatsapp_malayalam, "wa_ml")}
                    sx={{ fontWeight: 700 }}
                  >
                    {copiedKey === "wa_ml" ? "Copied!" : "Copy"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Tab 1: WhatsApp English */}
            {currentTab === 1 && (
              <Box sx={{ pt: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    whiteSpace: "pre-line",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "#1E293B",
                    maxHeight: 250,
                    overflowY: "auto",
                    mb: 2,
                  }}
                >
                  {digest.whatsapp_english}
                </Paper>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    onClick={() => shareToWhatsApp(digest.whatsapp_english)}
                    sx={{ bgcolor: "#25D366", color: "#FFF", fontWeight: 800, "&:hover": { bgcolor: "#1EBE5D" } }}
                  >
                    Share to WhatsApp
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={copiedKey === "wa_en" ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                    onClick={() => handleCopy(digest.whatsapp_english, "wa_en")}
                    sx={{ fontWeight: 700 }}
                  >
                    {copiedKey === "wa_en" ? "Copied!" : "Copy"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Tab 2: Telegram Post */}
            {currentTab === 2 && (
              <Box sx={{ pt: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: "#F0F9FF",
                    border: "1px solid #BAE6FD",
                    borderRadius: "14px",
                    whiteSpace: "pre-line",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "#0369A1",
                    maxHeight: 250,
                    overflowY: "auto",
                    mb: 2,
                  }}
                >
                  {digest.telegram_post}
                </Paper>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<TelegramIcon />}
                    onClick={() => shareToTelegram(digest.telegram_post)}
                    sx={{ bgcolor: "#0088cc", color: "#FFF", fontWeight: 800, "&:hover": { bgcolor: "#0077b5" } }}
                  >
                    Broadcast to Telegram Channel
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={copiedKey === "tg" ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                    onClick={() => handleCopy(digest.telegram_post, "tg")}
                    sx={{ fontWeight: 700 }}
                  >
                    {copiedKey === "tg" ? "Copied!" : "Copy"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Audio Voice Script preview */}
            {digest.short_audio_script_ml && (
              <Box sx={{ mt: 1, p: 2, bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#92400E" }}>
                    🎙️ 15-Second Audio Podcast Script (മലയാളം):
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<VolumeUpIcon />}
                    onClick={() => playVoiceScript(digest.short_audio_script_ml)}
                    sx={{ textTransform: "none", fontWeight: 700, color: "#92400E" }}
                  >
                    Listen Audio
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: "#78350F", mt: 0.5, fontStyle: "italic" }}>
                  &ldquo;{digest.short_audio_script_ml}&rdquo;
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: "#64748B" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
