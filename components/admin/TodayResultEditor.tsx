"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SortIcon from "@mui/icons-material/SortByAlpha";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { ALL_LOTTERIES, BUMPER_LOTTERIES, WEEKLY_LOTTERIES, type LotteryRecord, type PrizeData, type StructuredDrawResult } from "@/lib/supabase";
import {
  getExpectedKind,
  nextBumperDrawCode,
  PRIZE_TIERS,
  classifyTicket,
  findCrossTierDuplicates,
  nextDrawCode,
  normalizeTicket,
  parseTicketList,
  type PrizeTierKey,
} from "@/lib/drawTickets";

type ListTierKey = Exclude<PrizeTierKey, "1st">;
const LIST_TIERS = PRIZE_TIERS.filter((t): t is (typeof PRIZE_TIERS)[number] & { key: ListTierKey } => t.key !== "1st");
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const C = {
  ink: "#0F172A",
  sub: "#64748B",
  line: "#E2E8F0",
  soft: "#F8FAFC",
  navy: "#0B3C5D",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  amber: "#D97706",
  amberSoft: "#FEF3C7",
  gold: "#B45309",
  goldSoft: "#FFFBEB",
};
const MONO = "'JetBrains Mono', 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const todayIST = (): string => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const weeklyCodeForDate = (date: string): string => {
  const weekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return WEEKLY_LOTTERIES.find((l) => l.day === weekday)?.code ?? WEEKLY_LOTTERIES[0].code;
};

const formatLongDate = (iso: string): string =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : "";

/** Short badge shown in the sidebar for each tier. */
const tierBadge = (key: PrizeTierKey): string => (key === "consolation" ? "C" : key.replace(/\D/g, ""));

interface FormState {
  draw_code: string;
  first_ticket: string;
  first_location: string;
  first_agent: string;
  first_agency_no: string;
  tickets: Record<ListTierKey, string[]>;
  amounts: Record<PrizeTierKey, string>;
}

const defaultAmounts = (): Record<PrizeTierKey, string> =>
  PRIZE_TIERS.reduce((acc, { key, defaultAmount }) => ({ ...acc, [key]: defaultAmount }), {} as Record<PrizeTierKey, string>);

const emptyTickets = (): Record<ListTierKey, string[]> =>
  LIST_TIERS.reduce((acc, { key }) => ({ ...acc, [key]: [] }), {} as Record<ListTierKey, string[]>);

const emptyForm = (draw_code = ""): FormState => ({
  draw_code,
  first_ticket: "",
  first_location: "",
  first_agent: "",
  first_agency_no: "",
  tickets: emptyTickets(),
  amounts: defaultAmounts(),
});

const formFromDraw = (draw: StructuredDrawResult): FormState => ({
  draw_code: draw.draw_code ?? "",
  first_ticket: draw.first?.ticket ?? "",
  first_location: draw.first?.location ?? "",
  first_agent: draw.first?.agent ?? "",
  first_agency_no: draw.first?.agency_no ?? "",
  tickets: LIST_TIERS.reduce(
    (acc, { key }) => ({ ...acc, [key]: (draw.prizes?.[key] ?? []).map(normalizeTicket) }),
    {} as Record<ListTierKey, string[]>,
  ),
  amounts: { ...defaultAmounts(), ...(draw.prizes?.amounts ?? {}) },
});

/** Announced bumper draw dates (admin-managed in the Bumper Lotteries Hub): date → bumper code. */
const fetchBumperSchedule = async (): Promise<Record<string, string>> => {
  const res = await fetch("/api/draws?type=lotteries", { cache: "no-store" });
  const json = (await res.json()) as { lotteries?: LotteryRecord[] };
  return Object.fromEntries(
    (json.lotteries ?? []).filter((l) => l.is_bumper && l.draw_date).map((l) => [l.draw_date as string, l.code.toUpperCase()]),
  );
};

const fetchDraw = async (code: string, date?: string): Promise<StructuredDrawResult | null> => {
  const params = new URLSearchParams({ code, ...(date ? { date } : {}) });
  const res = await fetch(`/api/admin/draw-results?${params.toString()}`, { cache: "no-store" });
  const json = (await res.json()) as { success?: boolean; result?: StructuredDrawResult | null; error?: string };
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.result ?? null;
};

