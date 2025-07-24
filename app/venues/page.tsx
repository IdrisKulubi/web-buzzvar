import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  MapPin, 
  Star, 
  Calendar,
  Users,
  Clock,
  Phone,
  Globe
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const venues = [
  {
    id: 1,
    name: "Downtown Club",
    description: "Premier nightclub in the heart of the city with state-of-the-art sound system",
    location: "123 Main St, Downtown",
    rating: 4.5,
    reviewCount: 142,
    capacity: 500,
    phone: "+1 (555) 123-4567",
    website: "www.downtownclub.com",
    image: "/api/placeholder/400/300",
    tags: ["Nightclub", "Dancing", "Live Music"],
    upcomingEvents: 3
  },
  {
    id: 2,
    name: "Rooftop Lounge",
    description: "Elegant rooftop venue with panoramic city views and craft cocktails",
    location: "456 High St, Uptown",
    rating: 4.8,
    reviewCount: 89,
    capacity: 200,
    phone: "+1 (555) 987-6543",
    website: "www.rooftoplounge.com",
    image: "/api/placeholder/400/300",
    tags: ["Lounge", "Cocktails", "City Views"],
    upcomingEvents: 5
  },
  {
    id: 3,
    name: "Garden Venue",
    description: "Beautiful outdoor venue perfect for weddings and private events",
    location: "789 Garden Ave, Suburbs",
    rating: 4.3,
    reviewCount: 67,
    capacity: 300,
    phone: "+1 (555) 456-7890",
    website: "www.gardenvenue.com",
    image: "/api/placeholder/400/300",
    tags: ["Outdoor", "Weddings", "Private Events"],
    upcomingEvents: 2
  }
]

export default function VenuesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Discover Venues</h1>
              <p className="text-muted-foreground mt-2">
                Find the perfect venue for your next event or night out
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Users className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild>
                <Link href="/venues/add">
                  <Building2 className="mr-2 h-4 w-4" />
                  List Your Venue
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
                {venue.upcomingEvents > 0 && (
                  <Badge className="absolute top-3 right-3 bg-blue-600">
                    {venue.upcomingEvents} Events
                  </Badge>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{venue.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({venue.reviewCount})
                    </span>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {venue.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {venue.capacity} people</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {venue.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/venues/${venue.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={`tel:${venue.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://${venue.website}`} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for More Venues */}
        <div className="mt-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">More venues coming soon!</h3>
          <p className="text-muted-foreground mb-4">
            We're constantly adding new venues to our platform
          </p>
          <Button asChild>
            <Link href="/venues/add">
              <Building2 className="mr-2 h-4 w-4" />
              List Your Venue
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}