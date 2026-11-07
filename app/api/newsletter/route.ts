import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

// Best-effort per-instance throttle (serverless instances are short-lived; this only stops bursts).
const RECENT = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const hits = (RECENT.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (RECENT.size > 5000) RECENT.clear(); // bound memory
  RECENT.set(key, [...hits, now]);
  return hits.length >= MAX_PER_WINDOW;
};

/** POST { email, source? } — public newsletter sign-up (stored server-side only). */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, error: "Too many attempts. Please try again in a minute." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = body?.source === "mobile" ? "mobile" : "web";

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("newsletter_subscribers")
      .upsert({ email, source, is_active: true }, { onConflict: "email" });
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Subscribed! You'll get the next Kerala lottery newsletter." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    console.error("[newsletter] subscribe failed:", message);
    return NextResponse.json({ success: false, error: "Could not subscribe right now. Please try again." }, { status: 500 });
  }
}

/** GET — subscriber list for the admin dashboard. */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });
  }
  try {
    const { data, error, count } = await supabaseServer
      .from("newsletter_subscribers")
      .select("id,email,source,is_active,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return NextResponse.json({ success: true, subscribers: data ?? [], total: count ?? 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    console.error("[newsletter] list failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
