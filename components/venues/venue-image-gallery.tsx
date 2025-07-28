"use client";

import { useState } from "react";
import { VenueImage } from "@/lib/types/database";
import { deleteVenueImage } from "@/lib/actions/venue-images";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, MoreVertical, Plus, PlayCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface VenueImageGalleryProps {
  venueId: string;
  images: VenueImage[];
  onImagesChange: () => void;
  onAddMedia?: () => void;
}

export function VenueImageGallery({
  venueId,
  images,
  onImagesChange,
  onAddMedia,
}: VenueImageGalleryProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<VenueImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const result = await deleteVenueImage(venueId, deleteConfirm.id);
      if (result.success) {
        toast.success("Media deleted successfully");
        onImagesChange();
      } else {
        toast.error(result.error || "Failed to delete media");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the media");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video');
  };

  const handleImageError = (mediaId: string) => {
    setImageErrors(prev => new Set(prev).add(mediaId));
  };

  if (images.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">No cover media yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload a cover image or video to showcase your venue
            </p>
          </div>
          {onAddMedia && (
            <Button onClick={onAddMedia} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Cover Media
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Media Button */}
      {onAddMedia && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cover Media</h3>
          <Button onClick={onAddMedia} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Replace Media
          </Button>
        </div>
      )}

      {/* Media Grid - Mobile Optimized */}
      <ScrollArea className="h-[400px] md:h-[500px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
          {images.map((media) => (
            <Card key={media.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="aspect-square relative bg-gray-100">
                  {isVideo(media.image_url) ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media.image_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : imageErrors.has(media.id) ? (
                    // Fallback for failed images
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Preview not available</p>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={media.image_url}
                      alt={media.caption || "Venue media"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      onError={() => handleImageError(media.id)}
                    />
                  )}
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      >
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                          onClick={() => setDeleteConfirm(media)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                  {/* Caption Overlay */}
                  {media.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs truncate">{media.caption}</p>
              </div>
                  )}
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </ScrollArea>

      {/* Media Count */}
      <div className="text-sm text-gray-500 text-center">
        {images.length} {images.length === 1 ? 'item' : 'items'} total
              </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
