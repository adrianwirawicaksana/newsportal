import Link from 'next/link'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kategori Berita - PortalNews',
  description: 'Pilih kategori berita PortalNews untuk menemukan update sesuai minat dan topik favorit Anda.',
}

export default async function CategoryIndexPage() {
  const [categories, articleCount] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.article.count({ where: { status: 'published' } }),
  ])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-sm bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">Kategori</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Jelajahi berita berdasarkan topik</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Temukan berita terbaru PortalNews sesuai minat Anda. Dari nasional hingga teknologi, setiap kategori menghadirkan liputan tajam untuk pembaca Indonesia.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-2 font-medium">{articleCount} Artikel</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-medium">Update harian</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-medium">Liputan terverifikasi</span>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="mt-8 rounded-sm bg-white p-6 shadow-sm">
            <p className="text-base font-semibold text-slate-900">Tidak ada kategori yang tersedia.</p>
            <p className="mt-2 text-sm text-slate-600">Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-60 overflow-hidden bg-slate-200">
                  <img src="/images/Background.jpg" alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    {category.name}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{category.description ?? 'Kategori berita terbaru dan terpercaya.'}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    Lihat berita kategori
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
