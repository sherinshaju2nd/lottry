import type { Metadata } from "next";
import HomePageClient, { HomePageInitialData, LotteryItem } from "./HomePageClient";
export type { LotteryItem, HomePageInitialData };
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  StructuredDrawResult,
  PostponedDraw,
  supabase,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const formattedDate = `${day}.${month}.${year}`; // e.g. "20.09.2026"
  const isoDate = `${year}-${month}-${day}`; // e.g. "2026-09-20"

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
  firstPrizeTicket?: string;
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
        keywords: [
          "Kerala Lottery Result Today",
          `Kerala Lottery ${formattedDate}`,
          "Kerala Lottery postponed",
          "today draw cancelled",
        ],
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
      .select("name, code, is_bumper, jackpot")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (bumperDraw) {
      const title = `LIVE Kerala Lottery Result Today (${formattedDate}) | ${bumperDraw.name} (${bumperDraw.code}) Results`;
      const description = `Kerala Lottery Result Today (${formattedDate}) for ${bumperDraw.name} (${bumperDraw.code}) Bumper Lottery. Check live 2:00 PM / 3:00 PM winning ticket numbers, 1st prize ${bumperDraw.jackpot || "bumper jackpot"}, full prize breakdown, and official Gazette PDF.`;
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
        jackpot: bumperDraw.jackpot || "Bumper Jackpot",
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
      .select("draw_name, draw_code, lottery_code, first_prize")
      .eq("draw_date", isoDate)
      .maybeSingle();

    if (drawResult && drawResult.draw_name) {
      const codePart = drawResult.draw_code || drawResult.lottery_code || "";
      let firstTicket = "";
      try {
        const fp = typeof drawResult.first_prize === "string" ? JSON.parse(drawResult.first_prize) : drawResult.first_prize;
        firstTicket = fp?.ticket || "";
      } catch {
        firstTicket = "";
      }
      const firstPrizeText = firstTicket ? ` | 1st Prize: ${firstTicket}` : "";
      const title = `LIVE Kerala Lottery Result Today (${formattedDate}) | ${drawResult.draw_name} (${codePart}) Results${firstPrizeText}`;
      const description = `Kerala Lottery Result Today (${formattedDate}) for ${drawResult.draw_name} (${codePart}). Check today's 1st prize winning ticket numbers${firstTicket ? ` (${firstTicket})` : ""}, live 3 PM draw results, prize breakdown, and official Gazette PDF download.`;
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
        firstPrizeTicket: firstTicket,
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
      "இன்றைய കേരള லாட்டരി முடிவுகள்",
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
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
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
  };
}

