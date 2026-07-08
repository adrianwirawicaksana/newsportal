'use client'

import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.success) {
      setError(data.error || 'Login gagal.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)

    router.replace(data.redirectTo || '/admin/dashboard')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
        <section className="flex-1 rounded-sm border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">PortalNews Admin</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Masuk ke dashboard admin</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Akses panel admin untuk melihat statistik artikel, kategori, dan mengelola konten dengan role berbeda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-sm border border-gray-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="admin@portalnews.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-sm border border-gray-200 bg-slate-50 px-3 py-2 pr-20 text-sm outline-none focus:border-blue-500"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-blue-600 hover:text-blue-700"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Info</p>
            <p className="mt-2">Gunakan akun admin yang sudah terdaftar di database untuk masuk ke dashboard.</p>
          </div>
        </section>

        <aside className="flex-1 rounded-sm border border-gray-200 bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Fitur</p>
          <h2 className="mt-3 text-2xl font-semibold">Dukungan multi role</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
            <li>• Role <span className="font-semibold text-white">Admin</span> melihat ringkasan operasional.</li>
            <li>• Role <span className="font-semibold text-white">Ketua</span> melihat akses penuh dan kontrol prioritas.</li>
            <li>• Session login disimpan aman dengan cookie HTTP-only.</li>
          </ul>
          <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-blue-300 hover:text-white">
            ← Kembali ke beranda
          </Link>
        </aside>
      </div>
    </main>
  )
}
