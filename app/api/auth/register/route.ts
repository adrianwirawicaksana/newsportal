import { NextRequest } from "next/server";
import {
  createUserRecord,
  getErrorResponse,
  getSuccessResponse,
  getUserByEmail,
  isValidEmail,
  parseJsonBody,
  recreateUnverifiedUserRecord,
  sendVerificationEmailToUser,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request);

  if (!body || typeof body !== "object") {
    return getErrorResponse("Request body tidak valid", 400);
  }

  const { name, email, password, confirmPassword } = body as {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return getErrorResponse("Nama lengkap minimal 2 karakter", 400);
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return getErrorResponse("Format email tidak valid", 400);
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return getErrorResponse("Kata sandi minimal 8 karakter", 400);
  }

  if (password !== confirmPassword) {
    return getErrorResponse("Konfirmasi kata sandi tidak cocok", 400);
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    if (existingUser.verified) {
      return getErrorResponse("Email sudah terdaftar", 409);
    }

    const user = await recreateUnverifiedUserRecord(
      name.trim(),
      email.trim().toLowerCase(),
      password,
    );
    const emailResult = await sendVerificationEmailToUser(user);

    if (!emailResult.success) {
      console.error("Verification email failed:", emailResult.message);
      return getErrorResponse(
        "Akun sebelumnya belum diverifikasi, tetapi email verifikasi gagal dikirim. Silakan coba lagi nanti.",
        502,
      );
    }

    return getSuccessResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        message:
          "Akun sebelumnya belum diverifikasi. Kami mengirim ulang email verifikasi baru.",
        emailSent: true,
        emailError: null,
      },
      201,
    );
  }

  const user = await createUserRecord(
    name.trim(),
    email.trim().toLowerCase(),
    password,
  );
  const emailResult = await sendVerificationEmailToUser(user);

  if (!emailResult.success) {
    console.error("Verification email failed:", emailResult.message);
    return getErrorResponse(
      "Akun berhasil dibuat, tetapi email verifikasi gagal dikirim. Silakan coba kirim ulang dari halaman verifikasi.",
      502,
    );
  }

  const response = getSuccessResponse(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.",
      emailSent: true,
      emailError: null,
    },
    201,
  );

  return response;
}
