import Link from 'next/link'

type Props = {
  slug?: string
  title: string
  excerpt: string
  category?: string
  image?: string
}

export default function ArticleCard({ slug, title, excerpt, category, image }: Props) {
  const src = image ?? '/images/Background.jpg'
  const articleSlug = slug ?? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <article className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <div className="relative h-40 w-full overflow-hidden rounded-sm bg-slate-200">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full skeleton overflow-hidden">
            <span className="marquee text-sm font-semibold">Gambar tidak tersedia · Gambar tidak tersedia · Gambar tidak tersedia · </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        {category ? <p className="text-xs font-semibold text-blue-600">{category}</p> : null}
        <h4 className="mt-1 text-lg font-semibold text-slate-900">{title}</h4>
        <p className="mt-2 text-sm text-slate-600">{excerpt}</p>
        <div className="mt-3">
          <Link href={`/articles/${articleSlug}`} className="text-sm font-medium text-blue-600">Baca Selengkapnya</Link>
        </div>
      </div>
    </article>
  )
}
