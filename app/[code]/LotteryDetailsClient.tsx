"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  StructuredDrawResult,
  getLotteryUrl,
  supabase,
} from "@/lib/supabase";

interface LotteryInfoType {
  day: string;
  name: string;
  nameMl: string;
  code: string;
  is_bumper?: boolean;
  jackpot?: string;
  draw_season?: string;
}

interface LotteryDetailsClientProps {
  lotteryInfo: LotteryInfoType;
  lotteryCode: string;
  lotterySlug: string;
  initialDraws: StructuredDrawResult[];
  initialLotteryMeta: any;
}

export default function LotteryDetailsClient({
  lotteryInfo,
  lotteryCode,
  lotterySlug,
  initialDraws,
  initialLotteryMeta,
}: LotteryDetailsClientProps) {
  const router = useRouter();

  const todayISTDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const [drawHistory, setDrawHistory] = useState<StructuredDrawResult[]>(initialDraws);
  const [filteredDraws, setFilteredDraws] = useState<StructuredDrawResult[]>(initialDraws);
  const [lotteryDbMeta] = useState<any>(initialLotteryMeta);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  const refreshHistory = async () => {
    try {
      const res = await fetch(`/api/draws?type=history&code=${lotteryCode}&t=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.results)) {
        setDrawHistory(json.results);
      }
    } catch {}
  };

  useEffect(() => {
    // Realtime Supabase live update listener for this lottery
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
        const ticketMatch = (draw.first?.ticket || "")
          .toLowerCase()
          .includes(q);
        return dateMatch || nameMatch || codeMatch || ticketMatch;
      });
      setFilteredDraws(filtered);
    }
    setPage(0);
  }, [searchFilter, drawHistory]);

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "table" | "grid" | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (date: string) => {
    router.push(getLotteryUrl(lotterySlug, date));
  };

  const paginatedDraws = filteredDraws.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const otherWeekly = WEEKLY_LOTTERIES.filter((l) => l.code !== lotteryCode);

  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        color: "#111827",
        minHeight: "100vh",
        py: { xs: 3, sm: 5, md: 6 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 2.5 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: "#9CA3AF" }} />}
            aria-label="breadcrumb"
          >
            <Link
              href="/"
              style={{
                color: "#6B7280",
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
              {lotteryInfo.name} Results & Archives
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "#4B5563",
              mb: 2,
              borderRadius: "4px",
              "&:hover": { color: "#0B3C5D" },
            }}
          >
            Back to Live Schedule
          </Button>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ maxWidth: { xs: "100%", md: "70%" } }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 900,
                  color: "#111827",
                  fontSize: { xs: "1.4rem", sm: "2rem", md: "2.5rem" },
                }}
              >
                {lotteryInfo.name} ({lotteryInfo.code}) Result Today & Archives
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#6B7280",
                  mt: 0.5,
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                }}
              >
                Draw Day: <strong>{lotteryInfo.day}</strong> | Draw Time:{" "}
                <strong>{lotteryInfo.code.startsWith("Bumper") ? "2:00 PM" : "3:00 PM"}</strong> | Total Draws:{" "}
                <strong>{filteredDraws.length}</strong>
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <ToggleButton
                value="table"
                sx={{
                  px: 2,
                  py: 1,
                  flex: 1,
                  fontWeight: 700,
                  "&.Mui-selected": { bgcolor: "#EBF5FF", color: "#0B3C5D" },
                }}
              >
                <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> Table View
              </ToggleButton>
              <ToggleButton
                value="grid"
                sx={{
                  px: 2,
                  py: 1,
                  flex: 1,
                  fontWeight: 700,
                  "&.Mui-selected": { bgcolor: "#EBF5FF", color: "#0B3C5D" },
                }}
              >
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} /> Grid View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Upcoming Announced Draw Banner */}
        {lotteryDbMeta?.draw_date && lotteryDbMeta.draw_date >= todayISTDate && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              mb: 4,
              borderRadius: "16px",
              border: "2px solid #F59E0B",
              bgcolor: "#FFFDF0",
              boxShadow: "0 4px 20px rgba(245, 158, 11, 0.15)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Chip
                label={lotteryDbMeta.draw_date === todayISTDate ? "👑 DRAWS TODAY" : `👑 DRAW ANNOUNCED: ${lotteryDbMeta.draw_date}`}
                size="small"
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  mb: 1,
                  border: "1px solid #F59E0B",
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#78350F" }}>
                Next Scheduled Draw: {lotteryDbMeta.draw_date}
              </Typography>
              <Typography variant="body2" sx={{ color: "#92400E", fontWeight: 600, mt: 0.5 }}>
                Draw Time: {lotteryDbMeta.draw_time || (lotteryInfo.code.startsWith("Bumper") ? "2:00 PM" : "3:00 PM")} {lotteryDbMeta.jackpot ? `• Jackpot: ${lotteryDbMeta.jackpot}` : ""} {lotteryDbMeta.ticket_price ? `• Ticket: ${lotteryDbMeta.ticket_price}` : ""}
              </Typography>
            </Box>
            <Button
              component={Link}
              href={`/${lotterySlug}/${lotteryDbMeta.draw_date}`}
              variant="contained"
              sx={{
                bgcolor: "#D97706",
                color: "#FFFFFF",
                fontWeight: 800,
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#B45309" },
              }}
            >
              View Draw Details →
            </Button>
          </Paper>
        )}

        {/* Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 4,
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, sm: 8, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by date (YYYY-MM-DD), draw code, or winning ticket..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: "#9CA3AF", mr: 1 }}
                      />
                    ),
                  },
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 4, md: 6 }}
              sx={{
                textAlign: { xs: "left", sm: "right" },
                color: "#6B7280",
                fontSize: "0.875rem",
              }}
            >
              Showing <strong>{filteredDraws.length}</strong> draw results
            </Grid>
          </Grid>
        </Paper>

        {/* Draw History List */}
        {filteredDraws.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="h6" sx={{ color: "#374151", mb: 1 }}>
              No Draw Results Found
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {searchFilter
                ? `No draws matched your search query "${searchFilter}".`
                : "No historical draws are currently indexed for this lottery."}
            </Typography>
          </Paper>
        ) : viewMode === "table" ? (
          /* Table View */
          <Paper
            elevation={0}
            sx={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#374151",
                        fontSize: "0.85rem",
                      }}
                    >
                      Draw Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#374151",
                        fontSize: "0.85rem",
                      }}
                    >
                      Draw Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#374151",
                        fontSize: "0.85rem",
                      }}
                    >
                      Draw Code
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#374151",
                        fontSize: "0.85rem",
                      }}
                    >
                      1st Prize Ticket
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#374151",
                        fontSize: "0.85rem",
                      }}
                    >
                      Winner Location
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: "#374151",
                        fontSize: "0.85rem",
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
                      onClick={() => handleRowClick(draw.draw_date)}
                      sx={{
                        cursor: "pointer",
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                        <Link
                          href={getLotteryUrl(lotterySlug, draw.draw_date)}
                          style={{
                            color: "#0B3C5D",
                            textDecoration: "none",
                            fontWeight: 700,
                          }}
                        >
                          {draw.draw_date}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ color: "#374151" }}>
                        {draw.draw_name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={draw.draw_code}
                          size="small"
                          sx={{
                            bgcolor: "#EFF6FF",
                            color: "#1D4ED8",
                            fontWeight: 700,
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {draw.first?.ticket ? (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 800,
                              color: "#0B3C5D",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {draw.first.ticket}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#9CA3AF" }}
                          >
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>
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
                            borderRadius: "4px",
                            borderColor: "#E5E7EB",
                            color: "#374151",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "#0B3C5D",
                              bgcolor: "#EBF5FF",
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
              sx={{ borderTop: "1px solid #E5E7EB" }}
            />
          </Paper>
        ) : (
          /* Grid View */
          <>
            <Grid container spacing={2}>
              {paginatedDraws.map((draw) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={draw.draw_date}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      height: "100%",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.06)",
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
                              color: "#6B7280",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {draw.draw_date}
                          </Typography>
                          <Chip
                            label={draw.draw_code}
                            size="small"
                            sx={{
                              bgcolor: "#EFF6FF",
                              color: "#1D4ED8",
                              fontWeight: 700,
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#111827",
                            mb: 2,
                            fontSize: "1.1rem",
                          }}
                        >
                          {draw.draw_name}
                        </Typography>

                        <Box
                          sx={{
                            bgcolor: "#F9FAFB",
                            p: 1.5,
                            borderRadius: "4px",
                            border: "1px solid #E5E7EB",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#4B5563",
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
                              fontWeight: 800,
                              color: "#0B3C5D",
                              fontSize: "1.15rem",
                              letterSpacing: "0.05em",
                              mt: 0.5,
                            }}
                          >
                            {draw.first?.ticket || "N/A"}
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{ color: "#6B7280", display: "block" }}
                        >
                          Location:{" "}
                          <strong>{draw.first?.location || "N/A"}</strong>
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
                            fontWeight: 700,
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

        {/* Complete Crawlable Historical Draw Archive Links */}
        {drawHistory.length > 0 && (
          <Paper
            elevation={0}
            component="nav"
            aria-label={`${lotteryInfo.name} Draw Archives Index`}
            sx={{
              mt: 6,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CalendarMonthIcon sx={{ color: "#0B3C5D" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                All {lotteryInfo.name} Historical Draw Results
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 2.5 }}>
              Browse all indexed {lotteryInfo.name} ({lotteryInfo.code}) draw dates and verify 1st prize winning ticket numbers:
            </Typography>

            <Grid container spacing={1.5}>
              {drawHistory.map((d) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={d.draw_date}>
                  <Box
                    component={Link}
                    href={getLotteryUrl(lotterySlug, d.draw_date)}
                    sx={{
                      display: "block",
                      p: 1.5,
                      borderRadius: "8px",
                      bgcolor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0B3C5D" }}>
                        📅 {d.draw_date}
                      </Typography>
                      <Chip
                        label={d.draw_code}
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#E2E8F0" }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mt: 0.5 }}>
                      1st: {d.first?.ticket || "Pending"} {d.first?.location ? `• ${d.first.location}` : ""}
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
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 1 }}>
            Other Kerala State Weekly & Bumper Lotteries
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
            Explore other official weekly lotteries and bumper seasonal jackpot draws:
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            {otherWeekly.map((item) => (
              <Button
                key={item.code}
                component={Link}
                href={getLotteryUrl(item.code)}
                variant="outlined"
                size="small"
                sx={{
                  color: "#374151",
                  borderColor: "#E5E7EB",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#0B3C5D",
                    bgcolor: "#F0F7FF",
                    color: "#0B3C5D",
                  },
                }}
              >
                {item.name} ({item.day})
              </Button>
            ))}
          </Box>

          <Typography variant="caption" sx={{ fontWeight: 700, color: "#6B7280", display: "block", mb: 1 }}>
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
