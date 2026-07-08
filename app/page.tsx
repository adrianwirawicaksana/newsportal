export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'PortalNews - Berita Terkini Nasional, Dunia, Teknologi, dan Olahraga',
  description: 'PortalNews menyediakan berita terbaru dan terpercaya seputar nasional, dunia, teknologi, olahraga, serta opini mendalam untuk pembaca Indonesia.',
  openGraph: {
    title: 'PortalNews - Berita Terkini Nasional, Dunia, Teknologi, dan Olahraga',
    description: 'Berita terbaru dan terpercaya seputar nasional, dunia, teknologi, olahraga, dan gaya hidup. Update harian untuk pembaca Indonesia.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'PortalNews',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PortalNews - Berita Terkini Nasional, Dunia, Teknologi, dan Olahraga',
    description: 'Berita terbaru dan terpercaya seputar nasional, dunia, teknologi, olahraga, dan gaya hidup. Update harian untuk pembaca Indonesia.',
  },
};
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import NewsFeed from '@/components/NewsFeed'
import GlobalSearchBanner from '@/components/GlobalSearchBanner'
import prisma from '@/lib/prisma'

type HomePageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams
  const initialQuery = params.q?.trim() || ''
  const normalizedQuery = initialQuery.toLowerCase()
  let docs: any[] = []
  let cats: any[] = []
  try {
    docs = await prisma.article.findMany({
      where: { status: 'published' },
      include: { author: { select: { name: true, avatar: true, role: true } } },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    })
    cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch (err) {
    // If DB is unavailable during build/prerender, fallback to empty lists
    // and allow the site to build. Log for diagnostics.
    // eslint-disable-next-line no-console
    console.error('Failed to load articles/categories from DB:', err)
    docs = []
    cats = []
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar initialQuery={initialQuery} />

      <main className="mx-auto max-w-6xl px-4">
        <Hero heroArticle={docs?.[0] ?? null} trendingArticles={docs.slice(1, 4)} />
        <GlobalSearchBanner initialArticles={docs} />
        <NewsFeed initialQuery={initialQuery} initialArticles={docs} initialCategories={cats} />
      </main>

      <Footer />
    </div>
  )
}
