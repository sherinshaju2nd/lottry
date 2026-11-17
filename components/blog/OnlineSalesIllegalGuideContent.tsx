import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { BlogRecentDraw } from "@/data/blogs";
import { getBlogPath } from "@/data/blogs";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import { Callout, CheckList, GuideFigure, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const SLUG = "why-online-kerala-lottery-ticket-sales-are-illegal";

const REASONS = [
  "Preventing unauthorised lottery ticket sales.",
  "Protecting customers from financial scams.",
  "Avoiding duplicate and counterfeit tickets.",
  "Maintaining transparency in ticket distribution.",
  "Protecting authorised lottery agents and sellers.",
  "Ensuring proper control over lottery operations.",
];
const RISKS = [
  { title: "Duplicate lottery tickets", text: "Fraudsters may distribute identical ticket images or claim that a digital copy represents an original winning ticket." },
  { title: "Fake winning announcements", text: "Unauthorised sellers may send messages claiming you won, even when no genuine ticket was bought." },
  { title: "Payment fraud", text: "Some individuals collect money without ever providing an original physical ticket." },
  { title: "Personal information misuse", text: "Fraudulent platforms may ask for bank details, OTPs, passwords or other confidential information." },
  { title: "False prize promises", text: "Scammers promise guaranteed winnings to push customers into transferring money." },
];
const TICKET_DETAILS = [
  "Lottery name and draw number.",
  "Ticket series and number.",
  "Printed ticket price.",
  "Draw date.",
  "Government imprint and logo.",
  "Required ticket identification and security features.",
  "Agency seal and relevant identification details.",
];
const AD_WARNINGS = [
  "Promises guaranteed lottery winnings.",
  "Offers tickets at unusually low prices.",
  "Requests advance payments.",
  "Claims to be an official online lottery partner.",
  "Requests confidential banking information.",
  "Provides suspicious winning certificates.",
  "Uses pressure tactics to collect money immediately.",
];
const ALLOWED_VS_NOT = [
  { allowed: true, text: "Checking published results and winning numbers online" },
  { allowed: true, text: "Reading draw announcements and downloading result PDFs" },
  { allowed: true, text: "Buying an original printed ticket from an authorised agent" },
  { allowed: false, text: "Buying a ticket, ticket number or ticket image through a website or app" },
  { allowed: false, text: "Paying over WhatsApp, Facebook or Instagram for a \"reserved\" ticket" },
  { allowed: false, text: "Claiming a prize with a digital ticket image" },
];
const CLAIM_STEPS = [
  { title: "Verify the winning number", desc: "Check the lottery name, draw number, ticket series and complete winning number." },
  { title: "Keep the original ticket safe", desc: "Protect it from damage, alteration or loss." },
  { title: "Prepare the required documents", desc: "For prizes above ₹10,000, the prescribed Form V is required, with identity and bank documents." },
  { title: "Submit the winning ticket", desc: "Submit the original ticket to the lottery authority or through an eligible bank." },
  { title: "Complete ticket verification", desc: "The Lottery Department examines the ticket and documents before approving an eligible claim." },
  { title: "Receive the prize payment", desc: "After approval, the amount is paid under the applicable payment and tax rules." },
];
const CLAIM_DOCS = [
  "Original winning lottery ticket.",
  "Completed Form V application.",
  "PAN card details.",
  "Aadhaar card details.",
  "Bank passbook copy, where required.",
  "Passport-size photograph, where required.",
  "Bank account details and prescribed authorisation when submitting through a bank.",
];
const REPORT = [
  "Avoid making payments to unknown sellers.",
  "Save screenshots of suspicious advertisements.",
  "Keep payment receipts and transaction information.",
  "Avoid sharing OTPs and banking passwords.",
  "Report suspected unauthorised sales to the Kerala State Lotteries Department.",
  "Report online financial fraud on the National Cyber Crime Reporting Portal or helpline 1930.",
];

const OnlineSalesIllegalGuideContent = ({ recentDraws }: { recentDraws: BlogRecentDraw[] }) => (
  <>
    <GuideFigure
      slug={SLUG}
      alt="Original Suvarna Keralam SK-77 printed lottery ticket next to a phone offering online Kerala lottery tickets, crossed out as illegal"
      caption="Illustration: an original printed Suvarna Keralam SK-77 ticket (draw of 13 November 2026) vs an online seller. Specimen only."
    />
    <Lead>
      Kerala State Lotteries are among India&apos;s most popular government-regulated lottery programmes. Thousands of
      people buy physical tickets every day through authorised agents and sellers. But with the growth of digital
      platforms, several websites, mobile apps and social media accounts now advertise Kerala lottery tickets online.
    </Lead>
    <P>
      Many people do not realise that Kerala lottery tickets are distributed only through a regulated physical sales
      system. The Kerala State Lotteries Department has not authorised anyone to sell its paper lottery tickets online.
      Buying through unauthorised digital platforms exposes customers to fraud, duplicate tickets and misleading prize
      announcements.
    </P>

    <Section id="why-prohibited" title="1. Why Are Online Kerala Lottery Ticket Sales Prohibited?">
      <P>
        The Kerala Government regulates ticket distribution to keep it transparent, prevent fraud and protect customers
        and authorised agents. Registered agents and permitted sellers distribute original printed tickets to customers.
      </P>
      <Callout tone="warning">
        Under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024, lottery tickets cannot be sold through
        communication devices, computers, computer systems or social media intermediaries. Only the sale of original
        printed Kerala lottery tickets is permitted.
      </Callout>
      <P>The main reasons for these restrictions:</P>
      <CheckList items={REASONS} />
    </Section>

    <Section id="department-stand" title="2. What Does the Kerala Lottery Department Say About Online Sales?">
      <P>
        The Directorate of Kerala State Lotteries has clarified that it has not authorised anyone to sell Kerala paper
        lottery tickets online. Registered agents obtain physical tickets through the prescribed process and distribute
        them through authorised sellers.
      </P>
      <P>
        Checking results online is different from buying tickets online. Readers of{" "}
        <InlineLink href="/">Kerala Lottery Results Today</InlineLink> come for winning numbers, draw information and
        updates. That does not mean tickets can be bought on the same platform. Always distinguish between information
        services and authorised ticket sales.
      </P>
    </Section>

    <Section id="risks" title="3. What Are the Risks of Buying Kerala Lottery Tickets Online?">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {RISKS.map(({ title, text }) => (
          <Grid key={title} size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
              <Typography sx={{ fontWeight: 800, color: "#991B1B", fontSize: "0.95rem", mb: 0.5 }}>{title}</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <P>These risks are why you should avoid online sellers and buy original printed tickets through permitted channels.</P>
    </Section>

    <Section id="official-distribution" title="4. How Are Kerala Lottery Tickets Officially Distributed?">
      <P>
        Tickets reach customers through a regulated network of registered agents and authorised sellers. Buy directly
        from them and take the original physical ticket. Before accepting it, check:
      </P>
      <CheckList items={TICKET_DETAILS} />
      <P>
        Never rely on a photograph, screenshot or digital copy as a replacement for the original. See{" "}
        <InlineLink href={getBlogPath("how-to-find-fake-kerala-lottery-tickets")}>how to find fake Kerala lottery tickets</InlineLink>{" "}
        for detailed checks.
      </P>
    </Section>

    <Section id="fake-ads" title="5. How to Stay Safe from Fake Lottery Advertisements">
      <P>
        Fraudulent ads circulate on WhatsApp, Facebook, Instagram and other platforms, sometimes using government-like
        names, logos and ticket images. Be cautious if an advertisement:
      </P>
      <CheckList items={AD_WARNINGS} tone="bad" />
      <P>A genuine result announcement does not prove that someone owns a valid winning ticket.</P>
    </Section>

    <Section id="results-vs-buying" title="6. Checking Results vs Buying Tickets Online">
      <P>Checking Kerala lottery results online and buying tickets online are completely different activities.</P>
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden", mb: 2 }}>
        {ALLOWED_VS_NOT.map(({ allowed, text }, index) => (
          <Box
            key={text}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.5, bgcolor: allowed ? "#F0FDF4" : "#FFFFFF", borderTop: index === 0 ? "none" : "1px solid #F1F5F9" }}
          >
            {allowed ? <CheckCircleIcon sx={{ color: "#16A34A" }} /> : <CancelIcon sx={{ color: "#DC2626" }} />}
            <Typography sx={{ fontWeight: 700, fontSize: "0.93rem", color: "#0F172A" }}>{text}</Typography>
          </Box>
        ))}
      </Paper>
      <RecentDrawsAnalysis
        draws={recentDraws}
        variant="verify"
        title="Results are free to check: latest draws"
        intro="These are the latest published results. Checking them costs nothing and needs no payment, login or ticket purchase. Anyone asking you to pay to 'see' or 'reserve' a number is not an official channel."
      />
    </Section>

    <Section id="claim-prize" title="7. What Should Winners Know About Claiming Prizes?">
      <P>The original winning ticket is essential for verification. The general procedure:</P>
      <StepList steps={CLAIM_STEPS} />
      <Callout tone="info">
        Under the 2024 amended rules, the general deadline for surrendering a winning ticket is 90 days from the draw
        date. You can also{" "}
        <InlineLink href={getBlogPath("surrender-kerala-lottery-winning-ticket-through-bank")}>surrender the ticket through a bank</InlineLink>
        .
      </Callout>
    </Section>

    <Section id="claim-documents" title="8. Documents Required for Kerala Lottery Prize Claims">
      <P>For prizes above ₹10,000, Form V and supporting documents are required. These generally include:</P>
      <CheckList items={CLAIM_DOCS} />
      <P>
        Joint claims and special cases may need more. Full list:{" "}
        <InlineLink href={getBlogPath("documents-required-to-claim-kerala-lottery-prize")}>
          documents required to claim a Kerala lottery prize
        </InlineLink>
        .
      </P>
    </Section>

    <Section id="report" title="9. How to Report Unauthorised Lottery Ticket Sales">
      <CheckList items={REPORT} />
      <P>Reporting helps the authorities investigate fraudulent operations and protect other customers.</P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Online Kerala lottery ticket sales are restricted under the State&apos;s regulated paper lottery system. The rules
        prevent unauthorised distribution, protect customers from fraud and keep lottery operations transparent.
      </P>
      <P>
        Buy original physical tickets only from authorised agents and sellers, be careful with digital advertisements and
        ticket images, and never trust anyone promising guaranteed winnings. Use the internet to check results, not to
        buy tickets.
      </P>
    </Section>
  </>
);

export default OnlineSalesIllegalGuideContent;
