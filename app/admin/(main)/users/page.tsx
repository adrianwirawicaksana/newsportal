'use client'

import type { Metadata } from 'next'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

type UserItem = {
  id: string
  name: string
  email: string
  role: 'admin' | 'ketua' | 'user'
  isVerified: boolean
}

const roles = ['admin', 'ketua', 'user'] as const
const roleLabels: Record<(typeof roles)[number], string> = {
  admin: 'Admin',
  ketua: 'Ketua',
  user: 'User Biasa',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof roles)[number]>('user')
  const [password, setPassword] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      if (!response.ok) throw new Error('Gagal memuat data pengguna')
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setUsers([])
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const resetForm = () => {
    setName('')
    setEmail('')
    setRole('user')
    setPassword('')
    setEditingId(null)
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const payload = { name, email, role, password }
    const response = await fetch(editingId ? `/api/admin/users/${editingId}` : '/api/admin/users', {
      method: editingId ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok || result?.success !== true) {
      setErrorMessage(result?.error || 'Terjadi kesalahan saat menyimpan pengguna.')
      setIsSubmitting(false)
      return
    }

    await loadData()
    resetForm()
    setIsSubmitting(false)
  }

  const handleEdit = (user: UserItem) => {
    setEditingId(user.id)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setPassword('')
    setErrorMessage('')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus pengguna ini?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' })
    await loadData()
    if (editingId === id) resetForm()
  }

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Kelola User</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Manajemen pengguna</h2>
          <p className="mt-2 text-sm text-slate-600">Tambahkan, edit, dan hapus akun admin, ketua, maupun user biasa secara langsung.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-sm border border-gray-200 bg-slate-50 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Nama</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" placeholder="Masukkan nama lengkap" required />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" placeholder="contoh@portalnews.com" required />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value as (typeof roles)[number])} className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2" required>
              {roles.map((item) => (
                <option key={item} value={item}>{roleLabels[item]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-sm border border-gray-300 px-3 py-2"
              placeholder={editingId ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password akun'}
              required={!editingId}
            />
          </div>
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting ? 'Menyimpan...' : editingId ? 'Perbarui pengguna' : 'Tambah pengguna'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-sm border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Batal
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-160 divide-y divide-gray-200">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm text-slate-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">{user.isVerified ? 'Terverifikasi' : 'Belum terverifikasi'}</td>
                <td className="px-4 py-3 space-x-2">
                  <button type="button" onClick={() => handleEdit(user)} className="rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">Edit</button>
                  <button type="button" onClick={() => void handleDelete(user.id)} className="rounded-sm border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
