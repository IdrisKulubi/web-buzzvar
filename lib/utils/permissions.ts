import { createClient } from "@/lib/supabase/server";

export type UserRole = "super_admin" | "admin" | "moderator" | "club_owner" | null;

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();

  try {
    // Check if user is an admin user
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