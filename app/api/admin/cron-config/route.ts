import { NextRequest, NextResponse } from "next/server";
import {
  getCronConfigFromSupabase,
  updateCronConfigInSupabase,
  getCronLogsFromSupabase,
  getPostponedDraws,
} from "@/lib/supabase";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import { logCronExecutionInSupabase, checkIsDatePostponed } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [config, logs, postponed] = await Promise.all([
      getCronConfigFromSupabase(),
      getCronLogsFromSupabase(30),
      getPostponedDraws(),
    ]);

    return NextResponse.json({
      success: true,
      config,
      logs,
      postponed,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch cron configuration";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "update_config";

    if (action === "update_config") {
      const { cron_enabled, cron_start_time, cron_end_time, cron_frequency_mins, app_url, cron_secret } = body;
      const updates: Record<string, string> = {};

      if (cron_enabled !== undefined) updates.cron_enabled = String(cron_enabled);
      if (cron_start_time) updates.cron_start_time = cron_start_time;
      if (cron_end_time) updates.cron_end_time = cron_end_time;
      if (cron_frequency_mins) updates.cron_frequency_mins = String(cron_frequency_mins);
      if (app_url) updates.app_url = app_url;
      if (cron_secret) updates.cron_secret = cron_secret;

      const success = await updateCronConfigInSupabase(updates);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Failed to update cron config in Supabase" },
          { status: 500 }
        );
      }

      const updated = await getCronConfigFromSupabase();
      return NextResponse.json({
        success: true,
        message: "Cron configuration updated successfully",
        config: updated,
      });
    }

    if (action === "test_run") {
      const startTime = Date.now();
      const todayIST = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      // Check postponement
      const postponement = await checkIsDatePostponed(todayIST);
      if (postponement && postponement.disable_cron) {
        const duration_ms = Date.now() - startTime;
        const msg = `Test run skipped: Today (${todayIST}) is marked as ${postponement.status.toUpperCase()} (${postponement.reason}).`;

        await logCronExecutionInSupabase({
          trigger_source: "admin_test_run",
          status: "skipped",
          message: msg,
          details: postponement,
          duration_ms,
        });

        return NextResponse.json({
          success: true,
          skipped: true,
          message: msg,
          duration_ms,
          postponement,
        });
      }

      const syncResult = await fetchAndSyncLatestLottery();
      const duration_ms = Date.now() - startTime;

      if (!syncResult.success) {
        await logCronExecutionInSupabase({
          trigger_source: "admin_test_run",
          status: "failed",
          message: syncResult.error || "Manual test sync failed",
          duration_ms,
        });

        return NextResponse.json({
          success: false,
          error: syncResult.error,
          duration_ms,
        });
      }

      await logCronExecutionInSupabase({
        trigger_source: "admin_test_run",
        status: "success",
        message: `Manual test sync success: ${syncResult.data?.draw_name} (${syncResult.data?.draw_code})`,
        details: syncResult.data,
        duration_ms,
      });

      return NextResponse.json({
        success: true,
        message: `Test run succeeded! Synced ${syncResult.data?.draw_name} (${syncResult.data?.draw_code}) for ${syncResult.data?.draw_date}`,
        data: syncResult.data,
        duration_ms,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cron config error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
