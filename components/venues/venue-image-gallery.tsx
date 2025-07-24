"use client";

import { useState } from "react";
import { VenueImage } from "@/lib/types/database";
import {
  deleteVenueImage,
  updateVenueImageOrder,
  updateVenueImage,
} from "@/lib/actions/venue-images";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VenueImageGalleryProps {
  venueId: string;
  images: VenueImage[];
  onImagesChange: () => void;
}

export function VenueImageGallery({
  venueId,
  images,
  onImagesChange,
}: VenueImageGalleryProps) {
  const [editingImage, setEditingImage] = useState<VenueImage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<VenueImage | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getImageTypeColor = (type?: string) => {
    const colors = {
      cover: "bg-blue-100 text-blue-800",
      interior: "bg-green-100 text-green-800",
      exterior: "bg-yellow-100 text-yellow-800",
      menu: "bg-purple-100 text-purple-800",
      event: "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleDelete = async (image: VenueImage) => {
    setIsLoading(image.id);
    try {
      const result = await deleteVenueImage(venueId, image.id);
      if (result.success) {
        toast.success("Image deleted successfully");
        onImagesChange();
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
        console.error(error)
      toast.error("An error occurred while deleting the image");
    } finally {
      setIsLoading(null);
      setDeleteConfirm(null);
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!editingImage) return;

    setIsLoading(editingImage.id);
    try {
      const result = await updateVenueImage(venueId, editingImage.id, formData);
      if (result.success) {
        toast.success("Image updated successfully");
        onImagesChange();
        setEditingImage(null);
      } else {
        toast.error(result.error || "Failed to update image");
      }
    } catch (error) {
        console.error(error)
      toast.error("An error occurred while updating the image");
    } finally {
      setIsLoading(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [
      newImages[index - 1],
      newImages[index],
    ];

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx,
    }));

    setIsLoading(images[index].id);
    try {
      const result = await updateVenueImageOrder(venueId, updates);
      if (result.success) {
        toast.success("Image order updated");
        onImagesChange();
      } else {
        toast.error(result.error || "Failed to update image order");
      }
    } catch (error) {
        console.error(error)
      toast.error("An error occurred while updating image order");
    } finally {
      setIsLoading(null);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === images.length - 1) return;

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx,
    }));

    setIsLoading(images[index].id);
    try {
      const result = await updateVenueImageOrder(venueId, updates);
      if (result.success) {
        toast.success("Image order updated");
        onImagesChange();
      } else {
        toast.error(result.error || "Failed to update image order");
      }
    } catch (error) {
        console.error(error)
      toast.error("An error occurred while updating image order");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx,
    }));

    setIsLoading(draggedImage.id);
    try {
      const result = await updateVenueImageOrder(venueId, updates);
      if (result.success) {
        toast.success("Image order updated");
        onImagesChange();
      } else {
        toast.error(result.error || "Failed to update image order");
      }
    } catch (error) {
        console.error(error)
      toast.error("An error occurred while updating image order");
    } finally {
      setIsLoading(null);
      setDraggedIndex(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No images yet</h3>
        <p className="text-muted-foreground">
          Upload some images to showcase your venue
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card
            key={image.id}
            className={cn(
              "group relative overflow-hidden transition-all",
              draggedIndex === index && "opacity-50",
              isLoading === image.id && "pointer-events-none opacity-75"
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <Image
                  src={image.image_url}
                  alt={image.caption || `Venue image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Drag Handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded p-1 cursor-move">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Image Type Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className={getImageTypeColor(image.image_type)}>
                    {image.image_type || "interior"}
                  </Badge>
                </div>

                {/* Actions Menu */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={isLoading === image.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditingImage(image)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <MoveUp className="mr-2 h-4 w-4" />
                        Move Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                      >
                        <MoveDown className="mr-2 h-4 w-4" />
                        Move Down
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(image)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Image Caption */}
              {image.caption && (
                <div className="p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.caption}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
            <DialogDescription>
              Update the image type and caption
            </DialogDescription>
          </DialogHeader>

          {editingImage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEdit(formData);
              }}
              className="space-y-4"
            >
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={editingImage.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <Label htmlFor="edit_image_type">Image Type</Label>
                <Select
                  name="image_type"
                  defaultValue={editingImage.image_type || "interior"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover Image</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="menu">Menu</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_caption">Caption</Label>
                <Textarea
                  name="caption"
                  defaultValue={editingImage.caption || ""}
                  placeholder="Add a caption for this image..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingImage(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading === editingImage.id}>
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deleteConfirm && (
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={deleteConfirm.image_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={!!(deleteConfirm && isLoading === deleteConfirm.id)}
            >
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
