/**
 * TypeScript declaration file that extends and enhances Express.js 5.1.0 type definitions
 * for the Node.js tutorial application. This file implements module augmentation to extend
 * Express Request and Response interfaces with custom properties, defines application-specific
 * types for request handlers and middleware, and provides comprehensive type definitions for
 * API responses, error handling, and security middleware integration.
 * 
 * @version 1.0.0
 * @framework Express.js 5.1.0
 * @runtime Node.js 24.x
 */

// External imports with version specifications
import { Request, Response, NextFunction, Application } from 'express'; // ^5.1.0

/**
 * Enhanced response locals interface for Express.js response handling with request 
 * correlation and performance tracking capabilities
 */
export interface ResponseLocals {
  /** Unique request identifier for correlation and logging */
  requestId: string;
  
  /** Request start timestamp in milliseconds for performance tracking */
  startTime: number;
  
  /** Correlation identifier for distributed request tracing across services */
  correlationId: string;
  
  /** Additional metadata for request context and custom properties */
  metadata: Record<string, any>;
}

/**
 * Custom error interface extending Error with HTTP status codes and application-specific 
 * error properties for enhanced error handling in Express.js 5.1.0
 */
export interface CustomError extends Error {
  /** Error name identifier */
  name: string;
  
  /** Human-readable error message */
  message: string;
  
  /** HTTP status code associated with the error */
  statusCode: number;
  
  /** Application-specific error code for categorization */
  code: string;
  
  /** Additional error details and context information */
  details: any;
  
  /** Error stack trace (optional) */
  stack?: string;
}

/**
 * Type-safe interface for hello endpoint response structure ensuring consistent API response format
 */
export interface HelloResponse {
  /** Hello world message content */
  readonly message: string;
  
  /** ISO timestamp of response generation */
  readonly timestamp: string;
  
  /** Request identifier for correlation */
  readonly requestId: string;
}

/**
 * Health check response interface for server monitoring and status reporting with 
 * comprehensive system information
 */
export interface HealthCheckResponse {
  /** Health check status indicator */
  readonly status: 'ok' | 'error';
  
  /** Server uptime in seconds */
  readonly uptime: number;
  
  /** Health check timestamp */
  readonly timestamp: string;
  
  /** Current memory usage statistics */
  readonly memory: NodeJS.MemoryUsage;
  
  /** Application version */
  readonly version: string;
  
  /** Current deployment environment */
  readonly environment: string;
}

/**
 * Standardized error response interface for consistent error handling across all API endpoints
 */
export interface ErrorResponse {
  /** Error message */
  readonly error: string;
  
  /** HTTP status code */
  readonly statusCode: number;
  
  /** Error occurrence timestamp */
  readonly timestamp: string;
  
  /** Request identifier for error correlation */
  readonly requestId: string;
  
  /** Request path where error occurred */
  readonly path: string;
  
  /** HTTP method of the failed request */
  readonly method: string;
}

/**
 * Enhanced request handler type alias with async support for Express.js 5.1.0 middleware 
 * and route handlers supporting modern async/await patterns
 */
export type RequestHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

/**
 * Error handler type alias for Express.js 5.1.0 error middleware with automatic promise 
 * rejection handling and enhanced error processing capabilities
 */
