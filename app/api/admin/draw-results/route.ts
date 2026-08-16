import { NextRequest, NextResponse } from "next/server";
import {
  saveManualDrawResultToSupabase,
  deleteDrawResultFromSupabase,
  fetchAllDrawResultsFromSupabase,
  getDrawResultFromSupabase,
} from "@/lib/supabase";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const date = searchParams.get("date");

    if (code) {
      const result = await getDrawResultFromSupabase(code, date || undefined);
      return NextResponse.json({ success: true, result });
    }

    const results = await fetchAllDrawResultsFromSupabase(true);
    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch draw results";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body.draw_date || !body.draw_code || !body.lottery_code || !body.draw_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: draw_date, draw_code, lottery_code, draw_name",
        },
        { status: 400 }
      );
    }

    const result = await saveManualDrawResultToSupabase(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Draw result saved successfully",
      data: result.data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save draw result";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

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
    const success = await deleteDrawResultFromSupabase(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete draw result" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Draw result deleted successfully",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
