import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  createdAt: string;
};

type StoredUser = AuthUser & {
  passwordHash: string;
};

type SessionRecord = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: number;
  revoked: boolean;
  createdAt: number;
  updatedAt: number;
};

const users = new Map<string, StoredUser>();
const usersByEmail = new Map<string, StoredUser>();
const sessions = new Map<string, SessionRecord>();
const sessionsByRefreshTokenHash = new Map<string, SessionRecord>();

const DEFAULT_SECRET = "dev-auth-secret-change-me";
const ACCESS_TOKEN_TTL = 15 * 60;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production");
  }

  return DEFAULT_SECRET;
}

function toBase64Url(value: string | Buffer) {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;
  return buffer.toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseDurationToSeconds(value: string) {
  if (value.endsWith("m")) return Number.parseInt(value, 10) * 60;
  if (value.endsWith("h")) return Number.parseInt(value, 10) * 60 * 60;
  if (value.endsWith("d")) return Number.parseInt(value, 10) * 60 * 60 * 24;
  return Number.parseInt(value, 10);
}

function storeUser(user: StoredUser) {
  users.set(user.id, user);
  usersByEmail.set(user.email.toLowerCase(), user);
}

function storeSession(session: SessionRecord) {
  sessions.set(session.id, session);
  sessionsByRefreshTokenHash.set(session.refreshTokenHash, session);
}

async function tryDatabaseConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch {
    return false;
  }
}

function toStoredUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  verified?: boolean;
  createdAt?: string | Date;
}): StoredUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    verified: user.verified ?? false,
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : new Date().toISOString(),
  };
}

function createToken(
  payload: Record<string, unknown>,
  expiresInSeconds: number,
) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    }),
  );
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getAuthSecret())
    .update(signingInput)
    .digest("base64url");

  return `${signingInput}.${signature}`;
}

function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;
  const expectedSignature = createHmac("sha256", getAuthSecret())
    .update(signingInput)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(
      fromBase64Url(payload).toString("utf8"),
    ) as {
      exp?: number;
      sub?: string;
      email?: string;
      type?: string;
      role?: string;
    };

    if (
      !decodedPayload.exp ||
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    if (!decodedPayload.sub || !decodedPayload.type) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(derivedKey));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    createdAt: user.createdAt,
  };
}

export async function createUserRecord(
  name: string,
  email: string,
  password: string,
  verified = false,
): Promise<StoredUser> {
  const normalizedEmail = email.toLowerCase();
  const cached = usersByEmail.get(normalizedEmail);
  if (cached) {
    return cached;
  }

  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const fallbackUser: StoredUser = {
    id: `user_${randomBytes(8).toString("hex")}`,
    name,
    email: normalizedEmail,
    passwordHash,
    verified,
    createdAt: now,
  };

  const hasDatabase = await tryDatabaseConnection();
  if (hasDatabase) {
    try {
      const created = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          isVerified: verified,
          provider: "email",
          role: "user",
        },
      });

      const storedUser = toStoredUser({
        id: created.id,
        name: created.name,
        email: created.email,
        passwordHash: created.passwordHash ?? "",
        verified: created.isVerified,
        createdAt: created.createdAt,
      });

      storeUser(storedUser);
      return storedUser;
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }

      storeUser(fallbackUser);
      return fallbackUser;
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Database connection unavailable");
  }

  storeUser(fallbackUser);
  return fallbackUser;
}

export async function recreateUnverifiedUserRecord(
  name: string,
  email: string,
  password: string,
): Promise<StoredUser> {
  const normalizedEmail = email.toLowerCase();
  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const fallbackUser: StoredUser = {
    id: `user_${randomBytes(8).toString("hex")}`,
    name,
    email: normalizedEmail,
    passwordHash,
    verified: false,
    createdAt: now,
  };

  const hasDatabase = await tryDatabaseConnection();
  if (hasDatabase) {
    try {
      const existing = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          isVerified: false,
          provider: "email",
        },
      });

      if (existing) {
        const updated = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            email: normalizedEmail,
            passwordHash,
            isVerified: false,
            provider: "email",
            role: "user",
          },
        });

        const storedUser = toStoredUser({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          passwordHash: updated.passwordHash ?? "",
          verified: updated.isVerified,
          createdAt: updated.createdAt,
        });

        storeUser(storedUser);
        return storedUser;
      }
    } catch {
      // fall back to in-memory storage below
    }
  }

  storeUser(fallbackUser);
  return fallbackUser;
}

