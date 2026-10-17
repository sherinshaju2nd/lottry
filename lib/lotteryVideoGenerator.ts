import QRCode from "qrcode";
import { getLotterySlug } from "@/lib/supabase";

export type LotteryVideoFormat = "vertical" | "horizontal"; // vertical: 1080x1920 (Reels/Shorts), horizontal: 1920x1080 (YouTube)

export interface LotteryVideoGeneratorOptions {
  drawResult?: any;
  lotteryInfo?: any;
  format?: LotteryVideoFormat;
  siteUrl?: string;
  onProgress?: (progress: number, statusText: string) => void;
}

export const KERALA_LOTTERY_ML_MAP: Record<string, string> = {
  WN: "വിൻ-വിൻ",
  "WIN-WIN": "വിൻ-വിൻ",
  SS: "സ്ത്രീ ശക്തി",
  "STHREE SAKTHI": "സ്ത്രീ ശക്തി",
  "STHREE SHAKTHI": "സ്ത്രീ ശക്തി",
  AK: "അക്ഷയ",
  AKSHAYA: "അക്ഷയ",
  KN: "കാരുണ്യ പ്ലസ്",
  "KARUNYA PLUS": "കാരുണ്യ പ്ലസ്",
  NR: "നിർമ്മൽ",
  NIRMAL: "നിർമ്മൽ",
  SK: "സുവർണ്ണ കേരളം",
  "SUVARNA KERALAM": "സുവർണ്ണ കേരളം",
  KR: "കാരുണ്യ",
  KARUNYA: "കാരുണ്യ",
  FF: "ഫിഫ്റ്റി-ഫിഫ്റ്റി",
  "FIFTY-FIFTY": "ഫിഫ്റ്റി-ഫിഫ്റ്റി",
  SM: "സമൃദ്ധി",
  SAMRUDHI: "സമൃദ്ധി",
  DL: "ധനലക്ഷ്മി",
  DHANALEKSHMI: "ധനലക്ഷ്മി",
  BT: "ഭാഗ്യധാര",
  BHAGYATHARA: "ഭാഗ്യധാര",
  XN: "ക്രിസ്മസ് ന്യൂ ഇയർ ബംപർ",
  "CHRISTMAS NEW YEAR BUMPER": "ക്രിസ്മസ് ന്യൂ ഇയർ ബംപർ",
  SB: "സമ്മർ ബംപർ",
  "SUMMER BUMPER": "സമ്മർ ബംപർ",
  VB: "വിഷു ബംപർ",
  "VISHU BUMPER": "വിഷു ബംപർ",
  MB: "മൺസൂൺ ബംപർ",
  "MONSOON BUMPER": "മൺസൂൺ ബംപർ",
  TB: "തിരുവോണം ബംപർ",
  "THIRUVONAM BUMPER": "തിരുവോണം ബംപർ",
  ONAM: "തിരുവോണം ബംപർ",
  PB: "പൂജ ബംപർ",
  "POOJA BUMPER": "പൂജ ബംപർ",
};

export function getLotteryMalayalamName(
  lotteryCode?: string,
  lotteryName?: string,
  fallbackMl?: string,
): string {
  if (fallbackMl && fallbackMl.trim().length > 0) return fallbackMl.trim();
  const c = (lotteryCode || "").toUpperCase().trim();
  if (c && KERALA_LOTTERY_ML_MAP[c]) return KERALA_LOTTERY_ML_MAP[c];
  const n = (lotteryName || "").toUpperCase().trim();
  if (n && KERALA_LOTTERY_ML_MAP[n]) return KERALA_LOTTERY_ML_MAP[n];
  for (const [key, val] of Object.entries(KERALA_LOTTERY_ML_MAP)) {
    if (n.includes(key)) return val;
  }
  return "കേരള ഭാഗ്യക്കുറി";
}

/**
 * Web Audio Tone Synthesizer for lottery result video soundtrack
 */
class LotteryAudioSynthesizer {
  audioCtx: AudioContext | null = null;
  dest: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.dest = this.audioCtx.createMediaStreamDestination();
      }
    } catch (e) {
      console.warn("AudioContext initialization skipped:", e);
    }
  }

  getStream(): MediaStream | null {
    return this.dest ? this.dest.stream : null;
  }

  playNote(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.2,
  ) {
    if (!this.audioCtx || !this.dest) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.dest);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Ignore audio error
    }
  }

  playFanfare(startTime: number) {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playNote(freq, startTime + idx * 0.12, 0.45, 0.25);
    });
  }

  playChime(startTime: number) {
    this.playNote(880, startTime, 0.25, 0.15);
    this.playNote(1174.66, startTime + 0.08, 0.35, 0.15);
  }

  close() {
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      try {
        this.audioCtx.close();
      } catch (e) {}
    }
  }
}

/**
 * Helper to draw rounded rectangle
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

interface CombinedTierSection {
  tierKey: string;
  tierLabel: string;
  emoji: string;
  amount: string;
  color: string;
  numbers: string[];
}

interface VideoSlide {
  type: "intro" | "first" | "combined" | "tier" | "outro";
  title?: string;
  tierKey?: string;
  tierLabel?: string;
  emoji?: string;
  amount?: string;
  color?: string;
  numbers?: string[];
  pageIndex?: number;
  totalPages?: number;
  durationSec: number;
  sections?: CombinedTierSection[];
}

/**
/**
 * Helper to safely extract winning ticket numbers from diverse schema keys
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
 * Helper to safely extract tier prize amount from diverse schema keys
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

/**
 * Ensures each prize slide gets exactly 5.0 seconds of viewing time,
 * with intro (2.0s) and outro (2.0s), keeping the total video duration under 1 minute.
 */
