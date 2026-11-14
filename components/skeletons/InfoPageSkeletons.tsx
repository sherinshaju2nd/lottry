"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { LoadingRegion, ON_DARK, TextLines } from "./SkeletonKit";

/**
 * Loading skeletons for the information pages. Each one copies its page's real container widths,
 * paddings, header heights, colours and card shapes (measured at 375px and 1366px), so the page
 * replaces the skeleton in place without the layout jumping.
 */

const CARD_BORDER = "1px solid #E5E7EB";

type Responsive = { xs: number; md: number };

/**
 * Centred page title block used by Contact / FAQ / Guide / Claim. All values are the real
 * page's measured box sizes (px) at phone (xs) and desktop (md) widths.
 */
const CenteredTitle = ({
  h1Height,
  gap = 16,
  lineHeight,
  lines,
  subtitleMax,
  mb,
  chip = false,
  extra,
}: {
  h1Height: Responsive;
  gap?: number;
  lineHeight: Responsive;
  lines: Responsive;
  subtitleMax: number;
  mb: number;
  chip?: boolean;
  /** Optional second paragraph under the subtitle (Contact). */
  extra?: { gap: number; lineHeight: number; lines: Responsive };
}) => {
  const maxLines = Math.max(lines.xs, lines.md);
  const extraMax = extra ? Math.max(extra.lines.xs, extra.lines.md) : 0;
  return (
    <Box sx={{ textAlign: "center", mb: `${mb}px` }}>
      {chip && <Skeleton variant="rounded" width={170} height={24} sx={{ mx: "auto", mb: "12px", borderRadius: "16px", bgcolor: "#DBEAFE" }} />}
      <Skeleton variant="text" sx={{ mx: "auto", width: { xs: "88%", md: "62%" }, height: h1Height }} />
      <Box sx={{ maxWidth: subtitleMax, mx: "auto", mt: `${gap}px` }}>
        {Array.from({ length: maxLines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            sx={{
              mx: "auto",
              height: lineHeight,
              // Show exactly as many lines as the real subtitle wraps to at each width.
              display: { xs: i < lines.xs ? "block" : "none", md: i < lines.md ? "block" : "none" },
              width: { xs: i === lines.xs - 1 ? "68%" : "100%", md: i === lines.md - 1 ? "68%" : "100%" },
            }}
          />
        ))}
      </Box>
      {extra && (
        <Box sx={{ maxWidth: subtitleMax, mx: "auto", mt: `${extra.gap}px` }}>
          {Array.from({ length: extraMax }, (_, i) => (
            <Skeleton
              key={i}
              variant="text"
              height={extra.lineHeight}
              sx={{
                mx: "auto",
                display: { xs: i < extra.lines.xs ? "block" : "none", md: i < extra.lines.md ? "block" : "none" },
                width: i === extraMax - 1 ? "55%" : "92%",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------------------------------------
// Privacy Policy / Terms & Conditions / Disclaimer: white card with title inside.
// ---------------------------------------------------------------------------------------------
export const LegalDocumentSkeleton = () => (
  <LoadingRegion>
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
      {/* Measured: title 72px (desktop), intro 4 lines x 27px, sections every 157px (36px heading,
          12px gap, 3 lines x 27px, 28px gap). Card is ~3400px tall on desktop. */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 6 }, borderRadius: "24px", border: CARD_BORDER, bgcolor: "#FFFFFF", minHeight: { xs: 4200, md: 3409 }, boxSizing: "border-box" }}>
        <Skeleton variant="text" sx={{ width: { xs: "75%", md: "55%" }, height: { xs: 48, md: 72 }, mb: 1 }} />
        <Skeleton variant="text" width={190} height={20} sx={{ mb: 4 }} />
        <TextLines lines={4} height={27.2} sx={{ mb: 3 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Box key={i}>
              <Skeleton variant="text" sx={{ width: { xs: "70%", md: "42%" }, height: { xs: 30, md: 36 }, mb: 1.5 }} />
              <TextLines lines={3} height={27.2} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// About: teal-navy gradient hero, overlapping intro card, section pills, section cards.
// ---------------------------------------------------------------------------------------------
export const AboutSkeleton = () => (
  <LoadingRegion sx={{ bgcolor: "#F8FAFC", pb: { xs: 6, md: 10 } }}>
    <Box
      sx={{
        background: "linear-gradient(135deg, #0B3C5D 0%, #1E5A85 60%, #0F766E 100%)",
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        minHeight: { xs: 611, md: 546 },
        boxSizing: "border-box",
      }}
    >
      <Container maxWidth="md">
        <Skeleton variant="rounded" width={240} height={30} sx={{ ...ON_DARK, borderRadius: "16px", mb: "19px" }} />
        <Skeleton variant="text" sx={{ ...ON_DARK, width: { xs: "60%", md: "40%" }, height: { xs: 42, md: 62 } }} />
        <Box sx={{ mt: 2, maxWidth: 720 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="text" height={30} sx={{ ...ON_DARK, width: i === 3 ? "55%" : "100%" }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, mt: 4, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" width={160} height={46} sx={{ bgcolor: "rgba(255,255,255,0.85)", borderRadius: "12px" }} />
          <Skeleton variant="rounded" width={170} height={46} sx={{ ...ON_DARK, borderRadius: "12px" }} />
        </Box>
      </Container>
    </Box>
    <Container maxWidth="md" sx={{ mt: { xs: -5, md: -7 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: CARD_BORDER, bgcolor: "#FFFFFF", boxShadow: "0 20px 40px -24px rgba(15,23,42,0.25)" }}>
        <TextLines lines={4} height={28} />
      </Paper>
      <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {[150, 110, 130, 190, 160, 100].map((w, i) => (
          <Skeleton key={i} variant="rounded" width={w} height={34} sx={{ borderRadius: "999px" }} />
        ))}
      </Box>
      {Array.from({ length: 2 }, (_, i) => (
        <Paper
          key={i}
          elevation={0}
          // First card = "Who runs this site" (measured 998px phone / 551px desktop).
          sx={{ mt: { xs: 5, md: 7 }, p: { xs: 3, md: 4 }, borderRadius: "24px", border: CARD_BORDER, bgcolor: "#FFFFFF", minHeight: i === 0 ? { xs: 998, md: 551 } : undefined, boxSizing: "border-box" }}
        >
          <Skeleton variant="text" sx={{ width: { xs: "70%", md: "45%" }, height: 46, mb: 2 }} />
          <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", sm: "row" } }}>
            {i === 0 && <Skeleton variant="rounded" sx={{ width: { xs: 160, sm: 200 }, height: { xs: 200, sm: 250 }, borderRadius: "20px", flexShrink: 0 }} />}
            <TextLines lines={6} height={28} sx={{ flex: 1 }} />
          </Box>
        </Paper>
      ))}
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Support (Buy us a coffee): dark hero with gold glow, then two-column cards overlapping it.
// ---------------------------------------------------------------------------------------------
export const SupportSkeleton = () => (
  <LoadingRegion sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 8, md: 12 } }}>
    <Box
      sx={{
        background: "linear-gradient(135deg, #090D16 0%, #171C2D 50%, #0F172A 100%)",
        pt: { xs: 6, md: 9 },
        pb: { xs: 8, md: 12 },
        minHeight: { xs: 612, md: 510 },
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Skeleton variant="rounded" width={250} height={30} sx={{ mx: "auto", mb: "22px", borderRadius: "16px", bgcolor: "rgba(245,158,11,0.18)" }} />
        <Skeleton variant="text" sx={{ ...ON_DARK, mx: "auto", width: { xs: "70%", md: "48%" }, height: { xs: 40, md: 64 } }} />
        <Skeleton variant="text" sx={{ ...ON_DARK, mx: "auto", mt: 1, width: { xs: "90%", md: "75%" }, height: 30 }} />
        <Box sx={{ maxWidth: 680, mx: "auto", mt: 1.5 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} variant="text" height={26} sx={{ ...ON_DARK, mx: "auto", width: i === 2 ? "60%" : "100%" }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" width={230} height={50} sx={{ bgcolor: "rgba(245,158,11,0.55)", borderRadius: "14px" }} />
          <Skeleton variant="rounded" width={170} height={50} sx={{ ...ON_DARK, borderRadius: "14px" }} />
        </Box>
      </Container>
    </Box>
    <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: CARD_BORDER, bgcolor: "#FFFFFF", minHeight: { xs: 774, md: 570 } }}>
        <Skeleton variant="text" width="55%" height={36} sx={{ mb: 2 }} />
        {Array.from({ length: 4 }, (_, i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Skeleton variant="rounded" width={44} height={44} sx={{ flexShrink: 0 }} />
            <TextLines lines={2} height={22} sx={{ flex: 1 }} />
          </Box>
        ))}
      </Paper>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", bgcolor: "#0F172A", minHeight: 420, textAlign: "center" }}>
        <Skeleton variant="text" width="60%" height={30} sx={{ ...ON_DARK, mx: "auto", mb: 2 }} />
        <Skeleton variant="rounded" width={200} height={200} sx={{ mx: "auto", borderRadius: "16px", bgcolor: "rgba(255,255,255,0.9)" }} />
        <Skeleton variant="rounded" height={46} sx={{ ...ON_DARK, mt: 3, borderRadius: "12px" }} />
      </Paper>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// App download page: whole page dark, centred two-line title, dark glass cards.
// ---------------------------------------------------------------------------------------------
export const AppPageSkeleton = () => (
  <LoadingRegion sx={{ bgcolor: "#090D16", minHeight: "100vh", pb: 10 }}>
    <Box sx={{ bgcolor: "rgba(15, 23, 42, 0.4)", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="rounded" width={120} height={30} sx={ON_DARK} />
        <Skeleton variant="rounded" width={150} height={28} sx={{ ...ON_DARK, borderRadius: "16px" }} />
      </Container>
    </Box>
    <Container maxWidth="lg" sx={{ pt: { xs: 4, sm: 6 }, pb: 4, textAlign: "center" }}>
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 3, flexWrap: "wrap" }}>
        {[130, 120, 150].map((w, i) => (
          <Skeleton key={i} variant="rounded" width={w} height={28} sx={{ ...ON_DARK, borderRadius: "16px" }} />
        ))}
      </Box>
      <Skeleton variant="text" sx={{ ...ON_DARK, mx: "auto", width: { xs: "80%", md: "46%" }, height: { xs: 37, md: 62 } }} />
      <Skeleton variant="text" sx={{ ...ON_DARK, mx: "auto", width: { xs: "68%", md: "40%" }, height: { xs: 37, md: 62 }, bgcolor: "rgba(56,189,248,0.22)" }} />
      <Box sx={{ maxWidth: 760, mx: "auto", mt: 2 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="text" height={24} sx={{ ...ON_DARK, mx: "auto", width: i === 2 ? "55%" : "100%" }} />
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 4, flexWrap: "wrap" }}>
        {[150, 150, 170].map((w, i) => (
          <Skeleton key={i} variant="rounded" width={w} height={44} sx={{ ...ON_DARK, borderRadius: "12px" }} />
        ))}
      </Box>
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mt: 6, textAlign: "left" }}>
        {Array.from({ length: 2 }, (_, i) => (
          <Paper key={i} elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "18px", bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 360 }}>
            <Skeleton variant="rounded" width={140} height={26} sx={{ ...ON_DARK, borderRadius: "16px", mb: 2 }} />
            <Skeleton variant="text" width="70%" height={38} sx={ON_DARK} />
            <Box sx={{ mt: 2 }}>
              {Array.from({ length: 5 }, (_, j) => (
                <Skeleton key={j} variant="text" height={24} sx={{ ...ON_DARK, width: `${92 - j * 8}%` }} />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Contact: white card with badge + centred title, green/blue contact cards, grey helpline panel.
// ---------------------------------------------------------------------------------------------
export const ContactSkeleton = () => (
  <LoadingRegion>
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Real card: 2204px tall on phones, 1229px on desktop */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: "24px", border: CARD_BORDER, bgcolor: "#FFFFFF", minHeight: { xs: 2204, md: 1229 }, boxSizing: "border-box" }}>
        <CenteredTitle
          chip
          h1Height={{ xs: 37, md: 51 }}
          gap={8}
          lineHeight={{ xs: 28, md: 32 }}
          lines={{ xs: 2, md: 1 }}
          extra={{ gap: 12, lineHeight: 26, lines: { xs: 4, md: 2 } }}
          subtitleMax={660}
          mb={32}
        />
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {["#F0FDF4", "#EFF6FF"].map((bg) => (
            <Box key={bg} sx={{ bgcolor: bg, borderRadius: "16px", p: 3, height: 272, boxSizing: "border-box" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Skeleton variant="rounded" width={44} height={44} sx={{ bgcolor: "rgba(255,255,255,0.8)" }} />
                <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "999px", bgcolor: "rgba(255,255,255,0.8)" }} />
              </Box>
              <Skeleton variant="text" width="60%" height={30} sx={{ bgcolor: "rgba(15,23,42,0.08)" }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: "rgba(15,23,42,0.06)" }} />
              <Skeleton variant="text" width="55%" height={34} sx={{ bgcolor: "rgba(15,23,42,0.08)", mb: 2 }} />
              <Skeleton variant="rounded" height={44} sx={{ bgcolor: "rgba(15,23,42,0.1)", borderRadius: "10px" }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ bgcolor: "#F9FAFB", borderRadius: "16px", p: 3, mt: 4, border: "1px solid #F1F5F9" }}>
          <Skeleton variant="text" width={220} height={30} sx={{ mb: 2 }} />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            {[0, 1].map((i) => (
              <Skeleton key={i} variant="rounded" height={86} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px" }} />
            ))}
          </Box>
        </Box>
      </Paper>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// FAQ: centred title + accordion rows.
// ---------------------------------------------------------------------------------------------
export const FaqSkeleton = () => (
  <LoadingRegion>
    <Container maxWidth="md" sx={{ py: 6 }}>
      <CenteredTitle h1Height={{ xs: 75, md: 51 }} lineHeight={{ xs: 32, md: 32 }} lines={{ xs: 4, md: 3 }} subtitleMax={600} mb={48} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <Paper key={i} elevation={0} sx={{ height: 66, px: 3, borderRadius: "12px", border: CARD_BORDER, bgcolor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
            <Skeleton variant="text" height={24} sx={{ width: `${70 - (i % 3) * 12}%` }} />
            <Skeleton variant="circular" width={22} height={22} />
          </Paper>
        ))}
      </Box>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Guide: centred title + two columns (white / light grey) + grey panel.
// ---------------------------------------------------------------------------------------------
export const GuidePageSkeleton = () => (
  <LoadingRegion>
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <CenteredTitle h1Height={{ xs: 75, md: 51 }} lineHeight={{ xs: 32, md: 32 }} lines={{ xs: 4, md: 2 }} subtitleMax={700} mb={48} />
      <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {["#FFFFFF", "#F9FAFB"].map((bg, c) => (
          <Paper key={bg} elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px", border: CARD_BORDER, bgcolor: bg, minHeight: { xs: 976, md: 889 }, boxSizing: "border-box" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} />
              <Skeleton variant="text" width="55%" height={32} />
            </Box>
            {c === 0 ? (
              <>
                <TextLines lines={4} height={24} sx={{ mb: 2 }} />
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} variant="text" height={24} sx={{ width: `${90 - (i % 3) * 10}%` }} />
                ))}
              </>
            ) : (
              Array.from({ length: 7 }, (_, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E5E7EB" }}>
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "8px" }} />
                </Box>
              ))
            )}
          </Paper>
        ))}
      </Box>
      <Skeleton variant="rounded" height={170} sx={{ mt: 4, borderRadius: "12px", bgcolor: "#F1F5F9" }} />
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Claim: centred title, pink notice panel with three white cards, then the calculator card.
// ---------------------------------------------------------------------------------------------
export const ClaimPageSkeleton = () => (
  <LoadingRegion>
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <CenteredTitle h1Height={{ xs: 69, md: 51 }} lineHeight={{ xs: 24.3, md: 28.2 }} lines={{ xs: 4, md: 2 }} subtitleMax={750} mb={40} />
      <Box sx={{ bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "16px", p: { xs: 2.5, md: 3.5 }, mb: 5, minHeight: { xs: 642, md: 288 }, boxSizing: "border-box" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: "rgba(220,38,38,0.15)" }} />
          <Skeleton variant="text" height={32} sx={{ width: { xs: "75%", md: "40%" }, bgcolor: "rgba(220,38,38,0.12)" }} />
        </Box>
        <Skeleton variant="text" height={20} sx={{ width: { xs: "90%", md: "55%" }, mb: 2, bgcolor: "rgba(220,38,38,0.08)" }} />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {[0, 1, 2].map((i) => (
            <Paper key={i} elevation={0} sx={{ height: 150, p: 2, borderRadius: "10px", border: "1px solid #FECACA", bgcolor: "#FFFFFF", boxSizing: "border-box" }}>
              <Skeleton variant="text" width="60%" height={26} />
              <TextLines lines={3} height={20} />
            </Paper>
          ))}
        </Box>
      </Box>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "20px", border: CARD_BORDER, bgcolor: "#FFFFFF", minHeight: 600 }}>
        <Skeleton variant="text" height={36} sx={{ width: { xs: "80%", md: "40%" }, mb: 2 }} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          {[110, 120, 130, 140, 120].map((w, i) => (
            <Skeleton key={i} variant="rounded" width={w} height={36} sx={{ borderRadius: "10px" }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={56} sx={{ mb: 3, borderRadius: "12px" }} />
        <TextLines lines={6} height={24} />
      </Paper>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Search (ticket checker): desktop badges + title + form card; phones show the form card only.
// ---------------------------------------------------------------------------------------------
export const SearchSkeleton = () => (
  <LoadingRegion label="Loading ticket checker…">
    <Container maxWidth="md" sx={{ pt: { xs: 2.5, md: 4 }, pb: 6, px: { xs: 2, sm: 4 } }}>
      {/* Desktop only (the real page hides this header on phones). Card starts at y=204 like the real one. */}
      <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "center", mb: "25px" }}>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: "26px" }}>
          <Skeleton variant="rounded" width={190} height={26} sx={{ borderRadius: "16px", bgcolor: "#DCFCE7" }} />
          <Skeleton variant="rounded" width={120} height={26} sx={{ borderRadius: "16px", bgcolor: "#FEF3C7" }} />
        </Box>
        <Skeleton variant="text" width="58%" height={43} sx={{ mx: "auto" }} />
        <Skeleton variant="text" width="72%" height={22} sx={{ mx: "auto", mt: 1 }} />
        <Skeleton variant="text" width="50%" height={22} sx={{ mx: "auto" }} />
      </Box>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "22px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", minHeight: { xs: 402, md: 383 }, boxSizing: "border-box" }}>
        <Box sx={{ display: "flex", gap: 1, p: 0.5, bgcolor: "#F1F5F9", borderRadius: "12px", mb: 3 }}>
          <Skeleton variant="rounded" height={44} sx={{ flex: 1, bgcolor: "#FFFFFF" }} />
          <Skeleton variant="rounded" height={44} sx={{ flex: 1, bgcolor: "transparent" }} />
        </Box>
        <Skeleton variant="text" width={200} height={22} />
        <Skeleton variant="rounded" height={56} sx={{ mb: 2.5, borderRadius: "12px" }} />
        <Skeleton variant="text" width={220} height={22} />
        <Skeleton variant="rounded" height={56} sx={{ mb: 3, borderRadius: "12px" }} />
        <Skeleton variant="rounded" height={52} sx={{ borderRadius: "12px", bgcolor: "#CBD5E1" }} />
      </Paper>
    </Container>
  </LoadingRegion>
);
