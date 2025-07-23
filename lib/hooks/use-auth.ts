'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/utils/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserRole(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserRole(session.user.id)
        } else {
          setRole(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const fetchUserRole = async (userId: string) => {
    try {
      // Check if user is admin
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (adminUser) {
        setRole(adminUser.role as UserRole)
        return
      }

      // Check if user is club owner
      const { data: venueOwner } = await supabase
        .from('venue_owners')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (venueOwner) {
        setRole('club_owner')
        return
      }

      setRole(null)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole(null)
    }
  }

  return {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
    isClubOwner: role === 'club_owner',
  }
}