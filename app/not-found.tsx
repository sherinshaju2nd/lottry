"use client";

import React from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center", bgcolor: "#FFFFFF" }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: "#2E7D32", mb: 1, fontSize: "4rem" }}>
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
          Page Not Found
        </Typography>

        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
          The lottery page or result resource you are looking for does not exist or has been moved.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{ bgcolor: "#2E7D32", fontWeight: 700, px: 3, py: 1.2, borderRadius: "8px", "&:hover": { bgcolor: "#1B5E20" } }}
          >
            Back to Kerala Lottery Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
