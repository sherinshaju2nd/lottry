import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { parseLotteryPdfWithGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { fileBase64, mimeType = "application/pdf" } = body;

    if (!fileBase64) {
      return NextResponse.json(
        { success: false, error: "PDF/Image fileBase64 data is required." },
        { status: 400 }
      );
    }

    const result = await parseLotteryPdfWithGemini(fileBase64, mimeType);

    return NextResponse.json({
      success: true,
      message: "Gazette result sheet successfully parsed by Gemini AI",
      data: result,
    });
  } catch (error: any) {
    console.error("AI PDF Parse Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to extract lottery results from document.",
      },
      { status: 500 }
    );
  }
}
