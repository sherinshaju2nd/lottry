"use client";

import { usePathname } from "next/navigation";
import { HomeSkeleton } from "@/components/skeletons/PageSkeletons";
import { LegalDocumentSkeleton } from "@/components/skeletons/InfoPageSkeletons";

/**
 * Root loading UI. Every page with its own layout has its own loading.tsx (about, contact, faq,
 * guide, claim, privacy-policy, terms-conditions, disclaimer, support, kerala-lottery-app, search,
 * blog, blog/[slug], news/[slug], lotteries, analytics, [code], [code]/[date], admin).
 * This file therefore only serves "/" (homepage skeleton) and any future page (document skeleton).
 */
export default function Loading() {
  const pathname = usePathname();
  return pathname === "/" ? <HomeSkeleton /> : <LegalDocumentSkeleton />;
}
