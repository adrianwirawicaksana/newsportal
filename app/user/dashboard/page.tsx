'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type DashboardData = {
  user: { id: string; name: string; email: string; verified: boolean; createdAt: string }
  recentComments: Array<{ id: string; content: string; createdAt: string; article: { id: string; title: string; slug: string; category: string } }>
  latestArticles: Array<{ id: string; title: string; slug: string; category: string }>
  savedArticlesCount: number
}

export default function UserDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setIsLoading(true)
    setError('')

    const response = await fetch('/api/user-dashboard')
    if (!response.ok) {
      setError('Gagal memuat dashboard. Pastikan Anda sudah login.')
      setIsLoading(false)
      return
    }

    const result = await response.json()
    if (!result?.success) {
      setError(result?.error || 'Gagal memuat data dashboard.')
      setIsLoading(false)
      return
    }

    setData(result.dashboard)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Dashboard Pengguna</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{data ? `Halo, ${data.user.name}` : 'Dashboard Pengguna'}</h1>
              <p className="mt-2 text-sm text-slate-600">Ringkasan aktivitas Anda di PortalNews.</p>
            </div>
            <div className="space-x-3">
              <Link href="/" className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Kembali ke Beranda
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">Memuat dashboard...</div>
          ) : error ? (
            <div className="mt-8 rounded-sm border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
          ) : data ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="mt-2 font-semibold text-slate-900">{data.user.email}</p>
                </div>
                <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Akun dibuat</p>
                  <p className="mt-2 font-semibold text-slate-900">{new Date(data.user.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Komentar terbaru</p>
                  <p className="mt-2 font-semibold text-slate-900">{data.recentComments.length}</p>
                </div>
              </div>

              <section className="rounded-sm border border-gray-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Komentar terakhir Anda</h2>
                {data.recentComments.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">Belum ada komentar. Baca berita dan tambahkan pendapat Anda.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {data.recentComments.map((comment) => (
                      <div key={comment.id} className="rounded-sm border border-gray-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                          <span>{new Date(comment.createdAt).toLocaleString('id-ID')}</span>
                          <span className="rounded-full bg-blue-600/10 px-2 py-1 text-blue-600">{comment.article.category}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
                        <Link href={`/articles/${comment.article.slug}`} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
                          Lihat artikel: {comment.article.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-sm border border-gray-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Artikel terbaru</h2>
                <div className="mt-4 space-y-3">
                  {data.latestArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-sm border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-slate-50">
                      <p className="font-semibold text-slate-900">{article.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{article.category}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
