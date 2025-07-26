"use client";

import { useState, useEffect } from "react";
import { VenueData } from "@/lib/actions/venues";
import { VenueAnalyticsSummary, getVenueAnalytics } from "@/lib/actions/venue-analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Heart, 
  Bookmark, 
  Share, 
  MapPin, 
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface VenueAnalyticsDashboardProps {
  venueId: string;
  venue: VenueData;
  summary: VenueAnalyticsSummary | null;
  recentActivity: any[];
  topReviews: any[];
}

export function VenueAnalyticsDashboard({ 
  venueId, 
  venue, 
  summary, 
  recentActivity, 
  topReviews 
}: VenueAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("30");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadChartData = async (days: string) => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const result = await getVenueAnalytics(
        venueId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (result.success) {
        setChartData(result.data);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial chart data
  useEffect(() => {
    loadChartData(dateRange);
  }, [venueId]);

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'save': return <Bookmark className="h-4 w-4 text-blue-500" />;
      case 'share': return <Share className="h-4 w-4 text-green-500" />;
      case 'check_in': return <MapPin className="h-4 w-4 text-purple-500" />;
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'like': return 'liked your venue';
      case 'save': return 'saved your venue';
      case 'share': return 'shared your venue';
      case 'check_in': return 'checked in at your venue';
      case 'review': return 'reviewed your venue';
      default: return 'viewed your venue';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Venue Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{venue.name}</span>
            <Badge variant={venue.is_verified ? "default" : "secondary"}>
              {venue.is_verified ? "Verified" : "Pending"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {venue.address}, {venue.city}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Views</p>
                  <p className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <Eye className="h-4 w-4 text-muted-foreground mb-1" />
                  {formatChange(summary.viewsChange)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Likes</p>
                  <p className="text-2xl font-bold">{summary.totalLikes.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <Heart className="h-4 w-4 text-muted-foreground mb-1" />
                  {formatChange(summary.likesChange)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saves</p>
                  <p className="text-2xl font-bold">{summary.totalSaves.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <Bookmark className="h-4 w-4 text-muted-foreground mb-1" />
                  {formatChange(summary.savesChange)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">
                    {summary.averageRating ? summary.averageRating.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Star className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    {summary.totalReviews} reviews
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Views Over Time</CardTitle>
              <Select value={dateRange} onValueChange={(value) => {
                setDateRange(value);
                loadChartData(value);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                  />
                  <Bar dataKey="likes" fill="#ef4444" />
                  <Bar dataKey="saves" fill="#3b82f6" />
                  <Bar dataKey="shares" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
            <CardDescription>Distribution of user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary ? [
                      { name: 'Likes', value: summary.totalLikes, color: '#ef4444' },
                      { name: 'Saves', value: summary.totalSaves, color: '#3b82f6' },
                      { name: 'Shares', value: summary.totalShares, color: '#10b981' },
                      { name: 'Check-ins', value: summary.totalCheckIns, color: '#8b5cf6' }
                    ] : []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {summary && [
                      { name: 'Likes', value: summary.totalLikes, color: '#ef4444' },
                      { name: 'Saves', value: summary.totalSaves, color: '#3b82f6' },
                      { name: 'Shares', value: summary.totalShares, color: '#10b981' },
                      { name: 'Check-ins', value: summary.totalCheckIns, color: '#8b5cf6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions with your venue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user?.profile?.avatar_url} />
                      <AvatarFallback>
                        {activity.user?.profile?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.interaction_type)}
                        <p className="text-sm">
                          <span className="font-medium">
                            {activity.user?.profile?.first_name || 'Someone'}
                          </span>{' '}
                          {getActivityText(activity.interaction_type)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              Latest reviews from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReviews.length > 0 ? (
                topReviews.map((review, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={review.user?.profile?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {review.user?.profile?.first_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {review.user?.profile?.first_name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">
                        "{review.comment}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reviews yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered insights to help improve your venue performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary && (
              <>
                {summary.viewsChange > 10 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Great Growth!</p>
                      <p className="text-sm text-green-700">
                        Your venue views increased by {summary.viewsChange.toFixed(1)}% compared to last month. Keep up the great work!
                      </p>
                    </div>
                  </div>
                )}

                {summary.likesChange < -5 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Engagement Opportunity</p>
                      <p className="text-sm text-yellow-700">
                        Likes decreased by {Math.abs(summary.likesChange).toFixed(1)}%. Consider posting more engaging content or running promotions.
                      </p>
                    </div>
                  </div>
                )}

                {summary.averageRating && summary.averageRating < 4.0 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Improve Customer Experience</p>
                      <p className="text-sm text-red-700">
                        Your average rating is {summary.averageRating.toFixed(1)}. Focus on addressing customer feedback to improve satisfaction.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {!summary && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No analytics data available yet. Start promoting your venue to see insights here!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}