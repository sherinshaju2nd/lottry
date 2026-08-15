import type { Metadata } from "next";
import { ALL_LOTTERIES, getLotteryCodeFromSlug, getLotterySlug } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; date: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const slug = getLotterySlug(lotteryCode);
  const dateStr = resolvedParams.date;
  const lottery = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  const lotteryName = lottery ? lottery.name : rawCode;
  const title = `${lotteryName} Result on ${dateStr} | Kerala State Lottery Result Today`;
  const description = `Check Kerala Lottery result live! Winning numbers for the ${lotteryName} draw on ${dateStr}. Check 1st prize jackpot result, 2nd prize, and full prize list fast.`;
  const url = `https://www.keralalotteryresultstoday.in/${slug}/${dateStr}`;

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
