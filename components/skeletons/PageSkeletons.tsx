"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { HERO_CARD_OVERLAY, HERO_OVERLAY } from "@/lib/heroBanner";
import HeroBannerImage from "@/components/HeroBannerImage";
import { CardShell, DarkBannerSkeleton, LoadingRegion, ON_DARK, PostCardGridSkeleton, TextLines } from "./SkeletonKit";

/**
 * Route-level skeletons, one per page type. Each mirrors the real page's structure (header,
 * columns, card shapes) so content replaces it in place, with no jump. Used by loading.tsx files
 * and by in-page loading states.
 */

// ---------------------------------------------------------------------------------------------
// Homepage: phone "normal" view (<900px) and desktop dashboard (>=900px), same CSS breakpoint.
// ---------------------------------------------------------------------------------------------
/** Hero artwork + fade shared with components/HomeDesktopModernView (lib/heroBanner). */
const ON_HERO = { bgcolor: "rgba(11, 60, 93, 0.12)" } as const;
const NAVY_PRIZE = "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #1E3A8A 100%)";

/**
 * Homepage loading UI. Positions are the loaded page's measured boxes:
 *  phone (375px):    featured card 130+49 · "Recent draws" row · 2-col tiles (navy 80 + date 41, 12px gaps)
 *  desktop (1366px): 450px hero (toggle y146, H1 y210, checker y406) · grid md 8/4 from y506
 */
