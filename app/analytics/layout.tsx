import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala Lottery Statistics & Analytics | Hot Cold Numbers & District Trends",
  description:
    "Explore Kerala Lottery number trends, most frequent 4-digit and 2-digit combinations, single-digit distributions, and Kerala 14-district 1st prize winner leaderboards.",
  keywords: [
    "Kerala lottery statistics",
    "Kerala lottery trends",
    "Kerala lottery hot numbers",
    "Kerala lottery cold numbers",
    "Kerala lottery district winners",
    "Kerala lottery frequency chart",
    "ലോട്ടറി സ്റ്റാറ്റിസ്റ്റിക്സ്",
    "കേരള ലോട്ടറി ട്രെൻഡ്സ്",
  ],
  openGraph: {
    title: "Kerala Lottery Statistics & Analytics | Hot Numbers & District Trends",
    description:
      "Deep data analytics and frequency patterns across Kerala State Lottery official draws.",
    url: "https://www.keralalotteryresultstoday.in/analytics",
    siteName: "Kerala Lottery Results Today",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/analytics",
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
