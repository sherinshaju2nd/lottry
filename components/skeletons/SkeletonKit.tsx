"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Shared skeleton building blocks. Every route/page skeleton is composed from these so the
 * loading look is consistent site-wide (shimmer style comes from MuiSkeleton in lib/theme.ts).
 */

/** Skeleton colour for use on dark (navy) header banners. */
export const ON_DARK = { bgcolor: "rgba(255, 255, 255, 0.16)", "&::after": { background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" } } as const;

/** Wraps a skeleton so screen readers announce "Loading…" once instead of reading placeholders. */
export const LoadingRegion = ({ label = "Loading…", children, sx }: { label?: string; children: React.ReactNode; sx?: SxProps<Theme> }) => (
  <Box role="status" aria-live="polite" aria-busy="true" sx={sx}>
    <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
      {label}
    </Box>
    <Box aria-hidden="true">{children}</Box>
  </Box>
);

/** Paragraph placeholder: n lines, last one shorter, like real text. */
export const TextLines = ({ lines = 3, height = 18, lastWidth = "62%", sx }: { lines?: number; height?: number; lastWidth?: string; sx?: SxProps<Theme> }) => (
  <Box sx={sx}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} variant="text" height={height} width={i === lines - 1 ? lastWidth : `${96 - (i % 3) * 4}%`} />
    ))}
  </Box>
);

/** Dark gradient page header used by Articles & News and post pages. */
export const DarkBannerSkeleton = ({
  align = "center",
  withAuthor = false,
  minHeight,
}: {
  align?: "center" | "left";
  withAuthor?: boolean;
  /** Real header height in px at phone (xs) and desktop (md), so content below never moves. */
  minHeight?: { xs: number; md: number };
}) => {
  const mx = align === "center" ? "auto" : 0;
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #1E3A8A 100%)",
        pt: { xs: 4, md: 6 },
        pb: { xs: 7, md: 9 },
        minHeight,
        boxSizing: "border-box",
      }}
    >
      {/* Same width as the real header: MUI Container "lg" (1152px content at desktop). */}
      <Container maxWidth="lg" sx={{ textAlign: align }}>
        <Skeleton variant="text" width={180} height={20} sx={{ ...ON_DARK, mx, mb: 2 }} />
        <Skeleton variant="rounded" width={200} height={30} sx={{ ...ON_DARK, mx, mb: 2, borderRadius: "16px" }} />
        <Skeleton variant="text" height={56} sx={{ ...ON_DARK, mx, width: { xs: "92%", md: "62%" } }} />
        <Skeleton variant="text" height={56} sx={{ ...ON_DARK, mx, width: { xs: "70%", md: "44%" }, display: { md: align === "left" ? "block" : "none" } }} />
        <Skeleton variant="text" height={22} sx={{ ...ON_DARK, mx, mt: 1.5, width: { xs: "88%", md: "56%" } }} />
        <Skeleton variant="text" height={22} sx={{ ...ON_DARK, mx, width: { xs: "60%", md: "40%" } }} />
        {withAuthor && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Skeleton variant="circular" width={44} height={44} sx={ON_DARK} />
              <Box>
                <Skeleton variant="text" width={130} height={20} sx={ON_DARK} />
                <Skeleton variant="text" width={90} height={16} sx={ON_DARK} />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rounded" width={88} height={32} sx={ON_DARK} />
              <Skeleton variant="rounded" width={104} height={32} sx={{ ...ON_DARK, display: { xs: "none", sm: "block" } }} />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

/** Same shape as components/posts/PostCard (1200x630 cover, 3-line title, 3-line text, footer). */
export const PostCardSkeleton = () => (
  <Paper elevation={0} sx={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%" }}>
    <Skeleton variant="rectangular" sx={{ width: "100%", height: "auto", aspectRatio: "1200 / 630", borderRadius: 0 }} />
    <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Skeleton variant="text" height={26} width="92%" />
      <Skeleton variant="text" height={26} width="70%" sx={{ mb: 1 }} />
      <TextLines lines={3} height={18} lastWidth="55%" />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, mt: 1.5, borderTop: "1px solid #F1F5F9" }}>
        <Skeleton variant="text" width={96} height={18} />
        <Skeleton variant="rounded" width={104} height={30} sx={{ borderRadius: "999px" }} />
      </Box>
    </Box>
  </Paper>
);

/** Responsive grid of post card skeletons (1 / 2 / 3 columns, like the real grid). */
export const PostCardGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" } }}>
    {Array.from({ length: count }, (_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </Box>
);

/** White rounded card shell used by most skeleton sections. */
export const CardShell = ({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) => (
  <Paper
    elevation={0}
    sx={[
      { p: { xs: 2.5, md: 3.5 }, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" },
      ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
    ]}
  >
    {children}
  </Paper>
);
