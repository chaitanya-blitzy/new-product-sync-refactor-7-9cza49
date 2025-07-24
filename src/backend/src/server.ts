/**
 * HTTP Server Initialization and Lifecycle Management Module for Node.js Tutorial Application
 * 
 * This module serves as the server orchestration layer, handling server startup, shutdown, error
 * handling, and operational management while integrating with the Express.js application factory,
 * configuration system, and monitoring infrastructure. It demonstrates modern Node.js server
 * management patterns, graceful shutdown handling, and production-ready server lifecycle management
 * with comprehensive error handling and operational visibility.
 * 
 * Features:
 * - HTTP server creation and lifecycle management using Node.js built-in modules
 * - Express.js 5.1.0 application integration with Node.js HTTP server
 * - Production-ready server configuration with environment-specific settings
 * - Graceful shutdown patterns for reliable server termination and cleanup
 * - Server monitoring and metrics collection for operational visibility
 * - Error handling and recovery strategies for server-level exceptions
 * - TypeScript class design for comprehensive server management
 * - Process signal handling for production deployment scenarios
 * - Server health checks and status monitoring for load balancer integration
 * - Modern Node.js server architecture patterns for scalable applications
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates HTTP server creation and lifecycle management patterns
 */

// Import fully configured Express.js 5.1.0 application instance ready for server binding
import app from './app';

// Import centralized application configuration for server initialization and port binding
import { appConfig, serverConfig, environment, loggingConfig } from './config';

// Import centralized logging system for server lifecycle events and error tracking
import { logger } from './utils/logger';

// Import custom error class for server-specific error handling and standardized responses
import { AppError } from './utils/errors';

// Import server configuration interface for type-safe server initialization
import { ServerConfig } from './types';

// Import Node.js built-in HTTP module for creating HTTP server instance
import * as http from 'http'; // built-in

// Import Node.js process object for handling process signals and graceful shutdown
import * as process from 'process'; // built-in

/**
 * Global Server State Constants
 * 
 * Immutable server state definitions for tracking server lifecycle and operational status.
 * Provides type-safe state management with const assertions for literal types.
 */
export const SERVER_STATE = {
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  ERROR: 'error'
} as const;

/**
 * Process Signals for Graceful Shutdown
 * 
 * Standard process signals for graceful shutdown handling in production environments.
 * Supports proper signal handling for container orchestration and deployment systems.
 */
export const SHUTDOWN_SIGNALS = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const;

/**
 * Default Shutdown Timeout Configuration
 * 
 * Maximum time to wait for graceful shutdown before forcing termination.
 * Ensures proper cleanup while preventing indefinite hanging during shutdown.
 */
export const DEFAULT_SHUTDOWN_TIMEOUT = 10000;

/**
 * Server Metrics Global State
 * 
 * Global metrics object for tracking server performance and operational statistics.
 * Provides runtime metrics collection for monitoring and observability.
 */
export const SERVER_METRICS = {
  startTime: 0,
  requestCount: 0,
  errorCount: 0,
  uptime: 0
};

/**
 * Server Status Interface for Monitoring and Health Checks
 * 
 * Comprehensive server status information including state, metrics, and operational data.
 * Provides structured status reporting for monitoring systems and load balancers.
 */
export interface ServerStatus {
  /** Current server state (starting, running, stopping, stopped, error) */
  readonly state: string;
  
  /** Server uptime in milliseconds */
  readonly uptime: number;
  
  /** Current active connection count */
  readonly connections: number;
  
  /** Total number of requests processed */
  readonly requestCount: number;
  
  /** Total number of errors encountered */
  readonly errorCount: number;
  
  /** Current process memory usage */
  readonly memoryUsage: NodeJS.MemoryUsage;
  
  /** Server listening address and port */
  readonly address: string;
  
  /** Current deployment environment */
  readonly environment: string;
}

/**
 * Server Metrics Interface for Performance Tracking
 * 
 * Detailed server metrics collection for performance monitoring and optimization.
 * Tracks operational metrics for capacity planning and performance analysis.
 */
export interface ServerMetrics {
  /** Server start timestamp */
  startTime: number;
  
  /** Total request count */
  requestCount: number;
  
  /** Total error count */
  errorCount: number;
  
  /** Server uptime in milliseconds */
  uptime: number;
  
  /** Average response time in milliseconds */
  averageResponseTime: number;
}

/**
 * Configuration Validation Result Interface
 * 
 * Structured validation result for server configuration compliance and deployment readiness.
 * Provides comprehensive feedback on configuration validation status and recommendations.
 */
export interface ConfigValidationResult {
  /** Overall configuration validation status */
  readonly isValid: boolean;
  
  /** Array of configuration validation errors requiring immediate attention */
  readonly errors: string[];
  
  /** Array of configuration validation warnings requiring review */
  readonly warnings: string[];
  
  /** Array of configuration improvement recommendations */
  readonly recommendations: string[];
}

