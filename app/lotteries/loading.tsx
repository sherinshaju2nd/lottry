"use client";

import { LotteriesSkeleton } from "@/components/skeletons/PageSkeletons";

/** Lottery list (rendered inside the /lotteries server layout's heading and schedule). */
export default function Loading() {
  return <LotteriesSkeleton />;
}
