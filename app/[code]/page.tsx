"use client";

import React, { useEffect, useState, use } from "react";
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
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import LotteryCardSkeleton from "@/components/skeletons/LotteryCardSkeleton";
import {
  ALL_LOTTERIES,
  StructuredDrawResult,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getLotteryUrl,
} from "@/lib/supabase";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function LotteryDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const router = useRouter();

  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode) || {
    name: `${rawCode} Lottery`,
    code: lotteryCode,
    day: "Scheduled Draw",
  };

  const [drawHistory, setDrawHistory] = useState<StructuredDrawResult[]>([]);
  const [filteredDraws, setFilteredDraws] = useState<StructuredDrawResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/draws?code=${lotteryCode}&type=history`);
        const json = await res.json();
        const results: StructuredDrawResult[] = json.results || [];
        setDrawHistory(results);
        setFilteredDraws(results);
      } catch {
        setDrawHistory([]);
        setFilteredDraws([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
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
            Back to Schedule
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
        {isLoading ? (
          viewMode === "table" ? (
            <TableSkeleton rows={10} />
          ) : (
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <LotteryCardSkeleton />
                </Grid>
              ))}
            </Grid>
          )
        ) : filteredDraws.length === 0 ? (
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
                        {draw.draw_date}
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
      </Container>
    </Box>
  );
}
