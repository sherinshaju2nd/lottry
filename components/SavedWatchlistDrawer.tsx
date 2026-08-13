"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { SavedTicket, getSavedWatchlist, removeFromWatchlist, clearWatchlist } from "@/lib/ticket-storage";

interface SavedWatchlistDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckBatch: (tickets: string[]) => void;
}

export default function SavedWatchlistDrawer({
  open,
  onClose,
  onCheckBatch,
}: SavedWatchlistDrawerProps) {
  const [watchlist, setWatchlist] = useState<SavedTicket[]>([]);

  useEffect(() => {
    if (open) {
      setWatchlist(getSavedWatchlist());
    }
  }, [open]);

  const handleRemove = (id: string) => {
    const updated = removeFromWatchlist(id);
    setWatchlist(updated);
  };

  const handleClearAll = () => {
    clearWatchlist();
    setWatchlist([]);
  };

  const handleCheckAll = () => {
    const tickets = watchlist.map((w) => w.ticketNumber);
    if (tickets.length > 0) {
      onCheckBatch(tickets);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "90%", sm: 400 },
            borderRadius: { xs: "16px 0 0 16px", sm: "0px" },
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 100%)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StarIcon sx={{ color: "#FFC107" }} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Saved Tickets Watchlist
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#FFFFFF" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Content */}
      <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
        {watchlist.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: "12px", border: "1px solid #B3E5FC" }}>
            You have not saved any purchased tickets yet. Click the <strong>⭐ Save to Watchlist</strong> button next to the search bar to save your tickets!
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827" }}>
                Saved Purchased Tickets ({watchlist.length})
              </Typography>
              <Button size="small" color="error" onClick={handleClearAll} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                Clear All
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckAll}
              startIcon={<PlayArrowIcon />}
              sx={{
                bgcolor: "#0B3C5D",
                fontWeight: 900,
                py: 1.25,
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(11,60,93,0.25)",
                "&:hover": { bgcolor: "#0F2C59" },
              }}
            >
              ⚡ Check All ({watchlist.length}) Saved Tickets
            </Button>

            <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              {watchlist.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: "10px",
                    bgcolor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <ConfirmationNumberIcon sx={{ color: "#0B3C5D" }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#111827" }}>
                        {item.ticketNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        Saved on {item.dateAdded}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton size="small" onClick={() => handleRemove(item.id)} sx={{ color: "#9CA3AF", "&:hover": { color: "#EF4444" } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
