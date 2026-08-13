import type { Metadata, Viewport } from "next";
import MuiProvider from "@/components/MuiProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InitialLoader from "@/components/InitialLoader";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0F5A24",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.keralalotteryresultstoday.in"),
  title: {
    default: "Kerala Lottery Ticket Search Engine | Live Results Today Checker",
    template: "%s | Kerala State Lottery Result Today",
  },
  description:
    "Check kerala lottery results using our fast lottery ticket search engine and checker. Enter your ticket number to instantly verify winning results, check kerala jackpot, and view draw tables.",
  keywords: [
    "kerala lottery ticket search",
    "kerala lottery ticket search engine",
    "kerala lottery ticket checker",
    "check kerala lottery ticket online",
    "kerala lottery search engine",
    "lottery checker search",
    "kerala lottery result",
    "kerala lottery result today result",
    "kerala state lottery result today",
    "kerala state lottery today",
    "kl lottery results",
    "jackpot kerala",
    "kerala jackpot",
    "kerala lottery",
    "kerela lottery com",
    "kerala jackpot result",
    "kerala lottery ticket search online",
    "Kerala Lottery Ticket Search",
    "Kerala Lottery Live Result",
    "Suvarna Keralam Result",
    "Karunya Result Today",
    "Samrudhi Result Today",
    "Bhagyathara Result Today",
    "Fifty Fifty Result Today",
    "Nirmal Result Today",
    "Stree Sakthi Result Today",
    "Win-Win Result Today",
  ],
  authors: [{ name: "Kerala Lottery Results Team" }],
  creator: "Kerala Lottery Results",
  publisher: "Kerala Lottery Results",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kerala Lottery Ticket Search Engine - Live Results Today & Checker",
    description:
      "Search your Kerala Lottery ticket numbers instantly to see if you won! Live draw results, search checker engine, weekly schedule, and historical archive.",
    url: "https://www.keralalotteryresultstoday.in",
    siteName: "Kerala Lottery Result Today",
    images: [
      {
        url: "https://www.keralalotteryresultstoday.in/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Kerala Lottery Result Today Logo",
      },
      {
        url: "https://www.keralalotteryresultstoday.in/website-banner-1600x500.png",
        width: 1600,
        height: 500,
        alt: "Kerala Lottery Schedule & Live Draw Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Lottery Ticket Search Engine - Live Results Today & Checker",
    description:
      "Check Kerala State Lottery live results & search winning ticket numbers instantly using our checker tool!",
    images: ["https://www.keralalotteryresultstoday.in/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "1XeVOR9aNk4f21LP_pNIRfrJHxYaPUuOzeV7HyPAAgw",
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
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="1XeVOR9aNk4f21LP_pNIRfrJHxYaPUuOzeV7HyPAAgw"
        />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5RV79GG9');`,
          }}
        />
        {/* End Google Tag Manager */}

        <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2JZL3TDXGE"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-2JZL3TDXGE');
</script>

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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Kerala Lottery Result Today",
                url: "https://www.keralalotteryresultstoday.in",
                potentialAction: {
                  "@type": "SearchAction",
                  target:
                    "https://www.keralalotteryresultstoday.in/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Kerala Lottery Result Today",
                url: "https://www.keralalotteryresultstoday.in",
                logo: "https://www.keralalotteryresultstoday.in/logo-master-1024.png",
                sameAs: ["https://www.keralalotteryresultstoday.in"],
              },
            ]),
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5RV79GG9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
