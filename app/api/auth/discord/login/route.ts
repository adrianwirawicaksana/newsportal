import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getSafeRedirectPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//") || value.includes("://")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL(
        "/auth/login?error=discord_not_configured",
        request.nextUrl.origin,
      ),
    );
  }

  const redirectUri = new URL(
    "/api/auth/discord/callback",
    request.nextUrl.origin,
  ).toString();
  const state = randomBytes(16).toString("hex");
  const redirectTo = getSafeRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
  );

  const authUrl = new URL("https://discord.com/api/oauth2/authorize");
  authUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "identify email");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("discord_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("discord_oauth_redirect", redirectTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return response;
}
