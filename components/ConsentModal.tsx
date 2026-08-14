"use client";

import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function ConsentModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the consent
    const isAccepted = localStorage.getItem("privacy_consent_accepted");
    if (isAccepted !== "true") {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("privacy_consent_accepted", "true");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing the modal on backdrop click or escape key press
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          return;
        }
      }}
      slotProps={{
        backdrop: {
          style: {
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
          },
        },
        paper: {
          sx: {
            borderRadius: "24px",
            p: { xs: 2.5, sm: 4 },
            maxWidth: "520px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "#EBF5FF",
            color: "#0B3C5D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 32 }} />
        </Box>

        <DialogTitle
          sx={{
            p: 0,
            textAlign: "center",
            fontWeight: 900,
            fontSize: "1.45rem",
            color: "#111827",
            lineHeight: 1.3,
          }}
        >
          Terms of Service &amp; Privacy Consent
        </DialogTitle>
      </Box>

      <DialogContent sx={{ p: 0, mb: 3 }}>
        <Typography
          variant="body2"
          sx={{
            color: "#4B5563",
            textAlign: "center",
            mb: 3,
            lineHeight: 1.6,
            fontSize: "0.925rem",
          }}
        >
          Welcome! Before accessing our live lottery results and ticket checker, please read and agree to our rules and data policies.
        </Typography>

        <Box
          sx={{
            bgcolor: "#F3F4F6",
            p: 2.25,
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <PrivacyTipIcon sx={{ color: "#D97706", fontSize: 20, mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1F2937" }}>
                Disclaimer &amp; Authenticity
              </Typography>
              <Typography variant="caption" sx={{ color: "#4B5563", display: "block", mt: 0.5, lineHeight: 1.5 }}>
                We are an unofficial informational website. Results are subject to sync delays. Always verify winning numbers with the official government gazette.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <VerifiedUserIcon sx={{ color: "#0B3C5D", fontSize: 20, mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1F2937" }}>
                Terms &amp; 18+ Access
              </Typography>
              <Typography variant="caption" sx={{ color: "#4B5563", display: "block", mt: 0.5, lineHeight: 1.5 }}>
                You must be 18 years or older to use this service. By checking tickets, you confirm you meet the age requirements.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "#6B7280",
            display: "block",
            textAlign: "center",
            mt: 3,
            lineHeight: 1.5,
          }}
        >
          By clicking &quot;Accept &amp; Agree&quot; below, you explicitly acknowledge that you have read and agree to our{" "}
          <Link
            href="/terms-conditions"
            onClick={handleAccept}
            style={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" }}
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            onClick={handleAccept}
            style={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" }}
          >
            Privacy Policy
          </Link>
          .
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 0, justifyContent: "stretch" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleAccept}
          sx={{
            bgcolor: "#0B3C5D",
            color: "#FFFFFF",
            fontWeight: 800,
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.95rem",
            boxShadow: "0 4px 12px rgba(11, 60, 93, 0.2)",
            "&:hover": {
              bgcolor: "#0F2C59",
            },
          }}
        >
          Accept &amp; Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
}
