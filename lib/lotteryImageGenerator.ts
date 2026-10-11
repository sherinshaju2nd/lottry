import QRCode from "qrcode";

export type LotteryImageFormat = "story" | "portrait" | "square" | "full";

export interface LotteryPostImageOptions {
  drawResult?: {
    draw_date?: string;
    draw_name?: string;
    draw_code?: string;
    lottery_code?: string;
    first?: {
      ticket?: string;
      location?: string;
      agent?: string;
      agency_no?: string;
    };
    prizes?: {
      consolation?: string[];
      "2nd"?: string[];
      "3rd"?: string[];
      "4th"?: string[];
      "5th"?: string[];
      "6th"?: string[];
      "7th"?: string[];
      "8th"?: string[];
      "9th"?: string[];
      amounts?: Record<string, string>;
    };
  } | null;
  lotteryInfo?: {
    name?: string;
    nameMl?: string;
    code?: string;
    jackpot?: string;
    ticket_price?: string;
    day?: string;
    is_bumper?: boolean;
  } | null;
  format?: LotteryImageFormat; // story: 1080x1920, portrait: 1080x1350, square: 1080x1080, full: auto-height
  siteUrl?: string;
}

interface TierConfig {
  key: string;
  label: string;
  emoji: string;
  color: string;
  borderColor: string;
  chipBg: string;
  chipColor: string;
}

const ALL_TIERS: TierConfig[] = [
  {
    key: "consolation",
    label: "Consolation Prize",
    emoji: "🎖️",
    color: "#38BDF8",
    borderColor: "rgba(56, 189, 248, 0.4)",
    chipBg: "#0C2E52",
    chipColor: "#E2E8F0",
  },
  {
    key: "2nd",
    label: "2nd Prize",
    emoji: "🥈",
    color: "#F59E0B",
    borderColor: "rgba(245, 158, 11, 0.5)",
    chipBg: "#1C2D42",
    chipColor: "#67E8F9",
  },
  {
    key: "3rd",
    label: "3rd Prize",
    emoji: "🥉",
    color: "#FDE047",
    borderColor: "rgba(253, 224, 71, 0.4)",
    chipBg: "#162E48",
    chipColor: "#FEF08A",
  },
  {
    key: "4th",
    label: "4th Prize",
    emoji: "⭐",
    color: "#60A5FA",
    borderColor: "rgba(96, 165, 250, 0.35)",
    chipBg: "#0B2644",
    chipColor: "#F1F5F9",
  },
  {
    key: "5th",
    label: "5th Prize",
    emoji: "🔹",
    color: "#A78BFA",
    borderColor: "rgba(167, 139, 250, 0.35)",
    chipBg: "#162642",
    chipColor: "#F1F5F9",
  },
  {
    key: "6th",
    label: "6th Prize",
    emoji: "🔸",
    color: "#34D399",
    borderColor: "rgba(52, 211, 153, 0.35)",
    chipBg: "#0B2636",
    chipColor: "#F1F5F9",
  },
  {
    key: "7th",
    label: "7th Prize",
    emoji: "⚡",
    color: "#F472B6",
    borderColor: "rgba(244, 114, 182, 0.35)",
    chipBg: "#1E223D",
    chipColor: "#F1F5F9",
  },
  {
    key: "8th",
    label: "8th Prize",
    emoji: "✨",
    color: "#38BDF8",
    borderColor: "rgba(56, 189, 248, 0.35)",
    chipBg: "#0A243D",
    chipColor: "#F1F5F9",
  },
  {
    key: "9th",
    label: "9th Prize",
    emoji: "🎯",
    color: "#E2E8F0",
    borderColor: "rgba(226, 232, 240, 0.35)",
    chipBg: "#122538",
    chipColor: "#F1F5F9",
  },
];

/**
 * Helper to safely draw rounded rectangles with arc fallback
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * Helper to compute the total height required so that 100% of numbers from 1 to 9 + Consolation fit.
 */
