/**
 * Browser helpers for the admin sync buttons (header + API Sources tab).
 * All writes happen on the server in /api/sync; these only call it and shape the reply.
 */

export interface SyncedDraw {
  draw_name?: string;
  draw_code?: string;
  draw_date?: string;
  first?: { ticket?: string };
}

export interface SourceSyncReply {
  sourceId: string;
  name: string;
  success: boolean;
  error?: string;
  data?: SyncedDraw;
}

export interface SyncAllReply {
  success: boolean;
  message: string;
  results: SourceSyncReply[];
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export interface AdminApiSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

/** Fired after the API Sources tab saves the list, so the header buttons reload names/order. */
export const API_SOURCES_CHANGED_EVENT = "admin:api-sources-changed";
/** Fired after any sync wrote to the database, so the dashboard reloads draws and logs. */
export const DRAWS_SYNCED_EVENT = "admin:draws-synced";

export const notifyAdmin = (eventName: string): void => {
  window.dispatchEvent(new Event(eventName));
};

/** Saved API sources in priority order. Throws with the server's message on failure. */
export const fetchAdminApiSources = async (): Promise<AdminApiSource[]> => {
  const res = await fetch("/api/admin/api-sources", { cache: "no-store" });
  const json = (await res.json()) as { success?: boolean; sources?: AdminApiSource[]; error?: string };
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.sources ?? [];
};

/** "Saved Karunya KR-774 (2026-10-31) · 1st KG 501790" */
export const describeSyncedDraw = (data?: SyncedDraw): string => {
  const { draw_name = "Draw", draw_code = "", draw_date = "", first } = data ?? {};
  const firstPart = first?.ticket ? ` · 1st ${first.ticket}` : " · numbers not out yet";
  return `Saved ${draw_name} ${draw_code} (${draw_date})${firstPart}`;
};

/** Sync one saved API source to the database. Throws with the server's message on failure. */
export const requestSourceSync = async (sourceId: string): Promise<SyncedDraw | undefined> => {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceId }),
  });
  const json = (await res.json()) as { success?: boolean; error?: string; data?: SyncedDraw };
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data;
};

/** Sync every enabled saved source (priority #1 saved last). Never throws. */
export const requestSyncAll = async (): Promise<SyncAllReply> => {
  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const json = (await res.json()) as Partial<SyncAllReply> & { error?: string };
    return {
      success: Boolean(json.success),
      message: json.message ?? json.error ?? `HTTP ${res.status}`,
      results: json.results ?? [],
    };
  } catch (err: unknown) {
    console.error("[adminSync] sync all failed:", errorMessage(err));
    return { success: false, message: `Sync all failed: ${errorMessage(err)}`, results: [] };
  }
};
