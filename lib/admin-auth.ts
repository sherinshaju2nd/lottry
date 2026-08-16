import { NextRequest } from "next/server";

/**
 * Validates that an incoming admin request is authenticated via admin session cookie
 * or authorized bearer token.
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get("admin_session")?.value;
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET || process.env.ADMIN_PASSWORD;

  // 1. Session Cookie verification (standard web admin login)
  if (sessionCookie === "authenticated_token_99812") {
    return true;
  }

  // 2. Bearer token verification (cron or automated admin script)
  if (authHeader) {
    if (secretKey && authHeader === `Bearer ${secretKey}`) {
      return true;
    }
    if (process.env.ADMIN_PASSWORD && authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return true;
    }
  }

  return false;
}
