"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AdminUser, User, UserProfile } from "@/lib/types/database";
import { ActionResult } from "@/lib/types/errors";

export interface AdminUserData extends AdminUser {
  user: User & {
    profile: UserProfile | null;
  };
  created_by_user?: {
    email: string;
    profile: {
      first_name?: string;
      last_name?: string;
    } | null;
  } | null;
}

export interface CreateAdminUserData {
  email: string;
  role: 'admin' | 'moderator';
  permissions?: Record<string, unknown>;
}

export interface UpdateAdminUserData {
  role?: 'admin' | 'moderator';
  permissions?: Record<string, unknown>;
}

export async function getAdminUsers(): Promise<ActionResult<AdminUserData[]>> {
  try {
    const supabase = await createClient();

    const { data: adminUsers, error } = await supabase
      .from("admin_users")
      .select(`
        *,
        user:users!inner (
          id,
          email,
          is_active,
          created_at,
          last_login,
          profile:user_profiles (
            first_name,
            last_name,
            username,
            avatar_url
          )
        ),
        created_by_user:admin_users!admin_users_created_by_fkey (
          user:users (
            email,
            profile:user_profiles (
              first_name,
              last_name
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin users:", error);
      return { success: false, error: "Failed to fetch admin users" };
    }

    return { success: true, data: adminUsers || [] };
  } catch (error) {
    console.error("Error in getAdminUsers:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAdminUserById(id: string): Promise<ActionResult<AdminUserData>> {
  try {
    const supabase = await createClient();

    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select(`
        *,
        user:users!inner (
          id,
          email,
          is_active,
          created_at,
          last_login,
          auth_provider,
          profile:user_profiles (
            first_name,
            last_name,
            username,
            avatar_url,
            bio,
            location_city,
            location_country
          )
        ),
        created_by_user:admin_users!admin_users_created_by_fkey (
          user:users (
            email,
            profile:user_profiles (
              first_name,
              last_name
            )
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching admin user:", error);
      return { success: false, error: "Failed to fetch admin user" };
    }

    if (!adminUser) {
      return { success: false, error: "Admin user not found" };
    }

    return { success: true, data: adminUser };
  } catch (error) {
    console.error("Error in getAdminUserById:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function createAdminUser(
  data: CreateAdminUserData,
  createdBy: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    let userId: string;

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing user:", userError);
      return { success: false, error: "Failed to check existing user" };
    }

    if (existingUser) {
      // Check if user is already an admin
      const { data: existingAdmin, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", existingUser.id)
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error("Error checking existing admin:", adminError);
        return { success: false, error: "Failed to check existing admin user" };
      }

      if (existingAdmin) {
        return { success: false, error: "User is already an admin" };
      }

      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          email: data.email,
          auth_provider: 'email',
          is_active: true,
        })
        .select("id")
        .single();

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        return { success: false, error: "Failed to create user" };
      }

      userId = newUser.id;

      // Create basic profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          first_name: data.email.split('@')[0], // Use email prefix as default name
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't fail the entire operation for profile creation
      }
    }

    // Create admin user record
    const { error: adminError } = await supabase
      .from("admin_users")
      .insert({
        user_id: userId,
        role: data.role,
        permissions: data.permissions || {},
        created_by: createdBy,
      });

    if (adminError) {
      console.error("Error creating admin user:", adminError);
      return { success: false, error: "Failed to create admin user" };
    }

    revalidatePath("/super-admin/admin-users");

    return { success: true };
  } catch (error) {
    console.error("Error in createAdminUser:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateAdminUser(
  adminUserId: string,
  updates: UpdateAdminUserData
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", adminUserId);

    if (error) {
      console.error("Error updating admin user:", error);
      return { success: false, error: "Failed to update admin user" };
    }

    revalidatePath("/super-admin/admin-users");
    revalidatePath(`/super-admin/admin-users/${adminUserId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateAdminUser:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteAdminUser(adminUserId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // Get current user to prevent self-deletion
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the admin user to check if it's the current user
    const { data: adminUser, error: fetchError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("id", adminUserId)
      .single();

    if (fetchError) {
      console.error("Error fetching admin user:", fetchError);
      return { success: false, error: "Failed to fetch admin user" };
    }

    if (adminUser.user_id === currentUser.id) {
      return { success: false, error: "Cannot delete your own admin account" };
    }

    // Delete admin user record (this will not delete the user, just remove admin privileges)
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", adminUserId);

    if (error) {
      console.error("Error deleting admin user:", error);
      return { success: false, error: "Failed to delete admin user" };
    }

    revalidatePath("/super-admin/admin-users");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteAdminUser:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleAdminUserStatus(
  adminUserId: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // Get current user to prevent self-deactivation
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the admin user to check if it's the current user
    const { data: adminUser, error: fetchError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("id", adminUserId)
      .single();

    if (fetchError) {
      console.error("Error fetching admin user:", fetchError);
      return { success: false, error: "Failed to fetch admin user" };
    }

    if (adminUser.user_id === currentUser.id && !isActive) {
      return { success: false, error: "Cannot deactivate your own account" };
    }

    // Update user status
    const { error } = await supabase
      .from("users")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminUser.user_id);

    if (error) {
      console.error("Error updating user status:", error);
      return { success: false, error: "Failed to update user status" };
    }

    revalidatePath("/super-admin/admin-users");
    revalidatePath(`/super-admin/admin-users/${adminUserId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in toggleAdminUserStatus:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}