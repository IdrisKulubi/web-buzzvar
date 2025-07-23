import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, Heart } from "lucide-react";
import { TopVenuesData } from "@/lib/actions/analytics";

interface TopVenuesTableProps {
  venues: TopVenuesData[];
}

export function TopVenuesTable({ venues }: TopVenuesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Venues</CardTitle>
        <CardDescription>
          Most popular venues based on views, likes, and ratings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {venues.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No venue data available
            </p>
          ) : (
            venues.map((venue, index) => (
              <div
                key={venue.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{venue.name}</h4>
                    <p className="text-sm text-muted-foreground">{venue.city}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{venue.totalViews.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{venue.totalLikes.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{venue.averageRating > 0 ? venue.averageRating.toFixed(1) : "N/A"}</span>
                    <span className="text-muted-foreground">
                      ({venue.reviewCount})
                    </span>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    Rank #{index + 1}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}