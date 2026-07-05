import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full px-1 sm:px-2"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">Memuat halaman verifikasi...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
