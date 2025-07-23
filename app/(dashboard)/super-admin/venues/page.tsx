import { Suspense } from "react";
import { getVenues } from "@/lib/actions/venues";
import { VenueTable } from "@/components/venues/venue-table";
import { VenueFiltersComponent, VenueFilters } from "@/components/venues/venue-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Building2, CheckCircle, XCircle, Play, Pause } from "lucide-react";

interface VenuesPageProps {
  searchParams: {
    search?: string;
    verification?: string;
    status?: string;
    venueType?: string;
    city?: string;
    country?: string;
  };
}

async function VenuesContent({ searchParams }: VenuesPageProps) {
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

  // Extract unique cities and countries for filters
  const cities = Array.from(new Set(venues.map(v => v.city))).sort();
  const countries = Array.from(new Set(venues.map(v => v.country))).sort();

  // Apply filters
  const filters: VenueFilters = {
    search: searchParams.search || "",
    verification: (searchParams.verification as any) || "all",
    status: (searchParams.status as any) || "all",
    venueType: (searchParams.venueType as any) || "all",
    city: searchParams.city || "",
    country: searchParams.country || "",
  };

  const filteredVenues = venues.filter(venue => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const ownerName = venue.venue_owners.find(vo => vo.role === 'owner')?.user.profile?.first_name || "";
      const ownerLastName = venue.venue_owners.find(vo => vo.role === 'owner')?.user.profile?.last_name || "";
      const ownerEmail = venue.venue_owners.find(vo => vo.role === 'owner')?.user.email || "";
      
      const matchesSearch = 
        venue.name.toLowerCase().includes(searchTerm) ||
        venue.city.toLowerCase().includes(searchTerm) ||
        venue.country.toLowerCase().includes(searchTerm) ||
        ownerName.toLowerCase().includes(searchTerm) ||
        ownerLastName.toLowerCase().includes(searchTerm) ||
        ownerEmail.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Verification filter
    if (filters.verification !== "all") {
      if (filters.verification === "verified" && !venue.is_verified) return false;
      if (filters.verification === "unverified" && venue.is_verified) return false;
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "active" && !venue.is_active) return false;
      if (filters.status === "inactive" && venue.is_active) return false;
    }

    // Venue type filter
    if (filters.venueType !== "all") {
      if (venue.venue_type !== filters.venueType) return false;
    }

    // Country filter
    if (filters.country && venue.country !== filters.country) return false;

    // City filter
    if (filters.city && venue.city !== filters.city) return false;

    return true;
  });

  // Calculate stats
  const stats = {
    total: venues.length,
    verified: venues.filter(v => v.is_verified).length,
    unverified: venues.filter(v => !v.is_verified).length,
    active: venues.filter(v => v.is_active).length,
    inactive: venues.filter(v => !v.is_active).length,
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
        onFiltersChange={() => {}} // This would be handled by URL params in a real implementation
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

export default function VenuesPage({ searchParams }: VenuesPageProps) {
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