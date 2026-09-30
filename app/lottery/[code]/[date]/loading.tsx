"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import DrawDetailSkeleton from "@/components/skeletons/DrawDetailSkeleton";

export default function LotteryDateLoading() {
  return (
    <Box
      sx={{
        bgcolor: "#F8FAFC",
        color: "#111827",
        minHeight: "100vh",
        pt: { xs: 1.5, sm: 3, md: 4 },
        pb: { xs: 12, sm: 10, md: 6 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 3, md: 4, lg: 5 } }}>
        {/* Desktop Breadcrumbs & Date Selector Bar */}
        <Box
          sx={{
            mb: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="text" width={50} height={20} />
            <Skeleton variant="text" width={10} height={20} />
            <Skeleton variant="text" width={130} height={20} />
            <Skeleton variant="text" width={10} height={20} />
            <Skeleton variant="text" width={110} height={20} />
          </Box>
          <Skeleton variant="rounded" width={190} height={38} sx={{ borderRadius: "6px" }} />
        </Box>

        {/* Header Section: Logo + Title + Badges + Action Buttons */}
        <Box
          sx={{
            mb: 3.5,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Skeleton
              variant="rounded"
              width={72}
              height={72}
              sx={{ borderRadius: "16px", flexShrink: 0 }}
            />
            <Box>
              <Skeleton variant="text" width="90%" height={38} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="65%" height={22} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "6px" }} />
                <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: "6px" }} />
                <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: "6px" }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "8px" }} />
            <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "8px" }} />
          </Box>
        </Box>

        {/* Results / Live Detail Skeleton Structure */}
        <DrawDetailSkeleton />
      </Container>
    </Box>
  );
}
