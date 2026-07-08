import type { NextRequest } from "next/server";

export type AdminRole = "admin" | "ketua";

export type AdminSession = {
  email: string;
  name: string;
  role: AdminRole;
};

export const SESSION_COOKIE = "portalnews_admin_session";

function decodeCookieValue(cookieValue: string) {
  // Next.js automatically handles cookie encoding, so we just return as-is
  return cookieValue;
}

export function parseAdminSessionFromCookieValue(cookieValue?: string) {
  if (!cookieValue) return null;

  try {
    // Cookie value is already a JSON string, parse it directly
    return JSON.parse(cookieValue) as AdminSession;
  } catch {
    return null;
  }
}

export function getAdminSessionFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  return parseAdminSessionFromCookieValue(sessionCookie);
}
