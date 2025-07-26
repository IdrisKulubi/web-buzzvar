"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { Venue, VenueOwner, User, UserProfile } from "@/lib/types/database";
import { ActionResult } from "@/lib/types/errors";

export interface VenueData extends Venue {
  venue_owners: Array<{
    id: string;
    role: string;
    user: User & {
      profile?: UserProfile;
    };
  }>;
  _count?: {
    events: number;
    reviews: number;
    venue_images: number;
  };
  [key: string]: unknown;
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
            created_at
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching venues:", error);
      return { success: false, error: "Failed to fetch venues" };
    }

    // Get user profiles for all venue owners
    const userIds = venues?.flatMap(venue => 
      venue.venue_owners.map(owner => owner.user.id)
    ) || [];

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, first_name, last_name, username, avatar_url")
      .in("user_id", userIds);

    // Create a map of user profiles
    const profileMap = new Map(
      profiles?.map(profile => [profile.user_id, profile]) || []
    );

    // Get counts for each venue and attach profiles
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

        // Attach profiles to venue owners
        const venueOwnersWithProfiles = venue.venue_owners.map(owner => ({
          ...owner,
          user: {
            ...owner.user,
            profile: profileMap.get(owner.user.id) || null
          }
        }));

        return {
          ...venue,
          venue_owners: venueOwnersWithProfiles,
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
            created_at
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

    // Get user profiles for venue owners
    const userIds = venue.venue_owners.map(owner => owner.user.id);
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, first_name, last_name, username, avatar_url")
      .in("user_id", userIds);

    // Create a map of user profiles
    const profileMap = new Map(
      profiles?.map(profile => [profile.user_id, profile]) || []
    );

    // Attach profiles to venue owners
    const venueOwnersWithProfiles = venue.venue_owners.map(owner => ({
      ...owner,
      user: {
        ...owner.user,
        profile: profileMap.get(owner.user.id) || null
      }
    }));

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
      venue_owners: venueOwnersWithProfiles,
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
    // is_active column doesn't exist in the actual database
    console.log("toggleVenueStatus called but is_active column doesn't exist");
    return { success: false, error: "Venue status toggle is not available - is_active column doesn't exist" };
  } catch (error) {
    console.error("Error in toggleVenueStatus:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteVenue(venueId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // Check if venue has active events (is_active column may not exist)
    const { data: activeEvents, error: eventsError } = await supabase
      .from("events")
      .select("id")
      .eq("venue_id", venueId)
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
    revalidatePath("/club-owner/venues");
    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateVenueDetails:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Club Owner specific actions
export async function getClubOwnerVenues(): Promise<ActionResult<VenueData[]>> {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Use service client to bypass RLS for venue_owners relationship
    const { data: venues, error } = await serviceSupabase
      .from("venues")
      .select(`
        *,
        venue_owners!inner (
          id,
          role,
          user:users!inner (
            id,
            email,
            created_at
          )
        )
      `)
      .eq("venue_owners.user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching club owner venues:", error);
      return { success: false, error: "Failed to fetch venues" };
    }

    // Get user profiles for all venue owners
    const userIds = venues?.flatMap(venue => 
      venue.venue_owners.map(owner => owner.user.id)
    ) || [];

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, first_name, last_name, username, avatar_url")
      .in("user_id", userIds);

    // Create a map of user profiles
    const profileMap = new Map(
      profiles?.map(profile => [profile.user_id, profile]) || []
    );

    // Get counts for each venue and attach profiles
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

        // Attach profiles to venue owners
        const venueOwnersWithProfiles = venue.venue_owners.map(owner => ({
          ...owner,
          user: {
            ...owner.user,
            profile: profileMap.get(owner.user.id) || null
          }
        }));

        return {
          ...venue,
          venue_owners: venueOwnersWithProfiles,
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
    console.error("Error in getClubOwnerVenues:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getClubOwnerVenueById(id: string): Promise<ActionResult<VenueData>> {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Step 1: Definitively verify ownership using the service client to bypass RLS.
    const { data: ownership, error: ownershipError } = await serviceSupabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", id)
      .single();

    if (ownershipError || !ownership) {
      console.error(
        `Ownership check failed for user ${user.id} and venue ${id}. Error: ${JSON.stringify(ownershipError, null, 2)}`
      );
      return { success: false, error: "Access Denied: You are not the owner of this venue." };
    }
    
    // Step 2: Since ownership is confirmed, fetch the core venue data using the service client.
    const { data: venue, error: venueError } = await serviceSupabase
      .from("venues")
      .select(`
        *,
        venue_owners (
          id,
          role,
          user:users (
            id,
            email,
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

    if (venueError || !venue) {
      console.error(
        `Failed to fetch venue ${id} after ownership was confirmed. Error: ${JSON.stringify(venueError, null, 2)}`
      );
      return { success: false, error: "Failed to fetch venue data." };
    }

    // Step 3: Fetch counts separately to avoid issues with misconfigured relationships.
    const [promotionsCount, reviewsCount, imagesCount] = await Promise.all([
      serviceSupabase
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venue.id),
      serviceSupabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venue.id),
      serviceSupabase
        .from("venue_images")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venue.id),
    ]);

    // Step 4: Combine the venue data with the counts.
    const venueWithCounts = {
      ...venue,
      _count: {
        promotions: promotionsCount.count || 0,
        reviews: reviewsCount.count || 0,
        venue_images: imagesCount.count || 0,
      },
    };
    
    return { success: true, data: venueWithCounts };
  } catch (error) {
    console.error("An unexpected server error occurred in getClubOwnerVenueById:", error);
    return { success: false, error: "An unexpected server error occurred." };
  }
}

export async function createVenue(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Extract form data
    const venueData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      website: formData.get("website") as string || null,
      instagram: formData.get("instagram") as string || null,
      facebook: formData.get("facebook") as string || null,
      twitter: formData.get("twitter") as string || null,
      venue_type: formData.get("venue_type") as string || null,
      capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : null,
      dress_code: formData.get("dress_code") as string || null,
      age_restriction: formData.get("age_restriction") ? parseInt(formData.get("age_restriction") as string) : null,
      price_range: formData.get("price_range") as string || null,
      is_verified: false,
      is_active: true,
    };

    // Create venue
    const { data: venue, error } = await supabase
      .from("venues")
      .insert(venueData)
      .select()
      .single();

    if (error) {
      console.error("Error creating venue:", error);
      return { success: false, error: "Failed to create venue" };
    }

    console.log("Creating venue owner relationship for user:", user.id, "venue:", venue.id);
    
    // Create venue owner relationship using service role to bypass RLS
    const serviceSupabase = createServiceClient();
    
    const { error: ownerError } = await serviceSupabase
      .from("venue_owners")
      .insert({
        user_id: user.id,
        venue_id: venue.id,
        role: "owner",
      });

    if (ownerError) {
      console.error("Error creating venue owner relationship:", ownerError);
      // Try to clean up the venue if owner relationship failed
      await supabase.from("venues").delete().eq("id", venue.id);
      return { success: false, error: "Failed to create venue ownership" };
    }

    console.log("Successfully created venue and venue owner relationship");

    revalidatePath("/club-owner/venues");

    return { success: true, data: { id: venue.id } };
  } catch (error) {
    console.error("Error in createVenue:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateClubOwnerVenue(
  venueId: string,
  formData: FormData
): Promise<ActionResult<void>> {
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

    // Extract form data
    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      website: formData.get("website") as string || null,
      instagram: formData.get("instagram") as string || null,
      facebook: formData.get("facebook") as string || null,
      twitter: formData.get("twitter") as string || null,
      venue_type: formData.get("venue_type") as string || null,
      capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : null,
      dress_code: formData.get("dress_code") as string || null,
      age_restriction: formData.get("age_restriction") ? parseInt(formData.get("age_restriction") as string) : null,
      price_range: formData.get("price_range") as string || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("venues")
      .update(updates)
      .eq("id", venueId);

    if (error) {
      console.error("Error updating venue:", error);
      return { success: false, error: "Failed to update venue" };
    }

    revalidatePath("/club-owner/venues");
    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateClubOwnerVenue:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}