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

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const CATEGORY_SUGGESTIONS = [
  {
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />,
    label: "ഇന്നത്തെ 1st Prize Winner",
    query: "ഇന്നത്തെ ലോട്ടറിയുടെ ഒന്നാം സമ്മാനം ഏത് നമ്പറിനാണ്? സമ്മാനത്തുക എത്രയാണ്?",
  },
  {
    icon: <AccountBalanceWalletRoundedIcon sx={{ fontSize: 16 }} />,
    label: "സമ്മാനം ക്ലെയിം ചെയ്യേണ്ട വിധം",
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
];

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"ml-IN" | "en-IN">("ml-IN");
  const [wasVoiceInput, setWasVoiceInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = selectedLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedLang]);

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const startListening = useCallback(() => {
    stopAudio();
    if (!recognitionRef.current) {
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
      } else {
        alert("Voice recognition is not supported in this browser. Please type your query.");
        return;
      }
    }

    try {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMsg(transcript);
          setWasVoiceInput(true);
          sendMessage(transcript, true);
        }
        setIsListening(false);
      };
      recognitionRef.current.onerror = (e: any) => {
        console.warn("Speech error:", e);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [selectedLang]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

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
        }, 300);
      }
    };

    window.addEventListener("open-ai-voice-assistant", handleGlobalTrigger);
    return () => {
      window.removeEventListener("open-ai-voice-assistant", handleGlobalTrigger);
    };
  }, [startListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: "model",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Auto-speak response if query was initiated via voice!
        if (isVoice || wasVoiceInput) {
          speakText(data.reply);
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
        text: "ചാറ്റ് ക്ലിയർ ചെയ്തു. മൈക്ക് അമർത്തി സംസാരിക്കൂ. (Chat cleared. Tap mic to speak.)",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCloseModal = () => {
    stopAudio();
    stopListening();
    setOpen(false);
  };

  return (
    <>
      {/* Premium Floating Launcher Bar & Floating Action Button */}
      <Tooltip title="Kerala Lottery AI Voice Assistant (മലയാളം & English)" placement="left" arrow>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: { xs: 85, md: 36 },
            right: { xs: 20, md: 32 },
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#0B3C5D",
            background: "linear-gradient(135deg, #0B3C5D 0%, #172554 50%, #0F172A 100%)",
            color: "#FFFFFF",
            p: { xs: "7px 16px", md: "9px 20px" },
            borderRadius: "50px",
            boxShadow: "0 10px 30px rgba(11, 60, 93, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) inset",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              transform: "translateY(-4px) scale(1.03)",
              boxShadow: "0 14px 40px rgba(11, 60, 93, 0.6), 0 0 16px rgba(245, 158, 11, 0.4)",
            },
          }}
        >
          {/* Glowing AI Icon with pulsing status dot */}
          <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
            <AutoAwesomeIcon
              sx={{
                color: "#FBBF24",
                fontSize: { xs: 22, md: 24 },
                filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))",
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

          <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.825rem", lineHeight: 1.1, color: "#FFFFFF" }}>
              Ask Lottery AI
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "#93C5FD", fontWeight: 600 }}>
              മലയാളം & English
            </Typography>
          </Box>
        </Box>
      </Tooltip>

      {/* Voice Assistant Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: "20px", sm: "24px" },
              height: { xs: "90vh", sm: "82vh" },
              maxHeight: 720,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "#F8FAFC",
              boxShadow: "0 25px 60px -15px rgba(11, 60, 93, 0.35)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            },
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 0,
            bgcolor: "#0B3C5D",
            background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #0F172A 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              p: { xs: "14px 18px", sm: "16px 22px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* AI Avatar & Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: isListening ? "#DC2626" : "rgba(255, 255, 255, 0.12)",
                  border: isListening ? "2px solid #FEF08A" : "1.5px solid rgba(251, 191, 36, 0.6)",
                  boxShadow: isListening ? "0 0 16px #DC2626" : "0 0 14px rgba(251, 191, 36, 0.25)",
                  width: 44,
                  height: 44,
                  transition: "all 0.3s",
                }}
              >
                {isListening ? (
                  <MicIcon sx={{ color: "#FFF", fontSize: 24 }} />
                ) : (
                  <AutoAwesomeIcon sx={{ color: "#FBBF24", fontSize: 22 }} />
                )}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: { xs: "0.95rem", sm: "1.05rem" }, letterSpacing: "-0.01em" }}>
                    Kerala Lottery Voice AI
                  </Typography>
                  <Chip
                    label="Gemini 3.6"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor: "rgba(251, 191, 36, 0.18)",
                      color: "#FDE68A",
                      border: "1px solid rgba(251, 191, 36, 0.4)",
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "#93C5FD", display: "flex", alignItems: "center", gap: 0.6, fontWeight: 600 }}>
                  <Box component="span" sx={{ width: 6, height: 6, bgcolor: isListening ? "#EF4444" : "#34D399", borderRadius: "50%", display: "inline-block" }} />
                  {isListening ? "Listening (സംസാരിക്കൂ...)" : isPlayingAudio ? "Speaking Audio..." : "Direct Voice & Chat • മലയാളം"}
                </Typography>
              </Box>
            </Box>

            {/* Language Toggle & Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Chip
                label={selectedLang === "ml-IN" ? "മലയാളം" : "English"}
                onClick={() => setSelectedLang(selectedLang === "ml-IN" ? "en-IN" : "ml-IN")}
                sx={{
                  bgcolor: "rgba(255,255,255,0.12)",
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                }}
              />
              <Tooltip title="Clear chat">
                <IconButton onClick={handleClearHistory} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#FFF" } }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleCloseModal} size="small" sx={{ color: "rgba(255,255,255,0.85)", "&:hover": { color: "#FFF" } }}>
                <CloseRoundedIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        {/* Chat Stream */}
        <DialogContent
          sx={{
            flex: 1,
            p: { xs: 2, sm: 2.5 },
            bgcolor: "#F8FAFC",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {/* Active Listening Animated Banner */}
          {isListening && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "#FEF2F2",
                border: "2px solid #F87171",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                animation: "pulse 1.5s infinite",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MicIcon sx={{ color: "#DC2626", fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#991B1B" }}>
                    Listening... ഇപ്പോൾ ചോദിക്കൂ...
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#B91C1C", fontWeight: 600 }}>
                    Speak your question in Malayalam or English clearly
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                onClick={stopListening}
                variant="contained"
                sx={{ bgcolor: "#DC2626", color: "#FFF", fontWeight: 800, textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#B91C1C" } }}
              >
                Stop
              </Button>
            </Paper>
          )}

          {/* Quick Suggestions */}
          {!isListening && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, display: "block", mb: 1, textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                Suggested Voice Questions / ചോദ്യങ്ങൾ:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {CATEGORY_SUGGESTIONS.map((item, idx) => (
                  <Chip
                    key={idx}
                    icon={item.icon}
                    label={item.label}
                    size="small"
                    onClick={() => {
                      setInputMsg(item.query);
                      sendMessage(item.query);
                    }}
                    sx={{
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: "#334155",
                      cursor: "pointer",
                      py: 1.8,
                      borderRadius: "10px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#EFF6FF",
                        borderColor: "#93C5FD",
                        color: "#0B3C5D",
                        transform: "translateY(-1px)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Messages Stream */}
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
                gap: 0.5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: "12px 16px", sm: "14px 18px" },
                  borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                  bgcolor: m.role === "user" ? "#0B3C5D" : "#FFFFFF",
                  color: m.role === "user" ? "#FFFFFF" : "#1E293B",
                  border: m.role === "user" ? "none" : "1px solid #E2E8F0",
                  maxWidth: { xs: "90%", sm: "85%" },
                  boxShadow: m.role === "user"
                    ? "0 4px 14px rgba(11, 60, 93, 0.25)"
                    : "0 2px 8px rgba(0,0,0,0.03)",
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-line",
                    lineHeight: 1.65,
                    fontSize: { xs: "0.875rem", sm: "0.925rem" },
                    fontWeight: m.role === "user" ? 600 : 450,
                  }}
                >
                  {m.text}
                </Typography>

                {/* AI Message Actions */}
                {m.role === "model" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 1.2,
                      pt: 0.8,
                      borderTop: "1px solid #F1F5F9",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.68rem" }}>
                      {m.timestamp}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title={isPlayingAudio ? "Stop Audio" : "Listen in Malayalam"}>
                        <IconButton
                          size="small"
                          onClick={() => (isPlayingAudio ? stopAudio() : speakText(m.text))}
                          sx={{ color: isPlayingAudio ? "#EF4444" : "#64748B", p: 0.5 }}
                        >
                          {isPlayingAudio ? (
                            <StopCircleRoundedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <VolumeUpRoundedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={copiedId === m.id ? "Copied!" : "Copy text"}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyText(m.text, m.id)}
                          sx={{ color: copiedId === m.id ? "#10B981" : "#64748B", p: 0.5 }}
                        >
                          {copiedId === m.id ? (
                            <CheckRoundedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          ))}

          {/* Thinking Animation */}
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  p: "12px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CircularProgress size={16} sx={{ color: "#0B3C5D" }} />
                <Typography variant="caption" sx={{ color: "#0B3C5D", fontWeight: 700 }}>
                  Gemini 3.6 AI analyzing lottery database...
                </Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </DialogContent>

        {/* Direct Voice & Text Input Dock */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: "#FFFFFF",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          {/* Direct Big Mic Button */}
          <Tooltip title={isListening ? "Listening... (Tap to stop)" : "Direct Voice Speak (സംസാരിക്കാൻ അമർത്തുക)"}>
            <IconButton
              onClick={toggleListening}
              sx={{
                width: 48,
                height: 48,
                bgcolor: isListening ? "#DC2626" : "#FEF2F2",
                color: isListening ? "#FFFFFF" : "#DC2626",
                border: isListening ? "2px solid #991B1B" : "1.5px solid #FCA5A5",
                boxShadow: isListening ? "0 0 20px rgba(220, 38, 38, 0.6)" : "0 2px 8px rgba(220, 38, 38, 0.15)",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: isListening ? "#B91C1C" : "#FEE2E2",
                  transform: "scale(1.05)",
                },
              }}
            >
              {isListening ? <MicOffIcon fontSize="medium" /> : <MicIcon fontSize="medium" />}
            </IconButton>
          </Tooltip>

          {/* Text Input */}
          <TextField
            fullWidth
            size="small"
            placeholder={
              isListening
                ? "Listening... സംസാരിക്കൂ..."
                : selectedLang === "ml-IN"
                  ? "സംസാരിക്കാൻ മൈക്ക് അമർത്തുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക..."
                  : "Tap mic to speak or type query..."
            }
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            slotProps={{
              input: {
                sx: {
                  borderRadius: "30px",
                  bgcolor: "#F8FAFC",
                  fontSize: "0.9rem",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#94A3B8" },
                  "&.Mui-focused fieldset": { borderColor: "#0B3C5D" },
                },
              },
            }}
          />

          {/* Send Button */}
          <IconButton
            type="submit"
            disabled={!inputMsg.trim() || isLoading}
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#0B3C5D",
              color: "#FFFFFF",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(11, 60, 93, 0.25)",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "#07263b",
                transform: "scale(1.05)",
              },
              "&.Mui-disabled": {
                bgcolor: "#F1F5F9",
                color: "#94A3B8",
                boxShadow: "none",
              },
            }}
          >
            <SendRoundedIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Dialog>
    </>
  );
}
