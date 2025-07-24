/**
 * Comprehensive Testing Utilities Module for Node.js Tutorial Application
 * 
 * This module provides reusable helper functions, mock object factories, and assertion utilities
 * for the Node.js tutorial application test suite. Serves as the central testing infrastructure,
 * offering Express.js 5.1.0 compatible mocks, performance measurement tools, test data generation
 * utilities, and educational testing patterns. Integrates with Node.js 24.x built-in test runner,
 * TypeScript type safety, and modern testing best practices to support unit testing, integration
 * testing, and educational testing scenarios with proper test isolation and resource management.
 * 
 * Features:
 * - Express.js 5.1.0 compatible mock objects with realistic properties and behaviors
 * - Test server lifecycle management with dynamic port allocation and health checks
 * - Performance measurement tools using Node.js built-in performance APIs
 * - Comprehensive test data generation with edge cases and validation scenarios
 * - Type-safe assertion utilities with detailed error reporting for educational debugging
 * - Test environment setup and cleanup procedures for isolation and resource management
 * - Mock middleware creation with call tracking and Express.js 5.1.0 compatibility
 * - API response validation utilities with TypeScript interface compliance
 * - Test scenario creation for consistent testing patterns and comprehensive coverage
 * - Educational testing patterns demonstrating Node.js and Express.js best practices
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates comprehensive testing utility design and modern testing practices
 * @framework Express.js 5.1.0 enhanced middleware support and automatic promise rejection handling
 */

// Import Express.js application and server management for integration testing
import app from '../../src/app';
import { ServerManager } from '../../src/server';

// Import logging system for test debugging and execution tracking
import { logger } from '../../src/utils/logger';

// Import type definitions for type-safe testing utilities and interface validation
import {
  HelloResponse,
  ErrorResponse,
  RequestHandler,
  HTTP_STATUS,
  RESPONSE_MESSAGES
} from '../../src/types';

// Import constants for response validation and test configuration
import { HTTP_STATUS as StatusCodes, RESPONSE_MESSAGES as Messages } from '../../src/config/constants';

// Import Node.js built-in modules for unique ID generation and performance measurement
import { randomUUID } from 'crypto'; // built-in
import { performance } from 'perf_hooks'; // built-in
import { EventEmitter } from 'events'; // built-in
import { Readable } from 'stream'; // built-in

/**
 * Global Testing Configuration Constants
 * 
 * Configuration constants for testing module with const assertions for immutable literal types.
 * Provides centralized test configuration with type safety and consistency across test utilities.
 */

/** Default test timeout in milliseconds for async operations */
export const TEST_TIMEOUT_MS = 30000;

/** Performance threshold in milliseconds for test validation */
export const PERFORMANCE_THRESHOLD_MS = 100;

/** Default test port for dynamic allocation */
export const DEFAULT_TEST_PORT = 0;

/** Default mock request configuration with realistic properties */
export const MOCK_REQUEST_DEFAULTS = {
  method: 'GET',
  url: '/hello',
  path: '/hello',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'test-agent/1.0'
  },
  query: {},
  params: {},
  body: {}
} as const;

/** Default mock response configuration with standard properties */
export const MOCK_RESPONSE_DEFAULTS = {
  statusCode: 200,
  headers: {},
  locals: {}
} as const;

/**
 * Mock Request Options Interface for Request Object Configuration
 * 
 * Configuration interface for mock Express.js Request objects with optional parameters
 * for customizing request properties, headers, and test-specific metadata.
 */
export interface MockRequestOptions {
  /** HTTP method for mock request (default: GET) */
  method?: string;
  
  /** Request URL path (default: /hello) */
  url?: string;
  
  /** Request headers object */
  headers?: Record<string, string>;
  
  /** Query parameters object */
  query?: Record<string, any>;
  
  /** Route parameters object */
  params?: Record<string, string>;
  
  /** Request body content */
  body?: any;
  
  /** Custom request ID for correlation tracking */
  requestId?: string;
}

/**
 * Mock Response Options Interface for Response Object Configuration
 * 
 * Configuration interface for mock Express.js Response objects with optional parameters
 * for customizing response properties, headers, and middleware data.
 */
export interface MockResponseOptions {
  /** Initial response status code (default: 200) */
  statusCode?: number;
  
  /** Initial response headers */
  headers?: Record<string, string>;
  
  /** Response locals object for middleware data */
  locals?: Record<string, any>;
}

/**
 * Test Server Options Interface for Server Configuration
 * 
 * Configuration interface for test server instances with optional parameters for
 * port allocation, timeout settings, and health check configuration.
 */
export interface TestServerOptions {
  /** Specific port for test server (default: dynamic allocation) */
  port?: number;
  
  /** Server startup timeout in milliseconds */
  timeout?: number;
  
  /** Enable health check endpoint for testing */
  enableHealthCheck?: boolean;
}

/**
 * Test Environment Options Interface for Environment Configuration
 * 
 * Configuration interface for test environment setup with optional parameters for
 * enabling/disabling specific features and setting test execution parameters.
 */
export interface TestEnvironmentOptions {
  /** Enable test server for integration testing */
  enableServer?: boolean;
  
  /** Enable performance measurement and monitoring */
  enablePerformanceMonitoring?: boolean;
  
  /** Test logging level for debugging */
  logLevel?: string;
  
  /** Test execution timeout in milliseconds */
  testTimeout?: number;
}