function applyStandardSlideDurations(slides: VideoSlide[]): void {
  for (const s of slides) {
    if (s.type === "intro" || s.type === "outro") {
      s.durationSec = 2.0;
    } else {
      // Every prize slide/tab (1st prize, consolation, 2nd-5th, 6th, 7th, 8th, 9th) gets exactly 5.0 seconds
      s.durationSec = 5.0;
    }
  }

  // Safety cap: Ensure total video duration never exceeds 60.0 seconds (1 minute max)
  let total = slides.reduce((acc, curr) => acc + curr.durationSec, 0);
  if (total > 60.0) {
    const prizeSlides = slides.filter((s) => s.type !== "intro" && s.type !== "outro");
    if (prizeSlides.length > 0) {
      const availableForPrizes = 60.0 - 4.0; // 56.0s for prizes (after 2s intro + 2s outro)
      const perPrize = Math.max(3.0, Math.min(5.0, +(availableForPrizes / prizeSlides.length).toFixed(2)));
      for (const ps of prizeSlides) {
        ps.durationSec = perPrize;
      }
    }
  }
}

/**
 * Builds all video slides with exactly 8 seconds for every prize tab,
 * giving users ample time to read and verify all winning tickets.
 */
function buildAllVideoSlides(
  drawResult: any,
  isVertical: boolean,
): VideoSlide[] {
  const slides: VideoSlide[] = [];

  // 1. Intro Slide (2.0s)
  slides.push({
    type: "intro",
    durationSec: 2.0,
  });

  // 2. 1st Prize Hero Slide (5.0s)
  slides.push({
    type: "first",
    durationSec: 5.0,
  });

  // 3. Consolation Prize (if present) (5.0s per page)
  const consoNums = extractTierNumbers(drawResult?.prizes, "consolation");
  const consoAmt = extractTierAmount(drawResult?.prizes, "consolation", "₹8,000/-");
  if (consoNums.length > 0 || drawResult?.prizes?.amounts?.["consolation"]) {
    const pageSize = isVertical ? 28 : 24;
    const totalPages = Math.max(1, Math.ceil(consoNums.length / pageSize));
    const perPage = Math.ceil(consoNums.length / totalPages);
    for (let p = 0; p < totalPages; p++) {
      slides.push({
        type: "tier",
        tierKey: "consolation",
        tierLabel: "Consolation Prize",
        emoji: "🎖️",
        amount: consoAmt,
        color: "#38BDF8",
        numbers: consoNums.slice(p * perPage, (p + 1) * perPage),
        pageIndex: p + 1,
        totalPages,
        durationSec: 5.0,
      });
    }
  }

  // 4. Combined 2nd, 3rd, 4th & 5th Prizes on one slide (5.0s)
  const combinedConfigs = [
    {
      key: "2nd",
      label: "2nd Prize",
      emoji: "🥈",
      color: "#F59E0B",
      defaultAmt: "₹5,00,000/-",
    },
    {
      key: "3rd",
      label: "3rd Prize",
      emoji: "🥉",
      color: "#FDE047",
      defaultAmt: "₹1,00,000/-",
    },
    {
      key: "4th",
      label: "4th Prize",
      emoji: "⭐",
      color: "#60A5FA",
      defaultAmt: "₹5,000/-",
    },
    {
      key: "5th",
      label: "5th Prize",
      emoji: "🔹",
      color: "#A78BFA",
      defaultAmt: "₹1,000/-",
    },
  ];

  const combinedSections: CombinedTierSection[] = [];
  for (const cfg of combinedConfigs) {
    const nums = extractTierNumbers(drawResult?.prizes, cfg.key);
    const amt = extractTierAmount(drawResult?.prizes, cfg.key, cfg.defaultAmt);
    if (nums.length > 0 || !!drawResult?.prizes?.amounts?.[cfg.key]) {
      combinedSections.push({
        tierKey: cfg.key,
        tierLabel: cfg.label,
        emoji: cfg.emoji,
        amount: amt,
        color: cfg.color,
        numbers: nums,
      });
    }
  }

  if (combinedSections.length > 0) {
    slides.push({
      type: "combined",
      durationSec: 5.0,
      sections: combinedSections,
    });
  }

  // 5. Remaining Tiers: 6th, 7th, 8th, and 9th (if present) (5.0s each)
  const remainingTiers = [
    {
      key: "6th",
      label: "6th Prize",
      emoji: "🔸",
      color: "#34D399",
      defaultAmt: "₹500/-",
      isFullTicket: false,
    },
    {
      key: "7th",
      label: "7th Prize",
      emoji: "⚡",
      color: "#F472B6",
      defaultAmt: "₹100/-",
      isFullTicket: false,
    },
    {
      key: "8th",
      label: "8th Prize",
      emoji: "✨",
      color: "#38BDF8",
      defaultAmt: "₹100/-",
      isFullTicket: false,
    },
    {
      key: "9th",
      label: "9th Prize",
      emoji: "🎯",
      color: "#E2E8F0",
      defaultAmt: "₹100/-",
      isFullTicket: false,
    },
  ];

  for (const tierConfig of remainingTiers) {
    const nums = extractTierNumbers(drawResult?.prizes, tierConfig.key);
    const amount = extractTierAmount(drawResult?.prizes, tierConfig.key, tierConfig.defaultAmt);

    // If tier has neither announced numbers nor official amount in this draw, skip it
    if (nums.length === 0 && !drawResult?.prizes?.amounts?.[tierConfig.key]) {
      continue;
    }

    if (nums.length === 0) {
      slides.push({
        type: "tier",
        tierKey: tierConfig.key,
        tierLabel: tierConfig.label,
        emoji: tierConfig.emoji,
        amount,
        color: tierConfig.color,
        numbers: [],
        pageIndex: 1,
        totalPages: 1,
        durationSec: 5.0,
      });
      continue;
    }

    // High density packing (5 cols x 17 rows = 85 numbers per slide)
    const isLong =
      tierConfig.isFullTicket ||
      nums.some((n) => typeof n === "string" && n.length > 5);
    const maxPerSlide = isLong ? (isVertical ? 28 : 24) : isVertical ? 85 : 60;
    const totalPages = Math.ceil(nums.length / maxPerSlide);
    const perPage = Math.ceil(nums.length / totalPages); // Evenly distribute across pages for clean layout

    for (let p = 0; p < totalPages; p++) {
      const pageNumbers = nums.slice(p * perPage, (p + 1) * perPage);
      slides.push({
        type: "tier",
        tierKey: tierConfig.key,
        tierLabel: tierConfig.label,
        emoji: tierConfig.emoji,
        amount,
        color: tierConfig.color,
        numbers: pageNumbers,
        pageIndex: p + 1,
        totalPages,
        durationSec: 5.0,
      });
    }
  }

  // 6. Verification Outro Slide (2.0s)
  slides.push({
    type: "outro",
    durationSec: 2.0,
  });

  // Apply fixed standard timing (8.0s per prize slide)
  applyStandardSlideDurations(slides);

  return slides;
}

