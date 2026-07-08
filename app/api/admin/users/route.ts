import { NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["admin", "ketua", "user"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body?.role === "string" ? body.role : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !role || !password) {
    return NextResponse.json(
      { success: false, error: "Nama, email, role, dan password wajib diisi." },
      { status: 400 },
    );
  }

  if (!["admin", "ketua", "user"].includes(role)) {
    return NextResponse.json(
      { success: false, error: "Role harus admin, ketua, atau user biasa." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { success: false, error: "Email sudah terdaftar." },
      { status: 400 },
    );
  }

  const passwordHash = createHash("sha256").update(password).digest("hex");
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      provider: "email",
      passwordHash,
      isVerified: true,
    },
  });

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
