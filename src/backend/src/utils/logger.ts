/**
 * Centralized Logging Utility Module for Node.js Tutorial Application
 * 
 * This module provides comprehensive logging capabilities for the Node.js tutorial application
 * implementing a structured logging system with environment-specific configuration, multiple
 * log levels, formatted output, and integration with Express.js 5.1.0 middleware. It serves
 * as the foundation for application monitoring, debugging, and operational visibility while
 * demonstrating modern logging practices for Node.js applications with TypeScript type safety.
 * 
 * Features:
 * - Environment-specific logging behavior with detailed development logging and secure production logging
 * - Multiple log levels (error, warn, info, http, debug) with priority-based filtering
 * - Color-coded console output with TTY detection for enhanced readability
 * - Structured log formatting with timestamp, level, message, and metadata
 * - Error object handling with stack trace inclusion for debugging support
 * - Data sanitization to prevent sensitive information disclosure in logs
 * - Request correlation tracking for distributed tracing and debugging
 * - Child logger creation for contextual logging with inheritance
 * - Express.js 5.1.0 middleware integration for HTTP request/response logging
 * - TypeScript type safety with comprehensive interfaces and type definitions
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @framework Express.js 5.1.0 enhanced error handling and middleware patterns
 * @educational Demonstrates modern logging practices and TypeScript implementation patterns
 */

// Import environment configuration for logging behavior and environment detection
import { 
  config, 
  logLevel, 
  isDevelopment, 
  isProduction, 
  env 
} from '../config/environment';

// Import logging configuration constants for levels, formats, and defaults
import { 
  LOGGING 
} from '../config/constants';

// Import logging configuration interface for type-safe logging setup
import { 
  LoggingConfig 
} from '../types';

// Import Node.js util module for object inspection and formatting in log messages
import { inspect } from 'util'; // built-in

/**
 * Log Color Constants for Console Output
 * 
 * ANSI color codes for colorized console output with reset functionality.
 * Provides visual distinction between log levels in development environments
 * while supporting TTY detection for appropriate color application.
 */
export const LOG_COLORS = {
  /** Red color for error messages */
  error: '\x1b[31m',
  /** Yellow color for warning messages */
  warn: '\x1b[33m',
  /** Cyan color for informational messages */
  info: '\x1b[36m',
  /** Magenta color for HTTP-related messages */
  http: '\x1b[35m',
  /** White color for debug messages */
  debug: '\x1b[37m',
  /** Reset color code to return to default terminal color */
  reset: '\x1b[0m'
} as const;

/**
 * Log Level Priority Constants
 * 
 * Numeric priority values for log level filtering and comparison.
 * Lower numbers indicate higher priority (more critical messages).
 * Used by shouldLog function to determine message filtering.
 */
export const LOG_LEVEL_PRIORITIES = {
  /** Error level - highest priority (0) */
  error: 0,
  /** Warning level - high priority (1) */
  warn: 1,
  /** Information level - medium priority (2) */
  info: 2,
  /** HTTP level - low priority (3) */
  http: 3,
  /** Debug level - lowest priority (4) */
  debug: 4
} as const;

/**
 * Default Logging Configuration
 * 
 * Default configuration values for logger initialization with fallback settings.
 * Provides sensible defaults for development environment while supporting
 * environment-specific overrides through configuration.
 */
export const DEFAULT_LOG_CONFIG = {
  /** Default log level from LOGGING constants */
  level: LOGGING.DEFAULT_LEVEL,
  /** Simple format for development readability */
  format: LOGGING.FORMATS.SIMPLE,
  /** Enable colors in development for enhanced readability */
  enableColors: true,
  /** Include timestamp for debugging and audit trail */
  includeTimestamp: true
} as const;

/**
 * Log Context Interface for Request Correlation
 * 
 * Structured logging context with correlation information for distributed tracing
 * and request tracking. Provides comprehensive context for log message correlation
 * and debugging across distributed systems and microservices.
 */
