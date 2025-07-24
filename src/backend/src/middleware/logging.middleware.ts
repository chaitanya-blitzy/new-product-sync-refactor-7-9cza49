/**
 * Express.js 5.1.0 Logging Middleware Module for Node.js Tutorial Application
 * 
 * This middleware provides comprehensive HTTP request/response logging capabilities with
 * request correlation tracking, performance monitoring, security event logging, and
 * structured log output. It demonstrates modern middleware patterns including async/await
 * support, automatic error handling, and TypeScript type safety while integrating seamlessly
 * with the centralized logging system for educational purposes.
 * 
 * Features:
 * - Express.js 5.1.0 compatible middleware with automatic promise rejection handling
 * - Request correlation tracking with unique request IDs and correlation support
 * - Performance monitoring with response time tracking and threshold alerting
 * - Security event logging for suspicious activities and audit trail generation
 * - Structured log output with environment-specific behavior and data sanitization
 * - Configurable logging options with factory pattern for reusable middleware creation
 * - TypeScript type safety with comprehensive interfaces and type definitions
 * - Integration with centralized logging system for consistent application logging
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @framework Express.js 5.1.0 enhanced middleware patterns and error handling
 * @educational Demonstrates modern logging practices and middleware development patterns
 */

// Import centralized logger and logging utilities for consistent application logging
import { 
  logger, 
  createLogContext, 
  sanitizeLogData 
} from '../utils/logger';

// Import logging configuration constants for levels and default settings
import { 
  LOGGING, 
  HTTP_STATUS 
} from '../config/constants';

// Import Express.js type definitions for middleware integration and type safety
import { 
  RequestHandler, 
  ResponseLocals 
} from '../types/express';

// Import Node.js crypto module for generating unique request correlation identifiers
import { randomUUID } from 'crypto'; // built-in

// Import Express.js 5.1.0 core types for request/response handling and middleware integration
import { Request, Response, NextFunction } from 'express'; // ^5.1.0

/**
 * Request ID Header Name Constant
 * 
 * HTTP header name for request correlation identifiers used in distributed
 * tracing and request tracking across the application and external services.
 */
export const REQUEST_ID_HEADER = 'x-request-id' as const;

/**
 * Correlation ID Header Name Constant
 * 
 * HTTP header name for correlation identifiers that link related requests
 * across distributed systems and microservices for comprehensive tracing.
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id' as const;

/**
 * Performance Threshold Constant
 * 
 * Response time threshold in milliseconds for performance monitoring and
 * warning generation when requests exceed acceptable processing times.
 */
export const PERFORMANCE_THRESHOLD_MS = 1000 as const;

/**
 * Sensitive Headers Constant
 * 
 * Array of HTTP header names that contain sensitive information and should
 * be sanitized or masked in log output to prevent information disclosure.
 */
export const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token'
] as const;

/**
 * Default Logging Options Constant
 * 
 * Default configuration options for logging middleware with sensible defaults
 * for development and production environments with security considerations.
 */
export const DEFAULT_LOGGING_OPTIONS = {
  logRequests: true,
  logResponses: true,
  logHeaders: false,
  logBody: false,
  logPerformance: true,
  sanitizeSensitiveData: true
} as const;

/**
 * Logging Options Interface
 * 
 * Configuration interface for logging middleware with options to control
 * request/response logging behavior, performance monitoring, and security
 * data sanitization for comprehensive logging customization.
 */
export interface LoggingOptions {
  /** Enable or disable HTTP request logging */
  logRequests?: boolean;
  
  /** Enable or disable HTTP response logging */
  logResponses?: boolean;
  
  /** Include HTTP headers in log output */
  logHeaders?: boolean;
  
  /** Include request/response body in logs (development only) */
  logBody?: boolean;
  
  /** Enable response time and performance logging */
  logPerformance?: boolean;
  
  /** Sanitize sensitive information before logging */
  sanitizeSensitiveData?: boolean;
  
