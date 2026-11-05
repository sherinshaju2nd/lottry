import type { ReactNode } from "react";
import type { BlogDrawContext } from "@/data/blogs";
import ClaimPrizeGuideContent from "./ClaimPrizeGuideContent";
import PoojaBumper2026GuideContent from "./PoojaBumper2026GuideContent";

/** Maps a blog slug (from data/blogs.ts) to its article body. */
const BLOG_CONTENT: Record<string, (draw: BlogDrawContext | null) => ReactNode> = {
  "how-to-claim-kerala-lottery-prize": () => <ClaimPrizeGuideContent />,
  "pooja-bumper-lottery-2026": (draw) => <PoojaBumper2026GuideContent draw={draw} />,
};

export const renderBlogContent = (slug: string, draw: BlogDrawContext | null = null): ReactNode => {
  const render = BLOG_CONTENT[slug];
  if (!render) {
    console.error(`[blog] No article body registered for slug "${slug}"`);
    return null;
  }
  return render(draw);
};
