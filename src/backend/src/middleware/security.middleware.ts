/**
 * Comprehensive Security Middleware Module for Node.js Tutorial Application
 * 
 * This module provides a complete security middleware stack that implements robust 
 * security protection for the Node.js tutorial application using Express.js 5.1.0. 
 * It demonstrates modern security practices while maintaining educational clarity and 
 * showcasing Express.js 5.1.0 security enhancements including ReDoS attack prevention 
 * and enhanced error handling.
 * 
 * Features:
 * - Helmet.js integration for comprehensive HTTP security headers
 * - CORS protection for secure cross-origin resource sharing
 * - Rate limiting for abuse prevention and DoS protection
 * - Custom security headers for enhanced protection
 * - Environment-specific security configuration
 * - Security event logging and audit trails
 * - Configuration validation and compliance checking
 * - TypeScript type safety with comprehensive interfaces
 * 
 * @version 1.0.0
 * @framework Express.js 5.1.0
 * @runtime Node.js 24.x LTS
 * @educational Demonstrates modern security middleware architecture and implementation
 */

// External security library imports with version specifications
import helmet from 'helmet'; // ^7.1.0 - HTTP security headers middleware
import cors from 'cors'; // ^2.8.5 - Cross-Origin Resource Sharing middleware
import rateLimit from 'express-rate-limit'; // ^7.1.5 - Rate limiting middleware

// Express.js 5.1.0 type imports for type-safe middleware development
import { Request, Response, NextFunction } from 'express'; // ^5.1.0

// Internal configuration imports for security setup
import { securityConfig } from '../config';

// Internal type imports for enhanced type safety
import { RequestHandler, ErrorHandler } from '../types';

// Internal logging utility for security event tracking
import { logger } from '../utils/logger';

/**
 * Global Security Headers Constants
 * 
 * Immutable constants defining standard HTTP security headers for 
 * comprehensive protection against common web vulnerabilities.
 */
export const SECURITY_HEADERS = {
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  REFERRER_POLICY: 'Referrer-Policy',
  PERMISSIONS_POLICY: 'Permissions-Policy'
} as const;

/**
 * Rate Limiting Default Configuration
 * 
 * Default configuration values for rate limiting middleware with
 * reasonable thresholds for tutorial application protection.
 */
export const RATE_LIMIT_DEFAULTS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  MESSAGE: 'Too many requests from this IP',
  STANDARD_HEADERS: true,
  LEGACY_HEADERS: false
} as const;

/**
 * CORS Default Configuration
 * 
 * Default CORS configuration with secure defaults for 
 * cross-origin resource sharing protection.
 */
export const CORS_DEFAULTS = {
  ORIGIN: false,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  CREDENTIALS: false,
  MAX_AGE: 86400
} as const;

/**
 * Security Options Interface
 * 
 * Comprehensive interface for configuring security middleware options
 * with optional parameters for flexible security setup.
 */
export interface SecurityOptions {
  /** Helmet.js configuration options for security headers */
  helmet?: object;
  
  /** CORS configuration options for cross-origin protection */
  cors?: object;
  
  /** Rate limiting configuration options for abuse prevention */
  rateLimit?: object;
  
  /** Custom security headers to add beyond Helmet.js defaults */
  customHeaders?: Record<string, string>;
  
  /** Enable security event logging and audit trails */
  enableLogging?: boolean;
}

/**
 * Security Validation Result Interface
 * 
 * Structured validation result with comprehensive feedback for 
 * security configuration compliance and best practices assessment.
 */
export interface SecurityValidationResult {
  /** Overall security configuration validation status */
  readonly isValid: boolean;
  
  /** Array of security configuration errors */
  readonly errors: string[];
  
  /** Array of security configuration warnings */
  readonly warnings: string[];
  
  /** Array of security best practice recommendations */
  readonly recommendations: string[];
  
  /** Security configuration compliance score (0-100) */
  readonly securityScore: number;
}

/**
 * Security Status Interface
 * 
 * Comprehensive security status information for monitoring 
 * and debugging security middleware configuration and operation.
 */
export interface SecurityStatus {
  /** Security middleware initialization status */
  readonly isInitialized: boolean;
  
