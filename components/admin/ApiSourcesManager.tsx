"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import MailOutlineIcon from "@mui/icons-material/EmailOutlined";
import {
  API_SOURCES_CHANGED_EVENT,
  DRAWS_SYNCED_EVENT,
  describeSyncedDraw,
  notifyAdmin,
  requestSourceSync,
  requestSyncAll,
} from "@/lib/adminSyncClient";
import Collapse from "@mui/material/Collapse";

interface ApiSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

interface TestResult {
  name: string;
  ok: boolean;
  ms: number;
  status?: number;
  error?: string;
  tickets: number;
  drawCode?: string;
  drawDate?: string;
  /** Raw response from the source (klr/v1/latest shape), for the result viewer. */
  data?: SourceResponse | null;
}

interface SourceResponse {
  draw_date?: string;
  draw_name?: string;
  draw_code?: string;
  first?: { ticket?: string; location?: string; agent?: string; agency_no?: string };
  prizes?: Record<string, unknown> & { amounts?: Record<string, string> };
}

/** Outcome of "Sync" on one source: its latest draw was fetched and written to the database. */
interface SyncResult {
  ok: boolean;
  message: string;
  at: string;
}

const VIEW_TIERS: [string, string][] = [
  ["consolation", "Consolation"],
  ["2nd", "2nd Prize"],
  ["3rd", "3rd Prize"],
  ["4th", "4th Prize"],
  ["5th", "5th Prize"],
  ["6th", "6th Prize"],
  ["7th", "7th Prize"],
  ["8th", "8th Prize"],
  ["9th", "9th Prize"],
];

const C ={ ink: "#0F172A", sub: "#64748B", line: "#E2E8F0", soft: "#F8FAFC", navy: "#0B3C5D", green: "#16A34A" };

