import type { Metadata } from "next";
import { ALL_LOTTERIES, getLotteryCodeFromSlug, getLotterySlug } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const slug = getLotterySlug(lotteryCode);
  const lottery = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  const lotteryName = lottery ? lottery.name : rawCode;
  const title = `${lotteryName} Result Archives & Info`;
  const description = `Check ${lotteryName} Kerala lottery results, historical archives, draw schedule, and winning prize lists fast and accurately.`;
  const url = `https://www.keralalotteryresultstoday.in/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Kerala Lottery Result Today",
      images: [
        {
          url: "/website-banner-1600x500.png",
          width: 1600,
          height: 500,
          alt: `${lotteryName} Result Banner`,
        },
        {
          url: "/og-image.png",
          width: 1024,
          height: 1024,
          alt: "Kerala Lottery Result Today Logo",
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/website-banner-1600x500.png"],
    },
  };
}

export default function LotteryCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
