"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { VenueImage } from "@/lib/types/database";
import { ActionResult } from "@/lib/types/errors";

export async function getVenueImages(venueId: string): Promise<ActionResult<VenueImage[]>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    const { data: images, error } = await supabase
      .from("venue_images")
      .select("*")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching venue images:", error);
      return { success: false, error: "Failed to fetch venue images" };
    }

    return { success: true, data: images || [] };
  } catch (error) {
    console.error("Error in getVenueImages:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function uploadVenueImage(
  venueId: string,
  formData: FormData
): Promise<ActionResult<VenueImage>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    const file = formData.get("file") as File;
    const imageType = formData.get("image_type") as string || "interior";
    const caption = formData.get("caption") as string || "";

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" };
    }

    // Get the next display order
    const { data: lastImage } = await supabase
      .from("venue_images")
      .select("display_order")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastImage?.display_order || 0) + 1;

    // For now, we'll store a placeholder URL since we don't have Cloudflare R2 setup
    // In a real implementation, you would upload to Cloudflare R2 here
    const imageUrl = `https://placeholder.com/venue-${venueId}-${Date.now()}.jpg`;

    // Create venue image record
    const { data: image, error } = await supabase
      .from("venue_images")
      .insert({
        venue_id: venueId,
        image_url: imageUrl,
        image_type: imageType as any,
        caption: caption || null,
        display_order: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating venue image:", error);
      return { success: false, error: "Failed to upload image" };
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true, data: image };
  } catch (error) {
    console.error("Error in uploadVenueImage:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteVenueImage(
  venueId: string,
  imageId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
    }

    // Verify the image belongs to this venue
    const { data: image, error: imageError } = await supabase
      .from("venue_images")
      .select("id")
      .eq("id", imageId)
      .eq("venue_id", venueId)
      .single();

    if (imageError || !image) {
      return { success: false, error: "Image not found" };
    }

    // Soft delete the image
    const { error } = await supabase
      .from("venue_images")
      .update({ is_active: false })
      .eq("id", imageId);

    if (error) {
      console.error("Error deleting venue image:", error);
      return { success: false, error: "Failed to delete image" };
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in deleteVenueImage:", error);
    return { success: false, error: "An unexpected error occurred" };
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
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
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
        return { success: false, error: "Failed to update image order" };
      }
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateVenueImageOrder:", error);
    return { success: false, error: "An unexpected error occurred" };
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
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this venue
    const { data: ownership, error: ownershipError } = await supabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return { success: false, error: "Venue not found or access denied" };
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
      return { success: false, error: "Image not found" };
    }

    // Update image metadata
    const { error } = await supabase
      .from("venue_images")
      .update({
        image_type: imageType as any,
        caption: caption || null,
      })
      .eq("id", imageId);

    if (error) {
      console.error("Error updating venue image:", error);
      return { success: false, error: "Failed to update image" };
    }

    revalidatePath(`/club-owner/venues/${venueId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateVenueImage:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}