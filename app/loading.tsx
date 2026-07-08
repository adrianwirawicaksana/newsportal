'use client'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 px-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-400" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-lg font-semibold text-slate-900">Loading...</p>
        <p className="max-w-md text-center text-sm text-slate-600">
          Sedang menyiapkan halaman.
        </p>
      </div>
    </div>
  )
}