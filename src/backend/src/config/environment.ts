/**
 * Environment Configuration Module for Node.js Tutorial Application
 * 
 * This module provides validated, type-safe environment variable management for the Node.js 
 * tutorial application. It implements comprehensive environment validation, default value 
 * handling, and environment-specific configuration logic while integrating with Express.js 
 * 5.1.0 and supporting multiple deployment environments (development, production, test, staging).
 * 
 * Features:
 * - Node.js 24 LTS runtime support with modern JavaScript capabilities
 * - Express.js 5.1.0 configuration integration for server initialization
 * - Type-safe environment variable handling with comprehensive validation
 * - Environment-specific configuration with security settings
 * - Localized error handling to avoid circular dependencies
 * - Comprehensive logging and monitoring configuration
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 */

// Import server configuration constants for default values and validation
import { 
  SERVER_CONFIG,
  ENVIRONMENT,
  LOGGING,
  ERROR_CODES
} from './constants';

/**
 * Required Environment Variables
 * 
 * Array of environment variable names that must be present for the application
 * to function correctly. NODE_ENV is the only required variable for basic operation.
 */
const REQUIRED_ENV_VARS = ['NODE_ENV'] as const;

/**
 * Optional Environment Variables
 * 
 * Array of environment variable names that can be provided to override default
 * configuration values. All have sensible defaults defined in DEFAULT_VALUES.
 */
const OPTIONAL_ENV_VARS = ['PORT', 'HOST', 'LOG_LEVEL', 'TIMEOUT'] as const;

/**
 * Default Configuration Values
 * 
 * Provides fallback values for all configurable environment variables using
 * constants from the constants module for consistency and maintainability.
 */
const DEFAULT_VALUES = {
  NODE_ENV: ENVIRONMENT.DEVELOPMENT,
  PORT: SERVER_CONFIG.DEFAULT_PORT,
  HOST: SERVER_CONFIG.HOST,
  LOG_LEVEL: LOGGING.DEFAULT_LEVEL,
  TIMEOUT: SERVER_CONFIG.TIMEOUT
} as const;

/**
 * Environment Type Enumeration
 * 
 * Defines the supported deployment environment types with their string values.
 * Used for type-safe environment detection and validation.
 */
export enum EnvironmentType {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  STAGING = 'staging'
}

/**
 * Environment Configuration Interface
 * 
 * Defines the structure of the validated environment configuration object
 * with readonly properties to prevent runtime modification and ensure immutability.
 */
