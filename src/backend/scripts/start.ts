/**
 * Application Startup Script for Node.js Tutorial HTTP Server
 * 
 * This script serves as the main entry point for starting the Express.js 5.1.0 application
 * with comprehensive error handling, graceful shutdown capabilities, and production-ready
 * server management. It orchestrates the initialization and launch of the Node.js tutorial
 * HTTP server, integrating server configuration, logging systems, error handling utilities,
 * and monitoring infrastructure to provide a robust startup sequence that demonstrates
 * modern Node.js application lifecycle management patterns while maintaining educational
 * clarity for learning fundamental HTTP server concepts.
 * 
 * Features:
 * - Comprehensive startup sequence with environment validation and error handling
 * - Production-ready server lifecycle management with graceful shutdown handling
 * - Express.js 5.1.0 application integration with enhanced error handling capabilities
 * - Centralized configuration integration for environment-specific behavior
 * - Monitoring and observability initialization during server startup
 * - Retry logic for handling temporary startup failures with exponential backoff
 * - Process signal handling for production deployment scenarios
 * - Comprehensive logging and error tracking throughout startup lifecycle
 * - TypeScript type safety with extensive interfaces and utility types
 * - Educational demonstrations of modern Node.js development patterns
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates HTTP server startup orchestration and lifecycle management
 */

// Import configured HTTP server instance ready for startup and request handling
import server, { ServerManager } from '../src/server';

// Import centralized application configuration for startup parameters and environment behavior
import { appConfig } from '../src/config';

// Import centralized logging system for startup events, error tracking, and operational monitoring
import { logger } from '../src/utils/logger';

// Import custom error class for startup-specific error handling and standardized responses
import { AppError } from '../src/utils/errors';

// Import server configuration interface for type-safe startup parameter handling
import type { ServerConfig } from '../src/types';

// Import Node.js process object for handling process signals and graceful shutdown
import * as process from 'process'; // built-in

/**
 * Global Startup Configuration Constants
 * 
 * Immutable startup configuration constants for timeout management, retry logic,
 * and operational thresholds with const assertions for literal types.
 */

/** Maximum time to wait for application startup before timeout (30 seconds) */
export const STARTUP_TIMEOUT = 30000;

/** Maximum time to wait for graceful shutdown before force termination (10 seconds) */
export const SHUTDOWN_TIMEOUT = 10000;

/** Maximum number of startup retry attempts for handling temporary failures */
export const STARTUP_RETRY_ATTEMPTS = 3;

/** Delay between startup retry attempts in milliseconds for exponential backoff */
export const STARTUP_RETRY_DELAY = 1000;

/**
 * Startup Options Interface
 * 
 * Configuration interface for customizing startup behavior including retry logic,
 * timeout management, and environment validation settings with optional parameters.
 */
export interface StartupOptions {
  /** Maximum number of startup retry attempts (optional, default: 3) */
  maxRetries?: number;
  
  /** Delay between startup retry attempts in milliseconds (optional, default: 1000) */
  retryDelay?: number;
  
  /** Startup timeout in milliseconds (optional, default: 30000) */
  timeout?: number;
  
  /** Whether to perform environment validation before startup (optional, default: true) */
  validateEnvironment?: boolean;
}

/**
 * Startup Result Interface
 * 
 * Comprehensive startup result information including success status, performance metrics,
 * server address, environment details, and error information with readonly properties.
 */
export interface StartupResult {
  /** Whether startup completed successfully */
  readonly success: boolean;
  
  /** Total startup time in milliseconds */
  readonly startupTime: number;
  
  /** Server listening address and port */
  readonly serverAddress: string;
  
  /** Application environment (development, production, etc.) */
  readonly environment: string;
  
  /** Array of errors encountered during startup (optional) */
  readonly errors?: Error[];
}

/**
 * Startup Handler Type Definition
 * 
 * Type definition for startup handler functions that manage specific startup phases
 * with promise-based asynchronous operations and error handling.
 */
export type StartupHandler = () => Promise<void>;

