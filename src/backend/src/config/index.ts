/**
 * Central Configuration Barrel Export Module for Node.js Tutorial Application
 * 
 * This module provides unified access to all application configuration components
 * for the Node.js tutorial application. Serves as the main configuration entry point,
 * combining constants, environment settings, and type definitions while providing
 * a comprehensive application configuration object that supports Express.js 5.1.0
 * integration, security middleware setup, and environment-aware behavior across
 * development, testing, and production deployments.
 * 
 * Features:
 * - Centralized configuration management with barrel export pattern
 * - Express.js 5.1.0 framework integration support
 * - Environment-aware configuration with type safety
 * - Security middleware configuration for Helmet.js and CORS
 * - Configuration validation and error handling
 * - Localized logging to avoid circular dependencies
 * - Type-safe configuration architecture with readonly properties
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x
 * @requires Express.js 5.1.0
 */

// Import server configuration constants for default values and validation
import {
  SERVER_CONFIG,
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  ROUTES,
  CONTENT_TYPES,
  SECURITY_CONFIG,
  LOGGING
} from './constants';

// Import validated environment configuration with runtime settings
import { config } from './environment';
import type { EnvironmentConfig } from './environment';

/**
 * Global Configuration Validation State
 * 
 * Arrays to track configuration validation errors and warnings during
 * application initialization for comprehensive error reporting.
 */
const CONFIG_VALIDATION_ERRORS: string[] = [];
const CONFIG_WARNINGS: string[] = [];

/**
 * Application Configuration Interface
 * 
 * Comprehensive interface defining the complete application configuration
 * structure with readonly properties for immutability and type safety.
 */
export interface AppConfig {
  /** Server configuration including port, host, and connection settings */
  readonly server: ServerConfiguration;
  /** Security configuration for middleware and protection mechanisms */
  readonly security: SecurityConfiguration;
  /** Route configuration with endpoint definitions and metadata */
  readonly routes: RouteConfiguration;
  /** Logging configuration with environment-appropriate settings */
  readonly logging: LoggingConfiguration;
  /** Environment configuration with runtime settings and flags */
  readonly environment: EnvironmentConfig;
}

/**
 * Server Configuration Interface
 * 
 * Defines server-specific configuration parameters for Express.js
 * initialization and HTTP server setup with type safety.
 */
export interface ServerConfiguration {
  /** HTTP server port number for binding */
  readonly port: number;
  /** HTTP server host address for binding */
  readonly host: string;
  /** Server timeout in milliseconds for request handling */
  readonly timeout: number;
  /** Application name for identification and logging */
  readonly name: string;
  /** Application version for API versioning and monitoring */
  readonly version: string;
}

/**
 * Security Configuration Interface
 * 
 * Comprehensive security configuration for middleware setup including
 * Helmet.js, CORS, and rate limiting with environment-appropriate settings.
 */
export interface SecurityConfiguration {
  /** Helmet.js security middleware configuration options */
  readonly helmet: object;
  /** CORS middleware configuration for cross-origin requests */
  readonly cors: object;
  /** Rate limiting configuration for request throttling */
  readonly rateLimit: object;
}

/**
 * Route Configuration Interface
 * 
 * Route configuration structure defining endpoint paths, middleware,
 * and handler mappings for Express.js routing setup.
 */
export interface RouteConfiguration {
  /** Route path definitions and endpoint mappings */
  readonly paths: object;
  /** Route-specific middleware configuration */
  readonly middleware: object;
  /** Route handler function mappings */
  readonly handlers: object;
}

/**
 * Logging Configuration Interface
 * 
 * Logging system configuration with environment-aware settings
 * for development, testing, and production environments.
 */
export interface LoggingConfiguration {
  /** Active log level for filtering messages */
  readonly level: string;
  /** Log output format for message formatting */
  readonly format: string;
  /** Enable colored output for console logging */
  readonly enableColors: boolean;
  /** Include timestamp in log messages */
  readonly includeTimestamp: boolean;
}

/**
 * Configuration Validation Result Interface
 * 
 * Structured validation result with success status, error messages,
 * and warnings for comprehensive configuration validation feedback.
 */
export interface ConfigValidationResult {
  /** Overall validation success status */
  readonly isValid: boolean;
  /** Array of validation error messages */
  readonly errors: string[];
  /** Array of validation warning messages */
  readonly warnings: string[];
  /** Validation summary message */
  readonly summary: string;
}

