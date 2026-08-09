import { NextResponse } from "next/server";
import { fetchAndSyncLatestLottery } from "@/lib/lottery-sync";

export async function GET() {
  const result = await fetchAndSyncLatestLottery();

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: result.error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: "Cron job executed successfully. Latest lottery data synced to Supabase.",
    data: result.data,
  });
}
