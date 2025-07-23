import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getVenueById } from "@/lib/actions/venues";
import { VenueDetails } from "@/components/venues/venue-details";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VenueDetailsPageProps {
  params: {
    id: string;
  };
}

async function VenueDetailsContent({ params }: VenueDetailsPageProps) {
  const result = await getVenueById(params.id);

  if (!result.success) {
    if (result.error === "Venue not found") {
      notFound();
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load venue</p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return <VenueDetails venue={result.data} />;
}

export default function VenueDetailsPage({ params }: VenueDetailsPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/super-admin/venues">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <VenueDetailsContent params={params} />
      </Suspense>
    </div>
  );
}