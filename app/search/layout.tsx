import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winning Ticket Checker | Kerala Lottery Result Today Result",
  description:
    "Check kerala lottery result today result live! Use our fast kl lottery results search engine to check your ticket for the kerala jackpot result.",
  openGraph: {
    title: "Winning Ticket Checker | Kerala Lottery Result Today",
    description:
      "Search your kl lottery results to instantly see if you've won the kerala jackpot.",
    url: "https://keralalotteryresultstoday.in/search",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery Winning Ticket Checker Banner",
      },
      {
        url: "/og-image.png",
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
    title: "Winning Ticket Checker | Kerala Lottery Result Today",
    description:
      "Search your Kerala Lottery ticket number to instantly see if you've won. Fast and easy checker engine.",
    images: ["/website-banner-1600x500.png"],
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
