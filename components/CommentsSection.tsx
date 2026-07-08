"use client"

import { useState } from 'react'

type Comment = { author: string; text: string; time?: string }

export default function CommentsSection({ initial = [], onAdd }: { initial?: Comment[]; onAdd?: (c: Comment) => void }) {
  const [comments, setComments] = useState<Comment[]>(initial)
  const [text, setText] = useState('')

  function submit() {
    if (!text.trim()) return
    const c = { author: 'Anda', text: text.trim(), time: 'baru saja' }
    setComments((s) => [c, ...s])
    setText('')
    if (onAdd) onAdd(c)
  }

  return (
    <div className="mt-6 rounded-sm bg-white p-4 shadow-sm">
      <h4 className="font-semibold">Komentar Pembaca ({comments.length})</h4>

      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="mt-3 flex flex-col gap-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Tulis komentar Anda..." className="w-full rounded-sm border px-2 py-2 text-sm outline-none" />
        <div className="flex justify-end">
          <button type="submit" className="rounded-sm bg-blue-600 px-3 py-1 text-sm font-medium text-white">Kirim</button>
        </div>
      </form>

      <ul className="mt-4 space-y-3">
        {comments.map((c, i) => (
          <li key={i} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-sm bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">{c.author.charAt(0)}</div>
            <div>
              <div className="text-sm font-medium text-slate-800">{c.author} <span className="text-xs font-normal text-slate-500">• {c.time}</span></div>
              <div className="text-sm text-slate-600">{c.text}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
