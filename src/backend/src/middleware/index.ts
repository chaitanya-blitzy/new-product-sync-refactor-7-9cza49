/**
 * Central Middleware Barrel Export Module for Node.js Tutorial Application
 * 
 * This module serves as the main middleware entry point, aggregating and providing unified access
 * to all Express.js 5.1.0 middleware components for the Node.js tutorial application. Demonstrates
 * modern middleware architecture patterns, TypeScript integration, and educational middleware
 * composition for comprehensive HTTP request processing.
 * 
 * Features:
 * - Express.js 5.1.0 middleware stack integration with enhanced error handling
 * - Comprehensive security middleware stack with Helmet.js, CORS, and rate limiting
 * - Request correlation and logging integration with performance monitoring
 * - Error handling middleware orchestration with standardized response formatting
 * - Middleware architecture educational demonstration with factory patterns
 * - Type-safe middleware composition with comprehensive configuration validation
 * - Environment-aware middleware configuration with production optimizations
 * - Barrel export pattern for centralized middleware access and dependency management
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates modern Express.js middleware architecture patterns and composition strategies
 */

// Import error handling middleware for comprehensive error processing and response formatting
import {
  errorHandler,
  notFoundHandler,
  asyncErrorHandler,
  handleValidationError,
  logErrorDetails,
  setErrorHeaders,
  ErrorContext,
  ErrorMetrics,
  DEFAULT_ERROR_STATUS,
  DEFAULT_ERROR_MESSAGE,
  ERROR_MIDDLEWARE_NAME
} from './error.middleware';

// Import logging middleware for HTTP request/response tracking and performance monitoring
import {
  loggingMiddleware,
  createLoggingMiddleware,
  generateRequestId,
  extractRequestMetadata,
  extractResponseMetadata,
  logSecurityEvent,
  determineLogLevel,
  formatLogMessage,
  LoggingOptions,
  RequestMetadata,
  ResponseMetadata,
  SecurityEvent,
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  PERFORMANCE_THRESHOLD_MS,
  SENSITIVE_HEADERS,
  DEFAULT_LOGGING_OPTIONS
} from './logging.middleware';

// Import security middleware for Helmet.js, CORS, rate limiting, and custom security measures
import {
  SecurityMiddleware,
  createSecurityMiddlewareStack,
  addCustomSecurityHeaders,
  createHelmetMiddleware,
  createCorsMiddleware,
  createRateLimitMiddleware,
  validateSecurityConfiguration,
  logSecurityEvent as securityLogEvent,
  SecurityOptions,
  SecurityValidationResult,
  SecurityStatus,
  SECURITY_HEADERS,
  RATE_LIMIT_DEFAULTS,
  CORS_DEFAULTS
} from './security.middleware';

// Import application configuration for middleware setup and environment-specific behavior
import {
  appConfig,
  serverConfig,
  securityConfig,
  loggingConfig,
  AppConfig,
  SecurityConfiguration,
  LoggingConfiguration
} from '../config';

// Import TypeScript interfaces for enhanced type safety and middleware development
import {
  RequestHandler,
  ErrorHandler,
  MiddlewareFunction,
  AsyncRequestHandler,
  TypedRequest,
  TypedResponse
} from '../types';

/**
 * Middleware Execution Order Constants
 * 
 * Defines the optimal middleware execution order for security, performance, and functionality
 * with immutable literal types for compile-time validation and enhanced type safety.
 */
export const MIDDLEWARE_ORDER = {
  SECURITY: 0,
  LOGGING: 1,
  CUSTOM: 2,
  ROUTES: 3,
  ERROR_HANDLING: 4,
  NOT_FOUND: 5
} as const;

/**
 * Default Middleware Options Constants
 * 
 * Provides comprehensive default middleware configuration options with sensible defaults
 * for development and production environments, ensuring secure and performant middleware setup.
 */
export const DEFAULT_MIDDLEWARE_OPTIONS = {
  enableSecurity: true,
  enableLogging: true,
  enableErrorHandling: true,
  enableRequestId: true,
  enablePerformanceTracking: true
} as const;

