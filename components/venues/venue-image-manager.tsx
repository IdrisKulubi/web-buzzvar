"use client";

import { useState } from "react";
import { VenueData } from "@/lib/actions/venues";
import { VenueImage } from "@/lib/types/database";
import { uploadVenueImage, getVenueImages } from "@/lib/actions/venue-images";
import { VenueImageUpload } from "./venue-image-upload";
import { VenueImageGallery } from "./venue-image-gallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Images } from "lucide-react";
import { toast } from "sonner";

interface VenueImageManagerProps {
  venueId: string;
  venue: VenueData;
  initialImages: VenueImage[];
}

export function VenueImageManager({ venueId, venue, initialImages }: VenueImageManagerProps) {
  const [images, setImages] = useState<VenueImage[]>(initialImages);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUpload = async (formData: FormData) => {
    try {
      const result = await uploadVenueImage(venueId, formData);
      if (result.success) {
        toast.success("Image uploaded successfully!");
        await refreshImages();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    }
  };

  const refreshImages = async () => {
    setIsRefreshing(true);
    try {
      const result = await getVenueImages(venueId);
      if (result.success) {
        setImages(result.data);
      } else {
        toast.error("Failed to refresh images");
      }
    } catch (error) {
      toast.error("An error occurred while refreshing images");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getImageTypeCount = (type: string) => {
    return images.filter(img => img.image_type === type).length;
  };

  return (
    <div className="space-y-6">
      {/* Venue Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{venue.name}</span>
            <Badge variant="outline">
              {images.length} {images.length === 1 ? "image" : "images"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {venue.address}, {venue.city}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Image Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {getImageTypeCount("cover")}
            </div>
            <div className="text-sm text-muted-foreground">Cover</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {getImageTypeCount("interior")}
            </div>
            <div className="text-sm text-muted-foreground">Interior</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {getImageTypeCount("exterior")}
            </div>
            <div className="text-sm text-muted-foreground">Exterior</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {getImageTypeCount("menu")}
            </div>
            <div className="text-sm text-muted-foreground">Menu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {getImageTypeCount("event")}
            </div>
            <div className="text-sm text-muted-foreground">Event</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Gallery ({images.length})
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>
                Manage your venue images. Drag and drop to reorder, or use the menu to edit or delete images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VenueImageGallery
                venueId={venueId}
                images={images}
                onImagesChange={refreshImages}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Image</CardTitle>
              <CardDescription>
                Add new images to showcase your venue. Supported formats: JPG, PNG, WebP (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VenueImageUpload
                onUpload={handleUpload}
                maxSize={5}
                accept="image/*"
              />
            </CardContent>
          </Card>

          {/* Upload Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Image Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Cover Images</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use high-quality, well-lit photos</li>
                    <li>• Show the best view of your venue</li>
                    <li>• Avoid cluttered backgrounds</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interior/Exterior</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Capture the atmosphere and ambiance</li>
                    <li>• Show different areas and features</li>
                    <li>• Use natural lighting when possible</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Menu Images</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Ensure text is clear and readable</li>
                    <li>• Use good lighting to avoid shadows</li>
                    <li>• Keep images up to date</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Event Photos</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Show the energy and crowd</li>
                    <li>• Capture special moments</li>
                    <li>• Highlight unique features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}