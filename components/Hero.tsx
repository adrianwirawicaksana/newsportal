import Link from 'next/link'

type Author = {
  _id?: string
  name?: string
  avatar?: string
}

type Article = {
  title?: string
  excerpt?: string
  featuredImage?: string
  slug?: string
  category?: string
  authorId?: Author | null
}

type HeroProps = {
  heroArticle: Article | null
  trendingArticles?: Article[]
}

export default function Hero({ heroArticle, trendingArticles = [] }: HeroProps) {
  const article = heroArticle

  if (!article) {
    return (
      <section className="mx-auto max-w-6xl py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="md:col-span-2 rounded-sm bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Berita Trending</h2>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-sm bg-slate-200">
              <div className="h-full w-full skeleton overflow-hidden px-3">
                <span className="marquee text-base font-semibold">Gambar tidak tersedia</span>
              </div>
            </div>
            <div className="mt-4 text-slate-600">Belum ada berita unggulan saat ini. Silakan kembali lagi nanti untuk melihat update terbaru.</div>
          </article>
          <aside className="rounded-sm bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Trendings</h3>
            <div className="mt-4 rounded-sm border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Belum ada tren berita saat ini. Segarkan halaman atau kembali lagi nanti untuk update terbaru.
            </div>
          </aside>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl py-10">
      <div className="grid gap-6 md:grid-cols-3">
        <article className="md:col-span-2 rounded-sm bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Berita Unggulan</h2>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <img src="/icons/Fire.svg" alt="Fire icon" className="h-6 w-6" />
            </span>
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-sm bg-slate-200">
            {article.featuredImage ? (
              <img src={article.featuredImage} alt={article.title || 'Hero'} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-full skeleton overflow-hidden px-3">
                <span className="marquee text-sm font-semibold">Gambar tidak tersedia · Gambar tidak tersedia · Gambar tidak tersedia · </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-slate-900 md:text-3xl">{article.title}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">{article.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {article.authorId?.avatar ? (
                  <img src={article.authorId.avatar} alt={article.authorId.name || 'Author'} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{article.authorId?.name || 'Redaksi'}</p>
                  <p className="text-xs text-slate-500">{article.category}</p>
                </div>
              </div>
              <div>
                <Link href={`/articles/${article.slug || '#'}`} className="inline-flex items-center rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Baca Selengkapnya</Link>
              </div>
            </div>
          </div>
        </article>

        <aside className="rounded-sm bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Trendings</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {trendingArticles.length === 0 ? (
              <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Belum ada tren berita saat ini. Segarkan halaman untuk melihat update terbaru.
              </div>
            ) : (
              trendingArticles.map((item) => (
                <Link key={item.slug ?? item.title} href={item.slug ? `/articles/${item.slug}` : '#'} className="flex items-center gap-3 rounded-sm border border-gray-200 p-3 transition hover:border-blue-400 hover:bg-slate-50">
                  <div className="h-16 w-24 overflow-hidden rounded-sm bg-slate-200">
                    {item.featuredImage ? (
                      <img src={item.featuredImage} alt={item.title || 'Trend'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full skeleton overflow-hidden px-2">
                        <span className="marquee text-xs font-semibold">Gambar tidak tersedia · Gambar tidak tersedia · </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.title || 'Berita terbaru'}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category ? `${item.category} • Baru saja` : 'PortalNews • Baru saja'}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
