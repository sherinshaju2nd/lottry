import type { Metadata } from "next";
import { ALL_LOTTERIES, getLotteryUrl } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const code = resolvedParams.code.toUpperCase();
  const lottery = ALL_LOTTERIES.find((l) => l.code === code);

  const lotteryName = lottery ? lottery.name : code;
  const title = `${lotteryName} Result Archives & Info | Kerala State Lottery Result Today`;
  const description = `Check the latest kl lottery results, historical archives, and draw schedule for the ${lotteryName} lottery. Fast live kerala jackpot result updates.`;
  const url = `https://www.keralalotteryresultstoday.in${getLotteryUrl(code)}`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
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
