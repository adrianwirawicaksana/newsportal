'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'

type Comment = {
  id: string
  content: string
  createdAt: string
  user: { name: string }
}

type ArticleCommentsProps = {
  articleId: string
  initialComments: Comment[]
}

export default function ArticleComments({ articleId, initialComments }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    void loadComments()
  }, [articleId])

  const loadComments = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/comments?articleId=${encodeURIComponent(articleId)}`)
      const data = await response.json()
      if (!response.ok || !data?.success) {
        setError(data?.error || 'Tidak dapat memuat komentar saat ini.')
        return
      }
      setComments(data.comments)
    } catch {
      setError('Terjadi kesalahan saat memuat komentar.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Komentar tidak boleh kosong.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, content: content.trim() }),
      })
      const data = await response.json()

      if (!response.ok || !data?.success) {
        setError(data?.error || 'Gagal mengirim komentar. Pastikan Anda sudah login.')
        return
      }

      setContent('')
      setComments((current) => [data.comment, ...current])
    } catch {
      setError('Terjadi kesalahan saat mengirim komentar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-10 rounded-sm border border-gray-200 bg-slate-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Komentar pembaca</h3>
          <p className="mt-1 text-sm text-slate-600">Diskusi dan opini dari pembaca portal berita.</p>
        </div>
        <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold text-blue-600">
          {comments.length} komentar
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 rounded-sm border border-gray-200 bg-white p-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="w-full rounded-sm border border-gray-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500"
          rows={4}
          placeholder="Tulis komentar Anda..."
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim komentar'}
          </button>
          <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
            Masuk untuk berkomentar
          </Link>
        </div>
      </form>

      {isLoading ? (
        <div className="mt-6 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-600">
          Memuat komentar...
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <div className="rounded-sm border border-gray-200 bg-slate-50 p-4 text-sm text-slate-600">
              Belum ada komentar. Jadilah yang pertama memberikan tanggapan terhadap berita ini.
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-sm border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                  <span>{comment.user.name}</span>
                  <span>{new Date(comment.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