/**
 * Middleware Stack Options Interface
 * 
 * Configuration interface for middleware stack creation with optional parameters for
 * enabling/disabling specific middleware components and custom middleware integration.
 */
export interface MiddlewareStackOptions {
  /** Enable security middleware stack including Helmet.js, CORS, and rate limiting */
  enableSecurity?: boolean;
  
  /** Enable HTTP request/response logging with correlation tracking */
  enableLogging?: boolean;
  
  /** Enable comprehensive error handling middleware with Express.js 5.1.0 features */
  enableErrorHandling?: boolean;
  
  /** Enable automatic request ID generation for correlation tracking */
  enableRequestId?: boolean;
  
  /** Enable response time and performance monitoring */
  enablePerformanceTracking?: boolean;
  
  /** Additional custom middleware to include in the stack */
  customMiddleware?: RequestHandler[];
}

/**
 * Security Stack Options Interface
 * 
 * Configuration interface for security middleware stack creation with optional parameters
 * for enabling/disabling specific security components and custom security headers.
 */
export interface SecurityStackOptions {
  /** Enable Helmet.js security headers middleware */
  enableHelmet?: boolean;
  
  /** Enable CORS middleware for cross-origin protection */
  enableCors?: boolean;
  
  /** Enable rate limiting middleware for abuse prevention */
  enableRateLimit?: boolean;
  
  /** Custom security headers to add beyond Helmet.js defaults */
  customSecurityHeaders?: Record<string, string>;
}

/**
 * Logging Stack Options Interface
 * 
 * Configuration interface for logging middleware stack creation with optional parameters
 * for request/response logging behavior and performance monitoring configuration.
 */
export interface LoggingStackOptions {
  /** Enable HTTP request logging */
  enableRequestLogging?: boolean;
  
  /** Enable HTTP response logging */
  enableResponseLogging?: boolean;
  
  /** Enable response time and performance logging */
  enablePerformanceLogging?: boolean;
  
  /** Override default log level for middleware logging */
  logLevel?: string;
}

/**
 * Error Handling Stack Options Interface
 * 
 * Configuration interface for error handling middleware stack creation with optional parameters
 * for async error handling, detailed error information, and custom error handlers.
 */
export interface ErrorHandlingStackOptions {
  /** Enable automatic async error catching and forwarding */
  enableAsyncErrorHandling?: boolean;
  
  /** Enable detailed error information in development environments */
  enableDetailedErrors?: boolean;
  
  /** Enable comprehensive error logging and correlation */
  enableErrorLogging?: boolean;
  
  /** Additional custom error handlers to include */
  customErrorHandlers?: ErrorHandler[];
}

/**
 * Middleware Validation Result Interface
 * 
 * Structured validation result for middleware configuration compliance and best practices
 * assessment with comprehensive feedback and quality scoring.
 */
export interface MiddlewareValidationResult {
  /** Overall middleware configuration validation status */
  readonly isValid: boolean;
  
  /** Array of middleware configuration errors */
  readonly errors: string[];
  
  /** Array of middleware configuration warnings */
  readonly warnings: string[];
  
  /** Array of middleware best practice recommendations */
  readonly recommendations: string[];
  
  /** Middleware configuration quality score (0-100) */
  readonly middlewareScore: number;
}

/**
 * Middleware Information Interface
 * 
 * Comprehensive middleware information structure for debugging, monitoring, and
 * documentation purposes with current configuration and status details.
 */
export interface MiddlewareInfo {
  /** Current middleware execution order */
  readonly stackOrder: string[];
  
  /** Current middleware configuration summary */
  readonly configuration: object;
  
  /** Security middleware status and configuration */
  readonly security: object;
  
  /** Logging middleware status and configuration */
  readonly logging: object;
  
  /** Error handling middleware status and configuration */
  readonly errorHandling: object;
  
  /** Current environment affecting middleware behavior */
  readonly environment: string;
}

