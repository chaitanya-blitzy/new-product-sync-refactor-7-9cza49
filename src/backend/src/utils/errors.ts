/**
 * Comprehensive Error Handling Utility Module for Node.js Tutorial Application
 * 
 * This module provides custom error classes, error formatting functions, type guards, and error 
 * management utilities that integrate with Express.js 5.1.0's enhanced error handling capabilities.
 * Implements security-conscious error response formatting, environment-specific error detail levels,
 * and centralized error creation and management patterns for modern Node.js applications.
 * 
 * Features:
 * - Custom error classes with HTTP status codes and error categorization
 * - Security-conscious error response formatting to prevent information disclosure
 * - Environment-specific error detail levels (development vs production)
 * - Express.js 5.1.0 integration with automatic promise rejection handling
 * - Comprehensive error factory functions for consistent error creation
 * - Type-safe error handling with TypeScript interfaces and type guards
 * - Request correlation and error tracking for monitoring systems
 * - Field-specific validation error handling for client-side integration
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x
 * @requires Express.js 5.1.0
 * @educational Demonstrates modern TypeScript error handling patterns
 */

// Import HTTP status codes for standardized error responses
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  ERROR_CODES
} from '../config/constants';

// Import environment configuration for environment-specific error handling
import { config } from '../config/environment';

// Import custom error interfaces for type-safe error handling
import type {
  CustomError,
  ErrorResponse
} from '../types';

/**
 * Global Error Configuration Constants
 * 
 * Defines default error settings and severity levels for consistent error handling
 * across the application with const assertions for immutable literal types.
 */

/** Default HTTP status code for unspecified errors */
export const DEFAULT_ERROR_STATUS = HTTP_STATUS.INTERNAL_SERVER_ERROR;

/** Default error message for unspecified errors */
export const DEFAULT_ERROR_MESSAGE = RESPONSE_MESSAGES.INTERNAL_ERROR;

/** Error severity levels for categorization and handling priority */
export const ERROR_SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

/**
 * TypeScript Interface Definitions
 * 
 * Defines structured interfaces for validation details, authentication context,
 * authorization context, rate limiting information, and error context.
 */

/**
 * Validation details interface for field-specific error information
 * Supports both single field and multiple field validation errors
 */
export interface ValidationDetails {
  /** Mapping of field names to validation error messages */
  fields: Record<string, string[]>;
  /** Validation rules that were applied (optional) */
  rules?: Record<string, any>;
  /** Additional validation context (optional) */
  context?: any;
}

/**
 * Authentication context interface for authentication error tracking
 * Provides comprehensive authentication failure information
 */
export interface AuthenticationContext {
  /** Authentication method that failed */
  method: string;
  /** Reason for authentication failure */
  reason: string;
  /** Timestamp of authentication attempt */
  timestamp: string;
}

/**
 * Authorization context interface for access control error tracking
 * Contains detailed authorization failure information for audit trails
 */
export interface AuthorizationContext {
  /** Resource that was accessed */
  resource: string;
  /** Action that was attempted */
  action: string;
  /** Permissions required for the action */
  requiredPermissions: string[];
}

/**
 * Rate limit context interface for rate limiting error information
 * Provides client guidance on when to retry requests
 */
export interface RateLimitContext {
  /** Rate limit threshold */
  limit: number;
  /** Rate limit window in milliseconds */
  window: number;
  /** Seconds until retry is allowed */
  retryAfter: number;
  /** Remaining requests in current window */
  remaining: number;
}

/**
 * Error context interface for comprehensive error tracking
 * Enables detailed error information for logging and monitoring
 */
export interface ErrorContext {
  /** Request correlation identifier (optional) */
  requestId?: string;
  /** User identifier for error tracking (optional) */
  userId?: string;
  /** Route where error occurred (optional) */
  route?: string;
  /** HTTP method of failed request (optional) */
  method?: string;
  /** Additional error context metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Base Custom Error Class
 * 
 * AppError serves as the foundational custom error class that extends the native Error class
 * with HTTP status codes, error codes, and operational error classification. Integrates with
 * Express.js 5.1.0 error handling and provides consistent error structure throughout the application.
 */
export class AppError extends Error implements CustomError {
  /** HTTP status code for response formatting */
  public readonly statusCode: number;
  
