import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import ComputerIcon from "@mui/icons-material/Computer";
import BalanceIcon from "@mui/icons-material/Balance";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const SITE_URL = "https://www.keralalotteryresultstoday.in";
const PAGE_URL = `${SITE_URL}/about`;
const DESCRIPTION =
  "About Kerala Lottery Result Today: an independent information website that makes Kerala lottery results, winning numbers, draw schedules and prize details simple to find and understand.";

export const metadata: Metadata = {
  title: "About Us",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "About Us | Kerala Lottery",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Kerala Lottery Result Today",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About Us | Kerala Lottery",
    description: DESCRIPTION,
  },
};

// ---------- Design tokens ----------
const NAVY = "#0B3C5D";
const INK = "#111827";
const BODY = "#374151";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

const bodySx = { color: BODY, lineHeight: 1.75, fontSize: { xs: "0.975rem", md: "1.02rem" } } as const;
const h2Sx = {
  fontWeight: 900,
  color: INK,
  fontSize: { xs: "1.5rem", md: "1.9rem" },
  letterSpacing: "-0.02em",
  mb: 2,
} as const;
const cardSx = {
  p: { xs: 3, md: 4 },
  borderRadius: "24px",
  border: `1px solid ${BORDER}`,
  bgcolor: "#FFFFFF",
} as const;

// ---------- Content ----------
const PRINCIPLES = ["Clarity", "Information accuracy", "User convenience", "Responsible sharing"];

const OFFERINGS = [
  {
    title: "Kerala Lottery Results Today",
    text: "We publish information to help users easily find the latest Kerala lottery results. Our content includes winning numbers, prize details, and relevant draw information, presented in a simple and understandable format.",
    icon: <EmojiEventsIcon />,
    tint: { bg: "#FEF3C7", fg: "#B45309" },
  },
  {
    title: "Daily Kerala Lottery Results",
    text: "We aim to provide users with information related to different lottery draws conducted in Kerala. The published information is organised in a clear format so that visitors can easily access and understand the results.",
    icon: <CalendarMonthIcon />,
    tint: { bg: "#DBEAFE", fg: "#1D4ED8" },
  },
  {
    title: "Lottery Draw Information",
    text: "Our website may also include general information about different lottery draws, draw dates, schedules, and announcements related to lottery results. This helps visitors stay informed about relevant lottery-related updates.",
    icon: <EventNoteIcon />,
    tint: { bg: "#EDE9FE", fg: "#6D28D9" },
  },
  {
    title: "Winning Numbers and Prize Details",
    text: "We present information about winning numbers and prize categories in an organised manner to help users understand and check the published lottery results conveniently.",
    icon: <ConfirmationNumberIcon />,
    tint: { bg: "#DCFCE7", fg: "#15803D" },
  },
];

const WE_ARE = [
  "An independent information platform",
  "Focused on making lottery information easy to access",
  "Free to browse, with no registration or fees",
];

const WE_ARE_NOT = [
  "An official Government of Kerala or Kerala State Lotteries Department website",
  "Selling, purchasing, or distributing lottery tickets",
  "Conducting lottery draws or distributing prizes",
];

const DEVICES = [
  { label: "Mobile", icon: <SmartphoneIcon /> },
  { label: "Tablet", icon: <TabletMacIcon /> },
  { label: "Desktop", icon: <ComputerIcon /> },
];

const TOC = [
  { id: "mission", label: "Our Mission" },
  { id: "what-we-offer", label: "What We Offer" },
  { id: "accuracy", label: "Accuracy" },
  { id: "independent", label: "Independence" },
  { id: "responsible-use", label: "Responsible Use" },
  { id: "contact", label: "Contact" },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Us",
    url: PAGE_URL,
    description: DESCRIPTION,
    isPartOf: { "@type": "WebSite", name: "Kerala Lottery Result Today", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "About Us", item: PAGE_URL },
    ],
  },
];

// ---------- Small presentational helpers ----------
const IconBadge = ({
  children,
  bg,
  fg,
  size = 48,
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  size?: number;
}) => (
  <Box
    aria-hidden
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: "14px",
      bgcolor: bg,
      color: fg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </Box>
);