/**
 * Configuration Summary Interface
 * 
 * Sanitized configuration summary for logging and monitoring
 * without exposing sensitive information.
 */
export interface ConfigurationSummary {
  /** Current environment name */
  readonly environment: string;
  /** Server configuration summary */
  readonly server: object;
  /** Security configuration summary */
  readonly security: object;
  /** Enabled features and capabilities */
  readonly features: string[];
  /** Configuration initialization timestamp */
  readonly timestamp: string;
}

/**
 * Local Configuration Information Logging
 * 
 * Provides formatted logging for configuration information messages using
 * console.log. Avoids circular dependencies with external logging modules
 * while providing comprehensive configuration startup information.
 * 
 * @param message - Information message to log
 * @param context - Additional context information for the message
 */
function logConfigInfo(message: string, context?: any): void {
  // Format message with timestamp and configuration context
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [CONFIG-INFO] ${message}`;
  
  // Use console.log for information-level logging during configuration startup
  console.log(formattedMessage);
  
  // Include relevant configuration context information if provided
  if (context !== undefined) {
    console.log(`[${timestamp}] [CONFIG-INFO] Context:`, context);
  }
}

/**
 * Local Configuration Warning Logging
 * 
 * Provides formatted warning logging for configuration issues and non-critical
 * problems using console.warn. Maintains configuration validation functionality
 * without external dependencies.
 * 
 * @param message - Warning message to log
 * @param context - Additional context information for the warning
 */
function logConfigWarning(message: string, context?: any): void {
  // Format warning message with timestamp and configuration context
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [CONFIG-WARN] ${message}`;
  
  // Use console.warn for warning-level logging during configuration setup
  console.warn(formattedMessage);
  
  // Include warning details and context information
  if (context !== undefined) {
    console.warn(`[${timestamp}] [CONFIG-WARN] Context:`, context);
  }
  
  // Add warning to global warnings array for validation reporting
  CONFIG_WARNINGS.push(message);
}

/**
 * Local Configuration Error Logging
 * 
 * Provides formatted error logging for configuration failures and critical
 * issues using console.error. Ensures configuration errors are properly
 * reported without external logging dependencies.
 * 
 * @param message - Error message to log
 * @param error - Error object or additional error context
 */