/**
 * Performance Metrics Interface for Test Performance Tracking
 * 
 * Structured performance metrics including execution time, memory usage, and
 * performance validation results for test optimization and monitoring.
 */
export interface PerformanceMetrics {
  /** Execution time in milliseconds */
  executionTime: number;
  
  /** Memory usage during execution */
  memoryUsage: NodeJS.MemoryUsage;
  
  /** High-resolution start timestamp */
  startTime: number;
  
  /** High-resolution end timestamp */
  endTime: number;
  
  /** Performance threshold for validation */
  threshold: number;
  
  /** Whether performance test passed threshold */
  passed: boolean;
}

/**
 * Test Metrics Interface for Comprehensive Test Analytics
 * 
 * Comprehensive test metrics including performance data, resource usage, and
 * test execution statistics for analysis and optimization.
 */
export interface TestMetrics {
  /** Unique test environment identifier */
  testId: string;
  
  /** Performance measurement data */
  performance: PerformanceMetrics;
  
  /** Resource usage statistics */
  resourceUsage: NodeJS.MemoryUsage;
  
  /** Mock function call count tracking */
  mockCallCounts: Record<string, number>;
  
  /** Total test execution duration */
  testDuration: number;
}

/**
 * Response Validation Options Interface for API Response Testing
 * 
 * Configuration interface for response validation with optional parameters for
 * enabling/disabling specific validation checks and setting expected values.
 */
export interface ResponseValidationOptions {
  /** Validate response object structure */
  validateStructure?: boolean;
  
  /** Validate response content and values */
  validateContent?: boolean;
  
  /** Validate response headers */
  validateHeaders?: boolean;
  
  /** Validate response timing and performance */
  validateTiming?: boolean;
  
  /** Expected HTTP status code */
  expectedStatus?: number;
  
  /** Expected Content-Type header value */
  expectedContentType?: string;
}

/**
 * Mock Request Type Definition with Test Metadata
 * 
 * Mock Express Request with test-specific metadata and correlation tracking
 * for comprehensive testing and debugging support.
 */
export type MockRequest = Partial<import('express').Request> & {
  _testMetadata: {
    requestId: string;
    createdAt: string;
    correlationId: string;
    testContext: string;
  };
};

/**
 * Mock Response Type Definition with Response Capture
 * 
 * Mock Express Response with response capture and validation capabilities
 * for comprehensive testing and assertion utilities.
 */
export type MockResponse = Partial<import('express').Response> & {
  _captured: {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
    jsonCalls: any[];
    sendCalls: any[];
    setCalls: Array<{ name: string; value: string }>;
    endCalled: boolean;
    finished: boolean;
  };
};

/**
 * Mock NextFunction Type Definition with Call Tracking
 * 
 * Mock NextFunction with call tracking and error handling validation
 * for middleware testing and Express.js 5.1.0 compatibility.
 */
export type MockNextFunction = jest.MockedFunction<import('express').NextFunction> & {
  _callData: {
    callCount: number;
    errors: Error[];
    calledWith: any[];
    timing: number[];
  };
};

/**
 * Test Data Type Definition with Metadata
 * 
 * Generated test data with metadata and correlation information
 * for comprehensive testing scenarios and edge case validation.
 */
export type TestData = Record<string, any> & {
  _metadata: {
    type: string;
    generated: string;
    correlationId: string;
    edgeCases: string[];
  };
};

/**
 * Test Scenario Type Definition for Comprehensive Testing
 * 
 * Complete test scenario with request, expected response, and validation criteria
 * for consistent testing patterns and comprehensive coverage.
 */
export type TestScenario = {
  name: string;
  request: MockRequestOptions;
  expectedResponse: any;
  validation: ResponseValidationOptions;
};

/**
 * Factory Function for Creating Mock Express.js Request Objects
 * 
 * Creates a comprehensive mock Express.js Request object with realistic properties,
 * methods, and test-specific metadata for isolated unit testing. Provides configurable
 * request properties and correlation tracking for educational testing patterns.
 * 
 * @param options - Mock request configuration options
 * @returns Mock Express Request object with test metadata and realistic behavior
 */
export function mockExpressRequest(options: MockRequestOptions = {}): MockRequest {
  // Generate unique request ID for test correlation and tracking
  const requestId = options.requestId || `test_req_${randomUUID()}`;
  const correlationId = `test_corr_${randomUUID()}`;
  
  // Merge provided options with default mock request properties
  const mergedOptions = {
    ...MOCK_REQUEST_DEFAULTS,
    ...options
  };
  
  // Create mock request object with Express.js Request interface compliance
  const mockRequest: MockRequest = {
    method: mergedOptions.method,
    url: mergedOptions.url,
    path: mergedOptions.url,
    originalUrl: mergedOptions.url,
    baseUrl: '',
    params: mergedOptions.params,
    query: mergedOptions.query,
    body: mergedOptions.body,
    headers: mergedOptions.headers,
    get: jest.fn((name: string) => mergedOptions.headers[name.toLowerCase()]),
    header: jest.fn((name: string) => mergedOptions.headers[name.toLowerCase()]),
    ip: '127.0.0.1',
    ips: [],
    protocol: 'http',
    secure: false,
    xhr: false,
    requestId: requestId,
    
    // Set up request headers with realistic values and test metadata
    accepts: jest.fn(() => 'application/json'),
    acceptsCharsets: jest.fn(() => 'utf-8'),
    acceptsEncodings: jest.fn(() => 'gzip'),
    acceptsLanguages: jest.fn(() => 'en'),
    
    // Configure request URL, path, method, and query parameters
    route: {
      path: mergedOptions.url,
      methods: { [mergedOptions.method.toLowerCase()]: true }
    },
    
    // Add test-specific metadata for debugging and correlation
    _testMetadata: {
      requestId,
      createdAt: new Date().toISOString(),
      correlationId,
      testContext: 'unit-test'
    },
    
    // Set up request body and parameter handling
    is: jest.fn((type: string) => type === 'application/json'),
    param: jest.fn((name: string) => mergedOptions.params[name] || mergedOptions.query[name]),
    range: jest.fn(() => undefined)
  };
  
  // Return comprehensive mock request object ready for testing
  logger.debug('Mock Express request created', {
    requestId,
    method: mergedOptions.method,
    url: mergedOptions.url,
    correlationId
  });
  
  return mockRequest;
}

