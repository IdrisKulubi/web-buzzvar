import { Suspense } from "react";
import { getAdminUsers } from "@/lib/actions/admin-users";
import { AdminUserTable } from "@/components/admin-users/admin-user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Shield, ShieldCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function AdminUsersContent() {
  const result = await getAdminUsers();
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load admin users</p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  const adminUsers = result.data;

  // Calculate stats
  const stats = {
    total: adminUsers.length,
    admins: adminUsers.filter(u => u.role === 'admin').length,
    moderators: adminUsers.filter(u => u.role === 'moderator').length,
    active: adminUsers.filter(u => u.user.is_active).length,
    inactive: adminUsers.filter(u => !u.user.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.moderators}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.moderators / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <div className="h-4 w-4 bg-gray-400 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users ({adminUsers.length})</CardTitle>
          <CardDescription>
            Manage admin users, their roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUserTable 
            adminUsers={adminUsers} 
            currentUserId={currentUser?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin User Management</h1>
          <p className="text-muted-foreground">
            Create and manage admin users with specific roles and permissions
          </p>
        </div>
        <Link href="/super-admin/admin-users/create">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin User
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <AdminUsersContent />
      </Suspense>
    </div>
  );
}