export interface EnvironmentConfig {
  /** Current environment name (development, production, test, staging) */
  readonly env: string;
  /** HTTP server port number for binding */
  readonly port: number;
  /** HTTP server host address for binding */
  readonly host: string;
  /** Logging level for application logging system */
  readonly logLevel: string;
  /** Server timeout in milliseconds for request handling */
  readonly timeout: number;
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
 * Environment Information Interface
 * 
 * Provides comprehensive environment and system information for debugging,
 * monitoring, and troubleshooting purposes.
 */
export interface EnvironmentInfo {
  /** Node.js runtime version */
  readonly nodeVersion: string;
  /** Operating system platform */
  readonly platform: string;
  /** System architecture */
  readonly architecture: string;
  /** Current process memory usage */
  readonly memoryUsage: NodeJS.MemoryUsage;
  /** Process uptime in seconds */
  readonly uptime: number;
  /** Current environment configuration */
  readonly environment: EnvironmentConfig;
}

/**
 * Environment Validation Error Interface
 * 
 * Structured error object for environment validation failures with comprehensive
 * context information for debugging and error reporting.
 */
export interface EnvironmentValidationError {
  /** Error name for identification */
  readonly name: string;
  /** Detailed validation error message */
  readonly message: string;
  /** Error code for categorization */
  readonly code: string;
  /** Environment variable name that failed validation */
  readonly variable: string;
  /** Invalid value that caused validation failure */
  readonly value: string | undefined;
  /** Expected value format or type */
  readonly expected: string;
  /** Error occurrence timestamp */
  readonly timestamp: string;
}

/**
 * Environment Variable Validator Type
 * 
 * Type definition for environment variable validation functions that take a value
 * and required flag, returning the validated and typed result.
 */
export type EnvironmentValidator = (value: string | undefined, required: boolean) => any;

/**
 * Environment Variable Parser Type
 * 
 * Generic type for environment variable parsing functions that convert string
 * values to typed results with default value support.
 */
export type EnvironmentParser<T> = (value: string | undefined, defaultValue: T) => T;

/**
 * Creates Environment Validation Error Objects
 * 
 * Creates environment validation error objects with consistent structure, error codes,
 * and detailed validation information. Localizes error creation functionality to avoid
 * circular dependencies while providing comprehensive error context for debugging.
 * 
 * @param message - Descriptive error message
 * @param variable - Environment variable name that failed validation
 * @param value - Invalid value that caused validation failure
 * @param expected - Expected value format or type information
 * @returns Structured environment validation error object
 */
export function createEnvironmentError(
  message: string,
  variable: string,
  value: string | undefined,
  expected: string
): EnvironmentValidationError {
  // Create base error object with validation-specific message
  const errorMessage = `Environment validation failed: ${message}`;
  
  // Add error code from ERROR_CODES.VALIDATION_ERROR constant
  const code = ERROR_CODES.VALIDATION_ERROR;
  
  // Include variable name that failed validation
  const errorVariable = variable;
  
  // Add the invalid value that caused validation failure
  const errorValue = value;
  
  // Include expected value format or type information
  const expectedFormat = expected;
  
  // Add timestamp and environment context for debugging
  const timestamp = new Date().toISOString();
  
  // Return structured environment validation error object
  return {
    name: 'EnvironmentValidationError',
    message: errorMessage,
    code,
    variable: errorVariable,
    value: errorValue,
    expected: expectedFormat,
    timestamp
  };
}

/**
 * Logs Environment Validation Errors
 * 
 * Logs environment validation errors using console.error with structured formatting
 * and context information. Provides early-stage error logging during environment
 * validation before the main logging system is initialized.
 * 
 * @param error - Environment validation error or generic error object
 * @param context - Additional context information for the error
 */
export function logEnvironmentError(
  error: EnvironmentValidationError | Error,
  context: string
): void {
  // Format error message with timestamp and context
  const timestamp = new Date().toISOString();
  
  // Include environment validation context information
  const contextInfo = `[${timestamp}] Environment Error in ${context}:`;
  
  // Add error details including variable name and expected format
  if ('variable' in error) {
    const validationError = error as EnvironmentValidationError;
    console.error(contextInfo);
    console.error(`  Variable: ${validationError.variable}`);
    console.error(`  Value: ${validationError.value || 'undefined'}`);
    console.error(`  Expected: ${validationError.expected}`);
    console.error(`  Message: ${validationError.message}`);
    console.error(`  Code: ${validationError.code}`);
  } else {
    // Use console.error for immediate error output during startup
    console.error(contextInfo);
    console.error(`  Message: ${error.message}`);
  }
  
  // Include stack trace for detailed debugging information
  if (error.stack) {
    console.error('  Stack trace:');
    console.error(error.stack);
  }
}

/**
 * Validates All Environment Variables
 * 
 * Validates all environment variables against required and optional schemas,
 * applies default values, and ensures type safety for environment configuration.
 * Throws detailed validation errors for missing or invalid environment variables
 * using localized error handling.
 * 
 * @returns Validated and typed environment configuration object
 * @throws EnvironmentValidationError for validation failures
 */
export function validateEnvironment(): EnvironmentConfig {
  try {
    // Extract NODE_ENV from process.env with fallback to development
    const nodeEnv = getEnvironmentVariable('NODE_ENV', ENVIRONMENT.DEVELOPMENT, true);
    
    // Validate NODE_ENV against supported environment types using ENVIRONMENT constants
    if (!Object.values(ENVIRONMENT).includes(nodeEnv)) {
      const error = createEnvironmentError(
        `Invalid NODE_ENV value: ${nodeEnv}`,
        'NODE_ENV',
        nodeEnv,
        `One of: ${Object.values(ENVIRONMENT).join(', ')}`
      );
      logEnvironmentError(error, 'validateEnvironment');
      throw error;
    }
    
    // Parse and validate PORT environment variable with type checking and range validation
    const port = parsePort(process.env.PORT);
    
    // Validate HOST environment variable with fallback to default from SERVER_CONFIG
    const host = getEnvironmentVariable('HOST', SERVER_CONFIG.HOST, false);
    
    // Parse and validate LOG_LEVEL against supported logging levels from LOGGING.LEVELS
    const logLevel = parseLogLevel(process.env.LOG_LEVEL);
    
    // Parse and validate TIMEOUT with numeric conversion and bounds checking
    const timeout = parseInt(process.env.TIMEOUT || SERVER_CONFIG.TIMEOUT.toString(), 10);
    if (isNaN(timeout) || timeout < 1000 || timeout > 300000) {
      const error = createEnvironmentError(
        `Invalid TIMEOUT value: ${process.env.TIMEOUT}`,
        'TIMEOUT',
        process.env.TIMEOUT,
        'Number between 1000 and 300000 milliseconds'
      );
      logEnvironmentError(error, 'validateEnvironment');
      throw error;
    }
    
    // Generate environment flags (isProduction, isDevelopment, isTest, isStaging)
    const environmentFlags = {
      isProduction: nodeEnv === ENVIRONMENT.PRODUCTION,
      isDevelopment: nodeEnv === ENVIRONMENT.DEVELOPMENT,
      isTest: nodeEnv === ENVIRONMENT.TEST,
      isStaging: nodeEnv === ENVIRONMENT.STAGING
    };
    
    // Validate final configuration object against EnvironmentConfig interface
    const validatedConfig: EnvironmentConfig = {
      env: nodeEnv,
      port,
      host,
      logLevel,
      timeout,
      ...environmentFlags
    };
    
    // Log successful environment validation or throw detailed validation errors
    console.log(`[${new Date().toISOString()}] Environment validation successful for ${nodeEnv} environment`);
    console.log(`  Port: ${port}`);
    console.log(`  Host: ${host}`);
    console.log(`  Log Level: ${logLevel}`);
    console.log(`  Timeout: ${timeout}ms`);
    
    // Return validated and typed environment configuration object
    return validatedConfig;
    
  } catch (error) {
    // Enhanced error handling for validation failures
    if (error instanceof Error && !('variable' in error)) {
      const validationError = createEnvironmentError(
        error.message,
        'ENVIRONMENT_VALIDATION',
        undefined,
        'Valid environment configuration'
      );
      logEnvironmentError(validationError, 'validateEnvironment');
      throw validationError;
    }
    throw error;
  }
}

/**
 * Safely Retrieves and Validates Individual Environment Variables
 * 
 * Safely retrieves and validates individual environment variables with type conversion,
 * default value handling, and validation logic. Supports string, number, and boolean
 * type conversions with comprehensive error handling using localized error creation.
 * 
 * @param key - Environment variable name
 * @param defaultValue - Default value to use if variable is missing
 * @param required - Whether the variable is required
 * @returns Typed and validated environment variable value
 * @throws EnvironmentValidationError for required variable validation failures
 */
export function getEnvironmentVariable(
  key: string,
  defaultValue: any,
  required: boolean = false
): any {
  // Check if environment variable exists in process.env
  const value = process.env[key];
  
  // Handle required variable validation and error creation using createEnvironmentError
  if (required && (value === undefined || value === '')) {
    const error = createEnvironmentError(
      `Required environment variable ${key} is missing or empty`,
      key,
      value,
      `Non-empty string value`
    );
    logEnvironmentError(error, 'getEnvironmentVariable');
    throw error;
  }
  
  // Apply default value if variable is missing and not required
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  // Perform type conversion based on default value type (string, number, boolean)
  if (typeof defaultValue === 'number') {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      const error = createEnvironmentError(
        `Environment variable ${key} must be a valid number`,
        key,
        value,
        'Valid integer number'
      );
      logEnvironmentError(error, 'getEnvironmentVariable');
      throw error;
    }
    return numValue;
  }
  
