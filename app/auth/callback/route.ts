import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/permissions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Get user role and redirect to appropriate dashboard
      try {
        const userRole = await getUserRole(data.user.id)
        
        if (userRole) {
          let redirectPath = '/dashboard'
          
          switch (userRole) {
            case 'super_admin':
              redirectPath = '/super-admin'
              break
            case 'admin':
              redirectPath = '/admin'
              break
            case 'club_owner':
              redirectPath = '/club-owner'
              break
          }
          
          return NextResponse.redirect(`${origin}${redirectPath}`)
        } else {
          // User doesn't have a role assigned yet
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      } catch (roleError) {
        console.error('Error getting user role:', roleError)
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}