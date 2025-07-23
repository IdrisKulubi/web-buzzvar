import { Suspense } from 'react'
import { 
  getSystemMetrics, 
  getUserGrowthData, 
  getVenueActivityData, 
  getInteractionData, 
  getTopVenues 
} from '@/lib/actions/analytics'
import { SystemMetricsCards } from '@/components/analytics/system-metrics-cards'
import { UserGrowthChart } from '@/components/analytics/user-growth-chart'
import { VenueActivityChart } from '@/components/analytics/venue-activity-chart'
import { InteractionChart } from '@/components/analytics/interaction-chart'
import { TopVenuesTable } from '@/components/analytics/top-venues-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function SystemAnalyticsContent() {
  try {
    const [metrics, userGrowth, venueActivity, interactions, topVenues] = await Promise.all([
      getSystemMetrics(),
      getUserGrowthData(30),
      getVenueActivityData(30),
      getInteractionData(30),
      getTopVenues(10)
    ])

    return (
      <div className="space-y-6">
        {/* Metrics Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          <SystemMetricsCards metrics={metrics} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <UserGrowthChart data={userGrowth} />
          <VenueActivityChart data={venueActivity} />
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <InteractionChart data={interactions} />
        </div>

        {/* Top Venues */}
        <TopVenuesTable venues={topVenues} />
      </div>
    )
  } catch (error) {
    console.error('Error loading system analytics:', error)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading system analytics</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">System Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System analytics and platform overview
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <SystemAnalyticsContent />
      </Suspense>
    </div>
  )
}