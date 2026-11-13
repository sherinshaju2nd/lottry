import Link from "next/link";
import type { StructuredDrawResult } from "@/lib/supabase";
import { buildDrawInsights } from "@/lib/drawInsights";
import { formatDrawDateLong } from "@/lib/drawIndexing";

interface DrawInsightsSectionProps {
  draw: StructuredDrawResult;
  previousDraw?: StructuredDrawResult | null;
  lotteryName: string;
  lotterySlug: string;
}

const OFFICIAL_RESULTS_URL = "https://statelottery.kerala.gov.in/";

/**
 * Server-rendered editorial summary for a single draw. Gives each result page original,
 * data-derived text (who won, where it was sold, how the prize tiers break down, and how
 * this draw compares with the previous one) that is present in the initial HTML.
 */
const DrawInsightsSection = ({ draw, previousDraw, lotteryName, lotterySlug }: DrawInsightsSectionProps) => {
  const insights = buildDrawInsights(draw, previousDraw);
  const {
    firstTicket,
    firstSeries,
    firstLocation,
    firstAgent,
    firstAgencyNo,
    firstAmount,
    tiers,
    totalWinningEntries,
    topEndingDigit,
    lowHighSplit,
    previous,
  } = insights;
  const drawLabel = draw.draw_code ? `${lotteryName} ${draw.draw_code}` : lotteryName;
  const dateLong = formatDrawDateLong(draw.draw_date);

  return (
    <section
      aria-labelledby="draw-insights-heading"
      className="mx-auto my-8 max-w-4xl rounded-2xl border border-slate-200 bg-white px-4 py-6 text-slate-800 sm:px-8"
    >
      <h2 id="draw-insights-heading" className="mb-4 text-xl font-extrabold text-slate-900 sm:text-2xl">
        {drawLabel} result summary — {dateLong}
      </h2>

      {firstTicket && (
        <p className="mb-3 leading-relaxed">
          The first prize{firstAmount ? ` of ${firstAmount}` : ""} in the {drawLabel} draw held on {dateLong} went to
          ticket <strong>{firstTicket}</strong>
          {firstLocation ? (
            <>
              , sold at <strong>{firstLocation}</strong>
            </>
          ) : null}
          {firstAgent ? ` by agent ${firstAgent}` : ""}
          {firstAgencyNo ? ` (agency no. ${firstAgencyNo})` : ""}.
          {firstSeries
            ? ` The winning ticket belongs to the ${firstSeries} series; the same six-digit number in every other series receives the consolation prize.`
            : ""}
        </p>
      )}

      {tiers.length > 0 && (
        <>
          <p className="mb-3 leading-relaxed">
            In total, this draw lists <strong>{totalWinningEntries.toLocaleString("en-IN")}</strong> winning entries across{" "}
            {tiers.length + (firstTicket ? 1 : 0)} prize tiers. Lower tiers are decided by the last four digits of the
            ticket, so a single 4-digit number pays out on every ticket that ends with it.
          </p>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left text-sm">
              <caption className="sr-only">Prize tier breakdown for {drawLabel}</caption>
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th scope="col" className="py-2 pr-4 font-semibold">Prize</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Amount</th>
                  <th scope="col" className="py-2 font-semibold">Winning numbers listed</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(({ key, label, amount, count }) => (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium">{label}</td>
                    <td className="py-2 pr-4">{amount ?? "—"}</td>
                    <td className="py-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {topEndingDigit && lowHighSplit && (
        <p className="mb-3 leading-relaxed">
          Among the {topEndingDigit.outOf} four-digit winning numbers (4th prize and below), the most common final digit
          was <strong>{topEndingDigit.digit}</strong> ({topEndingDigit.count} times). {lowHighSplit.low} of them start with
          0–4 and {lowHighSplit.high} start with 5–9.
        </p>
      )}

      {previous && (
        <p className="mb-3 leading-relaxed">
          Compared with the previous {lotteryName} draw on{" "}
          <Link href={`/${lotterySlug}/${previous.date}`} className="font-semibold text-sky-800 underline">
            {formatDrawDateLong(previous.date)}
            {previous.drawCode ? ` (${previous.drawCode})` : ""}
          </Link>
          {previous.firstTicket ? `, whose first prize went to ${previous.firstTicket}` : ""}
          {previous.firstLocation ? ` sold at ${previous.firstLocation}` : ""}:{" "}
          {previous.repeatedEndings.length > 0
            ? `${previous.repeatedEndings.length} four-digit ending${previous.repeatedEndings.length === 1 ? "" : "s"} (${previous.repeatedEndings.slice(0, 8).join(", ")}${previous.repeatedEndings.length > 8 ? "…" : ""}) won again in this draw.`
            : "no four-digit ending won in both draws."}
          {previous.sameFirstSeries ? " The first prize came from the same series both weeks." : ""}
          {previous.sameFirstLocation ? " Both first-prize tickets were sold at the same location." : ""}
        </p>
      )}

      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        Every draw is an independent random event: repeated digits or endings are coincidences and do not make any number
        more or less likely to win in future draws. We do not predict results or sell tickets.
      </p>

      <p className="text-sm leading-relaxed text-slate-600">
        Before claiming, compare your ticket with the official result published by the Kerala State Lotteries Department at{" "}
        <a href={OFFICIAL_RESULTS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-800 underline">
          statelottery.kerala.gov.in
        </a>
        . Prizes must be claimed within 30 days — see our{" "}
        <Link href="/claim" className="font-semibold text-sky-800 underline">
          prize claim guide
        </Link>
        .
      </p>
    </section>
  );
};

export default DrawInsightsSection;
