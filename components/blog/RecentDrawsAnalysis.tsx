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
import type { BlogLanguage } from "@/data/blogTranslations/types";

type Variant = "verify" | "deadline";

interface Props {
  draws: BlogRecentDraw[];
  /** "verify": winning numbers to check a ticket against. "deadline": 90-day surrender dates. */
  variant: Variant;
  title: string;
  intro: string;
  /** Language of the table headings and computed analysis (defaults to English). */
  language?: BlogLanguage;
}

interface InsightArgs {
  count: number;
  lotteries: number;
  districts: number;
  oldest: BlogRecentDraw;
  latest: BlogRecentDraw;
}

interface Labels {
  drawDate: string;
  lottery: string;
  firstPrize: string;
  lastDate: string;
  soldAt: string;
  status: string;
  expired: string;
  daysLeft: (days: number) => string;
  analysis: string;
  verify: (args: InsightArgs) => string;
  deadline: (args: InsightArgs) => string;
}

const LABELS: Record<BlogLanguage, Labels> = {
  en: {
    drawDate: "Draw date",
    lottery: "Lottery",
    firstPrize: "1st prize ticket",
    lastDate: "Last date to surrender",
    soldAt: "Sold at",
    status: "Status",
    expired: "Expired",
    daysLeft: (days) => `${days} days left`,
    analysis: "Analysis:",
    verify: ({ count, lotteries, districts, oldest, latest }) =>
      `${count} draws from ${oldest.dateLong} to ${latest.dateLong} across ${lotteries} lotteries; first prizes were sold in ${districts} different places. Each winning number belongs to one lottery, one draw and one date only.`,
    deadline: ({ oldest, latest }) =>
      `A winner of the ${oldest.name} ${oldest.code} draw (${oldest.dateLong}) must surrender the original ticket by ${oldest.claimDeadlineLong}; for the latest ${latest.name} ${latest.code} draw (${latest.dateLong}) the last date is ${latest.claimDeadlineLong}. Count 90 days from the draw date, not from the day you check the result.`,
  },
  ml: {
    drawDate: "നറുക്കെടുപ്പ് തീയതി",
    lottery: "ലോട്ടറി",
    firstPrize: "ഒന്നാം സമ്മാന ടിക്കറ്റ്",
    lastDate: "സറണ്ടർ ചെയ്യാനുള്ള അവസാന തീയതി",
    soldAt: "വിറ്റ സ്ഥലം",
    status: "നില",
    expired: "കാലാവധി കഴിഞ്ഞു",
    daysLeft: (days) => `${days} ദിവസം ബാക്കി`,
    analysis: "വിശകലനം:",
    verify: ({ count, lotteries, districts, oldest, latest }) =>
      `${oldest.dateLong} മുതൽ ${latest.dateLong} വരെ ${lotteries} ലോട്ടറികളിലായി ${count} നറുക്കെടുപ്പുകൾ; ഒന്നാം സമ്മാന ടിക്കറ്റുകൾ ${districts} വ്യത്യസ്ത സ്ഥലങ്ങളിൽ വിറ്റു. ഓരോ വിജയ നമ്പറും ഒരു ലോട്ടറിക്കും ഒരു നറുക്കെടുപ്പിനും ഒരു തീയതിക്കും മാത്രം ഉള്ളതാണ്.`,
    deadline: ({ oldest, latest }) =>
      `${oldest.name} ${oldest.code} നറുക്കെടുപ്പിലെ (${oldest.dateLong}) വിജയി ${oldest.claimDeadlineLong}-നകം ഒറിജിനൽ ടിക്കറ്റ് സറണ്ടർ ചെയ്യണം; ഏറ്റവും പുതിയ ${latest.name} ${latest.code} നറുക്കെടുപ്പിന് (${latest.dateLong}) അവസാന തീയതി ${latest.claimDeadlineLong} ആണ്. ഫലം പരിശോധിക്കുന്ന ദിവസം മുതലല്ല, നറുക്കെടുപ്പ് തീയതി മുതൽ 90 ദിവസം കണക്കാക്കുക.`,
  },
  hi: {
    drawDate: "ड्रॉ की तारीख",
    lottery: "लॉटरी",
    firstPrize: "पहले इनाम का टिकट",
    lastDate: "टिकट जमा करने की आखिरी तारीख",
    soldAt: "कहाँ बिका",
    status: "स्थिति",
    expired: "समय खत्म",
    daysLeft: (days) => `${days} दिन बाकी`,
    analysis: "विश्लेषण:",
    verify: ({ count, lotteries, districts, oldest, latest }) =>
      `${oldest.dateLong} से ${latest.dateLong} तक ${lotteries} लॉटरियों के ${count} ड्रॉ; पहले इनाम के टिकट ${districts} अलग-अलग जगहों पर बिके। हर विजेता नंबर सिर्फ एक लॉटरी, एक ड्रॉ और एक तारीख का होता है।`,
    deadline: ({ oldest, latest }) =>
      `${oldest.name} ${oldest.code} ड्रॉ (${oldest.dateLong}) के विजेता को ${oldest.claimDeadlineLong} तक मूल टिकट जमा करना होगा; नवीनतम ${latest.name} ${latest.code} ड्रॉ (${latest.dateLong}) के लिए आखिरी तारीख ${latest.claimDeadlineLong} है। 90 दिन ड्रॉ की तारीख से गिनें, उस दिन से नहीं जिस दिन आप रिज़ल्ट देखते हैं।`,
  },
  ta: {
    drawDate: "குலுக்கல் தேதி",
    lottery: "லாட்டரி",
    firstPrize: "முதல் பரிசு டிக்கெட்",
    lastDate: "ஒப்படைக்க கடைசி தேதி",
    soldAt: "விற்கப்பட்ட இடம்",
    status: "நிலை",
    expired: "காலாவதியானது",
    daysLeft: (days) => `${days} நாட்கள் மீதம்`,
    analysis: "பகுப்பாய்வு:",
    verify: ({ count, lotteries, districts, oldest, latest }) =>
      `${oldest.dateLong} முதல் ${latest.dateLong} வரை ${lotteries} லாட்டரிகளில் ${count} குலுக்கல்கள்; முதல் பரிசு டிக்கெட்டுகள் ${districts} வெவ்வேறு இடங்களில் விற்கப்பட்டன. ஒவ்வொரு வெற்றி எண்ணும் ஒரு லாட்டரி, ஒரு குலுக்கல், ஒரு தேதிக்கு மட்டுமே உரியது.`,
    deadline: ({ oldest, latest }) =>
      `${oldest.name} ${oldest.code} குலுக்கலின் (${oldest.dateLong}) வெற்றியாளர் ${oldest.claimDeadlineLong}-க்குள் அசல் டிக்கெட்டை ஒப்படைக்க வேண்டும்; சமீபத்திய ${latest.name} ${latest.code} குலுக்கலுக்கு (${latest.dateLong}) கடைசி தேதி ${latest.claimDeadlineLong}. முடிவைப் பார்க்கும் நாளிலிருந்து அல்ல, குலுக்கல் தேதியிலிருந்து 90 நாட்களைக் கணக்கிடுங்கள்.`,
  },
  te: {
    drawDate: "డ్రా తేదీ",
    lottery: "లాటరీ",
    firstPrize: "మొదటి బహుమతి టికెట్",
    lastDate: "అప్పగించడానికి చివరి తేదీ",
    soldAt: "అమ్మిన ప్రదేశం",
    status: "స్థితి",
    expired: "గడువు ముగిసింది",
    daysLeft: (days) => `${days} రోజులు మిగిలాయి`,
    analysis: "విశ్లేషణ:",
    verify: ({ count, lotteries, districts, oldest, latest }) =>
      `${oldest.dateLong} నుండి ${latest.dateLong} వరకు ${lotteries} లాటరీలలో ${count} డ్రాలు; మొదటి బహుమతి టికెట్లు ${districts} వేర్వేరు ప్రదేశాల్లో అమ్ముడయ్యాయి. ప్రతి విజేత నంబర్ ఒక లాటరీకి, ఒక డ్రాకు, ఒక తేదీకి మాత్రమే చెందుతుంది.`,
    deadline: ({ oldest, latest }) =>
      `${oldest.name} ${oldest.code} డ్రా (${oldest.dateLong}) విజేత ${oldest.claimDeadlineLong} లోపు అసలు టికెట్‌ను అప్పగించాలి; తాజా ${latest.name} ${latest.code} డ్రాకు (${latest.dateLong}) చివరి తేదీ ${latest.claimDeadlineLong}. ఫలితం చూసిన రోజు నుండి కాకుండా, డ్రా తేదీ నుండి 90 రోజులు లెక్కించండి.`,
  },
};

