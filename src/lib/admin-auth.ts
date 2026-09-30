import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const ADMIN_COOKIE_NAME = "admin_session";

// Server-side check if current request has valid admin cookie
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  // Simple token matching using base64 encoded password token
  const expectedToken = Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64");
  return token === expectedToken;
}

export function getExpectedAdminToken(): string {
  return Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64");
}
