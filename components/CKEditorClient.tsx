'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  id?: string
  value: string
  onChange: (html: string) => void
}

export default function CKEditorClient({ id = 'editor', value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [editorLoaded, setEditorLoaded] = useState(false)

  useEffect(() => {
    // Load CKEditor 4 from CDN if not already loaded
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).CKEDITOR) return resolve()
        const s = document.createElement('script')
        // Use the latest free CKEditor 4 standard build - use jsDelivr as fallback
        s.src = 'https://cdn.jsdelivr.net/npm/ckeditor@4.25.1/full/ckeditor.js'
        s.async = true
        s.onload = () => {
          console.log('[CKEditor] Script loaded successfully')
          resolve()
        }
        s.onerror = () => {
          console.error('[CKEditor] Failed to load from jsDelivr, trying official CDN')
          // Fallback to official CDN
          const s2 = document.createElement('script')
          s2.src = 'https://cdn.ckeditor.com/4.25.1/standard/ckeditor.js'
          s2.async = true
          s2.onload = () => {
            console.log('[CKEditor] Script loaded from official CDN')
            resolve()
          }
          s2.onerror = () => {
            console.error('[CKEditor] Failed to load from official CDN too')
            reject(new Error('Failed to load CKEditor from any CDN'))
          }
          document.head.appendChild(s2)
        }
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
            setEditorLoaded(true)
            // Log when editor is ready
            console.log('[CKEditor] Editor ready, content length:', editorInstance.getData().length)
          })
          editorInstance.on('change', () => {
            const data = editorInstance.getData()
            console.log('[CKEditor] Change event, content length:', data.length)
            onChange(data)
          })
          editorInstance.on('blur', () => {
            const data = editorInstance.getData()
            console.log('[CKEditor] Blur event, content length:', data.length)
            onChange(data)
          })
          // Also listen to contentDom for real-time updates
          editorInstance.on('instanceReady', () => {
            editorInstance.editable().attachListener(editorInstance.editable(), 'input', () => {
              const data = editorInstance.getData()
              console.log('[CKEditor] Input event, content length:', data.length)
              onChange(data)
            })
            editorInstance.editable().attachListener(editorInstance.editable(), 'keyup', () => {
              const data = editorInstance.getData()
              console.log('[CKEditor] Keyup event, content length:', data.length)
              onChange(data)
            })
          })
        } catch (err) {
          console.error('[CKEditor] Error setting up editor:', err)
          setEditorLoaded(false)
        }
      })
      .catch((err) => {
        console.error('[CKEditor] Failed to load script, using fallback textarea:', err)
        setEditorLoaded(false)
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
      <textarea 
        id={id} 
        ref={textareaRef} 
        defaultValue={value} 
        className="h-full w-full"
        onChange={(e) => {
          if (!editorLoaded) {
            console.log('[CKEditor] Using fallback textarea, content length:', e.target.value.length)
            onChange(e.target.value)
          }
        }}
      />
    </>
  )
}
