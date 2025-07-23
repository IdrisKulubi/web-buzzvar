import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Building, Calendar, Activity } from 'lucide-react'
import { SystemMetrics } from '@/lib/actions/analytics'

interface MetricCardProps {
  title: string
  value: number
  description?: string
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
}

function MetricCard({ title, value, description, icon, trend, trendLabel }: MetricCardProps) {
  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`
    }
    return val.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center pt-1">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : null}
            <span className={`text-xs ml-1 ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}% {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricsDashboardProps {
  metrics: SystemMetrics
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total Users"
        value={metrics.totalUsers}
        description="All registered users"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        trend={metrics.userGrowthRate}
        trendLabel="from last month"
      />
      
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers}
        description="Currently active users"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
      
      <MetricCard
        title="Total Venues"
        value={metrics.totalVenues}
        description="All registered venues"
        icon={<Building className="h-4 w-4 text-muted-foreground" />}
        trend={metrics.venueGrowthRate}
        trendLabel="from last month"
      />
      
      <MetricCard
        title="Active Venues"
        value={metrics.activeVenues}
        description="Currently active venues"
        icon={<Building className="h-4 w-4 text-muted-foreground" />}
      />
      
      <MetricCard
        title="Total Events"
        value={metrics.totalEvents}
        description="Active events"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
      
      <MetricCard
        title="User Interactions"
        value={metrics.totalInteractions}
        description="Total platform interactions"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}