import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Kerala Lottery Results App - Android, iPhone & Windows PC",
  description:
    "Download the official Kerala Lottery Results Today app. Get real-time 3 PM live draw results, instant ticket barcode scanner, official Gazette PDF downloads, and winning number alerts.",
  keywords: [
    "kerala lottery app download",
    "kerala lottery results app",
    "kerala lottery result today app",
    "download kerala lottery app",
    "kerala lottery ticket scanner app",
    "live kerala lottery draw app",
    "play store kerala lottery results",
    "kerala lottery app apk",
    "kerala lottery winning number checker",
    "kerala lottery app for iphone",
    "kerala lottery app for windows",
  ],
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/kerala-lottery-app",
  },
  openGraph: {
    title: "Download Kerala Lottery Results Today App - Android, iPhone & Windows",
    description:
      "Get real-time 3:00 PM Kerala lottery results, ticket scanner, and official PDF downloads directly on your smartphone & PC.",
    url: "https://www.keralalotteryresultstoday.in/kerala-lottery-app",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Kerala Lottery Results Today Official Mobile App",
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
      "Get instant 3 PM live draw results, ticket barcode checker scanner, and official Gazette PDF on Android, iPhone & Windows.",
    images: ["/website-banner-1600x500.png"],
  },
};

export default function KeralaLotteryAppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
