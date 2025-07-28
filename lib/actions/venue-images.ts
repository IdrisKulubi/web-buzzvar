"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { VenueImage } from "@/lib/types/database";
import { ActionResult } from "@/lib/types/errors";

export async function getVenueImages(venueId: string): Promise<ActionResult<VenueImage[]>> {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Check if user owns this venue using service client to bypass RLS
    const { data: ownership, error: ownershipError } = await serviceSupabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied", code: "VENUE_NOT_FOUND" };
    }

    // Fetch venue's cover image and video URLs
    const { data: venue, error } = await serviceSupabase
      .from("venues")
      .select("cover_image_url, cover_video_url")
      .eq("id", venueId)
      .single();

    if (error) {
      console.error("Error fetching venue media:", error);
      return { success: false, error: "Failed to fetch venue images", code: "FAILED_TO_FETCH_VENUE_IMAGES" };
    }

    // Convert venue URLs to VenueImage format for compatibility
    const images: VenueImage[] = [];
    
    if (venue.cover_image_url) {
      images.push({
        id: `${venueId}-cover-image`,
        venue_id: venueId,
        image_url: venue.cover_image_url,
        image_type: 'cover',
        caption: 'Cover Image',
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }

    if (venue.cover_video_url) {
      images.push({
        id: `${venueId}-cover-video`,
        venue_id: venueId,
        image_url: venue.cover_video_url,
        image_type: 'cover',
        caption: 'Cover Video',
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, data: images };
  } catch (error) {
    console.error("Error in getVenueImages:", error);
    return { success: false, error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" };
  }
}

export async function uploadVenueImage(
  venueId: string,
  formData: FormData
): Promise<ActionResult<{ url: string; type: 'image' | 'video' }>> {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Check if user owns this venue using service client to bypass RLS
    const { data: ownership, error: ownershipError } = await serviceSupabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      console.error("Ownership check failed:", ownershipError);
      return { success: false, error: "Venue not found or access denied", code: "VENUE_NOT_FOUND" };
    }

    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided", code: "NO_FILE_PROVIDED" };
    }

    // Validate file type - support both images and videos
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      return { success: false, error: "File must be an image or video", code: "INVALID_FILE_TYPE" };
    }

    // Validate file size (max 10MB for videos, 5MB for images)
    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: `File size must be less than ${isVideo ? '10MB' : '5MB'}`, code: "FILE_TOO_LARGE" };
    }

    // For now, we'll store a placeholder URL since we don't have Cloudflare R2 setup
    // In a real implementation, you would upload to Cloudflare R2 here
    const mediaUrl = `https://placeholder.com/venue-${venueId}-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;

    // Update venue's cover image or video URL directly in venues table
    const updateData = isVideo 
      ? { cover_video_url: mediaUrl }
      : { cover_image_url: mediaUrl };

    console.log("Attempting to update venue:", { venueId, updateData });

    const { error } = await serviceSupabase
      .from("venues")
      .update(updateData)
      .eq("id", venueId);

    if (error) {
      console.error("Error updating venue media:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return { success: false, error: "Failed to upload media", code: "FAILED_TO_UPLOAD_MEDIA" };
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { 
      success: true, 
      data: { 
        url: mediaUrl, 
        type: isVideo ? 'video' : 'image' 
      } 
    };
  } catch (error) {
    console.error("Error in uploadVenueImage:", error);
    return { success: false, error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" };
  }
}

export async function deleteVenueImage(
  venueId: string,
  imageId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Check if user owns this venue using service client to bypass RLS
    const { data: ownership, error: ownershipError } = await serviceSupabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      console.error("Ownership check failed:", ownershipError);
      return { success: false, error: "Venue not found or access denied", code: "VENUE_NOT_FOUND" };
    }

    // Determine which field to clear based on image ID
    let updateData: { cover_image_url?: null; cover_video_url?: null } = {};
    
    if (imageId.includes('cover-image')) {
      updateData = { cover_image_url: null };
    } else if (imageId.includes('cover-video')) {
      updateData = { cover_video_url: null };
    } else {
      return { success: false, error: "Media not found", code: "MEDIA_NOT_FOUND" };
    }

    // Clear the URL field in venues table
    const { error } = await serviceSupabase
      .from("venues")
      .update(updateData)
      .eq("id", venueId);

    if (error) {
      console.error("Error deleting venue image:", error);
      return { success: false, error: "Failed to delete media", code: "FAILED_TO_DELETE_MEDIA" };
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteVenueImage:", error);
    return { success: false, error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" };
  }
}

export async function updateVenueImageOrder(
  venueId: string,
  imageUpdates: { id: string; display_order: number }[]
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied", code: "VENUE_NOT_FOUND" };
    }

    // Update each image's display order
    for (const update of imageUpdates) {
      const { error } = await supabase
        .from("venue_images")
        .update({ display_order: update.display_order })
        .eq("id", update.id)
        .eq("venue_id", venueId);

      if (error) {
        console.error("Error updating image order:", error);
        return { success: false, error: "Failed to update image order", code: "FAILED_TO_UPDATE_IMAGE_ORDER" };
      }
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in updateVenueImageOrder:", error);
    return { success: false, error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" };
  }
}

export async function updateVenueImage(
  venueId: string,
  imageId: string,
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied", code: "VENUE_NOT_FOUND" };
    }

    const imageType = formData.get("image_type") as string;
    const caption = formData.get("caption") as string;

    // Verify the image belongs to this venue
    const { data: image, error: imageError } = await supabase
      .from("venue_images")
      .select("id")
      .eq("id", imageId)
      .eq("venue_id", venueId)
      .single();

    if (imageError || !image) {
      return { success: false, error: "Image not found", code: "IMAGE_NOT_FOUND" };
    }

    // Update image metadata
    const { error } = await supabase
      .from("venue_images")
      .update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image_type: imageType as any,
        caption: caption || null,
      })
      .eq("id", imageId);

    if (error) {
      console.error("Error updating venue image:", error);
      return { success: false, error: "Failed to update image", code: "FAILED_TO_UPDATE_IMAGE" };
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in updateVenueImage:", error);
    return { success: false, error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" };
  }
}