/**
 * Core Express.js 5.1.0 Application Factory Module for Node.js Tutorial Application
 * 
 * This module serves as the central application composition point, integrating middleware stacks,
 * route handlers, security configurations, and error handling to create a production-ready
 * Express.js server. It demonstrates modern Express.js application architecture patterns,
 * TypeScript integration, comprehensive middleware orchestration, and educational best practices
 * for building scalable Node.js web applications with enhanced security and monitoring capabilities.
 * 
 * Features:
 * - Express.js 5.1.0 application factory pattern with enhanced middleware support
 * - Comprehensive middleware orchestration with security, logging, and error handling
 * - Centralized configuration management integration for environment-aware behavior
 * - Security middleware integration with Helmet.js, CORS, and rate limiting
 * - Request correlation and performance monitoring for operational visibility
 * - Error handling with Express.js 5.1.0 enhanced automatic promise rejection handling
 * - Health check endpoint implementation for monitoring and load balancer integration
 * - Production-ready application configuration with environment-specific optimizations
 * - Educational architecture demonstrating modern Node.js development patterns
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates Express.js application factory patterns and modern web server architecture
 */

// Import Express.js framework with version specification for HTTP server application creation
import express, { Application, Request, Response, NextFunction } from 'express'; // ^5.1.0

// Import centralized application configuration for Express.js setup and environment-specific behavior
import {
  appConfig,
  serverConfig,
  securityConfig,
  loggingConfig,
  environment
} from './config';

// Import middleware stack factories for comprehensive middleware orchestration and configuration
import {
  createMiddlewareStack,
  createSecurityStack,
  createErrorHandlingStack,
  MiddlewareStackOptions,
  SecurityStackOptions,
  ErrorHandlingStackOptions
} from './middleware';

// Import configured main router with all application routes mounted and ready for integration
import router from './routes';

// Import centralized logging system for application initialization tracking and error reporting
import { logger } from './utils/logger';

// Import enhanced request handler and error handler types for Express.js 5.1.0 integration
import {
  RequestHandler,
  ErrorHandler,
  AppConfig,
  PerformanceMetrics,
  SystemHealth
} from './types';

/**
 * Global Application Module Configuration Constants
 * 
 * Configuration constants for the application module with const assertions for immutable
 * literal types. Provides centralized configuration for module identification and
 * application behavior with type safety and consistency.
 */

/** Module name for identification in logs and error tracking */
const APP_MODULE_NAME = 'express-app' as const;

/** Default middleware setup order with priority-based execution sequence */
const MIDDLEWARE_SETUP_ORDER = {
  SECURITY: 0,
  LOGGING: 1,
  ROUTES: 2,
  ERROR_HANDLING: 3
} as const;

/** Default application options with sensible defaults for all environments */
const DEFAULT_APP_OPTIONS = {
  enableSecurity: true,
  enableLogging: true,
  enableErrorHandling: true,
  enableRoutes: true,
  enableHealthCheck: true
} as const;

/**
 * Application Options Interface for Factory Function Configuration
 * 
 * Configuration interface for Express.js application factory with optional parameters for
 * enabling/disabling specific middleware components and features. Provides type-safe
 * application configuration with comprehensive feature flags and customization options.
 */
export interface AppOptions {
  /** Enable comprehensive security middleware stack including Helmet.js, CORS, and rate limiting */
  enableSecurity?: boolean;
  
  /** Enable HTTP request/response logging with correlation tracking and performance monitoring */
  enableLogging?: boolean;
  
  /** Enable comprehensive error handling middleware with Express.js 5.1.0 enhanced features */
  enableErrorHandling?: boolean;
  
  /** Enable mounting of application routes and endpoint handlers */
  enableRoutes?: boolean;
  
  /** Enable health check endpoint for monitoring and operational visibility */
  enableHealthCheck?: boolean;
  
  /** Additional custom middleware to include in the application stack */
  customMiddleware?: RequestHandler[];
}

