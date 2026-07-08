"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import ArticleCard from './ArticleCard'

type Article = {
  slug: string
  title: string
  excerpt: string
  category?: string
  image?: string
}

type Category = {
  name: string
  slug?: string
}

type NewsFeedProps = {
  initialQuery?: string
  initialArticles?: any[]
  initialCategories?: Category[]
}

export default function NewsFeed({ initialQuery = '', initialArticles = [], initialCategories = [] }: NewsFeedProps) {
  const [articles] = useState<Article[]>(initialArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    image: a.featuredImage,
  })))
  const query = initialQuery || ''
  const [category, setCategory] = useState('Semua')

  const categoryItems = useMemo(() => {
    if (initialCategories.length) {
      return initialCategories.map((c) => ({ name: c.name, slug: c.slug }))
    }

    const uniqueNames = Array.from(new Set(articles.map((a) => a.category || 'Lainnya')))
    return uniqueNames.map((name) => ({ name }))
  }, [articles, initialCategories])

  const categories = useMemo(() => {
    return ['Semua', ...categoryItems.map((c) => c.name)]
  }, [categoryItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => {
      if (category !== 'Semua' && (a.category || 'Lainnya') !== category) return false
      if (!q) return true
      return (a.title + ' ' + a.excerpt).toLowerCase().includes(q)
    })
  }, [articles, query, category])

  return (
    <section className="mt-8 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Berita Terbaru</h2>
          <p className="mt-1 text-sm text-slate-600">Cari dan filter berita terbaru berdasarkan kategori.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label className="sr-only">Pilih kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none w-full rounded-sm border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 outline-none"
            >
              {categories.map((c) => (
                <option className="text-slate-900" key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.249a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-sm bg-white p-6 text-slate-700 shadow-sm">
              <p className="text-base font-semibold text-slate-900">Tidak ada hasil ditemukan</p>
              <p className="mt-2 text-sm text-slate-600">Coba kata kunci lain atau kosongkan pencarian untuk melihat semua berita.</p>
            </div>
          ) : (
            filtered.map((a) => (
              <ArticleCard key={a.slug ?? a.title} slug={a.slug} title={a.title} excerpt={a.excerpt} category={a.category} image={a.image} />
            ))
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-sm bg-white p-4 shadow-sm">
          <h4 className="text-base font-semibold text-slate-900">Filter Kategori</h4>
          <p className="mt-2 text-sm text-slate-600">Pilih kategori untuk menyaring berita tanpa keluar dari halaman utama.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('Semua')}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${category === 'Semua' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Semua
            </button>
            {categoryItems.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${category === cat.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {categoryItems.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-500">
              <p>Tekan kategori untuk memfilter berita, atau gunakan dropdown di atas jika Anda ingin memilih kembali.</p>
            </div>
          )}
        </div>

        <div className="rounded-sm bg-white p-4 shadow-sm">
          <h4 className="text-base font-semibold text-slate-900">Editor Pilihan</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {articles.length === 0 ? (
              <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Tidak ada berita untuk ditampilkan saat ini. Kunjungi beranda setelah konten tersedia.
              </div>
            ) : (
              articles.slice(0, 3).map((item) => (
                <Link
                  key={item.slug ?? item.title}
                  href={`/articles/${item.slug}`}
                  className="flex items-center gap-3 rounded-sm border border-gray-200 p-3 transition hover:border-blue-400 hover:bg-slate-50"
                >
                  <div className="h-16 w-24 overflow-hidden rounded-sm bg-slate-200">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full skeleton overflow-hidden px-2">
                        <span className="marquee text-xs font-semibold">Gambar tidak tersedia</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category ?? 'Berita pilihan'} Baru saja</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </aside>
    </section>
  )
}
