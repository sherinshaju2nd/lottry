import type { Metadata } from "next";
import Link from "next/link";
import {
  BUMPER_LOTTERIES,
  WEEKLY_LOTTERIES,
  getLotteryUrl,
  getRecentDrawsFromSupabase,
  resolveLotteryDisplayMeta,
  type StructuredDrawResult,
  type WeeklyLotteryItem,
} from "@/lib/supabase";
import { formatDrawDateLong } from "@/lib/drawIndexing";

// Latest-result links refresh hourly; result syncs also revalidate on demand.
export const revalidate = 3600;

const PAGE_URL = "https://www.keralalotteryresultstoday.in/lotteries";
const TITLE = "All Kerala Lotteries: Weekly & Bumper Draw Schedule, Ticket Prices and Prizes";
const DESCRIPTION =
  "Every Kerala State lottery in one place: the 7 weekly draws (day, 3 PM draw, ₹50 ticket, first prize) and the 6 bumper lotteries (season, ticket price, jackpot), with links to each lottery's latest result.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "Kerala Lottery Result Today", type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const WEEKDAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Newest stored draw per lottery code (draws come back newest first). */
const latestByCode = (draws: StructuredDrawResult[]): Map<string, StructuredDrawResult> =>
  draws.reduce((map, draw) => (map.has(draw.lottery_code) ? map : map.set(draw.lottery_code, draw)), new Map<string, StructuredDrawResult>());

const LatestCell = ({ lottery, latest }: { lottery: WeeklyLotteryItem; latest?: StructuredDrawResult }) =>
  latest ? (
    <Link href={getLotteryUrl(lottery.code, latest.draw_date)} className="font-semibold text-sky-800 underline">
      {latest.draw_code || lottery.code} · {formatDrawDateLong(latest.draw_date)}
    </Link>
  ) : (
    <Link href={getLotteryUrl(lottery.code)} className="font-semibold text-sky-800 underline">
      Results archive
    </Link>
  );

const LotteryTable = ({
  caption,
  firstColumn,
  rows,
  latest,
}: {
  caption: string;
  firstColumn: string;
  rows: WeeklyLotteryItem[];
  latest: Map<string, StructuredDrawResult>;
}) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th scope="col" className="px-3 py-2 font-semibold">{firstColumn}</th>
          <th scope="col" className="px-3 py-2 font-semibold">Lottery</th>
          <th scope="col" className="px-3 py-2 font-semibold">Ticket</th>
          <th scope="col" className="px-3 py-2 font-semibold">1st prize</th>
          <th scope="col" className="px-3 py-2 font-semibold">Latest result</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((lottery) => {
          const { jackpot, ticketPrice } = resolveLotteryDisplayMeta(lottery.code);
          return (
            <tr key={lottery.code} className="border-t border-slate-100">
              <td className="px-3 py-2 text-slate-700">{lottery.draw_season ?? lottery.day}</td>
              <td className="px-3 py-2">
                <Link href={getLotteryUrl(lottery.code)} className="font-bold text-slate-900 hover:underline">
                  {lottery.name}
                </Link>{" "}
                <span className="text-slate-500">({lottery.code}) · {lottery.nameMl}</span>
              </td>
              <td className="px-3 py-2 text-slate-700">{lottery.ticket_price ?? ticketPrice}</td>
              <td className="px-3 py-2 text-slate-700">{lottery.jackpot ?? jackpot}</td>
              <td className="px-3 py-2">
                <LatestCell lottery={lottery} latest={latest.get(lottery.code)} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

/**
 * /lotteries: the interactive list (page.tsx) renders in the browser, so this layout adds
 * server-rendered context: a heading, an intro, and a full schedule table with latest results.
 */
export default async function LotteriesLayout({ children }: { children: React.ReactNode }) {
  const latest = latestByCode(await getRecentDrawsFromSupabase(60));
  const weekly = [...WEEKLY_LOTTERIES].sort((a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day));

  return (
    <>
      <header className="mx-auto max-w-[900px] px-3 pt-5 sm:px-6">
        <h1 className="text-2xl font-black text-[#0B3C5D] sm:text-3xl">All Kerala Lotteries</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          The Kerala State Lotteries Department runs {WEEKLY_LOTTERIES.length} weekly lotteries, one for each day of the week, and{" "}
          {BUMPER_LOTTERIES.length} bumper lotteries through the year. Pick a lottery below to see its latest result and full archive.
        </p>
      </header>

      {children}

      <section aria-labelledby="lottery-schedule-heading" className="mx-auto max-w-[900px] px-3 pb-10 text-slate-800 sm:px-6">
        <h2 id="lottery-schedule-heading" className="mb-3 mt-6 text-xl font-extrabold text-slate-900">
          Weekly lottery schedule
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Weekly draws are held every day at 3:00 PM at Gorky Bhavan, Thiruvananthapuram. Tickets cost ₹50 and are sold only by
          authorised agents. The first, second and third prizes go to full ticket numbers (series letters and six digits); the
          fourth prize and below are decided by the last four digits, so one number can win on many tickets.
        </p>
        <LotteryTable caption="Kerala weekly lotteries by draw day" firstColumn="Draw day" rows={weekly} latest={latest} />

        <h2 className="mb-3 mt-8 text-xl font-extrabold text-slate-900">Bumper lotteries</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Bumper lotteries are drawn once a season, usually at 2:00 PM, with much larger first prizes and higher ticket prices.
          The exact draw date is announced by the department a few weeks in advance.
        </p>
        <LotteryTable caption="Kerala bumper lotteries by season" firstColumn="Season" rows={BUMPER_LOTTERIES} latest={latest} />

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Ticket prices and prizes are taken from the department&apos;s published prize structures and may change. Always check the
          official result at{" "}
          <a href="https://statelottery.kerala.gov.in/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-800 underline">
            statelottery.kerala.gov.in
          </a>{" "}
          before claiming. See our{" "}
          <Link href="/claim" className="font-semibold text-sky-800 underline">
            prize claim guide
          </Link>
          .
        </p>
      </section>
    </>
  );
}
