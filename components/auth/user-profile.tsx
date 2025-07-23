import { getCurrentUser, getUserRole } from '@/lib/utils/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export async function UserProfile() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }
  
  const role = await getUserRole(user.id)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <p className="text-sm">{user.email}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="text-sm">{user.user_metadata?.full_name || 'Not provided'}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Role</label>
          <div className="mt-1">
            {role ? (
              <Badge variant="secondary">
                {role.replace('_', ' ').toUpperCase()}
              </Badge>
            ) : (
              <Badge variant="outline">No role assigned</Badge>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
          <p className="text-sm">
            {user.last_sign_in_at 
              ? new Date(user.last_sign_in_at).toLocaleDateString()
              : 'Never'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}