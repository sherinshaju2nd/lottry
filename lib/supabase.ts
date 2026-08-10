import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface FirstPrize {
  ticket?: string;
  location?: string;
  agent?: string;
  agency_no?: string;
}

export interface PrizeData {
  consolation?: string[];
  "2nd"?: string[];
  "3rd"?: string[];
  "4th"?: string[];
  "5th"?: string[];
  "6th"?: string[];
  "7th"?: string[];
  "8th"?: string[];
  "9th"?: string[];
  amounts?: Record<string, string>;
  guess?: string[];
  mc?: string[];
}

export interface StructuredDrawResult {
  id?: number;
  draw_date: string;
  draw_name: string;
  draw_code: string;
  lottery_code: string;
  first: FirstPrize;
  prizes: PrizeData;
  created_at?: string;
}

export const WEEKLY_LOTTERIES = [
  { day: "Monday", name: "Bhagyathara", code: "BT" },
  { day: "Tuesday", name: "Sthree Sakthi", code: "SS" },
  { day: "Wednesday", name: "Dhanalekshmi", code: "DL" },
  { day: "Thursday", name: "Karunya Plus", code: "KN" },
  { day: "Friday", name: "Suvarna Keralam", code: "SK" },
  { day: "Saturday", name: "Karunya", code: "KR" },
  { day: "Sunday", name: "Samrudhi", code: "SM" },
];

export async function saveDrawResultToSupabase(data: {
  draw_date: string;
  draw_name: string;
  draw_code: string;
  first: FirstPrize;
  prizes: PrizeData;
}) {
  let lottery_code = data.draw_code.split("-")[0].toUpperCase();
  let draw_name = data.draw_name;

  const matched = WEEKLY_LOTTERIES.find(
    (l) =>
      l.code === lottery_code ||
      l.name.toLowerCase() === data.draw_name.toLowerCase(),
  );

  if (matched) {
    lottery_code = matched.code;
    draw_name = matched.name;
  }

  const rowPayload = {
    draw_date: data.draw_date,
    draw_name,
    draw_code: data.draw_code,
    lottery_code,
    first_prize: data.first || {},
    prizes: data.prizes || {},
    created_at: new Date().toISOString(),
  };

  try {
    // 1. Check if record already exists for (draw_date, lottery_code) to OVERWRITE / UPDATE
    const { data: existing } = await supabase
      .from("draw_results")
      .select("id")
      .eq("draw_date", data.draw_date)
      .eq("lottery_code", lottery_code);

    if (existing && existing.length > 0) {
      const { data: updated, error: updateErr } = await supabase
        .from("draw_results")
        .update(rowPayload)
        .eq("id", existing[0].id)
        .select();

      if (!updateErr && updated && updated.length > 0) {
        return updated[0];
      }
    }

    // 2. Upsert if constraint exists
    const { data: upsertData, error: upsertError } = await supabase
      .from("draw_results")
      .upsert(rowPayload, { onConflict: "draw_date,lottery_code" })
      .select();

    if (!upsertError && upsertData && upsertData.length > 0) {
      return upsertData[0];
    }

    // 3. Fallback Insert
    const { data: inserted } = await supabase
      .from("draw_results")
      .insert(rowPayload)
      .select();

    return inserted ? inserted[0] : null;
  } catch (e) {
    console.warn("Supabase save error:", e);
    return null;
  }
}

export async function getDrawResultFromSupabase(
  lotteryCode: string,
  date?: string,
): Promise<StructuredDrawResult | null> {
  try {
    let query = supabase
      .from("draw_results")
      .select("*")
      .eq("lottery_code", lotteryCode.toUpperCase());
    if (date) {
      query = query.eq("draw_date", date);
    } else {
      query = query.order("draw_date", { ascending: false }).limit(1);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const row = data[0];
      let firstObj: FirstPrize = {};
      let prizesObj: PrizeData = {};

      try {
        firstObj = typeof row.first_prize === "string" ? JSON.parse(row.first_prize) : (row.first_prize || {});
      } catch {
        firstObj = {};
      }

      try {
        prizesObj = typeof row.prizes === "string" ? JSON.parse(row.prizes) : (row.prizes || {});
      } catch {
        prizesObj = {};
      }

      return {
        id: row.id,
        draw_date: row.draw_date,
        draw_name: row.draw_name,
        draw_code: row.draw_code,
        lottery_code: row.lottery_code,
        first: firstObj,
        prizes: prizesObj,
        created_at: row.created_at,
      };
    }
  } catch (e) {
    console.warn("Supabase getDrawResult note:", e);
  }

  return null;
}

