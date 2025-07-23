import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/permissions'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

async function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  const userRole = await getUserRole(user.id)
  
  if (!userRole) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} userRole={userRole} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}