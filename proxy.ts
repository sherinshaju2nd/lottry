import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";

// Proxy runs on the Node.js runtime in Next 16, so node:crypto (used by admin-auth) is available.
export function proxy(request: NextRequest) {
  // Protect /admin routes (except /admin/login)
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    if (!isValidAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
