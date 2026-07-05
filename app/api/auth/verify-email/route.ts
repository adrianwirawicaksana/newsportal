import { NextRequest } from "next/server";
import {
  getErrorResponse,
  getSuccessResponse,
  getUserByEmail,
  markUserVerifiedById,
  parseJsonBody,
  sendVerificationEmailToUser,
  verifyEmailVerificationToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request);

  if (!body || typeof body !== "object") {
    return getErrorResponse("Request body tidak valid", 400);
  }

  const { token, resend, email } = body as {
    token?: string;
    resend?: boolean;
    email?: string;
  };

  if (resend) {
    const user = await getUserByEmail(email || "");
    if (!user) {
      return getErrorResponse("Email tidak ditemukan", 404);
    }

    const emailResult = await sendVerificationEmailToUser(user);
    return getSuccessResponse({
      message: emailResult.success
        ? "Email verifikasi berhasil dikirim ulang. Silakan cek inbox atau folder spam Anda."
        : `Gagal mengirim email: ${emailResult.message}`,
      emailSent: emailResult.success,
    });
  }

  if (!token || typeof token !== "string") {
    return getErrorResponse("Token verifikasi wajib diisi", 400);
  }

  const payload = verifyEmailVerificationToken(token);
  if (!payload?.userId) {
    return getErrorResponse(
      "Token verifikasi tidak valid atau sudah kadaluarsa",
      401,
    );
  }

  const user = await markUserVerifiedById(payload.userId, payload.email);
  if (!user) {
    return getErrorResponse("Email tidak ditemukan", 404);
  }

  return getSuccessResponse({ message: "Email berhasil diverifikasi", user });
}
