"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { LoadingRegion, ON_DARK, TextLines } from "@/components/skeletons/SkeletonKit";

/**
 * Draw result (/{lottery}/{date}) loading UI. Phone and desktop use different real layouts, so
 * each has its own band stack with the measured heights/gaps (375px / 1366px):
 *  phone:   navy app bar 111 · info 286 · navy prize 269 · checker 221 · 254 · 126 · 126
 *  desktop: top bar · title · info 158 · navy prize 280 · checker 170 · 2×160 · 2×249
 */
const NAVY_PRIZE = "linear-gradient(135deg, #0B3C5D 0%, #0F2C59 60%, #1E3A8A 100%)";
const CARD = { bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", boxSizing: "border-box" } as const;

const PrizeCard = ({ height }: { height: number }) => (
  <Box sx={{ height, borderRadius: "16px", background: NAVY_PRIZE, p: { xs: 2, md: 3 }, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Skeleton variant="rounded" width={140} height={28} sx={{ borderRadius: "8px", bgcolor: "rgba(217,179,16,0.35)" }} />
      <Skeleton variant="rounded" width={80} height={32} sx={{ ...ON_DARK, borderRadius: "8px" }} />
    </Box>
    <Skeleton variant="text" sx={{ ...ON_DARK, width: { xs: "70%", md: "32%" }, height: { xs: 40, md: 56 } }} />
    <Box sx={{ borderRadius: "12px", bgcolor: "rgba(255,255,255,0.08)", height: { xs: 96, md: 103 }, p: 2, boxSizing: "border-box" }}>
      <Skeleton variant="text" width={160} height={16} sx={ON_DARK} />
      <Skeleton variant="text" width={200} height={38} sx={ON_DARK} />
    </Box>
  </Box>
);

const InfoCard = ({ height }: { height: number | { xs: number; md: number } }) => (
  <Paper elevation={0} sx={{ ...CARD, height, p: { xs: 2, md: 2.5 } }}>
    <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
      <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: "6px", bgcolor: "#DBEAFE" }} />
      <Skeleton variant="rounded" width={150} height={24} sx={{ borderRadius: "6px" }} />
      <Skeleton variant="rounded" width={130} height={24} sx={{ borderRadius: "6px", bgcolor: "#DCFCE7" }} />
    </Box>
    <Skeleton variant="text" sx={{ width: { xs: "65%", md: "28%" }, height: { xs: 34, md: 30 } }} />
    <TextLines lines={2} height={20} sx={{ maxWidth: 620 }} />
  </Paper>
);

const PlainCard = ({ height }: { height: number }) => (
  <Paper elevation={0} sx={{ ...CARD, height, p: 2.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton variant="text" width="45%" height={26} />
    </Box>
    <TextLines lines={2} height={18} sx={{ mb: 1.5 }} />
    <Skeleton variant="rounded" height={44} sx={{ borderRadius: "10px" }} />
  </Paper>
);

export default function Loading() {
  return (
    <LoadingRegion label="Loading draw result…" sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: { xs: 12, md: 6 } }}>
      {/* Phone (<900px) */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", px: 1.5, pt: 1.5 }}>
        <Box sx={{ height: 111, borderRadius: "16px", background: NAVY_PRIZE, p: 1.5, boxSizing: "border-box", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Skeleton variant="circular" width={32} height={32} sx={ON_DARK} />
            <Skeleton variant="rounded" width={40} height={40} sx={{ ...ON_DARK, borderRadius: "10px" }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="45%" height={20} sx={ON_DARK} />
              <Skeleton variant="text" width="30%" height={16} sx={ON_DARK} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[60, 96, 110].map((w, i) => (
              <Skeleton key={i} variant="rounded" width={w} height={24} sx={{ ...ON_DARK, borderRadius: "6px" }} />
            ))}
          </Box>
        </Box>
        <Box sx={{ mb: "20px" }}>
          <InfoCard height={286} />
        </Box>
        <Box sx={{ mb: "21px" }}>
          <PrizeCard height={269} />
        </Box>
        <Box sx={{ mb: "19px" }}>
          <PlainCard height={221} />
        </Box>
        <Box sx={{ mb: 2 }}>
          <PlainCard height={254} />
        </Box>
        <Paper elevation={0} sx={{ ...CARD, height: 126, mb: 2 }} />
        <Paper elevation={0} sx={{ ...CARD, height: 126 }} />
      </Box>

      {/* Desktop (>=900px) */}
      <Box sx={{ display: { xs: "none", md: "block" }, px: 5, pt: 5 }}>
        <Box sx={{ height: 38, display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "2px" }}>
          <Box sx={{ display: "flex", gap: 1, height: 24, alignItems: "center" }}>
            <Skeleton variant="text" width={46} height={20} />
            <Skeleton variant="text" width={110} height={20} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>
          <Skeleton variant="rounded" width={190} height={38} sx={{ borderRadius: "8px" }} />
        </Box>
        {/* Title row (logo + title + subtitle): 88px, then info card at y=188 */}
        <Box sx={{ height: 88, display: "flex", alignItems: "center", gap: 2, mb: "20px" }}>
          <Skeleton variant="rounded" width={76} height={76} sx={{ borderRadius: "16px", flexShrink: 0 }} />
          <Box>
            <Skeleton variant="text" width={380} height={42} />
            <Skeleton variant="text" width={300} height={18} />
          </Box>
        </Box>
        <Box sx={{ mb: 4 }}>
          <InfoCard height={158} />
        </Box>
        <Box sx={{ mb: "28px" }}>
          <PrizeCard height={280} />
        </Box>
        <Box sx={{ mb: "28px" }}>
          <PlainCard height={170} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 3, rowGap: 3 }}>
          <PlainCard height={160} />
          <PlainCard height={160} />
          <PlainCard height={249} />
          <PlainCard height={249} />
        </Box>
      </Box>
    </LoadingRegion>
  );
}
