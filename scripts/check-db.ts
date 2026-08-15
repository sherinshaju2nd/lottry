import fs from "fs";
import path from "path";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

import { supabase } from "../lib/supabase";

async function check() {
  const { data: lotteries, error: lErr } = await supabase.from("lotteries").select("*");
  console.log("LOTTERIES:", lotteries, lErr);
  const { data: draws, error: dErr } = await supabase.from("draw_results").select("id, draw_date, draw_name, draw_code, lottery_code").order("draw_date", { ascending: false }).limit(10);
  console.log("RECENT DRAWS:", draws, dErr);
}

check();
