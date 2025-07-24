import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/permissions'
import { redirect } from 'next/navigation'
import { SuperAdminSidebar } from '@/components/super-admin/sidebar'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  const userRole = await getUserRole(user.id)
  
  if (userRole !== 'super_admin') {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}