function logConfigError(message: string, error?: Error | any): void {
  // Format error message with timestamp and configuration context
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [CONFIG-ERROR] ${message}`;
  
  // Use console.error for error-level logging during configuration initialization
  console.error(formattedMessage);
  
  // Include error details and stack trace if available
  if (error !== undefined) {
    if (error instanceof Error) {
      console.error(`[${timestamp}] [CONFIG-ERROR] Error:`, error.message);
      if (error.stack) {
        console.error(`[${timestamp}] [CONFIG-ERROR] Stack:`, error.stack);
      }
    } else {
      console.error(`[${timestamp}] [CONFIG-ERROR] Details:`, error);
    }
  }
  
  // Add error to global errors array for validation reporting
  CONFIG_VALIDATION_ERRORS.push(message);
}

/**
 * Validates Complete Application Configuration
 * 
 * Performs comprehensive validation of the application configuration object
 * to ensure all required settings are present, properly formatted, and
 * compatible with each other. Includes environment consistency checks,
 * security settings validation, and deployment readiness verification.
 * 
 * @param appConfig - Complete application configuration object to validate
 * @returns Comprehensive validation result with success status, errors, and warnings
 */
export function validateConfiguration(appConfig: AppConfig): ConfigValidationResult {
  // Clear previous validation state for fresh validation
  CONFIG_VALIDATION_ERRORS.length = 0;
  CONFIG_WARNINGS.length = 0;
  
  try {
    logConfigInfo('Starting comprehensive configuration validation');
    
    // Validate server configuration including port, host, and timeout settings
    if (!appConfig.server) {
      logConfigError('Server configuration is missing from application config');
    } else {
      // Validate port number range and availability
      if (!appConfig.server.port || appConfig.server.port < 1 || appConfig.server.port > 65535) {
        logConfigError(`Invalid server port: ${appConfig.server.port}. Must be between 1 and 65535`);
      }
      
      // Validate host address format
      if (!appConfig.server.host || typeof appConfig.server.host !== 'string') {
        logConfigError(`Invalid server host: ${appConfig.server.host}. Must be a valid string`);
      }
      
      // Validate timeout value range
      if (!appConfig.server.timeout || appConfig.server.timeout < 1000 || appConfig.server.timeout > 300000) {
        logConfigWarning(`Server timeout ${appConfig.server.timeout}ms may be outside recommended range (1000-300000ms)`);
      }
    }
    
    // Check environment configuration consistency and required environment variables
    if (!appConfig.environment) {
      logConfigError('Environment configuration is missing from application config');
    } else {
      // Validate environment name against supported environments
      const validEnvironments = ['development', 'production', 'test', 'staging'];
      if (!validEnvironments.includes(appConfig.environment.env)) {
        logConfigError(`Invalid environment: ${appConfig.environment.env}. Must be one of: ${validEnvironments.join(', ')}`);
      }
      
      // Validate environment flags consistency
      const envFlags = [
        appConfig.environment.isProduction,
        appConfig.environment.isDevelopment,
        appConfig.environment.isTest,
        appConfig.environment.isStaging
      ];
      const trueFlags = envFlags.filter(flag => flag === true).length;
      if (trueFlags !== 1) {
        logConfigError(`Environment flags inconsistency: exactly one environment flag should be true, found ${trueFlags}`);
      }
    }
    
    // Validate security configuration including Helmet.js and CORS settings
    if (!appConfig.security) {
      logConfigError('Security configuration is missing from application config');
    } else {
      // Validate Helmet.js configuration presence
      if (!appConfig.security.helmet) {
        logConfigWarning('Helmet.js security configuration is missing - security headers may not be properly set');
      }
      
      // Validate CORS configuration for cross-origin security
      if (!appConfig.security.cors) {
        logConfigWarning('CORS configuration is missing - cross-origin requests may be blocked');
      }
      
      // Validate rate limiting configuration
      if (!appConfig.security.rateLimit) {
        logConfigWarning('Rate limiting configuration is missing - application may be vulnerable to abuse');
      }
    }
    
    // Verify route configuration and endpoint definitions
    if (!appConfig.routes) {
      logConfigError('Route configuration is missing from application config');
    } else {
      // Validate route paths configuration
      if (!appConfig.routes.paths) {
        logConfigError('Route paths configuration is missing');
      }
      
      // Validate route middleware configuration
      if (!appConfig.routes.middleware) {
        logConfigWarning('Route middleware configuration is missing');
      }
      
      // Validate route handlers configuration
      if (!appConfig.routes.handlers) {
        logConfigWarning('Route handlers configuration is missing');
      }
    }
    
    // Check logging configuration and level compatibility
    if (!appConfig.logging) {
      logConfigError('Logging configuration is missing from application config');
    } else {
      // Validate log level against supported levels
      const validLogLevels = Object.values(LOGGING.LEVELS);
      if (!validLogLevels.includes(appConfig.logging.level)) {
        logConfigError(`Invalid log level: ${appConfig.logging.level}. Must be one of: ${validLogLevels.join(', ')}`);
      }
      
      // Validate logging format
      if (!appConfig.logging.format || typeof appConfig.logging.format !== 'string') {
        logConfigWarning('Logging format is not properly configured');
      }
    }
    
    // Validate environment-specific settings and deployment readiness
    if (appConfig.environment?.isProduction) {
      // Production-specific validation checks
      if (appConfig.server?.port && appConfig.server.port < 1024) {
        logConfigWarning(`Production environment using system port ${appConfig.server.port} - ensure proper permissions`);
      }
      
      if (appConfig.logging?.level === LOGGING.LEVELS.DEBUG) {
        logConfigWarning('Debug logging enabled in production environment - consider using info or warn level');
      }
    }
    
    // Collect validation errors and warnings for reporting
    const hasErrors = CONFIG_VALIDATION_ERRORS.length > 0;
    const hasWarnings = CONFIG_WARNINGS.length > 0;
    
    // Generate comprehensive validation summary
    let summary = 'Configuration validation completed';
    if (hasErrors) {
      summary += ` with ${CONFIG_VALIDATION_ERRORS.length} error(s)`;
    }
    if (hasWarnings) {
      summary += ` and ${CONFIG_WARNINGS.length} warning(s)`;
    }
    if (!hasErrors && !hasWarnings) {
      summary += ' successfully with no issues';
    }
    
    logConfigInfo(`Configuration validation summary: ${summary}`);
    
    // Return comprehensive validation result with detailed feedback
    return {
      isValid: !hasErrors,
      errors: [...CONFIG_VALIDATION_ERRORS],
      warnings: [...CONFIG_WARNINGS],
      summary
    };
    
  } catch (error) {
    const errorMessage = `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    return {
      isValid: false,
      errors: [errorMessage, ...CONFIG_VALIDATION_ERRORS],
      warnings: [...CONFIG_WARNINGS],
      summary: 'Configuration validation failed due to unexpected error'
    };
  }
}

