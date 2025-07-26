"use server";

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { ActionResult, createErrorResult } from '@/lib/types/errors';
import { promotionFormSchema, PromotionFormData } from '@/lib/types/validation';

export async function createPromotion(
  venueId: string,
  data: PromotionFormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResult("Unauthorized", "AUTH_ERROR");
    }

    const { data: ownership, error: ownershipError } = await serviceSupabase
      .from("venue_owners")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", venueId)
      .single();

    if (ownershipError || !ownership) {
      return createErrorResult("Access Denied: You are not the owner of this venue.", "AUTH_ERROR");
    }

    const validationResult = promotionFormSchema.safeParse(data);

    if (!validationResult.success) {
      return createErrorResult("Invalid form data.", "VALIDATION_ERROR", { issues: validationResult.error.flatten().fieldErrors });
    }

    const { title, description, start_date, end_date, is_active } = validationResult.data;

    const promotionData = {
      title,
      description,
      start_date,
      end_date,
      is_active,
      venue_id: venueId,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data: promotion, error: insertError } = await serviceSupabase
      .from("promotions")
      .insert(promotionData)
      .select('id')
      .single();

    if (insertError) {
      console.error("Error creating promotion:", insertError);
      return createErrorResult("Failed to create promotion in the database.", "DB_ERROR");
    }

    revalidatePath(`/club-owner/venues/${venueId}/promotions`);

    return { success: true, data: { id: promotion.id } };
  } catch (error) {
    console.error("An unexpected error occurred in createPromotion:", error);
    return createErrorResult("An unexpected server error occurred.", "SERVER_ERROR");
  }
}

export async function getPromotionsForVenue(venueId: string) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResult("Unauthorized", "AUTH_ERROR");
    }

    const { data: ownership, error: ownershipError } = await serviceSupabase
      .from('venue_owners')
      .select('id')
      .eq('user_id', user.id)
      .eq('venue_id', venueId)
      .single();

    if (ownershipError || !ownership) {
      return createErrorResult("Access denied", "AUTH_ERROR");
    }

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promotions:', error);
      return createErrorResult('Failed to fetch promotions', 'DB_ERROR');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getPromotionsForVenue:', error);
    return createErrorResult('An unexpected error occurred', 'SERVER_ERROR');
  }
} 