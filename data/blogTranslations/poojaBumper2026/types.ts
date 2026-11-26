import type { SplitText } from "../types";

/**
 * Every visible string of the "Pooja Bumper Lottery 2026" article body.
 *
 * Strings may contain draw placeholders that the component fills at render time
 * (translators must keep them verbatim):
 *   {date}            long draw date, e.g. "28 November 2026"
 *   {dateShort}       short draw date
 *   {dateWithWeekday} weekday + long date (built from `draw.dateWithWeekday`)
 *   {time}            draw time, e.g. "2:00 PM"
 *   {drawUrl}         path of the draw result page (only inside link targets)
 * Fields marked "RichText" also support `**bold**` and `[text](href)` markup.
 */
export interface PoojaBumper2026Copy {
  /** Draw-value fallbacks and formatting. */
  draw: {
    /** Used for {date} when no draw date is announced. */
    fallbackDate: string;
    /** Used for {dateShort} when no draw date is announced. */
    fallbackDateShort: string;
    /** Used for {time} when the database has no draw time. */
    fallbackTime: string;
    /** Exactly 7 weekday names, Sunday first. */
    weekdays: string[];
    /** Pattern for {dateWithWeekday}; tokens {weekday} and {date}. */
    dateWithWeekday: string;
  };
  /** RichText. */
  intro: string;
  /** RichText with a link to {drawUrl}. */
  introNext: string;
  quickAnswer: {
    title: string;
    /** RichText. */
    summary: string;
    /** Label/value rows of the quick-facts box (values may use {date}/{time}). */
    facts: { label: string; value: string }[];
    cta: {
      heading: string;
      upcomingText: string;
      pastText: string;
      upcomingButton: string;
      pastButton: string;
    };
  };
  whatIs: {
    title: string;
    p1: string;
    p2: string;
    /** RichText. */
    p3: string;
  };
  ticketPrice: {
    title: string;
    /** RichText. */
    p1: string;
    p2: string;
    table: {
      caption: string;
      headers: { category: string; amount: string; winners: string };
      /** Exactly 10 rows, first prize first. */
      rows: { category: string; amount: string; winners: string }[];
    };
    p3: string;
    p4: string;
    p5: string;
  };
  checkResults: {
    title: string;
    p1: string;
    steps: string[];
    /** RichText. */
    p2: string;
    /** RichText. */
    p3: string;
  };
  drawDateTime: {
    title: string;
    boxHeading: string;
    /** Highlight links to the draw result page. */
    boxText: SplitText;
    /** Exactly four paragraphs. */
    paragraphs: string[];
  };
  buyTickets: { title: string; p1: string; items: string[]; p2: string };
  firstPrizeTax: {
    title: string;
    p1: string;
    /** RichText. */
    p2: string;
    items: string[];
    /** RichText. */
    p3: string;
  };
  claimPrize: {
    title: string;
    p1: string;
    steps: string[];
    /** RichText. */
    p2: string;
  };
  rules: { title: string; p1: string; items: string[]; p2: string };
  officialResults: {
    title: string;
    /** RichText. */
    p1: string;
    /** RichText. */
    p2: string;
    warningTitle: string;
    warning: string;
  };
  conclusion: {
    title: string;
    p1: string;
    /** RichText. */
    p2: string;
    buttons: { result: string; all: string; check: string };
  };
}
