import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Dashboard Admin PortalNews',
  description: 'Panel admin PortalNews untuk mengelola artikel, kategori, dan konten portal berita.',
  alternates: {
    canonical: '/admin/dashboard',
  },
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  const isKetua = session.role === 'ketua'
  const roleLabel = isKetua ? 'Ketua' : 'Admin'
  const accessSummary = isKetua
    ? 'Area kerja khusus ketua untuk mengelola pengguna, konten, dan statistik portal.'
    : 'Area kerja khusus admin untuk mengelola konten editorial dan kategori.'

  const [totalArticles, categories, totalUsers] = await Promise.all([
    prisma.article.count(),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    isKetua ? prisma.user.count() : Promise.resolve(0),
  ])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Dashboard {roleLabel}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Selamat datang, {session.name}</h1>
            <p className="mt-2 text-sm text-slate-600">Role {roleLabel} • {accessSummary}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Ke Beranda
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Total Artikel</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalArticles}</p>
          </div>
          <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Total Kategori</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{categories.length}</p>
          </div>
          <div className="rounded-sm border border-gray-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Status Akses</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{roleLabel}</p>
            <p className="mt-2 text-sm text-slate-600">{isKetua ? 'Akses penuh untuk area ketua' : 'Akses operasional untuk area admin'}</p>
          </div>
        </div>

        {isKetua ? (
          <section className="mt-8 rounded-sm border border-gray-200 bg-blue-50 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Fitur khusus Ketua</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Link href="/admin/users" className="rounded-sm border border-blue-200 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-100">
                <p className="font-semibold text-slate-900">Kelola User</p>
                <p className="mt-1 text-sm text-slate-600">Atur akun pengguna dan hak akses internal.</p>
              </Link>
              <Link href="/admin/statistics" className="rounded-sm border border-blue-200 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-100">
                <p className="font-semibold text-slate-900">Statistik</p>
                <p className="mt-1 text-sm text-slate-600">Pantau performa portal dan ringkasan data.</p>
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-sm border border-gray-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Fokus kerja Admin</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Link href="/admin/categories" className="rounded-sm border border-emerald-200 bg-white p-4 transition hover:border-emerald-400 hover:bg-emerald-100">
                <p className="font-semibold text-slate-900">Kelola Kategori</p>
                <p className="mt-1 text-sm text-slate-600">Atur struktur konten dan pengelompokan artikel.</p>
              </Link>
              <Link href="/admin/articles" className="rounded-sm border border-emerald-200 bg-white p-4 transition hover:border-emerald-400 hover:bg-emerald-100">
                <p className="font-semibold text-slate-900">Kelola Artikel</p>
                <p className="mt-1 text-sm text-slate-600">Buat, edit, dan kelola publikasi konten.</p>
              </Link>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-sm border border-gray-200 bg-slate-50 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Kategori aktif</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <span key={category.id} className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold text-blue-600">
                  {category.name}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Hak akses Anda</h2>
            <div className="mt-4 rounded-sm border border-gray-200 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{roleLabel}</p>
              <p className="mt-2">
                {isKetua
                  ? 'Anda melihat area khusus ketua: kelola user, statistik, dan kontrol prioritas portal.'
                  : 'Anda melihat area khusus admin: kelola kategori, artikel, dan operasi editorial harian.'}
              </p>
              {isKetua ? <p className="mt-3 text-sm font-medium text-emerald-600">Privasi role aktif: hanya panel ketua yang muncul.</p> : <p className="mt-3 text-sm font-medium text-blue-600">Privasi role aktif: hanya panel admin yang muncul.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
