// Simple test utilities for authentication
// This is not a full test suite, just basic validation functions

export function validateGoogleOAuthConfig(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured')
    return false
  }
  
  if (!clientId.includes('apps.googleusercontent.com')) {
    console.error('Invalid Google Client ID format')
    return false
  }
  
  if (!clientSecret.startsWith('GOCSPX-')) {
    console.error('Invalid Google Client Secret format')
    return false
  }
  
  return true
}

export function validateSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('Supabase configuration not found')
    return false
  }
  
  if (!url.includes('supabase.co')) {
    console.error('Invalid Supabase URL format')
    return false
  }
  
  return true
}

export function runAuthConfigValidation(): void {
  console.log('🔍 Validating authentication configuration...')
  
  const supabaseValid = validateSupabaseConfig()
  const googleValid = validateGoogleOAuthConfig()
  
  if (supabaseValid && googleValid) {
    console.log('✅ Authentication configuration is valid')
  } else {
    console.log('❌ Authentication configuration has issues')
  }
}