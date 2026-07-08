import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug =
    typeof body?.slug === "string"
      ? body.slug.trim().toLowerCase()
      : name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
  const description =
    typeof body?.description === "string" ? body.description : "";

  if (!name) {
    return NextResponse.json(
      { success: false, error: "Nama kategori wajib diisi." },
      { status: 400 },
    );
  }

  const category = await prisma.category.create({
    data: { name, slug, description },
  });
  return NextResponse.json({ success: true, category });
}
