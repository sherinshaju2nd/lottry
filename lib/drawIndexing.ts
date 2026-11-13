/**
 * Decides which /{lottery}/{date} pages are worth indexing, so Google doesn't
 * spend crawl budget on empty "no result" pages ("Crawled – currently not indexed").
 * Announced bumper dates come from the `lotteries.draw_date` column (admin-managed).
 */

const WEEKLY_LOOKAHEAD_DAYS = 7;
/** Result pages older than this many days get `noindex, follow` and drop out of the sitemap. */
export const INDEX_WINDOW_DAYS = 60;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const getTodayIST = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

const daysBetween = (fromISO: string, toISO: string): number =>
  Math.round((Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86_400_000);

/** Oldest draw date (ISO, IST) that is still indexable: today − INDEX_WINDOW_DAYS. */
export const getIndexCutoffDate = (today: string = getTodayIST()): string =>
  new Date(Date.parse(`${today}T00:00:00Z`) - INDEX_WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10);

/** True when a draw date is more than INDEX_WINDOW_DAYS days in the past. */
export const isBeyondIndexWindow = (date: string, today: string = getTodayIST()): boolean =>
  daysBetween(date, today) > INDEX_WINDOW_DAYS;

interface IndexableDrawInput {
  date: string;
  /** Weekday name for weekly lotteries (e.g. "Monday"); undefined for bumpers. */
  weeklyDay?: string;
  /** The lottery's announced draw date from `lotteries.draw_date` (bumpers). */
  announcedDrawDate?: string | null;
  hasResult: boolean;
  isPostponed: boolean;
  today?: string;
}

export const isIndexableDrawPage = ({
  date,
  weeklyDay,
  announcedDrawDate,
  hasResult,
  isPostponed,
  today = getTodayIST(),
}: IndexableDrawInput): boolean => {
  // Old results: keep links followable but out of the index, even when a result exists
  if (isBeyondIndexWindow(date, today)) return false;
  if (hasResult || isPostponed || date === today) return true;
  if (date < today) return false; // past date with no published result

  if (announcedDrawDate === date) return true;
  if (!weeklyDay) return false; // unannounced future bumper date

  const drawWeekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return drawWeekday === weeklyDay && daysBetween(today, date) <= WEEKLY_LOOKAHEAD_DAYS;
};

/** "2026-11-28" → "28 November 2026" (IST-agnostic, date-only). */
export const formatDrawDateLong = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** "2026-11-28" → "28 Nov" */
export const formatDrawDateShort = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
