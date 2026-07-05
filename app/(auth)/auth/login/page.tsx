'use client'

import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import AuthButton from '@/components/ui/Button'
import SocialAuthButtons from '@/components/ui/SocialAuthButtons'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const router = useRouter()

  const handleProviderClick = () => {
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setNotice('')

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Masukkan alamat email yang valid.')
      setIsLoading(false)
      return
    }

    const payload = {
      email,
      password,
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.message || 'Gagal masuk')
      setIsLoading(false)
      return
    }

    setNotice('Login berhasil. Mengalihkan ke beranda...')
    router.push('/')
  }

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Masuk akun</h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Silakan masuk untuk melanjutkan membaca berita terbaru.
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 pr-14 text-black outline-none transition focus:border-blue-500"
              placeholder="Masukkan kata sandi"
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
          <div className="mt-2 flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm sm:text-base font-medium text-blue-500 hover:text-blue-600">
              Lupa password?
            </Link>
          </div>
        </div>

        {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Masuk'}
        </AuthButton>
      </form>

      <div className="mt-6">
        <SocialAuthButtons />
      </div>

      <p className="mt-6 text-center text-sm sm:text-base text-slate-600">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="font-semibold text-blue-500 hover:text-blue-600">
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}

export default function Page() {
  return <LoginForm />
}