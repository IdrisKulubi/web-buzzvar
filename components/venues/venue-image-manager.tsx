"use client";

import { useState, useEffect } from "react";
import { VenueImage } from "@/lib/types/database";
import { uploadVenueImage } from "@/lib/actions/venue-images";
import { VenueImageUpload } from "./venue-image-upload";
import { VenueImageGallery } from "./venue-image-gallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Images } from "lucide-react";
import { toast } from "sonner";

interface VenueImageManagerProps {
  venueId: string;
  initialImages: VenueImage[];
  isLoading: boolean;
  onImagesUpdate: () => void;
}

export function VenueImageManager({ venueId, initialImages, isLoading, onImagesUpdate }: VenueImageManagerProps) {
  const [images, setImages] = useState<VenueImage[]>(initialImages);

  // Update internal state when initialImages prop changes
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleUpload = async (formData: FormData) => {
    try {
      const result = await uploadVenueImage(venueId, formData);
      if (result.success) {
        toast.success("Media uploaded successfully!");
        onImagesUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    }
  };

  const [activeTab, setActiveTab] = useState("gallery");

  const hasImage = images.some(img => img.image_url.includes('.jpg') || img.image_url.includes('.png') || img.image_url.includes('.webp'));
  const hasVideo = images.some(img => img.image_url.includes('.mp4') || img.image_url.includes('.mov') || img.image_url.includes('.webm'));

  return (
    <div className="space-y-6">
      {/* Media Statistics */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {hasImage ? 1 : 0}
              </div>
              <div className="text-sm text-muted-foreground">Cover Image</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {hasVideo ? 1 : 0}
              </div>
              <div className="text-sm text-muted-foreground">Cover Video</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {images.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Media</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload and Gallery Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center space-x-2">
            <Images className="h-4 w-4" />
            <span>Gallery ({images.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4 mt-6">
          <VenueImageGallery
            venueId={venueId}
            images={images}
            onImagesChange={onImagesUpdate}
            onAddMedia={() => setActiveTab("upload")}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Cover Media</CardTitle>
              <CardDescription>
                Upload a cover image or video for your venue. This will replace any existing cover media. Supported formats: JPG, PNG, WebP, MP4, MOV, WebM (max 10MB each).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VenueImageUpload onUpload={handleUpload} maxSize={10} accept="image/*,video/*" />
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Media Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Cover Images</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use high-quality, well-lit photos</li>
                    <li>• Show the best exterior or signature view</li>
                    <li>• Represent your venue's brand and atmosphere</li>
                    <li>• Avoid cluttered or busy compositions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cover Videos</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Keep videos short and engaging (15-60s)</li>
                    <li>• Showcase the venue's energy and ambiance</li>
                    <li>• Use stable footage with good lighting</li>
                    <li>• Highlight what makes your venue unique</li>
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