export default async function HomePage() {
  const { formattedDate, isoDate, weekday } = getTodayISTInfo();
  const seoData = await getTodaySEOPackage();

  // Server-side prefetch for instant SSR HTML rendering
  let initialLotteriesList: LotteryItem[] = WEEKLY_LOTTERIES;
  let initialBumperLotteriesList: LotteryItem[] = BUMPER_LOTTERIES as any;
  let initialTodayLottery: LotteryItem = WEEKLY_LOTTERIES[0];
  let isTodayBumper = false;
  let todayBumperInfo: any = null;
  let initialTodayDrawResult: StructuredDrawResult | null = null;
  let initialPostponement: PostponedDraw | null = null;
  let initialAllDraws: StructuredDrawResult[] = [];

  try {
    const [lotteriesRes, todayDrawRes, postponedRes, allDrawsRes] =
      await Promise.all([
        supabase.from("lotteries").select("*").order("id", { ascending: true }),
        supabase
          .from("draw_results")
          .select("*")
          .eq("draw_date", isoDate)
          .maybeSingle(),
        supabase
          .from("postponed_draws")
          .select("*")
          .eq("draw_date", isoDate)
          .maybeSingle(),
        supabase
          .from("draw_results")
          .select("*")
          .order("draw_date", { ascending: false })
          .limit(30),
      ]);

    if (lotteriesRes.data && lotteriesRes.data.length > 0) {
      initialLotteriesList = lotteriesRes.data
        .map((d: any) => ({
          day: d.day,
          name: d.name,
          nameMl: d.name_ml || d.name,
          code: d.code,
          drawTime: d.draw_time || "3:00 PM",
          is_bumper: d.is_bumper ?? d.day.toLowerCase().includes("bumper"),
          jackpot:
            d.jackpot ||
            WEEKLY_LOTTERIES.find((w) => w.code === d.code)?.jackpot ||
            "₹1 Crore",
          ticket_price:
            d.ticket_price ||
            WEEKLY_LOTTERIES.find((w) => w.code === d.code)?.ticket_price ||
            "₹50",
        }))
        .filter(
          (l: any) => !l.is_bumper && !l.day.toLowerCase().includes("bumper"),
        );

      const scheduledBumper = lotteriesRes.data.find(
        (l: any) =>
          l.is_bumper &&
          l.draw_date &&
          l.draw_date.trim() === isoDate.trim(),
      );

      if (scheduledBumper) {
        isTodayBumper = true;
        todayBumperInfo = scheduledBumper;
        initialTodayLottery = {
          day: scheduledBumper.day || "Bumper Draw",
          name: scheduledBumper.name,
          nameMl: scheduledBumper.name_ml || scheduledBumper.name,
          code: scheduledBumper.code,
          drawTime: scheduledBumper.draw_time || "2:00 PM",
          is_bumper: true,
          jackpot: scheduledBumper.jackpot || "₹12 Crore",
          ticket_price: scheduledBumper.ticket_price || "₹300",
          draw_season: scheduledBumper.draw_season || "Annual Festival",
          draw_date: scheduledBumper.draw_date,
        };
      }
    }

    if (!isTodayBumper) {
      const matched =
        initialLotteriesList.find(
          (l) => l.day.toLowerCase() === weekday.toLowerCase(),
        ) ||
        WEEKLY_LOTTERIES.find(
          (l) => l.day.toLowerCase() === weekday.toLowerCase(),
        ) ||
        WEEKLY_LOTTERIES[0];
      initialTodayLottery = matched;
    }

    if (todayDrawRes.data) {
      initialTodayDrawResult = todayDrawRes.data as StructuredDrawResult;
    }

    if (postponedRes.data) {
      initialPostponement = postponedRes.data as PostponedDraw;
    }

    if (allDrawsRes.data) {
      initialAllDraws = allDrawsRes.data as StructuredDrawResult[];
    }
  } catch (err) {
    console.error("Error prefetching SSR homepage data:", err);
  }

  const initialData: HomePageInitialData = {
    todayLottery: initialTodayLottery,
    lotteriesList: initialLotteriesList,
    bumperLotteriesList: initialBumperLotteriesList,
    todayDrawResult: initialTodayDrawResult,
    todayPostponement: initialPostponement,
    allDraws: initialAllDraws,
    todayDayName: weekday,
    isTodayBumper,
    todayBumperInfo,
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    headline: seoData.title,
    description: seoData.description,
    coverageStartTime: `${isoDate}T00:00:00+05:30`,
    coverageEndTime: `${isoDate}T23:59:59+05:30`,
    datePublished: `${isoDate}T00:00:00+05:30`,
    dateModified: new Date().toISOString(),
    url: "https://www.keralalotteryresultstoday.in",
    publisher: {
      "@type": "Organization",
      name: "Kerala Lottery Result Today",
      url: "https://www.keralalotteryresultstoday.in",
      logo: {
        "@type": "ImageObject",
        url: "https://www.keralalotteryresultstoday.in/logo-master-1024.png",
      },
    },
    liveBlogUpdate: [
      {
        "@type": "BlogPosting",
        headline: `Kerala Lottery ${seoData.lotteryName} (${seoData.lotteryCode}) Results Today - ${formattedDate}`,
        articleBody: seoData.description,
        datePublished: `${isoDate}T00:00:00+05:30`,
        dateModified: new Date().toISOString(),
      },
    ],
  };

  return (
    <>
      {/* Real-Time LiveBlogPosting Schema for Instant Daily Google SERP Refresh */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      {/* Visually hidden semantic text for crawlers that matches metadata perfectly */}
      <section className="sr-only" aria-hidden="true" style={{ display: "none" }}>
        <h1>{seoData.title}</h1>
        <p>{seoData.description}</p>
        <p>
          Today is {weekday}, {formattedDate}. Today&apos;s active Kerala State Lottery is{" "}
          {seoData.lotteryName} ({seoData.lotteryNameMl}, {seoData.lotteryCode}) with a 1st prize of{" "}
          {seoData.jackpot}.
        </p>
      </section>

      <HomePageClient initialData={initialData} />
    </>
  );
}
