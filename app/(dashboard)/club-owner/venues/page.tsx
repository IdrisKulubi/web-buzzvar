import { getClubOwnerVenues } from "@/lib/actions/venues";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from 'next/navigation';

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

  // If the owner has one or more venues, redirect to the first one's analytics page
  if (result.data && result.data.length > 0) {
    const venueId = result.data[0].id;
    redirect(`/club-owner/venues/${venueId}/analytics`);
  }

  // If the owner has no venues, show the creation page
  return (
    <div className="container mx-auto py-8 flex flex-col items-center justify-center text-center h-full">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Welcome, Club Owner!</h1>
        </div>
        <p className="text-muted-foreground mt-2 mb-8">
            You don&apos;t have a venue yet. Let&apos;s create one.
        </p>
        <Link href="/club-owner/venues/create">
            <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your Venue
            </Button>
        </Link>
    </div>
  );
}