'use client'

import { ChangeEvent } from 'react'

type Props = {
  id?: string
  value: string
  onChange: (html: string) => void
}

export default function CKEditorClient({ id = 'editor', value, onChange }: Props) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    console.log('[Editor] Content changed, length:', e.target.value.length)
    onChange(e.target.value)
  }

  return (
    <>
      <style jsx global>{`
        .admin-ckeditor-full-height {
          height: 100%;
        }
        .admin-ckeditor-full-height textarea {
          width: 100%;
          height: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          border: 1px solid #d1d5db;
          border-radius: 0.125rem;
          padding: 12px;
          resize: none;
          box-sizing: border-box;
        }
        .admin-ckeditor-full-height textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
      `}</style>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        className="h-full w-full"
        placeholder="Mulai tulis konten artikel di sini..."
      />
    </>
  )
}
