import { createClient } from "@/lib/supabase/server";
import { getUserRoleByEmail } from "@/lib/utils/permissions";
import { ensureUserExists } from "@/lib/utils/ensure-user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  console.log("=== DASHBOARD PAGE ===");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log("No user found, redirecting to login");
    redirect("/login");
  }

  console.log("User found:", user.email);

  // Ensure user exists in our database
  await ensureUserExists();

  // Check role by email first (for super admin and admin)
  const userRole = await getUserRoleByEmail(user.email || "");

  console.log("User role in dashboard:", userRole);

  // Redirect to appropriate dashboard based on role
  if (userRole) {
    console.log("User has role, redirecting to appropriate dashboard");
    switch (userRole) {
      case "super_admin":
        redirect("/super-admin");
      case "admin":
      case "moderator":
        redirect("/admin");
      case "club_owner":
        redirect("/club-owner");
    }
  }

  console.log("User has no role, redirecting to venue setup");
  // If no role is assigned, redirect to venue setup (they want to be a venue owner)
  redirect("/venue-setup");
}
