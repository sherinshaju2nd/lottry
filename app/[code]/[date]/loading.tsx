import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="rounded" width={100} height={36} sx={{ mb: 3, borderRadius: "8px" }} />
      <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 4 }} />

      {/* Winner Hero Card Skeleton */}
      <Skeleton variant="rounded" width="100%" height={220} sx={{ mb: 4, borderRadius: "12px" }} />

      {/* Prize Breakdown Grid Skeleton */}
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Skeleton variant="rounded" width="100%" height={160} sx={{ borderRadius: "8px" }} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
