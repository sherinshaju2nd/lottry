import Link from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import InsightsIcon from "@mui/icons-material/Insights";
import type { BlogRecentDraw } from "@/data/blogs";

type Variant = "verify" | "deadline";

interface Props {
  draws: BlogRecentDraw[];
  /** "verify": winning numbers to check a ticket against. "deadline": 90-day surrender dates. */
  variant: Variant;
  title: string;
  intro: string;
}

const HEAD_SX = { fontWeight: 800, color: "#0B3C5D", fontSize: "0.8rem", whiteSpace: "nowrap", bgcolor: "#F1F5F9" } as const;
const CELL_SX = { fontSize: "0.86rem", color: "#334155", whiteSpace: "nowrap" } as const;

const deadlineChip = (daysLeft: number) => {
  if (daysLeft < 0) return { label: "Expired", bg: "#FEE2E2", color: "#991B1B" };
  if (daysLeft <= 30) return { label: `${daysLeft} days left`, bg: "#FEF3C7", color: "#92400E" };
  return { label: `${daysLeft} days left`, bg: "#DCFCE7", color: "#166534" };
};

/** Summary line computed from the draws, so the "analysis" always matches the table. */
const buildInsight = (draws: BlogRecentDraw[], variant: Variant): string => {
  const [latest] = draws;
  const oldest = draws[draws.length - 1];
  const lotteries = new Set(draws.map(({ name }) => name)).size;
  if (variant === "verify") {
    const districts = new Set(draws.map(({ location }) => location).filter(Boolean)).size;
    return `${draws.length} draws from ${oldest.dateLong} to ${latest.dateLong} across ${lotteries} lotteries; first prizes were sold in ${districts} different places. Each winning number belongs to one lottery, one draw and one date only.`;
  }
  return `A winner of the ${oldest.name} ${oldest.code} draw (${oldest.dateLong}) must surrender the original ticket by ${oldest.claimDeadlineLong}; for the latest ${latest.name} ${latest.code} draw (${latest.dateLong}) the last date is ${latest.claimDeadlineLong}. Count 90 days from the draw date, not from the day you check the result.`;
};

const RecentDrawsAnalysis = ({ draws, variant, title, intro }: Props) => {
  if (draws.length === 0) return null;
  const isDeadline = variant === "deadline";

  return (
    <Paper
      component="aside"
      aria-label={title}
      elevation={0}
      sx={{ my: 4, borderRadius: "16px", border: "1.5px solid #BFDBFE", overflow: "hidden", bgcolor: "#FFFFFF" }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
        <Typography component="h3" sx={{ fontWeight: 900, color: "#1E3A8A", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 1 }}>
          <InsightsIcon sx={{ color: "#2563EB" }} /> {title}
        </Typography>
        <Typography sx={{ color: "#1E3A8A", fontSize: "0.88rem", mt: 0.75, lineHeight: 1.6 }}>{intro}</Typography>
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label={title}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEAD_SX}>Draw date</TableCell>
              <TableCell sx={HEAD_SX}>Lottery</TableCell>
              <TableCell sx={HEAD_SX}>1st prize ticket</TableCell>
              <TableCell sx={HEAD_SX}>{isDeadline ? "Last date to surrender" : "Sold at"}</TableCell>
              {isDeadline && <TableCell sx={HEAD_SX}>Status</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {draws.map(({ code, name, date, dateLong, firstTicket, location, url, claimDeadlineLong, daysLeft }) => {
              const chip = deadlineChip(daysLeft);
              return (
                <TableRow key={`${code}-${date}`} hover>
                  <TableCell sx={CELL_SX}>
                    <time dateTime={date}>{dateLong}</time>
                  </TableCell>
                  <TableCell sx={CELL_SX}>
                    <Link href={url} style={{ color: "#0B3C5D", fontWeight: 700 }}>
                      {name} {code}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ ...CELL_SX, fontFamily: "monospace", fontWeight: 800, color: "#B91C1C", fontSize: "0.92rem" }}>
                    {firstTicket || "—"}
                  </TableCell>
                  <TableCell sx={CELL_SX}>{isDeadline ? claimDeadlineLong : location || "—"}</TableCell>
                  {isDeadline && (
                    <TableCell sx={CELL_SX}>
                      <Chip size="small" label={chip.label} sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 800 }} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Typography sx={{ p: { xs: 2, sm: 2.5 }, fontSize: "0.85rem", color: "#475569", lineHeight: 1.6, borderTop: "1px solid #E2E8F0" }}>
        <strong>Analysis:</strong> {buildInsight(draws, variant)}
      </Typography>
    </Paper>
  );
};

export default RecentDrawsAnalysis;
