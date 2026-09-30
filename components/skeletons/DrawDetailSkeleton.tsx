"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";

export default function DrawDetailSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, sm: 3.5 } }}>
      {/* 1st Prize Grand Hero Card Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: "20px",
          border: "2px solid #E2E8F0",
          bgcolor: "#FFFFFF",
          boxShadow: "0 8px 24px rgba(11, 60, 93, 0.06)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Skeleton variant="rounded" width={140} height={28} sx={{ borderRadius: "20px" }} />
          <Skeleton variant="rounded" width={180} height={28} sx={{ borderRadius: "20px" }} />
        </Box>

        <Box sx={{ my: 2, textAlign: "center" }}>
          <Skeleton variant="text" width="40%" height={30} sx={{ mx: "auto", mb: 1 }} />
          <Skeleton
            variant="rounded"
            width="80%"
            height={70}
            sx={{ mx: "auto", maxWidth: 420, borderRadius: "14px", my: 1 }}
          />
          <Skeleton variant="text" width="30%" height={24} sx={{ mx: "auto", mt: 1 }} />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            pt: 2.5,
            mt: 2,
            borderTop: "1px dashed #E2E8F0",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: "center", minWidth: 120 }}>
            <Skeleton variant="text" width={80} height={18} sx={{ mx: "auto" }} />
            <Skeleton variant="text" width={130} height={24} sx={{ mx: "auto" }} />
          </Box>
          <Box sx={{ textAlign: "center", minWidth: 120 }}>
            <Skeleton variant="text" width={80} height={18} sx={{ mx: "auto" }} />
            <Skeleton variant="text" width={130} height={24} sx={{ mx: "auto" }} />
          </Box>
        </Box>
      </Paper>

      {/* Ticket Checker Form Card Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={220} height={28} />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" height={48} sx={{ flex: 1, minWidth: 200, borderRadius: "10px" }} />
          <Skeleton variant="rounded" width={140} height={48} sx={{ borderRadius: "10px" }} />
        </Box>
      </Paper>

      {/* Section Title Skeleton */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Skeleton variant="text" width={260} height={36} />
        <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: "20px" }} />
      </Box>

      {/* Prize Tier Cards Skeleton (Consolation, 2nd, 3rd, 4th, 5th, etc.) */}
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {[...Array(6)].map((_, i) => (
          <Grid size={{ xs: 12, md: i < 2 ? 12 : 6 }} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "6px" }} />
                  <Skeleton variant="text" width={120} height={24} />
                </Box>
                <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "12px" }} />
              </Box>

              {/* Number Chips Grid */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {[...Array(i === 0 ? 8 : i === 1 ? 4 : 6)].map((_, cIdx) => (
                  <Skeleton
                    key={cIdx}
                    variant="rounded"
                    width={85}
                    height={36}
                    sx={{ borderRadius: "8px" }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Gazette PDF & Official Verification Card Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: "12px" }} />
          <Box>
            <Skeleton variant="text" width={240} height={28} />
            <Skeleton variant="text" width={180} height={20} />
          </Box>
        </Box>
        <Skeleton variant="rounded" width={160} height={42} sx={{ borderRadius: "8px" }} />
      </Paper>
    </Box>
  );
}
