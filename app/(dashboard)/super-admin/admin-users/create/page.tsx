import { Suspense } from "react";
import { AdminUserForm } from "@/components/admin-users/admin-user-form";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function CreateAdminUserContent() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  return (
    <AdminUserForm 
      mode="create" 
      currentUserId={currentUser.id}
    />
  );
}

export default function CreateAdminUserPage() {
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
        <CreateAdminUserContent />
      </Suspense>
    </div>
  );
}