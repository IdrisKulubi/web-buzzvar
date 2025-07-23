'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('Google OAuth error:', error)
    redirect('/auth/login?error=oauth_error')
  }
  
  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    redirect('/auth/login?error=signout_error')
  }
  
  redirect('/auth/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Get user error:', error)
    return null
  }
  
  return user
}

export async function getUserRole(userId: string) {
  const supabase = await createClient()
  
  // Check if user is super admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (adminUser) {
    return adminUser.role as 'super_admin' | 'admin'
  }
  
  // Check if user is club owner
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