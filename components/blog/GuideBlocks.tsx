import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

/** Shared building blocks for editorial guide bodies (components/blog/*GuideContent.tsx). */

export const LINK_STYLE = { color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" } as const;
export const BODY_SX = { color: "#334155", mb: 2, lineHeight: 1.8 } as const;
const H2_SX = { fontWeight: 800, color: "#0B3C5D", mb: 2 } as const;

export const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <Box id={id} component="section" sx={{ scrollMarginTop: 100, mb: 5 }}>
    <Typography variant="h4" component="h2" sx={H2_SX}>
      {title}
    </Typography>
    {children}
  </Box>
);

export const Lead = ({ children }: { children: ReactNode }) => (
  <Typography sx={{ fontSize: { xs: "1.05rem", sm: "1.12rem" }, color: "#1E293B", mb: 3, lineHeight: 1.8 }}>
    {children}
  </Typography>
);

export const P = ({ children }: { children: ReactNode }) => <Typography sx={BODY_SX}>{children}</Typography>;

export const InlineLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} style={LINK_STYLE}>
    {children}
  </Link>
);

const CALLOUT_TONES = {
  warning: { Icon: WarningAmberIcon, bg: "#FFFBEB", border: "#FDE68A", icon: "#D97706", text: "#78350F" },
  info: { Icon: InfoOutlinedIcon, bg: "#EFF6FF", border: "#BFDBFE", icon: "#1D4ED8", text: "#1E3A8A" },
  danger: { Icon: CancelIcon, bg: "#FEF2F2", border: "#FECACA", icon: "#DC2626", text: "#7F1D1D" },
} as const;

export const Callout = ({ tone, children }: { tone: keyof typeof CALLOUT_TONES; children: ReactNode }) => {
  const { Icon, bg, border, icon, text } = CALLOUT_TONES[tone];
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, my: 3, borderRadius: "12px", display: "flex", gap: 1.5, alignItems: "flex-start", bgcolor: bg, border: `1px solid ${border}` }}
    >
      <Icon sx={{ color: icon, mt: 0.25 }} />
      <Typography component="div" sx={{ color: text, fontSize: "0.95rem", lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Paper>
  );
};

/** Checklist with green ticks (or red crosses for "warning sign" lists). */
export const CheckList = ({ items, tone = "good" }: { items: ReactNode[]; tone?: "good" | "bad" }) => (
  <Box component="ul" sx={{ listStyle: "none", m: 0, mb: 2.5, p: 0, display: "flex", flexDirection: "column", gap: 1.1 }}>
    {items.map((item, index) => (
      <Box component="li" key={index} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
        {tone === "good" ? (
          <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 21, mt: 0.35 }} />
        ) : (
          <CancelIcon sx={{ color: "#DC2626", fontSize: 21, mt: 0.35 }} />
        )}
        <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>{item}</Typography>
      </Box>
    ))}
  </Box>
);

/** Numbered step cards. */
export const StepList = ({ steps }: { steps: { title: string; desc: ReactNode }[] }) => (
  <Box component="ol" sx={{ listStyle: "none", m: 0, mb: 2.5, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
    {steps.map(({ title, desc }, index) => (
      <Box component="li" key={title} sx={{ display: "flex", gap: 2, p: 2.25, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "#0B3C5D",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Box>
        <Box>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1rem", color: "#0F172A", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography component="div" sx={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.7 }}>
            {desc}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

