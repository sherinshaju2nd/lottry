"use client";

import React, { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IosShareIcon from "@mui/icons-material/IosShare";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import { AppleIcon } from "./DownloadAppModal";

interface IosInstallGuideModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function IosInstallGuideModal({
  open: controlledOpen,
  onClose: controlledOnClose,
}: IosInstallGuideModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Video Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Allow both controlled prop and global event bus
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    const handleOpenEvent = () => {
      setInternalOpen(true);
    };

    window.addEventListener("open-ios-install-guide", handleOpenEvent);
    return () => {
      window.removeEventListener("open-ios-install-guide", handleOpenEvent);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: "24px", sm: "28px" },
            p: { xs: 2.5, sm: 3.5 },
            background: "linear-gradient(160deg, #090D16 0%, #0F172A 100%)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.7)",
            position: "relative",
            overflow: "hidden",
            maxHeight: "92vh",
          },
        },
      }}
    >
      {/* Decorative Ambient Glows */}
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129, 140, 248, 0.12) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        size="small"
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "#94A3B8",
          bgcolor: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)", color: "#FFFFFF" },
          zIndex: 5,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: { xs: 0.5, sm: 1 }, zIndex: 1 }}>
        {/* Header with App Title & Badges */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<AppleIcon size={16} />}
              label="iPhone & iPad (iOS)"
              size="small"
              sx={{
                bgcolor: "rgba(56, 189, 248, 0.12)",
                color: "#38BDF8",
                fontWeight: 800,
                fontSize: "0.75rem",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            />
            <Chip
              icon={<ShieldOutlinedIcon sx={{ "&&": { color: "#34D399", fontSize: 14 } }} />}
              label="0 MB Storage • 1-Tap Access"
              size="small"
              sx={{
                bgcolor: "rgba(52, 211, 153, 0.1)",
                color: "#A7F3D0",
                fontWeight: 700,
                fontSize: "0.75rem",
                border: "1px solid rgba(52, 211, 153, 0.2)",
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.4rem", sm: "1.8rem" },
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            How to Install on iPhone / iPad
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#94A3B8",
              fontSize: "0.875rem",
              maxWidth: 520,
              mx: "auto",
            }}
          >
            Watch the video or follow the 3 quick steps below in <strong>Safari</strong> to add the app icon to your home screen.
          </Typography>
        </Box>

        {/* 2-Column Responsive Layout: Left Steps & Right Video */}
        <Grid container spacing={3} sx={{ alignItems: "center", mb: 3 }}>
          {/* Left Column: 3 Step Cards */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Step 1 */}
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "16px",
                  p: 2,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.8,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.07)",
                    borderColor: "rgba(56, 189, 248, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38BDF8",
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    flexShrink: 0,
                  }}
                >
                  1
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.925rem" }}>
                      Tap Share (📤) in Safari
                    </Typography>
                    <IosShareIcon sx={{ fontSize: 16, color: "#38BDF8" }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.825rem", lineHeight: 1.5 }}>
                    Open in Safari and tap the <strong>Share</strong> button (📤) in the bottom bar.
                  </Typography>
                </Box>
              </Box>

              {/* Step 2 */}
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "16px",
                  p: 2,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.8,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.07)",
                    borderColor: "rgba(129, 140, 248, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(129, 140, 248, 0.15)",
                    border: "1px solid rgba(129, 140, 248, 0.3)",
                    color: "#818CF8",
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    flexShrink: 0,
                  }}
                >
                  2
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.925rem" }}>
                      Select &quot;Add to Home Screen&quot;
                    </Typography>
                    <AddBoxOutlinedIcon sx={{ fontSize: 16, color: "#818CF8" }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.825rem", lineHeight: 1.5 }}>
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot; (ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക)</strong>.
                  </Typography>
                </Box>
              </Box>

              {/* Step 3 */}
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "16px",
                  p: 2,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.8,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.07)",
                    borderColor: "rgba(52, 211, 153, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(52, 211, 153, 0.15)",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    color: "#34D399",
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    flexShrink: 0,
                  }}
                >
                  3
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.925rem" }}>
                      Tap &quot;Add&quot; in Top-Right
                    </Typography>
                    <CheckCircleIcon sx={{ fontSize: 16, color: "#34D399" }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.825rem", lineHeight: 1.5 }}>
                    Tap <strong>&quot;Add&quot;</strong> in the top-right corner. The app icon appears instantly on your iPhone!
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Micro Feature Highlights */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              <Chip
                icon={<CheckCircleIcon sx={{ "&&": { color: "#38BDF8", fontSize: 14 } }} />}
                label="Instant 3 PM Live Sync"
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontSize: "0.75rem", fontWeight: 700 }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ "&&": { color: "#38BDF8", fontSize: 14 } }} />}
                label="Full-Screen Web App"
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontSize: "0.75rem", fontWeight: 700 }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ "&&": { color: "#38BDF8", fontSize: 14 } }} />}
                label="0 MB Storage Used"
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontSize: "0.75rem", fontWeight: 700 }}
              />
            </Box>
          </Grid>

          {/* Right Column: Embedded iPhone Video Player */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box
                sx={{
                  width: { xs: 220, sm: 240 },
                  borderRadius: "36px",
                  p: "8px",
                  bgcolor: "#1E293B",
                  border: "2px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Dynamic Island Notch */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 70,
                    height: 14,
                    borderRadius: "10px",
                    bgcolor: "#000000",
                    zIndex: 10,
                  }}
                />

                {/* Video */}
                <Box
                  sx={{
                    borderRadius: "28px",
                    overflow: "hidden",
                    position: "relative",
                    bgcolor: "#000000",
                    aspectRatio: "9/19.5",
                    width: "100%",
                  }}
                >
                  <video
                    ref={videoRef}
                    src="/ios-install-steps.mp4"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* Video Overlay Controls */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      p: 0.4,
                      borderRadius: "100px",
                      bgcolor: "rgba(15, 23, 42, 0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      zIndex: 5,
                    }}
                  >
                    <Tooltip title={isPlaying ? "Pause" : "Play"}>
                      <IconButton
                        size="small"
                        onClick={togglePlay}
                        sx={{ color: "#FFFFFF", p: 0.4, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
                      >
                        {isPlaying ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Replay">
                      <IconButton
                        size="small"
                        onClick={restartVideo}
                        sx={{ color: "#FFFFFF", p: 0.4, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
                      >
                        <ReplayIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                      <IconButton
                        size="small"
                        onClick={toggleMute}
                        sx={{ color: "#FFFFFF", p: 0.4, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
                      >
                        {isMuted ? <VolumeOffIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  mt: 1,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                ▶ 3-Step Visual Video Guide
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Done Action Button (Modern Glass Pill Style) */}
        <Button
          onClick={handleClose}
          variant="contained"
          fullWidth
          sx={{
            background: "linear-gradient(135deg, #0078D7 0%, #005A9E 100%)",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.95rem",
            py: 1.3,
            borderRadius: "14px",
            textTransform: "none",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 10px 24px rgba(0, 120, 215, 0.35)",
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #0086F0 0%, #0066B3 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 14px 30px rgba(0, 120, 215, 0.45)",
            },
          }}
        >
          Got It! I&apos;ll Add to Home Screen
        </Button>
      </DialogContent>
    </Dialog>
  );
}