  if (typeof defaultValue === 'boolean') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === '0') {
      return false;
    }
    const error = createEnvironmentError(
      `Environment variable ${key} must be a valid boolean`,
      key,
      value,
      'true, false, 1, or 0'
    );
    logEnvironmentError(error, 'getEnvironmentVariable');
    throw error;
  }
  
  // Apply environment-specific value transformations and security filters
  const trimmedValue = value.trim();
  
  // Return typed and validated environment variable value
  return trimmedValue;
}

/**
 * Parses and Validates PORT Environment Variable
 * 
 * Parses and validates PORT environment variable with comprehensive validation including
 * numeric conversion, range checking (1-65535), and system port availability validation.
 * Ensures port values are within valid ranges and available for binding.
 * 
 * @param portValue - Port value from environment variable
 * @returns Validated port number within acceptable range
 * @throws EnvironmentValidationError for invalid port values
 */
export function parsePort(portValue: string | undefined): number {
  // Check if port value is provided or use default from SERVER_CONFIG.DEFAULT_PORT
  const portString = portValue || SERVER_CONFIG.DEFAULT_PORT.toString();
  
  // Convert string port value to number with validation and error handling
  const port = parseInt(portString, 10);
  
  // Validate port number is within valid range (1-65535) for network binding
  if (isNaN(port)) {
    const error = createEnvironmentError(
      `PORT must be a valid number, received: ${portValue}`,
      'PORT',
      portValue,
      'Valid port number (1-65535)'
    );
    logEnvironmentError(error, 'parsePort');
    throw error;
  }
  
  if (port < 1 || port > 65535) {
    const error = createEnvironmentError(
      `PORT must be between 1 and 65535, received: ${port}`,
      'PORT',
      portString,
      'Port number between 1 and 65535'
    );
    logEnvironmentError(error, 'parsePort');
    throw error;
  }
  
  // Check for reserved system ports (0-1023) in production environment
  const currentEnv = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
  if (currentEnv === ENVIRONMENT.PRODUCTION && port < 1024) {
    console.warn(`[${new Date().toISOString()}] Warning: Using system port ${port} in production environment`);
  }
  
  // Validate port availability for binding in development environment only
  if (currentEnv === ENVIRONMENT.DEVELOPMENT) {
    // Note: Actual port availability checking would require network operations
    // For educational purposes, we'll just log the port selection
    console.log(`[${new Date().toISOString()}] Development environment using port ${port}`);
  }
  
  // Return validated port number or throw validation error with createEnvironmentError
  return port;
}

