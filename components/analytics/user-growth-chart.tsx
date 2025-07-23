"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserGrowthData } from "@/lib/actions/analytics";

interface UserGrowthChartProps {
  data: UserGrowthData[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
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
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          Track total users, new registrations, and active users over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  name === "totalUsers" ? "Total Users" :
                  name === "newUsers" ? "New Users" :
                  name === "activeUsers" ? "Active Users" : name
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total Users"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Active Users"
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="New Users"
                dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}