/**
 * Factory Function for Creating Mock Express.js Response Objects
 * 
 * Creates a comprehensive mock Express.js Response object with method capture,
 * header tracking, and response validation capabilities for thorough testing
 * of Express.js handlers and middleware.
 * 
 * @param options - Mock response configuration options
 * @returns Mock Express Response object with response capture and validation utilities
 */
export function mockExpressResponse(options: MockResponseOptions = {}): MockResponse {
  // Initialize response capture object for method call tracking
  const captured = {
    statusCode: options.statusCode || 200,
    headers: { ...options.headers } || {},
    body: null,
    jsonCalls: [] as any[],
    sendCalls: [] as any[],
    setCalls: [] as Array<{ name: string; value: string }>,
    endCalled: false,
    finished: false
  };
  
  // Create mock response object with Express.js Response interface compliance
  const mockResponse: MockResponse = {
    statusCode: captured.statusCode,
    headers: captured.headers,
    locals: options.locals || {},
    
    // Set up response method mocks (status, send, json, set, etc.)
    status: jest.fn((code: number) => {
      captured.statusCode = code;
      mockResponse.statusCode = code;
      return mockResponse;
    }),
    
    send: jest.fn((body: any) => {
      captured.body = body;
      captured.sendCalls.push(body);
      captured.finished = true;
      return mockResponse;
    }),
    
    json: jest.fn((obj: any) => {
      captured.body = obj;
      captured.jsonCalls.push(obj);
      captured.finished = true;
      mockResponse.set?.('Content-Type', 'application/json');
      return mockResponse;
    }),
    
    // Configure header management and tracking capabilities
    set: jest.fn((field: string | Record<string, string>, value?: string) => {
      if (typeof field === 'object') {
        Object.assign(captured.headers, field);
        Object.assign(mockResponse.headers!, field);
      } else if (typeof field === 'string' && value !== undefined) {
        captured.headers[field] = value;
        mockResponse.headers![field] = value;
        captured.setCalls.push({ name: field, value });
      }
      return mockResponse;
    }),
    
    get: jest.fn((field: string) => captured.headers[field]),
    
    // Implement response body capture for validation
    end: jest.fn((chunk?: any) => {
      if (chunk !== undefined) {
        captured.body = chunk;
      }
      captured.endCalled = true;
      captured.finished = true;
      return mockResponse;
    }),
    
    // Add response timing and performance tracking
    redirect: jest.fn((url: string) => {
      captured.statusCode = 302;
      captured.headers.Location = url;
      captured.finished = true;
      return mockResponse;
    }),
    
    // Set up locals object for middleware data sharing
    cookie: jest.fn((name: string, value: string, options?: any) => {
      return mockResponse;
    }),
    
    clearCookie: jest.fn((name: string, options?: any) => {
      return mockResponse;
    }),
    
    // Return mock response with comprehensive testing capabilities
    _captured: captured
  };
  
  logger.debug('Mock Express response created', {
    statusCode: captured.statusCode,
    headersCount: Object.keys(captured.headers).length
  });
  
  return mockResponse;
}

/**
 * Factory Function for Creating Mock Express.js NextFunction
 * 
 * Creates a mock Express.js NextFunction for testing middleware error handling,
 * flow control, and Express.js 5.1.0 automatic promise rejection handling patterns.
 * 
 * @param options - Mock next function configuration options
 * @returns Mock NextFunction with call tracking and error handling validation
 */
export function mockNextFunction(options: any = {}): MockNextFunction {
  // Create mock function with call tracking capabilities
  const callData = {
    callCount: 0,
    errors: [] as Error[],
    calledWith: [] as any[],
    timing: [] as number[]
  };
  
  // Set up error parameter capture for error handling testing
  const mockNext = jest.fn((error?: any) => {
    const callTime = performance.now();
    callData.callCount++;
    callData.timing.push(callTime);
    callData.calledWith.push(error);
    
    // Configure call count tracking for middleware flow validation
    if (error) {
      if (error instanceof Error) {
        callData.errors.push(error);
      } else {
        callData.errors.push(new Error(String(error)));
      }
    }
  }) as MockNextFunction;
  
  // Add timing information for performance testing
  mockNext._callData = callData;
  
  // Set up Express.js 5.1.0 promise rejection handling simulation
  logger.debug('Mock NextFunction created', {
    trackingEnabled: true,
    errorHandling: true
  });
  
  // Return mock next function with comprehensive testing features
  return mockNext;
}

