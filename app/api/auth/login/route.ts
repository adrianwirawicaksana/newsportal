import { NextRequest } from "next/server";
import {
  createAccessToken,
  createSession,
  getErrorResponse,
  getSuccessResponse,
  getUserByEmail,
  isValidEmail,
  parseJsonBody,
  setAuthCookies,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request);

  if (!body || typeof body !== "object") {
    return getErrorResponse("Request body tidak valid", 400);
  }

  const { email, password } = body as {
    email?: string;
    password?: string;
  };

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return getErrorResponse("Format email tidak valid", 400);
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return getErrorResponse("Kata sandi minimal 8 karakter", 400);
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return getErrorResponse("Email atau kata sandi salah", 401);
  }

  if (!user.verified) {
    return getErrorResponse(
      "Email belum diverifikasi. Silakan cek inbox Anda terlebih dahulu.",
      403,
    );
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return getErrorResponse("Email atau kata sandi salah", 401);
  }

  const session = createSession(user.id);
  const accessToken = createAccessToken(user.id);
  const response = getSuccessResponse(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      message: "Login berhasil",
    },
    200,
  );

  setAuthCookies(response, accessToken, session.refreshToken);
  return response;
}
