import { NextRequest } from "next/server";
import {
  clearAuthCookies,
  getErrorResponse,
  getRefreshTokenFromRequest,
  getSuccessResponse,
  revokeSessionByRefreshToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (refreshToken) {
    revokeSessionByRefreshToken(refreshToken);
  }

  const response = getSuccessResponse({ message: "Logout berhasil" });
  clearAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const response = getErrorResponse("Method not allowed", 405);
  clearAuthCookies(response);
  return response;
}
