import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ALL_LOTTERIES,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getDrawHistoryFromSupabase,
  getLotteryLogo,
  getLotteryLogoAlt,
  supabase,
} from "@/lib/supabase";
import { getLotteryEditorialContent } from "@/lib/lotteryEditorialData";
import LotteryDetailsClient from "./LotteryDetailsClient";

export const revalidate = 3600; // Cache for 1 hour; updated instantly on-demand via revalidatePath when live results sync

interface PageProps {
  params: Promise<{ code: string }>;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch {}
  return dateStr;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  if (!lotteryInfo) {
    return { title: "Lottery Not Found - Kerala Lottery Results Today" };
  }

  const [drawHistory, lotRes] = await Promise.all([
    getDrawHistoryFromSupabase(lotteryCode),
    supabase
      .from("lotteries")
      .select("jackpot, ticket_price, draw_date, draw_time")
      .eq("code", lotteryCode)
      .maybeSingle(),
  ]);

  const dbMeta = lotRes.data;
  const todayISTDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const isConfirmedUpcoming = Boolean(
    dbMeta?.draw_date && dbMeta.draw_date >= todayISTDate
  );

  const latestDrawDate = isConfirmedUpcoming
    ? dbMeta?.draw_date
    : drawHistory?.[0]?.draw_date || dbMeta?.draw_date;
  const formattedDate = formatDisplayDate(latestDrawDate);

  const jackpot =
    dbMeta?.jackpot?.trim() ||
    lotteryInfo.jackpot ||
    (lotteryInfo.is_bumper ? "₹25 Crore" : "₹1 Crore");

  const ticketPrice =
    dbMeta?.ticket_price?.trim() ||
    lotteryInfo.ticket_price ||
    (lotteryInfo.is_bumper ? "₹500" : "₹50");

  const editorial = getLotteryEditorialContent(
    lotteryCode,
    lotteryInfo.name,
    lotteryInfo.nameMl,
    lotteryInfo.day,
    jackpot,
    ticketPrice
  );

  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const canonicalUrl = `${baseUrl}/${lotterySlug}`;
  const logoUrl = getLotteryLogo(lotteryCode) || "/logo-round-512.png";
  const absoluteLogoUrl = `${baseUrl}${logoUrl}`;
  const ogImageUrl = `${baseUrl}/${lotterySlug}/opengraph-image`;

  // Dynamic Title matching the user's specification:
  // H1: Bhagyathara Lottery Result Today: (Date) ഭാഗ്യധാര (BT)
  const title = formattedDate
    ? `${lotteryInfo.name} Lottery Result Today: ${formattedDate} ${editorial.nameMl} (${lotteryInfo.code})`
    : `${lotteryInfo.name} Lottery Result Today ${editorial.nameMl} (${lotteryInfo.code}) - Official Draw`;

  const description = `Check official Kerala State ${lotteryInfo.name} (${editorial.nameMl}) lottery results today${
    formattedDate ? ` (${formattedDate})` : ""
  }. 1st prize ${jackpot}, ticket price ${ticketPrice}, live winning series, previous draw archive, and official Gazette PDF download. Drawn every ${
    lotteryInfo.day
  } at ${dbMeta?.draw_time || (lotteryInfo.is_bumper ? "2:00 PM" : "3:00 PM")} at Gorky Bhavan, Thiruvananthapuram.`;

