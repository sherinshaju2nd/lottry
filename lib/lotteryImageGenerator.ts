import QRCode from "qrcode";

export type LotteryImageFormat = "story" | "portrait";

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
  format?: LotteryImageFormat; // "story": 1080x1920 (9:16 Full Screen / Story / Reels)
  siteUrl?: string;
}

export interface InstagramPostPage {
  pageNumber: number;
  totalPages: number;
  title: string;
  subtitle: string;
  canvas: HTMLCanvasElement;
  dataUrl: string;
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
 * Extracts ticket numbers safely from drawResult
 */
function extractTierNumbers(prizes: any, key: string): string[] {
  if (!prizes) return [];
  if (Array.isArray(prizes[key]) && prizes[key].length > 0) return prizes[key];
  const digitOnly = key.replace(/\D/g, "");
  if (digitOnly && Array.isArray(prizes[digitOnly]) && prizes[digitOnly].length > 0) {
    return prizes[digitOnly];
  }
  const wordMap: Record<string, string> = {
    "1st": "first",
    "2nd": "second",
    "3rd": "third",
    "4th": "fourth",
    "5th": "fifth",
    "6th": "sixth",
    "7th": "seventh",
    "8th": "eighth",
    "9th": "ninth",
  };
  const word = wordMap[key];
  if (word) {
    if (Array.isArray(prizes[word]) && prizes[word].length > 0) return prizes[word];
    if (Array.isArray(prizes[`${word}_prize`]) && prizes[`${word}_prize`].length > 0) return prizes[`${word}_prize`];
    if (Array.isArray(prizes[`${word}_tickets`]) && prizes[`${word}_tickets`].length > 0) return prizes[`${word}_tickets`];
  }
  return [];
}

/**
 * Extracts prize amount safely from drawResult
 */
function extractTierAmount(prizes: any, key: string, defaultAmt: string): string {
  const amounts = prizes?.amounts;
  if (!amounts) return defaultAmt;
  if (amounts[key]) return amounts[key];
  const digitOnly = key.replace(/\D/g, "");
  if (digitOnly && amounts[digitOnly]) return amounts[digitOnly];
  const wordMap: Record<string, string> = {
    "1st": "first",
    "2nd": "second",
    "3rd": "third",
    "4th": "fourth",
    "5th": "fifth",
    "6th": "sixth",
    "7th": "seventh",
    "8th": "eighth",
    "9th": "ninth",
  };
  const word = wordMap[key];
  if (word && amounts[word]) return amounts[word];
  return defaultAmt;
}

interface TierContentUnit {
  tier: TierConfig;
  numbers: string[];
  amount: string;
  pageIndex: number;
  totalPages: number;
}

interface PageLayoutPlan {
  includeHero: boolean;
  tiers: TierContentUnit[];
}

/**
 * Splits draw results across slides designed for 1080x900 pixels.
 * Slide 1 holds 1st Prize Hero + Consolation (or 2nd) cleanly within 900px height.
 * Subsequent slides distribute remaining prizes without overflow.
 */
function buildInstagramPagesPlan(drawResult: any, format: LotteryImageFormat = "story"): PageLayoutPlan[] {
  const pages: PageLayoutPlan[] = [];

  const activeTiers: { tier: TierConfig; numbers: string[]; amount: string }[] = [];

  for (const cfg of ALL_TIERS) {
    const nums = extractTierNumbers(drawResult?.prizes, cfg.key);
    const amt = extractTierAmount(drawResult?.prizes, cfg.key, "");
    if (nums.length > 0 || amt) {
      activeTiers.push({ tier: cfg, numbers: nums, amount: amt });
    }
  }

  const findTier = (key: string) => activeTiers.find((t) => t.tier.key === key);

  // Slide 1: 1st Prize Hero Card + Consolation + 2nd Prize + 3rd Prize
  const slide1Tiers: TierContentUnit[] = [];
  const consoItem = findTier("consolation");
  const secondItem = findTier("2nd");
  const thirdItem = findTier("3rd");
  if (consoItem) slide1Tiers.push({ ...consoItem, pageIndex: 1, totalPages: 1 });
  if (secondItem) slide1Tiers.push({ ...secondItem, pageIndex: 1, totalPages: 1 });
  if (thirdItem) slide1Tiers.push({ ...thirdItem, pageIndex: 1, totalPages: 1 });

  pages.push({
    includeHero: true,
    tiers: slide1Tiers,
  });

  // Slide 2: 4th Prize + 5th Prize + 6th Prize (combined into 1 slide)
  const slide3Tiers: TierContentUnit[] = [];
  const fourthItem = findTier("4th");
  const fifthItem = findTier("5th");
  const sixthItem = findTier("6th");
  if (fourthItem) slide3Tiers.push({ ...fourthItem, pageIndex: 1, totalPages: 1 });
  if (fifthItem) slide3Tiers.push({ ...fifthItem, pageIndex: 1, totalPages: 1 });
  if (sixthItem) slide3Tiers.push({ ...sixthItem, pageIndex: 1, totalPages: 1 });
  if (slide3Tiers.length > 0) {
    pages.push({ includeHero: false, tiers: slide3Tiers });
  }

  // Slide 4: 7th Prize (if present)
  const seventhItem = findTier("7th");
  if (seventhItem) {
    pages.push({
      includeHero: false,
      tiers: [{ ...seventhItem, pageIndex: 1, totalPages: 1 }],
    });
  }

  // Slide 5: 8th Prize (combined all parts into 1 single slide)
  const eighthItem = findTier("8th");
  if (eighthItem) {
    pages.push({
      includeHero: false,
      tiers: [
        {
          tier: eighthItem.tier,
          numbers: eighthItem.numbers,
          amount: eighthItem.amount,
          pageIndex: 1,
          totalPages: 1,
        },
      ],
    });
  }

  // 9th Prize: Exactly 2 slides (combining parts 1 & 2 into Slide 1, and parts 3 & 4 into Slide 2)
  const ninthItem = findTier("9th");
  if (ninthItem) {
    const nums = ninthItem.numbers;
    const numsCount = nums.length;
    
    if (numsCount > 0) {
      // Divide all 9th prize numbers exactly into 2 equal parts (Slide 1 gets Part 1 & 2, Slide 2 gets Part 3 & 4)
      const totalPages9th = 2;
      const midPoint = Math.ceil(numsCount / 2);

      const part1Nums = nums.slice(0, midPoint);
      const part2Nums = nums.slice(midPoint);

      pages.push({
        includeHero: false,
        tiers: [
          {
            tier: ninthItem.tier,
            numbers: part1Nums,
            amount: ninthItem.amount,
            pageIndex: 1,
            totalPages: totalPages9th,
          },
        ],
      });

      if (part2Nums.length > 0) {
        pages.push({
          includeHero: false,
          tiers: [
            {
              tier: ninthItem.tier,
              numbers: part2Nums,
              amount: ninthItem.amount,
              pageIndex: 2,
              totalPages: totalPages9th,
            },
          ],
        });
      }
    }
  }

  // Fallback for any other custom or unhandled tiers
  const handledKeys = new Set(["consolation", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"]);
  const extraTiers = activeTiers.filter((t) => !handledKeys.has(t.tier.key));
  if (extraTiers.length > 0) {
    pages.push({
      includeHero: false,
      tiers: extraTiers.map((t) => ({ ...t, pageIndex: 1, totalPages: 1 })),
    });
  }

  return pages;
}

/**
 * Pre-generate the QR Code image
 */
async function loadQrCodeImage(url: string): Promise<HTMLImageElement | null> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: "#051A36", light: "#FFFFFF" },
    });
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("QR load failed"));
      img.src = qrDataUrl;
    });
  } catch {
    return null;
  }
}