export interface LogContext {
  /** Request correlation identifier for tracking (optional) */
  requestId?: string;
  
  /** ISO timestamp of log context creation */
  timestamp: string;
  
  /** Current application environment */
  environment: string;
  
  /** Process ID for multi-process debugging */
  processId: number;
  
  /** Current process memory usage (optional) */
  memoryUsage?: NodeJS.MemoryUsage;
  
  /** Additional context metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Log Entry Interface for Structured Logging
 * 
 * Complete log entry structure including level, message, timestamp, context,
 * and metadata. Provides standardized log entry format for consistent logging
 * across the application and integration with monitoring systems.
 */
export interface LogEntry {
  /** Log level (error, warn, info, http, debug) */
  level: string;
  
  /** Primary log message content */
  message: string;
  
  /** ISO timestamp of log entry */
  timestamp: string;
  
  /** Structured logging context (optional) */
  context?: LogContext;
  
  /** Additional log metadata (optional) */
  metadata?: any;
  
  /** Stack trace for error logs (optional) */
  stack?: string;
}

/**
 * Logger Method Type Definition
 * 
 * Type definition for standard logger method functions that accept a message
 * and optional metadata. Provides consistent signature for all logging methods
 * except error logging which supports Error objects.
 */
export type LogMethod = (message: string, metadata?: any) => void;

/**
 * Error Logger Method Type Definition
 * 
 * Type definition for error logging method with enhanced Error object support.
 * Accepts either string messages or Error objects with optional metadata for
 * comprehensive error logging and stack trace inclusion.
 */
export type ErrorLogMethod = (message: string | Error, metadata?: any) => void;

/**
 * Log Formatter Function Type Definition
 * 
 * Type definition for log message formatting functions that transform log
 * level, message, and metadata into formatted string output. Enables custom
 * formatting implementations and structured log output generation.
 */
export type LogFormatter = (level: string, message: string, metadata?: any) => string;

/**
 * Factory Function for Creating Configured Logger Instances
 * 
 * Creates a configured logger instance with environment-specific settings, log level
 * filtering, and formatted output. Initializes the logging system with appropriate
 * configuration for development, production, test, and staging environments while
 * providing comprehensive logging capabilities and Express.js middleware integration.
 * 
 * @param config - Logging configuration with level, format, and output settings
 * @returns Configured logger instance with all logging methods and formatting capabilities
 */
export function createLogger(config: LoggingConfig): Logger {
  // Validate and merge logging configuration with defaults
  const mergedConfig: LoggingConfig = {
    level: config.level || DEFAULT_LOG_CONFIG.level,
    format: config.format || DEFAULT_LOG_CONFIG.format,
    enableColors: config.enableColors !== undefined ? config.enableColors : DEFAULT_LOG_CONFIG.enableColors,
    includeTimestamp: config.includeTimestamp !== undefined ? config.includeTimestamp : DEFAULT_LOG_CONFIG.includeTimestamp
  };
  
  // Create and return new Logger instance with validated configuration
  return new Logger(mergedConfig);
}

/**
 * Formats Log Messages with Consistent Structure
 * 
 * Formats log messages with consistent structure including timestamp, log level,
 * message content, and optional metadata. Applies environment-specific formatting
 * rules and handles object serialization for complex log data while ensuring
 * secure logging practices and readable output formatting.
 * 
 * @param level - Log level for message classification
 * @param message - Primary log message content
 * @param metadata - Optional metadata for additional context
 * @returns Formatted log message ready for output with timestamp, level, and content
 */
export function formatLogMessage(level: string, message: string, metadata?: any): string {
  // Generate timestamp in ISO format for log message
  const timestamp = new Date().toISOString();
  
  // Apply log level formatting with optional color coding
  const colorCode = LOG_COLORS[level as keyof typeof LOG_COLORS] || '';
  const resetCode = LOG_COLORS.reset;
  
  // Determine if colors should be applied based on environment and TTY support
  const shouldUseColors = isDevelopment() && process.stdout.isTTY;
  const levelDisplay = shouldUseColors ? `${colorCode}${level.toUpperCase()}${resetCode}` : level.toUpperCase();
  
  // Format main message content with proper escaping
  const formattedMessage = message.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  
  // Serialize metadata objects using util.inspect for readability
  let metadataString = '';
  if (metadata !== undefined) {
    try {
      if (typeof metadata === 'object' && metadata !== null) {
        // Use util.inspect for complex objects with proper formatting
        metadataString = ` | ${inspect(metadata, { 
          colors: shouldUseColors, 
          depth: 3, 
          compact: true,
          breakLength: 80
        })}`;
      } else {
        // Simple string conversion for primitive values
        metadataString = ` | ${String(metadata)}`;
      }
    } catch (error) {
      // Fallback for circular references or serialization errors
      metadataString = ` | [Metadata serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }
  
  // Apply environment-specific formatting rules (colors, structure)
  if (isProduction()) {
    // Production format: structured and minimal
    return `${timestamp} [${level.toUpperCase()}] ${formattedMessage}${metadataString}`;
  } else {
    // Development format: enhanced with colors and formatting
    return `${timestamp} [${levelDisplay}] ${formattedMessage}${metadataString}`;
  }
}

/**
 * Determines Log Message Filtering Based on Level Priority
 * 
 * Determines whether a log message should be output based on the current log level
 * configuration and message priority. Implements log level filtering to control
 * output volume and focus on relevant messages for each environment while ensuring
 * proper priority-based message filtering and performance optimization.
 * 
 * @param messageLevel - Log level of the message to be logged
 * @param configuredLevel - Currently configured log level threshold
 * @returns True if message should be logged, false if filtered out by level
 */
export function shouldLog(messageLevel: string, configuredLevel: string): boolean {
  // Get priority value for message log level from LOG_LEVEL_PRIORITIES
  const messagePriority = LOG_LEVEL_PRIORITIES[messageLevel as keyof typeof LOG_LEVEL_PRIORITIES];
  
  // Get priority value for configured log level
  const configPriority = LOG_LEVEL_PRIORITIES[configuredLevel as keyof typeof LOG_LEVEL_PRIORITIES];
  
  // Handle invalid log levels with warning and fallback
  if (messagePriority === undefined) {
    console.warn(`[Logger] Invalid message log level: ${messageLevel}`);
    return false;
  }
  
  if (configPriority === undefined) {
    console.warn(`[Logger] Invalid configured log level: ${configuredLevel}`);
    return true; // Default to allowing message if config is invalid
  }
  
  // Compare message priority against configured threshold
  // Return true if message priority is equal or higher than configured level
  return messagePriority <= configPriority;
}

/**
 * Error-Level Logging with Enhanced Error Handling
 * 
 * Logs error messages with enhanced formatting including stack traces, error context,
 * and correlation information. Provides comprehensive error logging for debugging and
 * monitoring with environment-specific detail levels while ensuring secure error
 * information handling and comprehensive debugging support.
 * 
 * @param message - Error message string or Error object
 * @param metadata - Optional metadata for additional error context
 */
export function logError(message: string | Error, metadata?: any): void {
  // Check if message should be logged based on current log level
  if (!shouldLog('error', config.logLevel)) {
    return;
  }
  
  let errorMessage: string;
  let errorStack: string | undefined;
  
  // Extract error message and stack trace if Error object provided
  if (message instanceof Error) {
    errorMessage = message.message;
    errorStack = message.stack;
    
    // Include error name and code if available
    if (message.name && message.name !== 'Error') {
      errorMessage = `[${message.name}] ${errorMessage}`;
    }
  } else {
    errorMessage = String(message);
  }
  
  // Add metadata and context information
  const enhancedMetadata = {
    ...metadata,
    ...(errorStack && isDevelopment() && { stack: errorStack }),
    level: 'error',
    timestamp: new Date().toISOString()
  };
  
  // Format error message with timestamp and error level
  const formattedMessage = formatLogMessage('error', errorMessage, enhancedMetadata);
  
  // Output formatted error message to console.error
  console.error(formattedMessage);
  
  // Include stack trace in development environment
  if (errorStack && isDevelopment()) {
    console.error('Stack Trace:');
    console.error(errorStack);
  }
}

/**
 * Warning-Level Logging for Non-Critical Issues
 * 
 * Logs warning messages with appropriate formatting and metadata inclusion.
 * Provides warning-level logging for non-critical issues, configuration problems,
 * and operational concerns that require attention but do not prevent application
 * operation while maintaining consistent formatting and metadata handling.
 * 
 * @param message - Warning message content
 * @param metadata - Optional metadata for warning context
 */
export function logWarn(message: string, metadata?: any): void {
  // Check if warning should be logged based on current log level
  if (!shouldLog('warn', config.logLevel)) {
    return;
  }
  
  // Include metadata and context information
  const enhancedMetadata = {
    ...metadata,
    level: 'warn',
    timestamp: new Date().toISOString()
  };
  
  // Format warning message with timestamp and warn level
  const formattedMessage = formatLogMessage('warn', message, enhancedMetadata);
  
  // Output formatted warning message to console.warn
  console.warn(formattedMessage);
}

/**
 * Informational Logging for General Application Events
 * 
 * Logs informational messages for general application events, status updates, and
 * operational information. Provides standard information-level logging for application
 * flow and state changes while ensuring consistent message formatting and appropriate
 * metadata inclusion for monitoring and debugging purposes.
 * 
 * @param message - Informational message content
 * @param metadata - Optional metadata for additional context
 */
export function logInfo(message: string, metadata?: any): void {
  // Check if info message should be logged based on current log level
  if (!shouldLog('info', config.logLevel)) {
    return;
  }
  
  // Include metadata and context information
  const enhancedMetadata = {
    ...metadata,
    level: 'info',
    timestamp: new Date().toISOString()
  };
  
  // Format info message with timestamp and info level
  const formattedMessage = formatLogMessage('info', message, enhancedMetadata);
  
  // Output formatted info message to console.log
  console.log(formattedMessage);
}

/**
 * HTTP-Specific Logging for Web Server Operations
 * 
 * Logs HTTP-related messages including request/response information, middleware
 * operations, and web server events. Provides specialized logging for HTTP operations
 * and Express.js middleware integration while supporting comprehensive HTTP context
 * tracking and performance monitoring for web applications.
 * 
 * @param message - HTTP-related message content
 * @param metadata - Optional HTTP-specific metadata (method, URL, status, timing)
 */
export function logHttp(message: string, metadata?: any): void {
  // Check if HTTP message should be logged based on current log level
  if (!shouldLog('http', config.logLevel)) {
    return;
  }
  
  // Include HTTP-specific metadata (method, URL, status, timing)
  const enhancedMetadata = {
    ...metadata,
    level: 'http',
    timestamp: new Date().toISOString()
  };
  
  // Format HTTP message with timestamp and http level
  const formattedMessage = formatLogMessage('http', message, enhancedMetadata);
  
  // Output formatted HTTP message to console.log
  console.log(formattedMessage);
}

/**
 * Debug-Level Logging for Development and Troubleshooting
 * 
 * Logs debug messages with detailed information for development and troubleshooting.
 * Provides verbose logging for debugging purposes with comprehensive context and state
 * information while ensuring appropriate filtering in production environments and
 * detailed information for development debugging workflows.
 * 
 * @param message - Debug message content
 * @param metadata - Optional detailed metadata and context information
 */
export function logDebug(message: string, metadata?: any): void {
  // Check if debug message should be logged based on current log level
  if (!shouldLog('debug', config.logLevel)) {
    return;
  }
  
  // Include detailed metadata and context information
  const enhancedMetadata = {
    ...metadata,
    level: 'debug',
    timestamp: new Date().toISOString(),
    ...(isDevelopment() && {
      processId: process.pid,
      memoryUsage: process.memoryUsage(),
      environment: env
    })
  };
  
  // Format debug message with timestamp and debug level
  const formattedMessage = formatLogMessage('debug', message, enhancedMetadata);
  
  // Output formatted debug message to console.log
  console.log(formattedMessage);
}

/**
 * Sanitizes Log Data to Remove Sensitive Information
 * 
 * Sanitizes log data to remove or mask sensitive information such as passwords,
 * tokens, and personal data before logging. Ensures secure logging practices while
 * maintaining useful debugging information and preventing sensitive data disclosure
 * in log files and monitoring systems.
 * 
 * @param data - Data object to be sanitized for logging
 * @returns Sanitized data object safe for logging
 */
export function sanitizeLogData(data: any): any {
  // Handle null, undefined, or primitive values
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }
  
  // Identify sensitive field names (password, token, authorization, etc.)
  const sensitiveFields = [
    'password', 'pwd', 'passwd', 'secret', 'token', 'auth', 'authorization',
    'cookie', 'session', 'key', 'private', 'confidential', 'ssn', 'social',
    'credit', 'card', 'cvv', 'pin', 'api_key', 'apikey', 'access_token',
    'refresh_token', 'bearer', 'jwt'
  ];
  
  // Handle arrays by recursively sanitizing each element
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }
  
  // Recursively traverse object properties
  const sanitized: any = {};
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const lowerKey = key.toLowerCase();
      
      // Mask or remove sensitive values with placeholder text
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        // Preserve non-sensitive data for debugging purposes
        const value = data[key];
        
        // Handle nested objects appropriately
        if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeLogData(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
  }
  
  // Return sanitized data object safe for logging
  return sanitized;
}

/**
 * Creates Structured Logging Context with Correlation Information
 * 
 * Creates a logging context object with correlation information, request details,
 * and environment metadata for enhanced log tracking and debugging. Provides
 * structured context for log message correlation and comprehensive debugging
 * support across distributed systems and request workflows.
 * 
 * @param requestId - Request correlation ID for tracking
 * @param additionalContext - Additional context information to include
 * @returns Structured logging context with correlation and metadata information
 */
export function createLogContext(requestId: string, additionalContext?: any): LogContext {
  // Create base context object with timestamp and environment
  const baseContext: LogContext = {
    requestId,
    timestamp: new Date().toISOString(),
    environment: env,
    processId: process.pid
  };
  
  // Include process information (PID, memory usage) in development
  if (isDevelopment()) {
    baseContext.memoryUsage = process.memoryUsage();
  }
  
  // Merge additional context information provided
  if (additionalContext) {
    baseContext.metadata = sanitizeLogData(additionalContext);
  }
  
  // Return structured log context object
  return baseContext;
}

/**
 * Main Logger Class for Comprehensive Logging Capabilities
 * 
 * Main logger class that provides comprehensive logging capabilities with environment-
 * specific configuration, multiple log levels, formatted output, and integration with
 * Express.js middleware. Implements structured logging patterns for Node.js applications
 * while supporting child logger creation, dynamic configuration, and secure logging practices.
 */
export class Logger {
  /** Logging configuration with level, format, and output settings */
  private readonly config: LoggingConfig;
  
  /** Current logging level for message filtering */
  private level: string;
  
  /** Flag for enabling colored console output */
  private readonly enableColors: boolean;
  
  /** Flag for including timestamps in log messages */
  private readonly includeTimestamp: boolean;
  
  /**
   * Logger Constructor
   * 
   * Initializes logger instance with provided configuration, sets up log level filtering,
   * and configures output formatting based on environment settings while ensuring proper
   * configuration validation and environment-specific behavior setup.
   * 
   * @param config - Logging configuration with level, format, and output options
   */
  constructor(config: LoggingConfig) {
    // Validate and store logging configuration
    this.config = {
      level: config.level || DEFAULT_LOG_CONFIG.level,
      format: config.format || DEFAULT_LOG_CONFIG.format,
      enableColors: config.enableColors !== undefined ? config.enableColors : DEFAULT_LOG_CONFIG.enableColors,
      includeTimestamp: config.includeTimestamp !== undefined ? config.includeTimestamp : DEFAULT_LOG_CONFIG.includeTimestamp
    };
    
    // Set up log level filtering based on environment
    this.level = this.config.level;
    
    // Configure color output based on environment and TTY support
    this.enableColors = this.config.enableColors && isDevelopment() && process.stdout.isTTY;
    
    // Initialize timestamp formatting settings
    this.includeTimestamp = this.config.includeTimestamp;
    
    // Log logger initialization in development environment
    if (isDevelopment()) {
      this.info('Logger initialized', {
        level: this.level,
        enableColors: this.enableColors,
        includeTimestamp: this.includeTimestamp,
        environment: env
      });
    }
  }
  
  /**
   * Error-Level Logging Method
   * 
   * Logs error-level messages with enhanced error handling, stack trace inclusion,
   * and error context information for debugging and monitoring while ensuring
   * comprehensive error information capture and appropriate error formatting.
   * 
   * @param message - Error message string or Error object
   * @param metadata - Optional metadata for additional error context
   */
  public error(message: string | Error, metadata?: any): void {
    // Check log level filtering for error messages
    if (!shouldLog('error', this.level)) {
      return;
    }
    
    // Use global logError function for consistent error handling
    logError(message, metadata);
  }
  
  /**
   * Warning-Level Logging Method
   * 
   * Logs warning-level messages for non-critical issues and operational concerns
   * that require attention but don't prevent application operation while maintaining
   * consistent formatting and appropriate metadata handling.
   * 
   * @param message - Warning message content
   * @param metadata - Optional metadata for warning context
   */
  public warn(message: string, metadata?: any): void {
    // Check log level filtering for warning messages
    if (!shouldLog('warn', this.level)) {
      return;
    }
    
    // Use global logWarn function for consistent warning handling
    logWarn(message, metadata);
  }
  
  /**
   * Informational Logging Method
   * 
   * Logs informational messages for general application events, status updates,
   * and operational information tracking while ensuring consistent message formatting
   * and appropriate metadata inclusion for monitoring purposes.
   * 
   * @param message - Informational message content
   * @param metadata - Optional metadata for additional context
   */
  public info(message: string, metadata?: any): void {
    // Check log level filtering for info messages
    if (!shouldLog('info', this.level)) {
      return;
    }
    
    // Use global logInfo function for consistent info handling
    logInfo(message, metadata);
  }
  
  /**
   * HTTP-Specific Logging Method
   * 
   * Logs HTTP-related messages including request/response information, middleware
   * operations, and web server events for Express.js integration while supporting
   * comprehensive HTTP context tracking and performance monitoring.
   * 
   * @param message - HTTP-related message content
   * @param metadata - Optional HTTP-specific metadata (method, URL, status, timing)
   */
  public http(message: string, metadata?: any): void {
    // Check log level filtering for HTTP messages
    if (!shouldLog('http', this.level)) {
      return;
    }
    
    // Use global logHttp function for consistent HTTP handling
    logHttp(message, metadata);
  }
  
  /**
   * Debug-Level Logging Method
   * 
   * Logs debug-level messages with detailed information for development and troubleshooting,
   * including verbose context and state information while ensuring appropriate filtering
   * in production environments and comprehensive debugging support.
   * 
   * @param message - Debug message content
   * @param metadata - Optional detailed metadata and context information
   */
  public debug(message: string, metadata?: any): void {
    // Check log level filtering for debug messages
    if (!shouldLog('debug', this.level)) {
      return;
    }
    
    // Use global logDebug function for consistent debug handling
    logDebug(message, metadata);
  }
  
  /**
   * Dynamic Log Level Configuration
   * 
   * Dynamically updates the logging level for the logger instance, allowing runtime
   * configuration changes for debugging and operational adjustments while ensuring
   * proper validation and audit trail for level changes.
   * 
   * @param level - New log level to set for the logger instance
   */
  public setLevel(level: string): void {
    // Validate new log level against supported levels
    const validLevels = Object.values(LOGGING.LEVELS);
    if (!validLevels.includes(level)) {
      this.warn(`Invalid log level: ${level}. Valid levels: ${validLevels.join(', ')}`);
      return;
    }
    
    // Update internal log level configuration
    const previousLevel = this.level;
    this.level = level;
    
    // Log level change event for audit trail
    this.info(`Log level changed from ${previousLevel} to ${level}`, {
      previousLevel,
      newLevel: level,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Child Logger Creation with Context Inheritance
   * 
   * Creates a child logger instance with additional context information while inheriting
   * parent logger configuration. Enables contextual logging with request correlation
   * and component-specific metadata while maintaining configuration consistency.
   * 
   * @param context - Additional context information for child logger
   * @returns Child logger instance with inherited configuration and additional context
   */
  public child(context: any): Logger {
    // Create new logger instance with parent configuration
    const childLogger = new Logger(this.config);
    
    // Set up context inheritance for all log methods
    const sanitizedContext = sanitizeLogData(context);
    
    // Override logging methods to include inherited context
    const originalError = childLogger.error.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalInfo = childLogger.info.bind(childLogger);
    const originalHttp = childLogger.http.bind(childLogger);
    const originalDebug = childLogger.debug.bind(childLogger);
    
    // Enhance child logger methods with context inheritance
    childLogger.error = (message: string | Error, metadata?: any) => {
      originalError(message, { ...sanitizedContext, ...metadata });
    };
    
    childLogger.warn = (message: string, metadata?: any) => {
      originalWarn(message, { ...sanitizedContext, ...metadata });
    };
    
    childLogger.info = (message: string, metadata?: any) => {
      originalInfo(message, { ...sanitizedContext, ...metadata });
    };
    
    childLogger.http = (message: string, metadata?: any) => {
      originalHttp(message, { ...sanitizedContext, ...metadata });
    };
    
    childLogger.debug = (message: string, metadata?: any) => {
      originalDebug(message, { ...sanitizedContext, ...metadata });
    };
    
    // Return child logger with enhanced context
    return childLogger;
  }
}

/**
 * Default Configured Logger Instance
 * 
 * Default configured logger instance for application-wide logging with environment-
 * specific settings and comprehensive logging capabilities. Provides immediate access
 * to logging functionality throughout the application while supporting advanced
 * features like child logger creation and dynamic configuration.
 */
export const logger = createLogger({
  level: config.logLevel,
  format: LOGGING.FORMATS.SIMPLE,
  enableColors: isDevelopment(),
  includeTimestamp: true
});

// Initialize logger with startup message
if (isDevelopment()) {
  logger.info('Default logger initialized', {
    environment: env,
    logLevel: config.logLevel,
    features: {
      colors: isDevelopment(),
      timestamps: true,
      sanitization: true,
      correlation: true
    }
  });
}

// Export all logging functionality for comprehensive access
export {
  // Main logger class for custom instances
  Logger,
  
  // Factory function for creating custom loggers
  createLogger,
  
  // Utility functions for logging operations
  formatLogMessage,
  sanitizeLogData,
  createLogContext,
  
  // Individual logging functions for direct use
  logError,
  logWarn,
  logInfo,
  logHttp,
  logDebug,
  
  // Utility function for log level filtering
  shouldLog
};

// Type exports for TypeScript integration
export type {
  // Logging interfaces
  LogContext,
  LogEntry,
  
  // Function type definitions
  LogMethod,
  ErrorLogMethod,
  LogFormatter
};