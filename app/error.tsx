"use client";

import React, { useEffect } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center", bgcolor: "#FFFFFF" }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>
          Something unexpected happened while processing your request.
        </Alert>

        <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
          Temporary Technical Difficulties
        </Typography>

        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
          {error.message || "An unknown error occurred. Please try refreshing or return to the home page."}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            onClick={() => reset()}
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{ bgcolor: "#0B3C5D", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#0F2C59" } }}
          >
            Try Again
          </Button>

          <Button
            component={Link}
            href="/"
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{ borderColor: "#6B7280", color: "#374151", fontWeight: 700, borderRadius: "8px" }}
          >
            Go Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
