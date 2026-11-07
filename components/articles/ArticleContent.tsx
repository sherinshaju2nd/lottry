"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BlockNode, CalloutTone, InlineNode, parseMarkdown } from "@/lib/articleMarkdown";

const CALLOUTS: Record<CalloutTone, { bg: string; border: string; color: string; Icon: typeof InfoOutlinedIcon }> = {
  tip: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857", Icon: LightbulbIcon },
  warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309", Icon: WarningAmberIcon },
  info: { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", Icon: InfoOutlinedIcon },
};

const isInternal = (href: string) => href.startsWith("/") || href.startsWith("#");

const renderInline = (nodes: InlineNode[], keyPrefix = "i"): React.ReactNode[] =>
  nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (node.type) {
      case "text":
        return <React.Fragment key={key}>{node.text}</React.Fragment>;
      case "bold":
        return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case "italic":
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case "code":
        return (
          <Box
            key={key}
            component="code"
            sx={{ bgcolor: "#F1F5F9", px: 0.75, py: 0.25, borderRadius: 1, fontSize: "0.9em", fontFamily: "monospace" }}
          >
            {node.text}
          </Box>
        );
      case "link":
        return isInternal(node.href) ? (
          <Link key={key} href={node.href} style={{ color: "#0B5CAD", fontWeight: 700 }}>
            {renderInline(node.children, key)}
          </Link>
        ) : (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{ color: "#0B5CAD", fontWeight: 700 }}
          >
            {renderInline(node.children, key)}
          </a>
        );
      default:
        return null;
    }
  });

const headingSx = {
  2: { fontSize: { xs: "1.35rem", md: "1.6rem" }, mt: 5, mb: 1.5 },
  3: { fontSize: { xs: "1.15rem", md: "1.3rem" }, mt: 4, mb: 1.25 },
  4: { fontSize: "1.05rem", mt: 3, mb: 1 },
} as const;

const renderBlock = (block: BlockNode, idx: number): React.ReactNode => {
  const key = `b-${idx}`;
  switch (block.type) {
    case "heading":
      return (
        <Typography
          key={key}
          id={block.id}
          component={`h${block.level}`}
          sx={{ ...headingSx[block.level], fontWeight: 800, color: "#0F172A", lineHeight: 1.3, scrollMarginTop: 96 }}
        >
          {renderInline(block.children, key)}
        </Typography>
      );
    case "paragraph":
      return (
        <Typography key={key} component="p" sx={{ mb: 2.25, fontSize: { xs: "1rem", md: "1.075rem" }, lineHeight: 1.8, color: "#334155" }}>
          {renderInline(block.children, key)}
        </Typography>
      );
    case "list":
      return (
        <Box
          key={key}
          component={block.ordered ? "ol" : "ul"}
          sx={{ pl: 3, mb: 2.5, "& li": { mb: 1, lineHeight: 1.75, color: "#334155", fontSize: { xs: "1rem", md: "1.05rem" } } }}
        >
          {block.items.map((item, itemIdx) => (
            <li key={`${key}-${itemIdx}`}>{renderInline(item, `${key}-${itemIdx}`)}</li>
          ))}
        </Box>
      );
    case "quote":
      return (
        <Box
          key={key}
          component="blockquote"
          sx={{ m: 0, mb: 2.5, pl: 2.5, py: 1, borderLeft: "4px solid #0B3C5D", bgcolor: "#F8FAFC", borderRadius: "0 10px 10px 0", fontStyle: "italic", color: "#1E293B", lineHeight: 1.75 }}
        >
          {renderInline(block.children, key)}
        </Box>
      );
    case "callout": {
      const { bg, border, color, Icon } = CALLOUTS[block.tone];
      return (
        <Box key={key} role="note" sx={{ display: "flex", gap: 1.5, p: 2, mb: 2.5, bgcolor: bg, border: `1px solid ${border}`, borderRadius: "12px" }}>
          <Icon sx={{ color, mt: 0.25 }} fontSize="small" />
          <Typography sx={{ color: "#1E293B", lineHeight: 1.7 }}>{renderInline(block.children, key)}</Typography>
        </Box>
      );
    }
    case "image":
      return (
        <Box key={key} component="figure" sx={{ m: 0, mb: 3 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded remote images, sizes unknown */}
          <img src={block.src} alt={block.alt} loading="lazy" decoding="async" style={{ width: "100%", height: "auto", borderRadius: 14, display: "block" }} />
          {block.caption && (
            <Typography component="figcaption" sx={{ mt: 1, fontSize: "0.85rem", color: "#64748B", textAlign: "center" }}>
              {block.caption}
            </Typography>
          )}
        </Box>
      );
    case "code":
      return (
        <Box key={key} component="pre" sx={{ p: 2, mb: 2.5, bgcolor: "#0F172A", color: "#E2E8F0", borderRadius: "12px", overflowX: "auto", fontSize: "0.9rem" }}>
          <code>{block.text}</code>
        </Box>
      );
    case "table":
      return (
        <Box key={key} sx={{ overflowX: "auto", mb: 3, border: "1px solid #E2E8F0", borderRadius: "12px" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { p: 1.25, textAlign: "left", borderBottom: "1px solid #E2E8F0", fontSize: "0.95rem" }, "& th": { bgcolor: "#F8FAFC", fontWeight: 800, color: "#0F172A" } }}>
            <thead>
              <tr>
                {block.header.map((cell, c) => (
                  <th key={c}>{renderInline(cell, `${key}-h${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{renderInline(cell, `${key}-${r}-${c}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      );
    case "divider":
      return <Divider key={key} sx={{ my: 4 }} />;
    default:
      return null;
  }
};

interface ArticleContentProps {
  markdown: string;
}

/** Renders admin-authored Markdown safely (AST → React, never raw HTML). */
export default function ArticleContent({ markdown }: ArticleContentProps) {
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);
  if (blocks.length === 0) {
    return <Typography sx={{ color: "#94A3B8", fontStyle: "italic" }}>Nothing to preview yet.</Typography>;
  }
  return <Box className="article-content">{blocks.map(renderBlock)}</Box>;
}
