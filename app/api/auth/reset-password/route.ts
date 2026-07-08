import { NextRequest } from "next/server";
import {
  getErrorResponse,
  getSuccessResponse,
  parseJsonBody,
  updateUserPassword,
  verifyPasswordResetToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request);

  if (!body || typeof body !== "object") {
    return getErrorResponse("Request body tidak valid", 400);
  }

  const { token, password, confirmPassword } = body as {
    token?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!token || typeof token !== "string") {
    return getErrorResponse("Token reset password tidak valid", 400);
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return getErrorResponse("Kata sandi minimal 8 karakter", 400);
  }

  if (password !== confirmPassword) {
    return getErrorResponse("Konfirmasi kata sandi tidak cocok", 400);
  }

  const payload = verifyPasswordResetToken(token);
  if (!payload?.userId) {
    return getErrorResponse(
      "Token reset password tidak valid atau sudah kadaluarsa",
      401,
    );
  }

  const user = await updateUserPassword(
    payload.userId,
    payload.email,
    password,
  );
  if (!user) {
    return getErrorResponse("Pengguna tidak ditemukan", 404);
  }

  return getSuccessResponse({
    message: "Password berhasil diperbarui",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt,
    },
  });
}
