import { createClient } from '@/lib/supabase/server'
import { getUserRole, getRoleDisplayName, getRoleColor } from '@/lib/utils/permissions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  Calendar, 
  BarChart3, 
  Shield, 
  Settings,
  Eye,
  UserCheck,
  MapPin,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  const userRole = await getUserRole(user.id)
  
  if (userRole !== 'super_admin') {
    redirect('/unauthorized')
  }

  // Get some basic stats
  const [
    { count: totalUsers },
    { count: totalVenues },
    { count: totalEvents },
    { count: totalAdmins }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    // admin_users table doesn't exist, so return 0 count
    Promise.resolve({ count: 0 })
  ])

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system oversight and management</p>
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVenues || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active venues on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Events created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Administrative accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Management */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">System Management</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage all platform users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/super-admin/users">
                  <UserCheck className="mr-2 h-4 w-4" />
                  View All Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/super-admin/admin-users">
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Admin Users
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Venue Management
              </CardTitle>
              <CardDescription>
                Oversee venue verification, activation, and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/super-admin/venues">
                  <MapPin className="mr-2 h-4 w-4" />
                  All Venues
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/super-admin/venues/pending">
                  <Eye className="mr-2 h-4 w-4" />
                  Pending Verification
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & Monitoring */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Analytics & Monitoring</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Analytics
              </CardTitle>
              <CardDescription>
                Platform performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/super-admin/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/super-admin/reports">
                  <Activity className="mr-2 h-4 w-4" />
                  System Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Platform settings and configuration management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/super-admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role-based Access Preview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Access Other Dashboards</h2>
        <p className="text-muted-foreground">
          As Super Admin, you can access all dashboard areas to understand different user experiences
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="h-5 w-5" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Content moderation and user management interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <Eye className="mr-2 h-4 w-4" />
                  View Admin Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Building2 className="h-5 w-5" />
                Club Owner Dashboard
              </CardTitle>
              <CardDescription>
                Venue management and event creation interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/club-dashboard">
                  <Eye className="mr-2 h-4 w-4" />
                  View Club Owner Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Star className="h-5 w-5" />
                Public Interface
              </CardTitle>
              <CardDescription>
                Customer-facing venue and event discovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/venues">
                  <Eye className="mr-2 h-4 w-4" />
                  View Public Interface
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}