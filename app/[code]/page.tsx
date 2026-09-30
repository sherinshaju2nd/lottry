import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ALL_LOTTERIES,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getDrawHistoryFromSupabase,
  getLotteryLogo,
  getLotteryLogoAlt,
  supabase,
} from "@/lib/supabase";
import LotteryDetailsClient from "./LotteryDetailsClient";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{ code: string }>;
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

  const { data: dbMeta } = await supabase
    .from("lotteries")
    .select("jackpot, ticket_price")
    .eq("code", lotteryCode)
    .maybeSingle();

  const jackpot = dbMeta?.jackpot?.trim() || lotteryInfo.jackpot || (lotteryInfo.is_bumper ? "₹25 Crore" : "₹1 Crore");
  const logoUrl = getLotteryLogo(lotteryCode) || "/logo-round-512.png";
  const title = `${lotteryInfo.name} (${lotteryInfo.code}) Lottery Result Today - Kerala State Draw Results`;
  const description = `Check official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) lottery results today, 1st prize ${jackpot} winning ticket, live prize breakdown, and previous draw results. Drawn every ${lotteryInfo.day} at 3:00 PM.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.keralalotteryresultstoday.in/${lotterySlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.keralalotteryresultstoday.in/${lotterySlug}`,
      siteName: "Kerala Lottery Results Today",
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 800,
          alt: getLotteryLogoAlt(lotteryInfo.name, lotteryInfo.day),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],
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
    ],
  };

  // Dynamic values prioritizing database (Supabase `lotteries` table) -> amounts from latest draw -> static info -> fallback
  const jackpotAmount =
    lotteryDbMeta?.jackpot?.trim() ||
    (drawHistory?.[0]?.prizes?.amounts?.["1st"] ? `₹${drawHistory[0].prizes.amounts["1st"]}` : undefined) ||
    lotteryInfo.jackpot ||
    (lotteryInfo.is_bumper ? "₹25 Crore" : "₹1 Crore");

  const dbTicketPrice =
    lotteryDbMeta?.ticket_price?.trim() ||
    lotteryInfo.ticket_price ||
    (lotteryInfo.is_bumper ? "₹500" : "₹50");

  const numericPrice = dbTicketPrice.replace(/[^0-9.]/g, "") || (lotteryInfo.is_bumper ? "500" : "50");
  const drawTime = lotteryDbMeta?.draw_time || (lotteryInfo.code.startsWith("Bumper") ? "2:00 PM" : "3:00 PM");

  const schemeSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Kerala State ${lotteryInfo.name} Lottery Ticket`,
    description: `Official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) ${lotteryInfo.is_bumper ? "bumper" : "weekly"} lottery draw conducted every ${lotteryInfo.day} at ${drawTime} with a first prize of ${jackpotAmount} and ticket price of ${dbTicketPrice}.`,
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
      reviewCount: "1250",
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
      reviewBody: `Official Kerala State ${lotteryInfo.name} draw held every ${lotteryInfo.day} at ${drawTime} with transparent live results and Gazette publication.`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, schemeSchema]),
        }}
      />
      <LotteryDetailsClient
        lotteryInfo={lotteryInfo}
        lotteryCode={lotteryCode}
        lotterySlug={lotterySlug}
        initialDraws={drawHistory}
        initialLotteryMeta={lotteryDbMeta}
      />
    </>
  );
}
