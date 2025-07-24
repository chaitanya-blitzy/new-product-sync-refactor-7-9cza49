/**
 * Express.js 5.1.0 Route Definition Module for Hello Endpoint
 * 
 * This module implements the /hello route configuration with comprehensive middleware integration,
 * type-safe request handling, and educational demonstration of modern Express.js routing patterns.
 * It serves as the primary route definition for the tutorial's core functionality, showcasing
 * Express.js 5.1.0 enhanced features including automatic promise rejection handling, security
 * middleware integration, and production-ready routing architecture with TypeScript type safety.
 * 
 * Features:
 * - Express.js 5.1.0 router configuration with enhanced middleware support
 * - Comprehensive middleware integration including logging, security, and error handling
 * - Type-safe route definition using TypeScript interfaces and compile-time validation
 * - HTTP method validation with standardized error response patterns
 * - Route-level logging and correlation tracking for monitoring and debugging
 * - Factory pattern implementation for configurable router creation
 * - Security middleware integration at the route level for endpoint protection
 * - Educational demonstration of modern async/await patterns in Express.js route handling
 * - Production-ready route architecture with separation of concerns
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates Express.js 5.1.0 routing patterns and middleware composition
 */

// Import Express.js core components with version specification
import express, { Router, Request, Response, NextFunction } from 'express'; // ^5.1.0

// Import hello handler with comprehensive error handling and type safety
import {
  helloHandler
} from '../handlers'; // ^1.0.0 - Hello endpoint handler with async/await support

// Import middleware components for comprehensive request processing
import {
  asyncErrorHandler,
  loggingMiddleware
} from '../middleware'; // ^1.0.0 - Enhanced middleware stack with Express.js 5.1.0 support

// Import enhanced Express.js types with custom properties
import type {
  RequestHandler,
  AsyncRequestHandler
} from '../types/express.d'; // ^1.0.0 - Express.js 5.1.0 enhanced type definitions

// Import route path constants and HTTP status codes
import {
  ROUTES,
  HTTP_STATUS
} from '../config/constants'; // ^1.0.0 - Application constants and configuration

// Import centralized logging system
import { logger } from '../utils/logger'; // ^1.0.0 - Winston-based logging with request correlation

/**
 * Global Route Configuration Constants
 * 
 * Configuration constants for the hello route with const assertions for immutable
 * literal types. Provides centralized configuration for route identification, logging,
 * and method validation with type safety and consistency.
 */

/** Route name for identification in logs and error tracking */
const ROUTE_NAME = 'hello-routes' as const;

/** Supported HTTP methods for the hello endpoint */
const SUPPORTED_METHODS = ['GET'] as const;

/** Route middleware execution order for optimal performance and security */
const ROUTE_MIDDLEWARE_ORDER = {
  LOGGING: 0,
  SECURITY: 1,
  VALIDATION: 2,
  HANDLER: 3
} as const;

/**
 * TypeScript Interface Definitions for Enhanced Type Safety
 * 
 * Comprehensive interface definitions for route management, configuration options,
 * and utility type definitions that provide type safety throughout the route
 * implementation while demonstrating modern TypeScript patterns for Express.js development.
 */

/**
 * Route information interface providing comprehensive details about the hello route
 * configuration including supported methods, middleware stack, and metadata
 */
export interface RouteInfo {
  /** Route path definition */
  readonly path: string;
  
  /** Supported HTTP methods */
  readonly methods: string[];
  
  /** Applied middleware stack */
  readonly middleware: string[];
  
  /** Route handler function name */
  readonly handler: string;
  
  /** Security configuration summary */
  readonly security: object;
  
  /** Logging configuration summary */
  readonly logging: object;
}

/**
 * Hello route configuration interface for customizable route creation
 * with optional parameters for enabling/disabling specific features
 */
export interface HelloRouteConfig {
  /** Enable route-level logging middleware */
  enableLogging?: boolean;
  
  /** Enable route-level security middleware */
  enableSecurity?: boolean;
  
  /** Enable HTTP method validation */
  enableValidation?: boolean;
  
