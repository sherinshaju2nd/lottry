import type { Metadata, Viewport } from "next";
import MuiProvider from "@/components/MuiProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InitialLoader from "@/components/InitialLoader";
import ConsentModal from "@/components/ConsentModal";
import ScrollRestorer from "@/components/ScrollRestorer";
import AiVoiceAssistantModal from "@/components/AiVoiceAssistantModal";
import { supabase, WEEKLY_LOTTERIES } from "@/lib/supabase";
import "./globals.css";

export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: "#0B3C5D",
  width: "device-width",
  initialScale: 1,
};

function getTodayISTInfo() {
  const now = new Date();
  const istParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long",
  }).formatToParts(now);

  const day = istParts.find((p) => p.type === "day")?.value || "";
  const month = istParts.find((p) => p.type === "month")?.value || "";
  const year = istParts.find((p) => p.type === "year")?.value || "";
  const weekday = istParts.find((p) => p.type === "weekday")?.value || "";

  const formattedDate = `${day}.${month}.${year}`; // e.g. "08.09.2026"
  const isoDate = `${year}-${month}-${day}`; // e.g. "2026-09-08"

  return { formattedDate, isoDate, weekday };
}

async function getDynamicDefaultTitle(): Promise<string> {
  const { formattedDate, isoDate, weekday } = getTodayISTInfo();

  try {
    // 1. Check if today's draw is postponed / cancelled
    const { data: postponed } = await supabase
      .from("postponed_draws")
      .select("draw_name, reason")
      .eq("original_date", isoDate)
      .maybeSingle();

    if (postponed) {
      return `LIVE Kerala Lottery Result Today (${formattedDate}) | No Draw Today (${postponed.draw_name || "Postponed"})`;
    }

    // 2. Check if today is a scheduled Bumper Lottery
    const { data: bumperDraw } = await supabase
      .from("lotteries")
      .select("name, code, is_bumper")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (bumperDraw) {
      return `LIVE Kerala Lottery Result Today (${formattedDate}) | ${bumperDraw.name} ${bumperDraw.code} Results`;
    }

    // 3. Check if today's draw has a recorded code-number in draw_results (e.g. SS-536)
    const { data: drawResult } = await supabase
      .from("draw_results")
      .select("draw_name, draw_code, lottery_code")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (drawResult && drawResult.draw_name) {
      const codePart = drawResult.draw_code || drawResult.lottery_code || "";
      return `LIVE Kerala Lottery Result Today (${formattedDate}) | ${drawResult.draw_name} ${codePart} Results`;
    }

    // 4. Query lotteries table for regular weekday lottery
    const { data: lotteries } = await supabase
      .from("lotteries")
      .select("name, code")
      .ilike("day", weekday);

    if (lotteries && lotteries.length > 0) {
      const regular = lotteries[0];
      return `LIVE Kerala Lottery Result Today (${formattedDate}) | ${regular.name} ${regular.code} Results`;
    }

    // 5. Fallback from constant WEEKLY_LOTTERIES
    const matchedFallback =
      WEEKLY_LOTTERIES.find(
        (l) => l.day.toLowerCase() === weekday.toLowerCase(),
      ) || WEEKLY_LOTTERIES[0];

    return `LIVE Kerala Lottery Result Today (${formattedDate}) | ${matchedFallback.name} ${matchedFallback.code} Results`;
  } catch {
    const matchedFallback =
      WEEKLY_LOTTERIES.find(
        (l) => l.day.toLowerCase() === weekday.toLowerCase(),
      ) || WEEKLY_LOTTERIES[0];

    return `LIVE Kerala Lottery Result Today (${formattedDate}) | ${matchedFallback.name} ${matchedFallback.code} Results`;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const dynamicTitle = await getDynamicDefaultTitle();

  return {
    metadataBase: new URL("https://www.keralalotteryresultstoday.in"),
    title: {
      default: dynamicTitle,
      template: "%s | Kerala Lottery Results Today",
    },
    description:
      "Get Kerala Lottery Result Today LIVE with complete prize details. Check today’s Kerala lottery results, bumper lottery updates, Karunya, Karunya Plus, Dhanalekshmi, Bhagyathara, Samrudhi, Suvarna Keralam & Sthree Sakthi results instantly with official prize structure.",
    keywords: [
      "LIVE Kerala Lottery Result Today",
      "how to get kerala lottery ticket",
      "how to get kerala lottery ticket online",
      "how to see kerala lottery result",
      "what is kerala lottery",
      "how to get kerala lottery",
      "how to get kerala lottery online",
      "what is kerala lottery online",
      "what is the price of kerala lottery ticket",
      "how to download kerala lottery result pdf",
      "Kerala Lottery Result Today",
      "kerala lottery ticket search",
      "kerala lottery ticket search engine",
      "kerala lottery ticket checker",
      "check kerala lottery ticket online",
      "kerala state lottery result today",
      "Karunya Result",
      "Karunya Plus Result",
      "Dhanalekshmi Result",
      "Bhagyathara Result",
      "Samrudhi Result",
      "Suvarna Keralam Result",
      "Sthree Sakthi Result",
      "ഇന്നത്തെ കേരള ലോട്ടറി ഫലങ്ങൾ",
      "இன்றைய കേരള லாட்டரி முடிவுகள்",
      "आज के केरल लॉटरी के नतीजे",
      "ಇಂದಿನ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳು",
      "kerala লটাৰীৰ ফলাফল আজি",
      "केरल लॉटरीचो निकाल आयज",
      "ਕੇਰਲ ਲਾਟਰੀ ਦੇ ਅੱਜ ਦੇ ਨਤੀਜੇ",
      "ఈరోజు కేరళ లాటరీ ఫలితాలు",
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
      canonical: "https://www.keralalotteryresultstoday.in",
    },
    openGraph: {
      title: dynamicTitle,
      description:
        "Search your Kerala Lottery ticket numbers instantly to see if you won! Live draw results, search checker engine, weekly schedule, and historical archive.",
      url: "https://www.keralalotteryresultstoday.in",
      siteName: "Kerala Lottery Result Today",
      images: [
        {
          url: "https://www.keralalotteryresultstoday.in/og-image.png",
          width: 1024,
          height: 1024,
          alt: "kerala-lottery-results-logo",
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
      title: dynamicTitle,
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
}

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

        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2JZL3TDXGE"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2JZL3TDXGE');
            `,
          }}
        />

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
        {/* AI & LLM Auto-Discovery Links */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLMs-Full.txt" />

        {/* JSON-LD Structured Data for SEO & AI */}
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
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What time are Kerala Lottery results announced today?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Kerala Lottery live draw starts daily at 2:55 PM IST from Gorky Bhavan, Near Bakery Junction, Thiruvananthapuram. The official chart and Gazette PDF publication becomes available by 4:00 PM IST on https://www.keralalotteryresultstoday.in.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Where is the Kerala Lottery live draw conducted?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The official Kerala Lottery live stream draw is conducted at Gorky Bhavan, Near Bakery Junction, Palayam, Thiruvananthapuram, Kerala under the Directorate of Kerala State Lotteries.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What is the official price of a Kerala Lottery ticket and can you buy online?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The official ticket price is ₹50 per paper ticket for the standard weekly series. Digital or online lottery ticket sales are strictly illegal and unauthorized in Kerala; tickets are only sold physically through authorized agents.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Which weekly Kerala Lottery schemes are active in 2026?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The 7 active weekly lottery schemes in 2026 are: Samrudhi (Sunday), Bhagyathara (Monday), Sthree-Sakthi (Tuesday), Dhanalekshmi (Wednesday), Karunya Plus (Thursday), Suvarna Keralam (Friday), and Karunya (Saturday), alongside 6 annual festive Bumper lotteries.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How can I check my Kerala Lottery ticket number online?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "You can check your ticket by visiting https://www.keralalotteryresultstoday.in/search and entering your full ticket series or the 4-digit last numbers to instantly find matches across all prize tiers.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How long is the claim period for Kerala Lottery prizes?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Winning lottery tickets must be surrendered within 30 days from the draw date to the District Lottery Office or Directorate of State Lotteries with valid ID proofs.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What are the tax deductions on Kerala Lottery prize money?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "For prize winnings over ₹10,000, a flat 30% TDS (Income Tax under Section 194B) is deducted along with a 10% agent commission before payout.",
                    },
                  },
                ],
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
          <ScrollRestorer />
          <InitialLoader />
          <ConsentModal />
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
            <AiVoiceAssistantModal />
          </div>
        </MuiProvider>
      </body>
    </html>
  );
}
