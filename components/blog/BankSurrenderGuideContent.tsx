import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { BlogRecentDraw } from "@/data/blogs";
import { getBlogPath } from "@/data/blogs";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import { Callout, CheckList, GuideFigure, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const SLUG = "surrender-kerala-lottery-winning-ticket-through-bank";

const VERIFY_TICKET = [
  "Lottery name and draw number.",
  "Winning ticket number and series.",
  "Date of the lottery draw.",
  "Prize category and winning amount.",
  "Original ticket condition.",
];
const ELIGIBLE_BANKS = ["Nationalised banks", "Scheduled commercial banks", "Kerala Bank", "Urban cooperative banks"];
const DOCUMENTS = [
  { label: "Original winning ticket", text: "Submitted for verification, in good condition, with claimant details on the reverse." },
  { label: "PAN Card", text: "PAN details and, where applicable, a self-attested copy for identity and tax formalities." },
  { label: "Aadhaar Card", text: "Aadhaar details are required in the prescribed Form V application." },
  { label: "Bank passbook", text: "A self-attested copy may be required if the claim is not submitted electronically." },
  { label: "Passport-size photograph", text: "A recent photograph may be required with the physical application." },
  { label: "Completed Form V", text: "Winner's personal information, ticket details, bank information and declaration." },
  { label: "Bank authorisation", text: "Allows the bank to receive the prize amount on the winner's behalf." },
];
const FORM_V_FIELDS = [
  "Lottery name and draw number.",
  "Winning ticket number.",
  "Full name of the prize winner.",
  "Residential address.",
  "Contact number.",
  "PAN number.",
  "Aadhaar number.",
  "Bank name and branch.",
  "Bank account number.",
  "IFSC code.",
  "Winner's declaration and signature.",
];
const AT_THE_BANK = [
  { title: "Original winning lottery ticket", desc: "With your name, address and signature on the reverse." },
  { title: "Completed Form V", desc: "Required for prizes above ₹10,000." },
  { title: "Identity details and supporting documents", desc: "PAN, Aadhaar, photograph and passbook copy as applicable." },
  { title: "Bank account information", desc: "Account number, branch and IFSC exactly as in your passbook." },
  { title: "Signed bank authorisation", desc: "The authorisation section of Form V, signed by the winner." },
];
const AUTHORITY_CHECKS = [
  "Authenticity of the original ticket.",
  "Lottery name and draw details.",
  "Ticket number and security features.",
  "Winner's identification information.",
  "Supporting documents.",
  "Bank account details and authorisation.",
];
const SAFETY = [
  "Purchase lottery tickets only through authorised agents.",
  "Verify your winning number carefully.",
  "Keep the original ticket in a safe place.",
  "Never hand over your ticket to unauthorised individuals.",
  "Check all details before signing Form V.",
  "Confirm the bank's submission procedure beforehand.",
  "Keep copies of your supporting documents.",
  "Obtain an acknowledgement when submitting your ticket.",
  "Never share your banking OTP, PIN or password.",
];
const DEADLINE_FACTS = [
  { value: "90 days", label: "Normal surrender window from the draw date" },
  { value: "+60 days", label: "Possible Government consideration for delayed claims of ₹1 lakh or more" },
  { value: "₹10,000+", label: "Prizes above this need the prescribed Form V" },
];

const BankSurrenderGuideContent = ({ recentDraws }: { recentDraws: BlogRecentDraw[] }) => (
  <>
    <GuideFigure
      slug={SLUG}
      alt="Dhanalekshmi DL-77 Kerala lottery winning ticket and Form V being taken to a bank, with a 90-day deadline calendar"
      caption="Illustration: surrendering a Dhanalekshmi DL-77 ticket (draw of 11 November 2026) through a bank. Specimen only."
    />
    <Lead>
      Winning a Kerala State Lottery prize is an exciting moment, but receiving the money requires the correct
      submission and verification procedure. Winners of eligible prizes can submit their original winning tickets
      through specified banks instead of visiting the Lottery Department in person.
    </Lead>
    <P>
      Knowing how to surrender a Kerala lottery winning ticket through a bank helps you finish the claim without
      unnecessary delays. The procedure involves preparing the original ticket, completing the application form,
      submitting identification documents and providing bank account details. It applies whether you won a regular
      lottery or a bumper prize.
    </P>

    <Section id="verify-ticket" title="1. Verify Your Kerala Lottery Winning Ticket">
      <P>Before submitting, confirm that your ticket number matches the declared winning number. Check:</P>
      <CheckList items={VERIFY_TICKET} />
      <P>
        Compare your ticket with the <InlineLink href="/">Kerala lottery results today</InlineLink> and the official
        result. The lottery name, draw date and ticket series must all match. Keep the original ticket safe; it is
        essential for verification.
      </P>
    </Section>

    <Section id="eligible-bank" title="2. Choose an Eligible Bank for Ticket Submission">
      <P>
        Under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024, winning tickets can be submitted through:
      </P>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {ELIGIBLE_BANKS.map((bank) => (
          <Grid key={bank} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 1.75, height: "100%", textAlign: "center", borderRadius: "12px", bgcolor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
              <Typography sx={{ fontWeight: 800, color: "#312E81", fontSize: "0.9rem" }}>{bank}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Callout tone="info">
        Not every branch handles lottery prize submissions. Contact the branch before visiting and ask about the
        required documents, application form and authorisation process.
      </Callout>
    </Section>

    <Section id="documents" title="3. Collect the Documents Required for the Prize Claim">
      <P>
        For prizes above ₹10,000, the prescribed Form V application is required. The following are generally needed (see
        the full{" "}
        <InlineLink href={getBlogPath("documents-required-to-claim-kerala-lottery-prize")}>
          Kerala lottery claim documents checklist
        </InlineLink>
        ):
      </P>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {DOCUMENTS.map(({ label, text }, index) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 2.25, height: "100%", borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontWeight: 800, color: "#0B3C5D", fontSize: "0.95rem", mb: 0.5 }}>
                {index + 1}. {label}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>{text}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <P>Additional requirements may apply to joint claims and to claimants living outside Kerala.</P>
    </Section>

    <Section id="form-v" title="4. Complete Form V for the Prize Claim">
      <P>Form V is the prescribed application for Kerala lottery prizes above ₹10,000. You need to provide:</P>
      <CheckList items={FORM_V_FIELDS} />
      <Callout tone="warning">
        When surrendering through a bank, pay particular attention to the authorisation section of Form V. Incorrect bank
        details or missing signatures can delay the claim.
      </Callout>
    </Section>

    <Section id="reverse-side" title="5. Write Your Details on the Reverse Side of the Ticket">
      <P>
        Before submitting, fill in the claimant details in the space on the back of the ticket: generally your name,
        residential address and signature. They must match Form V.
      </P>
      <P>
        Do not write over the printed ticket number, lottery name or other information. Do not laminate, modify or
        damage the ticket.
      </P>
    </Section>

    <Section id="submit-at-bank" title="6. Submit Your Winning Ticket to the Bank">
      <P>
        Visit the selected branch and tell the officials you want to submit a Kerala State Lottery winning ticket. The
        bank follows its prescribed procedure for accepting and forwarding the claim. You may need to provide:
      </P>
      <StepList steps={AT_THE_BANK} />
      <Callout tone="info">
        Ask for an acknowledgement or receipt confirming that your ticket and documents were accepted, and keep it until
        the claim is complete.
      </Callout>
    </Section>

    <Section id="verification" title="7. Understand the Bank Verification and Approval Process">
      <P>
        The bank forwards the original ticket and documents to the Lottery Department authority for verification. The
        authorities examine:
      </P>
      <CheckList items={AUTHORITY_CHECKS} />
      <P>
        A prize is not approved just because the bank accepted the ticket. Final approval depends on verification by the
        competent lottery authority.
      </P>
    </Section>

    <Section id="receive-money" title="8. How Will You Receive the Prize Money?">
      <P>
        After verification and approval, the prize is processed under the applicable payment procedure. Form V names
        the bank branch where the amount is to be deposited: the winner authorises the Director of State Lotteries to pay
        the approved amount to that branch, and the bank then pays the winner.
      </P>
      <P>Statutory tax deductions are made before the final payment, so check your account details and authorisation carefully.</P>
    </Section>

    <Section id="deadline" title="9. What Is the Deadline for Submitting a Winning Ticket?">
      <P>
        Under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024, the original winning ticket must generally be
        surrendered within 90 days from the draw date, either directly or through an eligible bank.
      </P>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {DEADLINE_FACTS.map(({ value, label }) => (
          <Grid key={value} size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, height: "100%", borderRadius: "12px", bgcolor: "#FEF2F2", border: "1px solid #FECACA", textAlign: "center" }}>
              <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#B91C1C" }}>{value}</Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#7F1D1D", lineHeight: 1.5 }}>{label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <P>
        The extra 60 days for delayed claims of ₹1 lakh or more is at the Government&apos;s discretion, based on the
        reasons for the delay. Do not wait until the last date.
      </P>
      <RecentDrawsAnalysis
        draws={recentDraws}
        variant="deadline"
        title="Last date to surrender: latest draws"
        intro="Real deadlines for the latest published Kerala lottery draws, counted 90 days from each draw date."
      />
    </Section>

    <Section id="safety" title="10. Important Safety Tips Before Submitting Your Ticket">
      <CheckList items={SAFETY} />
      <P>
        Worried about authenticity? Learn{" "}
        <InlineLink href={getBlogPath("how-to-find-fake-kerala-lottery-tickets")}>how to find fake Kerala lottery tickets</InlineLink>{" "}
        and ask authorised lottery officials to verify any ticket with suspicious alterations.
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Submitting a winning ticket through a bank is a convenient option for eligible claimants, as long as you complete
        the correct application, prepare the documents and follow the official verification process.
      </P>
      <P>
        Before you surrender your ticket, make sure you have the original ticket, Form V, PAN and Aadhaar details, bank
        account information and supporting documents. Respect the 90-day deadline and confirm the latest requirements with
        the bank or Lottery Department.
      </P>
    </Section>
  </>
);

export default BankSurrenderGuideContent;
