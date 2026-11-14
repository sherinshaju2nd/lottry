/**
 * Email alerts for lottery result API sources (server-only).
 *
 * Called after every sync attempt (cron, admin header button, per-source "Sync"). For each source
 * it compares this run with the last known state (kept in `app_config`, since serverless memory
 * does not survive between invocations) and emails the team when:
 *   - a source starts failing                      → "API source failed"
 *   - it is still failing ALERT_REPEAT_MINUTES on  → reminder (default every 30 min, not every cron tick)
 *   - every enabled source failed in this run      → "ALL API sources down" (critical)
 *   - a failing source answers again               → "recovered"
 * Works for any number of sources: they are tracked by id, so new backups are covered automatically.
 *
 * Never throws: alerting must never break or delay a result sync beyond the SMTP call itself.
 */
import { supabaseServer, updateCronConfigInSupabase } from "./supabase";
import { sendMail, type MailResult } from "./mailer";
import type { SourceAttempt } from "./apiSources";

const ALERT_STATE_KEY = "api_source_alert_state";
const DEFAULT_REPEAT_MINUTES = 30;
const ADMIN_URL = `${(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in").replace(/\/$/, "")}/admin`;

export type AlertTrigger = "cron" | "admin-sync" | "admin-source-sync" | "test";

export interface SourceAlertState {
  name: string;
  failing: boolean;
  failingSince?: string;
  lastAlertAt?: string;
  lastError?: string;
}
export type AlertState = Record<string, SourceAlertState>;

export interface FailedRow {
  id: string;
  name: string;
  url: string;
  error: string;
  status?: number;
  ms: number;
  failingSince: string;
  reminder: boolean;
}

const repeatMinutes = (): number => {
  const value = Number(process.env.ALERT_REPEAT_MINUTES);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_REPEAT_MINUTES;
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);

const formatIST = (iso: string): string =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" });

const TRIGGER_LABEL: Record<AlertTrigger, string> = {
  cron: "Automatic cron sync",
  "admin-sync": "Admin “Sync” (all sources)",
  "admin-source-sync": "Admin “Sync” on one source",
  test: "Test email from the admin panel",
};

const loadState = async (): Promise<AlertState> => {
  try {
    const { data, error } = await supabaseServer.from("app_config").select("value").eq("key", ALERT_STATE_KEY).limit(1);
    if (error) throw new Error(error.message);
    const raw = data?.[0]?.value;
    return raw ? (JSON.parse(raw) as AlertState) : {};
  } catch (err: unknown) {
    console.warn("[sourceAlerts] could not load alert state:", err instanceof Error ? err.message : String(err));
    return {};
  }
};

const saveState = async (state: AlertState): Promise<void> => {
  const result = await updateCronConfigInSupabase({ [ALERT_STATE_KEY]: JSON.stringify(state) });
  if (!result.success) console.warn("[sourceAlerts] could not save alert state:", result.error);
};

// ---------------------------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------------------------

const layout = ({ accent, badge, title, intro, body }: { accent: string; badge: string; title: string; intro: string; body: string }) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#F1F5F9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0">
  <tr><td style="background:#0B3C5D;padding:20px 24px;color:#FFFFFF">
    <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.8">Kerala Lottery Result Today · API monitor</div>
    <div style="margin-top:10px"><span style="display:inline-block;background:${accent};color:#FFFFFF;font-weight:800;font-size:12px;padding:4px 10px;border-radius:999px">${badge}</span></div>
    <div style="font-size:21px;font-weight:800;margin-top:10px;line-height:1.3">${title}</div>
  </td></tr>
  <tr><td style="padding:20px 24px;font-size:14px;line-height:1.6;color:#334155">${intro}</td></tr>
  <tr><td style="padding:0 24px 8px">${body}</td></tr>
  <tr><td style="padding:16px 24px 24px">
    <a href="${ADMIN_URL}" style="display:inline-block;background:#0B3C5D;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:10px">Open Admin → API Sources</a>
  </td></tr>
  <tr><td style="padding:14px 24px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;line-height:1.5">
    While a source keeps failing you get a reminder every ${repeatMinutes()} minutes, and one email when it recovers.
    Results keep syncing from any source that still works.
  </td></tr>
