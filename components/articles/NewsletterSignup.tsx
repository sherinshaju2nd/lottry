"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { trackEvent } from "@/lib/analytics";

/** Newsletter sign-up card (POST /api/newsletter, stored server-side only). */
export default function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "success" | "error"; message?: string }>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "web" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.error ?? "Could not subscribe right now.");
      setState({ status: "success", message: json.message });
      setEmail("");
      trackEvent({ name: "newsletter_subscribe", params: { source: compact ? "article" : "news_page" } });
    } catch (err: unknown) {
      setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <Box
      component="section"
      aria-labelledby="newsletter-heading"
      sx={{ p: compact ? 2.5 : { xs: 3, md: 4 }, borderRadius: "18px", color: "#FFFFFF", background: "linear-gradient(135deg, #0B3C5D 0%, #134E7A 60%, #1E6FA8 100%)" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <MarkEmailReadIcon />
        <Typography id="newsletter-heading" component="h2" sx={{ fontWeight: 900, fontSize: compact ? "1.1rem" : "1.35rem" }}>
          Kerala Lottery Newsletter
        </Typography>
      </Box>
      <Typography sx={{ opacity: 0.9, mb: 2, fontSize: "0.95rem", lineHeight: 1.6 }}>
        Bumper announcements, claim tips and weekly result round-ups. Free, no spam — unsubscribe any time.
      </Typography>

      {state.status === "success" ? (
        <Alert severity="success" sx={{ borderRadius: "12px", fontWeight: 600 }}>{state.message}</Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: compact ? "column" : { xs: "column", sm: "row" }, gap: 1.25 }} noValidate>
          <TextField
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { "aria-label": "Email address", autoComplete: "email", maxLength: 254 } }}
            sx={{ bgcolor: "#FFFFFF", borderRadius: "10px", "& fieldset": { border: "none" } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={state.status === "loading" || !email.trim()}
            sx={{ bgcolor: "#F59E0B", color: "#0F172A", fontWeight: 900, textTransform: "none", borderRadius: "10px", px: 3, whiteSpace: "nowrap", "&:hover": { bgcolor: "#FBBF24" }, "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.35)", color: "rgba(15,23,42,0.6)" } }}
          >
            {state.status === "loading" ? <CircularProgress size={18} color="inherit" /> : "Subscribe"}
          </Button>
        </Box>
      )}
      {state.status === "error" && (
        <Alert severity="error" sx={{ mt: 1.5, borderRadius: "12px" }}>{state.message}</Alert>
      )}
    </Box>
  );
}
