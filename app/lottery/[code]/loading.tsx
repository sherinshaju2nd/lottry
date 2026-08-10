"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function LotteryCodeLoading() {
  return (
    <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" width={140} height={32} sx={{ mb: 2, borderRadius: "4px" }} />
          <Skeleton variant="text" width="60%" height={44} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>

        <Skeleton variant="rounded" height={64} sx={{ mb: 4, borderRadius: "8px" }} />

        <TableSkeleton rows={8} />
      </Container>
    </Box>
  );
}
