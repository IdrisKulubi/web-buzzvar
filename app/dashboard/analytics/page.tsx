import { Suspense } from "react";
import { 
  getSystemMetrics, 
  getUserGrowthData, 
  getVenueActivityData, 
  getInteractionData, 
  getTopVenues 
} from "@/lib/actions/analytics";
import { SystemMetricsCards } from "@/components/analytics/system-metrics-cards";
import { UserGrowthChart } from "@/components/analytics/user-growth-chart";
import { VenueActivityChart } from "@/components/analytics/venue-activity-chart";
import { InteractionChart } from "@/components/analytics/interaction-chart";
import { TopVenuesTable } from "@/components/analytics/top-venues-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Loading components
function MetricsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

async function SystemMetricsSection() {
  const metrics = await getSystemMetrics();
  return <SystemMetricsCards metrics={metrics} />;
}

async function UserGrowthSection() {
  const data = await getUserGrowthData(30);
  return <UserGrowthChart data={data} />;
}

async function VenueActivitySection() {
  const data = await getVenueActivityData(30);
  return <VenueActivityChart data={data} />;
}

async function InteractionSection() {
  const data = await getInteractionData(30);
  return <InteractionChart data={data} />;
}

async function TopVenuesSection() {
  const venues = await getTopVenues(10);
  return <TopVenuesTable venues={venues} />;
}

export default function SystemAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Analytics</h2>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Real-time platform insights and metrics
          </p>
        </div>
      </div>

      {/* System Metrics Cards */}
      <Suspense fallback={<MetricsCardsSkeleton />}>
        <SystemMetricsSection />
      </Suspense>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <UserGrowthSection />
        </Suspense>
        
        <Suspense fallback={<ChartSkeleton />}>
          <VenueActivitySection />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Suspense fallback={<ChartSkeleton />}>
          <InteractionSection />
        </Suspense>
      </div>

      {/* Top Venues Table */}
      <Suspense fallback={<ChartSkeleton />}>
        <TopVenuesSection />
      </Suspense>
    </div>
  );
}