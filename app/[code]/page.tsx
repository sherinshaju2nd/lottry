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

  const logoUrl = getLotteryLogo(lotteryCode) || "/logo-round-512.png";
  const title = `${lotteryInfo.name} (${lotteryInfo.code}) Lottery Result Today - Kerala State Draw Results`;
  const description = `Check official Kerala State ${lotteryInfo.name} (${lotteryInfo.nameMl}) lottery results today, 1st prize winning ticket, live prize breakdown, and previous draw results. Drawn every ${lotteryInfo.day} at 3:00 PM.`;

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

  return (
    <LotteryDetailsClient
      lotteryInfo={lotteryInfo}
      lotteryCode={lotteryCode}
      lotterySlug={lotterySlug}
      initialDraws={drawHistory}
      initialLotteryMeta={lotteryDbMeta}
    />
  );
}
