import { FOUNDER } from "@/lib/siteAuthor";
/** Attribution for a licensed third-party photo (e.g. CC BY-SA from Wikimedia Commons). */
export interface PhotoCredit {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  tags: string[];
  publishedDate: string;
  updatedDate: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured: boolean;
  coverImage?: string;
  /** Descriptive alt text for the cover (falls back to the title). */
  coverAlt?: string;
  /** Attribution for a third-party cover photo (required by its licence). */
  coverCredit?: PhotoCredit;
  tableOfContents: {
    id: string;
    title: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  /** Lottery codes (e.g. "PB") whose draw pages should link back to this post. */
  relatedLotteryCodes?: string[];
  /** Primary internal call-to-action shown in the sidebar (defaults to ticket checker). */
  primaryCta?: {
    href: string;
    label: string;
    heading: string;
    description: string;
  };
  /** Step list emitted as HowTo JSON-LD for answer engines. */
  howTo?: {
    name: string;
    steps: string[];
  };
  /**
   * Lottery code whose announced draw (lotteries.draw_date) this post is about.
   * Text fields may use {{drawDate}}, {{drawDateShort}}, {{drawTime}}, {{drawUrl}} — resolved
   * server-side from the database, so no draw dates are hardcoded here.
   */
  drawLotteryCode?: string;
  /** Renders the latest published draws (draw_results) inside the article body. */
  showRecentDraws?: boolean;
}

/** A recently published draw with its prize-claim deadline, for in-article data panels. */
export interface BlogRecentDraw {
  name: string;
  code: string;
  /** ISO draw date (YYYY-MM-DD). */
  date: string;
  dateLong: string;
  /** First prize ticket number, e.g. "SA 286401". */
  firstTicket: string;
  location: string;
  /** Draw result page. */
  url: string;
  /** ISO date by which the winning ticket must be surrendered. */
  claimDeadline: string;
  claimDeadlineLong: string;
  /** Days left until the claim deadline (negative once passed). */
  daysLeft: number;
}

/** Server-loaded data an article body can render. */
export interface BlogRenderContext {
  draw: BlogDrawContext | null;
  recentDraws: BlogRecentDraw[];
}

/** Draw details resolved from the database for a post's `drawLotteryCode`. */
export interface BlogDrawContext {
  lotteryCode: string;
  /** Canonical draw-date page, or the lottery page when no date is announced. */
  url: string;
  date: string | null;
  dateLong: string;
  dateShort: string;
  drawTime: string;
  isUpcoming: boolean;
}

export const SITE_URL = "https://www.keralalotteryresultstoday.in";

/** Public path of a post. Posts live at the site root (e.g. /pooja-bumper-lottery-2026); proxy.ts rewrites them to app/blog/[slug]. */
export const getBlogPath = (slug: string): string => `/${slug}`;

/** Absolute canonical URL of a post. */
export const getBlogUrl = (slug: string): string => `${SITE_URL}${getBlogPath(slug)}`;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "kerala-lottery-tax-deduction-on-winnings",
    coverImage: "/blog/kerala-lottery-tax-deduction-on-winnings.jpg",
    coverAlt: "Dhanalekshmi Kerala lottery ticket specimen beside a prize payment statement showing agent commission and 30% TDS deductions",
    title: "Kerala Lottery Tax: Why Winners Should Understand TDS and Tax Deductions",
    metaTitle: "Kerala Lottery Tax on Winnings: 30% TDS & Take-Home Prize",
    description:
      "How tax applies to Kerala lottery winnings: 30% TDS under Section 194B, surcharge and cess, agent commission, take-home prize examples, documents to keep and how to plan before spending.",
    category: "Claim Guide",
    tags: [
      "Kerala Lottery Tax",
      "Lottery Winnings Tax India",
      "TDS on Lottery Winnings",
      "Section 194B",
      "Section 115BB",
      "Kerala Lottery Prize Money",
    ],
    publishedDate: "2026-11-21",
    updatedDate: "2026-11-21",
    readTime: "7 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    primaryCta: {
      href: "/how-to-claim-kerala-lottery-prize",
      label: "How to Claim a Prize",
      heading: "Won a Prize?",
      description: "Follow the official claim procedure before tax is deducted and the prize is paid.",
    },
    tableOfContents: [
      { id: "quick-answer", title: "Quick Answer: Tax on Kerala Lottery Winnings" },
      { id: "tax-on-winnings", title: "1. How Lottery Winnings Are Taxed" },
      { id: "actual-amount", title: "2. Why the Amount Received Is Lower" },
      { id: "tds", title: "3. Tax Deducted at Source (TDS)" },
      { id: "check-details", title: "4. Check Your Tax Details" },
      { id: "documents", title: "5. Tax Documents to Keep" },
      { id: "dont-spend", title: "6. Don't Spend the Prize Immediately" },
      { id: "tax-vs-expenses", title: "7. Tax vs Other Expenses" },
      { id: "professional-advice", title: "8. Professional Tax Advice" },
      { id: "planning", title: "9. Financial Planning After Winning" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "Are Kerala lottery winnings taxable in India?",
        answer:
          "Yes. Lottery winnings are taxable under Indian income-tax law at a flat rate of 30% (Section 115BB), plus applicable surcharge and 4% health and education cess. Tax is deducted at source before the prize is paid.",
      },
      {
        question: "What is the TDS rate on Kerala lottery winnings?",
        answer:
          "TDS on lottery winnings is 30% under Section 194B of the Income Tax Act when the winnings cross the prescribed threshold (₹10,000). Surcharge and cess may apply on top of the base rate depending on the amount.",
      },
      {
        question: "Will I receive the full advertised Kerala lottery prize amount?",
        answer:
          "No. The selling agent's commission and the applicable tax are deducted, so the amount credited to your bank account is lower than the prize announced in the result.",
      },
      {
        question: "Can I claim deductions or the basic exemption against lottery winnings?",
        answer:
          "Generally no. Lottery winnings are taxed at the special 30% rate and deductions or the basic exemption limit cannot be set off against them. Consult a tax professional for your situation.",
      },
      {
        question: "Why should lottery winners keep tax documents?",
        answer:
          "The prize payment confirmation, TDS certificate and bank statement help you verify deductions, report the winnings correctly in your income-tax return and answer any tax notice.",
      },
      {
        question: "Does checking Kerala lottery results mean I need to pay tax?",
        answer:
          "No. Checking results creates no tax liability. Tax arises only when you receive taxable lottery winnings.",
      },
    ],
  },
  {
    slug: "minimum-age-to-buy-kerala-lottery-ticket",
    coverImage: "/blog/minimum-age-to-buy-kerala-lottery-ticket.jpg",
    coverAlt: "Bhagyathara Kerala lottery ticket specimen beside an identity card and an 18+ adults-only badge",
    title: "Why Is There a Minimum Age to Buy a Kerala Lottery Ticket?",
    metaTitle: "Minimum Age to Buy Kerala Lottery Ticket: Rules & Reasons",
    description:
      "Why Kerala lottery participation is for adults only: the reasons behind minimum age rules, the 18-year age requirement for lottery agents, responsible play tips and how parents can explain lottery risks.",
    category: "Safety Guide",
    tags: [
      "Kerala Lottery Minimum Age",
      "Kerala Lottery Age Limit",
      "Responsible Lottery Play",
      "Kerala Lottery Agent Eligibility",
      "Kerala Lottery Rules",
    ],
    publishedDate: "2026-11-20",
    updatedDate: "2026-11-20",
    readTime: "6 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    primaryCta: {
      href: "/how-to-find-fake-kerala-lottery-tickets",
      label: "Spot Fake Tickets",
      heading: "Buy Responsibly",
      description: "10 checks to make sure the ticket you buy from an authorised seller is genuine.",
    },
    tableOfContents: [
      { id: "quick-answer", title: "Quick Answer: Minimum Age for Kerala Lottery" },
      { id: "why-minimum-age", title: "1. Why a Minimum Age Matters" },
      { id: "financial-risks", title: "2. Protecting Young People from Financial Risk" },
      { id: "responsible-play", title: "3. Responsible Lottery Participation" },
      { id: "agents-sellers", title: "4. Age Rules for Agents and Sellers" },
      { id: "parents", title: "5. The Role of Parents and Guardians" },
      { id: "results-vs-playing", title: "6. Reading Results Is Not Participating" },
      { id: "not-investment", title: "7. A Lottery Ticket Is Not an Investment" },
      { id: "buy-responsibly", title: "8. Buying Tickets Responsibly" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "Why is there a minimum age for Kerala lottery participation?",
        answer:
          "Age restrictions protect young people from financial risk and gambling-related harm, and limit participation to adults who can understand that a lottery is a game of chance.",
      },
      {
        question: "Is Kerala lottery participation intended for children?",
        answer:
          "No. Kerala lottery participation is intended for eligible adults, and age-related requirements apply under the relevant rules and regulations.",
      },
      {
        question: "What age requirement applies to Kerala lottery agents?",
        answer:
          "The Kerala lottery agent registration framework includes an 18-year age requirement for individuals seeking to become agents. Additional eligibility and documentation requirements may apply.",
      },
      {
        question: "Can young people check Kerala lottery results online?",
        answer:
          "Reading publicly available results is different from buying a ticket or taking part in a draw. Young people should not be encouraged to participate in lottery activities.",
      },
      {
        question: "Should a lottery ticket be considered an investment?",
        answer:
          "No. Lottery tickets are games of chance and do not provide a guaranteed or predictable return. Savings, budgeting and suitable financial products are the basis of financial planning.",
      },
      {
        question: "How can parents explain lottery risks to children?",
        answer:
          "Parents can explain probability, responsible spending, saving and budgeting, and the difference between entertainment and reliable financial planning.",
      },
    ],
  },
  {
    slug: "kerala-lottery-social-impact-karunya-benevolent-fund",
    coverImage: "/blog/kerala-lottery-social-impact-karunya-benevolent-fund.jpg",
    coverAlt: "Karunya and Karunya Plus Kerala lottery ticket specimens with a heart, medical cross and hospital showing lottery support for healthcare",
    title: "The Social Impact of Kerala Lotteries on Healthcare and Public Welfare",
    metaTitle: "Kerala Lottery Social Impact: Karunya Fund, Jobs & Revenue",
    description:
      "How Kerala lotteries support public welfare: the Karunya Benevolent Fund for serious illnesses, livelihoods for over one lakh agents and sellers, and what the CAG audit says about lottery revenue.",
    category: "Explainer",
    tags: [
      "Karunya Benevolent Fund",
      "Kerala Lottery Social Impact",
      "Kerala Lottery Revenue",
      "Kerala Lottery Healthcare",
      "Kerala State Lotteries",
    ],
    publishedDate: "2026-11-19",
    updatedDate: "2026-11-19",
    readTime: "7 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    relatedLotteryCodes: ["KR", "KN"],
    primaryCta: {
      href: "/",
      label: "Check Today's Result",
      heading: "Today's Kerala Lottery Result",
      description: "Live Karunya, Karunya Plus and daily draw results with the full prize chart.",
    },
    tableOfContents: [
      { id: "quick-answer", title: "Quick Answer: How Kerala Lotteries Help Society" },
      { id: "public-welfare", title: "1. How Lotteries Contribute to Public Welfare" },
      { id: "karunya-fund", title: "2. Karunya Benevolent Fund" },
      { id: "medical-expenses", title: "3. Support for Families Facing Medical Bills" },
      { id: "employment", title: "4. Employment Through the Lottery System" },
      { id: "revenue", title: "5. Lottery Revenue: What the CAG Audit Shows" },
      { id: "weaker-sections", title: "6. Supporting Economically Weaker Sections" },
      { id: "responsible-play", title: "7. Responsible Lottery Participation" },
      { id: "transparency", title: "8. Transparency and Accountability" },
      { id: "wider-importance", title: "9. Wider Social Importance" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "How do Kerala lotteries contribute to public welfare?",
        answer:
          "Kerala lotteries generate non-tax revenue for the State, create livelihoods for agents and sellers, and support healthcare assistance through the Karunya Benevolent Fund.",
      },
      {
        question: "What is the Karunya Benevolent Fund?",
        answer:
          "The Karunya Benevolent Fund (KBF) is a Kerala Government healthcare assistance scheme, supported by lottery funds, that helps eligible economically disadvantaged patients with serious illnesses.",
      },
      {
        question: "Which diseases are covered under the Karunya Benevolent Fund?",
        answer:
          "The scheme covers specified serious conditions including cancer, kidney diseases, heart diseases, haemophilia and palliative care, subject to eligibility and scheme rules.",
      },
      {
        question: "How much revenue does the Kerala lottery generate?",
        answer:
          "According to the CAG State Finances Audit Report for 2024–25, Kerala received ₹12,711.18 crore in State Lottery receipts. After lottery expenditure of ₹11,721.98 crore, the net receipt was ₹989.20 crore.",
      },
      {
        question: "Do all Kerala lottery proceeds go directly to healthcare?",
        answer:
          "No. Most receipts go to prizes, agent commission and operating costs. The net revenue joins the State's general resources, while specific healthcare help is provided through schemes such as the Karunya Benevolent Fund.",
      },
      {
        question: "Do Kerala lotteries create employment?",
        answer:
          "Yes. Kerala's 2024 Budget Speech noted that the lottery sector provides income and employment to more than one lakh people, including agents, retail sellers and distribution workers.",
      },
    ],
  },
  {
    slug: "kerala-lottery-agent-commission-on-winning-tickets",
    coverImage: "/blog/kerala-lottery-agent-commission-on-winning-tickets.jpg",
    coverAlt: "New Bhagya Lottery Agencies, a Kerala lottery agency shop with ticket counters on a street in Kerala",
    coverCredit: { author: "Mail2arunjith", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Keralalottery_agency.jpg" },
    title: "How Kerala Lottery Agents Earn Commission on Winning Tickets",
    metaTitle: "Kerala Lottery Agent Commission on Winning Tickets Explained",
    description:
      "How local Kerala lottery retail agents earn: commission on ticket sales, the selling-agent commission on winning tickets, how it is processed, what affects agent income and agents' responsibilities.",
    category: "Explainer",
    tags: [
      "Kerala Lottery Agent Commission",
      "Lottery Agent Prize Commission",
      "Kerala Lottery Agent",
      "Kerala Lottery Retail Seller",
      "Kerala Lottery Winning Ticket",
    ],
    publishedDate: "2026-11-18",
    updatedDate: "2026-11-18",
    readTime: "7 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    primaryCta: {
      href: "/kerala-lottery-tax-deduction-on-winnings",
      label: "See Tax on Winnings",
      heading: "Your Take-Home Prize",
      description: "Agent commission and 30% TDS are deducted before the prize reaches your account.",
    },
    howTo: {
      name: "How the selling-agent commission on a winning Kerala lottery ticket is processed",
      steps: [
        "An authorised agent sells the original printed ticket to a customer.",
        "The customer checks the ticket against the declared result.",
        "The winning ticket and the selling agent's details are identified during the claim.",
        "The Lottery Department verifies the original ticket and claim documents.",
        "Any eligible selling-agent commission is processed under the prescribed rules.",
      ],
    },
    tableOfContents: [
      { id: "quick-answer", title: "Quick Answer: How Agents Earn" },
      { id: "who-are-agents", title: "1. Who Are Kerala Lottery Retail Agents?" },
      { id: "sales-commission", title: "2. How Agents Earn Commission" },
      { id: "winning-commission", title: "3. Commission When Customers Win" },
      { id: "how-it-works", title: "4. How the Winning Ticket Commission Works" },
      { id: "why-agent-matters", title: "5. Why the Selling Agent Matters" },
      { id: "agent-income", title: "6. What Affects an Agent's Income" },
      { id: "prize-categories", title: "7. Commission by Prize Category" },
      { id: "support-agents", title: "8. Supporting Authorised Agents" },
      { id: "responsibilities", title: "9. Agent Responsibilities" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "How do Kerala lottery retail agents earn money?",
        answer:
          "Kerala lottery agents mainly earn commission on authorised ticket sales. Their earnings depend on the prescribed commission structure and the number of tickets they sell.",
      },
      {
        question: "Do Kerala lottery agents get commission when a ticket wins?",
        answer:
          "Yes, depending on the rules and prize category, the agent who sold a winning ticket may receive a selling-agent commission. For major and bumper prizes this is widely reported as 10% of the prize amount, deducted before the winner is paid.",
      },
      {
        question: "Is the agent commission the same for every Kerala lottery prize?",
        answer:
          "No. Commission arrangements can vary by lottery, prize category and the rules in force, so agents should check the latest official instructions.",
      },
      {
        question: "Does the lottery agent pay the prize to the winner?",
        answer:
          "No. The agent does not approve or guarantee prize payments. Claims are verified and paid by the Kerala State Lotteries Department or the competent authority.",
      },
      {
        question: "Can Kerala lottery agents sell tickets online?",
        answer:
          "No. Kerala paper lottery tickets are distributed only as original printed tickets through the regulated physical sales system. Online sale is not permitted.",
      },
      {
        question: "What factors affect a lottery agent's income?",
        answer:
          "Ticket sales volume, customer demand, shop location, the lotteries available and any eligible selling-agent commission on winning tickets.",
      },
    ],
  },
  {
    slug: "how-to-find-fake-kerala-lottery-tickets",
    coverImage: "/blog/how-to-find-fake-kerala-lottery-tickets.jpg",
    coverAlt: "Close-up of a genuine Karunya KR-84 Kerala State Lotteries ticket showing the ticket number, barcode, secret code and draw date",
    coverCredit: { author: "Mail2arunjith", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:KarunyaLottery.jpg" },
    title: "How to Find Fake Kerala Lottery Tickets: 10 Checks Before You Trust a Ticket",
    metaTitle: "How to Find Fake Kerala Lottery Tickets: 10 Warning Signs",
    description:
      "Learn how to find fake Kerala lottery tickets: check printing quality, ticket number, alterations, draw details and seller, compare with recent results, and what to do if you suspect a fake.",
    category: "Safety Guide",
    tags: [
      "Fake Kerala Lottery Ticket",
      "Kerala Lottery Fraud",
      "Duplicate Lottery Ticket",
      "Kerala Lottery Ticket Verification",
      "Kerala Lottery Results Today",
    ],
    publishedDate: "2026-11-17",
    updatedDate: "2026-11-17",
    readTime: "6 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    showRecentDraws: true,
    primaryCta: {
      href: "/",
      label: "Check Today's Result",
      heading: "Verify Against the Result",
      description: "Match the full ticket number, series, draw code and date with the published result.",
    },
    howTo: {
      name: "How to check whether a Kerala lottery ticket is fake",
      steps: [
        "Examine the printing quality, colours and spelling on the ticket.",
        "Check the ticket number for overwritten, uneven or missing digits.",
        "Look for scratches, ink marks, pasted numbers or replaced sections.",
        "Confirm the lottery name, draw number and draw date are consistent.",
        "Buy only from authorised agents and get official verification when in doubt.",
      ],
    },
    tableOfContents: [
      { id: "printing-quality", title: "1. Examine the Printing Quality" },
      { id: "ticket-number", title: "2. Check the Ticket Number" },
      { id: "alterations", title: "3. Look for Alterations" },
      { id: "draw-details", title: "4. Verify Lottery Name & Draw Details" },
      { id: "physical-condition", title: "5. Physical Condition of the Ticket" },
      { id: "unknown-sellers", title: "6. Unknown Sellers" },
      { id: "compare-genuine", title: "7. Compare with a Genuine Ticket" },
      { id: "winning-number", title: "8. A Winning Number Is Not Proof" },
      { id: "suspect-fake", title: "9. If You Suspect a Fake Ticket" },
      { id: "tips", title: "10. Tips to Avoid Fake Tickets" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "How can I identify a fake Kerala lottery ticket?",
        answer:
          "Check the printing quality, the ticket number for overwritten or uneven digits, signs of alteration such as scratches or pasted numbers, the lottery name, draw number and draw date, and the physical condition of the paper. If anything looks suspicious, ask an authorised Kerala State Lottery official to verify it.",
      },
      {
        question: "Is a ticket genuine if its number matches the winning result?",
        answer:
          "No. A counterfeit or altered ticket can carry a number that matches a published result. The ticket must belong to the correct draw, be the unaltered original and pass the official verification process.",
      },
      {
        question: "Does a damaged ticket mean it is fake?",
        answer:
          "Not necessarily. Genuine tickets can be damaged through normal handling. Damage is a reason for closer examination, not proof of counterfeiting.",
      },
      {
        question: "Where should I buy Kerala lottery tickets to avoid fakes?",
        answer:
          "Buy original printed tickets only from authorised lottery agents and sellers. Avoid unknown sellers, unusual discounts, guaranteed-win offers and any online or WhatsApp seller.",
      },
      {
        question: "What should I do if I bought a fake Kerala lottery ticket?",
        answer:
          "Do not alter the ticket or pay anyone to 'approve' it. Keep the ticket and purchase details, contact an authorised Kerala State Lottery official, and report the fraud to the authorities or the cybercrime helpline 1930.",
      },
    ],
  },
  {
    slug: "documents-required-to-claim-kerala-lottery-prize",
    coverImage: "/blog/documents-required-to-claim-kerala-lottery-prize.jpg",
    coverAlt: "Kerala Gramin Bank branch in Kanichar, Kerala, where lottery prize claim documents can be submitted",
    coverCredit: { author: "Vinayaraj", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Kerala_Gramin_Bank_Kanichar_branch.jpg" },
    title: "What Documents Are Required to Claim a Kerala Lottery Prize?",
    metaTitle: "Documents Required to Claim Kerala Lottery Prize (Checklist)",
    description:
      "Complete checklist of documents required to claim a Kerala lottery prize: original ticket, ID and address proof, PAN, bank proof, photographs and the claim form, plus submission steps and deadlines.",
    category: "Claim Guide",
    tags: [
      "Kerala Lottery Claim Documents",
      "Kerala Lottery Prize Claim",
      "District Lottery Officer",
      "Form V Kerala Lottery",
      "Kerala Lottery Results Today",
    ],
    publishedDate: "2026-11-15",
    updatedDate: "2026-11-15",
    readTime: "6 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    showRecentDraws: true,
    primaryCta: {
      href: "/surrender-kerala-lottery-winning-ticket-through-bank",
      label: "Submit Through a Bank",
      heading: "Documents Ready?",
      description: "Step-by-step guide to surrendering your winning ticket through an eligible bank.",
    },
    howTo: {
      name: "How to submit documents to claim a Kerala lottery prize",
      steps: [
        "Organise the original ticket, identification documents, bank details, photographs and claim form.",
        "Verify the ticket number, draw details, personal information and bank details.",
        "Visit the District Lottery Officer or the designated authority.",
        "Submit the original ticket and supporting documents.",
        "Obtain an acknowledgement and complete the verification process.",
      ],
    },
    tableOfContents: [
      { id: "original-ticket", title: "1. Original Winning Ticket" },
      { id: "identity-proof", title: "2. Identity Proof" },
      { id: "photographs", title: "3. Passport-Size Photographs" },
      { id: "pan-card", title: "4. PAN Card" },
      { id: "bank-details", title: "5. Bank Account Details" },
      { id: "claim-form", title: "6. Claim Application Form" },
      { id: "address-proof", title: "7. Address Proof" },
      { id: "self-attested", title: "8. Self-Attested Copies" },
      { id: "how-to-submit", title: "9. How to Submit Documents" },
      { id: "remember", title: "10. Things to Remember" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "What documents are required to claim a Kerala lottery prize?",
        answer:
          "Winners may need the original winning ticket, identity proof, PAN card, passport-size photographs, bank account details, address proof and a completed prize claim application form. Additional documents may be required depending on the prize amount and applicable rules.",
      },
      {
        question: "Where should I submit my Kerala lottery winning ticket?",
        answer:
          "Submit the ticket and documents to the authorised lottery office or designated authority for your prize category, or through an eligible bank. Contact the District Lottery Officer for guidance on the correct location.",
      },
      {
        question: "Is the original Kerala lottery ticket compulsory for claiming a prize?",
        answer:
          "Yes. The original winning ticket is essential for verification. A photocopy or photograph generally cannot replace it.",
      },
      {
        question: "Is a PAN card necessary to claim a Kerala lottery prize?",
        answer:
          "A PAN card may be required for identity verification and tax formalities, particularly for higher-value prizes. Check the latest requirements for your prize category.",
      },
      {
        question: "Do I need a bank passbook to claim a Kerala lottery prize?",
        answer:
          "Bank account proof may be required to verify your account and process payment. A passbook copy, account statement or cancelled cheque may be requested.",
      },
      {
        question: "How many photographs are required for a Kerala lottery prize claim?",
        answer:
          "It depends on the current claim application requirements. Keep recent passport-size photographs ready and confirm the quantity with the District Lottery Officer.",
      },
      {
        question: "What happens if my Kerala lottery ticket is damaged?",
        answer:
          "A damaged ticket may need additional examination. Do not repair or alter it; keep it safe and contact the Lottery Department for guidance.",
      },
      {
        question: "What is the time limit for claiming a Kerala lottery prize?",
        answer:
          "Under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024, the original winning ticket must generally be surrendered within 90 days from the draw date. Check the official instructions as soon as you find a winning ticket.",
      },
      {
        question: "Can someone else submit my Kerala lottery winning ticket?",
        answer:
          "Prize claims follow specific rules about claimants and authorised representatives. Confirm the permitted procedure with the Lottery Department before letting anyone else submit or receive the prize.",
      },
      {
        question: "Are photocopies of documents accepted for Kerala lottery prize claims?",
        answer:
          "Self-attested photocopies of supporting documents may be required along with the originals for verification, but the original winning ticket must always be presented.",
      },
    ],
  },
  {
    slug: "surrender-kerala-lottery-winning-ticket-through-bank",
    coverImage: "/blog/surrender-kerala-lottery-winning-ticket-through-bank.jpg",
    coverAlt: "South Indian Bank Neyyar Dam branch signboard in Thiruvananthapuram, Kerala",
    coverCredit: { author: "Sujithshivam511", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:South_Indian_Bank_and_ATM,_Neyyar_Dam_Branch,_kallikaud_,Tvm_kerala_India.jpg" },
    title: "How to Surrender a Kerala Lottery Winning Ticket Through Bank",
    metaTitle: "Surrender Kerala Lottery Winning Ticket Through Bank: Form V Guide",
    description:
      "How to surrender a Kerala lottery winning ticket through a bank: eligible banks, Form V, documents, bank authorisation, verification, payment and the 90-day deadline, with real deadlines for the latest draws.",
    category: "Claim Guide",
    tags: [
      "Surrender Kerala Lottery Ticket Bank",
      "Kerala Lottery Form V",
      "Kerala Lottery Claim Through Bank",
      "Kerala Lottery 90 Days Claim",
      "Kerala Lottery Results Today",
    ],
    publishedDate: "2026-11-12",
    updatedDate: "2026-11-12",
    readTime: "7 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    showRecentDraws: true,
    primaryCta: {
      href: "/documents-required-to-claim-kerala-lottery-prize",
      label: "See the Document Checklist",
      heading: "Preparing Form V?",
      description: "Every document you need before visiting the bank or lottery office.",
    },
    howTo: {
      name: "How to surrender a Kerala lottery winning ticket through a bank",
      steps: [
        "Verify the ticket number, series, lottery name and draw date against the official result.",
        "Choose an eligible bank branch and confirm it accepts lottery prize claims.",
        "Prepare the original ticket, PAN, Aadhaar, bank passbook copy and photograph.",
        "Complete Form V including the bank authorisation section.",
        "Write your name, address and signature on the reverse of the ticket.",
        "Submit everything at the bank within 90 days of the draw and keep the acknowledgement.",
      ],
    },
    tableOfContents: [
      { id: "verify-ticket", title: "1. Verify Your Winning Ticket" },
      { id: "eligible-bank", title: "2. Choose an Eligible Bank" },
      { id: "documents", title: "3. Collect the Documents" },
      { id: "form-v", title: "4. Complete Form V" },
      { id: "reverse-side", title: "5. Details on the Reverse Side" },
      { id: "submit-at-bank", title: "6. Submit the Ticket to the Bank" },
      { id: "verification", title: "7. Verification & Approval" },
      { id: "receive-money", title: "8. How You Receive the Prize Money" },
      { id: "deadline", title: "9. Submission Deadline" },
      { id: "safety", title: "10. Safety Tips" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "Can I submit a Kerala lottery winning ticket through a bank?",
        answer:
          "Yes. Eligible winning tickets can be submitted through nationalised banks, scheduled commercial banks, Kerala Bank and urban cooperative banks, following the prescribed procedure.",
      },
      {
        question: "What is the minimum prize amount for submitting Form V?",
        answer: "Form V is required for prize claims above ₹10,000. It is not required for prizes below ₹10,000 under the amended rules.",
      },
      {
        question: "What is Form V in Kerala lottery?",
        answer:
          "Form V is the official application for claiming Kerala lottery prizes above ₹10,000. It contains the winner's personal details, ticket information, bank account details and declaration.",
      },
      {
        question: "What is the deadline for submitting a Kerala lottery winning ticket?",
        answer:
          "The original winning ticket must generally be surrendered within 90 days from the draw date. Certain delayed claims of ₹1 lakh or more may be considered within a further 60 days at the Government's discretion.",
      },
      {
        question: "Can I submit my winning ticket through any bank?",
        answer:
          "No. The rules specify eligible bank categories, and not every branch accepts lottery prize claims. Confirm the procedure with the branch before visiting.",
      },
      {
        question: "How does the bank receive the prize money?",
        answer:
          "In Form V the winner authorises the Director of State Lotteries to pay the approved prize to the designated bank branch, which then pays the winner.",
      },
      {
        question: "What happens if my lottery ticket is damaged?",
        answer:
          "Damaged, torn or mutilated tickets may face additional scrutiny or rejection. If authenticity is doubtful, the authorities may require further verification and, in certain cases, an affidavit in Form VIII.",
      },
      {
        question: "Can two people claim one Kerala lottery prize together?",
        answer: "Yes. Joint claims are permitted. The winners must submit their individual claim documents and a notarised affidavit in Form VI.",
      },
      {
        question: "What happens if the winner lives outside Kerala?",
        answer:
          "A claimant whose Aadhaar address is outside Kerala may need to submit an affidavit in Form VII, sworn before and attested by a Notary, along with the original ticket and other documents.",
      },
    ],
  },
  {
    slug: "why-online-kerala-lottery-ticket-sales-are-illegal",
    coverImage: "/blog/why-online-kerala-lottery-ticket-sales-are-illegal.jpg",
    coverAlt: "Street lottery seller in Mattancherry, Fort Kochi, with printed Kerala lottery tickets laid out on a stand",
    coverCredit: { author: "SerChevalerie", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Lottery_seller_in_Mattancherry,_Fort_Kochi.jpg" },
    title: "Why Online Ticket Sales for Kerala Lotteries Are Strictly Illegal",
    metaTitle: "Is Buying Kerala Lottery Online Legal? Why Online Sales Are Illegal",
    description:
      "Kerala lottery tickets cannot be sold online, on WhatsApp or through apps under the 2024 amended rules. Learn the risks of online sellers, how tickets are officially sold, how to claim prizes and how to report fraud.",
    category: "Safety Guide",
    tags: [
      "Kerala Lottery Online",
      "Buy Kerala Lottery Online",
      "Kerala Lottery WhatsApp Scam",
      "Kerala Paper Lotteries Rules 2024",
      "Kerala Lottery Results Today",
    ],
    publishedDate: "2026-11-10",
    updatedDate: "2026-11-10",
    readTime: "7 min read",
    author: { name: FOUNDER.name, role: FOUNDER.role, avatar: FOUNDER.avatar },
    featured: false,
    showRecentDraws: true,
    primaryCta: {
      href: "/how-to-find-fake-kerala-lottery-tickets",
      label: "Spot a Fake Ticket",
      heading: "Got a Ticket Online?",
      description: "10 checks to find fake or altered Kerala lottery tickets before you trust them.",
    },
    tableOfContents: [
      { id: "why-prohibited", title: "1. Why Online Sales Are Prohibited" },
      { id: "department-stand", title: "2. What the Lottery Department Says" },
      { id: "risks", title: "3. Risks of Buying Online" },
      { id: "official-distribution", title: "4. Official Ticket Distribution" },
      { id: "fake-ads", title: "5. Fake Lottery Advertisements" },
      { id: "results-vs-buying", title: "6. Checking Results vs Buying Tickets" },
      { id: "claim-prize", title: "7. Claiming Prizes" },
      { id: "claim-documents", title: "8. Documents for Prize Claims" },
      { id: "report", title: "9. Reporting Unauthorised Sales" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "Is selling Kerala lottery tickets online illegal?",
        answer:
          "Kerala's 2024 amended lottery rules prohibit selling Kerala lottery tickets, their numbers or images through communication devices, computers and social media. Only original printed ticket sales through permitted channels are allowed.",
      },
      {
        question: "Can I purchase Kerala lottery tickets through WhatsApp?",
        answer: "No. WhatsApp is not an authorised channel. Buy original physical tickets from authorised agents and sellers.",
      },
      {
        question: "Can I check Kerala lottery results online?",
        answer: "Yes. Result information is available online, but checking results is different from buying tickets electronically.",
      },
      {
        question: "Are Kerala lottery tickets available through mobile applications?",
        answer:
          "The Kerala State Lotteries Department has not authorised anyone to sell its paper lottery tickets through mobile applications. Be cautious of apps claiming official online sales.",
      },
      {
        question: "Can I receive a Kerala lottery prize using a digital ticket image?",
        answer: "No. A digital image cannot replace the original physical winning ticket, which must be submitted for verification.",
      },
      {
        question: "What is the deadline for claiming a Kerala lottery prize?",
        answer:
          "The general deadline is 90 days from the draw date under the Kerala Paper Lotteries (Regulation) Amendment Rules, 2024. Limited provisions exist for certain delayed claims.",
      },
      {
        question: "What should I do if someone took money promising an online Kerala lottery ticket?",
        answer:
          "Stop further payments, save the transaction details and messages, and report the fraud on the National Cyber Crime Reporting Portal or helpline 1930.",
      },
    ],
  },
  {
    slug: "what-happens-if-you-lose-kerala-lottery-ticket",
    coverImage: "/blog/what-happens-if-you-lose-kerala-lottery-ticket.jpg",
    coverAlt: "Kerala lottery seller arranging printed lottery tickets on a roadside stand",
    coverCredit: { author: "Mail2arunjith", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Keralalottery_seller.jpg" },
    title: "What Happens If You Lose Your Kerala Lottery Ticket?",
    metaTitle: "Lost Kerala Lottery Ticket? Can You Still Claim the Prize",
    description:
      "Lost your Kerala lottery ticket? Learn whether you can claim a prize without the original ticket, if a photocopy or screenshot works, what to do right away, and how to protect your ticket.",
    category: "Claim Guide",
    tags: [
      "Lost Kerala Lottery Ticket",
      "Claim Prize Without Ticket",
      "Lottery Ticket Photocopy",
      "Kerala Lottery Prize Claim Rules",
      "Kerala Lottery Results Today",
    ],
    publishedDate: "2026-11-06",
    updatedDate: "2026-11-06",
    readTime: "5 min read",
    author: {
      name: FOUNDER.name,
      role: FOUNDER.role,
      avatar: FOUNDER.avatar,
    },
    featured: false,
    primaryCta: {
      href: "/how-to-claim-kerala-lottery-prize",
      label: "Read the Prize Claim Guide",
      heading: "Still Have Your Ticket?",
      description: "Documents, offices and the 30-day deadline for claiming a Kerala lottery prize.",
    },
    howTo: {
      name: "What to do if your Kerala lottery ticket is lost",
      steps: [
        "Search your wallet, bag, clothes, vehicle and other usual places carefully.",
        "Note the lottery name, draw number, series and ticket number from any photo or record you have.",
        "Visit or contact your nearest District Lottery Office and explain what happened.",
        "File a police complaint if you believe the ticket was stolen and keep a copy.",
        "Keep all photographs, messages and records that support your explanation.",
      ],
    },
    tableOfContents: [
      { id: "what-happens", title: "What Happens If You Lose Your Ticket?" },
      { id: "can-you-still-claim", title: "Lost Ticket: Can You Still Claim the Prize?" },
      { id: "what-to-do", title: "What to Do If Your Ticket Is Lost" },
      { id: "claim-without-ticket", title: "Can I Claim a Prize Without the Ticket?" },
      { id: "photocopy", title: "Can I Claim With a Photocopy?" },
      { id: "claim-rules", title: "Prize Claim Rules You Should Know" },
      { id: "protect-ticket", title: "How to Protect Your Original Ticket" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "Can I get a replacement for a lost Kerala lottery ticket?",
        answer:
          "There is no standard replacement process for a lost winning ticket under the published prize claim rules. The original ticket is required for claiming the prize.",
      },
      {
        question: "Can I claim a prize using a screenshot of my lottery ticket?",
        answer:
          "No. A screenshot may help you remember the ticket details, but it cannot replace the original physical ticket.",
      },
      {
        question: "What should I do if someone steals my winning ticket?",
        answer:
          "Report the theft to the police and contact the nearest District Lottery Office. Keep all available purchase details and evidence. A complaint does not guarantee prize payment.",
      },
      {
        question: "Is a photocopy enough to claim Kerala lottery prize money?",
        answer:
          "No. A photocopy is a supporting document. The original winning ticket must also be submitted.",
      },
      {
        question: "Can I claim my prize if the ticket is damaged?",
        answer:
          "Damaged, torn or mutilated tickets may face rejection. The applicable rules provide limited scope for certain torn tickets to be examined and accepted if their genuineness is established. Contact the lottery office before making a claim.",
      },
    ],
  },
  {
    slug: "pooja-bumper-lottery-2026",
    coverImage: "/blog/pooja-bumper-lottery-2026.jpg",
    coverAlt: "Kerala Thiruvonam Bumper BR-57 (2017) lottery ticket with a ₹10 crore first prize and ₹250 ticket price",
    coverCredit: { author: "Kottakkalnet", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Onam_bumper_2017_lottery.jpg" },
    title: "Pooja Bumper Lottery 2026 (BR-112): Ticket Price, Prize Structure, Draw Date & Result",
    metaTitle: "Pooja Bumper 2026 BR-112: ₹12 Crore Prize, ₹300 Ticket, Draw {{drawDateShort}}",
    description:
      "Kerala Pooja Bumper 2026 (BR-112) guide: ₹12 crore first prize, ₹300 ticket price, JA–JE series, full prize chart (₹39.11 crore total), draw date & time, how to check the result, tax and how to claim.",
    category: "Bumper Guide",
    tags: [
      "Pooja Bumper 2026",
      "Pooja Bumper BR-112",
      "Pooja Bumper Lottery Result",
      "Pooja Bumper Ticket Price",
      "Pooja Bumper Prize Structure",
      "Kerala Bumper Lottery",
      "Kerala Lottery Results Today",
    ],
    publishedDate: "2026-11-05",
    updatedDate: "2026-11-05",
    readTime: "7 min read",
    author: {
      name: FOUNDER.name,
      role: FOUNDER.role,
      avatar: FOUNDER.avatar,
    },
    featured: true,
    relatedLotteryCodes: ["PB"],
    drawLotteryCode: "PB",
    primaryCta: {
      href: "{{drawUrl}}",
      label: "Pooja Bumper {{drawDateShort}} Result",
      heading: "Pooja Bumper BR-112 Draw",
      description: "Live result on {{drawDate}} at {{drawTime}} IST. ₹12 Crore 1st prize.",
    },
    howTo: {
      name: "How to check the Pooja Bumper 2026 lottery result",
      steps: [
        "Open the Pooja Bumper BR-112 result page for {{drawDate}} on Kerala Lottery Results Today, or the official Kerala State Lotteries website.",
        "Select the Pooja Bumper 2026 draw.",
        "Open the official result list or Gazette PDF.",
        "Match your complete ticket number and series (JA, JB, JC, JD or JE).",
        "Confirm the prize category before starting a claim.",
      ],
    },
    tableOfContents: [
      { id: "quick-answer", title: "Quick Answer: Pooja Bumper 2026 at a Glance" },
      { id: "what-is-pooja-bumper", title: "What Is Kerala Pooja Bumper Lottery?" },
      { id: "ticket-price-prizes", title: "Ticket Price & Complete Prize Details" },
      { id: "check-results", title: "How to Check Pooja Bumper Results Online" },
      { id: "draw-date-time", title: "Draw Date, Time & Prize Structure" },
      { id: "buy-tickets", title: "How to Buy Pooja Bumper Tickets" },
      { id: "first-prize-tax", title: "First Prize Money & Tax Details" },
      { id: "claim-prize", title: "How to Claim Pooja Bumper Prize Money" },
      { id: "rules", title: "Rules and Regulations" },
      { id: "official-results", title: "Where to Check Official Results" },
      { id: "conclusion", title: "Conclusion" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "When is the Pooja Bumper 2026 draw?",
        answer:
          "The Kerala Pooja Bumper 2026 (BR-112) draw is scheduled for {{drawDate}} at {{drawTime}} IST in Thiruvananthapuram. The live result is published on the Pooja Bumper {{drawDate}} result page at Kerala Lottery Results Today. Always confirm the schedule with the official Kerala State Lotteries notification.",
      },
      {
        question: "What is the Pooja Bumper 2026 first prize and ticket price?",
        answer:
          "The Pooja Bumper 2026 (BR-112) first prize is ₹12 crore for one winner. The ticket price is ₹300, and tickets are issued in five series: JA, JB, JC, JD and JE. Total prize money announced is ₹39,11,20,000.",
      },
      {
        question: "How can I check my Pooja Bumper ticket number?",
        answer:
          "Open the Pooja Bumper 2026 result page or the official Kerala lottery website, download the result PDF and compare your complete ticket number and series. Do not rely on a partial number match.",
      },
      {
        question: "How much will the Pooja Bumper first prize winner actually receive?",
        answer:
          "Lottery winnings in India are taxed under Section 115BB of the Income Tax Act at 30% plus applicable surcharge and cess, with tax deducted at source. Agent commission is also deducted, so the take-home amount is significantly lower than ₹12 crore. Consult a tax professional for individual guidance.",
      },
      {
        question: "Can people from other states buy Kerala lottery tickets?",
        answer:
          "Kerala lottery sales and participation are governed by applicable state and central regulations. Buyers should check the current legal requirements before purchasing tickets.",
      },
      {
        question: "What documents are needed to claim a Pooja Bumper prize?",
        answer:
          "Generally, winners need the original signed ticket, completed claim form, identity proof, address proof, PAN card and bank details. Additional documents may be required depending on the prize category.",
      },
      {
        question: "Where can I find Pooja Bumper winning numbers?",
        answer:
          "Official winning numbers are published by the Kerala State Lotteries Department. Kerala Lottery Results Today also publishes the live Pooja Bumper 2026 result, full prize chart and Result PDF on its {{drawDate}} result page.",
      },
    ],
  },
  {
    slug: "how-to-claim-kerala-lottery-prize",
    coverImage: "/blog/how-to-claim-kerala-lottery-prize.jpg",
    coverAlt: "Canara Bank Perunthanni branch on a street in Thiruvananthapuram, Kerala",
    coverCredit: { author: "Manukrishnan80", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Canara_bank_Perunthanni_branch_(58106).jpg" },
    title: "How to Claim Kerala Lottery Prize: Complete Step-by-Step Guide",
    metaTitle: "How to Claim Kerala Lottery Prize: Complete Step-by-Step Guide",
    description:
      "How to claim a Kerala lottery prize safely: the step-by-step claim procedure, required documents, authorized claim offices, payment methods, deadlines, and anti-fraud tips.",
    category: "Claim Guide",
    tags: [
      "Kerala Lottery Claim",
      "Lottery Prize Money",
      "Claim Documents",
      "Kerala Lottery Results Today",
      "Lottery Office",
    ],
    publishedDate: "2026-11-02",
    updatedDate: "2026-11-02",
    readTime: "6 min read",
    author: {
      name: FOUNDER.name,
      role: FOUNDER.role,
      avatar: FOUNDER.avatar,
    },
    featured: false,
    tableOfContents: [
      { id: "what-to-do-after-winning", title: "What to Do After Winning" },
      { id: "how-to-claim-general", title: "How to Claim Kerala Lottery" },
      { id: "prize-claim-process", title: "Prize Claim Process" },
      { id: "claim-documents", title: "Essential Claim Documents" },
      { id: "claim-prize-money", title: "How to Claim Prize Money" },
      { id: "where-to-claim", title: "Where to Claim Kerala Lottery Prize" },
      { id: "claim-deadline", title: "Prize Claim Deadline (30 Days)" },
      { id: "claim-safely", title: "How to Claim Safely & Avoid Scams" },
      { id: "ticket-verification", title: "What Happens During Ticket Verification?" },
      { id: "prize-categories", title: "Procedure by Prize Categories" },
      { id: "final-checklist", title: "Final Checklist Before Claiming" },
      { id: "faqs", title: "Frequently Asked Questions" },
    ],
    faqs: [
      {
        question: "How can I claim a Kerala lottery prize?",
        answer:
          "To claim a prize, first verify the winning ticket against the official Kerala Lottery Gazette result notification. Keep the original ticket safe without folding or writing on it, prepare the required documents (identity proof, PAN, bank details, claim form), and submit the claim through the appropriate authorized channel based on the prize amount.",
      },
      {
        question: "What documents are needed to claim a Kerala lottery prize?",
        answer:
          "The required Kerala lottery claim documents include: 1) Original winning lottery ticket signed on both sides, 2) Valid government identity proof (Aadhaar, Voter ID, Passport, or Driving License), 3) PAN card copy, 4) Bank account passbook or cancelled cheque with IFSC details, 5) Passport-size photographs attested by a Gazetted Officer/Notary (for high-value prizes), and 6) Filled official claim application form.",
      },
      {
        question: "How to claim Kerala lottery prize money?",
        answer:
          "To claim Kerala lottery prize money, verify your ticket and submit your claim to the designated lottery office or authorized bank. After identity and physical ticket forensic verification, the prize amount is calculated minus applicable TDS (30% on amounts above ₹10,000) and transferred directly to your bank account via NEFT/RTGS.",
      },
      {
        question: "Where to claim Kerala lottery prize?",
        answer:
          "Where to claim depends on the prize amount: Prizes up to ₹5,000 can be claimed directly from any authorized lottery agency. Prizes between ₹5,000 and ₹1,00,000 can be claimed at District Lottery Offices or Sub-Treasuries. Prizes above ₹1 Lakh (including 1st Prize and Bumper Jackpots) must be submitted to the Directorate of Kerala State Lotteries at Vikas Bhavan, Thiruvananthapuram, or through nationalized/scheduled banks.",
      },
      {
        question: "What is the Kerala lottery prize claim deadline?",
        answer:
          "The official Kerala lottery prize claim deadline is 30 days from the date of the draw publication. Winning tickets submitted after this 30-day window require a formal delay condonation request with valid proof to the Director of State Lotteries, but winners are strongly advised to initiate claims immediately.",
      },
      {
        question: "Can I claim a prize without the original ticket?",
        answer:
          "No, the original physical winning ticket is mandatory to claim any Kerala lottery prize. Duplicate copies, photocopies, scans, or photos on smartphones are strictly not accepted. If the ticket is damaged or torn, it must be referred to the Directorate for forensic verification.",
      },
    ],
  },
];

export function getAllBlogs(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((b) => b.slug === slug);
}

export function getFeaturedBlog(): BlogPost | undefined {
  return BLOG_POSTS.find((b) => b.featured) ?? BLOG_POSTS[0];
}

export function getRecentBlogs(limit: number = 5): BlogPost[] {
  return BLOG_POSTS.slice(0, limit);
}

const DRAW_TOKEN = /\{\{(drawDate|drawDateShort|drawTime|drawUrl)\}\}/g;

/** Fills {{drawDate}}-style tokens in every string field of a post. */
export const resolveBlogPost = (post: BlogPost, draw: BlogDrawContext | null): BlogPost => {
  const values: Record<string, string> = {
    drawDate: draw?.dateLong ?? "the date announced by the Kerala State Lotteries Department",
    drawDateShort: draw?.dateShort ?? "TBA",
    drawTime: draw?.drawTime ?? "2:00 PM",
    drawUrl: draw?.url ?? "/lotteries",
  };
  const fill = (value: unknown): unknown => {
    if (typeof value === "string") return value.replace(DRAW_TOKEN, (_, key: string) => values[key] ?? "");
    if (Array.isArray(value)) return value.map(fill);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v)]));
    }
    return value;
  };
  return fill(post) as BlogPost;
};

/** Words too common across every guide to signal topical relatedness. */
const RELATED_STOPWORDS = new Set([
  "kerala", "lottery", "lotteries", "ticket", "tickets", "results", "today", "the", "a", "an", "to", "of", "on",
  "and", "for", "how", "what", "why", "is", "are", "you", "your", "it", "in", "with", "through",
]);

const topicWords = ({ title, tags }: BlogPost): Set<string> =>
  new Set(
    `${title} ${tags.join(" ")}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !RELATED_STOPWORDS.has(word)),
  );

/**
 * "More guides" for the bottom of a post: ranked by shared tags, category and topic words,
 * newest first on ties, so every post (including new ones) always gets `limit` suggestions.
 */
export const getRelatedBlogs = (slug: string, limit = 3): BlogPost[] => {
  const current = getBlogBySlug(slug);
  if (!current) return BLOG_POSTS.slice(0, limit);
  const currentTags = new Set(current.tags.map((tag) => tag.toLowerCase()));
  const currentWords = topicWords(current);

  return BLOG_POSTS.filter((post) => post.slug !== slug)
    .map((post, index) => {
      const sharedTags = post.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length;
      const sharedWords = [...topicWords(post)].filter((word) => currentWords.has(word)).length;
      const sameCategory = post.category === current.category ? 1 : 0;
      return { post, index, score: sharedTags * 3 + sameCategory * 2 + sharedWords };
    })
    .sort((a, b) => b.score - a.score || b.post.publishedDate.localeCompare(a.post.publishedDate) || a.index - b.index)
    .slice(0, limit)
    .map(({ post }) => post);
};

/** Blog guides that should be cross-linked from a lottery's draw pages. */
export const getBlogsForLottery = (lotteryCode: string): BlogPost[] =>
  BLOG_POSTS.filter((b) => b.relatedLotteryCodes?.includes(lotteryCode) ?? false);
