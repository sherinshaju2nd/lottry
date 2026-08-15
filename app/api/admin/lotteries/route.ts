import { NextRequest, NextResponse } from "next/server";
import {
  getLotteriesFromSupabase,
  saveLotteryToSupabase,
  deleteLotteryFromSupabase,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lotteries = await getLotteriesFromSupabase();
    return NextResponse.json({ success: true, lotteries });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch lotteries";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name and code" },
        { status: 400 }
      );
    }

    const result = await saveLotteryToSupabase(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Lottery record saved successfully",
      lottery: result.data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save lottery";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    const success = await deleteLotteryFromSupabase(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete lottery" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lottery deleted successfully",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
