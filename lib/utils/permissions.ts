import { createClient } from '@/lib/supabase/server'

export type UserRole = 'super_admin' | 'admin' | 'club_owner'

export interface UserPermissions {
  canViewSystemAnalytics: boolean
  canManageUsers: boolean
  canManageVenues: boolean
  canModerateContent: boolean
  canManageOwnVenues: boolean
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient()
  
  // Check if super admin or admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (adminUser) {
    return adminUser.role as UserRole
  }
  
  // Check if club owner
  const { data: venueOwner } = await supabase
    .from('venue_owners')
    .select('id')
    .eq('user_id', userId)
    .single()
  
  if (venueOwner) {
    return 'club_owner'
  }
  
  return null
}

export function getPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case 'super_admin':
      return {
        canViewSystemAnalytics: true,
        canManageUsers: true,
        canManageVenues: true,
        canModerateContent: true,
        canManageOwnVenues: true,
      }
    case 'admin':
      return {
        canViewSystemAnalytics: false,
        canManageUsers: false,
        canManageVenues: true,
        canModerateContent: true,
        canManageOwnVenues: false,
      }
    case 'club_owner':
      return {
        canViewSystemAnalytics: false,
        canManageUsers: false,
        canManageVenues: false,
        canModerateContent: false,
        canManageOwnVenues: true,
      }
  }
}

export async function requireRole(userId: string, requiredRole: UserRole | UserRole[]) {
  const userRole = await getUserRole(userId)
  
  if (!userRole) {
    throw new Error('User role not found')
  }
  
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!allowedRoles.includes(userRole)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
  }
  
  return userRole
}