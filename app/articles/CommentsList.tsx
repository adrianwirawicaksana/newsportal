'use client'

type CommentItem = {
  id: string
  content: string
  createdAt: string
  user: { name: string }
}

export default function CommentsList({ comments }: { comments: CommentItem[] }) {
  return (
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
            <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
          </div>
        ))
      )}
    </div>
  )
}
