import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Signing key for admin sessions. Defaults to ADMIN_PASSWORD, so changing the password
// automatically invalidates every existing session.
const getSessionSecret = (): string | null => {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
  return secret.length > 0 ? secret : null;
};

const signSessionPayload = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(`admin-session:${payload}`).digest("base64url");

/** Constant-time string comparison (avoids leaking secrets through response timing). */
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

/** Issues a signed, expiring session token: `<expiresAt>.<nonce>.<hmac>`. */
export const createAdminSessionToken = (): string | null => {
  const secret = getSessionSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS;
  const payload = `${expiresAt}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${signSessionPayload(payload, secret)}`;
};

export const isValidAdminSessionToken = (token: string | null | undefined): boolean => {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const [expiresAtRaw, nonce, signature, ...extra] = token.split(".");
  if (!expiresAtRaw || !nonce || !signature || extra.length > 0) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return false;

  return safeEqual(signature, signSessionPayload(`${expiresAtRaw}.${nonce}`, secret));
};

const matchesBearer = (authHeader: string, secret: string | undefined): boolean =>
  Boolean(secret) && safeEqual(authHeader, `Bearer ${secret}`);

/**
 * Validates that an incoming admin request is authenticated via a signed admin session
 * cookie, or a `Bearer` token equal to CRON_SECRET / ADMIN_PASSWORD (automation scripts).
 */
export const isAuthorizedAdmin = (req: NextRequest): boolean => {
  if (isValidAdminSessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  return (
    matchesBearer(authHeader, process.env.CRON_SECRET) ||
    matchesBearer(authHeader, process.env.ADMIN_PASSWORD)
  );
};
