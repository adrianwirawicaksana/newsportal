'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import Loading from '@/app/loading'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const { showError, showSuccess } = useToast()
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

  const verifyEmail = async () => {
    if (!token) {
      showError('Tautan verifikasi tidak ditemukan. Silakan gunakan link yang dikirim ke email Anda.')
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        showError(data?.message || 'Gagal memverifikasi email.')
        setIsVerifying(false)
        return
      }

      showSuccess(data?.message || 'Email berhasil diverifikasi.')
      window.setTimeout(() => router.push('/auth/login'), 1500)
    } catch {
      showError('Terjadi kesalahan saat memverifikasi email.')
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (!token && !email) return

    let isCancelled = false

    const checkVerificationStatus = async () => {
      setIsCheckingStatus(true)

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ check: true, email }),
        })

        const data = await response.json().catch(() => null)

        if (isCancelled || !response.ok) return

        if (data?.verified) {
          showSuccess('Email Anda sudah diverifikasi. Anda bisa lanjut ke halaman login.')
          window.setTimeout(() => router.push('/auth/login'), 1500)
        }
      } catch {
        // ignore status check errors and keep polling
      } finally {
        if (!isCancelled) {
          setIsCheckingStatus(false)
        }
      }
    }

    if (!token) {
      void checkVerificationStatus()
      const interval = window.setInterval(() => {
        void checkVerificationStatus()
      }, 3000)

      return () => {
        isCancelled = true
        window.clearInterval(interval)
      }
    }

    if (token) {
      void verifyEmail()
      return
    }

    void checkVerificationStatus()
    const interval = window.setInterval(() => {
      void checkVerificationStatus()
    }, 3000)

    return () => {
      isCancelled = true
      window.clearInterval(interval)
    }
  }, [router, token, email])

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return

    setIsResending(true)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true, email }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        showError(data?.message || 'Gagal mengirim ulang email verifikasi.')
        setIsResending(false)
        return
      }

      showSuccess(data?.message || 'Email verifikasi berhasil dikirim ulang.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      showError('Terjadi kesalahan saat mengirim ulang email.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[1.75rem] sm:text-[2rem] font-semibold tracking-tight text-slate-900">Verifikasi email Anda</h2>
        <p className="mt-3 text-[0.9rem] sm:text-[0.95rem] leading-6 text-slate-600">
          Pendaftaran Anda sudah diterima. Langkah berikutnya adalah mengaktifkan akun melalui tautan verifikasi yang kami kirim ke email Anda.
        </p>

        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-[0.9rem] sm:text-[0.95rem] text-blue-700">
          Buka inbox Anda, lalu klik tautan verifikasi. Jika email belum datang, cek folder spam atau tunggu beberapa menit sebelum meminta pengiriman ulang.
        </div>

        <ol className="mt-5 list-decimal space-y-2 pl-5 text-[0.9rem] sm:text-[0.95rem] text-slate-600">
          <li>Buka email yang Anda daftarkan.</li>
          <li>Klik tautan verifikasi yang kami kirim.</li>
          <li>Kembali ke halaman login dan masuk dengan akun Anda.</li>
        </ol>

        {email ? (
          <p className="mt-4 text-[0.9rem] sm:text-[0.95rem] text-slate-600">
            Alamat email: <span className="font-semibold text-slate-900">{email}</span>
          </p>
        ) : null}

        {isVerifying || isCheckingStatus ? <Loading /> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {token ? (
            <button
              type="button"
              onClick={() => void verifyEmail()}
              disabled={isVerifying}
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 text-[0.95rem] sm:text-[1rem] font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? 'Memverifikasi...' : 'Verifikasi sekarang'}
            </button>
          ) : null}
          <Link
            href="/auth/login"
            className="inline-flex items-center text-center justify-center rounded-md bg-blue-500 px-4 py-3 text-[0.95rem] sm:text-[1rem] font-semibold text-white transition hover:bg-blue-600"
          >
            Ke halaman login
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-3 text-[0.95rem] sm:text-[1rem] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? 'Mengirim...' : resendLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
