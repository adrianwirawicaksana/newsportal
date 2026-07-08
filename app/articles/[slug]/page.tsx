import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ArticleComments from '@/components/ArticleComments'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params
  let article: any = null
  try {
    article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, avatar: true } },
        comments: { include: { user: { select: { name: true } } } },
      },
    })
  } catch (err) {
    // DB unavailable — render friendly message instead of crashing prerender
    // eslint-disable-next-line no-console
    console.error('Failed to load article from DB:', err)
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-20">
          <p>Database tidak tersedia saat ini. Silakan coba lagi nanti.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600">Kembali ke beranda</Link>
        </main>
        <Footer />
      </div>
    )
  }

  if (!article) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-20">
        <p>Artikel tidak ditemukan.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600">Kembali ke beranda</Link>
      </main>
      <Footer />
    </div>
  )

  const relatedArticles = await prisma.article.findMany({
    where: {
      category: article.category,
      slug: { not: slug },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 3,
  })

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <Link href="/" className="mb-6 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">
          ← Kembali ke beranda
        </Link>

        <article className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
          <div className="relative h-72 w-full bg-slate-200 sm:h-96">
            <Image src={article.featuredImage || '/images/Background.jpg'} alt={article.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur-sm">
                  {article.category || 'Umum'}
                </span>
                <span className="text-sm text-slate-100">PortalNews • 8 menit baca</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{article.title}</h1>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="text-lg leading-8 text-slate-700">{article.excerpt}</p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">Ringkasan berita</h2>
                </div>
                <div
                  className="article-content mt-4 text-sm leading-7 text-slate-600"
                  dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />
              </div>

              <aside className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Berita terkait</h3>
                <div className="mt-4 space-y-3">
                  {relatedArticles.length === 0 ? (
                    <div className="rounded-sm border border-gray-200 bg-slate-50 p-4 text-sm text-slate-600">
                      Belum ada artikel terkait untuk saat ini. Coba lihat kategori lain atau kembali nanti.
                    </div>
                  ) : (
                    relatedArticles.map((item: any) => (
                      <Link key={item.slug} href={`/articles/${item.slug}`} className="block rounded-sm border border-gray-200 p-3 transition hover:border-blue-400 hover:bg-slate-50">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                      </Link>
                    ))
                  )}
                </div>
              </aside>
            </div>

            <ArticleComments articleId={article.id} initialComments={article.comments || []} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
