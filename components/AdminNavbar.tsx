import Link from 'next/link'
import type { AdminRole, AdminSession } from '@/lib/admin-auth'

type MenuItem = {
  href: string
  label: string
  roles: AdminRole[]
}

const menuItems: MenuItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', roles: ['admin', 'ketua'] },
  { href: '/admin/users', label: 'Kelola User', roles: ['ketua'] },
  { href: '/admin/categories', label: 'Kelola Kategori', roles: ['admin', 'ketua'] },
  { href: '/admin/articles', label: 'Kelola Artikel', roles: ['admin', 'ketua'] },
  { href: '/admin/statistics', label: 'Statistik', roles: ['ketua'] },
]

export default function AdminNavbar({ session }: { session: AdminSession }) {
  const isKetua = session.role === 'ketua'

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-300 sm:text-sm">PortalNews Admin</p>
          <p className="mt-1 text-sm text-slate-300">Role {isKetua ? 'Ketua' : 'Admin'}</p>
          {isKetua ? (
            <p className="mt-1 text-xs font-medium text-emerald-400">Akses penuh: dashboard, user, kategori, artikel, statistik</p>
          ) : (
            <p className="mt-1 text-xs font-medium text-blue-300">Akses operasional: dashboard, kategori, artikel</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {menuItems
            .filter((item) => item.roles.includes(session.role))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex w-full justify-center rounded-sm border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white sm:w-auto"
              >
                {item.label}
              </Link>
            ))}
          <Link
            href="/admin/logout"
            className="inline-flex w-full justify-center rounded-sm bg-linear-to-t from-gray-200 to-white px-3 py-2 text-sm font-semibold text-black transition hover:opacity-90 sm:w-auto"
          >
            Logout
          </Link>
        </div>
      </div>
    </header>
  )
}