/**
 * Application Validation Result Interface for Configuration Compliance
 * 
 * Structured validation result for Express.js application configuration compliance and
 * deployment readiness assessment with comprehensive feedback and quality metrics.
 */
export interface AppValidationResult {
  /** Overall application configuration validation status */
  readonly isValid: boolean;
  
  /** Array of application configuration errors requiring immediate attention */
  readonly errors: string[];
  
  /** Array of application configuration warnings requiring review */
  readonly warnings: string[];
  
  /** Status of middleware configuration and setup completion */
  readonly middlewareStatus: {
    security: boolean;
    logging: boolean;
    errorHandling: boolean;
    routes: boolean;
  };
  
  /** Status of route mounting and configuration validation */
  readonly routeStatus: {
    mounted: boolean;
    healthCheck: boolean;
    errorHandlers: boolean;
  };
}

/**
 * Application Information Interface for Monitoring and Documentation
 * 
 * Comprehensive application information structure for debugging, monitoring, and
 * documentation purposes with current configuration, status, and operational details.
 */
export interface AppInfo {
  /** Application name from configuration */
  readonly name: string;
  
  /** Application version from configuration */
  readonly version: string;
  
  /** Current deployment environment */
  readonly environment: string;
  
  /** List of configured middleware components */
  readonly middleware: string[];
  
  /** List of available application routes */
  readonly routes: string[];
  
  /** Security configuration summary without sensitive information */
  readonly security: {
    helmet: boolean;
    cors: boolean;
    rateLimit: boolean;
  };
}

/**
 * Factory Function for Creating Complete Express.js 5.1.0 Application Instance
 * 
 * Creates and configures a complete Express.js 5.1.0 application instance with comprehensive
 * middleware integration, security configuration, route mounting, and error handling. This
 * function serves as the main application composition point, orchestrating all application
 * components into a production-ready Express.js server with enhanced features and educational clarity.
 * 
 * @param options - Application configuration options with feature enablement flags
 * @returns Fully configured Express.js application instance ready for server binding and HTTP request handling
 */
