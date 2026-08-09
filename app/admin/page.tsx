"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { StructuredDrawResult } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [draws, setDraws] = useState<StructuredDrawResult[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDraws = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/draws?type=all");
      const json = await res.json();
      setDraws(json.results || []);
    } catch {
      setDraws([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDraws();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const json = await res.json();

      if (json.success) {
        setSyncStatus({
          type: "success",
          message: `Manual sync completed! Synced: ${json.data?.draw_name} (${json.data?.draw_code}) on ${json.data?.draw_date}`,
        });
        await loadDraws();
      } else {
        setSyncStatus({
          type: "error",
          message: `Sync failed: ${json.error || "Unknown error"}`,
        });
      }
    } catch {
      setSyncStatus({
        type: "error",
        message: "Failed to connect to sync endpoint.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      {/* Top Banner */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
            Admin Control Center
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Manage lottery results, trigger manual API sync, and monitor Supabase database records.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={loadDraws}
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ fontWeight: 700, borderRadius: "8px" }}
          >
            Refresh
          </Button>

          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            variant="contained"
            startIcon={isSyncing ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
            sx={{ bgcolor: "#2E7D32", color: "#FFFFFF", fontWeight: 800, px: 3, borderRadius: "8px", "&:hover": { bgcolor: "#1B5E20" } }}
          >
            {isSyncing ? "Syncing..." : "Sync Latest API Result"}
          </Button>
        </Box>
      </Box>

      {syncStatus && (
        <Alert severity={syncStatus.type} sx={{ mb: 4, borderRadius: "12px" }} onClose={() => setSyncStatus(null)}>
          {syncStatus.message}
        </Alert>
      )}

      {/* Database Overview Table */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB", bgcolor: "#F9FAFB" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
            Stored Supabase Draw Results Archive ({draws.length})
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <CircularProgress color="primary" />
          </Box>
        ) : draws.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F3F4F6" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Draw Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lottery Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Draw Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>1st Prize Ticket</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location / Agent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {draws.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{row.draw_date}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#2E7D32" }}>{row.draw_name}</TableCell>
                    <TableCell>
                      <Chip label={row.draw_code} size="small" sx={{ fontWeight: 700, bgcolor: "#E0F2FE", color: "#0369A1", borderRadius: "6px" }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 800, color: "#D97706" }}>
                      {row.first?.ticket || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "#4B5563", fontSize: "0.85rem" }}>
                      {row.first?.location || "N/A"} / {row.first?.agent || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              No draw results currently stored in Supabase database. Click &quot;Sync Latest API Result&quot; to fetch.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