  /** Custom logger instance for middleware logging */
  customLogger?: typeof logger;
}

/**
 * Request Metadata Interface
 * 
 * Structured interface for HTTP request metadata extraction including
 * method, URL, headers, client information, and timestamp for comprehensive
 * request context logging and debugging support.
 */
export interface RequestMetadata {
  /** HTTP request method */
  method: string;
  
  /** Request URL path and query parameters */
  url: string;
  
  /** Sanitized HTTP request headers */
  headers: Record<string, string>;
  
  /** Client user agent string */
  userAgent?: string;
  
  /** Client IP address */
  ip: string;
  
  /** Request timestamp in ISO format */
  timestamp: string;
}

/**
 * Response Metadata Interface
 * 
 * Structured interface for HTTP response metadata extraction including
 * status code, headers, content information, timing, and performance
 * metrics for comprehensive response monitoring and analysis.
 */
export interface ResponseMetadata {
  /** HTTP response status code */
  statusCode: number;
  
  /** HTTP response status message */
  statusMessage: string;
  
  /** HTTP response headers */
  headers: Record<string, string>;
  
  /** Response content length in bytes */
  contentLength?: number;
  
  /** Response time in milliseconds */
  responseTime: number;
  
  /** Response timestamp in ISO format */
  timestamp: string;
}

/**
 * Security Event Interface
 * 
 * Structured interface for security event logging including event type,
 * severity level, correlation information, and context details for
 * comprehensive security monitoring and incident response.
 */
export interface SecurityEvent {
  /** Security event type identifier */
  type: string;
  
  /** Security event severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Request correlation identifier */
  requestId: string;
  
  /** Security event details and context */
  details: Record<string, any>;
  
  /** Security event timestamp */
  timestamp: string;
}

/**
 * Logging Middleware Type Definition
 * 
 * Type definition for logging middleware factory function that accepts
 * configuration options and returns a configured Express.js middleware
 * function for HTTP request/response logging.
 */
export type LoggingMiddleware = (options?: LoggingOptions) => RequestHandler;

/**
 * Metadata Extractor Type Definition
 * 
 * Generic type definition for metadata extraction functions that process
 * HTTP requests and responses to generate structured metadata objects
 * for logging and monitoring purposes.
 */
export type MetadataExtractor<T> = (req: Request, res?: Response) => T;

/**
 * Generates Unique Request Identifier
 * 
 * Generates a unique request identifier using Node.js crypto.randomUUID() for
 * request correlation and tracking across the application. Provides consistent
 * request identification for logging, debugging, and distributed tracing purposes
 * with UUID v4 format for global uniqueness.
 * 
 * @returns Unique UUID v4 string for request identification
 */
export function generateRequestId(): string {
  // Generate UUID v4 using Node.js crypto.randomUUID() for request correlation
  const requestId = randomUUID();
  
  // Return unique identifier string for request correlation tracking
  return requestId;
}

/**
 * Extracts Request Metadata for Logging
 * 
 * Extracts relevant metadata from HTTP request for logging purposes including
 * method, URL, headers, user agent, and IP address. Sanitizes sensitive information
 * and provides structured request context for comprehensive logging while ensuring
 * security data protection and information disclosure prevention.
 * 
 * @param req - Express.js Request object containing HTTP request information
 * @returns Sanitized request metadata object with method, URL, headers, and client information
 */
export function extractRequestMetadata(req: Request): RequestMetadata {
  // Extract HTTP method, URL, and query parameters from request object
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  // Collect client IP address with proxy support and user agent information
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  // Sanitize request headers to remove sensitive information using SENSITIVE_HEADERS
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    // Check if header is in SENSITIVE_HEADERS list for sanitization
    const isSecretive = SENSITIVE_HEADERS.some(sensitiveHeader => 
      key.toLowerCase().includes(sensitiveHeader)
    );
    
    // Apply sanitization to sensitive headers or preserve header value
    if (isSecretive) {
      headers[key] = '[REDACTED]';
    } else {
      headers[key] = Array.isArray(value) ? value.join(', ') : value || '';
    }
  }
  
  // Include request timestamp and protocol information for complete context
  const timestamp = new Date().toISOString();
  
  // Return structured metadata object for comprehensive request logging
  return {
    method,
    url,
    headers,
    userAgent,
    ip,
    timestamp
  };
}

