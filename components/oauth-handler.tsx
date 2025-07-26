"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // If we have an OAuth code on the home page, redirect to the auth callback
      console.log('OAuth code detected on home page, redirecting to auth callback');
      router.replace(`/auth/callback?code=${code}`);
    }
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}