const newId = (): string => `src-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/** Admin tab: manage the ordered list of lottery result API sources used by the cron sync (with failover). */
export default function ApiSourcesManager() {
  const [sources, setSources] = useState<ApiSource[]>([]);
  const [savedJson, setSavedJson] = useState("[]");
  const [defaults, setDefaults] = useState<ApiSource[]>([]);
  const [tests, setTests] = useState<Record<string, TestResult | "running">>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncs, setSyncs] = useState<Record<string, SyncResult | "running">>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  /** Sends a sample "API source failed" alert so the Gmail SMTP env settings can be checked. */
  const sendTestAlertEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      const res = await fetch("/api/admin/alert-email", { method: "POST", cache: "no-store" });
      const { sent = false, error, recipients = [] } = (await res.json()) as { sent?: boolean; error?: string; recipients?: string[] };
      setStatus(
        sent
          ? { type: "success", message: `Test alert email sent to ${recipients.join(", ")}.` }
          : { type: "error", message: `Test email not sent: ${error ?? `HTTP ${res.status}`}. Check SMTP_USER / SMTP_PASS (Gmail App Password) in the environment.` },
      );
    } catch (err: unknown) {
      setStatus({ type: "error", message: `Test email failed: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const isDirty = JSON.stringify(sources) !== savedJson;

  // Callers set isLoading first (keeps setState out of the effect body).
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/api-sources", { cache: "no-store" });
      const json = (await res.json()) as { success?: boolean; sources?: ApiSource[]; defaults?: ApiSource[]; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
      setSources(json.sources ?? []);
      setSavedJson(JSON.stringify(json.sources ?? []));
      setDefaults(json.defaults ?? []);
    } catch (err: unknown) {
      console.error("[ApiSourcesManager] load failed:", errorMessage(err));
      setStatus({ type: "error", message: `Could not load sources: ${errorMessage(err)}` });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const update = (id: string, patch: Partial<ApiSource>) =>
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const move = (index: number, offset: number) =>
    setSources((prev) => {
      const next = [...prev];
      const target = index + offset;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const remove = (source: ApiSource) => {
    if (!window.confirm(`Remove "${source.name || source.url}"?`)) return;
    setSources((prev) => prev.filter((s) => s.id !== source.id));
  };

  const add = () => setSources((prev) => [...prev, { id: newId(), name: "", url: "https://", enabled: true }]);

  const testOne = async (source: ApiSource) => {
    setTests((prev) => ({ ...prev, [source.id]: "running" }));
    try {
      const res = await fetch("/api/admin/api-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source.url, name: source.name }),
      });
      const json = (await res.json()) as { success?: boolean; result?: TestResult; data?: SourceResponse | null; error?: string };
      if (!res.ok || !json.success || !json.result) throw new Error(json.error ?? `HTTP ${res.status}`);
      setTests((prev) => ({ ...prev, [source.id]: { ...(json.result as TestResult), data: json.data ?? null } }));
    } catch (err: unknown) {
      setTests((prev) => ({ ...prev, [source.id]: { name: source.name, ok: false, ms: 0, tickets: 0, error: errorMessage(err) } }));
    }
  };

  const testAll = () => sources.forEach((s) => testOne(s));

  /** Sync needs the saved version of a source (the server reads saved sources, not unsaved edits). */
  const savedSources = useMemo(() => {
    try {
      return JSON.parse(savedJson) as ApiSource[];
    } catch (err: unknown) {
      console.error("[ApiSourcesManager] saved list unreadable:", errorMessage(err));
      return [];
    }
  }, [savedJson]);

  const isSavedAsIs = (source: ApiSource): boolean => savedSources.some(({ id, url }) => id === source.id && url === source.url);

  /** Fetch one source on the server and write its latest draw to the database. */
  const syncOne = async (source: ApiSource): Promise<boolean> => {
    setSyncs((prev) => ({ ...prev, [source.id]: "running" }));
    const at = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    try {
      const data = await requestSourceSync(source.id);
      setSyncs((prev) => ({ ...prev, [source.id]: { ok: true, at, message: describeSyncedDraw(data) } }));
      notifyAdmin(DRAWS_SYNCED_EVENT);
      return true;
    } catch (err: unknown) {
      console.error(`[ApiSourcesManager] sync ${source.name} failed:`, errorMessage(err));
      setSyncs((prev) => ({ ...prev, [source.id]: { ok: false, at, message: errorMessage(err) } }));
      return false;
    }
  };

  /**
   * Sync every enabled, saved source one at a time, lowest priority first, so the
   * highest-priority source is written last and its numbers win if sources disagree.
   */
  const syncAll = async () => {
    // The server syncs the *saved* list; warn instead of silently ignoring unsaved edits.
    if (isDirty && !window.confirm("You have unsaved changes. Sync all uses the saved sources. Continue?")) return;
    const targets = savedSources.filter(({ enabled }) => enabled);
    setIsSyncingAll(true);
    setStatus(null);
    setSyncs((prev) => ({ ...prev, ...Object.fromEntries(targets.map(({ id }) => [id, "running" as const])) }));
    try {
      const { results, message } = await requestSyncAll();
      const at = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setSyncs((prev) => ({
        ...prev,
        ...Object.fromEntries(targets.map(({ id }) => [id, { ok: false, at, message: "No result returned" }])),
        ...Object.fromEntries(
          results.map(({ sourceId, success, error, data }) => [
            sourceId,
            { ok: success, at, message: success ? describeSyncedDraw(data) : (error ?? "Sync failed") },
          ]),
        ),
      }));
      const okCount = results.filter(({ success }) => success).length;
      if (okCount > 0) notifyAdmin(DRAWS_SYNCED_EVENT);
      setStatus({
        type: results.length > 0 && okCount === results.length ? "success" : okCount > 0 ? "info" : "error",
        message: okCount > 0 ? `${message} Result pages were refreshed.` : message,
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const renderSync = (id: string) => {
    const s = syncs[id];
    if (!s) return null;
    if (s === "running") return <Chip size="small" icon={<CircularProgress size={12} />} label="Syncing to database…" />;
    return (
      <Chip
        size="small"
        icon={<CloudDownloadIcon sx={{ "&&": { color: s.ok ? "#166534" : "#991B1B" } }} />}
        sx={{ fontWeight: 700, bgcolor: s.ok ? "#DBEAFE" : "#FEE2E2", color: s.ok ? "#1E3A8A" : "#991B1B", maxWidth: "100%" }}
        label={`${s.ok ? "Synced" : "Sync failed"} ${s.at} · ${s.message}`}
      />
    );
  };

  const save = async () => {
    setIsSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/api-sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      const json = (await res.json()) as { success?: boolean; sources?: ApiSource[]; message?: string; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
      setSources(json.sources ?? sources);
      setSavedJson(JSON.stringify(json.sources ?? sources));
      setStatus({ type: "success", message: `${json.message ?? "Saved."} The next cron run uses this order.` });
      notifyAdmin(API_SOURCES_CHANGED_EVENT); // header sync buttons reload names/order
    } catch (err: unknown) {
      setStatus({ type: "error", message: `Save failed: ${errorMessage(err)}` });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!window.confirm("Replace the list with the built-in default source? (Not saved until you click Save.)")) return;
    setSources(defaults.map((d) => ({ ...d })));
  };

  const renderTest = (id: string) => {
    const t = tests[id];
    if (!t) return null;
    if (t === "running") return <Chip size="small" icon={<CircularProgress size={12} />} label="Testing…" />;
    return t.ok ? (
      <Chip
        size="small"
        sx={{ fontWeight: 700, bgcolor: "#DCFCE7", color: "#166534" }}
        label={`OK · ${t.drawCode} ${t.drawDate} · ${t.tickets > 0 ? `${t.tickets} tickets` : "numbers not out yet"} · ${(t.ms / 1000).toFixed(1)}s`}
      />
    ) : (
      <Chip size="small" sx={{ fontWeight: 700, bgcolor: "#FEE2E2", color: "#991B1B", maxWidth: "100%" }} label={`Failed · ${t.error}`} />
    );
  };

  const getTestData = (id: string): SourceResponse | null => {
    const t = tests[id];
    return t && t !== "running" && t.ok ? (t.data ?? null) : null;
  };

  const hasViewableData = (id: string): boolean => Boolean(getTestData(id));

  const tierTickets = (data: SourceResponse, key: string): string[] => {
    const list = data.prizes?.[key];
    return Array.isArray(list) ? list.map(String).filter((t) => t.trim().length > 0) : [];
  };

  /** Read-only view of everything the source returned: draw info, 1st prize, and every prize list. */
  const renderResultViewer = (id: string) => {
    const data = getTestData(id);
    if (!data) return null;
    const amounts = data.prizes?.amounts ?? {};
    const firstTicket = data.first?.ticket?.trim() ?? "";
    const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

    return (
      <Box sx={{ mt: 1.5, p: 2, borderRadius: "12px", border: `1px solid ${C.line}`, bgcolor: C.soft }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "baseline", mb: 2 }}>
          <Typography sx={{ fontWeight: 800, color: C.ink, fontSize: 16 }}>{data.draw_name || "Draw"}</Typography>
          <Typography sx={{ fontFamily: mono, fontWeight: 700, color: C.navy }}>{data.draw_code}</Typography>
          <Typography sx={{ color: C.sub, fontSize: 13 }}>{data.draw_date}</Typography>
        </Box>

        <Box sx={{ p: 1.5, mb: 2, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FCD34D" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#B45309", letterSpacing: 0.5 }}>
            1ST PRIZE {amounts["1st"] ? `· ₹${amounts["1st"].replace(/\/-$/, "")}` : ""}
          </Typography>
          <Typography sx={{ fontFamily: mono, fontSize: 22, fontWeight: 800, color: C.ink }}>{firstTicket || "— not out yet —"}</Typography>
          {(data.first?.location || data.first?.agent || data.first?.agency_no) && (
            <Typography sx={{ fontSize: 13, color: C.sub }}>
              {[data.first?.location, data.first?.agent, data.first?.agency_no].filter(Boolean).join(" · ")}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {VIEW_TIERS.map(([key, label]) => {
            const tickets = tierTickets(data, key);
            return (
              <Box key={key}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: C.ink }}>
                    {label}
                    {amounts[key] ? <Box component="span" sx={{ color: C.sub, fontWeight: 600 }}> · ₹{amounts[key].replace(/\/-$/, "")}</Box> : null}
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: tickets.length ? C.green : C.sub }}>
                    {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                  </Typography>
                </Box>
                {tickets.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxHeight: 160, overflowY: "auto" }}>
                    {tickets.map((t, i) => (
                      <Box
                        key={`${t}-${i}`}
                        sx={{ fontFamily: mono, fontSize: 12.5, fontWeight: 700, px: 0.75, py: 0.25, borderRadius: "6px", bgcolor: "#FFFFFF", border: `1px solid ${C.line}` }}
                      >
                        {t}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 12, color: C.sub, fontStyle: "italic" }}>Empty in this response</Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 8, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: "16px", border: `1px solid ${C.line}` }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: C.ink }}>
              Result API Sources
            </Typography>
            <Typography variant="body2" sx={{ color: C.sub, mt: 0.5 }}>
              The cron calls every <strong>enabled</strong> source at the same time and uses the <strong>highest one in this list</strong> that
              has prize numbers. If none has numbers yet, it uses the highest one that answered. A down source never blocks the others.
              Every source must return the same JSON format as the current India Lottery API.
            </Typography>
            <Typography variant="body2" sx={{ color: C.sub, mt: 1 }}>
              <strong>Test</strong> only checks a source. <strong>Sync</strong> calls that source now and saves its latest draw to the
              database (the same as a cron run, including the 1st-prize broadcast, which never sends the same draw twice).
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button startIcon={<NetworkCheckIcon />} onClick={testAll} sx={{ fontWeight: 700, textTransform: "none" }}>
              Test all
            </Button>
            <Tooltip title="Fetch every enabled source and save to the database (priority #1 is saved last, so its numbers win)">
              <span>
                <Button
                  startIcon={isSyncingAll ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
                  variant="contained"
                  onClick={syncAll}
                  disabled={isSyncingAll}
                  sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", bgcolor: C.navy, "&:hover": { bgcolor: "#0F2C59" } }}
                >
                  {isSyncingAll ? "Syncing…" : "Sync all"}
                </Button>
              </span>
            </Tooltip>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={add} sx={{ fontWeight: 700, textTransform: "none", borderRadius: "10px" }}>
              Add source
            </Button>
          </Box>
        </Box>
      </Paper>

      {status && (
        <Alert severity={status.type} sx={{ mb: 3, borderRadius: "12px" }} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sources.map((source, index) => (
          <Paper
            key={source.id}
            elevation={0}
            sx={{
              p: { xs: 1.75, sm: 2.5 },
              borderRadius: "14px",
              border: `1px solid ${source.enabled ? C.line : "#F1F5F9"}`,
              bgcolor: source.enabled ? "#FFFFFF" : C.soft,
              opacity: source.enabled ? 1 : 0.75,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: { xs: "wrap", md: "nowrap" } }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  color: index === 0 && source.enabled ? "#FFFFFF" : C.navy,
                  bgcolor: index === 0 && source.enabled ? C.navy : "#E0F2FE",
                }}
                title={`Priority ${index + 1}`}
              >
                {index + 1}
              </Box>
              <TextField
                label="Name"
                size="small"
                value={source.name}
                onChange={(e) => update(source.id, { name: e.target.value })}
                sx={{ width: { xs: "100%", md: 220 }, flexShrink: 0 }}
              />
              <TextField
                label="API URL"
                size="small"
                fullWidth
                value={source.url}
                onChange={(e) => update(source.id, { url: e.target.value.trim() })}
                slotProps={{ htmlInput: { style: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13 } } }}
              />
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", flexShrink: 0, width: { xs: "100%", md: "auto" }, justifyContent: { xs: "space-between", md: "flex-start" } }}>
                <Tooltip title={source.enabled ? "Enabled" : "Disabled"}>
                  <Switch checked={source.enabled} onChange={(e) => update(source.id, { enabled: e.target.checked })} />
                </Tooltip>
                <Tooltip title="Test this URL now">
                  <IconButton onClick={() => testOne(source)} aria-label="Test source">
                    <NetworkCheckIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isSavedAsIs(source) ? "Sync: fetch this API now and save its draw to the database" : "Save your changes first, then sync"}>
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => syncOne(source)}
                      disabled={!isSavedAsIs(source) || syncs[source.id] === "running" || isSyncingAll}
                      startIcon={syncs[source.id] === "running" ? <CircularProgress size={14} /> : <CloudDownloadIcon fontSize="small" />}
                      aria-label={`Sync ${source.name || "source"} to database`}
                      sx={{ fontWeight: 800, textTransform: "none", borderRadius: "8px", mx: 0.5, color: C.navy, borderColor: "#BFDBFE", whiteSpace: "nowrap" }}
                    >
                      Sync
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Move up (higher priority)">
                  <span>
                    <IconButton disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton disabled={index === sources.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Remove">
                  <span>
                    <IconButton disabled={sources.length === 1} onClick={() => remove(source)} aria-label="Remove source" sx={{ "&:hover": { color: "#DC2626" } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            {(tests[source.id] || syncs[source.id]) && (
              <Box sx={{ mt: 1.5, ml: { md: 6.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  {renderSync(source.id)}
                  {renderTest(source.id)}
                  {hasViewableData(source.id) && (
                    <Button
                      size="small"
                      onClick={() => setExpanded((prev) => ({ ...prev, [source.id]: !prev[source.id] }))}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{ transition: "transform .2s", transform: expanded[source.id] ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      }
                      aria-expanded={Boolean(expanded[source.id])}
                      sx={{ fontWeight: 700, textTransform: "none", color: C.navy }}
                    >
                      {expanded[source.id] ? "Hide result" : "View result"}
                    </Button>
                  )}
                </Box>
                <Collapse in={Boolean(expanded[source.id]) && hasViewableData(source.id)} unmountOnExit>
                  {renderResultViewer(source.id)}
                </Collapse>
              </Box>
            )}
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Button onClick={resetToDefault} sx={{ fontWeight: 700, textTransform: "none", color: C.sub }}>
            Reset to default
          </Button>
          <Tooltip title="When a source fails during a sync, an alert email goes to the team (reminder every 30 min while it stays down, and a 'recovered' email). This sends a sample.">
            <span>
              <Button
                onClick={sendTestAlertEmail}
                disabled={isSendingTestEmail}
                startIcon={isSendingTestEmail ? <CircularProgress size={16} color="inherit" /> : <MailOutlineIcon />}
                sx={{ fontWeight: 700, textTransform: "none", color: C.sub }}
              >
                Send test alert email
              </Button>
            </span>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isDirty && <Chip size="small" label="Unsaved changes" sx={{ fontWeight: 700, bgcolor: "#FEF3C7", color: "#92400E" }} />}
          <Button
            startIcon={<RefreshIcon />}
            disabled={isSaving}
            onClick={() => {
              if (isDirty && !window.confirm("Discard unsaved changes?")) return;
              setIsLoading(true);
              load();
            }}
            sx={{ fontWeight: 700, textTransform: "none", color: C.sub }}
          >
            Reload
          </Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={isSaving || !isDirty}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ bgcolor: C.green, fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 3, "&:hover": { bgcolor: "#15803D" } }}
          >
            Save order & sources
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
