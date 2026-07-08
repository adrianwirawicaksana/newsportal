import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("articleId");
  if (!articleId) {
    return NextResponse.json(
      { success: false, error: "articleId wajib disertakan." },
      { status: 400 },
    );
  }

  const comments = await prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, comments });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const articleId = typeof body?.articleId === "string" ? body.articleId : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!articleId || !content) {
    return NextResponse.json(
      { success: false, error: "articleId dan content wajib diisi." },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      articleId,
      userId: user.id,
      content,
      status: "approved",
    },
  });

  await prisma.article.update({
    where: { id: articleId },
    data: { commentCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true, comment });
}
