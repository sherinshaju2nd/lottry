"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import LotteryCardSkeleton from "@/components/skeletons/LotteryCardSkeleton";

export default function Loading() {
  return (
    <Box sx={{ width: "100%", overflowX: "hidden", minHeight: "100vh", bgcolor: "#FFFFFF", py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Top Hero Showcase Banner Skeleton */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "16px", sm: "24px" },
            background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
            p: { xs: 2.5, sm: 4, md: 5 },
            mb: { xs: 3, sm: 4 },
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(11, 60, 93, 0.15)",
          }}
        >
          {/* Top Row: Live badge & Date */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1 }}>
            <Skeleton
              variant="rounded"
              width={100}
              height={28}
              sx={{ borderRadius: "8px", bgcolor: "rgba(255, 255, 255, 0.2)" }}
            />
            <Skeleton
              variant="rounded"
              width={160}
              height={28}
              sx={{ borderRadius: "8px", bgcolor: "rgba(255, 255, 255, 0.2)" }}
            />
          </Box>

          {/* Main Title & Subtitle */}
          <Box sx={{ textAlign: "center", my: 2 }}>
            <Skeleton
              variant="text"
              width="65%"
              height={46}
              sx={{ mx: "auto", bgcolor: "rgba(255, 255, 255, 0.3)" }}
            />
            <Skeleton
              variant="text"
              width="45%"
              height={26}
              sx={{ mx: "auto", bgcolor: "rgba(255, 255, 255, 0.2)", mt: 0.5 }}
            />
          </Box>

          {/* 1st Prize Hero Display Box */}
          <Box
            sx={{
              maxWidth: 580,
              mx: "auto",
              my: 3,
              p: { xs: 2, sm: 2.5 },
              borderRadius: "16px",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              textAlign: "center",
            }}
          >
            <Skeleton
              variant="rounded"
              width={120}
              height={22}
              sx={{ mx: "auto", mb: 1, borderRadius: "6px", bgcolor: "rgba(255, 255, 255, 0.2)" }}
            />
            <Skeleton
              variant="rounded"
              width="75%"
              height={56}
              sx={{ mx: "auto", borderRadius: "10px", bgcolor: "rgba(255, 255, 255, 0.25)" }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={22}
              sx={{ mx: "auto", mt: 1, bgcolor: "rgba(255, 255, 255, 0.2)" }}
            />
          </Box>

          {/* Quick Ticket Search Input Bar */}
          <Box
            sx={{
              maxWidth: 620,
              mx: "auto",
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Skeleton
              variant="rounded"
              height={48}
              sx={{ flex: 1, minWidth: 200, borderRadius: "10px", bgcolor: "rgba(255, 255, 255, 0.25)" }}
            />
            <Skeleton
              variant="rounded"
              width={140}
              height={48}
              sx={{ borderRadius: "10px", bgcolor: "rgba(255, 255, 255, 0.35)" }}
            />
          </Box>
        </Paper>

        {/* Section Header: Recent Draws */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, mt: 1, px: 0.5 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rounded" width={85} height={26} sx={{ borderRadius: "12px" }} />
        </Box>

        {/* Weekly & Recent Draws Cards Grid */}
        <LotteryCardSkeleton count={8} />

        {/* Bottom Bento Info Grid Skeleton */}
        <Box sx={{ mt: 5, p: { xs: 2, sm: 3 }, bgcolor: "#F8FAFC", borderRadius: "22px", border: "1px solid #E2E8F0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="text" width={280} height={28} />
          </Box>
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                  <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "8px", mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={22} />
                  <Skeleton variant="text" width="90%" height={18} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
