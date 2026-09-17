"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LaptopWindowsIcon from "@mui/icons-material/LaptopWindows";
import GetAppIcon from "@mui/icons-material/GetApp";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BoltIcon from "@mui/icons-material/Bolt";
import { WindowsIcon } from "./DownloadAppModal";

interface WindowsInstallGuideModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function WindowsInstallGuideModal({
  open: controlledOpen,
  onClose: controlledOnClose,
}: WindowsInstallGuideModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [canPromptDirectly, setCanPromptDirectly] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

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
    const checkPrompt = () => {
      if (typeof window !== "undefined") {
        const hasPrompt = Boolean(
          (window as unknown as { deferredPwaPrompt?: { prompt: () => Promise<void> } }).deferredPwaPrompt
        );
        setCanPromptDirectly(hasPrompt);
      }
    };

    checkPrompt();

    const handleOpenEvent = () => {
      setInternalOpen(true);
      checkPrompt();
    };

    const handlePwaReady = () => {
      setCanPromptDirectly(true);
    };

    window.addEventListener("open-windows-install-guide", handleOpenEvent);
    window.addEventListener("pwa-install-ready", handlePwaReady);
    return () => {
      window.removeEventListener("open-windows-install-guide", handleOpenEvent);
      window.removeEventListener("pwa-install-ready", handlePwaReady);
    };
  }, []);

  const handleDirectInstall = async () => {
    if (typeof window === "undefined") return;
    const win = window as unknown as {
      deferredPwaPrompt?: {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
      };
    };

    if (win.deferredPwaPrompt) {
      try {
        await win.deferredPwaPrompt.prompt();
        const choice = await win.deferredPwaPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstallSuccess(true);
          win.deferredPwaPrompt = undefined;
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      } catch (err) {
        console.warn("PWA prompt error:", err);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: "20px", sm: "24px" },
            p: { xs: 2, sm: 3 },
            background: "linear-gradient(160deg, #0A2540 0%, #0F172A 100%)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6)",
            position: "relative",
            overflow: "hidden",
            maxHeight: "92vh",
          },
        },
      }}
    >
      {/* Decorative Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 164, 239, 0.25) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <IconButton
        onClick={handleClose}
        size="small"
        sx={{
          position: "absolute",
          right: 14,
          top: 14,
          color: "#94A3B8",
          bgcolor: "rgba(255, 255, 255, 0.08)",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)", color: "#FFFFFF" },
          zIndex: 3,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: { xs: 0.5, sm: 1 }, zIndex: 1 }}>
        {/* Header with App Icon */}
        <Box sx={{ textAlign: "center", mt: 1, mb: 2.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 0.75,
              borderRadius: "22px",
              bgcolor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
              mb: 1.5,
            }}
          >
            <Box
              component="img"
              src="/logo-round-192.png"
              alt="Kerala Lottery Logo"
              sx={{ width: 64, height: 64, borderRadius: "18px" }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1 }}>
            <Chip
              icon={<WindowsIcon size={16} />}
              label="Windows 10 / 11 PC"
              size="small"
              sx={{
                bgcolor: "rgba(0, 164, 239, 0.2)",
                color: "#38BDF8",
                fontWeight: 800,
                fontSize: "0.75rem",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            />
            <Chip
              label="Standalone Desktop App"
              size="small"
              sx={{
                bgcolor: "#10B981",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Install on Windows PC
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#38BDF8",
              fontWeight: 700,
              mt: 0.5,
              fontSize: "0.875rem",
            }}
          >
            വിൻഡോസ് കമ്പ്യൂട്ടറിൽ ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള വഴികൾ
          </Typography>
        </Box>

        {/* Direct One-Click Install Banner (if prompt available) */}
        {canPromptDirectly && !installSuccess && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0078D7 0%, #005A9E 100%)",
              border: "1px solid #60A5FA",
              boxShadow: "0 8px 24px rgba(0, 120, 215, 0.4)",
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", mb: 0.5 }}>
              ⚡ 1-Click Direct Installation Available!
            </Typography>
            <Typography variant="caption" sx={{ color: "#E0F2FE", display: "block", mb: 1.5 }}>
              Click below to install the official desktop app directly to your Windows PC taskbar and desktop.
            </Typography>
            <Button
              onClick={handleDirectInstall}
              variant="contained"
              fullWidth
              startIcon={<GetAppIcon />}
              sx={{
                bgcolor: "#10B981",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: "0.95rem",
                py: 1.2,
                borderRadius: "12px",
                textTransform: "none",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              Install App on Windows Now
            </Button>
          </Box>
        )}

        {installSuccess && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: "16px",
              bgcolor: "#065F46",
              border: "1px solid #10B981",
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
              🎉 App Installed Successfully!
            </Typography>
            <Typography variant="caption" sx={{ color: "#D1FAE5" }}>
              You can now launch Kerala Lottery Results Today directly from your Windows Desktop or Start Menu.
            </Typography>
          </Box>
        )}

        {/* 3 Step Cards for Chrome / Edge on Windows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
          {/* Step 1 */}
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              p: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
                borderColor: "#38BDF8",
              },
            }}
          >
            <Box
              sx={{
                bgcolor: "#0284C7",
                color: "#FFFFFF",
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              1
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}>
                  Click Install Icon in Address Bar
                </Typography>
                <Box
                  sx={{
                    bgcolor: "rgba(56, 189, 248, 0.2)",
                    color: "#38BDF8",
                    p: 0.4,
                    borderRadius: "6px",
                    display: "inline-flex",
                  }}
                >
                  <DesktopWindowsIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.825rem", lineHeight: 1.5 }}>
                Google Chrome അല്ലെങ്കിൽ Microsoft Edge അഡ്രസ് ബാറിന്റെ വലതുവശത്തുള്ള <strong>Install App icon (🖥️ ➕)</strong> ക്ലിക്ക് ചെയ്യുക.
              </Typography>
            </Box>
          </Box>

          {/* Step 2 */}
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              p: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
                borderColor: "#10B981",
              },
            }}
          >
            <Box
              sx={{
                bgcolor: "#10B981",
                color: "#FFFFFF",
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              2
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}>
                  Or Click Browser Menu (⋮ or ...)
                </Typography>
                <Box
                  sx={{
                    bgcolor: "rgba(16, 185, 129, 0.2)",
                    color: "#34D399",
                    p: 0.4,
                    borderRadius: "6px",
                    display: "inline-flex",
                  }}
                >
                  <MoreVertIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.825rem", lineHeight: 1.5 }}>
                ബ്രൗസർ മെനുവിൽ നിന്ന് <strong>&quot;Install Kerala Lottery Results&quot;</strong> അല്ലെങ്കിൽ <strong>&quot;Apps &gt; Install this site as an app&quot;</strong> തിരഞ്ഞെടുക്കുക.
              </Typography>
            </Box>
          </Box>

          {/* Step 3 */}
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              p: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
                borderColor: "#F59E0B",
              },
            }}
          >
            <Box
              sx={{
                bgcolor: "#D97706",
                color: "#FFFFFF",
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              3
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem", mb: 0.5 }}>
                Click &quot;Install&quot; &amp; Pin to Taskbar
              </Typography>
              <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.825rem", lineHeight: 1.5 }}>
                <strong>&quot;Install&quot;</strong> അമർത്തുക. ആപ്പ് നിങ്ങളുടെ Windows Desktop &amp; Taskbar-ലേക്ക് ചേർക്കപ്പെടും.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Benefits Grid */}
        <Box
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.25)",
            borderRadius: "14px",
            p: 1.75,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            mb: 2.5,
          }}
        >
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.75rem" }}>
                  Instant 3 PM Live Sync
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.75rem" }}>
                  Standalone Windows Window
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.75rem" }}>
                  Zero Disk Storage
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.75rem" }}>
                  Taskbar &amp; Start Menu Pin
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Bottom Done Button */}
        <Button
          onClick={handleClose}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#0078D7",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.95rem",
            py: 1.2,
            borderRadius: "12px",
            textTransform: "none",
            boxShadow: "0 8px 20px rgba(0, 120, 215, 0.35)",
            "&:hover": { bgcolor: "#005A9E" },
          }}
        >
          Got It! I&apos;ll Install on Windows
        </Button>
      </DialogContent>
    </Dialog>
  );
}