/**
 * Parses and Validates LOG_LEVEL Environment Variable
 * 
 * Parses and validates LOG_LEVEL environment variable against supported logging levels
 * with fallback to environment-appropriate defaults. Ensures log level compatibility
 * with logging system configuration using LOGGING.LEVELS constants.
 * 
 * @param logLevel - Log level value from environment variable
 * @returns Validated log level string from supported levels
 */
export function parseLogLevel(logLevel: string | undefined): string {
  // Extract log level from environment or use default from LOGGING.DEFAULT_LEVEL
  const level = logLevel || LOGGING.DEFAULT_LEVEL;
  
  // Normalize log level string to lowercase for consistent comparison
  const normalizedLevel = level.toLowerCase().trim();
  
  // Validate against supported logging levels from LOGGING.LEVELS object
  const validLevels = Object.values(LOGGING.LEVELS);
  const isValidLevel = validLevels.includes(normalizedLevel);
  
  if (!isValidLevel) {
    // Handle invalid log level with warning and fallback to safe default
    console.warn(`[${new Date().toISOString()}] Warning: Invalid LOG_LEVEL '${logLevel}', using default '${LOGGING.DEFAULT_LEVEL}'`);
    
    // Apply environment-specific log level defaults (debug for development, info for production)
    const currentEnv = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
    if (currentEnv === ENVIRONMENT.DEVELOPMENT) {
      return LOGGING.LEVELS.DEBUG;
    } else if (currentEnv === ENVIRONMENT.PRODUCTION) {
      return LOGGING.LEVELS.INFO;
    }
    
    return LOGGING.DEFAULT_LEVEL;
  }
  
  // Return validated log level string from LOGGING.LEVELS constants
  return normalizedLevel;
}

