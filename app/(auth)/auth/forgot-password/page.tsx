'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import AuthButton from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString() ?? ''

    if (!email) {
      setError('Email wajib diisi.')
      setIsLoading(false)
      return
    }

    setMessage('Jika email terdaftar, instruksi reset password akan dikirimkan.')
    setIsLoading(false)
  }

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Lupa password?</h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Masukkan email yang Anda gunakan saat mendaftar. Kami akan kirimkan instruksi reset password.
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

        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Mengirim...' : 'Kirim instruksi'}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm sm:text-base text-slate-600">
        Ingat password?{' '}
        <Link href="/auth/login" className="font-semibold text-blue-500 hover:text-blue-600">
          Kembali ke login
        </Link>
      </p>
    </div>
  )
}
