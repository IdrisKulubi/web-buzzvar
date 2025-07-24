"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/lib/types/errors";

export interface VenueAnalyticsData {
  date: string;
  views: number;
  likes: number;
  saves: number;
  shares: number;
  check_ins: number;
  reviews_count: number;
  average_rating: number | null;
}

export interface VenueAnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
  totalShares: number;
  totalCheckIns: number;
  totalReviews: number;
  averageRating: number | null;
  viewsChange: number;
  likesChange: number;
  savesChange: number;
  sharesChange: number;
}

export async function getVenueAnalytics(
  venueId: string,
  startDate: string,
  endDate: string
): Promise<ActionResult<VenueAnalyticsData[]>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    const { data: analytics, error } = await supabase
      .from("venue_analytics")
      .select("*")
      .eq("venue_id", venueId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching venue analytics:", error);
      return { success: false, error: "Failed to fetch venue analytics" };
    }

    return { success: true, data: analytics || [] };
  } catch (error) {
    console.error("Error in getVenueAnalytics:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getVenueAnalyticsSummary(
  venueId: string
): Promise<ActionResult<VenueAnalyticsSummary>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    // Get current period (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get previous period (30 days before that)
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 30);

    const [currentPeriod, previousPeriod] = await Promise.all([
      supabase
        .from("venue_analytics")
        .select("*")
        .eq("venue_id", venueId)
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]),
      supabase
        .from("venue_analytics")
        .select("*")
        .eq("venue_id", venueId)
        .gte("date", prevStartDate.toISOString().split('T')[0])
        .lte("date", prevEndDate.toISOString().split('T')[0])
    ]);

    if (currentPeriod.error || previousPeriod.error) {
      console.error("Error fetching analytics summary:", currentPeriod.error || previousPeriod.error);
      return { success: false, error: "Failed to fetch analytics summary" };
    }

    // Calculate totals for current period
    const currentData = currentPeriod.data || [];
    const totalViews = currentData.reduce((sum, item) => sum + item.views, 0);
    const totalLikes = currentData.reduce((sum, item) => sum + item.likes, 0);
    const totalSaves = currentData.reduce((sum, item) => sum + item.saves, 0);
    const totalShares = currentData.reduce((sum, item) => sum + item.shares, 0);
    const totalCheckIns = currentData.reduce((sum, item) => sum + item.check_ins, 0);
    const totalReviews = currentData.reduce((sum, item) => sum + item.reviews_count, 0);
    
    // Calculate average rating
    const ratingsData = currentData.filter(item => item.average_rating !== null);
    const averageRating = ratingsData.length > 0 
      ? ratingsData.reduce((sum, item) => sum + (item.average_rating || 0), 0) / ratingsData.length
      : null;

    // Calculate totals for previous period
    const previousData = previousPeriod.data || [];
    const prevTotalViews = previousData.reduce((sum, item) => sum + item.views, 0);
    const prevTotalLikes = previousData.reduce((sum, item) => sum + item.likes, 0);
    const prevTotalSaves = previousData.reduce((sum, item) => sum + item.saves, 0);
    const prevTotalShares = previousData.reduce((sum, item) => sum + item.shares, 0);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const summary: VenueAnalyticsSummary = {
      totalViews,
      totalLikes,
      totalSaves,
      totalShares,
      totalCheckIns,
      totalReviews,
      averageRating,
      viewsChange: calculateChange(totalViews, prevTotalViews),
      likesChange: calculateChange(totalLikes, prevTotalLikes),
      savesChange: calculateChange(totalSaves, prevTotalSaves),
      sharesChange: calculateChange(totalShares, prevTotalShares),
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error in getVenueAnalyticsSummary:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getVenueRecentActivity(
  venueId: string,
  limit: number = 10
): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    // Get recent interactions
    const { data: interactions, error } = await supabase
      .from("user_interactions")
      .select(`
        *,
        user:users (
          profile:user_profiles (
            first_name,
            last_name,
            username,
            avatar_url
          )
        )
      `)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent activity:", error);
      return { success: false, error: "Failed to fetch recent activity" };
    }

    return { success: true, data: interactions || [] };
  } catch (error) {
    console.error("Error in getVenueRecentActivity:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getVenueTopReviews(
  venueId: string,
  limit: number = 5
): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    // Get top reviews
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user:users (
          profile:user_profiles (
            first_name,
            last_name,
            username,
            avatar_url
          )
        )
      `)
      .eq("venue_id", venueId)
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top reviews:", error);
      return { success: false, error: "Failed to fetch top reviews" };
    }

    return { success: true, data: reviews || [] };
  } catch (error) {
    console.error("Error in getVenueTopReviews:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getVenuePerformanceMetrics(
  venueId: string
): Promise<ActionResult<{
  totalEvents: number;
  activeEvents: number;
  totalPromotions: number;
  activePromotions: number;
  totalImages: number;
  averageRating: number | null;
  totalReviews: number;
}>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    // Get performance metrics
    const [
      eventsResult,
      activeEventsResult,
      promotionsResult,
      activePromotionsResult,
      imagesResult,
      reviewsResult
    ] = await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId),
      supabase
        .from("events")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId)
        .eq("is_active", true),
      supabase
        .from("promotions")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId),
      supabase
        .from("promotions")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId)
        .eq("is_active", true),
      supabase
        .from("venue_images")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId)
        .eq("is_active", true),
      supabase
        .from("reviews")
        .select("rating")
        .eq("venue_id", venueId)
    ]);

    if (eventsResult.error || activeEventsResult.error || promotionsResult.error || 
        activePromotionsResult.error || imagesResult.error || reviewsResult.error) {
      console.error("Error fetching performance metrics");
      return { success: false, error: "Failed to fetch performance metrics" };
    }

    // Calculate average rating
    const reviews = reviewsResult.data || [];
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

    const metrics = {
      totalEvents: eventsResult.count || 0,
      activeEvents: activeEventsResult.count || 0,
      totalPromotions: promotionsResult.count || 0,
      activePromotions: activePromotionsResult.count || 0,
      totalImages: imagesResult.count || 0,
      averageRating,
      totalReviews: reviews.length
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error in getVenuePerformanceMetrics:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}