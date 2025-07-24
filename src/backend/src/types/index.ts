/**
 * Central TypeScript type definitions module that serves as the main type export hub 
 * for the Node.js tutorial application. This file aggregates and re-exports all type 
 * definitions from the types directory, provides additional utility types, and establishes 
 * the core type system for the application.
 * 
 * Integrates Express.js 5.1.0 type extensions, custom error interfaces, API response types,
 * and application-specific type definitions while maintaining educational clarity and 
 * demonstrating modern TypeScript patterns for Node.js development.
 * 
 * @version 1.0.0
 * @framework Express.js 5.1.0
 * @runtime Node.js 24.x
 * @educational Demonstrates TypeScript module organization and type aggregation patterns
 */

// Re-export all Express.js type extensions and API response interfaces from express.d.ts
export {
  // Express.js Response Locals Interface
  ResponseLocals,
  
  // Custom Error Handling Interface
  CustomError,
  
  // API Response Interfaces
  HelloResponse,
  HealthCheckResponse,
  ErrorResponse,
  
  // Express.js 5.1.0 Enhanced Handler Types
  RequestHandler,
  ErrorHandler,
  AsyncRequestHandler,
  MiddlewareFunction,
  
  // Generic Typed Interfaces from express.d.ts
  TypedRequest,
  TypedResponse
} from './express.d';

/**
 * Global constants for API response type categorization with immutable literal types
 * Provides compile-time type safety for API response type identification
 */
export const API_RESPONSE_TYPES = {
  HELLO: 'HelloResponse',
  HEALTH: 'HealthCheckResponse',
  ERROR: 'ErrorResponse'
} as const;

/**
 * Global constants for middleware type categorization with immutable literal types
 * Enables type-safe middleware function identification and configuration
 */
export const MIDDLEWARE_TYPES = {
  REQUEST_HANDLER: 'RequestHandler',
  ERROR_HANDLER: 'ErrorHandler',
  ASYNC_HANDLER: 'AsyncRequestHandler'
} as const;

/**
 * Application configuration interface aggregating all configuration types for 
 * centralized config management with readonly properties for immutability
 */
export interface AppConfig {
  /** Server configuration including port, host, and metadata */
  readonly server: ServerConfig;
  
  /** Environment configuration with deployment flags */
  readonly environment: EnvironmentConfig;
  
  /** Logging configuration for structured logging */
  readonly logging: LoggingConfig;
  
  /** Security configuration for middleware setup */
  readonly security: SecurityConfig;
}

/**
 * Server configuration interface for HTTP server initialization and metadata
 * with readonly properties ensuring configuration immutability
 */
export interface ServerConfig {
  /** HTTP server port number for binding */
  readonly port: number;
  
  /** HTTP server host address for binding */
  readonly host: string;
  
  /** Application name for identification */
  readonly name: string;
  
  /** Application version string */
  readonly version: string;
  
  /** Server timeout in milliseconds */
  readonly timeout: number;
}

/**
 * Environment configuration interface with environment detection flags for 
 * deployment-specific behavior and conditional logic
 */
export interface EnvironmentConfig {
  /** Current environment name */
  readonly env: EnvironmentType;
  
  /** Flag indicating production environment */
  readonly isProduction: boolean;
  
  /** Flag indicating development environment */
  readonly isDevelopment: boolean;
  
  /** Flag indicating test environment */
  readonly isTest: boolean;
  
  /** Flag indicating staging environment */
  readonly isStaging: boolean;
}

/**
 * Logging configuration interface for structured logging and monitoring setup
 * with settings for log levels, formatting, and output options
 */
export interface LoggingConfig {
  /** Logging level for message filtering */
  readonly level: LogLevel;
  
  /** Log message format */
  readonly format: string;
  
  /** Enable colored console output */
  readonly enableColors: boolean;
  
  /** Include timestamp in log messages */
  readonly includeTimestamp: boolean;
}

/**
 * Security configuration interface for middleware setup and protection mechanisms
 * integrating Helmet.js, CORS, and rate limiting configurations
 */
export interface SecurityConfig {
  /** Helmet.js security middleware configuration */
  readonly helmet: object;
  
  /** CORS middleware configuration */
  readonly cors: object;
  
  /** Rate limiting configuration */
  readonly rateLimit: object;
}

/**
 * Union type for all possible API response types ensuring type safety across endpoints
 * Enables compile-time validation of response structures
 */
export type ApiResponse = HelloResponse | HealthCheckResponse | ErrorResponse;

/**
 * Union type for supported HTTP methods with type safety
 * Constrains HTTP method values to valid options for route definitions
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

/**
 * Union type for supported logging levels with validation
 * Ensures logging level values are constrained to valid options
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

/**
 * Union type for supported environment types with validation
 * Constrains environment values to valid deployment environments
 */
export type EnvironmentType = 'development' | 'production' | 'test' | 'staging';