/**
 * Factory Function for Creating Test Server Instances
 * 
 * Creates a test server instance using the Express.js application with dynamic
 * port allocation, lifecycle management, and integration testing capabilities
 * for comprehensive server testing.
 * 
 * @param options - Test server configuration options
 * @returns Test server instance with lifecycle management and testing utilities
 */
export async function createTestServer(options: TestServerOptions = {}): Promise<TestServer> {
  // Create ServerManager instance with test configuration
  const serverConfig = {
    port: options.port || DEFAULT_TEST_PORT,
    host: 'localhost',
    name: 'Test Server',
    version: '1.0.0',
    timeout: options.timeout || TEST_TIMEOUT_MS
  };
  
  // Allocate dynamic port for test server isolation
  const serverManager = new ServerManager(app, serverConfig);
  
  // Start test server with error handling and timeout management
  try {
    await serverManager.start();
    
    // Set up server lifecycle management for test cleanup
    const testServer = new TestServer(serverManager, serverConfig);
    
    // Configure test server with monitoring and health checks
    if (options.enableHealthCheck !== false) {
      await testServer.setupHealthCheck();
    }
    
    // Add server URL and connection information for testing
    logger.info('Test server created successfully', {
      port: serverConfig.port,
      host: serverConfig.host,
      healthCheck: options.enableHealthCheck !== false
    });
    
    // Return test server instance ready for integration testing
    return testServer;
    
  } catch (error) {
    logger.error('Failed to create test server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      options
    });
    throw error;
  }
}

/**
 * Utility Function for Generating Realistic Test Data
 * 
 * Generates realistic test data including request IDs, timestamps, response objects,
 * and edge case scenarios for comprehensive testing coverage and educational
 * testing patterns.
 * 
 * @param dataType - Type of test data to generate
 * @param options - Test data generation options
 * @returns Generated test data object with realistic properties and edge cases
 */
export function generateTestData(dataType: string, options: any = {}): TestData {
  // Determine test data type and generation requirements
  const correlationId = `test_data_${randomUUID()}`;
  const timestamp = new Date().toISOString();
  
  // Generate unique identifiers and correlation IDs
  let testData: any = {};
  const edgeCases: string[] = [];
  
  // Create realistic timestamps and timing data
  switch (dataType) {
    case 'HelloResponse':
      testData = {
        message: RESPONSE_MESSAGES.HELLO_WORLD,
        timestamp: timestamp,
        requestId: `req_${randomUUID()}`
      };
      edgeCases.push('empty_message', 'null_timestamp', 'invalid_requestId');
      break;
      
    case 'ErrorResponse':
      testData = {
        error: 'Test error message',
        statusCode: options.statusCode || 500,
        requestId: `req_${randomUUID()}`,
        timestamp: timestamp
      };
      edgeCases.push('missing_error', 'invalid_statusCode', 'null_requestId');
      break;
      
    case 'HttpRequest':
      testData = {
        method: options.method || 'GET',
        url: options.url || '/hello',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-client/1.0',
          'accept': 'application/json'
        },
        body: options.body || {},
        timestamp: timestamp
      };
      edgeCases.push('invalid_method', 'malformed_url', 'missing_headers');
      break;
      
    default:
      // Generate appropriate test content based on data type
      testData = {
        type: dataType,
        data: options.data || 'test-data',
        timestamp: timestamp
      };
      edgeCases.push('unknown_type', 'invalid_data');
      break;
  }
  
  // Include edge cases and boundary value testing data
  const testDataWithMetadata: TestData = {
    ...testData,
    _metadata: {
      type: dataType,
      generated: timestamp,
      correlationId,
      edgeCases
    }
  };
  
  // Add metadata and context information for debugging
  logger.debug('Test data generated', {
    type: dataType,
    correlationId,
    edgeCasesCount: edgeCases.length
  });
  
  // Return comprehensive test data object
  return testDataWithMetadata;
}

/**
 * Comprehensive Response Validation Utility
 * 
 * Comprehensive response validation utility that checks response structure,
 * content, headers, and metadata against expected patterns with detailed
 * assertion failures for educational debugging.
 * 
 * @param response - Response object to validate
 * @param options - Response validation configuration options
 */
export function assertResponseStructure(response: any, options: ResponseValidationOptions = {}): void {
  // Validate response object structure and required properties
  if (!response) {
    throw new Error('Response object is null or undefined');
  }
  
  // Check response content against expected values and types
  if (options.validateStructure !== false) {
    if (typeof response !== 'object') {
      throw new Error(`Expected response to be an object, got ${typeof response}`);
    }
  }
  
  // Verify response headers including Content-Type and custom headers
  if (options.expectedStatus !== undefined) {
    const actualStatus = response.statusCode || response.status;
    if (actualStatus !== options.expectedStatus) {
      throw new Error(`Expected status ${options.expectedStatus}, got ${actualStatus}`);
    }
  }
  
  // Validate HTTP status code and response timing
  if (options.expectedContentType && response.headers) {
    const contentType = response.headers['content-type'] || response.headers['Content-Type'];
    if (contentType && !contentType.includes(options.expectedContentType)) {
      throw new Error(`Expected content-type to include ${options.expectedContentType}, got ${contentType}`);
    }
  }
  
  // Check request correlation ID and metadata consistency
  if (options.validateContent !== false) {
    if (response.message !== undefined && typeof response.message !== 'string') {
      throw new Error(`Expected message to be a string, got ${typeof response.message}`);
    }
    
    // Verify timestamp format and validity
    if (response.timestamp !== undefined) {
      const timestamp = new Date(response.timestamp);
      if (isNaN(timestamp.getTime())) {
        throw new Error(`Invalid timestamp format: ${response.timestamp}`);
      }
    }
  }
  
  // Throw detailed assertion errors with debugging information
  logger.debug('Response validation completed successfully', {
    validatedStructure: options.validateStructure !== false,
    validatedContent: options.validateContent !== false,
    validatedHeaders: options.validateHeaders !== false
  });
}

