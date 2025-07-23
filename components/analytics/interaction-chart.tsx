"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { InteractionData } from "@/lib/actions/analytics";

interface InteractionChartProps {
  data: InteractionData[];
}

export function InteractionChart({ data }: InteractionChartProps) {
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
        <CardTitle>User Engagement</CardTitle>
        <CardDescription>
          Daily user interactions across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  name === "likes" ? "Likes" :
                  name === "saves" ? "Saves" :
                  name === "shares" ? "Shares" :
                  name === "checkIns" ? "Check-ins" :
                  name === "reviews" ? "Reviews" : name
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Bar 
                dataKey="likes" 
                fill="hsl(var(--chart-1))" 
                name="Likes"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="saves" 
                fill="hsl(var(--chart-2))" 
                name="Saves"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="shares" 
                fill="hsl(var(--chart-3))" 
                name="Shares"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="checkIns" 
                fill="hsl(var(--chart-4))" 
                name="Check-ins"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="reviews" 
                fill="hsl(var(--chart-5))" 
                name="Reviews"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}