"use client";

import { useState } from "react";
import { UserData, toggleUserStatus, deleteUser } from "@/lib/actions/users";
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
import { MoreHorizontal, Eye, UserCheck, UserX, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserTableProps {
  users: UserData[];
  loading?: boolean;
  error?: string;
}

export function UserTable({ users, loading, error }: UserTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      const result = await toggleUserStatus(userId, !currentStatus);
      if (result.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update user status");
      }
    } catch (error) {
      toast.error("An error occurred while updating user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setActionLoading(userId);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success("User deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting user");
    } finally {
      setActionLoading(null);
    }
  };

  const getUserRole = (user: UserData): string => {
    if (user.admin_role) {
      return user.admin_role.role.replace('_', ' ').toUpperCase();
    }
    if (user.venue_owner) {
      return "CLUB OWNER";
    }
    return "USER";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER ADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      case "MODERATOR":
        return "secondary";
      case "CLUB OWNER":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getInitials = (user: UserData): string => {
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: Column<UserData>[] = [
    {
      key: "user",
      title: "User",
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profile?.avatar_url} alt={user.email} />
            <AvatarFallback className="text-xs">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.profile?.first_name && user.profile?.last_name
                ? `${user.profile.first_name} ${user.profile.last_name}`
                : user.email}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.profile?.username ? `@${user.profile.username}` : user.email}
            </div>
          </div>
        </div>
      ),
      width: "300px",
    },
    {
      key: "role",
      title: "Role",
      render: (_, user) => {
        const role = getUserRole(user);
        return (
          <Badge variant={getRoleBadgeVariant(role)}>
            {role}
          </Badge>
        );
      },
      width: "120px",
    },
    {
      key: "status",
      title: "Status",
      render: (_, user) => (
        <Badge variant={user.is_active ? "default" : "secondary"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      width: "100px",
    },
    {
      key: "auth_provider",
      title: "Auth Provider",
      render: (_, user) => (
        <Badge variant="outline">
          {user.auth_provider.toUpperCase()}
        </Badge>
      ),
      width: "120px",
    },
    {
      key: "created_at",
      title: "Joined",
      render: (_, user) => formatDate(user.created_at),
      sortable: true,
      width: "120px",
    },
    {
      key: "last_login",
      title: "Last Login",
      render: (_, user) => 
        user.last_login ? formatDate(user.last_login) : "Never",
      width: "120px",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              disabled={actionLoading === user.id}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/super-admin/users/${user.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleToggleStatus(user.id, user.is_active)}
              disabled={actionLoading === user.id}
            >
              {user.is_active ? (
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
              onClick={() => handleDeleteUser(user.id)}
              disabled={actionLoading === user.id}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "80px",
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      error={error}
      searchable={true}
      searchPlaceholder="Search users by name, email, or username..."
      emptyMessage="No users found"
      onRowClick={(user) => router.push(`/super-admin/users/${user.id}`)}
    />
  );
}