/**
 * Extracts Response Metadata for Logging
 * 
 * Extracts response metadata for logging including status code, response headers,
 * content length, and response time. Provides comprehensive response context for
 * performance monitoring and debugging while including timing information and
 * content characteristics for analysis.
 * 
 * @param res - Express.js Response object containing HTTP response information
 * @param responseTime - Response processing time in milliseconds
 * @returns Response metadata object with status, headers, timing, and content information
 */
export function extractResponseMetadata(res: Response, responseTime: number): ResponseMetadata {
  // Extract HTTP status code and status message from response object
  const statusCode = res.statusCode;
  const statusMessage = res.statusMessage || 'Unknown';
  
  // Collect response headers and content type information without sanitization
  const headers: Record<string, string> = {};
  const responseHeaders = res.getHeaders();
  for (const [key, value] of Object.entries(responseHeaders)) {
    headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  
  // Calculate response size and content length from headers or body
  const contentLength = res.get('Content-Length') ? 
    parseInt(res.get('Content-Length') || '0', 10) : undefined;
  
  // Include response timing and performance metrics for monitoring
  const timestamp = new Date().toISOString();
  
  // Return structured response metadata for comprehensive response logging
  return {
    statusCode,
    statusMessage,
    headers,
    contentLength,
    responseTime,
    timestamp
  };
}

/**
 * Determines Appropriate Log Level
 * 
 * Determines appropriate log level based on HTTP status code and response
 * characteristics. Maps HTTP status codes to logging levels for proper log
 * categorization and filtering while considering performance thresholds
 * for comprehensive request monitoring.
 * 
 * @param statusCode - HTTP response status code for log level determination
 * @param responseTime - Response processing time in milliseconds
 * @returns Log level string (error, warn, info, http) based on status code and performance
 */
export function determineLogLevel(statusCode: number, responseTime: number): string {
  // Check if status code indicates error (5xx) for error level logging
  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return LOGGING.LEVELS.ERROR;
  }
  
  // Check if status code indicates client error (4xx) for warn level logging
  if (statusCode >= HTTP_STATUS.BAD_REQUEST) {
    return LOGGING.LEVELS.WARN;
  }
  
  // Check if response time exceeds performance threshold for warn level monitoring
  if (responseTime > PERFORMANCE_THRESHOLD_MS) {
    return LOGGING.LEVELS.WARN;
  }
  
  // Default to http level for successful requests with acceptable performance
  return LOGGING.LEVELS.HTTP;
}

/**
 * Formats HTTP Request/Response Log Message
 * 
 * Formats HTTP request/response log message with structured information including
 * method, URL, status code, response time, and correlation IDs. Creates human-readable
 * log messages for console output and monitoring systems while ensuring consistent
 * format and comprehensive request information.
 * 
 * @param method - HTTP request method for message formatting
 * @param url - Request URL path for identification
 * @param statusCode - HTTP response status code
 * @param responseTime - Response processing time in milliseconds
 * @param requestId - Request correlation identifier
 * @returns Formatted log message string with HTTP request/response information
 */
export function formatLogMessage(
  method: string, 
  url: string, 
  statusCode: number, 
  responseTime: number, 
  requestId: string
): string {
  // Format HTTP method and URL for readability with consistent spacing
  const formattedMethod = method.toUpperCase().padEnd(6);
  const formattedUrl = url.length > 50 ? `${url.substring(0, 47)}...` : url;
  
  // Include status code with appropriate formatting and color coding preparation
  const formattedStatus = statusCode.toString();
  
  // Add response time with millisecond precision and performance indication
  const formattedTime = `${responseTime.toFixed(2)}ms`;
  
  // Include request ID for correlation tracking and debugging support
  const formattedRequestId = requestId.substring(0, 8);
  
  // Return formatted log message string with comprehensive HTTP information
  return `${formattedMethod} ${formattedUrl} ${formattedStatus} ${formattedTime} [${formattedRequestId}]`;
}

