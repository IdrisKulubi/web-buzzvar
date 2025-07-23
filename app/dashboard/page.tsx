import { AuthGuard } from '@/components/auth/auth-guard'
import { UserProfile } from '@/components/auth/user-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <UserProfile />
          
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Your account is set up and ready to use for the test 
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to get the appropriate role assigned to access 
                additional features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}