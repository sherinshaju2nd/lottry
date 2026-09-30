"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function AdminLoading() {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 5,
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Top Banner Header Skeleton */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Skeleton variant="text" width={260} height={42} />
            <Skeleton variant="rounded" width={110} height={26} sx={{ borderRadius: "6px" }} />
          </Box>
          <Skeleton variant="text" width={440} height={20} />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={170} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>

      {/* Admin Tabs Bar Skeleton */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          p: 1,
          mb: 3.5,
          bgcolor: "#FFFFFF",
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
        }}
      >
        {["Manage Draws", "Bumper Lotteries", "Postponed / Holidays", "AI Gazette Importer", "Cron Automation"].map((_, i) => (
          <Skeleton key={i} variant="rounded" width={150} height={40} sx={{ borderRadius: "8px", flexShrink: 0 }} />
        ))}
      </Paper>

      {/* Action & Filter Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Skeleton variant="rounded" width={280} height={40} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="rounded" width={160} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Admin Draws Table Skeleton */}
      <TableSkeleton rows={8} />
    </Container>
  );
}
