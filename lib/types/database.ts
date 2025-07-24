// Database type definitions based on the BuzzVar schema
export interface User {
  id: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
  last_login?: string
  auth_provider: string
  auth_provider_id?: string
}

export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  username?: string
  bio?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: string
  location_city?: string
  location_country?: string
  preferences?: Record<string, unknown>
  privacy_settings?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions?: Record<string, unknown>
  created_at: string
  created_by?: string
}

export interface Venue {
  id: string
  name: string
  description?: string
  address: string
  city: string
  country: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  cover_image_url?: string
  logo_url?: string
  venue_type?: 'nightclub' | 'bar' | 'restaurant' | 'lounge'
  capacity?: number
  dress_code?: string
  age_restriction?: number
  opening_hours?: Record<string, { open: string; close: string }>
  amenities?: string[]
  price_range?: '$' | '$$' | '$$$' | '$$$$'
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VenueOwner {
  id: string
  user_id: string
  venue_id: string
  role: 'owner' | 'manager' | 'staff'
  permissions?: Record<string, unknown>
  created_at: string
}

export interface Event {
  id: string
  venue_id: string
  title: string
  description?: string
  event_date: string
  start_time: string
  end_time?: string
  cover_image_url?: string
  ticket_price?: number
  ticket_url?: string
  capacity?: number
  event_type?: 'party' | 'concert' | 'special_event'
  dress_code?: string
  age_restriction?: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export interface Promotion {
  id: string
  venue_id: string
  title: string
  description?: string
  promotion_type: 'discount' | 'free_drink' | 'vip_access' | 'happy_hour'
  discount_percentage?: number
  discount_amount?: number
  promo_code?: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  days_of_week?: string[]
  max_uses?: number
  current_uses: number
  terms_conditions?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export interface UserInteraction {
  id: string
  user_id: string
  venue_id: string
  event_id?: string
  interaction_type: 'like' | 'save' | 'share' | 'check_in' | 'review'
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  venue_id: string
  rating: number
  comment?: string
  visit_date?: string
  is_verified: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  date: string
  session_count: number
  session_duration: number
  venues_viewed: number
  events_viewed: number
  interactions_count: number
  created_at: string
}

export interface VenueAnalytics {
  id: string
  venue_id: string
  date: string
  views: number
  likes: number
  saves: number
  shares: number
  check_ins: number
  reviews_count: number
  average_rating?: number
  created_at: string
}

export interface SystemAnalytics {
  id: string
  date: string
  total_users: number
  active_users: number
  new_users: number
  total_venues: number
  active_venues: number
  total_events: number
  total_interactions: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  notification_type?: 'promotion' | 'event' | 'system' | 'social'
  related_venue_id?: string
  related_event_id?: string
  is_read: boolean
  is_sent: boolean
  scheduled_for?: string
  sent_at?: string
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  device_info?: Record<string, unknown>
  ip_address?: string
  location_data?: Record<string, unknown>
  started_at: string
  ended_at?: string
  duration?: number
}

export interface VenueImage {
  id: string
  venue_id: string
  image_url: string
  image_type?: 'cover' | 'interior' | 'exterior' | 'menu' | 'event'
  caption?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface SavedVenue {
  id: string
  user_id: string
  venue_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_user_id: string
  reported_venue_id?: string
  reported_user_id?: string
  reported_review_id?: string
  report_type: 'inappropriate_content' | 'fake_info' | 'spam' | 'harassment'
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

// Utility types for database operations
export type DatabaseInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
export type DatabaseUpdate<T> = Partial<Omit<T, 'id' | 'created_at'>> & { updated_at?: string }

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: DatabaseInsert<User>
        Update: DatabaseUpdate<User>
      }
      user_profiles: {
        Row: UserProfile
        Insert: DatabaseInsert<UserProfile>
        Update: DatabaseUpdate<UserProfile>
      }
      admin_users: {
        Row: AdminUser
        Insert: DatabaseInsert<AdminUser>
        Update: DatabaseUpdate<AdminUser>
      }
      venues: {
        Row: Venue
        Insert: DatabaseInsert<Venue>
        Update: DatabaseUpdate<Venue>
      }
      venue_owners: {
        Row: VenueOwner
        Insert: DatabaseInsert<VenueOwner>
        Update: DatabaseUpdate<VenueOwner>
      }
      events: {
        Row: Event
        Insert: DatabaseInsert<Event>
        Update: DatabaseUpdate<Event>
      }
      promotions: {
        Row: Promotion
        Insert: DatabaseInsert<Promotion>
        Update: DatabaseUpdate<Promotion>
      }
      user_interactions: {
        Row: UserInteraction
        Insert: DatabaseInsert<UserInteraction>
        Update: DatabaseUpdate<UserInteraction>
      }
      reviews: {
        Row: Review
        Insert: DatabaseInsert<Review>
        Update: DatabaseUpdate<Review>
      }
      user_analytics: {
        Row: UserAnalytics
        Insert: DatabaseInsert<UserAnalytics>
        Update: DatabaseUpdate<UserAnalytics>
      }
      venue_analytics: {
        Row: VenueAnalytics
        Insert: DatabaseInsert<VenueAnalytics>
        Update: DatabaseUpdate<VenueAnalytics>
      }
      system_analytics: {
        Row: SystemAnalytics
        Insert: DatabaseInsert<SystemAnalytics>
        Update: DatabaseUpdate<SystemAnalytics>
      }
      notifications: {
        Row: Notification
        Insert: DatabaseInsert<Notification>
        Update: DatabaseUpdate<Notification>
      }
      user_sessions: {
        Row: UserSession
        Insert: DatabaseInsert<UserSession>
        Update: DatabaseUpdate<UserSession>
      }
      venue_images: {
        Row: VenueImage
        Insert: DatabaseInsert<VenueImage>
        Update: DatabaseUpdate<VenueImage>
      }
      saved_venues: {
        Row: SavedVenue
        Insert: DatabaseInsert<SavedVenue>
        Update: DatabaseUpdate<SavedVenue>
      }
      reports: {
        Row: Report
        Insert: DatabaseInsert<Report>
        Update: DatabaseUpdate<Report>
      }
    }
  }
}