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
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): string[] {
  if (typeof window === "undefined" || !query.trim()) return [];
  try {
    const existing = getRecentSearches();
    const cleaned = query.trim();
    // Move to front & deduplicate
    const updated = [cleaned, ...existing.filter((q) => q.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore error
  }
}

// --- Saved Watchlist Helper ---
export function getSavedWatchlist(): SavedTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(ticketNumber: string, lotteryCode: string = "ALL"): SavedTicket[] {
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
  } catch {
    return [];
  }
}

export function removeFromWatchlist(id: string): SavedTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getSavedWatchlist();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearWatchlist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WATCHLIST_KEY);
  } catch {
    // Ignore error
  }
}
