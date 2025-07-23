"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { VenueActivityData } from "@/lib/actions/analytics";

interface VenueActivityChartProps {
  data: VenueActivityData[];
}

export function VenueActivityChart({ data }: VenueActivityChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Activity</CardTitle>
        <CardDescription>
          Monitor venue registrations and activity levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="totalVenues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="activeVenues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="newVenues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                labelFormatter={(value) => formatTooltipDate(value as string)}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === "totalVenues" ? "Total Venues" :
                  name === "activeVenues" ? "Active Venues" :
                  name === "newVenues" ? "New Venues" : name
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalVenues"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="url(#totalVenues)"
                name="Total Venues"
              />
              <Area
                type="monotone"
                dataKey="activeVenues"
                stackId="2"
                stroke="hsl(var(--chart-2))"
                fill="url(#activeVenues)"
                name="Active Venues"
              />
              <Area
                type="monotone"
                dataKey="newVenues"
                stackId="3"
                stroke="hsl(var(--chart-3))"
                fill="url(#newVenues)"
                name="New Venues"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}