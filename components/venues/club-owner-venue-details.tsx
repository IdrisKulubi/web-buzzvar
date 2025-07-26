"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VenueData } from "@/lib/actions/venues";
import { createPromotion } from "@/lib/actions/promotions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PromotionForm } from "@/components/promotions/promotion-form";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Users,
  Clock,
  DollarSign,
  Star,
  Image as ImageIcon,
  Edit,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { PromotionFormValues } from "@/components/promotions/promotion-form";

interface ClubOwnerVenueDetailsProps {
  venue: VenueData;
}

export function ClubOwnerVenueDetails({ venue }: ClubOwnerVenueDetailsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PromotionFormValues) => {
    setIsSubmitting(true);
    
    const result = await createPromotion(venue.id, data);

    if (result.success) {
      toast.success("Promotion created successfully!");
      setIsModalOpen(false);
      router.refresh(); 
    } else {
      toast.error(result.error || "Failed to create promotion.");
    }
    setIsSubmitting(false);
  };

  const formatOpeningHours = (hours: Record<string, { open: string; close: string }>) => {
    if (!hours || typeof hours !== 'object') return "Not specified";
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const dayHours = hours[day];
      if (!dayHours) return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.open} - ${dayHours.close}`;
    }).join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={venue.logo_url || venue.cover_image_url} alt={venue.name} />
            <AvatarFallback className="text-lg">
              {venue.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{venue.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={venue.is_verified ? "default" : "secondary"}>
                {venue.is_verified ? "Verified" : "Pending Verification"}
              </Badge>
              {venue.venue_type && (
                <Badge variant="outline">
                  {venue.venue_type.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/club-owner/venues/${venue.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Venue
            </Button>
          </Link>
          <Link href={`/club-owner/venues/${venue.id}/analytics`}>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/club-owner/venues/${venue.id}/promotions`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
           
          </Card>
        </Link>

        <Link href={`/club-owner/venues/${venue.id}/reviews`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Reviews</p>
                  <p className="text-2xl font-bold">{venue._count?.reviews || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/club-owner/venues/${venue.id}/images`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ImageIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Images</p>
                <p className="text-2xl font-bold">{venue._count?.venue_images || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {venue.description || "No description provided"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{venue.address}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {venue.city}, {venue.country}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{venue.phone}</span>
                </div>
              )}
              {venue.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{venue.email}</span>
                </div>
              )}
              {venue.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {venue.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.instagram && (
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://instagram.com/${venue.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    @{venue.instagram}
                  </a>
                </div>
              )}
              {venue.facebook && (
                <div className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                  <a href={venue.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Facebook
                  </a>
                </div>
              )}
              {venue.twitter && (
                <div className="flex items-center space-x-2">
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                  <a href={venue.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Twitter
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promotion
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Promotion</DialogTitle>
                  </DialogHeader>
                  <PromotionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </DialogContent>
              </Dialog>
              <Link href={`/club-owner/venues/${venue.id}/images`}>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Images
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Venue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.capacity && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Capacity</span>
                  </div>
                  <span className="font-medium">{venue.capacity}</span>
                </div>
              )}
              {venue.dress_code && (
                <div>
                  <label className="text-sm font-medium">Dress Code</label>
                  <p className="text-sm text-muted-foreground mt-1">{venue.dress_code}</p>
                </div>
              )}
              {venue.age_restriction && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Age Restriction</span>
                  <span className="font-medium">{venue.age_restriction}+</span>
                </div>
              )}
              {venue.price_range && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Price Range</span>
                  </div>
                  <span className="font-medium">{venue.price_range}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opening Hours */}
          {venue.opening_hours && (
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                  <pre className="text-sm whitespace-pre-line">
                    {formatOpeningHours(venue.opening_hours)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {venue.amenities && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(venue.amenities) && venue.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              {venue.is_verified ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Your venue is verified</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <span className="text-sm">Verification pending</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your venue is under review. You will be notified once it is verified.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}