import { VenueCreationForm } from "@/components/venue-creation-form";
import { createClient } from "@/lib/supabase/server";
import { getUserRoleByEmail } from "@/lib/utils/permissions";
import { ensureUserExists } from "@/lib/utils/ensure-user";
import { redirect } from "next/navigation";

export default async function VenueSetupPage() {
  const supabase = await createClient();
  
  console.log("=== VENUE SETUP PAGE ===");
  
  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log("No user found, redirecting to login");
    redirect("/auth/login");
  }

  console.log("User found:", user.email);

  // Ensure user exists in our database
  await ensureUserExists();

  // Check if user already has a role - if so, redirect them
  const userRole = await getUserRoleByEmail(user.email || '');
  console.log("User role in venue-setup:", userRole);
  
  if (userRole) {
    console.log("User has role, redirecting to appropriate dashboard");
    switch (userRole) {
      case "super_admin":
        redirect("/super-admin");
      case "admin":
        redirect("/admin");
      case "club_owner":
        redirect("/club-owner");
    }
  }

  // Check if user is already a venue owner
  const { data: venueOwner } = await supabase
    .from("venue_owners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (venueOwner) {
    console.log("User is already a venue owner, redirecting to club-owner");
    redirect("/club-owner");
  }

  console.log("User has no role and is not a venue owner - showing venue setup form");
  
  // User has no role and is not a venue owner - show venue setup form
  return (
    <div className="min-h-screen bg-gray-50">
      <VenueCreationForm />
    </div>
  );
}