/**
 * Union type for supported HTTP status codes with comprehensive coverage
 * Provides type-safe status code handling for all common HTTP responses
 */
export type StatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 405 | 409 | 422 | 429 | 500 | 502 | 503 | 504;

/**
 * Union type for supported content types with common web content formats
 * Ensures content-type headers use valid MIME types
 */
export type ContentType = 'text/plain' | 'application/json' | 'text/html' | 'application/xml';

/**
 * Generic typed request interface with strongly-typed body for enhanced type safety
 * Extends Express Request with generic body type parameter for request validation
 */
export type TypedRequest<T = any> = import('express').Request & { body: T };

/**
 * Generic typed response interface with strongly-typed JSON method for response handling
 * Extends Express Response with generic JSON method for type-safe response generation
 */
export type TypedResponse<T = any> = import('express').Response & { json(body: T): import('express').Response };

/**
 * Type for configuration validation functions with generic parameter support
 * Enables type-safe configuration validation with partial input acceptance
 */
export type ConfigValidator<T> = (config: Partial<T>) => T;

/**
 * Generic handler function type for business logic with flexible input/output types
 * Supports both synchronous and asynchronous handler patterns
 */
export type HandlerFunction<T = any, R = any> = (input: T) => Promise<R> | R;

/**
 * Advanced utility types for common patterns and type transformations
 */

/**
 * Extract keys from an object type that have values assignable to a specific type
 * Useful for filtering object properties by their value types
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Make all properties of a type optional recursively
 * Useful for configuration objects with nested optional properties
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of a type required recursively
 * Useful for ensuring complete configuration objects
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Create a type that omits specified keys from all nested objects
 * Useful for creating public API types by removing internal properties
 */
export type DeepOmit<T, K extends keyof any> = {
  [P in keyof T]: T[P] extends object ? DeepOmit<T[P], K> : T[P];
};

/**
 * Type-safe environment variable configuration with default values
 * Ensures all environment variables are properly typed and validated
 */
export interface EnvironmentVariables {
  /** Server port with number validation */
  PORT: number;
  
  /** Server host address */
  HOST: string;
  
  /** Application environment */
  NODE_ENV: EnvironmentType;
  
  /** Application name */
  APP_NAME: string;
  
  /** Application version */
  APP_VERSION: string;
  
  /** Logging level */
  LOG_LEVEL: LogLevel;
}

/**
 * Request correlation interface for distributed tracing and monitoring
 * Provides structured request tracking across service boundaries
 */
export interface RequestCorrelation {
  /** Unique request identifier */
  requestId: string;
  
  /** Correlation identifier for request chains */
  correlationId: string;
  
  /** Request start timestamp */
  startTime: number;
  
  /** Request processing duration in milliseconds */
  duration?: number;
  
  /** Additional correlation metadata */
  metadata: Record<string, unknown>;
}

/**
 * Error context interface for comprehensive error tracking and debugging
 * Provides detailed error information for logging and monitoring
 */
export interface ErrorContext {
  /** Request correlation information */
  correlation: RequestCorrelation;
  
  /** HTTP method of the request */
  method: HttpMethod;
  
  /** Request path where error occurred */
  path: string;
  
  /** HTTP status code */
  statusCode: StatusCode;
  
  /** Error severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** User context if available */
  user?: unknown;
  
  /** Additional error context */
  details?: Record<string, unknown>;
}

/**
 * Performance metrics interface for application monitoring and optimization
 * Tracks key performance indicators for HTTP requests and system resources
 */
export interface PerformanceMetrics {
  /** Request processing duration in milliseconds */
  duration: number;
  
  /** Memory usage at request completion */
  memoryUsage: NodeJS.MemoryUsage;
  
  /** CPU usage percentage */
  cpuUsage?: number;
  
  /** HTTP status code */
  statusCode: StatusCode;
  
  /** Request path */
  path: string;
  
  /** HTTP method */
  method: HttpMethod;
  
  /** Request timestamp */
  timestamp: string;
}

/**
 * Health check status interface for comprehensive system monitoring
 * Provides detailed health information for service monitoring and alerting
 */
export interface SystemHealth {
  /** Overall system status */
  status: 'healthy' | 'unhealthy' | 'degraded';
  
  /** System uptime in milliseconds */
  uptime: number;
  
  /** Memory usage statistics */
  memory: NodeJS.MemoryUsage;
  
  /** Application version */
  version: string;
  
  /** Current environment */
  environment: EnvironmentType;
  
  /** Health check timestamp */
  timestamp: string;
  
  /** Detailed component health status */
  components?: Record<string, 'healthy' | 'unhealthy'>;
  
  /** Additional health metrics */
  metrics?: Record<string, number>;
}

/**
 * Middleware configuration interface for Express.js middleware setup
 * Provides type-safe middleware configuration with optional parameters
 */
