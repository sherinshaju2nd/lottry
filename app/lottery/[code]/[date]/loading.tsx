"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import DrawDetailSkeleton from "@/components/skeletons/DrawDetailSkeleton";

export default function LotteryDateLoading() {
  return (
    <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Skeleton variant="rectangular" width={180} height={36} sx={{ borderRadius: "4px" }} />
          <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: "6px" }} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="65%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="45%" height={24} />
        </Box>

        <Skeleton variant="rounded" height={130} sx={{ mb: 4, borderRadius: "16px" }} />

        <DrawDetailSkeleton />
      </Container>
    </Box>
  );
}
