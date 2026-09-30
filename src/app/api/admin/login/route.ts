import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid admin password. Please try again." },
        { status: 401 }
      );
    }

    const token = getExpectedAdminToken();
    const cookieStore = await cookies();

    const isHttps = req.url.startsWith("https:");

    cookieStore.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: isHttps,
    });

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully.",
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    );
  }
}