export interface MiddlewareConfig {
  /** Body parser configuration */
  bodyParser?: {
    json?: { limit?: string };
    urlencoded?: { extended?: boolean; limit?: string };
  };
  
  /** CORS configuration */
  cors?: {
    origin?: string | string[] | boolean;
    credentials?: boolean;
    methods?: HttpMethod[];
  };
  
  /** Helmet security configuration */
  helmet?: {
    contentSecurityPolicy?: boolean | object;
    crossOriginEmbedderPolicy?: boolean;
    frameguard?: boolean | { action: string };
  };
  
  /** Compression configuration */
  compression?: {
    level?: number;
    threshold?: number;
  };
}

/**
 * Route configuration interface for type-safe route definitions
 * Ensures consistent route configuration across the application
 */
export interface RouteConfig {
  /** Route path pattern */
  path: string;
  
  /** HTTP method */
  method: HttpMethod;
  
  /** Route handler function */
  handler: RequestHandler;
  
  /** Middleware functions for this route */
  middleware?: MiddlewareFunction[];
  
  /** Route description for documentation */
  description?: string;
  
  /** Route tags for categorization */
  tags?: string[];
}

/**
 * API documentation interface for automated documentation generation
 * Provides structured information for API documentation tools
 */
export interface ApiDocumentation {
  /** API title */
  title: string;
  
  /** API description */
  description: string;
  
  /** API version */
  version: string;
  
  /** API base URL */
  baseUrl: string;
  
  /** API routes documentation */
  routes: RouteConfig[];
  
  /** API response schemas */
  responses: Record<string, unknown>;
  
  /** API error codes and descriptions */
  errors: Record<number, string>;
}

/**
 * Type guards for runtime type checking and validation
 * Provides type-safe runtime validation functions
 */
export namespace TypeGuards {
  /**
   * Type guard for checking if a value is a valid HTTP method
   */
  export function isHttpMethod(value: unknown): value is HttpMethod {
    return typeof value === 'string' && 
           ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(value);
  }

  /**
   * Type guard for checking if a value is a valid log level
   */
  export function isLogLevel(value: unknown): value is LogLevel {
    return typeof value === 'string' && 
           ['error', 'warn', 'info', 'http', 'debug'].includes(value);
  }

  /**
   * Type guard for checking if a value is a valid environment type
   */
  export function isEnvironmentType(value: unknown): value is EnvironmentType {
    return typeof value === 'string' && 
           ['development', 'production', 'test', 'staging'].includes(value);
  }

  /**
   * Type guard for checking if a value is a valid status code
   */
  export function isStatusCode(value: unknown): value is StatusCode {
    return typeof value === 'number' && 
           [200, 201, 204, 400, 401, 403, 404, 405, 409, 422, 429, 500, 502, 503, 504].includes(value);
  }

  /**
   * Type guard for checking if an error is a CustomError
   */
  export function isCustomError(error: unknown): error is CustomError {
    return error instanceof Error && 
           'statusCode' in error && 
           'code' in error && 
           typeof (error as any).statusCode === 'number' &&
           typeof (error as any).code === 'string';
  }
}

/**
 * Default export providing easy access to commonly used types
 * Enables convenient destructuring imports for frequently used types
 */
export default {
  // Type aliases
  ApiResponse,
  HttpMethod,
  LogLevel,
  EnvironmentType,
  StatusCode,
  ContentType,
  
  // Utility types
  TypedRequest,
  TypedResponse,
  ConfigValidator,
  HandlerFunction,
  
  // Constants
  API_RESPONSE_TYPES,
  MIDDLEWARE_TYPES,
  
  // Type guards
  TypeGuards
};

/**
 * Educational type examples and patterns for learning purposes
 * Demonstrates advanced TypeScript patterns and best practices
 */
export namespace Educational {
  /**
   * Example of conditional types for different response formats
   */
  export type ResponseFormat<T extends 'json' | 'xml' | 'text'> = 
    T extends 'json' ? { data: unknown; status: string } :
    T extends 'xml' ? string :
    T extends 'text' ? string :
    never;

  /**
   * Example of mapped types for creating readonly versions
   */
  export type ReadonlyConfig<T> = {
    readonly [K in keyof T]: T[K] extends object ? ReadonlyConfig<T[K]> : T[K];
  };

  /**
   * Example of template literal types for route patterns
   */
  export type ApiRoute<T extends string> = `/api/v1/${T}`;

  /**
   * Example of function overloads for different parameter types
   */
  export interface LoggerFunction {
    (message: string): void;
    (level: LogLevel, message: string): void;
    (level: LogLevel, message: string, metadata: Record<string, unknown>): void;
  }

  /**
   * Example of discriminated unions for type-safe state management
   */
  export type RequestState = 
    | { status: 'idle' }
    | { status: 'loading'; startTime: number }
    | { status: 'success'; data: unknown; duration: number }
    | { status: 'error'; error: CustomError; duration: number };
}