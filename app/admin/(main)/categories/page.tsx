'use client'

import type { Metadata } from 'next'
import { useEffect, useState, type FormEvent } from 'react'

type CategoryItem = {
  _id: string
  name: string
  slug: string
  description?: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include' })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(`Failed to load categories: ${response.status} ${message}`)
      }
      const data = await response.json()
      // Normalize IDs: Prisma returns `id` (mapped to _id in DB). Ensure `_id` exists for frontend keys.
      const normalized = Array.isArray(data)
        ? data.map((c: any) => ({ ...c, _id: c._id || c.id || (c._id && c._id.toString && c._id.toString()) }))
        : []
      setCategories(normalized)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setCategories([])
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setEditingId(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const payload = { name, slug, description }
    const response = await fetch(editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories', {
      method: editingId ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (result?.success) {
      await loadCategories()
      resetForm()
    }

    setIsSubmitting(false)
  }

  const handleEdit = (category: CategoryItem) => {
    setEditingId((category as any)._id || (category as any).id)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || '')
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' })
    await loadCategories()
  }

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Kelola Kategori</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Daftar kategori portal</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-sm border border-gray-200 bg-slate-50 p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Nama kategori</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">Slug</label>
          <input value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
          <input value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <button type="submit" disabled={isSubmitting} className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting ? 'Menyimpan...' : editingId ? 'Perbarui kategori' : 'Tambah kategori'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-sm border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700">Batal</button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {categories.length === 0 ? (
          <div key="empty-state" className="col-span-full rounded-sm bg-white p-6 text-slate-700 shadow-sm">
            Belum ada kategori. Tambahkan kategori baru menggunakan form di atas.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="rounded-sm border border-gray-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{category.name}</p>
              <p className="mt-1 text-sm text-slate-600">{category.description || 'Kategori aktif untuk publikasi berita.'}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => handleEdit(category)} className="rounded-sm bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">Edit</button>
                <button type="button" onClick={() => void handleDelete(category._id)} className="rounded-sm border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
