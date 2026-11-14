"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0B3C5D", // Emblem Navy
      dark: "#0F2C59",
      light: "#3B82F6",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFB300", // Secondary Gold/Amber
      dark: "#F57F17",
      light: "#FFC107",
      contrastText: "#000000",
    },
    background: {
      default: "#F9FAFB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#4B5563",
    },
  },
  typography: {
    // --font-inter = self-hosted Inter from next/font (app/layout.tsx), with a metric-matched fallback.
    fontFamily: 'var(--font-inter), "Inter", "Source Sans 3", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 4, // Strictly 4px border-radius
  },
  components: {
    MuiTypography: {
      defaultProps: {
        // MUI renders subtitle1/subtitle2 as <h6> by default, which turned 118 small labels into
        // out-of-order headings (Lighthouse: "Heading elements are not in sequential order").
        // Styling comes from the variant class, so rendering them as <p> changes nothing visually.
        // Other variants keep MUI's default tags.
        variantMapping: { subtitle1: "p", subtitle2: "p" },
      },
    },
    MuiSkeleton: {
      // One consistent loading look across the site: soft brand-tinted shimmer ("wave") instead
      // of MUI's grey pulse. Respecting reduced-motion is handled in globals.css.
      defaultProps: { animation: "wave" },
      styleOverrides: {
        root: {
          backgroundColor: "#E8EEF5",
          "&::after": {
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent)",
          },
        },
        rounded: { borderRadius: "10px" },
        text: { borderRadius: "6px", transform: "scale(1, 0.72)" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #E5E7EB",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
        },
      },
    },
  },
});
