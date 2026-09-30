"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";

export default function SearchLoading() {
  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 2.5, sm: 4, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Top Badges Row */}
      <Box sx={{ mb: { xs: 2.5, sm: 3.5 }, textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" width={220} height={28} sx={{ borderRadius: "20px" }} />
          <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: "20px" }} />
        </Box>

        {/* Page Title & Subtitle */}
        <Skeleton variant="text" width="75%" height={44} sx={{ mx: "auto", mb: 0.5 }} />
        <Skeleton variant="text" width="55%" height={22} sx={{ mx: "auto" }} />
      </Box>

      {/* Mode Switcher Toggle Skeleton */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Skeleton variant="rounded" width={280} height={40} sx={{ borderRadius: "10px" }} />
      </Box>

      {/* Search Input Form Card Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: "18px",
          border: "1.5px solid #E2E8F0",
          bgcolor: "#FFFFFF",
          boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
          mb: 4,
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: "12px" }} />
        </Box>

        {/* Quick Prefix Series Chips */}
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={44} height={28} sx={{ borderRadius: "6px" }} />
          ))}
        </Box>

        {/* Date Filter Input */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: "10px" }} />
        </Box>

        {/* Submit & Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" height={48} sx={{ flex: 1, minWidth: 180, borderRadius: "10px" }} />
          <Skeleton variant="rounded" width={100} height={48} sx={{ borderRadius: "10px" }} />
        </Box>
      </Paper>

      {/* Recent Searches / Quick Numbers Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Skeleton variant="text" width={160} height={24} />
          <Skeleton variant="text" width={80} height={20} />
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={100} height={32} sx={{ borderRadius: "16px" }} />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
