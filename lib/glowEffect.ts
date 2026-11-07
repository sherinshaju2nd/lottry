import { keyframes } from "@mui/material/styles";

/**
 * Attention "glow" for primary call-to-action buttons (navbar Download App / Support Us).
 * Pulsing halo + periodic light sheen. Pauses on hover/focus and becomes a static glow
 * for users who prefer reduced motion (WCAG 2.3.3).
 */

const pulse = (rgb: string) =>
  keyframes`
    0%   { box-shadow: 0 0 0 0 rgba(${rgb}, 0.55), 0 2px 8px rgba(${rgb}, 0.25); }
    70%  { box-shadow: 0 0 0 9px rgba(${rgb}, 0), 0 0 18px 3px rgba(${rgb}, 0.45); }
    100% { box-shadow: 0 0 0 0 rgba(${rgb}, 0), 0 2px 8px rgba(${rgb}, 0.25); }
  `;

const sheen = keyframes`
  0%, 60% { transform: translateX(-130%) skewX(-20deg); }
  100%    { transform: translateX(230%) skewX(-20deg); }
`;

interface GlowOptions {
  /** Glow colour as "r, g, b". */
  rgb: string;
  /** Sheen highlight colour (use a light colour on dark buttons, warm white on light ones). */
  sheenColor?: string;
  /** Offsets the cycle so neighbouring buttons don't pulse in sync. */
  delaySeconds?: number;
}

export const glowSx = ({ rgb, sheenColor = "rgba(255, 255, 255, 0.45)", delaySeconds = 0 }: GlowOptions) =>
  ({
    position: "relative",
    overflow: "hidden",
    whiteSpace: "nowrap",
    flexShrink: 0,
    isolation: "isolate",
    animation: `${pulse(rgb)} 2.4s ease-out ${delaySeconds}s infinite`,
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      width: "45%",
      background: `linear-gradient(90deg, transparent, ${sheenColor}, transparent)`,
      animation: `${sheen} 4.8s ease-in-out ${delaySeconds}s infinite`,
      pointerEvents: "none",
      zIndex: -1,
    },
    "&:hover, &:focus-visible": {
      animationPlayState: "paused",
      boxShadow: `0 0 0 3px rgba(${rgb}, 0.25), 0 6px 18px rgba(${rgb}, 0.45)`,
    },
    "&:focus-visible": { outline: `2px solid rgba(${rgb}, 0.9)`, outlineOffset: 2 },
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
      boxShadow: `0 0 12px 2px rgba(${rgb}, 0.35)`,
      "&::after": { display: "none" },
    },
  }) as const;
