import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true, role: true } } },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
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

  const author = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!author) {
    return NextResponse.json(
      { success: false, error: "Admin user not found" },
      { status: 404 },
    );
  }

  if (!title || !excerpt || !content || !category) {
    return NextResponse.json(
      {
        success: false,
        error: "Judul, ringkasan, isi, dan kategori wajib diisi.",
      },
      { status: 400 },
    );
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      authorId: author.id,
      status: "published",
      publishedAt: null,
    },
  });

  return NextResponse.json({ success: true, article });
}
