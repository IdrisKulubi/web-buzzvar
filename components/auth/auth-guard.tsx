import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { getUserRole, type UserRole } from '@/lib/utils/permissions'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  redirectTo?: string
}

export async function AuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(redirectTo)
  }
  
  if (requiredRole) {
    const userRole = await getUserRole(user.id)
    
    if (!userRole || userRole !== requiredRole) {
      // Redirect based on user's actual role or to unauthorized page
      if (userRole === 'super_admin') {
        redirect('/super-admin')
      } else if (userRole === 'admin') {
        redirect('/admin')
      } else if (userRole === 'club_owner') {
        redirect('/club-owner')
      } else {
        redirect('/unauthorized')
      }
    }
  }
  
  return <>{children}</>
}