import { redirect } from 'next/navigation'
import AdminFooter from '@/components/AdminFooter'
import AdminNavbar from '@/components/AdminNavbar'
import { getAdminSession } from '@/lib/admin-auth'

export default async function MainAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AdminNavbar session={session} />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</div>
      <AdminFooter />
    </div>
  )
}
