"use client";

import Link from "next/link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { HIDE_ON_MOBILE_CELL, MIN_TAP_SIZE } from "@/lib/responsiveSx";

const WEEKLY_SCHEDULE = [
  { name: "BHAGYATHARA", day: "Monday", code: "BT", slug: "bhagyathara" },
  { name: "STHREE-SAKTHI", day: "Tuesday", code: "SS", slug: "sthreesakthi" },
  { name: "DHANALEKSHMI", day: "Wednesday", code: "DL", slug: "dhanalekshmi" },
  { name: "KARUNYA PLUS", day: "Thursday", code: "KN", slug: "karunyaplus" },
  { name: "SUVARNA KERALAM", day: "Friday", code: "SK", slug: "suvarnakeralam" },
  { name: "KARUNYA", day: "Saturday", code: "KR", slug: "karunya" },
  { name: "SAMRUDHI", day: "Sunday", code: "SM", slug: "samrudhi" },
] as const;

const WEEKLY_PRIZE = "₹1 Crore";
const WEEKLY_TICKET_PRICE = "₹50";

const headCellSx = {
  fontWeight: 800,
  color: "#0B3C5D",
  py: 1.8,
  fontSize: "0.85rem",
} as const;

/**
 * Weekly draw schedule table used on both home layouts.
 * On phones the prize / price / action columns (identical for every row) are hidden
 * and summarised in a footer line, so the table fits without sideways scrolling.
 */
const WeeklyScheduleTable = () => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "18px",
      border: "1px solid #E2E8F0",
      overflow: "hidden",
      mb: 2.5,
      boxShadow: "0 4px 18px rgba(11, 60, 93, 0.04)",
    }}
  >
    <TableContainer>
      <Table size="medium">
        <TableHead sx={{ bgcolor: "#F8FAFC" }}>
          <TableRow>
            <TableCell sx={headCellSx}>LOTTERY NAME</TableCell>
            <TableCell sx={headCellSx}>DRAW DAY</TableCell>
            <TableCell sx={headCellSx}>CODE</TableCell>
            <TableCell sx={{ ...headCellSx, ...HIDE_ON_MOBILE_CELL }}>1ST PRIZE JACKPOT</TableCell>
            <TableCell sx={{ ...headCellSx, ...HIDE_ON_MOBILE_CELL }}>TICKET PRICE</TableCell>
            <TableCell sx={{ ...headCellSx, ...HIDE_ON_MOBILE_CELL, textAlign: "right" }}>
              ACTION
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {WEEKLY_SCHEDULE.map(({ name, day, code, slug }, idx) => (
            <TableRow
              key={code}
              sx={{
                bgcolor: idx % 2 === 1 ? "#FAFCFF" : "#FFFFFF",
                transition: "background-color 0.15s ease",
                "&:hover": { bgcolor: "#F0F7FF" },
              }}
            >
              <TableCell sx={{ fontWeight: 800, py: { xs: 0.5, sm: 1.8 } }}>
                <Link
                  href={`/${slug}`}
                  style={{
                    color: "#0B3C5D",
                    textDecoration: "none",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    minHeight: MIN_TAP_SIZE,
                  }}
                >
                  {name}
                  <ArrowForwardIcon sx={{ fontSize: 15, color: "#2563EB" }} />
                </Link>
              </TableCell>
              <TableCell sx={{ color: "#334155", fontWeight: 600 }}>{day}</TableCell>
              <TableCell>
                <Chip
                  label={code}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: "#EFF6FF",
                    color: "#1D4ED8",
                    borderRadius: "8px",
                    border: "1px solid #BFDBFE",
                  }}
                />
              </TableCell>
              <TableCell sx={HIDE_ON_MOBILE_CELL}>
                <Chip
                  label={WEEKLY_PRIZE}
                  size="small"
                  icon={
                    <EmojiEventsIcon
                      sx={{ fontSize: "14px !important", color: "#15803D !important" }}
                    />
                  }
                  sx={{
                    fontWeight: 800,
                    bgcolor: "#DCFCE7",
                    color: "#15803D",
                    borderRadius: "8px",
                    border: "1px solid #86EFAC",
                  }}
                />
              </TableCell>
              <TableCell sx={{ ...HIDE_ON_MOBILE_CELL, color: "#475569", fontWeight: 700 }}>
                {WEEKLY_TICKET_PRICE}
              </TableCell>
              <TableCell sx={{ ...HIDE_ON_MOBILE_CELL, textAlign: "right" }}>
                <Button
                  component={Link}
                  href={`/${slug}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    py: 0.4,
                    px: 1.4,
                    borderColor: "#CBD5E1",
                    color: "#0B3C5D",
                    "&:hover": { borderColor: "#0B3C5D", bgcolor: "rgba(11, 60, 93, 0.04)" },
                  }}
                >
                  View Result
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Typography
      sx={{
        display: { xs: "block", sm: "none" },
        px: 2,
        py: 1.25,
        fontSize: "0.8rem",
        color: "#475569",
        fontWeight: 600,
        borderTop: "1px solid #E2E8F0",
        bgcolor: "#F8FAFC",
      }}
    >
      {`Every weekly draw: ${WEEKLY_PRIZE} 1st prize • ${WEEKLY_TICKET_PRICE} ticket. Tap a lottery name to view its result.`}
    </Typography>
  </Paper>
);

export default WeeklyScheduleTable;
