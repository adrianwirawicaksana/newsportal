import { NextRequest } from "next/server";
import {
  clearAuthCookies,
  getErrorResponse,
  getRefreshTokenFromRequest,
  getSuccessResponse,
  renewSessionFromRefreshToken,
  setAuthCookies,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshTokenFromRequest(request);

  if (!refreshToken) {
    const response = getErrorResponse("Refresh token tidak tersedia", 401);
    clearAuthCookies(response);
    return response;
  }

  const refreshed = await renewSessionFromRefreshToken(refreshToken);
  if (!refreshed) {
    const response = getErrorResponse("Refresh token tidak valid", 401);
    clearAuthCookies(response);
    return response;
  }

  const response = getSuccessResponse({
    user: refreshed.user,
    message: "Token berhasil diperbarui",
  });

  setAuthCookies(response, refreshed.accessToken, refreshed.refreshToken);
  return response;
}