/**
 * Middleware Factory Function Type Definition
 * 
 * Type definition for middleware factory functions that create configurable middleware
 * with optional parameters and return middleware handlers or arrays.
 */
export type MiddlewareFactory<T = any> = (options?: T) => RequestHandler | RequestHandler[];

/**
 * Middleware Stack Type Definition
 * 
 * Type definition for ordered array of middleware functions ready for Express.js application use
 * with comprehensive type safety and middleware composition support.
 */
export type MiddlewareStack = RequestHandler[];

/**
 * Error Middleware Stack Type Definition
 * 
 * Type definition for ordered array of error handling middleware functions with Express.js 5.1.0
 * enhanced error processing and automatic promise rejection handling.
 */
export type ErrorMiddlewareStack = ErrorHandler[];

/**
 * Factory Function for Creating Complete Express.js 5.1.0 Middleware Stack
 * 
 * Creates a complete Express.js 5.1.0 middleware stack by combining security, logging, and error
 * handling middleware in optimal execution order. Provides comprehensive middleware orchestration
 * with environment-specific configuration and type-safe middleware composition for production-ready
 * applications.
 * 
 * @param options - Middleware stack configuration options with component enablement flags
 * @returns Ordered array of middleware functions ready for Express.js application use
 */
export function createMiddlewareStack(options: MiddlewareStackOptions = {}): MiddlewareStack {
  // Validate middleware stack options and apply defaults from DEFAULT_MIDDLEWARE_OPTIONS
  const config = {
    ...DEFAULT_MIDDLEWARE_OPTIONS,
    ...options
  };
  
  // Initialize middleware stack array with optimal ordering according to MIDDLEWARE_ORDER
  const middlewareStack: MiddlewareStack = [];
  
  // Initialize security middleware using SecurityMiddleware class with appConfig.security
  if (config.enableSecurity) {
    const securityMiddleware = new SecurityMiddleware(appConfig.security);
    const securityStack = securityMiddleware.getMiddlewareStack();
    middlewareStack.push(...securityStack);
  }
  
  // Create logging middleware using createLoggingMiddleware with appConfig.logging configuration
  if (config.enableLogging) {
    const loggingOptions: LoggingOptions = {
      logRequests: true,
      logResponses: true,
      logPerformance: config.enablePerformanceTracking,
      sanitizeSensitiveData: appConfig.environment.isProduction
    };
    
    // Set up request ID generation middleware using generateRequestId for correlation tracking
    if (config.enableRequestId) {
      middlewareStack.push((req, res, next) => {
        if (!req.requestId) {
          req.requestId = generateRequestId();
          res.setHeader(REQUEST_ID_HEADER, req.requestId);
        }
        next();
      });
    }
    
    const loggingMiddlewareInstance = createLoggingMiddleware(loggingOptions);
    middlewareStack.push(loggingMiddlewareInstance);
  }
  
  // Configure custom security headers middleware using addCustomSecurityHeaders
  middlewareStack.push(addCustomSecurityHeaders);
  
  // Add custom middleware from options if provided
  if (config.customMiddleware && config.customMiddleware.length > 0) {
    middlewareStack.push(...config.customMiddleware);
  }
  
  // Order middleware functions according to MIDDLEWARE_ORDER for optimal security and performance
  // Security, logging, and custom middleware are already ordered correctly above
  
  // Add error handling middleware using errorHandler for comprehensive error processing
  if (config.enableErrorHandling) {
    // Error handling middleware is added at the end of the application middleware stack
    // This is handled separately in the main application setup
  }
  
  // Validate middleware stack composition and configuration compatibility
  const validation = validateMiddlewareConfiguration(config);
  if (!validation.isValid) {
    console.warn('Middleware stack validation warnings:', validation.warnings);
    if (validation.errors.length > 0) {
      console.error('Middleware stack validation errors:', validation.errors);
    }
  }
  
  // Return ordered array of middleware functions ready for Express.js application
  return middlewareStack;
}