  /** Current security configuration summary */
  readonly configuration: typeof securityConfig;
  
  /** Status of individual middleware components */
  readonly middleware: {
    helmet: boolean;
    cors: boolean;
    rateLimit: boolean;
    customHeaders: boolean;
  };
  
  /** Security compliance assessment */
  readonly compliance: SecurityValidationResult;
  
  /** Timestamp of last configuration update */
  readonly lastUpdated: string;
}

/**
 * Security Middleware Factory Type Definition
 * 
 * Type definition for security middleware factory functions that 
 * create configured middleware with optional parameters.
 */
export type SecurityMiddlewareFactory<T = any> = (options?: T) => RequestHandler;

/**
 * Security Event Handler Type Definition
 * 
 * Type definition for security event handling functions that 
 * process security events with structured logging.
 */
export type SecurityEventHandler = (eventType: string, message: string, metadata?: any) => void;

/**
 * Factory Function for Creating Helmet.js Middleware
 * 
 * Creates configured Helmet.js middleware with environment-specific security 
 * headers and protection mechanisms. Implements comprehensive HTTP security 
 * headers including CSP, X-Frame-Options, and other security measures based 
 * on application configuration and deployment environment.
 * 
 * @param helmetOptions - Optional Helmet.js configuration options
 * @returns Configured Helmet.js middleware function for Express.js application
 */
export function createHelmetMiddleware(helmetOptions?: object): RequestHandler {
  try {
    // Extract Helmet.js configuration from security config with environment overrides
    const baseHelmetConfig = securityConfig.helmet || {};
    const mergedOptions = { ...baseHelmetConfig, ...helmetOptions };
    
    // Configure Content Security Policy with appropriate directives
    const helmetConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      // Configure X-Frame-Options for clickjacking protection
      frameguard: {
        action: 'deny'
      },
      // Configure X-Content-Type-Options for MIME sniffing protection
      noSniff: true,
      // Set up Referrer Policy for privacy protection
      referrerPolicy: {
        policy: ['no-referrer', 'strict-origin-when-cross-origin']
      },
      // Configure Permissions Policy for feature access control
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: []
      },
      // Apply environment-specific security header configurations
      ...mergedOptions
    };
    
    // Log security middleware initialization with configuration details
    logger.info('Helmet.js security middleware initialized', {
      component: 'SecurityMiddleware',
      middleware: 'helmet',
      configuration: {
        contentSecurityPolicy: !!helmetConfig.contentSecurityPolicy,
        frameguard: !!helmetConfig.frameguard,
        noSniff: helmetConfig.noSniff,
        referrerPolicy: !!helmetConfig.referrerPolicy
      }
    });
    
    // Return configured Helmet.js middleware function
    return helmet(helmetConfig);
    
  } catch (error) {
    logger.error('Failed to create Helmet.js middleware', {
      component: 'SecurityMiddleware',
      error: error instanceof Error ? error.message : String(error),
      fallback: true
    });
    
    // Return basic Helmet.js configuration as fallback
    return helmet();
  }
}

/**
 * Factory Function for Creating CORS Middleware
 * 
 * Creates configured CORS middleware for secure cross-origin resource sharing. 
 * Implements environment-specific origin restrictions, method allowances, and 
 * credential handling based on deployment context and security requirements.
 * 
 * @param corsOptions - Optional CORS configuration options
 * @returns Configured CORS middleware function for cross-origin protection
 */
