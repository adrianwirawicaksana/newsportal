'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Toaster, toast } from 'react-hot-toast'

type ToastContextValue = {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const MAX_LEN = 80

  const translations: Record<string, string> = {
    'Network Error': 'Kesalahan jaringan',
    'Unauthorized': 'Tidak terotorisasi',
    'Not Found': 'Tidak ditemukan',
    'Internal Server Error': 'Kesalahan server',
    'Invalid credentials': 'Kredensial tidak valid',
    'Session expired': 'Sesi telah berakhir',
    'Password incorrect': 'Kata sandi salah',
  }

  function translateIfCommon(msg: string) {
    const trimmed = msg.trim()
    return translations[trimmed] ?? trimmed
  }

  function formatMessage(raw: string) {
    if (!raw) return ''
    let msg = String(raw).replace(/\s+/g, ' ').trim()
    msg = translateIfCommon(msg)

    // Prefer the first sentence if message contains multiple sentences
    const firstSentenceMatch = msg.match(/([^.!?]+[.!?])/)
    if (firstSentenceMatch) {
      msg = firstSentenceMatch[0].trim()
    }

    if (msg.length > MAX_LEN) msg = msg.slice(0, MAX_LEN - 1) + '…'
    return msg
  }

  const showSuccess = (message: string) => toast.success(formatMessage(message))
  const showError = (message: string) => toast.error(formatMessage(message))
  const showInfo = (message: string) => toast(formatMessage(message))

  const value = useMemo<ToastContextValue>(() => ({ showSuccess, showError, showInfo }), [])

  return (
    <ToastContext.Provider value={value}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            textAlign: 'center',
            maxWidth: '92vw',
            whiteSpace: 'pre-wrap',
            borderRadius: '10px',
            padding: '12px 16px',
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