/**
 * Factory Function for Creating Focused Security Middleware Stack
 * 
 * Creates a focused security middleware stack containing Helmet.js, CORS, rate limiting, and custom
 * security measures. Provides environment-specific security configuration with appropriate protection
 * levels for development, staging, and production deployments.
 * 
 * @param options - Security stack configuration options for component enablement
 * @returns Array of security middleware functions in optimal execution order
 */
export function createSecurityStack(options: SecurityStackOptions = {}): MiddlewareStack {
  // Extract security configuration from appConfig.security with environment overrides
  const securityOptions: SecurityOptions = {
    helmet: appConfig.security.helmet,
    cors: appConfig.security.cors,
    rateLimit: appConfig.security.rateLimit,
    customHeaders: options.customSecurityHeaders || {},
    enableLogging: true
  };
  
  // Initialize SecurityMiddleware instance with validated security configuration
  const securityMiddleware = new SecurityMiddleware(appConfig.security);
  
  // Create security middleware stack using createSecurityMiddlewareStack
  const securityStack = createSecurityMiddlewareStack(securityOptions);
  
  // Order security middleware for optimal protection and performance
  const orderedSecurityStack: MiddlewareStack = [];
  
  // Create Helmet.js middleware for HTTP security headers using security.helmet()
  if (options.enableHelmet !== false) {
    orderedSecurityStack.push(securityMiddleware.helmet());
  }
  
  // Set up CORS middleware for cross-origin protection using security.cors()
  if (options.enableCors !== false) {
    orderedSecurityStack.push(securityMiddleware.cors());
  }
  
  // Configure rate limiting middleware for abuse prevention using security.rateLimit()
  if (options.enableRateLimit !== false) {
    orderedSecurityStack.push(securityMiddleware.rateLimit());
  }
  
  // Add custom security headers middleware for additional protection
  orderedSecurityStack.push(addCustomSecurityHeaders);
  
  // Return complete security middleware stack ready for application use
  return orderedSecurityStack;
}

/**
 * Factory Function for Creating Comprehensive Logging Middleware Stack
 * 
 * Creates a comprehensive logging middleware stack with request correlation, performance tracking,
 * and security event logging. Provides environment-aware logging configuration with appropriate
 * detail levels for development debugging and production monitoring.
 * 
 * @param options - Logging stack configuration options for logging behavior control
 * @returns Array of logging middleware functions for comprehensive request tracking
 */
