'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const resendLabel = useMemo(() => {
    if (cooldown > 0) {
      return `Kirim ulang dalam ${cooldown}s`
    }

    return 'Kirim ulang email'
  }, [cooldown])

  useEffect(() => {
    if (!token) return

    const verifyEmail = async () => {
      setIsVerifying(true)
      setError('')
      setMessage('')

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          setError(data?.message || 'Gagal memverifikasi email.')
          setIsVerifying(false)
          return
        }

        setMessage(data?.message || 'Email berhasil diverifikasi.')
        window.setTimeout(() => router.push('/auth/login'), 1500)
      } catch {
        setError('Terjadi kesalahan saat memverifikasi email.')
      } finally {
        setIsVerifying(false)
      }
    }

    void verifyEmail()
  }, [router, token])

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return

    setIsResending(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true, email }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.message || 'Gagal mengirim ulang email verifikasi.')
        setIsResending(false)
        return
      }

      setMessage(data?.message || 'Email verifikasi berhasil dikirim ulang.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      setError('Terjadi kesalahan saat mengirim ulang email.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Verifikasi email Anda</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Pendaftaran Anda sudah diterima. Langkah berikutnya adalah mengaktifkan akun melalui tautan verifikasi yang kami kirim ke email Anda.
        </p>

        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          Buka inbox Anda, lalu klik tautan verifikasi. Jika email belum datang, cek folder spam atau tunggu beberapa menit sebelum meminta pengiriman ulang.
        </div>

        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Buka email yang Anda daftarkan.</li>
          <li>Klik tautan verifikasi yang kami kirim.</li>
          <li>Kembali ke halaman login dan masuk dengan akun Anda.</li>
        </ol>

        {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {email ? (
          <p className="mt-4 text-sm text-slate-600">
            Alamat email: <span className="font-semibold text-slate-900">{email}</span>
          </p>
        ) : null}

        {isVerifying ? <p className="mt-4 text-sm text-blue-600">Memverifikasi email Anda...</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-center justify-center rounded-md bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Ke halaman login
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? 'Mengirim...' : resendLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
