"use client";

import { useState, useEffect } from "react";
import { getUsers, UserData, UserFilters } from "@/lib/actions/users";
import { UserTable } from "@/components/users/user-table";
import { UserFiltersComponent } from "@/components/users/user-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Download } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  
  const pageSize = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUsers(currentPage, pageSize, filters);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleExportUsers = async () => {
    try {
      // This would typically call an export API endpoint
      toast.info("Export functionality coming soon");
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  const activeUsersCount = users.filter(user => user.is_active).length;
  const adminUsersCount = users.filter(user => user.admin_role).length;
  const clubOwnersCount = users.filter(user => user.venue_owner).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Admin roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Club Owners</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clubOwnersCount}</div>
            <p className="text-xs text-muted-foreground">
              Venue managers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UserFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {total > 0 && (
              <>Showing {users.length} of {total} users</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}