import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const [comments, latestArticles, savedArticlesCount] = await Promise.all([
    prisma.comment.findMany({
      where: { userId: user.id, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        article: {
          select: { id: true, title: true, slug: true, category: true },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, category: true },
    }),
    prisma.article.count({ where: { status: "published" } }),
  ]);

  return NextResponse.json({
    success: true,
    dashboard: {
      user,
      recentComments: comments,
      latestArticles,
      savedArticlesCount,
    },
  });
}
