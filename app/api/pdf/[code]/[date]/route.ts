import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getDrawResultFromSupabase } from "@/lib/supabase";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string; date: string }> }
) {
  const { code, date } = await params;
  const result = await getDrawResultFromSupabase(code, date);

  if (!result) {
    const errorResponse = NextResponse.json({ success: false, error: "Draw result not found" }, { status: 404 });
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    return errorResponse;
  }

  // Create a PDF document
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  // Collect PDF bytes in a buffer
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // When doc ends, resolve
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Design the PDF
    const primaryColor = "#0B3C5D"; // Deep Blue
    const greyBg = "#F3F4F6"; // Light grey
    const darkText = "#1F2937";
    const lightText = "#6B7280";

    // 1. Header Title
    doc.fillColor(primaryColor).fontSize(24).font("Helvetica-Bold").text("KERALA STATE LOTTERY RESULTS", { align: "center" });
    doc.fontSize(12).font("Helvetica").fillColor(lightText).text("Unofficial Result Gazette Sheet • keralalotteryresultstoday.in", { align: "center" });
    doc.moveDown(1.5);

    // 2. Draw Info Panel
    const infoY = doc.y;
    doc.rect(40, infoY, 515, 70).fill(greyBg);
    doc.fillColor(darkText).font("Helvetica-Bold").fontSize(13);
    doc.text(`Lottery Draw: ${result.draw_name} (${result.draw_code})`, 55, infoY + 15);
    doc.text(`Draw Date: ${result.draw_date}`, 55, infoY + 39);
    doc.y = infoY + 70; // Advance cursor
    doc.moveDown(1.2);

    // 3. First Prize Block
    const firstPrizeY = doc.y;
    doc.rect(40, firstPrizeY, 515, 100).fill(primaryColor);
    
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(13).text("FIRST PRIZE WINNER", 55, firstPrizeY + 14);
    
    const ticketNo = result.first?.ticket || "N/A";
    doc.fillColor("#FBBF24").font("Helvetica-Bold").fontSize(32).text(ticketNo, 55, firstPrizeY + 32);
    
    const location = result.first?.location || "N/A";
    const agent = result.first?.agent || "N/A";
    const agencyNo = result.first?.agency_no || "N/A";
    doc.fillColor("#E2E8F0").font("Helvetica").fontSize(11).text(`Agent: ${agent} (${agencyNo}) | Location: ${location}`, 55, firstPrizeY + 72);
    
    doc.y = firstPrizeY + 100;
    doc.moveDown(1.5);

    // 4. Remaining Prize Tiers
    doc.fillColor(primaryColor).fontSize(16).font("Helvetica-Bold").text("PRIZE DRAW DETAILS", 40, doc.y);
    doc.moveDown(0.5);

    // Render other prizes dynamically
    const prizes = (result.prizes || {}) as Record<string, string[]>;
    for (const [tier, numbers] of Object.entries(prizes)) {
      if (Array.isArray(numbers) && numbers.length > 0) {
        // Prevent drawing text off-page
        if (doc.y > 670) {
          doc.addPage();
        }
        doc.fillColor(primaryColor).fontSize(13).font("Helvetica-Bold").text(`${tier} Prize:`, 40, doc.y);
        doc.moveDown(0.3);
        doc.fillColor(darkText).fontSize(11).font("Helvetica").text(numbers.join(", "), 40, doc.y, { width: 515 });
        doc.moveDown(1.0);
      }
    }

    // 5. Disclaimer / Footer
    doc.y = 750;
    doc.rect(40, doc.y, 515, 1).fill("#E5E7EB");
    doc.fillColor(lightText).fontSize(8).font("Helvetica").text("Disclaimer: This PDF result sheet is generated dynamically for informational purposes. Please cross-check numbers with the official Government Gazette published by the Kerala State Lotteries Department.", 40, doc.y + 8, { align: "center", width: 515 });

    doc.end();
  });

  const response = new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kerala-lottery-${code}-${date}.pdf"`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
  return response;
}
