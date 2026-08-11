import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala Lottery Ticket Search Engine | Live Results Today Checker",
  description:
    "Search your Kerala State Lottery ticket numbers. Use our fast kl lottery results search engine to check your ticket for winning jackpot numbers instantly.",
  openGraph: {
    title: "Kerala Lottery Ticket Search Engine | Live Results Today Checker",
    description:
      "Search your kl lottery results to instantly see if you have won the jackpot.",
    url: "https://www.keralalotteryresultstoday.in/search",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "https://www.keralalotteryresultstoday.in/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery Winning Ticket Checker Banner",
      },
      {
        url: "https://www.keralalotteryresultstoday.in/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Kerala Lottery Result Today Logo",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Lottery Ticket Search Engine | Live Results Today Checker",
    description:
      "Search your Kerala Lottery ticket number to instantly see if you have won. Fast and easy checker search engine.",
    images: ["https://www.keralalotteryresultstoday.in/website-banner-1600x500.png"],
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
