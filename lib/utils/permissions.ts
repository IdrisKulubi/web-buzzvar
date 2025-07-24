import { createClient } from "@/lib/supabase/server";

export type UserRole = "super_admin" | "admin" | "moderator" | "club_owner" | null;

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();

  try {
    // Get user email first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Check if user is super admin based on email
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    if (superAdminEmails.includes(user.email || '')) {
      return "super_admin";
    }

    // Check if user is admin based on email
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    if (adminEmails.includes(user.email || '')) {
      return "admin";
    }

    // Check if user is an admin user in database
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!adminError && adminUser) {
      return adminUser.role as UserRole;
    }

    // Check if user is a venue owner
    const { data: venueOwner, error: venueError } = await supabase
      .from("venue_owners")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!venueError && venueOwner) {
      return "club_owner";
    }

    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

export async function getUserRoleByEmail(email: string): Promise<UserRole> {
  // Check if user is super admin based on email
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  if (superAdminEmails.includes(email)) {
    return "super_admin";
  }

  // Check if user is admin based on email
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  if (adminEmails.includes(email)) {
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

    // Check database roles
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", users.id)
      .single();

    if (!adminError && adminUser) {
      return adminUser.role as UserRole;
    }

    const { data: venueOwner, error: venueError } = await supabase
      .from("venue_owners")
      .select("role")
      .eq("user_id", users.id)
      .single();

    if (!venueError && venueOwner) {
      return "club_owner";
    }

    return null;
  } catch (error) {
    console.error("Error getting user role by email:", error);
    return null;
  }
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  if (!userRole || !requiredRole) return false;

  const roleHierarchy: Record<UserRole, number> = {
    super_admin: 4,
    admin: 3,
    moderator: 2,
    club_owner: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator", 
    club_owner: "Club Owner",
  };
  
  return role ? roleNames[role] : "No Role";
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    super_admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    moderator: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    club_owner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };
  
  return role ? roleColors[role] : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
}