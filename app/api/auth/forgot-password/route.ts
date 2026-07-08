import { NextRequest } from "next/server";
import {
  getErrorResponse,
  getSuccessResponse,
  getUserByEmail,
  isValidEmail,
  parseJsonBody,
  sendPasswordResetEmailToUser,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request);

  if (!body || typeof body !== "object") {
    return getErrorResponse("Request body tidak valid", 400);
  }

  const { email } = body as { email?: string };

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return getErrorResponse("Format email tidak valid", 400);
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return getSuccessResponse({
      message:
        "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda.",
      emailSent: true,
    });
  }

  const emailResult = await sendPasswordResetEmailToUser(user);
  if (!emailResult.success) {
    console.error("Password reset email failed:", emailResult.message);
    return getErrorResponse(
      "Gagal mengirim instruksi reset password. Silakan coba lagi nanti.",
      502,
    );
  }

  return getSuccessResponse({
    message:
      "Instruksi reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.",
    emailSent: true,
    email: user.email,
  });
}
