"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserRoleByEmail } from "@/lib/utils/permissions";

export interface UserData {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string; // Using created_at as fallback since updated_at doesn't exist
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
  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    let query = supabase
      .from("users")
      .select(`
        id,
        email,
        created_at
      `, { count: "exact" });

    // Apply filters
    if (filters.search) {
      query = query.ilike("email", `%${filters.search}%`);
    }

    // Status and auth_provider filters disabled since columns don't exist
    // if (filters.status && filters.status !== "all") {
    //   query = query.eq("is_active", filters.status === "active");
    // }

    // if (filters.auth_provider && filters.auth_provider !== "all") {
    //   query = query.eq("auth_provider", filters.auth_provider);
    // }

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
      phone: null, // phone column doesn't exist
      created_at: user.created_at,
      updated_at: user.created_at, // updated_at column doesn't exist, use created_at
      last_login: null, // last_login column doesn't exist
      is_active: true, // is_active column doesn't exist, default to true
      auth_provider: "email", // auth_provider column doesn't exist, default to email
      auth_provider_id: null, // auth_provider_id column doesn't exist
      profile: null,
      admin_role: null, // admin_users table doesn't exist
      venue_owner: null, // venue_owners relationship has RLS policy issues
    }));

    // Apply role filter (admin_users table doesn't exist, so use email-based roles)
    let filteredUsers = transformedUsers;
    if (filters.role && filters.role !== "all") {
      filteredUsers = transformedUsers.filter(user => {
        // Get role from email configuration
        const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        const userEmail = user.email.toLowerCase();
        
        if (filters.role === "super_admin") {
          return superAdminEmails.includes(userEmail);
        }
        if (filters.role === "admin") {
          return adminEmails.includes(userEmail) && !superAdminEmails.includes(userEmail);
        }
        if (filters.role === "club_owner") {
          return user.venue_owner;
        }
        if (filters.role === "user") {
          return !superAdminEmails.includes(userEmail) && !adminEmails.includes(userEmail) && !user.venue_owner;
        }
        return false;
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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        created_at
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!userData) return null;

    return {
      id: userData.id,
      email: userData.email,
      phone: null, // phone column doesn't exist
      created_at: userData.created_at,
      updated_at: userData.created_at, // updated_at column doesn't exist, use created_at
      last_login: null, // last_login column doesn't exist
      is_active: true, // is_active column doesn't exist, default to true
      auth_provider: "email", // auth_provider column doesn't exist, default to email
      auth_provider_id: null, // auth_provider_id column doesn't exist
      profile: null,
      admin_role: null, // admin_users table doesn't exist
      venue_owner: null, // venue_owners relationship has RLS policy issues
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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    // is_active column doesn't exist, so this function is disabled
    console.log("toggleUserStatus called but is_active column doesn't exist");
    return { success: false, error: "User status toggle not available - is_active column doesn't exist" };

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

  const userRole = await getUserRoleByEmail(user.email || '');
  if (userRole !== "super_admin") {
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