import { supabase, getCronConfigFromSupabase } from "../lib/supabase";

async function inspect() {
  const { data, error } = await supabase.from('draw_results').select('*').order('created_at', { ascending: false }).limit(2);
  console.log("=== RECENT DRAWS ===", JSON.stringify(data, null, 2));
}

inspect();
