import { redirect } from "next/navigation";

export default function ClubOwnerDashboard() {
  // Redirect to venues page as the main dashboard
  redirect("/club-owner/venues");
}