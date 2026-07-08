import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getSafeRedirectPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//") || value.includes("://")) return "/dashboard";
  return value;
}

function getAppOrigin(request: NextRequest) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  return request.nextUrl.origin.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL(
        "/auth/login?error=tiktok_not_configured",
        request.nextUrl.origin,
      ),
    );
  }

  const origin = getAppOrigin(request);
  const redirectUri = `${origin}/api/auth/tiktok/callback`;
  const state = randomBytes(16).toString("hex");
  const redirectTo = getSafeRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
  );

  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "user.info.basic,user.info.profile");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("tiktok_oauth_redirect", redirectTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return response;
}