/**
 * Creates Server-Specific Configuration
 * 
 * Creates server-specific configuration object by combining constants with
 * environment-specific overrides. Provides type-safe server configuration
 * for Express.js initialization with appropriate defaults and environment-aware settings.
 * 
 * @returns Complete server configuration object with validated settings
 */
export function createServerConfiguration(): ServerConfiguration {
  try {
    logConfigInfo('Creating server configuration with environment-specific settings');
    
    // Extract server settings from environment configuration
    const envConfig = config;
    
    // Apply server constants as base configuration with environment overrides
    const serverConfiguration: ServerConfiguration = {
      port: envConfig.port || SERVER_CONFIG.DEFAULT_PORT,
      host: envConfig.host || SERVER_CONFIG.HOST,
      timeout: envConfig.timeout || SERVER_CONFIG.TIMEOUT,
      name: SERVER_CONFIG.NAME,
      version: SERVER_CONFIG.VERSION
    };
    
    // Validate port and host settings for current environment
    if (serverConfiguration.port < 1 || serverConfiguration.port > 65535) {
      logConfigWarning(`Server port ${serverConfiguration.port} is outside valid range (1-65535)`);
    }
    
    // Apply production-specific optimizations if needed
    if (envConfig.isProduction) {
      logConfigInfo('Applying production-specific server optimizations');
      
      // Production environment specific configurations can be added here
      if (serverConfiguration.port < 1024) {
        logConfigWarning(`Production server using system port ${serverConfiguration.port} - ensure proper permissions`);
      }
    }
    
    // Log server configuration creation with key details
    logConfigInfo('Server configuration created successfully', {
      port: serverConfiguration.port,
      host: serverConfiguration.host,
      name: serverConfiguration.name,
      environment: envConfig.env
    });
    
    // Return validated server configuration object
    return serverConfiguration;
    
  } catch (error) {
    const errorMessage = `Failed to create server configuration: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    // Return fallback configuration with default values
    return {
      port: SERVER_CONFIG.DEFAULT_PORT,
      host: SERVER_CONFIG.HOST,
      timeout: SERVER_CONFIG.TIMEOUT,
      name: SERVER_CONFIG.NAME,
      version: SERVER_CONFIG.VERSION
    };
  }
}

/**
 * Creates Comprehensive Security Configuration
 * 
 * Creates comprehensive security configuration object by combining security
 * constants with environment-specific security settings. Provides configuration
 * for Helmet.js, CORS, rate limiting, and other security middleware with
 * appropriate security levels for each environment.
 * 
 * @returns Complete security configuration object with environment-appropriate settings
 */
export function createSecurityConfiguration(): SecurityConfiguration {
  try {
    logConfigInfo('Creating security configuration with environment-appropriate settings');
    
    // Extract base security configuration from SECURITY_CONFIG constants
    const baseSecurityConfig = SECURITY_CONFIG;
    const envConfig = config;
    
    // Apply environment-specific security overrides and enhancements
    let helmetOptions = { ...baseSecurityConfig.HELMET_OPTIONS };
    let corsOptions = { ...baseSecurityConfig.CORS_OPTIONS };
    
    // Configure security based on environment
    if (envConfig.isProduction) {
      logConfigInfo('Applying production-level security enhancements');
      
      // Production-specific security enhancements
      helmetOptions = {
        ...helmetOptions,
        hsts: {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true
        }
      };
      
      // Restrict CORS origins for production
      corsOptions = {
        ...corsOptions,
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
      };
    } else if (envConfig.isDevelopment) {
      logConfigInfo('Applying development-friendly security settings');
      
      // Development-specific CORS settings for easier testing
      corsOptions = {
        ...corsOptions,
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
      };
    }
    
    // Configure rate limiting based on environment and expected load
    const rateLimitConfig = {
      windowMs: baseSecurityConfig.RATE_LIMIT_WINDOW,
      max: envConfig.isProduction ? baseSecurityConfig.RATE_LIMIT_MAX : baseSecurityConfig.RATE_LIMIT_MAX * 2,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    };
    
    // Create comprehensive security configuration object
    const securityConfiguration: SecurityConfiguration = {
      helmet: helmetOptions,
      cors: corsOptions,
      rateLimit: rateLimitConfig
    };
    
    // Log security configuration creation with environment context
    logConfigInfo('Security configuration created successfully', {
      environment: envConfig.env,
      helmetEnabled: !!securityConfiguration.helmet,
      corsEnabled: !!securityConfiguration.cors,
      rateLimitEnabled: !!securityConfiguration.rateLimit
    });
    
    // Return comprehensive security configuration object
    return securityConfiguration;
    
  } catch (error) {
    const errorMessage = `Failed to create security configuration: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    // Return fallback security configuration with minimal settings
    return {
      helmet: SECURITY_CONFIG.HELMET_OPTIONS,
      cors: SECURITY_CONFIG.CORS_OPTIONS,
      rateLimit: {
        windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
        max: SECURITY_CONFIG.RATE_LIMIT_MAX
      }
    };
  }
}

