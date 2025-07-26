"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Check if a user is a venue owner
 * Uses service client to bypass RLS issues
 */
export async function checkIfUserIsVenueOwner(userId: string): Promise<boolean> {
  try {
    // Try service client first
    const serviceSupabase = createServiceClient();
    const { data: venueOwner, error: serviceError } = await serviceSupabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!serviceError && venueOwner) {
      console.log("User is venue owner (service client)");
      return true;
    }

    // Fallback to regular client
    const supabase = await createClient();
    const { data: regularVenueOwner, error: regularError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!regularError && regularVenueOwner) {
      console.log("User is venue owner (regular client)");
      return true;
    }

    console.log("User is not a venue owner");
    return false;
  } catch (error) {
    console.error("Error checking venue owner status:", error);
    return false;
  }
}

/**
 * Check if a user is a venue owner by email
 */
export async function checkIfUserIsVenueOwnerByEmail(email: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return false;
    }

    return await checkIfUserIsVenueOwner(user.id);
  } catch (error) {
    console.error("Error checking venue owner by email:", error);
    return false;
  }
}