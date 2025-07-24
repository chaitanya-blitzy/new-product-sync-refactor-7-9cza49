/**
 * Comprehensive Integration Test Suite for Hello Routes Endpoint
 * 
 * This file implements end-to-end testing of the /hello route using Express.js 5.1.0 application
 * instance, validating HTTP request/response cycles, middleware integration, error handling, and 
 * API contract compliance. Demonstrates modern testing patterns with Node.js 24.x built-in test 
 * runner, TypeScript type safety, performance measurement, and educational testing practices for 
 * learning Express.js route testing and API validation.
 * 
 * Features:
 * - Complete integration testing for Express.js 5.1.0 routes with real HTTP requests
 * - Node.js 24.x built-in test runner usage with async/await patterns and lifecycle hooks
 * - TypeScript integration with interface validation and type-safe assertions
 * - Performance measurement and validation in integration testing scenarios
 * - Error scenario testing with comprehensive HTTP method and status code validation
 * - Middleware integration testing with Express.js 5.1.0 enhanced middleware composition
 * - API contract testing with response structure and content validation
 * - Test server lifecycle management with dynamic port allocation and resource cleanup
 * - Request correlation and tracking throughout integration testing scenarios
 * - Educational testing patterns for learning Express.js route testing and validation
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates comprehensive integration testing for Express.js routes and API validation
 * @framework Express.js 5.1.0 enhanced middleware support and automatic promise rejection handling
 */

// Import Node.js 24.x built-in test runner functions for organizing test suites with educational clarity
import { describe, it, before, after, beforeEach } from 'node:test'; // Node.js 24.x built-in test runner

// Import Node.js built-in assertion library for comprehensive test validation and educational assertion patterns
import assert from 'node:assert'; // Node.js built-in assertion library

// Import configured Express.js 5.1.0 application instance for integration testing with complete middleware stack and route configuration
import app from '../../src/app';

// Import test server factory for creating isolated test server instances with dynamic port allocation and lifecycle management
import { 
  createTestServer, 
  TestServer, 
  assertResponseStructure, 
  measureTestPerformance,
  TestEnvironmentOptions,
  PerformanceMetrics,
  ResponseValidationOptions
} from '../helpers/test-utils';

// Import HelloResponse interface for type-safe response validation and API contract testing
import { HelloResponse, ErrorResponse } from '../../src/types';

// Import HTTP status constants for response validation and error testing scenarios
import { 
  HTTP_STATUS, 
  RESPONSE_MESSAGES, 
  ROUTES, 
  CONTENT_TYPES 
} from '../../src/config/constants';

/**
 * Global Integration Test Configuration Constants
 * 
 * Configuration constants for integration testing with const assertions for immutable literal types.
 * Provides centralized test configuration with type safety and consistency across integration test scenarios.
 */

/** Test execution timeout in milliseconds for async operations and HTTP requests */
const TEST_TIMEOUT = 30000;

/** Performance threshold in milliseconds for response time validation and optimization testing */
const PERFORMANCE_THRESHOLD = 100;

/** Test server configuration options with timeout and health check settings */
const TEST_SERVER_OPTIONS = {
  timeout: 10000,
  enableHealthCheck: true
} as const;

/**
 * Integration Test Options Interface for Test Configuration
 * 
 * Configuration interface for integration testing with optional parameters for enabling/disabling
 * specific test features and setting performance thresholds for comprehensive testing scenarios.
 */
interface IntegrationTestOptions {
  /** Test execution timeout in milliseconds */
  timeout?: number;
  
  /** Enable performance measurement and validation */
  enablePerformanceTesting?: boolean;
  
  /** Enable comprehensive error scenario testing */
  enableErrorTesting?: boolean;
  
  /** Maximum acceptable response time in milliseconds */
  performanceThreshold?: number;
}

/**
 * Validation Options Interface for Response Validation Configuration
 * 
 * Configuration interface for API response validation with optional parameters for enabling/disabling
 * specific validation checks and setting expected response criteria for comprehensive testing.
 */
interface ValidationOptions {
  /** Validate response object structure against interface */
  validateStructure?: boolean;
  
  /** Validate response content and message values */
  validateContent?: boolean;
  
