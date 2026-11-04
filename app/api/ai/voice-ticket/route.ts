import { NextRequest, NextResponse } from "next/server";
import { transcribeTicketFromAudio } from "@/lib/gemini";

export const dynamic = "force-dynamic";

// .m4a recordings are MPEG-4 audio; Gemini's documented type for them is audio/mp4.
const MIME_ALIASES: Record<string, string> = { "audio/m4a": "audio/mp4", "audio/x-m4a": "audio/mp4" };
const ALLOWED_MIME_TYPES = new Set(["audio/mp4", "audio/aac", "audio/mpeg", "audio/wav", "audio/webm", "audio/ogg"]);
// ~1.1 MB of audio: a spoken ticket number needs only a few seconds.
const MAX_BASE64_LENGTH = 1_500_000;
const MAX_BODY_BYTES = MAX_BASE64_LENGTH + 1_000;

// Best-effort per-instance rate limit (protects the Gemini quota from scripted abuse).
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_TRACKED_CLIENTS = 5000;
const hits = new Map<string, number[]>();

const isRateLimited = (clientKey: string, now: number): boolean => {
  const recent = (hits.get(clientKey) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(clientKey, recent);
  if (hits.size > MAX_TRACKED_CLIENTS) {
    // Drop only clients with no requests in the current window (never reset active ones).
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_REQUESTS_PER_WINDOW;
};

/** Client IP as set by the hosting platform (Vercel sets x-real-ip; clients can't override it). */
const getClientKey = (req: NextRequest): string =>
  req.headers.get("x-real-ip")?.trim() ||
  req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
  "unknown";

/** POST { audio: base64, mimeType } → { success, series, number, ticket, transcript } */
export async function POST(req: NextRequest) {
  if (isRateLimited(getClientKey(req), Date.now())) {
    return NextResponse.json({ success: false, error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ success: false, error: "Audio is too long or invalid." }, { status: 413 });
  }

  let body: { audio?: unknown; mimeType?: unknown };
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ success: false, error: "Audio is too long or invalid." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const requestedMime = typeof body.mimeType === "string" ? body.mimeType.toLowerCase() : "audio/mp4";
  const mimeType = MIME_ALIASES[requestedMime] ?? requestedMime;
  const audio = typeof body.audio === "string" ? body.audio.replace(/^data:[^;]+;base64,/, "") : "";

  if (!audio) return NextResponse.json({ success: false, error: "Audio is required." }, { status: 400 });
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ success: false, error: "Unsupported audio format." }, { status: 415 });
  }
  if (audio.length > MAX_BASE64_LENGTH || !/^[A-Za-z0-9+/=]+$/.test(audio)) {
    return NextResponse.json({ success: false, error: "Audio is too long or invalid." }, { status: 413 });
  }

  try {
    const result = await transcribeTicketFromAudio(audio, mimeType);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Couldn't hear a ticket number. Please say it again clearly." },
        { status: 422 },
      );
    }
    return NextResponse.json({
      success: true,
      ...result,
      ticket: result.series ? `${result.series} ${result.number}` : result.number,
    });
  } catch (err: unknown) {
    console.error("[api/ai/voice-ticket]", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ success: false, error: "Voice recognition is unavailable right now." }, { status: 503 });
  }
}
