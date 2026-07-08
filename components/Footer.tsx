import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-300 sm:px-6 sm:py-10 lg:px-8 lg:text-base">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <Image src="/icons/News.svg" alt="PortalNews logo" width={40} height={40} />
              <h4 className="text-xl font-bold text-white sm:text-2xl">PortalNews</h4>
            </div>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Sumber berita terpercaya—berita terkini, analisis, dan opini.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-semibold text-white">Bagian</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li><Link href="#" className="transition hover:text-white">Nasional</Link></li>
                <li><Link href="#" className="transition hover:text-white">Dunia</Link></li>
                <li><Link href="#" className="transition hover:text-white">Teknologi</Link></li>
                <li><Link href="#" className="transition hover:text-white">Olahraga</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Perusahaan</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li><Link href="#" className="transition hover:text-white">Tentang</Link></li>
                <li><Link href="#" className="transition hover:text-white">Kontak</Link></li>
                <li><Link href="#" className="transition hover:text-white">Karier</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Dukungan</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li><Link href="#" className="transition hover:text-white">FAQ</Link></li>
                <li><Link href="#" className="transition hover:text-white">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="transition hover:text-white">Syarat Layanan</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-gray-200 pt-4 text-sm text-slate-500">
          © {new Date().getFullYear()} PortalNews. Semua hak cipta.
        </p>
      </div>
    </footer>
  )
}
