"use client";

import { useState } from "react";
import { AdminUserData, toggleAdminUserStatus, deleteAdminUser } from "@/lib/actions/admin-users";
import { DataTable, Column } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Eye, 
  UserCheck, 
  UserX, 
  Trash2,
  Shield,
  ShieldCheck,
  Edit
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminUserTableProps {
  adminUsers: AdminUserData[];
  loading?: boolean;
  error?: string;
  currentUserId?: string;
}

export function AdminUserTable({ adminUsers, loading, error, currentUserId }: AdminUserTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleStatus = async (adminUserId: string, currentStatus: boolean) => {
    setActionLoading(adminUserId);
    try {
      const result = await toggleAdminUserStatus(adminUserId, !currentStatus);
      if (result.success) {
        toast.success(`Admin user ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update admin user status");
      }
    } catch (error) {
      toast.error("An error occurred while updating admin user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAdminUser = async (adminUserId: string) => {
    if (!confirm("Are you sure you want to remove admin privileges from this user? This action cannot be undone.")) {
      return;
    }

    setActionLoading(adminUserId);
    try {
      const result = await deleteAdminUser(adminUserId);
      if (result.success) {
        toast.success("Admin user removed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove admin user");
      }
    } catch (error) {
      toast.error("An error occurred while removing admin user");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <ShieldCheck className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "moderator":
        return <Shield className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getInitials = (adminUser: AdminUserData): string => {
    const profile = adminUser.user.profile;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return adminUser.user.email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (adminUser: AdminUserData): string => {
    const profile = adminUser.user.profile;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return adminUser.user.email;
  };

  const getCreatedByName = (adminUser: AdminUserData): string => {
    if (!adminUser.created_by_user) return "System";
    
    const profile = adminUser.created_by_user.profile;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return adminUser.created_by_user.email;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isCurrentUser = (adminUser: AdminUserData): boolean => {
    return adminUser.user.id === currentUserId;
  };

  const columns: Column<AdminUserData>[] = [
    {
      key: "user",
      title: "Admin User",
      render: (_, adminUser) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={adminUser.user.profile?.avatar_url} alt={adminUser.user.email} />
            <AvatarFallback className="text-xs">
              {getInitials(adminUser)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center space-x-2">
              <span>{getDisplayName(adminUser)}</span>
              {isCurrentUser(adminUser) && (
                <Badge variant="outline" className="text-xs">You</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {adminUser.user.profile?.username ? `@${adminUser.user.profile.username}` : adminUser.user.email}
            </div>
          </div>
        </div>
      ),
      width: "300px",
    },
    {
      key: "role",
      title: "Role",
      render: (_, adminUser) => (
        <Badge variant={getRoleBadgeVariant(adminUser.role)} className="flex items-center space-x-1 w-fit">
          {getRoleIcon(adminUser.role)}
          <span>{adminUser.role.replace('_', ' ').toUpperCase()}</span>
        </Badge>
      ),
      width: "120px",
    },
    {
      key: "status",
      title: "Status",
      render: (_, adminUser) => (
        <Badge variant={adminUser.user.is_active ? "default" : "secondary"}>
          {adminUser.user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      width: "100px",
    },
    {
      key: "created_by",
      title: "Created By",
      render: (_, adminUser) => (
        <div className="text-sm">
          {getCreatedByName(adminUser)}
        </div>
      ),
      width: "150px",
    },
    {
      key: "created_at",
      title: "Created",
      render: (_, adminUser) => formatDate(adminUser.created_at),
      sortable: true,
      width: "120px",
    },
    {
      key: "last_login",
      title: "Last Login",
      render: (_, adminUser) => 
        adminUser.user.last_login ? formatDate(adminUser.user.last_login) : "Never",
      width: "120px",
    },
    {
      key: "permissions",
      title: "Permissions",
      render: (_, adminUser) => {
        const permissionCount = adminUser.permissions ? Object.keys(adminUser.permissions).length : 0;
        return (
          <div className="text-sm text-muted-foreground">
            {permissionCount > 0 ? `${permissionCount} custom` : "Default"}
          </div>
        );
      },
      width: "120px",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, adminUser) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              disabled={actionLoading === adminUser.id}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/super-admin/admin-users/${adminUser.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/super-admin/admin-users/${adminUser.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleToggleStatus(adminUser.id, adminUser.user.is_active)}
              disabled={actionLoading === adminUser.id || isCurrentUser(adminUser)}
            >
              {adminUser.user.is_active ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteAdminUser(adminUser.id)}
              disabled={actionLoading === adminUser.id || isCurrentUser(adminUser)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "80px",
    },
  ];

  return (
    <DataTable
      data={adminUsers}
      columns={columns}
      loading={loading}
      error={error}
      searchable={true}
      searchPlaceholder="Search admin users by name, email, or role..."
      filterable={true}
      filterOptions={[
        { value: "admin", label: "Admins Only" },
        { value: "moderator", label: "Moderators Only" },
        { value: "active", label: "Active Only" },
        { value: "inactive", label: "Inactive Only" },
      ]}
      onFilterChange={(filter) => {
        // This would be handled by the parent component
        console.log("Filter changed:", filter);
      }}
      emptyMessage="No admin users found"
      onRowClick={(adminUser) => router.push(`/super-admin/admin-users/${adminUser.id}`)}
    />
  );
}