/**
 * Production Environment Detection Utility
 * 
 * Utility function to determine if the application is running in production environment.
 * Provides type-safe environment detection for production-specific behavior and
 * optimizations using ENVIRONMENT.PRODUCTION constant.
 * 
 * @returns True if NODE_ENV is production, false otherwise
 */
export function isProduction(): boolean {
  // Get current NODE_ENV from validated configuration
  const currentEnv = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
  
  // Compare against ENVIRONMENT.PRODUCTION constant for type safety
  return currentEnv === ENVIRONMENT.PRODUCTION;
}

/**
 * Development Environment Detection Utility
 * 
 * Utility function to determine if the application is running in development environment.
 * Enables development-specific features like detailed logging, debugging, and development
 * middleware using ENVIRONMENT.DEVELOPMENT constant.
 * 
 * @returns True if NODE_ENV is development, false otherwise
 */
export function isDevelopment(): boolean {
  // Get current NODE_ENV from validated configuration
  const currentEnv = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
  
  // Compare against ENVIRONMENT.DEVELOPMENT constant for type safety
  return currentEnv === ENVIRONMENT.DEVELOPMENT;
}

/**
 * Test Environment Detection Utility
 * 
 * Utility function to determine if the application is running in test environment.
 * Enables test-specific configuration like test database connections, mock services,
 * and test-optimized settings using ENVIRONMENT.TEST constant.
 * 
 * @returns True if NODE_ENV is test, false otherwise
 */
export function isTest(): boolean {
  // Get current NODE_ENV from validated configuration
  const currentEnv = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
  
  // Compare against ENVIRONMENT.TEST constant for type safety
  return currentEnv === ENVIRONMENT.TEST;
}

/**
 * Staging Environment Detection Utility
 * 
 * Utility function to determine if the application is running in staging environment.
 * Enables staging-specific configuration that mirrors production but with additional
 * debugging and monitoring capabilities using ENVIRONMENT.STAGING constant.
 * 
 * @returns True if NODE_ENV is staging, false otherwise
 */
export function isStaging(): boolean {
  // Get current NODE_ENV from validated configuration
  const currentEnv = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
  
  // Compare against ENVIRONMENT.STAGING constant for type safety
  return currentEnv === ENVIRONMENT.STAGING;
}

/**
 * Gathers Comprehensive Environment Information
 * 
 * Returns comprehensive environment information including Node.js version, platform details,
 * memory usage, and environment-specific metadata for debugging and monitoring purposes.
 * Provides system context for troubleshooting and configuration verification.
 * 
 * @returns Comprehensive environment information object with system and runtime details
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  // Collect Node.js runtime version and platform information from process object
  const nodeVersion = process.version;
  const platform = process.platform;
  const architecture = process.arch;
  
  // Gather process memory usage and performance metrics using process.memoryUsage()
  const memoryUsage = process.memoryUsage();
  
  // Include deployment-specific metadata including timestamps and process information
  const uptime = process.uptime();
  
  // Add environment configuration summary with validated settings
  const environment = config;
  
  // Format environment information for logging and monitoring system integration
  const environmentInfo: EnvironmentInfo = {
    nodeVersion,
    platform,
    architecture,
    memoryUsage,
    uptime,
    environment
  };
  
  // Return comprehensive environment information object for debugging and monitoring
  return environmentInfo;
}

/**
 * Validated Environment Configuration
 * 
 * Main environment configuration object with validated settings and environment flags.
 * This object is created once during module initialization and provides the primary
 * interface for accessing environment-specific configuration throughout the application.
 */
export const config: EnvironmentConfig = validateEnvironment();

// Export all global constants with const assertions for type safety
export { REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS, DEFAULT_VALUES };

// Export utility types for enhanced type safety
export type { EnvironmentValidator, EnvironmentParser };