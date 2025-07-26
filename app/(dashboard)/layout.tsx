import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/utils/permissions';
import { redirect } from 'next/navigation';
import { ClubOwnerProvider } from '@/components/club-owner/club-owner-provider';
import { getClubOwnerVenues } from '@/lib/actions/venues';
import { DashboardLayoutClient } from './dashboard-layout-client';

async function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }
  
  const userRole = await getUserRole(user.id);
  
  if (!userRole) {
    redirect('/unauthorized');
  }

  let clubOwnerVenueId: string | null = null;
  if (userRole === 'club_owner') {
    const result = await getClubOwnerVenues();
    if (result.success && result.data.length > 0) {
      clubOwnerVenueId = result.data[0].id;
    }
  }

  return (
    <ClubOwnerProvider venueId={clubOwnerVenueId}>
      <DashboardLayoutClient user={user} userRole={userRole}>
        {children}
      </DashboardLayoutClient>
    </ClubOwnerProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}