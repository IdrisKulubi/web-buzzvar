import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getAdminUserById } from "@/lib/actions/admin-users";
import { AdminUserForm } from "@/components/admin-users/admin-user-form";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface EditAdminUserPageProps {
  params: {
    id: string;
  };
}

async function EditAdminUserContent({ params }: EditAdminUserPageProps) {
  const result = await getAdminUserById(params.id);
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

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
    <AdminUserForm 
      adminUser={result.data}
      mode="edit" 
      currentUserId={currentUser.id}
    />
  );
}

export default function EditAdminUserPage({ params }: EditAdminUserPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/super-admin/admin-users/${params.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin User
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EditAdminUserContent params={params} />
      </Suspense>
    </div>
  );
}