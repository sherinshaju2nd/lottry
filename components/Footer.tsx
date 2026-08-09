"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "#FFFFFF", borderTop: "1px solid #E5E7EB", py: 6, mt: "auto" }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 2 }}>
          Kerala Lottery
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 3, mb: 3 }}>
          <Typography variant="body2" component="a" href="#" sx={{ color: "#6B7280", textDecoration: "none", "&:hover": { color: "#2E7D32" } }}>
            Terms of Service
          </Typography>
          <Typography variant="body2" component="a" href="#" sx={{ color: "#6B7280", textDecoration: "none", "&:hover": { color: "#2E7D32" } }}>
            Privacy Policy
          </Typography>
          <Typography variant="body2" component="a" href="#" sx={{ color: "#6B7280", textDecoration: "none", "&:hover": { color: "#2E7D32" } }}>
            Disclaimer
          </Typography>
          <Typography variant="body2" component="a" href="#" sx={{ color: "#6B7280", textDecoration: "none", "&:hover": { color: "#2E7D32" } }}>
            Responsible Gaming
          </Typography>
          <Typography variant="body2" component="a" href="#" sx={{ color: "#6B7280", textDecoration: "none", "&:hover": { color: "#2E7D32" } }}>
            Contact Us
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block" }}>
          © 2026 Kerala State Lotteries Department. Government of Kerala. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
