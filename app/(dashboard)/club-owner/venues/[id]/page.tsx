import { getClubOwnerVenueById } from "@/lib/actions/venues";
import { ClubOwnerVenueDetails } from "@/components/venues/club-owner-venue-details";
import { notFound } from "next/navigation";

interface VenuePageProps {
  params: {
    id: string;
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const awaitedParams = await params;
  const result = await getClubOwnerVenueById(awaitedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Ensure the venue data is serializable before passing to a client component.
  // This converts Date objects to strings and removes any other non-plain-object properties.
  const serializableVenue = JSON.parse(JSON.stringify(result.data));

  return (
    <div className="container mx-auto py-8">
      <ClubOwnerVenueDetails venue={serializableVenue} />
    </div>
  );
}