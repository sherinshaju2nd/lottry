"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 400);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "#FFFFFF",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut ? 0 : 1,
        visibility: fadeOut ? "hidden" : "visible",
        transition: "opacity 0.4s ease, visibility 0.4s ease",
      }}
    >
      <Box
        component="img"
        src="/logo-round-192.png"
        alt="kerala-lottery-results-logo"
        sx={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          objectFit: "contain",
          boxShadow: "0 10px 30px rgba(46, 125, 50, 0.25)",
          mb: 3,
          animation: "pulse 1.8s infinite ease-in-out",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.08)" },
          },
        }}
      />

      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: "#0B3C5D",
          mb: 0.5,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Kerala Lottery Result Today
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "#6B7280", fontWeight: 600, mb: 4, textAlign: "center" }}
      >
        Live Results & Weekly Schedule Portal
      </Typography>

      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          size={36}
          thickness={4.5}
          sx={{
            color: "#0B3C5D",
          }}
        />
      </Box>
    </Box>
  );
}
