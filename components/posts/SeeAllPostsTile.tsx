"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { POSTS_PATH } from "@/lib/posts";

/** Fills the first empty grid slot (and ends the phone carousel) with a path to Articles & News. */
const SeeAllPostsTile = () => (
  <Box
    component={Link}
    href={POSTS_PATH}
    prefetch={false}
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 1.25,
      minHeight: 260,
      width: "100%",
      p: 3,
      borderRadius: "18px",
      border: "2px dashed #BFDBFE",
      background: "linear-gradient(160deg, #F8FBFF 0%, #EEF5FF 100%)",
      color: "#0B3C5D",
      textDecoration: "none",
      transition: "border-color .2s ease, transform .2s ease, box-shadow .2s ease",
      "&:hover, &:focus-visible": { borderColor: "#0B3C5D", transform: "translateY(-2px)", boxShadow: "0 12px 28px rgba(11,60,93,0.12)" },
      "&:hover .see-all-arrow": { transform: "translateX(4px)" },
      "&:focus-visible": { outline: "3px solid #0B3C5D", outlineOffset: 2 },
    }}
  >
    <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: "#FFFFFF", display: "grid", placeItems: "center", boxShadow: "0 4px 14px rgba(11,60,93,0.12)" }}>
      <MenuBookIcon sx={{ fontSize: 28, color: "#0B3C5D" }} />
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: "1.05rem", color: "#0F172A" }}>Explore all articles &amp; news</Typography>
    <Typography sx={{ fontSize: "0.85rem", color: "#64748B", lineHeight: 1.5, maxWidth: 240 }}>
      Prize claim guides, bumper updates and safety tips — all in one place.
    </Typography>
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5, px: 1.75, py: 0.75, borderRadius: "999px", bgcolor: "#0B3C5D", color: "#FFF", fontWeight: 800, fontSize: "0.82rem" }}>
      See all <ArrowForwardIcon className="see-all-arrow" sx={{ fontSize: 16, transition: "transform .2s ease" }} />
    </Box>
  </Box>
);

export default SeeAllPostsTile;