export function createCorsMiddleware(corsOptions?: object): RequestHandler {
  try {
    // Extract CORS configuration from security config with environment overrides
    const baseCorsConfig = securityConfig.cors || {};
    const mergedOptions = { ...baseCorsConfig, ...corsOptions };
    
    // Configure allowed origins based on environment (development vs production)
    let allowedOrigins: string[] | boolean = false;
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000'
      ];
    } else if (process.env.NODE_ENV === 'production') {
      allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || false;
    }
    
    // Set up CORS configuration with security considerations
    const corsConfig = {
      // Configure allowed origins based on environment
      origin: allowedOrigins,
      // Set up allowed HTTP methods for cross-origin requests
      methods: CORS_DEFAULTS.METHODS,
      // Configure allowed headers for cross-origin requests
      allowedHeaders: CORS_DEFAULTS.ALLOWED_HEADERS,
      // Set up credential handling based on security requirements
      credentials: false,
      // Configure preflight request handling and caching
      maxAge: CORS_DEFAULTS.MAX_AGE,
      // Include standard CORS headers
      optionsSuccessStatus: 200,
      // Apply custom CORS options
      ...mergedOptions
    };
    
    // Log CORS middleware initialization with security settings
    logger.info('CORS security middleware initialized', {
      component: 'SecurityMiddleware',
      middleware: 'cors',
      configuration: {
        origins: Array.isArray(allowedOrigins) ? allowedOrigins.length : typeof allowedOrigins,
        methods: corsConfig.methods.length,
        credentials: corsConfig.credentials,
        environment: process.env.NODE_ENV
      }
    });
    
    // Return configured CORS middleware function
    return cors(corsConfig);
    
  } catch (error) {
    logger.error('Failed to create CORS middleware', {
      component: 'SecurityMiddleware',
      error: error instanceof Error ? error.message : String(error),
      fallback: true
    });
    
    // Return restrictive CORS configuration as fallback
    return cors({ origin: false });
  }
}

/**
 * Factory Function for Creating Rate Limiting Middleware
 * 
 * Creates rate limiting middleware for preventing abuse and DoS attacks. 
 * Implements configurable request limits, time windows, and response handling 
 * with environment-specific thresholds and monitoring capabilities.
 * 
 * @param rateLimitOptions - Optional rate limiting configuration options
 * @returns Configured rate limiting middleware function for abuse prevention
 */
export function createRateLimitMiddleware(rateLimitOptions?: object): RequestHandler {
  try {
    // Extract rate limiting configuration from security config
    const baseRateLimitConfig = securityConfig.rateLimit || {};
    const mergedOptions = { ...baseRateLimitConfig, ...rateLimitOptions };
    
    // Configure environment-specific rate limiting thresholds
    let maxRequests = RATE_LIMIT_DEFAULTS.MAX_REQUESTS;
    if (process.env.NODE_ENV === 'development') {
      maxRequests = RATE_LIMIT_DEFAULTS.MAX_REQUESTS * 2; // More lenient for development
    } else if (process.env.NODE_ENV === 'production') {
      maxRequests = RATE_LIMIT_DEFAULTS.MAX_REQUESTS; // Strict for production
    }
    
    // Set up rate limiting configuration
    const rateLimitConfig = {
      // Configure time window for rate limit calculations
      windowMs: RATE_LIMIT_DEFAULTS.WINDOW_MS,
      // Set up maximum request limits per time window
      max: maxRequests,
      // Configure rate limit exceeded response messages
      message: {
        error: RATE_LIMIT_DEFAULTS.MESSAGE,
        statusCode: 429,
        retryAfter: Math.ceil(RATE_LIMIT_DEFAULTS.WINDOW_MS / 1000)
      },
      // Set up rate limit headers for client information
      standardHeaders: RATE_LIMIT_DEFAULTS.STANDARD_HEADERS,
      legacyHeaders: RATE_LIMIT_DEFAULTS.LEGACY_HEADERS,
      // Configure IP-based rate limiting with optional key generation
      keyGenerator: (request: Request): string => {
        return request.ip || request.socket.remoteAddress || 'unknown';
      },
      // Custom handler for rate limit exceeded
      handler: (request: Request, response: Response): void => {
        logger.warn('Rate limit exceeded', {
          component: 'SecurityMiddleware',
          middleware: 'rateLimit',
          ip: request.ip,
          path: request.path,
          method: request.method,
          userAgent: request.get('User-Agent')
        });
        
        response.status(429).json({
          error: 'Too many requests',
          message: RATE_LIMIT_DEFAULTS.MESSAGE,
          retryAfter: Math.ceil(RATE_LIMIT_DEFAULTS.WINDOW_MS / 1000)
        });
      },
      // Apply custom rate limiting options
      ...mergedOptions
    };
    
    // Log rate limiting middleware initialization with settings
    logger.info('Rate limiting security middleware initialized', {
      component: 'SecurityMiddleware',
      middleware: 'rateLimit',
      configuration: {
        windowMs: rateLimitConfig.windowMs,
        maxRequests: rateLimitConfig.max,
        environment: process.env.NODE_ENV
      }
    });
    
    // Return configured rate limiting middleware function
    return rateLimit(rateLimitConfig);
    
  } catch (error) {
    logger.error('Failed to create rate limiting middleware', {
      component: 'SecurityMiddleware',
      error: error instanceof Error ? error.message : String(error),
      fallback: true
    });
    
    // Return basic rate limiting configuration as fallback
    return rateLimit({
      windowMs: RATE_LIMIT_DEFAULTS.WINDOW_MS,
      max: RATE_LIMIT_DEFAULTS.MAX_REQUESTS
    });
  }
}

