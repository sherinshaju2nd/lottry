import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala Lottery Frequently Asked Questions FAQ",
  description:
    "Find answers to frequently asked questions about Kerala Lottery draws, timings, ticket purchase rules, tax rates, prize claims, and result timings.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/faq",
  },
  openGraph: {
    title: "Kerala Lottery Frequently Asked Questions FAQ",
    description:
      "Find answers to frequently asked questions about Kerala Lottery draws, timings, ticket purchase rules, tax rates, and prize claims.",
    url: "https://www.keralalotteryresultstoday.in/faq",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "https://www.keralalotteryresultstoday.in/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery FAQ Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Lottery Frequently Asked Questions FAQ",
    description:
      "Frequently asked questions about Kerala State Lotteries, draw timings, rules, prize claim procedures, and tax deductions.",
    images: ["https://www.keralalotteryresultstoday.in/website-banner-1600x500.png"],
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
