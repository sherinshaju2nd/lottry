import { fetchAndSyncLatestLottery } from "../lib/lottery-sync";

async function main() {
  console.log("=== Kerala Lottery Cron Sync Test ===");
  console.log("Starting manual trigger test for fetchAndSyncLatestLottery()...\n");

  const startTime = Date.now();
  try {
    const result = await fetchAndSyncLatestLottery();
    const durationMs = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ SUCCESS! Executed in ${durationMs}ms`);
      console.log("Synced Draw Data:", JSON.stringify(result.data, null, 2));
    } else {
      console.error(`❌ FAILED after ${durationMs}ms`);
      console.error("Error Message:", result.error);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
  }
}

main();
