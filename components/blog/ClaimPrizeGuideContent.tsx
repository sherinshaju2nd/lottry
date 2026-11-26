import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { LabeledItem, SplitText } from "@/data/blogTranslations/types";
import type { ClaimPrizeCopy } from "@/data/blogTranslations/claimPrize/types";
import { claimPrizeCopyEn } from "@/data/blogTranslations/claimPrize/en";

const LINK_STYLE = { color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" } as const;
const H2_SX = { fontWeight: 800, color: "#0B3C5D", mb: 2 } as const;
const BODY_COLOR = "#334155";

/** Sentence whose highlighted part links to the results home page. */
const ResultsLinkText = ({ text: { before, highlight, after } }: { text: SplitText }) => (
  <>
    {before}
    <Link href="/" style={LINK_STYLE}>
      {highlight}
    </Link>
    {after}
  </>
);

const LabeledList = ({ items, gap = 1 }: { items: LabeledItem[]; gap?: number }) => (
  <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap }}>
    {items.map(({ label, text }) => (
      <li key={label}>
        <strong>{label}</strong> {text}
      </li>
    ))}
  </Box>
);

/** Plain paragraphs; every one but the last keeps a bottom margin. */
const Paragraphs = ({ items }: { items: string[] }) => (
  <>
    {items.map((text, idx) => (
      <Typography key={idx} variant="body1" sx={{ color: BODY_COLOR, mb: idx < items.length - 1 ? 2 : 0 }}>
        {text}
      </Typography>
    ))}
  </>
);

const TIER_ICONS = [
  <LocationOnIcon key="agent" sx={{ color: "#16A34A", mt: 0.3 }} />,
  <LocationOnIcon key="district" sx={{ color: "#2563EB", mt: 0.3 }} />,
  <AccountBalanceIcon key="directorate" sx={{ color: "#9333EA", mt: 0.3 }} />,
];

interface Props {
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/claimPrize. */
  copy?: ClaimPrizeCopy;
}

