'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/permissions'

export interface SystemAnalytics {
  date: string
  total_users: number
  active_users: number
  new_users: number
  total_venues: number
  active_venues: number
  total_events: number
  total_interactions: number
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalVenues: number
  activeVenues: number
  totalEvents: number
  totalInteractions: number
  userGrowthRate: number
  venueGrowthRate: number
}

export async function getSystemAnalytics(): Promise<SystemAnalytics[]> {
  const supabase = await createClient()
  
  // Verify super admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const userRole = await getUserRole(user.id)
  if (userRole !== 'super_admin') {
    throw new Error('Unauthorized: Super admin access required')
  }
  
  // Get latest system analytics (last 30 days)
  const { data: analytics, error } = await supabase
    .from('system_analytics')
    .select('*')
    .order('date', { ascending: false })
    .limit(30)
  
  if (error) {
    console.error('Error fetching system analytics:', error)
    throw new Error('Failed to fetch system analytics')
  }
  
  return analytics || []
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const supabase = await createClient()
  
  // Verify super admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const userRole = await getUserRole(user.id)
  if (userRole !== 'super_admin') {
    throw new Error('Unauthorized: Super admin access required')
  }
  
  // Get current metrics
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalVenues },
    { count: activeVenues },
    { count: totalEvents },
    { count: totalInteractions }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('user_interactions').select('*', { count: 'exact', head: true })
  ])
  
  // Calculate growth rates (compare with previous month)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: usersThirtyDaysAgo } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', thirtyDaysAgo.toISOString())
  
  const { count: venuesThirtyDaysAgo } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', thirtyDaysAgo.toISOString())
  
  const userGrowthRate = usersThirtyDaysAgo ? 
    ((totalUsers || 0) - (usersThirtyDaysAgo || 0)) / (usersThirtyDaysAgo || 1) * 100 : 0
  
  const venueGrowthRate = venuesThirtyDaysAgo ? 
    ((totalVenues || 0) - (venuesThirtyDaysAgo || 0)) / (venuesThirtyDaysAgo || 1) * 100 : 0
  
  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalVenues: totalVenues || 0,
    activeVenues: activeVenues || 0,
    totalEvents: totalEvents || 0,
    totalInteractions: totalInteractions || 0,
    userGrowthRate: Math.round(userGrowthRate * 100) / 100,
    venueGrowthRate: Math.round(venueGrowthRate * 100) / 100
  }
}

export async function getVenueAnalytics(venueId: string) {
  const supabase = await createClient()
  
  // Verify ownership or admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const userRole = await getUserRole(user.id)
  
  // Check if user owns the venue (for club owners)
  if (userRole === 'club_owner') {
    const { data: ownership } = await supabase
      .from('venue_owners')
      .select('id')
      .eq('user_id', user.id)
      .eq('venue_id', venueId)
      .single()
    
    if (!ownership) {
      throw new Error('Unauthorized: You do not own this venue')
    }
  } else if (userRole !== 'super_admin' && userRole !== 'admin') {
    throw new Error('Unauthorized')
  }
  
  // Get venue analytics (last 30 days)
  const { data: analytics, error } = await supabase
    .from('venue_analytics')
    .select('*')
    .eq('venue_id', venueId)
    .order('date', { ascending: false })
    .limit(30)
  
  if (error) {
    console.error('Error fetching venue analytics:', error)
    throw new Error('Failed to fetch venue analytics')
  }
  
  return analytics || []
}