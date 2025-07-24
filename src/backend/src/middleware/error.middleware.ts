/**
 * Express.js 5.1.0 Error Handling Middleware for Node.js Tutorial Application
 * 
 * This module provides comprehensive error processing, standardized error responses, and 
 * security-conscious error management for the Node.js tutorial application. It integrates 
 * with Express.js 5.1.0's enhanced error handling capabilities including automatic promise 
 * rejection handling, implements security best practices for error response formatting, and 
 * provides centralized error processing with environment-specific behavior.
 * 
 * Serves as the final error handling layer in the Express.js middleware stack, ensuring all 
 * errors are properly logged, formatted, and returned to clients with appropriate security 
 * considerations while maintaining comprehensive error correlation and monitoring integration.
 * 
 * Features:
 * - Express.js 5.1.0 enhanced error handling with automatic promise rejection processing
 * - Security-conscious error response formatting to prevent information disclosure
 * - Environment-specific error behavior (detailed development vs secure production)
 * - Comprehensive error logging with correlation tracking and context information
 * - Standardized error response structures for consistent API behavior
 * - Validation error handling with field-specific error details for client integration
 * - HTTP header management for secure error responses and security policy compliance
 * - Integration with monitoring and observability systems for incident response
 * - Type-safe error handling with TypeScript interfaces and comprehensive validation
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates modern Node.js error handling patterns and Express.js 5.1.0 features
 */

// Import Express.js types for middleware and request/response handling
import { Request, Response, NextFunction } from 'express'; // ^5.1.0

// Import custom error handling utilities and error classes
import {
  AppError,
  formatErrorResponse,
  isCustomError,
  isOperationalError,
  sanitizeErrorForProduction,
  generateErrorId,
  ValidationDetails,
  ErrorContext as UtilsErrorContext
} from '../utils/errors';

// Import centralized logging system for comprehensive error tracking
import { logger } from '../utils/logger';

// Import HTTP status codes and standardized response messages
import { 
  HTTP_STATUS, 
  RESPONSE_MESSAGES 
} from '../config/constants';

// Import environment configuration for environment-specific error handling
import { config } from '../config/environment';

// Import TypeScript interfaces for type-safe error handling
import {
  ErrorHandler,
  ErrorResponse,
  AsyncRequestHandler,
  RequestHandler
} from '../types';

/**
 * Global Error Middleware Configuration Constants
 * 
 * Defines default error settings and middleware identification for consistent error handling
 * across the application with const assertions for immutable literal types and enhanced type safety.
 */

/** Default HTTP status code for unspecified errors - uses INTERNAL_SERVER_ERROR */
export const DEFAULT_ERROR_STATUS = HTTP_STATUS.INTERNAL_SERVER_ERROR;

/** Default error message for unspecified errors - uses standardized internal error message */
export const DEFAULT_ERROR_MESSAGE = RESPONSE_MESSAGES.INTERNAL_ERROR;

/** Error middleware identification name for logging and debugging purposes */
export const ERROR_MIDDLEWARE_NAME = 'ErrorMiddleware' as const;

/**
 * Error Context Interface for Request Correlation and Tracking
 * 
 * Comprehensive error context interface that provides detailed error information including
 * request correlation data, timing information, and environmental context for enhanced
 * debugging, monitoring, and incident response capabilities.
 */
export interface ErrorContext {
  /** Unique error identifier for correlation and tracking across distributed systems */
  readonly errorId: string;
  
  /** Request correlation identifier for tracing request flows (optional) */
  readonly requestId?: string;
  
  /** Request path where the error occurred for location tracking */
  readonly path: string;
  
  /** HTTP method of the request that generated the error */
  readonly method: string;
  
  /** Client user agent string for browser/client identification (optional) */
  readonly userAgent?: string;
  
  /** Client IP address for security tracking and analysis (optional) */
  readonly ip?: string;
  
  /** Error occurrence timestamp in ISO format for temporal analysis */
  readonly timestamp: string;
}

/**
 * Error Metrics Interface for Performance Monitoring and Analysis
 * 
 * Comprehensive error metrics interface for tracking error patterns, performance impact,
 * and system health indicators to support monitoring systems, alerting infrastructure,
 * and operational visibility for production error management.
 */
export interface ErrorMetrics {
  /** Total error count for monitoring and trending analysis */
  readonly errorCount: number;
  
  /** Error rate percentage for health and performance tracking */
  readonly errorRate: number;
  
  /** Timestamp of last error occurrence for recency tracking */
  readonly lastErrorTime: string;
  
  /** Error count categorized by error type for pattern analysis */
  readonly errorsByType: Record<string, number>;
}

