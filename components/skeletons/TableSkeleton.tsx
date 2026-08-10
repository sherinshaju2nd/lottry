"use client";

import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

interface TableSkeletonProps {
  rows?: number;
}

export default function TableSkeleton({ rows = 6 }: TableSkeletonProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden", p: 3, bgcolor: "#FFFFFF" }}>
      <Box sx={{ display: "flex", gap: 2, pb: 2, mb: 1, borderBottom: "2px solid #F3F4F6" }}>
        <Skeleton variant="text" width={100} height={28} />
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={160} height={28} />
        <Skeleton variant="text" width={120} height={28} />
        <Skeleton variant="text" width={150} height={28} />
      </Box>

      {[...Array(rows)].map((_, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, borderBottom: i < rows - 1 ? "1px solid #F3F4F6" : "none" }}>
          <Skeleton variant="rectangular" width={110} height={24} sx={{ borderRadius: "4px" }} />
          <Skeleton variant="rectangular" width={160} height={24} sx={{ borderRadius: "4px" }} />
          <Skeleton variant="rectangular" width={130} height={24} sx={{ borderRadius: "4px" }} />
          <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: "4px" }} />
          <Skeleton variant="rectangular" width={140} height={24} sx={{ borderRadius: "4px", ml: "auto" }} />
        </Box>
      ))}
    </Paper>
  );
}