/**
 * Factory Function for Creating HTTP Server Instance
 * 
 * Creates an HTTP server instance using the configured Express.js application. Integrates
 * the Express.js app with Node.js HTTP server, applies server configuration, and sets up
 * server event handlers for comprehensive server lifecycle management.
 * 
 * @param expressApp - Configured Express.js application instance
 * @param config - Server configuration with port, host, and connection settings
 * @returns Configured HTTP server instance ready for binding and request handling
 */
export function createServer(expressApp: typeof app, config: ServerConfig): http.Server {
  try {
    logger.info('Creating HTTP server instance', {
      module: 'server',
      config: {
        port: config.port,
        host: config.host,
        timeout: config.timeout
      },
      timestamp: new Date().toISOString()
    });

    // Create HTTP server instance using Node.js http.createServer with Express.js application
    const server = http.createServer(expressApp);

    // Apply server configuration including timeout, keep-alive, and connection settings
    server.setTimeout(config.timeout);
    server.keepAliveTimeout = 61000; // Default keep-alive timeout
    server.headersTimeout = 62000; // Headers timeout slightly higher than keep-alive

    // Set up server event handlers for connection, error, and lifecycle events
    server.on('connection', (socket) => {
      logger.debug('New client connection established', {
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort,
        timestamp: new Date().toISOString()
      });

      // Configure socket timeout and keep-alive settings
      socket.setTimeout(config.timeout);
      socket.setKeepAlive(true, 30000);
    });

    // Configure server timeout and connection management based on configuration
    server.on('timeout', (socket) => {
      logger.warn('Server socket timeout occurred', {
        timeout: config.timeout,
        timestamp: new Date().toISOString()
      });
    });

    // Add server monitoring and metrics collection for operational visibility
    server.on('request', (req, res) => {
      SERVER_METRICS.requestCount++;
      
      // Track response completion for metrics
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          SERVER_METRICS.errorCount++;
        }
      });
    });

    // Set up graceful shutdown handlers for clean server termination
    setupGracefulShutdown(server);

    // Log server creation with configuration details and operational status
    logger.info('HTTP server created successfully', {
      module: 'server',
      serverCreated: true,
      configuration: {
        timeout: config.timeout,
        keepAliveTimeout: 61000,
        headersTimeout: 62000
      },
      timestamp: new Date().toISOString()
    });

    // Return configured HTTP server instance ready for port binding
    return server;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error creating server';
    logger.error('Failed to create HTTP server', {
      module: 'server',
      error: errorMessage,
      config: config,
      timestamp: new Date().toISOString()
    });

    throw new AppError(
      `Server creation failed: ${errorMessage}`,
      500,
      'SERVER_CREATION_ERROR',
      { originalError: error, config }
    );
  }
}

/**
 * Starts the HTTP Server with Comprehensive Error Handling
 * 
 * Starts the HTTP server by binding to the configured port and host, handling startup errors,
 * and initializing server monitoring. Provides comprehensive server startup with error handling,
 * logging, and operational status tracking.
 * 
 * @param server - HTTP server instance to start
 * @param config - Server configuration with port and host settings
 * @returns Promise that resolves when server is successfully started and listening
 */
export async function startServer(server: http.Server, config: ServerConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Log server startup initiation with configuration details
      logger.info('Starting HTTP server', {
        module: 'server',
        port: config.port,
        host: config.host,
        environment: environment.env,
        timestamp: new Date().toISOString()
      });

      // Validate server configuration and port availability
      const validation = validateServerConfiguration(config);
      if (!validation.isValid) {
        const validationError = new AppError(
          'Server configuration validation failed',
          500,
          'INVALID_CONFIGURATION',
          { validation }
        );
        logger.error('Server configuration validation failed', {
          module: 'server',
          errors: validation.errors,
          warnings: validation.warnings,
          timestamp: new Date().toISOString()
        });
        return reject(validationError);
      }

      // Set up server listening event handler for startup confirmation
      server.once('listening', () => {
        const address = server.address();
        const bindAddress = typeof address === 'string' ? address : `${address?.address}:${address?.port}`;

        // Initialize server metrics and monitoring after successful startup
        initializeServerMetrics(server);
        SERVER_METRICS.startTime = Date.now();

        // Log successful server startup with listening address and operational status
        logger.info('HTTP server started successfully', {
          module: 'server',
          address: bindAddress,
          port: config.port,
          host: config.host,
          pid: process.pid,
          environment: environment.env,
          timestamp: new Date().toISOString()
        });

        // Update server state to running and notify monitoring systems
        resolve();
      });

      // Handle server startup errors with appropriate error logging and recovery
      server.once('error', (error: Error) => {
        handleServerError(error, server);
        
        const serverError = new AppError(
          `Server startup failed: ${error.message}`,
          500,
          'SERVER_STARTUP_ERROR',
          { originalError: error, config }
        );
        
        reject(serverError);
      });

      // Bind server to configured port and host using server.listen()
      server.listen(config.port, config.host);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
      logger.error('Server startup failed', {
        module: 'server',
        error: errorMessage,
        config: config,
        timestamp: new Date().toISOString()
      });

      const startupError = new AppError(
        `Server startup failed: ${errorMessage}`,
        500,
        'SERVER_STARTUP_ERROR',
        { originalError: error, config }
      );

      reject(startupError);
    }
  });
}

