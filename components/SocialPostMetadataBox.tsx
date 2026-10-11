"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Collapse,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TagIcon from "@mui/icons-material/Tag";
import DescriptionIcon from "@mui/icons-material/Description";
import TitleIcon from "@mui/icons-material/Title";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getLotteryMalayalamName } from "@/lib/lotteryVideoGenerator";

export interface SocialPostMetadataBoxProps {
  drawResult?: any;
  lotteryInfo?: any;
  siteUrl?: string;
  mediaType?: "video" | "image";
}

export default function SocialPostMetadataBox({
  drawResult,
  lotteryInfo,
  siteUrl = "https://www.keralalotteryresultstoday.in",
  mediaType = "video",
}: SocialPostMetadataBoxProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const drawName =
    drawResult?.draw_name || lotteryInfo?.name || "Kerala State Lottery";
  const drawCode =
    drawResult?.draw_code || lotteryInfo?.code || "Official Draw";
  const drawDate =
    drawResult?.draw_date ||
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(),
    );
  const codeParam =
    drawResult?.lottery_code || lotteryInfo?.code || "kerala-lottery";

  const nameMl = getLotteryMalayalamName(
    codeParam,
    drawName,
    lotteryInfo?.nameMl || drawResult?.name_ml || drawResult?.nameMl,
  );

  const jackpotAmt =
    drawResult?.prizes?.amounts?.["1st"] || lotteryInfo?.jackpot || "₹1 CRORE";
  const firstTicket =
    drawResult?.first?.ticket?.trim() || "Announced at 3:00 PM";
  const location = drawResult?.first?.location;
  const agent = drawResult?.first?.agent;

  const resultUrl = `${siteUrl}/${codeParam.toLowerCase()}/${drawDate}`;

  // Clean hashtag-safe words
  const nameHashtag = drawName.replace(/[^a-zA-Z0-9]/g, "");
  const codeHashtag = drawCode.replace(/[^a-zA-Z0-9]/g, "");

  // 1. Social Post Title (English + Malayalam)
  const postTitle = useMemo(() => {
    return `Kerala Lottery ${drawName} (${drawCode}) Result Today ${drawDate} | ${nameMl} ലോട്ടറി ഫലം`;
  }, [drawName, drawCode, drawDate, nameMl]);

  // 2. Hashtags (English + Malayalam + Trend tags)
  const postHashtags = useMemo(() => {
    const baseTags = [
      "#KeralaLottery",
      "#KeralaLotteryResult",
      `#${nameHashtag}`,
      `#${codeHashtag}`,
      "#LotteryResultToday",
      "#കേരളലോട്ടറി",
      "#ലോട്ടറിറിസൾട്ട്",
      "#കേരളഭാഗ്യക്കുറി",
      "#KeralaLotteryLive",
      "#LotteryJackpot",
      "#KeralaStateLotteries",
    ];

    if (mediaType === "video") {
      baseTags.push(
        "#Shorts",
        "#Reels",
        "#YouTubeShorts",
        "#ReelsViral",
        "#Trending",
      );
    } else {
      baseTags.push(
        "#InstagramPost",
        "#FacebookPost",
        "#LotteryToday",
        "#ViralPost",
      );
    }

    return baseTags.join(" ");
  }, [nameHashtag, codeHashtag, mediaType]);

  // 3. Post Description (English + Malayalam + Verified Gazette details)
  const postDescription = useMemo(() => {
    const lines = [
      `🎉 Official Kerala State Lottery Result Today!`,
      `കേരള ഭാഗ്യക്കുറി ഇന്നത്തെ ഔദ്യോഗിക ഫലം.`,
      ``,
      `📌 Lottery: ${drawName} (${drawCode}) • ${nameMl}`,
      `🗓️ Draw Date: ${drawDate} (3:00 PM Draw)`,
      `🏆 1st Prize Grand Jackpot (${jackpotAmt}): ${firstTicket}`,
    ];

    if (location) lines.push(`📍 Drawn District: ${location}`);
    if (agent) lines.push(`👤 Selling Agent: ${agent}`);

    lines.push(
      ``,
      `🛡️ 100% Verified Kerala Government Gazette Result.`,
      `സമ്മാനാർഹമായ ടിക്കറ്റുകൾ ഔദ്യോഗിക കേരള സർക്കാർ ഗസറ്റുമായി ഒത്തുനോക്കി 30 ദിവസത്തിനകം സമ്മാനം മാറേണ്ടതാണ്.`,
      ``,
      `🌐 Live Results & Ticket Checker:`,
      `${resultUrl}`,
      ``,
      postHashtags,
    );

    return lines.join("\n");
  }, [
    drawName,
    drawCode,
    nameMl,
    drawDate,
    jackpotAmt,
    firstTicket,
    location,
    agent,
    resultUrl,
    postHashtags,
  ]);

  // 4. Combined Full Post (Title + Description)
  const fullPostContent = useMemo(() => {
    return `${postTitle}\n\n${postDescription}`;
  }, [postTitle, postDescription]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2200);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2.5,
        bgcolor: "#0A182F",
        borderRadius: "16px",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          background: "linear-gradient(90deg, #0B2548 0%, #0F325E 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38BDF8",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.95rem" }}
            >
              Social Media Upload Copy & Paste (English + മലയാളം)
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              Ready-to-post Title, Description & Tags for Instagram, YouTube,
              WhatsApp & Facebook
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => copyToClipboard(fullPostContent, "all")}
            startIcon={
              copiedKey === "all" ? (
                <CheckIcon sx={{ fontSize: 16 }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              bgcolor: copiedKey === "all" ? "#10B981" : "#0284C7",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.8rem",
              textTransform: "none",
              borderRadius: "8px",
              px: 1.8,
              py: 0.6,
              "&:hover": {
                bgcolor: copiedKey === "all" ? "#059669" : "#0369A1",
              },
            }}
          >
            {copiedKey === "all" ? "Copied All!" : "Copy Full Post"}
          </Button>

          <IconButton
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: "#94A3B8" }}
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Expandable Tabs & Contents */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pt: 1, bgcolor: "#061326" }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                color: "#94A3B8",
                fontWeight: 700,
                fontSize: "0.82rem",
                textTransform: "none",
                minHeight: 40,
                py: 0.5,
                px: 1.8,
                "&.Mui-selected": {
                  color: "#38BDF8",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#38BDF8",
                height: 3,
                borderRadius: 1.5,
              },
            }}
          >
            <Tab
              icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="All-in-One Post"
            />
            <Tab
              icon={<TitleIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Title"
            />
            <Tab
              icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Description"
            />
            <Tab
              icon={<TagIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Hashtags"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* TAB 0: All-in-One Post */}
          {activeTab === 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#FDE047", fontWeight: 700 }}
                >
                  📝 Complete Post Content (Title + Description + Hashtags)
                </Typography>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(fullPostContent, "tab0")}
                  startIcon={
                    copiedKey === "tab0" ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  sx={{
                    color: copiedKey === "tab0" ? "#4ADE80" : "#38BDF8",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  {copiedKey === "tab0" ? "Copied!" : "Copy Content"}
                </Button>
              </Box>
              <Box
                sx={{
                  p: 1.8,
                  bgcolor: "#030A14",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#E2E8F0",
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {fullPostContent}
              </Box>
            </Box>
          )}

          {/* TAB 1: Title */}
          {activeTab === 1 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#38BDF8", fontWeight: 700 }}
                >
                  🏷️ Video & Post Title (YouTube / Facebook / Reels)
                </Typography>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(postTitle, "title")}
                  startIcon={
                    copiedKey === "title" ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  sx={{
                    color: copiedKey === "title" ? "#4ADE80" : "#38BDF8",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  {copiedKey === "title" ? "Copied!" : "Copy Title"}
                </Button>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#030A14",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#FFFFFF",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {postTitle}
              </Box>
            </Box>
          )}

          {/* TAB 2: Description */}
          {activeTab === 2 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#38BDF8", fontWeight: 700 }}
                >
                  📄 Video & Image Description (YouTube / Instagram Caption)
                </Typography>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(postDescription, "desc")}
                  startIcon={
                    copiedKey === "desc" ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  sx={{
                    color: copiedKey === "desc" ? "#4ADE80" : "#38BDF8",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  {copiedKey === "desc" ? "Copied!" : "Copy Description"}
                </Button>
              </Box>
              <Box
                sx={{
                  p: 1.8,
                  bgcolor: "#030A14",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#CBD5E1",
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {postDescription}
              </Box>
            </Box>
          )}

          {/* TAB 3: Hashtags */}
          {activeTab === 3 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#38BDF8", fontWeight: 700 }}
                >
                  #️⃣ High Reach Hashtags (Reels / Shorts / Social)
                </Typography>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(postHashtags, "tags")}
                  startIcon={
                    copiedKey === "tags" ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  sx={{
                    color: copiedKey === "tags" ? "#4ADE80" : "#38BDF8",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  {copiedKey === "tags" ? "Copied!" : "Copy Tags"}
                </Button>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#030A14",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#67E8F9",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  lineHeight: 1.7,
                }}
              >
                {postHashtags}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