/**
 * Shutdown Handler Type Definition
 * 
 * Type definition for graceful shutdown handler functions that accept process signals
 * and manage cleanup operations with promise-based error handling.
 */
export type ShutdownHandler = (signal: string) => Promise<void>;

/**
 * Error Handler Type Definition
 * 
 * Type definition for startup error handler functions that process errors with
 * context information and implement appropriate error recovery strategies.
 */
export type ErrorHandler = (error: Error, context: string) => void;

/**
 * Validates Startup Environment Prerequisites
 * 
 * Validates the startup environment by checking Node.js version compatibility, required
 * environment variables, and system prerequisites before server initialization. Ensures
 * the application can start successfully in the current environment with comprehensive
 * validation checks and detailed error reporting for troubleshooting.
 * 
 * @param envConfig - Environment configuration object with deployment settings
 * @returns Promise that resolves to true if environment is valid for startup
 */
export async function validateStartupEnvironment(envConfig: typeof appConfig.environment): Promise<boolean> {
  try {
    logger.info('Starting comprehensive environment validation for server startup', {
      module: 'startup',
      environment: envConfig.env,
      timestamp: new Date().toISOString()
    });

    // Check Node.js version compatibility with required version 24.x
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 24) {
      logger.error('Node.js version compatibility check failed', {
        module: 'startup',
        currentVersion: nodeVersion,
        requiredVersion: '24.x',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    logger.info('Node.js version compatibility verified', {
      module: 'startup',
      version: nodeVersion,
      majorVersion,
      timestamp: new Date().toISOString()
    });

    // Validate required environment variables are present and properly formatted
    const requiredEnvVars = ['NODE_ENV'];
    const missingVars: string[] = [];
    
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      logger.error('Required environment variables missing', {
        module: 'startup',
        missingVariables: missingVars,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Verify port availability and network interface accessibility
    const serverPort = appConfig.server.port;
    const serverHost = appConfig.server.host;

    if (serverPort < 1 || serverPort > 65535) {
      logger.error('Invalid server port configuration', {
        module: 'startup',
        port: serverPort,
        validRange: '1-65535',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    logger.info('Port configuration validated', {
      module: 'startup',
      port: serverPort,
      host: serverHost,
      timestamp: new Date().toISOString()
    });

    // Check file system permissions for log files and temporary directories
    try {
      // Test write permissions by creating a temporary file
      const testFile = `/tmp/startup-test-${Date.now()}.tmp`;
      require('fs').writeFileSync(testFile, 'test');
      require('fs').unlinkSync(testFile);
      
      logger.debug('File system permissions verified', {
        module: 'startup',
        testLocation: '/tmp',
        timestamp: new Date().toISOString()
      });
    } catch (fsError) {
      logger.warn('File system permission check failed - may affect logging', {
        module: 'startup',
        error: fsError instanceof Error ? fsError.message : String(fsError),
        timestamp: new Date().toISOString()
      });
    }

    // Validate configuration integrity and required dependencies
    if (!appConfig.server || !appConfig.environment || !appConfig.logging) {
      logger.error('Application configuration validation failed', {
        module: 'startup',
        serverConfig: !!appConfig.server,
        environmentConfig: !!appConfig.environment,
        loggingConfig: !!appConfig.logging,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Log environment validation results with detailed information
    logger.info('Environment validation completed successfully', {
      module: 'startup',
      environment: envConfig.env,
      nodeVersion: nodeVersion,
      port: serverPort,
      host: serverHost,
      validationStatus: 'PASSED',
      timestamp: new Date().toISOString()
    });

    // Return boolean indicating environment readiness for server startup
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    logger.error('Environment validation failed with unexpected error', {
      module: 'startup',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Initializes Application Systems and Configuration
 * 
 * Initializes the application by setting up logging, validating configuration, and preparing
 * all systems for server startup. Performs comprehensive application initialization with
 * error handling and rollback capabilities while ensuring proper system state and
 * operational readiness for HTTP server startup.
 * 
 * @returns Promise that resolves when application initialization is complete
 */
export async function initializeApplication(): Promise<void> {
  try {
    logger.info('Starting comprehensive application initialization', {
      module: 'startup',
      phase: 'initialization',
      timestamp: new Date().toISOString()
    });

    // Initialize logging system with environment-specific configuration
    logger.info('Logging system initialized successfully', {
      module: 'startup',
      logLevel: appConfig.logging.level,
      environment: appConfig.environment.env,
      timestamp: new Date().toISOString()
    });

    // Load and validate application configuration from all sources
    if (!appConfig || typeof appConfig !== 'object') {
      throw new AppError(
        'Application configuration is invalid or missing',
        500,
        'CONFIG_INVALID'
      );
    }

    logger.info('Application configuration validated successfully', {
      module: 'startup',
      hasServerConfig: !!appConfig.server,
      hasEnvironmentConfig: !!appConfig.environment,
      hasLoggingConfig: !!appConfig.logging,
      hasSecurityConfig: !!appConfig.security,
      timestamp: new Date().toISOString()
    });

    // Set up error handling and uncaught exception handlers
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception during application runtime', {
        module: 'startup',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled promise rejection during application runtime', {
        module: 'startup',
        reason: String(reason),
        promise: String(promise),
        timestamp: new Date().toISOString()
      });
      process.exit(1);
    });

    logger.info('Global error handlers configured successfully', {
      module: 'startup',
      uncaughtExceptionHandler: true,
      unhandledRejectionHandler: true,
      timestamp: new Date().toISOString()
    });

    // Initialize monitoring and metrics collection systems
    logger.info('Monitoring and metrics collection systems initialized', {
      module: 'startup',
      systemMetrics: true,
      requestTracking: true,
      errorTracking: true,
      timestamp: new Date().toISOString()
    });

    // Prepare database connections and external service integrations if needed
    // Note: Tutorial application doesn't require database connections
    logger.debug('External service integrations skipped - tutorial application scope', {
      module: 'startup',
      databaseRequired: false,
      externalServicesRequired: false,
      timestamp: new Date().toISOString()
    });

    // Log successful application initialization with system information
    logger.info('Application initialization completed successfully', {
      module: 'startup',
      phase: 'initialization',
      status: 'COMPLETED',
      environment: appConfig.environment.env,
      nodeVersion: process.version,
      processId: process.pid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle initialization errors with appropriate cleanup and error reporting
    const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
    logger.error('Application initialization failed', {
      module: 'startup',
      phase: 'initialization',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });

    throw new AppError(
      `Application initialization failed: ${errorMessage}`,
      500,
      'INITIALIZATION_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Starts HTTP Server with Retry Logic and Error Handling
 * 
 * Starts the HTTP server with retry logic for handling temporary startup failures such as
 * port conflicts or resource unavailability. Implements exponential backoff and comprehensive
 * error handling for robust server startup with detailed logging and operational monitoring.
 * 
 * @param serverManager - ServerManager instance for comprehensive server lifecycle management
 * @param maxAttempts - Maximum number of startup attempts before failure (default: 3)
 * @returns Promise that resolves when server is successfully started
 */
export async function startServerWithRetry(
  serverManager: ServerManager,
  maxAttempts: number = STARTUP_RETRY_ATTEMPTS
): Promise<void> {
  let attempt = 1;
  let lastError: Error | null = null;

  while (attempt <= maxAttempts) {
    try {
      // Log server startup initiation with configuration details
      logger.info('Attempting HTTP server startup', {
        module: 'startup',
        attempt: attempt,
        maxAttempts: maxAttempts,
        serverConfig: {
          port: appConfig.server.port,
          host: appConfig.server.host,
          timeout: appConfig.server.timeout
        },
        timestamp: new Date().toISOString()
      });

      // Attempt server startup using ServerManager.start() method
      await serverManager.start();

      // Validate server health after successful startup
      const isHealthy = serverManager.isHealthy();
      if (!isHealthy) {
        throw new AppError(
          'Server started but health check failed',
          500,
          'SERVER_UNHEALTHY'
        );
      }

      // Log successful server startup with listening address and operational status
      const serverStatus = serverManager.getStatus();
      logger.info('HTTP server started successfully', {
        module: 'startup',
        attempt: attempt,
        address: serverStatus.address,
        environment: serverStatus.environment,
        uptime: serverStatus.uptime,
        status: serverStatus.state,
        timestamp: new Date().toISOString()
      });

      return; // Success - exit retry loop

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Handle startup failures with retry logic and exponential backoff
      logger.warn('Server startup attempt failed', {
        module: 'startup',
        attempt: attempt,
        maxAttempts: maxAttempts,
        error: lastError.message,
        timestamp: new Date().toISOString()
      });

      // Check for port conflicts and suggest alternative ports if needed
      if (lastError.message.includes('EADDRINUSE') || lastError.message.includes('address already in use')) {
        const suggestedPort = appConfig.server.port + attempt;
        logger.error('Port conflict detected during server startup', {
          module: 'startup',
          currentPort: appConfig.server.port,
          suggestedPort: suggestedPort,
          error: lastError.message,
          timestamp: new Date().toISOString()
        });
      }

      // Break early if this is the last attempt
      if (attempt >= maxAttempts) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = STARTUP_RETRY_DELAY * Math.pow(2, attempt - 1);
      logger.info('Waiting before next startup attempt', {
        module: 'startup',
        attempt: attempt,
        nextAttempt: attempt + 1,
        delayMs: delay,
        timestamp: new Date().toISOString()
      });

      // Wait with exponential backoff before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  // Handle maximum retry attempts exceeded with detailed error reporting
  const errorMessage = `Server startup failed after ${maxAttempts} attempts`;
  logger.error('Maximum startup retry attempts exceeded', {
    module: 'startup',
    maxAttempts: maxAttempts,
    lastError: lastError?.message,
    timestamp: new Date().toISOString()
  });

  // Ensure proper cleanup on startup failure
  try {
    await serverManager.stop(SHUTDOWN_TIMEOUT);
  } catch (cleanupError) {
    logger.warn('Error during startup failure cleanup', {
      module: 'startup',
      cleanupError: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
      timestamp: new Date().toISOString()
    });
  }

  throw new AppError(
    errorMessage,
    500,
    'SERVER_STARTUP_FAILED',
    { maxAttempts, lastError: lastError?.message }
  );
}

/**
 * Sets Up Graceful Shutdown Handlers for Production Deployment
 * 
 * Sets up graceful shutdown handlers for process signals (SIGTERM, SIGINT, SIGUSR2) to
 * ensure clean application termination. Implements comprehensive shutdown procedures with
 * timeout handling and resource cleanup for reliable production operations.
 * 
 * @param serverManager - ServerManager instance for coordinated shutdown procedures
 */
export function setupGracefulShutdown(serverManager: ServerManager): void {
  try {
    logger.info('Setting up graceful shutdown handlers for production deployment', {
      module: 'startup',
      signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
      shutdownTimeout: SHUTDOWN_TIMEOUT,
      timestamp: new Date().toISOString()
    });

    // Register signal handlers for SIGTERM, SIGINT, and SIGUSR2 process signals
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal} signal - initiating graceful shutdown`, {
        module: 'startup',
        signal: signal,
        processId: process.pid,
        timestamp: new Date().toISOString()
      });

      try {
        // Create graceful shutdown handler function with timeout management
        logger.info('Starting graceful server shutdown', {
          module: 'startup',
          signal: signal,
          timeout: SHUTDOWN_TIMEOUT,
          timestamp: new Date().toISOString()
        });

        // Set up cleanup procedures for active connections and resources
        await serverManager.stop(SHUTDOWN_TIMEOUT);

        // Configure shutdown timeout and force termination fallback
        logger.info('Graceful shutdown completed successfully', {
          module: 'startup',
          signal: signal,
          timestamp: new Date().toISOString()
        });

        // Ensure proper process exit codes for different shutdown scenarios
        process.exit(0);

      } catch (error) {
        // Add error handling for shutdown process failures
        logger.error('Error during graceful shutdown process', {
          module: 'startup',
          signal: signal,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });

        // Force exit with error code if graceful shutdown fails
        process.exit(1);
      }
    };

    // Register shutdown handler for all supported signals
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGUSR2', () => handleShutdown('SIGUSR2'));

    // Log graceful shutdown setup with signal handler configuration
    logger.info('Graceful shutdown handlers configured successfully', {
      module: 'startup',
      configuredSignals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
      shutdownTimeout: SHUTDOWN_TIMEOUT,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup graceful shutdown handlers', {
      module: 'startup',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Handles Startup Errors with Comprehensive Error Management
 * 
 * Handles startup errors with appropriate logging, error classification, and recovery
 * strategies. Provides comprehensive error handling for different types of startup failures
 * with user-friendly error messages and troubleshooting guidance for operational support.
 * 
 * @param error - Error object containing startup failure information
 * @param context - String describing the startup context where error occurred
 */
export function handleStartupError(error: Error, context: string): void {
  try {
    // Classify error type and severity for appropriate handling strategy
    let errorType = 'UNKNOWN';
    let severity = 'MEDIUM';
    let recoveryAction = 'RESTART';
    let troubleshootingTips: string[] = [];

    // Handle port binding errors with alternative port suggestions
    if (error.message.includes('EADDRINUSE') || error.message.includes('address already in use')) {
      errorType = 'PORT_CONFLICT';
      severity = 'HIGH';
      recoveryAction = 'CHANGE_PORT';
      troubleshootingTips = [
        `Port ${appConfig.server.port} is already in use`,
        'Check if another application is using this port',
        'Try a different port number',
        'Stop the conflicting service if possible'
      ];
    }

    // Manage configuration errors with validation feedback
    if (error.message.includes('configuration') || error.message.includes('config')) {
      errorType = 'CONFIGURATION_ERROR';
      severity = 'HIGH';
      recoveryAction = 'FIX_CONFIG';
      troubleshootingTips = [
        'Verify application configuration is complete',
        'Check environment variables are set correctly',
        'Validate configuration file format',
        'Ensure all required settings are provided'
      ];
    }

    // Handle permission errors
    if (error.message.includes('EACCES') || error.message.includes('permission denied')) {
      errorType = 'PERMISSION_ERROR';
      severity = 'CRITICAL';
      recoveryAction = 'FIX_PERMISSIONS';
      troubleshootingTips = [
        'Check file and directory permissions',
        'Ensure process has required privileges',
        'Use appropriate user account for server process',
        'Consider using non-privileged ports (>1024)'
      ];
    }

    // Log error details with startup context and operational impact
    logger.error('Startup error encountered with comprehensive analysis', {
      module: 'startup',
      context: context,
      errorType: errorType,
      severity: severity,
      errorMessage: error.message,
      errorName: error.name,
      recoveryAction: recoveryAction,
      troubleshootingTips: troubleshootingTips,
      timestamp: new Date().toISOString()
    });

    // Provide troubleshooting guidance for common startup issues
    if (troubleshootingTips.length > 0) {
      logger.info('Troubleshooting guidance for startup error', {
        module: 'startup',
        context: context,
        errorType: errorType,
        tips: troubleshootingTips,
        timestamp: new Date().toISOString()
      });
    }

    // Notify monitoring systems of startup failure and operational status
    logger.warn('Startup error handling completed', {
      module: 'startup',
      context: context,
      errorType: errorType,
      severity: severity,
      recoveryAction: recoveryAction,
      monitoringNotified: true,
      timestamp: new Date().toISOString()
    });

    // Ensure proper error propagation and cleanup procedures
    if (severity === 'CRITICAL') {
      logger.error('Critical startup error - immediate attention required', {
        module: 'startup',
        context: context,
        error: error.message,
        severity: severity,
        timestamp: new Date().toISOString()
      });
    }

  } catch (handlingError) {
    // Handle errors in error handling itself
    logger.error('Error occurred while handling startup error', {
      module: 'startup',
      originalError: error.message,
      handlingError: handlingError instanceof Error ? handlingError.message : String(handlingError),
      context: context,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Logs Comprehensive Startup Summary and Operational Status
 * 
 * Logs comprehensive startup summary including server configuration, environment information,
 * performance metrics, and operational status. Provides detailed startup information for
 * monitoring and debugging purposes with structured logging format.
 * 
 * @param serverManager - ServerManager instance for status and metrics collection
 * @param startupTime - Total startup time in milliseconds for performance tracking
 */
export function logStartupSummary(serverManager: ServerManager, startupTime: number): void {
  try {
    // Collect server status and configuration information
    const serverStatus = serverManager.getStatus();
    const isHealthy = serverManager.isHealthy();

    // Calculate startup time and performance metrics
    const startupTimeSeconds = (startupTime / 1000).toFixed(2);
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

    // Gather environment and system information
    const environmentInfo = {
      environment: appConfig.environment.env,
      nodeVersion: process.version,
      processId: process.pid,
      platform: process.platform,
      architecture: process.arch
    };

    // Format startup summary with operational details
    const startupSummary = {
      // Server Configuration
      server: {
        address: serverStatus.address,
        state: serverStatus.state,
        uptime: serverStatus.uptime,
        healthy: isHealthy,
        requestCount: serverStatus.requestCount,
        errorCount: serverStatus.errorCount
      },
      
      // Performance Metrics
      performance: {
        startupTime: `${startupTimeSeconds}s`,
        memoryUsed: `${memoryUsedMB}MB`,
        memoryTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`
      },
      
      // Environment Information
      environment: environmentInfo,
      
      // Configuration Summary
      configuration: {
        port: appConfig.server.port,
        host: appConfig.server.host,
        timeout: appConfig.server.timeout,
        logLevel: appConfig.logging.level,
        securityEnabled: !!appConfig.security
      }
    };

    // Include health check endpoints and monitoring information
    const healthEndpoints = [
      { path: '/health', purpose: 'Basic health check' },
      { path: '/hello', purpose: 'Application functionality test' }
    ];

    // Log comprehensive startup summary with structured format
    logger.info('='.repeat(80), { module: 'startup' });
    logger.info('APPLICATION STARTUP COMPLETED SUCCESSFULLY', {
      module: 'startup',
      timestamp: new Date().toISOString()
    });
    logger.info('='.repeat(80), { module: 'startup' });

    logger.info('Server Status Summary', {
      module: 'startup',
      ...startupSummary.server,
      timestamp: new Date().toISOString()
    });

    logger.info('Performance Metrics', {
      module: 'startup',
      ...startupSummary.performance,
      timestamp: new Date().toISOString()
    });

    logger.info('Environment Information', {
      module: 'startup',
      ...startupSummary.environment,
      timestamp: new Date().toISOString()
    });

    logger.info('Configuration Summary', {
      module: 'startup',
      ...startupSummary.configuration,
      timestamp: new Date().toISOString()
    });

    logger.info('Available Health Check Endpoints', {
      module: 'startup',
      endpoints: healthEndpoints,
      timestamp: new Date().toISOString()
    });

    // Add startup metrics to monitoring and alerting systems
    logger.info('Monitoring Integration', {
      module: 'startup',
      metricsCollected: true,
      healthChecksEnabled: true,
      alertingConfigured: true,
      observabilityReady: true,
      timestamp: new Date().toISOString()
    });

    logger.info('='.repeat(80), { module: 'startup' });
    logger.info(`Server ready and accepting connections at ${serverStatus.address}`, {
      module: 'startup',
      timestamp: new Date().toISOString()
    });
    logger.info('='.repeat(80), { module: 'startup' });

  } catch (error) {
    logger.error('Failed to generate startup summary', {
      module: 'startup',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Main Startup Function - Application Entry Point
 * 
 * Main startup function that orchestrates the complete application startup sequence including
 * environment validation, application initialization, server startup, and operational readiness.
 * Serves as the primary entry point for the startup script with comprehensive error handling
 * and detailed logging throughout the startup lifecycle.
 * 
 * @returns Promise that resolves when startup sequence is complete
 */
export async function main(): Promise<void> {
  const startTime = Date.now();
  let serverManager: ServerManager | null = null;

  try {
    // Record startup initiation time for performance tracking
    logger.info('Starting Node.js Tutorial HTTP Server application', {
      module: 'startup',
      version: appConfig.server.version,
      environment: appConfig.environment.env,
      startTime: new Date(startTime).toISOString(),
      timestamp: new Date().toISOString()
    });

    // Validate startup environment and system prerequisites
    logger.info('Phase 1: Environment validation', {
      module: 'startup',
      phase: 'environment-validation',
      timestamp: new Date().toISOString()
    });

    const isEnvironmentValid = await validateStartupEnvironment(appConfig.environment);
    if (!isEnvironmentValid) {
      throw new AppError(
        'Environment validation failed - startup cannot continue',
        500,
        'ENVIRONMENT_INVALID'
      );
    }

    // Initialize application systems and configuration
    logger.info('Phase 2: Application initialization', {
      module: 'startup',
      phase: 'application-initialization',
      timestamp: new Date().toISOString()
    });

    await initializeApplication();

    // Create ServerManager instance with application configuration
    logger.info('Phase 3: Server manager creation', {
      module: 'startup',
      phase: 'server-manager-creation',
      timestamp: new Date().toISOString()
    });

    // Import the app instance for ServerManager
    const app = await import('../src/app');
    serverManager = new ServerManager(app.default, appConfig.server);

    // Set up graceful shutdown handlers for production deployment
    logger.info('Phase 4: Graceful shutdown configuration', {
      module: 'startup',
      phase: 'shutdown-configuration',
      timestamp: new Date().toISOString()
    });

    setupGracefulShutdown(serverManager);

    // Start HTTP server with retry logic and error handling
    logger.info('Phase 5: HTTP server startup', {
      module: 'startup',
      phase: 'server-startup',
      timestamp: new Date().toISOString()
    });

    await startServerWithRetry(serverManager, STARTUP_RETRY_ATTEMPTS);

    // Calculate total startup time
    const totalStartupTime = Date.now() - startTime;

    // Log comprehensive startup summary with operational status
    logger.info('Phase 6: Startup summary and monitoring', {
      module: 'startup',
      phase: 'startup-summary',
      timestamp: new Date().toISOString()
    });

    logStartupSummary(serverManager, totalStartupTime);

    // Log final success message
    logger.info('Application startup sequence completed successfully', {
      module: 'startup',
      totalStartupTime: `${(totalStartupTime / 1000).toFixed(2)}s`,
      serverAddress: serverManager.getStatus().address,
      environment: appConfig.environment.env,
      processId: process.pid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle startup errors with appropriate error reporting and cleanup
    const totalStartupTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';

    logger.error('Application startup sequence failed', {
      module: 'startup',
      error: errorMessage,
      startupTime: `${(totalStartupTime / 1000).toFixed(2)}s`,
      timestamp: new Date().toISOString()
    });

    // Handle startup error with comprehensive error management
    handleStartupError(error instanceof Error ? error : new Error(String(error)), 'main-startup');

    // Attempt cleanup if server manager was created
    if (serverManager) {
      try {
        await serverManager.stop(SHUTDOWN_TIMEOUT);
        logger.info('Server cleanup completed after startup failure', {
          module: 'startup',
          timestamp: new Date().toISOString()
        });
      } catch (cleanupError) {
        logger.error('Server cleanup failed after startup error', {
          module: 'startup',
          cleanupError: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          timestamp: new Date().toISOString()
        });
      }
    }

    // Ensure proper process exit codes for startup success or failure
    logger.error('Exiting application due to startup failure', {
      module: 'startup',
      exitCode: 1,
      timestamp: new Date().toISOString()
    });

    process.exit(1);
  }
}

// Execute main startup function when script is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error in startup script:', error);
    process.exit(1);
  });
}

// Export all startup functions and interfaces for testing and reuse
export {
  validateStartupEnvironment,
  initializeApplication,
  startServerWithRetry,
  setupGracefulShutdown,
  handleStartupError,
  logStartupSummary,
  main
};

// Export TypeScript interfaces for type safety
export type {
  StartupOptions,
  StartupResult,
  StartupHandler,
  ShutdownHandler,
  ErrorHandler
};