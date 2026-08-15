import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala Lottery Guide, Rules, Schedule & Tax Info",
  description:
    "Comprehensive guide to Kerala State Lotteries. Learn about daily draw schedules, bumper lotteries, prize structures, rules, and tax deductions.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/guide",
  },
  openGraph: {
    title: "Kerala Lottery Guide, Rules, Schedule & Tax Info",
    description:
      "Comprehensive guide to Kerala State Lotteries. Learn about daily draw schedules, bumper lotteries, prize structures, and rules.",
    url: "https://www.keralalotteryresultstoday.in/guide",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "https://www.keralalotteryresultstoday.in/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery Complete Guide Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Lottery Guide, Rules, Schedule & Tax Info",
    description:
      "Complete guide to Kerala State Lotteries: draw schedules, ticket rules, prize claims, and tax rates.",
    images: ["https://www.keralalotteryresultstoday.in/website-banner-1600x500.png"],
  },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