function computeTotalRequiredHeight(
  drawResult: any,
  usableWidth: number,
): number {
  // Header: ~180px
  // 1st Prize Hero: ~210px
  // Footer: ~160px
  // Top/bottom margins: ~60px
  let totalH = 180 + 210 + 160 + 60;

  for (const tier of ALL_TIERS) {
    const rawNums = (drawResult?.prizes as any)?.[tier.key];
    const nums: string[] = Array.isArray(rawNums) ? rawNums : [];
    const amt = drawResult?.prizes?.amounts?.[tier.key];

    if (nums.length === 0 && !amt) continue;

    // Header bar height inside card
    let tierCardH = 46;

    if (nums.length > 0) {
      let currentLineWidth = 0;
      let rows = 1;
      const isLongChip = nums.some(
        (n) => typeof n === "string" && n.length > 5,
      );
      const chipW = isLongChip ? 148 : 88;
      const chipH = 32;
      const gap = 8;
      const availableInnerW = usableWidth - 36;

      for (let i = 0; i < nums.length; i++) {
        if (currentLineWidth + chipW > availableInnerW) {
          rows++;
          currentLineWidth = chipW + gap;
        } else {
          currentLineWidth += chipW + gap;
        }
      }
      tierCardH += rows * (chipH + gap) + 16;
    } else {
      tierCardH += 40;
    }

    totalH += tierCardH + 16; // card + spacing
  }

  return totalH;
}

/**
 * Generate high-definition HTML5 canvas for Instagram & Facebook daily lottery post with ALL RESULTS (1 to 9 & Cons)
 */