  /** Additional custom middleware for route */
  customMiddleware?: RequestHandler[];
}

/**
 * Utility Types for Enhanced Type Safety
 * 
 * Type aliases and utility types for route handlers, middleware functions,
 * and configuration validation with Express.js 5.1.0 integration support.
 */

/** Type alias for hello route handler with async/await support */
export type HelloRouteHandler = AsyncRequestHandler;

/** Type definition for route middleware functions */
export type RouteMiddleware = RequestHandler | RequestHandler[];

/**
 * Factory Function for Creating Hello Router Configuration
 * 
 * Factory function that creates and configures the Express.js router for the hello endpoint
 * with comprehensive middleware integration, security measures, and type-safe route handling.
 * Implements Express.js 5.1.0 enhanced routing patterns with automatic promise rejection
 * handling and production-ready middleware composition.
 * 
 * @returns Configured Express.js router instance with hello endpoint and integrated middleware stack
 */
export function createHelloRouter(): Router {
  try {
    // Step 1: Create new Express.js Router instance with enhanced Express.js 5.1.0 features
    const router = Router();
    
    // Step 2: Log router initialization with route name and configuration details
    logger.info('Initializing hello router', {
      routeName: ROUTE_NAME,
      supportedMethods: SUPPORTED_METHODS,
      routePath: ROUTES.HELLO,
      middlewareOrder: ROUTE_MIDDLEWARE_ORDER,
      timestamp: new Date().toISOString()
    });
    
    // Step 3: Apply logging middleware for HTTP request/response tracking and correlation
    router.use(loggingMiddleware);
    
    // Step 4: Set up route-level logging middleware for access tracking
    router.use(logRouteAccess);
    
    // Step 5: Configure route-specific security middleware if needed
    // Security middleware is handled at the application level for this tutorial
    
    // Step 6: Define GET route for ROUTES.HELLO path with comprehensive middleware chain
    router.get(ROUTES.HELLO, 
      // HTTP method validation middleware
      validateRouteMethod,
      // Wrap hello handler with asyncErrorHandler for automatic error catching
      asyncErrorHandler(helloHandler)
    );
    
    // Step 7: Set up method validation to ensure only GET requests are allowed
    router.all(ROUTES.HELLO, validateRouteMethod);
    
    // Step 8: Configure route-level error handling for Express.js 5.1.0 enhanced error processing
    setupRouteErrorHandling(router);
    
    // Step 9: Log successful router configuration with available routes and middleware
    logger.info('Hello router configured successfully', {
      routeName: ROUTE_NAME,
      routePath: ROUTES.HELLO,
      configuredMethods: ['GET'],
      middlewareCount: 3, // logging, validation, handler
      timestamp: new Date().toISOString()
    });
    
    // Step 10: Return configured router instance ready for Express.js application integration
    return router;
    
  } catch (error) {
    logger.error('Failed to create hello router', {
      routeName: ROUTE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Return basic router as fallback
    const fallbackRouter = Router();
    fallbackRouter.get(ROUTES.HELLO, helloHandler);
    return fallbackRouter;
  }
}

/**
 * HTTP Method Validation Middleware Function
 * 
 * Middleware function that validates HTTP methods for the hello endpoint, ensuring only
 * supported methods (GET) are allowed and returning appropriate error responses for
 * unsupported methods. Implements proper HTTP method validation with standardized
 * error handling and Express.js 5.1.0 enhanced error processing.
 * 
 * @param req - Express.js request object
 * @param res - Express.js response object  
 * @param next - Express.js next function for middleware chain continuation
 * @returns No return value, either calls next() for valid methods or sends error response
 */
export function validateRouteMethod(req: Request, res: Response, next: NextFunction): void {
  try {
    // Step 1: Extract HTTP method from request object
    const method = req.method.toUpperCase();
    
    // Step 2: Check if method is included in SUPPORTED_METHODS array
    if (SUPPORTED_METHODS.includes(method as any)) {
      // Step 3: If method is supported, call next() to continue middleware chain
      logger.debug('HTTP method validation passed', {
        method,
        path: req.path,
        requestId: req.requestId,
        supportedMethods: SUPPORTED_METHODS
      });
      
      next();
      return;
    }
    
    // Step 4: If method is not supported, log method validation error with request details
    logger.warn('HTTP method not allowed for hello endpoint', {
      method,
      path: req.path,
      requestId: req.requestId,
      supportedMethods: SUPPORTED_METHODS,
      clientIP: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Step 5: Set HTTP status to METHOD_NOT_ALLOWED using HTTP_STATUS constants
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED);
    
    // Step 6: Include allowed methods in response headers for client guidance
    res.setHeader('Allow', SUPPORTED_METHODS.join(', '));
    
    // Step 7: Send standardized error response with method validation message
    res.json({
      error: 'Method Not Allowed',
      message: `HTTP method ${method} is not allowed for this endpoint`,
      statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      allowedMethods: SUPPORTED_METHODS,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      path: req.path,
      method: req.method
    });
    
  } catch (error) {
    logger.error('Error in method validation middleware', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      path: req.path,
      requestId: req.requestId
    });
    
    // Call next with error for Express.js 5.1.0 error handling
    next(error);
  }
}

/**
 * Route Access Logging Middleware Function
 * 
 * Middleware function that logs route access information including request details,
 * correlation information, and performance tracking for the hello endpoint. Provides
 * comprehensive route-level logging for monitoring and debugging purposes with
 * structured logging and request correlation tracking.
 * 
 * @param req - Express.js request object
 * @param res - Express.js response object
 * @param next - Express.js next function for middleware chain continuation
 * @returns No return value, performs logging side effect and calls next()
 */
export function logRouteAccess(req: Request, res: Response, next: NextFunction): void {
  try {
    // Step 1: Extract request correlation information (requestId, correlationId)
    const requestId = req.requestId || 'unknown';
    const correlationId = req.correlationId || requestId;
    
    // Step 2: Log route access with HTTP method, path, and correlation details
    logger.info('Hello route accessed', {
      method: req.method,
      path: req.path,
      requestId,
      correlationId,
      route: ROUTE_NAME,
      timestamp: new Date().toISOString()
    });
    
    // Step 3: Include client information and request headers for debugging
    logger.debug('Route access details', {
      clientIP: req.ip,
      userAgent: req.get('User-Agent'),
      acceptLanguage: req.get('Accept-Language'),
      acceptEncoding: req.get('Accept-Encoding'),
      requestId,
      correlationId,
      headers: {
        host: req.get('Host'),
        origin: req.get('Origin'),
        referer: req.get('Referer')
      }
    });
    
    // Step 4: Record route access timestamp for performance tracking
    req.startTime = Date.now();
    
    // Step 5: Add route-specific context to logging metadata
    res.locals.routeContext = {
      routeName: ROUTE_NAME,
      routePath: ROUTES.HELLO,
      accessTime: new Date().toISOString(),
      method: req.method
    };
    
    // Step 6: Call next() to continue middleware chain execution
    next();
    
  } catch (error) {
    logger.error('Error in route access logging middleware', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      path: req.path,
      requestId: req.requestId
    });
    
    // Continue middleware chain even if logging fails
    next();
  }
}

/**
 * Route Error Handling Configuration Function
 * 
 * Configures route-specific error handling for the hello endpoint with Express.js 5.1.0
 * enhanced error processing, automatic promise rejection handling, and standardized error
 * responses. Provides comprehensive error management for route operations with logging
 * and correlation tracking.
 * 
 * @param router - Express.js router instance to configure error handling
 * @returns No return value, configures error handling on router instance
 */
export function setupRouteErrorHandling(router: Router): void {
  try {
    // Step 1: Set up route-specific error handling middleware on router
    router.use(ROUTES.HELLO, (error: any, req: Request, res: Response, next: NextFunction) => {
      // Step 2: Configure automatic promise rejection handling for async route handlers
      if (error) {
        logger.error('Route-specific error in hello endpoint', {
          error: error.message,
          stack: error.stack,
          requestId: req.requestId,
          correlationId: req.correlationId,
          method: req.method,
          path: req.path,
          route: ROUTE_NAME
        });
        
        // Step 3: Implement standardized error response formatting for route errors
        const errorResponse = {
          error: 'Hello Route Error',
          message: error.message || 'An error occurred processing the hello request',
          statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
          path: req.path,
          method: req.method
        };
        
        // Step 4: Set up error correlation and logging for route-specific errors
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      next();
    });
    
    // Step 5: Configure environment-specific error detail levels
    // Error details are handled by the main error handler based on environment
    
    // Step 6: Log error handling configuration for route debugging
    logger.debug('Route error handling configured', {
      routeName: ROUTE_NAME,
      routePath: ROUTES.HELLO,
      errorHandlingEnabled: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to setup route error handling', {
      routeName: ROUTE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Route Information Provider Function
 * 
 * Utility function that returns comprehensive information about the hello route configuration
 * including supported methods, middleware stack, and route metadata. Useful for debugging,
 * documentation, and route discovery with detailed configuration summary.
 * 
 * @returns Detailed route information object with configuration summary
 */
export function getRouteInfo(): RouteInfo {
  try {
    // Step 1: Collect route configuration information including path and methods
    const routeInfo: RouteInfo = {
      path: ROUTES.HELLO,
      methods: [...SUPPORTED_METHODS],
      middleware: [
        'loggingMiddleware',
        'logRouteAccess', 
        'validateRouteMethod',
        'asyncErrorHandler',
        'helloHandler'
      ],
      handler: 'helloHandler',
      security: {
        methodValidation: true,
        supportedMethods: SUPPORTED_METHODS,
        errorHandling: true
      },
      logging: {
        accessLogging: true,
        errorLogging: true,
        performanceTracking: true,
        correlation: true
      }
    };
    
    // Step 2: Generate middleware stack summary with execution order
    logger.debug('Route information generated', {
      routeName: ROUTE_NAME,
      routeInfo,
      timestamp: new Date().toISOString()
    });
    
    // Step 3: Include route-specific security and logging configuration
    // Already included in routeInfo object
    
    // Step 4: Add performance and monitoring configuration details
    // Already included in routeInfo object
    
    // Step 5: Include route handler information and type safety details
    // Already included in routeInfo object
    
    // Step 6: Return comprehensive route information object
    return routeInfo;
    
  } catch (error) {
    logger.error('Error generating route information', {
      routeName: ROUTE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Return basic route information as fallback
    return {
      path: ROUTES.HELLO,
      methods: ['GET'],
      middleware: ['helloHandler'],
      handler: 'helloHandler',
      security: { error: 'Unable to retrieve security info' },
      logging: { error: 'Unable to retrieve logging info' }
    };
  }
}

/**
 * Create and Export the Configured Hello Router Instance
 * 
 * Creates the main hello router instance using the factory function and exports it
 * for use in the main Express.js application. Provides immediate access to the
 * configured router with all middleware and error handling setup.
 */
export const helloRouter = createHelloRouter();

// Log router export for application integration tracking
logger.info('Hello router exported successfully', {
  routeName: ROUTE_NAME,
  routePath: ROUTES.HELLO,
  exportTime: new Date().toISOString(),
  routerMethods: ['get'],
  middlewareConfigured: true
});

/**
 * Export All Route Components for Comprehensive Access
 * 
 * Exports all route functions, types, and utilities for testing, debugging,
 * and integration with other parts of the application using named exports
 * for optimal tree-shaking and modularity.
 */

// Export main router instance for Express.js application integration
export { helloRouter as default };

// Export factory function for creating custom hello router instances  
export { createHelloRouter };

// Export middleware functions for reuse and testing
export { validateRouteMethod, logRouteAccess };

// Export utility functions for route management and information
export { getRouteInfo };

// Export TypeScript interfaces and types for enhanced type safety
export type { RouteInfo, HelloRouteConfig, HelloRouteHandler, RouteMiddleware };

// Export route configuration constants for external reference
export { ROUTE_NAME, SUPPORTED_METHODS, ROUTE_MIDDLEWARE_ORDER };