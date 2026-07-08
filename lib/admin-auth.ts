import { createHash } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

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
    return JSON.parse(decodeCookieValue(cookieValue)) as AdminSession;
  } catch {
    return null;
  }
}

export function getAdminSessionFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  return parseAdminSessionFromCookieValue(sessionCookie);
}

export async function verifyAdminLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      provider: "email",
      role: { in: ["admin", "ketua"] },
    },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const passwordHash = createHash("sha256").update(password).digest("hex");
  if (passwordHash !== user.passwordHash) {
    return null;
  }

  return {
    email: user.email,
    name: user.name,
    role: user.role as AdminRole,
  };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  return parseAdminSessionFromCookieValue(sessionCookie?.value);
}

export async function setAdminSession(session: AdminSession) {
  const cookieStore = await cookies();

  // Check if we're in HTTPS by looking at NEXT_PUBLIC_APP_URL or environment
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isSecure =
    appUrl.startsWith("https") || process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax", // Use lax for better compatibility
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours instead of 8
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