/**
 * Generates all Post pages at Width: 900px, Height: 900px.
 * Splits data into multiple slides cleanly based on content size.
 */
export async function generateLotteryPostPages(
  options: LotteryPostImageOptions,
): Promise<InstagramPostPage[]> {
  const {
    drawResult,
    lotteryInfo,
    format = "story",
    siteUrl = "https://www.keralalotteryresultstoday.in",
  } = options;

  // Exact Requested Dimensions: Width: 900px, Height: 900px
  const width = 900;
  const height = 900;

  const cardX = 32;
  const cardW = width - 64; // 836px usable width

  const drawName =
    drawResult?.draw_name || lotteryInfo?.name || "Kerala State Lottery";
  const drawCode =
    drawResult?.draw_code || lotteryInfo?.code || "Official Draw";
  const drawDate =
    drawResult?.draw_date ||
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(),
    );

  const targetResultUrl = `${siteUrl}/${drawResult?.lottery_code || lotteryInfo?.code || "kerala-lottery"}/${drawDate}`;
  const qrImage = await loadQrCodeImage(targetResultUrl);

  const pagePlans = buildInstagramPagesPlan(drawResult, format);
  const totalPages = pagePlans.length;

  const results: InstagramPostPage[] = [];

  for (let pIdx = 0; pIdx < pagePlans.length; pIdx++) {
    const plan = pagePlans[pIdx];
    const pageNumber = pIdx + 1;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 1. BACKGROUND GRADIENT
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#051A36");
    bgGrad.addColorStop(0.3, "#0A2E52");
    bgGrad.addColorStop(0.7, "#0B3C5D");
    bgGrad.addColorStop(1, "#041426");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. AMBIENT RADIAL GLOW
    const glowY = plan.includeHero ? 280 : 380;
    const radialGlow = ctx.createRadialGradient(
      width / 2,
      glowY,
      60,
      width / 2,
      glowY,
      500,
    );
    radialGlow.addColorStop(0, "rgba(245, 158, 11, 0.16)");
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

    // 4. HEADER WITH INSTAGRAM SLIDE COUNTER BADGE
    let currY = 48;

    // Top Brand Tag & Carousel Slide Indicator Pill
    ctx.save();
    ctx.textAlign = "left";
    ctx.font =
      "800 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#38BDF8";
    ctx.letterSpacing = "1.2px";
    ctx.fillText("OFFICIAL KERALA STATE LOTTERIES RESULT", cardX, currY);
    ctx.letterSpacing = "0px";

    // Instagram Slide Pill (e.g. "SWIPE • 1 / 3")
    const pillText = `SWIPE • ${pageNumber} / ${totalPages}`;
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
    const pillW = ctx.measureText(pillText).width + 20;
    const pillH = 26;
    const pillX = cardX + cardW - pillW;
    const pillY = currY - 18;

    ctx.fillStyle = "#0A243D";
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 13);
    ctx.fill();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FDE047";
    ctx.fillText(pillText, pillX + pillW / 2, pillY + pillH / 2);
    ctx.restore();

    currY += 28;

    // Draw Title
    ctx.save();
    ctx.textAlign = "center";
    ctx.font =
      "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillText(`${drawName.toUpperCase()} (${drawCode})`, width / 2, currY);
    ctx.restore();
    currY += 28;

    // Date & Time Banner
    ctx.save();
    ctx.textAlign = "center";
    ctx.font =
      "800 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#FDE047";
    const dateBannerText = `🗓️ DRAW DATE: ${drawDate} ${lotteryInfo?.day ? `(${lotteryInfo.day.toUpperCase()})` : ""} • 3:00 PM DRAW`;
    ctx.fillText(dateBannerText, width / 2, currY);
    ctx.restore();
    currY += 22;

    // 5. 1ST PRIZE HERO CARD (Only on Slide 1)
    if (plan.includeHero) {
      const hasMultipleTiersOnHero = plan.tiers.length >= 2;
      const heroH = hasMultipleTiersOnHero ? 154 : 180;
      ctx.save();
      const heroGrad = ctx.createLinearGradient(cardX, currY, cardX, currY + heroH);
      heroGrad.addColorStop(0, "#0E345D");
      heroGrad.addColorStop(0.6, "#092544");
      heroGrad.addColorStop(1, "#05182C");
      ctx.fillStyle = heroGrad;
      drawRoundedRect(ctx, cardX, currY, cardW, heroH, 16);
      ctx.fill();

      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Ribbon Tag
      const ribbonW = 280;
      const ribbonH = 26;
      const ribbonX = (width - ribbonW) / 2;
      const ribbonY = currY - 12;
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
      drawRoundedRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 13);
      ctx.fill();
      ctx.strokeStyle = "#FEF08A";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#0F172A";
      ctx.font =
        "900 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "1px";
      ctx.fillText("🏆 1ST PRIZE JACKPOT 🏆", width / 2, ribbonY + 18);
      ctx.letterSpacing = "0px";

      // Jackpot Amount
      const jackpotAmt =
        drawResult?.prizes?.amounts?.["1st"] || lotteryInfo?.jackpot || "₹1 CRORE";

      ctx.font = hasMultipleTiersOnHero
        ? "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        : "900 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#FDE047";
      ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
      ctx.shadowBlur = 10;
      ctx.fillText(jackpotAmt.toUpperCase(), width / 2, currY + (hasMultipleTiersOnHero ? 48 : 56));
      ctx.shadowBlur = 0;

      // Winning Ticket Pill
      const ticketPillW = hasMultipleTiersOnHero ? 400 : 440;
      const ticketPillH = hasMultipleTiersOnHero ? 48 : 56;
      const ticketPillX = (width - ticketPillW) / 2;
      const ticketPillY = currY + (hasMultipleTiersOnHero ? 62 : 72);

      ctx.fillStyle = "#030F1D";
      drawRoundedRect(ctx, ticketPillX, ticketPillY, ticketPillW, ticketPillH, 12);
      ctx.fill();
      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 2;
      ctx.stroke();

      const winningTicket = drawResult?.first?.ticket?.trim();
      const isTicketPending =
        !winningTicket || winningTicket.toUpperCase() === "PENDING";
      ctx.font = isTicketPending
        ? "800 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        : `900 ${hasMultipleTiersOnHero ? 30 : 36}px 'Courier New', monospace, sans-serif`;
      ctx.fillStyle = isTicketPending ? "#F87171" : "#FFFFFF";
      ctx.letterSpacing = isTicketPending ? "1px" : "3px";
      ctx.fillText(
        isTicketPending ? "RESULT ANNOUNCING AT 3:10 PM" : winningTicket,
        width / 2,
        ticketPillY + (isTicketPending ? (hasMultipleTiersOnHero ? 30 : 35) : (hasMultipleTiersOnHero ? 34 : 40)),
      );
      ctx.letterSpacing = "0px";

      // Location / Agent line
      ctx.font =
        "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
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
      ctx.fillText(locAgentText, width / 2, currY + (hasMultipleTiersOnHero ? 136 : 158));
      ctx.restore();

      currY += heroH + (hasMultipleTiersOnHero ? 10 : 14);
    }

    // 6. TIERS ASSIGNED TO THIS SPECIFIC SLIDE
    const hasManyTiersOnSlide = plan.tiers.length >= 3;
    for (const unit of plan.tiers) {
      const { tier, numbers: nums, amount: amt, pageIndex: tierPage, totalPages: tierTotal } = unit;
      const isDense = tier.key === "8th" || tier.key === "9th";
      const isLongChip = nums.some((n) => typeof n === "string" && n.length > 5);

      // Dynamically compute chip sizes & columns to fill the slide nicely in 900px canvas
      const isNinth = tier.key === "9th";
      let cols = isLongChip ? 3 : isNinth ? 6 : isDense ? (nums.length > 45 ? 8 : 7) : 5;
      const availableInnerW = cardW - 32;
      const gap = isNinth ? 8 : 6;
      const chipW = Math.floor((availableInnerW - (cols - 1) * gap) / cols);
      const chipH = isNinth ? 42 : isDense ? 30 : isLongChip ? (hasManyTiersOnSlide ? 30 : 34) : (hasManyTiersOnSlide ? 28 : 32);
      const rows = Math.max(1, Math.ceil(nums.length / cols));
      const tierCardH = (hasManyTiersOnSlide ? 38 : 44) + (nums.length > 0 ? rows * (chipH + gap) + (hasManyTiersOnSlide ? 8 : 12) : 32);

      ctx.save();
      // Card background
      ctx.fillStyle = "rgba(7, 24, 46, 0.94)";
      drawRoundedRect(ctx, cardX, currY, cardW, tierCardH, 14);
      ctx.fill();

      ctx.strokeStyle = tier.borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tier Header Bar
      ctx.textAlign = "left";
      ctx.font =
        "900 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = tier.color;
      const pageInfo = tierTotal > 1 ? ` (Part ${tierPage}/${tierTotal})` : "";
      ctx.fillText(
        `${tier.emoji} ${tier.label.toUpperCase()}${pageInfo}`,
        cardX + 18,
        currY + 26,
      );

      // Prize Amount on Right
      if (amt) {
        ctx.textAlign = "right";
        ctx.font =
          "900 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`Amount: ${amt}`, cardX + cardW - 18, currY + 26);
      }

      // Render numbers in styled chips
      if (nums.length > 0) {
        const gridStartY = currY + 40;
        nums.forEach((num, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const chipX = cardX + 16 + col * (chipW + gap);
          const chipY = gridStartY + row * (chipH + gap);

          // Chip Background
          ctx.fillStyle = tier.chipBg;
          drawRoundedRect(ctx, chipX, chipY, chipW, chipH, isNinth ? 9 : 7);
          ctx.fill();
          ctx.strokeStyle = tier.borderColor;
          ctx.lineWidth = isNinth ? 1.5 : 1;
          ctx.stroke();

          // Chip Number Text
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `800 ${isNinth ? 20 : isDense ? 14 : isLongChip ? 14 : 15}px 'Courier New', monospace, sans-serif`;
          ctx.fillStyle = tier.chipColor;
          ctx.fillText(String(num), chipX + chipW / 2, chipY + chipH / 2);
        });
      } else {
        ctx.textAlign = "center";
        ctx.font =
          "700 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = "#94A3B8";
        ctx.fillText(
          "Official result numbers recorded in the State Gazette",
          width / 2,
          currY + 60,
        );
      }
      ctx.restore();

      currY += tierCardH + 10;
    }

    // 7. FOOTER SECTION: Removed as requested

    const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
    results.push({
      pageNumber,
      totalPages,
      title: plan.includeHero ? "1st Prize & Major Winners" : `All Winning Numbers (${pageNumber}/${totalPages})`,
      subtitle: `${drawName} (${drawCode})`,
      canvas,
      dataUrl,
    });
  }

  return results;
}