  /** Application-specific error code for categorization */
  public readonly code: string;
  
  /** Flag indicating this is an operational error (expected application error) */
  public readonly isOperational: boolean;
  
  /** Additional error details and context information */
  public readonly details: any;
  
  /** Error occurrence timestamp for tracking */
  public readonly timestamp: string;

  /**
   * Initializes AppError instance with message, HTTP status code, error code, and optional details
   * Sets up error properties for proper error handling and response formatting with Express.js integration
   * 
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code for response (default: 500)
   * @param code - Application-specific error code (default: INTERNAL_ERROR)
   * @param details - Optional additional error context and details
   */
  constructor(
    message: string,
    statusCode: number = DEFAULT_ERROR_STATUS,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details: any = null
  ) {
    // Call parent Error constructor with error message
    super(message);
    
    // Set error name to 'AppError' for identification
    this.name = 'AppError';
    
    // Assign HTTP status code for response formatting
    this.statusCode = statusCode;
    
    // Set application-specific error code for categorization
    this.code = code;
    
    // Mark error as operational for error handling classification
    this.isOperational = true;
    
    // Include optional details object for additional context
    this.details = details;
    
    // Add timestamp for error tracking and correlation
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace for debugging in development environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Serializes AppError instance to JSON format for API responses and logging
   * Provides consistent error serialization with environment-specific detail levels
   * 
   * @returns JSON representation of error with appropriate detail level
   */
  toJSON(): object {
    // Create base error object with essential properties
    const errorObject: any = {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp,
      isOperational: this.isOperational
    };
    
    // Include details object if present and appropriate for environment
    if (this.details) {
      errorObject.details = this.details;
    }
    
    // Exclude stack trace in production environments for security
    if (config.isDevelopment && this.stack) {
      errorObject.stack = this.stack;
    }
    
    // Return serialized error object for JSON transmission
    return errorObject;
  }

  /**
   * Provides string representation of AppError for logging and debugging purposes
   * Formats error information in human-readable format with appropriate detail levels
   * 
   * @returns String representation of error with context information
   */
  toString(): string {
    // Format error name and message for readability
    let errorString = `${this.name}: ${this.message}`;
    
    // Include HTTP status code and error code in string format
    errorString += ` (Status: ${this.statusCode}, Code: ${this.code})`;
    
    // Add timestamp and operational status information
    errorString += ` [${this.timestamp}] ${this.isOperational ? 'Operational' : 'Programming'} Error`;
    
    // Include stack trace in development environments only
    if (config.isDevelopment && this.stack) {
      errorString += `\nStack: ${this.stack}`;
    }
    
    // Return formatted string representation for logging
    return errorString;
  }
}

/**
 * Specialized Validation Error Class
 * 
 * ValidationError extends AppError with field-specific validation details and user-friendly
 * error formatting. Supports both single field and multiple field validation errors with
 * structured error information for client-side form handling and validation feedback.
 */
export class ValidationError extends AppError {
  /** Field-specific validation details and error information */
  public readonly validationDetails: ValidationDetails;
  
  /** Processed field error mapping for easy client consumption */
  public readonly fieldErrors: object;

  /**
   * Initializes ValidationError instance with validation message and field-specific details
   * Sets up validation error properties for proper client-side error handling and form validation
   * 
   * @param message - Validation error message
   * @param validationDetails - Field-specific validation error information
   */
  constructor(message: string, validationDetails: ValidationDetails) {
    // Call parent AppError constructor with 400 Bad Request status
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, validationDetails);
    
    // Set error name to 'ValidationError' for identification
    this.name = 'ValidationError';
    
    // Store validation details for field-specific error information
    this.validationDetails = validationDetails;
    
