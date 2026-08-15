import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import {
  checkIsDatePostponed,
  getCronConfigFromSupabase,
  logCronExecutionInSupabase,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function handleCronExecution(req: NextRequest) {
  const startTime = Date.now();
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  // 1. Fetch live cron configurations from Supabase
  const cronConfig = await getCronConfigFromSupabase();
  const secretKey = process.env.CRON_SECRET || cronConfig.cron_secret;

  // Verify CRON_SECRET if configured
  if (secretKey) {
    const isBearerValid = authHeader === `Bearer ${secretKey}`;
    const isCustomHeaderValid = cronHeader === secretKey;

    if (!isVercelCron && !isBearerValid && !isCustomHeaderValid) {
      await logCronExecutionInSupabase({
        trigger_source: isVercelCron ? "vercel_cron" : "pg_cron",
        status: "failed",
        message: "Unauthorized: Invalid or missing CRON_SECRET",
        duration_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          success: false,
          timestamp: new Date().toISOString(),
          error: "Unauthorized: Invalid or missing CRON_SECRET",
        },
        { status: 401 }
      );
    }
  }

  // 2. Check Master Cron Toggle Switch
  if (!cronConfig.cron_enabled) {
    const executionTimeMs = Date.now() - startTime;
    await logCronExecutionInSupabase({
      trigger_source: isVercelCron ? "vercel_cron" : "pg_cron",
      status: "skipped",
      message: "Cron execution skipped: Master cron is disabled in Admin Control Center.",
      duration_ms: executionTimeMs,
    });

    return NextResponse.json(
      {
        success: true,
        skipped: true,
        timestamp: new Date().toISOString(),
        executionTimeMs,
        message: "Cron execution skipped: Master cron is disabled in Admin Control Center.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  }

  // 3. Check if Today is marked as Postponed / No-Draw Day
  const todayIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const postponement = await checkIsDatePostponed(todayIST);
  if (postponement && postponement.disable_cron) {
    const executionTimeMs = Date.now() - startTime;
    const skipMsg = `Cron execution skipped: Draw on ${todayIST} is marked as ${postponement.status.toUpperCase()} (${postponement.reason})${postponement.rescheduled_date ? ` and rescheduled to ${postponement.rescheduled_date}` : ""}.`;

    console.log(`[Cron Skipped] ${skipMsg}`);

    await logCronExecutionInSupabase({
      trigger_source: isVercelCron ? "vercel_cron" : "pg_cron",
      status: "skipped",
      message: skipMsg,
      details: postponement,
      duration_ms: executionTimeMs,
    });

    return NextResponse.json(
      {
        success: true,
        skipped: true,
        postponed: true,
        timestamp: new Date().toISOString(),
        executionTimeMs,
        message: skipMsg,
        postponement,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  }

  // 4. Execute lottery sync
  let attempts = 0;
  const maxAttempts = 2; // 1 initial attempt + 1 retry on error
  let lastResult: { success: boolean; data?: any; error?: string } = {
    success: false,
    error: "Not executed",
  };

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Cron Attempt ${attempts}/${maxAttempts}] Executing lottery sync for ${todayIST}...`);

    lastResult = await fetchAndSyncLatestLottery();

    if (lastResult.success) {
      break;
    }

    // Wait 2 seconds before retrying if initial attempt failed
    if (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const executionTimeMs = Date.now() - startTime;

  if (!lastResult.success) {
    console.error(`[Cron Error] ${lastResult.error}`);
    await logCronExecutionInSupabase({
      trigger_source: isVercelCron ? "vercel_cron" : "pg_cron",
      status: "failed",
      message: lastResult.error || "Failed to sync latest lottery draw after retries",
      duration_ms: executionTimeMs,
      details: { attempts },
    });

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs,
        attempts,
        error: lastResult.error || "Failed to sync latest lottery draw after retries",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  await logCronExecutionInSupabase({
    trigger_source: isVercelCron ? "vercel_cron" : "pg_cron",
    status: "success",
    message: `Successfully synced draw: ${lastResult.data?.draw_name} (${lastResult.data?.draw_code})`,
    details: {
      draw_name: lastResult.data?.draw_name,
      draw_code: lastResult.data?.draw_code,
      draw_date: lastResult.data?.draw_date,
      first_prize: lastResult.data?.first?.ticket,
      attempts,
    },
    duration_ms: executionTimeMs,
  });

  return NextResponse.json(
    {
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs,
      attempts,
      message: "Cron job executed successfully. Latest draw result synced in Supabase.",
      data: lastResult.data,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function GET(req: NextRequest) {
  return handleCronExecution(req);
}

export async function POST(req: NextRequest) {
  return handleCronExecution(req);
}