export type ErrorHandler = (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => void | Promise<void>;

/**
 * Async request handler type for modern async/await middleware patterns with automatic 
 * error forwarding compatible with Express.js 5.1.0 promise handling
 */
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Generic middleware function type for Express.js middleware with enhanced type safety
 * supporting all middleware patterns including error handling
 */
export type MiddlewareFunction = RequestHandler | ErrorHandler | AsyncRequestHandler;

/**
 * Generic typed request interface with strongly-typed body for request validation
 */
export type TypedRequest<T = any> = Request & { body: T };

/**
 * Generic typed response interface with strongly-typed JSON method for response handling
 */
export type TypedResponse<T = any> = Response & { json(body: T): Response };

/**
 * Module augmentation for Express.js core interfaces to extend Request and Response
 * with custom properties for enhanced functionality and type safety
 */
declare module 'express-serve-static-core' {
  /**
   * Extended Express Request interface with custom properties for request correlation,
   * performance monitoring, and user context
   */
  interface Request {
    /** Unique identifier for request correlation and tracking */
    requestId: string;
    
    /** Correlation identifier for distributed request tracing */
    correlationId: string;
    
    /** Request start timestamp for performance monitoring */
    startTime: number;
    
    /** User information for authenticated requests (optional) */
    user?: any;
  }

  /**
   * Extended Express Response interface with enhanced locals for metadata and correlation
   */
  interface Response {
    /** Enhanced response locals with request correlation and metadata */
    locals: ResponseLocals;
  }
}

/**
 * Module augmentation for the main Express module to ensure compatibility with
 * Express.js 5.1.0 type system and enhanced error handling
 */
declare module 'express' {
  /**
   * Enhanced Express Application interface with additional configuration methods
   * for security middleware and monitoring integration
   */
  interface Application {
    /** Application-specific configuration for enhanced Express.js functionality */
    config?: Record<string, any>;
  }
}

/**
 * Global augmentation for Node.js global scope to include Express.js 5.1.0
 * enhanced error handling and async middleware support
 */
declare global {
  namespace Express {
    /**
     * Enhanced Express Request interface available globally
     */
    interface Request {
      /** Unique identifier for request correlation and tracking */
      requestId: string;
      
      /** Correlation identifier for distributed request tracing */
      correlationId: string;
      
      /** Request start timestamp for performance monitoring */
      startTime: number;
      
      /** User information for authenticated requests (optional) */
      user?: any;
    }

    /**
     * Enhanced Express Response interface available globally
     */
    interface Response {
      /** Enhanced response locals with request correlation and metadata */
      locals: ResponseLocals;
    }
  }
}

/**
 * Security middleware type definitions for Helmet.js integration and CORS configuration
 */
export namespace Security {
  /**
   * Helmet.js security configuration interface for Content Security Policy and security headers
   */
  export interface HelmetOptions {
    /** Content Security Policy configuration */
    contentSecurityPolicy?: {
      directives?: Record<string, string[]>;
      reportOnly?: boolean;
    };
    
    /** Cross-Origin-Embedder-Policy configuration */
    crossOriginEmbedderPolicy?: boolean | { policy: string };
    
    /** X-Frame-Options configuration */
    frameguard?: { action: string };
    
    /** Hide X-Powered-By header */
    hidePoweredBy?: boolean;
  }

  /**
   * CORS configuration interface for Cross-Origin Resource Sharing
   */
  export interface CorsOptions {
    /** Allowed origins for CORS requests */
    origin?: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    
    /** Allowed HTTP methods */
    methods?: string | string[];
    
    /** Allowed headers */
    allowedHeaders?: string | string[];
    
    /** Enable credentials */
    credentials?: boolean;
  }

  /**
   * Security middleware configuration type
   */
  export type SecurityMiddleware = MiddlewareFunction & {
    helmet?: HelmetOptions;
    cors?: CorsOptions;
  };
}

/**
 * Monitoring and observability type definitions for performance tracking and health monitoring
 */
export namespace Monitoring {
  /**
   * Performance metrics interface for request and system monitoring
   */
  export interface PerformanceMetrics {
    /** Request processing duration in milliseconds */
    duration: number;
    
    /** Memory usage at request completion */
    memoryUsage: NodeJS.MemoryUsage;
    
    /** HTTP status code */
    statusCode: number;
    
    /** Request path */
    path: string;
    
    /** HTTP method */
    method: string;
  }

  /**
   * Health check status interface for system monitoring
   */
  export interface HealthStatus {
    /** Overall system status */
    status: 'healthy' | 'unhealthy' | 'degraded';
    
    /** System uptime in milliseconds */
    uptime: number;
    
    /** Current memory usage */
    memory: NodeJS.MemoryUsage;
    
    /** Application version */
    version: string;
    
    /** Environment name */
    environment: string;
    
    /** Additional health details */
    details?: Record<string, any>;
  }

  /**
   * Monitoring middleware type for performance and health tracking
   */
  export type MonitoringMiddleware = MiddlewareFunction & {
    performance?: (metrics: PerformanceMetrics) => void;
    health?: () => HealthStatus;
  };
}

/**
 * Express.js 5.1.0 enhanced error handling utility types for automatic promise rejection
 * handling and comprehensive error processing
 */
export namespace ErrorHandling {
  /**
   * Error severity levels for categorization and handling
   */
  export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

  /**
   * Enhanced error context interface for detailed error information
   */
  export interface ErrorContext {
    /** Request identifier for correlation */
    requestId: string;
    
    /** User context if available */
    user?: any;
    
    /** Request path where error occurred */
    path: string;
    
    /** HTTP method */
    method: string;
    
    /** Error severity level */
    severity: ErrorSeverity;
    
    /** Additional context metadata */
    metadata?: Record<string, any>;
  }

  /**
   * Error handler factory type for creating custom error handlers
   */
  export type ErrorHandlerFactory = (context: ErrorContext) => ErrorHandler;

  /**
   * Async error wrapper type for Express.js 5.1.0 automatic promise rejection handling
   */
  export type AsyncErrorWrapper = <T extends AsyncRequestHandler>(handler: T) => RequestHandler;
}