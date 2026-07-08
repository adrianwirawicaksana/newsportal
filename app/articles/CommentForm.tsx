'use client'

import { useState, type FormEvent } from 'react'

export default function CommentForm({ articleId, onCommentAdded }: { articleId: string; onCommentAdded: () => void }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Komentar tidak boleh kosong.')
      return
    }

    setIsSubmitting(true)

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, content }),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) {
      setError(result?.error || 'Gagal kirim komentar. Pastikan Anda sudah login.')
      setIsSubmitting(false)
      return
    }

    setContent('')
    setIsSubmitting(false)
    onCommentAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Tambahkan komentar</h3>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="mt-3 w-full rounded-sm border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        rows={4}
        placeholder="Tulis komentar Anda..."
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className="mt-4 rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {isSubmitting ? 'Mengirim...' : 'Kirim komentar'}
      </button>
    </form>
  )
}
