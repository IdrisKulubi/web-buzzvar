import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, Activity, MessageSquare, Eye, Heart, TrendingUp } from "lucide-react";
import { SystemMetrics } from "@/lib/actions/analytics";

interface SystemMetricsCardsProps {
  metrics: SystemMetrics;
}

export function SystemMetricsCards({ metrics }: SystemMetricsCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      description: `${metrics.activeUsers} active users`,
      trend: metrics.newUsers > 0 ? `+${metrics.newUsers} new` : "No new users",
    },
    {
      title: "Total Venues",
      value: metrics.totalVenues.toLocaleString(),
      icon: Building2,
      description: `${metrics.activeVenues} active venues`,
      trend: `${((metrics.activeVenues / metrics.totalVenues) * 100).toFixed(1)}% active`,
    },
    {
      title: "Total Events",
      value: metrics.totalEvents.toLocaleString(),
      icon: Calendar,
      description: "All time events",
      trend: "Events created",
    },
    {
      title: "User Interactions",
      value: metrics.totalInteractions.toLocaleString(),
      icon: Activity,
      description: "Likes, saves, shares",
      trend: "Total engagement",
    },
    {
      title: "Reviews",
      value: metrics.totalReviews.toLocaleString(),
      icon: MessageSquare,
      description: "User reviews",
      trend: "Community feedback",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              <p className="text-xs text-green-600 mt-1">{card.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}