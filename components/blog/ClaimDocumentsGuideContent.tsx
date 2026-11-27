import type { BlogRecentDraw } from "@/data/blogs";
import { getBlogPath } from "@/data/blogs";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import { Callout, CheckList, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const TICKET_CHECKS = [
  "The ticket is original and has not been altered.",
  "The lottery name and draw number are clearly visible.",
  "The winning ticket number is readable.",
  "Your signature is on the reverse side, as required by the applicable rules.",
  "The ticket is not damaged or tampered with.",
];
const ID_DOCS = ["Aadhaar Card", "Voter ID Card", "Passport", "Driving Licence", "Other government-approved identity documents, where permitted"];
const PAN_CHECKS = [
  "Your PAN number is readable.",
  "Your name matches your identification details.",
  "You carry a self-attested photocopy if required.",
  "The original PAN card is available for verification.",
];
const BANK_DOCS = [
  "A copy of your bank passbook.",
  "A bank account statement.",
  "A cancelled cheque, where required.",
  "Other approved bank account verification documents.",
];
const FORM_FIELDS = [
  "Full name of the prize winner.",
  "Residential address.",
  "Contact number.",
  "Lottery ticket number.",
  "Lottery name and draw number.",
  "Prize amount.",
  "Bank account details.",
  "Signature of the claimant.",
];
const FILE_ORDER = [
  "Identity proof.",
  "Address proof.",
  "PAN card.",
  "Bank account proof.",
  "Passport-size photographs.",
  "Completed claim application.",
  "Original winning lottery ticket.",
];
const SUBMIT_STEPS = [
  { title: "Organise your documents", desc: "Collect your original winning ticket, identification documents, bank details, photographs and completed application form." },
  { title: "Verify your information", desc: "Check the ticket number, draw details, personal information and bank account details before submission." },
  { title: "Visit the appropriate lottery office", desc: "Approach the District Lottery Officer or the designated authority responsible for receiving your prize claim." },
  { title: "Submit the required documents", desc: "Hand over the original ticket and supporting documents as the prize-claim instructions require." },
  { title: "Obtain an acknowledgement", desc: "Where provided, get an acknowledgement or receipt confirming that your claim documents were submitted." },
  { title: "Complete the verification process", desc: "The lottery authorities examine the original ticket and supporting documents before processing an eligible claim." },
];
const REMEMBER = [
  "Submit your claim within the prescribed deadline.",
  "Do not submit an altered or damaged ticket.",
  "Ensure that your name and identification details are accurate.",
  "Provide correct bank account information.",
  "Keep copies of all submitted documents.",
  "Follow the latest instructions issued by the Lottery Department.",
  "Do not pay unauthorised individuals who promise faster prize approval.",
];

const ClaimDocumentsGuideContent = ({ recentDraws }: { recentDraws: BlogRecentDraw[] }) => (
  <>
    <Lead>
      Winning a Kerala State Lottery prize is an exciting moment. But receiving the prize money takes more than
      matching your ticket with the winning numbers. Winners must submit the original ticket along with the necessary
      supporting documents to the lottery authorities within the prescribed time limit.
    </Lead>
    <P>
      Knowing which documents are required to claim a Kerala lottery prize helps you avoid delays, missing paperwork or
      rejection. The District Lottery Officer plays an important role in receiving and processing eligible prize
      claims under the applicable government procedures. This guide covers each document, the identification
      requirements and the submission steps.
    </P>

    <Section id="original-ticket" title="1. Original Kerala Lottery Winning Ticket">
      <P>
        The original winning ticket is the most important document. Without it, establishing your entitlement to the
        prize becomes difficult. Before submitting it, make sure:
      </P>
      <CheckList items={TICKET_CHECKS} />
      <Callout tone="warning">
        Keep the ticket safe until the claim is complete. Do not laminate, cut, modify or make unnecessary marks on it.
        Lost it? Read{" "}
        <InlineLink href={getBlogPath("what-happens-if-you-lose-kerala-lottery-ticket")}>
          what happens if you lose your Kerala lottery ticket
        </InlineLink>
        .
      </Callout>
    </Section>

    <Section id="identity-proof" title="2. Identity Proof of the Prize Winner">
      <P>Identity proof lets the authorities confirm who is claiming the prize. Commonly accepted documents include:</P>
      <CheckList items={ID_DOCS} />
      <P>
        Make sure the name and personal details on your identity document match your claim application. Exact
        requirements may depend on the prize category and the latest instructions of the Kerala State Lotteries
        Department.
      </P>
    </Section>

    <Section id="photographs" title="3. Passport-Size Photographs">
      <P>
        Passport-size photographs may be required as part of the claim application. Keep recent photographs ready,
        follow the prescribed size and quantity, and carry a few extra copies.
      </P>
    </Section>

    <Section id="pan-card" title="4. PAN Card">
      <P>
        A PAN card may be required for financial identification and tax formalities. PAN details help the authorities
        complete the financial paperwork and apply the correct tax deduction. Before submitting your PAN copy, check:
      </P>
      <CheckList items={PAN_CHECKS} />
      <P>
        Tax requirements vary with the prize amount and the applicable income tax provisions. Read{" "}
        <InlineLink href={getBlogPath("kerala-lottery-tax-deduction-on-winnings")}>Kerala lottery tax on winnings</InlineLink>{" "}
        for the 30% TDS rules and take-home examples.
      </P>
    </Section>

    <Section id="bank-details" title="5. Bank Account Details">
      <P>
        Eligible prize payments are generally made through the prescribed banking procedure. You may be asked for:
      </P>
      <CheckList items={BANK_DOCS} />
      <Callout tone="danger">
        Never share your ATM PIN, UPI PIN, OTP or internet banking password as part of a lottery prize claim.
      </Callout>
    </Section>

    <Section id="claim-form" title="6. Completed Lottery Prize Claim Application Form">
      <P>
        A properly completed claim form is essential. For prizes above ₹10,000 this is the prescribed Form V. The form
        generally asks for:
      </P>
      <CheckList items={FORM_FIELDS} />
      <P>
        Check every section before submitting. Wrong information, missing signatures or incomplete details can lead to
        extra verification or delays.
      </P>
    </Section>

    <Section id="address-proof" title="7. Address Proof">
      <P>
        Address proof may be requested to confirm your residential details. Aadhaar, Voter ID, Passport, Driving
        Licence or other officially recognised address documents are commonly accepted. Make sure the address matches
        your application.
      </P>
    </Section>

    <Section id="self-attested" title="8. Self-Attested Copies of Supporting Documents">
      <P>
        You may need to submit photocopies along with the originals. Self-attestation means signing the photocopy to
        confirm it is a true copy. Organise your file in this order before visiting the District Lottery Officer:
      </P>
      <CheckList items={FILE_ORDER} />
      <P>Confirm the exact number of copies and any additional documents with the lottery office.</P>
    </Section>

    <Section id="how-to-submit" title="9. How to Submit Documents to the District Lottery Officer">
      <StepList steps={SUBMIT_STEPS} />
      <P>
        You can also submit through an eligible bank. See{" "}
        <InlineLink href={getBlogPath("surrender-kerala-lottery-winning-ticket-through-bank")}>
          how to surrender a Kerala lottery winning ticket through a bank
        </InlineLink>
        .
      </P>
      <RecentDrawsAnalysis
        draws={recentDraws}
        variant="deadline"
        title="Claim deadlines for the latest draws"
        intro="Your documents must be ready before the deadline. Here are the latest published draws with the last date to surrender the winning ticket (90 days from the draw)."
      />
    </Section>

    <Section id="remember" title="10. Important Things to Remember Before Submitting Your Claim">
      <CheckList items={REMEMBER} />
      <P>Documentation requirements can differ by prize amount and the applicable Kerala State Lottery rules.</P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Claiming a Kerala State Lottery prize involves careful document verification. The original winning ticket,
        identity proof, PAN card, bank details, photographs and completed application form are among the documents that
        may be required, depending on the claim category.
      </P>
      <P>
        Prepare them before visiting the District Lottery Officer, follow the latest official instructions and keep your
        original ticket safe throughout. First, confirm your number on the{" "}
        <InlineLink href="/">Kerala Lottery Results Today</InlineLink> page.
      </P>
      <P>
        <strong>Prepare your documents carefully, follow the official procedure and claim your prize with confidence.</strong>
      </P>
    </Section>
  </>
);

export default ClaimDocumentsGuideContent;
