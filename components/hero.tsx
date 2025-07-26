import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          BuzzVar
        </h1>

        <h2 className="text-4xl lg:text-6xl font-bold !leading-tight mx-auto max-w-4xl">
          Manage Your Venues & Events
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Like Never Before
          </span>
        </h2>

        <p className="text-xl text-muted-foreground mx-auto max-w-2xl">
          Complete venue management platform for club owners, administrators, and super admins. Streamline operations,
          boost engagement, and grow your business.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        <Card className="border-2 hover:border-blue-200 transition-colors">
          <CardHeader>
            <CardTitle>Venue Management</CardTitle>
            <CardDescription>
              Complete venue lifecycle management with verification, analytics, and optimization tools.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle>Event Planning</CardTitle>
            <CardDescription>
              Streamlined event creation, scheduling, and promotion management with real-time updates.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-green-200 transition-colors">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Role-based access control with comprehensive user administration and permissions.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-orange-200 transition-colors">
          <CardHeader>
            <CardTitle>Analytics & Insights</CardTitle>
            <CardDescription>
              Detailed analytics dashboard with performance metrics and business intelligence.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-red-200 transition-colors">
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>
              Advanced moderation tools with automated reporting and review management systems.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-yellow-200 transition-colors">
          <CardHeader>
            <CardTitle>Review System</CardTitle>
            <CardDescription>
              Comprehensive review management with analytics and customer feedback insights.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Role-based Access */}
      <div className="w-full max-w-4xl mt-16">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-4">Built for Every Role</h3>
          <p className="text-muted-foreground">
            Tailored experiences for different user types with appropriate access levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mx-auto mb-2">
                Super Admin
              </Badge>
              <CardTitle className="text-lg">Full System Control</CardTitle>
              <CardDescription>
                Complete platform oversight with user management, venue verification, and system analytics
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mx-auto mb-2">
                Admin/Moderator
              </Badge>
              <CardTitle className="text-lg">Content & User Management</CardTitle>
              <CardDescription>
                Moderate content, manage users, handle reports, and oversee venue operations
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mx-auto mb-2">
                Club Owner
              </Badge>
              <CardTitle className="text-lg">Venue Operations</CardTitle>
              <CardDescription>
                Manage venues, create events, track analytics, and engage with customers
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  )
}