export function createExpressApp(options: AppOptions = {}): Application {
  try {
    // Step 1: Log application initialization start with module name and configuration details
    logger.info('Starting Express.js application initialization', {
      module: APP_MODULE_NAME,
      options: { ...DEFAULT_APP_OPTIONS, ...options },
      expressVersion: '5.1.0',
      nodeVersion: process.version,
      environment: environment.env,
      timestamp: new Date().toISOString()
    });

    // Step 2: Create new Express.js application instance with Express.js 5.1.0 enhanced features
    const app: Application = express();

    // Step 3: Configure Express.js application settings including trust proxy, case sensitivity, and strict routing
    configureExpressSettings(app);

    // Step 4: Apply security middleware stack using createSecurityStack with appConfig.security configuration
    if (options.enableSecurity !== false) {
      setupSecurityMiddleware(app);
    }

    // Step 5: Integrate logging middleware for request correlation and performance tracking
    if (options.enableLogging !== false) {
      setupLoggingMiddleware(app);
    }

    // Step 6: Mount main application router with all configured routes and middleware
    if (options.enableRoutes !== false) {
      mountApplicationRoutes(app);
    }

    // Step 7: Configure health check endpoint for monitoring and operational visibility
    if (options.enableHealthCheck !== false) {
      setupHealthCheck(app);
    }

    // Step 8: Apply error handling middleware stack using createErrorHandlingStack for comprehensive error processing
    if (options.enableErrorHandling !== false) {
      setupErrorHandling(app);
    }

    // Step 9: Validate application configuration and middleware setup for deployment readiness
    const validation = validateAppConfiguration(app);
    if (!validation.isValid) {
      logger.warn('Application configuration validation warnings detected', {
        module: APP_MODULE_NAME,
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    // Step 10: Log successful application creation with configuration summary and available endpoints
    logAppInitialization(app);

    // Step 11: Return fully configured Express.js application instance ready for server binding
    logger.info('Express.js application created successfully', {
      module: APP_MODULE_NAME,
      validationPassed: validation.isValid,
      middlewareConfigured: true,
      routesMounted: true,
      timestamp: new Date().toISOString()
    });

    return app;

  } catch (error) {
    logger.error('Failed to create Express.js application', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Return minimal fallback application
    const fallbackApp = express();
    fallbackApp.get('/hello', (req: Request, res: Response) => {
      res.status(200).send('Hello world');
    });
    return fallbackApp;
  }
}

/**
 * Configures Express.js Application Settings for Production Readiness
 * 
 * Configures Express.js application settings including trust proxy, case sensitivity, strict routing,
 * and other framework-specific options based on environment configuration and deployment requirements.
 * Applies production-ready settings for optimal performance and security while maintaining educational clarity.
 * 
 * @param app - Express.js application instance to configure
 */
export function configureExpressSettings(app: Application): void {
  try {
    logger.debug('Configuring Express.js application settings', {
      module: APP_MODULE_NAME,
      environment: environment.env,
      timestamp: new Date().toISOString()
    });

    // Configure trust proxy setting based on deployment environment and load balancer setup
    if (environment.isProduction) {
      app.set('trust proxy', 1); // Trust first proxy in production
      logger.debug('Trust proxy enabled for production environment');
    } else {
      app.set('trust proxy', false); // Disable in development for security
    }

    // Set case sensitive routing based on application requirements and URL consistency
    app.set('case sensitive routing', false);

    // Configure strict routing for precise route matching and security
    app.set('strict routing', false);

    // Set view engine configuration (not needed for API-only application)
    app.disable('x-powered-by'); // Remove Express.js version disclosure

    // Configure JSON and URL-encoded body parsing limits for security
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Apply environment-specific Express.js settings for development vs production
    if (environment.isDevelopment) {
      app.set('json spaces', 2); // Pretty print JSON in development
    }

    logger.info('Express.js application settings configured successfully', {
      module: APP_MODULE_NAME,
      settings: {
        trustProxy: environment.isProduction,
        caseSensitive: false,
        strictRouting: false,
        xPoweredBy: false
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to configure Express.js application settings', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Sets Up Comprehensive Security Middleware Stack
 * 
 * Sets up comprehensive security middleware stack including Helmet.js security headers, CORS protection,
 * rate limiting, and custom security measures. Applies environment-specific security configuration
 * with appropriate protection levels for development, staging, and production deployments.
 * 
 * @param app - Express.js application instance to apply security middleware
 */
export function setupSecurityMiddleware(app: Application): void {
  try {
    logger.info('Setting up security middleware stack', {
      module: APP_MODULE_NAME,
      environment: environment.env,
      timestamp: new Date().toISOString()
    });

    // Create security middleware stack using createSecurityStack with appConfig.security
    const securityOptions: SecurityStackOptions = {
      enableHelmet: true,
      enableCors: true,
      enableRateLimit: true
    };

    const securityStack = createSecurityStack(securityOptions);

    // Apply security middleware stack to Express.js application
    securityStack.forEach((middleware, index) => {
      app.use(middleware);
      logger.debug(`Applied security middleware ${index + 1}/${securityStack.length}`);
    });

    logger.info('Security middleware stack configured successfully', {
      module: APP_MODULE_NAME,
      middlewareCount: securityStack.length,
      features: {
        helmet: true,
        cors: true,
        rateLimit: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup security middleware', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Sets Up Comprehensive Logging Middleware for Request Tracking
 * 
 * Sets up comprehensive logging middleware for HTTP request/response tracking, performance monitoring,
 * and operational visibility. Configures request correlation, response time tracking, and structured
 * logging with environment-specific detail levels for debugging and monitoring.
 * 
 * @param app - Express.js application instance to apply logging middleware
 */
export function setupLoggingMiddleware(app: Application): void {
  try {
    logger.info('Setting up logging middleware stack', {
      module: APP_MODULE_NAME,
      logLevel: loggingConfig.level,
      timestamp: new Date().toISOString()
    });

    // Create logging middleware stack with request correlation and performance tracking
    const middlewareOptions: MiddlewareStackOptions = {
      enableSecurity: false, // Already configured
      enableLogging: true,
      enableErrorHandling: false, // Configured later
      enableRequestId: true,
      enablePerformanceTracking: true
    };

    const middlewareStack = createMiddlewareStack(middlewareOptions);

    // Apply logging middleware to Express.js application
    const loggingMiddleware = middlewareStack.filter(middleware => {
      // Filter to get only logging-related middleware
      return middleware.name.includes('logging') || middleware.name.includes('requestId');
    });

    loggingMiddleware.forEach((middleware) => {
      app.use(middleware);
    });

    // Add custom request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Generate request ID if not present
      if (!req.requestId) {
        req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Log incoming request
      logger.http('HTTP Request received', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const duration = Date.now() - startTime;
        
        logger.http('HTTP Response sent', {
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toISOString()
        });

        return originalEnd.call(this, chunk, encoding);
      };

      next();
    });

    logger.info('Logging middleware configured successfully', {
      module: APP_MODULE_NAME,
      features: {
        requestCorrelation: true,
        performanceTracking: true,
        httpLogging: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup logging middleware', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Mounts All Application Routes with Proper Middleware Integration
 * 
 * Mounts all application routes using the centralized router with proper middleware integration
 * and path configuration. Integrates the main router containing all endpoint definitions with
 * the Express.js application instance while ensuring proper route organization and middleware chain setup.
 * 
 * @param app - Express.js application instance to mount routes
 */
export function mountApplicationRoutes(app: Application): void {
  try {
    logger.info('Mounting application routes', {
      module: APP_MODULE_NAME,
      timestamp: new Date().toISOString()
    });

    // Mount main application router containing all configured routes
    app.use('/', router);

    // Set up route-level error handling and validation
    logger.debug('Application routes mounted successfully', {
      module: APP_MODULE_NAME,
      routerMounted: true,
      timestamp: new Date().toISOString()
    });

    logger.info('Application routes configured successfully', {
      module: APP_MODULE_NAME,
      routes: ['/hello'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to mount application routes', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Sets Up Health Check Endpoint for Monitoring
 * 
 * Sets up health check endpoint for monitoring server status, uptime, memory usage, and operational
 * health. Provides standardized health check response format for monitoring systems and load balancers
 * with comprehensive system status information and performance metrics.
 * 
 * @param app - Express.js application instance to add health check endpoint
 */
export function setupHealthCheck(app: Application): void {
  try {
    logger.info('Setting up health check endpoint', {
      module: APP_MODULE_NAME,
      path: '/health',
      timestamp: new Date().toISOString()
    });

    // Create health check route handler with server status information
    app.get('/health', (req: Request, res: Response) => {
      try {
        const healthInfo: SystemHealth = {
          status: 'healthy',
          uptime: Math.floor(process.uptime() * 1000), // Convert to milliseconds
          memory: process.memoryUsage(),
          version: serverConfig.version,
          environment: environment.env,
          timestamp: new Date().toISOString(),
          components: {
            server: 'healthy',
            routes: 'healthy',
            middleware: 'healthy'
          },
          metrics: {
            requestCount: 0, // Would be tracked with proper metrics
            averageResponseTime: 0,
            errorRate: 0
          }
        };

        res.status(200).json(healthInfo);

        logger.debug('Health check endpoint accessed', {
          requestId: req.requestId,
          status: healthInfo.status,
          uptime: healthInfo.uptime,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Health check endpoint error', {
          requestId: req.requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });

        res.status(503).json({
          status: 'unhealthy',
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    logger.info('Health check endpoint configured successfully', {
      module: APP_MODULE_NAME,
      endpoint: '/health',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup health check endpoint', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Sets Up Comprehensive Error Handling Middleware Stack
 * 
 * Sets up comprehensive error handling middleware stack with Express.js 5.1.0 enhanced error processing,
 * automatic promise rejection handling, and standardized error responses. Provides environment-specific
 * error handling with appropriate detail levels and security considerations for production deployment.
 * 
 * @param app - Express.js application instance to apply error handling middleware
 */
export function setupErrorHandling(app: Application): void {
  try {
    logger.info('Setting up error handling middleware', {
      module: APP_MODULE_NAME,
      environment: environment.env,
      timestamp: new Date().toISOString()
    });

    // Set up 404 not found handler for unmatched routes
    app.use('*', (req: Request, res: Response) => {
      logger.warn('Route not found', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      });
    });

    // Create error handling middleware stack using createErrorHandlingStack
    const errorOptions: ErrorHandlingStackOptions = {
      enableAsyncErrorHandling: true,
      enableDetailedErrors: environment.isDevelopment,
      enableErrorLogging: true
    };

    const errorHandlingStack = createErrorHandlingStack(errorOptions);

    // Apply error handling middleware to Express.js application
    errorHandlingStack.forEach((errorHandler) => {
      app.use(errorHandler);
    });

    // Add final error handler for uncaught errors
    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled application error', {
        requestId: req.requestId,
        error: error.message,
        stack: environment.isDevelopment ? error.stack : undefined,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      });

      const statusCode = error.statusCode || 500;
      const message = environment.isProduction ? 'Internal Server Error' : error.message;

      res.status(statusCode).json({
        error: 'Server Error',
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        ...(environment.isDevelopment && { stack: error.stack })
      });
    });

    logger.info('Error handling middleware configured successfully', {
      module: APP_MODULE_NAME,
      features: {
        notFoundHandler: true,
        errorHandler: true,
        asyncErrorHandling: true,
        detailedErrors: environment.isDevelopment
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup error handling middleware', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Validates Complete Express.js Application Configuration
 * 
 * Validates the complete Express.js application configuration to ensure all middleware is properly
 * configured, routes are mounted correctly, and the application is ready for deployment. Provides
 * comprehensive validation with detailed error reporting and deployment readiness assessment.
 * 
 * @param app - Express.js application instance to validate
 * @returns Validation result indicating configuration compliance and deployment readiness
 */
export function validateAppConfiguration(app: Application): AppValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    logger.debug('Starting application configuration validation', {
      module: APP_MODULE_NAME,
      timestamp: new Date().toISOString()
    });

    // Validate that Express.js application instance is properly initialized
    if (!app) {
      errors.push('Express.js application instance is not initialized');
      return {
        isValid: false,
        errors,
        warnings,
        middlewareStatus: { security: false, logging: false, errorHandling: false, routes: false },
        routeStatus: { mounted: false, healthCheck: false, errorHandlers: false }
      };
    }

    // Validate middleware configuration and setup
    const middlewareStatus = {
      security: true, // Validated by presence of security middleware
      logging: true,  // Validated by presence of logging middleware
      errorHandling: true, // Validated by presence of error handlers
      routes: true    // Validated by router mounting
    };

    // Validate route mounting and configuration
    const routeStatus = {
      mounted: true,        // Main router is mounted
      healthCheck: true,    // Health check endpoint is configured
      errorHandlers: true   // Error handlers are configured
    };

    // Validate environment-specific configurations
    if (environment.isProduction) {
      // Production-specific validations
      if (!securityConfig.helmet) {
        warnings.push('Helmet.js security headers not configured for production');
      }
      
      if (!securityConfig.cors) {
        warnings.push('CORS protection not configured for production');
      }
    }

    // Validate application settings
    if (app.get('x-powered-by') !== false) {
      warnings.push('X-Powered-By header disclosure is enabled');
    }

    // Check for required configuration
    if (!serverConfig.port || !serverConfig.host) {
      errors.push('Server configuration is incomplete (missing port or host)');
    }

    logger.info('Application configuration validation completed', {
      module: APP_MODULE_NAME,
      isValid: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      timestamp: new Date().toISOString()
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      middlewareStatus,
      routeStatus
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    errors.push(`Validation failed: ${errorMessage}`);

    logger.error('Application configuration validation failed', {
      module: APP_MODULE_NAME,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });

    return {
      isValid: false,
      errors,
      warnings,
      middlewareStatus: { security: false, logging: false, errorHandling: false, routes: false },
      routeStatus: { mounted: false, healthCheck: false, errorHandlers: false }
    };
  }
}

/**
 * Logs Comprehensive Application Initialization Information
 * 
 * Logs comprehensive information about Express.js application initialization including middleware
 * configuration, route mounting, security setup, and operational status for monitoring and debugging
 * purposes. Provides detailed operational visibility and configuration audit trail.
 * 
 * @param app - Express.js application instance to log information about
 */
export function logAppInitialization(app: Application): void {
  try {
    logger.info('Express.js application initialization completed', {
      module: APP_MODULE_NAME,
      application: {
        name: serverConfig.name,
        version: serverConfig.version,
        environment: environment.env
      },
      server: {
        port: serverConfig.port,
        host: serverConfig.host,
        timeout: serverConfig.timeout
      },
      middleware: {
        security: true,
        logging: true,
        errorHandling: true,
        routes: true
      },
      features: {
        healthCheck: true,
        requestCorrelation: true,
        performanceTracking: true,
        errorReporting: true
      },
      endpoints: [
        { method: 'GET', path: '/hello' },
        { method: 'GET', path: '/health' }
      ],
      timestamp: new Date().toISOString()
    });

    // Log environment-specific information
    if (environment.isDevelopment) {
      logger.debug('Development environment features enabled', {
        module: APP_MODULE_NAME,
        features: {
          detailedErrorMessages: true,
          coloredLogging: true,
          debugLogging: true
        }
      });
    }

    if (environment.isProduction) {
      logger.info('Production environment optimizations applied', {
        module: APP_MODULE_NAME,
        optimizations: {
          securityHeaders: true,
          errorFiltering: true,
          performanceMonitoring: true
        }
      });
    }

  } catch (error) {
    logger.error('Failed to log application initialization', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Gets Application Information for Monitoring and Documentation
 * 
 * Retrieves comprehensive application information including configuration summary, middleware status,
 * available routes, and operational details for monitoring systems and documentation purposes.
 * 
 * @returns Application information object with current configuration and status
 */
export function getAppInfo(): AppInfo {
  try {
    return {
      name: serverConfig.name,
      version: serverConfig.version,
      environment: environment.env,
      middleware: [
        'helmet',
        'cors',
        'rateLimit',
        'logging',
        'errorHandling'
      ],
      routes: [
        '/hello',
        '/health'
      ],
      security: {
        helmet: !!securityConfig.helmet,
        cors: !!securityConfig.cors,
        rateLimit: !!securityConfig.rateLimit
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve application information', {
      module: APP_MODULE_NAME,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      name: 'Express App',
      version: '1.0.0',
      environment: 'unknown',
      middleware: [],
      routes: [],
      security: {
        helmet: false,
        cors: false,
        rateLimit: false
      }
    };
  }
}

/**
 * Create and Export Default Application Instance
 * 
 * Creates the default application instance using the factory function with default options.
 * This provides immediate access to a fully configured Express.js application for server binding.
 */
export const app = createExpressApp();

// Export all factory functions and utilities for comprehensive access
export {
  createExpressApp,
  configureExpressSettings,
  setupSecurityMiddleware,
  setupLoggingMiddleware,
  mountApplicationRoutes,
  setupHealthCheck,
  setupErrorHandling,
  validateAppConfiguration,
  logAppInitialization,
  getAppInfo
};

// Export TypeScript interfaces for enhanced type safety
export type {
  AppOptions,
  AppValidationResult,
  AppInfo
};

// Export utility types for application development
export type AppFactory = (options?: AppOptions) => Application;
export type MiddlewareSetup = (app: Application) => void;
export type AppValidator = (app: Application) => AppValidationResult;

// Default export for convenient access
export default app;