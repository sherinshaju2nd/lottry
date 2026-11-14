"use client";

import React, { useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import { HERO_ART, HERO_BANNER, type HeroArtSource } from "@/lib/heroBanner";

/** 1×1 transparent GIF: what non-matching layouts "load" instead of the artwork. */
const EMPTY_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Event + attribute set by the navbar's view switch (and by the inline script in app/layout). */
const UI_MODE_EVENT = "kerala_ui_mode_changed";

const subscribeUiMode = (onChange: () => void) => {
  window.addEventListener(UI_MODE_EVENT, onChange);
  return () => window.removeEventListener(UI_MODE_EVENT, onChange);
};
const isModernUiMode = () => document.documentElement.getAttribute("data-ui-mode") === "modern";
/** Server render + hydration assume "normal" mode (no small-screen artwork in the hero). */
const isModernUiModeOnServer = () => false;

type Variant = "desktop" | "compact" | "modern";

/**
 * Banner artwork that fills its (position: relative) parent. A <picture> whose sources are limited
 * by media query means the browser picks the right composition and WebP size for the screen, and
 * layouts that are server-rendered but hidden at this width download nothing at all.
 *
 *  - "desktop": desktop artwork only (>=900px)
 *  - "compact": phone/tablet artwork for the normal view's featured card (<900px)
 *  - "modern":  the full-width hero; desktop artwork, plus phone/tablet hero artwork when the user
 *               chose the modern view (only then is this hero visible below 900px). Media queries
 *               can't read that choice, so those sources are added on the client.
 */
const HeroBannerImage = ({
  variant = "desktop",
  priority = false,
  zIndex = 0,
}: {
  variant?: Variant;
  priority?: boolean;
  zIndex?: number;
}) => {
  const modernMode = useSyncExternalStore(subscribeUiMode, isModernUiMode, isModernUiModeOnServer);

  const sources: HeroArtSource[] =
    variant === "compact"
      ? [HERO_ART.mobile, HERO_ART.tablet]
      : variant === "modern" && modernMode
        ? [HERO_ART.desktop, HERO_ART.modernMobile, HERO_ART.modernTablet]
        : [HERO_ART.desktop];

  return (
    <Box component="picture" sx={{ position: "absolute", inset: 0, zIndex, pointerEvents: "none" }}>
      {sources.map(({ media, srcSet, sizes }) => (
        <source key={media} media={media} srcSet={srcSet} sizes={sizes} type="image/webp" />
      ))}
      <Box
        component="img"
        src={EMPTY_PIXEL}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: HERO_BANNER.objectPosition, userSelect: "none" }}
      />
    </Box>
  );
};

export default HeroBannerImage;
