"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";

interface ShareButtonsProps {
  title?: string;
  text?: string;
  url?: string;
  variant?: "compact" | "full" | "inline";
}

export default function ShareButtons({
  title = "Kerala Lottery Result Today - Live Results & Ticket Checker",
  text = "Check Kerala State Lottery live 3:10 PM results & search winning tickets instantly!",
  url,
  variant = "full",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url || "https://keralalotteryresultstoday.in");
  const [currentTitle, setCurrentTitle] = useState(title);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(url || window.location.href);
      if (title === "Kerala Lottery Result Today - Live Results & Ticket Checker") {
         setCurrentTitle(document.title || title);
      }
    }
  }, [url, title]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback
        const textField = document.createElement("textarea");
        textField.innerText = currentUrl;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand("copy");
        textField.remove();
      }
      setCopied(true);
      setToastOpen(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${text}\n${title}`,
          url: currentUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `📢 *${title}*\n${text}\n\n👉 Check live result now: ${currentUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    currentUrl
  )}&text=${encodeURIComponent(`📢 ${title}\n${text}`)}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    currentUrl
  )}&text=${encodeURIComponent(`📢 ${title}\n${text}`)}`;

  if (variant === "compact") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Share on WhatsApp">
          <IconButton
            component="a"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: "#25D366",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#1EBE5D" },
              width: 36,
              height: 36,
            }}
            size="small"
          >
            <WhatsAppIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share on Telegram">
          <IconButton
            component="a"
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: "#229ED9",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#1B87BA" },
              width: 36,
              height: 36,
            }}
            size="small"
          >
            <TelegramIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={copied ? "Copied!" : "Copy Link"}>
          <IconButton
            onClick={handleCopyLink}
            sx={{
              bgcolor: copied ? "#2E7D32" : "#F3F4F6",
              color: copied ? "#FFFFFF" : "#374151",
              border: "1px solid #E5E7EB",
              "&:hover": { bgcolor: copied ? "#1B5E20" : "#E5E7EB" },
              width: 36,
              height: 36,
            }}
            size="small"
          >
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Snackbar
          open={toastOpen}
          autoHideDuration={2500}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%", fontWeight: 700 }}>
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        p: { xs: 2, sm: 2.5 },
        mt: 3,
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShareIcon sx={{ color: "#0F5A24", fontSize: "1.3rem" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}
          >
            Share Today's Result With Friends & Groups
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "#6B7280", fontWeight: 600 }}
        >
          Click to share directly
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(6, 1fr)",
          },
          gap: 1.25,
        }}
      >
        {/* WhatsApp */}
        <Button
          component="a"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<WhatsAppIcon />}
          sx={{
            bgcolor: "#25D366",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.825rem",
            textTransform: "none",
            borderRadius: "10px",
            py: 1,
            boxShadow: "0 2px 6px rgba(37,211,102,0.25)",
            "&:hover": { bgcolor: "#1EBE5D" },
          }}
        >
          WhatsApp
        </Button>

        {/* Telegram */}
        <Button
          component="a"
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<TelegramIcon />}
          sx={{
            bgcolor: "#229ED9",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.825rem",
            textTransform: "none",
            borderRadius: "10px",
            py: 1,
            boxShadow: "0 2px 6px rgba(34,158,217,0.25)",
            "&:hover": { bgcolor: "#1B87BA" },
          }}
        >
          Telegram
        </Button>

        {/* Facebook */}
        <Button
          component="a"
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<FacebookIcon />}
          sx={{
            bgcolor: "#1877F2",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.825rem",
            textTransform: "none",
            borderRadius: "10px",
            py: 1,
            boxShadow: "0 2px 6px rgba(24,119,242,0.25)",
            "&:hover": { bgcolor: "#0C63D4" },
          }}
        >
          Facebook
        </Button>

        {/* X / Twitter */}
        <Button
          component="a"
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<XIcon />}
          sx={{
            bgcolor: "#000000",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.825rem",
            textTransform: "none",
            borderRadius: "10px",
            py: 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            "&:hover": { bgcolor: "#333333" },
          }}
        >
          X (Twitter)
        </Button>

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          sx={{
            bgcolor: copied ? "#2E7D32" : "#FFFFFF",
            color: copied ? "#FFFFFF" : "#374151",
            border: "1px solid #D1D5DB",
            fontWeight: 800,
            fontSize: "0.825rem",
            textTransform: "none",
            borderRadius: "10px",
            py: 1,
            "&:hover": { bgcolor: copied ? "#1B5E20" : "#F3F4F6" },
          }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </Button>

        {/* Native Web Share */}
        <Button
          onClick={handleNativeShare}
          startIcon={<ShareIcon />}
          sx={{
            bgcolor: "#0F5A24",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.825rem",
            textTransform: "none",
            borderRadius: "10px",
            py: 1,
            boxShadow: "0 2px 6px rgba(15,90,36,0.25)",
            "&:hover": { bgcolor: "#15803D" },
          }}
        >
          More Share
        </Button>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", fontWeight: 700 }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
