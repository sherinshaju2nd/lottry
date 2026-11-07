"use client";

import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";

/**
 * Thin reading-progress bar pinned to the top edge of the window. Tracks scroll through the element
 * with `targetId` (the article). Uses a ref + rAF instead of state so scrolling never
 * re-renders React.
 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      const bar = barRef.current;
      if (!target || !bar) return;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total <= 0 ? (rect.top <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -rect.top / total));
      bar.style.transform = `scaleX(${progress})`;
      bar.parentElement?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <Box
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300, height: 3, bgcolor: "transparent", pointerEvents: "none" }}
    >
      <Box
        ref={barRef}
        sx={{
          height: "100%",
          transform: "scaleX(0)",
          transformOrigin: "left",
          background: "linear-gradient(90deg, #0B3C5D 0%, #2563EB 60%, #F59E0B 100%)",
          borderRadius: "0 4px 4px 0",
          transition: "transform .1s linear",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      />
    </Box>
  );
}
