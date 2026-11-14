import React from "react";
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CONTACT_EMAIL, FOUNDER } from "@/lib/siteAuthor";

const PAGE_URL = "https://www.keralalotteryresultstoday.in/privacy-policy";
const LAST_UPDATED = "November 14, 2026";
const DESCRIPTION =
  "Privacy Policy for Kerala Lottery Result Today: what data we collect, how Google AdSense and Google Analytics use cookies, how to opt out of personalised ads, and your rights.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Privacy Policy | Kerala Lottery",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Kerala Lottery Result Today",
    type: "website",
  },
  twitter: { card: "summary", title: "Privacy Policy | Kerala Lottery", description: DESCRIPTION },
};

const h2Sx = { fontWeight: 800, mb: 1.5, color: "#0B3C5D", fontSize: { xs: "1.25rem", md: "1.5rem" } } as const;
const bodySx = { color: "#374151", lineHeight: 1.7 } as const;
const listStyle = { paddingLeft: "20px", color: "#374151", lineHeight: 1.8, margin: 0 } as const;
const linkStyle = { color: "#0B3C5D", fontWeight: 700 } as const;

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
    {children}
  </a>
);

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 6 }, borderRadius: "24px", border: "1px solid #E5E7EB", bgcolor: "#FFFFFF" }}>
        <Typography component="h1" sx={{ fontWeight: 900, mb: 1, color: "#111827", fontSize: { xs: "2rem", md: "3rem" } }}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4, fontWeight: 500 }}>
          Last Updated: {LAST_UPDATED}
        </Typography>

        <Typography sx={{ ...bodySx, mb: 3 }}>
          This Privacy Policy explains how Kerala Lottery Result Today (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses and
          protects information when you use our website www.keralalotteryresultstoday.in and our mobile app (the &quot;Service&quot;). The
          Service is run by {FOUNDER.name} from {FOUNDER.location}. By using the Service, you agree to the practices described here.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              1. Purpose of the Service
            </Typography>
            <Typography sx={bodySx}>
              Kerala Lottery Result Today is an independent website that publishes Kerala State Lottery results and related guides for
              information only. We are not a lottery operator, we are not affiliated with the Kerala State Lotteries Department, and we
              do not sell tickets or handle prize claims.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              2. Information We Collect
            </Typography>
            <ul style={listStyle}>
              <li>
                <strong>Automatically collected data:</strong> IP address, device and browser type, operating system, app version, and
                usage data such as pages viewed, collected through cookies, server logs and similar technologies.
              </li>
              <li>
                <strong>Information you provide:</strong> for example your name and email address if you email us.
              </li>
              <li>
                <strong>Data stored on your device:</strong> ticket numbers you save to your watchlist and display preferences are kept
                in your browser&apos;s local storage and are not sent to our servers.
              </li>
              <li>
                <strong>Advertising and analytics data:</strong> collected by Google AdSense and Google Analytics as described in
                Sections 5 and 6.
              </li>
            </ul>
            <Typography sx={{ ...bodySx, mt: 2 }}>
              We do not collect payment details, government ID numbers, or lottery ticket purchase data.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              3. How We Use Your Information
            </Typography>
            <ul style={listStyle}>
              <li>Operate, maintain and improve the Service</li>
              <li>Show lottery results and, if you turn them on, result notifications</li>
              <li>Understand how the site is used so we can make it faster and easier to use</li>
              <li>Show advertisements that help keep the Service free</li>
              <li>Reply to your questions and correction requests</li>
              <li>Comply with legal obligations and prevent abuse</li>
            </ul>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              4. Cookies
            </Typography>
            <Typography sx={bodySx}>
              Cookies are small text files stored on your device. We and our partners use them to remember your preferences, measure
              traffic, and serve and measure advertising. You can block or delete cookies in your browser settings; some features may
              then not work as expected.
            </Typography>
          </Box>

          <Box component="section" id="advertising">
            <Typography component="h2" sx={h2Sx}>
              5. Advertising (Google AdSense)
            </Typography>
            <Typography sx={{ ...bodySx, mb: 1.5 }}>
              We use Google AdSense to show advertisements on this website. In connection with this:
            </Typography>
            <ul style={listStyle}>
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other
                websites.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this
                site and/or other sites on the Internet.
              </li>
              <li>
                You may opt out of personalised advertising by visiting{" "}
                <ExternalLink href="https://adssettings.google.com/">Google Ads Settings</ExternalLink>. You can also opt out of some
                third-party vendors&apos; use of cookies for personalised advertising at{" "}
                <ExternalLink href="https://www.aboutads.info/choices/">www.aboutads.info</ExternalLink>.
              </li>
              <li>
                If you opt out, you will still see ads, but they will be less relevant to you. Ads may also be shown based on the
                page you are reading (contextual ads), which does not rely on your browsing history.
              </li>
              <li>
                Learn more about how Google uses information from sites that use its services at{" "}
                <ExternalLink href="https://policies.google.com/technologies/partner-sites">
                  How Google uses information from sites or apps that use our services
                </ExternalLink>
                .
              </li>
            </ul>
            <Typography sx={{ ...bodySx, mt: 2 }}>
              <strong>Visitors in the EEA, UK and Switzerland:</strong> we ask for your consent before personalised ads or
              non-essential cookies are used, through a consent message provided by Google (a Google-certified consent management
              platform). You can change or withdraw your choice at any time from the privacy settings link shown with that message,
              or by clearing this site&apos;s cookies.
            </Typography>
            <Typography sx={{ ...bodySx, mt: 2 }}>
              Advertisers have no influence over our lottery results or articles. We never show or accept advertising for online
              lottery sales, betting, or &quot;lucky number&quot; services.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              6. Analytics and Other Service Providers
            </Typography>
            <ul style={listStyle}>
              <li>
                <strong>Google Analytics and Google Tag Manager</strong> measure how visitors use the site (for example, which pages
                are popular). Google Analytics uses cookies and processes data such as your approximate location and device. You can
                opt out with the{" "}
                <ExternalLink href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out browser add-on</ExternalLink>.
              </li>
              <li>
                <strong>Supabase</strong> stores our lottery results database. Emails you send us are handled by our email provider.
              </li>
              <li>
                <strong>Vercel</strong> hosts the website and keeps standard server logs (such as IP address and request time) for
                security and reliability.
              </li>
            </ul>
            <Typography sx={{ ...bodySx, mt: 1.5 }}>
              These providers process data under their own privacy policies. See{" "}
              <ExternalLink href="https://policies.google.com/privacy">Google&apos;s Privacy Policy</ExternalLink>.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              7. Data Sharing and Disclosure
            </Typography>
            <Typography sx={{ ...bodySx, mb: 1.5 }}>We do not sell your personal information. We share information only:</Typography>
            <ul style={listStyle}>
              <li>With the service providers listed above, so they can run the Service for us</li>
              <li>If required by law, regulation or legal process</li>
              <li>To protect our rights, our users or the public against fraud, security issues or misuse</li>
              <li>In connection with a business transfer, with notice to users where required</li>
            </ul>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              8. Data Retention and Security
            </Typography>
            <Typography sx={bodySx}>
              We keep personal data only as long as needed for the purposes above or as required by law. Emails you send us are kept
              until your question is resolved and then deleted within 12 months. We use reasonable technical and organisational
              measures to protect information, but no method of transmission or storage is 100% secure.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              9. Children&apos;s Privacy
            </Typography>
            <Typography sx={bodySx}>
              The Service is not intended for anyone under 18 (or the legal age for lottery-related content where you live). We do
              not knowingly collect personal information from minors. If you believe a minor has given us information, contact us
              and we will delete it.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              10. Your Rights
            </Typography>
            <Typography sx={{ ...bodySx, mb: 1.5 }}>Depending on where you live, you may have the right to:</Typography>
            <ul style={listStyle}>
              <li>Access the personal data we hold about you</li>
              <li>Ask us to correct or delete your data</li>
              <li>Withdraw consent to cookies or personalised advertising (see Section 5)</li>
              <li>Object to or restrict certain processing</li>
              <li>Complain to your local data protection authority</li>
            </ul>
            <Typography sx={{ ...bodySx, mt: 1.5 }}>To use these rights, contact us at the email below. We reply within 30 days.</Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              11. Changes to This Privacy Policy
            </Typography>
            <Typography sx={bodySx}>
              We may update this policy from time to time. Changes are posted on this page with a new &quot;Last Updated&quot; date.
            </Typography>
          </Box>

          <Box component="section">
            <Typography component="h2" sx={h2Sx}>
              12. Contact Us
            </Typography>
            <Typography sx={bodySx}>
              Questions about this Privacy Policy or your data:
              <br />
              {FOUNDER.name}, {FOUNDER.location}
              <br />
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>
                {CONTACT_EMAIL}
              </a>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
