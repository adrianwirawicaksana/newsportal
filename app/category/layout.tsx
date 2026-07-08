import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Kategori - PortalNews',
  description: 'Halaman kategori berita PortalNews dengan header dan footer yang konsisten.',
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
