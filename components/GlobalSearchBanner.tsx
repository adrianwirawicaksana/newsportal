"use client"

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type GlobalSearchBannerProps = {
  initialArticles: Array<{
    title: string
    excerpt: string
    category?: string | null
    slug: string
    image?: string | null
  }>
}

export default function GlobalSearchBanner({ initialArticles }: GlobalSearchBannerProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() || ''
  const normalizedQuery = query.toLowerCase()

  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) return []
    return initialArticles.filter((article) =>
      `${article.title} ${article.excerpt} ${article.category ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [initialArticles, normalizedQuery])

  useEffect(() => {
    if (!query) return
    const container = document.getElementById('container-search')
    container?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [query])

  if (!query) return null

  return (
    <section id="container-search" className="mb-6 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Global Search</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">Hasil pencarian untuk “{query}”</h2>
      <p className="mt-1 text-sm text-slate-600">Menampilkan {filteredArticles.length} hasil dari semua berita.</p>

      {filteredArticles.length === 0 ? (
        <div className="mt-6 rounded-sm border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Maaf, belum ada berita yang sesuai. Coba kata kunci lain.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.slice(0, 3).map((article) => (
            <article key={article.slug} className="overflow-hidden rounded-sm border border-gray-200 bg-slate-50 shadow-sm">
              <div className="relative h-40 w-full bg-slate-200">
                <Image
                  src={article.image || '/images/Background.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                {article.category ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">{article.category}</p> : null}
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{article.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{article.excerpt}</p>
                <Link href={`/articles/${article.slug}`} className="mt-3 inline-block text-sm font-semibold text-blue-600">Baca selengkapnya</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
