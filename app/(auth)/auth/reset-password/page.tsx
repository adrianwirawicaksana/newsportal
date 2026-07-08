'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import AuthButton from '@/components/ui/Button'
import Loading from '@/app/loading'
import { useToast } from '@/components/ui/ToastProvider'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false)
    }
  }, [token])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')?.toString() ?? ''
    const confirmPassword = formData.get('confirmPassword')?.toString() ?? ''

    if (!password || password.length < 8) {
      showError('Kata sandi minimal 8 karakter.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      showError('Konfirmasi kata sandi tidak cocok.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        showError(data?.message || 'Gagal memperbarui password.')
        setIsLoading(false)
        return
      }

      showSuccess(data?.message || 'Password berhasil diperbarui.')
      window.setTimeout(() => router.push('/auth/login'), 1500)
    } catch {
      showError('Terjadi kesalahan saat memperbarui password.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isTokenValid) {
    return (
      <div className="w-full px-1 sm:px-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-[1.75rem] sm:text-[2rem] font-semibold tracking-tight text-slate-900">Link reset password tidak valid</h2>
          <p className="mt-3 text-[0.9rem] sm:text-[0.95rem] leading-6 text-slate-600">
            Link reset password tidak ditemukan atau sudah kadaluarsa. Silakan ulangi proses forgot password.
          </p>
          <Link href="/auth/forgot-password" className="mt-5 inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 text-[0.95rem] sm:text-[1rem] font-semibold text-white transition hover:bg-blue-600">
            Kembali ke forgot password
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-1 sm:px-2">
      {isLoading ? <Loading /> : null}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[1.75rem] sm:text-[2rem] font-semibold tracking-tight text-slate-900">Buat password baru</h2>
        <p className="mt-2 text-[0.9rem] sm:text-[0.95rem] leading-6 text-slate-600">
          Masukkan password baru untuk akun Anda.
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-[0.9rem] sm:text-[0.95rem] font-medium text-black" htmlFor="password">
            Password baru
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 text-[15px] sm:text-[16px] text-black outline-none transition focus:border-blue-500"
            placeholder="Minimal 8 karakter"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[0.9rem] sm:text-[0.95rem] font-medium text-black" htmlFor="confirmPassword">
            Konfirmasi password baru
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-slate-300 px-4 py-3 sm:py-3.5 text-[15px] sm:text-[16px] text-black outline-none transition focus:border-blue-500"
            placeholder="Ulangi password"
          />
        </div>

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Memperbarui...' : 'Perbarui password'}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-[0.9rem] sm:text-[0.95rem] text-slate-600">
        Ingat password?{' '}
        <Link href="/auth/login" className="font-semibold text-blue-500 hover:text-blue-600">
          Kembali ke login
        </Link>
      </p>
    </div>
  )
}
