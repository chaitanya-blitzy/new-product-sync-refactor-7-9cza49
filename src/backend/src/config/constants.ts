/**
 * Central Constants Definition Module for Node.js Tutorial Application
 * 
 * This module provides all application-wide constant values including server configuration,
 * HTTP status codes, response messages, route definitions, content types, logging configuration,
 * environment constants, and security settings. Serves as the single source of truth for all
 * static configuration values used throughout the application.
 * 
 * Features:
 * - Express.js 5.1.0 framework integration support
 * - Comprehensive HTTP server configuration constants
 * - Security middleware configuration for Helmet.js and CORS
 * - Standardized API response patterns
 * - Environment-specific configuration management
 * - Type-safe constant definitions with const assertions
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x
 * @requires Express.js 5.1.0
 */

/**
 * Server Configuration Constants
 * 
 * Defines essential server configuration parameters including default port,
 * host settings, timeout values, and server metadata required for HTTP
 * server initialization and operation with Express.js 5.1.0.
 */
export const SERVER_CONFIG = {
  /** Default HTTP server port number for local development */
  DEFAULT_PORT: 3000,
  /** Default server host address for binding */
  HOST: 'localhost',
  /** Application name for identification in logs and headers */
  NAME: 'Node.js Tutorial API',
  /** Application version following semantic versioning */
  VERSION: '1.0.0',
  /** Server timeout in milliseconds for request processing */
  TIMEOUT: 30000
} as const;

/**
 * HTTP Status Code Constants
 * 
 * Comprehensive set of HTTP status codes for standardized response
 * status handling across all endpoints. Includes success, client error,
 * and server error status codes commonly used in Express.js applications.
 */