/**
 * Main Express.js 5.1.0 Error Handling Middleware Function
 * 
 * Processes all application errors with comprehensive error formatting, standardized response
 * generation, and integration with logging and monitoring systems. Implements security-conscious
 * error handling with environment-specific behavior and comprehensive error correlation tracking
 * while integrating seamlessly with Express.js 5.1.0's enhanced error handling capabilities.
 * 
 * @param error - Error object (custom AppError or generic Error)
 * @param req - Express.js Request object with enhanced properties
 * @param res - Express.js Response object for client communication
 * @param next - Express.js NextFunction for middleware chain continuation
 * @returns No return value, sends error response to client and performs comprehensive logging
 */
export const errorHandler: ErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique error ID for correlation and tracking using generateErrorId utility
  const errorId = generateErrorId();
  
  // Extract request correlation information including requestId, path, and method
  const requestId = req.requestId || 'unknown';
  const requestPath = req.path || req.url || 'unknown';
  const requestMethod = req.method || 'UNKNOWN';
  const userAgent = req.get('User-Agent');
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Create comprehensive error context for logging and monitoring
  const errorContext: ErrorContext = {
    errorId,
    requestId,
    path: requestPath,
    method: requestMethod,
    userAgent,
    ip: clientIp,
    timestamp: new Date().toISOString()
  };
  
  // Determine error type using isCustomError type guard for proper handling
  const isCustom = isCustomError(error);
  
  // Apply environment-specific error sanitization using sanitizeErrorForProduction
  const sanitizedError = config.isProduction ? 
    sanitizeErrorForProduction(error) : 
    (isCustom ? error.toJSON() : { name: error.name, message: error.message, stack: error.stack });
  
  // Log error with comprehensive context using logger.error with correlation information
  logErrorDetails(error, errorId, req);
  
  // Format standardized error response using formatErrorResponse utility
  const errorResponse = formatErrorResponse(
    error,
    requestId,
    requestPath,
    requestMethod
  );
  
  // Set appropriate HTTP status code based on error type or default to 500
  const statusCode = isCustom ? error.statusCode : DEFAULT_ERROR_STATUS;
  
  // Handle response already sent scenarios to prevent Express.js errors
  if (res.headersSent) {
    logger.warn('Error occurred after headers were sent', {
      errorId,
      requestId,
      path: requestPath,
      method: requestMethod,
      statusCode
    });
    return next(error);
  }
  
  // Set security headers to prevent information disclosure in error responses
  setErrorHeaders(res, statusCode);
  
  // Send JSON error response to client with standardized ErrorResponse structure
  res.status(statusCode).json(errorResponse);
  
  // Update error metrics and monitoring information for observability systems
  logger.info('Error response sent to client', {
    errorId,
    requestId,
    statusCode,
    path: requestPath,
    method: requestMethod,
    isOperational: isCustom ? error.isOperational : false,
    errorType: isCustom ? error.constructor.name : error.constructor.name
  });
};

/**
 * Express.js Middleware for 404 Not Found Error Handling
 * 
 * Handles 404 Not Found errors for unmatched routes with standardized not found responses,
 * proper error formatting, and logging integration for comprehensive request tracking and
 * monitoring of undefined routes and potential security scanning attempts.
 * 
 * @param req - Express.js Request object for unmatched route
 * @param res - Express.js Response object for 404 response
 * @param next - Express.js NextFunction for error forwarding
 * @returns No return value, sends 404 error response to client with standardized formatting
 */
export const notFoundHandler: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique error ID for 404 error correlation and tracking
  const errorId = generateErrorId();
  
  // Extract request information including path, method, and headers
  const requestId = req.requestId || 'unknown';
  const requestPath = req.path || req.url || 'unknown';
  const requestMethod = req.method || 'GET';
  const userAgent = req.get('User-Agent');
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Create standardized 404 Not Found error using HTTP_STATUS.NOT_FOUND
  const notFoundMessage = `Cannot ${requestMethod} ${requestPath}`;
  
  // Log not found request with request details for monitoring and analytics
  logger.warn('Route not found', {
    errorId,
    requestId,
    path: requestPath,
    method: requestMethod,
    userAgent,
    ip: clientIp,
    message: notFoundMessage,
    timestamp: new Date().toISOString()
  });
  
  // Format 404 error response using standardized ErrorResponse structure
  const errorResponse: ErrorResponse = {
    error: RESPONSE_MESSAGES.NOT_FOUND,
    statusCode: HTTP_STATUS.NOT_FOUND,
    timestamp: new Date().toISOString(),
    requestId,
    path: requestPath,
    method: requestMethod
  };
  
  // Set 404 HTTP status code and appropriate response headers
  setErrorHeaders(res, HTTP_STATUS.NOT_FOUND);
  
  // Send JSON error response with consistent error format
  res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse);
  
  // Update request metrics for monitoring and observability systems
  logger.info('404 Not Found response sent', {
    errorId,
    requestId,
    statusCode: HTTP_STATUS.NOT_FOUND,
    path: requestPath,
    method: requestMethod
  });
};