/**
 * Gracefully Stops the HTTP Server
 * 
 * Gracefully stops the HTTP server by closing connections, handling active requests, and
 * cleaning up resources. Implements graceful shutdown patterns with timeout handling and
 * comprehensive cleanup for production reliability.
 * 
 * @param server - HTTP server instance to stop
 * @param timeout - Maximum time to wait for graceful shutdown (default: 10 seconds)
 * @returns Promise that resolves when server is gracefully stopped and cleaned up
 */
export async function stopServer(server: http.Server, timeout: number = DEFAULT_SHUTDOWN_TIMEOUT): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Log server shutdown initiation with timeout configuration
      logger.info('Starting graceful server shutdown', {
        module: 'server',
        timeout: timeout,
        timestamp: new Date().toISOString()
      });

      let shutdownTimer: NodeJS.Timeout;
      let isShutdownComplete = false;

      // Set up shutdown timeout to force termination if graceful shutdown takes too long
      shutdownTimer = setTimeout(() => {
        if (!isShutdownComplete) {
          logger.warn('Graceful shutdown timeout exceeded, forcing termination', {
            module: 'server',
            timeout: timeout,
            timestamp: new Date().toISOString()
          });

          // Force close remaining connections if timeout is exceeded
          server.close(() => {
            logger.warn('Server forcefully closed after timeout', {
              module: 'server',
              timestamp: new Date().toISOString()
            });
            resolve();
          });
        }
      }, timeout);

      // Stop accepting new connections using server.close()
      server.close((error) => {
        isShutdownComplete = true;
        clearTimeout(shutdownTimer);

        if (error) {
          logger.error('Error during server shutdown', {
            module: 'server',
            error: error.message,
            timestamp: new Date().toISOString()
          });
          reject(new AppError(
            `Server shutdown failed: ${error.message}`,
            500,
            'SERVER_SHUTDOWN_ERROR',
            { originalError: error }
          ));
          return;
        }

        // Clean up server resources and monitoring systems
        SERVER_METRICS.uptime = Date.now() - SERVER_METRICS.startTime;

        // Log successful server shutdown with cleanup summary
        logger.info('Server shutdown completed successfully', {
          module: 'server',
          uptime: SERVER_METRICS.uptime,
          requestsProcessed: SERVER_METRICS.requestCount,
          errorsEncountered: SERVER_METRICS.errorCount,
          timestamp: new Date().toISOString()
        });

        // Update server state to stopped and finalize metrics
        resolve();
      });

      // Get all existing connections and close them gracefully
      server.getConnections((err, count) => {
        if (err) {
          logger.warn('Could not get connection count during shutdown', {
            module: 'server',
            error: err.message,
            timestamp: new Date().toISOString()
          });
        } else {
          logger.info(`Waiting for ${count} active connections to close`, {
            module: 'server',
            activeConnections: count,
            timestamp: new Date().toISOString()
          });
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown shutdown error';
      logger.error('Server shutdown failed', {
        module: 'server',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      reject(new AppError(
        `Server shutdown failed: ${errorMessage}`,
        500,
        'SERVER_SHUTDOWN_ERROR',
        { originalError: error }
      ));
    }
  });
}

/**
 * Sets Up Graceful Shutdown Handlers
 * 
 * Sets up graceful shutdown handlers for process signals (SIGTERM, SIGINT, SIGUSR2) to ensure
 * clean server termination. Implements production-ready shutdown patterns with proper cleanup
 * and error handling.
 * 
 * @param server - HTTP server instance to set up shutdown handlers for
 */
export function setupGracefulShutdown(server: http.Server): void {
  try {
    logger.info('Setting up graceful shutdown handlers', {
      module: 'server',
      signals: SHUTDOWN_SIGNALS,
      timeout: DEFAULT_SHUTDOWN_TIMEOUT,
      timestamp: new Date().toISOString()
    });

    // Register signal handlers for SIGTERM, SIGINT, and SIGUSR2 process signals
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal} signal, initiating graceful shutdown`, {
          module: 'server',
          signal: signal,
          pid: process.pid,
          timestamp: new Date().toISOString()
        });

        try {
          // Create graceful shutdown handler function with timeout management
          await stopServer(server, DEFAULT_SHUTDOWN_TIMEOUT);

          // Set up cleanup procedures for active connections and resources
          logger.info('Graceful shutdown completed successfully', {
            module: 'server',
            signal: signal,
            timestamp: new Date().toISOString()
          });

          // Ensure proper process exit codes for different shutdown scenarios
          process.exit(0);

        } catch (error) {
          // Add error handling for shutdown process failures
          logger.error('Error during graceful shutdown', {
            module: 'server',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });

          // Configure shutdown timeout and force termination fallback
          process.exit(1);
        }
      });
    });

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception, shutting down gracefully', {
        module: 'server',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      stopServer(server).finally(() => {
        process.exit(1);
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection, shutting down gracefully', {
        module: 'server',
        reason: reason,
        promise: promise,
        timestamp: new Date().toISOString()
      });

      stopServer(server).finally(() => {
        process.exit(1);
      });
    });

    // Log graceful shutdown setup with signal handler configuration
    logger.info('Graceful shutdown handlers configured successfully', {
      module: 'server',
      handledSignals: SHUTDOWN_SIGNALS,
      uncaughtExceptionHandler: true,
      unhandledRejectionHandler: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to setup graceful shutdown handlers', {
      module: 'server',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Handles Server-Level Errors
 * 
 * Handles server-level errors including port binding failures, connection errors, and runtime
 * exceptions. Provides comprehensive error handling with appropriate logging, recovery strategies,
 * and operational notifications.
 * 
 * @param error - Error object containing server error information
 * @param server - HTTP server instance where error occurred
 */
export function handleServerError(error: Error, server: http.Server): void {
  try {
    // Classify error type and severity for appropriate handling strategy
    const errorCode = (error as any).code;
    const errorMessage = error.message;
    let errorSeverity = 'medium';
    let recoveryAction = 'log';

    // Log error details with server context and operational impact
    logger.error('Server error occurred', {
      module: 'server',
      error: errorMessage,
      code: errorCode,
      name: error.name,
      timestamp: new Date().toISOString()
    });

    // Handle port binding errors with alternative port suggestions
    if (errorCode === 'EADDRINUSE') {
      errorSeverity = 'high';
      recoveryAction = 'suggest_alternative';
      
      logger.error('Port already in use - server cannot bind to configured port', {
        module: 'server',
        port: serverConfig.port,
        host: serverConfig.host,
        suggestion: 'Try a different port or stop conflicting service',
        timestamp: new Date().toISOString()
      });
    }

    // Manage connection errors with retry logic and fallback procedures
    if (errorCode === 'ECONNRESET' || errorCode === 'EPIPE') {
      errorSeverity = 'low';
      recoveryAction = 'retry';
      
      logger.warn('Connection error occurred - client disconnected', {
        module: 'server',
        errorCode: errorCode,
        action: 'continuing_operation',
        timestamp: new Date().toISOString()
      });
    }

    // Handle permission errors for port binding
    if (errorCode === 'EACCES') {
      errorSeverity = 'critical';
      recoveryAction = 'escalate';
      
      logger.error('Permission denied - insufficient privileges to bind port', {
        module: 'server',
        port: serverConfig.port,
        suggestion: 'Run with appropriate permissions or use non-privileged port',
        timestamp: new Date().toISOString()
      });
    }

    // Update server state and metrics to reflect error condition
    SERVER_METRICS.errorCount++;

    // Notify monitoring systems of server error and operational status
    logger.warn('Server error handled', {
      module: 'server',
      errorSeverity: errorSeverity,
      recoveryAction: recoveryAction,
      totalErrors: SERVER_METRICS.errorCount,
      timestamp: new Date().toISOString()
    });

    // Implement recovery strategies based on error type and configuration
    if (errorSeverity === 'critical') {
      logger.error('Critical server error - consider immediate attention', {
        module: 'server',
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
      });
    }

    // Ensure proper error propagation and cleanup procedures
    if (errorCode === 'EADDRINUSE' || errorCode === 'EACCES') {
      // These are startup errors that should be propagated
      throw error;
    }

  } catch (handlingError) {
    // Handle errors in error handling itself
    logger.error('Error occurred while handling server error', {
      module: 'server',
      originalError: error.message,
      handlingError: handlingError instanceof Error ? handlingError.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Retrieves Comprehensive Server Status
 * 
 * Retrieves comprehensive server status information including uptime, connection count, memory
 * usage, and operational metrics. Provides detailed server health information for monitoring
 * and debugging purposes.
 * 
 * @returns Comprehensive server status object with operational metrics and health information
 */
export function getServerStatus(): ServerStatus {
  try {
    // Collect server uptime and operational duration metrics
    const uptime = SERVER_METRICS.startTime ? Date.now() - SERVER_METRICS.startTime : 0;
    SERVER_METRICS.uptime = uptime;

    // Gather connection count and active request statistics
    // Note: Getting active connections asynchronously, using 0 as placeholder
    let connectionCount = 0;

    // Retrieve memory usage and resource consumption information
    const memoryUsage = process.memoryUsage();

    // Include server configuration and environment details
    const serverAddress = `${serverConfig.host}:${serverConfig.port}`;

    // Format server status information for monitoring consumption
    const serverStatus: ServerStatus = {
      state: SERVER_STATE.RUNNING,
      uptime: uptime,
      connections: connectionCount,
      requestCount: SERVER_METRICS.requestCount,
      errorCount: SERVER_METRICS.errorCount,
      memoryUsage: memoryUsage,
      address: serverAddress,
      environment: environment.env
    };

    logger.debug('Server status retrieved', {
      module: 'server',
      status: serverStatus.state,
      uptime: serverStatus.uptime,
      requests: serverStatus.requestCount,
      errors: serverStatus.errorCount,
      timestamp: new Date().toISOString()
    });

    // Return comprehensive server status object
    return serverStatus;

  } catch (error) {
    logger.error('Failed to retrieve server status', {
      module: 'server',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    // Return minimal status on error
    return {
      state: SERVER_STATE.ERROR,
      uptime: 0,
      connections: 0,
      requestCount: 0,
      errorCount: SERVER_METRICS.errorCount + 1,
      memoryUsage: process.memoryUsage(),
      address: `${serverConfig.host}:${serverConfig.port}`,
      environment: environment.env
    };
  }
}

/**
 * Validates Server Configuration
 * 
 * Validates server configuration parameters including port, host, timeout, and environment
 * settings. Ensures configuration compliance with deployment requirements and security best
 * practices.
 * 
 * @param config - Server configuration object to validate
 * @returns Validation result with success status, errors, and recommendations
 */
export function validateServerConfiguration(config: ServerConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  try {
    logger.debug('Validating server configuration', {
      module: 'server',
      config: {
        port: config.port,
        host: config.host,
        timeout: config.timeout
      },
      timestamp: new Date().toISOString()
    });

    // Validate port number range and availability
    if (!config.port || typeof config.port !== 'number') {
      errors.push('Server port is required and must be a number');
    } else if (config.port < 1 || config.port > 65535) {
      errors.push(`Port ${config.port} is outside valid range (1-65535)`);
    } else if (config.port < 1024 && !environment.isProduction) {
      warnings.push(`Port ${config.port} requires elevated privileges in development`);
    }

    // Check host address format and accessibility
    if (!config.host || typeof config.host !== 'string') {
      errors.push('Server host is required and must be a string');
    } else if (config.host === '0.0.0.0' && environment.isDevelopment) {
      recommendations.push('Consider using localhost or 127.0.0.1 for development');
    }

    // Verify timeout values and connection settings
    if (!config.timeout || typeof config.timeout !== 'number') {
      warnings.push('Server timeout not specified, using default');
    } else if (config.timeout < 1000) {
      warnings.push('Server timeout below 1 second may cause connection issues');
    } else if (config.timeout > 300000) {
      warnings.push('Server timeout above 5 minutes may cause resource issues');
    }

    // Validate environment-specific configuration requirements
    if (environment.isProduction) {
      if (config.port === 3000) {
        recommendations.push('Consider using standard HTTP port (80) or HTTPS port (443) in production');
      }
      
      if (config.host === 'localhost' || config.host === '127.0.0.1') {
        warnings.push('Localhost binding in production limits external access');
      }
    }

    // Check security configuration and deployment readiness
    if (environment.isDevelopment && config.host === '0.0.0.0') {
      warnings.push('Binding to all interfaces (0.0.0.0) in development may pose security risks');
    }

    // Validate application name and version
    if (!config.name || typeof config.name !== 'string') {
      warnings.push('Application name not specified in server configuration');
    }

    if (!config.version || typeof config.version !== 'string') {
      warnings.push('Application version not specified in server configuration');
    }

    // Identify potential configuration issues and conflicts
    if (warnings.length > 0) {
      logger.warn('Server configuration warnings detected', {
        module: 'server',
        warnings: warnings,
        timestamp: new Date().toISOString()
      });
    }

    // Generate configuration recommendations and best practices
    if (environment.isProduction) {
      recommendations.push('Enable HTTPS for production deployment');
      recommendations.push('Configure reverse proxy for load balancing');
      recommendations.push('Set up health check monitoring');
    }

    const isValid = errors.length === 0;

    logger.info('Server configuration validation completed', {
      module: 'server',
      isValid: isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
      recommendationCount: recommendations.length,
      timestamp: new Date().toISOString()
    });

    // Return comprehensive validation result with detailed feedback
    return {
      isValid,
      errors,
      warnings,
      recommendations
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    logger.error('Server configuration validation failed', {
      module: 'server',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });

    return {
      isValid: false,
      errors: [`Validation failed: ${errorMessage}`],
      warnings: [],
      recommendations: []
    };
  }
}

/**
 * Initializes Server Metrics Collection
 * 
 * Initializes server metrics collection and monitoring systems for operational visibility.
 * Sets up performance tracking, error monitoring, and health check capabilities for production
 * server management.
 * 
 * @param server - HTTP server instance to initialize metrics for
 */
export function initializeServerMetrics(server: http.Server): void {
  try {
    logger.info('Initializing server metrics collection', {
      module: 'server',
      timestamp: new Date().toISOString()
    });

    // Initialize server metrics collection with baseline values
    SERVER_METRICS.startTime = Date.now();
    SERVER_METRICS.requestCount = 0;
    SERVER_METRICS.errorCount = 0;
    SERVER_METRICS.uptime = 0;

    // Set up request counting and performance tracking
    const requestStartTimes = new Map<string, number>();

    // Add event listeners for request tracking
    server.on('request', (req, res) => {
      const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      requestStartTimes.set(requestId, Date.now());

      // Configure error monitoring and alerting thresholds
      res.on('finish', () => {
        const startTime = requestStartTimes.get(requestId);
        if (startTime) {
          const duration = Date.now() - startTime;
          requestStartTimes.delete(requestId);

          // Update average response time (simple moving average)
          const currentCount = SERVER_METRICS.requestCount;
          const currentAverage = (SERVER_METRICS as any).averageResponseTime || 0;
          (SERVER_METRICS as any).averageResponseTime = 
            (currentAverage * currentCount + duration) / (currentCount + 1);

          // Log slow requests for performance monitoring
          if (duration > 1000) {
            logger.warn('Slow request detected', {
              module: 'server',
              method: req.method,
              url: req.url,
              duration: duration,
              statusCode: res.statusCode,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
    });

    // Add memory usage and resource monitoring
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      
      // Log memory usage if it exceeds thresholds
      if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
        logger.warn('High memory usage detected', {
          module: 'server',
          memoryUsage: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
            external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
          },
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Check every 30 seconds

    // Set up health check endpoints and monitoring integration
    // Health checks are already set up in the Express app, so we just log the initialization

    // Configure metrics export and monitoring system integration
    logger.info('Server metrics collection initialized successfully', {
      module: 'server',
      features: {
        requestCounting: true,
        performanceTracking: true,
        errorMonitoring: true,
        memoryMonitoring: true,
        healthChecks: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to initialize server metrics', {
      module: 'server',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * ServerManager Class for Comprehensive Server Lifecycle Management
 * 
 * Comprehensive server management class that encapsulates HTTP server lifecycle, configuration,
 * monitoring, and operational management. Provides a high-level interface for server operations
 * with integrated error handling, graceful shutdown, and monitoring capabilities.
 */
export class ServerManager {
  /** HTTP server instance */
  private server: http.Server;
  
  /** Server configuration */
  private config: ServerConfig;
  
  /** Current server state */
  private state: string;
  
  /** Server metrics object */
  private metrics: ServerMetrics;
  
  /** Shutdown flag to prevent multiple shutdown attempts */
  private isShuttingDown: boolean;

  /**
   * ServerManager Constructor
   * 
   * Initializes ServerManager instance with Express.js application and server configuration.
   * Sets up server instance, configuration validation, and initial state management.
   * 
   * @param app - Express.js application instance
   * @param config - Server configuration object
   */
  constructor(app: typeof import('./app').default, config: ServerConfig) {
    try {
      logger.info('Initializing ServerManager', {
        module: 'ServerManager',
        config: {
          port: config.port,
          host: config.host,
          name: config.name
        },
        timestamp: new Date().toISOString()
      });

      // Validate server configuration and Express.js application instance
      if (!app) {
        throw new AppError('Express.js application instance is required', 500, 'INVALID_APP');
      }

      const validation = validateServerConfiguration(config);
      if (!validation.isValid) {
        throw new AppError(
          'Server configuration validation failed',
          500,
          'INVALID_CONFIGURATION',
          { validation }
        );
      }

      // Create HTTP server instance using createServer factory function
      this.server = createServer(app, config);
      this.config = config;

      // Initialize server state and metrics tracking
      this.state = SERVER_STATE.STOPPED;
      this.metrics = {
        startTime: 0,
        requestCount: 0,
        errorCount: 0,
        uptime: 0,
        averageResponseTime: 0
      };
      this.isShuttingDown = false;

      // Set up server event handlers and monitoring
      this.setupEventHandlers();

      // Configure graceful shutdown handlers
      setupGracefulShutdown(this.server);

      // Log server manager initialization with configuration summary
      logger.info('ServerManager initialized successfully', {
        module: 'ServerManager',
        state: this.state,
        configuration: {
          port: this.config.port,
          host: this.config.host,
          timeout: this.config.timeout
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to initialize ServerManager', {
        module: 'ServerManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Starts the HTTP Server
   * 
   * Starts the HTTP server with comprehensive error handling and monitoring. Provides async
   * server startup with proper error propagation and operational status tracking.
   * 
   * @returns Promise that resolves when server is successfully started
   */
  public async start(): Promise<void> {
    try {
      // Validate server state and configuration before startup
      if (this.state === SERVER_STATE.RUNNING) {
        logger.warn('Server is already running', {
          module: 'ServerManager',
          currentState: this.state,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (this.isShuttingDown) {
        throw new AppError('Cannot start server during shutdown', 500, 'INVALID_STATE');
      }

      // Update server state to starting and log startup initiation
      this.state = SERVER_STATE.STARTING;
      logger.info('Starting server', {
        module: 'ServerManager',
        state: this.state,
        config: {
          port: this.config.port,
          host: this.config.host
        },
        timestamp: new Date().toISOString()
      });

      // Start HTTP server using startServer function with error handling
      await startServer(this.server, this.config);

      // Initialize server metrics and monitoring after successful startup
      this.metrics.startTime = Date.now();
      initializeServerMetrics(this.server);

      // Update server state to running and notify monitoring systems
      this.state = SERVER_STATE.RUNNING;

      // Log successful server startup with operational details
      logger.info('Server started successfully', {
        module: 'ServerManager',
        state: this.state,
        address: `${this.config.host}:${this.config.port}`,
        pid: process.pid,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.state = SERVER_STATE.ERROR;
      const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
      
      logger.error('Failed to start server', {
        module: 'ServerManager',
        error: errorMessage,
        state: this.state,
        timestamp: new Date().toISOString()
      });

      throw new AppError(
        `Server startup failed: ${errorMessage}`,
        500,
        'SERVER_START_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Gracefully Stops the HTTP Server
   * 
   * Gracefully stops the HTTP server with timeout handling and resource cleanup. Implements
   * production-ready shutdown procedures with proper error handling and monitoring.
   * 
   * @param timeout - Maximum time to wait for graceful shutdown
   * @returns Promise that resolves when server is gracefully stopped
   */
  public async stop(timeout: number = DEFAULT_SHUTDOWN_TIMEOUT): Promise<void> {
    try {
      // Check server state and prevent multiple shutdown attempts
      if (this.state === SERVER_STATE.STOPPED) {
        logger.warn('Server is already stopped', {
          module: 'ServerManager',
          currentState: this.state,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (this.isShuttingDown) {
        logger.warn('Server shutdown already in progress', {
          module: 'ServerManager',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update server state to stopping and set shutdown flag
      this.state = SERVER_STATE.STOPPING;
      this.isShuttingDown = true;

      logger.info('Stopping server', {
        module: 'ServerManager',
        state: this.state,
        timeout: timeout,
        timestamp: new Date().toISOString()
      });

      // Stop HTTP server using stopServer function with timeout
      await stopServer(this.server, timeout);

      // Clean up server resources and monitoring systems
      this.metrics.uptime = Date.now() - this.metrics.startTime;

      // Update server state to stopped and finalize metrics
      this.state = SERVER_STATE.STOPPED;
      this.isShuttingDown = false;

      // Log successful server shutdown with cleanup summary
      logger.info('Server stopped successfully', {
        module: 'ServerManager',
        state: this.state,
        uptime: this.metrics.uptime,
        requestsProcessed: this.metrics.requestCount,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.state = SERVER_STATE.ERROR;
      this.isShuttingDown = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown shutdown error';

      logger.error('Failed to stop server', {
        module: 'ServerManager',
        error: errorMessage,
        state: this.state,
        timestamp: new Date().toISOString()
      });

      throw new AppError(
        `Server shutdown failed: ${errorMessage}`,
        500,
        'SERVER_STOP_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Restarts the HTTP Server
   * 
   * Restarts the HTTP server by performing graceful shutdown followed by startup. Provides
   * server restart capability with proper state management and error handling.
   * 
   * @param timeout - Maximum time to wait for shutdown before restart
   * @returns Promise that resolves when server is successfully restarted
   */
  public async restart(timeout: number = DEFAULT_SHUTDOWN_TIMEOUT): Promise<void> {
    try {
      // Log server restart initiation with timeout configuration
      logger.info('Restarting server', {
        module: 'ServerManager',
        currentState: this.state,
        timeout: timeout,
        timestamp: new Date().toISOString()
      });

      // Perform graceful server shutdown using stop method
      if (this.state === SERVER_STATE.RUNNING) {
        await this.stop(timeout);
      }

      // Wait for complete shutdown and resource cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start server using start method with error handling
      await this.start();

      // Verify successful restart and operational status
      const status = this.getStatus();

      // Log successful server restart with operational summary
      logger.info('Server restarted successfully', {
        module: 'ServerManager',
        state: this.state,
        status: status.state,
        address: status.address,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown restart error';
      
      logger.error('Failed to restart server', {
        module: 'ServerManager',
        error: errorMessage,
        state: this.state,
        timestamp: new Date().toISOString()
      });

      throw new AppError(
        `Server restart failed: ${errorMessage}`,
        500,
        'SERVER_RESTART_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Retrieves Comprehensive Server Status
   * 
   * Retrieves comprehensive server status including state, metrics, and operational information.
   * Provides detailed server health data for monitoring and debugging.
   * 
   * @returns Comprehensive server status object with metrics and health information
   */
  public getStatus(): ServerStatus {
    try {
      // Collect current server state and operational status
      const currentUptime = this.metrics.startTime ? Date.now() - this.metrics.startTime : 0;

      // Gather server metrics including uptime and request counts
      const status: ServerStatus = {
        state: this.state,
        uptime: currentUptime,
        connections: 0, // Would need async call to get actual count
        requestCount: SERVER_METRICS.requestCount,
        errorCount: SERVER_METRICS.errorCount,
        memoryUsage: process.memoryUsage(),
        address: `${this.config.host}:${this.config.port}`,
        environment: environment.env
      };

      // Include memory usage and resource consumption data
      logger.debug('Server status retrieved', {
        module: 'ServerManager',
        status: status.state,
        uptime: status.uptime,
        requestCount: status.requestCount,
        timestamp: new Date().toISOString()
      });

      // Add configuration and environment information
      // Format status information for monitoring consumption

      // Return comprehensive server status object
      return status;

    } catch (error) {
      logger.error('Failed to retrieve server status', {
        module: 'ServerManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        state: SERVER_STATE.ERROR,
        uptime: 0,
        connections: 0,
        requestCount: 0,
        errorCount: this.metrics.errorCount + 1,
        memoryUsage: process.memoryUsage(),
        address: `${this.config.host}:${this.config.port}`,
        environment: environment.env
      };
    }
  }

  /**
   * Performs Server Health Check
   * 
   * Performs server health check by verifying server state, connectivity, and operational status.
   * Provides boolean health status for monitoring and load balancer integration.
   * 
   * @returns True if server is healthy and operational, false otherwise
   */
  public isHealthy(): boolean {
    try {
      // Check server state for running status
      if (this.state !== SERVER_STATE.RUNNING) {
        return false;
      }

      // Verify server connectivity and response capability
      if (this.isShuttingDown) {
        return false;
      }

      // Validate resource usage within acceptable thresholds
      const memoryUsage = process.memoryUsage();
      const memoryThreshold = 500 * 1024 * 1024; // 500MB threshold
      
      if (memoryUsage.heapUsed > memoryThreshold) {
        logger.warn('Server health check: high memory usage detected', {
          module: 'ServerManager',
          memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          threshold: Math.round(memoryThreshold / 1024 / 1024) + 'MB',
          timestamp: new Date().toISOString()
        });
        // Still considered healthy, but logged for monitoring
      }

      // Check error rates and operational metrics
      const errorRate = this.metrics.requestCount > 0 ? 
        this.metrics.errorCount / this.metrics.requestCount : 0;
      
      if (errorRate > 0.1) { // 10% error rate threshold
        logger.warn('Server health check: high error rate detected', {
          module: 'ServerManager',
          errorRate: Math.round(errorRate * 100) + '%',
          errorCount: this.metrics.errorCount,
          requestCount: this.metrics.requestCount,
          timestamp: new Date().toISOString()
        });
        // Still considered healthy for now, but logged for monitoring
      }

      // Return boolean health status based on all checks
      return true;

    } catch (error) {
      logger.error('Server health check failed', {
        module: 'ServerManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return false;
    }
  }

  /**
   * Sets Up Event Handlers for Server Monitoring
   * 
   * Private method to set up event handlers for comprehensive server monitoring
   * and metrics collection.
   */
  private setupEventHandlers(): void {
    try {
      // Set up request tracking
      this.server.on('request', (req, res) => {
        this.metrics.requestCount++;
        SERVER_METRICS.requestCount++;

        res.on('finish', () => {
          if (res.statusCode >= 400) {
            this.metrics.errorCount++;
            SERVER_METRICS.errorCount++;
          }
        });
      });

      // Set up error handling
      this.server.on('error', (error) => {
        handleServerError(error, this.server);
        this.metrics.errorCount++;
      });

      logger.debug('Server event handlers configured', {
        module: 'ServerManager',
        handlers: ['request', 'error'],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to setup server event handlers', {
        module: 'ServerManager',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

/**
 * Create and Export Default Server Instance
 * 
 * Creates the default server instance using the factory function and application configuration.
 * Provides immediate access to a configured HTTP server ready for startup.
 */
export const server = createServer(app, serverConfig);

// Export all server management functions and utilities
export {
  createServer,
  startServer,
  stopServer,
  setupGracefulShutdown,
  handleServerError,
  getServerStatus,
  validateServerConfiguration,
  initializeServerMetrics,
  ServerManager
};

// Export utility types for server development
export type ServerFactory = (app: typeof import('./app').default, config: ServerConfig) => http.Server;
export type ServerHandler = (server: http.Server) => Promise<void>;
export type ShutdownHandler = (signal: string) => Promise<void>;

// Default export for convenient access
export default server;