export async function getDrawDatesFromSupabase(
  lotteryCode: string,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("draw_results")
      .select("draw_date")
      .eq("lottery_code", lotteryCode.toUpperCase())
      .order("draw_date", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => d.draw_date);
    }
  } catch (e) {
    console.warn("Supabase getDrawDates note:", e);
  }

  return [];
}

export async function fetchAllDrawResultsFromSupabase(): Promise<
  StructuredDrawResult[]
> {
  try {
    const { data, error } = await supabase
      .from("draw_results")
      .select("*")
      .order("draw_date", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((row) => {
        let firstObj: FirstPrize = {};
        let prizesObj: PrizeData = {};
        try {
          firstObj = typeof row.first_prize === "string" ? JSON.parse(row.first_prize) : (row.first_prize || {});
        } catch {
          firstObj = {};
        }
        try {
          prizesObj = typeof row.prizes === "string" ? JSON.parse(row.prizes) : (row.prizes || {});
        } catch {
          prizesObj = {};
        }
        return {
          id: row.id,
          draw_date: row.draw_date,
          draw_name: row.draw_name,
          draw_code: row.draw_code,
          lottery_code: row.lottery_code,
          first: firstObj,
          prizes: prizesObj,
          created_at: row.created_at,
        };
      });
    }
  } catch (e) {
    console.warn("Supabase fetchAll note:", e);
  }

  return [];
}

export async function searchTicketsInSupabase(queryTicket: string) {
  const rawQuery = queryTicket.trim().toUpperCase();
  const digitsOnly = rawQuery.replace(/\D/g, "");
  const normalizedQuery = rawQuery.replace(/\s+/g, "");
  const querySeries = rawQuery.replace(/\d/g, "").trim();

  const allResults = await fetchAllDrawResultsFromSupabase();
  const matches: Array<{
    draw_date: string;
    draw_name: string;
    draw_code: string;
    lottery_code: string;
    prize_tier: string;
    prize_amount?: string;
    ticket_matched: string;
  }> = [];

  for (const draw of allResults) {
    const firstTicketRaw = (draw.first?.ticket || "").trim().toUpperCase();
    const firstTicketNormalized = firstTicketRaw.replace(/\s+/g, "");
    const firstTicketDigits = firstTicketRaw.replace(/\D/g, "");
    const firstSeries = firstTicketRaw.replace(/\d/g, "").trim();

    const matchesFirstSeries = !querySeries || querySeries === firstSeries;

    if (
      firstTicketNormalized &&
      matchesFirstSeries &&
      (firstTicketNormalized === normalizedQuery ||
        (digitsOnly.length === 6 && firstTicketDigits === digitsOnly) ||
        (digitsOnly.length >= 2 && digitsOnly.length < 6 && firstTicketDigits.endsWith(digitsOnly)))
    ) {
      matches.push({
        draw_date: draw.draw_date,
        draw_name: draw.draw_name,
        draw_code: draw.draw_code,
        lottery_code: draw.lottery_code,
        prize_tier: "1st Prize Winner",
        prize_amount: draw.prizes.amounts?.["1st"] || "1,00,00,000/-",
        ticket_matched: draw.first.ticket || "",
      });
    }

    const tiers = [
      "consolation",
      "2nd",
      "3rd",
      "4th",
      "5th",
      "6th",
      "7th",
      "8th",
      "9th",
    ] as const;

    for (const tier of tiers) {
      const nums = draw.prizes?.[tier] || [];
      const amount = draw.prizes.amounts?.[tier];

      for (const num of nums) {
        const normNum = num.trim().toUpperCase().replace(/\s+/g, "");
        const numDigits = normNum.replace(/\D/g, "");
        const numSeries = normNum.replace(/\d/g, "").trim();

        const matchesItemSeries = !querySeries || !numSeries || querySeries === numSeries;

        if (
          matchesItemSeries &&
          (normNum === normalizedQuery ||
            (digitsOnly.length === 6 && numDigits === digitsOnly) ||
            (digitsOnly.length >= 2 && digitsOnly.length < 6 && numDigits.endsWith(digitsOnly)))
        ) {
          matches.push({
            draw_date: draw.draw_date,
            draw_name: draw.draw_name,
            draw_code: draw.draw_code,
            lottery_code: draw.lottery_code,
            prize_tier: tier === "consolation" ? "Consolation Prize" : `${tier} Prize`,
            prize_amount: amount,
            ticket_matched: num,
          });
        }
      }
    }
  }

  return matches;
}
