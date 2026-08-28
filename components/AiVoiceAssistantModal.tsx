"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  isVoice?: boolean;
  voiceDuration?: number;
}

const CATEGORY_SUGGESTIONS = [
  {
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />,
    label: "ഇന്നത്തെ 1st Prize Winner",
    query: "ഇന്നത്തെ ലോട്ടറിയുടെ ഒന്നാം സമ്മാനം ഏത് നമ്പറിനാണ്? സമ്മാനത്തുക എത്രയാണ്?",
  },
  {
    icon: <AccountBalanceWalletRoundedIcon sx={{ fontSize: 16 }} />,
    label: "സമ്മാനം ക്ലെയിം ചെയ്യുന്ന വിധം",
    query: "കേരള ലോട്ടറി സമ്മാനം എങ്ങനെ ക്ലെയിം ചെയ്യാം? എന്തൊക്കെ രേഖകൾ വേണം?",
  },
  {
    icon: <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />,
    label: "അടുത്ത ബംപർ ലോട്ടറി",
    query: "അടുത്ത കേരള ബംപർ ലോട്ടറി ഏതാണ്? നറുക്കെടുപ്പ് തീയതിയും ഒന്നാം സമ്മാനവും പറയൂ.",
  },
  {
    icon: <HelpOutlineRoundedIcon sx={{ fontSize: 16 }} />,
    label: "Tax TDS Rules (30%)",
    query: "What are the tax deductions and agent commission rules on Kerala Lottery winnings?",
  },
  {
    icon: <SearchRoundedIcon sx={{ fontSize: 16 }} />,
    label: "ടിക്കറ്റ് നമ്പർ പരിശോധിക്കുക",
    query: "കേരള ലോട്ടറി ടിക്കറ്റ് നമ്പർ ഓൺലൈനായി എങ്ങനെ പരിശോധിക്കാം?",
  },
  {
    icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />,
    label: "Live Draw Timing (3:00 PM)",
    query: "What time is the daily Kerala Lottery live draw conducted and where?",
  },
];

// Helper to format structured AI response with bold text and clean paragraphs
function FormattedMessageText({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split("\n");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <Box key={lIdx} sx={{ height: 6 }} />;
        }

        // Check if line is a bullet item
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const content = isBullet ? trimmed.replace(/^(\s*[-•*]\s*)/, "") : trimmed;

        // Parse markdown bold `**text**`
        const parts = content.split(/(\*\*[^*]+\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const boldText = part.slice(2, -2);
            return (
              <Box
                key={pIdx}
                component="span"
                sx={{
                  fontWeight: 800,
                  color: isUser ? "#FEF08A" : "#0F172A",
                }}
              >
                {boldText}
              </Box>
            );
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        });

        if (isBullet) {
          return (
            <Box
              key={lIdx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                pl: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: isUser ? "#93C5FD" : "#0B3C5D",
                  mt: "7px",
                  flexShrink: 0,
                }}
              />
              <Typography
                component="div"
                sx={{
                  fontSize: { xs: "0.86rem", sm: "0.91rem" },
                  lineHeight: 1.55,
                  color: isUser ? "#FFFFFF" : "#1E293B",
                  fontWeight: isUser ? 500 : 450,
                }}
              >
                {renderedLine}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography
            key={lIdx}
            sx={{
              fontSize: { xs: "0.86rem", sm: "0.91rem" },
              lineHeight: 1.58,
              color: isUser ? "#FFFFFF" : "#1E293B",
              fontWeight: isUser ? 500 : 450,
            }}
          >
            {renderedLine}
          </Typography>
        );
      })}
    </Box>
  );
}

