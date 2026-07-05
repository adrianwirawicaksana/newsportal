import { NextRequest } from "next/server";
import {
  getErrorResponse,
  getSuccessResponse,
  getUserByEmail,
  isValidEmail,
  parseJsonBody,
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
    return getErrorResponse("Email tidak ditemukan", 404);
  }

  return getSuccessResponse({
    message: "Instruksi reset password telah dikirim ke email Anda",
    email: user.email,
  });
}