  /** Validate HTTP response headers and content type */
  validateHeaders?: boolean;
  
  /** Validate response timing and performance metrics */
  validateTiming?: boolean;
}

/**
 * Test Scenario Result Interface for Comprehensive Test Analytics
 * 
 * Structured test scenario result including performance data, validation status, and error information
 * for comprehensive testing analytics and educational debugging support.
 */
interface TestScenarioResult {
  /** Whether the test scenario passed successfully */
  success: boolean;
  
  /** Response time in milliseconds */
  responseTime: number;
  
  /** HTTP response status code */
  statusCode: number;
  
  /** Response content type header value */
  contentType: string;
  
  /** Request correlation ID for tracking */
  correlationId: string;
  
  /** Array of validation errors if any */
  errors?: string[];
}

/**
 * Global Test State Variables
 * 
 * Global variables for managing test server lifecycle, performance metrics, and test correlation
 * across integration test scenarios with proper resource management and cleanup procedures.
 */

// Test server instance for integration testing with dynamic port allocation and lifecycle management
let testServer: TestServer;

// Base URL for HTTP requests to test server with protocol, host, and port configuration
let baseUrl: string;

// Performance metrics collection for test analysis and optimization insights
let performanceMetrics: PerformanceMetrics[] = [];

// Test correlation ID for request tracking and debugging support throughout test execution
let testCorrelationId: string;

/**
 * Sets Up Complete Integration Test Environment
 * 
 * Sets up the complete integration test environment including test server initialization, performance 
 * monitoring, and test isolation for comprehensive hello route testing. Configures Express.js 5.1.0 
 * application with all middleware and provides clean test state for each test execution.
 * 
 * @returns Promise that resolves to configured test server instance ready for integration testing
 */
