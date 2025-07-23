// Simple validation script for authentication configuration
require('dotenv').config({ path: '.env.local' });

function validateGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error('❌ Google OAuth credentials not configured');
    return false;
  }
  
  if (!clientId.includes('apps.googleusercontent.com')) {
    console.error('❌ Invalid Google Client ID format');
    return false;
  }
  
  if (!clientSecret.startsWith('GOCSPX-')) {
    console.error('❌ Invalid Google Client Secret format');
    return false;
  }
  
  console.log('✅ Google OAuth configuration is valid');
  return true;
}

function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    console.error('❌ Supabase configuration not found');
    return false;
  }
  
  if (!url.includes('supabase.co')) {
    console.error('❌ Invalid Supabase URL format');
    return false;
  }
  
  console.log('✅ Supabase configuration is valid');
  return true;
}

console.log('🔍 Validating authentication configuration...\n');

const supabaseValid = validateSupabaseConfig();
const googleValid = validateGoogleOAuthConfig();

console.log('\n📋 Summary:');
if (supabaseValid && googleValid) {
  console.log('✅ All authentication configurations are valid');
  console.log('🚀 Ready to use Google OAuth with Supabase');
} else {
  console.log('❌ Some authentication configurations need attention');
}