export function createLoggingStack(options: LoggingStackOptions = {}): MiddlewareStack {
  // Extract logging configuration from appConfig.logging with environment settings
  const loggingOptions: LoggingOptions = {
    logRequests: options.enableRequestLogging !== false,
    logResponses: options.enableResponseLogging !== false,
    logPerformance: options.enablePerformanceLogging !== false,
    logLevel: options.logLevel || appConfig.logging.level,
    sanitizeSensitiveData: appConfig.environment.isProduction,
    enableColors: appConfig.logging.enableColors
  };
  
  // Create logging middleware stack array
  const loggingStack: MiddlewareStack = [];
  
  // Create request ID generation middleware using generateRequestId for correlation
  loggingStack.push((req, res, next) => {
    if (!req.requestId) {
      req.requestId = generateRequestId();
      res.setHeader(REQUEST_ID_HEADER, req.requestId);
    }
    
    if (!req.correlationId) {
      req.correlationId = req.get(CORRELATION_ID_HEADER) || req.requestId;
      res.setHeader(CORRELATION_ID_HEADER, req.correlationId);
    }
    
    req.startTime = Date.now();
    next();
  });
  
  // Set up HTTP request/response logging using createLoggingMiddleware with options
  const loggingMiddlewareInstance = createLoggingMiddleware(loggingOptions);
  loggingStack.push(loggingMiddlewareInstance);
  
  // Configure performance tracking middleware for response time monitoring
  if (options.enablePerformanceLogging !== false) {
    loggingStack.push((req, res, next) => {
      const originalSend = res.send;
      res.send = function(body) {
        const responseTime = Date.now() - req.startTime;
        
        if (responseTime > PERFORMANCE_THRESHOLD_MS) {
          console.warn(`Slow response detected: ${req.method} ${req.path} - ${responseTime}ms`);
        }
        
        return originalSend.call(this, body);
      };
      next();
    });
  }
  
  // Add security event logging middleware for audit trail generation
  loggingStack.push((req, res, next) => {
    // Log security-relevant request information
    if (req.ip && req.get('User-Agent')) {
      logSecurityEvent('request_received', req, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
    }
    next();
  });
  
  // Order logging middleware for optimal request processing and correlation
  // Already ordered correctly above
  
  // Return complete logging middleware stack for request tracking and monitoring
  return loggingStack;
}

/**
 * Factory Function for Creating Comprehensive Error Handling Middleware Stack
 * 
 * Creates a comprehensive error handling middleware stack with Express.js 5.1.0 enhanced error
 * processing, async error catching, and standardized error responses. Provides environment-specific
 * error handling with appropriate detail levels and security considerations.
 * 
 * @param options - Error handling stack configuration options for error processing behavior
 * @returns Array of error handling middleware functions for comprehensive error processing
 */
export function createErrorHandlingStack(options: ErrorHandlingStackOptions = {}): ErrorMiddlewareStack {
  // Extract error handling configuration from appConfig with environment settings
  const errorHandlingStack: ErrorMiddlewareStack = [];
  
  // Create async error wrapper using asyncErrorHandler for automatic promise rejection handling
  if (options.enableAsyncErrorHandling !== false) {
    // asyncErrorHandler is used to wrap individual route handlers, not added to stack directly
    // This would be applied to individual routes in the application setup
  }
  
  // Add custom error handlers if provided in options
  if (options.customErrorHandlers && options.customErrorHandlers.length > 0) {
    errorHandlingStack.push(...options.customErrorHandlers);
  }
  
  // Set up main error handling middleware using errorHandler for comprehensive error processing
  errorHandlingStack.push(errorHandler);
  
  // Configure 404 not found handler using notFoundHandler for unmatched routes
  // Note: notFoundHandler is technically a RequestHandler, but serves as final catch-all
  // It should be added after all routes but before error handlers in the main application
  
  // Add environment-specific error detail filtering for security
  if (appConfig.environment.isProduction) {
    // Production error filtering is handled within the errorHandler itself
    // based on environment configuration
  }
  
  // Order error handling middleware for optimal error processing and response
  // Already ordered correctly above
  
  // Return complete error handling middleware stack for robust error management
  return errorHandlingStack;
}

/**
 * Middleware Configuration Validation Function
 * 
 * Validates middleware configuration options to ensure proper setup, compatibility, and security
 * compliance. Provides comprehensive validation with detailed error messages and middleware best
 * practice recommendations for production deployment.
 * 
 * @param options - Middleware stack configuration options to validate
 * @returns Validation result with success status, errors, warnings, and recommendations
 */
export function validateMiddlewareConfiguration(options: MiddlewareStackOptions): MiddlewareValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let middlewareScore = 100;
  
  try {
    // Validate security middleware configuration for environment appropriateness
    if (options.enableSecurity === false) {
      warnings.push('Security middleware is disabled - consider enabling for production environments');
      middlewareScore -= 20;
    }
    
    // Check logging middleware configuration for performance and security compliance
    if (options.enableLogging === false) {
      warnings.push('Logging middleware is disabled - consider enabling for monitoring and debugging');
      middlewareScore -= 15;
    }
    
    // Verify error handling configuration meets production requirements
    if (options.enableErrorHandling === false) {
      errors.push('Error handling middleware is disabled - this is required for production applications');
      middlewareScore -= 30;
    }
    
    // Validate middleware ordering and dependency compatibility
    if (options.customMiddleware) {
      if (!Array.isArray(options.customMiddleware)) {
        errors.push('Custom middleware must be an array of middleware functions');
        middlewareScore -= 25;
      } else if (options.customMiddleware.length > 10) {
        warnings.push('Large number of custom middleware may impact performance');
        middlewareScore -= 5;
      }
    }
    
    // Check environment-specific middleware settings for deployment readiness
    if (appConfig.environment.isProduction) {
      if (options.enableRequestId === false) {
        warnings.push('Request ID generation disabled in production - consider enabling for debugging');
        middlewareScore -= 10;
      }
      
      if (options.enablePerformanceTracking === false) {
        recommendations.push('Enable performance tracking in production for monitoring');
        middlewareScore -= 5;
      }
    }
    
    // Identify potential security misconfigurations and performance issues
    if (options.enableSecurity === false && appConfig.environment.isProduction) {
      errors.push('Security middleware disabled in production environment - this is dangerous');
      middlewareScore -= 40;
    }
    
    // Generate middleware recommendations and best practice suggestions
    if (middlewareScore >= 90) {
      recommendations.push('Middleware configuration is excellent');
    } else if (middlewareScore >= 70) {
      recommendations.push('Middleware configuration is good with minor improvements needed');
    } else if (middlewareScore >= 50) {
      recommendations.push('Middleware configuration needs attention and improvements');
    } else {
      recommendations.push('Middleware configuration requires significant improvements');
    }
    
    // Add general best practice recommendations
    recommendations.push('Consider enabling all security middleware in production');
    recommendations.push('Use request correlation IDs for better debugging');
    recommendations.push('Monitor middleware performance impact');
    
    // Return comprehensive validation result with detailed feedback
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      middlewareScore: Math.max(0, middlewareScore)
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    errors.push(`Validation failed: ${errorMessage}`);
    
    return {
      isValid: false,
      errors,
      warnings,
      recommendations: ['Review middleware configuration and try again'],
      middlewareScore: 0
    };
  }
}

