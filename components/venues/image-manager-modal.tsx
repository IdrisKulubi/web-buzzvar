"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VenueImageManager } from "@/components/venues/venue-image-manager";
import { getVenueImages } from "@/lib/actions/venue-images";
import { VenueImage } from "@/lib/types/database";

interface ImageManagerModalProps {
  venueId: string;
  venueName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageManagerModal({ venueId, venueName, isOpen, onClose }: ImageManagerModalProps) {
  const [images, setImages] = useState<VenueImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchImages = async () => {
    setIsLoading(true);
    const result = await getVenueImages(venueId);
    if (result.success) {
      setImages(result.data);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      } else {
        fetchImages();
      }
    }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Images for {venueName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 pr-4">
          <VenueImageManager
            venueId={venueId}
            initialImages={images}
            isLoading={isLoading}
            onImagesUpdate={fetchImages}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 