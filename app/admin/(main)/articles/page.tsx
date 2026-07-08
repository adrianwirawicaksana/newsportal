'use client'

import type { Metadata } from 'next'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import CKEditorClient from '@/components/CKEditorClient'

type CategoryItem = {
  _id: string
  name: string
}

type ArticleItem = {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  featuredImage?: string
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  const loadData = async () => {
    try {
      const [articlesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/articles', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
      ])

      if (!articlesResponse.ok) {
        const message = await articlesResponse.text()
        throw new Error(`Failed to load articles: ${articlesResponse.status} ${message}`)
      }
      if (!categoriesResponse.ok) {
        const message = await categoriesResponse.text()
        throw new Error(`Failed to load categories: ${categoriesResponse.status} ${message}`)
      }

      const articleData = await articlesResponse.json()
      const categoryData = await categoriesResponse.json()
      setArticles(Array.isArray(articleData) ? articleData : [])
      setCategories(Array.isArray(categoryData) ? categoryData : [])
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setArticles([])
      setCategories([])
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setCategory('')
    setFeaturedImage('')
    setEditingId(null)
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    // Validate required fields
    console.log('[Form Debug] Title:', { value: title, trimmed: title.trim(), isEmpty: !title.trim() })
    console.log('[Form Debug] Excerpt:', { value: excerpt, trimmed: excerpt.trim(), isEmpty: !excerpt.trim() })
    console.log('[Form Debug] Content:', { value: content.substring(0, 50), trimmed: content.trim(), isEmpty: !content.trim() })
    console.log('[Form Debug] Category:', { value: category, trimmed: category.trim(), isEmpty: !category.trim() })

    if (!title.trim() || !excerpt.trim() || !content.trim() || !category.trim()) {
      setErrorMessage('Judul, ringkasan, isi, dan kategori wajib diisi.')
      setIsSubmitting(false)
      return
    }

    const payload = { title, slug, excerpt, content, category, featuredImage }
    console.log('[Form Debug] Payload:', payload)
    
    const response = await fetch(editingId ? `/api/admin/articles/${editingId}` : '/api/admin/articles', {
      method: editingId ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => ({}))
    
    if (!response.ok || !result?.success) {
      setErrorMessage(result?.error || 'Terjadi kesalahan saat menyimpan artikel.')
      setIsSubmitting(false)
      return
    }

    await loadData()
    resetForm()
    setIsSubmitting(false)
  }

  const handleEdit = (article: ArticleItem) => {
    setEditingId(article._id)
    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt)
    setContent(article.content)
    setCategory(article.category)
    setFeaturedImage(article.featuredImage || '')
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE', credentials: 'include' })
    await loadData()
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const imageData = reader.result as string
      setFeaturedImage(imageData)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Kelola Artikel</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Daftar artikel</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-sm border border-gray-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Judul</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" required />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Slug</label>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Kategori</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" required>
              <option key="__default__" value="">Pilih kategori</option>
              {categories.map((item) => (
                <option key={item._id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Thumbnail</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full rounded-sm border border-gray-300 bg-white px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Ringkasan</label>
            <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className="mt-1 min-h-40 w-full rounded-sm border border-gray-300 px-3 py-2" required />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Isi artikel</label>
            <div className="mt-1 w-full rounded-sm border border-gray-300 bg-white p-2 h-144 md:h-176 admin-ckeditor-full-height">
              <div className="h-full w-full">
                <CKEditorClient id="admin-article-editor" value={content} onChange={(html) => setContent(html)} />
              </div>
            </div>
          </div>
        </div>
        {errorMessage && <div className="rounded-sm bg-red-50 border border-red-200 p-3 text-sm text-red-700">{errorMessage}</div>}
        <div className="flex items-center gap-2">
          <button type="submit" disabled={isSubmitting} className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting ? 'Menyimpan...' : editingId ? 'Perbarui artikel' : 'Tambah artikel'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-sm border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700">Batal</button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {articles.length === 0 ? (
          <div key="empty-state" className="rounded-sm bg-white p-6 text-slate-700 shadow-sm">Belum ada artikel.</div>
        ) : (
          <>
            {articles.slice((page - 1) * pageSize, page * pageSize).map((article) => (
              <div key={article._id} className="rounded-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{article.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{article.category}</p>
                    <p className="mt-1 text-sm text-slate-500">{article.excerpt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(article)} className="rounded-sm bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">Edit</button>
                    <button type="button" onClick={() => void handleDelete(article._id)} className="rounded-sm border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600">Hapus</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">Halaman {page} dari {Math.max(1, Math.ceil(articles.length / pageSize))}</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-sm border px-3 py-1 text-sm">Prev</button>
                <button type="button" onClick={() => setPage((p) => Math.min(Math.ceil(articles.length / pageSize), p + 1))} disabled={page >= Math.ceil(articles.length / pageSize)} className="rounded-sm border px-3 py-1 text-sm">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
