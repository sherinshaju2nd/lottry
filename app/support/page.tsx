import React from "react";
import type { Metadata } from "next";
import SupportClient, { BUY_ME_A_COFFEE_URL } from "./SupportClient";

export const metadata: Metadata = {
  title: "Support Kerala Lottery Development | Buy Me a Coffee ☕",
  description:
    "Support the ongoing development of Kerala Lottery Results Today. Buy us a coffee to fuel 3:00 PM zero-lag live servers, AI Ticket Scanner OCR improvements, and keep the app 100% ad-free.",
  keywords: [
    "Support Kerala Lottery",
    "Buy Me a Coffee Sherin80",
    "Kerala Lottery Result Development Support",
    "Kerala Lottery App Support",
    "Kerala Lottery AI Scanner Support",
    "Donate Kerala Lottery Results",
  ],
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/support",
  },
  openGraph: {
    title: "Support Us | Buy Me a Coffee - Kerala Lottery Results",
    description:
      "Support our independent development to keep Kerala Lottery Results lightning-fast, 100% free, and ad-free.",
    url: "https://www.keralalotteryresultstoday.in/support",
    siteName: "Kerala Lottery Result Today",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support Us | Buy Me a Coffee - Kerala Lottery Results",
    description:
      "Fuel 3:00 PM zero-lag live draw servers and AI Ticket Scanner upgrades. Buy us a coffee!",
  },
};

export default function SupportPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    "name": "Support Kerala Lottery Results Development",
    "description": "Financial support to maintain live draw servers, AI OCR models, and ad-free utility services.",
    "url": "https://www.keralalotteryresultstoday.in/support",
    "recipient": {
      "@type": "Person",
      "name": "Sherin",
      "sameAs": BUY_ME_A_COFFEE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SupportClient />
    </>
  );
}