const HEAD_SX = { fontWeight: 800, color: "#0B3C5D", fontSize: "0.8rem", whiteSpace: "nowrap", bgcolor: "#F1F5F9" } as const;
const CELL_SX = { fontSize: "0.86rem", color: "#334155", whiteSpace: "nowrap" } as const;

const deadlineChip = (daysLeft: number, labels: Labels) => {
  if (daysLeft < 0) return { label: labels.expired, bg: "#FEE2E2", color: "#991B1B" };
  if (daysLeft <= 30) return { label: labels.daysLeft(daysLeft), bg: "#FEF3C7", color: "#92400E" };
  return { label: labels.daysLeft(daysLeft), bg: "#DCFCE7", color: "#166534" };
};

/** Summary line computed from the draws, so the "analysis" always matches the table. */
const buildInsight = (draws: BlogRecentDraw[], variant: Variant, labels: Labels): string => {
  const [latest] = draws;
  const oldest = draws[draws.length - 1];
  const args: InsightArgs = {
    count: draws.length,
    lotteries: new Set(draws.map(({ name }) => name)).size,
    districts: new Set(draws.map(({ location }) => location).filter(Boolean)).size,
    oldest,
    latest,
  };
  return variant === "verify" ? labels.verify(args) : labels.deadline(args);
};

const RecentDrawsAnalysis = ({ draws, variant, title, intro, language = "en" }: Props) => {
  if (draws.length === 0) return null;
  const isDeadline = variant === "deadline";
  const labels = LABELS[language];

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
              <TableCell sx={HEAD_SX}>{labels.drawDate}</TableCell>
              <TableCell sx={HEAD_SX}>{labels.lottery}</TableCell>
              <TableCell sx={HEAD_SX}>{labels.firstPrize}</TableCell>
              <TableCell sx={HEAD_SX}>{isDeadline ? labels.lastDate : labels.soldAt}</TableCell>
              {isDeadline && <TableCell sx={HEAD_SX}>{labels.status}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {draws.map(({ code, name, date, dateLong, firstTicket, location, url, claimDeadlineLong, daysLeft }) => {
              const chip = deadlineChip(daysLeft, labels);
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
        <strong>{labels.analysis}</strong> {buildInsight(draws, variant, labels)}
      </Typography>
    </Paper>
  );
};

export default RecentDrawsAnalysis;