</table></td></tr></table></body></html>`;

const sourceCard = (row: FailedRow): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #FECACA;background:#FEF2F2;border-radius:10px;margin:0 0 12px">
  <tr><td style="padding:12px 14px;font-size:13px;line-height:1.6;color:#334155">
    <div style="font-size:15px;font-weight:800;color:#991B1B">${escapeHtml(row.name)}${row.reminder ? ' <span style="font-weight:600;color:#B45309">(still failing)</span>' : ""}</div>
    <div style="word-break:break-all;color:#475569">${escapeHtml(row.url)}</div>
    <div style="margin-top:6px"><b>Error:</b> ${escapeHtml(row.error)}</div>
    <div><b>HTTP status:</b> ${row.status ?? "—"} &nbsp;·&nbsp; <b>Response time:</b> ${(row.ms / 1000).toFixed(1)}s</div>
    <div><b>Failing since:</b> ${formatIST(row.failingSince)} IST</div>
  </td></tr>
</table>`;

const recoveredList = (names: string[]): string =>
  names.length
    ? `<div style="margin:4px 0 12px;font-size:13px;color:#166534;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:10px 14px">✅ Working again: <b>${names.map(escapeHtml).join(", ")}</b></div>`
    : "";

export const buildFailureEmail = ({ failed, recovered, allFailed, usedSource, trigger, total }: { failed: FailedRow[]; recovered: string[]; allFailed: boolean; usedSource?: string; trigger: AlertTrigger; total: number }) => {
  const names = failed.map(({ name }) => name).join(", ");
  const now = new Date().toISOString();
  const subject = allFailed
    ? `🔴 ALL lottery API sources are down (${failed.length}/${total})`
    : `⚠️ Lottery API source failed: ${names}`;
  const intro = `${allFailed
    ? "<b style=\"color:#991B1B\">No API source returned a usable result.</b> New results will not appear on the site until a source recovers or a result is entered manually in the admin panel."
    : `<b>${failed.length} of ${total}</b> API source(s) failed.${usedSource ? ` Results are still syncing from <b>${escapeHtml(usedSource)}</b>.` : ""}`}
    <br><span style="color:#64748B">${TRIGGER_LABEL[trigger]} · ${formatIST(now)} IST</span>`;
  const html = layout({
    accent: allFailed ? "#DC2626" : "#D97706",
    badge: allFailed ? "CRITICAL · ALL SOURCES DOWN" : "WARNING · SOURCE FAILED",
    title: allFailed ? "All lottery API sources are down" : `API source failed: ${escapeHtml(names)}`,
    intro,
    body: failed.map(sourceCard).join("") + recoveredList(recovered),
  });
  const text = [
    allFailed ? "ALL lottery API sources are down." : `${failed.length} of ${total} API source(s) failed.${usedSource ? ` Still syncing from ${usedSource}.` : ""}`,
    `${TRIGGER_LABEL[trigger]} · ${formatIST(now)} IST`,
    "",
    ...failed.map((row) => `- ${row.name}${row.reminder ? " (still failing)" : ""}\n  ${row.url}\n  Error: ${row.error} | HTTP ${row.status ?? "-"} | ${(row.ms / 1000).toFixed(1)}s | since ${formatIST(row.failingSince)} IST`),
    recovered.length ? `\nWorking again: ${recovered.join(", ")}` : "",
    `\nAdmin: ${ADMIN_URL}`,
  ].join("\n");
  return { subject, html, text };
};

export const buildRecoveryEmail = (recovered: string[], trigger: AlertTrigger) => {
  const subject = `✅ Lottery API source recovered: ${recovered.join(", ")}`;
  const html = layout({
    accent: "#16A34A",
    badge: "RECOVERED",
    title: `Working again: ${escapeHtml(recovered.join(", "))}`,
    intro: `All previously failing API sources are answering again.<br><span style="color:#64748B">${TRIGGER_LABEL[trigger]} · ${formatIST(new Date().toISOString())} IST</span>`,
    body: recoveredList(recovered),
  });
  const text = `Working again: ${recovered.join(", ")}\n${TRIGGER_LABEL[trigger]}\nAdmin: ${ADMIN_URL}`;
  return { subject, html, text };
};

