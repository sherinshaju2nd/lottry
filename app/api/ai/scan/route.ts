import { NextRequest, NextResponse } from "next/server";
import { scanTicketWithGemini } from "@/lib/gemini";
import { searchTicketsInSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType = "image/jpeg" } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image data is required (base64)." },
        { status: 400 }
      );
    }

    // 1. Scan image using Gemini Vision
    const scanned = await scanTicketWithGemini(image, mimeType);

    // 2. Perform database prize check if ticket number was detected
    let matches: any[] = [];
    const query = scanned.ticket_number || scanned.last_digits || "";
    
    if (query) {
      try {
        matches = await searchTicketsInSupabase(query);
      } catch (dbErr) {
        console.warn("Could not query supabase for ticket match:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      ticket: scanned,
      isWinner: matches.length > 0,
      matches,
    });
  } catch (error: any) {
    console.error("AI Ticket Scan Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to analyze ticket with AI.",
      },
      { status: 500 }
    );
  }
}
