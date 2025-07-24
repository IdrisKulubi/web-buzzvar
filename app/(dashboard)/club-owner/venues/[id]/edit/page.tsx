import { getClubOwnerVenueById } from "@/lib/actions/venues";
import { VenueForm } from "@/components/venues/venue-form";
import { notFound } from "next/navigation";

interface EditVenuePageProps {
  params: {
    id: string;
  };
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Venue</h1>
        <p className="text-muted-foreground mt-2">
          Update your venue information
        </p>
      </div>

      <div className="max-w-2xl">
        <VenueForm venue={result.data} />
      </div>
    </div>
  );
}