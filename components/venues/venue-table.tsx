"use client";

import { useState } from "react";
import { VenueData, toggleVenueVerification, toggleVenueStatus, deleteVenue } from "@/lib/actions/venues";
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
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  Trash2,
  MapPin,
  Users,
  Calendar,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VenueTableProps {
  venues: VenueData[];
  loading?: boolean;
  error?: string;
}

export function VenueTable({ venues, loading, error }: VenueTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleVerification = async (venueId: string, currentStatus: boolean) => {
    setActionLoading(venueId);
    try {
      const result = await toggleVenueVerification(venueId, !currentStatus);
      if (result.success) {
        toast.success(`Venue ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update venue verification");
      }
    } catch (error) {
      toast.error("An error occurred while updating venue verification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (venueId: string, currentStatus: boolean) => {
    setActionLoading(venueId);
    try {
      const result = await toggleVenueStatus(venueId, !currentStatus);
      if (result.success) {
        toast.success(`Venue ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update venue status");
      }
    } catch (error) {
      toast.error("An error occurred while updating venue status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm("Are you sure you want to delete this venue? This action cannot be undone.")) {
      return;
    }

    setActionLoading(venueId);
    try {
      const result = await deleteVenue(venueId);
      if (result.success) {
        toast.success("Venue deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete venue");
      }
    } catch (error) {
      toast.error("An error occurred while deleting venue");
    } finally {
      setActionLoading(null);
    }
  };

  const getVenueTypeBadge = (type?: string) => {
    if (!type) return null;
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      nightclub: "destructive",
      bar: "default",
      restaurant: "secondary",
      lounge: "outline",
    };

    return (
      <Badge variant={variants[type] || "outline"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const getOwnerName = (venue: VenueData): string => {
    const owner = venue.venue_owners.find(vo => vo.role === 'owner');
    if (!owner) return "No owner";
    
    const profile = owner.user.profile;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return owner.user.email;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: Column<VenueData>[] = [
    {
      key: "venue",
      title: "Venue",
      render: (_, venue) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={venue.logo_url || venue.cover_image_url} alt={venue.name} />
            <AvatarFallback className="text-xs">
              {venue.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{venue.name}</div>
            <div className="text-sm text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {venue.city}, {venue.country}
            </div>
          </div>
        </div>
      ),
      width: "300px",
    },
    {
      key: "type",
      title: "Type",
      render: (_, venue) => getVenueTypeBadge(venue.venue_type),
      width: "120px",
    },
    {
      key: "owner",
      title: "Owner",
      render: (_, venue) => (
        <div className="text-sm">
          {getOwnerName(venue)}
        </div>
      ),
      width: "150px",
    },
    {
      key: "verification",
      title: "Verification",
      render: (_, venue) => (
        <Badge variant={venue.is_verified ? "default" : "secondary"}>
          {venue.is_verified ? "Verified" : "Unverified"}
        </Badge>
      ),
      width: "120px",
    },
    {
      key: "status",
      title: "Status",
      render: (_, venue) => (
        <Badge variant={venue.is_active ? "default" : "secondary"}>
          {venue.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      width: "100px",
    },
    {
      key: "stats",
      title: "Stats",
      render: (_, venue) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {venue._count?.events || 0} events
          </div>
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {venue._count?.reviews || 0} reviews
          </div>
        </div>
      ),
      width: "120px",
    },
    {
      key: "capacity",
      title: "Capacity",
      render: (_, venue) => (
        <div className="flex items-center text-sm">
          <Users className="h-3 w-3 mr-1" />
          {venue.capacity || "N/A"}
        </div>
      ),
      width: "100px",
    },
    {
      key: "created_at",
      title: "Created",
      render: (_, venue) => formatDate(venue.created_at),
      sortable: true,
      width: "120px",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, venue) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              disabled={actionLoading === venue.id}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/super-admin/venues/${venue.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleToggleVerification(venue.id, venue.is_verified)}
              disabled={actionLoading === venue.id}
            >
              {venue.is_verified ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Unverify
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleStatus(venue.id, venue.is_active)}
              disabled={actionLoading === venue.id}
            >
              {venue.is_active ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteVenue(venue.id)}
              disabled={actionLoading === venue.id}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Venue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "80px",
    },
  ];

  return (
    <DataTable
      data={venues}
      columns={columns}
      loading={loading}
      error={error}
      searchable={true}
      searchPlaceholder="Search venues by name, city, or owner..."
      filterable={true}
      filterOptions={[
        { value: "verified", label: "Verified Only" },
        { value: "unverified", label: "Unverified Only" },
        { value: "active", label: "Active Only" },
        { value: "inactive", label: "Inactive Only" },
        { value: "nightclub", label: "Nightclubs" },
        { value: "bar", label: "Bars" },
        { value: "restaurant", label: "Restaurants" },
        { value: "lounge", label: "Lounges" },
      ]}
      onFilterChange={(filter) => {
        // This would be handled by the parent component
        console.log("Filter changed:", filter);
      }}
      emptyMessage="No venues found"
      onRowClick={(venue) => router.push(`/super-admin/venues/${venue.id}`)}
    />
  );
}