import type { Metadata } from "next";
import { WEEKLY_LOTTERIES } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; date: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const code = resolvedParams.code.toUpperCase();
  const dateStr = resolvedParams.date;
  const lottery = WEEKLY_LOTTERIES.find((l) => l.code === code);

  const lotteryName = lottery ? lottery.name : code;
  const title = `${lotteryName} Result on ${dateStr} | Kerala State Lottery Result Today`;
  const description = `Check kerala lottery result today result live!  winning numbers for the ${lotteryName} draw on ${dateStr}. Check the 1st prize kerala jackpot result, 2nd prize, and full kl lottery results list fast and easy.`;
  const url = `https://www.keralalotteryresultstoday.in/lottery/${code.toLowerCase()}/${dateStr}`;

  return {
    title,
    description,
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
          alt: `${lotteryName} Result on ${dateStr} Banner`,
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

export default function LotteryDateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