export const HTTP_STATUS = {
  /** HTTP 200 - Request successful */
  OK: 200,
  /** HTTP 201 - Resource created successfully */
  CREATED: 201,
  /** HTTP 204 - Request successful, no content to return */
  NO_CONTENT: 204,
  /** HTTP 400 - Client request error */
  BAD_REQUEST: 400,
  /** HTTP 401 - Authentication required */
  UNAUTHORIZED: 401,
  /** HTTP 403 - Access forbidden */
  FORBIDDEN: 403,
  /** HTTP 404 - Resource not found */
  NOT_FOUND: 404,
  /** HTTP 405 - HTTP method not allowed for endpoint */
  METHOD_NOT_ALLOWED: 405,
  /** HTTP 409 - Resource conflict */
  CONFLICT: 409,
  /** HTTP 422 - Request validation failed */
  UNPROCESSABLE_ENTITY: 422,
  /** HTTP 429 - Rate limit exceeded */
  TOO_MANY_REQUESTS: 429,
  /** HTTP 500 - Internal server error */
  INTERNAL_SERVER_ERROR: 500,
  /** HTTP 502 - Bad gateway error */
  BAD_GATEWAY: 502,
  /** HTTP 503 - Service temporarily unavailable */
  SERVICE_UNAVAILABLE: 503,
  /** HTTP 504 - Gateway timeout error */
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Standardized Response Message Constants
 * 
 * Defines consistent response messages for API endpoints including
 * success messages, error descriptions, and status notifications.
 * Ensures uniform communication across the application.
 */
export const RESPONSE_MESSAGES = {
  /** Standard greeting response for hello endpoint */
  HELLO_WORLD: 'Hello world',
  /** Generic resource not found message */
  NOT_FOUND: 'Resource not found',
  /** HTTP method not supported message */
  METHOD_NOT_ALLOWED: 'Method not allowed for this endpoint',
  /** Internal server error message */
  INTERNAL_ERROR: 'Internal server error occurred',
  /** Rate limiting exceeded message */
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  /** Request validation failed message */
  BAD_REQUEST: 'Invalid request format or parameters',
  /** Service unavailable message */
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
} as const;

/**
 * Route Path Constants
 * 
 * Centralized route definitions for consistent endpoint URLs and
 * API versioning. Supports Express.js router configuration and
 * enables easy maintenance of URL structures.
 */
export const ROUTES = {
  /** Application root path */
  ROOT: '/',
  /** Hello world endpoint path */
  HELLO: '/hello',
  /** Health check endpoint path */
  HEALTH: '/health',
  /** API namespace prefix */
  API_PREFIX: '/api',
  /** API version 1 prefix */
  V1_PREFIX: '/api/v1'
} as const;

/**
 * HTTP Content Type Constants
 * 
 * Standard content type definitions for HTTP response headers.
 * Includes character encoding specifications for proper text
 * rendering and internationalization support.
 */
export const CONTENT_TYPES = {
  /** Plain text content type with UTF-8 encoding */
  TEXT_PLAIN: 'text/plain; charset=utf-8',
  /** JSON content type with UTF-8 encoding */
  APPLICATION_JSON: 'application/json; charset=utf-8',
  /** HTML content type with UTF-8 encoding */
  TEXT_HTML: 'text/html; charset=utf-8',
  /** XML content type with UTF-8 encoding */
  APPLICATION_XML: 'application/xml; charset=utf-8'
} as const;

/**
 * Environment Type Constants
 * 
 * Defines standard deployment environment identifiers for
 * environment-specific configuration and feature toggles.
 * Supports multiple deployment stages and development workflows.
 */
export const ENVIRONMENT = {
  /** Development environment identifier */
  DEVELOPMENT: 'development',
  /** Production environment identifier */
  PRODUCTION: 'production',
  /** Test environment identifier */
  TEST: 'test',
  /** Staging environment identifier */
  STAGING: 'staging'
} as const;

/**
 * Logging Configuration Constants
 * 
 * Comprehensive logging configuration including log levels,
 * output formats, and default settings for structured logging
 * and application monitoring with popular Node.js logging frameworks.
 */
export const LOGGING = {
  /** Log level definitions for severity classification */
  LEVELS: {
    /** Error level for application errors and exceptions */
    ERROR: 'error',
    /** Warning level for non-critical issues */
    WARN: 'warn',
    /** Information level for general application events */
    INFO: 'info',
    /** HTTP level for request/response logging */
    HTTP: 'http',
    /** Debug level for development and troubleshooting */
    DEBUG: 'debug'
  },
  /** Log output format options */
  FORMATS: {
    /** Simple text format for development */
    SIMPLE: 'simple',
    /** JSON format for structured logging */
    JSON: 'json',
    /** Combined format with timestamp and metadata */
    COMBINED: 'combined'
  },
  /** Default logging level for application startup */
  DEFAULT_LEVEL: 'info'
} as const;

/**
 * Security Configuration Constants
 * 
 * Comprehensive security middleware configuration for Express.js 5.1.0
 * including Helmet.js security headers, CORS settings, and rate limiting
 * parameters. Implements security best practices for Node.js applications.
 */
export const SECURITY_CONFIG = {
  /** Helmet.js security middleware configuration options */
  HELMET_OPTIONS: {
    /** Content Security Policy configuration */
    contentSecurityPolicy: {
      directives: {
        /** Default source directive - only allow same origin */
        defaultSrc: ["'self'"],
        /** Style source directive - allow same origin and inline styles */
        styleSrc: ["'self'", "'unsafe-inline'"],
        /** Script source directive - only allow same origin scripts */
        scriptSrc: ["'self'"],
        /** Image source directive - allow same origin, data URLs, and HTTPS */
        imgSrc: ["'self'", 'data:', 'https:'],
        /** Connection source directive - only allow same origin */
        connectSrc: ["'self'"],
        /** Font source directive - only allow same origin */
        fontSrc: ["'self'"],
        /** Object source directive - block all object embeds */
        objectSrc: ["'none'"],
        /** Media source directive - only allow same origin */
        mediaSrc: ["'self'"],
        /** Frame source directive - block all frame embeds */
        frameSrc: ["'none'"]
      }
    },
    /** Cross-Origin Embedder Policy configuration */
    crossOriginEmbedderPolicy: false,
    /** Remove X-Powered-By header to prevent framework fingerprinting */
    xPoweredBy: false,
    /** HTTP Strict Transport Security configuration */
    hsts: {
      /** HSTS max age in seconds (1 year) */
      maxAge: 31536000,
      /** Include subdomains in HSTS policy */
      includeSubDomains: true,
      /** Enable HSTS preload for browsers */
      preload: true
    }
  },
  /** CORS (Cross-Origin Resource Sharing) configuration options */
  CORS_OPTIONS: {
    /** Allowed origins for cross-origin requests */
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    /** Allowed HTTP methods for CORS requests */
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    /** Allowed headers for CORS requests */
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    /** Disable credentials for security */
    credentials: false,
    /** Preflight cache duration in seconds (24 hours) */
    maxAge: 86400
  },
  /** Rate limiting time window in milliseconds (15 minutes) */
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  /** Maximum requests per rate limit window */
  RATE_LIMIT_MAX: 100
} as const;

/**
 * Application Error Code Constants
 * 
 * Standardized error codes for consistent error handling and
 * identification across the application. Enables programmatic
 * error classification and appropriate response generation.
 */
export const ERROR_CODES = {
  /** Validation error code for input validation failures */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** Authentication error code for auth failures */
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  /** Authorization error code for access control failures */
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  /** Not found error code for missing resources */
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  /** Internal error code for server-side issues */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Rate limit error code for exceeded limits */
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  /** Timeout error code for request timeouts */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const;

/**
 * Request Size and Limit Constants
 * 
 * Defines maximum request sizes and limits for security and
 * performance optimization. Prevents resource exhaustion and
 * implements reasonable constraints for HTTP requests.
 */
export const REQUEST_LIMITS = {
  /** Maximum request body size */
  MAX_REQUEST_SIZE: '10mb',
  /** Maximum number of parameters in request */
  MAX_PARAMETER_LIMIT: 1000,
  /** Maximum URL length for requests */
  MAX_URL_LENGTH: 2048,
  /** Maximum header size for HTTP requests */
  MAX_HEADER_SIZE: 8192
} as const;

/**
 * Cache Configuration Constants
 * 
 * Caching configuration parameters for performance optimization
 * including TTL (Time To Live) values for different content types
 * and response caching strategies.
 */
export const CACHE_CONFIG = {
  /** Default TTL for cached content in seconds (5 minutes) */
  DEFAULT_TTL: 300,
  /** Maximum TTL for any cached content in seconds (1 hour) */
  MAX_TTL: 3600,
  /** TTL for static assets in seconds (24 hours) */
  STATIC_ASSETS_TTL: 86400,
  /** TTL for API responses in seconds (1 minute) */
  API_RESPONSE_TTL: 60
} as const;

/**
 * Type Definitions for Enhanced Type Safety
 * 
 * TypeScript type definitions derived from the constant objects
 * to provide compile-time type checking and IntelliSense support.
 */

/** Server configuration type definition */
export type ServerConfigType = typeof SERVER_CONFIG;

/** HTTP status codes type definition */
export type HttpStatusType = typeof HTTP_STATUS;

/** Response messages type definition */
export type ResponseMessagesType = typeof RESPONSE_MESSAGES;

/** Route paths type definition */
export type RoutesType = typeof ROUTES;

/** Content types type definition */
export type ContentTypesType = typeof CONTENT_TYPES;

/** Environment types definition */
export type EnvironmentType = typeof ENVIRONMENT;

/** Logging configuration type definition */
export type LoggingType = typeof LOGGING;

/** Security configuration type definition */
export type SecurityConfigType = typeof SECURITY_CONFIG;

/** Error codes type definition */
export type ErrorCodesType = typeof ERROR_CODES;

/** Request limits type definition */
export type RequestLimitsType = typeof REQUEST_LIMITS;

/** Cache configuration type definition */
export type CacheConfigType = typeof CACHE_CONFIG;

/**
 * Union Types for Specific Value Sets
 * 
 * Creates union types from constant values for strict type checking
 * and ensuring only valid constant values are used throughout the application.
 */

/** Valid HTTP status code values */
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/** Valid environment values */
export type EnvironmentValue = typeof ENVIRONMENT[keyof typeof ENVIRONMENT];

/** Valid log level values */
export type LogLevel = typeof LOGGING.LEVELS[keyof typeof LOGGING.LEVELS];

/** Valid log format values */
export type LogFormat = typeof LOGGING.FORMATS[keyof typeof LOGGING.FORMATS];

/** Valid route path values */
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

/** Valid content type values */
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

/** Valid error code values */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Default Export for Convenient Access
 * 
 * Provides a single object containing all constants for convenient
 * access patterns while maintaining individual named exports for
 * specific use cases and tree-shaking optimization.
 */
export default {
  SERVER_CONFIG,
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  ROUTES,
  CONTENT_TYPES,
  ENVIRONMENT,
  LOGGING,
  SECURITY_CONFIG,
  ERROR_CODES,
  REQUEST_LIMITS,
  CACHE_CONFIG
} as const;