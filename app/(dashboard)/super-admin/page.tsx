import { Suspense } from 'react'
import { getSystemAnalytics, getSystemMetrics } from '@/lib/actions/analytics'
import { MetricsDashboard } from '@/components/analytics/metrics-dashboard'
import { AnalyticsLineChart, MultiLineChart } from '@/components/analytics/chart-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

async function SystemAnalyticsContent() {
  try {
    const [metrics, analytics] = await Promise.all([
      getSystemMetrics(),
      getSystemAnalytics()
    ])

    // Transform analytics data for charts
    const chartData = analytics.map(item => ({
      date: item.date,
      total_users: item.total_users,
      active_users: item.active_users,
      new_users: item.new_users,
      total_venues: item.total_venues,
      active_venues: item.active_venues,
      total_events: item.total_events,
      total_interactions: item.total_interactions
    })).reverse() // Reverse to show chronological order

    return (
      <div className="space-y-6">
        {/* Metrics Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          <MetricsDashboard metrics={metrics} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <MultiLineChart
            data={chartData}
            title="User Growth"
            description="Total and active users over time"
            lines={[
              { dataKey: 'total_users', name: 'Total Users', color: '#8884d8' },
              { dataKey: 'active_users', name: 'Active Users', color: '#82ca9d' },
              { dataKey: 'new_users', name: 'New Users', color: '#ffc658' }
            ]}
          />

          <MultiLineChart
            data={chartData}
            title="Venue Growth"
            description="Total and active venues over time"
            lines={[
              { dataKey: 'total_venues', name: 'Total Venues', color: '#8884d8' },
              { dataKey: 'active_venues', name: 'Active Venues', color: '#82ca9d' }
            ]}
          />

          <AnalyticsLineChart
            data={chartData}
            title="Events"
            description="Total active events over time"
            dataKey="total_events"
            color="#ff7300"
          />

          <AnalyticsLineChart
            data={chartData}
            title="User Interactions"
            description="Total platform interactions over time"
            dataKey="total_interactions"
            color="#00ff00"
          />
        </div>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics[0]?.new_users || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">New Users Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics[0]?.active_venues || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Venues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics[0]?.total_events || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics[0]?.total_interactions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Daily Interactions</div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No analytics data available yet.
              </p>
            )}
          </CardContent>
        </Card>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
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