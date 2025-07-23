import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/permissions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  const userRole = await getUserRole(user.id)
  
  // Redirect to appropriate dashboard based on role
  if (userRole) {
    switch (userRole) {
      case 'super_admin':
        redirect('/super-admin')
      case 'admin':
        redirect('/admin')
      case 'club_owner':
        redirect('/club-owner')
    }
  }
  
  // If no role is assigned, show unauthorized message
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Access Pending</CardTitle>
          <CardDescription>
            Your account is set up but needs role assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contact your administrator to get the appropriate role assigned to access 
            dashboard features.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Account:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for role assignment...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}