interface TierIssue {
  level: "error" | "warning";
  message: string;
}

/** Admin tab: add or edit the full result (1st – 9th + consolation) of a lottery for a given day. */
export default function TodayResultEditor() {
  const [date, setDate] = useState<string>(todayIST);
  const [lotteryCode, setLotteryCode] = useState<string>(() => weeklyCodeForDate(todayIST()));
  const [form, setForm] = useState<FormState>(emptyForm());
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(emptyForm()));
  const [existing, setExisting] = useState<StructuredDrawResult | null>(null);
  const [activeTier, setActiveTier] = useState<PrizeTierKey>("1st");
  const [ticketInput, setTicketInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [bumperSchedule, setBumperSchedule] = useState<Record<string, string>>({});
  const lottery = ALL_LOTTERIES.find((l) => l.code === lotteryCode);
  const isBumper = Boolean(lottery?.is_bumper);
  const expectedKind = (key: PrizeTierKey) => getExpectedKind(key, lotteryCode);
  /** Draws scheduled on the selected date: an announced bumper (if any) plus the weekly draw. */
  const drawsOnDate = [bumperSchedule[date], weeklyCodeForDate(date)].filter((c): c is string => Boolean(c));
  const isDirty = JSON.stringify(form) !== savedSnapshot;

  // Callers set isLoading before calling (keeps setState out of the effect body).
  const load = useCallback(async () => {
    try {
      const stored = await fetchDraw(lotteryCode, date);
      // No row yet for this day: suggest the next draw code and the last amounts from the latest draw.
      const latest = stored ? null : await fetchDraw(lotteryCode);
      // Bumper codes run in one BR-series across all bumpers, so check the latest draw of every bumper.
      const bumperCode =
        !stored && BUMPER_LOTTERIES.some((b) => b.code === lotteryCode)
          ? nextBumperDrawCode((await Promise.all(BUMPER_LOTTERIES.map((b) => fetchDraw(b.code)))).map((d) => d?.draw_code ?? ""))
          : null;
      const suggestedCode = bumperCode ?? (latest?.draw_code ? nextDrawCode(latest.draw_code) : `${lotteryCode}-`);
      const next = stored
        ? formFromDraw(stored)
        : {
            ...emptyForm(suggestedCode),
            amounts: { ...defaultAmounts(), ...(latest?.prizes?.amounts ?? {}) },
          };
      setExisting(stored);
      setForm(next);
      setSavedSnapshot(JSON.stringify(next));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[TodayResultEditor] load failed:", msg);
      setStatus({ type: "error", message: `Could not load result: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  }, [date, lotteryCode]);

  useEffect(() => {
    // Same pattern as ArticlesManager: defer so no setState runs synchronously in the effect.
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Load the bumper schedule once; on a bumper day pre-select the bumper (admin can switch back).
  useEffect(() => {
    let cancelled = false;
    const loadSchedule = async () => {
      try {
        const schedule = await fetchBumperSchedule();
        if (cancelled) return;
        setBumperSchedule(schedule);
        const bumperToday = schedule[todayIST()];
        if (bumperToday) {
          setIsLoading(true);
          setLotteryCode((current) => (current === weeklyCodeForDate(todayIST()) ? bumperToday : current));
        }
      } catch (err: unknown) {
        console.warn("[TodayResultEditor] bumper schedule unavailable:", err instanceof Error ? err.message : String(err));
      }
    };
    loadSchedule();
    return () => {
      cancelled = true;
    };
  }, []);

  const confirmDiscard = (): boolean => !isDirty || window.confirm("You have unsaved changes. Discard them?");

  const reload = () => {
    if (!confirmDiscard()) return;
    setIsLoading(true);
    load();
  };

  const handleLotteryChange = (code: string) => {
    if (!confirmDiscard()) return;
    setIsLoading(true);
    setLotteryCode(code);
  };

  const handleDateChange = (value: string) => {
    if (!value || !confirmDiscard()) return;
    setIsLoading(true);
    setDate(value);
    setLotteryCode(bumperSchedule[value] ?? weeklyCodeForDate(value));
  };

  const setAmount = (key: PrizeTierKey, value: string) =>
    setForm((prev) => ({ ...prev, amounts: { ...prev.amounts, [key]: value } }));

  const setTierTickets = (key: ListTierKey, tickets: string[]) =>
    setForm((prev) => ({ ...prev, tickets: { ...prev.tickets, [key]: tickets } }));

  // ---------------------------------------------------------------------------
  // Derived status for every tier (drives sidebar, progress and warnings)
  // ---------------------------------------------------------------------------
  const allTickets = useMemo<Record<PrizeTierKey, string[]>>(
    () => ({ "1st": form.first_ticket.trim() ? [normalizeTicket(form.first_ticket)] : [], ...form.tickets }),
    [form.first_ticket, form.tickets],
  );

  const crossDuplicates = useMemo(() => findCrossTierDuplicates(allTickets), [allTickets]);

  const tierIssues = useMemo(
    () =>
      PRIZE_TIERS.reduce(
        (acc, { key, label }) => {
          const tickets = allTickets[key];
          const issues: TierIssue[] = [];
          const repeated = tickets.filter((t, i) => tickets.indexOf(t) !== i);
          if (repeated.length > 0) issues.push({ level: "error", message: `Entered twice: ${[...new Set(repeated)].join(", ")}` });

          const elsewhere = [...new Set(tickets)].filter((t) => crossDuplicates.has(t));
          elsewhere.forEach((t) => {
            const others = (crossDuplicates.get(t) ?? []).filter((k) => k !== key).map((k) => PRIZE_TIERS.find((p) => p.key === k)?.label);
            issues.push({ level: "error", message: `${t} is also in ${others.join(", ")}` });
          });

          const invalid = tickets.filter((t) => classifyTicket(t) === "invalid");
          if (invalid.length > 0) issues.push({ level: "error", message: `Not a valid ticket: ${invalid.join(", ")}` });

          const expected = getExpectedKind(key, lotteryCode);
          const otherKind = tickets.filter((t) => classifyTicket(t) !== "invalid" && classifyTicket(t) !== expected);
          if (otherKind.length > 0) {
            issues.push({
              level: "warning",
              message: `${label} is usually ${expected === "full" ? "full tickets (AB 123456)" : "4-digit endings"} — check ${otherKind.slice(0, 5).join(", ")}${otherKind.length > 5 ? "…" : ""}`,
            });
          }

          if (key === "consolation" && allTickets["1st"][0]) {
            const firstNumber = allTickets["1st"][0].split(" ")[1];
            const mismatch = tickets.filter((t) => t.split(" ")[1] !== firstNumber);
            if (mismatch.length > 0) issues.push({ level: "warning", message: `Consolation numbers should match 1st prize (${firstNumber}): ${mismatch.join(", ")}` });
          }
          return { ...acc, [key]: issues };
        },
        {} as Record<PrizeTierKey, TierIssue[]>,
      ),
    [allTickets, crossDuplicates, lotteryCode],
  );

  const filledCount = PRIZE_TIERS.filter(({ key }) => allTickets[key].length > 0).length;
  const errorCount = PRIZE_TIERS.reduce((sum, { key }) => sum + tierIssues[key].filter((i) => i.level === "error").length, 0);
  const totalTickets = PRIZE_TIERS.reduce((sum, { key }) => sum + allTickets[key].length, 0);

  // ---------------------------------------------------------------------------
  // Ticket actions for the active list tier
  // ---------------------------------------------------------------------------
  const activeIndex = PRIZE_TIERS.findIndex((t) => t.key === activeTier);
  const activeConfig = PRIZE_TIERS[activeIndex];
  const activeListKey = activeTier === "1st" ? null : (activeTier as ListTierKey);

  const addTickets = (raw: string) => {
    if (!activeListKey) return;
    const parsed = parseTicketList(raw);
    if (parsed.length === 0) {
      setStatus({ type: "info", message: "No ticket numbers found in that text." });
      return;
    }
    const current = form.tickets[activeListKey];
    const fresh = parsed.filter((t, i) => !current.includes(t) && parsed.indexOf(t) === i);
    setTierTickets(activeListKey, [...current, ...fresh]);
    setTicketInput("");
    const skipped = parsed.length - fresh.length;
    if (skipped > 0) setStatus({ type: "info", message: `Added ${fresh.length}, skipped ${skipped} already in ${activeConfig.label}.` });
    inputRef.current?.focus();
  };

  const removeTicket = (ticket: string) => {
    if (!activeListKey) return;
    setTierTickets(activeListKey, form.tickets[activeListKey].filter((t) => t !== ticket));
  };

  const copyTickets = async () => {
    try {
      await navigator.clipboard.writeText(allTickets[activeTier].join(", "));
      setStatus({ type: "success", message: `Copied ${allTickets[activeTier].length} tickets from ${activeConfig.label}.` });
    } catch (err: unknown) {
      setStatus({ type: "error", message: `Copy failed: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  const goToTier = (offset: number) => {
    const next = PRIZE_TIERS[activeIndex + offset];
    if (next) {
      setActiveTier(next.key);
      setTicketInput("");
    }
  };

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!lottery || isSaving) return;
    if (!form.draw_code.trim() || !/\d/.test(form.draw_code)) {
      setStatus({ type: "error", message: `Enter the draw code, e.g. ${lottery.code}-775.` });
      return;
    }
    if (errorCount > 0 && !window.confirm(`There are ${errorCount} problem(s) in the tickets. Save anyway?`)) return;

    const prizes: PrizeData = {
      ...(existing?.prizes ?? {}), // keep extras the form doesn't edit (guess numbers, machine code)
      ...form.tickets,
      amounts: Object.fromEntries(Object.entries(form.amounts).filter(([, v]) => v.trim().length > 0)),
    };

    const payload: StructuredDrawResult = {
      id: existing?.id,
      draw_date: date,
      draw_name: lottery.name,
      draw_code: form.draw_code.trim().toUpperCase(),
      lottery_code: lottery.code,
      first: {
        ticket: form.first_ticket.trim() ? normalizeTicket(form.first_ticket) : "",
        location: form.first_location.trim(),
        agent: form.first_agent.trim(),
        agency_no: form.first_agency_no.trim(),
      },
      prizes,
    };

    setIsSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/draw-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
      setStatus({ type: "success", message: `Saved ${lottery.name} (${payload.draw_code}) for ${date}.` });
      setIsLoading(true);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[TodayResultEditor] save failed:", msg);
      setStatus({ type: "error", message: `Save failed: ${msg}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Ctrl/Cmd + S saves.
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const tierState = (key: PrizeTierKey): "error" | "done" | "empty" =>
    tierIssues[key].some((i) => i.level === "error") ? "error" : allTickets[key].length > 0 ? "done" : "empty";

  const stateColor = { error: C.red, done: C.green, empty: "#CBD5E1" } as const;

  const renderSidebar = () => (
    <Paper elevation={0} sx={{ borderRadius: "16px", border: `1px solid ${C.line}`, overflow: "hidden", position: { md: "sticky" }, top: { md: 16 } }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${C.line}`, bgcolor: C.soft }}>
        <Typography variant="overline" sx={{ fontWeight: 800, color: C.sub, letterSpacing: 1 }}>
          Prizes
        </Typography>
      </Box>
      <Box
        component="nav"
        aria-label="Prize tiers"
        sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, overflowX: { xs: "auto", md: "visible" }, p: 1, gap: 0.5 }}
      >
        {PRIZE_TIERS.map(({ key, label }) => {
          const state = tierState(key);
          const selected = key === activeTier;
          const count = allTickets[key].length;
          return (
            <Box
              key={key}
              component="button"
              type="button"
              onClick={() => {
                setActiveTier(key);
                setTicketInput("");
              }}
              aria-current={selected ? "true" : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                minWidth: { xs: 170, md: "auto" },
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                borderRadius: "10px",
                px: 1.25,
                py: 1,
                bgcolor: selected ? "#EFF6FF" : "transparent",
                boxShadow: selected ? `inset 3px 0 0 ${C.navy}` : "none",
                transition: "background-color .15s",
                "&:hover": { bgcolor: selected ? "#EFF6FF" : C.soft },
                "&:focus-visible": { outline: `2px solid ${C.navy}`, outlineOffset: 1 },
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  color: key === "1st" ? C.gold : selected ? C.navy : C.sub,
                  bgcolor: key === "1st" ? C.goldSoft : selected ? "#DBEAFE" : "#F1F5F9",
                  border: key === "1st" ? `1px solid #FCD34D` : "none",
                }}
              >
                {key === "1st" ? <EmojiEventsIcon sx={{ fontSize: 17 }} /> : tierBadge(key)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink, lineHeight: 1.2 }}>{label}</Typography>
                <Typography sx={{ fontSize: 12, color: C.sub }} noWrap>
                  ₹{form.amounts[key]?.replace(/\/-$/, "") || "—"}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: count > 0 ? C.ink : C.sub, fontVariantNumeric: "tabular-nums" }}>
                {count > 0 ? count : ""}
              </Typography>
              {state === "error" ? (
                <ErrorIcon sx={{ fontSize: 18, color: stateColor.error }} titleAccess="Has problems" />
              ) : state === "done" ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: stateColor.done }} titleAccess="Filled" />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: stateColor.empty }} titleAccess="Empty" />
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );

  const renderTicketChip = (ticket: string, index: number) => {
    const chipKey = `${ticket}-${index}`;
    const kind = classifyTicket(ticket);
    const duplicate = crossDuplicates.has(ticket);
    const bad = duplicate || kind === "invalid";
    const offKind = !bad && kind !== expectedKind(activeTier);
    const tip = duplicate
      ? `Also in ${(crossDuplicates.get(ticket) ?? []).filter((k) => k !== activeTier).join(", ")}`
      : kind === "invalid"
        ? "Not a valid ticket number"
        : offKind
          ? "Unusual format for this prize"
          : "";
    const chip = (
      <Chip
        label={ticket}
        onDelete={() => removeTicket(ticket)}
        sx={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 0.5,
          height: 34,
          borderRadius: "8px",
          bgcolor: bad ? C.redSoft : offKind ? C.amberSoft : "#FFFFFF",
          color: bad ? "#991B1B" : C.ink,
          border: `1px solid ${bad ? "#FCA5A5" : offKind ? "#FCD34D" : C.line}`,
          "& .MuiChip-deleteIcon": { fontSize: 18, color: "#94A3B8", "&:hover": { color: C.red } },
        }}
      />
    );
    return tip ? (
      <Tooltip key={chipKey} title={tip} arrow>
        {chip}
      </Tooltip>
    ) : (
      <React.Fragment key={chipKey}>{chip}</React.Fragment>
    );
  };

  const renderFirstPrize = () => (
    <Box>
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          borderRadius: "14px",
          background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
          border: "1px solid #FCD34D",
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: 1, mb: 1 }}>WINNING TICKET</Typography>
        <TextField
          fullWidth
          placeholder="KO 447257"
          value={form.first_ticket}
          onChange={(e) => setForm((prev) => ({ ...prev, first_ticket: e.target.value.toUpperCase() }))}
          onBlur={() => setForm((prev) => ({ ...prev, first_ticket: prev.first_ticket.trim() ? normalizeTicket(prev.first_ticket) : "" }))}
          slotProps={{
            htmlInput: { "aria-label": "1st prize winning ticket", maxLength: 12, style: { fontFamily: MONO, fontSize: 32, fontWeight: 800, letterSpacing: 3, padding: "10px 14px" } },
          }}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px" } }}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Sold at (location)" fullWidth size="small" value={form.first_location} onChange={(e) => setForm((prev) => ({ ...prev, first_location: e.target.value }))} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Agent name" fullWidth size="small" value={form.first_agent} onChange={(e) => setForm((prev) => ({ ...prev, first_agent: e.target.value }))} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Agency no." fullWidth size="small" value={form.first_agency_no} onChange={(e) => setForm((prev) => ({ ...prev, first_agency_no: e.target.value }))} />
        </Grid>
      </Grid>
    </Box>
  );

  const renderListTier = (key: ListTierKey) => {
    const tickets = form.tickets[key];
    const expected = expectedKind(key);
    return (
      <Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            autoFocus
            placeholder={expected === "full" ? "Type or paste tickets, e.g. KA 447257, KB 447257" : "Type or paste endings, e.g. 4073 5391 6120"}
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTickets(ticketInput);
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (parseTicketList(text).length > 1) {
                e.preventDefault();
                addTickets(text);
              }
            }}
            helperText="Press Enter to add. Pasting a list adds every ticket at once."
            slotProps={{ htmlInput: { "aria-label": `Add tickets to ${activeConfig.label}`, style: { fontFamily: MONO, fontSize: 16 } } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#FFFFFF" } }}
          />
          <Button
            variant="contained"
            onClick={() => addTickets(ticketInput)}
            disabled={!ticketInput.trim()}
            startIcon={<AddIcon />}
            sx={{ alignSelf: "flex-start", height: 56, px: 3, borderRadius: "10px", bgcolor: C.navy, fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#082C45" } }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.sub }}>
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </Typography>
          <Box>
            <Tooltip title="Sort">
              <span>
                <IconButton size="small" disabled={tickets.length < 2} onClick={() => setTierTickets(key, [...tickets].sort())} aria-label="Sort tickets">
                  <SortIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Copy all">
              <span>
                <IconButton size="small" disabled={tickets.length === 0} onClick={copyTickets} aria-label="Copy tickets">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Clear this prize">
              <span>
                <IconButton
                  size="small"
                  disabled={tickets.length === 0}
                  onClick={() => window.confirm(`Remove all ${tickets.length} tickets from ${activeConfig.label}?`) && setTierTickets(key, [])}
                  aria-label="Clear tickets"
                  sx={{ "&:hover": { color: C.red } }}
                >
                  <DeleteSweepIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {tickets.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 2, borderRadius: "12px", bgcolor: C.soft, border: `1px solid ${C.line}`, maxHeight: 360, overflowY: "auto" }}>
            {tickets.map(renderTicketChip)}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: "center", borderRadius: "12px", border: `2px dashed ${C.line}`, color: C.sub }}>
            <Typography sx={{ fontWeight: 700, color: C.ink, mb: 0.5 }}>No tickets yet</Typography>
            <Typography variant="body2">Paste the {activeConfig.label.toLowerCase()} numbers from the result sheet above.</Typography>
          </Box>
        )}
      </Box>
    );
  };

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  const progress = Math.round((filledCount / PRIZE_TIERS.length) * 100);
  const activeIssues = tierIssues[activeTier];

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header: what you are editing + overall progress */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: `1px solid ${C.line}`, overflow: "hidden", mb: 3 }}>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, background: "linear-gradient(135deg, #0B3C5D 0%, #134E77 100%)", color: "#FFFFFF" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>{formatLongDate(date)}</Typography>
              <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, lineHeight: 1.2 }}>
                {lottery?.name ?? lotteryCode}{" "}
                <Box component="span" sx={{ fontFamily: MONO, fontSize: "0.7em", opacity: 0.85 }}>
                  {form.draw_code}
                </Box>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={existing ? "In database" : "New — not saved yet"}
                sx={{ fontWeight: 700, bgcolor: existing ? "rgba(22,163,74,.25)" : "rgba(217,119,6,.3)", color: "#FFFFFF" }}
              />
              {isDirty && <Chip size="small" label="Unsaved changes" sx={{ fontWeight: 700, bgcolor: "#FBBF24", color: C.ink }} />}
            </Box>
          </Box>
          <Box sx={{ mt: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {filledCount} of {PRIZE_TIERS.length} prizes entered · {totalTickets} tickets
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{progress}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,.2)", "& .MuiLinearProgress-bar": { bgcolor: "#4ADE80", borderRadius: 4 } }}
            />
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Draw date" type="date" fullWidth size="small" value={date} onChange={(e) => handleDateChange(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Lottery" fullWidth size="small" value={lotteryCode} onChange={(e) => handleLotteryChange(e.target.value)}>
              {ALL_LOTTERIES.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.name} ({l.code}){l.is_bumper ? " · Bumper" : ` · ${l.day}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Draw code"
              placeholder={`${lotteryCode}-123`}
              fullWidth
              size="small"
              value={form.draw_code}
              onChange={(e) => setForm((prev) => ({ ...prev, draw_code: e.target.value.toUpperCase() }))}
              slotProps={{ htmlInput: { style: { fontFamily: MONO, fontWeight: 700 } } }}
            />
          </Grid>
          {drawsOnDate.length > 1 && (
            <Grid size={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.sub }}>Draws on this date:</Typography>
                {drawsOnDate.map((code) => {
                  const item = ALL_LOTTERIES.find((l) => l.code === code);
                  const selected = code === lotteryCode;
                  return (
                    <Chip
                      key={code}
                      label={`${item?.name ?? code}${item?.is_bumper ? " · Bumper" : ""}`}
                      onClick={selected ? undefined : () => handleLotteryChange(code)}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                      icon={item?.is_bumper ? <EmojiEventsIcon /> : undefined}
                      sx={{ fontWeight: 700 }}
                    />
                  );
                })}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {status && (
        <Alert severity={status.type} sx={{ mb: 3, borderRadius: "12px" }} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ p: 8, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>{renderSidebar()}</Grid>

          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            <Paper elevation={0} sx={{ borderRadius: "16px", border: `1px solid ${C.line}`, p: { xs: 2.5, sm: 3 } }}>
              {/* Active tier header: name, amount, expected format */}
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: C.sub, letterSpacing: 1 }}>
                    PRIZE {activeIndex + 1} OF {PRIZE_TIERS.length}
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: C.ink }}>{activeConfig.label}</Typography>
                  <Typography sx={{ fontSize: 13, color: C.sub }}>
                    Expected{isBumper ? " (bumper)" : ""}: {expectedKind(activeTier) === "full" ? "full tickets — series + 6 digits (KA 447257)" : "4-digit endings (4073)"}
                  </Typography>
                </Box>
                <TextField
                  label="Prize amount"
                  size="small"
                  value={form.amounts[activeTier]}
                  onChange={(e) => setAmount(activeTier, e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  sx={{ width: 200 }}
                />
              </Box>

              {activeIssues.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  {activeIssues.map((issue) => (
                    <Alert key={issue.message} severity={issue.level} sx={{ borderRadius: "10px", py: 0 }}>
                      {issue.message}
                    </Alert>
                  ))}
                </Box>
              )}

              {activeListKey ? renderListTier(activeListKey) : renderFirstPrize()}

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, pt: 2, borderTop: `1px solid ${C.line}` }}>
                <Button
                  startIcon={<ChevronLeftIcon />}
                  disabled={activeIndex === 0}
                  onClick={() => goToTier(-1)}
                  sx={{ fontWeight: 700, textTransform: "none", color: C.navy }}
                >
                  {PRIZE_TIERS[activeIndex - 1]?.label ?? "Previous"}
                </Button>
                <Button
                  endIcon={<ChevronRightIcon />}
                  disabled={activeIndex === PRIZE_TIERS.length - 1}
                  onClick={() => goToTier(1)}
                  sx={{ fontWeight: 700, textTransform: "none", color: C.navy }}
                >
                  {PRIZE_TIERS[activeIndex + 1]?.label ?? "Next"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Sticky action bar */}
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          borderTop: `1px solid ${C.line}`,
          bgcolor: "rgba(255,255,255,.96)",
          backdropFilter: "blur(8px)",
          px: { xs: 2, sm: 4 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          {errorCount > 0 ? (
            <Chip icon={<ErrorIcon />} label={`${errorCount} problem${errorCount > 1 ? "s" : ""}`} size="small" sx={{ fontWeight: 700, bgcolor: C.redSoft, color: "#991B1B", "& .MuiChip-icon": { color: C.red } }} />
          ) : (
            <Chip icon={<CheckCircleIcon />} label="No problems" size="small" sx={{ fontWeight: 700, bgcolor: C.greenSoft, color: "#166534", "& .MuiChip-icon": { color: C.green } }} />
          )}
          <Typography sx={{ fontSize: 13, color: C.sub, display: { xs: "none", sm: "block" } }} noWrap>
            {isDirty ? "Unsaved changes · Ctrl+S to save" : "All changes saved"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={reload} startIcon={<RefreshIcon />} disabled={isSaving || isLoading} sx={{ fontWeight: 700, textTransform: "none", color: C.sub }}>
            Reload
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            disabled={isSaving || isLoading || (!isDirty && Boolean(existing))}
            sx={{ bgcolor: C.green, fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 3, "&:hover": { bgcolor: "#15803D" } }}
          >
            {existing ? "Save changes" : "Save result"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