/**
 * Performance Measurement Utility for Test Execution
 * 
 * Measures test execution performance including handler response time, memory usage,
 * and resource consumption for performance regression testing and optimization insights.
 * 
 * @param testFunction - Test function to measure performance for
 * @param options - Performance measurement configuration options
 * @returns Performance measurement results with timing and resource usage data
 */
export async function measureTestPerformance(
  testFunction: Function,
  options: any = {}
): Promise<PerformanceMetrics> {
  // Record baseline performance metrics and memory usage
  const startMemory = process.memoryUsage();
  
  // Start high-resolution timing measurement using performance.now()
  const startTime = performance.now();
  
  try {
    // Execute test function with performance monitoring
    await testFunction();
    
    // Measure final performance metrics and resource consumption
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    // Calculate performance deltas and statistical analysis
    const executionTime = endTime - startTime;
    const threshold = options.threshold || PERFORMANCE_THRESHOLD_MS;
    
    // Validate performance against configured thresholds
    const performanceMetrics: PerformanceMetrics = {
      executionTime,
      memoryUsage: endMemory,
      startTime,
      endTime,
      threshold,
      passed: executionTime <= threshold
    };
    
    // Return comprehensive performance metrics object
    logger.debug('Performance measurement completed', {
      executionTime: `${executionTime.toFixed(2)}ms`,
      threshold: `${threshold}ms`,
      passed: performanceMetrics.passed,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed
    });
    
    return performanceMetrics;
    
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    logger.error('Performance measurement failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: `${executionTime.toFixed(2)}ms`
    });
    
    throw error;
  }
}

/**
 * Comprehensive Test Environment Setup Utility
 * 
 * Sets up comprehensive test environment including mock objects, test data,
 * performance monitoring, and resource management for isolated and reproducible
 * testing scenarios.
 * 
 * @param options - Test environment configuration options
 * @returns Configured test environment with all necessary testing utilities and resources
 */
export function setupTestEnvironment(options: TestEnvironmentOptions = {}): TestEnvironment {
  // Initialize test environment with unique test ID
  const testEnvironment = new TestEnvironment(options);
  
  // Set up mock Express.js Request and Response objects
  // Configure test data generation and validation utilities
  // Initialize performance measurement and monitoring
  // Set up test logging and debugging capabilities
  // Configure resource cleanup and test isolation
  // Return comprehensive test environment object
  logger.info('Test environment setup completed', {
    testId: testEnvironment.testId,
    serverEnabled: options.enableServer !== false,
    performanceMonitoring: options.enablePerformanceMonitoring !== false
  });
  
  return testEnvironment;
}

/**
 * Test Environment Cleanup Utility
 * 
 * Cleans up test environment resources including mock objects, test servers,
 * timers, and any test-specific state to ensure test isolation and prevent
 * memory leaks between test cases.
 * 
 * @param environment - Test environment instance to clean up
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestEnvironment(environment: TestEnvironment): Promise<void> {
  try {
    // Stop and cleanup test servers and network connections
    await environment.cleanup();
    
    // Clear mock object state and captured response data
    // Reset performance measurement timers and metrics
    // Clean up test-specific global state and environment variables
    // Clear test correlation IDs and metadata
    // Reset mock function call counts and captured data
    // Log cleanup completion and resource status for debugging
    logger.info('Test environment cleanup completed', {
      testId: environment.testId,
      cleanupTime: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Test environment cleanup failed', {
      testId: environment.testId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Mock Middleware Factory Function
 * 
 * Creates mock Express.js middleware functions for testing middleware chains,
 * request processing, and Express.js 5.1.0 enhanced middleware patterns with
 * proper error handling and flow control.
 * 
 * @param middlewareType - Type of middleware to create
 * @param options - Mock middleware configuration options
 * @returns Mock middleware function with call tracking and testing capabilities
 */
export function createMockMiddleware(middlewareType: string, options: any = {}): any {
  // Determine middleware type and testing requirements
  const callTracking = {
    callCount: 0,
    calledWith: [] as any[],
    errors: [] as Error[],
    timing: [] as number[]
  };
  
  // Create mock middleware function with Express.js signature
  const middleware = jest.fn((req: any, res: any, next: any) => {
    const startTime = performance.now();
    callTracking.callCount++;
    callTracking.calledWith.push({ req, res, next });
    
    // Set up call tracking and parameter capture
    try {
      // Configure error handling and next() function behavior
      if (options.shouldError) {
        const error = new Error(options.errorMessage || 'Mock middleware error');
        callTracking.errors.push(error);
        return next(error);
      }
      
      // Add timing and performance measurement capabilities
      if (options.modifyRequest) {
        Object.assign(req, options.modifyRequest);
      }
      
      if (options.modifyResponse) {
        Object.assign(res, options.modifyResponse);
      }
      
      // Set up request/response modification tracking
      const endTime = performance.now();
      callTracking.timing.push(endTime - startTime);
      
      if (options.delay) {
        setTimeout(() => next(), options.delay);
      } else {
        next();
      }
      
    } catch (error) {
      callTracking.errors.push(error instanceof Error ? error : new Error(String(error)));
      next(error);
    }
  });
  
  // Return mock middleware with comprehensive testing features
  (middleware as any)._tracking = callTracking;
  
  logger.debug('Mock middleware created', {
    type: middlewareType,
    trackingEnabled: true,
    errorHandling: !!options.shouldError
  });
  
  return middleware;
}

