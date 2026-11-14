"use client";

import { PostDetailSkeleton } from "@/components/skeletons/PageSkeletons";

/** Guide page (served at /{slug}): article header, contents sidebar and body. */
export default function Loading() {
  return <PostDetailSkeleton />;
}
