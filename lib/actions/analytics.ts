"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalVenues: number;
  activeVenues: number;
  totalEvents: number;
  totalInteractions: number;
  totalReviews: number;
}

export interface UserGrowthData {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
}

export interface VenueActivityData {
  date: string;
  totalVenues: number;
  activeVenues: number;
  newVenues: number;
}

export interface InteractionData {
  date: string;
  likes: number;
  saves: number;
  shares: number;
  checkIns: number;
  reviews: number;
}

export interface TopVenuesData {
  id: string;
  name: string;
  city: string;
  totalViews: number;
  totalLikes: number;
  averageRating: number;
  reviewCount: number;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const supabase = await createClient();
  
  // Check if user is authenticated and is super admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Check if user is super admin
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_login", thirtyDaysAgo.toISOString());

    // Get new users (created within last 30 days)
    const { count: newUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get total venues
    const { count: totalVenues } = await supabase
      .from("venues")
      .select("*", { count: "exact", head: true });

    // Get active venues
    const { count: activeVenues } = await supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get total events
    const { count: totalEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    // Get total interactions
    const { count: totalInteractions } = await supabase
      .from("user_interactions")
      .select("*", { count: "exact", head: true });

    // Get total reviews
    const { count: totalReviews } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      totalVenues: totalVenues || 0,
      activeVenues: activeVenues || 0,
      totalEvents: totalEvents || 0,
      totalInteractions: totalInteractions || 0,
      totalReviews: totalReviews || 0,
    };
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    throw new Error("Failed to fetch system metrics");
  }
}

export async function getUserGrowthData(days: number = 30): Promise<UserGrowthData[]> {
  const supabase = await createClient();
  
  // Check authentication and authorization
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Get system analytics data for the specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: analyticsData, error } = await supabase
      .from("system_analytics")
      .select("date, total_users, new_users, active_users")
      .gte("date", startDate.toISOString().split('T')[0])
      .order("date", { ascending: true });

    if (error) throw error;

    return analyticsData || [];
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return [];
  }
}

export async function getVenueActivityData(days: number = 30): Promise<VenueActivityData[]> {
  const supabase = await createClient();
  
  // Check authentication and authorization
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get venue analytics aggregated by date
    const { data: venueData, error } = await supabase
      .from("venue_analytics")
      .select("date")
      .gte("date", startDate.toISOString().split('T')[0])
      .order("date", { ascending: true });

    if (error) throw error;

    // Group by date and calculate metrics
    const dateMap = new Map<string, { totalVenues: number; activeVenues: number; newVenues: number }>();
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { totalVenues: 0, activeVenues: 0, newVenues: 0 });
    }

    // Get venue counts for each date
    for (const [dateStr] of dateMap) {
      const { count: totalVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .lte("created_at", `${dateStr}T23:59:59`);

      const { count: activeVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .lte("created_at", `${dateStr}T23:59:59`);

      const { count: newVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${dateStr}T00:00:00`)
        .lte("created_at", `${dateStr}T23:59:59`);

      dateMap.set(dateStr, {
        totalVenues: totalVenues || 0,
        activeVenues: activeVenues || 0,
        newVenues: newVenues || 0,
      });
    }

    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  } catch (error) {
    console.error("Error fetching venue activity data:", error);
    return [];
  }
}

export async function getInteractionData(days: number = 30): Promise<InteractionData[]> {
  const supabase = await createClient();
  
  // Check authentication and authorization
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get interactions grouped by date and type
    const { data: interactions, error } = await supabase
      .from("user_interactions")
      .select("created_at, interaction_type")
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    // Group interactions by date
    const dateMap = new Map<string, InteractionData>();
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        likes: 0,
        saves: 0,
        shares: 0,
        checkIns: 0,
        reviews: 0,
      });
    }

    // Count interactions by type and date
    interactions?.forEach((interaction) => {
      const date = interaction.created_at.split('T')[0];
      const existing = dateMap.get(date);
      if (existing) {
        switch (interaction.interaction_type) {
          case 'like':
            existing.likes++;
            break;
          case 'save':
            existing.saves++;
            break;
          case 'share':
            existing.shares++;
            break;
          case 'check_in':
            existing.checkIns++;
            break;
          case 'review':
            existing.reviews++;
            break;
        }
      }
    });

    return Array.from(dateMap.values());
  } catch (error) {
    console.error("Error fetching interaction data:", error);
    return [];
  }
}

export async function getTopVenues(limit: number = 10): Promise<TopVenuesData[]> {
  const supabase = await createClient();
  
  // Check authentication and authorization
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Get venues with their analytics data
    const { data: venues, error } = await supabase
      .from("venues")
      .select(`
        id,
        name,
        city,
        venue_analytics (
          views,
          likes
        ),
        reviews (
          rating
        )
      `)
      .eq("is_active", true)
      .limit(limit);

    if (error) throw error;

    // Calculate aggregated metrics for each venue
    const topVenues = venues?.map((venue) => {
      const totalViews = venue.venue_analytics?.reduce((sum: number, analytics: any) => sum + (analytics.views || 0), 0) || 0;
      const totalLikes = venue.venue_analytics?.reduce((sum: number, analytics: any) => sum + (analytics.likes || 0), 0) || 0;
      const reviews = venue.reviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
        : 0;

      return {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        totalViews,
        totalLikes,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      };
    }) || [];

    // Sort by total views and return top venues
    return topVenues
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top venues:", error);
    return [];
  }
}