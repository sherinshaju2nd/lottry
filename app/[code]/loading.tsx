"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function Loading() {
  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        color: "#111827",
        minHeight: "100vh",
        py: { xs: 3, sm: 5, md: 6 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Breadcrumb Navigation Skeleton */}
        <Box sx={{ mb: 2.5, display: "flex", gap: 1, alignItems: "center" }}>
          <Skeleton variant="text" width={50} height={20} />
          <Skeleton variant="text" width={10} height={20} />
          <Skeleton variant="text" width={140} height={20} />
        </Box>

        {/* Back Button Skeleton */}
        <Skeleton variant="rounded" width={180} height={36} sx={{ mb: 2.5, borderRadius: "6px" }} />

        {/* Header Section: Logo + Title + View Mode Toggle */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2.5,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 2.5 }, maxWidth: { xs: "100%", md: "75%" } }}>
            {/* Logo Box */}
            <Skeleton
              variant="rounded"
              width={84}
              height={84}
              sx={{ borderRadius: "18px", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={38} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="45%" height={22} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </Box>

          {/* View Mode Toggle Buttons Skeleton */}
          <Skeleton
            variant="rounded"
            width={220}
            height={40}
            sx={{ borderRadius: "6px" }}
          />
        </Box>

        {/* Upcoming Draw Announcement Banner Skeleton */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            borderRadius: "16px",
            border: "2px solid #FCD34D",
            bgcolor: "#FFFDF0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box>
              <Skeleton variant="text" width={220} height={26} />
              <Skeleton variant="text" width={320} height={20} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={160} height={38} sx={{ borderRadius: "8px" }} />
        </Paper>

        {/* Filter & Search Bar Skeleton */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Skeleton variant="rounded" height={42} sx={{ flex: 1, minWidth: 220, borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={180} height={42} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={90} height={42} sx={{ borderRadius: "8px" }} />
        </Paper>

        {/* Table Content Skeleton */}
        <TableSkeleton rows={8} />
      </Container>
    </Box>
  );
}
