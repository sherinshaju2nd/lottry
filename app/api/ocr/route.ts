import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image data (base64) is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Clean base64 string if it contains the header
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(cleanBase64, "base64");

    // Initialize Tesseract worker
    const worker = await createWorker("eng");
    
    // Recognize text from image buffer
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    console.log("OCR Extracted Text:", text);

    // Regular expressions for Kerala Lotteries:
    // 1. Two letters followed by space/hyphen/optional-chars and 6 digits: e.g., "BP 704781", "BT 263322", "SS-192842"
    const ticketRegex = /([A-Z]{2})\s*[-_:/.]?\s*(\d{6})/gi;

    // 2. Two letters followed by 3 digits and 3 digits: e.g., "BP 704 781"
    const ticketSplitRegex = /([A-Z]{2})\s*[-_:/.]?\s*(\d{3})\s+(\d{3})/gi;
    
    // 3. Standalone 6 digit numbers
    const sixDigitsRegex = /\b(\d{6})\b/g;

    const ticketsFound: string[] = [];

    // Search full ticket matches (Prefix + 6 digits)
    let match;
    while ((match = ticketRegex.exec(text)) !== null) {
      const prefix = match[1].toUpperCase();
      const number = match[2];
      const fullTicket = `${prefix} ${number}`;
      if (!ticketsFound.includes(fullTicket)) {
        ticketsFound.push(fullTicket);
      }
    }

    // Search split digit ticket matches (Prefix + 3 digits + 3 digits)
    let splitMatch;
    while ((splitMatch = ticketSplitRegex.exec(text)) !== null) {
      const prefix = splitMatch[1].toUpperCase();
      const number = `${splitMatch[2]}${splitMatch[3]}`;
      const fullTicket = `${prefix} ${number}`;
      if (!ticketsFound.includes(fullTicket)) {
        ticketsFound.push(fullTicket);
      }
    }

    // Search for any loose 6 digit numbers
    let digitMatch;
    while ((digitMatch = sixDigitsRegex.exec(text)) !== null) {
      const number = digitMatch[1];
      const isAlreadyMatched = ticketsFound.some(t => t.endsWith(number));
      if (!isAlreadyMatched) {
        ticketsFound.push(number);
      }
    }

    return NextResponse.json(
      {
        success: true,
        rawText: text,
        tickets: ticketsFound,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image OCR" },
      { status: 500, headers: corsHeaders }
    );
  }
}
