"use client";

export interface SavedTicket {
  id: string;
  ticketNumber: string;
  lotteryCode?: string;
  dateAdded: string;
}

const RECENT_SEARCHES_KEY = "kerala_lottery_recent_searches_v1";
const WATCHLIST_KEY = "kerala_lottery_watchlist_v1";

// --- Recent Searches Helper ---
export const getRecentSearches = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("getRecentSearches localStorage read error:", msg);
    return [];
  }
};

export const addRecentSearch = (query: string): string[] => {
  if (typeof window === "undefined" || !query.trim()) return [];
  try {
    const existing = getRecentSearches();
    const cleaned = query.trim();
    // Move to front & deduplicate
    const updated = [cleaned, ...existing.filter((q) => q.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("addRecentSearch localStorage write error:", msg);
    return [];
  }
};

export const clearRecentSearches = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("clearRecentSearches localStorage error:", msg);
  }
};

// --- Saved Watchlist Helper ---
export const getSavedWatchlist = (): SavedTicket[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? (JSON.parse(raw) as SavedTicket[]) : [];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("getSavedWatchlist localStorage read error:", msg);
    return [];
  }
};

export const addToWatchlist = (ticketNumber: string, lotteryCode: string = "ALL"): SavedTicket[] => {
  if (typeof window === "undefined" || !ticketNumber.trim()) return [];
  try {
    const existing = getSavedWatchlist();
    const cleaned = ticketNumber.trim();
    if (existing.some((t) => t.ticketNumber.toLowerCase() === cleaned.toLowerCase())) {
      return existing;
    }
    const newItem: SavedTicket = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticketNumber: cleaned,
      lotteryCode,
      dateAdded: new Date().toISOString().split("T")[0],
    };
    const updated = [newItem, ...existing];
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("addToWatchlist localStorage write error:", msg);
    return [];
  }
};

export const removeFromWatchlist = (id: string): SavedTicket[] => {
  if (typeof window === "undefined") return [];
  try {
    const existing = getSavedWatchlist();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("removeFromWatchlist localStorage write error:", msg);
    return [];
  }
};

export const clearWatchlist = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WATCHLIST_KEY);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("clearWatchlist localStorage error:", msg);
  }
};
