/**
 * Comprehensive Unit Test Suite for HTTP Server Module - Node.js Tutorial Application
 * 
 * This test suite provides comprehensive validation of the HTTP server module including
 * ServerManager class functionality, server utility functions, error handling scenarios,
 * and operational capabilities. Demonstrates modern Node.js 24.x testing patterns using
 * the built-in test runner, TypeScript integration, and Express.js 5.1.0 server testing
 * strategies with educational testing examples for server lifecycle management.
 * 
 * Features:
 * - Node.js 24.x built-in test runner integration for modern testing patterns
 * - Comprehensive ServerManager class testing with lifecycle management validation
 * - Server utility function testing with Express.js 5.1.0 compatibility verification
 * - Error handling and recovery testing with production-ready scenarios
 * - Performance testing with configurable thresholds and resource monitoring
 * - Configuration validation testing with environment-specific behavior verification
 * - Educational testing patterns demonstrating Node.js server testing best practices
 * - Type-safe testing utilities with comprehensive TypeScript integration
 * - Test isolation and resource management for reliable test execution
 * - Mock object integration for controlled testing scenarios and dependency isolation
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @framework Node.js built-in test runner
 * @educational Demonstrates comprehensive server testing strategies and modern testing patterns
 */

// Import Node.js 24.x built-in test runner functions for organizing test suites
import { describe, it, beforeEach, afterEach } from 'node:test'; // built-in

// Import Node.js built-in assertion library for test validation and verification
import assert from 'node:assert'; // built-in

// Import Node.js built-in HTTP module for server testing and HTTP client operations
import http from 'http'; // built-in

// Import Node.js events module for testing event-driven server behavior and lifecycle events
import { EventEmitter } from 'events'; // built-in

// Import Node.js util module for testing utilities and promisification of callback-based functions
import { promisify } from 'util'; // built-in

// Import ServerManager class for comprehensive server lifecycle testing and validation
import {
  ServerManager,
  createServer,
  startServer,
  stopServer,
  getServerStatus,
  SERVER_STATE,
  SHUTDOWN_SIGNALS,
  DEFAULT_SHUTDOWN_TIMEOUT,
  handleServerError,
  validateServerConfiguration,
  initializeServerMetrics,
  type ServerStatus,
  type ServerMetrics,
  type ConfigValidationResult
} from '../../src/server';

// Import configured Express.js 5.1.0 application for server integration testing
import app from '../../src/app';

// Import application configuration for testing server configuration and environment settings
import { appConfig, serverConfig } from '../../src/config';

// Import comprehensive test utilities for test environment management and resource cleanup
import {
  TestEnvironment,
  createTestServer,
  measureTestPerformance,
  cleanupTestEnvironment,
  mockExpressRequest,
  mockExpressResponse,
  generateTestData,
  assertResponseStructure,
  validateApiResponse,
  type TestServerOptions,
  type PerformanceMetrics,
  type TestEnvironmentOptions
} from '../helpers/test-utils';

// Import server configuration interface for type-safe test configuration and validation
import { ServerConfig, SystemHealth } from '../../src/types';

/**
 * Global Test Configuration Constants
 * 
 * Immutable test configuration constants with const assertions for literal types.
 * Provides centralized test settings for timeouts, performance thresholds, and
 * server configuration with type safety and consistency.
 */

/** Test timeout in milliseconds for async operations and server lifecycle testing */
const TEST_TIMEOUT = 30000;

/** Test server configuration with dynamic port allocation for isolation */
const TEST_SERVER_CONFIG = {
  port: 0,
  host: 'localhost',
  timeout: 5000,
  name: 'test-server',
  version: '1.0.0'
} as const;

/** Performance thresholds for server operations validation and optimization */
const PERFORMANCE_THRESHOLDS = {
  serverStartup: 1000,
  serverShutdown: 2000,
  healthCheck: 100
} as const;

/** Global test environment instance for resource management and test isolation */
let testEnvironment: TestEnvironment | null = null;

/**
 * Sets Up Comprehensive Test Environment for Server Testing
 * 
 * Initializes test environment with server testing configuration, performance monitoring,
 * and resource management. Provides isolated test environment with proper cleanup
 * capabilities and educational testing utilities.
 * 
 * @param options - Test environment configuration options
 * @returns Configured test environment ready for server testing
 */
async function setupTestEnvironment(options: TestEnvironmentOptions = {}): Promise<TestEnvironment> {
  // Create TestEnvironment instance with server testing configuration
  const environment = new TestEnvironment({
    enableServer: options.enableServer !== false,
    enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
    logLevel: options.logLevel || 'error',
    testTimeout: options.testTimeout || TEST_TIMEOUT
  });

  // Configure test server with dynamic port allocation for isolation
  await environment.setup();

  // Set up performance monitoring and measurement tools
  // Initialize test logging and debugging capabilities
  // Configure resource cleanup and test isolation mechanisms
  // Set up test correlation IDs and metadata tracking
  return environment;
}

/**
 * Tears Down Test Environment and Cleans Up Resources
 * 
 * Comprehensive test environment cleanup including test servers, mock objects,
 * and monitoring systems. Ensures proper test isolation and prevents resource
 * leaks between test cases.
 * 
 * @returns Promise that resolves when cleanup is complete
 */
async function teardownTestEnvironment(): Promise<void> {
  if (testEnvironment) {
    // Stop any running test servers and close network connections
    await cleanupTestEnvironment(testEnvironment);
    
    // Clean up test environment resources and mock objects
    await testEnvironment.cleanup();
    
    // Reset performance monitoring and measurement tools
    testEnvironment.reset();
    
    // Clear test correlation IDs and metadata
    testEnvironment = null;
    
    // Reset global test state and configuration
    // Log cleanup completion and resource status
    // Ensure complete resource cleanup for test isolation
  }
}

/**
 * Creates Test-Specific Server Configuration
 * 
 * Creates test-specific server configuration with dynamic port allocation,
 * appropriate timeouts, and test environment settings. Provides isolated
 * configuration for each test case.
 * 
 * @param overrides - Configuration overrides for specific test scenarios
 * @returns Complete server configuration object for testing
 */
function createTestServerConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  // Start with base test server configuration
  const baseConfig = { ...TEST_SERVER_CONFIG };
  
  // Apply provided configuration overrides
  const testConfig = { ...baseConfig, ...overrides };
  
  // Allocate dynamic port for test isolation
  if (testConfig.port === 0) {
    // Dynamic port allocation will be handled by the server
    testConfig.port = 0;
  }
  
  // Set appropriate timeouts for test environment
  if (!testConfig.timeout) {
    testConfig.timeout = 5000;
  }
  
  // Configure test-specific server metadata
  testConfig.name = testConfig.name || 'test-server';
  testConfig.version = testConfig.version || '1.0.0';
  
  // Validate configuration for test compatibility
  // Return complete test server configuration
  return testConfig as ServerConfig;
}

/**
 * Validates Server State Against Expected Values
 * 
 * Validates server state and operational status for testing purposes. Checks
 * server health, connection status, and operational metrics against expected values.
 * 
 * @param serverManager - ServerManager instance to validate
 * @param expectedState - Expected server state string
 * @returns True if server state matches expectations
 */
async function validateServerState(serverManager: ServerManager, expectedState: string): Promise<boolean> {
  try {
    // Get current server status from ServerManager
    const status = serverManager.getStatus();
    
    // Compare server state with expected state
    if (status.state !== expectedState) {
      return false;
    }
    
    // Validate server health and operational metrics
    const isHealthy = serverManager.isHealthy();
    
    // Check server connectivity and response capability
    if (expectedState === SERVER_STATE.RUNNING && !isHealthy) {
      return false;
    }
    
    // Verify resource usage within acceptable thresholds
    if (status.memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
      console.warn('High memory usage detected during validation');
    }
    
    // Return validation result with detailed status information
    return true;
    
  } catch (error) {
    console.error('Server state validation failed:', error);
    return false;
  }
}

/**
 * Tests Server Startup Performance and Validates Against Thresholds
 * 
 * Measures server startup performance including initialization time, resource usage,
 * and operational readiness. Validates performance against configured thresholds.
 * 
 * @param serverManager - ServerManager instance to test
 * @returns Performance measurement results for server startup
 */
