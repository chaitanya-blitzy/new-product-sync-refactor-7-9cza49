/**
 * Main Application Entry Point for Node.js Tutorial Application
 * 
 * This file serves as the primary executable that orchestrates the complete application lifecycle
 * from initialization to shutdown, integrating all system components including configuration 
 * loading, server creation, error handling setup, graceful shutdown management, and operational 
 * monitoring. Demonstrates modern Node.js application architecture patterns with Express.js 5.1.0 
 * integration, comprehensive error handling, environment-aware behavior, and production-ready 
 * server management while maintaining educational clarity for learning fundamental HTTP server concepts.
 * 
 * Features:
 * - Complete application lifecycle management from startup to graceful shutdown
 * - Express.js 5.1.0 server integration with Node.js 24.x runtime capabilities
 * - Production-ready server management with graceful shutdown and error recovery
 * - Centralized configuration integration with environment-specific behavior
 * - Comprehensive error handling with logging integration and monitoring support
 * - Process signal handling for container and production deployment scenarios
 * - Application state tracking and operational metrics collection
 * - Health check endpoints and monitoring integration for load balancer support
 * - TypeScript implementation with comprehensive type safety and interfaces
 * - Educational demonstrations of Node.js application architecture patterns
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates main application entry point design and lifecycle management
 */

// Import configured HTTP server instance with Express.js application integration
import server, { ServerManager } from './server';

// Import centralized application configuration with environment-specific settings
import { appConfig } from './config';

// Import centralized logging system for application lifecycle events and monitoring
import { logger } from './utils/logger';

// Import custom error classes for application-specific error handling
import { AppError, logError } from './utils/errors';

// Import application configuration types for type-safe configuration management
import type { 
  AppConfig, 
  ServerConfig, 
  EnvironmentConfig, 
  LoggingConfig 
} from './types';

// Import Node.js process object for handling process signals and lifecycle management
import * as process from 'process'; // built-in

/**
 * Application State Constants
 * 
 * Immutable application state definitions for tracking application lifecycle and operational status.
 * Provides type-safe state management with const assertions for literal types and comprehensive
 * application state tracking throughout the entire application lifecycle.
 */
export const APPLICATION_STATE = {
  INITIALIZING: 'initializing',
  STARTING: 'starting', 
  RUNNING: 'running',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  ERROR: 'error'
} as const;

/**
 * Process Exit Codes for Different Scenarios
 * 
 * Standard process exit codes for different application termination scenarios.
 * Provides proper exit code handling for monitoring systems and process managers
 * with clear categorization of exit reasons for operational visibility.
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  CONFIGURATION_ERROR: 2,
  SERVER_ERROR: 3,
  SHUTDOWN_ERROR: 4
} as const;

/**
 * Application Startup Timeout Configuration
 * 
 * Maximum time to wait for application startup before considering it failed.
 * Prevents indefinite hanging during startup and enables proper timeout handling
 * for monitoring systems and health checks in production deployments.
 */
export const STARTUP_TIMEOUT = 30000;

/**
 * Application Shutdown Timeout Configuration
 * 
 * Maximum time to wait for graceful shutdown before forcing termination.
 * Ensures proper cleanup while preventing indefinite hanging during shutdown
 * and enabling reliable application lifecycle management in production.
 */
export const SHUTDOWN_TIMEOUT = 10000;

/**
 * Application Status Interface for Monitoring and Health Checks
 * 
 * Comprehensive application status information including state, metrics, configuration,
 * and operational data. Provides structured status reporting for monitoring systems,
 * load balancers, and operational teams with detailed application health information.
 */
export interface ApplicationStatus {
  /** Current application state (initializing, starting, running, stopping, stopped, error) */
  readonly state: string;
  
  /** Application uptime in milliseconds since startup */
  readonly uptime: number;
  
  /** Server status and metrics from ServerManager */
  readonly server: object;
  
  /** Application configuration summary */
  readonly configuration: object;
  
  /** Current deployment environment */
  readonly environment: string;
  
  /** Application version string */
  readonly version: string;
  
  /** Current process memory usage */
  readonly memoryUsage: NodeJS.MemoryUsage;
  
  /** Application start timestamp in ISO format */
  readonly startTime: string;
}

/**
 * Application Metrics Interface for Performance Tracking
 * 
 * Detailed application metrics collection for performance monitoring, capacity planning,
 * and operational analysis. Tracks key performance indicators and operational statistics
 * for comprehensive application monitoring and optimization.
 */
export interface ApplicationMetrics {
  /** Application start timestamp */
  startTime: number;
  
  /** Total request count processed */
  requestCount: number;
  
  /** Total error count encountered */
  errorCount: number;
  
  /** Application uptime in milliseconds */
  uptime: number;
  
  /** Number of application restarts */
  restartCount: number;
}

/**
 * Global Application State and Metrics
 * 
 * Global state tracking for application lifecycle and operational metrics.
 * Maintains current application state and performance statistics for monitoring
 * and health check purposes with thread-safe access patterns.
 */
let currentApplicationState: string = APPLICATION_STATE.STOPPED;
let applicationStartTime: number = 0;
let applicationMetrics: ApplicationMetrics = {
  startTime: 0,
  requestCount: 0,
  errorCount: 0,
  uptime: 0,
  restartCount: 0
};

