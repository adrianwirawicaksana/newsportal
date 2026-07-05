import { NextRequest, NextResponse } from "next/server";
import {
  createAccessToken,
  createSession,
  createOrUpdateSocialUser,
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
  const storedState = request.cookies.get("google_oauth_state")?.value;
  const redirectTo = getSafeRedirectPath(
    request.cookies.get("google_oauth_redirect")?.value ?? null,
  );

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const redirectUri = new URL(
    "/api/auth/google/callback",
    request.nextUrl.origin,
  ).toString();

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || !tokenData?.access_token) {
    console.error("Google token exchange failed", {
      status: tokenResponse.status,
      redirectUri,
      error: tokenData?.error,
      errorDescription: tokenData?.error_description,
    });

    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const profileResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  const profile = await profileResponse.json().catch(() => null);
  if (!profileResponse.ok || !profile?.email) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const user = await createOrUpdateSocialUser({
    provider: "google",
    email: profile.email,
    name: profile.name || profile.given_name || "Google User",
  });

  const session = createSession(user.id);
  const accessToken = createAccessToken(user.id);
  const response = NextResponse.redirect(
    new URL(redirectTo, request.nextUrl.origin),
  );
  setAuthCookies(response, accessToken, session.refreshToken);

  return response;
}
