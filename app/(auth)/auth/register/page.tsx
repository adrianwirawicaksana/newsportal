'use client'

import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import AuthButton from '@/components/ui/Button'
import SocialAuthButtons from '@/components/ui/SocialAuthButtons'

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setNotice('')

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')?.toString().trim() ?? ''
    const email = formData.get('email')?.toString().trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''
    const confirmPassword = formData.get('confirmPassword')?.toString() ?? ''

    if (!name || !email || !password || !confirmPassword) {
      setError('Semua field harus diisi sebelum mendaftar.')
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Masukkan alamat email yang valid.')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Kata sandi harus memiliki minimal 8 karakter.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok.')
      setIsLoading(false)
      return
    }

    const payload = {
      name,
      email,
      password,
      confirmPassword,
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.message || 'Gagal mendaftar')
      setIsLoading(false)
      return
    }

    setNotice('Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.')
    router.push(`/auth/verify-email?email=${encodeURIComponent(payload.email)}`)
  }

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Buat akun</h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Daftar untuk mulai menikmati berita favoritmu.
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm sm:text-base font-medium text-black" htmlFor="name">
            Nama lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 text-black outline-none transition focus:border-blue-500"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm sm:text-base font-medium text-black" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 text-black outline-none transition focus:border-blue-500"
            placeholder="prabowo@email.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm sm:text-base font-medium text-black" htmlFor="password">
            Kata sandi
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 pr-14 text-black outline-none transition focus:border-blue-500"
              placeholder="Minimal 8 karakter"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm sm:text-base font-medium text-black" htmlFor="confirmPassword">
            Konfirmasi kata sandi
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 pr-14 text-black outline-none transition focus:border-blue-500"
              placeholder="Ulangi kata sandi"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Daftar'}
        </AuthButton>
      </form>

      <div className="mt-6">
        <SocialAuthButtons />
      </div>

      <p className="mt-6 text-center text-sm sm:text-base text-slate-600">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="font-semibold text-blue-500 hover:text-blue-600">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}

export default function Page() {
  return <RegisterForm />
}