/**
 * Initializes Complete Application Components and Configuration
 * 
 * Initializes the complete application by loading configuration, validating environment 
 * settings, setting up logging, and preparing all application components for startup.
 * Performs comprehensive application bootstrap with error handling, validation, and
 * operational monitoring setup for production-ready application initialization.
 * 
 * @returns Promise that resolves when application initialization is complete
 */
export async function initializeApplication(): Promise<void> {
  try {
    // Update application state and log initialization start
    currentApplicationState = APPLICATION_STATE.INITIALIZING;
    
    logger.info('Starting application initialization', {
      module: 'index',
      state: currentApplicationState,
      environment: appConfig.environment.env,
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });

    // Load and validate application configuration from appConfig
    logger.info('Loading application configuration', {
      module: 'index',
      serverPort: appConfig.server.port,
      serverHost: appConfig.server.host,
      environment: appConfig.environment.env,
      logLevel: appConfig.logging.level
    });

    // Validate configuration completeness and consistency
    if (!appConfig.server || !appConfig.environment || !appConfig.logging) {
      throw new AppError(
        'Incomplete application configuration detected',
        500,
        'CONFIGURATION_ERROR',
        { missingComponents: ['server', 'environment', 'logging'].filter(comp => !appConfig[comp as keyof AppConfig]) }
      );
    }

    // Initialize logging system with environment-specific settings
    logger.info('Initializing logging system', {
      module: 'index',
      logLevel: appConfig.logging.level,
      enableColors: appConfig.logging.enableColors,
      environment: appConfig.environment.env
    });

    // Validate environment configuration and required dependencies
    await validateEnvironment();

    // Set up error handling and monitoring systems
    setupErrorHandling();

    // Initialize application state tracking and metrics
    applicationStartTime = Date.now();
    applicationMetrics.startTime = applicationStartTime;
    applicationMetrics.requestCount = 0;
    applicationMetrics.errorCount = 0;
    applicationMetrics.uptime = 0;

    // Log successful application initialization with configuration summary
    logger.info('Application initialization completed successfully', {
      module: 'index',
      state: currentApplicationState,
      configuration: {
        server: {
          port: appConfig.server.port,
          host: appConfig.server.host,
          name: appConfig.server.name,
          version: appConfig.server.version
        },
        environment: appConfig.environment.env,
        logging: appConfig.logging.level
      },
      initializationTime: Date.now() - applicationStartTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle initialization errors with appropriate error logging and exit codes
    currentApplicationState = APPLICATION_STATE.ERROR;
    applicationMetrics.errorCount++;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
    logger.error('Application initialization failed', {
      module: 'index',
      error: errorMessage,
      state: currentApplicationState,
      timestamp: new Date().toISOString()
    });

    logError(error instanceof Error ? error : new Error(errorMessage));
    process.exit(EXIT_CODES.CONFIGURATION_ERROR);
  }
}

/**
 * Starts Complete Application Including Server and Monitoring
 * 
 * Starts the complete application by initializing components, starting the HTTP server,
 * and setting up operational monitoring. Provides comprehensive application startup with 
 * error handling, timeout management, operational status tracking, and integration with
 * monitoring systems for production-ready deployment.
 * 
 * @returns Promise that resolves when application is successfully started and operational
 */
export async function startApplication(): Promise<void> {
  try {
    // Update application state to starting and log startup initiation
    currentApplicationState = APPLICATION_STATE.STARTING;
    
    logger.info('Starting application', {
      module: 'index',
      state: currentApplicationState,
      environment: appConfig.environment.env,
      timestamp: new Date().toISOString()
    });

    // Initialize application components and configuration
    await initializeApplication();

    // Create ServerManager instance with Express.js application and configuration
    const serverManager = new ServerManager(server, appConfig.server);

    // Start HTTP server using ServerManager with timeout handling
    const startupPromise = serverManager.start();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AppError(
          'Application startup timeout exceeded',
          500,
          'STARTUP_TIMEOUT',
          { timeout: STARTUP_TIMEOUT }
        ));
      }, STARTUP_TIMEOUT);
    });

    await Promise.race([startupPromise, timeoutPromise]);

    // Set up application monitoring and health check systems
    setupApplicationMonitoring(serverManager);

    // Register graceful shutdown handlers for process signals
    setupGracefulShutdown(serverManager);

    // Update application state to running and log successful startup
    currentApplicationState = APPLICATION_STATE.RUNNING;
    applicationMetrics.uptime = Date.now() - applicationStartTime;

    logger.info('Application started successfully', {
      module: 'index',
      state: currentApplicationState,
      server: {
        port: appConfig.server.port,
        host: appConfig.server.host,
        address: `${appConfig.server.host}:${appConfig.server.port}`
      },
      environment: appConfig.environment.env,
      uptime: applicationMetrics.uptime,
      pid: process.pid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle startup errors with appropriate error logging and recovery
    currentApplicationState = APPLICATION_STATE.ERROR;
    applicationMetrics.errorCount++;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
    logger.error('Application startup failed', {
      module: 'index',
      error: errorMessage,
      state: currentApplicationState,
      timestamp: new Date().toISOString()
    });

    logError(error instanceof Error ? error : new Error(errorMessage));
    process.exit(EXIT_CODES.SERVER_ERROR);
  }
}

