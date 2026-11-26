"use client";

// Client component: MUI Buttons use component={Link}, which cannot cross the server/client boundary. Copy arrives as a prop.
import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { BlogDrawContext } from "@/data/blogs";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import type { PoojaBumper2026Copy } from "@/data/blogTranslations/poojaBumper2026/types";
import { poojaBumper2026CopyEn } from "@/data/blogTranslations/poojaBumper2026/en";
import RichText from "./RichText";
import { LINK_STYLE } from "./GuideBlocks";

const BODY_SX = { color: "#334155", mb: 2 } as const;
const H2_SX = { fontWeight: 800, color: "#0B3C5D", mb: 2 } as const;

/** Display values for the announced draw (from lotteries.draw_date via the blog page). */
interface DrawView {
  url: string;
  isUpcoming: boolean;
  /** Values for the {date}/{dateShort}/{dateWithWeekday}/{time}/{drawUrl} copy placeholders. */
  values: Record<string, string>;
}

const PLACEHOLDER = /\{(\w+)\}/g;

/** Replaces {placeholder} tokens with draw values (unknown tokens are left as-is). */
const fill = (template: string, values: Record<string, string>): string =>
  template.replace(PLACEHOLDER, (token, key: string) => values[key] ?? token);

const toDrawView = (draw: BlogDrawContext | null, { draw: drawCopy }: PoojaBumper2026Copy): DrawView => {
  const weekday = draw?.date ? drawCopy.weekdays[new Date(`${draw.date}T00:00:00Z`).getUTCDay()] : undefined;
  const url = draw?.url ?? "/pooja-bumper";
  const date = draw?.dateLong ?? drawCopy.fallbackDate;
  return {
    url,
    isUpcoming: draw?.isUpcoming ?? true,
    values: {
      date,
      dateShort: draw?.dateShort ?? drawCopy.fallbackDateShort,
      dateWithWeekday: weekday ? fill(drawCopy.dateWithWeekday, { weekday, date }) : date,
      time: draw?.drawTime ?? drawCopy.fallbackTime,
      drawUrl: url,
    },
  };
};

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <Box component="section" id={id} aria-labelledby={`${id}-heading`} sx={{ scrollMarginTop: 100, mb: 5 }}>
    <Typography id={`${id}-heading`} variant="h4" component="h2" sx={H2_SX}>
      {title}
    </Typography>
    {children}
  </Box>
);

const CheckList = ({ items }: { items: string[] }) => (
  <Box
    component="ul"
    sx={{ m: 0, mb: 2.5, pl: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1 }}
  >
    {items.map((item) => (
      <Box component="li" key={item} sx={{ display: "flex", gap: 1.2, alignItems: "flex-start", color: "#334155" }}>
        <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 20, mt: 0.4, flexShrink: 0 }} />
        <span>{item}</span>
      </Box>
    ))}
  </Box>
);

const OrderedSteps = ({ items }: { items: string[] }) => (
  <Box
    component="ol"
    sx={{ m: 0, mb: 2.5, pl: 3, display: "flex", flexDirection: "column", gap: 1, color: "#334155" }}
  >
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </Box>
);

const DrawPageCta = ({ view, cta }: { view: DrawView; cta: PoojaBumper2026Copy["quickAnswer"]["cta"] }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, sm: 3 },
      my: 3,
      borderRadius: "16px",
      background: "linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { sm: "center" },
      justifyContent: "space-between",
      gap: 2,
    }}
  >
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 1 }}>
        <EventIcon sx={{ fontSize: 20 }} /> {fill(cta.heading, view.values)}
      </Typography>
      <Typography sx={{ fontSize: "0.88rem", color: "#FFEDD5" }}>
        {fill(view.isUpcoming ? cta.upcomingText : cta.pastText, view.values)}
      </Typography>
    </Box>
    <Button
      component={Link}
      href={view.url}
      variant="contained"
      sx={{
        bgcolor: "#FDE68A",
        color: "#7C2D12",
        fontWeight: 900,
        textTransform: "none",
        borderRadius: "10px",
        whiteSpace: "nowrap",
        "&:hover": { bgcolor: "#FCD34D" },
      }}
    >
      {view.isUpcoming ? cta.upcomingButton : cta.pastButton}
    </Button>
  </Paper>
);