/**
 * Higher-Order Function for Async Handler Error Wrapping
 * 
 * Wraps async route handlers and middleware to automatically catch and forward promise rejections
 * to Express.js 5.1.0 error handling middleware. Eliminates the need for manual try-catch blocks
 * in async handlers while ensuring proper error propagation through the Express.js middleware stack.
 * 
 * @param handler - Async request handler function to wrap with error catching
 * @returns Wrapped request handler with automatic error catching and Express.js error forwarding
 */
export const asyncErrorHandler = (handler: AsyncRequestHandler): RequestHandler => {
  // Return wrapped middleware function that accepts req, res, next parameters
  return (req: Request, res: Response, next: NextFunction): void => {
    // Execute original async handler within Promise.resolve for consistent promise handling
    Promise.resolve(handler(req, res, next))
      // Catch any promise rejections or thrown errors from the async handler
      .catch((error: Error) => {
        // Generate error ID for tracking
        const errorId = generateErrorId();
        
        // Log async error with context
        logger.error('Async handler error caught', {
          errorId,
          requestId: req.requestId || 'unknown',
          path: req.path || req.url || 'unknown',
          method: req.method || 'UNKNOWN',
          error: error.message,
          stack: config.isDevelopment ? error.stack : undefined
        });
        
        // Forward caught errors to Express.js error handling middleware using next(error)
        next(error);
      });
  };
};

/**
 * Specialized Validation Error Handler
 * 
 * Handles validation errors with field-specific formatting and user-friendly error responses.
 * Integrates with validation middleware to provide detailed validation feedback for client-side
 * form handling and field-specific error display while maintaining security considerations.
 * 
 * @param validationError - ValidationError object with field-specific details
 * @param requestId - Request correlation identifier for error tracking
 * @returns Formatted validation error response with field-specific details and client guidance
 */
export const handleValidationError = (
  validationError: any,
  requestId: string
): ErrorResponse => {
  // Extract validation details and field errors from ValidationError instance
  const validationDetails: ValidationDetails = validationError.validationDetails || {
    fields: { general: ['Validation failed'] }
  };
  
  // Format field-specific error messages for client-side form handling
  const fieldErrors: Record<string, string[]> = {};
  
  for (const [fieldName, errors] of Object.entries(validationDetails.fields)) {
    if (Array.isArray(errors) && errors.length > 0) {
      fieldErrors[fieldName] = errors;
    }
  }
  
  // Create standardized error response with 400 Bad Request status code
  const errorResponse: ErrorResponse = {
    error: validationError.message || RESPONSE_MESSAGES.BAD_REQUEST,
    statusCode: HTTP_STATUS.BAD_REQUEST,
    timestamp: new Date().toISOString(),
    requestId,
    path: 'validation',
    method: 'VALIDATION'
  };
  
  // Include validation context and failed validation rules in response
  if (Object.keys(fieldErrors).length > 0) {
    (errorResponse as any).validationErrors = fieldErrors;
  }
  
  // Add request correlation information for error tracking
  (errorResponse as any).errorId = generateErrorId();
  
  // Apply security filtering to prevent sensitive validation data exposure
  if (config.isProduction) {
    // Remove potentially sensitive validation details in production
    delete (errorResponse as any).validationErrors;
  }
  
  // Return formatted validation error response for client consumption
  return errorResponse;
};

/**
 * Comprehensive Error Logging Function
 * 
 * Captures detailed error information including stack traces, request context, and environment-
 * specific details for debugging and monitoring purposes. Provides comprehensive error logging
 * with structured information for incident response and operational visibility.
 * 
 * @param error - Error object (custom AppError or generic Error)
 * @param errorId - Unique error identifier for correlation
 * @param req - Express.js Request object for context extraction
 * @returns No return value, performs comprehensive logging with structured context information
 */
