import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={100} height={36} sx={{ mb: 2, borderRadius: "8px" }} />
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} />
      </Box>

      {/* Control Bar Skeleton */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Skeleton variant="rounded" width="40%" height={40} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Content Skeleton */}
      <TableSkeleton rows={8} />
    </Container>
  );
}
