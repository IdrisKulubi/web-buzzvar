import { getClubOwnerVenueById } from "@/lib/actions/venues";
import { ClubOwnerVenueDetails } from "@/components/venues/club-owner-venue-details";
import { notFound } from "next/navigation";

interface VenuePageProps {
  params: {
    id: string;
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const result = await getClubOwnerVenueById(params.id);

  if (!result.success) {
    if (result.error === "Venue not found or access denied") {
      notFound();
    }
    
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground mt-2">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ClubOwnerVenueDetails venue={result.data} />
    </div>
  );
}