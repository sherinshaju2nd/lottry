"use client";

import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";

export default function DrawDetailSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1st Prize Hero Banner Skeleton */}
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: "16px" }} />

      <Skeleton variant="rectangular" width={240} height={32} sx={{ borderRadius: "6px", mt: 1 }} />

      {/* Prize Tier Cards Skeleton */}
      <Grid container spacing={3}>
        {[...Array(4)].map((_, i) => (
          <Grid size={{ xs: 12 }} key={i}>
            <Skeleton variant="rounded" height={110} sx={{ borderRadius: "12px" }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
