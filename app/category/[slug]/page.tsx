import Link from 'next/link'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Params = { params: { slug: string | string[] | undefined } }

export default async function CategoryPage({ params }: Params) {
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const slug = rawSlug?.toString().toLowerCase() || ''

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    })

    if (!category) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <main className="mx-auto max-w-6xl px-4 py-10">
            <p className="text-slate-700">Kategori tidak ditemukan.</p>
            <Link href="/category" className="mt-4 inline-block rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Kembali</Link>
          </main>
        </div>
      )
    }

    const filtered = await prisma.article.findMany({
      where: {
        status: 'published',
        category: category.name,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    })

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-6xl px-4 py-10">
          <section className="rounded-sm bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Kategori</p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">{category.name}</h1>
                <p className="mt-3 text-sm text-slate-600">{category.description || 'Kumpulan berita terbaru dalam kategori ini.'}</p>
              </div>
              <div className="rounded-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
                {filtered.length} artikel • {category.name}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Jelajahi berita terbaru dan topik pilihan di kategori {category.name}.</p>
          </section>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-sm bg-white p-6 shadow-sm">
              <p className="text-base font-semibold text-slate-900">Belum ada artikel untuk kategori ini.</p>
              <p className="mt-2 text-sm text-slate-600">Silakan periksa kategori lain atau kembali lagi nanti.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {filtered.map((article) => (
                <article key={article.slug} className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
                  <div className="h-44 overflow-hidden bg-slate-200">
                    <img src={article.featuredImage ?? '/images/Background.jpg'} alt={article.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">{article.category}</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{article.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{article.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Update 1 jam lalu</span>
                      <Link href={`/articles/${article.slug}`} className="font-semibold text-blue-600">Baca selengkapnya</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    // If page generation fails because of a transient DB error, render a friendly fallback.
    // eslint-disable-next-line no-console
    console.error('Failed to render category page:', error)

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-6xl px-4 py-10">
          <section className="rounded-sm bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">Kategori tidak dapat dimuat</h1>
            <p className="mt-4 text-sm text-slate-600">Terjadi masalah saat mengambil informasi kategori. Silakan coba lagi nanti.</p>
            <Link href="/category" className="mt-6 inline-block rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Kembali ke daftar kategori</Link>
          </section>
        </main>
      </div>
    )
  }
}
