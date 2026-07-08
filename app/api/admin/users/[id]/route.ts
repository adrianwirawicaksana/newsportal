import { NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body?.role === "string" ? body.role : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !role) {
    return NextResponse.json(
      { success: false, error: "Nama, email, dan role wajib diisi." },
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
  if (existingUser && existingUser.id !== id) {
    return NextResponse.json(
      { success: false, error: "Email sudah terdaftar oleh pengguna lain." },
      { status: 400 },
    );
  }

  const updateData: any = { name, email, role };
  if (password) {
    updateData.passwordHash = createHash("sha256")
      .update(password)
      .digest("hex");
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
