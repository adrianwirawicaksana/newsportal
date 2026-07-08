import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const excerpt = typeof body?.excerpt === "string" ? body.excerpt.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const category =
    typeof body?.category === "string" ? body.category.trim() : "";
  const slug =
    typeof body?.slug === "string"
      ? body.slug.trim().toLowerCase()
      : title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
  const featuredImage =
    typeof body?.featuredImage === "string" ? body.featuredImage : "";

  if (!title || !excerpt || !content || !category) {
    return NextResponse.json(
      {
        success: false,
        error: "Judul, ringkasan, isi, dan kategori wajib diisi.",
      },
      { status: 400 },
    );
  }

  const article = await prisma.article.update({
    where: { id },
    data: { title, excerpt, content, category, slug, featuredImage },
  });

  return NextResponse.json({ success: true, article });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
