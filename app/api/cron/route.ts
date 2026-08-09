import { NextRequest, NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Optional Vercel Cron Security Check
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (process.env.CRON_SECRET && !isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized cron request" }, { status: 401 });
  }

  let attempts = 0;
  const maxAttempts = 2; // 1 initial attempt + 1 retry on error
  let lastResult: { success: boolean; data?: any; error?: string } = { success: false, error: "Not started" };

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

  if (!lastResult.success) {
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      attempts,
      error: lastResult.error || "Failed to sync latest draw after 1 retry",
    });
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    attempts,
    message: "Cron job executed successfully. Latest draw result synced and updated in Supabase.",
    data: lastResult.data,
  });
}