export const logErrorDetails = (
  error: Error | AppError,
  errorId: string,
  req: Request
): void => {
  // Determine error severity level based on error type and operational classification
  const isCustom = isCustomError(error);
  const isOperational = isOperationalError(error);
  const severity = isOperational ? 'medium' : 'high';
  
  // Extract comprehensive request context including headers, parameters, and body
  const requestContext = {
    requestId: req.requestId || 'unknown',
    method: req.method,
    path: req.path || req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    headers: config.isDevelopment ? req.headers : undefined,
    query: config.isDevelopment ? req.query : undefined,
    params: config.isDevelopment ? req.params : undefined
  };
  
  // Sanitize request data to remove sensitive information before logging
  const sanitizedContext = {
    ...requestContext,
    headers: requestContext.headers ? sanitizeHeaders(requestContext.headers) : undefined
  };
  
  // Include error correlation ID and request tracking information
  const errorDetails = {
    errorId,
    errorName: error.name,
    errorMessage: error.message,
    statusCode: isCustom ? error.statusCode : DEFAULT_ERROR_STATUS,
    code: isCustom ? error.code : 'INTERNAL_ERROR',
    severity,
    isOperational,
    isCustomError: isCustom,
    timestamp: new Date().toISOString(),
    request: sanitizedContext
  };
  
  // Add environment-specific error details based on configuration
  if (config.isDevelopment && error.stack) {
    (errorDetails as any).stack = error.stack;
  }
  
  if (isCustom && error.details) {
    (errorDetails as any).errorDetails = error.details;
  }
  
  // Format error information for structured logging with monitoring integration
  const logMessage = `${ERROR_MIDDLEWARE_NAME}: ${error.name} - ${error.message}`;
  
  // Log error using appropriate logger level (error, warn) based on severity
  if (severity === 'critical' || severity === 'high') {
    logger.error(logMessage, errorDetails);
  } else {
    logger.warn(logMessage, errorDetails);
  }
  
  // Include stack trace and debugging information in development environment
  if (config.isDevelopment && error.stack) {
    logger.debug('Error stack trace', {
      errorId,
      stack: error.stack
    });
  }
};

/**
 * HTTP Header Management for Error Responses
 * 
 * Sets appropriate HTTP headers for error responses including security headers, content type,
 * and cache control to ensure secure error handling and prevent information disclosure while
 * maintaining proper HTTP protocol compliance and security policy adherence.
 * 
 * @param res - Express.js Response object for header modification
 * @param statusCode - HTTP status code for error-specific header configuration
 * @returns No return value, modifies response headers for secure error response delivery
 */
export const setErrorHeaders = (res: Response, statusCode: number): void => {
  // Set Content-Type header to application/json for consistent error response format
  res.set('Content-Type', 'application/json; charset=utf-8');
  
  // Add Cache-Control headers to prevent error response caching
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  // Set security headers to prevent information disclosure and XSS attacks
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Add error-specific headers based on status code and error type
  if (statusCode >= 500) {
    // Server error headers
    res.set('X-Error-Type', 'server-error');
  } else if (statusCode >= 400) {
    // Client error headers
    res.set('X-Error-Type', 'client-error');
  }
  
  // Include correlation headers for request tracking and debugging
  res.set('X-Error-Timestamp', new Date().toISOString());
  
  // Apply environment-specific header configuration for security
  if (config.isProduction) {
    // Production-specific security headers
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
};

/**
 * Utility Function for Sanitizing HTTP Headers
 * 
 * Sanitizes HTTP headers to remove sensitive information such as authorization tokens,
 * cookies, and API keys before including in log output. Ensures secure logging practices
 * while maintaining useful debugging information for operational visibility.
 * 
 * @param headers - HTTP headers object to sanitize
 * @returns Sanitized headers object safe for logging
 */
function sanitizeHeaders(headers: any): any {
  const sensitiveHeaders = [
    'authorization', 'cookie', 'x-api-key', 'x-auth-token',
    'access-token', 'refresh-token', 'x-csrf-token'
  ];
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveHeaders.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Type Definitions for Enhanced Type Safety
 * 
 * TypeScript utility types for error middleware components providing compile-time
 * type checking and enhanced developer experience with IntelliSense support.
 */

/** Type definition for Express.js 5.1.0 error middleware functions */
export type ErrorMiddleware = (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;

/** Type definition for async handler wrapper functions */
export type AsyncHandler<T extends AsyncRequestHandler> = (handler: T) => RequestHandler;

/**
 * Export All Error Handling Components
 * 
 * Comprehensive exports for all error handling middleware, utility functions, interfaces,
 * and type definitions for use throughout the application and integration with Express.js 5.1.0.
 */

// Export main error handling middleware functions
export {
  errorHandler as default,
  notFoundHandler,
  asyncErrorHandler,
  handleValidationError,
  logErrorDetails,
  setErrorHeaders
};

// Export TypeScript interfaces for enhanced type safety
export type {
  ErrorContext,
  ErrorMetrics,
  ErrorMiddleware,
  AsyncHandler
};

// Export constants for middleware identification and configuration
export {
  DEFAULT_ERROR_STATUS,
  DEFAULT_ERROR_MESSAGE,
  ERROR_MIDDLEWARE_NAME
};