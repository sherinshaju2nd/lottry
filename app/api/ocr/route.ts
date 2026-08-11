import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image data (base64) is required" },
        { status: 400 }
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
    // 1. Two letters followed by space/hyphen/optional-chars and 6 digits: e.g., "BT 263322", "SS-192842"
    const ticketRegex = /([A-Z]{2})\s*[-_:/.]?\s*(\d{6})/gi;
    
    // 2. Just 6 digit numbers (fallback, in case the series prefix is missed by OCR)
    const sixDigitsRegex = /\b(\d{6})\b/g;

    const ticketsFound: string[] = [];

    // Search full ticket matches (Prefix + Number)
    let match;
    while ((match = ticketRegex.exec(text)) !== null) {
      const prefix = match[1].toUpperCase();
      const number = match[2];
      ticketsFound.push(`${prefix} ${number}`);
    }

    // Search for any loose 6 digit numbers
    let digitMatch;
    while ((digitMatch = sixDigitsRegex.exec(text)) !== null) {
      const number = digitMatch[1];
      // Avoid duplicate matches
      const isAlreadyMatched = ticketsFound.some(t => t.endsWith(number));
      if (!isAlreadyMatched) {
        ticketsFound.push(number);
      }
    }

    return NextResponse.json({
      success: true,
      rawText: text,
      tickets: ticketsFound,
    });
  } catch (error: any) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image OCR" },
      { status: 500 }
    );
  }
}