export const HomeSkeleton = () => (
  <LoadingRegion label="Loading today's results…" sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
    {/* Phone (<900px) */}
    <Box sx={{ display: { xs: "block", md: "none" }, px: 2, pt: 2, pb: 4 }}>
      <Paper elevation={0} sx={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ bgcolor: "#0B3C5D", height: 130, boxSizing: "border-box", pt: "22px", px: 2, textAlign: "center", position: "relative", isolation: "isolate" }}>
          <HeroBannerImage variant="compact" zIndex={-1} />
          <Box sx={{ position: "absolute", inset: 0, zIndex: -1, background: HERO_CARD_OVERLAY }} />
          <Skeleton variant="rounded" width={34} height={22} sx={{ position: "absolute", top: 10, right: 10, borderRadius: "6px", bgcolor: "rgba(37,99,235,0.6)" }} />
          <Skeleton variant="text" width="78%" height={27} sx={{ ...ON_DARK, mx: "auto" }} />
          <Skeleton variant="text" width="82%" height={27} sx={{ ...ON_DARK, mx: "auto" }} />
          <Skeleton variant="rounded" width={157} height={27} sx={{ ...ON_DARK, mx: "auto", mt: 1, borderRadius: "20px" }} />
        </Box>
        <Box sx={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Skeleton variant="text" width={120} height={26} />
        </Box>
      </Paper>
      <Box sx={{ height: 22, display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: "6px" }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <Paper key={i} elevation={0} sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E2E8F0" }}>
            <Box sx={{ bgcolor: "#0B3C5D", height: 80, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Skeleton variant="rounded" width={44} height={20} sx={{ position: "absolute", top: 6, right: 6, borderRadius: "6px", bgcolor: "rgba(37,99,235,0.6)" }} />
              <Skeleton variant="text" width="64%" height={20} sx={ON_DARK} />
            </Box>
            <Box sx={{ height: 41, display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid #E2E8F0", boxSizing: "border-box" }}>
              <Skeleton variant="text" width="58%" height={22} />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>

    {/* Desktop (>=900px) */}
    <Box sx={{ display: { xs: "none", md: "block" } }}>
      <Box
        sx={{
          height: 450,
          position: "relative",
          bgcolor: "#EAF4F1",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: HERO_OVERLAY,
            zIndex: 1,
          },
        }}
      >
        {/* Same responsive artwork as the real hero (same srcset → same cached file, no re-download). */}
        <HeroBannerImage />
        <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
          {/* Today's Draw / Yesterday's Result toggle */}
          <Box sx={{ position: "absolute", top: 146, left: "50%", transform: "translateX(-50%)", width: 378, height: 49, boxSizing: "border-box", p: "6px", gap: "4px", display: "flex", borderRadius: "999px", bgcolor: "rgba(255,255,255,0.92)", border: "1px solid #E2E8F0" }}>
            <Skeleton variant="rounded" height={37} sx={{ flex: 1, borderRadius: "999px", ...ON_HERO }} />
            <Skeleton variant="rounded" height={37} sx={{ flex: 1.2, borderRadius: "999px", bgcolor: "rgba(11,60,93,0.55)" }} />
          </Box>
          {/* H1, draw line, "Result Confirmed" chip (rounded blocks: exact boxes, no text scaling) */}
          <Skeleton variant="rounded" height={50} sx={{ ...ON_HERO, position: "absolute", top: 216, left: "50%", transform: "translateX(-50%)", width: "min(768px, 80%)", borderRadius: "12px" }} />
          <Skeleton variant="rounded" width={555} height={18} sx={{ ...ON_HERO, position: "absolute", top: 289, left: "50%", transform: "translateX(-50%)" }} />
          <Skeleton variant="rounded" width={140} height={26} sx={{ position: "absolute", top: 327, left: "50%", transform: "translateX(-50%)", borderRadius: "999px", bgcolor: "#D1FAE5" }} />
          {/* "Check your ticket" bar, overlapping the hero's bottom edge */}
          <Paper elevation={0} sx={{ position: "absolute", top: 406, left: "50%", transform: "translateX(-50%)", width: "min(1040px, calc(100% - 80px))", height: 88, boxSizing: "border-box", px: 4, borderRadius: "18px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", display: "flex", alignItems: "center", gap: 2, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
            <Skeleton variant="rounded" width={28} height={28} />
            <Box sx={{ width: 240 }}>
              <Skeleton variant="text" height={20} width="70%" />
              <Skeleton variant="text" height={14} width="90%" />
            </Box>
            <Skeleton variant="rounded" height={56} sx={{ flex: 1, borderRadius: "12px", bgcolor: "#F1F5F9" }} />
            <Skeleton variant="rounded" width={187} height={50} sx={{ borderRadius: "12px", bgcolor: "rgba(11,60,93,0.55)" }} />
          </Paper>
        </Box>
      </Box>

      <Box sx={{ pt: 7, px: 5, pb: 6 }}>
        <Grid container spacing={3.5}>
          {/* Winning numbers */}
          <Grid size={{ xs: 12, md: 8 }}>
            <CardShell sx={{ p: 3.5, minHeight: 1400, boxSizing: "border-box" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: 71 }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "12px", bgcolor: "#FEF3C7" }} />
                  <Box>
                    <Skeleton variant="text" width={200} height={30} />
                    <Skeleton variant="text" width={300} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rounded" width={185} height={24} sx={{ borderRadius: "999px", bgcolor: "#ECFDF5" }} />
              </Box>
              <Box sx={{ height: 164, borderRadius: "16px", background: NAVY_PRIZE, px: 4, display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box>
                  <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: "6px", bgcolor: "rgba(217,179,16,0.35)", mb: 1 }} />
                  <Skeleton variant="text" width={300} height={56} sx={ON_DARK} />
                </Box>
                <Box sx={{ width: 260 }}>
                  <Skeleton variant="text" width={110} height={20} sx={{ ...ON_DARK, ml: "auto" }} />
                  <Skeleton variant="text" width={170} height={48} sx={{ ...ON_DARK, ml: "auto" }} />
                </Box>
              </Box>
              {Array.from({ length: 4 }, (_, s) => (
                <Box key={s} sx={{ mb: 3 }}>
                  <Skeleton variant="text" width={220} height={24} sx={{ mb: 1.5 }} />
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 1.5 }}>
                    {Array.from({ length: s === 0 ? 10 : 5 }, (_, i) => (
                      <Skeleton key={i} variant="rounded" height={47} sx={{ borderRadius: "10px", bgcolor: "#F1F5F9" }} />
                    ))}
                  </Box>
                </Box>
              ))}
            </CardShell>
          </Grid>
          {/* Draw details */}
          <Grid size={{ xs: 12, md: 4 }}>
            <CardShell sx={{ p: 3.5, minHeight: 665, boxSizing: "border-box" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2.5 }}>
                <Skeleton variant="text" width={140} height={28} />
                <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "999px", bgcolor: "#ECFDF5" }} />
              </Box>
              {Array.from({ length: 5 }, (_, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 44, borderBottom: "1px solid #F1F5F9" }}>
                  <Skeleton variant="text" width="34%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              ))}
              <Skeleton variant="text" width={120} height={26} sx={{ mt: 3, mb: 1.5 }} />
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: "12px", mb: 1.25 }} />
              ))}
            </CardShell>
          </Grid>
        </Grid>
      </Box>
    </Box>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Articles & News listing (/blog): header, filters, featured card, post grid.