    // Process validation details into field error mapping for client consumption
    this.fieldErrors = this.processFieldErrors();
  }

  /**
   * Extracts and formats field-specific validation errors for client-side consumption
   * Provides structured error information that can be easily mapped to form fields
   * 
   * @returns Object mapping field names to validation error messages
   */
  getFieldErrors(): object {
    return this.fieldErrors;
  }

  /**
   * Checks whether a specific field has validation errors
   * Provides utility method for conditional error handling and field-specific validation logic
   * 
   * @param fieldName - Name of the field to check
   * @returns True if field has validation errors, false otherwise
   */
  hasFieldError(fieldName: string): boolean {
    // Check validation details for specified field name
    return !!(this.validationDetails.fields[fieldName] && 
             this.validationDetails.fields[fieldName].length > 0);
  }

  /**
   * Retrieves validation error message for a specific field
   * Provides access to individual field validation errors for targeted error display
   * 
   * @param fieldName - Name of the field to get error for
   * @returns Validation error message for the field, or undefined if no error
   */
  getFieldError(fieldName: string): string | undefined {
    // Look up field name in validation details
    const fieldErrors = this.validationDetails.fields[fieldName];
    
    // Return first error message or undefined if no errors
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
  }

  /**
   * Private helper method to process validation details into field error mapping
   * Creates structured field error object for client-side consumption
   * 
   * @returns Processed field error mapping object
   */
  private processFieldErrors(): object {
    const fieldErrors: Record<string, string[]> = {};
    
    // Extract field names and error messages from validation details
    for (const [fieldName, errors] of Object.entries(this.validationDetails.fields)) {
      if (errors && errors.length > 0) {
        fieldErrors[fieldName] = errors;
      }
    }
    
    // Return structured field error object for client consumption
    return fieldErrors;
  }
}

/**
 * Error Factory Functions
 * 
 * Provides factory functions for creating standardized application errors with consistent
 * structure, HTTP status codes, and error categorization. Enables consistent error creation
 * patterns throughout the application with proper typing and validation.
 */

/**
 * Creates standardized application errors with HTTP status codes and error codes
 * Provides consistent error creation patterns throughout the application with proper typing
 * 
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code for response
 * @param code - Application-specific error code
 * @param details - Optional additional error context
 * @returns Standardized application error instance with HTTP status and error code
 */
export function createAppError(
  message: string,
  statusCode: number,
  code: string,
  details?: any
): AppError {
  // Validate input parameters for message, status code, and error code
  if (!message || typeof message !== 'string') {
    throw new Error('Error message is required and must be a string');
  }
  
  if (!statusCode || typeof statusCode !== 'number') {
    statusCode = DEFAULT_ERROR_STATUS;
  }
  
  if (!code || typeof code !== 'string') {
    code = ERROR_CODES.INTERNAL_ERROR;
  }
  
  // Create new AppError instance with provided parameters
  const error = new AppError(message, statusCode, code, details);
  
  // Return configured AppError instance ready for throwing or handling
  return error;
}

/**
 * Creates specialized validation errors for input validation failures
 * Supports both single field and multiple field validation errors with structured information
 * 
 * @param message - Validation error message
 * @param validationDetails - Field-specific validation error details
 * @returns Validation error instance with field-specific error details
 */
export function createValidationError(
  message: string,
  validationDetails: ValidationDetails
): ValidationError {
  // Validate message parameter
  if (!message || typeof message !== 'string') {
    message = RESPONSE_MESSAGES.BAD_REQUEST;
  }
  
  // Validate validation details structure
  if (!validationDetails || typeof validationDetails !== 'object' || !validationDetails.fields) {
    validationDetails = {
      fields: { general: ['Invalid input provided'] }
    };
  }
  
  // Create ValidationError instance extending AppError with 400 status code
  const error = new ValidationError(message, validationDetails);
  
  // Return ValidationError instance with comprehensive validation information
  return error;
}

/**
 * Creates standardized 404 Not Found errors for missing resources
 * Provides uniform not found error handling across all application endpoints
 * 
 * @param resource - Type of resource that was not found (optional)
 * @param identifier - Specific identifier that was not found (optional)
 * @returns Not found error instance with 404 status code and resource context
 */
export function createNotFoundError(
  resource?: string,
  identifier?: string
): AppError {
  // Format error message with resource type and identifier if provided
  let message = RESPONSE_MESSAGES.NOT_FOUND;
  
  if (resource) {
    message = `${resource} not found`;
    if (identifier) {
      message += ` with identifier: ${identifier}`;
    }
  }
  
  // Create AppError instance with 404 NOT_FOUND status code
  const error = createAppError(
    message,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND_ERROR,
    { resource, identifier }
  );
  
  // Return configured not found error instance
  return error;
}

/**
 * Creates 401 Unauthorized errors for authentication failures
 * Uses security-conscious error messaging to prevent information disclosure
 * 
 * @param message - Custom authentication error message (optional)
 * @param context - Authentication context for internal logging (optional)
 * @returns Unauthorized error instance with 401 status code and authentication context
 */
export function createUnauthorizedError(
  message?: string,
  context?: AuthenticationContext
): AppError {
  // Use generic authentication error message to prevent information disclosure
  const errorMessage = message || 'Authentication required';
  
  // Include authentication context for internal logging and debugging
  const errorDetails = context ? {
    authenticationContext: context,
    timestamp: new Date().toISOString()
  } : null;
  
  // Create AppError instance with 401 UNAUTHORIZED status code
  const error = createAppError(
    errorMessage,
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTHENTICATION_ERROR,
    errorDetails
  );
  
  // Return configured unauthorized error instance
  return error;
}

/**
 * Creates 403 Forbidden errors for authorization failures
 * Maintains security by not disclosing specific authorization details to clients
 * 
 * @param message - Custom authorization error message (optional)
 * @param context - Authorization context for internal audit and logging (optional)
 * @returns Forbidden error instance with 403 status code and authorization context
 */
export function createForbiddenError(
  message?: string,
  context?: AuthorizationContext
): AppError {
  // Use generic authorization error message for security
  const errorMessage = message || 'Access forbidden';
  
  // Include authorization context for internal audit and logging
  const errorDetails = context ? {
    authorizationContext: context,
    timestamp: new Date().toISOString()
  } : null;
  
  // Create AppError instance with 403 FORBIDDEN status code
  const error = createAppError(
    errorMessage,
    HTTP_STATUS.FORBIDDEN,
    ERROR_CODES.AUTHORIZATION_ERROR,
    errorDetails
  );
  
  // Return configured forbidden error instance
  return error;
}

/**
 * Creates 429 Too Many Requests errors for rate limiting violations
 * Provides client guidance on when to retry requests while maintaining rate limiting effectiveness
 * 
 * @param message - Custom rate limit error message (optional)
 * @param rateLimitInfo - Rate limit context with retry information (optional)
 * @returns Rate limit error instance with 429 status code and retry information
 */
export function createRateLimitError(
  message?: string,
  rateLimitInfo?: RateLimitContext
): AppError {
  // Format error message with retry guidance for clients
  const errorMessage = message || RESPONSE_MESSAGES.TOO_MANY_REQUESTS;
  
  // Include rate limit context with retry-after information
  const errorDetails = rateLimitInfo ? {
    rateLimitContext: rateLimitInfo,
    retryAfter: rateLimitInfo.retryAfter,
    timestamp: new Date().toISOString()
  } : null;
  
  // Create AppError instance with 429 TOO_MANY_REQUESTS status code
  const error = createAppError(
    errorMessage,
    HTTP_STATUS.TOO_MANY_REQUESTS,
    ERROR_CODES.RATE_LIMIT_ERROR,
    errorDetails
  );
  
  // Return configured rate limit error instance
  return error;
}

/**
 * Error Response Formatting and Utilities
 * 
 * Provides utilities for formatting error objects into standardized API responses,
 * type guards for error identification, and error management functions with
 * environment-specific behavior and security considerations.
 */

/**
 * Formats error objects into standardized API error responses
 * Integrates with Express.js response formatting and implements security-conscious information disclosure prevention
 * 
 * @param error - Error object (custom or generic Error)
 * @param requestId - Request correlation identifier
 * @param path - Request path where error occurred
 * @param method - HTTP method of the request
 * @returns Standardized error response object ready for client transmission
 */
export function formatErrorResponse(
  error: Error | CustomError,
  requestId: string,
  path: string,
  method: string
): ErrorResponse {
  // Determine error type and extract relevant error information
  const isCustom = isCustomError(error);
  
  // Apply environment-specific error detail filtering for security
  const statusCode = isCustom ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorMessage = isCustom ? error.message : RESPONSE_MESSAGES.INTERNAL_ERROR;
  
  // Create standardized error response structure with ErrorResponse interface
  const errorResponse: ErrorResponse = {
    error: errorMessage,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId,
    path,
    method
  };
  
  // Return formatted error response object for client transmission
  return errorResponse;
}

/**
 * Type guard function that determines whether an error object is a custom application error
 * Enables proper error handling and response formatting based on error type
 * 
 * @param error - Unknown error object to check
 * @returns True if error is a custom application error, false for generic errors
 */
export function isCustomError(error: unknown): error is CustomError {
  // Check if error object exists and is an Error instance
  if (!error || typeof error !== 'object' || !(error instanceof Error)) {
    return false;
  }
  
  // Verify presence of custom error properties like statusCode and code
  const customError = error as any;
  
  // Check for isOperational property indicating custom application error
  const hasStatusCode = typeof customError.statusCode === 'number';
  const hasCode = typeof customError.code === 'string';
  const hasIsOperational = typeof customError.isOperational === 'boolean';
  
  // Return boolean result for type narrowing in error handling
  return hasStatusCode && hasCode && hasIsOperational;
}

/**
 * Determines whether an error is operational (expected application error) or programming error
 * Enables appropriate error handling strategies and logging levels based on error classification
 * 
 * @param error - Error object (custom or generic Error)
 * @returns True if error is operational, false if programming error
 */
export function isOperationalError(error: Error | CustomError): boolean {
  // Check if error is a custom error with isOperational property
  if (isCustomError(error)) {
    // Verify error has been explicitly marked as operational
    return error.isOperational === true;
  }
  
  // Consider error type and status code for operational classification
  // Generic errors are typically programming errors unless specified otherwise
  return false;
}

/**
 * Sanitizes error objects for production environments
 * Removes sensitive information, stack traces, and internal details while preserving essential error information
 * 
 * @param error - Error object (custom or generic Error)
 * @returns Sanitized error object safe for production client responses
 */
export function sanitizeErrorForProduction(error: Error | CustomError): object {
  // Check current environment using config.isProduction flag
  if (!config.isProduction) {
    // In development, return error with full details
    return isCustomError(error) ? error.toJSON() : {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  
  // Remove stack trace and internal error details in production
  const sanitizedError: any = {
    name: isCustomError(error) ? error.name : 'Error',
    message: isCustomError(error) ? error.message : RESPONSE_MESSAGES.INTERNAL_ERROR,
    timestamp: new Date().toISOString()
  };
  
  // Preserve essential error information like status code
  if (isCustomError(error)) {
    sanitizedError.statusCode = error.statusCode;
    sanitizedError.code = error.code;
    
    // Exclude debugging information and internal context
    // Only include safe details that don't expose sensitive information
    if (error.details && typeof error.details === 'object') {
      const safeDetails: any = {};
      
      // Filter out potentially sensitive details in production
      const allowedDetailKeys = ['validation', 'field', 'constraint'];
      for (const key of allowedDetailKeys) {
        if (error.details[key] !== undefined) {
          safeDetails[key] = error.details[key];
        }
      }
      
      if (Object.keys(safeDetails).length > 0) {
        sanitizedError.details = safeDetails;
      }
    }
  }
  
  // Return sanitized error object safe for client transmission
  return sanitizedError;
}

/**
 * Centralized error logging function with environment-specific detail levels
 * Integrates with the application logging system for comprehensive error tracking and monitoring
 * 
 * @param error - Error object (custom or generic Error)
 * @param requestId - Request correlation identifier (optional)
 * @param context - Additional error context information (optional)
 */
export function logError(
  error: Error | CustomError,
  requestId?: string,
  context?: ErrorContext
): void {
  // Determine error severity and classification for appropriate logging level
  const severity = isOperationalError(error) ? 'medium' : 'high';
  const isCustom = isCustomError(error);
  
  // Extract error context including request information
  const errorContext = {
    errorName: error.name,
    errorMessage: error.message,
    statusCode: isCustom ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: isCustom ? error.code : ERROR_CODES.INTERNAL_ERROR,
    severity,
    isOperational: isOperationalError(error),
    timestamp: new Date().toISOString(),
    requestId,
    ...context
  };
  
  // Include environment-specific error details based on configuration
  if (config.isDevelopment && error.stack) {
    (errorContext as any).stack = error.stack;
  }
  
  // Format error information for structured logging with correlation ID
  const logMessage = `[${errorContext.timestamp}] ${errorContext.errorName}: ${errorContext.errorMessage}`;
  const logDetails = `Status: ${errorContext.statusCode}, Code: ${errorContext.code}, Severity: ${errorContext.severity}`;
  
  // Log error using appropriate logging level based on severity
  if (severity === 'critical' || severity === 'high') {
    console.error(logMessage);
    console.error(logDetails);
    console.error('Context:', errorContext);
  } else if (severity === 'medium') {
    console.warn(logMessage);
    console.warn(logDetails);
    console.warn('Context:', errorContext);
  } else {
    console.info(logMessage);
    console.info(logDetails);
    console.info('Context:', errorContext);
  }
  
  // Include stack trace for detailed debugging in development
  if (config.isDevelopment && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Generates unique error identifiers for error correlation and tracking
 * Provides consistent error identification for monitoring, logging, and incident response
 * 
 * @returns Unique error identifier for correlation and tracking
 */
export function generateErrorId(): string {
  // Generate timestamp component for error identifier
  const timestamp = Date.now().toString(36);
  
  // Add random component for uniqueness across application instances
  const randomComponent = Math.random().toString(36).substring(2, 8);
  
  // Format identifier for readability and parsing
  const errorId = `err_${timestamp}_${randomComponent}`;
  
  // Return formatted error identifier for correlation tracking
  return errorId;
}

/**
 * Utility Types and Type Guards
 * 
 * Provides additional utility types and type guards for enhanced type safety
 * and error handling patterns with TypeScript integration.
 */

/** Generic type for error factory functions */
export type ErrorFactory<T extends AppError> = (...args: any[]) => T;

/** Type definition for error handling functions */
export type ErrorHandler = (error: Error | CustomError) => void;

/** Type definition for error formatting functions */
export type ErrorFormatter = (error: Error | CustomError, context: ErrorContext) => ErrorResponse;

/**
 * Export All Error Handling Components
 * 
 * Provides comprehensive exports for all error handling classes, functions, interfaces,
 * and utility types for use throughout the application.
 */

// Export error classes
export { AppError, ValidationError };

// Export error factory functions
export {
  createAppError,
  createValidationError, 
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createRateLimitError
};

// Export error utility functions
export {
  formatErrorResponse,
  isCustomError,
  isOperationalError,
  sanitizeErrorForProduction,
  logError,
  generateErrorId
};

// Export interfaces
export type {
  ValidationDetails,
  AuthenticationContext,
  AuthorizationContext,
  RateLimitContext,
  ErrorContext,
  ErrorFactory,
  ErrorHandler,
  ErrorFormatter
};

// Export constants
export {
  DEFAULT_ERROR_STATUS,
  DEFAULT_ERROR_MESSAGE,
  ERROR_SEVERITY_LEVELS
};