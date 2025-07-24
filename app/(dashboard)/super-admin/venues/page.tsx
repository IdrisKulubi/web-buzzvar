import { Suspense } from "react";
import { getVenues } from "@/lib/actions/venues";
import { VenueTable } from "@/components/venues/venue-table";
import { VenueFiltersComponent, VenueFilters } from "@/components/venues/venue-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Building2, CheckCircle, XCircle, Play, Pause } from "lucide-react";

interface VenuesPageProps {
  searchParams: Promise<{
    search?: string;
    verification?: string;
    status?: string;
    venueType?: string;
    city?: string;
    country?: string;
  }>;
}

async function VenuesContent({ searchParams }: VenuesPageProps) {
  const resolvedSearchParams = await searchParams;
  const result = await getVenues();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load venues</p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  const venues = result.data;

  // Extract unique cities and countries for filters (columns don't exist in actual DB)
  const cities: string[] = [];
  const countries: string[] = [];

  // Apply filters
  const filters: VenueFilters = {
    search: resolvedSearchParams.search || "",
    verification: (resolvedSearchParams.verification as any) || "all",
    status: (resolvedSearchParams.status as any) || "all",
    venueType: (resolvedSearchParams.venueType as any) || "all",
    city: resolvedSearchParams.city || "",
    country: resolvedSearchParams.country || "",
  };

  const filteredVenues = venues.filter(venue => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const ownerEmail = venue.venue_owners.find(vo => vo.role === 'owner')?.user.email || "";
      
      const matchesSearch = 
        venue.name.toLowerCase().includes(searchTerm) ||
        ownerEmail.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Verification filter
    if (filters.verification !== "all") {
      if (filters.verification === "verified" && !venue.is_verified) return false;
      if (filters.verification === "unverified" && venue.is_verified) return false;
    }

    // Status filter (is_active column doesn't exist, so skip this filter)
    // if (filters.status !== "all") {
    //   if (filters.status === "active" && !venue.is_active) return false;
    //   if (filters.status === "inactive" && venue.is_active) return false;
    // }

    // Venue type filter
    if (filters.venueType !== "all") {
      if (venue.venue_type !== filters.venueType) return false;
    }

    // Country and city filters disabled (columns don't exist in actual DB)
    // if (filters.country && venue.country !== filters.country) return false;
    // if (filters.city && venue.city !== filters.city) return false;

    return true;
  });

  // Calculate stats
  const stats = {
    total: venues.length,
    verified: venues.filter(v => v.is_verified).length,
    unverified: venues.filter(v => !v.is_verified).length,
    active: venues.length, // is_active column doesn't exist, so all venues are considered active
    inactive: 0, // is_active column doesn't exist
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unverified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.unverified / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Pause className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <VenueFiltersComponent
        filters={filters}
        cities={cities}
        countries={countries}
      />

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Venues ({filteredVenues.length})</CardTitle>
          <CardDescription>
            Manage venue verification, activation, and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VenueTable venues={filteredVenues} />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Venue Management</h1>
          <p className="text-muted-foreground">
            Manage venue verification, activation, and details
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <VenuesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}