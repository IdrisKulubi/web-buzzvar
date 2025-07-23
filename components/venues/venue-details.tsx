"use client";

import { useState } from "react";
import { VenueData, toggleVenueVerification, toggleVenueStatus, updateVenueDetails } from "@/lib/actions/venues";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  Play,
  Pause,
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
  Calendar,
  Star,
  Image as ImageIcon,
  Edit,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VenueDetailsProps {
  venue: VenueData;
}

export function VenueDetails({ venue: initialVenue }: VenueDetailsProps) {
  const router = useRouter();
  const [venue, setVenue] = useState(initialVenue);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: venue.name,
    description: venue.description || "",
    address: venue.address,
    phone: venue.phone || "",
    email: venue.email || "",
    website: venue.website || "",
    instagram: venue.instagram || "",
    facebook: venue.facebook || "",
    twitter: venue.twitter || "",
    capacity: venue.capacity?.toString() || "",
    dress_code: venue.dress_code || "",
    age_restriction: venue.age_restriction?.toString() || "",
    price_range: venue.price_range || "",
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleVerification = async () => {
    setActionLoading("verification");
    try {
      const result = await toggleVenueVerification(venue.id, !venue.is_verified);
      if (result.success) {
        setVenue(prev => ({ ...prev, is_verified: !prev.is_verified }));
        toast.success(`Venue ${!venue.is_verified ? 'verified' : 'unverified'} successfully`);
      } else {
        toast.error(result.error || "Failed to update venue verification");
      }
    } catch (error) {
      toast.error("An error occurred while updating venue verification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading("status");
    try {
      const result = await toggleVenueStatus(venue.id, !venue.is_active);
      if (result.success) {
        setVenue(prev => ({ ...prev, is_active: !prev.is_active }));
        toast.success(`Venue ${!venue.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.error || "Failed to update venue status");
      }
    } catch (error) {
      toast.error("An error occurred while updating venue status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    setActionLoading("save");
    try {
      const updates = {
        name: editForm.name,
        description: editForm.description || null,
        address: editForm.address,
        phone: editForm.phone || null,
        email: editForm.email || null,
        website: editForm.website || null,
        instagram: editForm.instagram || null,
        facebook: editForm.facebook || null,
        twitter: editForm.twitter || null,
        capacity: editForm.capacity ? parseInt(editForm.capacity) : null,
        dress_code: editForm.dress_code || null,
        age_restriction: editForm.age_restriction ? parseInt(editForm.age_restriction) : null,
        price_range: editForm.price_range || null,
      };

      const result = await updateVenueDetails(venue.id, updates);
      if (result.success) {
        setVenue(prev => ({ ...prev, ...updates }));
        setIsEditing(false);
        toast.success("Venue details updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update venue details");
      }
    } catch (error) {
      toast.error("An error occurred while updating venue details");
    } finally {
      setActionLoading(null);
    }
  };

  const getOwnerInfo = () => {
    const owner = venue.venue_owners.find(vo => vo.role === 'owner');
    if (!owner) return null;
    
    const profile = owner.user.profile;
    return {
      name: profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}`
        : owner.user.email,
      email: owner.user.email,
      avatar: profile?.avatar_url,
      username: profile?.username,
      isActive: owner.user.is_active,
    };
  };

  const formatOpeningHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return "Not specified";
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const dayHours = hours[day];
      if (!dayHours) return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.open} - ${dayHours.close}`;
    }).join('\n');
  };

  const ownerInfo = getOwnerInfo();

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
                {venue.is_verified ? "Verified" : "Unverified"}
              </Badge>
              <Badge variant={venue.is_active ? "default" : "secondary"}>
                {venue.is_active ? "Active" : "Inactive"}
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
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={actionLoading !== null}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
              <Button
                variant={venue.is_verified ? "outline" : "default"}
                onClick={handleToggleVerification}
                disabled={actionLoading === "verification"}
              >
                {venue.is_verified ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Unverify
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
              <Button
                variant={venue.is_active ? "outline" : "default"}
                onClick={handleToggleStatus}
                disabled={actionLoading === "status"}
              >
                {venue.is_active ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: venue.name,
                    description: venue.description || "",
                    address: venue.address,
                    phone: venue.phone || "",
                    email: venue.email || "",
                    website: venue.website || "",
                    instagram: venue.instagram || "",
                    facebook: venue.facebook || "",
                    twitter: venue.twitter || "",
                    capacity: venue.capacity?.toString() || "",
                    dress_code: venue.dress_code || "",
                    age_restriction: venue.age_restriction?.toString() || "",
                    price_range: venue.price_range || "",
                  });
                }}
                disabled={actionLoading === "save"}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={actionLoading === "save"}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
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
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="name">Venue Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Description</Label>
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={editForm.facebook}
                      onChange={(e) => setEditForm(prev => ({ ...prev, facebook: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={editForm.twitter}
                      onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          {ownerInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={ownerInfo.avatar} alt={ownerInfo.name} />
                    <AvatarFallback>
                      {ownerInfo.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{ownerInfo.name}</div>
                    <div className="text-sm text-muted-foreground">{ownerInfo.email}</div>
                    {ownerInfo.username && (
                      <div className="text-sm text-muted-foreground">@{ownerInfo.username}</div>
                    )}
                    <Badge variant={ownerInfo.isActive ? "default" : "secondary"} className="mt-1">
                      {ownerInfo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Venue Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Events</span>
                </div>
                <span className="font-medium">{venue._count?.events || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Reviews</span>
                </div>
                <span className="font-medium">{venue._count?.reviews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Images</span>
                </div>
                <span className="font-medium">{venue._count?.venue_images || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Venue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, capacity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dress_code">Dress Code</Label>
                    <Input
                      id="dress_code"
                      value={editForm.dress_code}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dress_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age_restriction">Age Restriction</Label>
                    <Input
                      id="age_restriction"
                      type="number"
                      value={editForm.age_restriction}
                      onChange={(e) => setEditForm(prev => ({ ...prev, age_restriction: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_range">Price Range</Label>
                    <Input
                      id="price_range"
                      value={editForm.price_range}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price_range: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
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
                      <Label>Dress Code</Label>
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
                </>
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
          {venue.amenities && venue.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}