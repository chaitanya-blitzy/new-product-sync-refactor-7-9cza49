/**
 * Hello Endpoint Handler Module for Node.js Tutorial Application
 * 
 * This module implements the core business logic for the /hello route in the Node.js tutorial
 * application, demonstrating fundamental Express.js 5.1.0 request processing patterns with
 * type-safe response generation, comprehensive error handling, request correlation tracking,
 * and performance monitoring. Integrates with the application's logging and security systems
 * while maintaining production-ready standards and educational clarity.
 * 
 * Features:
 * - Express.js 5.1.0 async/await middleware patterns with automatic promise rejection handling
 * - Type-safe API response generation using TypeScript interfaces for consistency
 * - Request correlation and performance tracking for comprehensive observability
 * - Structured logging integration with centralized logging system
 * - Security best practices with proper error management and information disclosure prevention
 * - Comprehensive error handling with Express.js 5.1.0 enhanced error middleware integration
 * - Performance monitoring and optimization techniques for Node.js applications
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates modern Node.js development patterns and TypeScript integration
 */

// Import enhanced Express.js types with custom properties for request correlation and monitoring
import {
  Request,
  Response,
  NextFunction,
  HelloResponse,
  AsyncRequestHandler
} from '../types/express.d'; // Express.js 5.1.0 enhanced type definitions

// Import centralized logging system for structured logging and performance monitoring
import { logger } from '../utils/logger'; // Winston-based logging with request correlation

// Import HTTP status codes, response messages, and content types for standardized responses
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  CONTENT_TYPES
} from '../config/constants'; // Application-wide constant definitions

// Import custom error classes and error formatting utilities for proper error handling
import {
  AppError,
  formatErrorResponse
} from '../utils/errors'; // Comprehensive error handling with Express.js 5.1.0 integration

/**
 * Global Handler Configuration Constants
 * 
 * Configuration constants for the hello handler with const assertions for immutable literal types.
 * Provides centralized configuration for performance thresholds, handler identification, and
 * default response messaging with type safety and consistency across the handler implementation.
 */

/** Handler name for identification in logs and error tracking */
const HANDLER_NAME = 'HelloHandler' as const;

/** Performance threshold in milliseconds for slow request detection and monitoring */
const PERFORMANCE_THRESHOLD_MS = 100 as const;

/** Default response message using centralized constants for consistency */
const DEFAULT_RESPONSE_MESSAGE = RESPONSE_MESSAGES.HELLO_WORLD as const;

/**
 * TypeScript Interface Definitions for Enhanced Type Safety
 * 
 * Comprehensive interface definitions for handler context, metrics tracking, and utility
 * type definitions that provide type safety throughout the handler implementation while
 * demonstrating modern TypeScript patterns for Node.js development.
 */

/**
 * Hello handler context interface for request correlation and tracking information
 * Provides structured context for request processing with readonly properties for immutability
 */
export interface HelloHandlerContext {
  /** Request correlation identifier for tracking across application layers */
  readonly requestId: string;
  
  /** Request start timestamp for performance tracking and monitoring */
  readonly startTime: number;
  
  /** Correlation identifier for distributed request tracing across services */
  readonly correlationId: string;
}

/**
 * Hello handler metrics interface for performance monitoring and optimization
 * Tracks essential performance metrics for request processing analysis and monitoring
 */
export interface HelloHandlerMetrics {
  /** Request processing time in milliseconds for performance analysis */
  responseTime: number;
  
  /** HTTP response status code for monitoring and debugging */
  statusCode: number;
  
  /** Response completion timestamp for audit trails and monitoring */
  timestamp: string;
}

/**
 * Type aliases for enhanced type safety and code clarity
 * Provides specialized type definitions for hello handler functions and response creation
 */

/** Type alias for hello handler function with async/await support and Express.js 5.1.0 integration */
export type HelloHandlerFunction = AsyncRequestHandler;

/** Type definition for response creation functions with type-safe parameters and return values */
export type ResponseCreator = (requestId: string, message?: string) => HelloResponse;

/**
 * Main Hello Endpoint Handler Function
 * 
 * Main hello endpoint handler function that processes GET requests to /hello route and returns
 * standardized 'Hello world' responses. Implements Express.js 5.1.0 async request handler patterns
 * with comprehensive error handling, request correlation tracking, performance monitoring, and
 * type-safe response generation while demonstrating modern Node.js development practices.
 * 
 * @param req - Enhanced Express Request object with custom properties for correlation and tracking
 * @param res - Enhanced Express Response object with custom locals and type-safe response methods
 * @param next - Express NextFunction for middleware error handling and flow control
 * @returns Promise<void> - Async function that resolves when response is sent or rejects with error
 */
