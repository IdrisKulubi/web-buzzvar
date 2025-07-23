import { Suspense } from "react";
import { getUserById, UserData } from "@/lib/actions/users";
import { UserDetailsContent } from "@/components/users/user-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface UserDetailsPageProps {
  params: {
    id: string;
  };
}

async function UserDetailsWrapper({ userId }: { userId: string }) {
  const user = await getUserById(userId);
  
  if (!user) {
    notFound();
  }

  return <UserDetailsContent user={user} />;
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted animate-pulse rounded" />
        <div>
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/super-admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">
            View and manage user information
          </p>
        </div>
      </div>

      {/* User Details */}
      <Suspense fallback={<UserDetailsSkeleton />}>
        <UserDetailsWrapper userId={params.id} />
      </Suspense>
    </div>
  );
}