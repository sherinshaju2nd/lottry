/**
 * Homepage banner artwork (Kerala backwaters illustration), with a separate composition per layout:
 *
 *  - desktop (>=900px): 3.2:1 panorama behind the full-width hero (HomeDesktopModernView)
 *  - tablet (600–899px): 2.8:1 panorama behind the featured result card (HomeNormalView)
 *  - mobile (<600px):   2.2:1 close crop (houseboat centred) behind the featured result card
 *
 * Each is rendered from vector artwork to several WebP widths, and the browser picks one from
 * `srcSet` using the rendered width × device pixel ratio, so every screen downloads only the size
 * it can show (e.g. 375px phone @3x → mobile-1280 ≈ 64 KB, 1366px laptop → 1920 ≈ 86 KB).
 * Media queries keep each layout from downloading the others' artwork.
 *
 * Bump HERO_VERSION whenever the files in /public/hero are replaced so long-lived caches refetch.
 */
const HERO_VERSION = "2";

export interface HeroArtSource {
  media: string;
  srcSet: string;
  sizes: string;
}

const buildSrcSet = (name: string, widths: readonly number[]) =>
  widths.map((width) => `/hero/${name}-${width}.webp?v=${HERO_VERSION} ${width}w`).join(", ");

export const HERO_ART = {
  desktop: {
    media: "(min-width: 900px)",
    srcSet: buildSrcSet("kerala-backwaters", [1280, 1920, 2560, 3840]),
    sizes: "100vw",
  },
  tablet: {
    media: "(min-width: 600px) and (max-width: 899.98px)",
    srcSet: buildSrcSet("kerala-backwaters-tablet", [1024, 1536, 2048]),
    // Featured card inside the normal view's 24px side padding.
    sizes: "calc(100vw - 48px)",
  },
  mobile: {
    media: "(max-width: 599.98px)",
    srcSet: buildSrcSet("kerala-backwaters-mobile", [640, 960, 1280]),
    // Featured card inside the normal view's 16px side padding.
    sizes: "calc(100vw - 32px)",
  },
  // "Modern" UI mode on phones/tablets shows the full-width hero (HomeDesktopModernView) instead of
  // the featured card, so it gets compositions shaped for that hero:
  modernMobile: {
    // ~375×510 portrait hero → 3:4 portrait artwork (palms at the edges, centre clear for the title).
    media: "(max-width: 599.98px)",
    srcSet: buildSrcSet("kerala-backwaters-portrait", [480, 750, 1125]),
    sizes: "100vw",
  },
  modernTablet: {
    // ~768×450 hero → the 2.2:1 close-crop artwork.
    media: "(min-width: 600px) and (max-width: 899.98px)",
    srcSet: buildSrcSet("kerala-backwaters-mobile", [960, 1280, 1600]),
    sizes: "100vw",
  },
} satisfies Record<string, HeroArtSource>;

/** Desktop hero: default src + preload data (same files as the desktop <source>). */
export const HERO_BANNER = {
  ...HERO_ART.desktop,
  src: `/hero/kerala-backwaters-1920.webp?v=${HERO_VERSION}`,
  /** Keeps the horizon, houseboat and palms in view when the artwork is cropped. */
  objectPosition: "center 58%",
} as const;

/** Light top-to-white fade so the navy title stays readable and the hero blends into the page. */
export const HERO_OVERLAY =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.30) 38%, rgba(255, 255, 255, 0.82) 78%, #FFFFFF 100%)";

/** Navy tint over the phone/tablet artwork so the white card title stays readable (WCAG contrast). */
export const HERO_CARD_OVERLAY =
  "linear-gradient(180deg, rgba(11, 60, 93, 0.58) 0%, rgba(11, 60, 93, 0.70) 55%, rgba(11, 60, 93, 0.86) 100%)";