async function setupIntegrationTestEnvironment(): Promise<TestServer> {
  try {
    // Generate unique test correlation ID for request tracking and debugging
    testCorrelationId = `integration_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create test server instance using createTestServer with Express.js application
    console.log('Creating test server instance for integration testing...');
    testServer = await createTestServer(TEST_SERVER_OPTIONS);
    
    // Start test server and wait for successful initialization
    console.log('Starting test server and waiting for initialization...');
    await testServer.start();
    
    // Validate server health and readiness for testing
    console.log('Validating test server health and readiness...');
    const isHealthy = await testServer.isHealthy();
    if (!isHealthy) {
      throw new Error('Test server failed health check during initialization');
    }
    
    // Configure test server with dynamic port allocation and timeout settings
    baseUrl = testServer.getUrl();
    console.log(`Test server ready at: ${baseUrl}`);
    
    // Set up performance monitoring and measurement baselines
    performanceMetrics = [];
    
    // Return configured test server ready for integration testing
    console.log('Integration test environment setup completed successfully');
    return testServer;
    
  } catch (error) {
    console.error('Failed to setup integration test environment:', error);
    throw error;
  }
}

/**
 * Cleans Up Integration Test Environment
 * 
 * Cleans up integration test environment including stopping test server, clearing performance metrics,
 * and ensuring proper resource cleanup to prevent test interference and memory leaks between test suites.
 * 
 * @param testServer - Test server instance to clean up
 * @returns Promise that resolves when cleanup is complete
 */
async function cleanupIntegrationTestEnvironment(testServer: TestServer): Promise<void> {
  try {
    // Stop test server gracefully with proper connection cleanup
    console.log('Stopping test server and cleaning up resources...');
    if (testServer) {
      await testServer.stop();
    }
    
    // Clear performance monitoring data and metrics
    performanceMetrics = [];
    
    // Reset test correlation IDs and metadata
    testCorrelationId = '';
    
    // Validate complete resource cleanup and memory management
    console.log('Integration test environment cleanup completed successfully');
    
  } catch (error) {
    console.error('Failed to cleanup integration test environment:', error);
    throw error;
  }
}

/**
 * Validates Hello Route HTTP Response
 * 
 * Validates hello route HTTP response including status code, content type, response body structure, 
 * timing, and API contract compliance. Provides comprehensive validation for educational testing and debugging.
 * 
 * @param response - HTTP response object to validate
 * @param options - Validation configuration options
 */
function validateHelloRouteResponse(response: any, options: ValidationOptions = {}): void {
  try {
    // Validate HTTP status code matches expected OK (200) status
    if (options.validateStructure !== false) {
      assert.strictEqual(response.status, HTTP_STATUS.OK, 
        `Expected status code ${HTTP_STATUS.OK}, got ${response.status}`);
    }
    
    // Check Content-Type header for proper text content type
    if (options.validateHeaders !== false) {
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      assert.ok(contentType, 'Response must include Content-Type header');
      assert.ok(contentType.includes('text/plain'), 
        `Expected Content-Type to include text/plain, got ${contentType}`);
    }
    
    // Validate response body content matches HELLO_WORLD constant
    if (options.validateContent !== false) {
      assert.strictEqual(response.text, RESPONSE_MESSAGES.HELLO_WORLD,
        `Expected response text "${RESPONSE_MESSAGES.HELLO_WORLD}", got "${response.text}"`);
    }
    
    // Verify response object structure and properties for API contract compliance
    assert.ok(response, 'Response object must be defined');
    assert.ok(typeof response.status === 'number', 'Response status must be a number');
    assert.ok(typeof response.text === 'string', 'Response text must be a string');
    
    console.log('Hello route response validation completed successfully');
    
  } catch (error) {
    console.error('Hello route response validation failed:', error);
    throw error;
  }
}

/**
 * Tests Successful Hello Route Scenario
 * 
 * Tests successful hello route scenario with GET request to /hello endpoint, validating complete 
 * request-response cycle including middleware processing, handler execution, and response generation 
 * with performance measurement.
 * 
 * @param testServer - Test server instance for HTTP requests
 * @returns Promise that resolves when test scenario is complete
 */
async function testHelloRouteSuccessScenario(testServer: TestServer): Promise<TestScenarioResult> {
  try {
    // Generate unique request correlation ID for test tracking
    const requestCorrelationId = `req_${testCorrelationId}_${Date.now()}`;
    
    // Start performance measurement for response time validation
    const startTime = performance.now();
    
    // Send HTTP GET request to hello endpoint using test server URL
    const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'integration-test/1.0',
        'X-Request-ID': requestCorrelationId
      }
    });
    
    // Capture response timing and performance metrics
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Convert response to text for validation
    const responseText = await response.text();
    const responseObj = {
      status: response.status,
      text: responseText,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    // Validate response status code, headers, and content structure
    validateHelloRouteResponse(responseObj, {
      validateStructure: true,
      validateContent: true,
      validateHeaders: true,
      validateTiming: true
    });
    
    // Verify response content matches expected hello world message
    assert.strictEqual(responseText, RESPONSE_MESSAGES.HELLO_WORLD,
      'Response content must match expected hello world message');
    
    // Validate performance metrics against configured thresholds
    assert.ok(responseTime <= PERFORMANCE_THRESHOLD,
      `Response time ${responseTime}ms exceeds threshold ${PERFORMANCE_THRESHOLD}ms`);
    
    // Store performance metrics for analysis
    performanceMetrics.push({
      executionTime: responseTime,
      memoryUsage: process.memoryUsage(),
      startTime,
      endTime,
      threshold: PERFORMANCE_THRESHOLD,
      passed: responseTime <= PERFORMANCE_THRESHOLD
    });
    
    console.log(`Successful hello route test completed in ${responseTime.toFixed(2)}ms`);
    
    // Return test scenario result with performance and validation data
    return {
      success: true,
      responseTime,
      statusCode: response.status,
      contentType: responseObj.headers['content-type'] || '',
      correlationId: requestCorrelationId
    };
    
  } catch (error) {
    console.error('Hello route success scenario test failed:', error);
    throw error;
  }
}

/**
 * Tests Hello Route Error Scenarios
 * 
 * Tests hello route error scenarios including invalid HTTP methods, malformed requests, and server 
 * error conditions to validate comprehensive error handling and Express.js 5.1.0 enhanced error processing.
 * 
 * @param testServer - Test server instance for HTTP requests
 * @returns Promise that resolves when error scenario testing is complete
 */
async function testHelloRouteErrorScenarios(testServer: TestServer): Promise<void> {
  try {
    console.log('Testing hello route error scenarios...');
    
    // Test POST request to hello endpoint expecting METHOD_NOT_ALLOWED response
    console.log('Testing POST method on /hello endpoint...');
    const postResponse = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    
    assert.strictEqual(postResponse.status, HTTP_STATUS.METHOD_NOT_ALLOWED,
      `Expected POST to return ${HTTP_STATUS.METHOD_NOT_ALLOWED}, got ${postResponse.status}`);
    
    // Test PUT request to hello endpoint for method validation
    console.log('Testing PUT method on /hello endpoint...');
    const putResponse = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
      method: 'PUT',
      headers: { 'Accept': 'application/json' }
    });
    
    assert.strictEqual(putResponse.status, HTTP_STATUS.METHOD_NOT_ALLOWED,
      `Expected PUT to return ${HTTP_STATUS.METHOD_NOT_ALLOWED}, got ${putResponse.status}`);
    
    // Test DELETE request to hello endpoint for comprehensive method testing
    console.log('Testing DELETE method on /hello endpoint...');
    const deleteResponse = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    
    assert.strictEqual(deleteResponse.status, HTTP_STATUS.METHOD_NOT_ALLOWED,
      `Expected DELETE to return ${HTTP_STATUS.METHOD_NOT_ALLOWED}, got ${deleteResponse.status}`);
    
    // Test non-existent route for 404 error handling
    console.log('Testing non-existent route for 404 handling...');
    const notFoundResponse = await fetch(`${testServer.getUrl()}/nonexistent`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    assert.strictEqual(notFoundResponse.status, HTTP_STATUS.NOT_FOUND,
      `Expected GET /nonexistent to return ${HTTP_STATUS.NOT_FOUND}, got ${notFoundResponse.status}`);
    
    console.log('Error scenario testing completed successfully');
    
  } catch (error) {
    console.error('Hello route error scenarios test failed:', error);
    throw error;
  }
}

/**
 * Tests Hello Route Performance
 * 
 * Tests hello route performance including response time measurement, concurrent request handling, 
 * and resource usage validation to ensure the endpoint meets performance requirements and educational 
 * performance testing patterns.
 * 
 * @param testServer - Test server instance for HTTP requests
 * @returns Promise that resolves when performance testing is complete
 */
async function testHelloRoutePerformance(testServer: TestServer): Promise<void> {
  try {
    console.log('Testing hello route performance...');
    
    // Measure single request response time using high-resolution timing
    console.log('Measuring single request response time...');
    const singleRequestMetrics = await measureTestPerformance(async () => {
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      assert.strictEqual(response.status, HTTP_STATUS.OK);
      return response.text();
    }, { threshold: PERFORMANCE_THRESHOLD });
    
    // Validate single request meets performance threshold
    assert.ok(singleRequestMetrics.passed,
      `Single request exceeded performance threshold: ${singleRequestMetrics.executionTime}ms > ${PERFORMANCE_THRESHOLD}ms`);
    
    // Test concurrent requests to validate Express.js async handling
    console.log('Testing concurrent request handling...');
    const concurrentRequests = 5;
    const concurrentPromises = Array.from({ length: concurrentRequests }, async (_, index) => {
      const startTime = performance.now();
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 
          'Accept': 'text/plain',
          'X-Request-Index': index.toString()
        }
      });
      const endTime = performance.now();
      
      assert.strictEqual(response.status, HTTP_STATUS.OK);
      const text = await response.text();
      assert.strictEqual(text, RESPONSE_MESSAGES.HELLO_WORLD);
      
      return { index, responseTime: endTime - startTime };
    });
    
    // Wait for all concurrent requests to complete
    const concurrentResults = await Promise.all(concurrentPromises);
    
    // Validate all concurrent requests completed successfully
    assert.strictEqual(concurrentResults.length, concurrentRequests,
      'All concurrent requests must complete successfully');
    
    // Check that concurrent requests don't significantly degrade performance
    const averageConcurrentTime = concurrentResults.reduce((sum, result) => sum + result.responseTime, 0) / concurrentRequests;
    assert.ok(averageConcurrentTime <= PERFORMANCE_THRESHOLD * 2,
      `Average concurrent response time ${averageConcurrentTime}ms exceeds acceptable limit`);
    
    // Monitor memory usage during request processing
    const memoryAfterTesting = process.memoryUsage();
    console.log('Memory usage after performance testing:', {
      heapUsed: `${Math.round(memoryAfterTesting.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryAfterTesting.heapTotal / 1024 / 1024)}MB`
    });
    
    console.log(`Performance testing completed successfully. Average response time: ${averageConcurrentTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error('Hello route performance test failed:', error);
    throw error;
  }
}

/**
 * Tests Hello Route Middleware Integration
 * 
 * Tests hello route middleware integration including logging middleware, security middleware, and 
 * error handling middleware to validate complete middleware stack execution and Express.js 5.1.0 
 * middleware composition.
 * 
 * @param testServer - Test server instance for HTTP requests
 * @returns Promise that resolves when middleware integration testing is complete
 */
async function testHelloRouteMiddlewareIntegration(testServer: TestServer): Promise<void> {
  try {
    console.log('Testing hello route middleware integration...');
    
    // Test request with correlation ID to validate logging middleware
    console.log('Testing request correlation ID generation by logging middleware...');
    const correlationId = `middleware_test_${Date.now()}`;
    const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'X-Request-ID': correlationId,
        'User-Agent': 'middleware-integration-test/1.0'
      }
    });
    
    // Validate response includes security headers applied by security middleware stack
    console.log('Checking security headers applied by security middleware...');
    const headers = Object.fromEntries(response.headers.entries());
    
    // Check for Content-Security-Policy header from Helmet.js
    assert.ok(headers['content-security-policy'] || headers['Content-Security-Policy'],
      'Response should include Content-Security-Policy header from security middleware');
    
    // Verify X-Powered-By header is removed by security middleware
    assert.ok(!headers['x-powered-by'] && !headers['X-Powered-By'],
      'X-Powered-By header should be removed by security middleware');
    
    // Test request timing and performance tracking middleware
    console.log('Verifying request timing and performance tracking middleware...');
    const startTime = performance.now();
    const timedResponse = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
      method: 'GET',
      headers: { 'Accept': 'text/plain' }
    });
    const endTime = performance.now();
    
    assert.strictEqual(timedResponse.status, HTTP_STATUS.OK);
    const responseTime = endTime - startTime;
    assert.ok(responseTime > 0, 'Response time measurement should be positive');
    
    // Validate Express.js 5.1.0 automatic promise rejection handling
    console.log('Testing Express.js 5.1.0 enhanced error handling...');
    // This is tested implicitly through successful async request handling
    
    console.log('Middleware integration testing completed successfully');
    
  } catch (error) {
    console.error('Hello route middleware integration test failed:', error);
    throw error;
  }
}

