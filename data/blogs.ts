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
}

export const BLOG_POSTS: BlogPost[] = [
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
    featured: true,
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
  return BLOG_POSTS.find((b) => b.featured) || BLOG_POSTS[0];
}

export function getRecentBlogs(limit: number = 5): BlogPost[] {
  return BLOG_POSTS.slice(0, limit);
}
