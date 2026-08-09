"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash screen loader for initial load
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 400); // Allow fade out animation to complete
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
      {/* Brand Icon */}
      <Box
        sx={{
          bgcolor: "#2E7D32",
          color: "#FFFFFF",
          p: 2,
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(46, 125, 50, 0.25)",
          mb: 3,
          animation: "pulse 1.8s infinite ease-in-out",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.08)" },
          },
        }}
      >
        <ConfirmationNumberIcon sx={{ fontSize: 44 }} />
      </Box>

      {/* Brand Name */}
      <Typography variant="h4" sx={{ fontWeight: 900, color: "#1B5E20", mb: 0.5, letterSpacing: "-0.02em" }}>
        Kerala Lottery
      </Typography>
      <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600, mb: 4 }}>
        Official Results & Weekly Schedule Portal
      </Typography>

      {/* Green Progress Spinner */}
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          size={36}
          thickness={4.5}
          sx={{
            color: "#2E7D32",
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ color: "#9CA3AF", mt: 3, fontWeight: 500 }}>
        Loading latest draw data...
      </Typography>
    </Box>
  );
}
