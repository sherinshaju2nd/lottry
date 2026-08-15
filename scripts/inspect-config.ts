import { supabase, getCronConfigFromSupabase } from "../lib/supabase";

async function inspect() {
  const { data: postponed, error: pErr } = await supabase.from("postponed_draws").select("*");
  console.log("=== POSTPONED DRAWS ===");
  console.log(postponed, pErr);

  console.log("=== CRON CONFIG FROM SUPABASE ===");
  const config = await getCronConfigFromSupabase();
  console.log(config);

  const { data: rawConfig } = await supabase.from("app_config").select("*");
  console.log("=== RAW APP CONFIG ===");
  console.log(rawConfig);
}

inspect();
