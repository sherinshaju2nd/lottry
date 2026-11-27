import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { getBlogPath } from "@/data/blogs";

const LINK_STYLE = { color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" } as const;
const BODY_SX = { color: "#334155", mb: 2, lineHeight: 1.8 } as const;
const H2_SX = { fontWeight: 800, color: "#0B3C5D", mb: 2 } as const;
const CLAIM_GUIDE_PATH = getBlogPath("how-to-claim-kerala-lottery-prize");

const LOST_TICKET_STEPS = [
  {
    title: "Search for the ticket carefully",
    desc: "Check your wallet, handbag, clothes, vehicle and other places where you usually keep important documents. Sometimes the ticket is misplaced rather than permanently lost.",
  },
  {
    title: "Check your ticket details",
    desc: "If you have a photograph or note of the ticket, check the lottery name, draw number, series and ticket number. These details help you explain the situation to the officials.",
  },
  {
    title: "Contact the lottery office",
    desc: "Visit or contact your nearest District Lottery Office. Explain when and where you bought the ticket and when you noticed it was missing. Ask whether any official procedure applies.",
  },
  {
    title: "Report theft if necessary",
    desc: "If you believe the ticket was stolen, consider filing a police complaint and keep a copy. A complaint does not automatically replace the original ticket or guarantee prize payment.",
  },
  {
    title: "Keep all available proof",
    desc: "Save photographs, purchase-related messages and other records. They can support your explanation, but they are not a substitute for the original ticket.",
  },
];

const PROOF_COMPARISON = [
  { item: "Original physical ticket", accepted: true, note: "Required for every prize claim" },
  { item: "Photocopy (both sides)", accepted: false, note: "Supporting document only, alongside the original" },
  { item: "Mobile photo or screenshot", accepted: false, note: "Helps you remember details, does not guarantee payment" },
  { item: "Remembered number or result PDF", accepted: false, note: "Cannot establish ownership of the ticket" },
  { item: "Police complaint copy", accepted: false, note: "Useful record if stolen, not a replacement" },
];

const CLAIM_RULES = [
  { label: "Original ticket", text: "The original winning ticket must be submitted to the concerned authority." },
  { label: "Ticket condition", text: "The ticket should be genuine and in acceptable condition. Tampered or mutilated tickets may be rejected." },
  { label: "Signature", text: "Write your name, address and signature on the reverse side of the ticket as required." },
  { label: "Identity proof", text: "Keep the necessary identity documents ready." },
  { label: "Photocopy", text: "A copy of both sides of the ticket may be required as a supporting document." },
  {
    label: "Claim deadline",
    text: "Prize claims are generally required within 30 days of the draw. Certain delayed claims may be considered under the applicable rules with the approval of authorised officials.",
  },
];

const PROTECTION_TIPS = [
  { title: "Keep it in a safe place", text: "Avoid open areas, loose pockets or places where it can easily fall out." },
  { title: "Take a photograph", text: "Capture clear pictures of both sides after purchase and store them securely." },
  { title: "Write your details", text: "Follow the department's instructions for your name, address and signature on the back." },
  { title: "Avoid folding or damage", text: "Keep the ticket flat and away from water, heat and direct sunlight." },
  { title: "Check the result carefully", text: "Compare your ticket details with the official result once it is announced." },
];

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <Box id={id} component="section" sx={{ scrollMarginTop: 100, mb: 5 }}>
    <Typography variant="h4" component="h2" sx={H2_SX}>
      {title}
    </Typography>
    {children}
  </Box>
);

const Callout = ({ tone, children }: { tone: "warning" | "info"; children: ReactNode }) => {
  const isWarning = tone === "warning";
  const Icon = isWarning ? WarningAmberIcon : InfoOutlinedIcon;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        my: 3,
        borderRadius: "12px",
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        bgcolor: isWarning ? "#FFFBEB" : "#EFF6FF",
        border: `1px solid ${isWarning ? "#FDE68A" : "#BFDBFE"}`,
      }}
    >
      <Icon sx={{ color: isWarning ? "#D97706" : "#1D4ED8", mt: 0.25 }} />
      <Typography sx={{ color: isWarning ? "#78350F" : "#1E3A8A", fontSize: "0.95rem", lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Paper>
  );
};