export async function createOrUpdateSocialUser({
  provider,
  email,
  name,
}: {
  provider: "google" | "discord" | "tiktok";
  email: string;
  name?: string;
}): Promise<StoredUser> {
  const normalizedEmail = email.toLowerCase();
  const normalizedName = (name || normalizedEmail.split("@")[0] || "Pengguna")
    .trim()
    .slice(0, 80);
  const fallbackUser: StoredUser = {
    id: `user_${randomBytes(8).toString("hex")}`,
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: "",
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const cached = usersByEmail.get(normalizedEmail);
  if (cached) {
    cached.name = normalizedName;
    cached.verified = true;
    storeUser(cached);
  }

  const hasDatabase = await tryDatabaseConnection();
  if (hasDatabase) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: normalizedName,
            provider,
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });

        const storedUser = toStoredUser({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          passwordHash: updatedUser.passwordHash || "",
          verified: updatedUser.isVerified,
          createdAt: updatedUser.createdAt,
        });

        storeUser(storedUser);
        return storedUser;
      }

      const created = await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          passwordHash: "",
          isVerified: true,
          provider,
          role: "user",
          lastLoginAt: new Date(),
        },
      });

      const storedUser = toStoredUser({
        id: created.id,
        name: created.name,
        email: created.email,
        passwordHash: created.passwordHash || "",
        verified: created.isVerified,
        createdAt: created.createdAt,
      });

      storeUser(storedUser);
      return storedUser;
    } catch (error) {
      console.error("Social auth persistence failed", error);
      storeUser(fallbackUser);
      return fallbackUser;
    }
  }

  if (cached) {
    return cached;
  }

  storeUser(fallbackUser);
  return fallbackUser;
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase();
  const cached = usersByEmail.get(normalizedEmail);
  if (cached) {
    return cached;
  }

  const hasDatabase = await tryDatabaseConnection();
  if (!hasDatabase) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return null;
    }

    const storedUser = toStoredUser({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash ?? "",
      verified: user.isVerified,
      createdAt: user.createdAt,
    });

    storeUser(storedUser);
    return storedUser;
  } catch {
    return null;
  }
}

export async function getUserById(id: string) {
  const cached = users.get(id);
  if (cached) {
    return cached;
  }

  const hasDatabase = await tryDatabaseConnection();
  if (!hasDatabase) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }

    const storedUser = toStoredUser({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash ?? "",
      verified: user.isVerified,
      createdAt: user.createdAt,
    });

    storeUser(storedUser);
    return storedUser;
  } catch {
    return null;
  }
}