export async function generateLotteryPostCanvas(
  options: LotteryPostImageOptions,
): Promise<HTMLCanvasElement> {
  const {
    drawResult,
    lotteryInfo,
    format = "story",
    siteUrl = "https://www.keralalotteryresultstoday.in",
  } = options;

  const width = 1080;
  const cardX = 44;
  const cardW = width - 88; // 992px usable width

  // Compute exact height so NO number is ever truncated
  const neededHeight = computeTotalRequiredHeight(drawResult, cardW);

  let height = 1920;
  if (format === "story") {
    height = Math.max(1920, neededHeight);
  } else if (format === "portrait") {
    height = Math.max(1350, neededHeight);
  } else if (format === "square") {
    height = Math.max(1080, neededHeight);
  } else {
    // "full"
    height = Math.max(1200, neededHeight);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. LUXURY BACKGROUND GRADIENT
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#051A36");
  bgGrad.addColorStop(0.25, "#0A2E52");
  bgGrad.addColorStop(0.65, "#0B3C5D");
  bgGrad.addColorStop(1, "#041426");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. RADIAL AMBIENT GLOW
  const glowY = 270;
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    glowY,
    50,
    width / 2,
    glowY,
    500,
  );
  radialGlow.addColorStop(0, "rgba(245, 158, 11, 0.18)");
  radialGlow.addColorStop(0.5, "rgba(59, 130, 246, 0.08)");
  radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. OUTER GOLD BORDER
  ctx.save();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 28);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 22);
  ctx.stroke();
  ctx.restore();

  // Extract variables
  const drawName =
    drawResult?.draw_name || lotteryInfo?.name || "Kerala State Lottery";
  const drawCode =
    drawResult?.draw_code || lotteryInfo?.code || "Official Draw";
  const drawDate =
    drawResult?.draw_date ||
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(),
    );

  // 4. HEADER SECTION
  let currY = 64;

  // Draw Title
  ctx.save();
  ctx.textAlign = "center";
  ctx.font =
    "900 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillText(`${drawName.toUpperCase()} (${drawCode})`, width / 2, currY);
  ctx.restore();
  currY += 34;

  // Date & Time Banner
  ctx.save();
  ctx.textAlign = "center";
  ctx.font =
    "800 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#FDE047";
  const dateBannerText = `🗓️ DRAW DATE: ${drawDate} ${lotteryInfo?.day ? `(${lotteryInfo.day.toUpperCase()})` : ""} • 3:00 PM DRAW`;
  ctx.fillText(dateBannerText, width / 2, currY);
  ctx.restore();
  currY += 26;

  // 5. 1ST PRIZE HERO CARD
  const heroH = 195;
  ctx.save();
  const heroGrad = ctx.createLinearGradient(cardX, currY, cardX, currY + heroH);
  heroGrad.addColorStop(0, "#0E345D");
  heroGrad.addColorStop(0.6, "#092544");
  heroGrad.addColorStop(1, "#05182C");
  ctx.fillStyle = heroGrad;
  drawRoundedRect(ctx, cardX, currY, cardW, heroH, 20);
  ctx.fill();

  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Ribbon Tag
  const ribbonW = 320;
  const ribbonH = 34;
  const ribbonX = (width - ribbonW) / 2;
  const ribbonY = currY - 15;
  const ribbonGrad = ctx.createLinearGradient(
    ribbonX,
    ribbonY,
    ribbonX + ribbonW,
    ribbonY,
  );
  ribbonGrad.addColorStop(0, "#D97706");
  ribbonGrad.addColorStop(0.5, "#FBBF24");
  ribbonGrad.addColorStop(1, "#D97706");
  ctx.fillStyle = ribbonGrad;
  drawRoundedRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 17);
  ctx.fill();
  ctx.strokeStyle = "#FEF08A";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font =
    "900 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";
  ctx.fillText("🏆 1ST PRIZE JACKPOT 🏆", width / 2, ribbonY + 23);
  ctx.letterSpacing = "0px";

  // Jackpot Amount
  const jackpotAmt =
    drawResult?.prizes?.amounts?.["1st"] || lotteryInfo?.jackpot || "₹1 CRORE";

  ctx.font =
    "900 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#FDE047";
  ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
  ctx.shadowBlur = 12;
  ctx.fillText(jackpotAmt.toUpperCase(), width / 2, currY + 62);
  ctx.shadowBlur = 0;

  // Winning Ticket Pill
  const ticketPillW = 460;
  const ticketPillH = 62;
  const ticketPillX = (width - ticketPillW) / 2;
  const ticketPillY = currY + 80;

  ctx.fillStyle = "#030F1D";
  drawRoundedRect(ctx, ticketPillX, ticketPillY, ticketPillW, ticketPillH, 14);
  ctx.fill();
  ctx.strokeStyle = "#38BDF8";
  ctx.lineWidth = 2;
  ctx.stroke();

  const winningTicket = drawResult?.first?.ticket?.trim();
  const isTicketPending =
    !winningTicket || winningTicket.toUpperCase() === "PENDING";
  ctx.font = isTicketPending
    ? "800 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    : "900 38px 'Courier New', monospace, sans-serif";
  ctx.fillStyle = isTicketPending ? "#F87171" : "#FFFFFF";
  ctx.letterSpacing = isTicketPending ? "1px" : "3px";
  ctx.fillText(
    isTicketPending ? "RESULT ANNOUNCING AT 3:10 PM" : winningTicket,
    width / 2,
    ticketPillY + (isTicketPending ? 39 : 44),
  );
  ctx.letterSpacing = "0px";

  // Location / Agent line
  ctx.font =
    "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#CBD5E1";
  const location = drawResult?.first?.location;
  const agent = drawResult?.first?.agent;
  let locAgentText = "";
  if (location && agent) {
    locAgentText = `📍 Location: ${location}   |   👤 Agent: ${agent}`;
  } else if (location) {
    locAgentText = `📍 Drawn Location / District: ${location}`;
  } else if (agent) {
    locAgentText = `👤 Selling Agent: ${agent}`;
  } else {
    locAgentText = "Directorate of Kerala State Lotteries, Thiruvananthapuram";
  }
  ctx.fillText(locAgentText, width / 2, currY + 172);
  ctx.restore();

  currY += heroH + 18;

  // 6. ALL OTHER TIERS: CONSOLATION, 2ND, 3RD, 4TH, 5TH, 6TH, 7TH, 8TH, 9TH
  for (const tier of ALL_TIERS) {
    const rawNums = (drawResult?.prizes as any)?.[tier.key];
    const nums: string[] = Array.isArray(rawNums) ? rawNums : [];
    const amt = drawResult?.prizes?.amounts?.[tier.key];

    if (nums.length === 0 && !amt) continue;

    // Calculate card height for this tier
    let tierCardH = 46;
    const isLongChip = nums.some((n) => typeof n === "string" && n.length > 5);
    const chipW = isLongChip ? 148 : 88;
    const chipH = 32;
    const gap = 8;
    const availableInnerW = cardW - 36;

    let rows = 1;
    if (nums.length > 0) {
      let currentLineWidth = 0;
      for (let i = 0; i < nums.length; i++) {
        if (currentLineWidth + chipW > availableInnerW) {
          rows++;
          currentLineWidth = chipW + gap;
        } else {
          currentLineWidth += chipW + gap;
        }
      }
      tierCardH += rows * (chipH + gap) + 16;
    } else {
      tierCardH += 40;
    }

    ctx.save();
    // Card background
    ctx.fillStyle = "rgba(7, 24, 46, 0.92)";
    drawRoundedRect(ctx, cardX, currY, cardW, tierCardH, 16);
    ctx.fill();

    ctx.strokeStyle = tier.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tier Header Bar
    ctx.textAlign = "left";
    ctx.font =
      "900 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = tier.color;
    ctx.fillText(
      `${tier.emoji} ${tier.label.toUpperCase()}`,
      cardX + 20,
      currY + 30,
    );

    // Prize Amount on Right
    if (amt) {
      ctx.textAlign = "right";
      ctx.font =
        "900 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`Amount: ${amt}`, cardX + cardW - 20, currY + 30);
    }

    // Render numbers in styled chips
    if (nums.length > 0) {
      let chipX = cardX + 18;
      let chipY = currY + 48;

      nums.forEach((num) => {
        if (chipX + chipW > cardX + cardW - 18) {
          chipX = cardX + 18;
          chipY += chipH + gap;
        }

        // Chip Background
        ctx.fillStyle = tier.chipBg;
        drawRoundedRect(ctx, chipX, chipY, chipW, chipH, 8);
        ctx.fill();
        ctx.strokeStyle = tier.borderColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Chip Number Text
        ctx.textAlign = "center";
        ctx.font = `800 ${isLongChip ? 15 : 16}px 'Courier New', monospace, sans-serif`;
        ctx.fillStyle = tier.chipColor;
        ctx.fillText(String(num), chipX + chipW / 2, chipY + 21);

        chipX += chipW + gap;
      });
    } else {
      ctx.textAlign = "center";
      ctx.font =
        "700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(
        "Official result numbers recorded in the State Gazette",
        width / 2,
        currY + 68,
      );
    }
    ctx.restore();

    currY += tierCardH + 14;
  }

  // 7. FOOTER & VERIFICATION QR SECTION
  const footerH = 150;
  const footerY = currY + 6;

  // Generate QR Code dynamically
  const targetResultUrl = `${siteUrl}/${drawResult?.lottery_code || lotteryInfo?.code || "kerala-lottery"}/${drawDate}`;
  let qrImage: HTMLImageElement | null = null;

  try {
    const qrDataUrl = await QRCode.toDataURL(targetResultUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: "#051A36",
        light: "#FFFFFF",
      },
    });

    qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("QR image load failed"));
      img.src = qrDataUrl;
    });
  } catch (err) {
    console.error("QR Code generation skipped:", err);
  }

  ctx.save();
  ctx.fillStyle = "rgba(4, 15, 29, 0.96)";
  drawRoundedRect(ctx, cardX, footerY, cardW, footerH, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // QR Code on right
  const qrSize = footerH - 32;
  const qrX = cardX + cardW - qrSize - 20;
  const qrY = footerY + 16;

  if (qrImage) {
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 10);
    ctx.fill();
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    ctx.font =
      "800 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#FDE047";
    ctx.textAlign = "center";
    ctx.fillText("SCAN FOR GAZETTE", qrX + qrSize / 2, qrY + qrSize + 18);
  }

  // Left Footer Info
  const textLeftX = cardX + 24;
  ctx.textAlign = "left";

  ctx.font =
    "800 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#38BDF8";
  ctx.fillText(
    "🛡️ 100% VERIFIED OFFICIAL KERALA STATE LOTTERIES RESULT",
    textLeftX,
    footerY + 36,
  );

  ctx.font =
    "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#94A3B8";
  ctx.fillText(
    "Verify winning tickets with the official Government Gazette before claiming prize.",
    textLeftX,
    footerY + 58,
  );

  ctx.font =
    "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("www.keralalotteryresultstoday.in", textLeftX, footerY + 94);

  ctx.font =
    "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#F59E0B";
  ctx.fillText(
    "📢 Share on WhatsApp, Facebook Groups & Instagram Stories",
    textLeftX,
    footerY + 120,
  );
  ctx.restore();

  return canvas;
}