export interface PoojaBumper2026GuideContentProps {
  draw: BlogDrawContext | null;
  /** Article text; defaults to the English original. Translations live in data/blogTranslations/poojaBumper2026. */
  copy?: PoojaBumper2026Copy;
  language?: BlogLanguage;
}

const PoojaBumper2026GuideContent = ({
  draw,
  copy = poojaBumper2026CopyEn,
  language = "en",
}: PoojaBumper2026GuideContentProps) => {
  const view = toDrawView(draw, copy);
  const { values } = view;
  /** Fills draw placeholders, then renders inline markup. */
  const rich = (text: string) => <RichText text={fill(text, values)} language={language} />;
  const {
    intro,
    introNext,
    quickAnswer,
    whatIs,
    ticketPrice,
    checkResults,
    drawDateTime,
    buyTickets,
    firstPrizeTax,
    claimPrize,
    rules,
    officialResults,
    conclusion,
  } = copy;
  const { table } = ticketPrice;

  return (
    <>
      {/* Introduction */}
      <Typography sx={{ fontSize: { xs: "1.05rem", sm: "1.12rem" }, color: "#1E293B", mb: 3, lineHeight: 1.8 }}>
        {rich(intro)}
      </Typography>
      <Typography sx={{ ...BODY_SX, mb: 4 }}>{rich(introNext)}</Typography>

      {/* Quick answer block (AEO: concise, extractable facts) */}
      <Section id="quick-answer" title={quickAnswer.title}>
        <Typography sx={BODY_SX}>{rich(quickAnswer.summary)}</Typography>
        <Paper variant="outlined" sx={{ borderRadius: "14px", overflow: "hidden", border: "1.5px solid #FED7AA" }}>
          <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            {quickAnswer.facts.map(({ label, value }) => (
              <Box key={label} sx={{ p: 1.8, borderBottom: "1px solid #FFEDD5", bgcolor: "#FFF7ED" }}>
                <Typography
                  component="dt"
                  sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9A3412", textTransform: "uppercase" }}
                >
                  {label}
                </Typography>
                <Typography component="dd" sx={{ m: 0, fontWeight: 800, color: "#0F172A" }}>
                  {fill(value, values)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
        <DrawPageCta view={view} cta={quickAnswer.cta} />
      </Section>

      <Section id="what-is-pooja-bumper" title={whatIs.title}>
        <Typography sx={BODY_SX}>{whatIs.p1}</Typography>
        <Typography sx={BODY_SX}>{whatIs.p2}</Typography>
        <Typography sx={{ color: "#334155" }}>{rich(whatIs.p3)}</Typography>
      </Section>

      <Section id="ticket-price-prizes" title={ticketPrice.title}>
        <Typography sx={BODY_SX}>{rich(ticketPrice.p1)}</Typography>
        <Typography sx={BODY_SX}>{ticketPrice.p2}</Typography>

        <Paper variant="outlined" sx={{ borderRadius: "14px", overflowX: "auto", mb: 3 }}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.92rem",
              "& th, & td": { p: 1.5, textAlign: "left", borderBottom: "1px solid #E2E8F0" },
              "& thead th": { bgcolor: "#0B3C5D", color: "#FFFFFF", fontWeight: 800 },
              "& tbody tr:nth-of-type(even)": { bgcolor: "#F8FAFC" },
              "& tbody tr:first-of-type": { bgcolor: "#FFFBEB", fontWeight: 800 },
            }}
          >
            <caption style={{ captionSide: "bottom", padding: 10, fontSize: "0.8rem", color: "#64748B" }}>
              {table.caption}
            </caption>
            <thead>
              <tr>
                <th scope="col">{table.headers.category}</th>
                <th scope="col">{table.headers.amount}</th>
                <th scope="col">{table.headers.winners}</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map(({ category, amount, winners }) => (
                <tr key={category}>
                  <th scope="row" style={{ fontWeight: 700 }}>
                    {category}
                  </th>
                  <td>{amount}</td>
                  <td>{winners}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Paper>

        <Typography sx={BODY_SX}>{ticketPrice.p3}</Typography>
        <Typography sx={BODY_SX}>{ticketPrice.p4}</Typography>
        <Typography sx={{ color: "#334155" }}>{ticketPrice.p5}</Typography>
      </Section>

      <Section id="check-results" title={checkResults.title}>
        <Typography sx={BODY_SX}>{checkResults.p1}</Typography>
        <OrderedSteps items={checkResults.steps.map((step) => fill(step, values))} />
        <Typography sx={BODY_SX}>{rich(checkResults.p2)}</Typography>
        <Typography sx={{ color: "#334155" }}>{rich(checkResults.p3)}</Typography>
      </Section>

      <Section id="draw-date-time" title={drawDateTime.title}>
        <Paper
          elevation={0}
          sx={{ p: 2.5, mb: 2.5, borderRadius: "14px", bgcolor: "#FFFBEB", border: "1.5px solid #FDE68A" }}
        >
          <Typography sx={{ fontWeight: 800, color: "#92400E", display: "flex", alignItems: "center", gap: 1 }}>
            <EmojiEventsIcon sx={{ color: "#D97706" }} /> {fill(drawDateTime.boxHeading, values)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#78350F", mt: 0.5 }}>
            {drawDateTime.boxText.before}
            <Link href={view.url} style={{ ...LINK_STYLE, color: "#92400E" }}>
              {drawDateTime.boxText.highlight}
            </Link>
            {drawDateTime.boxText.after}
          </Typography>
        </Paper>
        {drawDateTime.paragraphs.map((text, idx) => (
          <Typography key={idx} sx={idx < drawDateTime.paragraphs.length - 1 ? BODY_SX : { color: "#334155" }}>
            {text}
          </Typography>
        ))}
      </Section>

      <Section id="buy-tickets" title={buyTickets.title}>
        <Typography sx={BODY_SX}>{buyTickets.p1}</Typography>
        <CheckList items={buyTickets.items} />
        <Typography sx={{ color: "#334155" }}>{buyTickets.p2}</Typography>
      </Section>

      <Section id="first-prize-tax" title={firstPrizeTax.title}>
        <Typography sx={BODY_SX}>{firstPrizeTax.p1}</Typography>
        <Typography sx={BODY_SX}>{rich(firstPrizeTax.p2)}</Typography>
        <CheckList items={firstPrizeTax.items} />
        <Typography sx={{ color: "#334155" }}>{rich(firstPrizeTax.p3)}</Typography>
      </Section>

      <Section id="claim-prize" title={claimPrize.title}>
        <Typography sx={BODY_SX}>{claimPrize.p1}</Typography>
        <OrderedSteps items={claimPrize.steps} />
        <Typography sx={{ color: "#334155" }}>{rich(claimPrize.p2)}</Typography>
      </Section>

      <Section id="rules" title={rules.title}>
        <Typography sx={BODY_SX}>{rules.p1}</Typography>
        <CheckList items={rules.items} />
        <Typography sx={{ color: "#334155" }}>{rules.p2}</Typography>
      </Section>

      <Section id="official-results" title={officialResults.title}>
        <Typography sx={BODY_SX}>{rich(officialResults.p1)}</Typography>
        <Typography sx={BODY_SX}>{rich(officialResults.p2)}</Typography>
        <Paper
          variant="outlined"
          sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#FEF2F2", border: "1.5px solid #FECACA" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <WarningAmberIcon sx={{ color: "#DC2626" }} />
            <Typography sx={{ fontWeight: 800, color: "#991B1B" }}>{officialResults.warningTitle}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#7F1D1D" }}>
            {officialResults.warning}
          </Typography>
        </Paper>
      </Section>

      <Section id="conclusion" title={conclusion.title}>
        <Typography sx={BODY_SX}>{conclusion.p1}</Typography>
        <Typography sx={BODY_SX}>{rich(conclusion.p2)}</Typography>
        <Grid container spacing={1.5} sx={{ mt: 1 }}>
          {[
            { href: view.url, label: fill(conclusion.buttons.result, values) },
            { href: "/pooja-bumper", label: conclusion.buttons.all },
            { href: "/search", label: conclusion.buttons.check },
          ].map(({ href, label }) => (
            <Grid key={href} size={{ xs: 12, sm: 4 }}>
              <Button
                component={Link}
                href={href}
                fullWidth
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "10px",
                  color: "#0B3C5D",
                  borderColor: "#CBD5E1",
                }}
              >
                {label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
};

export default PoojaBumper2026GuideContent;
