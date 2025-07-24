import { Suspense } from "react";
import { getClubOwnerVenues } from "@/lib/actions/venues";
import { ClubOwnerVenueTable } from "@/components/venues/club-owner-venue-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/common/loading-spinner";

export default async function ClubOwnerVenuesPage() {
  const result = await getClubOwnerVenues();

  if (!result.success) {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Venues</h1>
          <p className="text-muted-foreground mt-2">
            Manage your venues, events, and promotions
          </p>
        </div>
        <Link href="/club-owner/venues/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Venue
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ClubOwnerVenueTable venues={result.data} />
      </Suspense>
    </div>
  );
}