/**
 * Factory Function for Configurable Logging Middleware
 * 
 * Factory function that creates configurable Express.js logging middleware with
 * custom options for request/response logging, performance tracking, and security
 * event monitoring. Supports environment-specific configuration and comprehensive
 * logging control while demonstrating factory pattern for middleware creation.
 * 
 * @param options - Optional logging configuration options for middleware customization
 * @returns Configured Express.js middleware function for HTTP request/response logging
 */
export function createLoggingMiddleware(options: LoggingOptions = {}): RequestHandler {
  // Merge provided options with default logging configuration using spread operator
  const config = {
    ...DEFAULT_LOGGING_OPTIONS,
    ...options
  };
  
  // Create child logger with middleware-specific context for namespaced logging
  const middlewareLogger = (config.customLogger || logger).child({
    component: 'logging-middleware',
    version: '1.0.0'
  });
  
  // Return Express.js middleware function with comprehensive logging capabilities
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate unique request ID for correlation tracking using generateRequestId
      const requestId = generateRequestId();
      
      // Extract correlation ID from request headers or generate new one
      const correlationId = req.get(CORRELATION_ID_HEADER) || requestId;
      
      // Store correlation information in request object for middleware chain access
      req.requestId = requestId;
      req.correlationId = correlationId;
      req.startTime = Date.now();
      
      // Set up response locals with correlation tracking and metadata storage
      res.locals.requestId = requestId;
      res.locals.correlationId = correlationId;
      res.locals.startTime = req.startTime;
      res.locals.metadata = {};
      
      // Add correlation headers to response for client-side tracking
      res.setHeader(REQUEST_ID_HEADER, requestId);
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
      
      // Log incoming request if request logging is enabled in configuration
      if (config.logRequests) {
        const requestMetadata = extractRequestMetadata(req);
        const sanitizedMetadata = config.sanitizeSensitiveData ? 
          sanitizeLogData(requestMetadata) : requestMetadata;
        
        middlewareLogger.http('Incoming request', {
          requestId,
          correlationId,
          ...sanitizedMetadata
        });
      }
      
      // Set up response finish event listener for response logging and timing
      const originalSend = res.send.bind(res);
      res.send = function(body: any) {
        // Calculate response time and performance metrics
        const responseTime = Date.now() - req.startTime;
        
        // Extract response metadata for comprehensive logging
        const responseMetadata = extractResponseMetadata(res, responseTime);
        
        // Determine appropriate log level based on status code and performance
        const logLevel = determineLogLevel(res.statusCode, responseTime);
        
        // Log response completion if response logging is enabled
        if (config.logResponses) {
          const logMessage = formatLogMessage(
            req.method,
            req.originalUrl || req.url,
            res.statusCode,
            responseTime,
            requestId
          );
          
          const logMetadata = {
            requestId,
            correlationId,
            performance: {
              responseTime,
              threshold: PERFORMANCE_THRESHOLD_MS,
              exceedsThreshold: responseTime > PERFORMANCE_THRESHOLD_MS
            },
            ...(config.sanitizeSensitiveData ? 
              sanitizeLogData(responseMetadata) : responseMetadata)
          };
          
          // Use appropriate log level method based on status and performance
          switch (logLevel) {
            case LOGGING.LEVELS.ERROR:
              middlewareLogger.error(logMessage, logMetadata);
              break;
            case LOGGING.LEVELS.WARN:
              middlewareLogger.warn(logMessage, logMetadata);
              break;
            default:
              middlewareLogger.http(logMessage, logMetadata);
          }
        }
        
        // Log performance warnings if response time exceeds threshold
        if (config.logPerformance && responseTime > PERFORMANCE_THRESHOLD_MS) {
          middlewareLogger.warn('Slow response detected', {
            requestId,
            correlationId,
            responseTime,
            threshold: PERFORMANCE_THRESHOLD_MS,
            url: req.originalUrl || req.url,
            method: req.method
          });
        }
        
        // Call original send method to complete response processing
        return originalSend(body);
      };
      
      // Continue to next middleware in Express.js 5.1.0 middleware chain
      next();
      
    } catch (error) {
      // Enhanced error handling with correlation information and context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const requestId = req.requestId || 'unknown';
      
      middlewareLogger.error('Logging middleware error', {
        requestId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        url: req.originalUrl || req.url,
        method: req.method
      });
      
      // Forward error to Express.js 5.1.0 error handling middleware
      next(error);
    }
  };
}

