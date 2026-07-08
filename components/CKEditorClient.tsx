'use client'

import { useEffect, useRef } from 'react'

type Props = {
  id?: string
  value: string
  onChange: (html: string) => void
}

export default function CKEditorClient({ id = 'editor', value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // Load CKEditor 4 from CDN if not already loaded
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).CKEDITOR) return resolve()
        const s = document.createElement('script')
        // Use the latest free CKEditor 4 standard build instead of the commercial LTS bundle
        s.src = 'https://cdn.ckeditor.com/4.25.1/standard/ckeditor.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load CKEditor script'))
        document.head.appendChild(s)
      })
    }

    let editorInstance: any = null

    loadScript()
      .then(() => {
        try {
          if (!textareaRef.current) return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const CKEDITOR: any = (window as any).CKEDITOR
          editorInstance = CKEDITOR.instances[id]
          if (editorInstance) {
            editorInstance.destroy(true)
            editorInstance = null
          }
          editorInstance = CKEDITOR.replace(id, {
            height: '100%',
            width: '100%',
            resize_enabled: false,
          })
          editorInstance.setData(value || '')
          editorInstance.on('instanceReady', () => {
            editorInstance.resize('100%', '100%')
          })
          editorInstance.on('change', () => {
            const data = editorInstance.getData()
            onChange(data)
          })
        } catch (err) {
          // ignore
        }
      })
      .catch(() => {
        // failed to load — fallback does nothing
      })

    return () => {
      try {
        const CKEDITOR = (window as any).CKEDITOR
        if (CKEDITOR && CKEDITOR.instances && CKEDITOR.instances[id]) {
          CKEDITOR.instances[id].destroy(true)
        }
      } catch (e) {
        // ignore
      }
    }
  }, [id])

  return (
    <>
      <style jsx global>{`
        .admin-ckeditor-full-height .cke_contents,
        .admin-ckeditor-full-height .cke_wysiwyg_frame,
        .admin-ckeditor-full-height .cke_contents_ltr {
          height: 100% !important;
          min-height: 100% !important;
        }
      `}</style>
      <textarea id={id} ref={textareaRef} defaultValue={value} className="h-full w-full" />
    </>
  )
}
