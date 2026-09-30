"use client";

import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface TableSkeletonProps {
  rows?: number;
}

export default function TableSkeleton({ rows = 8 }: TableSkeletonProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ py: 2 }}>
                <Skeleton variant="text" width={120} height={24} />
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Skeleton variant="text" width={90} height={24} />
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Skeleton variant="text" width={110} height={24} />
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Skeleton variant="text" width={140} height={24} />
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Skeleton variant="text" width={100} height={24} />
              </TableCell>
              <TableCell align="right" sx={{ py: 2 }}>
                <Skeleton variant="text" width={80} height={24} sx={{ ml: "auto" }} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(rows)].map((_, i) => (
              <TableRow key={i} sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}>
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: "8px" }} />
                    <Box>
                      <Skeleton variant="text" width={130} height={22} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant="rounded" width={65} height={24} sx={{ borderRadius: "6px" }} />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant="text" width={95} height={20} />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box>
                    <Skeleton variant="rounded" width={105} height={24} sx={{ borderRadius: "6px", mb: 0.5 }} />
                    <Skeleton variant="text" width={75} height={16} />
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant="text" width={90} height={20} />
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Skeleton variant="rounded" width={65} height={32} sx={{ borderRadius: "6px" }} />
                    <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "6px" }} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Skeleton Footer */}
      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, borderTop: "1px solid #F1F5F9" }}>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="rounded" width={70} height={30} sx={{ borderRadius: "6px" }} />
        <Skeleton variant="rounded" width={60} height={30} sx={{ borderRadius: "6px" }} />
      </Box>
    </Paper>
  );
}
