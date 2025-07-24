import { getClubOwnerVenueById } from "@/lib/actions/venues";
import { getVenueAnalyticsSummary, getVenueRecentActivity, getVenueTopReviews, getVenuePerformanceMetrics } from "@/lib/actions/venue-analytics";
import { VenueAnalyticsDashboard } from "@/components/venues/venue-analytics-dashboard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface VenueAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default async function VenueAnalyticsPage({ params }: VenueAnalyticsPageProps) {
  const [venueResult, summaryResult, activityResult, reviewsResult, metricsResult] = await Promise.all([
    getClubOwnerVenueById(params.id),
    getVenueAnalyticsSummary(params.id),
    getVenueRecentActivity(params.id, 10),
    getVenueTopReviews(params.id, 5),
    getVenuePerformanceMetrics(params.id)
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
        
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Performance insights for {venueResult.data.name}
        </p>
      </div>

      <VenueAnalyticsDashboard 
        venueId={params.id}
        venue={venueResult.data}
        summary={summaryResult.success ? summaryResult.data : null}
        recentActivity={activityResult.success ? activityResult.data : []}
        topReviews={reviewsResult.success ? reviewsResult.data : []}
        performanceMetrics={metricsResult.success ? metricsResult.data : null}
      />
    </div>
  );
}