export default function AiVoiceAssistantModal() {
  const [open, setOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "model",
      text: "നമസ്കാരം! ഞാൻ കേരള ലോട്ടറി AI അസിസ്റ്റന്റാണ്. മൈക്ക് അമർത്തി സംസാരിക്കൂ അല്ലെങ്കിൽ ചോദ്യങ്ങൾ ടൈപ്പ് ചെയ്യൂ.\n\n(Hello! Tap the microphone to speak or type your question in Malayalam or English.)",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"ml-IN" | "en-IN">("ml-IN");
  const [wasVoiceInput, setWasVoiceInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const stopAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
    }
  }, []);

  const speakText = useCallback(
    (text: string, msgId?: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        stopAudio();
        const cleanText = text.replace(/[*#_`]/g, "").trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = selectedLang;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        if (msgId) setPlayingMessageId(msgId);

        utterance.onend = () => setPlayingMessageId(null);
        utterance.onerror = () => setPlayingMessageId(null);
        window.speechSynthesis.speak(utterance);
      }
    },
    [selectedLang, stopAudio]
  );

  const stopListening = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setRecordingSeconds(0);
  }, []);

  const startListening = useCallback(() => {
    stopAudio();
    if (!recognitionRef.current) {
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
      } else {
        alert("Voice recognition is not supported in this browser. Please type your query in Malayalam or English.");
        return;
      }
    }

    try {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setRecordingSeconds(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMsg(transcript);
          setWasVoiceInput(true);
          sendMessage(transcript, true);
        }
        stopListening();
      };

      recognitionRef.current.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        stopListening();
      };

      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Recognition start failed:", err);
      stopListening();
    }
  }, [selectedLang, stopAudio, stopListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Listen for global custom events to open assistant and start voice directly
  useEffect(() => {
    const handleGlobalTrigger = (e: any) => {
      setOpen(true);
      if (e.detail?.startListening) {
        setTimeout(() => {
          startListening();
        }, 350);
      }
    };

    window.addEventListener("open-ai-voice-assistant", handleGlobalTrigger);
    return () => {
      window.removeEventListener("open-ai-voice-assistant", handleGlobalTrigger);
    };
  }, [startListening]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      stopAudio();
      stopListening();
    }
  }, [open, messages, isLoading, stopAudio, stopListening]);

  const sendMessage = async (textToSend?: string, isVoice: boolean = false) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || isLoading) return;

    stopListening();
    stopAudio();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice,
      voiceDuration: isVoice ? recordingSeconds || 3 : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsgId = `bot-${Date.now()}`;
        const botMsg: Message = {
          id: botMsgId,
          role: "model",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Auto-speak response if query was initiated via voice
        if (isVoice || wasVoiceInput) {
          speakText(data.reply, botMsgId);
          setWasVoiceInput(false);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: "model",
            text: data.error || "ക്ഷമിക്കണം, ഇപ്പോൾ സെർവറുമായി ബന്ധപ്പെടാൻ സാധിക്കുന്നില്ല. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "model",
          text: err?.message || "Connection error with Gemini AI service. Please check your network and retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleClearHistory = () => {
    stopAudio();
    stopListening();
    setMessages([
      {
        id: "initial",
        role: "model",
        text: "ചാറ്റ് ക്ലിയർ ചെയ്തു. മൈക്ക് അമർത്തി സംസാരിക്കൂ അല്ലെങ്കിൽ ചോദ്യങ്ങൾ ചോദിക്കൂ.\n\n(Chat cleared. Tap mic to speak or type your question.)",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCloseModal = () => {
    stopAudio();
    stopListening();
    setOpen(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* Premium Floating Launcher Bar & Action Button */}
      <Tooltip title="Kerala Lottery AI Voice Assistant (മലയാളം & English)" placement="left" arrow>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: { xs: 20, md: 32 },
            right: { xs: 16, md: 28 },
            zIndex: 1250,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#0B3C5D",
            background: "linear-gradient(135deg, #0B3C5D 0%, #172554 50%, #0F172A 100%)",
            color: "#FFFFFF",
            p: { xs: "8px 16px", md: "10px 20px" },
            borderRadius: "50px",
            boxShadow: "0 10px 30px rgba(11, 60, 93, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              transform: "translateY(-3px) scale(1.03)",
              boxShadow: "0 14px 40px rgba(11, 60, 93, 0.65), 0 0 18px rgba(245, 158, 11, 0.45)",
            },
          }}
        >
          {/* Glowing AI Icon with pulsing status dot */}
          <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
            <AutoAwesomeIcon
              sx={{
                color: "#FBBF24",
                fontSize: { xs: 20, md: 24 },
                filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.65))",
                animation: "spin 12s linear infinite",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                bgcolor: "#10B981",
                borderRadius: "50%",
                boxShadow: "0 0 8px #10B981",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "0.78rem", md: "0.85rem" },
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              Ask Lottery AI
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.62rem", md: "0.68rem" },
                color: "#93C5FD",
                fontWeight: 700,
              }}
            >
              മലയാളം & English
            </Typography>
          </Box>
        </Box>
      </Tooltip>

      {/* Voice Assistant Modal / Mobile Bottom Sheet */}
      <Dialog
        open={open}
        onClose={handleCloseModal}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
            },
          },
          paper: {
            sx: {
              m: { xs: 0, sm: 2 },
              position: { xs: "fixed", sm: "relative" },
              bottom: { xs: 0, sm: "auto" },
              width: "100%",
              maxWidth: { xs: "100%", sm: 560 },
              height: { xs: "92dvh", sm: "84vh" },
              maxHeight: { xs: "92dvh", sm: 740 },
              borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "#F8FAFC",
              boxShadow: "0 25px 60px -15px rgba(11, 60, 93, 0.4), 0 0 0 1px rgba(255,255,255,0.1)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            },
          },
        }}
      >
        {/* Mobile Drag Indicator + Top Header */}
        <DialogTitle
          sx={{
            p: 0,
            bgcolor: "#0B3C5D",
            background: "linear-gradient(135deg, #07263b 0%, #0B3C5D 50%, #0F172A 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            zIndex: 10,
            position: "relative",
          }}
        >
          {/* Mobile Bottom Sheet Pull Pill */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              justifyContent: "center",
              pt: 1,
              pb: 0.4,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 4,
                bgcolor: "rgba(255, 255, 255, 0.35)",
                borderRadius: "3px",
              }}
            />
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.5, sm: 1.8 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* AI Avatar & Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Avatar
                sx={{
                  bgcolor: isListening ? "#DC2626" : "rgba(255, 255, 255, 0.12)",
                  border: isListening ? "2px solid #FEF08A" : "1.5px solid rgba(251, 191, 36, 0.6)",
                  boxShadow: isListening
                    ? "0 0 16px rgba(220, 38, 38, 0.8)"
                    : "0 0 14px rgba(251, 191, 36, 0.25)",
                  width: { xs: 38, sm: 42 },
                  height: { xs: 38, sm: 42 },
                  transition: "all 0.3s",
                }}
              >
                {isListening ? (
                  <MicIcon sx={{ color: "#FFF", fontSize: { xs: 20, sm: 22 } }} />
                ) : (
                  <AutoAwesomeIcon sx={{ color: "#FBBF24", fontSize: { xs: 19, sm: 21 } }} />
                )}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "0.92rem", sm: "1.02rem" },
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      color: "#FFFFFF",
                    }}
                  >
                    Kerala Lottery AI
                  </Typography>
                  <Chip
                    label="Gemini 3.6"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      bgcolor: "rgba(251, 191, 36, 0.18)",
                      color: "#FDE68A",
                      border: "1px solid rgba(251, 191, 36, 0.45)",
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isListening ? "#FCA5A5" : "#93C5FD",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: isListening ? "#EF4444" : "#34D399",
                      borderRadius: "50%",
                      display: "inline-block",
                      boxShadow: isListening ? "0 0 8px #EF4444" : "0 0 6px #34D399",
                    }}
                  />
                  {isListening
                    ? "Listening... സംസാരിക്കൂ"
                    : playingMessageId
                    ? "Speaking audio..."
                    : "Voice & Chat Assistant"}
                </Typography>
              </Box>
            </Box>

            {/* Language Toggle & Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 0.8 } }}>
              {/* Segmented Language Switch */}
              <Box
                sx={{
                  display: "flex",
                  bgcolor: "rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  p: "2px",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <Button
                  size="small"
                  onClick={() => setSelectedLang("ml-IN")}
                  sx={{
                    minWidth: "auto",
                    px: { xs: 1, sm: 1.2 },
                    py: 0.2,
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    borderRadius: "14px",
                    textTransform: "none",
                    color: selectedLang === "ml-IN" ? "#0F172A" : "rgba(255,255,255,0.75)",
                    bgcolor: selectedLang === "ml-IN" ? "#FBBF24" : "transparent",
                    boxShadow: selectedLang === "ml-IN" ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                    "&:hover": {
                      bgcolor: selectedLang === "ml-IN" ? "#FBBF24" : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  മലയാളം
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedLang("en-IN")}
                  sx={{
                    minWidth: "auto",
                    px: { xs: 1, sm: 1.2 },
                    py: 0.2,
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    borderRadius: "14px",
                    textTransform: "none",
                    color: selectedLang === "en-IN" ? "#0F172A" : "rgba(255,255,255,0.75)",
                    bgcolor: selectedLang === "en-IN" ? "#FBBF24" : "transparent",
                    boxShadow: selectedLang === "en-IN" ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                    "&:hover": {
                      bgcolor: selectedLang === "en-IN" ? "#FBBF24" : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  EN
                </Button>
              </Box>

              <Tooltip title="Clear chat history">
                <IconButton
                  onClick={handleClearHistory}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    p: 0.7,
                    "&:hover": { color: "#FFF", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={handleCloseModal}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  p: 0.7,
                  "&:hover": { color: "#FFF", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        {/* Quick Suggestion Chips (Horizontal Swipeable Row) */}
        {!isListening && (
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid #E2E8F0",
              py: 1,
              px: { xs: 1.5, sm: 2 },
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflowX: "auto",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {CATEGORY_SUGGESTIONS.map((item, idx) => (
              <Chip
                key={idx}
                icon={React.cloneElement(item.icon, {
                  sx: { fontSize: 15, color: "#0B3C5D !important" },
                })}
                label={item.label}
                size="small"
                onClick={() => {
                  setInputMsg(item.query);
                  sendMessage(item.query);
                }}
                sx={{
                  bgcolor: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  color: "#334155",
                  cursor: "pointer",
                  py: 1.7,
                  px: 0.5,
                  borderRadius: "20px",
                  flexShrink: 0,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "#E0F2FE",
                    borderColor: "#38BDF8",
                    color: "#0369A1",
                    transform: "translateY(-1px)",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Chat Messages Stream */}
        <DialogContent
          sx={{
            flex: 1,
            p: { xs: 1.5, sm: 2 },
            bgcolor: "#F8FAFC",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            overflowY: "auto",
          }}
        >
          {/* Active Listening Animated Banner */}
          {isListening && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: "#FEF2F2",
                border: "1.5px solid #F87171",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                boxShadow: "0 4px 16px rgba(220, 38, 38, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "#DC2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 12px rgba(220, 38, 38, 0.5)",
                    animation: "pulse 1.2s infinite",
                  }}
                >
                  <MicIcon sx={{ color: "#FFFFFF", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: "#991B1B", fontSize: "0.85rem", lineHeight: 1.2 }}
                  >
                    Listening... ഇപ്പോൾ സംസാരിക്കൂ
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#B91C1C", fontWeight: 600, fontSize: "0.72rem" }}
                  >
                    Speak query in Malayalam or English ({formatTimer(recordingSeconds)})
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                onClick={stopListening}
                variant="contained"
                sx={{
                  bgcolor: "#DC2626",
                  color: "#FFF",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  borderRadius: "10px",
                  boxShadow: "none",
                  px: 1.8,
                  "&:hover": { bgcolor: "#B91C1C" },
                }}
              >
                Stop
              </Button>
            </Paper>
          )}

          {/* Messages Stream */}
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
                gap: 0.4,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: "12px 14px", sm: "14px 18px" },
                  borderRadius:
                    m.role === "user"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                  bgcolor: m.role === "user" ? "#0B3C5D" : "#FFFFFF",
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg, #0B3C5D 0%, #1E3A8A 100%)"
                      : "#FFFFFF",
                  color: m.role === "user" ? "#FFFFFF" : "#1E293B",
                  border: m.role === "user" ? "none" : "1px solid #E2E8F0",
                  maxWidth: { xs: "92%", sm: "85%" },
                  boxShadow:
                    m.role === "user"
                      ? "0 4px 14px rgba(11, 60, 93, 0.25)"
                      : "0 2px 10px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {/* Voice Note Header if initiated via voice */}
                {m.isVoice && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      pb: 0.8,
                      borderBottom: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "rgba(251, 191, 36, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MicIcon sx={{ color: "#FDE68A", fontSize: 15 }} />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "2px", height: 16 }}>
                      {[6, 12, 18, 10, 22, 14, 19, 9, 15, 23, 16, 11].map((h, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 2.5,
                            height: h * 0.7,
                            bgcolor: "#93C5FD",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        color: "#93C5FD",
                        ml: "auto",
                      }}
                    >
                      {m.voiceDuration ? `${m.voiceDuration}s voice` : "Voice"}
                    </Typography>
                  </Box>
                )}

                {/* Formatted Message Body */}
                <FormattedMessageText text={m.text} isUser={m.role === "user"} />

                {/* Footer with Timestamp and Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                    pt: 0.6,
                    borderTop:
                      m.role === "user"
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid #F1F5F9",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: m.role === "user" ? "#93C5FD" : "#94A3B8",
                      fontSize: "0.66rem",
                      fontWeight: 600,
                    }}
                  >
                    {m.timestamp}
                  </Typography>

                  {/* AI Message Action Buttons */}
                  {m.role === "model" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Tooltip
                        title={
                          playingMessageId === m.id
                            ? "Stop speaking"
                            : "Listen aloud in Malayalam / English"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            playingMessageId === m.id
                              ? stopAudio()
                              : speakText(m.text, m.id)
                          }
                          sx={{
                            color: playingMessageId === m.id ? "#DC2626" : "#64748B",
                            p: 0.5,
                            "&:hover": { color: "#0B3C5D", bgcolor: "#EFF6FF" },
                          }}
                        >
                          {playingMessageId === m.id ? (
                            <StopCircleRoundedIcon sx={{ fontSize: 18, color: "#DC2626" }} />
                          ) : (
                            <VolumeUpRoundedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={copiedId === m.id ? "Copied!" : "Copy message"}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyText(m.text, m.id)}
                          sx={{
                            color: copiedId === m.id ? "#10B981" : "#64748B",
                            p: 0.5,
                            "&:hover": { color: "#0B3C5D", bgcolor: "#EFF6FF" },
                          }}
                        >
                          {copiedId === m.id ? (
                            <CheckRoundedIcon sx={{ fontSize: 17, color: "#10B981" }} />
                          ) : (
                            <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          ))}

          {/* Thinking Animation */}
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 0.5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: "10px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <CircularProgress size={15} sx={{ color: "#0B3C5D" }} />
                <Typography variant="caption" sx={{ color: "#0B3C5D", fontWeight: 700, fontSize: "0.78rem" }}>
                  Gemini 3.6 AI analyzing lottery database...
                </Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </DialogContent>

        {/* Voice & Text Input Dock */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          sx={{
            p: { xs: 1.2, sm: 1.5 },
            bgcolor: "#FFFFFF",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {isListening ? (
            /* WhatsApp-style Active Voice Dock */
            <Box
              sx={{
                width: "100%",
                height: 48,
                bgcolor: "#FEF2F2",
                borderRadius: "28px",
                border: "1.5px solid #F87171",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1.2,
              }}
            >
              {/* Trash/Cancel Button */}
              <Tooltip title="Cancel recording">
                <IconButton
                  size="small"
                  onClick={stopListening}
                  sx={{
                    bgcolor: "#FEE2E2",
                    color: "#DC2626",
                    "&:hover": { bgcolor: "#FECACA" },
                  }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Pulsing Timer */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: "#DC2626",
                    boxShadow: "0 0 8px #DC2626",
                    animation: "pulse 1s infinite",
                  }}
                />
                <Typography sx={{ color: "#DC2626", fontWeight: 800, fontSize: "0.85rem", letterSpacing: 0.5 }}>
                  {formatTimer(recordingSeconds)}
                </Typography>
              </Box>

              {/* Animated Waveform Equalizer */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px", height: 22, mx: 1 }}>
                {[8, 16, 22, 12, 24, 18, 14, 20, 10, 24, 16, 12, 18, 8].map((h, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 2.5,
                      height: h,
                      bgcolor: "#DC2626",
                      borderRadius: 1,
                      animation: `pulse ${0.35 + (i % 5) * 0.12}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </Box>

              {/* Done/Send Button */}
              <Tooltip title="Send voice query">
                <IconButton
                  size="small"
                  onClick={stopListening}
                  sx={{
                    bgcolor: "#16A34A",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
                    "&:hover": { bgcolor: "#15803D" },
                  }}
                >
                  <SendRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            /* Normal Input Bar with Mic */
            <>
              <TextField
                fullWidth
                size="small"
                placeholder={
                  selectedLang === "ml-IN"
                    ? "ചോദിക്കാൻ മൈക്ക് അമർത്തുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക..."
                    : "Tap mic to speak or type query..."
                }
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={isLoading}
                variant="outlined"
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: "26px",
                      bgcolor: "#F8FAFC",
                      fontSize: { xs: "0.82rem", sm: "0.88rem" },
                      "& fieldset": { borderColor: "#E2E8F0" },
                      "&:hover fieldset": { borderColor: "#94A3B8" },
                      "&.Mui-focused fieldset": { borderColor: "#0B3C5D" },
                    },
                  },
                }}
              />

              {inputMsg.trim().length > 0 ? (
                <IconButton
                  type="submit"
                  disabled={isLoading}
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: "#0B3C5D",
                    color: "#FFFFFF",
                    borderRadius: "50%",
                    boxShadow: "0 4px 12px rgba(11, 60, 93, 0.25)",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "#07263b", transform: "scale(1.05)" },
                  }}
                >
                  <SendRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ) : (
                <Tooltip title="Tap to speak in Malayalam or English (സംസാരിക്കാൻ അമർത്തുക)">
                  <IconButton
                    onClick={toggleListening}
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "#DC2626",
                      color: "#FFFFFF",
                      borderRadius: "50%",
                      boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
                      transition: "all 0.2s",
                      flexShrink: 0,
                      "&:hover": { bgcolor: "#B91C1C", transform: "scale(1.05)" },
                    }}
                  >
                    <MicIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Paper>
      </Dialog>
    </>
  );
}
