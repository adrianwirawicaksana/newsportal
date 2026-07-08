import { NextRequest, NextResponse } from "next/server";
import {
  createAccessToken,
  createOrUpdateSocialUser,
  createSession,
  setAuthCookies,
} from "@/lib/auth";

function getSafeRedirectPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//") || value.includes("://")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("discord_oauth_state")?.value;
  const redirectTo = getSafeRedirectPath(
    request.cookies.get("discord_oauth_redirect")?.value ?? null,
  );

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const redirectUri = new URL(
    "/api/auth/discord/callback",
    request.nextUrl.origin,
  ).toString();

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || !tokenData?.access_token) {
    console.error("Discord token exchange failed", {
      status: tokenResponse.status,
      error: tokenData?.error,
      errorDescription: tokenData?.error_description,
    });

    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const profileResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = await profileResponse.json().catch(() => null);
  if (!profileResponse.ok || !profile?.email) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const user = await createOrUpdateSocialUser({
    provider: "discord",
    email: profile.email,
    name: profile.global_name || profile.username || "Discord User",
  });

  const session = createSession(user.id);
  const accessToken = createAccessToken(user.id);
  const response = NextResponse.redirect(
    new URL(redirectTo, request.nextUrl.origin),
  );
  setAuthCookies(response, accessToken, session.refreshToken);

  return response;
}
