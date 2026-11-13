import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const PAGE_URL = "https://www.keralalotteryresultstoday.in/disclaimer";
const DESCRIPTION =
  "Read the Disclaimer for Kerala Lottery Result Today: an independent information website with no official affiliation to the Kerala State Lotteries Department. Always verify results with the official Kerala Government Gazette.";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Disclaimer | Kerala Lottery",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Kerala Lottery Result Today",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Disclaimer | Kerala Lottery",
    description: DESCRIPTION,
  },
};

interface DisclaimerSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  closing?: string[];
  highlight?: string;
}

const SECTIONS: DisclaimerSection[] = [
  {
    heading: "No Official Affiliation with the Kerala Government",
    paragraphs: [
      "Our website is an independent information platform and is not affiliated with, associated with, authorised by, sponsored by, or officially connected to the Government of Kerala or the Kerala State Lotteries Department.",
      "We are not an official government website, and we do not represent any government authority or lottery department. The name Kerala Lottery is used only to describe the subject of the information provided on this website.",
      "Visitors should always refer to the official Kerala State Lotteries Department website and government publications for authentic announcements, official lottery results, and other authoritative information.",
    ],
  },
  {
    heading: "No Lottery Ticket Sales or Distribution",
    paragraphs: [
      "Our website does not sell, purchase, distribute, or promote the sale of Kerala lottery tickets or any other lottery tickets.",
      "We do not participate in lottery ticket transactions, lottery draw operations, prize distribution, or the collection of lottery payments. We do not act as lottery agents, ticket sellers, authorised representatives, or intermediaries for any lottery department.",
      "Visitors should purchase lottery tickets only through legally authorised sellers and follow the applicable rules and regulations established by the relevant authorities.",
      "We also do not request payments, ticket purchase fees, registration charges, or personal financial transactions in exchange for lottery results published on this website.",
    ],
  },
  {
    heading: "Official Lottery Results Verification",
    paragraphs: [
      "We make reasonable efforts to publish lottery-related information based on available sources. However, there may be occasional errors, technical issues, delays, or differences between the information displayed on our website and official government records.",
      "Therefore, visitors must independently verify all winning numbers, prize amounts, ticket details, and prize eligibility through the official Kerala Government Gazette and announcements published by the Kerala State Lotteries Department.",
      "The official government records shall always be considered the final and authoritative source for confirming lottery results and winning claims.",
    ],
    highlight:
      "⚠️ Our website should not be treated as an official source for confirming lottery winnings or claiming prizes.",
  },
  {
    heading: "Accuracy and Updates of Information",
    paragraphs: [
      "We strive to maintain the quality and accuracy of the information published on our website. However, we cannot guarantee that every article, result, announcement, or update will always be free from errors or omissions.",
      "Lottery information may change, and updates may not always appear on our website immediately after official announcements.",
      "We reserve the right to update, modify, correct, or remove website content at any time without prior notice. Visitors are encouraged to check official sources regularly to obtain the latest and most accurate information.",
    ],
  },
  {
    heading: "No Guarantee of Lottery Winnings",
    paragraphs: [
      "All lottery results are based on chance. Our website does not predict lottery results, guarantee winning numbers, or promise that any visitor will win a lottery prize.",
      "Any information published about previous results, winning numbers, prize categories, or lottery trends should not be interpreted as a prediction of future lottery outcomes.",
      "We do not encourage visitors to spend money on lottery tickets based on previously published results or any information available on this website.",
      "Visitors are encouraged to participate responsibly, understand the risks involved, and make their own informed decisions.",
    ],
  },
  {
    heading: "Limitation of Liability",
    paragraphs: [
      "By using this website, visitors acknowledge that the information is provided for general informational purposes only.",
      "We shall not be held responsible for any direct or indirect loss, damage, financial loss, or inconvenience arising from:",
    ],
    bullets: [
      "Errors, inaccuracies, or omissions in published lottery information.",
      "Delays in updating lottery results or announcements.",
      "Decisions made based on information available on this website.",
      "Differences between our published information and official government records.",
      "Losses arising from lottery ticket purchases or participation.",
      "Technical interruptions, website downtime, or temporary unavailability.",
    ],
    closing: [
      "Visitors are responsible for independently verifying all information before relying on it.",
    ],
  },
  {
    heading: "External Website Links",
    paragraphs: [
      "Our website may contain links to external websites, including official government websites and other third-party information sources, to help visitors access additional information.",
      "These external websites are not controlled or maintained by us. We are not responsible for the accuracy, availability, privacy policies, security, or content of any third-party websites.",
      "Visiting external websites through links provided on our platform is entirely at the visitor's own discretion. We recommend reviewing the terms and privacy policies of external websites before using their services.",
    ],
  },
  {
    heading: "Responsible Use of Lottery Information",
    paragraphs: [
      "We encourage all visitors to use the information available on our website responsibly. Lottery participation involves financial risk, and there is no guarantee of winning a prize.",
      "Visitors should avoid making financial commitments or important decisions based solely on lottery-related information. We do not encourage excessive lottery participation or unrealistic expectations about winning.",
      "Our website is intended only to provide general information and does not offer financial advice, investment advice, or guaranteed winning strategies.",
    ],
  },
  {
    heading: "Copyright and Website Content",
    paragraphs: [
      "All original text, website content, design elements, and other materials published on this website are intended for informational purposes.",
      "Visitors may not reproduce, republish, distribute, or commercially use our original website content without appropriate permission, except where permitted by applicable law.",
      "Names, trademarks, logos, and other identifying materials belonging to government departments or third parties remain the property of their respective owners. Their appearance or mention on this website does not imply any official partnership, sponsorship, or endorsement.",
    ],
  },
  {
    heading: "Changes to This Disclaimer",
    paragraphs: [
      "We reserve the right to revise, update, or modify this Disclaimer whenever necessary to reflect changes in our website operations, content practices, or applicable requirements.",
      "Any changes will be published on this page. Visitors are encouraged to review this page periodically to stay informed about our Disclaimer and website policies.",
      "Continued use of our website after changes are published indicates acceptance of the updated Disclaimer, to the extent permitted by applicable law.",
    ],
  },
];

