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
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import LotteryCardSkeleton from "@/components/skeletons/LotteryCardSkeleton";
import ShareButtons from "@/components/ShareButtons";
import { WEEKLY_LOTTERIES, StructuredDrawResult } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function LotteryDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const codeParam = resolvedParams.code.toUpperCase();
  const router = useRouter();

  const lotteryInfo = WEEKLY_LOTTERIES.find((l) => l.code === codeParam) || {
    name: `${codeParam} Lottery`,
    code: codeParam,
    day: "Scheduled Draw",
  };

  const [drawHistory, setDrawHistory] = useState<StructuredDrawResult[]>([]);
  const [filteredDraws, setFilteredDraws] = useState<StructuredDrawResult[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/draws?code=${codeParam}&type=history`);
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
  }, [codeParam]);

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
    router.push(
      `/lottery/${codeParam.toLowerCase()}/${encodeURIComponent(date)}`,
    );
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
              "&:hover": { color: "#1B5E20" },
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
                <strong>3:00 PM</strong> | Total Draws:{" "}
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
                  "&.Mui-selected": { bgcolor: "#E8F5E9", color: "#2E7D32" },
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
                  "&.Mui-selected": { bgcolor: "#E8F5E9", color: "#2E7D32" },
                }}
              >
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} /> Grid View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        {/* Social Share Buttons
        <ShareButtons
          title={`Kerala ${lotteryInfo.name} (${lotteryInfo.code}) Draw Results Today`}
          text={`Check official ${lotteryInfo.name} (${lotteryInfo.code}) draw results held every ${lotteryInfo.day} at 3:00 PM!`}
        /> */}
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
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by date (e.g. 2026-08-09) or ticket..."
                variant="outlined"
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ color: "#9CA3AF", mr: 1 }} />
                    ),
                  },
                }}
              />
            </Grid>

            {searchFilter && (
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <Button
                  size="small"
                  onClick={() => setSearchFilter("")}
                  sx={{ color: "#6B7280" }}
                >
                  Clear Filter
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
        {/* Skeleton Loading State */}
        {isLoading ? (
          viewMode === "table" ? (
            <TableSkeleton rows={8} />
          ) : (
            <LotteryCardSkeleton count={8} />
          )
        ) : filteredDraws.length > 0 ? (
          <>
            {/* Table View (Default with Row Click Navigation) */}
            {viewMode === "table" && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                <TableContainer
                  sx={{ width: "100%", overflowX: "auto", display: "block" }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: "#F3F4F6" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: "#374151" }}>
                          Draw Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#374151" }}>
                          Draw Name & Code
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#374151" }}>
                          1st Prize Winning Ticket
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#374151" }}>
                          Prize Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#374151" }}>
                          Winner Location / Agent
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, color: "#374151" }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDraws.map((row) => (
                        <TableRow
                          key={row.id || row.draw_date}
                          hover
                          onClick={() => handleRowClick(row.draw_date)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#F0FDF4" },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 800, color: "#111827" }}>
                            {row.draw_date}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 800, color: "#2E7D32" }}
                              >
                                {row.draw_name}
                              </Typography>
                              <Chip
                                label={row.draw_code}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: "#E0F2FE",
                                  color: "#0369A1",
                                  borderRadius: "4px",
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 900,
                                color: "#D97706",
                              }}
                            >
                              {row.first?.ticket || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1B5E20" }}>
                            {row.prizes?.amounts?.["1st"] || "1,00,00,000/-"}
                          </TableCell>
                          <TableCell
                            sx={{ color: "#4B5563", fontSize: "0.875rem" }}
                          >
                            {row.first?.location || "N/A"} /{" "}
                            {row.first?.agent || "N/A"}
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              component={Link}
                              href={`/lottery/${codeParam.toLowerCase()}/${encodeURIComponent(row.draw_date)}`}
                              size="small"
                              variant="contained"
                              startIcon={<VisibilityIcon />}
                              sx={{
                                bgcolor: "#2E7D32",
                                fontWeight: 700,
                                borderRadius: "4px",
                                "&:hover": { bgcolor: "#1B5E20" },
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
              </Paper>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {paginatedDraws.map((row) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={row.id || row.draw_date}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: "4px",
                        border: "1px solid #E5E7EB",
                        transition:
                          "border-color 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          borderColor: "#2E7D32",
                          boxShadow: "0 6px 16px rgba(46, 125, 50, 0.1)",
                        },
                      }}
                    >
                      <CardActionArea
                        component={Link}
                        href={`/lottery/${codeParam.toLowerCase()}/${encodeURIComponent(row.draw_date)}`}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={row.draw_date}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#F3F4F6",
                                color: "#374151",
                                borderRadius: "4px",
                              }}
                            />
                            <Chip
                              label={row.draw_code}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#E0F2FE",
                                color: "#0369A1",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "#111827", mb: 1 }}
                          >
                            {row.draw_name}
                          </Typography>

                          <Box
                            sx={{
                              bgcolor: "#FEF3C7",
                              p: 1.5,
                              borderRadius: "4px",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#B45309",
                                fontWeight: 700,
                                display: "block",
                              }}
                            >
                              1ST PRIZE TICKET
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 900,
                                color: "#92400E",
                              }}
                            >
                              {row.first?.ticket || "N/A"}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{ color: "#4B5563", fontSize: "0.85rem" }}
                          >
                            Location:{" "}
                            <strong>{row.first?.location || "N/A"}</strong>
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination Controls */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                bgcolor: "#FFFFFF",
              }}
            >
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredDraws.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
              No Draw Records Found
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              No historical draw records matched your search filter for{" "}
              {lotteryInfo.name} ({codeParam}).
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
