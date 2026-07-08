'use client'

import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, type FormEvent } from 'react'
import Loading from '@/app/loading'
import AuthButton from '@/components/ui/Button'
import SocialAuthButtons from '@/components/ui/SocialAuthButtons'
import { useToast } from '@/components/ui/ToastProvider'

function LoginFormContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { showError, showSuccess } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (!error) {
      setAuthError(null)
      return
    }

    if (error === 'tiktok_not_configured') {
      setAuthError('TikTok OAuth belum dikonfigurasi. Periksa variabel env di Vercel.')
      return
    }

    if (error === 'tiktok_state_mismatch') {
      setAuthError('Login TikTok gagal karena state OAuth tidak cocok. Silakan coba lagi.')
      return
    }

    if (error === 'tiktok_exchange_failed') {
      setAuthError(message || 'Login TikTok gagal saat menukar kode otorisasi. Periksa callback URL di TikTok Developer Console.')
      return
    }

    setAuthError(message || 'Login TikTok gagal. Pastikan callback URL sudah sesuai dan aplikasi TikTok Anda aktif.')
  }, [searchParams])

  const handleProviderClick = () => {
    // no-op for provider button state cleanup
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    if (!email || !password) {
      showError('Email dan kata sandi wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Masukkan alamat email yang valid.')
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
      showError(data?.message || 'Gagal masuk')
      setIsLoading(false)
      return
    }

    showSuccess('Login berhasil. Mengalihkan ke beranda...')
    router.push('/')
  }

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="mb-6 sm:mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h2
            className="font-bold tracking-tight text-slate-900"
            style={{ fontSize: '1.5rem', lineHeight: 1.1 }}
          >
            Masuk akun
          </h2>
        </div>
        <p className="mt-2 text-[0.9rem] sm:text-[0.95rem] leading-6 text-slate-600">
          Silakan masuk untuk melanjutkan membaca berita terbaru.
        </p>
      </div>

      {authError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {authError}
        </div>
      ) : null}

      {isLoading ? <Loading /> : null}

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-[0.9rem] sm:text-[0.95rem] font-medium text-black" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 text-[15px] sm:text-[16px] text-black outline-none transition focus:border-blue-500"
            placeholder="prabowo@email.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[0.9rem] sm:text-[0.95rem] font-medium text-black" htmlFor="password">
            Kata sandi
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 pr-14 text-[15px] sm:text-[16px] text-black outline-none transition focus:border-blue-500"
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
            <Link href="/auth/forgot-password" className="text-[0.9rem] sm:text-[0.95rem] font-medium text-blue-500 hover:text-blue-600">
              Lupa password?
            </Link>
          </div>
        </div>

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Masuk'}
        </AuthButton>
      </form>

      <div className="mt-6">
        <SocialAuthButtons />
      </div>

      <p className="mt-6 text-center text-[0.9rem] sm:text-[0.95rem] text-slate-600">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="font-semibold text-blue-500 hover:text-blue-600">
          Daftar sekarang
        </Link>{' '}
        atau{' '}
        <Link href="/admin/login" className="font-semibold text-blue-500 hover:text-blue-600">
          Login admin
        </Link>
      </p>
    </div>
  )
}

function LoginForm() {
  return (
    <Suspense
      fallback={<Loading />}
    >
      <LoginFormContent />
    </Suspense>
  )
}

export default function Page() {
  return <LoginForm />
}