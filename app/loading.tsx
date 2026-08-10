"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import LotteryCardSkeleton from "@/components/skeletons/LotteryCardSkeleton";

export default function Loading() {
  return (
    <Container maxWidth={false} sx={{ py: { xs: 3, sm: 5, md: 6 }, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      {/* Hero Banner Skeleton */}
      <Skeleton
        variant="rounded"
        height={380}
        sx={{ borderRadius: { xs: "20px", sm: "28px" }, mb: { xs: 4, sm: 6 } }}
      />

      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="300px" height={40} />
        <Skeleton variant="text" width="450px" height={24} />
      </Box>

      {/* Weekly Lottery Schedule Cards Skeleton */}
      <LotteryCardSkeleton count={7} />
    </Container>
  );
}
