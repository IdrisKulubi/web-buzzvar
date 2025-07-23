"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface UserData {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  auth_provider: string;
  auth_provider_id?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
    location_city?: string;
    location_country?: string;
  };
  admin_role?: {
    role: string;
    permissions?: Record<string, any>;
  };
  venue_owner?: {
    role: string;
    venue_count: number;
  };
}

export interface UserFilters {
  search?: string;
  status?: "all" | "active" | "inactive";
  role?: "all" | "super_admin" | "admin" | "moderator" | "club_owner" | "user";
  auth_provider?: "all" | "email" | "google" | "apple";
}

export async function getUsers(
  page: number = 1,
  pageSize: number = 10,
  filters: UserFilters = {}
): Promise<{ users: UserData[]; total: number }> {
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
    let query = supabase
      .from("users")
      .select(`
        id,
        email,
        phone,
        created_at,
        updated_at,
        last_login,
        is_active,
        auth_provider,
        auth_provider_id,
        user_profiles (
          first_name,
          last_name,
          username,
          bio,
          avatar_url,
          date_of_birth,
          gender,
          location_city,
          location_country
        ),
        admin_users (
          role,
          permissions
        ),
        venue_owners (
          role
        )
      `, { count: "exact" });

    // Apply filters
    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,user_profiles.first_name.ilike.%${filters.search}%,user_profiles.last_name.ilike.%${filters.search}%,user_profiles.username.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("is_active", filters.status === "active");
    }

    if (filters.auth_provider && filters.auth_provider !== "all") {
      query = query.eq("auth_provider", filters.auth_provider);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: users, error, count } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data
    const transformedUsers: UserData[] = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      is_active: user.is_active,
      auth_provider: user.auth_provider,
      auth_provider_id: user.auth_provider_id,
      profile: user.user_profiles?.[0] || null,
      admin_role: user.admin_users?.[0] || null,
      venue_owner: user.venue_owners?.[0] ? {
        role: user.venue_owners[0].role,
        venue_count: user.venue_owners.length
      } : null,
    }));

    // Apply role filter (needs to be done after data transformation)
    let filteredUsers = transformedUsers;
    if (filters.role && filters.role !== "all") {
      filteredUsers = transformedUsers.filter(user => {
        if (filters.role === "user") {
          return !user.admin_role && !user.venue_owner;
        }
        if (filters.role === "club_owner") {
          return user.venue_owner;
        }
        return user.admin_role?.role === filters.role;
      });
    }

    return {
      users: filteredUsers,
      total: count || 0,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(userId: string): Promise<UserData | null> {
  const supabase = await createClient();
  
  // Check if user is authenticated and is super admin
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
    const { data: userData, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        phone,
        created_at,
        updated_at,
        last_login,
        is_active,
        auth_provider,
        auth_provider_id,
        user_profiles (
          first_name,
          last_name,
          username,
          bio,
          avatar_url,
          date_of_birth,
          gender,
          location_city,
          location_country
        ),
        admin_users (
          role,
          permissions
        ),
        venue_owners (
          role
        )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!userData) return null;

    return {
      id: userData.id,
      email: userData.email,
      phone: userData.phone,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login: userData.last_login,
      is_active: userData.is_active,
      auth_provider: userData.auth_provider,
      auth_provider_id: userData.auth_provider_id,
      profile: userData.user_profiles?.[0] || null,
      admin_role: userData.admin_users?.[0] || null,
      venue_owner: userData.venue_owners?.[0] ? {
        role: userData.venue_owners[0].role,
        venue_count: userData.venue_owners.length
      } : null,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check if user is authenticated and is super admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update user status" 
    };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check if user is authenticated and is super admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  // Prevent self-deletion
  if (userId === user.id) {
    return { success: false, error: "Cannot delete your own account" };
  }

  try {
    // Delete user (cascade will handle related records)
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete user" 
    };
  }
}