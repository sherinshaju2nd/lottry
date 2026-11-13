import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { LOTTERY_SLUGS, SLUG_TO_LOTTERY_CODE } from "@/lib/lotterySlugs";
import { getBlogBySlug, getBlogPath } from "@/data/blogs";

/**
 * Top-level app routes that are NOT lottery slugs. Anything else with 1–2 path
 * segments is handled by app/[code] and app/[code]/[date].
 */
const RESERVED_ROUTES = new Set([
  "about",
  "admin",
  "analytics",
  "api",
  "blog",
  "buy-me-a-coffee",
  "claim",
  "contact",
  "disclaimer",
  "faq",
  "guide",
  "kerala-lottery-app",
  "lotteries",
  "news",
  "privacy-policy",
  "search",
  "support",
  "terms-conditions",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MIN_DRAW_DATE = "2000-01-01";
const MAX_DAYS_AHEAD = 400; // bumper draws are announced months in advance

const NOT_FOUND_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Not Found | Kerala Lottery Results Today</title></head><body style="font-family:system-ui,sans-serif;text-align:center;padding:64px 16px;color:#0F172A"><h1>404 – Page not found</h1><p>This lottery page does not exist.</p><p><a href="/" style="color:#0B3C5D;font-weight:700">Kerala Lottery Results Today</a> · <a href="/lotteries" style="color:#0B3C5D;font-weight:700">All Lotteries</a></p></body></html>`;

/** Real HTTP 404 — page-level notFound() streams a 200 because of app/loading.tsx. */
const notFoundResponse = () =>
  new NextResponse(NOT_FOUND_HTML, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
  });

const resolveLotteryCode = (segment: string): string | null => {
  const lower = segment.toLowerCase();
  const upper = segment.toUpperCase();
  return SLUG_TO_LOTTERY_CODE[lower] ?? (LOTTERY_SLUGS[upper] ? upper : null);
};

const isValidDrawDate = (value: string): boolean => {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  const maxDate = new Date(Date.now() + MAX_DAYS_AHEAD * 86_400_000).toISOString().slice(0, 10);
  return value >= MIN_DRAW_DATE && value <= maxDate;
};

/** Canonicalise /{lottery}[/{date}] URLs with real 308s / 404s before rendering starts. */
const handleLotteryRoute = (request: NextRequest, segments: string[]): NextResponse => {
  const isLegacyPrefix = segments[0] === "lottery";
  const [slugSegment, dateSegment, ...rest] = isLegacyPrefix ? segments.slice(1) : segments;

  if (isLegacyPrefix && !slugSegment) {
    return NextResponse.redirect(new URL("/lotteries", request.url), 308);
  }
  if (rest.length > 0 || !slugSegment) return notFoundResponse();

  const code = resolveLotteryCode(slugSegment);
  if (!code) return notFoundResponse();

  const date = dateSegment ? decodeURIComponent(dateSegment) : undefined;
  if (date !== undefined && !isValidDrawDate(date)) return notFoundResponse();

  const canonicalSlug = LOTTERY_SLUGS[code];
  if (isLegacyPrefix || slugSegment !== canonicalSlug) {
    const target = new URL(date ? `/${canonicalSlug}/${date}` : `/${canonicalSlug}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
};

// Proxy runs on the Node.js runtime in Next 16, so node:crypto (used by admin-auth) is available.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !isValidAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  // Legacy /blog/{slug}: 308 to the root-level post URL, real 404 for unknown posts
  if (segments[0] === "blog" && segments.length > 1) {
    if (segments.length !== 2 || !getBlogBySlug(segments[1])) return notFoundResponse();
    const target = new URL(getBlogPath(segments[1]), request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 308);
  }

  // Root-level /{post-slug}: served by app/blog/[slug] (app/[code] would otherwise claim it)
  if (segments.length === 1 && getBlogBySlug(segments[0])) {
    const target = request.nextUrl.clone();
    target.pathname = `/blog/${segments[0]}`;
    return NextResponse.rewrite(target);
  }

  if (segments.length === 0 || RESERVED_ROUTES.has(segments[0])) {
    return NextResponse.next();
  }

  return handleLotteryRoute(request, segments);
}

export const config = {
  // Everything except Next internals, API routes, /.well-known and files with an extension
  matcher: ["/((?!_next/|api/|\\.well-known/|[^?]*\\.[A-Za-z0-9]+$).*)"],
};