// ---------------------------------------------------------------------------------------------
export const PostsListSkeleton = () => (
  <LoadingRegion label="Loading articles…" sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
    {/* Measured (phone / desktop): header 365/362, filters 118/74, featured 560/367, heading row 31/36. */}
    <DarkBannerSkeleton minHeight={{ xs: 365, md: 362 }} />
    <Container maxWidth="lg" sx={{ mt: -4 }}>
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 4, minHeight: { xs: 118, md: 74 }, boxSizing: "border-box", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" } }}>
        <Box sx={{ display: "flex", gap: 1, flex: 1, overflow: "hidden" }}>
          {[48, 110, 76, 108, 128].map((w, i) => (
            <Skeleton key={i} variant="rounded" width={w} height={32} sx={{ borderRadius: "16px", flexShrink: 0 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={40} sx={{ width: { xs: "100%", md: 280 }, borderRadius: "12px" }} />
      </Paper>
      <CardShell sx={{ mb: 6, p: { xs: 3, sm: 4.5 }, minHeight: { xs: 560, md: 367 }, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <Skeleton variant="rounded" width={120} height={26} sx={{ borderRadius: "16px" }} />
          <Skeleton variant="rounded" width={110} height={26} sx={{ borderRadius: "16px" }} />
        </Box>
        <Skeleton variant="text" height={44} sx={{ width: { xs: "95%", md: "70%" } }} />
        <TextLines lines={2} height={20} sx={{ mt: 1, mb: 2.5, maxWidth: 900 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2.5, borderTop: "1px solid #F1F5F9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="circular" width={42} height={42} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>
          <Skeleton variant="rounded" width={140} height={40} />
        </Box>
      </CardShell>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, height: { xs: 31, md: 36 } }}>
        <Skeleton variant="text" width={240} height={30} />
        <Skeleton variant="rounded" width={70} height={26} sx={{ borderRadius: "999px" }} />
      </Box>
      <PostCardGridSkeleton count={3} />
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// Single guide / news article: header, sidebar (contents + checker card), article body.
// ---------------------------------------------------------------------------------------------
export const PostDetailSkeleton = () => (
  <LoadingRegion label="Loading article…" sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 10 }}>
    {/* Measured (phone / desktop): header 711/504; contents card 543; checker card 159. On phones
        the sidebar sits above the article, exactly like PostDetailLayout's Grid. */}
    <DarkBannerSkeleton align="left" withAuthor minHeight={{ xs: 711, md: 504 }} />
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CardShell sx={{ p: 3, mb: 3, minHeight: 543, boxSizing: "border-box", borderRadius: "18px" }}>
            <Skeleton variant="text" width={150} height={26} sx={{ mb: 1.5 }} />
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} variant="text" height={34} width={`${88 - (i % 3) * 12}%`} />
            ))}
          </CardShell>
          <Box sx={{ height: 159, borderRadius: "16px", background: "linear-gradient(135deg, #0F2C59 0%, #1E3A8A 100%)", p: 2.5, boxSizing: "border-box", textAlign: "center" }}>
            <Skeleton variant="text" width="60%" height={22} sx={{ ...ON_DARK, mx: "auto" }} />
            <Skeleton variant="text" width="80%" height={18} sx={{ ...ON_DARK, mx: "auto", mb: 1.5 }} />
            <Skeleton variant="rounded" height={38} sx={{ borderRadius: "8px", bgcolor: "rgba(217,179,16,0.7)" }} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
      <CardShell sx={{ p: { xs: 3, sm: 4.5 } }}>
        <TextLines lines={4} height={20} sx={{ mb: 3 }} />
        {Array.from({ length: 3 }, (_, i) => (
          <Box key={i} sx={{ mb: 3.5 }}>
            <Skeleton variant="text" height={34} sx={{ width: { xs: "70%", md: "50%" }, mb: 0.5 }} />
            <TextLines lines={4} height={18} />
          </Box>
        ))}
      </CardShell>
        </Grid>
      </Grid>
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// /lotteries list (inside its server layout's heading + schedule table).
// ---------------------------------------------------------------------------------------------
/** Same shape as the /lotteries cards (measured 229px phone / 227px desktop, 7 per tab). */
export const LotteryListRowsSkeleton = ({ rows = 7 }: { rows?: number }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {Array.from({ length: rows }, (_, i) => (
      <Paper key={i} elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, minHeight: { xs: 229, md: 227 }, boxSizing: "border-box", borderRadius: "16px", border: "1.5px solid #E2E8F0", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Code badge + weekday chip, draw time on the right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="rounded" width={36} height={26} sx={{ borderRadius: "8px", bgcolor: "#CBD5E1" }} />
          <Skeleton variant="rounded" width={96} height={26} sx={{ borderRadius: "8px", bgcolor: "#E0F2FE" }} />
          <Skeleton variant="rounded" width={84} height={26} sx={{ ml: "auto", borderRadius: "999px" }} />
        </Box>
        {/* Logo + English / Malayalam name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: "12px", flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" height={30} sx={{ width: { xs: "62%", md: "34%" } }} />
            <Skeleton variant="text" height={22} sx={{ width: { xs: "40%", md: "22%" } }} />
          </Box>
        </Box>
        {/* Prize + ticket price chips */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={140} height={30} sx={{ borderRadius: "8px", bgcolor: "#E0F2FE" }} />
          <Skeleton variant="rounded" width={60} height={30} sx={{ borderRadius: "8px" }} />
        </Box>
        {/* Footer: draw info + "View results" link */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, mt: "auto", borderTop: "1px solid #F1F5F9" }}>
          <Skeleton variant="text" width={110} height={18} />
          <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: "999px" }} />
        </Box>
      </Paper>
    ))}
  </Box>
);

export const LotteriesSkeleton = () => (
  <LoadingRegion label="Loading lotteries…">
    <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 2.5 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ display: "flex", gap: "4px", p: "4px", bgcolor: "#E2E8F0", borderRadius: "14px", mb: 2.5 }}>
        <Skeleton variant="rounded" sx={{ flex: 1, height: { xs: 37, md: 39 }, bgcolor: "#CBD5E1" }} />
        <Skeleton variant="rounded" sx={{ flex: 1, height: { xs: 37, md: 39 }, bgcolor: "transparent" }} />
      </Box>
      <LotteryListRowsSkeleton />
    </Container>
  </LoadingRegion>
);

