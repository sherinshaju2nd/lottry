"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HelpIcon from "@mui/icons-material/Help";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VerifiedIcon from "@mui/icons-material/Verified";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  StructuredDrawResult,
  getLotteryUrl,
  getLotteryLogo,
  getLotteryLogoAlt,
  supabase,
} from "@/lib/supabase";
import {
  LotteryEditorialContent,
  getLotteryEditorialContent,
} from "@/lib/lotteryEditorialData";

interface LotteryInfoType {
  day: string;
  name: string;
  nameMl: string;
  code: string;
  is_bumper?: boolean;
  jackpot?: string;
  ticket_price?: string;
  draw_season?: string;
}

interface LotteryDetailsClientProps {
  lotteryInfo: LotteryInfoType;
  lotteryCode: string;
  lotterySlug: string;
  initialDraws: StructuredDrawResult[];
  initialLotteryMeta: any;
  editorial?: LotteryEditorialContent;
  latestFormattedDate?: string;
}

export default function LotteryDetailsClient({
  lotteryInfo,
  lotteryCode,
  lotterySlug,
  initialDraws,
  initialLotteryMeta,
  editorial: propEditorial,
  latestFormattedDate: propFormattedDate,
}: LotteryDetailsClientProps) {
  const router = useRouter();

  const [drawHistory, setDrawHistory] =
    useState<StructuredDrawResult[]>(initialDraws);
  const [filteredDraws, setFilteredDraws] =
    useState<StructuredDrawResult[]>(initialDraws);
  const [lotteryDbMeta] = useState<any>(initialLotteryMeta);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  const jackpotAmount =
    lotteryDbMeta?.jackpot?.trim() ||
    (drawHistory?.[0]?.prizes?.amounts?.["1st"]
      ? `₹${drawHistory[0].prizes.amounts["1st"]}`
      : undefined) ||
    lotteryInfo.jackpot ||
    (lotteryInfo.is_bumper ? "₹25 Crore" : "₹1 Crore");

  const ticketPrice =
    lotteryDbMeta?.ticket_price?.trim() ||
    lotteryInfo.ticket_price ||
    (lotteryInfo.is_bumper ? "₹500" : "₹50");

  const editorial = useMemo(() => {
    return (
      propEditorial ||
      getLotteryEditorialContent(
        lotteryCode,
        lotteryInfo.name,
        lotteryInfo.nameMl,
        lotteryInfo.day,
        jackpotAmount,
        ticketPrice
      )
    );
  }, [
    propEditorial,
    lotteryCode,
    lotteryInfo.name,
    lotteryInfo.nameMl,
    lotteryInfo.day,
    jackpotAmount,
    ticketPrice,
  ]);

  const latestDraw = drawHistory?.[0] || null;

  const displayDate = useMemo(() => {
    if (propFormattedDate) return propFormattedDate;
    const rawDate = latestDraw?.draw_date || lotteryDbMeta?.draw_date;
    if (!rawDate) return "";
    try {
      const parts = rawDate.split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        return d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch {}
    return rawDate;
  }, [propFormattedDate, latestDraw, lotteryDbMeta]);

  // Dynamic H1 heading matching user requirements
  const h1Title = useMemo(() => {
    const dateStr = displayDate ? `${displayDate}` : "";
    if (editorial.h1Pattern) {
      return editorial.h1Pattern.replace("{date}", dateStr).trim();
    }
    return `${lotteryInfo.name} Lottery Result Today: ${dateStr} ${editorial.nameMl} (${editorial.code})`;
  }, [displayDate, editorial, lotteryInfo.name]);

  const refreshHistory = async () => {
    try {
      const res = await fetch(
        `/api/draws?type=history&code=${lotteryCode}&t=${Date.now()}`
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.results)) {
        setDrawHistory(json.results);
      }
    } catch {}
  };

  useEffect(() => {
    const channelName = `realtime-lottery-history-${lotteryCode}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draw_results",
        },
        (payload) => {
          const newRow = payload.new as any;
          if (
            newRow &&
            (!newRow.lottery_code ||
              newRow.lottery_code.toUpperCase() === lotteryCode.toUpperCase())
          ) {
            refreshHistory();
          }
        }
      )
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshHistory();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [lotteryCode]);

  useEffect(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) {
      setFilteredDraws(drawHistory);
    } else {
      const filtered = drawHistory.filter((draw) => {
        const dateMatch = draw.draw_date.toLowerCase().includes(q);
        const nameMatch = draw.draw_name.toLowerCase().includes(q);
        const codeMatch = draw.draw_code.toLowerCase().includes(q);
        const ticketMatch = (draw.first?.ticket || "").toLowerCase().includes(q);
        return dateMatch || nameMatch || codeMatch || ticketMatch;
      });
      setFilteredDraws(filtered);
    }
    setPage(0);
  }, [searchFilter, drawHistory]);

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "table" | "grid" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDraws = filteredDraws.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const otherWeekly = WEEKLY_LOTTERIES.filter((l) => l.code !== lotteryCode);

  return (
    <Box
      sx={{
        bgcolor: "#F8FAFC",
        color: "#0F172A",
        minHeight: "100vh",
        py: { xs: 2.5, sm: 4, md: 5 },
      }}
    >
      {/* Fluid full-width container with generous padding (no max-width restriction) */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 2.5 }}>
          <Breadcrumbs
            separator={
              <NavigateNextIcon fontSize="small" sx={{ color: "#94A3B8" }} />
            }
            aria-label="breadcrumb"
          >
            <Link
              href="/"
              style={{
                color: "#64748B",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Home
            </Link>
            <Typography
              sx={{
                color: "#0B3C5D",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {lotteryInfo.name} Lottery Result Today
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* ============================================================== */}
        {/* TOP SECTION: H1 Title Header + Quick Specs & Table Toggle     */}
        {/* ============================================================== */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 2, sm: 2.5 },
                maxWidth: { xs: "100%", md: "75%" },
              }}
            >
              {getLotteryLogo(lotteryCode) && (
                <Box
                  sx={{
                    width: { xs: 64, sm: 76, md: 84 },
                    height: { xs: 64, sm: 76, md: 84 },
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "2px solid #E2E8F0",
                    boxShadow: "0 6px 16px rgba(11, 60, 93, 0.1)",
                    flexShrink: 0,
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <img
                    src={getLotteryLogo(lotteryCode)!}
                    alt={getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day)}
                    width={84}
                    height={84}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              )}

              <Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 0.75 }}>
                  <Chip
                    label="Official Kerala State Lottery"
                    size="small"
                    icon={<VerifiedIcon sx={{ fontSize: "14px !important" }} />}
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#065F46",
                      fontWeight: 700,
                      fontSize: "0.725rem",
                      border: "1px solid #A7F3D0",
                    }}
                  />
                  <Chip
                    label={`Code: ${editorial.code}`}
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#1E40AF",
                      fontWeight: 800,
                      fontSize: "0.725rem",
                    }}
                  />
                  <Chip
                    label={`Draw Day: ${lotteryInfo.day}`}
                    size="small"
                    sx={{
                      bgcolor: "#F8FAFC",
                      color: "#334155",
                      fontWeight: 700,
                      fontSize: "0.725rem",
                      border: "1px solid #E2E8F0",
                    }}
                  />
                </Box>

                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    color: "#0F172A",
                    fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.15rem" },
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {h1Title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    mt: 0.5,
                    fontSize: { xs: "0.825rem", sm: "0.925rem" },
                  }}
                >
                  Draw Day: <strong>{lotteryInfo.day}</strong> | Draw Time:{" "}
                  <strong>
                    {lotteryInfo.code.startsWith("Bumper") ? "2:00 PM" : "3:00 PM"}
                  </strong>{" "}
                  | 1st Prize:{" "}
                  <strong style={{ color: "#0B3C5D" }}>{jackpotAmount}</strong> |
                  Ticket: <strong>{ticketPrice}</strong> | Venue:{" "}
                  <strong>Gorky Bhavan, TVM</strong>
                </Typography>
              </Box>
            </Box>

            {/* Table / Grid Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <ToggleButton
                value="table"
                sx={{
                  px: 2.25,
                  py: 1,
                  flex: { xs: 1, sm: "initial" },
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  "&.Mui-selected": { bgcolor: "#EFF6FF", color: "#0B3C5D" },
                }}
              >
                <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> Table View
              </ToggleButton>
              <ToggleButton
                value="grid"
                sx={{
                  px: 2.25,
                  py: 1,
                  flex: { xs: 1, sm: "initial" },
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  "&.Mui-selected": { bgcolor: "#EFF6FF", color: "#0B3C5D" },
                }}
              >
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} /> Grid View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ============================================================== */}
        {/* LATEST DRAW: Sleek Compact Banner                              */}
        {/* ============================================================== */}
        {latestDraw && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.25, md: 2.5 },
              mb: 3,
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #071E33 0%, #0B3C5D 60%, #082D4A 100%)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 8px 24px rgba(11, 60, 93, 0.16)",
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              {/* Left Column: Draw Info */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Chip
                    label="LATEST DRAW"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      bgcolor: "rgba(16, 185, 129, 0.2)",
                      color: "#34D399",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                    }}
                  />
                  <Chip
                    label={latestDraw.draw_code}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      color: "#BAE6FD",
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: "#FFFFFF",
                    fontSize: { xs: "1.15rem", sm: "1.35rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {latestDraw.draw_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255, 255, 255, 0.75)",
                    display: "block",
                    mt: 0.25,
                  }}
                >
                  📅 <strong>{latestDraw.draw_date}</strong> • Gorky Bhavan, TVM
                </Typography>
              </Grid>

              {/* Center Column: 1st Prize Ticket */}
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <Box
                  sx={{
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: "10px",
                    bgcolor: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#FBBF24",
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 15, color: "#FBBF24" }} />
                      1st Prize ({jackpotAmount})
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 900,
                        color: "#FFFFFF",
                        fontSize: { xs: "1.35rem", sm: "1.65rem" },
                        letterSpacing: "0.08em",
                        lineHeight: 1.2,
                        mt: 0.25,
                      }}
                    >
                      {latestDraw.first?.ticket || "PENDING"}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Chip
                      label="OFFICIAL"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        bgcolor: "rgba(16, 185, 129, 0.2)",
                        color: "#6EE7B7",
                        mb: 0.5,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        display: "block",
                        fontSize: "0.725rem",
                      }}
                    >
                      📍 {latestDraw.first?.location || "Kerala"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Compact Action Button */}
              <Grid
                size={{ xs: 12, md: 3 }}
                sx={{ textAlign: { xs: "left", md: "right" } }}
              >
                <Button
                  component={Link}
                  href={getLotteryUrl(lotterySlug, latestDraw.draw_date)}
                  variant="contained"
                  fullWidth
                  endIcon={<VisibilityIcon />}
                  sx={{
                    bgcolor: "#0284C7",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    borderRadius: "10px",
                    py: 1.3,
                    px: 2,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                    "&:hover": {
                      bgcolor: "#0369A1",
                    },
                  }}
                >
                  View Full Result
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ============================================================== */}
        {/* Results Table & Live Filter                                    */}
        {/* ============================================================== */}
        <Box sx={{ mb: 4 }}>
          {/* Filter Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, sm: 8, md: 7 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search draw date (YYYY-MM-DD), code (e.g. BT-72), or winning ticket..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <SearchIcon
                          fontSize="small"
                          sx={{ color: "#94A3B8", mr: 1 }}
                        />
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid
                size={{ xs: 12, sm: 4, md: 5 }}
                sx={{
                  textAlign: { xs: "left", sm: "right" },
                  color: "#64748B",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Showing <strong>{filteredDraws.length}</strong> draw results
              </Grid>
            </Grid>
          </Paper>

          {/* Results Table / Grid */}
          {filteredDraws.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography variant="h6" sx={{ color: "#334155", mb: 1 }}>
                No Draw Results Found
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                {searchFilter
                  ? `No results matched your search query "${searchFilter}".`
                  : "No historical draws are currently indexed for this lottery."}
              </Typography>
            </Paper>
          ) : viewMode === "table" ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                bgcolor: "#FFFFFF",
              }}
            >
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                          fontSize: "0.825rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Draw Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                          fontSize: "0.825rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Draw Code & Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                          fontSize: "0.825rem",
                          textTransform: "uppercase",
                        }}
                      >
                        1st Prize Ticket
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                          fontSize: "0.825rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Location
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                          fontSize: "0.825rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedDraws.map((draw) => (
                      <TableRow
                        key={draw.draw_date}
                        hover
                        onClick={() =>
                          router.push(getLotteryUrl(lotterySlug, draw.draw_date))
                        }
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                          📅 {draw.draw_date}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={draw.draw_code}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.725rem",
                                fontWeight: 800,
                                bgcolor: "#EFF6FF",
                                color: "#1D4ED8",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#334155" }}
                            >
                              {draw.draw_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {draw.first?.ticket ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 800,
                                color: "#0B3C5D",
                                fontSize: "0.95rem",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {draw.first.ticket}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: "#94A3B8" }}
                            >
                              Pending
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: "#475569" }}>
                          {draw.first?.location || "N/A"}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            href={getLotteryUrl(lotterySlug, draw.draw_date)}
                            size="small"
                            variant="outlined"
                            endIcon={<VisibilityIcon fontSize="small" />}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              borderRadius: "6px",
                              borderColor: "#E2E8F0",
                              color: "#334155",
                              textTransform: "none",
                              fontWeight: 700,
                              "&:hover": {
                                borderColor: "#0B3C5D",
                                bgcolor: "#EFF6FF",
                                color: "#0B3C5D",
                              },
                            }}
                          >
                            View Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredDraws.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: "1px solid #E2E8F0" }}
              />
            </Paper>
          ) : (
            /* Grid View */
            <>
              <Grid container spacing={2}>
                {paginatedDraws.map((draw) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={draw.draw_date}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        height: "100%",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
                          borderColor: "#0B3C5D",
                        },
                      }}
                    >
                      <CardActionArea
                        component={Link}
                        href={getLotteryUrl(lotterySlug, draw.draw_date)}
                        sx={{ p: 2.5, height: "100%" }}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748B",
                                fontWeight: 800,
                                textTransform: "uppercase",
                              }}
                            >
                              📅 {draw.draw_date}
                            </Typography>
                            <Chip
                              label={draw.draw_code}
                              size="small"
                              sx={{
                                bgcolor: "#EFF6FF",
                                color: "#1D4ED8",
                                fontWeight: 800,
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              color: "#0F172A",
                              mb: 2,
                              fontSize: "1.05rem",
                            }}
                          >
                            {draw.draw_name}
                          </Typography>

                          <Box
                            sx={{
                              bgcolor: "#F8FAFC",
                              p: 1.5,
                              borderRadius: "8px",
                              border: "1px solid #E2E8F0",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748B",
                                fontWeight: 700,
                                display: "block",
                              }}
                            >
                              1st Prize Winning Ticket
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 900,
                                color: "#0B3C5D",
                                fontSize: "1.15rem",
                                letterSpacing: "0.05em",
                                mt: 0.5,
                              }}
                            >
                              {draw.first?.ticket || "Pending"}
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{ color: "#64748B", display: "block" }}
                          >
                            Location:{" "}
                            <strong style={{ color: "#0F172A" }}>
                              {draw.first?.location || "Kerala"}
                            </strong>
                          </Typography>

                          <Button
                            fullWidth
                            size="small"
                            variant="text"
                            endIcon={<VisibilityIcon fontSize="small" />}
                            sx={{
                              mt: 2,
                              textTransform: "none",
                              color: "#0B3C5D",
                              fontWeight: 800,
                            }}
                          >
                            View Full Breakdown →
                          </Button>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={filteredDraws.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </Box>



        {/* ============================================================== */}
        {/* EDITORIAL CONTENT & FAQS: Single Unified Comprehensive Card   */}
        {/* ============================================================== */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4, md: 5 },
            mb: 4,
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          {/* Section 1: Kerala Lottery Result Intro */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.3rem", sm: "1.65rem" },
                mb: 2,
              }}
            >
              {editorial.keralaResultHeading}
            </Typography>

            <Box sx={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.8, mb: 2 }}>
              {editorial.keralaResultParagraphs.map((para, idx) => (
                <Typography
                  key={idx}
                  variant="body1"
                  sx={{
                    mb:
                      idx === editorial.keralaResultParagraphs.length - 1
                        ? 0
                        : 1.5,
                    color: "#334155",
                    fontSize: { xs: "0.925rem", sm: "1rem" },
                    lineHeight: 1.8,
                  }}
                >
                  {para}
                </Typography>
              ))}
            </Box>

            <Box sx={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.8 }}>
              {editorial.introParagraphs.map((para, idx) => (
                <Typography
                  key={idx}
                  variant="body1"
                  sx={{
                    mb:
                      idx === editorial.introParagraphs.length - 1 ? 0 : 1.5,
                    color: "#475569",
                    fontSize: { xs: "0.925rem", sm: "1rem" },
                    lineHeight: 1.8,
                  }}
                >
                  {para}
                </Typography>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

          {/* Section 2: [Name] Lottery */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ConfirmationNumberIcon sx={{ color: "#0B3C5D" }} />
              {editorial.lotterySectionHeading}
            </Typography>

            {editorial.lotterySectionParagraphs.map((para, idx) => (
              <Typography
                key={idx}
                variant="body1"
                sx={{
                  mb:
                    idx === editorial.lotterySectionParagraphs.length - 1
                      ? 0
                      : 1.5,
                  color: "#334155",
                  fontSize: { xs: "0.925rem", sm: "1rem" },
                  lineHeight: 1.8,
                }}
              >
                {para}
              </Typography>
            ))}
          </Box>

          <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

          {/* Section 3: About [Name] Lottery & Venue */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                mb: 2,
              }}
            >
              {editorial.aboutHeading}
            </Typography>

            {editorial.aboutParagraphs.map((para, idx) => (
              <Typography
                key={idx}
                variant="body1"
                sx={{
                  mb: idx === editorial.aboutParagraphs.length - 1 ? 0 : 1.5,
                  color: "#334155",
                  fontSize: { xs: "0.925rem", sm: "1rem" },
                  lineHeight: 1.8,
                }}
              >
                {para}
              </Typography>
            ))}

            {/* Venue Callout Sub-block */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                  fontSize: "1.15rem",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocationOnIcon sx={{ color: "#E11D48" }} />
                {editorial.drawVenueHeading}
              </Typography>

              <Box
                sx={{
                  p: 2.25,
                  borderRadius: "12px",
                  bgcolor: "#FFF1F2",
                  border: "1px solid #FFE4E6",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#9F1239" }}
                >
                  📍 {editorial.venueDetails.name},{" "}
                  {editorial.venueDetails.location}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#BE123C", mt: 0.5, fontWeight: 600 }}
                >
                  {editorial.venueDetails.city},{" "}
                  {editorial.venueDetails.state} • Draw Time:{" "}
                  <strong>{editorial.venueDetails.drawTime}</strong> (
                  {editorial.venueDetails.drawDay})
                </Typography>
              </Box>

              {editorial.drawVenueParagraphs.map((para, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    mb:
                      idx === editorial.drawVenueParagraphs.length - 1
                        ? 0
                        : 1,
                    color: "#475569",
                    fontSize: "0.925rem",
                    lineHeight: 1.7,
                  }}
                >
                  {para}
                </Typography>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

          {/* Section 4: Kerala State Lotteries Results (with Internal Link) */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <MonetizationOnIcon sx={{ color: "#0B3C5D" }} />
              {editorial.keralaStateLotteriesResultsHeading}
            </Typography>

            {editorial.keralaStateLotteriesResultsParagraphs.map((para, idx) => (
              <Typography
                key={idx}
                variant="body1"
                sx={{
                  mb:
                    idx ===
                    editorial.keralaStateLotteriesResultsParagraphs.length - 1
                      ? 0
                      : 1.5,
                  color: "#334155",
                  fontSize: { xs: "0.925rem", sm: "1rem" },
                  lineHeight: 1.8,
                }}
              >
                {idx === 0 ? (
                  <>
                    The{" "}
                    <Link
                      href="/"
                      style={{
                        color: "#0B3C5D",
                        fontWeight: 700,
                        textDecoration: "underline",
                      }}
                    >
                      Kerala State Lotteries Results
                    </Link>{" "}
                    are officially announced after each scheduled lottery draw
                    conducted by the Kerala State Lotteries Department. The
                    results contain the winning numbers and relevant prize
                    information for each lottery.
                  </>
                ) : (
                  para
                )}
              </Typography>
            ))}
          </Box>

          <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

          {/* Section 5: Weekly Lottery Scheme Details */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AccessTimeIcon sx={{ color: "#0B3C5D" }} />
              {editorial.weeklyLotteryHeading}
            </Typography>

            {editorial.weeklyLotteryParagraphs.map((para, idx) => (
              <Typography
                key={idx}
                variant="body1"
                sx={{
                  mb:
                    idx === editorial.weeklyLotteryParagraphs.length - 1
                      ? 0
                      : 1.5,
                  color: "#334155",
                  fontSize: { xs: "0.925rem", sm: "1rem" },
                  lineHeight: 1.8,
                }}
              >
                {para}
              </Typography>
            ))}
          </Box>

          <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

          {/* Section 6: Ticket Price & Prize Structure Table */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                mb: 2,
              }}
            >
              {editorial.ticketPriceHeading}
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              {editorial.ticketPriceParagraphs.map((para, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    mb:
                      idx === editorial.ticketPriceParagraphs.length - 1
                        ? 0
                        : 1.5,
                    color: "#475569",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                  }}
                >
                  {para}
                </Typography>
              ))}
            </Box>

            {/* Full-width Prize Categories Table */}
            <TableContainer
              sx={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                mb: 3,
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: "#334155",
                        fontSize: "0.825rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Prize Category
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 800,
                        color: "#334155",
                        fontSize: "0.825rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Prize Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editorial.prizes.map((p, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        bgcolor:
                          idx === 0
                            ? "#FEF3C7"
                            : idx % 2 === 1
                            ? "#F8FAFC"
                            : "transparent",
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: idx === 0 ? 800 : 600,
                          color: idx === 0 ? "#78350F" : "#334155",
                          fontSize: "0.9rem",
                        }}
                      >
                        {idx === 0 ? `🏆 ${p.category}` : p.category}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 800,
                          color: idx === 0 ? "#92400E" : "#0B3C5D",
                          fontSize: "0.95rem",
                        }}
                      >
                        {p.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

          {/* Section 7: Codes and Series */}
          <Box sx={{ mb: editorial.faqItems?.length ? 4 : 0 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                mb: 2,
              }}
            >
              {editorial.codesAndSeriesHeading}
            </Typography>

            {editorial.codesAndSeriesParagraphs.map((para, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  mb: 1.5,
                  color: "#475569",
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                }}
              >
                {para}
              </Typography>
            ))}

            {/* Series Chips Grid */}
            {editorial.seriesList && editorial.seriesList.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "#64748B",
                    display: "block",
                    mb: 1.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  Active Series Combinations:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {editorial.seriesList.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: "#F1F5F9",
                        color: "#0B3C5D",
                        border: "1px solid #CBD5E1",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        py: 0.5,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Section 8: Frequently Asked Questions */}
          {editorial.faqItems && editorial.faqItems.length > 0 && (
            <>
              <Divider sx={{ my: 4, borderColor: "#E2E8F0" }} />

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <HelpIcon sx={{ color: "#0B3C5D" }} />
                  <Typography
                    variant="h2"
                    component="h2"
                    sx={{
                      fontWeight: 800,
                      color: "#0F172A",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    Frequently Asked Questions ({lotteryInfo.name} Results)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 2.5 }}>
                  Common questions answered regarding {lotteryInfo.name} (
                  {lotteryInfo.code}) draws, prize claim policies, and winning
                  number verification:
                </Typography>

                {editorial.faqItems.map((item, idx) => (
                  <Accordion
                    key={idx}
                    elevation={0}
                    defaultExpanded={idx === 0}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px !important",
                      mb: 1.5,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#0B3C5D" }} />}
                      sx={{ fontWeight: 800, color: "#0F172A" }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                      >
                        {item.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, color: "#334155" }}>
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 1.7, fontSize: "0.9rem" }}
                      >
                        {item.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </>
          )}
        </Paper>

        {/* ============================================================== */}
        {/* CRAWLABLE HISTORICAL RESULTS INDEX & OTHER LOTTERIES           */}
        {/* ============================================================== */}
        {drawHistory.length > 0 && (
          <Paper
            elevation={0}
            component="nav"
            aria-label={`${lotteryInfo.name} Draw Results Index`}
            sx={{
              mt: 4,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CalendarMonthIcon sx={{ color: "#0B3C5D" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0F172A" }}
              >
                All {lotteryInfo.name} Historical Draw Results Index
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2.5 }}>
              Browse all indexed {lotteryInfo.name} ({lotteryInfo.code}) draw
              dates and verify 1st prize winning ticket numbers:
            </Typography>

            <Grid container spacing={1.5}>
              {drawHistory.map((d) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  key={d.draw_date}
                >
                  <Box
                    component={Link}
                    href={getLotteryUrl(lotterySlug, d.draw_date)}
                    sx={{
                      display: "block",
                      p: 1.5,
                      borderRadius: "8px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": {
                        bgcolor: "#EFF6FF",
                        borderColor: "#3B82F6",
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#0B3C5D" }}
                      >
                        📅 {d.draw_date}
                      </Typography>
                      <Chip
                        label={d.draw_code}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          bgcolor: "#E2E8F0",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B", display: "block", mt: 0.5 }}
                    >
                      1st: {d.first?.ticket || "Pending"}{" "}
                      {d.first?.location ? `• ${d.first.location}` : ""}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Cross-Link Other Kerala State Lotteries */}
        <Paper
          elevation={0}
          component="nav"
          aria-label="Other Kerala State Lotteries"
          sx={{
            mt: 4,
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}
          >
            Other Kerala State Weekly & Bumper Lotteries
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
            Explore other official weekly lotteries and bumper seasonal jackpot
            draws:
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            {otherWeekly.map((item) => {
              const logo = getLotteryLogo(item.code);
              return (
                <Button
                  key={item.code}
                  component={Link}
                  href={getLotteryUrl(item.code)}
                  variant="outlined"
                  size="small"
                  startIcon={
                    logo ? (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "6px",
                          overflow: "hidden",
                          display: "inline-flex",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={logo}
                          alt={getLotteryLogoAlt(item.name, item.day)}
                          width={24}
                          height={24}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ) : null
                  }
                  sx={{
                    color: "#334155",
                    borderColor: "#E2E8F0",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.8,
                    "&:hover": {
                      borderColor: "#0B3C5D",
                      bgcolor: "#F0F7FF",
                      color: "#0B3C5D",
                    },
                  }}
                >
                  {item.name} ({item.day})
                </Button>
              );
            })}
          </Box>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#64748B",
              display: "block",
              mb: 1,
            }}
          >
            Bumper Lotteries:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {BUMPER_LOTTERIES.map((item) => (
              <Button
                key={item.code}
                component={Link}
                href={getLotteryUrl(item.code)}
                variant="outlined"
                size="small"
                sx={{
                  color: "#D97706",
                  borderColor: "#FDE68A",
                  bgcolor: "#FFFBEB",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "#D97706",
                    bgcolor: "#FEF3C7",
                  },
                }}
              >
                🏆 {item.name} ({item.jackpot})
              </Button>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