/**
 * Creates Route Configuration Object
 * 
 * Creates route configuration object that defines all application endpoints,
 * their paths, and routing metadata. Provides centralized route management
 * with type safety and consistent endpoint definitions across the application.
 * 
 * @returns Complete route configuration object with all endpoint definitions
 */
export function createRouteConfiguration(): RouteConfiguration {
  try {
    logConfigInfo('Creating route configuration with all endpoint definitions');
    
    // Extract route paths from ROUTES constants
    const routePaths = {
      root: ROUTES.ROOT,
      hello: ROUTES.HELLO,
      health: ROUTES.HEALTH,
      apiPrefix: ROUTES.API_PREFIX,
      v1Prefix: ROUTES.V1_PREFIX
    };
    
    // Define route metadata including methods and handlers
    const routeMiddleware = {
      logging: true,
      security: true,
      validation: false, // No validation needed for simple endpoints
      compression: config.isProduction
    };
    
    // Configure route-specific middleware and security settings
    const routeHandlers = {
      hello: {
        method: 'GET',
        path: ROUTES.HELLO,
        contentType: CONTENT_TYPES.TEXT_PLAIN,
        response: RESPONSE_MESSAGES.HELLO_WORLD,
        statusCode: HTTP_STATUS.OK
      },
      health: {
        method: 'GET',
        path: ROUTES.HEALTH,
        contentType: CONTENT_TYPES.APPLICATION_JSON,
        response: { status: 'ok', timestamp: new Date().toISOString() },
        statusCode: HTTP_STATUS.OK
      },
      notFound: {
        method: '*',
        path: '*',
        contentType: CONTENT_TYPES.APPLICATION_JSON,
        response: { error: RESPONSE_MESSAGES.NOT_FOUND },
        statusCode: HTTP_STATUS.NOT_FOUND
      }
    };
    
    // Create complete route configuration object
    const routeConfiguration: RouteConfiguration = {
      paths: routePaths,
      middleware: routeMiddleware,
      handlers: routeHandlers
    };
    
    // Log route configuration creation with endpoint summary
    logConfigInfo('Route configuration created successfully', {
      totalRoutes: Object.keys(routeHandlers).length,
      endpoints: Object.keys(routeHandlers),
      securityEnabled: routeMiddleware.security
    });
    
    // Return complete route configuration object
    return routeConfiguration;
    
  } catch (error) {
    const errorMessage = `Failed to create route configuration: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    // Return fallback route configuration with minimal endpoints
    return {
      paths: {
        root: ROUTES.ROOT,
        hello: ROUTES.HELLO,
        health: ROUTES.HEALTH
      },
      middleware: {
        logging: true,
        security: true
      },
      handlers: {
        hello: {
          method: 'GET',
          path: ROUTES.HELLO,
          response: RESPONSE_MESSAGES.HELLO_WORLD
        }
      }
    };
  }
}

/**
 * Creates Logging Configuration Object
 * 
 * Creates logging configuration object that defines log levels, formats,
 * and output settings based on environment configuration. Provides
 * environment-aware logging setup for development debugging and production monitoring.
 * 
 * @returns Complete logging configuration object with environment-appropriate settings
 */
export function createLoggingConfiguration(): LoggingConfiguration {
  try {
    logConfigInfo('Creating logging configuration with environment-aware settings');
    
    // Extract logging settings from environment configuration
    const envConfig = config;
    const baseLogLevel = envConfig.logLevel || LOGGING.DEFAULT_LEVEL;
    
    // Configure environment-specific log detail levels
    let logLevel = baseLogLevel;
    let logFormat = LOGGING.FORMATS.SIMPLE;
    let enableColors = true;
    let includeTimestamp = true;
    
    // Apply environment-specific logging configurations
    if (envConfig.isProduction) {
      logConfigInfo('Applying production logging configuration');
      
      // Production logging optimizations
      logFormat = LOGGING.FORMATS.JSON;
      enableColors = false; // Disable colors for log aggregation systems
      
      // Ensure production doesn't use debug level unless explicitly set
      if (logLevel === LOGGING.LEVELS.DEBUG && !process.env.LOG_LEVEL) {
        logLevel = LOGGING.LEVELS.INFO;
        logConfigWarning('Debug logging disabled in production, using info level');
      }
    } else if (envConfig.isDevelopment) {
      logConfigInfo('Applying development logging configuration');
      
      // Development logging for better debugging
      logFormat = LOGGING.FORMATS.SIMPLE;
      enableColors = true;
      
      // Use debug level for development unless overridden
      if (!process.env.LOG_LEVEL) {
        logLevel = LOGGING.LEVELS.DEBUG;
      }
    } else if (envConfig.isTest) {
      logConfigInfo('Applying test environment logging configuration');
      
      // Test environment logging - minimal output
      logLevel = LOGGING.LEVELS.ERROR; // Only show errors during tests
      enableColors = false;
    }
    
    // Create comprehensive logging configuration object
    const loggingConfiguration: LoggingConfiguration = {
      level: logLevel,
      format: logFormat,
      enableColors,
      includeTimestamp
    };
    
    // Log logging configuration creation with settings summary
    logConfigInfo('Logging configuration created successfully', {
      level: loggingConfiguration.level,
      format: loggingConfiguration.format,
      environment: envConfig.env,
      colorsEnabled: loggingConfiguration.enableColors
    });
    
    // Return validated logging configuration object
    return loggingConfiguration;
    
  } catch (error) {
    const errorMessage = `Failed to create logging configuration: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    // Return fallback logging configuration with safe defaults
    return {
      level: LOGGING.DEFAULT_LEVEL,
      format: LOGGING.FORMATS.SIMPLE,
      enableColors: true,
      includeTimestamp: true
    };
  }
}