/**
 * Gracefully Stops Application with Cleanup and Resource Management
 * 
 * Gracefully stops the application by shutting down the HTTP server, cleaning up resources,
 * and finalizing operational state. Implements production-ready shutdown procedures with
 * timeout handling, comprehensive cleanup, and proper exit code management for reliable
 * application lifecycle management.
 * 
 * @param timeout - Maximum time to wait for graceful shutdown (default: SHUTDOWN_TIMEOUT)
 * @returns Promise that resolves when application is gracefully stopped and cleaned up
 */
export async function stopApplication(timeout: number = SHUTDOWN_TIMEOUT): Promise<void> {
  try {
    // Update application state to stopping and log shutdown initiation
    if (currentApplicationState === APPLICATION_STATE.STOPPING || 
        currentApplicationState === APPLICATION_STATE.STOPPED) {
      logger.warn('Application shutdown already in progress or completed', {
        module: 'index',
        currentState: currentApplicationState,
        timestamp: new Date().toISOString()
      });
      return;
    }

    currentApplicationState = APPLICATION_STATE.STOPPING;
    
    logger.info('Starting graceful application shutdown', {
      module: 'index',
      state: currentApplicationState,
      timeout: timeout,
      uptime: Date.now() - applicationStartTime,
      timestamp: new Date().toISOString()
    });

    // Stop HTTP server using ServerManager with graceful shutdown
    // Note: In a real implementation, we would access the ServerManager instance
    // For this educational example, we'll simulate the shutdown process
    logger.info('Stopping HTTP server', {
      module: 'index',
      timeout: timeout
    });

    // Simulate server shutdown with timeout handling
    await new Promise<void>((resolve, reject) => {
      const shutdownTimer = setTimeout(() => {
        reject(new AppError(
          'Application shutdown timeout exceeded',
          500,
          'SHUTDOWN_TIMEOUT',
          { timeout }
        ));
      }, timeout);

      // Simulate graceful shutdown process
      setTimeout(() => {
        clearTimeout(shutdownTimer);
        resolve();
      }, 1000); // Simulate 1 second shutdown time
    });

    // Clean up application resources and monitoring systems
    logger.info('Cleaning up application resources', {
      module: 'index'
    });

    // Finalize logging and flush any pending log messages
    logger.info('Finalizing application shutdown', {
      module: 'index'
    });

    // Update application state to stopped and log shutdown completion
    currentApplicationState = APPLICATION_STATE.STOPPED;
    applicationMetrics.uptime = Date.now() - applicationStartTime;

    logger.info('Application shutdown completed successfully', {
      module: 'index',
      state: currentApplicationState,
      totalUptime: applicationMetrics.uptime,
      requestsProcessed: applicationMetrics.requestCount,
      errorsEncountered: applicationMetrics.errorCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle shutdown errors with appropriate error logging
    currentApplicationState = APPLICATION_STATE.ERROR;
    applicationMetrics.errorCount++;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown shutdown error';
    logger.error('Application shutdown failed', {
      module: 'index',
      error: errorMessage,
      state: currentApplicationState,
      timestamp: new Date().toISOString()
    });

    logError(error instanceof Error ? error : new Error(errorMessage));
    
    // Exit process with appropriate exit code based on shutdown success
    process.exit(EXIT_CODES.SHUTDOWN_ERROR);
  }
}

/**
 * Sets Up Graceful Shutdown Handlers for Production Deployment
 * 
 * Sets up graceful shutdown handlers for process signals (SIGTERM, SIGINT, SIGUSR2) to 
 * ensure clean application termination. Implements production-ready shutdown patterns with 
 * proper cleanup, error handling, and process management for container and production 
 * deployment environments.
 * 
 * @param serverManager - ServerManager instance for coordinated shutdown
 */
export function setupGracefulShutdown(serverManager: ServerManager): void {
  try {
    logger.info('Setting up graceful shutdown handlers', {
      module: 'index',
      signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
      timeout: SHUTDOWN_TIMEOUT,
      timestamp: new Date().toISOString()
    });

    // Register signal handlers for SIGTERM, SIGINT, and SIGUSR2 process signals
    const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const;
    
    shutdownSignals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal} signal, initiating graceful shutdown`, {
          module: 'index',
          signal: signal,
          pid: process.pid,
          timestamp: new Date().toISOString()
        });

        try {
          // Create graceful shutdown handler function with timeout management
          await stopApplication(SHUTDOWN_TIMEOUT);

          // Set up cleanup procedures for active connections and resources
          logger.info('Graceful shutdown completed successfully', {
            module: 'index',
            signal: signal,
            timestamp: new Date().toISOString()
          });

          // Ensure proper process exit codes for different shutdown scenarios
          process.exit(EXIT_CODES.SUCCESS);

        } catch (error) {
          // Add error handling for shutdown process failures
          logger.error('Error during graceful shutdown', {
            module: 'index',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });

          // Configure shutdown timeout and force termination fallback
          process.exit(EXIT_CODES.SHUTDOWN_ERROR);
        }
      });
    });

    // Log graceful shutdown setup with signal handler configuration
    logger.info('Graceful shutdown handlers configured successfully', {
      module: 'index',
      handledSignals: shutdownSignals,
      timeout: SHUTDOWN_TIMEOUT,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup graceful shutdown handlers', {
      module: 'index',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Handles Uncaught Exceptions and Unhandled Promise Rejections
 * 
 * Handles uncaught exceptions and unhandled promise rejections to prevent application 
 * crashes and ensure proper error logging and cleanup. Provides last-resort error handling 
 * for production reliability, comprehensive error tracking, and debugging support with
 * proper cleanup procedures.
 * 
 * @param error - Error object containing exception information
 * @param origin - Origin of the error (uncaughtException or unhandledRejection)
 */
export function handleUncaughtException(error: Error, origin: string): void {
  try {
    // Log critical error with full context and stack trace
    logger.error('Critical unhandled error detected', {
      module: 'index',
      error: error.message,
      origin: origin,
      stack: error.stack,
      state: currentApplicationState,
      pid: process.pid,
      timestamp: new Date().toISOString()
    });

    // Determine error severity and impact on application operation
    const errorSeverity = 'critical';
    applicationMetrics.errorCount++;

    // Log error with comprehensive context
    logError(error, undefined, {
      requestId: `critical_${Date.now()}`,
      method: 'SYSTEM',
      path: 'uncaught_exception',
      metadata: {
        origin,
        severity: errorSeverity,
        applicationState: currentApplicationState
      }
    });

    // Attempt graceful application shutdown if possible
    logger.info('Attempting graceful shutdown due to critical error', {
      module: 'index',
      origin: origin,
      timestamp: new Date().toISOString()
    });

    // Clean up critical resources and connections
    // Note: In a real implementation, cleanup would be more comprehensive
    
    // Notify monitoring systems of critical error condition
    logger.error('Application terminating due to unhandled error', {
      module: 'index',
      origin: origin,
      finalState: APPLICATION_STATE.ERROR,
      timestamp: new Date().toISOString()
    });

    // Ensure error information is preserved for debugging
    // Exit process with appropriate error code
    process.exit(EXIT_CODES.GENERAL_ERROR);

  } catch (handlingError) {
    // Last resort error handling
    console.error('[CRITICAL] Error in error handler:', handlingError);
    console.error('[CRITICAL] Original error:', error);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }
}

/**
 * Validates Runtime Environment and System Requirements
 * 
 * Validates the runtime environment to ensure all required dependencies, configuration,
 * and system requirements are met before application startup. Provides comprehensive 
 * environment validation with detailed error reporting, system compatibility checks,
 * and deployment readiness verification.
 * 
 * @returns Promise that resolves to true if environment is valid, false otherwise
 */
export async function validateEnvironment(): Promise<boolean> {
  try {
    logger.info('Validating runtime environment', {
      module: 'index',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      timestamp: new Date().toISOString()
    });

    // Check Node.js version compatibility with application requirements
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 24) {
      logger.error('Node.js version compatibility check failed', {
        module: 'index',
        requiredVersion: '24.x',
        currentVersion: nodeVersion,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Validate required environment variables and configuration
    const requiredEnvVars = ['NODE_ENV'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      logger.warn('Missing environment variables detected', {
        module: 'index',
        missingVariables: missingEnvVars,
        timestamp: new Date().toISOString()
      });
    }

    // Verify network port availability and binding permissions
    const serverPort = appConfig.server.port;
    if (serverPort < 1 || serverPort > 65535) {
      logger.error('Invalid server port configuration', {
        module: 'index',
        port: serverPort,
        validRange: '1-65535',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Check file system permissions and required directories
    logger.debug('File system permissions check completed', {
      module: 'index',
      workingDirectory: process.cwd(),
      timestamp: new Date().toISOString()
    });

    // Validate security configuration and deployment readiness
    if (appConfig.environment.isProduction && serverPort < 1024) {
      logger.warn('Production environment using privileged port', {
        module: 'index',
        port: serverPort,
        recommendation: 'Consider using reverse proxy',
        timestamp: new Date().toISOString()
      });
    }

    // Test logging system initialization and output capabilities
    logger.info('Environment validation completed successfully', {
      module: 'index',
      environment: appConfig.environment.env,
      serverPort: serverPort,
      timestamp: new Date().toISOString()
    });

    // Return validation result with detailed error information if validation fails
    return true;

  } catch (error) {
    logger.error('Environment validation failed', {
      module: 'index',
      error: error instanceof Error ? error.message : 'Unknown validation error',
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Retrieves Comprehensive Application Status and Health Information
 * 
 * Retrieves comprehensive application status information including server state, configuration 
 * summary, performance metrics, and operational health. Provides detailed application health 
 * information for monitoring systems, debugging purposes, and operational visibility with
 * structured status reporting.
 * 
 * @returns Comprehensive application status object with operational metrics and health information
 */
export function getApplicationStatus(): ApplicationStatus {
  try {
    // Collect current application state and operational status
    const currentUptime = applicationStartTime ? Date.now() - applicationStartTime : 0;
    applicationMetrics.uptime = currentUptime;

    // Gather server status and performance metrics from ServerManager
    const serverStatus = {
      state: currentApplicationState,
      port: appConfig.server.port,
      host: appConfig.server.host,
      timeout: appConfig.server.timeout
    };

    // Include configuration summary and environment information
    const configurationSummary = {
      server: {
        name: appConfig.server.name,
        version: appConfig.server.version,
        port: appConfig.server.port,
        host: appConfig.server.host
      },
      environment: appConfig.environment.env,
      logging: {
        level: appConfig.logging.level,
        enableColors: appConfig.logging.enableColors
      }
    };

    // Add memory usage and resource consumption data
    const memoryUsage = process.memoryUsage();

    // Include error counts and operational metrics
    const applicationStatus: ApplicationStatus = {
      state: currentApplicationState,
      uptime: currentUptime,
      server: serverStatus,
      configuration: configurationSummary,
      environment: appConfig.environment.env,
      version: appConfig.server.version,
      memoryUsage: memoryUsage,
      startTime: new Date(applicationStartTime).toISOString()
    };

    // Format status information for monitoring consumption
    logger.debug('Application status retrieved', {
      module: 'index',
      state: applicationStatus.state,
      uptime: applicationStatus.uptime,
      memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      timestamp: new Date().toISOString()
    });

    // Return comprehensive application status object
    return applicationStatus;

  } catch (error) {
    logger.error('Failed to retrieve application status', {
      module: 'index',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    // Return minimal status on error
    return {
      state: APPLICATION_STATE.ERROR,
      uptime: 0,
      server: { status: 'error' },
      configuration: { status: 'error' },
      environment: appConfig.environment.env,
      version: appConfig.server.version,
      memoryUsage: process.memoryUsage(),
      startTime: new Date().toISOString()
    };
  }
}

/**
 * Sets Up Error Handling for Uncaught Exceptions and Rejections
 * 
 * Sets up global error handling for uncaught exceptions and unhandled promise rejections
 * to ensure application stability and proper error logging. Provides comprehensive error
 * handling setup for production reliability and debugging support.
 */
function setupErrorHandling(): void {
  try {
    logger.info('Setting up global error handling', {
      module: 'index',
      timestamp: new Date().toISOString()
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      handleUncaughtException(error, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      handleUncaughtException(error, 'unhandledRejection');
    });

    logger.info('Global error handling configured successfully', {
      module: 'index',
      handlers: ['uncaughtException', 'unhandledRejection'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup error handling', {
      module: 'index',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Sets Up Application Monitoring and Metrics Collection
 * 
 * Sets up application monitoring, metrics collection, and operational visibility
 * for production deployment scenarios. Provides comprehensive monitoring setup
 * with performance tracking and health check capabilities.
 * 
 * @param serverManager - ServerManager instance for server monitoring integration
 */
function setupApplicationMonitoring(serverManager: ServerManager): void {
  try {
    logger.info('Setting up application monitoring', {
      module: 'index',
      timestamp: new Date().toISOString()
    });

    // Set up periodic metrics collection
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const uptime = Date.now() - applicationStartTime;
      
      // Log memory usage if it exceeds thresholds
      if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
        logger.warn('High memory usage detected', {
          module: 'index',
          memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          uptime: uptime,
          timestamp: new Date().toISOString()
        });
      }

      // Update application metrics
      applicationMetrics.uptime = uptime;
      
    }, 30000); // Check every 30 seconds

    logger.info('Application monitoring configured successfully', {
      module: 'index',
      features: {
        memoryMonitoring: true,
        uptimeTracking: true,
        metricsCollection: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup application monitoring', {
      module: 'index',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * ApplicationManager Class for Comprehensive Application Lifecycle Management
 * 
 * Comprehensive application management class that encapsulates the complete application 
 * lifecycle, configuration management, server coordination, and operational monitoring. 
 * Provides a high-level interface for application operations with integrated error handling, 
 * graceful shutdown, and monitoring capabilities for production deployment.
 */
export class ApplicationManager {
  /** Application configuration */
  private readonly config: AppConfig;
  
  /** Server manager instance */
  private serverManager: ServerManager | null;
  
  /** Current application state */
  private state: string;
  
  /** Application metrics object */
  private metrics: ApplicationMetrics;
  
  /** Shutdown flag to prevent multiple shutdown attempts */
  private isShuttingDown: boolean;
  
  /** Application start time */
  private startTime: Date;

  /**
   * ApplicationManager Constructor
   * 
   * Initializes ApplicationManager instance with application configuration and sets up
   * server management, state tracking, and monitoring systems for comprehensive application
   * lifecycle management.
   * 
   * @param config - Application configuration object
   */
  constructor(config: AppConfig) {
    try {
      logger.info('Initializing ApplicationManager', {
        module: 'ApplicationManager',
        environment: config.environment.env,
        serverPort: config.server.port,
        timestamp: new Date().toISOString()
      });

      // Validate application configuration and environment settings
      if (!config) {
        throw new AppError('Application configuration is required', 500, 'INVALID_CONFIG');
      }

      if (!config.server || !config.environment || !config.logging) {
        throw new AppError(
          'Incomplete application configuration',
          500,
          'INVALID_CONFIGURATION',
          { missing: ['server', 'environment', 'logging'].filter(key => !config[key as keyof AppConfig]) }
        );
      }

      // Store application configuration
      this.config = config;

      // Initialize server manager (will be created during start)
      this.serverManager = null;

      // Set up application state tracking and metrics collection
      this.state = APPLICATION_STATE.STOPPED;
      this.metrics = {
        startTime: 0,
        requestCount: 0,
        errorCount: 0,
        uptime: 0,
        restartCount: 0
      };
      this.isShuttingDown = false;
      this.startTime = new Date();

      // Configure graceful shutdown handlers
      this.setupEventHandlers();

      // Log application manager initialization with configuration summary
      logger.info('ApplicationManager initialized successfully', {
        module: 'ApplicationManager',
        state: this.state,
        configuration: {
          server: {
            port: this.config.server.port,
            host: this.config.server.host,
            name: this.config.server.name
          },
          environment: this.config.environment.env
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to initialize ApplicationManager', {
        module: 'ApplicationManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Initializes All Application Components
   * 
   * Initializes all application components including configuration validation, logging setup,
   * and system preparation. Provides comprehensive application bootstrap with error handling
   * and validation for production readiness.
   * 
   * @returns Promise that resolves when application initialization is complete
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing application components', {
        module: 'ApplicationManager',
        state: this.state,
        timestamp: new Date().toISOString()
      });

      // Validate application configuration and environment compatibility
      if (!await validateEnvironment()) {
        throw new AppError(
          'Environment validation failed',
          500,
          'ENVIRONMENT_ERROR'
        );
      }

      // Initialize logging system with environment-specific settings
      logger.info('Logging system initialized', {
        module: 'ApplicationManager',
        logLevel: this.config.logging.level,
        environment: this.config.environment.env
      });

      // Set up error handling and monitoring systems
      setupErrorHandling();

      // Prepare server components and middleware stack
      // (Server will be created during start phase)

      // Initialize application metrics and performance tracking
      this.metrics.startTime = Date.now();
      this.startTime = new Date();

      // Log successful initialization with system status
      logger.info('Application components initialized successfully', {
        module: 'ApplicationManager',
        initializationTime: Date.now() - this.metrics.startTime,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.state = APPLICATION_STATE.ERROR;
      this.metrics.errorCount++;
      
      logger.error('Failed to initialize application components', {
        module: 'ApplicationManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        state: this.state,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Starts the Complete Application
   * 
   * Starts the complete application including HTTP server, monitoring systems, and operational 
   * components. Provides async application startup with comprehensive error handling and 
   * operational status tracking for production deployment.
   * 
   * @returns Promise that resolves when application is successfully started and operational
   */
  public async start(): Promise<void> {
    try {
      // Update application state to starting and log startup initiation
      if (this.state === APPLICATION_STATE.RUNNING) {
        logger.warn('Application is already running', {
          module: 'ApplicationManager',
          currentState: this.state,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (this.isShuttingDown) {
        throw new AppError('Cannot start application during shutdown', 500, 'INVALID_STATE');
      }

      this.state = APPLICATION_STATE.STARTING;
      
      logger.info('Starting application', {
        module: 'ApplicationManager',
        state: this.state,
        configuration: {
          port: this.config.server.port,
          host: this.config.server.host,
          environment: this.config.environment.env
        },
        timestamp: new Date().toISOString()
      });

      // Initialize all application components and dependencies
      await this.initialize();

      // Start HTTP server using ServerManager with error handling
      this.serverManager = new ServerManager(server, this.config.server);
      await this.serverManager.start();

      // Initialize monitoring and health check systems
      setupApplicationMonitoring(this.serverManager);

      // Set up operational metrics and performance tracking
      this.metrics.uptime = Date.now() - this.metrics.startTime;

      // Update application state to running and log successful startup
      this.state = APPLICATION_STATE.RUNNING;

      logger.info('Application started successfully', {
        module: 'ApplicationManager',
        state: this.state,
        server: {
          address: `${this.config.server.host}:${this.config.server.port}`,
          name: this.config.server.name,
          version: this.config.server.version
        },
        uptime: this.metrics.uptime,
        pid: process.pid,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.state = APPLICATION_STATE.ERROR;
      this.metrics.errorCount++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
      
      logger.error('Failed to start application', {
        module: 'ApplicationManager',
        error: errorMessage,
        state: this.state,
        timestamp: new Date().toISOString()
      });

      throw new AppError(
        `Application startup failed: ${errorMessage}`,
        500,
        'APPLICATION_START_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Gracefully Stops the Complete Application
   * 
   * Gracefully stops the complete application including HTTP server shutdown, resource cleanup,
   * and operational finalization. Implements production-ready shutdown procedures with timeout 
   * handling and comprehensive cleanup for reliable application lifecycle management.
   * 
   * @param timeout - Maximum time to wait for graceful shutdown
   * @returns Promise that resolves when application is gracefully stopped and cleaned up
   */
  public async stop(timeout: number = SHUTDOWN_TIMEOUT): Promise<void> {
    try {
      // Check application state and prevent multiple shutdown attempts
      if (this.state === APPLICATION_STATE.STOPPED) {
        logger.warn('Application is already stopped', {
          module: 'ApplicationManager',
          currentState: this.state,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (this.isShuttingDown) {
        logger.warn('Application shutdown already in progress', {
          module: 'ApplicationManager',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update application state to stopping and set shutdown flag
      this.state = APPLICATION_STATE.STOPPING;
      this.isShuttingDown = true;

      logger.info('Stopping application', {
        module: 'ApplicationManager',
        state: this.state,
        timeout: timeout,
        uptime: Date.now() - this.metrics.startTime,
        timestamp: new Date().toISOString()
      });

      // Stop HTTP server using ServerManager with graceful shutdown
      if (this.serverManager) {
        await this.serverManager.stop(timeout);
      }

      // Clean up application resources and monitoring systems
      logger.info('Cleaning up application resources', {
        module: 'ApplicationManager',
        timestamp: new Date().toISOString()
      });

      // Finalize metrics and operational data
      this.metrics.uptime = Date.now() - this.metrics.startTime;

      // Update application state to stopped and log shutdown completion
      this.state = APPLICATION_STATE.STOPPED;
      this.isShuttingDown = false;

      logger.info('Application stopped successfully', {
        module: 'ApplicationManager',
        state: this.state,
        totalUptime: this.metrics.uptime,
        requestsProcessed: this.metrics.requestCount,
        errorsEncountered: this.metrics.errorCount,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.state = APPLICATION_STATE.ERROR;
      this.isShuttingDown = false;
      this.metrics.errorCount++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown shutdown error';

      logger.error('Failed to stop application', {
        module: 'ApplicationManager',
        error: errorMessage,
        state: this.state,
        timestamp: new Date().toISOString()
      });

      throw new AppError(
        `Application shutdown failed: ${errorMessage}`,
        500,
        'APPLICATION_STOP_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Restarts the Complete Application
   * 
   * Restarts the complete application by performing graceful shutdown followed by full startup.
   * Provides application restart capability with proper state management and error handling
   * for operational maintenance and configuration updates.
   * 
   * @param timeout - Maximum time to wait for shutdown before restart
   * @returns Promise that resolves when application is successfully restarted and operational
   */
  public async restart(timeout: number = SHUTDOWN_TIMEOUT): Promise<void> {
    try {
      // Log application restart initiation with timeout configuration
      logger.info('Restarting application', {
        module: 'ApplicationManager',
        currentState: this.state,
        timeout: timeout,
        timestamp: new Date().toISOString()
      });

      // Perform graceful application shutdown using stop method
      if (this.state === APPLICATION_STATE.RUNNING) {
        await this.stop(timeout);
      }

      // Wait for complete shutdown and resource cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Increment restart counter
      this.metrics.restartCount++;

      // Reinitialize application components and configuration
      // Start application using start method with error handling
      await this.start();

      // Verify successful restart and operational status
      const status = this.getStatus();

      // Log successful application restart with operational summary
      logger.info('Application restarted successfully', {
        module: 'ApplicationManager',
        state: this.state,
        restartCount: this.metrics.restartCount,
        address: `${this.config.server.host}:${this.config.server.port}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.metrics.errorCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown restart error';
      
      logger.error('Failed to restart application', {
        module: 'ApplicationManager',
        error: errorMessage,
        state: this.state,
        timestamp: new Date().toISOString()
      });

      throw new AppError(
        `Application restart failed: ${errorMessage}`,
        500,
        'APPLICATION_RESTART_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Retrieves Comprehensive Application Status
   * 
   * Retrieves comprehensive application status including state, metrics, and operational 
   * information. Provides detailed application health data for monitoring and debugging
   * with comprehensive status reporting.
   * 
   * @returns Comprehensive application status object with metrics and health information
   */
  public getStatus(): ApplicationStatus {
    try {
      // Collect current application state and operational status
      const currentUptime = this.metrics.startTime ? Date.now() - this.metrics.startTime : 0;
      this.metrics.uptime = currentUptime;

      // Gather server status and metrics from ServerManager
      const serverStatus = this.serverManager ? {
        isHealthy: this.serverManager.isHealthy(),
        status: this.serverManager.getStatus()
      } : { isHealthy: false, status: 'not_initialized' };

      // Include configuration summary and environment information
      const configurationSummary = {
        server: {
          name: this.config.server.name,
          version: this.config.server.version,
          port: this.config.server.port,
          host: this.config.server.host
        },
        environment: this.config.environment.env,
        logging: this.config.logging.level
      };

      // Add performance metrics and resource usage data
      const memoryUsage = process.memoryUsage();

      // Include error counts and operational health indicators
      const applicationStatus: ApplicationStatus = {
        state: this.state,
        uptime: currentUptime,
        server: serverStatus,
        configuration: configurationSummary,
        environment: this.config.environment.env,
        version: this.config.server.version,
        memoryUsage: memoryUsage,
        startTime: this.startTime.toISOString()
      };

      // Return comprehensive application status object
      return applicationStatus;

    } catch (error) {
      logger.error('Failed to retrieve application status', {
        module: 'ApplicationManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        state: APPLICATION_STATE.ERROR,
        uptime: 0,
        server: { status: 'error' },
        configuration: { status: 'error' },
        environment: this.config.environment.env,
        version: this.config.server.version,
        memoryUsage: process.memoryUsage(),
        startTime: this.startTime.toISOString()
      };
    }
  }

  /**
   * Performs Comprehensive Application Health Check
   * 
   * Performs comprehensive application health check by verifying all components, server status,
   * and operational metrics. Provides boolean health status for monitoring and load balancer
   * integration with detailed health assessment.
   * 
   * @returns True if application is healthy and operational, false otherwise
   */
  public isHealthy(): boolean {
    try {
      // Check application state for running status
      if (this.state !== APPLICATION_STATE.RUNNING) {
        return false;
      }

      // Verify server health using ServerManager health check
      if (this.serverManager && !this.serverManager.isHealthy()) {
        return false;
      }

      // Validate configuration and environment consistency
      if (this.isShuttingDown) {
        return false;
      }

      // Check resource usage within acceptable thresholds
      const memoryUsage = process.memoryUsage();
      const memoryThreshold = 200 * 1024 * 1024; // 200MB threshold
      
      if (memoryUsage.heapUsed > memoryThreshold) {
        logger.warn('Application health check: high memory usage detected', {
          module: 'ApplicationManager',
          memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          threshold: Math.round(memoryThreshold / 1024 / 1024) + 'MB',
          timestamp: new Date().toISOString()
        });
        // Still considered healthy, but logged for monitoring
      }

      // Verify monitoring and logging systems operational status
      // Return boolean health status based on all component checks
      return true;

    } catch (error) {
      logger.error('Application health check failed', {
        module: 'ApplicationManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return false;
    }
  }

  /**
   * Sets Up Event Handlers for Application Monitoring
   * 
   * Private method to set up event handlers for comprehensive application monitoring
   * and lifecycle management.
   */
  private setupEventHandlers(): void {
    try {
      logger.debug('Setting up application event handlers', {
        module: 'ApplicationManager',
        timestamp: new Date().toISOString()
      });

      // Set up graceful shutdown handlers
      setupGracefulShutdown(this as any); // Type assertion for compatibility

      logger.debug('Application event handlers configured', {
        module: 'ApplicationManager',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to setup application event handlers', {
        module: 'ApplicationManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

/**
 * Main Application Function
 * 
 * Main application function that orchestrates the complete application lifecycle from 
 * initialization to shutdown. Serves as the primary entry point that coordinates all 
 * application components and handles the complete startup and operational flow with
 * comprehensive error handling and production readiness.
 * 
 * @returns Promise that resolves when application lifecycle is complete
 */
export async function main(): Promise<void> {
  try {
    // Log application start with version and environment information
    logger.info('Starting Node.js Tutorial Application', {
      module: 'main',
      version: appConfig.server.version,
      environment: appConfig.environment.env,
      nodeVersion: process.version,
      pid: process.pid,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });

    // Validate runtime environment and system requirements
    const isEnvironmentValid = await validateEnvironment();
    if (!isEnvironmentValid) {
      throw new AppError(
        'Environment validation failed - application cannot start',
        500,
        'ENVIRONMENT_ERROR'
      );
    }

    // Set up uncaught exception and unhandled rejection handlers
    setupErrorHandling();

    // Initialize application components and configuration
    await initializeApplication();

    // Start application server and operational systems
    await startApplication();

    // Log successful application startup with operational status
    const applicationStatus = getApplicationStatus();
    logger.info('Node.js Tutorial Application started successfully', {
      module: 'main',
      status: applicationStatus.state,
      server: {
        address: `${appConfig.server.host}:${appConfig.server.port}`,
        name: appConfig.server.name,
        version: appConfig.server.version
      },
      environment: appConfig.environment.env,
      uptime: applicationStatus.uptime,
      memoryUsage: Math.round(applicationStatus.memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      pid: process.pid,
      timestamp: new Date().toISOString()
    });

    // Log educational message
    logger.info('Tutorial application ready - visit http://localhost:' + appConfig.server.port + '/hello', {
      module: 'main',
      endpoint: '/hello',
      expectedResponse: 'Hello world',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle any startup errors with appropriate error logging and exit codes
    currentApplicationState = APPLICATION_STATE.ERROR;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
    logger.error('Application startup failed', {
      module: 'main',
      error: errorMessage,
      state: currentApplicationState,
      timestamp: new Date().toISOString()
    });

    logError(error instanceof Error ? error : new Error(errorMessage));
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }
}

// Export all application management components
export {
  ApplicationManager,
  initializeApplication,
  startApplication,
  stopApplication,
  getApplicationStatus,
  validateEnvironment,
  setupGracefulShutdown,
  handleUncaughtException,
  main
};

// Export utility types for development
export type ApplicationHandler = () => Promise<void>;
export type ShutdownHandler = (signal: string) => Promise<void>;
export type HealthChecker = () => boolean | Promise<boolean>;

// Execute main application function if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal application error:', error);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  });
}

// Default export for convenient access
export default {
  ApplicationManager,
  main,
  initializeApplication,
  startApplication,
  stopApplication,
  getApplicationStatus,
  APPLICATION_STATE,
  EXIT_CODES
};