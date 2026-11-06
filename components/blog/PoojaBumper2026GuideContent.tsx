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

const LINK_STYLE = {
  color: "#0B3C5D",
  fontWeight: 700,
  textDecoration: "underline",
} as const;
const BODY_SX = { color: "#334155", mb: 2 } as const;
const H2_SX = { fontWeight: 800, color: "#0B3C5D", mb: 2 } as const;

const PRIZE_TABLE = [
  { category: "First Prize", amount: "₹12,00,00,000 (12 Crore)", winners: "1" },
  { category: "Second Prize", amount: "₹50,00,000 (50 Lakh)", winners: "10" },
  { category: "Third Prize", amount: "₹5,00,000 (5 Lakh)", winners: "10" },
  { category: "Fourth Prize", amount: "₹3,00,000 (3 Lakh)", winners: "5" },
  { category: "Fifth Prize", amount: "₹2,00,000 (2 Lakh)", winners: "10" },
  { category: "Consolation Prize", amount: "₹1,00,000 (1 Lakh)", winners: "4" },
  { category: "Sixth Prize", amount: "₹5,000", winners: "8,100" },
  { category: "Seventh Prize", amount: "₹1,000", winners: "64,800" },
  { category: "Eighth Prize", amount: "₹500", winners: "1,29,600" },
  { category: "Ninth Prize", amount: "₹300", winners: "1,40,400" },
];

/** Display values for the announced draw (from lotteries.draw_date via the blog page). */
interface DrawView {
  url: string;
  dateLong: string;
  dateShort: string;
  /** e.g. "Saturday, 28 November 2026" (falls back to dateLong when no date is announced) */
  dateWithWeekday: string;
  drawTime: string;
  isUpcoming: boolean;
}

