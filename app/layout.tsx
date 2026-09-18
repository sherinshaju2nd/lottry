import type { Metadata, Viewport } from "next";
import Script from "next/script";
import MuiProvider from "@/components/MuiProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InitialLoader from "@/components/InitialLoader";
import ConsentModal from "@/components/ConsentModal";
import ScrollRestorer from "@/components/ScrollRestorer";
import AiVoiceAssistantModal from "@/components/AiVoiceAssistantModal";
import PwaRegister from "@/components/PwaRegister";
import IosInstallPrompt from "@/components/IosInstallPrompt";
import IosInstallGuideModal from "@/components/IosInstallGuideModal";
import WindowsInstallGuideModal from "@/components/WindowsInstallGuideModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import AiTicketScanner from "@/components/AiTicketScanner";
import { supabase, WEEKLY_LOTTERIES } from "@/lib/supabase";
import "./globals.css";

export const revalidate = 60; // Revalidate every minute so midnight metadata changes are instant

export const viewport: Viewport = {
  themeColor: "#0B3C5D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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

  const formattedDate = `${day}.${month}.${year}`; // e.g. "19.09.2026"
  const isoDate = `${year}-${month}-${day}`; // e.g. "2026-09-19"

  return { formattedDate, isoDate, weekday };
}

interface TodaySEOData {
  title: string;
  description: string;
  keywords: string[];
  lotteryName: string;
  lotteryCode: string;
  lotteryNameMl: string;
  jackpot: string;
  formattedDate: string;
  isoDate: string;
  weekday: string;
  isBumper: boolean;
  isPostponed: boolean;
  postponedReason?: string;
}