/**
 * Generate animated HD video showing 100% OF ALL RESULTS (1 to 9 & Consolation)
 */
export async function generateLotteryResultVideo(
  options: LotteryVideoGeneratorOptions,
): Promise<{ blob: Blob; mimeType: string }> {
  const {
    drawResult,
    lotteryInfo,
    format = "vertical",
    siteUrl = "https://www.keralalotteryresultstoday.in",
    onProgress,
  } = options;

  const isVertical = format === "vertical";
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const rawCtx = canvas.getContext("2d", { alpha: false });
  if (!rawCtx) throw new Error("Could not get 2D canvas context");
  const ctx: CanvasRenderingContext2D = rawCtx;

  // Build complete slides containing 100% of results
  const slides = buildAllVideoSlides(drawResult, isVertical);

  // Pre-generate QR Code with canonical clean URL
  const drawDate =
    drawResult?.draw_date ||
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(),
    );
  const rawLotteryCodeOrSlug =
    drawResult?.lottery_code ||
    lotteryInfo?.code ||
    lotteryInfo?.slug ||
    "bhagyathara";
  const canonicalSlug = getLotterySlug(rawLotteryCodeOrSlug);
  const targetResultUrl = `https://www.keralalotteryresultstoday.in/${canonicalSlug}/${drawDate}`;
  let qrImage: HTMLImageElement | null = null;
  try {
    const qrDataUrl = await QRCode.toDataURL(targetResultUrl, {
      width: 240,
      margin: 1,
      color: { dark: "#051A36", light: "#FFFFFF" },
    });
    qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("QR load failed"));
      img.src = qrDataUrl;
    });
  } catch (err) {
    console.warn("QR code load skipped in video:", err);
  }

  // Setup Web Audio Synthesizer
  const synth = new LotteryAudioSynthesizer();
  const audioStream = synth.getStream();

  // Setup Canvas Stream
  const canvasStream = canvas.captureStream(30); // 30 FPS
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioStream && audioStream.getAudioTracks().length > 0) {
    tracks.push(...audioStream.getAudioTracks());
  }
  const combinedStream = new MediaStream(tracks);

  // Supported MIME Type
  let mimeType = "video/webm";
  if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
    mimeType = "video/mp4;codecs=avc1";
  } else if (MediaRecorder.isTypeSupported("video/mp4")) {
    mimeType = "video/mp4";
  } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
    mimeType = "video/webm;codecs=vp9,opus";
  } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
    mimeType = "video/webm;codecs=vp8,opus";
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 6000000, // 6 Mbps HD Quality
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const drawName =
    drawResult?.draw_name || lotteryInfo?.name || "Kerala State Lottery";
  const drawCode =
    drawResult?.draw_code || lotteryInfo?.code || "Official Draw";
  const jackpotAmt =
    drawResult?.prizes?.amounts?.["1st"] || lotteryInfo?.jackpot || "₹1 CRORE";
  const firstTicket =
    drawResult?.first?.ticket?.trim() || "ANNOUNCING AT 3:10 PM";
  const location = drawResult?.first?.location;
  const agent = drawResult?.first?.agent;

  // Calculate slide time ranges
  const fps = 30;
  const slideRanges: { startSec: number; endSec: number; slide: VideoSlide }[] =
    [];
  let runningSec = 0;
  for (const s of slides) {
    const start = runningSec;
    const end = runningSec + s.durationSec;
    slideRanges.push({ startSec: start, endSec: end, slide: s });
    runningSec = end;
  }

  const totalDurationSec = runningSec;
  const totalFrames = Math.round(totalDurationSec * fps);

  let frameCount = 0;
  let playedSlideIndices = new Set<number>();

  recorder.start();

  return new Promise<{ blob: Blob; mimeType: string }>((resolve, reject) => {
    recorder.onstop = () => {
      synth.close();
      const blob = new Blob(chunks, {
        type: mimeType.includes("mp4") ? "video/mp4" : "video/webm",
      });
      resolve({ blob, mimeType });
    };

    recorder.onerror = (err) => {
      synth.close();
      reject(err);
    };

    function renderBackground(particleTime: number) {
      // Dynamic dark sapphire gradient
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#03142B");
      bg.addColorStop(0.35, "#0A2C50");
      bg.addColorStop(0.75, "#0B3C5D");
      bg.addColorStop(1, "#031122");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow
      const glow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        60,
        width / 2,
        height / 2,
        width * 0.7,
      );
      glow.addColorStop(0, "rgba(245, 158, 11, 0.12)");
      glow.addColorStop(0.5, "rgba(59, 130, 246, 0.08)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Gold Outer Frame
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 30);
      ctx.stroke();

      // Floating golden sparkle particles
      for (let i = 0; i < 28; i++) {
        const px = ((i * 137 + particleTime * 45) % (width - 80)) + 40;
        const py = ((i * 251 + particleTime * 35) % (height - 80)) + 40;
        const rad = (i % 3) + 1.5;
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(253, 224, 71, 0.6)" : "rgba(56, 189, 248, 0.6)";
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function renderHeader() {
      const topY = isVertical ? 90 : 64;
      ctx.textAlign = "center";
      ctx.fillStyle = "#38BDF8";
      ctx.font = `800 ${isVertical ? 22 : 18}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.letterSpacing = "2px";
      ctx.fillText("OFFICIAL KERALA STATE LOTTERY RESULT", width / 2, topY);
      ctx.letterSpacing = "0px";

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${isVertical ? 46 : 40}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(
        `${drawName.toUpperCase()} (${drawCode})`,
        width / 2,
        topY + 52,
      );

      ctx.fillStyle = "#FDE047";
      ctx.font = `800 ${isVertical ? 24 : 20}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(
        `🗓️ DRAW DATE: ${drawDate} • 3:00 PM DRAW`,
        width / 2,
        topY + (isVertical ? 96 : 88),
      );
    }

    function renderFooter() {
      const bY = height - (isVertical ? 140 : 90);
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${isVertical ? 28 : 22}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("www.keralalotteryresultstoday.in", width / 2, bY);

      ctx.fillStyle = "#38BDF8";
      ctx.font = `700 ${isVertical ? 18 : 15}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("Full List Results ", width / 2, bY + 30);
    }

    const interval = setInterval(() => {
      if (frameCount >= totalFrames) {
        clearInterval(interval);
        if (onProgress)
          onProgress(100, "Encoding full HD result video file...");
        setTimeout(() => {
          try {
            recorder.stop();
          } catch (e) {
            console.error("Recorder stop error:", e);
          }
        }, 400);
        return;
      }

      const currentTimeSec = frameCount / fps;
      const progressPercent = Math.min(
        99,
        Math.round((frameCount / totalFrames) * 100),
      );

      // Find current active slide
      const currentSlideIndex = slideRanges.findIndex(
        (sr) => currentTimeSec >= sr.startSec && currentTimeSec < sr.endSec,
      );
      const activeRange =
        currentSlideIndex >= 0
          ? slideRanges[currentSlideIndex]
          : slideRanges[slideRanges.length - 1];
      const activeSlide = activeRange.slide;

      // Play audio chime when entering a new slide
      if (!playedSlideIndices.has(currentSlideIndex) && synth.audioCtx) {
        playedSlideIndices.add(currentSlideIndex);
        const now = synth.audioCtx.currentTime;
        if (activeSlide.type === "first" || activeSlide.type === "combined") {
          synth.playFanfare(now);
        } else {
          synth.playChime(now);
        }
      }

      // Update progress callback with slide info
      if (onProgress && frameCount % 6 === 0) {
        const slideStatus =
          activeSlide.type === "first"
            ? "Recording 1st Prize Jackpot..."
            : activeSlide.type === "combined"
              ? "Recording 2nd, 3rd, 4th & 5th Prizes..."
              : activeSlide.type === "tier"
                ? `Recording ${activeSlide.tierLabel} (${activeSlide.pageIndex}/${activeSlide.totalPages})...`
                : "Recording result video...";
        onProgress(progressPercent, slideStatus);
      }

      renderBackground(currentTimeSec);

      // ================= SLIDE TYPE 1: INTRO =================
      if (activeSlide.type === "intro") {
        renderHeader();

        const cY = height / 2;
        ctx.fillStyle = "rgba(7, 24, 46, 0.92)";
        drawRoundedRect(ctx, 80, cY - 200, width - 160, 400, 24);
        ctx.fill();
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#FEF08A";
        ctx.font = `900 ${isVertical ? 38 : 32}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText("TODAY'S OFFICIAL DRAW RESULTS", width / 2, cY - 80);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 ${isVertical ? 56 : 46}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(drawName.toUpperCase(), width / 2, cY + 6);

        ctx.fillStyle = "#38BDF8";
        ctx.font = `800 ${isVertical ? 32 : 26}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(`DRAW NO: ${drawCode}`, width / 2, cY + 76);

        ctx.fillStyle = "#86EFAC";
        ctx.font = `700 ${isVertical ? 22 : 18}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(
          "✓ COMPLETE RESULTS (1ST TO 9TH & CONSOLATION)",
          width / 2,
          cY + 130,
        );

        renderFooter();
      }

      // ================= SLIDE TYPE 2: 1ST PRIZE HERO =================
      else if (activeSlide.type === "first") {
        renderHeader();

        const cardW = width - 120;
        const cardH = isVertical ? 720 : 540;
        const cX = 60;
        const cY = isVertical ? 420 : 220;

        ctx.save();
        ctx.fillStyle = "rgba(10, 34, 62, 0.96)";
        drawRoundedRect(ctx, cX, cY, cardW, cardH, 24);
        ctx.fill();

        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 4;
        ctx.stroke();

        // 1st Prize Gold Banner
        const bannerW = isVertical ? 520 : 460;
        const bannerH = 56;
        const bX = (width - bannerW) / 2;
        const bY = cY - 28;
        const bGrad = ctx.createLinearGradient(bX, bY, bX + bannerW, bY);
        bGrad.addColorStop(0, "#D97706");
        bGrad.addColorStop(0.5, "#FBBF24");
        bGrad.addColorStop(1, "#D97706");
        ctx.fillStyle = bGrad;
        drawRoundedRect(ctx, bX, bY, bannerW, bannerH, 28);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.fillStyle = "#0F172A";
        ctx.font = `900 ${isVertical ? 25 : 22}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText("🏆 1ST PRIZE GRAND JACKPOT 🏆", width / 2, bY + 38);

        // Huge Jackpot Amount
        ctx.fillStyle = "#FDE047";
        ctx.font = `900 ${isVertical ? 80 : 64}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
        ctx.shadowBlur = 18;
        ctx.fillText(
          jackpotAmt.toUpperCase(),
          width / 2,
          cY + (isVertical ? 140 : 100),
        );
        ctx.shadowBlur = 0;

        // Big Winning Ticket Box
        const pillW = isVertical ? 660 : 580;
        const pillH = isVertical ? 120 : 96;
        const pX = (width - pillW) / 2;
        const pY = cY + (isVertical ? 210 : 150);
        ctx.fillStyle = "#020D1A";
        drawRoundedRect(ctx, pX, pY, pillW, pillH, 22);
        ctx.fill();
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 ${isVertical ? 64 : 50}px 'Courier New', monospace, sans-serif`;
        ctx.letterSpacing = "4px";
        ctx.fillText(firstTicket, width / 2, pY + (isVertical ? 80 : 64));
        ctx.letterSpacing = "0px";

        // District & Agent
        ctx.fillStyle = "#E2E8F0";
        ctx.font = `800 ${isVertical ? 28 : 22}px -apple-system, BlinkMacSystemFont, sans-serif`;
        if (location && agent) {
          ctx.fillText(
            `📍 Drawn District: ${location}`,
            width / 2,
            cY + (isVertical ? 400 : 290),
          );
          ctx.fillText(
            `👤 Selling Agent: ${agent}`,
            width / 2,
            cY + (isVertical ? 450 : 330),
          );
        } else if (location) {
          ctx.fillText(
            `📍 Drawn District: ${location}`,
            width / 2,
            cY + (isVertical ? 410 : 300),
          );
        } else {
          ctx.fillText(
            "Directorate of Kerala State Lotteries",
            width / 2,
            cY + (isVertical ? 410 : 300),
          );
        }

        ctx.fillStyle = "#4ADE80";
        ctx.font = `800 ${isVertical ? 24 : 19}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(
          "Official Directorate Draw Winner",
          width / 2,
          cY + (isVertical ? 530 : 400),
        );
        ctx.restore();

        renderFooter();
      }

      // ================= SLIDE TYPE 3: COMBINED 2ND, 3RD, 4TH & 5TH PRIZES (SAME TAB / CARD) =================
      else if (activeSlide.type === "combined" && activeSlide.sections) {
        renderHeader();

        const sections = activeSlide.sections;
        const sX = isVertical ? 40 : 60;
        const sW = isVertical ? width - 80 : width - 120;
        const headerH = isVertical ? 62 : 46;

        if (isVertical) {
          // Calculate vertical heights for each section with bigger chips & pills
          const secHeights = sections.map((sec) => {
            const nums = sec.numbers || [];
            const isSingle = nums.length === 1;
            if (isSingle) return 72; // Champion centered box for single winners

            const isLong = nums.some(
              (n) => typeof n === "string" && n.length > 5,
            );
            const cols = isLong ? 2 : 5;
            const rows = Math.max(1, Math.ceil(nums.length / cols));
            const chipH = 56;
            const gap = 10;
            return rows * chipH + (rows - 1) * gap;
          });

          const tierSeparationGap = 44; // Generous gap between prize tiers
          let neededCardH = 28 + 28; // top & bottom card padding
          sections.forEach((_, idx) => {
            neededCardH += headerH + 14 + secHeights[idx];
            if (idx < sections.length - 1) neededCardH += tierSeparationGap;
          });

          const maxCardH = 1520;
          const sH = Math.min(maxCardH, Math.max(460, neededCardH));

          const topHeaderEnd = 195;
          const bottomFooterStart = height - 150;
          const availableHeight = bottomFooterStart - topHeaderEnd;
          const sY =
            topHeaderEnd + Math.max(10, Math.floor((availableHeight - sH) / 2));

          ctx.save();
          ctx.fillStyle = "rgba(10, 34, 62, 0.96)";
          drawRoundedRect(ctx, sX, sY, sW, sH, 26);
          ctx.fill();

          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 3.5;
          ctx.stroke();

          let currY = sY + 28;

          sections.forEach((sec, idx) => {
            const nums = sec.numbers || [];
            const isSingle = nums.length === 1;
            const isLong = nums.some(
              (n) => typeof n === "string" && n.length > 5,
            );
            const cols = isLong ? 2 : 5;

            // Section Header Bar (Bigger font, vibrant color)
            ctx.fillStyle = "rgba(4, 18, 36, 0.96)";
            drawRoundedRect(ctx, sX + 16, currY, sW - 32, headerH, 14);
            ctx.fill();
            ctx.strokeStyle = sec.color || "#F59E0B";
            ctx.lineWidth = 1.8;
            ctx.stroke();

            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.fillStyle = sec.color || "#FFFFFF";
            ctx.font = `900 28px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.fillText(
              `${sec.emoji || "🎯"} ${sec.tierLabel.toUpperCase()}`,
              sX + 36,
              currY + headerH / 2,
            );

            ctx.textAlign = "right";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = `900 30px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.fillText(
              `Amount: ${sec.amount}`,
              sX + sW - 36,
              currY + headerH / 2,
            );

            currY += headerH + 14;

            // Section Numbers Grid (Taller chips, centered single tickets)
            if (isSingle) {
              const pillW = 620;
              const pillH = 72;
              const pillX = sX + (sW - pillW) / 2;
              ctx.fillStyle = "#020D1A";
              drawRoundedRect(ctx, pillX, currY, pillW, pillH, 16);
              ctx.fill();
              ctx.strokeStyle = sec.color || "#F59E0B";
              ctx.lineWidth = 3;
              ctx.stroke();

              ctx.textAlign = "center";
              ctx.fillStyle = "#FFFFFF";
              ctx.font = `900 40px 'Courier New', monospace, sans-serif`;
              ctx.letterSpacing = "3px";
              ctx.fillText(
                String(nums[0]),
                pillX + pillW / 2,
                currY + pillH / 2,
              );
              ctx.letterSpacing = "0px";
              currY += pillH;
            } else if (nums.length > 0) {
              const availableW = sW - 48;
              const chipH = 56;
              const gapX = isLong ? 14 : 12;
              const gapY = 10;
              const colW = (availableW - (cols - 1) * gapX) / cols;

              nums.forEach((item, nIdx) => {
                const col = nIdx % cols;
                const r = Math.floor(nIdx / cols);
                const cX = sX + 24 + col * (colW + gapX);
                const cY = currY + r * (chipH + gapY);

                ctx.fillStyle = isLong ? "#0C2E52" : "#0A243D";
                drawRoundedRect(ctx, cX, cY, colW, chipH, 12);
                ctx.fill();
                ctx.strokeStyle = sec.color || "#38BDF8";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.textAlign = "center";
                ctx.fillStyle = "#FFFFFF";
                ctx.font = `900 ${isLong ? 28 : 28}px 'Courier New', monospace, sans-serif`;
                ctx.fillText(String(item), cX + colW / 2, cY + chipH / 2);
              });

              currY += secHeights[idx];
            } else {
              currY += 24;
            }

            // Generous Gap & Divider between sections
            if (idx < sections.length - 1) {
              currY += 20;
              const divGrad = ctx.createLinearGradient(
                sX + 36,
                currY,
                sX + sW - 36,
                currY,
              );
              divGrad.addColorStop(0, "rgba(245, 158, 11, 0.2)");
              divGrad.addColorStop(0.5, "rgba(253, 224, 71, 0.8)");
              divGrad.addColorStop(1, "rgba(56, 189, 248, 0.2)");
              ctx.strokeStyle = divGrad;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(sX + 36, currY);
              ctx.lineTo(sX + sW - 36, currY);
              ctx.stroke();
              currY += 24;
            }
          });

          ctx.restore();
        } else {
          // Horizontal (16:9) Mode: 2 Columns Side-by-Side
          const sH = 760;
          const sY = 150;

          ctx.save();
          ctx.fillStyle = "rgba(10, 34, 62, 0.96)";
          drawRoundedRect(ctx, sX, sY, sW, sH, 24);
          ctx.fill();
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 3.5;
          ctx.stroke();

          const colW = (sW - 50) / 2;
          const leftSecs = sections.slice(0, 2); // 2nd & 3rd
          const rightSecs = sections.slice(2); // 4th & 5th

          const renderCol = (colSecs: typeof sections, startX: number) => {
            let currY = sY + 24;
            colSecs.forEach((sec, sIdx) => {
              const nums = sec.numbers || [];
              const isSingle = nums.length === 1;
              const isLong = nums.some(
                (n) => typeof n === "string" && n.length > 5,
              );
              const cols = isLong ? 2 : 4;

              ctx.fillStyle = "rgba(4, 18, 36, 0.96)";
              drawRoundedRect(ctx, startX + 16, currY, colW - 32, headerH, 12);
              ctx.fill();
              ctx.strokeStyle = sec.color || "#F59E0B";
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.textBaseline = "middle";
              ctx.textAlign = "left";
              ctx.fillStyle = sec.color || "#FFFFFF";
              ctx.font = `900 22px -apple-system, BlinkMacSystemFont, sans-serif`;
              ctx.fillText(
                `${sec.emoji || "🎯"} ${sec.tierLabel.toUpperCase()}`,
                startX + 28,
                currY + headerH / 2,
              );

              ctx.textAlign = "right";
              ctx.fillStyle = "#FFFFFF";
              ctx.font = `900 22px -apple-system, BlinkMacSystemFont, sans-serif`;
              ctx.fillText(
                `Amount: ${sec.amount}`,
                startX + colW - 28,
                currY + headerH / 2,
              );

              currY += headerH + 12;

              if (isSingle) {
                const pW = colW - 60;
                const pH = 52;
                ctx.fillStyle = "#020D1A";
                drawRoundedRect(ctx, startX + 30, currY, pW, pH, 12);
                ctx.fill();
                ctx.strokeStyle = sec.color || "#F59E0B";
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.textAlign = "center";
                ctx.fillStyle = "#FFFFFF";
                ctx.font = `900 30px 'Courier New', monospace, sans-serif`;
                ctx.fillText(
                  String(nums[0]),
                  startX + colW / 2,
                  currY + pH / 2,
                );
                currY += pH + 18;
              } else if (nums.length > 0) {
                const availW = colW - 40;
                const chipH = 42;
                const gap = 8;
                const cW = (availW - (cols - 1) * gap) / cols;
                nums.forEach((item, nIdx) => {
                  const col = nIdx % cols;
                  const r = Math.floor(nIdx / cols);
                  const cX = startX + 20 + col * (cW + gap);
                  const cY = currY + r * (chipH + gap);

                  ctx.fillStyle = "#0A243D";
                  drawRoundedRect(ctx, cX, cY, cW, chipH, 10);
                  ctx.fill();
                  ctx.strokeStyle = sec.color || "#38BDF8";
                  ctx.lineWidth = 1.2;
                  ctx.stroke();
                  ctx.textAlign = "center";
                  ctx.fillStyle = "#FFFFFF";
                  ctx.font = `900 22px 'Courier New', monospace, sans-serif`;
                  ctx.fillText(String(item), cX + cW / 2, cY + chipH / 2);
                });
                const rows = Math.ceil(nums.length / cols);
                currY += rows * chipH + (rows - 1) * gap + 18;
              }

              if (sIdx < colSecs.length - 1) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(startX + 24, currY);
                ctx.lineTo(startX + colW - 24, currY);
                ctx.stroke();
                currY += 18;
              }
            });
          };

          renderCol(leftSecs, sX);
          // Vertical divider line in the center
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sX + colW + 25, sY + 20);
          ctx.lineTo(sX + colW + 25, sY + sH - 20);
          ctx.stroke();
          renderCol(rightSecs, sX + colW + 50);

          ctx.restore();
        }

        renderFooter();
      }

      // ================= SLIDE TYPE 4: ACCURATE TIER SLIDES (FILLED VERTICAL SPACE) =================
      else if (activeSlide.type === "tier") {
        renderHeader();

        const sX = isVertical ? 40 : 60;
        const sW = isVertical ? width - 80 : width - 120;
        const nums = activeSlide.numbers || [];
        const isLong =
          activeSlide.tierKey === "consolation" ||
          activeSlide.tierKey === "2nd" ||
          nums.some((n) => typeof n === "string" && n.length > 5);

        const headerH = isVertical ? 86 : 68;
        const cols = isLong ? (isVertical ? 2 : 3) : isVertical ? 5 : 6;
        const rows = Math.max(1, Math.ceil(nums.length / cols));
        const chipH = isLong ? (isVertical ? 70 : 56) : isVertical ? 62 : 48;
        const gapY = isLong ? (isVertical ? 14 : 10) : isVertical ? 12 : 8;
        const gridContentH = rows * chipH + (rows - 1) * gapY;
        const neededCardH = headerH + 30 + gridContentH + 24;

        // Dynamic card height that fills available space and tightly hugs content so NO bottom void remains
        const maxCardH = isVertical ? 1460 : 820;
        const sH = Math.min(maxCardH, Math.max(340, neededCardH));

        // Center card vertically between top header and bottom footer
        const topHeaderEnd = isVertical ? 200 : 150;
        const bottomFooterStart = height - (isVertical ? 150 : 85);
        const availableHeight = bottomFooterStart - topHeaderEnd;
        const sY =
          topHeaderEnd + Math.max(10, Math.floor((availableHeight - sH) / 2));

        ctx.save();
        ctx.fillStyle = "rgba(10, 34, 62, 0.96)";
        drawRoundedRect(ctx, sX, sY, sW, sH, 24);
        ctx.fill();

        ctx.strokeStyle = activeSlide.color || "#38BDF8";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Tier Header Bar
        ctx.fillStyle = "rgba(4, 18, 36, 0.95)";
        drawRoundedRect(ctx, sX + 16, sY + 16, sW - 32, headerH, 16);
        ctx.fill();
        ctx.strokeStyle = activeSlide.color || "#38BDF8";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textBaseline = "middle";

        // Tier Label with Page index
        ctx.textAlign = "left";
        ctx.fillStyle = activeSlide.color || "#FFFFFF";
        ctx.font = `900 ${isVertical ? 32 : 26}px -apple-system, BlinkMacSystemFont, sans-serif`;
        const pageLabel =
          activeSlide.totalPages && activeSlide.totalPages > 1
            ? ` (Page ${activeSlide.pageIndex} of ${activeSlide.totalPages})`
            : "";
        ctx.fillText(
          `${activeSlide.emoji || ""} ${activeSlide.tierLabel?.toUpperCase()}${pageLabel}`,
          sX + 36,
          sY + 16 + headerH / 2,
        );

        // Amount on Right
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 ${isVertical ? 34 : 28}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(
          `Amount: ${activeSlide.amount}`,
          sX + sW - 36,
          sY + 16 + headerH / 2,
        );

        if (nums.length > 0) {
          const gridStartY = sY + headerH + 30;
          const availableW = sW - 48;

          if (isLong) {
            const colW = (availableW - (cols - 1) * 16) / cols;
            nums.forEach((ticket, idx) => {
              const col = idx % cols;
              const row = Math.floor(idx / cols);
              const chipX = sX + 24 + col * (colW + 16);
              const chipY = gridStartY + row * (chipH + gapY);

              ctx.fillStyle = "#0C2E52";
              drawRoundedRect(ctx, chipX, chipY, colW, chipH, 14);
              ctx.fill();
              ctx.strokeStyle = activeSlide.color || "#38BDF8";
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#FFFFFF";
              ctx.font = `900 ${isVertical ? 30 : 25}px 'Courier New', monospace, sans-serif`;
              ctx.fillText(String(ticket), chipX + colW / 2, chipY + chipH / 2);
            });
          } else {
            const colW = (availableW - (cols - 1) * 14) / cols;
            nums.forEach((num, idx) => {
              const col = idx % cols;
              const row = Math.floor(idx / cols);
              const chipX = sX + 24 + col * (colW + 14);
              const chipY = gridStartY + row * (chipH + gapY);

              ctx.fillStyle = "#0A243D";
              drawRoundedRect(ctx, chipX, chipY, colW, chipH, 12);
              ctx.fill();
              ctx.strokeStyle = activeSlide.color || "#38BDF8";
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#FFFFFF";
              ctx.font = `900 ${isVertical ? 28 : 23}px 'Courier New', monospace, sans-serif`;
              ctx.fillText(String(num), chipX + colW / 2, chipY + chipH / 2);
            });
          }
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#94A3B8";
          ctx.font = `800 ${isVertical ? 26 : 20}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillText(
            "Official Winning Numbers Announced in Gazette",
            width / 2,
            sY + sH / 2,
          );
        }

        ctx.restore();

        renderFooter();
      }

      // ================= SLIDE TYPE 5: OUTRO & VERIFICATION =================
      else {
        renderHeader();

        const cY = height / 2;
        const boxW = isVertical ? width - 100 : width - 160;
        const boxX = isVertical ? 50 : 80;
        const boxH = isVertical ? 560 : 450;
        ctx.fillStyle = "rgba(7, 24, 46, 0.96)";
        drawRoundedRect(ctx, boxX, cY - boxH / 2, boxW, boxH, 26);
        ctx.fill();
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#86EFAC";
        ctx.font = `900 ${isVertical ? 26 : 22}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(
          "✓ 100% RESULTS",
          width / 2,
          cY - (isVertical ? 180 : 140),
        );

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 ${isVertical ? 30 : 25}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(
          "All Winning Tickets Accurately Recorded",
          width / 2,
          cY - (isVertical ? 125 : 95),
        );

        if (qrImage) {
          const qrSize = isVertical ? 180 : 130;
          ctx.fillStyle = "#FFFFFF";
          drawRoundedRect(
            ctx,
            width / 2 - qrSize / 2 - 10,
            cY - qrSize / 2 - 5,
            qrSize + 20,
            qrSize + 20,
            14,
          );
          ctx.fill();
          ctx.drawImage(
            qrImage,
            width / 2 - qrSize / 2,
            cY - qrSize / 2 + 5,
            qrSize,
            qrSize,
          );
        }

        ctx.fillStyle = "#FDE047";
        ctx.font = `800 ${isVertical ? 22 : 18}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(
          "Scan QR to Check Full Gazette PDF & Ticket Checker",
          width / 2,
          cY + (isVertical ? 195 : 150),
        );

        renderFooter();
      }

      frameCount++;
    }, 1000 / fps);
  });
}

/**
 * Trigger download of generated video
 */
export async function downloadLotteryResultVideo(
  options: LotteryVideoGeneratorOptions,
): Promise<void> {
  const { blob, mimeType } = await generateLotteryResultVideo(options);
  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const code =
    options.drawResult?.lottery_code || options.lotteryInfo?.code || "lottery";
  const date = options.drawResult?.draw_date || "today";
  const formatStr = options.format || "reels";
  a.href = url;
  a.download = `kerala-lottery-${code.toLowerCase()}-${date}-${formatStr}-full-results.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
