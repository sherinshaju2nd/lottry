import type { BankSurrenderCopy } from "./types";

/** English source text — every translation in this folder must keep exactly this meaning. */
export const bankSurrenderCopyEn: BankSurrenderCopy = {
  lead: "Winning a Kerala State Lottery prize is an exciting moment, but receiving the money requires the correct submission and verification procedure. Winners of eligible prizes can submit their original winning tickets through specified banks instead of visiting the Lottery Department in person.",
  intro:
    "Knowing how to surrender a Kerala lottery winning ticket through a bank helps you finish the claim without unnecessary delays. The procedure involves preparing the original ticket, completing the application form, submitting identification documents and providing bank account details. It applies whether you won a regular lottery or a bumper prize.",
  verifyTicket: {
    title: "1. Verify Your Kerala Lottery Winning Ticket",
    p1: "Before submitting, confirm that your ticket number matches the declared winning number. Check:",
    checks: [
      "Lottery name and draw number.",
      "Winning ticket number and series.",
      "Date of the lottery draw.",
      "Prize category and winning amount.",
      "Original ticket condition.",
    ],
    p2: "Compare your ticket with the [Kerala lottery results today](/) and the official result. The lottery name, draw date and ticket series must all match. Keep the original ticket safe; it is essential for verification.",
  },
  eligibleBank: {
    title: "2. Choose an Eligible Bank for Ticket Submission",
    p1: "Under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024, winning tickets can be submitted through:",
    banks: ["Nationalised banks", "Scheduled commercial banks", "Kerala Bank", "Urban cooperative banks"],
    callout:
      "Not every branch handles lottery prize submissions. Contact the branch before visiting and ask about the required documents, application form and authorisation process.",
  },
  documents: {
    title: "3. Collect the Documents Required for the Prize Claim",
    p1: "For prizes above ₹10,000, the prescribed Form V application is required. The following are generally needed (see the full [Kerala lottery claim documents checklist](guide:documents-required-to-claim-kerala-lottery-prize)):",
    items: [
      { label: "Original winning ticket", text: "Submitted for verification, in good condition, with claimant details on the reverse." },
      { label: "PAN Card", text: "PAN details and, where applicable, a self-attested copy for identity and tax formalities." },
      { label: "Aadhaar Card", text: "Aadhaar details are required in the prescribed Form V application." },
      { label: "Bank passbook", text: "A self-attested copy may be required if the claim is not submitted electronically." },
      { label: "Passport-size photograph", text: "A recent photograph may be required with the physical application." },
      { label: "Completed Form V", text: "Winner's personal information, ticket details, bank information and declaration." },
      { label: "Bank authorisation", text: "Allows the bank to receive the prize amount on the winner's behalf." },
    ],
    p2: "Additional requirements may apply to joint claims and to claimants living outside Kerala.",
  },
  formV: {
    title: "4. Complete Form V for the Prize Claim",
    p1: "Form V is the prescribed application for Kerala lottery prizes above ₹10,000. You need to provide:",
    fields: [
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
    ],
    warning:
      "When surrendering through a bank, pay particular attention to the authorisation section of Form V. Incorrect bank details or missing signatures can delay the claim.",
  },
  reverseSide: {
    title: "5. Write Your Details on the Reverse Side of the Ticket",
    paragraphs: [
      "Before submitting, fill in the claimant details in the space on the back of the ticket: generally your name, residential address and signature. They must match Form V.",
      "Do not write over the printed ticket number, lottery name or other information. Do not laminate, modify or damage the ticket.",
    ],
  },
  submitAtBank: {
    title: "6. Submit Your Winning Ticket to the Bank",
    p1: "Visit the selected branch and tell the officials you want to submit a Kerala State Lottery winning ticket. The bank follows its prescribed procedure for accepting and forwarding the claim. You may need to provide:",
    steps: [
      { title: "Original winning lottery ticket", desc: "With your name, address and signature on the reverse." },
      { title: "Completed Form V", desc: "Required for prizes above ₹10,000." },
      { title: "Identity details and supporting documents", desc: "PAN, Aadhaar, photograph and passbook copy as applicable." },
      { title: "Bank account information", desc: "Account number, branch and IFSC exactly as in your passbook." },
      { title: "Signed bank authorisation", desc: "The authorisation section of Form V, signed by the winner." },
    ],
    callout:
      "Ask for an acknowledgement or receipt confirming that your ticket and documents were accepted, and keep it until the claim is complete.",
  },
  verification: {
    title: "7. Understand the Bank Verification and Approval Process",
    p1: "The bank forwards the original ticket and documents to the Lottery Department authority for verification. The authorities examine:",
    checks: [
      "Authenticity of the original ticket.",
      "Lottery name and draw details.",
      "Ticket number and security features.",
      "Winner's identification information.",
      "Supporting documents.",
      "Bank account details and authorisation.",
    ],
    p2: "A prize is not approved just because the bank accepted the ticket. Final approval depends on verification by the competent lottery authority.",
  },
  receiveMoney: {
    title: "8. How Will You Receive the Prize Money?",
    p1: "After verification and approval, the prize is processed under the applicable payment procedure. Form V names the bank branch where the amount is to be deposited: the winner authorises the Director of State Lotteries to pay the approved amount to that branch, and the bank then pays the winner.",
    p2: "Statutory tax deductions are made before the final payment, so check your account details and authorisation carefully. See [how 30% TDS on Kerala lottery winnings works](guide:kerala-lottery-tax-deduction-on-winnings).",
  },
  deadline: {
    title: "9. What Is the Deadline for Submitting a Winning Ticket?",
    p1: "Under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024, the original winning ticket must generally be surrendered within 90 days from the draw date, either directly or through an eligible bank.",
    facts: [
      { value: "90 days", label: "Normal surrender window from the draw date" },
      { value: "+60 days", label: "Possible Government consideration for delayed claims of ₹1 lakh or more" },
      { value: "₹10,000+", label: "Prizes above this need the prescribed Form V" },
    ],
    p2: "The extra 60 days for delayed claims of ₹1 lakh or more is at the Government's discretion, based on the reasons for the delay. Do not wait until the last date.",
    recentDrawsTitle: "Last date to surrender: latest draws",
    recentDrawsIntro: "Real deadlines for the latest published Kerala lottery draws, counted 90 days from each draw date.",
  },
  safety: {
    title: "10. Important Safety Tips Before Submitting Your Ticket",
    tips: [
      "Purchase lottery tickets only through authorised agents.",
      "Verify your winning number carefully.",
      "Keep the original ticket in a safe place.",
      "Never hand over your ticket to unauthorised individuals.",
      "Check all details before signing Form V.",
      "Confirm the bank's submission procedure beforehand.",
      "Keep copies of your supporting documents.",
      "Obtain an acknowledgement when submitting your ticket.",
      "Never share your banking OTP, PIN or password.",
    ],
    p1: "Worried about authenticity? Learn [how to find fake Kerala lottery tickets](guide:how-to-find-fake-kerala-lottery-tickets) and ask authorised lottery officials to verify any ticket with suspicious alterations.",
  },
  conclusion: {
    title: "Conclusion",
    paragraphs: [
      "Submitting a winning ticket through a bank is a convenient option for eligible claimants, as long as you complete the correct application, prepare the documents and follow the official verification process.",
      "Before you surrender your ticket, make sure you have the original ticket, Form V, PAN and Aadhaar details, bank account information and supporting documents. Respect the 90-day deadline and confirm the latest requirements with the bank or Lottery Department.",
    ],
  },
};
