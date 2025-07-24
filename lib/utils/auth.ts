import { createClient } from '@/lib/supabase/server'

export type UserRole = 'super_admin' | 'admin' | 'club_owner'

export interface UserPermissions {
  canViewSystemAnalytics: boolean
  canManageUsers: boolean
  canManageVenues: boolean
  canModerateContent: boolean
  canManageOwnVenues: boolean
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient()
  
  // admin_users table doesn't exist, so use email-based role checking
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email) {
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const userEmail = user.email.toLowerCase();
    
    if (superAdminEmails.includes(userEmail)) {
      return 'super_admin';
    }
    if (adminEmails.includes(userEmail)) {
      return 'admin';
    }
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

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()
  const userRole = await getUserRole(user.id)
  
  if (!userRole || userRole !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`)
  }
  
  return { user, role: userRole }
}

export async function hasPermission(userId: string, permission: keyof UserPermissions): Promise<boolean> {
  const role = await getUserRole(userId)
  if (!role) return false
  
  const permissions = getPermissions(role)
  return permissions[permission]
}