const LostTicketGuideContent = () => (
  <>
    <Typography sx={{ fontSize: { xs: "1.05rem", sm: "1.12rem" }, color: "#1E293B", mb: 3, lineHeight: 1.8 }}>
      Winning a Kerala lottery prize can be an exciting moment. However, losing your ticket after purchasing it can
      create a serious problem, especially if the ticket has a winning number. Many people keep their lottery tickets in
      their wallets, pockets or bags. Sometimes, they forget where they placed them or accidentally throw them away.
    </Typography>
    <Typography sx={BODY_SX}>
      But what happens if you lose your ticket before claiming the prize? Can you still receive the winning amount? Is a
      photocopy enough to prove that you purchased the ticket?
    </Typography>
    <Typography sx={{ ...BODY_SX, mb: 4 }}>
      If you are facing this situation, it is important to understand the rules before taking any action. Here is what
      you should know about lost tickets, prize claims and the steps you can take to protect yourself.
    </Typography>

    <Section id="what-happens" title="What Happens If You Lose Your Kerala Lottery Ticket?">
      <Typography sx={BODY_SX}>
        If you lose your winning ticket, claiming the prize becomes very difficult. The original physical ticket is an
        important requirement for the Kerala lottery prize claim process. The lottery department checks the original
        ticket to confirm its details and verify that it is genuine.
      </Typography>
      <Typography sx={BODY_SX}>
        According to the Kerala Paper Lotteries (Regulation) Rules, 2005, the original winning ticket must be
        surrendered to the concerned lottery office. The ticket is also checked against official records before the
        prize money is released.
      </Typography>
      <Callout tone="warning">
        Simply knowing the winning number is not enough. You must present the original ticket to complete the claim
        process.
      </Callout>
      <Typography sx={BODY_SX}>
        For this reason, always keep your ticket in a safe place after purchasing it. Losing it can put your prize at
        risk, even if you have checked the{" "}
        <Link href="/" style={LINK_STYLE}>
          Kerala lottery result
        </Link>{" "}
        and confirmed that the number has won.
      </Typography>
    </Section>

    <Section id="can-you-still-claim" title="Lost Kerala Lottery Ticket: Can You Still Claim the Prize?">
      <Typography sx={BODY_SX}>
        One of the most common questions among lottery buyers is whether they can receive the prize after losing their
        ticket.
      </Typography>
      <Typography sx={BODY_SX}>
        Unfortunately, there is no standard replacement procedure for a lost Kerala lottery ticket under the published
        prize claim rules. The department requires the original winning ticket as proof of the claim.
      </Typography>
      <Typography sx={BODY_SX}>
        For example, imagine that you purchased a ticket for a weekly Kerala lottery draw. After checking the result,
        you discover that your number has won a prize. However, you cannot find the ticket anywhere. Even if you
        remember the ticket number, series and draw date, these details do not replace the original ticket.
      </Typography>
      <Typography sx={BODY_SX}>
        If you are in this situation, contact the nearest District Lottery Office immediately. Explain what happened
        and provide any information you have. The officials can guide you on the available procedures, but you should
        not assume that the prize will be approved without the original ticket.
      </Typography>
    </Section>

    <Section id="what-to-do" title="What to Do If Lottery Ticket Is Lost?">
      <Typography sx={{ ...BODY_SX, mb: 3 }}>
        If your ticket is missing, do not panic. Take the following steps as soon as possible.
      </Typography>
      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {LOST_TICKET_STEPS.map(({ title, desc }, index) => (
          <Box
            component="li"
            key={title}
            sx={{ display: "flex", gap: 2, p: 2.25, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}
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
              {index + 1}
            </Box>
            <Box>
              <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1rem", color: "#0F172A", mb: 0.5 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.7 }}>{desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Typography sx={{ ...BODY_SX, mt: 3 }}>
        Taking these steps quickly can help you understand your options and avoid further problems.
      </Typography>
    </Section>

    <Section id="claim-without-ticket" title="Can I Claim Kerala Lottery Prize Without Ticket?">
      <Typography sx={BODY_SX}>
        Generally, you cannot complete a Kerala lottery prize claim without submitting the original winning ticket.
      </Typography>
      <Typography sx={BODY_SX}>
        The lottery department needs to verify the ticket before approving payment. It checks the ticket details and
        security features to confirm that the claim is genuine.
      </Typography>
      <Typography sx={BODY_SX}>
        Even if you have memorised the winning number or downloaded the official result PDF, these details alone cannot
        establish ownership of the physical ticket.
      </Typography>
      <Callout tone="warning">
        If the ticket is permanently lost, contact the lottery department for official guidance. Do not depend on
        unofficial promises from agents or other people who claim they can arrange payment without the original ticket.
      </Callout>
    </Section>

    <Section id="photocopy" title="Can I Claim Lottery Prize With a Photocopy?">
      <Typography sx={BODY_SX}>
        A photocopy can be useful, but it cannot replace the original winning ticket.
      </Typography>
      <Typography sx={BODY_SX}>
        Under the prize claim requirements, a photocopy of both sides of the ticket is included among the supporting
        documents for certain claims. However, the original ticket must also be surrendered. For example, if you have a
        winning ticket worth a large amount, you may need to submit the original ticket along with a photocopy, identity
        documents, photographs and the prescribed claim receipt.
      </Typography>
      <Typography sx={{ ...BODY_SX, mb: 3 }}>
        A photocopy helps the officials keep a record of the ticket. It does not give you the same right to claim the
        prize as the original. The same applies to a mobile photograph or screenshot.
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden" }}>
        {PROOF_COMPARISON.map(({ item, accepted, note }, index) => (
          <Box
            key={item}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1.75,
              bgcolor: accepted ? "#F0FDF4" : "#FFFFFF",
              borderTop: index === 0 ? "none" : "1px solid #F1F5F9",
            }}
          >
            {accepted ? (
              <CheckCircleIcon sx={{ color: "#16A34A" }} />
            ) : (
              <CancelIcon sx={{ color: "#DC2626" }} />
            )}
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>{item}</Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>{note}</Typography>
            </Box>
          </Box>
        ))}
      </Paper>
    </Section>

    <Section id="claim-rules" title="Kerala Lottery Prize Claim Rules You Should Know">
      <Typography sx={{ ...BODY_SX, mb: 3 }}>
        Before claiming a prize, every winner should understand the basic requirements.
      </Typography>
      <Grid container spacing={2}>
        {CLAIM_RULES.map(({ label, text }) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontWeight: 800, color: "#0B3C5D", fontSize: "0.95rem", mb: 0.5 }}>{label}</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Callout tone="info">
        The exact documents and claim requirements can depend on the prize amount and the current official rules. Always
        confirm the latest instructions with the Kerala State Lotteries Department before submitting a claim. See our{" "}
        <Link href={CLAIM_GUIDE_PATH} style={LINK_STYLE}>
          complete Kerala lottery prize claim guide
        </Link>{" "}
        for documents, offices and deadlines.
      </Callout>
    </Section>

    <Section id="protect-ticket" title="How to Protect Your Kerala Lottery Original Ticket">
      <Typography sx={{ ...BODY_SX, mb: 3 }}>
        Taking a few simple precautions can prevent many problems in the future.
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {PROTECTION_TIPS.map(({ title, text }) => (
          <Box component="li" key={title} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 22, mt: 0.25 }} />
            <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>
              <strong>{title}:</strong> {text}
            </Typography>
          </Box>
        ))}
      </Box>
      <Callout tone="info">
        Taking a photograph is only a safety measure. It does not replace the original ticket when claiming a prize.
      </Callout>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <Typography sx={BODY_SX}>
        Losing a winning ticket can be a stressful experience. The most important thing to remember is that the original
        ticket is required for claiming a Kerala lottery prize. A photocopy, screenshot or remembered ticket number
        cannot normally replace it.
      </Typography>
      <Typography sx={BODY_SX}>
        If your ticket goes missing, search carefully, collect any available details and contact the nearest District
        Lottery Office for guidance. Most importantly, make it a habit to store every ticket safely after purchasing it.
      </Typography>
      <Typography sx={BODY_SX}>
        A little care can help you avoid unnecessary problems when checking results and claiming your prize.
      </Typography>
    </Section>
  </>
);

export default LostTicketGuideContent;