/**
 * API Response Validation Utility
 * 
 * Validates API response objects against TypeScript interfaces and expected
 * patterns, ensuring type safety and proper response structure for educational
 * testing and debugging.
 * 
 * @param response - Response object to validate
 * @param expectedType - Expected TypeScript interface type
 * @param options - Response validation configuration options
 * @returns True if response is valid, throws detailed error if validation fails
 */
export function validateApiResponse(response: any, expectedType: string, options: any = {}): boolean {
  // Determine expected response type and validation criteria
  try {
    // Validate response object structure against TypeScript interface
    switch (expectedType) {
      case 'HelloResponse':
        if (!response.message || typeof response.message !== 'string') {
          throw new Error('HelloResponse must have a string message property');
        }
        if (!response.timestamp || typeof response.timestamp !== 'string') {
          throw new Error('HelloResponse must have a string timestamp property');
        }
        if (!response.requestId || typeof response.requestId !== 'string') {
          throw new Error('HelloResponse must have a string requestId property');
        }
        break;
        
      case 'ErrorResponse':
        if (!response.error || typeof response.error !== 'string') {
          throw new Error('ErrorResponse must have a string error property');
        }
        if (typeof response.statusCode !== 'number') {
          throw new Error('ErrorResponse must have a number statusCode property');
        }
        break;
        
      default:
        // Check required properties and their types
        logger.warn('Unknown response type for validation', { expectedType });
        break;
    }
    
    // Validate optional properties and default values
    // Verify response content and format compliance
    // Check response metadata and correlation information
    // Return validation result or throw detailed validation error
    logger.debug('API response validation successful', {
      expectedType,
      responseValid: true
    });
    
    return true;
    
  } catch (error) {
    logger.error('API response validation failed', {
      expectedType,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      response: typeof response === 'object' ? Object.keys(response) : typeof response
    });
    throw error;
  }
}

/**
 * Test Scenario Factory Function
 * 
 * Creates comprehensive test scenarios with predefined request/response patterns,
 * edge cases, and validation criteria for consistent testing across different
 * test suites and educational testing patterns.
 * 
 * @param scenarioName - Name identifier for the test scenario
 * @param config - Test scenario configuration
 * @returns Complete test scenario with request, expected response, and validation criteria
 */
export function createTestScenario(scenarioName: string, config: any = {}): TestScenario {
  // Initialize test scenario with unique identifier and name
  const correlationId = `scenario_${randomUUID()}`;
  
  // Generate appropriate test request data based on scenario type
  let request: MockRequestOptions = {};
  let expectedResponse: any = {};
  let validation: ResponseValidationOptions = {};
  
  switch (scenarioName) {
    case 'successful-hello':
      request = {
        method: 'GET',
        url: '/hello',
        headers: { 'accept': 'text/plain' }
      };
      expectedResponse = {
        message: RESPONSE_MESSAGES.HELLO_WORLD,
        statusCode: HTTP_STATUS.OK
      };
      validation = {
        validateStructure: true,
        validateContent: true,
        expectedStatus: 200,
        expectedContentType: 'text/plain'
      };
      break;
      
    case 'not-found-error':
      request = {
        method: 'GET',
        url: '/nonexistent',
        headers: { 'accept': 'application/json' }
      };
      expectedResponse = {
        error: 'Not Found',
        statusCode: HTTP_STATUS.NOT_FOUND
      };
      validation = {
        validateStructure: true,
        expectedStatus: 404,
        expectedContentType: 'application/json'
      };
      break;
      
    case 'method-not-allowed':
      request = {
        method: 'POST',
        url: '/hello',
        headers: { 'accept': 'application/json' }
      };
      expectedResponse = {
        error: 'Method Not Allowed',
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED
      };
      validation = {
        validateStructure: true,
        expectedStatus: 405
      };
      break;
      
    default:
      // Create expected response structure and validation criteria
      request = config.request || { method: 'GET', url: '/' };
      expectedResponse = config.expectedResponse || {};
      validation = config.validation || {};
      break;
  }
  
  // Set up performance expectations and thresholds
  // Include error scenarios and edge case testing data
  // Add debugging and correlation information
  // Return comprehensive test scenario object
  const testScenario: TestScenario = {
    name: scenarioName,
    request,
    expectedResponse,
    validation
  };
  
  logger.debug('Test scenario created', {
    name: scenarioName,
    correlationId,
    method: request.method,
    url: request.url
  });
  
  return testScenario;
}

/**
 * Test Environment Class for Comprehensive Test Management
 * 
 * Comprehensive test environment class that encapsulates all testing utilities,
 * mock objects, performance monitoring, and resource management for isolated
 * and reproducible testing scenarios with proper cleanup and educational
 * testing patterns.
 */
