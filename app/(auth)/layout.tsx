import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Image from 'next/image'

export const metadata: Metadata = {
  title: {
    default: 'Masuk atau Daftar | News Portal',
    template: '%s | News Portal',
  },
  description:
    'Masuk ke akun atau buat akun baru di News Portal untuk membaca berita terkini dengan pengalaman yang cepat, aman, dan modern.',
  keywords: ['news portal', 'berita', 'login', 'register', 'daftar akun', 'auth'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Masuk atau Daftar | News Portal',
    description:
      'Masuk ke akun atau buat akun baru di News Portal untuk menikmati berita terkini secara praktis.',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masuk atau Daftar | News Portal',
    description:
      'Masuk ke akun atau buat akun baru di News Portal untuk menikmati berita terbaru.',
  },
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`${poppins.variable} min-h-screen w-screen bg-white font-(family-name:--font-poppins)`}>
      <div className="flex min-h-screen justify-between">
        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">{children}</div>
        </section>

        <aside className="relative hidden min-h-100 lg:block lg:w-1/2">
          <Image
            src="/images/Background.jpg"
            alt="Ilustrasi berita"
            fill
            priority
            quality={100}
            sizes="(max-width: 1024px) 0vw, 45vw"
            className="object-cover"
          />
        </aside>
      </div>
    </div>
  )
}
