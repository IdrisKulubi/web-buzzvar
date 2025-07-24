import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminUserById } from "@/lib/actions/admin-users";
import { AdminUserDetails } from "@/components/admin-users/admin-user-details";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface AdminUserDetailsPageProps {
  params: {
    id: string;
  };
}

async function AdminUserDetailsContent({ params }: AdminUserDetailsPageProps) {
  const result = await getAdminUserById(params.id);
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!result.success) {
    if (result.error === "Admin user not found") {
      notFound();
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load admin user</p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <AdminUserDetails 
      adminUser={result.data} 
      currentUserId={currentUser?.id}
    />
  );
}

export default function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/super-admin/admin-users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Users
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <AdminUserDetailsContent params={params} />
      </Suspense>
    </div>
  );
}