import { supabase, getCronConfigFromSupabase } from "../lib/supabase";

async function inspect() {
  console.log("=== CRON CONFIG FROM SUPABASE ===");
  const config = await getCronConfigFromSupabase();
  console.log(JSON.stringify(config, null, 2));
}

inspect();
