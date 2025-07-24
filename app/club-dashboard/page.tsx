import { createClient } from '@/lib/supabase/server'
import { getUserRole, getRoleDisplayName, getRoleColor } from '@/lib/utils/permissions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Calendar, 
  BarChart3, 
  Star, 
  Image,
  Plus,
  Eye,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default async function ClubOwnerDashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  const userRole = await getUserRole(user.id)
  
  if (!userRole || !['super_admin', 'club_owner'].includes(userRole)) {
    redirect('/unauthorized')
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Club Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your venues and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getRoleColor(userRole)}>
            {getRoleDisplayName(userRole)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Venues</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Active venues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              4.2 average rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,341</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Venue Management</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                My Venues
              </CardTitle>
              <CardDescription>
                Manage your venue listings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add New Venue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                View All Venues
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Management
              </CardTitle>
              <CardDescription>
                Upload and manage venue images and media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Image className="mr-2 h-4 w-4" />
                Manage Images
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Upload New Media
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Events & Analytics</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Management
              </CardTitle>
              <CardDescription>
                Create and manage events for your venues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View All Events
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                Track performance and customer engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Customer Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
          <CardDescription>
            Latest customer feedback for your venues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Great atmosphere and service!</p>
                <p className="text-sm text-muted-foreground">Downtown Club - 5 stars</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-3 w-3" />
                View
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Amazing venue for events</p>
                <p className="text-sm text-muted-foreground">Rooftop Lounge - 4 stars</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-3 w-3" />
                View
              </Button>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Star className="mr-2 h-4 w-4" />
            View All Reviews
          </Button>
        </CardContent>
      </Card>

      {/* Access Note for Super Admin */}
      {userRole === 'super_admin' && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">Super Admin Access</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              You are viewing the Club Owner dashboard as a Super Admin. You have full access to all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/super-dashboard">
                <Shield className="mr-2 h-4 w-4" />
                Return to Super Admin Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}