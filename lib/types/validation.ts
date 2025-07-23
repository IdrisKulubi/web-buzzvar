import { z } from "zod";

// Common validation patterns
const uuidSchema = z.string().uuid();
const emailSchema = z.string().email();
const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/)
  .optional();
const urlSchema = z.string().url().optional().or(z.literal(""));
const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// User validation schemas
export const userSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  is_active: z.boolean().default(true),
  auth_provider: z.enum(["email", "google", "apple"]).default("email"),
  auth_provider_id: z.string().optional(),
});

export const userProfileSchema = z.object({
  user_id: uuidSchema,
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  username: z.string().max(50).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  date_of_birth: dateSchema.optional(),
  gender: z.string().max(20).optional(),
  location_city: z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
  preferences: z.record(z.string(), z.any()).optional(),
  privacy_settings: z.record(z.string(), z.any()).optional(),
});

export const adminUserSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(["super_admin", "admin", "moderator"]),
  permissions: z.record(z.string(), z.any()).optional(),
  created_by: uuidSchema.optional(),
});

// Venue validation schemas
export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required").max(200),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  website: urlSchema,
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  cover_image_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  venue_type: z.enum(["nightclub", "bar", "restaurant", "lounge"]).optional(),
  capacity: z.number().positive().optional(),
  dress_code: z.string().max(100).optional(),
  age_restriction: z.number().min(0).max(99).optional(),
  opening_hours: z
    .record(
      z.string(),
      z.object({
        open: timeSchema,
        close: timeSchema,
      })
    )
    .optional(),
  amenities: z.array(z.string()).optional(),
  price_range: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const venueOwnerSchema = z.object({
  user_id: uuidSchema,
  venue_id: uuidSchema,
  role: z.enum(["owner", "manager", "staff"]).default("owner"),
  permissions: z.record(z.string(), z.any()).optional(),
});
export const eventSchema = z
  .object({
    venue_id: uuidSchema,
    title: z.string().min(1, "Event title is required").max(200),
    description: z.string().optional(),
    event_date: dateSchema,
    start_time: timeSchema,
    end_time: timeSchema.optional(),
    cover_image_url: z.string().url().optional(),
    ticket_price: z.number().min(0).optional(),
    ticket_url: urlSchema,
    capacity: z.number().positive().optional(),
    event_type: z.enum(["party", "concert", "special_event"]).optional(),
    dress_code: z.string().max(100).optional(),
    age_restriction: z.number().min(0).max(99).optional(),
    is_featured: z.boolean().default(false),
    is_active: z.boolean().default(true),
    created_by: uuidSchema,
  })
  .refine(
    (data) => {
      // Validate that event date is not in the past
      const eventDate = new Date(data.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    },
    {
      message: "Event date cannot be in the past",
      path: ["event_date"],
    }
  )
  .refine(
    (data) => {
      // Validate that end_time is after start_time if both are provided
      if (data.end_time && data.start_time) {
        const [startHour, startMin] = data.start_time.split(":").map(Number);
        const [endHour, endMin] = data.end_time.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

// Promotion validation schemas
export const promotionSchema = z
  .object({
    venue_id: uuidSchema,
    title: z.string().min(1, "Promotion title is required").max(200),
    description: z.string().optional(),
    promotion_type: z.enum([
      "discount",
      "free_drink",
      "vip_access",
      "happy_hour",
    ]),
    discount_percentage: z.number().min(0).max(100).optional(),
    discount_amount: z.number().min(0).optional(),
    promo_code: z.string().max(50).optional(),
    start_date: dateSchema,
    end_date: dateSchema,
    start_time: timeSchema.optional(),
    end_time: timeSchema.optional(),
    days_of_week: z
      .array(
        z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ])
      )
      .optional(),
    max_uses: z.number().positive().optional(),
    current_uses: z.number().min(0).default(0),
    terms_conditions: z.string().optional(),
    image_url: z.string().url().optional(),
    is_active: z.boolean().default(true),
    created_by: uuidSchema,
  })
  .refine(
    (data) => {
      // Validate that end_date is after start_date
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate >= startDate;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      // Validate that start_date is not in the past
      const startDate = new Date(data.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    },
    {
      message: "Start date cannot be in the past",
      path: ["start_date"],
    }
  )
  .refine(
    (data) => {
      // Validate that end_time is after start_time if both are provided
      if (data.end_time && data.start_time) {
        const [startHour, startMin] = data.start_time.split(":").map(Number);
        const [endHour, endMin] = data.end_time.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      // Validate that at least one discount type is provided
      if (data.promotion_type === "discount") {
        return (
          data.discount_percentage !== undefined ||
          data.discount_amount !== undefined
        );
      }
      return true;
    },
    {
      message:
        "Discount percentage or amount is required for discount promotions",
      path: ["discount_percentage"],
    }
  );

// Review validation schemas
export const reviewSchema = z.object({
  user_id: uuidSchema,
  venue_id: uuidSchema,
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  visit_date: dateSchema.optional(),
  is_verified: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

// User interaction validation schemas
export const userInteractionSchema = z.object({
  user_id: uuidSchema,
  venue_id: uuidSchema,
  event_id: uuidSchema.optional(),
  interaction_type: z.enum(["like", "save", "share", "check_in", "review"]),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Notification validation schemas
export const notificationSchema = z.object({
  user_id: uuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required"),
  notification_type: z
    .enum(["promotion", "event", "system", "social"])
    .optional(),
  related_venue_id: uuidSchema.optional(),
  related_event_id: uuidSchema.optional(),
  is_read: z.boolean().default(false),
  is_sent: z.boolean().default(false),
  scheduled_for: z.string().datetime().optional(),
});

// Report validation schemas
export const reportSchema = z
  .object({
    reporter_user_id: uuidSchema,
    reported_venue_id: uuidSchema.optional(),
    reported_user_id: uuidSchema.optional(),
    reported_review_id: uuidSchema.optional(),
    report_type: z.enum([
      "inappropriate_content",
      "fake_info",
      "spam",
      "harassment",
    ]),
    description: z.string().optional(),
    status: z
      .enum(["pending", "reviewed", "resolved", "dismissed"])
      .default("pending"),
    admin_notes: z.string().optional(),
    resolved_by: uuidSchema.optional(),
  })
  .refine(
    (data) => {
      // At least one reported entity must be provided
      return (
        data.reported_venue_id ||
        data.reported_user_id ||
        data.reported_review_id
      );
    },
    {
      message:
        "At least one reported entity (venue, user, or review) must be specified",
      path: ["reported_venue_id"],
    }
  );

// Venue image validation schemas
export const venueImageSchema = z.object({
  venue_id: uuidSchema,
  image_url: z.string().url(),
  image_type: z
    .enum(["cover", "interior", "exterior", "menu", "event"])
    .optional(),
  caption: z.string().max(200).optional(),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

// Analytics validation schemas
export const venueAnalyticsSchema = z.object({
  venue_id: uuidSchema,
  date: dateSchema,
  views: z.number().min(0).default(0),
  likes: z.number().min(0).default(0),
  saves: z.number().min(0).default(0),
  shares: z.number().min(0).default(0),
  check_ins: z.number().min(0).default(0),
  reviews_count: z.number().min(0).default(0),
  average_rating: z.number().min(0).max(5).optional(),
});

export const userAnalyticsSchema = z.object({
  user_id: uuidSchema,
  date: dateSchema,
  session_count: z.number().min(0).default(0),
  session_duration: z.number().min(0).default(0),
  venues_viewed: z.number().min(0).default(0),
  events_viewed: z.number().min(0).default(0),
  interactions_count: z.number().min(0).default(0),
});

export const systemAnalyticsSchema = z.object({
  date: dateSchema,
  total_users: z.number().min(0).default(0),
  active_users: z.number().min(0).default(0),
  new_users: z.number().min(0).default(0),
  total_venues: z.number().min(0).default(0),
  active_venues: z.number().min(0).default(0),
  total_events: z.number().min(0).default(0),
  total_interactions: z.number().min(0).default(0),
});

// Form-specific validation schemas (for frontend forms)
export const venueFormSchema = venueSchema.omit({
  is_verified: true,
  is_active: true,
});
export const eventFormSchema = eventSchema.omit({
  is_featured: true,
  is_active: true,
});
export const promotionFormSchema = promotionSchema.omit({
  current_uses: true,
  is_active: true,
});

// Login and authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export all schemas for easy access
export const schemas = {
  user: userSchema,
  userProfile: userProfileSchema,
  adminUser: adminUserSchema,
  venue: venueSchema,
  venueOwner: venueOwnerSchema,
  event: eventSchema,
  promotion: promotionSchema,
  review: reviewSchema,
  userInteraction: userInteractionSchema,
  notification: notificationSchema,
  report: reportSchema,
  venueImage: venueImageSchema,
  venueAnalytics: venueAnalyticsSchema,
  userAnalytics: userAnalyticsSchema,
  systemAnalytics: systemAnalyticsSchema,
  venueForm: venueFormSchema,
  eventForm: eventFormSchema,
  promotionForm: promotionFormSchema,
  login: loginSchema,
  signup: signupSchema,
};

// Type inference helpers
export type VenueFormData = z.infer<typeof venueFormSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
export type PromotionFormData = z.infer<typeof promotionFormSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type NotificationFormData = z.infer<typeof notificationSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