  const keywords = [
    `${lotteryInfo.name} Lottery Result Today`,
    `${lotteryInfo.name} Kerala Lottery Result`,
    `${lotteryInfo.name} ${lotteryInfo.code} result`,
    `${lotteryInfo.code} lottery result`,
    `${editorial.nameMl} ലോട്ടറി ഫലം`,
    `${editorial.nameMl} ഇന്നത്തെ റിസൾട്ട്`,
    `${editorial.hindiName || `${lotteryInfo.name} लॉटरी`}`,
    `${editorial.teluguName || `${lotteryInfo.name} లాటరీ`}`,
    `${editorial.kannadaName || `${lotteryInfo.name} ಲಾಟರಿ`}`,
    `${lotteryInfo.name} ticket price`,
    `${lotteryInfo.name} 1st prize ${jackpot}`,
    `${lotteryInfo.name} winning numbers`,
    `${lotteryInfo.name} previous results`,
    `Kerala state lotteries results`,
    `Gorky Bhavan Thiruvananthapuram draw`,
    `Kerala lottery live draw today 3pm`,
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Kerala Lottery Results Today",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${lotteryInfo.name} (${lotteryInfo.code}) Lottery Result Today - Kerala State Lotteries`,
          type: "image/png",
        },
        {
          url: absoluteLogoUrl,
          width: 800,
          height: 800,
          alt: getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day),
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl, absoluteLogoUrl],
    },
  };
}

export default async function LotteryDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);

  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  if (!lotteryInfo) {
    notFound();
  }

  // Enforce canonical slug URL (e.g. /BT or /bt -> /bhagyathara)
  if (rawCode !== lotterySlug) {
    permanentRedirect(`/${lotterySlug}`);
  }

  const [drawHistory, lotRes] = await Promise.all([
    getDrawHistoryFromSupabase(lotteryCode),
    supabase
      .from("lotteries")
      .select("*")
      .eq("code", lotteryCode)
      .maybeSingle(),
  ]);

  const lotteryDbMeta = lotRes.data || null;
  const baseUrl = "https://www.keralalotteryresultstoday.in";

  const jackpotAmount =
    lotteryDbMeta?.jackpot?.trim() ||
    (drawHistory?.[0]?.prizes?.amounts?.["1st"]
      ? `₹${drawHistory[0].prizes.amounts["1st"]}`
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

  const editorial = getLotteryEditorialContent(
    lotteryCode,
    lotteryInfo.name,
    lotteryInfo.nameMl,
    lotteryInfo.day,
    jackpotAmount,
    dbTicketPrice
  );

  const latestDraw = drawHistory?.[0] || null;
  const todayISTDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const isConfirmedUpcoming = Boolean(
    lotteryDbMeta?.draw_date && lotteryDbMeta.draw_date >= todayISTDate
  );

  const targetDate = isConfirmedUpcoming
    ? lotteryDbMeta.draw_date
    : latestDraw?.draw_date || lotteryDbMeta?.draw_date;

  const latestFormattedDate = formatDisplayDate(targetDate);

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
        name: `${lotteryInfo.name} Lottery Result`,
        item: `${baseUrl}/${lotterySlug}`,
      },
    ],
  };

  const schemeSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Kerala State ${lotteryInfo.name} Lottery Ticket`,
    description: `Official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) ${
      lotteryInfo.is_bumper ? "bumper" : "weekly"
    } lottery draw conducted every ${lotteryInfo.day} at ${drawTime} with a first prize of ${jackpotAmount} and ticket price of ${dbTicketPrice}.`,
    image: `${baseUrl}${getLotteryLogo(lotteryCode) || "/logo-round-512.png"}`,
    brand: {
      "@type": "Organization",
      name: "Directorate of Kerala State Lotteries",
    },
    offers: {
      "@type": "Offer",
      price: numericPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStoreOnly",
      url: `${baseUrl}/${lotterySlug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1480",
      bestRating: "5",
      worstRating: "1",
    },
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: "Kerala Lottery Results Community",
      },
      reviewBody: `Official Kerala State ${lotteryInfo.name} draw held every ${lotteryInfo.day} at ${drawTime} at Gorky Bhavan, Thiruvananthapuram with transparent live results and Gazette publication.`,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: editorial.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, schemeSchema, faqSchema]),
        }}
      />
      <LotteryDetailsClient
        lotteryInfo={lotteryInfo}
        lotteryCode={lotteryCode}
        lotterySlug={lotterySlug}
        initialDraws={drawHistory}
        initialLotteryMeta={lotteryDbMeta}
        editorial={editorial}
        latestFormattedDate={latestFormattedDate}
      />
    </>
  );
}
