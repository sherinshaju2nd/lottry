import type { Metadata } from "next";
import MuiProvider from "@/components/MuiProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InitialLoader from "@/components/InitialLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerala Lottery Result Today - Official Live Results & Schedule",
  description:
    "Check Kerala Lottery Result Today live! Official 3:30 PM draw results, live winning ticket search checker, weekly schedule, and complete historical archives.",
  keywords: [
    "Kerala Lottery Result Today",
    "Kerala Lottery Result",
    "Kerala Lottery Live Result",
    "Kerala Lottery Today 3:30 PM",
    "Kerala Lottery Ticket Search",
    "Suvarna Keralam Result",
    "Karunya Result Today",
    "Samrudhi Result Today",
    "Bhagyathara Result Today",
  ],
  openGraph: {
    title: "Kerala Lottery Result Today - Live Results & Schedule",
    description:
      "Check Kerala Lottery Result Today live! Fast 3:30 PM draw results, winning ticket search checker engine, weekly schedule, and complete historical archive.",
    type: "website",
    siteName: "Kerala Lottery Result Today",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Kerala Lottery Result Today",
              url: "https://keralalotteryresulttoday.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://keralalotteryresulttoday.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        <MuiProvider>
          <InitialLoader />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </MuiProvider>
      </body>
    </html>
  );
}
