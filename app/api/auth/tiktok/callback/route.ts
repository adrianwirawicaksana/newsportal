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

function getAppOrigin(request: NextRequest) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  return request.nextUrl.origin.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription =
    request.nextUrl.searchParams.get("error_description");
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;
  const redirectTo = getSafeRedirectPath(
    request.cookies.get("tiktok_oauth_redirect")?.value ?? null,
  );

  if (error) {
    console.error("TikTok OAuth returned an error", {
      error,
      errorDescription,
    });

    const params = new URLSearchParams({ error: `tiktok_${error}` });
    if (errorDescription) {
      params.set("message", errorDescription);
    }

    return NextResponse.redirect(
      new URL(`/auth/login?${params.toString()}`, request.nextUrl.origin),
    );
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL(
        "/auth/login?error=tiktok_state_mismatch",
        request.nextUrl.origin,
      ),
    );
  }

  const origin = getAppOrigin(request);
  const redirectUri = `${origin}/api/auth/tiktok/callback`;

  const tokenResponse = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY || "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    },
  );

  const tokenData = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || !tokenData?.access_token) {
    console.error("TikTok token exchange failed", {
      status: tokenResponse.status,
      error: tokenData?.error,
      error_description: tokenData?.error_description,
    });

    const params = new URLSearchParams({ error: "tiktok_exchange_failed" });
    if (tokenData?.error_description) {
      params.set("message", tokenData.error_description);
    }

    return NextResponse.redirect(
      new URL(`/auth/login?${params.toString()}`, request.nextUrl.origin),
    );
  }

  const profileResponse = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,avatar_url,username",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  const profilePayload = await profileResponse.json().catch(() => null);
  const profile = profilePayload?.data?.user;
  if (!profileResponse.ok || !profile) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  const providerId =
    profile.open_id || profile.union_id || tokenData.open_id || "tiktok-user";
  const user = await createOrUpdateSocialUser({
    provider: "tiktok",
    email: `${providerId}@tiktok.local`,
    name: profile.display_name || profile.username || "TikTok User",
  });

  const session = createSession(user.id);
  const accessToken = createAccessToken(user.id);
  const response = NextResponse.redirect(
    new URL(redirectTo, request.nextUrl.origin),
  );
  setAuthCookies(response, accessToken, session.refreshToken);

  return response;
}
