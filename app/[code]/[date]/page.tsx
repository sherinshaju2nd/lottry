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

  return (
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
  );
}
