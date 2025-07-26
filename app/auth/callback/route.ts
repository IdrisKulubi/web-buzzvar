import { createClient } from '@/lib/supabase/server'
import { getUserRoleByEmail } from '@/lib/utils/permissions'
import { checkUserProfile, ensureUserExists } from '@/lib/actions/profile'
import { checkIfUserIsVenueOwner } from '@/lib/utils/check-venue-owner'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_code = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('Auth callback called with:', { code: !!code, error_code, error_description })

  // Handle OAuth errors
  if (error_code) {
    console.error('OAuth error:', { error_code, error_description })
    return NextResponse.redirect(`${origin}/auth/error?error=${error_code}&description=${error_description}`)
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth/error?error=exchange_failed`)
      }

      if (data.user) {
        console.log('User authenticated:', data.user.email)
        
        // Ensure user exists in our database first
        try {
          console.log('Ensuring user exists in database...')
          await ensureUserExists()
          
          console.log('Checking user profile...')
          const profileResult = await checkUserProfile()
          
          if (profileResult.success) {
            // Get user role based on email
            console.log('Getting user role...')
            const userRole = await getUserRoleByEmail(data.user.email || '')
            console.log('User role:', userRole)
            
            // Also check if user is a venue owner directly
            const isVenueOwner = await checkIfUserIsVenueOwner(data.user.id)
            console.log('Is venue owner:', isVenueOwner)
            
            let redirectPath = '/venue-setup' // Default for users with no role
            
            if (userRole) {
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
                default:
                  redirectPath = '/venue-setup' // Users with no role want to be venue owners
              }
            } else if (isVenueOwner || profileResult.data.isVenueOwner) {
              // User is a venue owner
              redirectPath = '/club-owner'
            }
            
            console.log('Redirecting to:', redirectPath)
            return NextResponse.redirect(`${origin}${redirectPath}`)
          } else {
            console.error('Error checking profile:', profileResult.error)
            return NextResponse.redirect(`${origin}/venue-setup`)
          }
        } catch (profileError) {
          console.error('Error in profile handling:', profileError)
          return NextResponse.redirect(`${origin}/venue-setup`)
        }
      } else {
        console.error('No user data received after code exchange')
        return NextResponse.redirect(`${origin}/auth/error?error=no_user_data`)
      }
    } catch (exchangeError) {
      console.error('Unexpected error during code exchange:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/error?error=unexpected_error`)
    }
  }

  console.log('No code provided to auth callback')
  return NextResponse.redirect(`${origin}/auth/error?error=no_code`)
}