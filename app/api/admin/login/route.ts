import { NextResponse } from "next/server";
import {
  setAdminSession,
  verifyAdminLogin,
  SESSION_COOKIE,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const user = await verifyAdminLogin(email, password);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Email atau password salah." },
      { status: 401 },
    );
  }

  // Set session cookie
  await setAdminSession(user);

  // Return success response
  const response = NextResponse.json({
    success: true,
    redirectTo: "/admin/dashboard",
  });

  return response;
}