export const helloHandler: HelloHandlerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Step 1: Validate incoming request structure and correlation information
    if (!validateRequest(req)) {
      const validationError = new AppError(
        'Invalid request structure or missing correlation information',
        HTTP_STATUS.BAD_REQUEST,
        'VALIDATION_ERROR',
        { handler: HANDLER_NAME, path: req.path, method: req.method }
      );
      return next(validationError);
    }

    // Step 2: Extract request correlation information from enhanced Request object
    const context: HelloHandlerContext = {
      requestId: req.requestId,
      correlationId: req.correlationId,
      startTime: req.startTime
    };

    // Step 3: Log incoming request with HTTP method, path, and correlation information
    logRequestStart(req);

    // Step 4: Create HelloResponse object with standardized message and request correlation
    const helloResponse = createHelloResponse(context.requestId, DEFAULT_RESPONSE_MESSAGE);

    // Step 5: Set appropriate HTTP status code (200 OK) using constants for consistency
    res.status(HTTP_STATUS.OK);

    // Step 6: Set Content-Type header to application/json using standardized constants
    res.setHeader('Content-Type', CONTENT_TYPES.APPLICATION_JSON);

    // Step 7: Send JSON response with HelloResponse structure ensuring type safety
    res.json(helloResponse);

    // Step 8: Calculate and log request processing time for performance monitoring
    const responseTime = calculateResponseTime(context.startTime);
    
    // Step 9: Log successful response with status code, response time, and correlation
    logRequestComplete(req, res, responseTime);

    // Performance monitoring: Check if request exceeded performance threshold
    if (responseTime > PERFORMANCE_THRESHOLD_MS) {
      logger.warn('Slow request detected', {
        handler: HANDLER_NAME,
        requestId: context.requestId,
        responseTime,
        threshold: PERFORMANCE_THRESHOLD_MS,
        path: req.path,
        method: req.method
      });
    }

  } catch (error) {
    // Step 10: Handle any errors by formatting them appropriately and passing to Express.js error middleware
    logger.error('Error in hello handler', {
      handler: HANDLER_NAME,
      requestId: req.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Step 11: Ensure proper error correlation and logging for debugging and incident response
    const handlerError = error instanceof AppError ? error : new AppError(
      'Internal server error in hello handler',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'HANDLER_ERROR',
      { handler: HANDLER_NAME, originalError: error instanceof Error ? error.message : String(error) }
    );

    // Pass error to Express.js 5.1.0 enhanced error middleware for automatic promise rejection handling
    next(handlerError);
  }
};

/**
 * Utility Function for Creating Standardized HelloResponse Objects
 * 
 * Utility function that creates standardized HelloResponse objects with consistent structure,
 * proper typing, and request correlation information. Provides centralized response creation
 * logic for the hello endpoint with timestamp generation and request tracking integration
 * while ensuring type safety and consistency across response formats.
 * 
 * @param requestId - Request correlation identifier for tracking across application layers
 * @param message - Hello message content with fallback to default message
 * @returns HelloResponse - Standardized hello response object with message, timestamp, and correlation
 */
export const createHelloResponse: ResponseCreator = (
  requestId: string,
  message: string = DEFAULT_RESPONSE_MESSAGE
): HelloResponse => {
  // Step 1: Validate input parameters for requestId and message content
  if (!requestId || typeof requestId !== 'string' || requestId.trim().length === 0) {
    throw new AppError(
      'Invalid requestId provided to createHelloResponse',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      { function: 'createHelloResponse', requestId }
    );
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    message = DEFAULT_RESPONSE_MESSAGE;
  }

  // Step 2: Generate ISO timestamp for response creation time tracking
  const timestamp = new Date().toISOString();

  // Step 3: Create HelloResponse object with provided message and correlation information
  const helloResponse: HelloResponse = {
    message: message.trim(),
    timestamp,
    requestId: requestId.trim()
  };

  // Step 4: Return typed HelloResponse object ready for JSON serialization and client transmission
  return helloResponse;
};

/**
 * Request Start Logging Function
 * 
 * Logs the start of request processing with correlation information, request details, and
 * performance tracking initialization. Provides structured logging for request monitoring
 * and debugging with appropriate log levels and context information while integrating
 * with the centralized logging system for consistent log formatting.
 * 
 * @param req - Enhanced Express Request object with correlation and metadata properties
 */
export const logRequestStart = (req: Request): void => {
  // Step 1: Extract request correlation ID and metadata from enhanced Request object
  const requestMetadata = {
    requestId: req.requestId,
    correlationId: req.correlationId,
    startTime: req.startTime,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    remoteAddress: req.ip || req.connection.remoteAddress,
    handler: HANDLER_NAME
  };

  // Step 2: Log request start event with INFO level for operational monitoring
  logger.info('Hello handler request started', requestMetadata);

  // Step 3: Add debug-level logging for detailed request information in development
  logger.debug('Request headers and details', {
    ...requestMetadata,
    headers: req.headers,
    query: req.query,
    params: req.params
  });
};

/**
 * Request Completion Logging Function
 * 
 * Logs the completion of request processing with response details, performance metrics,
 * and correlation information. Provides comprehensive request lifecycle logging for
 * monitoring, debugging, and performance analysis while ensuring structured log output
 * and appropriate detail levels for different environments.
 * 
 * @param req - Enhanced Express Request object with correlation and metadata properties
 * @param res - Enhanced Express Response object with response status and header information
 * @param responseTime - Request processing time in milliseconds for performance tracking
 */
export const logRequestComplete = (
  req: Request,
  res: Response,
  responseTime: number
): void => {
  // Step 1: Extract response status code and correlation information
  const responseMetadata = {
    requestId: req.requestId,
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    responseTime,
    handler: HANDLER_NAME,
    timestamp: new Date().toISOString()
  };

  // Step 2: Log request completion with HTTP level for request/response tracking
  logger.http('Hello handler request completed', responseMetadata);

  // Step 3: Check performance threshold and log warnings for slow requests
  if (responseTime > PERFORMANCE_THRESHOLD_MS) {
    logger.warn('Performance threshold exceeded', {
      ...responseMetadata,
      threshold: PERFORMANCE_THRESHOLD_MS,
      exceedingBy: responseTime - PERFORMANCE_THRESHOLD_MS
    });
  }

  // Step 4: Add debug-level logging for detailed response information
  logger.debug('Response details', {
    ...responseMetadata,
    responseHeaders: res.getHeaders(),
    responseSize: res.get('Content-Length') || 'unknown'
  });
};

/**
 * Response Time Calculation Function
 * 
 * Calculates request processing time from start timestamp to completion for performance
 * monitoring and optimization. Provides accurate timing information for request lifecycle
 * analysis and performance tracking while ensuring consistent time measurement across
 * the application and proper handling of edge cases.
 * 
 * @param startTime - Request start timestamp in milliseconds from process.hrtime.bigint()
 * @returns number - Response time in milliseconds for performance monitoring and logging
 */
export const calculateResponseTime = (startTime: number): number => {
  // Step 1: Get current timestamp for response completion time
  const endTime = Date.now();

  // Step 2: Calculate difference between start and completion timestamps
  const duration = endTime - startTime;

  // Step 3: Ensure non-negative duration and handle edge cases
  if (duration < 0) {
    logger.warn('Negative response time calculated', {
      startTime,
      endTime,
      duration,
      handler: HANDLER_NAME
    });
    return 0;
  }

  // Step 4: Return calculated response time for logging and monitoring
  return Math.round(duration * 100) / 100; // Round to 2 decimal places for precision
};

/**
 * Request Validation Function
 * 
 * Validates incoming request structure and correlation information to ensure proper request
 * processing. Provides request validation logic for the hello endpoint with error handling
 * for malformed requests while checking for required request properties and correlation
 * information needed for proper request tracking and monitoring.
 * 
 * @param req - Enhanced Express Request object with correlation and metadata properties
 * @returns boolean - True if request is valid, false if validation fails
 */
export const validateRequest = (req: Request): boolean => {
  // Step 1: Check for presence of required request correlation properties
  if (!req.requestId || typeof req.requestId !== 'string' || req.requestId.trim().length === 0) {
    logger.warn('Request validation failed: missing or invalid requestId', {
      requestId: req.requestId,
      path: req.path,
      method: req.method,
      handler: HANDLER_NAME
    });
    return false;
  }

  // Step 2: Validate correlation ID format and structure for correlation tracking
  if (!req.correlationId || typeof req.correlationId !== 'string' || req.correlationId.trim().length === 0) {
    logger.warn('Request validation failed: missing or invalid correlationId', {
      requestId: req.requestId,
      correlationId: req.correlationId,
      path: req.path,
      method: req.method,
      handler: HANDLER_NAME
    });
    return false;
  }

  // Step 3: Validate start time for performance tracking
  if (!req.startTime || typeof req.startTime !== 'number' || req.startTime <= 0) {
    logger.warn('Request validation failed: missing or invalid startTime', {
      requestId: req.requestId,
      startTime: req.startTime,
      path: req.path,
      method: req.method,
      handler: HANDLER_NAME
    });
    return false;
  }

  // Step 4: Verify request method and path match expected hello endpoint patterns
  if (req.method !== 'GET') {
    logger.warn('Request validation failed: unsupported HTTP method', {
      requestId: req.requestId,
      method: req.method,
      expectedMethod: 'GET',
      path: req.path,
      handler: HANDLER_NAME
    });
    return false;
  }

  // Step 5: Return validation result for request processing decision
  return true;
};

/**
 * Export All Handler Components
 * 
 * Comprehensive exports for all hello handler functions, interfaces, utility types,
 * and constants for use throughout the application and integration with Express.js
 * routing and middleware systems.
 */

// Export main handler function for Express.js route integration
export default helloHandler;

// Export utility functions for testing and reuse
export {
  createHelloResponse,
  logRequestStart,
  logRequestComplete,
  calculateResponseTime,
  validateRequest
};

// Export TypeScript interfaces and type definitions
export type {
  HelloHandlerContext,
  HelloHandlerMetrics,
  HelloHandlerFunction,
  ResponseCreator
};

// Export handler configuration constants
export {
  HANDLER_NAME,
  PERFORMANCE_THRESHOLD_MS,
  DEFAULT_RESPONSE_MESSAGE
};