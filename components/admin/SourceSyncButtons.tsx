"use client";

import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import {
  API_SOURCES_CHANGED_EVENT,
  DRAWS_SYNCED_EVENT,
  describeSyncedDraw,
  fetchAdminApiSources,
  notifyAdmin,
  requestSourceSync,
  type AdminApiSource,
} from "@/lib/adminSyncClient";

export type SyncNotice = { type: "success" | "error" | "warning" | "info"; message: string };

interface SourceSyncButtonsProps {
  /** Shows the outcome in the page's main alert. */
  onResult: (notice: SyncNotice) => void;
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/**
 * Admin header: one "Sync {source name}" button per saved API source. Each calls only that
 * source and saves its draw. Reloads automatically when the API Sources tab saves the list.
 */
export default function SourceSyncButtons({ onResult }: SourceSyncButtonsProps) {
  const [sources, setSources] = useState<AdminApiSource[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Id of the source being synced, or null when idle (one at a time avoids overlapping writes). */
  const [running, setRunning] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    try {
      setSources(await fetchAdminApiSources());
      setLoadError(null);
    } catch (err: unknown) {
      console.error("[SourceSyncButtons] could not load sources:", errorMessage(err));
      setLoadError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSources();
    }, 0);
    const onChanged = () => {
      loadSources();
    };
    window.addEventListener(API_SOURCES_CHANGED_EVENT, onChanged);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(API_SOURCES_CHANGED_EVENT, onChanged);
    };
  }, [loadSources]);

  const syncSource = async ({ id, name }: AdminApiSource) => {
    setRunning(id);
    try {
      const data = await requestSourceSync(id);
      onResult({ type: "success", message: `${name}: ${describeSyncedDraw(data)}. Result pages were refreshed.` });
      notifyAdmin(DRAWS_SYNCED_EVENT);
    } catch (err: unknown) {
      onResult({ type: "error", message: `${name}: sync failed — ${errorMessage(err)}` });
    } finally {
      setRunning(null);
    }
  };

  if (loadError) {
    return (
      <Tooltip title={`Could not load API sources: ${loadError}`}>
        <Button variant="outlined" onClick={() => loadSources()} sx={{ fontWeight: 700, borderRadius: "8px", textTransform: "none", bgcolor: "#FFFFFF" }}>
          Retry loading API sources
        </Button>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
      {sources.map((source) => (
        <Tooltip
          key={source.id}
          title={`Fetch ${source.name} now and save its draw to the database${source.enabled ? "" : " (disabled for cron, manual sync still works)"}`}
        >
          <span>
            <Button
              variant="contained"
              onClick={() => syncSource(source)}
              disabled={running !== null}
              startIcon={running === source.id ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
              sx={{
                fontWeight: 800,
                borderRadius: "8px",
                textTransform: "none",
                px: 2.25,
                bgcolor: "#0B3C5D",
                color: "#FFFFFF",
                maxWidth: 280,
                opacity: source.enabled ? 1 : 0.75,
                "&:hover": { bgcolor: "#0F2C59" },
              }}
            >
              <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {running === source.id ? `Syncing ${source.name}…` : `Sync ${source.name}`}
              </Box>
            </Button>
          </span>
        </Tooltip>
      ))}
    </Box>
  );
}
