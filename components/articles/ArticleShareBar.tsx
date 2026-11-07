"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkIcon from "@mui/icons-material/Link";
import CheckIcon from "@mui/icons-material/Check";
import IosShareIcon from "@mui/icons-material/IosShare";
import { trackEvent } from "@/lib/analytics";

interface ArticleShareBarProps {
  title: string;
  url: string;
  slug: string;
  /** "row": horizontal (end of article). "column": vertical stack (sticky sidebar). */
  layout?: "row" | "column";
  label?: string;
}

const NETWORKS = [
  { id: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, color: "#25D366", href: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { id: "telegram", label: "Telegram", Icon: TelegramIcon, color: "#229ED9", href: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon, color: "#1877F2", href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { id: "x", label: "X (Twitter)", Icon: XIcon, color: "#0F172A", href: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
] as const;

/** Compact, article-specific share controls (icon buttons with tooltips + accessible labels). */
export default function ArticleShareBar({ title, url, slug, layout = "row", label = "Share" }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const track = (method: string) => trackEvent({ name: "share", params: { method, content_type: "article", item_id: slug } });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setToast("Link copied to clipboard");
      track("copy_link");
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      console.warn("[ArticleShareBar] copy failed:", err instanceof Error ? err.message : String(err));
      setToast("Couldn't copy — please copy the link from the address bar");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
      track("native");
    } catch (err: unknown) {
      // AbortError = user closed the sheet; not an error worth surfacing
      if (err instanceof Error && err.name !== "AbortError") console.warn("[ArticleShareBar] share failed:", err.message);
    }
  };

  const isColumn = layout === "column";
  const buttonSx = (color: string) => ({
    width: 42,
    height: 42,
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    bgcolor: "#FFFFFF",
    color,
    transition: "transform .15s ease, background-color .15s ease, color .15s ease, border-color .15s ease",
    "&:hover, &:focus-visible": { bgcolor: color, color: "#FFFFFF", borderColor: color, transform: "translateY(-2px)" },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: isColumn ? "column" : "row", alignItems: isColumn ? "stretch" : "center", gap: 1.5, flexWrap: "wrap" }}>
      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.9rem", mr: isColumn ? 0 : 0.5 }}>{label}</Typography>
      <Box role="group" aria-label="Share this article" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {NETWORKS.map(({ id, label: name, Icon, color, href }) => (
          <Tooltip key={id} title={name}>
            <IconButton
              component="a"
              href={href(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${name}`}
              onClick={() => track(id)}
              sx={buttonSx(color)}
            >
              <Icon fontSize="small" />
            </IconButton>
          </Tooltip>
        ))}
        <Tooltip title={copied ? "Copied!" : "Copy link"}>
          <IconButton aria-label="Copy article link" onClick={copyLink} sx={buttonSx("#0B3C5D")}>
            {copied ? <CheckIcon fontSize="small" /> : <LinkIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        {canNativeShare && (
          <Tooltip title="More options">
            <IconButton aria-label="More share options" onClick={nativeShare} sx={buttonSx("#0B3C5D")}>
              <IosShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast?.startsWith("Couldn't") ? "warning" : "success"} variant="filled" onClose={() => setToast(null)} sx={{ fontWeight: 700 }}>
          {toast ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