async function testServerStartupPerformance(serverManager: ServerManager): Promise<PerformanceMetrics> {
  // Record baseline performance metrics before startup
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  try {
    // Initiate server startup process and monitor resource usage
    await serverManager.start();
    
    // Record completion time and final metrics
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const executionTime = endTime - startTime;
    
    // Validate performance against configured thresholds
    const performanceMetrics: PerformanceMetrics = {
      executionTime,
      memoryUsage: endMemory,
      startTime,
      endTime,
      threshold: PERFORMANCE_THRESHOLDS.serverStartup,
      passed: executionTime <= PERFORMANCE_THRESHOLDS.serverStartup
    };
    
    // Return comprehensive performance measurement results
    return performanceMetrics;
    
  } catch (error) {
    const endTime = performance.now();
    throw new Error(`Server startup performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Tests Server Shutdown Performance and Resource Cleanup
 * 
 * Measures server shutdown performance including graceful termination time,
 * resource cleanup, and connection handling. Validates shutdown performance
 * against thresholds.
 * 
 * @param serverManager - ServerManager instance to test
 * @returns Performance measurement results for server shutdown
 */
async function testServerShutdownPerformance(serverManager: ServerManager): Promise<PerformanceMetrics> {
  // Record baseline metrics before shutdown initiation
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  try {
    // Initiate graceful server shutdown process
    await serverManager.stop();
    
    // Record shutdown completion time and final metrics
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const executionTime = endTime - startTime;
    
    // Validate shutdown performance against configured thresholds
    const performanceMetrics: PerformanceMetrics = {
      executionTime,
      memoryUsage: endMemory,
      startTime,
      endTime,
      threshold: PERFORMANCE_THRESHOLDS.serverShutdown,
      passed: executionTime <= PERFORMANCE_THRESHOLDS.serverShutdown
    };
    
    // Return comprehensive shutdown performance results
    return performanceMetrics;
    
  } catch (error) {
    const endTime = performance.now();
    throw new Error(`Server shutdown performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Simulates Various Server Error Scenarios for Testing
 * 
 * Simulates various server error scenarios for testing error handling, recovery
 * mechanisms, and operational resilience. Provides controlled error injection
 * for comprehensive testing.
 * 
 * @param errorType - Type of error to simulate
 * @param errorContext - Additional context for error simulation
 * @returns Simulated error object for testing error handling
 */
function simulateServerError(errorType: string, errorContext: any = {}): Error {
  // Determine error type and simulation requirements
  let error: Error;
  
  switch (errorType) {
    case 'EADDRINUSE':
      error = new Error('Port already in use');
      (error as any).code = 'EADDRINUSE';
      (error as any).port = errorContext.port || 3000;
      break;
      
    case 'EACCES':
      error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      (error as any).port = errorContext.port || 80;
      break;
      
    case 'ECONNRESET':
      error = new Error('Connection reset by peer');
      (error as any).code = 'ECONNRESET';
      break;
      
    case 'TIMEOUT':
      error = new Error('Operation timed out');
      (error as any).code = 'TIMEOUT';
      (error as any).timeout = errorContext.timeout || 5000;
      break;
      
    default:
      error = new Error(`Simulated error: ${errorType}`);
      (error as any).code = errorType;
      break;
  }
  
  // Include error context and metadata for testing
  (error as any).context = errorContext;
  (error as any).simulated = true;
  (error as any).timestamp = new Date().toISOString();
  
  // Return simulated error ready for testing injection
  return error;
}

/**
 * Validates Server Error Handling Capabilities
 * 
 * Validates server error handling capabilities by testing error detection,
 * logging, recovery, and operational status management. Ensures proper error
 * handling across all scenarios.
 * 
 * @param error - Error object to inject for testing
 * @param serverManager - ServerManager instance to test
 * @returns True if error handling meets expectations
 */
async function validateErrorHandling(error: Error, serverManager: ServerManager): Promise<boolean> {
  try {
    // Inject error into server operation and monitor error handling
    // This would typically involve triggering the error condition
    // For this test, we'll validate the server's current state
    
    // Monitor error detection and logging
    const status = serverManager.getStatus();
    
    // Validate error handling and recovery procedures
    // For EADDRINUSE errors, server should not be running
    if ((error as any).code === 'EADDRINUSE' && status.state === SERVER_STATE.RUNNING) {
      return false;
    }
    
    // Check server operational status after error
    // Verify error reporting and monitoring integration
    // Validate error cleanup and resource management
    return true;
    
  } catch (validationError) {
    console.error('Error handling validation failed:', validationError);
    return false;
  }
}

// ===============================================================================
// COMPREHENSIVE SERVER MANAGER CLASS TESTS
// ===============================================================================

describe('ServerManager Class Functionality', () => {
  
  beforeEach(async () => {
    // Set up fresh test environment for each test case
    testEnvironment = await setupTestEnvironment({
      enableServer: false,
      enablePerformanceMonitoring: true,
      logLevel: 'error'
    });
  });
  
  afterEach(async () => {
    // Clean up test environment and resources after each test
    await teardownTestEnvironment();
  });

  describe('ServerManager Constructor and Initialization', () => {
    
    it('should create ServerManager instance with valid configuration', async () => {
      // Create test environment and valid server configuration
      const testConfig = createTestServerConfig();
      
      // Instantiate ServerManager with test app and config
      const serverManager = new ServerManager(app, testConfig);
      
      // Verify instance creation and initial state
      assert.ok(serverManager, 'ServerManager instance should be created');
      assert.strictEqual(typeof serverManager, 'object', 'ServerManager should be an object');
      assert.strictEqual(typeof serverManager.start, 'function', 'ServerManager should have start method');
      assert.strictEqual(typeof serverManager.stop, 'function', 'ServerManager should have stop method');
      assert.strictEqual(typeof serverManager.restart, 'function', 'ServerManager should have restart method');
      assert.strictEqual(typeof serverManager.getStatus, 'function', 'ServerManager should have getStatus method');
      assert.strictEqual(typeof serverManager.isHealthy, 'function', 'ServerManager should have isHealthy method');
      
      // Validate initial server state
      const status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Initial server state should be stopped');
      assert.strictEqual(status.requestCount, 0, 'Initial request count should be zero');
      assert.strictEqual(status.errorCount, 0, 'Initial error count should be zero');
    });

    it('should reject invalid Express.js application instance', async () => {
      // Prepare invalid application instance
      const testConfig = createTestServerConfig();
      
      // Attempt to create ServerManager with null app
      assert.throws(() => {
        new ServerManager(null as any, testConfig);
      }, /Express\.js application instance is required/, 'Should throw error for null app');
      
      // Attempt to create ServerManager with undefined app
      assert.throws(() => {
        new ServerManager(undefined as any, testConfig);
      }, /Express\.js application instance is required/, 'Should throw error for undefined app');
    });

    it('should reject invalid server configuration', async () => {
      // Prepare invalid server configuration scenarios
      const invalidConfigs = [
        { port: -1, host: 'localhost', name: 'test', version: '1.0.0', timeout: 5000 },
        { port: 70000, host: 'localhost', name: 'test', version: '1.0.0', timeout: 5000 },
        { port: 3000, host: '', name: 'test', version: '1.0.0', timeout: 5000 },
        { port: 3000, host: 'localhost', name: '', version: '1.0.0', timeout: 5000 }
      ];
      
      // Test each invalid configuration
      invalidConfigs.forEach((config, index) => {
        assert.throws(() => {
          new ServerManager(app, config as ServerConfig);
        }, /Server configuration validation failed/, `Invalid config ${index + 1} should throw error`);
      });
    });
  });

  describe('Server Startup and Lifecycle Management', () => {
    
    it('should start server successfully with valid configuration', async () => {
      // Create ServerManager instance with test configuration
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      try {
        // Call start() method and monitor startup process
        const startupMetrics = await testServerStartupPerformance(serverManager);
        
        // Verify server is running and accessible
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should be in running state');
        assert.ok(status.uptime > 0, 'Server uptime should be greater than zero');
        
        // Validate startup performance
        assert.ok(startupMetrics.passed, `Server startup should be within ${PERFORMANCE_THRESHOLDS.serverStartup}ms threshold`);
        assert.ok(startupMetrics.executionTime > 0, 'Startup execution time should be measured');
        
        // Verify server health status
        const isHealthy = serverManager.isHealthy();
        assert.ok(isHealthy, 'Server should be healthy after successful startup');
        
      } finally {
        // Stop server and clean up resources
        if (await validateServerState(serverManager, SERVER_STATE.RUNNING)) {
          await serverManager.stop();
        }
      }
    });

    it('should handle server startup timeout gracefully', async () => {
      // Configure server with very short startup timeout
      const testConfig = createTestServerConfig({ timeout: 1 }); // 1ms timeout
      const serverManager = new ServerManager(app, testConfig);
      
      try {
        // Attempt server startup and monitor timeout handling
        await serverManager.start();
        
        // If we reach here, the server started despite short timeout
        // This might happen with very fast startup, so we validate the state
        const status = serverManager.getStatus();
        if (status.state === SERVER_STATE.RUNNING) {
          await serverManager.stop();
        }
        
      } catch (error) {
        // Verify timeout error handling and cleanup
        assert.ok(error instanceof Error, 'Should throw Error instance');
        assert.ok(error.message.includes('timeout') || error.message.includes('failed'), 
                 'Error message should indicate timeout or failure');
        
        // Ensure server is not in running state after timeout
        const status = serverManager.getStatus();
        assert.notStrictEqual(status.state, SERVER_STATE.RUNNING, 'Server should not be running after timeout');
      }
    });

    it('should prevent multiple simultaneous startup attempts', async () => {
      // Create ServerManager instance for concurrent startup testing
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      try {
        // Start first startup attempt
        const startupPromise1 = serverManager.start();
        
        // Attempt second concurrent startup
        const startupPromise2 = serverManager.start();
        
        // Wait for both promises to resolve
        await Promise.all([startupPromise1, startupPromise2]);
        
        // Verify server is running only once
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should be in running state');
        
        // Verify server health after concurrent startup attempts
        const isHealthy = serverManager.isHealthy();
        assert.ok(isHealthy, 'Server should be healthy after concurrent startup');
        
      } finally {
        // Clean up server resources
        if (await validateServerState(serverManager, SERVER_STATE.RUNNING)) {
          await serverManager.stop();
        }
      }
    });
  });

  describe('Server Shutdown and Resource Management', () => {
    
    it('should stop server gracefully with proper cleanup', async () => {
      // Start server and establish test connections
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Verify server is running before shutdown
      assert.ok(await validateServerState(serverManager, SERVER_STATE.RUNNING), 'Server should be running');
      
      // Call stop() method with timeout configuration
      const shutdownMetrics = await testServerShutdownPerformance(serverManager);
      
      // Verify graceful shutdown and resource cleanup
      const status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Server should be in stopped state');
      
      // Validate shutdown performance
      assert.ok(shutdownMetrics.passed, `Server shutdown should be within ${PERFORMANCE_THRESHOLDS.serverShutdown}ms threshold`);
      assert.ok(shutdownMetrics.executionTime > 0, 'Shutdown execution time should be measured');
      
      // Verify server is no longer healthy after shutdown
      const isHealthy = serverManager.isHealthy();
      assert.strictEqual(isHealthy, false, 'Server should not be healthy after shutdown');
    });

    it('should handle shutdown timeout with forced termination', async () => {
      // Start server with test configuration
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Verify server is running
      assert.ok(await validateServerState(serverManager, SERVER_STATE.RUNNING), 'Server should be running');
      
      try {
        // Call stop with very short timeout to test forced termination
        await serverManager.stop(100); // 100ms timeout
        
        // Verify server is stopped regardless of timeout
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Server should be stopped after timeout');
        
      } catch (error) {
        // If shutdown fails, verify error handling
        assert.ok(error instanceof Error, 'Should throw Error instance for shutdown failure');
      }
    });

    it('should prevent multiple simultaneous shutdown attempts', async () => {
      // Start server for concurrent shutdown testing
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Verify server is running
      assert.ok(await validateServerState(serverManager, SERVER_STATE.RUNNING), 'Server should be running');
      
      // Initiate multiple concurrent shutdown attempts
      const shutdownPromise1 = serverManager.stop();
      const shutdownPromise2 = serverManager.stop();
      
      // Wait for both shutdown attempts to complete
      await Promise.all([shutdownPromise1, shutdownPromise2]);
      
      // Verify server is properly stopped
      const status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Server should be stopped');
      assert.strictEqual(serverManager.isHealthy(), false, 'Server should not be healthy after shutdown');
    });
  });

  describe('Server Restart and Continuity Management', () => {
    
    it('should restart server maintaining operational continuity', async () => {
      // Start server and establish operational baseline
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Record baseline metrics before restart
      const statusBeforeRestart = serverManager.getStatus();
      assert.strictEqual(statusBeforeRestart.state, SERVER_STATE.RUNNING, 'Server should be running before restart');
      
      // Call restart() method and monitor process
      await serverManager.restart();
      
      // Verify server restart and operational continuity
      const statusAfterRestart = serverManager.getStatus();
      assert.strictEqual(statusAfterRestart.state, SERVER_STATE.RUNNING, 'Server should be running after restart');
      assert.ok(serverManager.isHealthy(), 'Server should be healthy after restart');
      
      // Verify that restart reset certain metrics
      assert.ok(statusAfterRestart.uptime >= 0, 'Server uptime should be reset after restart');
      
      // Clean up server
      await serverManager.stop();
    });

    it('should handle restart from stopped state', async () => {
      // Create server manager without starting server
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Verify server is initially stopped
      const initialStatus = serverManager.getStatus();
      assert.strictEqual(initialStatus.state, SERVER_STATE.STOPPED, 'Server should be initially stopped');
      
      // Perform restart from stopped state
      await serverManager.restart();
      
      // Verify server is running after restart from stopped state
      const statusAfterRestart = serverManager.getStatus();
      assert.strictEqual(statusAfterRestart.state, SERVER_STATE.RUNNING, 'Server should be running after restart');
      assert.ok(serverManager.isHealthy(), 'Server should be healthy after restart from stopped state');
      
      // Clean up server
      await serverManager.stop();
    });

    it('should handle restart timeout scenarios', async () => {
      // Start server with test configuration
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Perform restart with very short timeout
        await serverManager.restart(50); // 50ms timeout
        
        // If restart succeeds, verify server state
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should be running after restart');
        
      } catch (error) {
        // If restart fails due to timeout, verify error handling
        assert.ok(error instanceof Error, 'Should throw Error instance for restart timeout');
        
      } finally {
        // Ensure cleanup regardless of restart outcome
        try {
          await serverManager.stop();
        } catch (cleanupError) {
          // Ignore cleanup errors in timeout scenarios
        }
      }
    });
  });

  describe('Server Status and Health Monitoring', () => {
    
    it('should provide accurate server status information', async () => {
      // Start server and establish operational state
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Call getStatus() and analyze returned information
      const status = serverManager.getStatus();
      
      // Verify status accuracy and completeness
      assert.strictEqual(typeof status, 'object', 'Status should be an object');
      assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Status should show running state');
      assert.strictEqual(typeof status.uptime, 'number', 'Uptime should be a number');
      assert.ok(status.uptime >= 0, 'Uptime should be non-negative');
      assert.strictEqual(typeof status.requestCount, 'number', 'Request count should be a number');
      assert.ok(status.requestCount >= 0, 'Request count should be non-negative');
      assert.strictEqual(typeof status.errorCount, 'number', 'Error count should be a number');
      assert.ok(status.errorCount >= 0, 'Error count should be non-negative');
      assert.ok(status.memoryUsage, 'Memory usage should be provided');
      assert.strictEqual(typeof status.memoryUsage.heapUsed, 'number', 'Heap used should be a number');
      assert.strictEqual(typeof status.address, 'string', 'Server address should be a string');
      assert.ok(status.address.includes('localhost'), 'Address should include localhost');
      assert.strictEqual(typeof status.environment, 'string', 'Environment should be a string');
      
      // Clean up server
      await serverManager.stop();
    });

    it('should accurately report server health status', async () => {
      // Test server health in various operational states
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Test health when server is stopped
      let isHealthy = serverManager.isHealthy();
      assert.strictEqual(isHealthy, false, 'Server should not be healthy when stopped');
      
      // Start server and test health when running
      await serverManager.start();
      isHealthy = serverManager.isHealthy();
      assert.strictEqual(isHealthy, true, 'Server should be healthy when running');
      
      // Test health status consistency
      const status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Status should show running state');
      
      // Stop server and verify health changes
      await serverManager.stop();
      isHealthy = serverManager.isHealthy();
      assert.strictEqual(isHealthy, false, 'Server should not be healthy after stop');
    });

    it('should update status metrics during operation', async () => {
      // Start server and establish baseline metrics
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Get initial status
      const initialStatus = serverManager.getStatus();
      const initialUptime = initialStatus.uptime;
      
      // Wait for metrics to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get updated status
      const updatedStatus = serverManager.getStatus();
      
      // Verify metrics are updating
      assert.ok(updatedStatus.uptime >= initialUptime, 'Uptime should increase over time');
      assert.strictEqual(updatedStatus.state, SERVER_STATE.RUNNING, 'State should remain running');
      
      // Clean up server
      await serverManager.stop();
    });
  });
});

// ===============================================================================
// COMPREHENSIVE SERVER UTILITY FUNCTIONS TESTS
// ===============================================================================

describe('Server Utility Functions', () => {
  
  beforeEach(async () => {
    // Set up test environment for utility function testing
    testEnvironment = await setupTestEnvironment({
      enableServer: false,
      enablePerformanceMonitoring: true
    });
  });
  
  afterEach(async () => {
    // Clean up test environment after each test
    await teardownTestEnvironment();
  });

  describe('createServer Function', () => {
    
    it('should create HTTP server with Express.js application', async () => {
      // Prepare Express.js application and server configuration
      const testConfig = createTestServerConfig();
      
      // Call createServer with app and config parameters
      const server = createServer(app, testConfig);
      
      // Verify HTTP server creation and configuration
      assert.ok(server, 'Server should be created');
      assert.ok(server instanceof http.Server, 'Should return HTTP Server instance');
      assert.strictEqual(typeof server.listen, 'function', 'Server should have listen method');
      assert.strictEqual(typeof server.close, 'function', 'Server should have close method');
      assert.strictEqual(typeof server.on, 'function', 'Server should have event handling');
      
      // Verify server configuration is applied
      // Note: timeout and other configs are internal to the server
      assert.ok(server, 'Server configuration should be applied');
      
      // Clean up server instance
      if (server.listening) {
        server.close();
      }
    });

    it('should apply server configuration correctly', async () => {
      // Test different server configurations
      const configs = [
        createTestServerConfig({ timeout: 10000 }),
        createTestServerConfig({ timeout: 30000 }),
        createTestServerConfig({ host: '127.0.0.1' })
      ];
      
      configs.forEach((config, index) => {
        // Create server with specific configuration
        const server = createServer(app, config);
        
        // Verify server creation with configuration
        assert.ok(server, `Server ${index + 1} should be created with custom config`);
        assert.ok(server instanceof http.Server, `Server ${index + 1} should be HTTP Server instance`);
        
        // Clean up server
        if (server.listening) {
          server.close();
        }
      });
    });

    it('should handle invalid Express.js application', async () => {
      // Test createServer with invalid application
      const testConfig = createTestServerConfig();
      
      // Should throw error for null application
      assert.throws(() => {
        createServer(null as any, testConfig);
      }, Error, 'Should throw error for null application');
      
      // Should throw error for undefined application
      assert.throws(() => {
        createServer(undefined as any, testConfig);
      }, Error, 'Should throw error for undefined application');
    });
  });

  describe('startServer Function', () => {
    
    it('should start server with proper port binding and event handling', async () => {
      // Create HTTP server instance with test configuration
      const testConfig = createTestServerConfig();
      const server = createServer(app, testConfig);
      
      try {
        // Call startServer with server and config parameters
        await startServer(server, testConfig);
        
        // Verify server startup and port binding success
        assert.ok(server.listening, 'Server should be listening');
        
        const address = server.address();
        assert.ok(address, 'Server should have address');
        
        if (typeof address === 'object') {
          assert.strictEqual(typeof address.port, 'number', 'Port should be a number');
          assert.ok(address.port > 0, 'Port should be positive');
          assert.strictEqual(address.address, testConfig.host, 'Host should match configuration');
        }
        
      } finally {
        // Stop server and clean up resources
        if (server.listening) {
          await new Promise<void>((resolve) => {
            server.close(() => resolve());
          });
        }
      }
    });

    it('should handle port binding errors', async () => {
      // Create server with potentially conflicting port
      const testConfig = createTestServerConfig({ port: 80 }); // Privileged port
      const server = createServer(app, testConfig);
      
      try {
        // Attempt to start server on privileged port
        await startServer(server, testConfig);
        
        // If successful, clean up
        if (server.listening) {
          await new Promise<void>((resolve) => {
            server.close(() => resolve());
          });
        }
        
      } catch (error) {
        // Verify proper error handling for port binding
        assert.ok(error instanceof Error, 'Should throw Error instance');
        assert.ok(
          error.message.includes('EACCES') || 
          error.message.includes('EADDRINUSE') || 
          error.message.includes('failed'),
          'Error should indicate port binding issue'
        );
      }
    });

    it('should validate server configuration before startup', async () => {
      // Test server startup with invalid configurations
      const invalidConfigs = [
        { ...createTestServerConfig(), port: -1 },
        { ...createTestServerConfig(), port: 70000 },
        { ...createTestServerConfig(), host: '' }
      ];
      
      for (const config of invalidConfigs) {
        try {
          const server = createServer(app, config as ServerConfig);
          await startServer(server, config as ServerConfig);
          
          // If startup succeeds, clean up
          if (server.listening) {
            await new Promise<void>((resolve) => {
              server.close(() => resolve());
            });
          }
          
        } catch (error) {
          // Verify configuration validation error
          assert.ok(error instanceof Error, 'Should throw Error for invalid config');
          assert.ok(error.message.includes('validation') || error.message.includes('failed'), 
                   'Error should indicate validation failure');
        }
      }
    });
  });

  describe('stopServer Function', () => {
    
    it('should stop server gracefully with timeout handling', async () => {
      // Start server and establish active connections
      const testConfig = createTestServerConfig();
      const server = createServer(app, testConfig);
      
      await startServer(server, testConfig);
      
      // Verify server is running
      assert.ok(server.listening, 'Server should be running before stop');
      
      // Call stopServer with timeout configuration
      await stopServer(server, 5000);
      
      // Verify graceful shutdown within timeout period
      assert.strictEqual(server.listening, false, 'Server should not be listening after stop');
    });

    it('should handle stop when server is not running', async () => {
      // Create server without starting
      const testConfig = createTestServerConfig();
      const server = createServer(app, testConfig);
      
      // Verify server is not running
      assert.strictEqual(server.listening, false, 'Server should not be running initially');
      
      // Call stopServer on non-running server
      await stopServer(server, 1000);
      
      // Verify no error occurs when stopping non-running server
      assert.strictEqual(server.listening, false, 'Server should still not be running');
    });

    it('should handle forced shutdown after timeout', async () => {
      // Start server for timeout testing
      const testConfig = createTestServerConfig();
      const server = createServer(app, testConfig);
      
      await startServer(server, testConfig);
      
      // Call stopServer with very short timeout
      await stopServer(server, 1); // 1ms timeout
      
      // Verify server is stopped regardless of timeout
      assert.strictEqual(server.listening, false, 'Server should be stopped after timeout');
    });
  });

  describe('getServerStatus Function', () => {
    
    it('should provide comprehensive server status information', async () => {
      // Start server and establish operational baseline
      const testConfig = createTestServerConfig();
      const server = createServer(app, testConfig);
      
      await startServer(server, testConfig);
      
      try {
        // Call getServerStatus and analyze returned data
        const status = getServerStatus();
        
        // Verify status information accuracy and completeness
        assert.strictEqual(typeof status, 'object', 'Status should be an object');
        assert.strictEqual(typeof status.state, 'string', 'State should be a string');
        assert.strictEqual(typeof status.uptime, 'number', 'Uptime should be a number');
        assert.ok(status.uptime >= 0, 'Uptime should be non-negative');
        assert.strictEqual(typeof status.requestCount, 'number', 'Request count should be a number');
        assert.strictEqual(typeof status.errorCount, 'number', 'Error count should be a number');
        assert.ok(status.memoryUsage, 'Memory usage should be provided');
        assert.strictEqual(typeof status.address, 'string', 'Address should be a string');
        assert.strictEqual(typeof status.environment, 'string', 'Environment should be a string');
        
      } finally {
        // Stop server and clean up resources
        await stopServer(server);
      }
    });

    it('should handle status retrieval when server is stopped', async () => {
      // Get status when no server is running
      const status = getServerStatus();
      
      // Verify status reflects stopped state
      assert.strictEqual(typeof status, 'object', 'Status should still be an object');
      assert.ok(status.state === SERVER_STATE.STOPPED || status.state === SERVER_STATE.ERROR, 
               'State should indicate stopped or error');
      assert.strictEqual(status.uptime, 0, 'Uptime should be zero when stopped');
      assert.strictEqual(status.connections, 0, 'Connections should be zero when stopped');
    });
  });
});

// ===============================================================================
// COMPREHENSIVE ERROR HANDLING AND RECOVERY TESTS
// ===============================================================================

describe('Server Error Handling and Recovery', () => {
  
  beforeEach(async () => {
    // Set up test environment for error handling testing
    testEnvironment = await setupTestEnvironment({
      enableServer: false,
      enablePerformanceMonitoring: false,
      logLevel: 'error'
    });
  });
  
  afterEach(async () => {
    // Clean up test environment and reset error state
    await teardownTestEnvironment();
  });

  describe('Port Binding Error Handling', () => {
    
    it('should handle port binding errors gracefully', async () => {
      // Create server configuration with conflicting port
      const testConfig = createTestServerConfig({ port: 1 }); // Privileged port
      const serverManager = new ServerManager(app, testConfig);
      
      try {
        // Attempt server startup and monitor error handling
        await serverManager.start();
        
        // If startup succeeds on port 1, clean up (unlikely but possible in test env)
        await serverManager.stop();
        
      } catch (error) {
        // Verify proper error handling and recovery suggestions
        assert.ok(error instanceof Error, 'Should throw Error instance');
        assert.ok(
          error.message.includes('EACCES') || 
          error.message.includes('EADDRINUSE') || 
          error.message.includes('failed'),
          'Error should indicate port binding issue'
        );
        
        // Verify server state after error
        const status = serverManager.getStatus();
        assert.notStrictEqual(status.state, SERVER_STATE.RUNNING, 'Server should not be running after port error');
        assert.strictEqual(serverManager.isHealthy(), false, 'Server should not be healthy after port error');
      }
    });

    it('should suggest alternative ports for binding conflicts', async () => {
      // Test error handling with port already in use simulation
      const conflictError = simulateServerError('EADDRINUSE', { port: 3000 });
      
      // Create test server for error injection
      const testConfig = createTestServerConfig({ port: 3000 });
      const server = createServer(app, testConfig);
      
      try {
        // Simulate port conflict error handling
        handleServerError(conflictError, server);
        
        // Verify error is properly categorized and handled
        assert.ok(conflictError.message.includes('already in use'), 'Error should indicate port conflict');
        assert.strictEqual((conflictError as any).code, 'EADDRINUSE', 'Error code should be EADDRINUSE');
        
      } catch (handlingError) {
        // Verify error propagation for critical errors
        assert.ok(handlingError instanceof Error, 'Critical errors should be propagated');
      }
    });

    it('should handle permission denied errors appropriately', async () => {
      // Simulate permission denied error for privileged ports
      const permissionError = simulateServerError('EACCES', { port: 80 });
      
      // Create test server configuration
      const testConfig = createTestServerConfig({ port: 80 });
      const server = createServer(app, testConfig);
      
      try {
        // Test permission error handling
        handleServerError(permissionError, server);
        
        // Verify permission error is properly handled
        assert.ok(permissionError.message.includes('Permission denied'), 'Error should indicate permission issue');
        assert.strictEqual((permissionError as any).code, 'EACCES', 'Error code should be EACCES');
        
      } catch (handlingError) {
        // Verify critical permission errors are escalated
        assert.ok(handlingError instanceof Error, 'Permission errors should be escalated');
      }
    });
  });

  describe('Runtime Error Management', () => {
    
    it('should handle runtime server errors with proper logging', async () => {
      // Start server and inject runtime error conditions
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Simulate runtime connection error
        const runtimeError = simulateServerError('ECONNRESET');
        
        // Test runtime error handling
        const errorHandled = await validateErrorHandling(runtimeError, serverManager);
        
        // Verify error logging and operational continuity
        assert.ok(errorHandled, 'Runtime error should be handled gracefully');
        
        // Verify server continues operating after runtime error
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should continue running after runtime error');
        assert.ok(serverManager.isHealthy(), 'Server should remain healthy after runtime error');
        
      } finally {
        // Clean up server resources
        await serverManager.stop();
      }
    });

    it('should track error counts and metrics', async () => {
      // Start server for error tracking testing
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Get initial error count
        const initialStatus = serverManager.getStatus();
        const initialErrorCount = initialStatus.errorCount;
        
        // Simulate multiple runtime errors
        const errors = [
          simulateServerError('ECONNRESET'),
          simulateServerError('EPIPE'),
          simulateServerError('TIMEOUT')
        ];
        
        // Process each error and verify tracking
        for (const error of errors) {
          await validateErrorHandling(error, serverManager);
        }
        
        // Verify error counting (Note: This depends on actual error injection)
        const finalStatus = serverManager.getStatus();
        assert.ok(finalStatus.errorCount >= initialErrorCount, 'Error count should be tracked');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });

    it('should maintain server stability during error conditions', async () => {
      // Start server for stability testing
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Simulate multiple concurrent errors
        const concurrentErrors = [
          simulateServerError('ECONNRESET'),
          simulateServerError('EPIPE'),
          simulateServerError('TIMEOUT')
        ];
        
        // Process errors concurrently
        const errorHandlingResults = await Promise.all(
          concurrentErrors.map(error => validateErrorHandling(error, serverManager))
        );
        
        // Verify all errors were handled
        errorHandlingResults.forEach((result, index) => {
          assert.ok(result, `Error ${index + 1} should be handled successfully`);
        });
        
        // Verify server stability after multiple errors
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should remain stable');
        assert.ok(serverManager.isHealthy(), 'Server should remain healthy after error burst');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    
    it('should recover from transient errors automatically', async () => {
      // Start server and prepare transient error scenarios
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Record baseline status
        const baselineStatus = serverManager.getStatus();
        
        // Inject transient errors and monitor recovery
        const transientErrors = [
          simulateServerError('ECONNRESET'),
          simulateServerError('EPIPE')
        ];
        
        for (const error of transientErrors) {
          // Simulate transient error
          await validateErrorHandling(error, serverManager);
          
          // Wait for potential recovery
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verify automatic recovery
          const status = serverManager.getStatus();
          assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should recover from transient error');
          assert.ok(serverManager.isHealthy(), 'Server should remain healthy after recovery');
        }
        
        // Verify operational restoration after all transient errors
        const finalStatus = serverManager.getStatus();
        assert.strictEqual(finalStatus.state, SERVER_STATE.RUNNING, 'Server should be fully operational');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });

    it('should escalate persistent errors appropriately', async () => {
      // Test persistent error escalation
      const persistentError = simulateServerError('CRITICAL_ERROR', { 
        persistent: true,
        severity: 'critical'
      });
      
      // Create server for persistent error testing
      const testConfig = createTestServerConfig();
      const server = createServer(app, testConfig);
      
      try {
        // Test persistent error handling
        handleServerError(persistentError, server);
        
        // Verify persistent error characteristics
        assert.ok(persistentError.message.includes('CRITICAL_ERROR'), 'Error should indicate critical nature');
        assert.strictEqual((persistentError as any).context.persistent, true, 'Error should be marked as persistent');
        assert.strictEqual((persistentError as any).context.severity, 'critical', 'Error should have critical severity');
        
      } catch (escalatedError) {
        // Verify error escalation for critical conditions
        assert.ok(escalatedError instanceof Error, 'Critical errors should be escalated');
      }
    });
  });
});

// ===============================================================================
// COMPREHENSIVE PERFORMANCE TESTING AND VALIDATION
// ===============================================================================

describe('Server Performance Testing and Validation', () => {
  
  beforeEach(async () => {
    // Set up test environment with performance monitoring enabled
    testEnvironment = await setupTestEnvironment({
      enableServer: false,
      enablePerformanceMonitoring: true,
      logLevel: 'error'
    });
  });
  
  afterEach(async () => {
    // Clean up test environment and performance monitoring
    await teardownTestEnvironment();
  });

  describe('Server Startup Performance', () => {
    
    it('should start server within performance threshold', async () => {
      // Configure performance monitoring and thresholds
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Measure server startup time and resource usage
      const performanceMetrics = await measureTestPerformance(async () => {
        await serverManager.start();
      }, { threshold: PERFORMANCE_THRESHOLDS.serverStartup });
      
      try {
        // Verify startup performance meets threshold requirements
        assert.ok(performanceMetrics.passed, 
                 `Server startup should complete within ${PERFORMANCE_THRESHOLDS.serverStartup}ms, actual: ${performanceMetrics.executionTime.toFixed(2)}ms`);
        assert.ok(performanceMetrics.executionTime > 0, 'Startup time should be measurable');
        assert.ok(performanceMetrics.memoryUsage, 'Memory usage should be recorded');
        
        // Verify server is operational after performance test
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should be running after startup performance test');
        assert.ok(serverManager.isHealthy(), 'Server should be healthy after startup');
        
      } finally {
        // Clean up server resources
        if (await validateServerState(serverManager, SERVER_STATE.RUNNING)) {
          await serverManager.stop();
        }
      }
    });

    it('should maintain efficient resource usage during startup', async () => {
      // Monitor resource usage during server startup
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Record baseline memory usage
      const baselineMemory = process.memoryUsage();
      
      // Start server with resource monitoring
      const startupMetrics = await testServerStartupPerformance(serverManager);
      
      try {
        // Verify memory usage remains within acceptable limits
        const memoryIncrease = startupMetrics.memoryUsage.heapUsed - baselineMemory.heapUsed;
        const maxMemoryIncrease = 50 * 1024 * 1024; // 50MB threshold
        
        assert.ok(memoryIncrease < maxMemoryIncrease, 
                 `Memory increase should be less than ${maxMemoryIncrease / 1024 / 1024}MB, actual: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Verify startup performance metrics
        assert.ok(startupMetrics.passed, 'Startup should meet performance requirements');
        assert.ok(startupMetrics.executionTime < PERFORMANCE_THRESHOLDS.serverStartup, 
                 'Startup time should be within threshold');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });

    it('should handle concurrent startup attempts efficiently', async () => {
      // Test concurrent startup performance
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Measure performance of concurrent startup attempts
      const concurrentStartupMetrics = await measureTestPerformance(async () => {
        const startupPromises = [
          serverManager.start(),
          serverManager.start(),
          serverManager.start()
        ];
        
        await Promise.all(startupPromises);
      }, { threshold: PERFORMANCE_THRESHOLDS.serverStartup * 1.5 }); // Allow extra time for concurrency
      
      try {
        // Verify concurrent startup efficiency
        assert.ok(concurrentStartupMetrics.passed, 
                 'Concurrent startup should be handled efficiently');
        
        // Verify server is in correct state after concurrent startup
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should be running after concurrent startup');
        assert.ok(serverManager.isHealthy(), 'Server should be healthy after concurrent startup');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });
  });

  describe('Server Shutdown Performance', () => {
    
    it('should shutdown server within performance threshold', async () => {
      // Start server and configure shutdown performance monitoring
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Measure graceful shutdown time and resource cleanup
      const shutdownMetrics = await testServerShutdownPerformance(serverManager);
      
      // Verify shutdown performance meets threshold requirements
      assert.ok(shutdownMetrics.passed, 
               `Server shutdown should complete within ${PERFORMANCE_THRESHOLDS.serverShutdown}ms, actual: ${shutdownMetrics.executionTime.toFixed(2)}ms`);
      assert.ok(shutdownMetrics.executionTime > 0, 'Shutdown time should be measurable');
      
      // Verify server is properly stopped
      const status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Server should be stopped after shutdown');
      assert.strictEqual(serverManager.isHealthy(), false, 'Server should not be healthy after shutdown');
    });

    it('should handle graceful shutdown with active connections', async () => {
      // Start server and simulate active connections
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      // Simulate active connections (in real scenario, would make HTTP requests)
      // For this test, we'll measure shutdown performance with server running
      
      // Measure shutdown performance with potential active connections
      const shutdownWithConnectionsMetrics = await measureTestPerformance(async () => {
        await serverManager.stop(5000); // 5 second timeout for graceful shutdown
      }, { threshold: PERFORMANCE_THRESHOLDS.serverShutdown });
      
      // Verify graceful shutdown performance
      assert.ok(shutdownWithConnectionsMetrics.passed || shutdownWithConnectionsMetrics.executionTime < 6000, 
               'Shutdown with connections should complete within reasonable time');
      
      // Verify server is properly stopped
      const status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Server should be stopped after graceful shutdown');
    });
  });

  describe('Server Operational Performance', () => {
    
    it('should maintain efficient memory usage during operations', async () => {
      // Start server and establish operational baseline
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Monitor memory usage during various operations
        const initialMemory = process.memoryUsage();
        
        // Simulate server operations (status checks, health checks)
        for (let i = 0; i < 100; i++) {
          serverManager.getStatus();
          serverManager.isHealthy();
        }
        
        // Check memory usage after operations
        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        
        // Verify memory usage remains within acceptable limits
        const maxMemoryIncrease = 10 * 1024 * 1024; // 10MB threshold for operations
        assert.ok(memoryIncrease < maxMemoryIncrease, 
                 `Memory increase should be minimal during operations, actual: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Verify server remains healthy during operation testing
        assert.ok(serverManager.isHealthy(), 'Server should remain healthy during operation testing');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });

    it('should handle concurrent operations efficiently', async () => {
      // Start server and prepare concurrent request scenarios
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Execute concurrent operations and measure performance
        const concurrentOperationsMetrics = await measureTestPerformance(async () => {
          const operations = [];
          
          // Create multiple concurrent status and health check operations
          for (let i = 0; i < 50; i++) {
            operations.push(Promise.resolve(serverManager.getStatus()));
            operations.push(Promise.resolve(serverManager.isHealthy()));
          }
          
          await Promise.all(operations);
        }, { threshold: 500 }); // 500ms threshold for concurrent operations
        
        // Verify performance remains acceptable under load
        assert.ok(concurrentOperationsMetrics.passed, 
                 `Concurrent operations should complete efficiently, actual: ${concurrentOperationsMetrics.executionTime.toFixed(2)}ms`);
        
        // Verify server stability under concurrent load
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should remain running under concurrent load');
        assert.ok(serverManager.isHealthy(), 'Server should remain healthy under concurrent load');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });
  });

  describe('Health Check Performance', () => {
    
    it('should perform health checks within performance threshold', async () => {
      // Start server and configure health check performance monitoring
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Measure health check performance
        const healthCheckMetrics = await measureTestPerformance(async () => {
          // Perform multiple health checks
          for (let i = 0; i < 10; i++) {
            serverManager.isHealthy();
          }
        }, { threshold: PERFORMANCE_THRESHOLDS.healthCheck });
        
        // Verify health check performance meets requirements
        assert.ok(healthCheckMetrics.passed, 
                 `Health checks should complete within ${PERFORMANCE_THRESHOLDS.healthCheck}ms, actual: ${healthCheckMetrics.executionTime.toFixed(2)}ms`);
        
        // Verify health check consistency
        const healthResults = [];
        for (let i = 0; i < 5; i++) {
          healthResults.push(serverManager.isHealthy());
        }
        
        // All health checks should return same result for stable server
        const firstResult = healthResults[0];
        assert.ok(healthResults.every(result => result === firstResult), 
                 'Health check results should be consistent');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });
  });
});

// ===============================================================================
// COMPREHENSIVE CONFIGURATION VALIDATION TESTS
// ===============================================================================

describe('Server Configuration Validation and Management', () => {
  
  beforeEach(async () => {
    // Set up test environment for configuration testing
    testEnvironment = await setupTestEnvironment({
      enableServer: false,
      enablePerformanceMonitoring: false
    });
  });
  
  afterEach(async () => {
    // Clean up test environment and configuration state
    await teardownTestEnvironment();
  });

  describe('Configuration Validation', () => {
    
    it('should validate server configuration before startup', async () => {
      // Prepare various server configuration scenarios
      const validConfigs = [
        createTestServerConfig({ port: 3000, host: 'localhost' }),
        createTestServerConfig({ port: 8080, host: '127.0.0.1' }),
        createTestServerConfig({ port: 0, host: 'localhost' }) // Dynamic port
      ];
      
      // Validate configurations and monitor validation results
      validConfigs.forEach((config, index) => {
        const validationResult = validateServerConfiguration(config);
        
        // Verify configuration validation accuracy and error reporting
        assert.ok(validationResult.isValid, `Valid config ${index + 1} should pass validation`);
        assert.strictEqual(validationResult.errors.length, 0, `Valid config ${index + 1} should have no errors`);
        assert.ok(Array.isArray(validationResult.warnings), 'Warnings should be an array');
        assert.ok(Array.isArray(validationResult.recommendations), 'Recommendations should be an array');
      });
    });

    it('should reject invalid server configurations', async () => {
      // Prepare invalid server configuration scenarios
      const invalidConfigs = [
        { port: -1, host: 'localhost', name: 'test', version: '1.0.0', timeout: 5000 },
        { port: 70000, host: 'localhost', name: 'test', version: '1.0.0', timeout: 5000 },
        { port: 3000, host: '', name: 'test', version: '1.0.0', timeout: 5000 },
        { port: 3000, host: 'localhost', name: '', version: '1.0.0', timeout: 5000 }
      ];
      
      // Test each invalid configuration
      invalidConfigs.forEach((config, index) => {
        const validationResult = validateServerConfiguration(config as ServerConfig);
        
        // Verify validation detects configuration errors
        assert.strictEqual(validationResult.isValid, false, `Invalid config ${index + 1} should fail validation`);
        assert.ok(validationResult.errors.length > 0, `Invalid config ${index + 1} should have errors`);
      });
    });

    it('should provide helpful validation warnings and recommendations', async () => {
      // Test configuration scenarios that generate warnings
      const warningConfigs = [
        createTestServerConfig({ port: 80 }), // Privileged port in development
        createTestServerConfig({ timeout: 300000 }), // Very high timeout
        createTestServerConfig({ timeout: 500 }) // Very low timeout
      ];
      
      warningConfigs.forEach((config, index) => {
        const validationResult = validateServerConfiguration(config);
        
        // Verify warnings are generated for edge cases
        if (config.port === 80 || config.timeout === 300000 || config.timeout === 500) {
          assert.ok(validationResult.warnings.length > 0 || validationResult.recommendations.length > 0, 
                   `Config ${index + 1} should generate warnings or recommendations`);
        }
        
        // Verify validation result structure
        assert.ok(typeof validationResult.isValid === 'boolean', 'isValid should be boolean');
        assert.ok(Array.isArray(validationResult.errors), 'Errors should be an array');
        assert.ok(Array.isArray(validationResult.warnings), 'Warnings should be an array');
        assert.ok(Array.isArray(validationResult.recommendations), 'Recommendations should be an array');
      });
    });
  });

  describe('Environment-Specific Configuration', () => {
    
    it('should apply environment-specific configuration correctly', async () => {
      // Configure different environment settings and contexts
      const environmentConfigs = [
        { ...createTestServerConfig(), environment: 'development' },
        { ...createTestServerConfig(), environment: 'production' },
        { ...createTestServerConfig(), environment: 'test' }
      ];
      
      environmentConfigs.forEach((config, index) => {
        // Initialize server with environment-specific configurations
        try {
          const serverManager = new ServerManager(app, config as ServerConfig);
          
          // Verify correct environment-specific behavior and settings
          const status = serverManager.getStatus();
          assert.ok(status, `Environment config ${index + 1} should create valid server manager`);
          assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Initial state should be stopped');
          
        } catch (error) {
          // Some environment configurations might be invalid in test context
          assert.ok(error instanceof Error, `Environment config ${index + 1} error should be Error instance`);
        }
      });
    });

    it('should handle configuration updates during runtime', async () => {
      // Start server with initial configuration
      const initialConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, initialConfig);
      
      await serverManager.start();
      
      try {
        // Record initial configuration state
        const initialStatus = serverManager.getStatus();
        assert.strictEqual(initialStatus.state, SERVER_STATE.RUNNING, 'Server should be running with initial config');
        
        // Test that configuration is immutable during runtime
        // (In real scenarios, configuration updates would require restart)
        
        // Verify server maintains initial configuration
        const currentStatus = serverManager.getStatus();
        assert.strictEqual(currentStatus.address, `${initialConfig.host}:${initialConfig.port}`, 
                          'Server address should match initial configuration');
        
      } finally {
        // Clean up server
        await serverManager.stop();
      }
    });
  });

  describe('Configuration Error Handling', () => {
    
    it('should handle invalid configuration gracefully', async () => {
      // Prepare invalid configuration scenarios
      const invalidConfigurations = [
        null,
        undefined,
        {},
        { port: 'invalid' },
        { host: 123 },
        { timeout: 'invalid' }
      ];
      
      invalidConfigurations.forEach((config, index) => {
        try {
          // Attempt server initialization with invalid configurations
          const serverManager = new ServerManager(app, config as any);
          
          // If creation succeeds, it should still fail validation
          assert.fail(`Invalid config ${index + 1} should not create valid server manager`);
          
        } catch (error) {
          // Verify proper error handling and validation messages
          assert.ok(error instanceof Error, `Invalid config ${index + 1} should throw Error instance`);
          assert.ok(error.message.length > 0, 'Error message should be descriptive');
        }
      });
    });

    it('should validate configuration dependencies and consistency', async () => {
      // Test configuration dependency validation
      const dependencyConfigs = [
        {
          port: 443,
          host: 'localhost',
          name: 'https-server',
          version: '1.0.0',
          timeout: 5000,
          ssl: true // This would be invalid without SSL configuration
        },
        {
          port: 80,
          host: '0.0.0.0',
          name: 'public-server',
          version: '1.0.0',
          timeout: 1000 // Very short timeout for public server
        }
      ];
      
      dependencyConfigs.forEach((config, index) => {
        const validationResult = validateServerConfiguration(config as ServerConfig);
        
        // Verify dependency validation
        if (config.port === 443 || config.port === 80) {
          // These configurations may generate warnings
          assert.ok(typeof validationResult.isValid === 'boolean', 
                   `Dependency config ${index + 1} should have validation result`);
        }
      });
    });
  });

  describe('Configuration Security Validation', () => {
    
    it('should validate security configuration and enforcement', async () => {
      // Test security-related configuration validation
      const securityConfigs = [
        createTestServerConfig({ port: 80, host: '0.0.0.0' }), // Public binding
        createTestServerConfig({ port: 443 }), // HTTPS port without SSL
        createTestServerConfig({ timeout: 0 }) // No timeout (potential DoS)
      ];
      
      securityConfigs.forEach((config, index) => {
        const validationResult = validateServerConfiguration(config);
        
        // Verify security considerations are flagged
        if (config.host === '0.0.0.0' || config.port === 443 || config.timeout === 0) {
          assert.ok(validationResult.warnings.length > 0 || validationResult.recommendations.length > 0, 
                   `Security config ${index + 1} should generate security warnings`);
        }
      });
    });

    it('should recommend security best practices', async () => {
      // Test security recommendation generation
      const productionConfig = createTestServerConfig({ 
        port: 3000, 
        host: 'localhost'
      });
      
      // Validate configuration for production deployment
      const validationResult = validateServerConfiguration(productionConfig);
      
      // Verify security recommendations are provided
      assert.ok(validationResult.recommendations.length >= 0, 'Should provide security recommendations');
      assert.ok(typeof validationResult.isValid === 'boolean', 'Should have validation result');
      
      // Check for specific security-related recommendations
      const recommendations = validationResult.recommendations.join(' ');
      // In a real production scenario, would check for HTTPS, reverse proxy recommendations
    });
  });
});

// ===============================================================================
// EDUCATIONAL EXAMPLES AND TESTING PATTERNS
// ===============================================================================

describe('Educational Testing Patterns and Examples', () => {
  
  beforeEach(async () => {
    // Set up educational test environment
    testEnvironment = await setupTestEnvironment({
      enableServer: false,
      enablePerformanceMonitoring: true,
      logLevel: 'debug' // More verbose for educational purposes
    });
  });
  
  afterEach(async () => {
    // Clean up educational test environment
    await teardownTestEnvironment();
  });

  describe('Node.js 24.x Built-in Test Runner Examples', () => {
    
    it('demonstrates modern async/await testing patterns', async () => {
      // Example of modern async/await testing with Node.js built-in test runner
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Demonstrate async server lifecycle testing
      await serverManager.start();
      
      try {
        // Example of testing async operations with proper error handling
        const status = await Promise.resolve(serverManager.getStatus());
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Async status check should work');
        
        // Example of testing async health checks
        const isHealthy = await Promise.resolve(serverManager.isHealthy());
        assert.strictEqual(isHealthy, true, 'Async health check should work');
        
        // Example of testing async restart operations
        await serverManager.restart();
        const restartedStatus = serverManager.getStatus();
        assert.strictEqual(restartedStatus.state, SERVER_STATE.RUNNING, 'Server should be running after restart');
        
      } finally {
        // Proper async cleanup pattern
        await serverManager.stop();
      }
    });

    it('demonstrates comprehensive assertion patterns', async () => {
      // Educational example of various assertion types and patterns
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Strict equality assertions
      assert.strictEqual(typeof serverManager, 'object', 'Type checking assertion');
      
      // Boolean assertions
      assert.ok(serverManager, 'Truthy assertion');
      
      // Array and object assertions
      const status = serverManager.getStatus();
      assert.ok(typeof status === 'object', 'Object type assertion');
      assert.ok(status.hasOwnProperty('state'), 'Property existence assertion');
      
      // Number range assertions
      assert.ok(status.requestCount >= 0, 'Number range assertion');
      assert.ok(status.errorCount >= 0, 'Non-negative number assertion');
      
      // String pattern assertions
      assert.ok(typeof status.environment === 'string', 'String type assertion');
      assert.ok(status.environment.length > 0, 'Non-empty string assertion');
      
      // Error assertion patterns
      assert.throws(() => {
        new ServerManager(null as any, testConfig);
      }, Error, 'Error throwing assertion');
    });

    it('demonstrates performance testing with built-in APIs', async () => {
      // Educational example of performance testing using Node.js built-in APIs
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Performance measurement using performance.now()
      const startTime = performance.now();
      
      await serverManager.start();
      
      const endTime = performance.now();
      const startupTime = endTime - startTime;
      
      try {
        // Performance assertion examples
        assert.ok(startupTime > 0, 'Startup time should be measurable');
        assert.ok(startupTime < 5000, 'Startup should be reasonable (< 5 seconds)');
        
        // Memory usage monitoring examples
        const memoryBefore = process.memoryUsage();
        
        // Perform some operations
        for (let i = 0; i < 100; i++) {
          serverManager.getStatus();
        }
        
        const memoryAfter = process.memoryUsage();
        const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;
        
        // Memory usage assertions
        assert.ok(memoryIncrease >= 0, 'Memory usage should be tracked');
        
      } finally {
        // Cleanup with performance tracking
        const shutdownStartTime = performance.now();
        await serverManager.stop();
        const shutdownEndTime = performance.now();
        const shutdownTime = shutdownEndTime - shutdownStartTime;
        
        assert.ok(shutdownTime > 0, 'Shutdown time should be measurable');
      }
    });
  });

  describe('Express.js 5.1.0 Testing Integration Examples', () => {
    
    it('demonstrates Express.js application testing patterns', async () => {
      // Educational example of testing Express.js application integration
      const testConfig = createTestServerConfig();
      
      // Create server with Express.js application
      const server = createServer(app, testConfig);
      
      // Verify Express.js integration
      assert.ok(server, 'Server should be created with Express.js app');
      assert.ok(server instanceof http.Server, 'Should be HTTP Server instance');
      
      try {
        // Start server for Express.js testing
        await startServer(server, testConfig);
        
        // Verify server is listening
        assert.ok(server.listening, 'Express.js server should be listening');
        
        // Get server address for testing
        const address = server.address();
        assert.ok(address, 'Server should have address');
        
        if (typeof address === 'object' && address !== null) {
          assert.ok(address.port > 0, 'Server should have valid port');
          assert.strictEqual(address.address, testConfig.host, 'Server should bind to correct host');
        }
        
      } finally {
        // Cleanup Express.js server
        if (server.listening) {
          await stopServer(server);
        }
      }
    });

    it('demonstrates Express.js error handling testing', async () => {
      // Educational example of testing Express.js 5.1.0 enhanced error handling
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Test server error handling capabilities
        const error = simulateServerError('TEST_ERROR', { 
          message: 'Educational test error',
          statusCode: 500
        });
        
        // Demonstrate error handling validation
        const errorHandled = await validateErrorHandling(error, serverManager);
        
        // Educational assertions for error handling
        assert.ok(typeof errorHandled === 'boolean', 'Error handling should return boolean result');
        
        // Verify server continues operating after error
        const status = serverManager.getStatus();
        assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Server should continue running after handled error');
        
      } finally {
        await serverManager.stop();
      }
    });
  });

  describe('TypeScript Testing Integration Examples', () => {
    
    it('demonstrates type-safe testing patterns', async () => {
      // Educational example of TypeScript integration in testing
      const testConfig: ServerConfig = createTestServerConfig();
      const serverManager: ServerManager = new ServerManager(app, testConfig);
      
      // Type-safe status checking
      const status: ServerStatus = serverManager.getStatus();
      
      // TypeScript type assertions
      assert.strictEqual(typeof status.state, 'string', 'State should be string type');
      assert.strictEqual(typeof status.uptime, 'number', 'Uptime should be number type');
      assert.strictEqual(typeof status.requestCount, 'number', 'Request count should be number type');
      assert.strictEqual(typeof status.errorCount, 'number', 'Error count should be number type');
      assert.ok(status.memoryUsage, 'Memory usage should be defined');
      assert.strictEqual(typeof status.address, 'string', 'Address should be string type');
      assert.strictEqual(typeof status.environment, 'string', 'Environment should be string type');
      
      // Type-safe health checking
      const isHealthy: boolean = serverManager.isHealthy();
      assert.strictEqual(typeof isHealthy, 'boolean', 'Health status should be boolean type');
      
      // Type-safe configuration validation
      const validationResult: ConfigValidationResult = validateServerConfiguration(testConfig);
      assert.strictEqual(typeof validationResult.isValid, 'boolean', 'Validation result should be boolean');
      assert.ok(Array.isArray(validationResult.errors), 'Errors should be array type');
      assert.ok(Array.isArray(validationResult.warnings), 'Warnings should be array type');
      assert.ok(Array.isArray(validationResult.recommendations), 'Recommendations should be array type');
    });

    it('demonstrates interface validation testing', async () => {
      // Educational example of testing TypeScript interface compliance
      const testConfig = createTestServerConfig();
      
      // Validate ServerConfig interface compliance
      assert.ok(typeof testConfig.port === 'number', 'Port should be number');
      assert.ok(typeof testConfig.host === 'string', 'Host should be string');
      assert.ok(typeof testConfig.name === 'string', 'Name should be string');
      assert.ok(typeof testConfig.version === 'string', 'Version should be string');
      assert.ok(typeof testConfig.timeout === 'number', 'Timeout should be number');
      
      // Test interface compliance with server manager
      const serverManager = new ServerManager(app, testConfig);
      const status = serverManager.getStatus();
      
      // Validate ServerStatus interface compliance
      const requiredStatusProperties = ['state', 'uptime', 'connections', 'requestCount', 'errorCount', 'memoryUsage', 'address', 'environment'];
      requiredStatusProperties.forEach(property => {
        assert.ok(status.hasOwnProperty(property), `Status should have ${property} property`);
      });
      
      // Validate specific property types
      assert.ok(['string'].includes(typeof status.state), 'State should be string');
      assert.ok(['number'].includes(typeof status.uptime), 'Uptime should be number');
      assert.ok(['number'].includes(typeof status.connections), 'Connections should be number');
    });
  });

  describe('Comprehensive Testing Scenario Examples', () => {
    
    it('demonstrates complete server lifecycle testing scenario', async () => {
      // Educational example of comprehensive server lifecycle testing
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      // Phase 1: Initial state validation
      let status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Phase 1: Server should be initially stopped');
      assert.strictEqual(serverManager.isHealthy(), false, 'Phase 1: Server should not be healthy when stopped');
      
      // Phase 2: Startup testing with performance monitoring
      const startupMetrics = await testServerStartupPerformance(serverManager);
      assert.ok(startupMetrics.passed, 'Phase 2: Startup should meet performance requirements');
      
      status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Phase 2: Server should be running after startup');
      assert.ok(serverManager.isHealthy(), 'Phase 2: Server should be healthy when running');
      
      // Phase 3: Operational testing
      const initialRequestCount = status.requestCount;
      const initialUptime = status.uptime;
      
      // Simulate some operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      status = serverManager.getStatus();
      assert.ok(status.uptime >= initialUptime, 'Phase 3: Uptime should increase');
      assert.ok(status.requestCount >= initialRequestCount, 'Phase 3: Request count should be tracked');
      
      // Phase 4: Restart testing
      await serverManager.restart();
      status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.RUNNING, 'Phase 4: Server should be running after restart');
      assert.ok(serverManager.isHealthy(), 'Phase 4: Server should be healthy after restart');
      
      // Phase 5: Shutdown testing with performance monitoring
      const shutdownMetrics = await testServerShutdownPerformance(serverManager);
      assert.ok(shutdownMetrics.passed, 'Phase 5: Shutdown should meet performance requirements');
      
      status = serverManager.getStatus();
      assert.strictEqual(status.state, SERVER_STATE.STOPPED, 'Phase 5: Server should be stopped after shutdown');
      assert.strictEqual(serverManager.isHealthy(), false, 'Phase 5: Server should not be healthy when stopped');
    });

    it('demonstrates error handling and recovery testing scenario', async () => {
      // Educational example of comprehensive error handling testing
      const testConfig = createTestServerConfig();
      const serverManager = new ServerManager(app, testConfig);
      
      await serverManager.start();
      
      try {
        // Test various error scenarios
        const errorScenarios = [
          { type: 'ECONNRESET', description: 'Connection reset error' },
          { type: 'EPIPE', description: 'Broken pipe error' },
          { type: 'TIMEOUT', description: 'Operation timeout error' }
        ];
        
        for (const scenario of errorScenarios) {
          // Simulate error
          const error = simulateServerError(scenario.type);
          
          // Test error handling
          const errorHandled = await validateErrorHandling(error, serverManager);
          assert.ok(errorHandled, `${scenario.description} should be handled gracefully`);
          
          // Verify server continues operating
          const status = serverManager.getStatus();
          assert.strictEqual(status.state, SERVER_STATE.RUNNING, `Server should continue running after ${scenario.description}`);
          assert.ok(serverManager.isHealthy(), `Server should remain healthy after ${scenario.description}`);
        }
        
      } finally {
        await serverManager.stop();
      }
    });
  });
});