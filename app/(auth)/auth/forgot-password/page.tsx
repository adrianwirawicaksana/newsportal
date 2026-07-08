'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import AuthButton from '@/components/ui/Button'
import Loading from '@/app/loading'
import { useToast } from '@/components/ui/ToastProvider'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''

    if (!email) {
      showError('Email wajib diisi.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        showError(data?.message || 'Gagal mengirim instruksi reset password.')
        setIsLoading(false)
        return
      }

      showSuccess(data?.message || 'Instruksi reset password telah dikirim ke email Anda.')
    } catch {
      showError('Terjadi kesalahan saat mengirim instruksi reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full px-1 sm:px-2">
      {isLoading ? <Loading /> : null}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[1.75rem] sm:text-[2rem] font-semibold tracking-tight text-slate-900">Lupa password?</h2>
        <p className="mt-2 text-[0.9rem] sm:text-[0.95rem] leading-6 text-slate-600">
          Masukkan email yang Anda gunakan saat mendaftar. Kami akan kirimkan instruksi reset password.
        </p>
      </div>

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


        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Mengirim...' : 'Kirim instruksi'}
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