/**
 * Middleware Information Provider Function
 * 
 * Provides comprehensive information about the current middleware stack including configuration
 * summary, middleware order, and operational status. Useful for debugging, monitoring, and
 * documentation purposes.
 * 
 * @returns Detailed middleware stack information and configuration summary
 */
export function getMiddlewareInfo(): MiddlewareInfo {
  try {
    // Collect current middleware configuration from appConfig
    const currentConfiguration = {
      server: {
        port: appConfig.server.port,
        host: appConfig.server.host,
        timeout: appConfig.server.timeout
      },
      security: {
        helmetEnabled: !!appConfig.security.helmet,
        corsEnabled: !!appConfig.security.cors,
        rateLimitEnabled: !!appConfig.security.rateLimit
      },
      logging: {
        level: appConfig.logging.level,
        format: appConfig.logging.format,
        enableColors: appConfig.logging.enableColors
      },
      environment: appConfig.environment.env
    };
    
    // Generate middleware stack summary with order and dependencies
    const stackOrder = [
      'SecurityMiddleware (Helmet, CORS, Rate Limiting)',
      'LoggingMiddleware (Request/Response Logging)',
      'CustomSecurityHeaders',
      'RequestIdGeneration',
      'PerformanceTracking',
      'ErrorHandlingMiddleware'
    ];
    
    // Include security middleware status and configuration details
    const securityInfo = {
      helmet: {
        enabled: !!appConfig.security.helmet,
        contentSecurityPolicy: true,
        frameguard: true
      },
      cors: {
        enabled: !!appConfig.security.cors,
        environment: appConfig.environment.env
      },
      rateLimit: {
        enabled: !!appConfig.security.rateLimit,
        window: RATE_LIMIT_DEFAULTS.WINDOW_MS,
        maxRequests: RATE_LIMIT_DEFAULTS.MAX_REQUESTS
      }
    };
    
    // Add logging middleware configuration and performance settings
    const loggingInfo = {
      requestLogging: true,
      responseLogging: true,
      performanceTracking: true,
      correlationTracking: true,
      securityEventLogging: true,
      sensitiveDataSanitization: appConfig.environment.isProduction
    };
    
    // Include error handling middleware setup and environment behavior
    const errorHandlingInfo = {
      errorHandler: true,
      notFoundHandler: true,
      asyncErrorHandling: true,
      detailedErrors: appConfig.environment.isDevelopment,
      errorLogging: true,
      correlationTracking: true
    };
    
    // Generate middleware compatibility and version information
    const middlewareInfo: MiddlewareInfo = {
      stackOrder,
      configuration: currentConfiguration,
      security: securityInfo,
      logging: loggingInfo,
      errorHandling: errorHandlingInfo,
      environment: appConfig.environment.env
    };
    
    // Return comprehensive middleware information object
    return middlewareInfo;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to generate middleware information:', errorMessage);
    
    // Return basic information on error
    return {
      stackOrder: ['Error retrieving middleware information'],
      configuration: { error: errorMessage },
      security: { error: 'Unable to retrieve security information' },
      logging: { error: 'Unable to retrieve logging information' },
      errorHandling: { error: 'Unable to retrieve error handling information' },
      environment: appConfig.environment.env
    };
  }
}

