import { createClient } from '@/lib/supabase/server'
import { getUserRole, getUserRoleByEmail } from '@/lib/utils/permissions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Building2, Users, Mail } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  // Check role by email first (for super admin and admin)
  const emailRole = await getUserRoleByEmail(user.email || '')
  const userRole = emailRole || await getUserRole(user.id)
  
  // Redirect to appropriate dashboard based on role
  if (userRole) {
    switch (userRole) {
      case 'super_admin':
        redirect('/super-admin')
      case 'admin':
      case 'moderator':
        redirect('/admin')
      case 'club_owner':
        redirect('/club-owner')
    }
  }
  
  // If no role is assigned, show role assignment information
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to BuzzVar</h1>
        <p className="text-muted-foreground">Your account is ready, but needs role assignment</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Assignment Required
          </CardTitle>
          <CardDescription>
            Your account needs to be assigned a role to access dashboard features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Account Information</span>
            </div>
            <p className="text-sm">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Account created successfully, waiting for role assignment
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Available Roles:</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Super Admin</p>
                    <p className="text-sm text-muted-foreground">Full system control and oversight</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Email-based
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Admin/Moderator</p>
                    <p className="text-sm text-muted-foreground">Content moderation and user management</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Email-based
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Club Owner</p>
                    <p className="text-sm text-muted-foreground">Venue and event management</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Admin assigned
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Next Steps:</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Super Admin and Admin roles are assigned based on email configuration</li>
              <li>• Club Owner roles are assigned by administrators</li>
              <li>• Contact support if you believe you should have access</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="mailto:support@buzzvar.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}