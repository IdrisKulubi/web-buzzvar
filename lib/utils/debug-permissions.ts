// Debug utility to check environment variables and permissions
import { createClient } from "@/lib/supabase/server";

export async function debugPermissions() {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log("=== PERMISSION DEBUG ===");
    console.log("Current user:", user?.email);
    console.log("User ID:", user?.id);
    
    // Check environment variables
    console.log("SUPER_ADMIN_EMAILS from env:", process.env.SUPER_ADMIN_EMAILS);
    console.log("ADMIN_EMAILS from env:", process.env.ADMIN_EMAILS);
    
    // Parse environment variables
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    
    console.log("Parsed super admin emails:", superAdminEmails);
    console.log("Parsed admin emails:", adminEmails);
    
    if (user?.email) {
      console.log("User email (lowercase):", user.email.toLowerCase());
      console.log("Is super admin?", superAdminEmails.includes(user.email.toLowerCase()));
      console.log("Is admin?", adminEmails.includes(user.email.toLowerCase()));
    }
    
    console.log("=== END DEBUG ===");
    
    return {
      userEmail: user?.email,
      superAdminEmails,
      adminEmails,
      isSuperAdmin: user?.email ? superAdminEmails.includes(user.email.toLowerCase()) : false,
      isAdmin: user?.email ? adminEmails.includes(user.email.toLowerCase()) : false
    };
  } catch (error) {
    console.error("Debug error:", error);
    return null;
  }
}