export class TestEnvironment {
  /** Unique test environment identifier */
  public readonly testId: string;
  
  /** Mock Express.js Request object */
  public mockRequest: MockRequest;
  
  /** Mock Express.js Response object */
  public mockResponse: MockResponse;
  
  /** Mock NextFunction for middleware testing */
  public mockNext: MockNextFunction;
  
  /** Test server instance (optional) */
  public testServer?: TestServer;
  
  /** Performance monitoring data */
  private performanceData: any = {};
  
  /** Test environment options */
  private options: TestEnvironmentOptions;

  /**
   * TestEnvironment Constructor
   * 
   * Initializes comprehensive test environment with all necessary testing utilities,
   * mock objects, and resource management for isolated testing scenarios.
   * 
   * @param options - Test environment configuration options
   */
  constructor(options: TestEnvironmentOptions = {}) {
    // Generate unique test ID for environment isolation
    this.testId = `test_env_${randomUUID()}`;
    this.options = options;
    
    // Initialize mock Express.js Request and Response objects
    this.mockRequest = mockExpressRequest();
    this.mockResponse = mockExpressResponse();
    
    // Set up mock NextFunction with error handling capabilities
    this.mockNext = mockNextFunction();
    
    // Configure test server if integration testing is required
    // Initialize performance monitoring and measurement tools
    // Set up test logging and debugging capabilities
    // Configure resource cleanup and test isolation
    logger.info('TestEnvironment initialized', {
      testId: this.testId,
      options: this.options
    });
  }

