import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import {
  DEFAULT_API_SOURCES,
  fetchSource,
  getApiSources,
  saveApiSources,
  summarizeAttempts,
  validateApiSources,
} from "@/lib/apiSources";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const jsonError = (error: string, status: number) => NextResponse.json({ success: false, error }, { status, headers: noStore });
const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/** GET: current source list (priority order) and the built-in default. */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) return jsonError("Unauthorized: Admin session required", 401);
  try {
    const sources = await getApiSources();
    return NextResponse.json({ success: true, sources, defaults: DEFAULT_API_SOURCES }, { headers: noStore });
  } catch (err: unknown) {
    console.error("[admin/api-sources] GET failed:", errorMessage(err));
    return jsonError(errorMessage(err), 500);
  }
}

/** PUT { sources: ApiSource[] }: replace the whole list (order = priority). */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) return jsonError("Unauthorized: Admin session required", 401);
  try {
    const body = (await req.json()) as { sources?: unknown };
    const parsed = validateApiSources(body.sources);
    if (typeof parsed === "string") return jsonError(parsed, 400);

    const saved = await saveApiSources(parsed);
    if (!saved.success) return jsonError(saved.error ?? "Failed to save sources", 500);
    return NextResponse.json({ success: true, message: `Saved ${parsed.length} source(s).`, sources: parsed }, { headers: noStore });
  } catch (err: unknown) {
    console.error("[admin/api-sources] PUT failed:", errorMessage(err));
    return jsonError(errorMessage(err), 500);
  }
}

/** POST { url, name? }: test one URL right now without saving. Reports speed, status and what it returned. */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) return jsonError("Unauthorized: Admin session required", 401);
  try {
    const body = (await req.json()) as { url?: unknown; name?: unknown };
    const parsed = validateApiSources([{ url: body.url, name: body.name, enabled: true }]);
    if (typeof parsed === "string") return jsonError(parsed.replace(/^Source 1: /, ""), 400);

    const attempt = await fetchSource(parsed[0]);
    const [summary] = summarizeAttempts([attempt]);
    // Include the raw response so the admin can expand and inspect the actual prize numbers.
    return NextResponse.json({ success: true, result: summary, data: attempt.json ?? null }, { headers: noStore });
  } catch (err: unknown) {
    console.error("[admin/api-sources] test failed:", errorMessage(err));
    return jsonError(errorMessage(err), 500);
  }
}
