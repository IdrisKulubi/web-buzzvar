"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVenue, updateClubOwnerVenue } from "@/lib/actions/venues";
import { VenueData } from "@/lib/actions/venues";
import { FormWrapper } from "@/components/common/form-wrapper";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface VenueFormProps {
  venue?: VenueData;
}

export function VenueForm({ venue }: VenueFormProps) {
  const router = useRouter();
  const isEditing = !!venue;

  const [formData, setFormData] = useState({
    name: venue?.name || "",
    description: venue?.description || "",
    address: venue?.address || "",
    city: venue?.city || "",
    country: venue?.country || "",
    latitude: venue?.latitude?.toString() || "",
    longitude: venue?.longitude?.toString() || "",
    phone: venue?.phone || "",
    email: venue?.email || "",
    website: venue?.website || "",
    instagram: venue?.instagram || "",
    facebook: venue?.facebook || "",
    twitter: venue?.twitter || "",
    venue_type: venue?.venue_type || "",
    capacity: venue?.capacity?.toString() || "",
    dress_code: venue?.dress_code || "",
    age_restriction: venue?.age_restriction?.toString() || "",
    price_range: venue?.price_range || "",
  });

  const handleSubmit = async (formDataObj: FormData) => {
    try {
      let result;
      
      if (isEditing && venue) {
        result = await updateClubOwnerVenue(venue.id, formDataObj);
      } else {
        result = await createVenue(formDataObj);
      }

      if (result.success) {
        toast.success(
          isEditing ? "Venue updated successfully!" : "Venue created successfully!"
        );
        
        if (isEditing && venue) {
          router.push(`/club-owner/venues/${venue.id}`);
        } else if (!isEditing && result.data) {
          router.push(`/club-owner/venues/${result.data.id}`);
        } else {
          router.push("/club-owner/venues");
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <FormWrapper
        title={isEditing ? "Edit Venue" : "Create New Venue"}
        description={
          isEditing
            ? "Update your venue information"
            : "Fill in the details to create your new venue"
        }
        onSubmit={handleSubmit}
        submitText={isEditing ? "Update Venue" : "Create Venue"}
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your venue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Venue Name"
                name="name"
                required
                description="The official name of your venue"
              >
                <Input
                  name="name"
                  defaultValue={formData.name}
                  placeholder="Enter venue name"
                  required
                />
              </FormField>

              <FormField
                label="Description"
                name="description"
                description="Brief description of your venue"
              >
                <Textarea
                  name="description"
                  defaultValue={formData.description}
                  placeholder="Describe your venue..."
                  rows={3}
                />
              </FormField>

              <FormField
                label="Venue Type"
                name="venue_type"
                description="Select the type of venue"
              >
                <Select name="venue_type" defaultValue={formData.venue_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nightclub">Nightclub</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="lounge">Lounge</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Where is your venue located?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Address"
                name="address"
                required
                description="Full street address"
              >
                <Input
                  name="address"
                  defaultValue={formData.address}
                  placeholder="Enter full address"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="City"
                  name="city"
                  required
                >
                  <Input
                    name="city"
                    defaultValue={formData.city}
                    placeholder="City"
                    required
                  />
                </FormField>

                <FormField
                  label="Country"
                  name="country"
                  required
                >
                  <Input
                    name="country"
                    defaultValue={formData.country}
                    placeholder="Country"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Latitude"
                  name="latitude"
                  description="Optional GPS coordinate"
                >
                  <Input
                    name="latitude"
                    type="number"
                    step="any"
                    defaultValue={formData.latitude}
                    placeholder="e.g., 40.7128"
                  />
                </FormField>

                <FormField
                  label="Longitude"
                  name="longitude"
                  description="Optional GPS coordinate"
                >
                  <Input
                    name="longitude"
                    type="number"
                    step="any"
                    defaultValue={formData.longitude}
                    placeholder="e.g., -74.0060"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How can customers reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Phone"
                  name="phone"
                >
                  <Input
                    name="phone"
                    type="tel"
                    defaultValue={formData.phone}
                    placeholder="Phone number"
                  />
                </FormField>

                <FormField
                  label="Email"
                  name="email"
                >
                  <Input
                    name="email"
                    type="email"
                    defaultValue={formData.email}
                    placeholder="contact@venue.com"
                  />
                </FormField>
              </div>

              <FormField
                label="Website"
                name="website"
                description="Your venue's website URL"
              >
                <Input
                  name="website"
                  type="url"
                  defaultValue={formData.website}
                  placeholder="https://www.yourvenue.com"
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Connect with your customers on social platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Instagram"
                name="instagram"
                description="Instagram username (without @)"
              >
                <Input
                  name="instagram"
                  defaultValue={formData.instagram}
                  placeholder="yourvenue"
                />
              </FormField>

              <FormField
                label="Facebook"
                name="facebook"
                description="Facebook page URL"
              >
                <Input
                  name="facebook"
                  type="url"
                  defaultValue={formData.facebook}
                  placeholder="https://facebook.com/yourvenue"
                />
              </FormField>

              <FormField
                label="Twitter"
                name="twitter"
                description="Twitter profile URL"
              >
                <Input
                  name="twitter"
                  type="url"
                  defaultValue={formData.twitter}
                  placeholder="https://twitter.com/yourvenue"
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Venue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
              <CardDescription>
                Additional information about your venue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Capacity"
                  name="capacity"
                  description="Maximum number of guests"
                >
                  <Input
                    name="capacity"
                    type="number"
                    min="1"
                    defaultValue={formData.capacity}
                    placeholder="e.g., 200"
                  />
                </FormField>

                <FormField
                  label="Age Restriction"
                  name="age_restriction"
                  description="Minimum age requirement"
                >
                  <Input
                    name="age_restriction"
                    type="number"
                    min="0"
                    max="99"
                    defaultValue={formData.age_restriction}
                    placeholder="e.g., 21"
                  />
                </FormField>
              </div>

              <FormField
                label="Dress Code"
                name="dress_code"
                description="Dress code requirements"
              >
                <Input
                  name="dress_code"
                  defaultValue={formData.dress_code}
                  placeholder="e.g., Smart casual, no sneakers"
                />
              </FormField>

              <FormField
                label="Price Range"
                name="price_range"
                description="General price level"
              >
                <Select name="price_range" defaultValue={formData.price_range}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ - Budget friendly</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                    <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </CardContent>
          </Card>
        </div>
      </FormWrapper>
    </div>
  );
}