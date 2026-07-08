import type { Metadata } from 'next'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Statistik PortalNews',
  description: 'Lihat performa portal berita PortalNews melalui statistik artikel, kategori, dan aktivitas admin.',
  alternates: {
    canonical: '/admin/statistics',
  },
}

export const dynamic = 'force-dynamic'

export default async function AdminStatisticsPage() {
  const [articles, totalCategories, totalUsers] = await Promise.all([
    prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.category.count(),
    prisma.user.count(),
  ])

  const totalArticles = articles.length
  const publishedArticles = articles.filter((article) => article.status === 'published').length
  const draftArticles = articles.filter((article) => article.status === 'draft').length
  const archivedArticles = articles.filter((article) => article.status === 'archived').length

  const categoryBreakdown = Object.entries(
    articles.reduce<Record<string, number>>((accumulator, article) => {
      accumulator[article.category] = (accumulator[article.category] ?? 0) + 1
      return accumulator
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Statistik Ketua</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Monitor performa portal dan konten editorial</h2>
        <p className="mt-2 text-sm text-slate-600">Halaman ini fokus pada status publikasi, distribusi kategori, dan aktivitas terbaru.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-gray-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Total artikel</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalArticles}</p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Terbit</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{publishedArticles}</p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Draft</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{draftArticles}</p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Arsip</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{archivedArticles}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-sm border border-gray-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Aktivitas terbaru</h3>
            <span className="text-sm font-medium text-blue-600">{totalUsers} pengguna terdaftar</span>
          </div>
          <div className="mt-4 space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between rounded-sm border border-gray-200 bg-white px-3 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{article.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{article.category} • {new Date(article.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {article.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Kategori aktif</h3>
            <p className="mt-1 text-sm text-slate-600">{totalCategories} kategori tersedia</p>
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.count} artikel</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-gray-200 bg-emerald-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Insight ketua</h3>
            <p className="mt-2 text-sm text-slate-600">
              Jika draft masih tinggi, fokuskan review editorial. Jika kategori utama mendominasi, pertimbangkan distribusi konten yang lebih seimbang.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
