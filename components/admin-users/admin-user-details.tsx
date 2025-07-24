"use client";

import { useState } from "react";
import { AdminUserData, toggleAdminUserStatus, deleteAdminUser } from "@/lib/actions/admin-users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCheck,
  UserX,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Clock,
  MapPin,
  User,
  Settings,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminUserDetailsProps {
  adminUser: AdminUserData;
  currentUserId?: string;
}

export function AdminUserDetails({ adminUser: initialAdminUser, currentUserId }: AdminUserDetailsProps) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(initialAdminUser);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleStatus = async () => {
    setActionLoading("status");
    try {
      const result = await toggleAdminUserStatus(adminUser.id, !adminUser.user.is_active);
      if (result.success) {
        setAdminUser(prev => ({
          ...prev,
          user: {
            ...prev.user,
            is_active: !prev.user.is_active
          }
        }));
        toast.success(`Admin user ${!adminUser.user.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.error || "Failed to update admin user status");
      }
    } catch (error) {
      toast.error("An error occurred while updating admin user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAdminUser = async () => {
    if (!confirm("Are you sure you want to remove admin privileges from this user? This action cannot be undone.")) {
      return;
    }

    setActionLoading("delete");
    try {
      const result = await deleteAdminUser(adminUser.id);
      if (result.success) {
        toast.success("Admin user removed successfully");
        router.push("/super-admin/admin-users");
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
        return <ShieldCheck className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "moderator":
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getInitials = (): string => {
    const profile = adminUser.user.profile;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return adminUser.user.email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (): string => {
    const profile = adminUser.user.profile;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return adminUser.user.email;
  };

  const getCreatedByName = (): string => {
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isCurrentUser = (): boolean => {
    return adminUser.user.id === currentUserId;
  };

  const getPermissionsList = () => {
    if (!adminUser.permissions || Object.keys(adminUser.permissions).length === 0) {
      return ["Default permissions for " + adminUser.role];
    }
    
    return Object.entries(adminUser.permissions).map(([key, value]) => 
      `${key}: ${typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value)}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={adminUser.user.profile?.avatar_url} alt={adminUser.user.email} />
            <AvatarFallback className="text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
              {isCurrentUser() && (
                <Badge variant="outline">You</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getRoleBadgeVariant(adminUser.role)} className="flex items-center space-x-1">
                {getRoleIcon(adminUser.role)}
                <span>{adminUser.role.replace('_', ' ').toUpperCase()}</span>
              </Badge>
              <Badge variant={adminUser.user.is_active ? "default" : "secondary"}>
                {adminUser.user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/super-admin/admin-users/${adminUser.id}/edit`)}
            disabled={actionLoading !== null}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={adminUser.user.is_active ? "outline" : "default"}
            onClick={handleToggleStatus}
            disabled={actionLoading === "status" || isCurrentUser()}
          >
            {adminUser.user.is_active ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAdminUser}
            disabled={actionLoading === "delete" || isCurrentUser()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Admin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{adminUser.user.email}</span>
              </div>
              
              {adminUser.user.profile?.username && (
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <p className="text-sm text-muted-foreground mt-1">@{adminUser.user.profile.username}</p>
                </div>
              )}

              {adminUser.user.profile?.bio && (
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <p className="text-sm text-muted-foreground mt-1">{adminUser.user.profile.bio}</p>
                </div>
              )}

              {(adminUser.user.profile?.location_city || adminUser.user.profile?.location_country) && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {[adminUser.user.profile?.location_city, adminUser.user.profile?.location_country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Authentication Provider</label>
                <Badge variant="outline" className="mt-1">
                  {adminUser.user.auth_provider.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Permissions</span>
              </CardTitle>
              <CardDescription>
                Permissions and access controls for this admin user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getPermissionsList().map((permission, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin Details */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(adminUser.role)} className="flex items-center space-x-1 w-fit">
                    {getRoleIcon(adminUser.role)}
                    <span>{adminUser.role.replace('_', ' ').toUpperCase()}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  <Badge variant={adminUser.user.is_active ? "default" : "secondary"}>
                    {adminUser.user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Created By</label>
                <p className="text-sm text-muted-foreground mt-1">{getCreatedByName()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(adminUser.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Login</span>
                </div>
                <span className="text-sm font-medium">
                  {adminUser.user.last_login ? formatDate(adminUser.user.last_login) : "Never"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Account Created</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(adminUser.user.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Warning for Current User */}
          {isCurrentUser() && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  This is your own admin account. You cannot deactivate or remove your own admin privileges.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}