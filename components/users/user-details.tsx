"use client";

import { useState } from "react";
import { UserData, toggleUserStatus, deleteUser } from "@/lib/actions/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Building2,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserDetailsContentProps {
  user: UserData;
}

export function UserDetailsContent({ user }: UserDetailsContentProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const result = await toggleUserStatus(user.id, !user.is_active);
      if (result.success) {
        toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update user status");
      }
    } catch (error) {
      toast.error("An error occurred while updating user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast.success("User deleted successfully");
        router.push("/super-admin/users");
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting user");
    } finally {
      setActionLoading(false);
    }
  };

  const getUserRole = (): string => {
    if (user.admin_role) {
      return user.admin_role.replace('_', ' ').toUpperCase();
    }
    if (user.venue_owner) {
      return "CLUB OWNER";
    }
    return "USER";
  };

  const getBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER ADMIN":
        return "destructive";
      case "ADMIN":
      case "MODERATOR":
        return "default";
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
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const role = getUserRole();

  return (
    <div className="space-y-6">
      {/* User Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profile?.avatar_url} alt={`${user.email} /`} />
                <AvatarFallback className="text-lg">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {user.profile?.first_name && user.profile?.last_name
                    ? `${user.profile.first_name} ${user.profile.last_name}`
                    : user.profile?.username
                    ? `@${user.profile.username}`
                    : user.email}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user.profile?.username ? `@${user.profile.username}` : user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getBadgeVariant(role)}>
                {role}
              </Badge>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">
                {user.auth_provider.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            {user.phone && (
              <div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {user.profile?.date_of_birth && (
              <div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.profile.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(user.profile?.location_city || user.profile?.location_country) && (
              <div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {[user.profile?.location_city, user.profile?.location_country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.profile?.bio && (
              <div>
                <p className="text-sm font-medium mb-1">Bio</p>
                <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {user.auth_provider.charAt(0).toUpperCase() + user.auth_provider.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            {user.auth_provider_id && (
              <div>
                <div>
                  <p className="text-sm font-medium">Provider ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{user.auth_provider_id}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {user.last_login ? formatDate(user.last_login) : "Never"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        {(user.admin_role || user.venue_owner) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user.admin_role ? <Shield className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.admin_role && (
                <div>
                  <div>
                    <p className="text-sm font-medium">Admin Role</p>
                    <p className="text-sm text-muted-foreground">
                      {user.admin_role.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  {user.admin_role.permissions && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Permissions</p>
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded mt-1">
                        {JSON.stringify(user.admin_role.permissions, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {user.venue_owner && (
                <div>
                  <div>
                    <p className="text-sm font-medium">Venue Owner</p>
                    <p className="text-sm text-muted-foreground">
                      {user.venue_owner.role.charAt(0).toUpperCase() + user.venue_owner.role.slice(1)} - Manages {user.venue_count} venue(s)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </div>

            <div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={user.is_active ? "outline" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={actionLoading}
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
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteUser}
            disabled={actionLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}