const INTRO = [
  "Welcome to our Kerala Lottery Results website. The information provided on this website is intended for general informational and educational purposes only. Our main objective is to help visitors access Kerala lottery results, winning numbers, prize details, draw schedules, and other lottery-related information in a simple and convenient manner.",
  "Although we make reasonable efforts to provide clear, accurate, and updated information, we do not guarantee that all the content published on this website is always complete, accurate, reliable, or up to date. Visitors are advised to independently verify all lottery-related information through the official sources before making any decisions based on the information available here.",
  "By accessing and using this website, you acknowledge that you have read, understood, and agreed to the terms mentioned in this Disclaimer.",
];

const bodySx = { color: "#374151", lineHeight: 1.7 } as const;
const headingSx = { fontWeight: 800, mb: 1.5, color: "#0B3C5D" } as const;

const Paragraphs = ({ items }: { items: string[] }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    {items.map((text) => (
      <Typography key={text} variant="body1" sx={bodySx}>
        {text}
      </Typography>
    ))}
  </Box>
);

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.keralalotteryresultstoday.in" },
    { "@type": "ListItem", position: 2, name: "Disclaimer", item: PAGE_URL },
  ],
};

export default function DisclaimerPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Paper
        component="article"
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: "24px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 900, mb: 1, color: "#111827", fontSize: { xs: "2rem", md: "3rem" } }}
        >
          Disclaimer
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4, fontWeight: 500 }}>
          Last Updated: November 14, 2026
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paragraphs items={INTRO} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          {SECTIONS.map(({ heading, paragraphs, bullets = [], closing = [], highlight }, index) => (
            <Box component="section" key={heading}>
              <Typography variant="h5" component="h2" sx={headingSx}>
                {`${index + 1}. ${heading}`}
              </Typography>
              <Paragraphs items={paragraphs} />
              {bullets.length > 0 && (
                <Box component="ul" sx={{ ...bodySx, pl: 3, my: 1.5 }}>
                  {bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </Box>
              )}
              {closing.length > 0 && <Paragraphs items={closing} />}
              {highlight && (
                <Typography
                  variant="body1"
                  sx={{
                    ...bodySx,
                    mt: 2,
                    fontWeight: 700,
                    bgcolor: "#FFFBEB",
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid #FEF3C7",
                  }}
                >
                  {highlight}
                </Typography>
              )}
            </Box>
          ))}

          <Box component="section">
            <Typography variant="h5" component="h2" sx={headingSx}>
              {`${SECTIONS.length + 1}. Contact Us`}
            </Typography>
            <Typography variant="body1" sx={{ ...bodySx, mb: 1.5 }}>
              If you have any questions, concerns, or suggestions regarding this Disclaimer or the
              information published on our website, please visit our{" "}
              <Link href="/contact" prefetch={false} style={{ color: "#0B3C5D", fontWeight: 700 }}>
                Contact Us
              </Link>{" "}
              page.
            </Typography>
            <Typography variant="body1" sx={bodySx}>
              We welcome genuine feedback and correction requests from our visitors and will make
              reasonable efforts to review them.
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mt: 5, color: "#374151", fontWeight: 700, textAlign: "center" }}>
          Thank you for visiting our Kerala Lottery Results website. We appreciate your understanding
          and encourage you to verify all lottery results through official government sources before
          making any decisions.
        </Typography>
      </Paper>
    </Container>
  );
}