/**
 * Initializes Complete Application Configuration
 * 
 * Initializes and validates the complete application configuration by combining
 * all configuration components and performing comprehensive validation. Logs
 * configuration status and handles initialization errors gracefully using
 * local logging functions.
 * 
 * @returns Fully initialized and validated application configuration object
 */
export function initializeConfiguration(): AppConfig {
  try {
    // Log configuration initialization start
    logConfigInfo('Starting complete application configuration initialization');
    
    // Create server configuration with environment-specific settings
    const serverConfig = createServerConfiguration();
    
    // Initialize security configuration with appropriate protection levels
    const securityConfig = createSecurityConfiguration();
    
    // Set up route configuration with all endpoint definitions
    const routeConfig = createRouteConfiguration();
    
    // Configure logging system with environment-aware settings
    const loggingConfig = createLoggingConfiguration();
    
    // Combine all configuration components into unified AppConfig object
    const appConfiguration: AppConfig = {
      server: serverConfig,
      security: securityConfig,
      routes: routeConfig,
      logging: loggingConfig,
      environment: config
    };
    
    // Perform comprehensive configuration validation
    const validationResult = validateConfiguration(appConfiguration);
    
    // Log configuration initialization status and any warnings
    if (validationResult.isValid) {
      logConfigInfo('Application configuration initialized successfully');
      logConfigInfo(`Configuration summary: ${validationResult.summary}`);
    } else {
      logConfigError('Application configuration validation failed');
      validationResult.errors.forEach(error => logConfigError(`Validation error: ${error}`));
    }
    
    // Report any warnings found during validation
    validationResult.warnings.forEach(warning => logConfigWarning(`Validation warning: ${warning}`));
    
    // Log final configuration summary
    logConfigInfo('Configuration initialization completed', {
      environment: appConfiguration.environment.env,
      serverPort: appConfiguration.server.port,
      securityEnabled: true,
      routesConfigured: Object.keys(appConfiguration.routes.handlers || {}).length,
      validationStatus: validationResult.isValid ? 'PASSED' : 'FAILED'
    });
    
    // Return validated and ready-to-use application configuration
    return appConfiguration;
    
  } catch (error) {
    // Handle configuration errors and provide detailed error reporting
    const errorMessage = `Configuration initialization failed: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    // Return minimal fallback configuration to prevent complete failure
    return {
      server: createServerConfiguration(),
      security: createSecurityConfiguration(),
      routes: createRouteConfiguration(),
      logging: createLoggingConfiguration(),
      environment: config
    };
  }
}

/**
 * Generates Configuration Summary
 * 
 * Generates a summary of the current application configuration for logging,
 * debugging, and monitoring purposes. Provides sanitized configuration overview
 * that excludes sensitive information while showing key settings and environment status.
 * 
 * @returns Sanitized configuration summary object for logging and monitoring
 */
export function getConfigurationSummary(): ConfigurationSummary {
  try {
    // Extract key configuration settings from application config
    const currentConfig = appConfig;
    
    // Create sanitized server configuration summary
    const serverSummary = {
      port: currentConfig.server.port,
      host: currentConfig.server.host,
      name: currentConfig.server.name,
      version: currentConfig.server.version,
      timeout: currentConfig.server.timeout
    };
    
    // Create sanitized security configuration summary
    const securitySummary = {
      helmetEnabled: !!currentConfig.security.helmet,
      corsEnabled: !!currentConfig.security.cors,
      rateLimitEnabled: !!currentConfig.security.rateLimit,
      environment: currentConfig.environment.env
    };
    
    // Include configuration validation status and any warnings
    const features = [
      'express-5.1.0',
      'helmet-security',
      'cors-support',
      'rate-limiting',
      'environment-aware',
      'type-safe-config'
    ];
    
    // Add environment-specific features
    if (currentConfig.environment.isProduction) {
      features.push('production-optimized');
    }
    if (currentConfig.environment.isDevelopment) {
      features.push('development-debug');
    }
    if (currentConfig.logging.enableColors) {
      features.push('colored-logging');
    }
    
    // Create comprehensive configuration summary
    const configurationSummary: ConfigurationSummary = {
      environment: currentConfig.environment.env,
      server: serverSummary,
      security: securitySummary,
      features,
      timestamp: new Date().toISOString()
    };
    
    logConfigInfo('Configuration summary generated successfully');
    
    // Return sanitized configuration summary object
    return configurationSummary;
    
  } catch (error) {
    const errorMessage = `Failed to generate configuration summary: ${error instanceof Error ? error.message : String(error)}`;
    logConfigError(errorMessage, error);
    
    // Return minimal summary on error
    return {
      environment: config.env,
      server: { status: 'error' },
      security: { status: 'error' },
      features: ['error-state'],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Initialize and Create Application Configuration
 * 
 * Main application configuration object with complete initialization and validation.
 * This serves as the primary configuration export for the entire application.
 */
export const appConfig: AppConfig = initializeConfiguration();

/**
 * Individual Configuration Exports
 * 
 * Export individual configuration objects for specific use cases and
 * modular access to configuration components.
 */
export const serverConfig: ServerConfiguration = appConfig.server;
export const securityConfig: SecurityConfiguration = appConfig.security;
export const routeConfig: RouteConfiguration = appConfig.routes;
export const loggingConfig: LoggingConfiguration = appConfig.logging;

/**
 * Re-exported Constants and Environment
 * 
 * Re-export constants and environment configuration for convenient access
 * from the central configuration module.
 */
export const constants = {
  SERVER_CONFIG,
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  ROUTES,
  CONTENT_TYPES,
  SECURITY_CONFIG,
  LOGGING
};

export const environment: EnvironmentConfig = config;

/**
 * Type Exports for Enhanced Type Safety
 * 
 * Export all configuration-related TypeScript types for use throughout
 * the application with comprehensive type safety.
 */
export type {
  AppConfig,
  ServerConfiguration,
  SecurityConfiguration,
  RouteConfiguration,
  LoggingConfiguration,
  ConfigValidationResult,
  ConfigurationSummary,
  EnvironmentConfig
};

/**
 * Default Export for Convenient Access
 * 
 * Default export containing the complete application configuration
 * for convenient access in application entry points.
 */
export default appConfig;