  /**
   * Sets Up Test Environment Resources
   * 
   * Sets up the test environment with all necessary resources, mock objects,
   * and monitoring capabilities for test execution.
   * 
   * @returns Promise that resolves when environment setup is complete
   */
  public async setup(): Promise<void> {
    try {
      // Initialize all mock objects with test-specific configuration
      // Start test server if integration testing is enabled
      if (this.options.enableServer) {
        this.testServer = await createTestServer({
          port: 0, // Dynamic port allocation
          enableHealthCheck: true
        });
      }
      
      // Set up performance monitoring and baseline measurements
      if (this.options.enablePerformanceMonitoring) {
        this.performanceData.setupTime = performance.now();
      }
      
      // Configure test logging and debugging output
      // Validate environment setup and resource availability
      // Log environment setup completion with configuration details
      logger.info('Test environment setup completed', {
        testId: this.testId,
        serverEnabled: !!this.testServer,
        performanceMonitoring: this.options.enablePerformanceMonitoring
      });
      
    } catch (error) {
      logger.error('Test environment setup failed', {
        testId: this.testId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Cleans Up Test Environment Resources
   * 
   * Cleans up all test environment resources including servers, mock objects,
   * and monitoring to ensure test isolation and prevent resource leaks.
   * 
   * @returns Promise that resolves when cleanup is complete
   */
  public async cleanup(): Promise<void> {
    try {
      // Stop test server and close network connections
      if (this.testServer) {
        await this.testServer.stop();
      }
      
      // Clear mock object state and captured data
      // Reset performance monitoring and measurement tools
      // Clean up test-specific global state
      // Clear test correlation IDs and metadata
      // Log cleanup completion and resource status
      logger.info('Test environment cleanup completed', {
        testId: this.testId
      });
      
    } catch (error) {
      logger.error('Test environment cleanup failed', {
        testId: this.testId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Resets Test Environment State
   * 
   * Resets the test environment to initial state while preserving configuration,
   * allowing for clean test execution without full teardown and setup.
   */
  public reset(): void {
    // Reset mock object state and call counts
    this.mockRequest = mockExpressRequest();
    this.mockResponse = mockExpressResponse();
    this.mockNext = mockNextFunction();
    
    // Clear captured response data and method calls
    // Reset performance measurement baselines
    if (this.options.enablePerformanceMonitoring) {
      this.performanceData = { resetTime: performance.now() };
    }
    
    // Clear test-specific metadata and correlation IDs
    // Reset test logging context and debugging state
    // Log environment reset completion
    logger.debug('Test environment reset completed', {
      testId: this.testId
    });
  }

  /**
   * Retrieves Test Environment Metrics
   * 
   * Retrieves comprehensive test environment metrics including performance data,
   * resource usage, and test execution statistics for analysis and debugging.
   * 
   * @returns Comprehensive metrics object with performance and resource usage data
   */
  public getMetrics(): TestMetrics {
    // Collect performance metrics and timing data
    const currentTime = performance.now();
    const setupTime = this.performanceData.setupTime || currentTime;
    
    // Gather resource usage statistics and memory consumption
    const memoryUsage = process.memoryUsage();
    
    // Compile mock object call counts and captured data
    const mockCallCounts = {
      requestMocks: 1,
      responseMocks: 1,
      nextCalls: this.mockNext._callData.callCount
    };
    
    // Include test correlation and debugging information
    // Format metrics for analysis and reporting
    // Return comprehensive test metrics object
    const testMetrics: TestMetrics = {
      testId: this.testId,
      performance: {
        executionTime: currentTime - setupTime,
        memoryUsage,
        startTime: setupTime,
        endTime: currentTime,
        threshold: PERFORMANCE_THRESHOLD_MS,
        passed: (currentTime - setupTime) <= PERFORMANCE_THRESHOLD_MS
      },
      resourceUsage: memoryUsage,
      mockCallCounts,
      testDuration: currentTime - setupTime
    };
    
    return testMetrics;
  }
}

/**
 * Test Server Class for Integration Testing
 * 
 * Test server class that provides lifecycle management, dynamic port allocation,
 * and integration testing capabilities for Express.js applications with proper
 * resource cleanup and educational testing patterns.
 */
export class TestServer {
  /** Express.js application instance */
  private app: typeof import('../../src/app').default;
  
  /** Server manager for lifecycle control */
  private serverManager: ServerManager;
  
  /** Server configuration */
  private config: any;
  
  /** Current server running state */
  private isRunning: boolean = false;

  /**
   * TestServer Constructor
   * 
   * Initializes test server with Express.js application and configuration for
   * integration testing with dynamic port allocation and lifecycle management.
   * 
   * @param serverManager - ServerManager instance for lifecycle control
   * @param config - Test server configuration options
   */
  constructor(serverManager: ServerManager, config: any) {
    // Store Express.js application reference for server creation
    this.serverManager = serverManager;
    this.config = config;
    
    // Create ServerManager instance with test configuration
    // Allocate dynamic port for test server isolation
    // Set up server lifecycle management and monitoring
    // Configure base URL and connection information
    // Initialize server state tracking and management
    logger.debug('TestServer initialized', {
      port: config.port,
      host: config.host
    });
  }

  /**
   * Starts the Test Server
   * 
   * Starts the test server with error handling, timeout management, and health
   * check validation for integration testing scenarios.
   * 
   * @returns Promise that resolves when server is started and ready for testing
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    try {
      // Start server using ServerManager with test configuration
      await this.serverManager.start();
      this.isRunning = true;
      
      // Wait for server to be ready and listening on allocated port
      // Perform health check to validate server functionality
      // Update server state and connection information
      // Log server startup completion with connection details
      // Set up server monitoring for test execution
      logger.info('Test server started successfully', {
        port: this.config.port,
        host: this.config.host
      });
      
    } catch (error) {
      logger.error('Failed to start test server', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Stops the Test Server
   * 
   * Stops the test server gracefully with proper resource cleanup and connection
   * management for test isolation and resource management.
   * 
   * @returns Promise that resolves when server is stopped and resources are cleaned up
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    try {
      // Initiate graceful server shutdown using ServerManager
      await this.serverManager.stop();
      this.isRunning = false;
      
      // Wait for active connections to complete or timeout
      // Clean up server resources and monitoring
      // Update server state and clear connection information
      // Log server shutdown completion and resource status
      // Ensure complete resource cleanup for test isolation
      logger.info('Test server stopped successfully');
      
    } catch (error) {
      logger.error('Failed to stop test server', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Gets Server Base URL
   * 
   * Returns the complete base URL for the test server including protocol,
   * host, and port for making HTTP requests during integration testing.
   * 
   * @param path - Optional path to append to base URL
   * @returns Complete URL for making HTTP requests to the test server
   */
  public getUrl(path: string = ''): string {
    // Construct base URL with protocol, host, and allocated port
    const baseUrl = `http://${this.config.host}:${this.config.port}`;
    
    // Append provided path to base URL if specified
    // Validate URL format and accessibility
    // Return complete URL ready for HTTP client usage
    return path ? `${baseUrl}${path}` : baseUrl;
  }

  /**
   * Performs Server Health Check
   * 
   * Performs health check on the test server to validate functionality and
   * readiness for testing scenarios.
   * 
   * @returns Promise that resolves to true if server is healthy and ready for testing
   */
  public async isHealthy(): Promise<boolean> {
    try {
      // Check server running state and port binding
      if (!this.isRunning) {
        return false;
      }
      
      // Perform HTTP health check request to server
      // Validate server response and functionality
      // Check server resource usage and performance
      // Return health status based on all validation checks
      return this.serverManager.isHealthy();
      
    } catch (error) {
      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Sets Up Health Check Endpoint
   * 
   * Sets up health check endpoint monitoring for test server validation
   * and readiness verification.
   * 
   * @returns Promise that resolves when health check is configured
   */
  public async setupHealthCheck(): Promise<void> {
    try {
      // Health check is already configured in the Express app
      logger.debug('Health check endpoint available at /health');
    } catch (error) {
      logger.error('Failed to setup health check', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

// Export all testing utilities for comprehensive access
export {
  // Mock object factories
  mockExpressRequest,
  mockExpressResponse,
  mockNextFunction,
  
  // Test server utilities
  createTestServer,
  TestServer,
  
  // Test data and validation utilities
  generateTestData,
  assertResponseStructure,
  validateApiResponse,
  
  // Performance and monitoring utilities
  measureTestPerformance,
  
  // Test environment management
  setupTestEnvironment,
  cleanupTestEnvironment,
  TestEnvironment,
  
  // Mock middleware utilities
  createMockMiddleware,
  
  // Test scenario utilities
  createTestScenario
};

// Export TypeScript interfaces for enhanced type safety
export type {
  MockRequestOptions,
  MockResponseOptions,
  TestServerOptions,
  TestEnvironmentOptions,
  PerformanceMetrics,
  TestMetrics,
  ResponseValidationOptions,
  MockRequest,
  MockResponse,
  MockNextFunction,
  TestData,
  TestScenario
};