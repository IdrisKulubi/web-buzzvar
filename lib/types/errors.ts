// Error handling utilities for the BuzzVar admin dashboard
/* eslint-disable @typescript-eslint/no-explicit-any */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Specific error classes
export class ValidationError extends AppError {
  
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, details)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502)
    this.name = 'ExternalServiceError'
  }
}

// Error response type for API responses
export interface ErrorResponse {
  error: string
  code: string
  details?: Record<string, any>
  timestamp: string
}

// Server action result types
export interface ActionSuccess<T = any> {
  success: true
  data: T
}

export interface ActionError {
  success: false
  error: string
  code: string
  details?: Record<string, any>
}

export type ActionResult<T = any> = ActionSuccess<T> | ActionError

// Helper function to handle server action errors
export function handleServerActionError(error: unknown): ActionError {
  console.error('Server action error:', error)
  
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    }
  }
  
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'SERVER_ERROR',
    }
  }
  
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

// Helper function to create success result
export function createSuccessResult<T>(data: T): ActionSuccess<T> {
  return {
    success: true,
    data,
  }
}

// Helper function to create error result
export function createErrorResult(
  error: string,
  code: string = 'SERVER_ERROR',
  details?: Record<string, any>
): ActionError {
  return {
    success: false,
    error,
    code,
    details,
  }
}

// Validation error formatter for Zod errors
export function formatValidationErrors(errors: any[]): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  errors.forEach((error) => {
    const path = error.path.join('.')
    formattedErrors[path] = error.message
  })
  
  return formattedErrors
}

// Database error handler
export function handleDatabaseError(error: any): DatabaseError {
  // Handle Supabase/PostgreSQL specific errors
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return new DatabaseError('A record with this information already exists', {
          constraint: error.constraint,
          detail: error.detail,
        })
      case '23503': // foreign_key_violation
        return new DatabaseError('Referenced record does not exist', {
          constraint: error.constraint,
          detail: error.detail,
        })
      case '23502': // not_null_violation
        return new DatabaseError('Required field is missing', {
          column: error.column,
          detail: error.detail,
        })
      case '42P01': // undefined_table
        return new DatabaseError('Database table not found', {
          detail: error.detail,
        })
      default:
        return new DatabaseError(error.message || 'Database operation failed', {
          code: error.code,
          detail: error.detail,
        })
    }
  }
  
  return new DatabaseError(error.message || 'Database operation failed')
}

// Auth error handler
export function handleAuthError(error: any): AppError {
  if (error.message?.includes('Invalid login credentials')) {
    return new AuthenticationError('Invalid email or password')
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return new AuthenticationError('Please confirm your email address')
  }
  
  if (error.message?.includes('User not found')) {
    return new AuthenticationError('User account not found')
  }
  
  if (error.message?.includes('JWT expired')) {
    return new AuthenticationError('Session expired, please login again')
  }
  
  return new AuthenticationError(error.message || 'Authentication failed')
}

// File upload error handler
export function handleUploadError(error: any): AppError {
  if (error.message?.includes('File too large')) {
    return new ValidationError('File size exceeds the maximum limit')
  }
  
  if (error.message?.includes('Invalid file type')) {
    return new ValidationError('File type not supported')
  }
  
  if (error.message?.includes('Upload failed')) {
    return new ExternalServiceError('File Storage', 'Failed to upload file')
  }
  
  return new AppError(error.message || 'File upload failed', 'UPLOAD_ERROR', 500)
}

// Global error boundary error handler
export function handleGlobalError(error: Error, errorInfo?: any): ErrorResponse {
  console.error('Global error:', error, errorInfo)
  
  return {
    error: 'An unexpected error occurred. Please try again.',
    code: 'GLOBAL_ERROR',
    timestamp: new Date().toISOString(),
  }
}

// Rate limiting error
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests. Please try again later.', 'RATE_LIMIT_ERROR', 429, {
      retryAfter,
    })
    this.name = 'RateLimitError'
  }
}

// Maintenance mode error
export class MaintenanceError extends AppError {
  constructor() {
    super('Service temporarily unavailable for maintenance', 'MAINTENANCE_ERROR', 503)
    this.name = 'MaintenanceError'
  }
}