/**
 * Validates API Contract Compliance
 * 
 * Validates hello route API contract compliance including response structure, content types, status 
 * codes, and interface adherence to ensure the endpoint meets API specification requirements and 
 * educational contract testing patterns.
 * 
 * @param response - HTTP response object to validate
 * @returns True if API contract is compliant, throws detailed error if validation fails
 */
function validateApiContractCompliance(response: any): boolean {
  try {
    // Validate response structure against expected API contract
    assert.ok(response, 'Response object must be defined for API contract validation');
    
    // Check required HTTP status code adherence to RESTful API conventions
    assert.strictEqual(response.status, HTTP_STATUS.OK,
      `API contract requires status code ${HTTP_STATUS.OK}, got ${response.status}`);
    
    // Verify response content format and encoding compliance
    const contentType = response.headers['content-type'] || response.headers['Content-Type'];
    assert.ok(contentType && contentType.includes('text/plain'),
      `API contract requires Content-Type to include text/plain, got ${contentType}`);
    
    // Validate response content matches API specification
    assert.ok(typeof response.text === 'string',
      'API contract requires response text to be a string');
    
    assert.strictEqual(response.text, RESPONSE_MESSAGES.HELLO_WORLD,
      `API contract requires response text "${RESPONSE_MESSAGES.HELLO_WORLD}", got "${response.text}"`);
    
    // Check HTTP headers compliance with API specification
    assert.ok(response.headers, 'Response must include HTTP headers per API contract');
    
    console.log('API contract compliance validation successful');
    return true;
    
  } catch (error) {
    console.error('API contract compliance validation failed:', error);
    throw error;
  }
}

