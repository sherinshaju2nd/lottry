import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  safeEqual,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";

  // Fail closed: with missing env vars, `undefined === undefined` used to log anyone in.
  if (!expectedUser || !expectedPassword) {
    console.error("[admin/login] ADMIN_USERNAME / ADMIN_PASSWORD are not configured.");
    return NextResponse.json(
      { success: false, error: "Admin login is not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const body: unknown = await req.json();
    const { username = "", password = "" } =
      typeof body === "object" && body !== null
        ? (body as { username?: unknown; password?: unknown })
        : {};

    const isAdminValid =
      typeof username === "string" &&
      typeof password === "string" &&
      safeEqual(username, expectedUser) &&
      safeEqual(password, expectedPassword);

    if (!isAdminValid) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Admin session could not be created" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true, message: "Login successful" });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication error";
    console.error("[admin/login] Login failed:", msg);
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
