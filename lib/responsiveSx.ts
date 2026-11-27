/** Shared responsive `sx` helpers for MUI components. */

/** Hides a table cell on phones (xs) and shows it from `sm` up. */
export const HIDE_ON_MOBILE_CELL = {
  display: { xs: "none", sm: "table-cell" },
} as const;

/** Minimum comfortable touch target height (WCAG / Material guidance). */
export const MIN_TAP_SIZE = 44;
