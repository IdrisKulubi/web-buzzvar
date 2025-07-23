// Export all database types
export * from './database'

// Export all validation schemas and types
export * from './validation'

// Export all error handling utilities
export * from './errors'

// Additional utility types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Role-based access control types
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'club_owner'

export interface UserPermissions {
  canViewSystemAnalytics: boolean
  canManageUsers: boolean
  canManageVenues: boolean
  canModerateContent: boolean
  canManageOwnVenues: boolean
  canCreateEvents: boolean
  canCreatePromotions: boolean
  canViewReports: boolean
  canResolveReports: boolean
  canSendNotifications: boolean
}

// Dashboard-specific types
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalVenues: number
  activeVenues: number
  totalEvents: number
  totalReviews: number
  averageRating: number
}

export interface VenueStats {
  views: number
  likes: number
  saves: number
  shares: number
  checkIns: number
  reviewsCount: number
  averageRating: number
  eventsCount: number
  promotionsCount: number
}

// Form state types
export interface FormState {
  isSubmitting: boolean
  errors: Record<string, string>
  success: boolean
  message?: string
}

// File upload types
export interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
}

export interface ImageUploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

// Search and filter types
export interface SearchFilters {
  query?: string
  city?: string
  venueType?: string
  priceRange?: string
  hasEvents?: boolean
  isVerified?: boolean
  isActive?: boolean
}

export interface EventFilters {
  venueId?: string
  eventType?: string
  dateFrom?: string
  dateTo?: string
  isActive?: boolean
  isFeatured?: boolean
}

export interface PromotionFilters {
  venueId?: string
  promotionType?: string
  isActive?: boolean
  dateFrom?: string
  dateTo?: string
}

// Analytics types
export interface AnalyticsTimeRange {
  start: string
  end: string
  period: 'day' | 'week' | 'month' | 'year'
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface AnalyticsData {
  timeRange: AnalyticsTimeRange
  data: ChartDataPoint[]
  total: number
  change: number
  changePercent: number
}

// Notification types
export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
}

export interface BulkNotification {
  title: string
  message: string
  type: 'promotion' | 'event' | 'system' | 'social'
  targetUsers: string[]
  scheduledFor?: string
}

// Export configuration
export interface AppConfig {
  maxFileSize: number
  allowedImageTypes: string[]
  paginationLimit: number
  sessionTimeout: number
  rateLimit: {
    requests: number
    windowMs: number
  }
}