"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser, updateAdminUser, AdminUserData } from "@/lib/actions/admin-users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Plus, Shield, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUserFormProps {
  adminUser?: AdminUserData;
  currentUserId: string;
  mode: "create" | "edit";
}

interface FormData {
  email: string;
  role: "admin" | "moderator";
  permissions: Record<string, boolean>;
}

const DEFAULT_PERMISSIONS = {
  "manage_users": false,
  "manage_venues": false,
  "manage_events": false,
  "manage_reports": false,
  "send_notifications": false,
  "view_analytics": false,
  "moderate_content": false,
  "manage_reviews": false,
};

const PERMISSION_DESCRIPTIONS = {
  "manage_users": "Create, edit, and manage user accounts",
  "manage_venues": "Verify, edit, and manage venue listings",
  "manage_events": "Moderate and manage venue events",
  "manage_reports": "Review and resolve user reports",
  "send_notifications": "Send notifications to users",
  "view_analytics": "Access system analytics and reports",
  "moderate_content": "Moderate user-generated content",
  "manage_reviews": "Moderate and manage venue reviews",
};

export function AdminUserForm({ adminUser, currentUserId, mode }: AdminUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: adminUser?.user.email || "",
    role: adminUser?.role === "super_admin" ? "admin" : (adminUser?.role as "admin" | "moderator") || "moderator",
    permissions: {
      ...DEFAULT_PERMISSIONS,
      ...(adminUser?.permissions as Record<string, boolean> || {}),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        const result = await createAdminUser(
          {
            email: formData.email,
            role: formData.role,
            permissions: formData.permissions,
          },
          currentUserId
        );

        if (result.success) {
          toast.success("Admin user created successfully");
          router.push("/super-admin/admin-users");
        } else {
          toast.error(result.error || "Failed to create admin user");
        }
      } else if (adminUser) {
        const result = await updateAdminUser(adminUser.id, {
          role: formData.role,
          permissions: formData.permissions,
        });

        if (result.success) {
          toast.success("Admin user updated successfully");
          router.push(`/super-admin/admin-users/${adminUser.id}`);
        } else {
          toast.error(result.error || "Failed to update admin user");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }));
  };

  const handleRoleChange = (role: "admin" | "moderator") => {
    // Set default permissions based on role
    const defaultPermissions = { ...DEFAULT_PERMISSIONS };
    
    if (role === "admin") {
      // Admins get more permissions by default
      defaultPermissions.manage_users = true;
      defaultPermissions.manage_venues = true;
      defaultPermissions.manage_events = true;
      defaultPermissions.manage_reports = true;
      defaultPermissions.view_analytics = true;
      defaultPermissions.moderate_content = true;
      defaultPermissions.manage_reviews = true;
    } else if (role === "moderator") {
      // Moderators get limited permissions
      defaultPermissions.manage_reports = true;
      defaultPermissions.moderate_content = true;
      defaultPermissions.manage_reviews = true;
    }

    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions,
    }));
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />;
  };

  const getEnabledPermissionsCount = () => {
    return Object.values(formData.permissions).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create Admin User" : "Edit Admin User"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create" 
              ? "Add a new admin user with specific roles and permissions"
              : "Update admin user roles and permissions"
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                {mode === "create" ? <Plus className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {mode === "create" ? "Create Admin" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                {mode === "create" 
                  ? "Enter the email address and role for the new admin user"
                  : "Update the role for this admin user"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "create" && (
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@example.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    If the user doesn't exist, a new account will be created
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="role">Admin Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Moderator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.role === "admin" 
                    ? "Admins have broader access to manage users, venues, and system features"
                    : "Moderators focus on content moderation and user reports"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Configure specific permissions for this admin user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(PERMISSION_DESCRIPTIONS).map(([permission, description]) => (
                  <div key={permission} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions[permission]}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission, checked as boolean)
                      }
                      disabled={loading}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={permission}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Role Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Role Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selected Role</Label>
                <div className="mt-1">
                  <Badge variant="default" className="flex items-center space-x-1 w-fit">
                    {getRoleIcon(formData.role)}
                    <span>{formData.role.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Active Permissions</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {getEnabledPermissionsCount()} of {Object.keys(DEFAULT_PERMISSIONS).length} permissions enabled
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Permissions List */}
          <Card>
            <CardHeader>
              <CardTitle>Enabled Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(formData.permissions)
                  .filter(([_, enabled]) => enabled)
                  .map(([permission]) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                {getEnabledPermissionsCount() === 0 && (
                  <p className="text-sm text-muted-foreground">No permissions enabled</p>
                )}
              </div>
            </CardContent>
          </Card>

          {mode === "create" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Account Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  If the email address doesn't exist in the system, a new user account will be created automatically.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}