/**
 * Factory Function for Creating Complete Security Middleware Stack
 * 
 * Creates a complete security middleware stack combining Helmet.js, CORS, 
 * rate limiting, and custom security measures in the optimal order for 
 * maximum protection. Provides comprehensive security configuration for 
 * Express.js 5.1.0 applications.
 * 
 * @param options - Security configuration options for all middleware
 * @returns Array of security middleware functions in optimal execution order
 */
export function createSecurityMiddlewareStack(options: SecurityOptions = {}): RequestHandler[] {
  try {
    // Validate security options and apply defaults where needed
    const securityOptions: SecurityOptions = {
      helmet: options.helmet,
      cors: options.cors,
      rateLimit: options.rateLimit,
      customHeaders: options.customHeaders || {},
      enableLogging: options.enableLogging !== false // Default to true
    };
    
    // Create Helmet.js middleware with security headers configuration
    const helmetMiddleware = createHelmetMiddleware(securityOptions.helmet);
    
    // Create CORS middleware with cross-origin protection settings
    const corsMiddleware = createCorsMiddleware(securityOptions.cors);
    
    // Create rate limiting middleware with abuse prevention configuration
    const rateLimitMiddleware = createRateLimitMiddleware(securityOptions.rateLimit);
    
    // Add custom security headers middleware for additional protection
    const customHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
      addCustomSecurityHeaders(req, res, next);
    };
    
    // Configure security event logging middleware for audit trails
    const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
      if (securityOptions.enableLogging) {
        logSecurityEvent('request_processing', 'Security middleware processing request', {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      next();
    };
    
    // Order middleware functions for optimal security and performance
    const middlewareStack: RequestHandler[] = [
      // 1. Logging first for comprehensive request tracking
      loggingMiddleware,
      // 2. Rate limiting to prevent abuse before processing
      rateLimitMiddleware,
      // 3. Helmet.js for comprehensive security headers
      helmetMiddleware,
      // 4. CORS for cross-origin protection
      corsMiddleware,
      // 5. Custom security headers for additional protection
      customHeadersMiddleware
    ];
    
    // Log complete security stack initialization
    logger.info('Complete security middleware stack initialized', {
      component: 'SecurityMiddleware',
      middlewareCount: middlewareStack.length,
      features: {
        helmet: true,
        cors: true,
        rateLimit: true,
        customHeaders: Object.keys(securityOptions.customHeaders || {}).length > 0,
        logging: securityOptions.enableLogging
      }
    });
    
    // Return ordered array of security middleware functions
    return middlewareStack;
    
  } catch (error) {
    logger.error('Failed to create security middleware stack', {
      component: 'SecurityMiddleware',
      error: error instanceof Error ? error.message : String(error),
      fallback: true
    });
    
    // Return minimal security stack as fallback
    return [
      createHelmetMiddleware(),
      createCorsMiddleware(),
      createRateLimitMiddleware()
    ];
  }
}

/**
 * Middleware Function for Adding Custom Security Headers
 * 
 * Adds custom security headers beyond Helmet.js defaults for enhanced 
 * protection. Implements application-specific security headers and 
 * environment-specific security policies.
 * 
 * @param req - Express.js Request object
 * @param res - Express.js Response object
 * @param next - Express.js NextFunction for middleware chain
 */
export function addCustomSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  try {
    // Add custom security headers not covered by Helmet.js
    res.setHeader('X-Request-ID', req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Response-Time', Date.now().toString());
    
    // Set application-specific security policies
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-XSS-Protection', '0'); // Disabled as recommended by modern security standards
    
    // Configure environment-specific security headers
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Add security event correlation headers
    res.setHeader('X-Security-Policy', 'enforced');
    
    // Set up security monitoring headers
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Log custom security header application
    logger.debug('Custom security headers applied', {
      component: 'SecurityMiddleware',
      function: 'addCustomSecurityHeaders',
      requestId: res.getHeader('X-Request-ID'),
      path: req.path
    });
    
    // Call next middleware in the chain
    next();
    
  } catch (error) {
    logger.error('Failed to add custom security headers', {
      component: 'SecurityMiddleware',
      error: error instanceof Error ? error.message : String(error),
      path: req.path
    });
    
    // Continue middleware chain even if custom headers fail
    next();
  }
}

/**
 * Security Configuration Validation Function
 * 
 * Validates security configuration options to ensure proper setup and prevent 
 * security misconfigurations. Provides comprehensive validation with detailed 
 * error messages and security best practice recommendations.
 * 
 * @param options - Security configuration options to validate
 * @returns Validation result with success status, errors, and recommendations
 */
export function validateSecurityConfiguration(options: SecurityOptions): SecurityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let securityScore = 100;
  
  try {
    // Validate Helmet.js configuration options and security policies
    if (options.helmet) {
      if (typeof options.helmet !== 'object') {
        errors.push('Helmet configuration must be an object');
        securityScore -= 20;
      }
    } else {
      warnings.push('Helmet.js configuration not provided - using defaults');
      securityScore -= 5;
    }
    
    // Check CORS configuration for security compliance
    if (options.cors) {
      if (typeof options.cors !== 'object') {
        errors.push('CORS configuration must be an object');
        securityScore -= 15;
      }
    } else {
      warnings.push('CORS configuration not provided - using defaults');
      securityScore -= 5;
    }
    
    // Validate rate limiting configuration and thresholds
    if (options.rateLimit) {
      if (typeof options.rateLimit !== 'object') {
        errors.push('Rate limiting configuration must be an object');
        securityScore -= 15;
      }
    } else {
      warnings.push('Rate limiting configuration not provided - using defaults');
      securityScore -= 5;
    }
    
    // Verify environment-specific security settings
    if (process.env.NODE_ENV === 'production') {
      if (!options.helmet) {
        recommendations.push('Configure Helmet.js options for production environment');
        securityScore -= 10;
      }
      if (!options.cors) {
        recommendations.push('Configure CORS origins for production environment');
        securityScore -= 10;
      }
    }
    
    // Check for security best practice compliance
    if (options.enableLogging === false) {
      warnings.push('Security event logging is disabled - consider enabling for audit trails');
      securityScore -= 5;
    }
    
    // Identify potential security misconfigurations
    if (options.customHeaders && typeof options.customHeaders !== 'object') {
      errors.push('Custom headers configuration must be an object');
      securityScore -= 10;
    }
    
    // Generate security recommendations and warnings
    if (securityScore > 90) {
      recommendations.push('Security configuration is excellent');
    } else if (securityScore > 75) {
      recommendations.push('Security configuration is good with minor improvements needed');
    } else if (securityScore > 60) {
      recommendations.push('Security configuration needs attention and improvements');
    } else {
      recommendations.push('Security configuration requires significant improvements');
    }
    
    // Return comprehensive validation result with security assessment
    const validationResult: SecurityValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      securityScore: Math.max(0, securityScore)
    };
    
    logger.info('Security configuration validation completed', {
      component: 'SecurityMiddleware',
      function: 'validateSecurityConfiguration',
      result: {
        isValid: validationResult.isValid,
        errorsCount: errors.length,
        warningsCount: warnings.length,
        securityScore: validationResult.securityScore
      }
    });
    
    return validationResult;
    
  } catch (error) {
    logger.error('Security configuration validation failed', {
      component: 'SecurityMiddleware',
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      isValid: false,
      errors: ['Validation failed due to unexpected error'],
      warnings: [],
      recommendations: ['Review security configuration and try again'],
      securityScore: 0
    };
  }
}

