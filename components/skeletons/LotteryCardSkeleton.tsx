"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

interface LotteryCardSkeletonProps {
  count?: number;
}

export default function LotteryCardSkeleton({ count = 8 }: LotteryCardSkeletonProps) {
  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
      {[...Array(count)].map((_, i) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }} key={i}>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "14px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              height: "100%",
              minHeight: { xs: 160, sm: 180 },
            }}
          >
            {/* Top Blue Header Section (50% Split) */}
            <Box
              sx={{
                bgcolor: "rgb(11, 60, 93)",
                p: { xs: 1.5, sm: 2 },
                minHeight: { xs: 80, sm: 90 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Badge placeholder */}
              <Skeleton
                variant="rounded"
                width={50}
                height={20}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  borderRadius: "6px",
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                }}
              />
              {/* Lottery Name placeholder */}
              <Skeleton
                variant="text"
                width="70%"
                height={28}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.3)" }}
              />
              {/* Malayalam Name placeholder */}
              <Skeleton
                variant="text"
                width="50%"
                height={18}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", mt: 0.5 }}
              />
            </Box>

            {/* Bottom Content Area */}
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
                bgcolor: "#FFFFFF",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Skeleton variant="rounded" width={75} height={22} sx={{ borderRadius: "12px" }} />
                <Skeleton variant="text" width={65} height={18} />
              </Box>

              <Box sx={{ my: 0.5 }}>
                <Skeleton variant="text" width="90%" height={24} />
              </Box>

              <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: "8px", mt: 1 }} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
