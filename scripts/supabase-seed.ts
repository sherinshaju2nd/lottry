import { supabase, WEEKLY_LOTTERIES } from "../lib/supabase";
import { fetchAndSyncLatestLottery } from "../lib/lottery-sync";

async function runSupabaseMigrationAndSeed() {
  console.log("🚀 Starting Supabase Migration & Seeding Script...");

  // 1. Seed Master Lotteries Table
  console.log("📌 Seeding 7 Weekly Lotteries into Supabase `lotteries` table...");
  for (const item of WEEKLY_LOTTERIES) {
    const { error } = await supabase.from("lotteries").upsert(
      {
        day: item.day,
        name: item.name,
        code: item.code,
        draw_time: "3:00 PM",
      },
      { onConflict: "code" }
    );

    if (error) {
      console.warn(`Note on lottery ${item.code}:`, error.message);
    } else {
      console.log(`✓ Seeded ${item.name} (${item.code}) - ${item.day}`);
    }
  }

  // 2. Sync Initial Draw Data from IndiaLotteryAPI into Supabase `draw_results` table
  console.log("\n🌐 Fetching latest draw results from https://indialotteryapi.com/wp-json/klr/v1/latest...");
  const syncResult = await fetchAndSyncLatestLottery();

  if (syncResult.success && syncResult.data) {
    console.log(`✅ Successfully synced draw: ${syncResult.data.draw_name} (${syncResult.data.draw_code}) on ${syncResult.data.draw_date}`);
  } else {
    console.warn("⚠️ Initial sync note:", syncResult.error);
  }

  // 3. Verify Supabase Table Contents
  const { data: lotteries } = await supabase.from("lotteries").select("code, name, day");
  const { data: draws } = await supabase.from("draw_results").select("draw_date, draw_name, draw_code");

  console.log("\n==========================================");
  console.log(`🎉 Supabase Migration Complete!`);
  console.log(`• Lotteries in Supabase: ${lotteries?.length || 0}`);
  console.log(`• Draw Results in Supabase: ${draws?.length || 0}`);
  console.log("==========================================\n");
}

runSupabaseMigrationAndSeed().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
