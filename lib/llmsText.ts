import fs from "fs";
import path from "path";
import { getAnnouncedBumperDraws, getLotteryUrl } from "@/lib/supabase";
import { formatDrawDateLong, getTodayIST } from "@/lib/drawIndexing";

const SITE_URL = "https://www.keralalotteryresultstoday.in";
const ANNOUNCED_DRAWS_TOKEN = "{{ANNOUNCED_BUMPER_DRAWS}}";

/** Markdown list of announced upcoming bumper draws, from lotteries.draw_date. */
const renderAnnouncedBumperDraws = async (): Promise<string> => {
  const draws = await getAnnouncedBumperDraws(getTodayIST());
  if (draws.length === 0) {
    return `- No bumper draw date is currently announced. See ${SITE_URL}/lotteries for the schedule.`;
  }
  return draws
    .map(({ code, name, date, drawTime, jackpot, ticketPrice }) => {
      const dateLong = formatDrawDateLong(date);
      const facts = [
        `Draw on ${dateLong} at ${drawTime} IST`,
        jackpot && `1st Prize ${jackpot}`,
        ticketPrice && `ticket ${ticketPrice}`,
      ].filter(Boolean);
      return `- [${name} (${code}) Result – ${dateLong}](${SITE_URL}${getLotteryUrl(code, date)}): ${facts.join(", ")}. Live winning numbers, prize chart and Gazette PDF.`;
    })
    .join("\n");
};

/** Reads content/<file> and fills dynamic sections from the database. */
export const renderLlmsFile = async (fileName: "llms.txt" | "llms-full.txt"): Promise<string> => {
  const template = fs.readFileSync(path.join(process.cwd(), "content", fileName), "utf-8");
  if (!template.includes(ANNOUNCED_DRAWS_TOKEN)) return template;
  return template.replace(ANNOUNCED_DRAWS_TOKEN, await renderAnnouncedBumperDraws());
};

/** Shared GET handler body for /llms.txt and /llms-full.txt. */
export const llmsTextResponse = async (fileName: "llms.txt" | "llms-full.txt"): Promise<Response> => {
  try {
    return new Response(await renderLlmsFile(fileName), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    console.error(`[llms] Error rendering content/${fileName}:`, err instanceof Error ? err.message : String(err));
    return new Response("Not Found", { status: 404 });
  }
};
