"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BoltIcon from "@mui/icons-material/Bolt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  StructuredDrawResult,
  getLotteryUrl,
  hasAnyDrawResult,
  getLotteryJackpot,
} from "@/lib/supabase";
import { LotteryItem } from "@/app/page";

interface HomeNormalViewProps {
  todayLottery: LotteryItem;
  todayISTDate: string;
  todayDrawResult: StructuredDrawResult | null;
  allDraws: StructuredDrawResult[];
  isLoading: boolean;
  isTodayBumper: boolean;
  isAfter3PM: boolean;
}

const PAGE_SIZE = 10;

// Format YYYY-MM-DD -> DD/MM/YYYY
function formatDDMMYYYY(dateStr?: string): string {
  if (!dateStr) return "";
  const clean = dateStr.split("T")[0];
  const parts = clean.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Format Draw Code e.g. "BT-71"
function formatDrawCodeBadge(draw: { lottery_code?: string; draw_code?: string }): string {
  const code = (draw.lottery_code || "").toUpperCase();
  const num = (draw.draw_code || "").toUpperCase();
  if (!num) return code;
  if (num.startsWith(code)) return num;
  return `${code}-${num}`;
}

// Check if draw has reached 9th prize or full final completion
function isDrawCompletedWith9th(draw: StructuredDrawResult | null | undefined): boolean {
  if (!draw || !draw.prizes) return false;
  const has9th = Array.isArray(draw.prizes["9th"]) && draw.prizes["9th"].length > 0;
  if (has9th) return true;

  const has8th = Array.isArray(draw.prizes["8th"]) && draw.prizes["8th"].length > 0;
  const has1st = !!(
    draw.first?.ticket &&
    draw.first.ticket.trim().length > 3 &&
    draw.first.ticket.toLowerCase() !== "pending" &&
    draw.first.ticket.toLowerCase() !== "n/a"
  );

  if (has8th && has1st) {
    const has9thAmount = !!draw.prizes.amounts?.["9th"];
    if (!has9thAmount) return true;
    const has7th = Array.isArray(draw.prizes["7th"]) && draw.prizes["7th"].length > 0;
    const has6th = Array.isArray(draw.prizes["6th"]) && draw.prizes["6th"].length > 0;
    if (has7th && has6th) return true;
  }
  return false;
}

export default function HomeNormalView({
  todayLottery,
  todayISTDate,
  todayDrawResult,
  allDraws,
  isLoading,
  isTodayBumper,
  isAfter3PM,
}: HomeNormalViewProps) {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // Top featured draw is always Today's draw
  const topFeaturedDraw = useMemo<StructuredDrawResult>(() => {
    if (todayDrawResult) return todayDrawResult;
    return {
      draw_date: todayISTDate,
      draw_name: todayLottery.name,
      draw_code: todayLottery.code,
      lottery_code: todayLottery.code,
      first: {},
      prizes: {},
    };
  }, [todayDrawResult, todayISTDate, todayLottery]);

  const isTopCompleted = useMemo(() => {
    return isDrawCompletedWith9th(topFeaturedDraw);
  }, [topFeaturedDraw]);

  const hasTopFirstPrize = useMemo(() => {
    return !!(
      topFeaturedDraw?.first?.ticket &&
      topFeaturedDraw.first.ticket.trim().length > 3 &&
      topFeaturedDraw.first.ticket.toLowerCase() !== "pending" &&
      topFeaturedDraw.first.ticket.toLowerCase() !== "n/a"
    );
  }, [topFeaturedDraw]);

  const isTopLive = useMemo(() => {
    if (topFeaturedDraw?.draw_date !== todayISTDate || isTopCompleted) return false;
    return isAfter3PM || hasAnyDrawResult(topFeaturedDraw);
  }, [topFeaturedDraw, todayISTDate, isTopCompleted, isAfter3PM]);

  const isTopPreDraw = useMemo(() => {
    return topFeaturedDraw?.draw_date === todayISTDate && !isTopLive && !isTopCompleted;
  }, [topFeaturedDraw?.draw_date, todayISTDate, isTopLive, isTopCompleted]);

  const drawTimeDisplay = isTodayBumper ? "2:00 PM" : "3:00 PM";

  const topJackpot = useMemo(() => {
    return (
      todayLottery.jackpot ||
      getLotteryJackpot(
        topFeaturedDraw.lottery_code || topFeaturedDraw.draw_code || todayLottery.code
      ) ||
      "₹1 Crore"
    );
  }, [todayLottery.jackpot, todayLottery.code, topFeaturedDraw]);

  // Remaining past draws excluding top featured draw
  const remainingDraws = useMemo(() => {
    if (allDraws.length === 0) return [];
    if (topFeaturedDraw?.draw_date) {
      return allDraws.filter((d) => d.draw_date !== topFeaturedDraw.draw_date);
    }
    return allDraws.slice(1);
  }, [allDraws, topFeaturedDraw]);

  const paginatedDraws = useMemo(() => {
    return remainingDraws.slice(0, visibleCount);
  }, [remainingDraws, visibleCount]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, remainingDraws.length));
      setLoadingMore(false);
    }, 200);
  };

  const topBadgeCode = formatDrawCodeBadge(topFeaturedDraw);
  const topDateFormatted = formatDDMMYYYY(topFeaturedDraw.draw_date);

  return (
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", pb: 6 }}>
      {/* Top Full-Width Featured Card */}
      <Box sx={{ mb: 3 }}>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            height={150}
            sx={{ borderRadius: "14px" }}
          />
        ) : (
          <Paper
            component={Link}
            href={getLotteryUrl(topFeaturedDraw.lottery_code || "BT", topFeaturedDraw.draw_date)}
            elevation={0}
            sx={{
              display: "block",
              textDecoration: "none",
              borderRadius: "14px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 22px rgba(11, 60, 93, 0.18)",
              },
            }}
          >
            {/* Top Blue Header (50% split) */}
            <Box
              sx={{
                bgcolor: "rgb(11, 60, 93)",
                px: { xs: 2, sm: 3 },
                py: { xs: 2.2, sm: 2.8 },
                minHeight: { xs: 92, sm: 104 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                color: "#FFFFFF",
              }}
            >
              {/* 1. Live Pulsing Badge */}
              {isTopLive && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    bgcolor: "#DC2626",
                    color: "#FFFFFF",
                    px: 1.2,
                    py: 0.4,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "#FFFFFF",
                      animation: "pulse 1.4s infinite",
                      "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.3 },
                        "100%": { opacity: 1 },
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.06em" }}>
                    LIVE
                  </Typography>
                </Box>
              )}

              {/* 2. Diagonal Red NEW Ribbon if draw completed */}
              {isTopCompleted && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 54,
                    height: 54,
                    overflow: "hidden",
                    zIndex: 2,
                    borderTopLeftRadius: "14px",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 9,
                      left: -22,
                      width: 76,
                      height: 20,
                      bgcolor: "#DC2626",
                      transform: "rotate(-45deg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.08em" }}>
                      NEW
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Top-Right Code Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  bgcolor: "#2563EB",
                  color: "#FFFFFF",
                  px: 1.1,
                  py: 0.35,
                  borderRadius: "6px",
                  zIndex: 2,
                }}
              >
                <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, fontWeight: 800, letterSpacing: "0.04em" }}>
                  {topBadgeCode}
                </Typography>
              </Box>

              {/* Centered Large Lottery Name */}
              <Typography
                sx={{
                  fontSize: { xs: "1.15rem", sm: "1.35rem" },
                  fontWeight: 900,
                  color: "#FFFFFF",
                  textAlign: "center",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  mt: { xs: 0.5, sm: 0 },
                  px: 4,
                }}
              >
                {topFeaturedDraw.draw_name || todayLottery.name}
              </Typography>

              {/* Status info pill under name */}
              {hasTopFirstPrize ? (
                <Box
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(0, 0, 0, 0.28)",
                    border: "1px solid rgba(253, 224, 71, 0.5)",
                    borderRadius: "20px",
                    px: 1.8,
                    py: 0.45,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 15, color: "#FDE047" }} />
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.82rem", fontWeight: 800 }}>
                    1st Prize ({topJackpot}): {topFeaturedDraw.first?.ticket}
                  </Typography>
                </Box>
              ) : isTopLive ? (
                <Box
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(255, 255, 255, 0.18)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "20px",
                    px: 1.6,
                    py: 0.4,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                  }}
                >
                  <BoltIcon sx={{ fontSize: 15, color: "#FDE047" }} />
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.8rem", fontWeight: 700 }}>
                    Live Draw in Progress • 1st: {topJackpot}
                  </Typography>
                </Box>
              ) : isTopPreDraw ? (
                <Box
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: "20px",
                    px: 1.6,
                    py: 0.4,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 14, color: "#FDE047" }} />
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.78rem", fontWeight: 800 }}>
                    1st Prize: {topJackpot}
                  </Typography>
                </Box>
              ) : null}
            </Box>

            {/* Bottom White Date Section */}
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                py: 1.4,
                px: 2,
                textAlign: "center",
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.05rem", sm: "1.15rem" },
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "0.03em",
                }}
              >
                {topDateFormatted}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Section Header Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 3,
          mb: 1.5,
          px: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 800,
            color: "#64748B",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          RECENT DRAWS
        </Typography>

        <Chip
          label={isLoading ? "Loading..." : `${remainingDraws.length || 0} Draws`}
          size="small"
          sx={{
            bgcolor: "#E2E8F0",
            color: "#334155",
            fontWeight: 800,
            fontSize: "0.75rem",
            height: 22,
          }}
        />
      </Box>

      {/* 2-Column Grid (on mobile: 2 cards per row `xs: 6`, tablet: 3 cards `sm: 4`, desktop: 4 cards `md: 3`) */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {isLoading && paginatedDraws.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
              <Skeleton
                variant="rounded"
                height={125}
                sx={{ borderRadius: "12px" }}
              />
            </Grid>
          ))
        ) : (
          paginatedDraws.map((item, index) => {
            const formattedDate = formatDDMMYYYY(item.draw_date);
            const badgeCode = formatDrawCodeBadge(item);
            const isLatestGridDraw = index === 0 && !isTopLive && !isTopCompleted;

            return (
              <Grid key={`${item.draw_date}-${item.lottery_code}-${index}`} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                <Paper
                  component={Link}
                  href={getLotteryUrl(item.lottery_code || "BT", item.draw_date)}
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    height: "100%",
                    borderRadius: "12px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(11, 60, 93, 0.15)",
                    },
                  }}
                >
                  {/* Top Blue Header (50% height) */}
                  <Box
                    sx={{
                      bgcolor: "rgb(11, 60, 93)",
                      py: { xs: 2, sm: 2.2 },
                      px: 1.2,
                      minHeight: { xs: 80, sm: 86 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      flex: 1,
                    }}
                  >
                    {/* Diagonal NEW Ribbon on 1st past draw when today is pre-draw */}
                    {isLatestGridDraw && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 44,
                          height: 44,
                          overflow: "hidden",
                          zIndex: 2,
                          borderTopLeftRadius: "12px",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 7,
                            left: -19,
                            width: 66,
                            height: 17,
                            bgcolor: "#DC2626",
                            transform: "rotate(-45deg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.06em" }}>
                            NEW
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Code Badge top-right */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "#2563EB",
                        color: "#FFFFFF",
                        px: 0.8,
                        py: 0.25,
                        borderRadius: "5px",
                        zIndex: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.02em" }}>
                        {badgeCode}
                      </Typography>
                    </Box>

                    {/* Lottery Name */}
                    <Typography
                      sx={{
                        fontSize: { xs: "0.85rem", sm: "0.925rem" },
                        fontWeight: 900,
                        color: "#FFFFFF",
                        textAlign: "center",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        lineHeight: 1.3,
                        mt: 1.5,
                        px: 0.5,
                      }}
                    >
                      {item.draw_name}
                    </Typography>
                  </Box>

                  {/* Bottom White Date Section (50% height) */}
                  <Box
                    sx={{
                      bgcolor: "#FFFFFF",
                      py: 1.2,
                      px: 1,
                      textAlign: "center",
                      borderTop: "1px solid #E2E8F0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        fontWeight: 800,
                        color: "#0F172A",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {formattedDate}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Pagination / Load More Button */}
      {visibleCount < remainingDraws.length && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outlined"
            startIcon={<ExpandMoreIcon />}
            sx={{
              borderColor: "#CBD5E1",
              color: "#0B3C5D",
              bgcolor: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.875rem",
              borderRadius: "10px",
              px: 3.5,
              py: 1.1,
              textTransform: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              "&:hover": {
                bgcolor: "#F8FAFC",
                borderColor: "#0B3C5D",
              },
            }}
          >
            {loadingMore ? "Loading..." : `Load More Draws (${remainingDraws.length - visibleCount} remaining)`}
          </Button>
        </Box>
      )}
    </Box>
  );
}
