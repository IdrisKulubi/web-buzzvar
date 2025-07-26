import { createClient } from "@/lib/supabase/server";

// Import service client with error handling
let createServiceClient: (() => any) | null = null;
try {
  createServiceClient = require("@/lib/supabase/service").createServiceClient;
} catch (error) {
  console.log("Service client not available");
}

export type UserRole = "super_admin" | "admin" | "moderator" | "club_owner" | null;

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();

  try {
    // Get user email first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || !user.email) {
      console.log("No authenticated user found");
      return null;
    }

    console.log("Checking role for user:", user.email);

    // Check if user is super admin based on email
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    console.log("Super admin emails from env:", superAdminEmails);
    
    if (superAdminEmails.includes(user.email.toLowerCase())) {
      console.log("User is super admin");
      return "super_admin";
    }

    // Check if user is admin based on email
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    console.log("Admin emails from env:", adminEmails);
    
    if (adminEmails.includes(user.email.toLowerCase())) {
      console.log("User is admin");
      return "admin";
    }

    // admin_users table doesn't exist, so skip database role check
    console.log("admin_users table doesn't exist, skipping database role check");

    // Check if user is a venue owner using service client to bypass RLS
    if (createServiceClient) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: venueOwner, error: venueError } = await serviceSupabase
          .from("venue_owners")
          .select("role")
          .eq("user_id", userId)
          .single();

        if (!venueError && venueOwner) {
          console.log("User is venue owner (via service client)");
          return "club_owner";
        }
      } catch (serviceError) {
        console.log("Service client error:", serviceError);
      }
    }
    
    // Fallback to regular client
    try {
      const { data: venueOwner, error: venueError } = await supabase
        .from("venue_owners")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (!venueError && venueOwner) {
        console.log("User is venue owner (via regular client)");
        return "club_owner";
      }
    } catch (regularError) {
      console.log("Regular client error:", regularError);
    }

    console.log("No role found for user");
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

export async function getUserRoleByEmail(email: string): Promise<UserRole> {
  // Check if user is super admin based on email
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  if (superAdminEmails.includes(email.toLowerCase())) {
    return "super_admin";
  }

  // Check if user is admin based on email
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  if (adminEmails.includes(email.toLowerCase())) {
    return "admin";
  }

  const supabase = await createClient();

  try {
    // Get user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !users) return null;

    // admin_users table doesn't exist, so skip database role check

    // Check if user is a venue owner using service client to bypass RLS
    if (createServiceClient) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: venueOwner, error: venueError } = await serviceSupabase
          .from("venue_owners")
          .select("role")
          .eq("user_id", users.id)
          .single();

        if (!venueError && venueOwner) {
          return "club_owner";
        }
      } catch (serviceError) {
        console.log("Service client error:", serviceError);
      }
    }
    
    // Fallback to regular client
    try {
      const { data: venueOwner, error: venueError } = await supabase
        .from("venue_owners")
        .select("role")
        .eq("user_id", users.id)
        .single();

      if (!venueError && venueOwner) {
        return "club_owner";
      }
    } catch (regularError) {
      console.log("Regular client error:", regularError);
    }

    return null;
  } catch (error) {
    console.error("Error getting user role by email:", error);
    return null;
  }
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  if (!userRole || !requiredRole) return false;

  const roleHierarchy: Record<string, number> = {
    super_admin: 4,
    admin: 3,
    moderator: 2,
    club_owner: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator", 
    club_owner: "Club Owner",
  };
  
  return role ? roleNames[role] : "No Role";
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<string, string> = {
    super_admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    moderator: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    club_owner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };
  
  return role ? roleColors[role] : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
}