/**
 * Backward compatibility: generates single canvas (first slide)
 */
export async function generateLotteryPostCanvas(
  options: LotteryPostImageOptions,
): Promise<HTMLCanvasElement> {
  const pages = await generateLotteryPostPages(options);
  if (pages.length > 0) return pages[0].canvas;
  throw new Error("Failed to render post canvas");
}

/**
 * Generate JPEG Blob for a specific page (defaults to slide 1)
 */
export async function generateLotteryPostJpegBlob(
  options: LotteryPostImageOptions,
  pageIndex = 0,
): Promise<Blob> {
  const pages = await generateLotteryPostPages(options);
  const targetPage = pages[pageIndex] || pages[0];
  return new Promise((resolve, reject) => {
    targetPage.canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate JPEG Blob from canvas"));
      },
      "image/jpeg",
      0.96,
    );
  });
}

/**
 * Generate JPEG Data URL for a specific page (defaults to slide 1)
 */
export async function generateLotteryPostDataUrl(
  options: LotteryPostImageOptions,
  pageIndex = 0,
): Promise<string> {
  const pages = await generateLotteryPostPages(options);
  const targetPage = pages[pageIndex] || pages[0];
  return targetPage.dataUrl;
}

/**
 * Trigger download of a single slide image
 */
export async function downloadLotteryPostSlide(
  page: InstagramPostPage,
  options: LotteryPostImageOptions,
): Promise<void> {
  const a = document.createElement("a");
  const code =
    options.drawResult?.lottery_code || options.lotteryInfo?.code || "lottery";
  const date = options.drawResult?.draw_date || "today";
  const pageSuffix =
    page.totalPages > 1 ? `-slide-${page.pageNumber}-of-${page.totalPages}` : "";
  a.href = page.dataUrl;
  a.download = `kerala-lottery-${code.toLowerCase()}-${date}-instagram-post${pageSuffix}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Trigger download of all slides sequentially
 */
export async function downloadAllLotteryPostSlides(
  pages: InstagramPostPage[],
  options: LotteryPostImageOptions,
): Promise<void> {
  for (let i = 0; i < pages.length; i++) {
    await downloadLotteryPostSlide(pages[i], options);
    // 300ms pause between downloads to prevent browser pop-up blocking
    if (i < pages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
}

/**
 * Trigger immediate download of the generated JPG image (legacy/default wrapper)
 */
export async function downloadLotteryPostImage(
  options: LotteryPostImageOptions,
): Promise<void> {
  const pages = await generateLotteryPostPages(options);
  if (pages.length === 1) {
    await downloadLotteryPostSlide(pages[0], options);
  } else {
    await downloadAllLotteryPostSlides(pages, options);
  }
}

/**
 * Share via Web Share API if supported on device (iOS / Android / Chrome)
 */
export async function shareLotteryPostImage(
  options: LotteryPostImageOptions,
  pageIndex = 0,
): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.share) {
    await downloadLotteryPostImage(options);
    return false;
  }

  try {
    const pages = await generateLotteryPostPages(options);
    const targetPage = pages[pageIndex] || pages[0];
    const blob = await new Promise<Blob>((resolve, reject) => {
      targetPage.canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Blob error"))),
        "image/jpeg",
        0.96,
      );
    });

    const code =
      options.drawResult?.lottery_code ||
      options.lotteryInfo?.code ||
      "lottery";
    const date = options.drawResult?.draw_date || "today";
    const filename = `kerala-lottery-${code.toLowerCase()}-${date}-instagram-post-slide-${targetPage.pageNumber}.jpg`;
    const file = new File([blob], filename, { type: "image/jpeg" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${options.drawResult?.draw_name || "Kerala Lottery"} Result - ${date}`,
        text: `Kerala State Lottery ${options.drawResult?.draw_name || ""} (${options.drawResult?.draw_code || ""}) official results for ${date}. Slide ${targetPage.pageNumber} of ${targetPage.totalPages}.`,
        files: [file],
      });
      return true;
    } else {
      await downloadLotteryPostSlide(targetPage, options);
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
