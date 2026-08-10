import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";

export const dynamic = "force-dynamic";

async function handleCronExecution(req: NextRequest) {
  const startTime = Date.now();
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  // Verify CRON_SECRET if configured in environment variables
  if (process.env.CRON_SECRET) {
    const isBearerValid = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isCustomHeaderValid = cronHeader === process.env.CRON_SECRET;

    if (!isVercelCron && !isBearerValid && !isCustomHeaderValid) {
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

  let attempts = 0;
  const maxAttempts = 2; // 1 initial attempt + 1 retry on error
  let lastResult: { success: boolean; data?: any; error?: string } = {
    success: false,
    error: "Not executed",
  };

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Cron Attempt ${attempts}/${maxAttempts}] Executing lottery sync...`);

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
