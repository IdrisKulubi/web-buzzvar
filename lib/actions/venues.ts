"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Venue, VenueOwner, User, UserProfile } from "@/lib/types/database";
import { ActionResult } from "@/lib/types/errors";

export interface VenueData extends Venue {
  venue_owners: Array<{
    id: string;
    role: string;
    user: User & {
      profile: UserProfile | null;
    };
  }>;
  _count?: {
    events: number;
    reviews: number;
    venue_images: number;
  };
}

export async function getVenues(): Promise<ActionResult<VenueData[]>> {
  try {
    const supabase = await createClient();

    const { data: venues, error } = await supabase
      .from("venues")
      .select(`
        *,
        venue_owners!inner (
          id,
          role,
          user:users!inner (
            id,
            email,
            is_active,
            created_at,
            profile:user_profiles (
              first_name,
              last_name,
              username,
              avatar_url
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching venues:", error);
      return { success: false, error: "Failed to fetch venues" };
    }

    // Get counts for each venue
    const venuesWithCounts = await Promise.all(
      (venues || []).map(async (venue) => {
        const [eventsCount, reviewsCount, imagesCount] = await Promise.all([
          supabase
            .from("events")
            .select("id", { count: "exact" })
            .eq("venue_id", venue.id),
          supabase
            .from("reviews")
            .select("id", { count: "exact" })
            .eq("venue_id", venue.id),
          supabase
            .from("venue_images")
            .select("id", { count: "exact" })
            .eq("venue_id", venue.id),
        ]);

        return {
          ...venue,
          _count: {
            events: eventsCount.count || 0,
            reviews: reviewsCount.count || 0,
            venue_images: imagesCount.count || 0,
          },
        };
      })
    );

    return { success: true, data: venuesWithCounts };
  } catch (error) {
    console.error("Error in getVenues:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getVenueById(id: string): Promise<ActionResult<VenueData>> {
  try {
    const supabase = await createClient();

    const { data: venue, error } = await supabase
      .from("venues")
      .select(`
        *,
        venue_owners (
          id,
          role,
          user:users (
            id,
            email,
            is_active,
            created_at,
            profile:user_profiles (
              first_name,
              last_name,
              username,
              avatar_url
            )
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching venue:", error);
      return { success: false, error: "Failed to fetch venue" };
    }

    if (!venue) {
      return { success: false, error: "Venue not found" };
    }

    // Get counts
    const [eventsCount, reviewsCount, imagesCount] = await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact" })
        .eq("venue_id", venue.id),
      supabase
        .from("reviews")
        .select("id", { count: "exact" })
        .eq("venue_id", venue.id),
      supabase
        .from("venue_images")
        .select("id", { count: "exact" })
        .eq("venue_id", venue.id),
    ]);

    const venueWithCounts = {
      ...venue,
      _count: {
        events: eventsCount.count || 0,
        reviews: reviewsCount.count || 0,
        venue_images: imagesCount.count || 0,
      },
    };

    return { success: true, data: venueWithCounts };
  } catch (error) {
    console.error("Error in getVenueById:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleVenueVerification(
  venueId: string,
  isVerified: boolean
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("venues")
      .update({
        is_verified: isVerified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", venueId);

    if (error) {
      console.error("Error updating venue verification:", error);
      return { success: false, error: "Failed to update venue verification" };
    }

    revalidatePath("/super-admin/venues");
    revalidatePath(`/super-admin/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in toggleVenueVerification:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleVenueStatus(
  venueId: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("venues")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", venueId);

    if (error) {
      console.error("Error updating venue status:", error);
      return { success: false, error: "Failed to update venue status" };
    }

    revalidatePath("/super-admin/venues");
    revalidatePath(`/super-admin/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in toggleVenueStatus:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteVenue(venueId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // Check if venue has active events
    const { data: activeEvents, error: eventsError } = await supabase
      .from("events")
      .select("id")
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .limit(1);

    if (eventsError) {
      console.error("Error checking active events:", eventsError);
      return { success: false, error: "Failed to check venue events" };
    }

    if (activeEvents && activeEvents.length > 0) {
      return {
        success: false,
        error: "Cannot delete venue with active events. Please deactivate all events first.",
      };
    }

    // Delete venue (cascade will handle related records)
    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("id", venueId);

    if (error) {
      console.error("Error deleting venue:", error);
      return { success: false, error: "Failed to delete venue" };
    }

    revalidatePath("/super-admin/venues");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteVenue:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateVenueDetails(
  venueId: string,
  updates: Partial<Venue>
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("venues")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", venueId);

    if (error) {
      console.error("Error updating venue:", error);
      return { success: false, error: "Failed to update venue" };
    }

    revalidatePath("/super-admin/venues");
    revalidatePath(`/super-admin/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateVenueDetails:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}