import {
  checkIsDatePostponed,
  savePostponedDraw,
  deletePostponedDraw,
  getPostponedDraws,
  getLotteriesFromSupabase,
  saveLotteryToSupabase,
  checkIsBumperDrawDate,
  getCronConfigFromSupabase,
  updateCronConfigInSupabase,
  logCronExecutionInSupabase,
  getCronLogsFromSupabase,
} from "../lib/supabase";

async function runTest(name: string, fn: () => Promise<void>) {
  process.stdout.write(`⏳ Running: ${name}... `);
  try {
    await fn();
    console.log(`✅ [PASS]`);
  } catch (err: any) {
    console.log(`❌ [FAIL]`);
    console.error(`   Error: ${err.message || err}`);
    throw err;
  }
}

async function main() {
  console.log("==========================================================");
  console.log("🧪 KERALA LOTTERY COMPREHENSIVE FEATURES END-TO-END SUITE ");
  console.log("==========================================================\n");

  const todayIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const testDate = "2029-12-31";

  try {
    // 1. Postponed Spotter
    await runTest("1. Postponed Spotter: Create and Retrieve Postponed Date", async () => {
      const saved = await savePostponedDraw({
        draw_date: testDate,
        lottery_code: "ALL",
        status: "holiday",
        reason: "Automated Test Holiday",
        rescheduled_date: "2030-01-02",
        disable_cron: true,
      });

      if (!saved) throw new Error("Failed to save postponed draw to Supabase");

      const check = await checkIsDatePostponed(testDate);
      if (!check) throw new Error("checkIsDatePostponed failed to find saved postponement");
      if (check.status !== "holiday" || check.reason !== "Automated Test Holiday") {
        throw new Error(`Data mismatch: status=${check.status}, reason=${check.reason}`);
      }
      if (!check.disable_cron) throw new Error("disable_cron should be true");
    });

    await runTest("2. Postponed Spotter: Delete Postponed Date and Verify Cleared", async () => {
      const list = await getPostponedDraws(testDate);
      if (!list || list.length === 0) throw new Error("No postponement found to delete");

      const deleted = await deletePostponedDraw(list[0].id!);
      if (!deleted) throw new Error("Failed to delete postponed draw");

      const checkAfter = await checkIsDatePostponed(testDate);
      if (checkAfter) throw new Error("Postponement still exists after deletion");
    });

    // 2. Bumper Lottery
    await runTest("3. Bumper Lottery: Fetch and Verify Bumper Definitions", async () => {
      const lotteries = await getLotteriesFromSupabase();
      const bumpers = lotteries.filter((l) => l.is_bumper);
      if (bumpers.length === 0) throw new Error("No bumper lotteries found in Supabase");
      
      const onam = bumpers.find((b) => b.code === "TH" || b.name.includes("Thiruvonam"));
      if (!onam) throw new Error("Thiruvonam Bumper not found in database");
    });

    await runTest("4. Bumper Lottery: Test Dynamic Draw Date & Time Detection", async () => {
      const lotteries = await getLotteriesFromSupabase();
      const testBumper = lotteries.find((l) => l.is_bumper);
      if (!testBumper) throw new Error("No bumper found to test");

      const originalDate = testBumper.draw_date;
      await saveLotteryToSupabase({
        ...testBumper,
        draw_date: testDate,
        draw_time: "2:00 PM",
      });

      const detected = await checkIsBumperDrawDate(testDate);
      if (!detected) throw new Error(`checkIsBumperDrawDate failed to detect bumper on ${testDate}`);
      if (detected.code !== testBumper.code) throw new Error("Detected wrong bumper lottery code");

      await saveLotteryToSupabase({
        ...testBumper,
        draw_date: originalDate || undefined,
      });

      const cleaned = await checkIsBumperDrawDate(testDate);
      if (cleaned) throw new Error("Bumper lottery still detected after cleanup");
    });

    // 3. Cron Config
    await runTest("5. Cron Configuration: Read from app_config", async () => {
      const config = await getCronConfigFromSupabase();
      if (typeof config.cron_enabled !== "boolean") throw new Error("cron_enabled is not boolean");
      if (!config.cron_start_time) throw new Error("cron_start_time missing");
      if (!config.cron_end_time) throw new Error("cron_end_time missing");
      if (!config.cron_bumper_start_time) throw new Error("cron_bumper_start_time missing");
      if (!config.cron_bumper_end_time) throw new Error("cron_bumper_end_time missing");
    });

    await runTest("6. Cron Configuration: Update app_config and Verify Persistence", async () => {
      const updateRes = await updateCronConfigInSupabase({
        cron_bumper_start_time: "14:00",
        cron_bumper_end_time: "18:00",
        cron_start_time: "15:00",
        cron_end_time: "17:00",
        cron_frequency_mins: "3",
      });

      if (!updateRes.success) {
        throw new Error(`updateCronConfigInSupabase failed: ${updateRes.error}`);
      }

      const updated = await getCronConfigFromSupabase();
      if (updated.cron_bumper_start_time !== "14:00") {
        throw new Error(`Expected cron_bumper_start_time="14:00", got "${updated.cron_bumper_start_time}"`);
      }
      if (updated.cron_bumper_end_time !== "18:00") {
        throw new Error(`Expected cron_bumper_end_time="18:00", got "${updated.cron_bumper_end_time}"`);
      }
    });

    // 4. Cron Logs
    await runTest("7. Cron Logs: Insert and Retrieve Execution Log", async () => {
      const testMsg = `E2E Test Execution Run on ${new Date().toISOString()}`;
      await logCronExecutionInSupabase({
        trigger_source: "admin_manual",
        status: "success",
        message: testMsg,
        duration_ms: 123,
        details: { test: true },
      });

      const logs = await getCronLogsFromSupabase(10);
      const match = logs.find((l) => l.message === testMsg);
      if (!match) throw new Error("Logged cron execution not found in getCronLogsFromSupabase");
      if (match.status !== "success" || match.duration_ms !== 123) {
        throw new Error("Logged cron entry details mismatch");
      }
    });

    // 5. Dual-Timing Calculations
    await runTest("8. Window Engine: Verify Dual-Timing Calculations for Bumper vs Weekly", async () => {
      const config = await getCronConfigFromSupabase();

      const weeklyStart = config.cron_start_time || "15:00";
      const weeklyEnd = config.cron_end_time || "17:00";
      const [wStartH] = weeklyStart.split(":").map(Number);
      const [wEndH] = weeklyEnd.split(":").map(Number);

      if (wStartH !== 15 || wEndH !== 17) {
        throw new Error(`Weekly window mismatch: ${weeklyStart} - ${weeklyEnd}`);
      }

      const bumperStart = config.cron_bumper_start_time || "14:00";
      const bumperEnd = config.cron_bumper_end_time || "18:00";
      const [bStartH] = bumperStart.split(":").map(Number);
      const [bEndH] = bumperEnd.split(":").map(Number);

      if (bStartH !== 14 || bEndH !== 18) {
        throw new Error(`Bumper window mismatch: ${bumperStart} - ${bumperEnd}`);
      }
    });

    console.log("\n==========================================================");
    console.log("🎉 ALL 8 TESTS PASSED SUCCESSFULLY! (100% FEATURE HEALTH) ");
    console.log("==========================================================");
  } catch (e: any) {
    console.error("\n❌ SUITE FAILED AT STEP ABOVE");
    process.exit(1);
  }
}

main();
