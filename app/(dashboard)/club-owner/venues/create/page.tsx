import { VenueForm } from "@/components/venues/venue-form";
import { getClubOwnerVenues } from "@/lib/actions/venues";
import { redirect } from "next/navigation";

export default async function CreateVenuePage() {
  const result = await getClubOwnerVenues();

  // If owner has a venue, redirect them away from the creation page
  if (result.success && result.data.length > 0) {
    redirect("/club-owner/venues");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Your Venue</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the details below to get your venue listed on BuzzVar.
        </p>
      </div>

      <div className="max-w-2xl">
        <VenueForm />
      </div>
    </div>
  );
}