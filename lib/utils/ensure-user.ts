"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Ensures that the authenticated user exists in our users table.
 * This should be called on any protected page to make sure the user
 * has a record in our database.
 */
export async function ensureUserExists(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return false;
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
        return false;
      }

      console.log(`Auto-created user profile for ${user.email}`);
      return true;
    } else if (userError) {
      console.error("Error checking user:", userError);
      return false;
    }

    // User already exists
    return true;
  } catch (error) {
    console.error("Error in ensureUserExists:", error);
    return false;
  }
}

/**
 * Gets or creates a user record and returns basic user info
 */
export async function getOrCreateUser() {
  const supabase = await createClient();
  
  // Get current user from auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  // Ensure user exists
  await ensureUserExists();

  // Return user info
  return {
    id: user.id,
    email: user.email || '',
    created_at: user.created_at || new Date().toISOString(),
  };
}