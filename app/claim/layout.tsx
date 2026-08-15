import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Claim Kerala Lottery Prize Money Guide",
  description:
    "Step-by-step guide on how to claim Kerala State Lottery prizes. Learn the claim process, required documents, bank procedures, and office locations.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/claim",
  },
  openGraph: {
    title: "How to Claim Kerala Lottery Prize Money Guide",
    description:
      "Step-by-step guide on how to claim Kerala State Lottery prizes. Learn the claim process, required documents, and office locations.",
    url: "https://www.keralalotteryresultstoday.in/claim",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "https://www.keralalotteryresultstoday.in/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery Claim Guide Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Claim Kerala Lottery Prize Money Guide",
    description:
      "Step-by-step guide on how to claim Kerala State Lottery prizes, required documents, and claim centers.",
    images: ["https://www.keralalotteryresultstoday.in/website-banner-1600x500.png"],
  },
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
