"use client";

import React, { useEffect, useId, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import BoltIcon from "@mui/icons-material/Bolt";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import BlockIcon from "@mui/icons-material/Block";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { UPI_ID, getUpiPayUrl } from "@/lib/supportConfig";

const UPI_APPS = [
  { name: "GPay", color: "#4285F4" },
  { name: "PhonePe", color: "#A78BFA" },
  { name: "Paytm", color: "#38BDF8" },
  { name: "BHIM", color: "#FB923C" },
];

const SUPPORT_POINTS = [
  { icon: BoltIcon, text: "Fast 3:00 PM live results every day" },
  { icon: CloudQueueIcon, text: "സെർവർ, OCR, PDF ഹോസ്റ്റിംഗ് ചെലവുകൾ" },
  { icon: BlockIcon, text: "No paywalls, no annoying pop-ups" },
];

export default function SupportUsCard() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  // The card can render twice on the home page (modern + normal views), so ids must be unique.
  const titleId = `support-us-title-${useId()}`;

  useEffect(() => {
    let active = true;
    const generate = async () => {
      try {
        // No fixed amount: the supporter chooses it in their UPI app.
        const url = await QRCode.toDataURL(getUpiPayUrl(), {
          width: 320,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#0F172A", light: "#FFFFFF" },
        });
        if (active) setQrCodeUrl(url);
      } catch (err: unknown) {
        console.error("Support card UPI QR generation error:", err instanceof Error ? err.message : String(err));
      }
    };
    generate();
    return () => {
      active = false;
    };
  }, []);

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      console.error("Copy UPI ID failed:", err instanceof Error ? err.message : String(err));
      window.prompt("Copy this UPI ID:", UPI_ID);
    }
  };

  return (
    <Paper
      component="section"
      aria-labelledby={titleId}
      elevation={0}
      sx={{
        mt: 3,
        p: { xs: 2.5, sm: 3 },
        borderRadius: "20px",
        background: "linear-gradient(135deg, #090D16 0%, #0F172A 100%)",
        color: "#FFFFFF",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Ambient glow (matches the footer app-download banner) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-40%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 340,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(244, 63, 94, 0.18) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.75 }}>
          <FavoriteIcon sx={{ color: "#F43F5E", fontSize: 22 }} />
          <Typography
            id={titleId}
            component="h2"
            sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#FFFFFF" }}
          >
            Support Us
          </Typography>
        </Box>
        <Typography sx={{ color: "#94A3B8", fontSize: "0.86rem", lineHeight: 1.5, mb: 2 }}>
          Enjoying free Kerala lottery results? A small UPI tip helps us keep the service fast and
          better for everyone.
        </Typography>

        <Box sx={{ mx: "auto", mb: 1.5, width: 130 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static asset (transparent cutout) */}
          <img
            src="/support/support-us-cutout.webp"
            alt="Friendly man reaching out a hand, asking for a little support"
            width={320}
            height={282}
            loading="lazy"
            decoding="async"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </Box>

        {/* QR code */}
        <Box
          sx={{
            mx: "auto",
            width: 184,
            p: 1.25,
            bgcolor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          }}
        >
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL generated client-side
            <img
              src={qrCodeUrl}
              alt={`UPI QR code to support Kerala Lottery Results — pay ${UPI_ID} with GPay, PhonePe or Paytm`}
              width={160}
              height={160}
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          ) : (
            <Skeleton variant="rounded" width={160} height={160} sx={{ mx: "auto" }} />
          )}
        </Box>
        <Typography sx={{ color: "#CBD5E1", fontSize: "0.78rem", fontWeight: 700, mt: 1.25, mb: 1.25 }}>
          Scan with any UPI app
        </Typography>

        {/* UPI app pills */}
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0.75, mb: 2 }}>
          {UPI_APPS.map(({ name, color }) => (
            <Box
              key={name}
              sx={{
                px: 1.25,
                py: 0.4,
                borderRadius: "999px",
                fontSize: "0.74rem",
                fontWeight: 800,
                color,
                bgcolor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              {name}
            </Box>
          ))}
        </Box>

        {/* UPI ID + copy */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            pl: 1.5,
            pr: 0.5,
            py: 0.5,
            mb: 1.5,
            borderRadius: "12px",
            bgcolor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              color: "#E2E8F0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {UPI_ID}
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy UPI ID"}>
            <IconButton aria-label="Copy UPI ID" size="small" onClick={handleCopyUpi} sx={{ color: "#38BDF8" }}>
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Pay button (opens UPI app on phones) */}
        <Button
          component="a"
          href={getUpiPayUrl()}
          fullWidth
          sx={{
            py: 1.1,
            mb: 2,
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "0.9rem",
            textTransform: "none",
            color: "#FFFFFF",
            background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
            boxShadow: "0 6px 18px rgba(225, 29, 72, 0.35)",
            "&:hover": { background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" },
          }}
        >
          Pay with GPay / PhonePe
        </Button>

        {/* Why support */}
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mb: 2, textAlign: "left" }}>
          {SUPPORT_POINTS.map(({ icon: Icon, text }) => (
            <Box component="li" key={text} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.4 }}>
              <Icon sx={{ fontSize: 16, color: "#38BDF8" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#CBD5E1" }}>{text}</Typography>
            </Box>
          ))}
        </Box>

        <Button
          component={Link}
          href="/support"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "#94A3B8",
            "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255, 255, 255, 0.06)" },
          }}
        >
          More ways to support
        </Button>
      </Box>
    </Paper>
  );
}