export async function updateUserLastLogin(userId: string) {
  const hasDatabase = await tryDatabaseConnection();
  if (!hasDatabase) {
    return false;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

export async function markUserVerified(email: string) {
  const normalizedEmail = email.toLowerCase();
  let user = usersByEmail.get(normalizedEmail);

  if (!user) {
    const persistedUser = await getUserByEmail(normalizedEmail);
    user = persistedUser ?? undefined;
  }

  if (!user) {
    return null;
  }

  user.verified = true;
  storeUser(user);

  const hasDatabase = await tryDatabaseConnection();
  if (hasDatabase) {
    try {
      await prisma.user.updateMany({
        where: { email: normalizedEmail },
        data: { isVerified: true },
      });
    } catch {
      // ignore persistence errors
    }
  }

  return user;
}

export async function markUserVerifiedById(
  userId: string,
  email?: string | null,
) {
  let user = users.get(userId);

  if (!user) {
    const persistedUser = await getUserById(userId);
    user = persistedUser ?? undefined;
  }

  if (!user && email) {
    const persistedUser = await getUserByEmail(email);
    user = persistedUser ?? undefined;
  }

  if (!user) {
    return null;
  }

  user.verified = true;
  storeUser(user);

  const hasDatabase = await tryDatabaseConnection();
  if (hasDatabase) {
    try {
      const targetId = user.id;
      const normalizedEmail = user.email.toLowerCase();

      await prisma.user.updateMany({
        where: {
          OR: [{ id: targetId }, { email: normalizedEmail }],
        },
        data: { isVerified: true },
      });
    } catch {
      // ignore persistence errors
    }
  }

  return user;
}

export function createEmailVerificationToken(userId: string, email: string) {
  return createToken(
    { sub: userId, email, type: "email-verification" },
    24 * 60 * 60,
  );
}

export function createPasswordResetToken(userId: string, email: string) {
  return createToken({ sub: userId, email, type: "password-reset" }, 60 * 60);
}

export async function sendVerificationEmailToUser(user: StoredUser) {
  const verificationToken = createEmailVerificationToken(user.id, user.email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  return sendVerificationEmail(user.email, verificationUrl);
}

export async function sendPasswordResetEmailToUser(user: StoredUser) {
  const resetToken = createPasswordResetToken(user.id, user.email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
  return sendPasswordResetEmail(user.email, resetUrl);
}

export function verifyEmailVerificationToken(token: string) {
  const payload = verifyToken(token);
  if (!payload?.sub || payload.type !== "email-verification") {
    return null;
  }

  return {
    userId: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
  };
}

export function verifyPasswordResetToken(token: string) {
  const payload = verifyToken(token);
  if (!payload?.sub || payload.type !== "password-reset") {
    return null;
  }

  return {
    userId: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
  };
}

export async function updateUserPassword(
  userId: string,
  email: string | null | undefined,
  newPassword: string,
) {
  const normalizedEmail = email?.toLowerCase();
  let user = users.get(userId);

  if (!user) {
    const persistedUser = await getUserById(userId);
    user = persistedUser ?? undefined;
  }

  if (!user && normalizedEmail) {
    const persistedUser = await getUserByEmail(normalizedEmail);
    user = persistedUser ?? undefined;
  }

  if (!user) {
    return null;
  }

  user.passwordHash = hashPassword(newPassword);
  storeUser(user);

  const hasDatabase = await tryDatabaseConnection();
  if (hasDatabase) {
    try {
      await prisma.user.updateMany({
        where: {
          OR: [{ id: user.id }, { email: user.email }],
        },
        data: { passwordHash: user.passwordHash },
      });
    } catch {
      // ignore persistence errors
    }
  }

  return user;
}

function getSessionByRefreshToken(refreshToken: string) {
  return sessionsByRefreshTokenHash.get(hashToken(refreshToken)) ?? null;
}

export function createSession(userId: string) {
  const refreshToken = createToken(
    { sub: userId, type: "refresh" },
    REFRESH_TOKEN_TTL,
  );
  const expiresAt = Date.now() + REFRESH_TOKEN_TTL * 1000;
  const sessionId = `sess_${randomBytes(8).toString("hex")}`;
  const sessionRecord: SessionRecord = {
    id: sessionId,
    userId,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt,
    revoked: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  storeSession(sessionRecord);
  return { sessionId, refreshToken, expiresAt };
}

export function createAccessToken(userId: string) {
  return createToken({ sub: userId, type: "access" }, ACCESS_TOKEN_TTL);
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set("auth_token", accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_TTL,
  });
  response.cookies.set("refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_TTL,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("auth_token");
  response.cookies.delete("refresh_token");
}

export function getTokenFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader = request.headers.get("authorization");
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  return null;
}

export function getRefreshTokenFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get("refresh_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader = request.headers.get("authorization");
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  return null;
}

export async function getAuthenticatedUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.sub || payload.type !== "access") return null;

  const user = await getUserById(payload.sub);
  if (!user) return null;

  return sanitizeUser(user);
}

export async function getAuthenticatedUser(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.sub || payload.type !== "access") return null;

  const user = await getUserById(payload.sub);
  if (!user) return null;

  return sanitizeUser(user);
}

export async function renewSessionFromRefreshToken(refreshToken: string) {
  const payload = verifyToken(refreshToken);
  if (!payload?.sub || payload.type !== "refresh") return null;

  const existingSession = getSessionByRefreshToken(refreshToken);
  if (
    !existingSession ||
    existingSession.revoked ||
    existingSession.expiresAt <= Date.now()
  ) {
    return null;
  }

  const user = await getUserById(payload.sub);
  if (!user) return null;

  const newRefreshToken = createToken(
    { sub: user.id, type: "refresh" },
    REFRESH_TOKEN_TTL,
  );
  const newSessionRecord: SessionRecord = {
    ...existingSession,
    refreshTokenHash: hashToken(newRefreshToken),
    expiresAt: Date.now() + REFRESH_TOKEN_TTL * 1000,
    updatedAt: Date.now(),
  };

  sessionsByRefreshTokenHash.delete(existingSession.refreshTokenHash);
  sessions.set(existingSession.id, newSessionRecord);
  sessionsByRefreshTokenHash.set(
    newSessionRecord.refreshTokenHash,
    newSessionRecord,
  );

  const accessToken = createAccessToken(user.id);
  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: sanitizeUser(user),
  };
}

export function revokeSessionByRefreshToken(refreshToken: string) {
  const session = getSessionByRefreshToken(refreshToken);
  if (!session || session.revoked) {
    return false;
  }

  const revokedSession: SessionRecord = {
    ...session,
    revoked: true,
    updatedAt: Date.now(),
  };

  sessions.set(session.id, revokedSession);
  sessionsByRefreshTokenHash.delete(session.refreshTokenHash);
  return true;
}

export function getErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

export function getSuccessResponse(
  payload: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(
    {
      success: true,
      ...payload,
    },
    { status },
  );
}

export function parseJsonBody(request: NextRequest) {
  return request.json().catch(() => null);
}

export function parseDuration(value: string) {
  return parseDurationToSeconds(value);
}
