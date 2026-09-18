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
} from "@/lib/supabase";
import DedicatedLotteryDateClient from "./DedicatedLotteryDateClient";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{ code: string; date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const dateParam = decodeURIComponent(resolvedParams.date);
  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  if (!lotteryInfo) {
    return { title: "Lottery Result Not Found - Kerala Lottery Results Today" };
  }

  const logoUrl = getLotteryLogo(lotteryCode) || "/logo-round-512.png";
  const title = `${lotteryInfo.name} (${lotteryInfo.code}) Result ${dateParam} - Kerala State Official Winning Numbers`;
  const description = `Live Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) lottery result for ${dateParam}. Check 1st prize winning ticket, 2nd-9th prize numbers, official PDF gazette, and search ticket tool.`;

  return {
    title,
    description,
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

export default async function DedicatedLotteryDateDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotterySlug = getLotterySlug(lotteryCode);
  const dateParam = decodeURIComponent(resolvedParams.date);

  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  if (!lotteryInfo) {
    notFound();
  }

  const [drawResult, availableDates, postponement, recentOtherDraws] = await Promise.all([
    getDrawResultFromSupabase(lotteryCode, dateParam),
    getDrawDatesFromSupabase(lotteryCode),
    checkIsDatePostponed(dateParam, lotteryCode),
    getRecentDrawsFromSupabase(10),
  ]);

  const now = new Date();
  const todayISTDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);

  const baseUrl = "https://www.keralalotteryresultstoday.in";
  const drawUrl = `${baseUrl}/${lotterySlug}/${dateParam}`;
  const firstPrizeTicket = drawResult?.first?.ticket ? ` - 1st Prize ${drawResult.first.ticket}` : "";

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
    datePublished: drawResult?.created_at || `${dateParam}T15:00:00+05:30`,
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
    description: `Official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) draw result held on ${dateParam}. Check winning tickets and prize chart.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema]),
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
      />
    </>
  );
}