/**
 * Generate JPEG Blob from canvas (high quality for social media)
 */
export async function generateLotteryPostJpegBlob(
  options: LotteryPostImageOptions,
): Promise<Blob> {
  const canvas = await generateLotteryPostCanvas(options);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate JPEG Blob from canvas"));
        }
      },
      "image/jpeg",
      0.96,
    );
  });
}

/**
 * Generate JPEG Data URL
 */
export async function generateLotteryPostDataUrl(
  options: LotteryPostImageOptions,
): Promise<string> {
  const canvas = await generateLotteryPostCanvas(options);
  return canvas.toDataURL("image/jpeg", 0.96);
}

/**
 * Trigger immediate download of the generated JPG image
 */
export async function downloadLotteryPostImage(
  options: LotteryPostImageOptions,
): Promise<void> {
  const blob = await generateLotteryPostJpegBlob(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const code =
    options.drawResult?.lottery_code || options.lotteryInfo?.code || "lottery";
  const date = options.drawResult?.draw_date || "today";
  const formatStr = options.format || "full-result";
  a.href = url;
  a.download = `kerala-lottery-${code.toLowerCase()}-${date}-${formatStr}-all-results.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Share via Web Share API if supported on device (iOS / Android / Chrome)
 */
export async function shareLotteryPostImage(
  options: LotteryPostImageOptions,
): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.share) {
    await downloadLotteryPostImage(options);
    return false;
  }

  try {
    const blob = await generateLotteryPostJpegBlob(options);
    const code =
      options.drawResult?.lottery_code ||
      options.lotteryInfo?.code ||
      "lottery";
    const date = options.drawResult?.draw_date || "today";
    const filename = `kerala-lottery-${code.toLowerCase()}-${date}-all-results.jpg`;
    const file = new File([blob], filename, { type: "image/jpeg" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${options.drawResult?.draw_name || "Kerala Lottery"} Result - ${date}`,
        text: `Kerala State Lottery ${options.drawResult?.draw_name || ""} (${options.drawResult?.draw_code || ""}) official results for ${date}. All 1st to 9th Prize and Consolation winning tickets!`,
        files: [file],
      });
      return true;
    } else {
      await downloadLotteryPostImage(options);
      return false;
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.error("Error sharing image:", err);
      await downloadLotteryPostImage(options);
    }
    return false;
  }
}
