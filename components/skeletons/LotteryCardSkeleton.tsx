"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

interface LotteryCardSkeletonProps {
  count?: number;
}

export default function LotteryCardSkeleton({ count = 7 }: LotteryCardSkeletonProps) {
  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {[...Array(count)].map((_, i) => {
        const isFriday = i === 4;
        return (
          <Grid size={{ xs: 12, sm: isFriday ? 12 : 6, md: isFriday ? 6 : 3 }} key={i}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                height: "100%",
                minHeight: 150,
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                  <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: "16px" }} />
                  <Skeleton variant="text" width={120} height={20} />
                </Box>

                <Box>
                  <Skeleton variant="text" width="70%" height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