// Re-export all error handling middleware components for comprehensive access
export {
  // Main error handling middleware functions
  errorHandler,
  notFoundHandler,
  asyncErrorHandler,
  handleValidationError,
  logErrorDetails,
  setErrorHeaders,
  
  // Error handling types and interfaces
  ErrorContext,
  ErrorMetrics,
  DEFAULT_ERROR_STATUS,
  DEFAULT_ERROR_MESSAGE,
  ERROR_MIDDLEWARE_NAME
};

// Re-export all logging middleware functionality for comprehensive access
export {
  // Main logging middleware functions
  loggingMiddleware,
  createLoggingMiddleware,
  generateRequestId,
  extractRequestMetadata,
  extractResponseMetadata,
  logSecurityEvent,
  determineLogLevel,
  formatLogMessage,
  
  // Logging types and interfaces
  LoggingOptions,
  RequestMetadata,
  ResponseMetadata,
  SecurityEvent,
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  PERFORMANCE_THRESHOLD_MS,
  SENSITIVE_HEADERS,
  DEFAULT_LOGGING_OPTIONS
};

// Re-export all security middleware components for comprehensive access
export {
  // Main security middleware class and functions
  SecurityMiddleware,
  createSecurityMiddlewareStack,
  addCustomSecurityHeaders,
  createHelmetMiddleware,
  createCorsMiddleware,
  createRateLimitMiddleware,
  validateSecurityConfiguration,
  securityLogEvent,
  
  // Security types and interfaces
  SecurityOptions,
  SecurityValidationResult,
  SecurityStatus,
  SECURITY_HEADERS,
  RATE_LIMIT_DEFAULTS,
  CORS_DEFAULTS
};

// Export TypeScript interfaces for enhanced type safety and middleware development
export type {
  // Middleware stack configuration interfaces
  MiddlewareStackOptions,
  SecurityStackOptions,
  LoggingStackOptions,
  ErrorHandlingStackOptions,
  MiddlewareValidationResult,
  MiddlewareInfo,
  
  // Middleware function type definitions
  MiddlewareFactory,
  MiddlewareStack,
  ErrorMiddlewareStack,
  
  // Core middleware types from imports
  RequestHandler,
  ErrorHandler,
  MiddlewareFunction,
  AsyncRequestHandler,
  TypedRequest,
  TypedResponse
};

/**
 * Default Export for Convenient Access
 * 
 * Provides convenient access to commonly used middleware functions and factory patterns
 * for streamlined middleware setup and configuration.
 */
export default {
  // Factory functions for middleware stack creation
  createMiddlewareStack,
  createSecurityStack,
  createLoggingStack,
  createErrorHandlingStack,
  
  // Validation and information functions
  validateMiddlewareConfiguration,
  getMiddlewareInfo,
  
  // Individual middleware components
  errorHandler,
  loggingMiddleware,
  SecurityMiddleware,
  
  // Utility functions
  generateRequestId,
  addCustomSecurityHeaders,
  asyncErrorHandler,
  
  // Constants and configuration
  MIDDLEWARE_ORDER,
  DEFAULT_MIDDLEWARE_OPTIONS
};