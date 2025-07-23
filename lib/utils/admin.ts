import { getCurrentUser, getUserRole } from './auth'

export async function isUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  const role = await getUserRole(user.id)
  return role === 'admin' || role === 'super_admin'
}

export async function isUserSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  const role = await getUserRole(user.id)
  return role === 'super_admin'
}

export async function isUserClubOwner(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  const role = await getUserRole(user.id)
  return role === 'club_owner'
}

export async function checkAdminAccess(): Promise<void> {
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    throw new Error('Admin access required')
  }
}

export async function checkSuperAdminAccess(): Promise<void> {
  const isSuperAdmin = await isUserSuperAdmin()
  if (!isSuperAdmin) {
    throw new Error('Super admin access required')
  }
}