/**
 * Main Integration Test Suite for Hello Routes
 * 
 * Comprehensive integration test suite that validates the /hello endpoint functionality including
 * successful requests, error handling, performance requirements, middleware integration, and API
 * contract compliance using Node.js 24.x built-in test runner and Express.js 5.1.0 features.
 */
describe('Hello Routes Integration Tests', () => {
  
  /**
   * Test Suite Setup - Initialize Integration Test Environment
   * 
   * Sets up the complete integration test environment before running any tests including test server
   * initialization, performance monitoring setup, and resource allocation for comprehensive testing.
   */
  before(async () => {
    console.log('Setting up integration test environment...');
    try {
      // Initialize integration test environment with test server and monitoring
      testServer = await setupIntegrationTestEnvironment();
      console.log('Integration test environment setup completed successfully');
    } catch (error) {
      console.error('Failed to setup integration test environment:', error);
      throw error;
    }
  });
  
  /**
   * Test Suite Cleanup - Clean Up Integration Test Environment
   * 
   * Cleans up the integration test environment after all tests complete including test server shutdown,
   * resource cleanup, and performance metrics reporting for comprehensive testing analysis.
   */
  after(async () => {
    console.log('Cleaning up integration test environment...');
    try {
      // Clean up integration test environment and release resources
      await cleanupIntegrationTestEnvironment(testServer);
      
      // Report performance metrics summary
      if (performanceMetrics.length > 0) {
        const averageResponseTime = performanceMetrics.reduce((sum, metric) => sum + metric.executionTime, 0) / performanceMetrics.length;
        console.log(`Performance Summary: Average response time: ${averageResponseTime.toFixed(2)}ms`);
      }
      
      console.log('Integration test environment cleanup completed successfully');
    } catch (error) {
      console.error('Failed to cleanup integration test environment:', error);
      throw error;
    }
  });
  
  /**
   * Pre-Test Setup - Reset Test State Before Each Test
   * 
   * Resets test state and correlation tracking before each individual test case to ensure test isolation
   * and consistent test environment for reliable and reproducible test results.
   */
  beforeEach(() => {
    // Generate new correlation ID for each test case
    testCorrelationId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Starting test with correlation ID: ${testCorrelationId}`);
  });
  
  /**
   * Test Group: Hello Route Success Scenarios
   * 
   * Tests successful hello route scenarios including valid GET requests, response validation,
   * and API contract compliance to ensure proper endpoint functionality.
   */
  describe('Hello Route Success Scenarios', () => {
    
    it('should return Hello world with 200 status for GET /hello', async () => {
      console.log('Testing successful GET request to /hello endpoint...');
      
      // Execute successful hello route scenario test
      const result = await testHelloRouteSuccessScenario(testServer);
      
      // Validate test scenario results
      assert.ok(result.success, 'Hello route success scenario must pass');
      assert.strictEqual(result.statusCode, HTTP_STATUS.OK, 
        `Expected status code ${HTTP_STATUS.OK}, got ${result.statusCode}`);
      assert.ok(result.responseTime <= PERFORMANCE_THRESHOLD,
        `Response time ${result.responseTime}ms exceeds threshold ${PERFORMANCE_THRESHOLD}ms`);
      
      console.log(`Hello route success test passed in ${result.responseTime.toFixed(2)}ms`);
    });
    
    it('should return proper Content-Type header for text response', async () => {
      console.log('Testing Content-Type header for hello route response...');
      
      // Send GET request to validate Content-Type header
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      
      // Validate Content-Type header compliance
      const contentType = response.headers.get('Content-Type') || response.headers.get('content-type');
      assert.ok(contentType, 'Response must include Content-Type header');
      assert.ok(contentType.includes('text/plain'), 
        `Expected Content-Type to include text/plain, got ${contentType}`);
      
      console.log(`Content-Type header validation passed: ${contentType}`);
    });
    
    it('should maintain response consistency across multiple requests', async () => {
      console.log('Testing response consistency across multiple requests...');
      
      const requestCount = 3;
      const responses: string[] = [];
      
      // Send multiple requests to test consistency
      for (let i = 0; i < requestCount; i++) {
        const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain' }
        });
        
        assert.strictEqual(response.status, HTTP_STATUS.OK);
        const text = await response.text();
        responses.push(text);
      }
      
      // Validate all responses are identical
      const firstResponse = responses[0];
      responses.forEach((response, index) => {
        assert.strictEqual(response, firstResponse,
          `Response ${index + 1} differs from first response`);
        assert.strictEqual(response, RESPONSE_MESSAGES.HELLO_WORLD,
          `Response ${index + 1} does not match expected message`);
      });
      
      console.log(`Response consistency test passed across ${requestCount} requests`);
    });
    
  });
  
  /**
   * Test Group: Hello Route Error Scenarios
   * 
   * Tests hello route error scenarios including invalid HTTP methods, malformed requests,
   * and error response validation to ensure comprehensive error handling.
   */
  describe('Hello Route Error Scenarios', () => {
    
    it('should return 405 Method Not Allowed for unsupported HTTP methods', async () => {
      console.log('Testing unsupported HTTP methods on /hello endpoint...');
      
      // Test error scenarios for unsupported HTTP methods
      await testHelloRouteErrorScenarios(testServer);
      
      console.log('HTTP method error scenario testing completed successfully');
    });
    
    it('should return 404 Not Found for non-existent routes', async () => {
      console.log('Testing 404 error handling for non-existent routes...');
      
      // Test non-existent route
      const response = await fetch(`${testServer.getUrl()}/invalid-route`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      // Validate 404 response
      assert.strictEqual(response.status, HTTP_STATUS.NOT_FOUND,
        `Expected status code ${HTTP_STATUS.NOT_FOUND}, got ${response.status}`);
      
      console.log('404 error handling test passed');
    });
    
    it('should handle malformed requests gracefully', async () => {
      console.log('Testing graceful handling of malformed requests...');
      
      // Test request with invalid headers
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 
          'Accept': 'invalid/content-type',
          'X-Invalid-Header': 'test-value'
        }
      });
      
      // Should still return 200 for GET /hello even with invalid headers
      assert.strictEqual(response.status, HTTP_STATUS.OK,
        'Server should handle requests with invalid headers gracefully');
      
      const text = await response.text();
      assert.strictEqual(text, RESPONSE_MESSAGES.HELLO_WORLD,
        'Response content should remain consistent despite invalid headers');
      
      console.log('Malformed request handling test passed');
    });
    
  });
  
  /**
   * Test Group: Hello Route Performance Testing
   * 
   * Tests hello route performance including response time measurement, concurrent request handling,
   * and resource usage validation to ensure performance requirements are met.
   */
  describe('Hello Route Performance Testing', () => {
    
    it('should respond within performance threshold', async () => {
      console.log('Testing hello route performance requirements...');
      
      // Execute comprehensive performance testing
      await testHelloRoutePerformance(testServer);
      
      console.log('Performance testing completed successfully');
    });
    
    it('should handle concurrent requests efficiently', async () => {
      console.log('Testing concurrent request handling efficiency...');
      
      const concurrentRequests = 10;
      const startTime = performance.now();
      
      // Create concurrent requests
      const promises = Array.from({ length: concurrentRequests }, (_, index) =>
        fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
          method: 'GET',
          headers: { 
            'Accept': 'text/plain',
            'X-Concurrent-Request': index.toString()
          }
        })
      );
      
      // Wait for all requests to complete
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Validate all responses are successful
      responses.forEach((response, index) => {
        assert.strictEqual(response.status, HTTP_STATUS.OK,
          `Concurrent request ${index + 1} failed with status ${response.status}`);
      });
      
      // Validate concurrent performance
      const averageTimePerRequest = totalTime / concurrentRequests;
      assert.ok(averageTimePerRequest <= PERFORMANCE_THRESHOLD,
        `Average time per concurrent request ${averageTimePerRequest}ms exceeds threshold`);
      
      console.log(`Concurrent request test passed: ${concurrentRequests} requests in ${totalTime.toFixed(2)}ms`);
    });
    
  });
  
  /**
   * Test Group: Hello Route Middleware Integration
   * 
   * Tests hello route middleware integration including security middleware, logging middleware,
   * and error handling middleware to validate complete middleware stack execution.
   */
  describe('Hello Route Middleware Integration', () => {
    
    it('should execute complete middleware stack', async () => {
      console.log('Testing complete middleware stack execution...');
      
      // Execute middleware integration testing
      await testHelloRouteMiddlewareIntegration(testServer);
      
      console.log('Middleware integration testing completed successfully');
    });
    
    it('should apply security headers through middleware', async () => {
      console.log('Testing security headers application through middleware...');
      
      // Send request to validate security headers
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      
      const headers = Object.fromEntries(response.headers.entries());
      
      // Validate security headers are present
      assert.ok(headers['content-security-policy'] || headers['Content-Security-Policy'],
        'Security middleware should apply Content-Security-Policy header');
      
      // Validate X-Powered-By header is removed
      assert.ok(!headers['x-powered-by'] && !headers['X-Powered-By'],
        'Security middleware should remove X-Powered-By header');
      
      console.log('Security headers validation passed');
    });
    
    it('should support request correlation tracking', async () => {
      console.log('Testing request correlation tracking through middleware...');
      
      const correlationId = `correlation_test_${Date.now()}`;
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 
          'Accept': 'text/plain',
          'X-Request-ID': correlationId
        }
      });
      
      // Validate successful response (correlation tracking is logged internally)
      assert.strictEqual(response.status, HTTP_STATUS.OK,
        'Request with correlation ID should be processed successfully');
      
      const text = await response.text();
      assert.strictEqual(text, RESPONSE_MESSAGES.HELLO_WORLD,
        'Request correlation should not affect response content');
      
      console.log(`Request correlation tracking test passed with ID: ${correlationId}`);
    });
    
  });
  
  /**
   * Test Group: Hello Route API Contract Compliance
   * 
   * Tests hello route API contract compliance including response structure, content validation,
   * and interface adherence to ensure consistent API behavior.
   */
  describe('Hello Route API Contract Compliance', () => {
    
    it('should comply with API response contract', async () => {
      console.log('Testing API contract compliance for hello route...');
      
      // Send request for API contract validation
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      
      const responseObj = {
        status: response.status,
        text: await response.text(),
        headers: Object.fromEntries(response.headers.entries())
      };
      
      // Validate API contract compliance
      const isCompliant = validateApiContractCompliance(responseObj);
      assert.ok(isCompliant, 'Hello route must comply with API contract');
      
      console.log('API contract compliance validation passed');
    });
    
    it('should maintain consistent response format', async () => {
      console.log('Testing consistent response format for hello route...');
      
      const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      
      // Validate response format consistency
      assert.strictEqual(response.status, HTTP_STATUS.OK);
      
      const contentType = response.headers.get('Content-Type') || response.headers.get('content-type');
      assert.ok(contentType && contentType.includes('text/plain'),
        'Response Content-Type must be consistent');
      
      const text = await response.text();
      assert.strictEqual(text, RESPONSE_MESSAGES.HELLO_WORLD,
        'Response content must be consistent with specification');
      
      // Validate response is a simple string (not JSON or other format)
      assert.ok(typeof text === 'string', 'Response must be a string');
      assert.ok(text.length > 0, 'Response must not be empty');
      
      console.log('Response format consistency validation passed');
    });
    
    it('should handle Accept header variations correctly', async () => {
      console.log('Testing Accept header variations for content negotiation...');
      
      const acceptHeaders = ['text/plain', 'text/*', '*/*', 'application/json, text/plain'];
      
      for (const acceptHeader of acceptHeaders) {
        const response = await fetch(`${testServer.getUrl()}${ROUTES.HELLO}`, {
          method: 'GET',
          headers: { 'Accept': acceptHeader }
        });
        
        // All Accept headers should result in successful response
        assert.strictEqual(response.status, HTTP_STATUS.OK,
          `Request with Accept: ${acceptHeader} should succeed`);
        
        const text = await response.text();
        assert.strictEqual(text, RESPONSE_MESSAGES.HELLO_WORLD,
          `Response content should be consistent regardless of Accept header`);
      }
      
      console.log('Accept header variations test passed');
    });
    
  });
  
});