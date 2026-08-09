import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const isAdminValid =
      (username === "admin" && password === "admin123") ||
      (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD);

    if (!isAdminValid) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: "Login successful" });
    response.cookies.set("admin_session", "authenticated_token_99812", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
