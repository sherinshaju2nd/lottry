import { notFound } from "next/navigation";
import {
  ALL_LOTTERIES,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getDrawResultFromSupabase,
  getDrawDatesFromSupabase,
  checkIsDatePostponed,
  getRecentDrawsFromSupabase,
} from "@/lib/supabase";
import DedicatedLotteryDateClient from "./DedicatedLotteryDateClient";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{ code: string; date: string }>;
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
    />
  );
}
