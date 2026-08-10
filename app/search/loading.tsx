"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export default function SearchLoading() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Skeleton variant="text" width="80%" height={48} sx={{ mx: "auto", mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto" }} />
      </Box>

      <Skeleton variant="rounded" height={160} sx={{ borderRadius: "12px", mb: 6 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: "12px" }} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: "12px" }} />
      </Box>
    </Container>
  );
}
