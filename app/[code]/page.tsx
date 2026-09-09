import { notFound } from "next/navigation";
import {
  ALL_LOTTERIES,
  getLotteryCodeFromSlug,
  getLotterySlug,
  getDrawHistoryFromSupabase,
  supabase,
} from "@/lib/supabase";
import LotteryDetailsClient from "./LotteryDetailsClient";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{ code: string }>;
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
