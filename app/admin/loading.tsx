"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export default function AdminLoading() {
  return (
    <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Skeleton variant="text" width={260} height={40} />
          <Skeleton variant="text" width={400} height={20} />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rectangular" width={200} height={36} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>

      <Skeleton variant="rounded" height={400} sx={{ borderRadius: "16px" }} />
    </Container>
  );
}
