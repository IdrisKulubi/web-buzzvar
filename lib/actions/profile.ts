"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/lib/types/errors";
import { getUserRoleByEmail } from "@/lib/utils/permissions";

export async function checkUserProfile(): Promise<ActionResult<{ hasProfile: boolean; isVenueOwner: boolean }>> {
  try {
    const supabase = await createClient();
    
    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    // If user doesn't exist in our users table, create them
    if (userError && userError.code === 'PGRST116') { // No rows returned
      const { error: createError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email || '',
          created_at: new Date().toISOString(),
          // Only include columns that actually exist in the database
        });

      if (createError) {
        console.error("Error creating user:", createError);
        return { success: false, error: "Failed to create user profile" };
      }
    } else if (userError) {
      console.error("Error checking user:", userError);
      return { success: false, error: "Error checking user profile" };
    }

    // Check if user is a venue owner
    const { data: venueOwner, error: venueOwnerError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // If user is a venue owner, they have a profile
    if (!venueOwnerError && venueOwner) {
      return { 
        success: true, 
        data: { hasProfile: true, isVenueOwner: true } 
      };
    }

    // Check if user is admin/super admin based on email
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const userEmail = (user.email || '').toLowerCase();

    const isAdmin = superAdminEmails.includes(userEmail) || adminEmails.includes(userEmail);

    if (isAdmin) {
      // Admin users have a profile by default
      return { 
        success: true, 
        data: { hasProfile: true, isVenueOwner: false } 
      };
    }

    // Regular user - they have a basic profile now that we created their user record
    return { 
      success: true, 
      data: { hasProfile: true, isVenueOwner: false } 
    };

  } catch (error) {
    console.error("Error checking user profile:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function ensureUserExists(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    
    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    // If user doesn't exist in our users table, create them
    if (userError && userError.code === 'PGRST116') { // No rows returned
      const { error: createError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email || '',
          created_at: new Date().toISOString(),
        });

      if (createError) {
        console.error("Error creating user:", createError);
        return { success: false, error: "Failed to create user profile" };
      }

      console.log(`Created user profile for ${user.email}`);
    } else if (userError) {
      console.error("Error checking user:", userError);
      return { success: false, error: "Error checking user profile" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in ensureUserExists:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function createVenueOwnerProfile(venueId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Ensure user exists in our users table first
    const ensureResult = await ensureUserExists();
    if (!ensureResult.success) {
      return ensureResult;
    }

    // Create venue owner relationship
    const { error: ownerError } = await supabase
      .from("venue_owners")
      .insert({
        user_id: user.id,
        venue_id: venueId,
        role: "owner",
      });

    if (ownerError) {
      console.error("Error creating venue owner profile:", ownerError);
      return { success: false, error: "Failed to create venue owner profile" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createVenueOwnerProfile:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}