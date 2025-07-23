"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter } from "lucide-react";

export interface VenueFilters {
  search: string;
  verification: "all" | "verified" | "unverified";
  status: "all" | "active" | "inactive";
  venueType: "all" | "nightclub" | "bar" | "restaurant" | "lounge";
  city: string;
  country: string;
}

interface VenueFiltersProps {
  filters: VenueFilters;
  onFiltersChange: (filters: VenueFilters) => void;
  cities: string[];
  countries: string[];
}

export function VenueFiltersComponent({
  filters,
  onFiltersChange,
  cities,
  countries,
}: VenueFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof VenueFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      verification: "all",
      status: "all",
      venueType: "all",
      city: "",
      country: "",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.verification !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.venueType !== "all") count++;
    if (filters.city) count++;
    if (filters.country) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search - Always visible */}
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search venues by name, city, or owner..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Expandable filters */}
        {isExpanded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="verification">Verification Status</Label>
                <Select
                  value={filters.verification}
                  onValueChange={(value) => updateFilter("verification", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="venueType">Venue Type</Label>
                <Select
                  value={filters.venueType}
                  onValueChange={(value) => updateFilter("venueType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="nightclub">Nightclub</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="lounge">Lounge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={filters.country}
                  onValueChange={(value) => updateFilter("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filters.country && (
              <div>
                <Label htmlFor="city">City</Label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => updateFilter("city", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {cities
                      .filter((city) => !filters.country || city.includes(filters.country))
                      .map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Search: {filters.search}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("search", "")}
                />
              </Badge>
            )}
            {filters.verification !== "all" && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Verification: {filters.verification}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("verification", "all")}
                />
              </Badge>
            )}
            {filters.status !== "all" && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Status: {filters.status}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("status", "all")}
                />
              </Badge>
            )}
            {filters.venueType !== "all" && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Type: {filters.venueType}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("venueType", "all")}
                />
              </Badge>
            )}
            {filters.country && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Country: {filters.country}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("country", "")}
                />
              </Badge>
            )}
            {filters.city && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>City: {filters.city}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("city", "")}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}