// ---------------------------------------------------------------------------------------------
// /analytics: header, tab bar + range selector, then the statistics cards.
// ---------------------------------------------------------------------------------------------
/** Card title row used by every statistics card: icon tile + title + one-line subtitle. */
const StatCardTitle = ({ width = 220 }: { width?: number }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "10px", flexShrink: 0, bgcolor: "#E0F2FE" }} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Skeleton variant="text" height={28} sx={{ width: { xs: "80%", md: width } }} />
      <Skeleton variant="text" height={18} sx={{ width: { xs: "60%", md: Math.round(width * 1.4) } }} />
    </Box>
  </Box>
);

/** Ranked number tiles (Hot 4-digit endings / Hot 2-digit pairs): 2 columns of 64px tiles. */
const NumberTiles = ({ count }: { count: number }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: "12px", bgcolor: i < 2 ? "#FEF3C7" : undefined }} />
    ))}
  </Box>
);

/**
 * In-page loading state for /analytics (number explorer + Hot 4-digit + Hot 2-digit + single
 * digit cards). Card heights are the loaded page's measured sizes (375px / 1366px).
 */
export const AnalyticsContentSkeleton = () => (
  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" } }}>
    {/* 4-digit combination history checker */}
    <CardShell sx={{ gridColumn: "1 / -1", minHeight: { xs: 761, md: 428 }, boxSizing: "border-box" }}>
      <StatCardTitle width={280} />
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, mb: 3 }}>
        <Box sx={{ height: 170, borderRadius: "14px", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 1, sm: 1.5 } }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="rounded" sx={{ width: { xs: 52, sm: 60 }, height: { xs: 72, sm: 84 }, borderRadius: "12px", bgcolor: "#E2E8F0" }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ height: 108, borderRadius: "12px", border: "1px solid #DCFCE7", bgcolor: "#F0FDF4", p: 2, boxSizing: "border-box" }}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="rounded" height={8} sx={{ borderRadius: "999px", my: 1.5 }} />
            <Skeleton variant="text" width="55%" height={18} />
          </Box>
          <Skeleton variant="rounded" height={49} sx={{ borderRadius: "12px", bgcolor: "#CBD5E1" }} />
        </Box>
      </Box>
      <Skeleton variant="text" width={150} height={18} sx={{ mb: 1 }} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} variant="rounded" width={56} height={30} sx={{ borderRadius: "8px" }} />
        ))}
      </Box>
    </CardShell>

    {/* Hot 4-digit endings / Hot 2-digit pairs */}
    <CardShell sx={{ minHeight: { xs: 412, md: 419 }, boxSizing: "border-box" }}>
      <StatCardTitle />
      <NumberTiles count={8} />
    </CardShell>
    <CardShell sx={{ minHeight: { xs: 569, md: 419 }, boxSizing: "border-box" }}>
      <StatCardTitle />
      <NumberTiles count={8} />
    </CardShell>

    {/* Single last-digit (0-9) frequency */}
    <CardShell sx={{ gridColumn: "1 / -1", minHeight: { xs: 332, md: 305 }, boxSizing: "border-box" }}>
      <StatCardTitle width={300} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(5, minmax(0, 1fr))", md: "repeat(10, minmax(0, 1fr))" }, gap: 1.5 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "12px" }} />
        ))}
      </Box>
    </CardShell>
  </Box>
);

