import Image from 'next/image'
import Link from 'next/link'

export default function AdminFooter() {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-300 sm:px-6 sm:py-10 lg:px-8 lg:text-base">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Image src="/icons/News.svg" alt="PortalNews logo" width={40} height={40} />
              <div>
                <h4 className="text-xl font-bold text-white sm:text-2xl">PortalNews Admin</h4>
                <p className="text-sm text-slate-400">Panel manajemen konten</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Kelola berita, kategori, komentar, dan akses pengguna dari satu dashboard terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-semibold text-white">Navigasi</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li>
                  <Link href="/admin/dashboard" className="transition hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/articles" className="transition hover:text-white">
                    Artikel
                  </Link>
                </li>
                <li>
                  <Link href="/admin/categories" className="transition hover:text-white">
                    Kategori
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Kelola</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li>
                  <Link href="/admin/users" className="transition hover:text-white">
                    Pengguna
                  </Link>
                </li>
                <li>
                  <Link href="/admin/statistics" className="transition hover:text-white">
                    Statistik
                  </Link>
                </li>
                <li>
                  <Link href="/admin/logout" className="transition hover:text-white">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Dukungan</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li>
                  <Link href="/" className="transition hover:text-white">
                    Lihat situs publik
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="transition hover:text-white">
                    Login admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-800 pt-4 text-sm text-slate-500">
          © {new Date().getFullYear()} PortalNews. Semua hak cipta.
        </p>
      </div>
    </footer>
  )
}
