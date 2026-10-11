import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getDrawResultFromSupabase } from "@/lib/supabase";
import path from "path";
import fs from "fs";

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
  { params }: { params: Promise<{ code: string; date: string }> },
) {
  const { code, date } = await params;
  const result = await getDrawResultFromSupabase(code, date);

  if (!result) {
    const errorResponse = NextResponse.json(
      { success: false, error: "Draw result not found" },
      { status: 404 },
    );
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    return errorResponse;
  }

  // Create a PDF document with buffered pages for consistent footers
  const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });

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

    // 1. Header with Logo & Brand Name
    const possibleLogoPaths = [
      path.join(process.cwd(), "public", "logo-round-192.png"),
      path.join(process.cwd(), "frontend", "public", "logo-round-192.png"),
      path.join(process.cwd(), "public", "logo-round-512.png"),
      path.join(process.cwd(), "frontend", "public", "logo-round-512.png"),
    ];
    const logoPath = possibleLogoPaths.find((p) => fs.existsSync(p));

    if (logoPath) {
      const logoWidth = 46;
      const logoX = (595.28 - logoWidth) / 2;
      doc.image(logoPath, logoX, 32, { width: logoWidth });
      doc.y = 84;
    } else {
      doc.y = 40;
    }

    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Kerala Lottery Results Today", { align: "center" });
    doc.moveDown(0.2);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#2563EB")
      .text("keralalotteryresultstoday.in", {
        align: "center",
        link: "https://keralalotteryresultstoday.in",
        underline: true,
      });
    doc.moveDown(1.0);

    // 2. Draw Info Panel
    const infoY = doc.y;
    doc.rect(40, infoY, 515, 68).fill(greyBg);
    doc.fillColor(darkText).font("Helvetica-Bold").fontSize(13);
    doc.text(
      `Lottery Draw: ${result.draw_name} (${result.draw_code})`,
      55,
      infoY + 15,
    );
    doc.text(`Draw Date: ${result.draw_date}`, 55, infoY + 39);
    doc.y = infoY + 68; // Advance cursor
    doc.moveDown(1.2);

    // 3. First Prize Block
    const firstPrizeY = doc.y;
    doc.rect(40, firstPrizeY, 515, 96).fill(primaryColor);

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("FIRST PRIZE WINNER", 55, firstPrizeY + 14);

    const ticketNo = result.first?.ticket || "N/A";
    doc
      .fillColor("#FBBF24")
      .font("Helvetica-Bold")
      .fontSize(32)
      .text(ticketNo, 55, firstPrizeY + 30);

    const location = result.first?.location || "N/A";
    const agent = result.first?.agent || "N/A";
    const agencyNo = result.first?.agency_no || "N/A";
    doc
      .fillColor("#E2E8F0")
      .font("Helvetica")
      .fontSize(11)
      .text(
        `Agent: ${agent} (${agencyNo}) | Location: ${location}`,
        55,
        firstPrizeY + 70,
      );

    doc.y = firstPrizeY + 96;
    doc.moveDown(1.2);

    // 4. Remaining Prize Tiers
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("PRIZE DRAW DETAILS", 40, doc.y);
    doc.moveDown(0.5);

    // Render other prizes in official chronological tier order
    const tierOrder = [
      "consolation",
      "2nd",
      "3rd",
      "4th",
      "5th",
      "6th",
      "7th",
      "8th",
      "9th",
      "guess",
      "mc",
    ] as const;
    const amounts = (result.prizes?.amounts || {}) as Record<string, string>;

    for (const tier of tierOrder) {
      const numbers = (result.prizes as any)?.[tier] as string[] | undefined;
      if (Array.isArray(numbers) && numbers.length > 0) {
        // Prevent drawing text off-page
        if (doc.y > 660) {
          doc.addPage();
        }
        const label =
          tier === "consolation"
            ? "Consolation Prize"
            : tier === "guess"
              ? "Guessing Numbers"
              : tier === "mc"
                ? "Machine Center (MC) Numbers"
                : `${tier} Prize`;
        const amountStr = amounts[tier] ? ` (${amounts[tier]})` : "";
        doc
          .fillColor(primaryColor)
          .fontSize(13)
          .font("Helvetica-Bold")
          .text(`${label}${amountStr}:`, 40, doc.y);
        doc.moveDown(0.3);
        doc
          .fillColor(darkText)
          .fontSize(11)
          .font("Helvetica")
          .text(numbers.join(", "), 40, doc.y, { width: 515 });
        doc.moveDown(1.0);
      }
    }

    // 5. Disclaimer / Footer on all pages
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const footerY = 765;
      doc.rect(40, footerY, 515, 1).fill("#E5E7EB");

      doc
        .fillColor(lightText)
        .fontSize(7.5)
        .font("Helvetica")
        .text(
          "Disclaimer: This PDF result sheet is generated dynamically for informational purposes. Please cross-check numbers with the official Government Result published by the Kerala State Lotteries Department.",
          40,
          footerY + 18,
          { align: "center", width: 515 },
        );
    }

    doc.end();
  });

  const response = new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kerala-lottery-${code}-${date}.pdf"`,
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
  return response;
}