async function getTodaySEOPackage(): Promise<TodaySEOData> {
  const { formattedDate, isoDate, weekday } = getTodayISTInfo();

  try {
    // 1. Check if today's draw is postponed / cancelled
    const { data: postponed } = await supabase
      .from("postponed_draws")
      .select("lottery_code, reason, status")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (postponed) {
      const reason = postponed.reason || "Draw Postponed";
      return {
        title: `LIVE Kerala Lottery Result Today (${formattedDate}) | No Draw Today (${reason})`,
        description: `Kerala Lottery notice for today (${formattedDate}): Today's draw is ${postponed.status.toUpperCase()} due to ${reason}. Check upcoming draw schedule, prize lists, and previous results.`,
        keywords: ["Kerala Lottery Result Today", `Kerala Lottery ${formattedDate}`, "Kerala Lottery postponed", "today draw cancelled"],
        lotteryName: "Kerala Lottery",
        lotteryCode: postponed.lottery_code || "",
        lotteryNameMl: "കേരള ലോട്ടറി",
        jackpot: "₹1 Crore",
        formattedDate,
        isoDate,
        weekday,
        isBumper: false,
        isPostponed: true,
        postponedReason: reason,
      };
    }

    // 2. Check if today is a scheduled Bumper Lottery
    const { data: bumperDraw } = await supabase
      .from("lotteries")
      .select("name, code, is_bumper")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (bumperDraw) {
      const title = `LIVE Kerala Lottery Result Today (${formattedDate}) | ${bumperDraw.name} (${bumperDraw.code}) Results`;
      const description = `Kerala Lottery Result Today (${formattedDate}) for ${bumperDraw.name} (${bumperDraw.code}) Bumper Lottery. Check live 2:00 PM / 3:00 PM winning ticket numbers, 1st prize bumper jackpot, full prize breakdown, and official Gazette PDF.`;
      return {
        title,
        description,
        keywords: [
          `LIVE Kerala Lottery Result Today`,
          `${bumperDraw.name} Result Today`,
          `${bumperDraw.name} ${bumperDraw.code} Results`,
          `${bumperDraw.name} Lottery Result ${formattedDate}`,
          `Kerala Bumper Lottery Result`,
          `Kerala Lottery Result Today Live`,
          `Kerala State Lottery`,
        ],
        lotteryName: bumperDraw.name,
        lotteryCode: bumperDraw.code,
        lotteryNameMl: "കേരള ലോട്ടറി",
        jackpot: "Bumper Jackpot",
        formattedDate,
        isoDate,
        weekday,
        isBumper: true,
        isPostponed: false,
      };
    }

    // 3. Check if today's draw is already synced in draw_results (e.g. SS-536)
    const { data: drawResult } = await supabase
      .from("draw_results")
      .select("draw_name, draw_code, lottery_code")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (drawResult && drawResult.draw_name) {
      const codePart = drawResult.draw_code || drawResult.lottery_code || "";
      const title = `LIVE Kerala Lottery Result Today (${formattedDate}) | ${drawResult.draw_name} (${codePart}) Results`;
      const description = `Kerala Lottery Result Today (${formattedDate}) for ${drawResult.draw_name} (${codePart}). Check today's 1st prize winning ticket numbers, live 3 PM draw results, prize breakdown, and official Gazette PDF download.`;
      return {
        title,
        description,
        keywords: [
          `LIVE Kerala Lottery Result Today`,
          `${drawResult.draw_name} Result Today`,
          `${drawResult.draw_name} ${codePart} Results`,
          `${drawResult.draw_name} Result ${formattedDate}`,
          `Kerala Lottery Result Today Live 3 PM`,
          `kerala state lottery result today`,
        ],
        lotteryName: drawResult.draw_name,
        lotteryCode: codePart,
        lotteryNameMl: "കേരള ലോട്ടറി",
        jackpot: "₹1 Crore",
        formattedDate,
        isoDate,
        weekday,
        isBumper: false,
        isPostponed: false,
      };
    }

    // 4. Default to today's weekday scheduled lottery scheme (active from 12:00 Midnight)
    const matchedFallback =
      WEEKLY_LOTTERIES.find(
        (l) => l.day.toLowerCase() === weekday.toLowerCase(),
      ) || WEEKLY_LOTTERIES[0];

    const title = `LIVE Kerala Lottery Result Today (${formattedDate}) | ${matchedFallback.name} (${matchedFallback.code}) Results`;
    const description = `Kerala Lottery Result Today (${formattedDate}) for ${matchedFallback.name} (${matchedFallback.nameMl}, ${matchedFallback.code}). Check 1st prize ₹${matchedFallback.jackpot || "1 Crore"} winning ticket, live 3:00 PM draw results, prize chart, and PDF download.`;

    const keywords = [
      "LIVE Kerala Lottery Result Today",
      `${matchedFallback.name} Result Today`,
      `${matchedFallback.name} ${matchedFallback.code} Results`,
      `${matchedFallback.name} Kerala Lottery`,
      `${matchedFallback.nameMl} ഫലം`,
      `Kerala Lottery Result ${formattedDate}`,
      `how to see kerala lottery result`,
      `kerala lottery ticket search`,
      `kerala lottery ticket checker`,
      `kerala state lottery result today`,
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
      "ఈరోజు കേരళ లాటరీ ఫలితాలు",
    ];

    return {
      title,
      description,
      keywords,
      lotteryName: matchedFallback.name,
      lotteryCode: matchedFallback.code,
      lotteryNameMl: matchedFallback.nameMl,
      jackpot: matchedFallback.jackpot || "₹1 Crore",
      formattedDate,
      isoDate,
      weekday,
      isBumper: false,
      isPostponed: false,
    };
  } catch {
    const fallback = WEEKLY_LOTTERIES[0];
    return {
      title: `LIVE Kerala Lottery Result Today (${formattedDate}) | ${fallback.name} Results`,
      description: `Get Kerala Lottery Result Today LIVE at 3 PM. Check today's winning ticket numbers, prize list, weekly draw schedule, and historical results instantly.`,
      keywords: ["Kerala Lottery Result Today", "Kerala State Lottery Results"],
      lotteryName: fallback.name,
      lotteryCode: fallback.code,
      lotteryNameMl: fallback.nameMl,
      jackpot: "₹1 Crore",
      formattedDate,
      isoDate,
      weekday,
      isBumper: false,
      isPostponed: false,
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getTodaySEOPackage();

  return {
    metadataBase: new URL("https://www.keralalotteryresultstoday.in"),
    title: {
      default: seoData.title,
      template: "%s | Kerala Lottery",
    },
    description: seoData.description,
    keywords: seoData.keywords,
    authors: [{ name: "Kerala Lottery Results Team" }],
    creator: "Kerala Lottery Results",
    publisher: "Kerala Lottery Results",
    applicationName: "Kerala Lottery Result Today",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Kerala Lottery",
    },
    formatDetection: {
      telephone: false,
    },
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
      title: seoData.title,
      description: seoData.description,
      url: "https://www.keralalotteryresultstoday.in",
      siteName: "Kerala Lottery Result Today",
      images: [
        {
          url: "https://www.keralalotteryresultstoday.in/og-image.png",
          width: 1024,
          height: 1024,
          alt: `${seoData.lotteryName} Result Today - Kerala Lottery`,
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
      title: seoData.title,
      description: seoData.description,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoData = await getTodaySEOPackage();

  const structuredSchemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Kerala Lottery Result Today",
      url: "https://www.keralalotteryresultstoday.in",
      dateModified: new Date().toISOString(),
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
      "@type": "BroadcastEvent",
      name: `LIVE: Kerala Lottery ${seoData.lotteryName} (${seoData.lotteryCode}) Result Today ${seoData.formattedDate}`,
      startDate: `${seoData.isoDate}T15:00:00+05:30`,
      endDate: `${seoData.isoDate}T16:30:00+05:30`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: "https://www.keralalotteryresultstoday.in",
      },
      broadcastOfEvent: {
        "@type": "Event",
        name: `Kerala State Lottery ${seoData.lotteryName} Live Draw`,
        startDate: `${seoData.isoDate}T15:00:00+05:30`,
        location: {
          "@type": "Place",
          name: "Gorky Bhavan, Near Bakery Junction, Thiruvananthapuram, Kerala",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What time is the Kerala Lottery ${seoData.lotteryName} result announced today?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Kerala Lottery ${seoData.lotteryName} live draw starts today (${seoData.formattedDate}) at 2:55 PM IST from Gorky Bhavan, Thiruvananthapuram. The official Gazette PDF becomes available by 4:00 PM IST on https://www.keralalotteryresultstoday.in.`,
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
  ];

  return (
    <html lang="en">
      <head>
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="1XeVOR9aNk4f21LP_pNIRfrJHxYaPUuOzeV7HyPAAgw"
        />
        <meta
          name="google-site-verification"
          content="googlebdc0ae26b48716d4"
        />

        {/* Apple & Mobile PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kerala Lottery" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
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
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-2JZL3TDXGE"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
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
        {/* Daily RSS / Atom Feed for Fast Googlebot & Search Engine Daily Crawling */}
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Kerala Lottery Results Daily RSS Feed" />

        {/* JSON-LD Structured Data for SEO & AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredSchemas),
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
          <PwaRegister />
          <ScrollRestorer />
          <InitialLoader />
          <ConsentModal />
          <IosInstallPrompt />
          <IosInstallGuideModal />
          <WindowsInstallGuideModal />
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
            <MobileBottomNav />
            <AiTicketScanner variant="dialog-only" />
          </div>
        </MuiProvider>
      </body>
    </html>
  );
}
