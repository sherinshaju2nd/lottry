import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ALL_LOTTERIES,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getDrawResultFromSupabase,
  getDrawDatesFromSupabase,
  checkIsDatePostponed,
  getRecentDrawsFromSupabase,
  getLotteryLogo,
  getLotteryLogoAlt,
  supabase,
} from "@/lib/supabase";
import DedicatedLotteryDateClient from "./DedicatedLotteryDateClient";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{ code: string; date: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const dateParam = decodeURIComponent(resolvedParams.date);
  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  if (!lotteryInfo) {
    return { title: "Lottery Result Not Found - Kerala Lottery Results Today" };
  }

  const { data: dbMeta } = await supabase
    .from("lotteries")
    .select("jackpot, ticket_price, draw_time")
    .eq("code", lotteryCode)
    .maybeSingle();

  const jackpot =
    dbMeta?.jackpot?.trim() ||
    lotteryInfo.jackpot ||
    (lotteryInfo.is_bumper ? "₹25 Crore" : "₹1 Crore");
  const ticketPrice =
    dbMeta?.ticket_price?.trim() ||
    lotteryInfo.ticket_price ||
    (lotteryInfo.is_bumper ? "₹500" : "₹50");
  const logoUrl = getLotteryLogo(lotteryCode) || "/logo-round-512.png";
  const title = `${lotteryInfo.name} (${lotteryInfo.code}) Result ${dateParam} - 1st Prize ${jackpot} Kerala ${lotteryInfo.is_bumper ? "Bumper " : ""}Live Draw`;
  const description = `Check Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) lottery result for ${dateParam}. Live 1st prize ${jackpot} winning numbers, ticket price ${ticketPrice}, full prize chart, search ticket tool, and official Gazette PDF download.`;

  const isBumper = Boolean(lotteryInfo.is_bumper || lotteryCode.startsWith("Bumper"));
  const drawTimeLabel = isBumper ? "2pm" : "3pm";

  const keywords = [
    // 1. Core Brand & Date Queries
    `${lotteryInfo.name} result ${dateParam}`,
    `${lotteryInfo.name} lottery result today`,
    `Kerala lottery result ${dateParam}`,
    `Kerala lottery ${drawTimeLabel} result ${dateParam}`,
    `Kerala lottery result today live`,
    `${lotteryInfo.code} lottery result ${dateParam}`,

    // 2. High-Intent Winning Numbers & Prize Queries
    `${lotteryInfo.name} winning numbers`,
    `${lotteryInfo.name} 1st prize ${jackpot}`,
    `${lotteryInfo.name} prize chart`,
    `Kerala lottery ticket search ${dateParam}`,
    `Verify kerala lottery ticket online`,

    // 3. Official Gazette & Verification Queries
    `Kerala government gazette lottery result ${dateParam}`,
    `${lotteryInfo.name.toLowerCase()} gazette pdf download`,
    `Official kerala lottery result pdf ${dateParam}`,
    `statelottery.kerala.gov.in result`,

    // 4. Malayalam Search Queries (High Volume in Kerala)
    `${lotteryInfo.nameMl} ഫലം ${dateParam}`,
    `കേരള ലോട്ടറി റിസൾട്ട് ഇന്ന്`,
    `${lotteryInfo.nameMl} ലോട്ടറി നറുക്കെടുപ്പ്`,
    `${lotteryInfo.nameMl} ഇന്നത്തെ റിസൾട്ട്`,

    // 5. Bumper-Specific Queries
    ...(isBumper
      ? [
          `${lotteryInfo.name} live draw`,
          `Kerala bumper lottery result ${dateParam}`,
          `Kerala bumper winning numbers`,
          `${lotteryInfo.name} prize structure`,
          `${lotteryInfo.name} ticket price ${ticketPrice}`,
          `Kerala state bumper draw 2pm`,
        ]
      : [
          `Weekly kerala lottery ${lotteryInfo.name}`,
          `${lotteryInfo.name} live draw 3pm`,
        ]),
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://www.keralalotteryresultstoday.in/${lotterySlug}/${dateParam}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.keralalotteryresultstoday.in/${lotterySlug}/${dateParam}`,
      siteName: "Kerala Lottery Results Today",
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 800,
          alt: getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day),
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function DedicatedLotteryDateDetailsPage({
  params,
}: PageProps) {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const dateParam = decodeURIComponent(resolvedParams.date);

  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  if (!lotteryInfo) {
    notFound();
  }

  const [drawResult, availableDates, postponement, recentOtherDraws, lotRes] =
    await Promise.all([
      getDrawResultFromSupabase(lotteryCode, dateParam),
      getDrawDatesFromSupabase(lotteryCode),
      checkIsDatePostponed(dateParam, lotteryCode),
      getRecentDrawsFromSupabase(10),
      supabase
        .from("lotteries")
        .select("*")
        .eq("code", lotteryCode)
        .maybeSingle(),
    ]);

  const lotteryDbMeta = lotRes.data || null;

  const now = new Date();
  const todayISTDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);

  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const drawUrl = `${baseUrl}/${lotterySlug}/${dateParam}`;
  const firstPrizeTicket = drawResult?.first?.ticket
    ? ` - 1st Prize ${drawResult.first.ticket}`
    : "";

  const jackpotAmount =
    lotteryDbMeta?.jackpot?.trim() ||
    (drawResult?.prizes?.amounts?.["1st"]
      ? `₹${drawResult.prizes.amounts["1st"]}`
      : undefined) ||
    lotteryInfo.jackpot ||
    (lotteryInfo.is_bumper ? "₹25 Crore" : "₹1 Crore");

  const dbTicketPrice =
    lotteryDbMeta?.ticket_price?.trim() ||
    lotteryInfo.ticket_price ||
    (lotteryInfo.is_bumper ? "₹500" : "₹50");

  const numericPrice =
    dbTicketPrice.replace(/[^0-9.]/g, "") ||
    (lotteryInfo.is_bumper ? "500" : "50");
  const drawTime =
    lotteryDbMeta?.draw_time ||
    (lotteryInfo.code.startsWith("Bumper") ? "2:00 PM" : "3:00 PM");
  const drawTimeISO = lotteryInfo.code.startsWith("Bumper")
    ? "14:00:00+05:30"
    : "15:00:00+05:30";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${lotteryInfo.name} Lottery`,
        item: `${baseUrl}/${lotterySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${dateParam} Results`,
        item: drawUrl,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `Kerala Lottery ${lotteryInfo.name} (${drawResult?.draw_code || lotteryInfo.code}) Result ${dateParam}${firstPrizeTicket}`,
    datePublished: drawResult?.created_at || `${dateParam}T${drawTimeISO}`,
    dateModified: drawResult?.created_at || new Date().toISOString(),
    mainEntityOfPage: drawUrl,
    author: {
      "@type": "Organization",
      name: "Kerala Lottery Results Team",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Kerala Lottery Result Today",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo-master-1024.png`,
      },
    },
    description: `Official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) draw result for ${dateParam}. Check 1st prize ${jackpotAmount}, winning tickets, and prize chart.`,
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Kerala State ${lotteryInfo.name} (${lotteryInfo.code}) Lottery Draw ${dateParam}`,
    startDate: `${dateParam}T${drawTimeISO}`,
    endDate: `${dateParam}T17:00:00+05:30`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Gorky Bhavan",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Near Bakery Junction",
        addressLocality: "Thiruvananthapuram",
        addressRegion: "Kerala",
        postalCode: "695014",
        addressCountry: "IN",
      },
    },
    image: `${baseUrl}${getLotteryLogo(lotteryCode) || "/logo-round-512.png"}`,
    description: `Official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) lottery draw scheduled on ${dateParam} at ${drawTime}. First prize jackpot is ${jackpotAmount}.`,
    offers: {
      "@type": "Offer",
      price: numericPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStoreOnly",
      url: drawUrl,
    },
    organizer: {
      "@type": "Organization",
      name: "Directorate of Kerala State Lotteries",
      url: baseUrl,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When will Kerala ${lotteryInfo.name} draw result for ${dateParam} be announced?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The official live draw for Kerala ${lotteryInfo.name} on ${dateParam} commences at ${drawTime} at Gorky Bhavan, Thiruvananthapuram. The 1st prize winning ticket is published live around ${lotteryInfo.is_bumper ? "2:30 PM" : "3:10 PM"}, followed by the full prize chart and official Gazette PDF.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the first prize jackpot for Kerala ${lotteryInfo.name} on ${dateParam}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The 1st prize jackpot for the Kerala State ${lotteryInfo.name} draw is ${jackpotAmount}. In addition, there are consolation prizes, 2nd, 3rd, and up to 9th prize tiers.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the ticket price for Kerala ${lotteryInfo.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The official ticket price for ${lotteryInfo.name} is ${dbTicketPrice} (including GST) per ticket, available across authorized Kerala lottery agents and retail counters.`,
        },
      },
      {
        "@type": "Question",
        name: `How can I check my Kerala ${lotteryInfo.name} ticket number online?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can use the instant ticket search tool on this page to enter your 4-digit or 6-digit ticket number to check if you have won any prize in the ${dateParam} draw.`,
        },
      },
      {
        "@type": "Question",
        name: `How to claim Kerala lottery prize money?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Winning tickets up to ₹1,00,000 can be claimed from District Lottery Offices. Prizes above ₹1,00,000 must be submitted to the Directorate of State Lotteries or Nationalized Banks with original ticket, valid ID proofs (Aadhaar, PAN), and passport-size photos within 30 days of the draw.`,
        },
      },
    ],
  };

  const structuredSchemas = drawResult
    ? [breadcrumbSchema, articleSchema, faqSchema]
    : [breadcrumbSchema, eventSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredSchemas),
        }}
      />
      <DedicatedLotteryDateClient
        lotteryInfo={lotteryInfo}
        lotteryCode={lotteryCode}
        lotterySlug={lotterySlug}
        dateParam={dateParam}
        initialDrawResult={drawResult}
        initialAvailableDates={availableDates}
        initialPostponement={postponement}
        recentOtherDraws={recentOtherDraws}
        serverTodayDate={todayISTDate}
        initialLotteryMeta={lotteryDbMeta}
      />
    </>
  );
}