/**
 * Security Event Logging Function
 * 
 * Logs security-related events including middleware initialization, configuration 
 * changes, and security violations for audit trails and monitoring. Provides 
 * structured security event logging with correlation tracking.
 * 
 * @param eventType - Type of security event being logged
 * @param message - Descriptive message for the security event
 * @param metadata - Additional metadata and context for the event
 */
export function logSecurityEvent(eventType: string, message: string, metadata?: any): void {
  try {
    // Format security event with timestamp and correlation information
    const securityEvent = {
      eventType,
      message,
      timestamp: new Date().toISOString(),
      component: 'SecurityMiddleware',
      // Include security event type and severity level
      severity: eventType.includes('error') || eventType.includes('violation') ? 'high' : 
                eventType.includes('warning') || eventType.includes('attempt') ? 'medium' : 'low',
      // Add security context and metadata information
      context: {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        pid: process.pid
      },
      // Sanitize sensitive information before logging
      metadata: metadata ? sanitizeMetadata(metadata) : undefined
    };
    
    // Log security event using appropriate log level
    if (securityEvent.severity === 'high') {
      logger.error(`[SECURITY] ${message}`, securityEvent);
    } else if (securityEvent.severity === 'medium') {
      logger.warn(`[SECURITY] ${message}`, securityEvent);
    } else {
      logger.info(`[SECURITY] ${message}`, securityEvent);
    }
    
    // Update security monitoring metrics if applicable
    // This could integrate with monitoring systems in production
    
  } catch (error) {
    logger.error('Failed to log security event', {
      component: 'SecurityMiddleware',
      originalEventType: eventType,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Metadata Sanitization Helper Function
 * 
 * Sanitizes metadata to remove sensitive information before logging
 * ensuring secure logging practices and preventing data leakage.
 * 
 * @param metadata - Metadata object to sanitize
 * @returns Sanitized metadata safe for logging
 */
function sanitizeMetadata(metadata: any): any {
  if (!metadata || typeof metadata !== 'object') {
    return metadata;
  }
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'session'];
  const sanitized = { ...metadata };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Main Security Middleware Class
 * 
 * Provides comprehensive security protection for Express.js 5.1.0 applications. 
 * Implements Helmet.js integration, CORS protection, rate limiting, and custom 
 * security measures with environment-specific configuration and monitoring capabilities.
 */
export class SecurityMiddleware {
  /** Security configuration with all middleware settings */
  private readonly config: typeof securityConfig;
  
  /** Configured Helmet.js middleware instance */
  private helmetMiddleware: RequestHandler;
  
  /** Configured CORS middleware instance */
  private corsMiddleware: RequestHandler;
  
  /** Configured rate limiting middleware instance */
  private rateLimitMiddleware: RequestHandler;
  
  /** Security middleware initialization status */
  private isInitialized: boolean = false;
  
  /**
   * SecurityMiddleware Constructor
   * 
   * Initializes SecurityMiddleware instance with provided security configuration, 
   * sets up all security middleware components, and validates configuration for 
   * security compliance.
   * 
   * @param config - Security configuration with all middleware settings
   */
  constructor(config: typeof securityConfig) {
    try {
      // Store security configuration and validate settings
      this.config = config;
      
      // Initialize Helmet.js middleware with security headers configuration
      this.helmetMiddleware = createHelmetMiddleware(this.config.helmet);
      
      // Set up CORS middleware with cross-origin protection settings
      this.corsMiddleware = createCorsMiddleware(this.config.cors);
      
      // Configure rate limiting middleware with abuse prevention settings
      this.rateLimitMiddleware = createRateLimitMiddleware(this.config.rateLimit);
      
      // Validate complete security configuration for compliance
      const validation = validateSecurityConfiguration({
        helmet: this.config.helmet,
        cors: this.config.cors,
        rateLimit: this.config.rateLimit,
        enableLogging: true
      });
      
      if (!validation.isValid) {
        logger.warn('Security configuration validation found issues', {
          component: 'SecurityMiddleware',
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
      
      // Log security middleware initialization with configuration summary
      logger.info('SecurityMiddleware initialized successfully', {
        component: 'SecurityMiddleware',
        securityScore: validation.securityScore,
        features: {
          helmet: !!this.config.helmet,
          cors: !!this.config.cors,
          rateLimit: !!this.config.rateLimit
        }
      });
      
      // Mark security middleware as initialized and ready for use
      this.isInitialized = true;
      
    } catch (error) {
      logger.error('Failed to initialize SecurityMiddleware', {
        component: 'SecurityMiddleware',
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Initialize with default middleware as fallback
      this.helmetMiddleware = createHelmetMiddleware();
      this.corsMiddleware = createCorsMiddleware();
      this.rateLimitMiddleware = createRateLimitMiddleware();
    }
  }
  
  /**
   * Returns Configured Helmet.js Middleware
   * 
   * Returns configured Helmet.js middleware for HTTP security headers protection 
   * including CSP, X-Frame-Options, and other security headers based on 
   * environment configuration.
   * 
   * @returns Helmet.js middleware function for security headers
   */
  public helmet(): RequestHandler {
    // Ensure security middleware is properly initialized
    if (!this.isInitialized) {
      logger.warn('SecurityMiddleware not fully initialized', {
        component: 'SecurityMiddleware',
        method: 'helmet'
      });
    }
    
    // Log Helmet.js middleware access for monitoring
    logger.debug('Helmet.js middleware accessed', {
      component: 'SecurityMiddleware',
      middleware: 'helmet'
    });
    
    // Return configured Helmet.js middleware instance
    return this.helmetMiddleware;
  }
  
  /**
   * Returns Configured CORS Middleware
   * 
   * Returns configured CORS middleware for cross-origin resource sharing 
   * protection with environment-specific origin restrictions and security policies.
   * 
   * @returns CORS middleware function for cross-origin protection
   */
  public cors(): RequestHandler {
    // Ensure security middleware is properly initialized
    if (!this.isInitialized) {
      logger.warn('SecurityMiddleware not fully initialized', {
        component: 'SecurityMiddleware',
        method: 'cors'
      });
    }
    
    // Log CORS middleware access for monitoring
    logger.debug('CORS middleware accessed', {
      component: 'SecurityMiddleware',
      middleware: 'cors'
    });
    
    // Return configured CORS middleware instance
    return this.corsMiddleware;
  }
  
  /**
   * Returns Configured Rate Limiting Middleware
   * 
   * Returns configured rate limiting middleware for preventing abuse and DoS 
   * attacks with environment-specific thresholds and monitoring capabilities.
   * 
   * @returns Rate limiting middleware function for abuse prevention
   */
  public rateLimit(): RequestHandler {
    // Ensure security middleware is properly initialized
    if (!this.isInitialized) {
      logger.warn('SecurityMiddleware not fully initialized', {
        component: 'SecurityMiddleware',
        method: 'rateLimit'
      });
    }
    
    // Log rate limiting middleware access for monitoring
    logger.debug('Rate limiting middleware accessed', {
      component: 'SecurityMiddleware',
      middleware: 'rateLimit'
    });
    
    // Return configured rate limiting middleware instance
    return this.rateLimitMiddleware;
  }
  
  /**
   * Returns Complete Security Middleware Stack
   * 
   * Returns the complete security middleware stack in optimal execution order 
   * including Helmet.js, CORS, rate limiting, and custom security measures for 
   * comprehensive protection.
   * 
   * @returns Complete ordered security middleware stack
   */
  public getMiddlewareStack(): RequestHandler[] {
    // Ensure all security middleware components are initialized
    if (!this.isInitialized) {
      logger.warn('SecurityMiddleware not fully initialized', {
        component: 'SecurityMiddleware',
        method: 'getMiddlewareStack'
      });
    }
    
    // Create ordered array of security middleware functions
    const middlewareStack: RequestHandler[] = [
      // Include Helmet.js middleware for security headers
      this.helmetMiddleware,
      // Add CORS middleware for cross-origin protection
      this.corsMiddleware,
      // Include rate limiting middleware for abuse prevention
      this.rateLimitMiddleware,
      // Add custom security headers middleware
      (req: Request, res: Response, next: NextFunction) => {
        addCustomSecurityHeaders(req, res, next);
      }
    ];
    
    // Log security middleware stack access
    logger.debug('Security middleware stack accessed', {
      component: 'SecurityMiddleware',
      middlewareCount: middlewareStack.length
    });
    
    // Return complete security middleware stack
    return middlewareStack;
  }
  
  /**
   * Updates Security Configuration
   * 
   * Updates security middleware configuration with new settings and reinitializes 
   * middleware components as needed. Provides runtime configuration updates with 
   * validation and security compliance checking.
   * 
   * @param newConfig - Partial security configuration with updates
   */
  public updateConfiguration(newConfig: Partial<typeof securityConfig>): void {
    try {
      // Validate new security configuration for compliance
      const validation = validateSecurityConfiguration({
        helmet: newConfig.helmet,
        cors: newConfig.cors,
        rateLimit: newConfig.rateLimit
      });
      
      if (!validation.isValid) {
        logger.error('Invalid security configuration update rejected', {
          component: 'SecurityMiddleware',
          errors: validation.errors
        });
        return;
      }
      
      // Merge new configuration with existing settings
      const updatedConfig = { ...this.config, ...newConfig };
      
      // Reinitialize affected middleware components
      if (newConfig.helmet) {
        this.helmetMiddleware = createHelmetMiddleware(newConfig.helmet);
        logger.info('Helmet.js middleware configuration updated');
      }
      
      if (newConfig.cors) {
        this.corsMiddleware = createCorsMiddleware(newConfig.cors);
        logger.info('CORS middleware configuration updated');
      }
      
      if (newConfig.rateLimit) {
        this.rateLimitMiddleware = createRateLimitMiddleware(newConfig.rateLimit);
        logger.info('Rate limiting middleware configuration updated');
      }
      
      // Log configuration update with security impact assessment
      logger.info('Security middleware configuration updated successfully', {
        component: 'SecurityMiddleware',
        changedSettings: Object.keys(newConfig),
        securityScore: validation.securityScore
      });
      
      // Mark security middleware as updated and ready
      this.isInitialized = true;
      
    } catch (error) {
      logger.error('Failed to update security configuration', {
        component: 'SecurityMiddleware',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Returns Current Security Status
   * 
   * Returns current security middleware status including configuration summary, 
   * initialization state, and security compliance assessment for monitoring 
   * and debugging purposes.
   * 
   * @returns Current security middleware status and configuration summary
   */
  public getSecurityStatus(): SecurityStatus {
    try {
      // Collect current security configuration summary
      const validation = validateSecurityConfiguration({
        helmet: this.config.helmet,
        cors: this.config.cors,
        rateLimit: this.config.rateLimit,
        enableLogging: true
      });
      
      // Check initialization status of all middleware components
      const middlewareStatus = {
        helmet: !!this.helmetMiddleware,
        cors: !!this.corsMiddleware,
        rateLimit: !!this.rateLimitMiddleware,
        customHeaders: true
      };
      
      // Generate security status summary with recommendations
      const securityStatus: SecurityStatus = {
        isInitialized: this.isInitialized,
        configuration: this.config,
        middleware: middlewareStatus,
        compliance: validation,
        lastUpdated: new Date().toISOString()
      };
      
      logger.debug('Security status generated', {
        component: 'SecurityMiddleware',
        isInitialized: securityStatus.isInitialized,
        securityScore: validation.securityScore
      });
      
      // Return comprehensive security status object
      return securityStatus;
      
    } catch (error) {
      logger.error('Failed to generate security status', {
        component: 'SecurityMiddleware',
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return error status
      return {
        isInitialized: false,
        configuration: this.config,
        middleware: {
          helmet: false,
          cors: false,
          rateLimit: false,
          customHeaders: false
        },
        compliance: {
          isValid: false,
          errors: ['Failed to generate security status'],
          warnings: [],
          recommendations: [],
          securityScore: 0
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

// Export all security middleware functionality for comprehensive access
export {
  // Main security middleware class
  SecurityMiddleware,
  
  // Factory functions for middleware creation
  createHelmetMiddleware,
  createCorsMiddleware,
  createRateLimitMiddleware,
  createSecurityMiddlewareStack,
  
  // Utility functions
  addCustomSecurityHeaders,
  validateSecurityConfiguration,
  logSecurityEvent
};

// Type exports for TypeScript integration
export type {
  SecurityOptions,
  SecurityValidationResult,
  SecurityStatus,
  SecurityMiddlewareFactory,
  SecurityEventHandler
};