// ---------------------------------------------------------------------------------------------
// Decision logic (pure: no I/O, so it can be tested offline)
// ---------------------------------------------------------------------------------------------

/**
 * Works out which sources need an email this run and the next stored state.
 *  - newly failing → alert now
 *  - still failing → alert again only when `repeatMs` has passed since the last *sent* alert
 *    (a failed send is retried on the next run, and is not labelled "still failing")
 *  - previously failing and now OK → recovered
 */
export const evaluateSourceAlerts = (
  previous: AlertState,
  attempts: SourceAttempt[],
  now: Date,
  repeatMs: number,
): { state: AlertState; failed: FailedRow[]; recovered: string[] } => {
  const state: AlertState = { ...previous };
  const failed: FailedRow[] = [];
  const recovered: string[] = [];
  const nowIso = now.toISOString();

  for (const { source, ok, ms, status, error } of attempts) {
    const before = previous[source.id];
    if (ok) {
      if (before?.failing) recovered.push(source.name);
      state[source.id] = { name: source.name, failing: false };
      continue;
    }
    const wasFailing = Boolean(before?.failing);
    const failingSince = wasFailing && before?.failingSince ? before.failingSince : nowIso;
    const lastAlertAt = wasFailing ? before?.lastAlertAt : undefined;
    const alertedBefore = Boolean(lastAlertAt);
    const due = !alertedBefore || now.getTime() - Date.parse(lastAlertAt as string) >= repeatMs;
    const errorText = error ?? "Unknown error";
    state[source.id] = { name: source.name, failing: true, failingSince, lastAlertAt, lastError: errorText };
    if (due) {
      failed.push({ id: source.id, name: source.name, url: source.url, error: errorText, status, ms, failingSince, reminder: alertedBefore });
    }
  }
  return { state, failed, recovered };
};

// ---------------------------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------------------------

/**
 * Compare this run's source attempts with the stored state and email the team when needed.
 * `usedSource` is the source whose result was used (if any); `allSourcesTried` means the attempts
 * cover every enabled source (cron / header sync), so "all failed" can be judged.
 */
export const notifySourceFailures = async ({
  attempts,
  trigger,
  usedSource,
  allSourcesTried,
}: {
  attempts: SourceAttempt[];
  trigger: AlertTrigger;
  usedSource?: string;
  allSourcesTried: boolean;
}): Promise<MailResult | null> => {
  try {
    if (attempts.length === 0) return null;
    const previousState = await loadState();
    const now = new Date();
    const { state, failed, recovered } = evaluateSourceAlerts(previousState, attempts, now, repeatMinutes() * 60_000);

    const allFailed = allSourcesTried && attempts.every(({ ok }) => !ok);
    let mail: MailResult | null = null;

    if (failed.length > 0) {
      mail = await sendMail(buildFailureEmail({ failed, recovered, allFailed, usedSource, trigger, total: attempts.length }));
      if (mail.sent) {
        const nowIso = now.toISOString();
        failed.forEach(({ id }) => {
          state[id] = { ...state[id], lastAlertAt: nowIso };
        });
      }
    } else if (recovered.length > 0) {
      mail = await sendMail(buildRecoveryEmail(recovered, trigger));
    }

    // Only write when something changed (not on every healthy cron tick).
    if (JSON.stringify(state) !== JSON.stringify(previousState)) await saveState(state);
    return mail;
  } catch (err: unknown) {
    console.error("[sourceAlerts] alert check failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
};

/** Admin "Send test email": sends a sample alert so SMTP settings and recipients can be checked. */
export const sendTestSourceAlert = async (): Promise<MailResult> => {
  const nowIso = new Date().toISOString();
  return sendMail(
    buildFailureEmail({
      failed: [{ id: "test", name: "Example source (TEST — nothing is wrong)", url: "https://example.com/api/klr/latest", error: "HTTP 522 (source server down)", status: 522, ms: 12000, failingSince: nowIso, reminder: false }],
      recovered: [],
      allFailed: false,
      usedSource: "India Lottery API",
      trigger: "test",
      total: 2,
    }),
  );
};