const ClaimPrizeGuideContent = ({ copy = claimPrizeCopyEn }: Props) => {
  const {
    intro,
    introLinked,
    afterWinning,
    howToClaim,
    claimProcess,
    documents,
    prizeMoney,
    whereToClaim,
    deadline,
    safety,
    verification,
    categories,
    checklist,
  } = copy;

  return (
    <>
      {/* Introduction */}
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: "1.05rem", sm: "1.12rem" },
          color: "#1E293B",
          mb: 3,
          lineHeight: 1.8,
        }}
      >
        {intro}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: "1rem", sm: "1.05rem" },
          color: BODY_COLOR,
          mb: 4,
          lineHeight: 1.8,
        }}
      >
        <ResultsLinkText text={introLinked} />
      </Typography>

      {/* Section 1: What to Do After Winning */}
      <Box id="what-to-do-after-winning" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {afterWinning.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2.5 }}>
          {afterWinning.p1}
        </Typography>

        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: "14px", bgcolor: "#F8FAFC", border: "1.5px solid #E2E8F0", mb: 3 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A", mb: 1.5 }}>
            {afterWinning.checkHeading}
          </Typography>
          <LabeledList items={afterWinning.checks} />
        </Paper>

        <Typography variant="body1" sx={{ color: BODY_COLOR }}>
          {afterWinning.p2}
        </Typography>
      </Box>

      {/* Section 2: How to Claim Kerala Lottery (General process) */}
      <Box id="how-to-claim-general" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {howToClaim.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 3 }}>
          {howToClaim.p1}
        </Typography>

        {/* Step-by-Step Visual Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {howToClaim.steps.map(({ title, desc }, idx) => (
            <Box
              key={title}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
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
                {idx + 1}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>{title}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>{desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <Typography variant="body2" sx={{ color: "#1E40AF", fontWeight: 600 }}>
            {howToClaim.tip}
          </Typography>
        </Paper>
      </Box>

      {/* Section 3: Prize Claim Process */}
      <Box id="prize-claim-process" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {claimProcess.title}
        </Typography>
        <Paragraphs items={claimProcess.paragraphs} />
      </Box>

      {/* Section 4: Claim Documents */}
      <Box id="claim-documents" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {documents.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2.5 }}>
          {documents.p1}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {documents.items.map(({ label, text }) => (
            <Grid key={label} size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  height: "100%",
                  display: "flex",
                  gap: 1.5,
                }}
              >
                <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 22, mt: 0.3 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>{text}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="body1" sx={{ color: BODY_COLOR }}>
          {documents.p2}
        </Typography>
      </Box>

      {/* Section 5: How to Claim Prize Money */}
      <Box id="claim-prize-money" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {prizeMoney.title}
        </Typography>
        {prizeMoney.paragraphs.map((text, idx) => (
          <Typography key={idx} variant="body1" sx={{ color: BODY_COLOR, mb: 2 }}>
            {text}
          </Typography>
        ))}

        <Paper
          variant="outlined"
          sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#FEF2F2", border: "1.5px solid #FECACA", mb: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <WarningAmberIcon sx={{ color: "#DC2626" }} />
            <Typography sx={{ fontWeight: 800, color: "#991B1B" }}>{prizeMoney.warningTitle}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#7F1D1D" }}>
            {prizeMoney.warning}
          </Typography>
        </Paper>
      </Box>

      {/* Section 6: Where to Claim */}
      <Box id="where-to-claim" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {whereToClaim.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2.5 }}>
          {whereToClaim.p1}
        </Typography>

        {/* Location Matrix */}
        <Paper variant="outlined" sx={{ borderRadius: "14px", overflow: "hidden", mb: 3 }}>
          <Box sx={{ bgcolor: "#0B3C5D", color: "#FFFFFF", p: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>{whereToClaim.matrixTitle}</Typography>
          </Box>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            {whereToClaim.tiers.map(({ label, text }, idx) => (
              <Box key={label} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                {TIER_ICONS[idx] ?? TIER_ICONS[0]}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>{label}</Typography>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    {text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        <Typography variant="body1" sx={{ color: BODY_COLOR }}>
          {whereToClaim.p2}
        </Typography>
      </Box>

      {/* Section 7: Claim Deadline */}
      <Box id="claim-deadline" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {deadline.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2 }}>
          {deadline.p1}
        </Typography>

        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: "14px", bgcolor: "#FFFBEB", border: "1.5px solid #FDE68A", mb: 2.5 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <ScheduleIcon sx={{ color: "#D97706", fontSize: 24 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#92400E" }}>
              {deadline.boxTitle}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.7 }}>
            {deadline.box.before}
            <strong>{deadline.box.highlight}</strong>
            {deadline.box.after}
          </Typography>
        </Paper>

        <Typography variant="body1" sx={{ color: BODY_COLOR }}>
          {deadline.p2}
        </Typography>
      </Box>

      {/* Section 8: How to Claim Safely */}
      <Box id="claim-safely" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {safety.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2.5 }}>
          {safety.p1}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: "14px", bgcolor: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SecurityIcon sx={{ color: "#0B3C5D" }} />
            <Typography sx={{ fontWeight: 800, color: "#0B3C5D" }}>{safety.rulesTitle}</Typography>
          </Box>
          <LabeledList items={safety.rules} gap={1.2} />
        </Paper>
      </Box>

      {/* Section 9: Ticket Verification */}
      <Box id="ticket-verification" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {verification.title}
        </Typography>
        <Paragraphs items={verification.paragraphs} />
      </Box>

      {/* Section 10: Procedure by Prize Categories */}
      <Box id="prize-categories" sx={{ scrollMarginTop: 100, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {categories.title}
        </Typography>
        <Paragraphs items={categories.paragraphs} />
      </Box>

      {/* Section 11: Final Checklist */}
      <Box id="final-checklist" sx={{ scrollMarginTop: 100, mb: 6 }}>
        <Typography variant="h4" component="h2" sx={H2_SX}>
          {checklist.title}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2.5 }}>
          {checklist.p1}
        </Typography>

        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: "14px", bgcolor: "#F0FDF4", border: "1.5px solid #BBF7D0", mb: 3 }}
        >
          <LabeledList items={checklist.items} />
        </Paper>

        <Typography variant="body1" sx={{ color: BODY_COLOR, mb: 2 }}>
          {checklist.p2}
        </Typography>
        <Typography variant="body1" sx={{ color: BODY_COLOR }}>
          <ResultsLinkText text={checklist.closingLinked} />
        </Typography>
      </Box>
    </>
  );
};

export default ClaimPrizeGuideContent;
