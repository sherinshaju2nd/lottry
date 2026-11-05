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
  /** Key entity page this article is about (emitted as schema.org `about`). */
  aboutUrl?: string;
}

export const SITE_URL = "https://www.keralalotteryresultstoday.in";
export const POOJA_BUMPER_2026_DRAW_PATH = "/pooja-bumper/2026-11-28";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "pooja-bumper-lottery-2026",
    title: "Pooja Bumper Lottery 2026 (BR-112): Ticket Price, Prize Structure, Draw Date & Result",
    metaTitle: "Pooja Bumper 2026 BR-112: ₹12 Crore Prize, ₹300 Ticket, Draw 28 Nov",
    description:
      "Kerala Pooja Bumper 2026 (BR-112) guide: ₹12 crore first prize, ₹300 ticket price, JA–JE series, full prize chart (₹39.11 crore total), draw date 28 November 2026, how to check the result, tax and how to claim.",
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
      name: "Kerala Lottery Editorial Team",
      role: "Official Results & Verification Analyst",
      avatar: "/logo-round-192.png",
    },
    featured: true,
    relatedLotteryCodes: ["PB"],
    aboutUrl: `${SITE_URL}${POOJA_BUMPER_2026_DRAW_PATH}`,
    primaryCta: {
      href: POOJA_BUMPER_2026_DRAW_PATH,
      label: "Pooja Bumper 28 Nov Result",
      heading: "Next Draw: Pooja Bumper BR-112",
      description: "Live result on 28 November 2026 at 2:00 PM IST. ₹12 Crore 1st prize.",
    },
    howTo: {
      name: "How to check the Pooja Bumper 2026 lottery result",
      steps: [
        "Open the Pooja Bumper BR-112 result page for 28 November 2026 on Kerala Lottery Results Today, or the official Kerala State Lotteries website.",
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
          "The Kerala Pooja Bumper 2026 (BR-112) draw is scheduled for 28 November 2026 at 2:00 PM IST in Thiruvananthapuram. The live result is published on the Pooja Bumper 28 November 2026 result page at Kerala Lottery Results Today. Always confirm the schedule with the official Kerala State Lotteries notification.",
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
          "Official winning numbers are published by the Kerala State Lotteries Department. Kerala Lottery Results Today also publishes the live Pooja Bumper 2026 result, full prize chart and Gazette PDF on its 28 November 2026 result page.",
      },
    ],
  },
  {
    slug: "how-to-claim-kerala-lottery-prize",
    title: "How to Claim Kerala Lottery Prize: Complete Step-by-Step Guide",
    metaTitle: "How to Claim Kerala Lottery Prize: Complete Step-by-Step Guide",
    description:
      "Official guide on how to claim Kerala lottery prize safely: step-by-step claim procedure, required documents, authorized claim offices, payment methods, deadlines, and anti-fraud tips.",
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
      name: "Kerala Lottery Editorial Team",
      role: "Official Results & Verification Analyst",
      avatar: "/logo-round-192.png",
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

/** Blog guides that should be cross-linked from a lottery's draw pages. */
export const getBlogsForLottery = (lotteryCode: string): BlogPost[] =>
  BLOG_POSTS.filter((b) => b.relatedLotteryCodes?.includes(lotteryCode) ?? false);