const toDrawView = (draw: BlogDrawContext | null): DrawView => {
  const weekday = draw?.date
    ? new Date(`${draw.date}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "long",
        timeZone: "UTC",
      })
    : null;
  const dateLong =
    draw?.dateLong ??
    "the date announced by the Kerala State Lotteries Department";
  return {
    url: draw?.url ?? "/pooja-bumper",
    dateLong,
    dateShort: draw?.dateShort ?? "TBA",
    dateWithWeekday: weekday ? `${weekday}, ${dateLong}` : dateLong,
    drawTime: draw?.drawTime ?? "2:00 PM",
    isUpcoming: draw?.isUpcoming ?? true,
  };
};

const getQuickFacts = ({ dateLong, drawTime }: DrawView) => [
  { label: "Lottery", value: "Kerala Pooja Bumper 2026 (BR-112)" },
  { label: "Draw Date", value: dateLong },
  { label: "Draw Time", value: `${drawTime} IST` },
  { label: "First Prize", value: "₹12 Crore" },
  { label: "Ticket Price", value: "₹300" },
  { label: "Series", value: "JA, JB, JC, JD, JE" },
  { label: "Total Prize Money", value: "₹39,11,20,000" },
];

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={`${id}-heading`}
    sx={{ scrollMarginTop: 100, mb: 5 }}
  >
    <Typography id={`${id}-heading`} variant="h4" component="h2" sx={H2_SX}>
      {title}
    </Typography>
    {children}
  </Box>
);

const CheckList = ({ items }: { items: string[] }) => (
  <Box
    component="ul"
    sx={{
      m: 0,
      mb: 2.5,
      pl: 0,
      listStyle: "none",
      display: "flex",
      flexDirection: "column",
      gap: 1,
    }}
  >
    {items.map((item) => (
      <Box
        component="li"
        key={item}
        sx={{
          display: "flex",
          gap: 1.2,
          alignItems: "flex-start",
          color: "#334155",
        }}
      >
        <CheckCircleIcon
          sx={{ color: "#16A34A", fontSize: 20, mt: 0.4, flexShrink: 0 }}
        />
        <span>{item}</span>
      </Box>
    ))}
  </Box>
);

const OrderedSteps = ({ items }: { items: string[] }) => (
  <Box
    component="ol"
    sx={{
      m: 0,
      mb: 2.5,
      pl: 3,
      display: "flex",
      flexDirection: "column",
      gap: 1,
      color: "#334155",
    }}
  >
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </Box>
);

const DrawPageCta = ({ view }: { view: DrawView }) => (
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
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.05rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EventIcon sx={{ fontSize: 20 }} /> Pooja Bumper BR-112 Result —{" "}
        {view.dateLong}
      </Typography>
      <Typography sx={{ fontSize: "0.88rem", color: "#FFEDD5" }}>
        {view.isUpcoming
          ? `Live winning numbers from ${view.drawTime} IST, full prize chart and official Gazette PDF.`
          : "Winning numbers, full prize chart and official Gazette PDF."}
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
      {view.isUpcoming ? "View Live Result" : "View Result"}
    </Button>
  </Paper>
);

const PoojaBumper2026GuideContent = ({
  draw,
}: {
  draw: BlogDrawContext | null;
}) => {
  const view = toDrawView(draw);
  return (
    <>
      {/* Introduction */}
      <Typography
        sx={{
          fontSize: { xs: "1.05rem", sm: "1.12rem" },
          color: "#1E293B",
          mb: 3,
          lineHeight: 1.8,
        }}
      >
        The Kerala State Lottery Department conducts several bumper lottery
        draws every year, offering participants an opportunity to win
        substantial cash prizes. Among these draws, the{" "}
        <strong>Pooja Bumper Lottery</strong> attracts considerable attention
        from lottery enthusiasts across Kerala. It is associated with the
        festive season and features an attractive prize structure with multiple
        winning categories.
      </Typography>
      <Typography sx={{ ...BODY_SX, mb: 4 }}>
        If you are planning to purchase a ticket or want to understand the draw
        process, this guide covers the important details. From ticket prices and
        prize information to result checking and claiming procedures, here is
        everything you should know about the Pooja Bumper Lottery. The next draw
        result will be published live on our{" "}
        <Link href={view.url} style={LINK_STYLE}>
          Pooja Bumper result {view.dateLong}
        </Link>{" "}
        page.
      </Typography>

      {/* Quick answer block (AEO: concise, extractable facts) */}
      <Section
        id="quick-answer"
        title="Quick Answer: Pooja Bumper 2026 at a Glance"
      >
        <Typography sx={BODY_SX}>
          <strong>
            Kerala Pooja Bumper 2026 (BR-112) offers a ₹12 crore first prize.
            The ticket costs ₹300, tickets are sold in five series (JA, JB, JC,
            JD, JE), and the draw is on {view.dateLong} at {view.drawTime} IST.
          </strong>{" "}
          Total prize money is ₹39,11,20,000.
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: "14px",
            overflow: "hidden",
            border: "1.5px solid #FED7AA",
          }}
        >
          <Box
            component="dl"
            sx={{
              m: 0,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            {getQuickFacts(view).map(({ label, value }) => (
              <Box
                key={label}
                sx={{
                  p: 1.8,
                  borderBottom: "1px solid #FFEDD5",
                  bgcolor: "#FFF7ED",
                }}
              >
                <Typography
                  component="dt"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#9A3412",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  component="dd"
                  sx={{ m: 0, fontWeight: 800, color: "#0F172A" }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
        <DrawPageCta view={view} />
      </Section>

      <Section
        id="what-is-pooja-bumper"
        title="What Is Kerala Pooja Bumper Lottery?"
      >
        <Typography sx={BODY_SX}>
          The Kerala Pooja Bumper is a special seasonal lottery organised by the
          Kerala State Lotteries Department. It is one of the popular bumper
          draws in the state, attracting participants because of its large first
          prize and additional prize categories.
        </Typography>
        <Typography sx={BODY_SX}>
          Unlike regular weekly lotteries, bumper lotteries generally offer
          higher prize amounts and a different prize distribution structure. The
          department announces the official notification, ticket details, draw
          schedule and prize structure before the draw.
        </Typography>
        <Typography sx={{ color: "#334155" }}>
          The Pooja Bumper Lottery is particularly popular during the festive
          period, when many people look forward to the announcement of winning
          numbers. You can see previous draws and history on the{" "}
          <Link href="/pooja-bumper" style={LINK_STYLE}>
            Pooja Bumper lottery results
          </Link>{" "}
          page.
        </Typography>
      </Section>

      <Section
        id="ticket-price-prizes"
        title="Kerala Pooja Bumper Lottery 2026 Ticket Price and Complete Prize Details"
      >
        <Typography sx={BODY_SX}>
          The Kerala Pooja Bumper Lottery 2026 (BR-112) offers an attractive
          prize structure with a first prize of <strong>₹12 crore</strong>. The
          ticket price is <strong>₹300</strong>, and tickets are issued in five
          series: JA, JB, JC, JD and JE. The department has announced a total of{" "}
          <strong>₹39,11,20,000</strong> as prize money across different winning
          categories.
        </Typography>
        <Typography sx={BODY_SX}>
          Here is the complete prize distribution for the 2026 draw:
        </Typography>

        <Paper
          variant="outlined"
          sx={{ borderRadius: "14px", overflowX: "auto", mb: 3 }}
        >
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.92rem",
              "& th, & td": {
                p: 1.5,
                textAlign: "left",
                borderBottom: "1px solid #E2E8F0",
              },
              "& thead th": {
                bgcolor: "#0B3C5D",
                color: "#FFFFFF",
                fontWeight: 800,
              },
              "& tbody tr:nth-of-type(even)": { bgcolor: "#F8FAFC" },
              "& tbody tr:first-of-type": {
                bgcolor: "#FFFBEB",
                fontWeight: 800,
              },
            }}
          >
            <caption
              style={{
                captionSide: "bottom",
                padding: 10,
                fontSize: "0.8rem",
                color: "#64748B",
              }}
            >
              Kerala Pooja Bumper BR-112 (2026) prize structure — total
              ₹39,11,20,000
            </caption>
            <thead>
              <tr>
                <th scope="col">Prize Category</th>
                <th scope="col">Prize Amount</th>
                <th scope="col">Number of Winners</th>
              </tr>
            </thead>
            <tbody>
              {PRIZE_TABLE.map(({ category, amount, winners }) => (
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

        <Typography sx={BODY_SX}>
          The first prize of ₹12 crore is the biggest attraction of this bumper
          draw. The second prize offers ₹50 lakh each to 10 winners, while the
          third prize provides ₹5 lakh each to another 10 winners. Additional
          prizes of ₹3 lakh, ₹2 lakh and ₹1 lakh are also available.
        </Typography>
        <Typography sx={BODY_SX}>
          The lower prize categories provide further opportunities for ticket
          holders to receive ₹5,000, ₹1,000, ₹500 or ₹300, depending on their
          ticket numbers and the official result.
        </Typography>
        <Typography sx={{ color: "#334155" }}>
          The total announced prize amount is ₹39 crore 11 lakh 20 thousand.
          Participants should check the official Kerala State Lotteries
          notification for the complete prize conditions and verify their ticket
          numbers after the draw.
        </Typography>
      </Section>

      <Section
        id="check-results"
        title="How to Check Pooja Bumper Lottery Results Online"
      >
        <Typography sx={BODY_SX}>
          Checking the winning numbers is simple when you use reliable sources.
          After the official draw, participants can verify their ticket numbers
          against the published result list. Follow these steps:
        </Typography>
        <OrderedSteps
          items={[
            `Visit the official Kerala State Lotteries website or our Pooja Bumper ${view.dateLong} result page.`,
            "Find the Pooja Bumper result section.",
            "Select the relevant 2026 draw.",
            "Open the official result PDF.",
            "Check your ticket number and series carefully.",
            "Verify the prize category before proceeding with a claim.",
          ]}
        />
        <Typography sx={BODY_SX}>
          You can also visit{" "}
          <Link href="/" style={LINK_STYLE}>
            Kerala Lottery Results Today
          </Link>{" "}
          to find lottery-related updates and information in one place, or use
          our{" "}
          <Link href="/search" style={LINK_STYLE}>
            Kerala lottery ticket checker
          </Link>{" "}
          to search your number.
        </Typography>
        <Typography sx={{ color: "#334155" }}>
          People searching for{" "}
          <strong>Pooja Bumper Lottery Result Today</strong> should always
          compare the published numbers with the official result notification.
          Check the complete ticket number, series and other printed details
          rather than relying only on a partial number.
        </Typography>
      </Section>

      <Section
        id="draw-date-time"
        title="Pooja Bumper Lottery 2026: Draw Date, Time and Prize Structure"
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: "14px",
            bgcolor: "#FFFBEB",
            border: "1.5px solid #FDE68A",
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: "#92400E",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <EmojiEventsIcon sx={{ color: "#D97706" }} /> Pooja Bumper 2026
            draw: {view.dateWithWeekday} at {view.drawTime} IST
          </Typography>
          <Typography variant="body2" sx={{ color: "#78350F", mt: 0.5 }}>
            Watch the{" "}
            <Link href={view.url} style={{ ...LINK_STYLE, color: "#92400E" }}>
              Pooja Bumper BR-112 live result
            </Link>{" "}
            — the first prize number is updated within minutes of the draw.
          </Typography>
        </Paper>
        <Typography sx={BODY_SX}>
          The draw date and time are announced by the Kerala State Lotteries
          Department. Participants should check the official notification for
          the confirmed schedule of the 2026 draw.
        </Typography>
        <Typography sx={BODY_SX}>
          The draw follows an organised process conducted under the
          department&apos;s supervision. Once the draw is completed, the winning
          numbers are published through official channels.
        </Typography>
        <Typography sx={BODY_SX}>
          The prize structure determines how the available prize money is
          distributed among different winning categories. The first prize
          receives the highest amount, while the remaining prizes are allocated
          according to the announced scheme.
        </Typography>
        <Typography sx={{ color: "#334155" }}>
          Keep the official notification available so you can confirm the
          correct draw date, time and prize details.
        </Typography>
      </Section>

      <Section
        id="buy-tickets"
        title="How to Buy Kerala Pooja Bumper Lottery Tickets"
      >
        <Typography sx={BODY_SX}>
          Purchasing a Kerala bumper lottery ticket should be done through
          authorised lottery agents or approved sales channels. Here are some
          important points to remember:
        </Typography>
        <CheckList
          items={[
            "Purchase tickets only from authorised Kerala lottery sellers.",
            "Check that the ticket is genuine and clearly printed.",
            "Verify the ticket number and series.",
            "Keep the original ticket in a safe place.",
            "Avoid damaged, altered or suspicious tickets.",
            "Do not share unnecessary ticket details with strangers.",
          ]}
        />
        <Typography sx={{ color: "#334155" }}>
          The Pooja Bumper Lottery ticket should be purchased according to the
          official rules and regulations. Always check the ticket price and
          availability before making a purchase.
        </Typography>
      </Section>

      <Section
        id="first-prize-tax"
        title="Pooja Bumper Lottery First Prize: Prize Money and Tax Details"
      >
        <Typography sx={BODY_SX}>
          The first prize is one of the biggest attractions of a bumper lottery.
          However, the actual amount received by a winner may differ from the
          advertised prize because applicable taxes and deductions must be
          considered.
        </Typography>
        <Typography sx={BODY_SX}>
          Lottery winnings in India are generally subject to tax under{" "}
          <strong>Section 115BB of the Income Tax Act, 1961</strong>. The
          applicable tax rate is generally 30%, along with applicable surcharge
          and cess. Tax deduction at source may also apply. Winners should
          consider the following:
        </Typography>
        <CheckList
          items={[
            "The announced prize amount is not necessarily the final take-home amount.",
            "Applicable taxes and deductions must be considered.",
            "Keep the original winning ticket.",
            "Maintain the required identity and banking documents.",
            "Consult a tax professional for individual tax guidance.",
          ]}
        />
        <Typography sx={{ color: "#334155" }}>
          Understanding these requirements can help winners prepare for the
          prize claim process.
        </Typography>
      </Section>

      <Section
        id="claim-prize"
        title="How to Claim Pooja Bumper Lottery Prize Money"
      >
        <Typography sx={BODY_SX}>
          Winning a prize is exciting, but claiming it requires following the
          official procedures. The process may vary depending on the prize
          amount and applicable department guidelines. Generally, winners need
          to:
        </Typography>
        <OrderedSteps
          items={[
            "Sign the original winning ticket as required.",
            "Complete the official prize claim application.",
            "Attach the required identity and address documents.",
            "Provide the original ticket and supporting documents.",
            "Submit the claim to the designated lottery office or authorised bank, depending on the prize category.",
            "Follow the department's verification instructions.",
          ]}
        />
        <Typography sx={{ color: "#334155" }}>
          Winners should submit their claims within the prescribed time limit.
          Check the latest official notification for the applicable deadline and
          submission requirements. For documents, offices and deadlines in
          detail, read our{" "}
          <Link
            href="/how-to-claim-kerala-lottery-prize"
            style={LINK_STYLE}
          >
            step-by-step Kerala lottery prize claim guide
          </Link>
          .
        </Typography>
      </Section>

      <Section
        id="rules"
        title="Kerala Pooja Bumper Lottery Rules and Regulations"
      >
        <Typography sx={BODY_SX}>
          Every participant should understand the rules before purchasing a
          ticket. Kerala State Lotteries operates under established regulations
          to maintain transparency and ensure an organised lottery system. Some
          important rules include:
        </Typography>
        <CheckList
          items={[
            "Only valid and authorised lottery tickets are eligible for prizes.",
            "The original ticket is essential for claiming a winning amount.",
            "Prize claims must follow the prescribed procedures.",
            "Winners must provide valid supporting documents.",
            "Claims must be submitted within the permitted period.",
            "Duplicate, altered or invalid tickets may be rejected.",
          ]}
        />
        <Typography sx={{ color: "#334155" }}>
          Participants should read the official terms and conditions to
          understand their responsibilities.
        </Typography>
      </Section>

      <Section
        id="official-results"
        title="Where to Check the Official Pooja Bumper Lottery Results"
      >
        <Typography sx={BODY_SX}>
          The safest way to confirm winning numbers is through the official{" "}
          <a
            href="https://statelottery.kerala.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={LINK_STYLE}
          >
            Kerala State Lotteries Department website
          </a>
          . The department publishes the results after the draw, usually through
          downloadable result documents.
        </Typography>
        <Typography sx={BODY_SX}>
          You can also follow{" "}
          <Link href={view.url} style={LINK_STYLE}>
            Kerala Lottery Results Today — Pooja Bumper 2026 result
          </Link>{" "}
          for lottery information, result-related updates and useful guides.
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: "14px",
            bgcolor: "#FEF2F2",
            border: "1.5px solid #FECACA",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <WarningAmberIcon sx={{ color: "#DC2626" }} />
            <Typography sx={{ fontWeight: 800, color: "#991B1B" }}>
              Verify before you celebrate
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#7F1D1D" }}>
            When searching for Pooja Bumper Lottery Result Today, remember to
            verify the numbers against the official PDF. Unofficial websites and
            social media posts may contain incorrect or outdated information.
          </Typography>
        </Paper>
      </Section>

      <Section id="conclusion" title="Conclusion">
        <Typography sx={BODY_SX}>
          The Pooja Bumper draw is an important part of Kerala&apos;s seasonal
          lottery calendar. Understanding the ticket price, prize structure,
          draw schedule, result-checking methods and claim procedures helps
          participants make informed decisions.
        </Typography>
        <Typography sx={BODY_SX}>
          Always purchase tickets through authorised sellers and verify winning
          numbers using official sources. For more lottery information, result
          updates and helpful guides, visit{" "}
          <Link href="/" style={LINK_STYLE}>
            Kerala Lottery Results Today
          </Link>
          . Remember that lotteries involve financial risk, and purchasing a
          ticket does not guarantee a prize.
        </Typography>
        <Grid container spacing={1.5} sx={{ mt: 1 }}>
          {[
            { href: view.url, label: `Pooja Bumper ${view.dateShort} Result` },
            { href: "/pooja-bumper", label: "All Pooja Bumper Results" },
            { href: "/search", label: "Check Your Ticket Number" },
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
