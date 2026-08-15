import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";
import {
  checkIsDatePostponed,
  checkIsBumperDrawDate,
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

  // 3. Intelligent Multi-Phase Active Window Check (Phase 1 vs Phase 2)
  const todayIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const scheduledBumper = await checkIsBumperDrawDate(todayIST);
  const isBumperDay = Boolean(scheduledBumper);

  // Overall Start, Phase 1 End (Phase 2 Start), and Phase 2 End
  const phase1Start = isBumperDay
    ? (cronConfig.cron_bumper_start_time || "14:00")
    : (cronConfig.cron_start_time || "15:00");
  const phase1End = isBumperDay
    ? (cronConfig.cron_bumper_phase1_end_time || "16:00")
    : (cronConfig.cron_phase1_end_time || "16:00");
  const phase2End = isBumperDay
    ? (cronConfig.cron_bumper_end_time || "18:00")
    : (cronConfig.cron_end_time || "17:00");

  const phase1Freq = parseInt(
    (isBumperDay ? cronConfig.cron_bumper_frequency_mins : cronConfig.cron_frequency_mins) || "1",
    10
  ) || 1;
  const phase2Freq = parseInt(
    (isBumperDay ? cronConfig.cron_bumper_phase2_frequency_mins : cronConfig.cron_phase2_frequency_mins) || "5",
    10
  ) || 5;

  const nowIST = new Date();
  const timeStr = nowIST.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
  const [currH, currM] = timeStr.split(":").map(Number);
  const currentMinutes = (currH || 0) * 60 + (currM || 0);

  const [p1StartH, p1StartM] = phase1Start.split(":").map(Number);
  const p1StartMins = (p1StartH || 15) * 60 + (p1StartM || 0);

  const [p1EndH, p1EndM] = phase1End.split(":").map(Number);
  const p1EndMins = (p1EndH || 16) * 60 + (p1EndM || 0);

  const [p2EndH, p2EndM] = phase2End.split(":").map(Number);
  const p2EndMins = (p2EndH || 17) * 60 + (p2EndM || 0);

  const isForced = req.nextUrl.searchParams.get("force") === "true";

  // Check if inside entire active window (Phase 1 Start to Phase 2 End)
  const isInsideWindow = currentMinutes >= p1StartMins && currentMinutes <= p2EndMins;

  if (!isInsideWindow && !isForced) {
    const executionTimeMs = Date.now() - startTime;
    const windowMsg = `Cron execution skipped: Current IST time (${timeStr.slice(0, 5)}) is outside active ${isBumperDay ? `Bumper (${scheduledBumper?.name})` : "Weekly"} draw window (${phase1Start} - ${phase2End} IST).`;

    console.log(`[Cron Outside Window] ${windowMsg}`);

    await logCronExecutionInSupabase({
      trigger_source: isVercelCron ? "vercel_cron" : "pg_cron",
      status: "skipped",
      message: windowMsg,
      duration_ms: executionTimeMs,
    });

    return NextResponse.json(
      {
        success: true,
        skipped: true,
        outsideWindow: true,
        timestamp: new Date().toISOString(),
        executionTimeMs,
        message: windowMsg,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  }

  // Determine current active phase and applicable frequency
  let activePhaseName = "Phase 1 (Live Draw)";
  let currentEffectiveFreq = phase1Freq;

  if (currentMinutes >= p1StartMins && currentMinutes < p1EndMins) {
    activePhaseName = `Phase 1 [Live Draw: ${phase1Start} - ${phase1End}]`;
    currentEffectiveFreq = phase1Freq;
  } else if (currentMinutes >= p1EndMins && currentMinutes <= p2EndMins) {
    activePhaseName = `Phase 2 [Verification / Final: ${phase1End} - ${phase2End}]`;
    currentEffectiveFreq = phase2Freq;
  }

  // Frequency interval throttle check for the active phase
  if (currentEffectiveFreq > 1 && !isForced) {
    if ((currM % currentEffectiveFreq) !== 0) {
      const executionTimeMs = Date.now() - startTime;
      const freqMsg = `Cron execution skipped: In ${activePhaseName}, running on ${currentEffectiveFreq}-minute interval.`;

      return NextResponse.json(
        {
          success: true,
          skipped: true,
          frequencyThrottled: true,
          activePhase: activePhaseName,
          frequencyMins: currentEffectiveFreq,
          timestamp: new Date().toISOString(),
          executionTimeMs,
          message: freqMsg,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        }
      );
    }
  }

  // 4. Check if Today is marked as Postponed / No-Draw Day
  const postponement = await checkIsDatePostponed(todayIST);
  if (postponement && postponement.disable_cron && !isForced) {
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

  // 5. Execute lottery sync
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

