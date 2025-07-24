"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserRoleByEmail } from "@/lib/utils/permissions";

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
  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active users (last_login column doesn't exist, so use created_at as proxy)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get new users (created within last 30 days)
    const { count: newUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get total venues
    const { count: totalVenues } = await supabase
      .from("venues")
      .select("*", { count: "exact", head: true });

    // Get active venues (is_active column doesn't exist, so count all venues)
    const { count: activeVenues } = await supabase
      .from("venues")
      .select("*", { count: "exact", head: true });

    // Get total events
    const { count: totalEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    // Get total interactions (using reviews as proxy since user_interactions doesn't exist)
    const { count: totalInteractions } = await supabase
      .from("reviews")
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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Since system_analytics doesn't exist, return mock data for now
    const data: UserGrowthData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      data.push({
        date: date.toISOString().split('T')[0],
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
      });
    }

    return data;
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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Since venue_analytics doesn't exist, calculate from venues table directly
    const data: VenueActivityData[] = [];
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const { count: totalVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .lte("created_at", `${dateStr}T23:59:59`);

      const { count: activeVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .lte("created_at", `${dateStr}T23:59:59`);

      const { count: newVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${dateStr}T00:00:00`)
        .lte("created_at", `${dateStr}T23:59:59`);

      data.push({
        date: dateStr,
        totalVenues: totalVenues || 0,
        activeVenues: activeVenues || 0,
        newVenues: newVenues || 0,
      });
    }

    return data;
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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Since user_interactions doesn't exist, use reviews as proxy data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("created_at")
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    // Group reviews by date
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

    // Count reviews by date
    reviews?.forEach((review) => {
      const date = review.created_at.split('T')[0];
      const existing = dateMap.get(date);
      if (existing) {
        existing.reviews++;
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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    // Get venues with their reviews (since venue_analytics doesn't exist)
    const { data: venues, error } = await supabase
      .from("venues")
      .select(`
        id,
        name,
        reviews (
          rating
        )
      `)

      .limit(limit);

    if (error) throw error;

    // Calculate aggregated metrics for each venue
    const topVenues = venues?.map((venue) => {
      const reviews = venue.reviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
        : 0;

      return {
        id: venue.id,
        name: venue.name,
        city: "Unknown", // City column doesn't exist in actual database
        totalViews: 0, // No analytics data available
        totalLikes: 0, // No analytics data available
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      };
    }) || [];

    // Sort by review count since we don't have views data
    return topVenues
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top venues:", error);
    return [];
  }
}