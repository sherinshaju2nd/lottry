import { NextRequest, NextResponse } from "next/server";
import {
  getPostponedDraws,
  savePostponedDraw,
  deletePostponedDraw,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const list = await getPostponedDraws(date);
    return NextResponse.json({ success: true, list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch postponed draws";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.draw_date || !body.reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: draw_date and reason" },
        { status: 400 }
      );
    }

    const result = await savePostponedDraw({
      id: body.id,
      draw_date: body.draw_date,
      lottery_code: body.lottery_code || "ALL",
      status: body.status || "postponed",
      reason: body.reason,
      rescheduled_date: body.rescheduled_date || null,
      disable_cron: body.disable_cron ?? true,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Postponed / no-draw date saved successfully",
      data: result.data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save postponed draw";
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
    const success = await deletePostponedDraw(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete postponed entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Postponed entry deleted successfully",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
