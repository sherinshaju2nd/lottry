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
import TouchAppIcon from "@mui/icons-material/TouchApp";
import BoltIcon from "@mui/icons-material/Bolt";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IosShareIcon from "@mui/icons-material/IosShare";
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
            background: "linear-gradient(160deg, #0B3C5D 0%, #0F172A 100%)",
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
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)",
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
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(0,0,0,0) 70%)",
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
              icon={<AppleIcon size={16} />}
              label="iPhone & iPad (iOS)"
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <Chip
              label="1-Tap Web App"
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
            How to Install on iPhone / iPad
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
            ഐഫോണിൽ ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള 3 ലളിതമായ വഴികൾ
          </Typography>
        </Box>

        {/* 3 Step Cards */}
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
                  Tap the Share Button in Safari
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
                  <IosShareIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.825rem", lineHeight: 1.5 }}>
                Safari ബ്രൗസറിന്റെ താഴെയുള്ള (അല്ലെങ്കിൽ മുകളിലുള്ള) <strong>Share</strong> ചിഹ്നം ടാപ്പ് ചെയ്യുക.
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
                  Select &quot;Add to Home Screen&quot;
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
                  <AddBoxOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.825rem", lineHeight: 1.5 }}>
                താഴേക്ക് സ്ക്രോൾ ചെയ്ത് <strong>&quot;Add to Home Screen&quot;</strong> (ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക) എന്നത് തിരഞ്ഞെടുക്കുക.
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
                Tap &quot;Add&quot; in Top-Right
              </Typography>
              <Typography variant="body2" sx={{ color: "#CBD5E1", fontSize: "0.825rem", lineHeight: 1.5 }}>
                മുകളിൽ വലതുവശത്തുള്ള <strong>&quot;Add&quot;</strong> (ചേർക്കുക) ബട്ടൺ അമർത്തുക. ആപ്പ് നിങ്ങളുടെ ഹോം സ്ക്രീനിൽ ഐക്കണായി വരും!
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
                  Full-Screen Native UI
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.75rem" }}>
                  0 MB Storage Wasted
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.75rem" }}>
                  Official PDF & Scanner
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
            bgcolor: "#10B981",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.95rem",
            py: 1.2,
            borderRadius: "12px",
            textTransform: "none",
            boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
            "&:hover": { bgcolor: "#059669" },
          }}
        >
          Got It! I&apos;ll Add to Home Screen
        </Button>
      </DialogContent>
    </Dialog>
  );
}
