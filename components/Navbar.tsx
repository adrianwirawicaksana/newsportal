"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type NavbarProps = {
  initialQuery?: string
}

export default function Navbar({ initialQuery = '' }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSearchText(initialQuery)
  }, [initialQuery])

  const suggestions = useMemo(() => {
    return []
  }, [searchText])

  return (
    <header className="sticky top-0 w-full bg-black z-99">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 py-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white">
          <Image src="/icons/News.svg" alt="PortalNews logo" width={40} height={40} className="shrink-0" />
          PortalNews
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-linear-to-t from-gray-200 to-white text-black transition hover:shadow-sm md:hidden"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="order-3 w-full md:order-2 md:w-auto relative">
          <form
            action="/"
            method="get"
            onSubmit={(e) => {
              e.preventDefault()
              const query = searchText.trim()
              if (!query) {
                router.push('/')
                return
              }
              setShowSuggestions(false)
              router.push(`/?q=${encodeURIComponent(query)}#container-search`)
            }}
            className="flex w-full min-w-0 items-center gap-1 rounded-sm bg-white/10 px-3 py-2 md:bg-white/20"
          >
            <Image src="/icons/Search.svg" alt="Search" width={25} height={25} className="shrink-0" />
            <input
              type="text"
              name="q"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              aria-label="Cari berita"
              placeholder="Cari berita..."
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-300"
            />
          </form>
        </div>

        <div className="hidden items-center gap-6 text-base text-white md:flex md:order-3">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white">Beranda</Link>
            <Link href="/category" className="text-gray-400 hover:text-white">Kategori</Link>
            <Link href="#" className="text-gray-400 hover:text-white">Tentang</Link>
          </nav>
          <Link href="/auth/login" className="rounded-sm bg-linear-to-t from-gray-200 to-white px-3 py-2 text-base font-semibold text-black">
            Masuk
          </Link>
        </div>
      </div>

      <div className={`${menuOpen ? 'block' : 'hidden'} border-t border-white/10 bg-black/95 md:hidden`}>
        <nav className="space-y-2 px-4 py-4">
          <Link href="/" className="block rounded-sm px-3 py-2 text-white transition hover:bg-white/10">Beranda</Link>
          <Link href="/category" className="block rounded-sm px-3 py-2 text-white transition hover:bg-white/10">Kategori</Link>
          <Link href="#" className="block rounded-sm px-3 py-2 text-white transition hover:bg-white/10">Tentang</Link>
          <Link href="/auth/login" className="block rounded-sm bg-linear-to-t from-gray-200 to-white px-3 py-2 text-center text-sm font-semibold text-black transition hover:bg-slate-100">
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  );
}