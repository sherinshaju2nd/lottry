"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { LoadingRegion, ON_DARK } from "@/components/skeletons/SkeletonKit";

/**
 * Lottery archive (/{lottery}) loading UI. Section bands use the real page's measured heights
 * (phone 375px / desktop 1366px) so the page replaces the skeleton without any jump:
 * header → navy "latest draw" banner → search bar → results table.
 */
const NAVY_BANNER = "linear-gradient(135deg, #071E33 0%, #0B3C5D 60%, #082D4A 100%)";
const CARD = { bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px" } as const;

export default function Loading() {
  return (
    <LoadingRegion label="Loading lottery results…" sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pt: { xs: 2, md: 5 }, pb: 6, px: { xs: 2, md: 5 } }}>
      {/* Breadcrumb */}
      <Box sx={{ height: 24, display: "flex", gap: 1, alignItems: "center", mb: { xs: 2, md: 2.5 } }}>
        <Skeleton variant="text" width={46} height={20} />
        <Skeleton variant="text" width={180} height={20} />
      </Box>

      {/* Header: badges, logo + title + details, view toggle (279px phone / 145px desktop) */}
      <Box sx={{ height: { xs: 279, md: 145 }, mb: { xs: 2, md: 2.5 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ display: "flex", gap: 1, mb: 1, justifyContent: { xs: "center", md: "flex-start" }, pl: { md: "102px" } }}>
          <Skeleton variant="rounded" width={140} height={22} sx={{ borderRadius: "999px", bgcolor: "#DCFCE7" }} />
          <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "999px", bgcolor: "#DBEAFE" }} />
        </Box>
        <Skeleton variant="rounded" width={130} height={22} sx={{ display: { md: "none" }, mx: "auto", mb: 2, borderRadius: "999px", bgcolor: "#FEF3C7" }} />
        <Box sx={{ display: "flex", gap: { xs: 2, md: "22px" }, alignItems: "flex-start" }}>
          <Skeleton variant="rounded" sx={{ width: { xs: 60, md: 80 }, height: { xs: 60, md: 80 }, borderRadius: "14px", flexShrink: 0, mt: "2px" }} />
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 855 }}>
            <Skeleton variant="text" sx={{ height: { xs: 27, md: 43 }, width: "92%" }} />
            <Skeleton variant="text" sx={{ height: { xs: 27, md: 43 }, width: "64%" }} />
            <Skeleton variant="text" sx={{ height: 27, width: "55%", display: { md: "none" } }} />
            <Skeleton variant="text" sx={{ height: 21, width: { xs: "100%", md: "70%" }, mt: 0.5 }} />
            <Skeleton variant="text" sx={{ height: 21, width: "80%", display: { md: "none" } }} />
          </Box>
          <Skeleton variant="rounded" width={230} height={40} sx={{ display: { xs: "none", md: "block" }, borderRadius: "10px", flexShrink: 0 }} />
        </Box>
        <Skeleton variant="rounded" height={44} sx={{ display: { md: "none" }, position: "absolute", left: 0, right: 0, bottom: 5, borderRadius: "10px" }} />
      </Box>

      {/* Navy "latest draw" banner (266px phone / 120px desktop) */}
      <Box
        sx={{
          height: { xs: 266, md: 120 },
          mb: 3,
          borderRadius: "14px",
          background: NAVY_BANNER,
          p: { xs: 2, md: 2.5 },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Skeleton variant="rounded" width={90} height={20} sx={{ ...ON_DARK, borderRadius: "6px" }} />
            <Skeleton variant="rounded" width={60} height={20} sx={{ ...ON_DARK, borderRadius: "6px" }} />
          </Box>
          <Skeleton variant="text" width={130} height={28} sx={ON_DARK} />
          <Skeleton variant="text" width={180} height={18} sx={ON_DARK} />
        </Box>
        <Box sx={{ width: { xs: "100%", md: 506 }, height: { xs: 87, md: 78 }, borderRadius: "10px", bgcolor: "rgba(0,0,0,0.25)", flexShrink: 0 }} />
        <Skeleton variant="rounded" sx={{ ...ON_DARK, width: { xs: "100%", md: 190 }, height: 44, borderRadius: "10px", flexShrink: 0, bgcolor: "rgba(2,132,199,0.55)" }} />
      </Box>

      {/* Search bar (111px phone / 74px desktop) */}
      <Paper elevation={0} sx={{ ...CARD, height: { xs: 111, md: 74 }, mb: 2, px: 2, boxSizing: "border-box", display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "center", alignItems: { md: "center" }, gap: 1.5 }}>
        <Skeleton variant="rounded" height={42} sx={{ flex: { md: 1 }, maxWidth: { md: 520 }, borderRadius: "8px" }} />
        <Skeleton variant="text" width={140} height={20} sx={{ ml: { md: "auto" } }} />
      </Paper>

      {/* Results table: header row + rows (rows 97px phone / 74px desktop) */}
      <Paper elevation={0} sx={{ ...CARD, overflow: "hidden", minHeight: { xs: 1214, md: 923 } }}>
        <Box sx={{ height: { xs: 81, md: 57 }, bgcolor: "#F8FAFC", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 3, px: 2 }}>
          {[90, 70, 80, 120, 90].map((w, i) => (
            <Skeleton key={i} variant="text" width={w} height={16} sx={{ display: i > 2 ? { xs: "none", md: "block" } : "block" }} />
          ))}
        </Box>
        {Array.from({ length: 11 }, (_, i) => (
          <Box key={i} sx={{ height: { xs: 97, md: 74 }, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 3, px: 2 }}>
            <Skeleton variant="text" width={90} height={20} />
            <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: "6px", bgcolor: "#DBEAFE" }} />
            <Skeleton variant="text" width={110} height={20} />
            <Skeleton variant="text" width={120} height={20} sx={{ display: { xs: "none", md: "block" } }} />
            <Skeleton variant="rounded" width={110} height={32} sx={{ display: { xs: "none", md: "block" }, ml: "auto", borderRadius: "8px" }} />
          </Box>
        ))}
      </Paper>
    </LoadingRegion>
  );
}
