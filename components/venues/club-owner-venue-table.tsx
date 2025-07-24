"use client";

import { VenueData } from "@/lib/actions/venues";
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
  Edit,
  MapPin,
  Users,
  Calendar,
  Star,
  Image as ImageIcon,
  TrendingUp,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ClubOwnerVenueTableProps {
  venues: VenueData[];
  loading?: boolean;
  error?: string;
}

export function ClubOwnerVenueTable({ venues, loading, error }: ClubOwnerVenueTableProps) {
  const router = useRouter();

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
      key: "verification",
      title: "Status",
      render: (_, venue) => (
        <div className="space-y-1">
          <Badge variant={venue.is_verified ? "default" : "secondary"}>
            {venue.is_verified ? "Verified" : "Pending"}
          </Badge>
          <Badge variant={venue.is_active ? "default" : "secondary"}>
            {venue.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
      width: "120px",
    },
    {
      key: "stats",
      title: "Statistics",
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
          <div className="flex items-center">
            <ImageIcon className="h-3 w-3 mr-1" />
            {venue._count?.venue_images || 0} images
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/club-owner/venues/${venue.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/club-owner/venues/${venue.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Venue
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/club-owner/venues/${venue.id}/analytics`)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/club-owner/venues/${venue.id}/events`)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Manage Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "80px",
    },
  ];

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No venues yet</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first venue
        </p>
        <Button onClick={() => router.push("/club-owner/venues/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Venue
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      data={venues}
      columns={columns}
      loading={loading}
      error={error}
      searchable={true}
      searchPlaceholder="Search your venues..."
      filterable={true}
      filterOptions={[
        { value: "verified", label: "Verified Only" },
        { value: "pending", label: "Pending Verification" },
        { value: "active", label: "Active Only" },
        { value: "inactive", label: "Inactive Only" },
        { value: "nightclub", label: "Nightclubs" },
        { value: "bar", label: "Bars" },
        { value: "restaurant", label: "Restaurants" },
        { value: "lounge", label: "Lounges" },
      ]}
      onFilterChange={(filter) => {
        // Filter logic would be handled here
        console.log("Filter changed:", filter);
      }}
      emptyMessage="No venues found"
      onRowClick={(venue) => router.push(`/club-owner/venues/${venue.id}`)}
    />
  );
}