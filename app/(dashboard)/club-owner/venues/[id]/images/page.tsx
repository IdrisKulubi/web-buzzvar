import { getClubOwnerVenueById } from "@/lib/actions/venues";
import { getVenueImages } from "@/lib/actions/venue-images";
import { VenueImageManager } from "@/components/venues/venue-image-manager";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface VenueImagesPageProps {
  params: {
    id: string;
  };
}

export default async function VenueImagesPage({ params }: VenueImagesPageProps) {
  const [venueResult, imagesResult] = await Promise.all([
    getClubOwnerVenueById(params.id),
    getVenueImages(params.id)
  ]);

  if (!venueResult.success) {
    if (venueResult.error === "Venue not found or access denied") {
      notFound();
    }
    
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground mt-2">{venueResult.error}</p>
        </div>
      </div>
    );
  }

  if (!imagesResult.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground mt-2">{imagesResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/club-owner/venues/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venue
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold">Manage Images</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage images for {venueResult.data.name}
        </p>
      </div>

      <VenueImageManager 
        venueId={params.id} 
        venue={venueResult.data}
        initialImages={imagesResult.data}
      />
    </div>
  );
}