/**
 * /analytics route loading UI: navy header (449px phone / 265px desktop), tab bar + draw-range
 * selector, then the statistics cards, all at the loaded page's measured positions.
 */
export const AnalyticsSkeleton = () => (
  <LoadingRegion label="Loading statistics…" sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
    <Box sx={{ bgcolor: "#0B3C5D", py: 4, height: { xs: 449, md: 265 }, overflow: "hidden", boxSizing: "border-box" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "flex-start" }, gap: 2.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="rounded" width={150} height={24} sx={{ borderRadius: "8px", mb: 1, bgcolor: "rgba(34,197,94,0.25)" }} />
          <Skeleton variant="rounded" width={130} height={22} sx={{ ...ON_DARK, borderRadius: "6px", mb: 2 }} />
          <Skeleton variant="text" height={44} sx={{ ...ON_DARK, width: { xs: "90%", md: "70%" } }} />
          <Skeleton variant="text" height={44} sx={{ ...ON_DARK, width: { xs: "75%", md: "24%" } }} />
          <Skeleton variant="text" height={44} sx={{ ...ON_DARK, width: "50%", display: { md: "none" } }} />
          <Skeleton variant="text" height={22} sx={{ ...ON_DARK, mt: 1, width: { xs: "96%", md: "62%" } }} />
          <Skeleton variant="text" height={22} sx={{ ...ON_DARK, width: { xs: "88%", md: "48%" } }} />
          <Skeleton variant="text" height={22} sx={{ ...ON_DARK, width: "40%", display: { md: "none" } }} />
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <Skeleton variant="rounded" width={132} height={44} sx={{ ...ON_DARK, borderRadius: "12px" }} />
          <Skeleton variant="rounded" width={116} height={44} sx={{ ...ON_DARK, borderRadius: "12px" }} />
          <Skeleton variant="circular" width={36} height={36} sx={ON_DARK} />
          <Skeleton variant="circular" width={36} height={36} sx={ON_DARK} />
        </Box>
      </Container>
    </Box>
    <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, mt: 3 }}>
      {/* Tabs (Number Trends / District Winners) + draw-range selector */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, justifyContent: "space-between", alignItems: { md: "center" }, mb: 3 }}>
        <Box sx={{ display: "flex", gap: "4px", p: "4px", bgcolor: "#E2E8F0", borderRadius: "14px", width: { xs: "100%", md: 348 }, height: { xs: 44, md: 46 }, boxSizing: "border-box" }}>
          <Skeleton variant="rounded" sx={{ flex: 1, height: "100%", bgcolor: "#FFFFFF", borderRadius: "10px" }} />
          <Box sx={{ flex: 1 }} />
        </Box>
        <Box sx={{ display: "flex", gap: "4px", p: "4px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", width: { xs: "100%", md: 345 }, height: { xs: 40, md: 41 }, boxSizing: "border-box" }}>
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="rounded" sx={{ flex: 1, height: "100%", bgcolor: "#CBD5E1", borderRadius: "8px" }} />
          <Box sx={{ flex: 1 }} />
        </Box>
      </Box>
      <AnalyticsContentSkeleton />
    </Container>
  </LoadingRegion>
);
