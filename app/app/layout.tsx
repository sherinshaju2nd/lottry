import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Kerala Lottery Results Today Official Android App | Free Play Store",
  description:
    "Download the official Kerala Lottery Results Today Android App from Google Play Store. Get instant 3:00 PM live draw results, ticket checker scanner, official Gazette PDF downloads, and lucky number alerts.",
  keywords: [
    "kerala lottery app download",
    "kerala lottery results app",
    "kerala lottery result today android app",
    "kerala lottery ticket scanner app",
    "live kerala lottery draw app",
    "play store kerala lottery results",
    "kerala lottery app apk",
    "kerala lottery winning number checker",
  ],
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/app",
  },
  openGraph: {
    title: "Download Kerala Lottery Results Today Official Mobile App",
    description:
      "Get real-time 3:00 PM Kerala lottery results, ticket scanner, and official PDF downloads directly on your smartphone.",
    url: "https://www.keralalotteryresultstoday.in/app",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Kerala Lottery Results Today Official Android App",
      },
      {
        url: "/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery Results App Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Download Kerala Lottery Results Today App",
    description:
      "Get instant 3 PM live draw results, ticket barcode checker scanner, and official Gazette PDF on Android.",
    images: ["/website-banner-1600x500.png"],
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