const CtaLink = ({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) => (
  <Link href={href} prefetch={false} style={{ textDecoration: "none" }}>
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2.5,
        py: 1.25,
        borderRadius: "12px",
        fontWeight: 800,
        fontSize: "0.95rem",
        transition: "transform 0.15s ease, background-color 0.15s ease",
        ...(variant === "primary"
          ? { bgcolor: "#FFFFFF", color: NAVY, "&:hover": { bgcolor: "#F1F5F9", transform: "translateY(-1px)" } }
          : {
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.4)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)", transform: "translateY(-1px)" },
            }),
      }}
    >
      {children}
    </Box>
  </Link>
);

// ---------- Page ----------
export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: "#F8FAFC", pb: { xs: 6, md: 10 } }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <Box
        component="header"
        sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #1E5A85 60%, #0F766E 100%)`,
          color: "#FFFFFF",
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: "999px",
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              mb: 2.5,
            }}
          >
            <VerifiedIcon sx={{ fontSize: 16 }} /> Independent information website
          </Box>
          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.4rem", md: "3.5rem" },
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 2.5,
            }}
          >
            About Us
          </Typography>
          <Typography sx={{ fontSize: { xs: "1.05rem", md: "1.2rem" }, lineHeight: 1.7, opacity: 0.92, maxWidth: 720 }}>
            We are an independent information website dedicated to helping users easily and quickly access
            Kerala lottery results, draw information, winning numbers, and prize details. Our primary
            objective is to provide users with important lottery-related information, including Kerala
            Lottery Results Today, in a simple, clear, and convenient manner.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 4 }}>
            <CtaLink href="/">
              Today&apos;s Results <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </CtaLink>
            <CtaLink href="/search" variant="ghost">
              Check Your Ticket
            </CtaLink>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: { xs: -5, md: -7 } }}>
        {/* Why we exist */}
        <Box sx={{ ...cardSx, boxShadow: "0 20px 40px -24px rgba(15,23,42,0.25)" }}>
          <Typography sx={bodySx}>
            Many people in Kerala check lottery results every day. However, finding accurate information and
            understanding the required results can sometimes be difficult. Understanding this need, we have
            developed our website to provide relevant lottery-related information in one place, making it
            easier for users to find the information they are looking for.
          </Typography>
        </Box>

        {/* On this page */}
        <Box component="nav" aria-label="On this page" sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {TOC.map(({ id, label }) => (
            <Box
              key={id}
              component="a"
              href={`#${id}`}
              sx={{
                px: 1.75,
                py: 0.75,
                borderRadius: "999px",
                border: `1px solid ${BORDER}`,
                bgcolor: "#FFFFFF",
                color: NAVY,
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                "&:hover": { bgcolor: "#EFF6FF", borderColor: "#BFDBFE" },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 5, md: 7 }, mt: { xs: 5, md: 7 } }}>
          {/* Mission */}
          <Box component="section" id="mission" sx={{ scrollMarginTop: 96 }}>
            <Typography component="h2" sx={h2Sx}>
              Our Mission
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={bodySx}>
                Our main mission is to make lottery-related information easily accessible to the public. We aim
                to provide a convenient browsing experience where users can find the information they need
                without spending too much time searching across different sources.
              </Typography>
              <Typography sx={bodySx}>
                We give importance to clarity, information accuracy, user convenience, and responsible
                information sharing. We strive to present lottery results in an understandable format and remind
                users of the importance of verifying all winning information through official sources.
              </Typography>
            </Box>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mt: 3, display: "flex", flexWrap: "wrap", gap: 1.25 }}>
              {PRINCIPLES.map((principle) => (
                <Box
                  component="li"
                  key={principle}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.75,
                    py: 1,
                    borderRadius: "12px",
                    bgcolor: "#ECFDF5",
                    color: "#047857",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 18 }} /> {principle}
                </Box>
              ))}
            </Box>
          </Box>

          {/* What we offer */}
          <Box component="section" id="what-we-offer" sx={{ scrollMarginTop: 96 }}>
            <Typography component="h2" sx={h2Sx}>
              Information Available on Our Website
            </Typography>
            <Typography sx={{ ...bodySx, mb: 3 }}>
              Our website publishes various types of lottery-related information that may be useful to visitors.
              Some of the important information available on our website includes:
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              {OFFERINGS.map(({ title, text, icon, tint }, index) => (
                <Box
                  component="article"
                  key={title}
                  sx={{
                    ...cardSx,
                    p: 3,
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    "&:hover": { boxShadow: "0 16px 32px -20px rgba(15,23,42,0.3)", transform: "translateY(-2px)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <IconBadge bg={tint.bg} fg={tint.fg}>
                      {icon}
                    </IconBadge>
                    <Typography aria-hidden sx={{ fontWeight: 900, fontSize: "1.75rem", color: "#E2E8F0" }}>
                      {`0${index + 1}`}
                    </Typography>
                  </Box>
                  <Typography component="h3" sx={{ fontWeight: 800, color: INK, fontSize: "1.1rem", mb: 1 }}>
                    {`${index + 1}. ${title}`}
                  </Typography>
                  <Typography sx={{ ...bodySx, fontSize: "0.95rem" }}>{text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Accuracy */}
          <Box component="section" id="accuracy" sx={{ ...cardSx, scrollMarginTop: 96 }}>
            <Typography component="h2" sx={h2Sx}>
              Information Accuracy and Reliability
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={bodySx}>
                We understand the importance of providing accurate information to our visitors. Therefore, we make
                reasonable efforts to review the available information before publishing lottery-related updates
                and results on our website.
              </Typography>
              <Typography sx={bodySx}>
                However, errors, delays, or changes in published information may occasionally occur. For this
                reason, visitors should not rely solely on the information available on our website for final
                confirmation.
              </Typography>
            </Box>
            <Box
              role="note"
              sx={{
                mt: 3,
                p: { xs: 2, md: 2.5 },
                display: "flex",
                gap: 1.5,
                borderRadius: "16px",
                bgcolor: "#FFFBEB",
                border: "1px solid #FDE68A",
              }}
            >
              <WarningAmberIcon sx={{ color: "#D97706", mt: 0.25 }} />
              <Typography sx={{ ...bodySx, fontWeight: 600, color: "#78350F" }}>
                To verify lottery winnings and prize eligibility, users should refer to the official announcements
                of the Kerala State Lotteries Department and the official Kerala Government Gazette. Information
                published through official government records should always be considered final and
                authoritative.
              </Typography>
            </Box>
          </Box>

          {/* Independence */}
          <Box component="section" id="independent" sx={{ scrollMarginTop: 96 }}>
            <Typography component="h2" sx={h2Sx}>
              We Are an Independent Information Website
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
              <Typography sx={bodySx}>
                Our website is not an official website of the Government of Kerala or the Kerala State Lotteries
                Department. We are not officially affiliated with, associated with, or endorsed by either of these
                organisations.
              </Typography>
              <Typography sx={bodySx}>
                We operate as an independent information platform that provides general lottery-related
                information to the public. We do not sell, purchase, or distribute lottery tickets. We are not
                involved in conducting lottery draws or distributing lottery prizes.
              </Typography>
              <Typography sx={bodySx}>
                Our purpose is solely to make publicly relevant lottery information easier for users to access and
                understand.
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
              {[
                { label: "We are", items: WE_ARE, Icon: CheckCircleIcon, fg: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
                { label: "We are not", items: WE_ARE_NOT, Icon: CancelIcon, fg: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
              ].map(({ label, items, Icon, fg, bg, border }) => (
                <Box key={label} sx={{ p: 3, borderRadius: "20px", bgcolor: bg, border: `1px solid ${border}` }}>
                  <Typography sx={{ fontWeight: 800, color: fg, mb: 1.5, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
                    {label}
                  </Typography>
                  <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {items.map((item) => (
                      <Box component="li" key={item} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <Icon sx={{ fontSize: 20, color: fg, mt: 0.25 }} />
                        <Typography sx={{ ...bodySx, fontSize: "0.95rem" }}>{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* User experience */}
          <Box component="section" sx={{ ...cardSx }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 3, md: 5 }, alignItems: { md: "center" } }}>
              <Box sx={{ flex: 1 }}>
                <Typography component="h2" sx={h2Sx}>
                  User-Friendly Website Experience
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography sx={bodySx}>
                    We aim to make our website simple and convenient for visitors of all backgrounds. We give
                    importance to a clean website layout, easy navigation, and clearly presented content so that
                    users can quickly find the information they need.
                  </Typography>
                  <Typography sx={bodySx}>
                    We also strive to provide a convenient browsing experience across different devices, including
                    mobile phones, tablets, and desktop computers. Our goal is to make accessing Kerala
                    lottery-related information easier, regardless of the device visitors use.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, gap: 1.5, justifyContent: "center" }}>
                {DEVICES.map(({ label, icon }) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1.5,
                      borderRadius: "14px",
                      bgcolor: "#F1F5F9",
                      color: NAVY,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      minWidth: { md: 140 },
                    }}
                  >
                    {icon}
                    {label}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Responsible use */}
          <Box component="section" id="responsible-use" sx={{ scrollMarginTop: 96 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <IconBadge bg="#E0F2FE" fg="#0369A1">
                <BalanceIcon />
              </IconBadge>
              <Typography component="h2" sx={{ ...h2Sx, mb: 0 }}>
                Responsible Use of Information
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={bodySx}>
                Purchasing lottery tickets and participating in lotteries are personal decisions. Our website does
                not guarantee lottery winnings or provide any information that promises a guaranteed prize. Lottery
                results are based on chance.
              </Typography>
              <Typography sx={bodySx}>
                We encourage visitors to exercise caution when making financial decisions and to verify all
                winning numbers and prize details using official government sources. Users should always refer to
                the relevant official documents before making any decisions based on lottery results.
              </Typography>
              <Typography sx={{ ...bodySx, color: MUTED, fontSize: "0.92rem" }}>
                Read our full{" "}
                <Link href="/disclaimer" prefetch={false} style={{ color: NAVY, fontWeight: 700 }}>
                  Disclaimer
                </Link>{" "}
                for more details.
              </Typography>
            </Box>
          </Box>

          {/* Contact */}
          <Box
            component="section"
            id="contact"
            sx={{
              scrollMarginTop: 96,
              p: { xs: 3, md: 5 },
              borderRadius: "28px",
              bgcolor: "#EFF6FF",
              border: "1px solid #BFDBFE",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <IconBadge bg="#FFFFFF" fg={NAVY}>
                <ChatBubbleOutlineIcon />
              </IconBadge>
              <Typography component="h2" sx={{ ...h2Sx, mb: 0 }}>
                Contact Us
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={bodySx}>
                We value the opinions, feedback, and suggestions of our website visitors. If you have questions
                about the information published on our website, suggestions for improvement, correction requests,
                or general enquiries, you can visit our Contact Us page.
              </Typography>
              <Typography sx={bodySx}>
                Feedback from our visitors helps us improve our website content and provide a better browsing
                experience. We appreciate every suggestion that helps us make our platform more useful and
                informative.
              </Typography>
            </Box>
            <Link href="/contact" prefetch={false} style={{ textDecoration: "none", display: "inline-block", marginTop: 24 }}>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 3,
                  py: 1.5,
                  borderRadius: "12px",
                  bgcolor: NAVY,
                  color: "#FFFFFF",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#082B43" },
                }}
              >
                Go to Contact Us <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </Box>
            </Link>
          </Box>

          {/* Commitment */}
          <Box
            component="section"
            sx={{
              p: { xs: 3.5, md: 6 },
              borderRadius: "28px",
              background: `linear-gradient(135deg, ${NAVY} 0%, #1E5A85 100%)`,
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            <Typography component="h2" sx={{ ...h2Sx, color: "#FFFFFF" }}>
              Our Commitment
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 680, mx: "auto" }}>
              <Typography sx={{ lineHeight: 1.75, opacity: 0.92 }}>
                We remain committed to providing lottery-related information in a simple, clear, and responsible
                manner. Transparency, content clarity, user convenience, and responsible information sharing are the
                key principles that guide our website.
              </Typography>
              <Typography sx={{ lineHeight: 1.75, opacity: 0.92 }}>
                We will continue our efforts to make our website a useful independent information source for people
                looking to access Kerala lottery results and related information.
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", mt: 1 }}>
                Thank you for visiting our website and placing your trust in us!
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