/**
 * Logs Security-Related Events
 * 
 * Logs security-related events during HTTP request processing including suspicious
 * requests, authentication failures, and potential security threats. Provides
 * specialized logging for security monitoring and incident response with structured
 * event information and appropriate severity levels.
 * 
 * @param eventType - Security event type identifier for categorization
 * @param req - Express.js Request object for context information
 * @param details - Security event details and additional context information
 */
export function logSecurityEvent(
  eventType: string, 
  req: Request, 
  details: Record<string, any>
): void {
  // Create security event context with request information and correlation
  const requestId = req.requestId || generateRequestId();
  const correlationId = req.correlationId || requestId;
  
  // Sanitize sensitive data from security event details to prevent information disclosure
  const sanitizedDetails = sanitizeLogData(details);
  
  // Create structured security event object with comprehensive context
  const securityEvent: SecurityEvent = {
    type: eventType,
    severity: 'medium', // Default severity, can be overridden in details
    requestId,
    details: {
      ...sanitizedDetails,
      url: req.originalUrl || req.url,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    },
    timestamp: new Date().toISOString()
  };
  
  // Override severity if provided in details object
  if (details.severity && ['low', 'medium', 'high', 'critical'].includes(details.severity)) {
    securityEvent.severity = details.severity;
  }
  
  // Log security event with appropriate severity level for monitoring systems
  switch (securityEvent.severity) {
    case 'critical':
    case 'high':
      logger.error(`Security event: ${eventType}`, {
        securityEvent,
        correlationId
      });
      break;
    case 'medium':
      logger.warn(`Security event: ${eventType}`, {
        securityEvent,
        correlationId
      });
      break;
    default:
      logger.info(`Security event: ${eventType}`, {
        securityEvent,
        correlationId
      });
  }
  
  // Include correlation information for incident tracking and investigation
  logger.debug('Security event details', {
    requestId,
    correlationId,
    eventType,
    details: sanitizedDetails
  });
}

/**
 * Default Express.js Middleware Function
 * 
 * Default Express.js middleware function for automatic HTTP request/response logging
 * with correlation tracking and performance monitoring. Uses default configuration
 * options suitable for most applications while providing comprehensive logging
 * capabilities out of the box.
 */
export const loggingMiddleware: RequestHandler = createLoggingMiddleware();

// Export all logging middleware functionality for comprehensive access
export {
  // Factory function for creating configurable logging middleware
  createLoggingMiddleware,
  
  // Utility functions for request correlation and metadata extraction
  generateRequestId,
  extractRequestMetadata,
  extractResponseMetadata,
  
  // Specialized security event logging functionality
  logSecurityEvent,
  
  // Log level determination and message formatting utilities
  determineLogLevel,
  formatLogMessage
};

// Export TypeScript type definitions for enhanced type safety
export type {
  // Configuration interfaces
  LoggingOptions,
  RequestMetadata,
  ResponseMetadata,
  SecurityEvent,
  
  // Function type definitions
  LoggingMiddleware,
  MetadataExtractor
};