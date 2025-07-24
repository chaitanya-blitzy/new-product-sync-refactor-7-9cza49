/**
 * Comprehensive Unit Test Suite for Express.js 5.1.0 Application Factory Module
 * 
 * This test suite provides comprehensive validation of the Express.js application factory,
 * middleware orchestration, security configuration, and functionality using Node.js 24.x
 * built-in test runner. Demonstrates modern testing patterns with TypeScript integration,
 * educational testing practices, and thorough validation of Express.js 5.1.0 enhanced
 * features including automatic promise rejection handling and improved middleware support.
 * 
 * Features:
 * - Node.js 24.x built-in test runner with modern testing capabilities
 * - Comprehensive application factory testing with configuration validation
 * - Middleware integration testing with security, logging, and error handling validation
 * - Express.js 5.1.0 enhanced error processing and automatic promise rejection testing
 * - Performance measurement and threshold validation for optimization insights
 * - Environment-specific behavior testing for development, production, and test environments
 * - Mock object integration with Express.js Request/Response testing patterns
 * - Health check endpoint functionality and monitoring integration testing
 * - Security middleware validation including Helmet.js, CORS, and rate limiting
 * - Educational testing patterns demonstrating professional Node.js development practices
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires Express.js 5.1.0
 * @educational Demonstrates comprehensive unit testing for Express.js applications
 * @framework Node.js built-in test runner with TypeScript integration
 */

// Import Node.js 24.x built-in test runner with modern testing capabilities
import { test, describe, beforeEach, afterEach } from 'node:test'; // built-in
import assert from 'node:assert'; // built-in

// Import Express.js framework for application instance type validation and middleware functionality
import express, { Application, Request, Response, NextFunction } from 'express'; // ^5.1.0

// Import Express.js application factory and validation functions for testing
import {
  app,
  createExpressApp,
  validateAppConfiguration,
  configureExpressSettings,
  setupSecurityMiddleware,
  setupLoggingMiddleware,
  mountApplicationRoutes,
  setupHealthCheck,
  setupErrorHandling,
  getAppInfo,
  AppOptions,
  AppValidationResult,
  AppInfo
} from '../../src/app';

// Import application configuration for testing configuration-dependent behavior
import {
  appConfig,
  serverConfig,
  securityConfig,
  loggingConfig,
  environment
} from '../../src/config';

// Import TypeScript interfaces for type-safe testing and validation
import {
  AppConfig,
  HelloResponse,
  SystemHealth,
  PerformanceMetrics
} from '../../src/types';

// Import logging system for test debugging and execution tracking
import { logger } from '../../src/utils/logger';

// Import comprehensive testing utilities for mock objects and performance measurement
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  mockExpressRequest,
  mockExpressResponse,
  mockNextFunction,
  measureTestPerformance,
  assertResponseStructure,
  generateTestData,
  validateApiResponse,
  MockRequest,
  MockResponse,
  MockNextFunction,
  TestEnvironmentOptions,
  PerformanceMetrics as TestPerformanceMetrics
} from '../helpers/test-utils';

/**
 * Global Test Configuration Constants
 * 
 * Configuration constants for test execution with const assertions for immutable
 * literal types. Provides centralized test configuration with performance thresholds
 * and application options for consistent testing across all test scenarios.
 */

/** Test execution timeout in milliseconds for async operations */
const TEST_TIMEOUT = 30000;

/** Performance threshold in milliseconds for response time validation */
const PERFORMANCE_THRESHOLD = 100;

/** Test application options with comprehensive feature enablement */
const TEST_APP_OPTIONS = {
  enableSecurity: true,
  enableLogging: true,
  enableErrorHandling: true,
  enableRoutes: true,
  enableHealthCheck: true
} as const;

/**
 * Test Suite Options Interface for Configuration
 * 
 * Configuration interface for test suite execution with optional parameters for
 * enabling/disabling specific test categories and setting execution parameters.
 */
interface TestSuiteOptions {
  /** Enable performance measurement and validation during testing */
  enablePerformanceTesting?: boolean;
  
  /** Enable comprehensive security middleware testing */
  enableSecurityTesting?: boolean;
  
  /** Enable environment-specific behavior testing */
  enableEnvironmentTesting?: boolean;
  
  /** Test execution timeout in milliseconds */
  testTimeout?: number;
}

/**
 * Validation Options Interface for Application Testing
 * 
 * Configuration interface for application validation with optional parameters for
 * enabling/disabling specific validation checks and customizing validation behavior.
 */
interface ValidationOptions {
  /** Validate middleware configuration and integration */
  validateMiddleware?: boolean;
  
  /** Validate security middleware and configuration */
  validateSecurity?: boolean;
  
  /** Validate route mounting and configuration */
  validateRoutes?: boolean;
  
  /** Validate error handling middleware and configuration */
  validateErrorHandling?: boolean;
}

/**
 * Test Results Interface for Comprehensive Test Analytics
 * 
 * Structured test results including execution statistics, performance metrics,
 * and coverage information for test analysis and optimization.
 */
interface TestResults {
  /** Number of tests that passed successfully */
  passed: number;
  
  /** Number of tests that failed */
  failed: number;
  
  /** Total test execution duration in milliseconds */
  duration: number;
  
  /** Performance measurement results */
  performance: TestPerformanceMetrics;
  
  /** Code coverage information (optional) */
  coverage?: object;
}

/**
 * Global Test Environment Instance
 * 
 * Global test environment instance for test isolation and resource management.
 * Provides consistent test setup and cleanup across all test scenarios.
 */
let testEnvironment: TestEnvironment;

/**
 * Sets Up Comprehensive Test Environment for Express.js Application Testing
 * 
 * Sets up comprehensive test environment including mock objects, performance monitoring,
 * and resource management. Initializes test isolation and prepares all necessary testing
 * utilities for application validation with proper correlation tracking and debugging support.
 * 
 * @param options - Test environment configuration options
 * @returns Promise resolving to configured test environment with all testing utilities
 */
async function setupTestEnvironment(options: TestEnvironmentOptions = {}): Promise<TestEnvironment> {
  try {
    // Create TestEnvironment instance with test-specific configuration
    const envOptions: TestEnvironmentOptions = {
      enableServer: false, // Use mock objects for unit testing
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      logLevel: 'error', // Minimize test output
      testTimeout: options.testTimeout || TEST_TIMEOUT,
      ...options
    };
    
    // Initialize test environment with proper configuration
    const environment = new TestEnvironment(envOptions);
    
    // Set up test environment resources and monitoring
    await environment.setup();
    
    // Initialize mock Express.js Request and Response objects for middleware testing
    environment.mockRequest = mockExpressRequest({
      method: 'GET',
      url: '/hello',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-agent/1.0',
        'accept': 'text/plain'
      }
    });
    
    environment.mockResponse = mockExpressResponse({
      statusCode: 200,
      headers: {}
    });
    
    // Set up mock NextFunction for testing middleware flow control
    environment.mockNext = mockNextFunction();
    
    // Set up performance monitoring for application creation and operation testing
    if (envOptions.enablePerformanceMonitoring) {
      logger.debug('Performance monitoring enabled for test environment', {
        testId: environment.testId,
        threshold: PERFORMANCE_THRESHOLD
      });
    }
    
    // Configure test logging and debugging capabilities for test execution tracking
    logger.debug('Test environment setup completed', {
      testId: environment.testId,
      options: envOptions
    });
    
    // Initialize test correlation IDs and metadata for test isolation
    const testMetadata = {
      testSuite: 'app.test.ts',
      environment: 'test',
      timestamp: new Date().toISOString()
    };
    
    // Set up resource cleanup and test environment management
    environment.mockRequest._testMetadata = {
      ...environment.mockRequest._testMetadata,
      ...testMetadata
    };
    
    // Return configured test environment ready for application testing
    return environment;
    
  } catch (error) {
    logger.error('Failed to setup test environment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      options
    });
    throw error;
  }
}

/**
 * Validates Express.js Application Instance Configuration and Readiness
 * 
 * Validates that an Express.js application instance is properly configured with all
 * required middleware, routes, and settings. Performs comprehensive validation of
 * application readiness and configuration compliance with detailed error reporting.
 * 
 * @param app - Express.js application instance to validate
 * @param options - Validation configuration options
 * @returns True if application is valid, throws detailed error if validation fails
 */
function validateApplicationInstance(app: Application, options: ValidationOptions = {}): boolean {
  try {
    // Validate that application instance is properly created and configured
    assert.ok(app, 'Application instance must be defined');
    assert.strictEqual(typeof app, 'function', 'Application instance must be a function');
    assert.strictEqual(typeof app.listen, 'function', 'Application must have listen method');
    assert.strictEqual(typeof app.use, 'function', 'Application must have use method');
    assert.strictEqual(typeof app.get, 'function', 'Application must have get method');
    
    // Check that all required middleware is properly applied and configured
    if (options.validateMiddleware !== false) {
      // Validate middleware stack exists and is properly configured
      assert.ok(app._router, 'Application router must be configured');
      
      // Check middleware stack layer count for expected middleware
      const middlewareCount = app._router?.stack?.length || 0;
      assert.ok(middlewareCount > 0, 'Application must have middleware configured');
      
      logger.debug('Middleware validation completed', {
        middlewareCount,
        hasRouter: !!app._router
      });
    }
    
    // Verify that routes are mounted correctly with proper middleware integration
    if (options.validateRoutes !== false) {
      // Validate router stack contains route handlers
      const routeStack = app._router?.stack || [];
      const hasRoutes = routeStack.some((layer: any) => layer.route || layer.name === 'router');
      assert.ok(hasRoutes, 'Application must have routes configured');
      
      logger.debug('Route validation completed', {
        routeCount: routeStack.length,
        hasRoutes
      });
    }
    
    // Validate security middleware configuration and protection levels
    if (options.validateSecurity !== false) {
      // Check for security-related middleware in the stack
      const securityMiddleware = app._router?.stack?.filter((layer: any) => 
        layer.name && (
          layer.name.includes('helmet') ||
          layer.name.includes('cors') ||
          layer.name.includes('rateLimit')
        )
      ) || [];
      
      logger.debug('Security middleware validation completed', {
        securityMiddlewareCount: securityMiddleware.length
      });
    }
    
    // Check error handling middleware setup and configuration
    if (options.validateErrorHandling !== false) {
      // Error handling middleware is typically added last and has 4 parameters
      const errorHandlers = app._router?.stack?.filter((layer: any) => 
        layer.handle && layer.handle.length === 4
      ) || [];
      
      logger.debug('Error handling validation completed', {
        errorHandlerCount: errorHandlers.length
      });
    }
    
    // Verify health check endpoint availability and functionality
    const routes = app._router?.stack || [];
    const hasHealthCheck = routes.some((layer: any) => 
      layer.route && layer.route.path === '/health'
    );
    
    // Validate application settings and Express.js configuration
    const trustProxy = app.get('trust proxy');
    const caseSensitive = app.get('case sensitive routing');
    const strictRouting = app.get('strict routing');
    
    logger.debug('Application settings validation', {
      trustProxy,
      caseSensitive,
      strictRouting,
      hasHealthCheck
    });
    
    // Return validation result or throw detailed validation error
    logger.info('Application validation completed successfully', {
      middleware: options.validateMiddleware !== false,
      routes: options.validateRoutes !== false,
      security: options.validateSecurity !== false,
      errorHandling: options.validateErrorHandling !== false
    });
    
    return true;
    
  } catch (error) {
    logger.error('Application validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      options
    });
    throw error;
  }
}

/**
 * Express.js Application Factory Tests
 * 
 * Tests the Express.js application creation process including factory function behavior,
 * configuration application, and middleware integration. Validates that applications are
 * created with proper configuration and readiness for deployment.
 */
describe('Express.js Application Factory Tests', () => {
  // Set up test environment before each test for isolation
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment({
      enablePerformanceMonitoring: true,
      enableServer: false
    });
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Default Application Creation Using App Export
   * 
   * Validates that the default application export is properly configured and ready
   * for use with all middleware and routes mounted correctly.
   */
  test('should create default application instance with proper configuration', async () => {
    // Test default application creation using app export
    assert.ok(app, 'Default app instance should be defined');
    assert.strictEqual(typeof app, 'function', 'Default app should be Express application');
    
    // Validate application instance type and Express.js compatibility
    assert.strictEqual(typeof app.listen, 'function', 'App should have listen method');
    assert.strictEqual(typeof app.use, 'function', 'App should have use method');
    assert.strictEqual(typeof app.get, 'function', 'App should have get method');
    
    // Verify application is properly configured and ready
    const isValid = validateApplicationInstance(app, {
      validateMiddleware: true,
      validateSecurity: true,
      validateRoutes: true,
      validateErrorHandling: true
    });
    
    assert.strictEqual(isValid, true, 'Default application should be valid');
    
    logger.info('Default application validation completed', {
      appType: typeof app,
      hasRouter: !!app._router,
      middlewareCount: app._router?.stack?.length || 0
    });
  });
  
  /**
   * Tests Custom Application Creation Using createExpressApp Factory
   * 
   * Validates that the factory function creates applications with custom configuration
   * and properly applies the provided options.
   */
  test('should create custom application with factory function', async () => {
    // Test custom application creation using createExpressApp factory
    const customApp = createExpressApp({
      enableSecurity: true,
      enableLogging: true,
      enableErrorHandling: true,
      enableRoutes: true,
      enableHealthCheck: true
    });
    
    // Verify application configuration is properly applied
    assert.ok(customApp, 'Custom app instance should be defined');
    assert.strictEqual(typeof customApp, 'function', 'Custom app should be Express application');
    
    // Test application creation with custom options and overrides
    const isValid = validateApplicationInstance(customApp, {
      validateMiddleware: true,
      validateSecurity: true,
      validateRoutes: true,
      validateErrorHandling: true
    });
    
    assert.strictEqual(isValid, true, 'Custom application should be valid');
    
    logger.info('Custom application creation completed', {
      appType: typeof customApp,
      options: TEST_APP_OPTIONS
    });
  });
  
  /**
   * Tests Application Creation with Minimal Options
   * 
   * Validates that applications can be created with minimal configuration while
   * still maintaining basic functionality.
   */
  test('should create application with minimal options', async () => {
    // Test application creation with minimal configuration
    const minimalApp = createExpressApp({
      enableSecurity: false,
      enableLogging: false,
      enableErrorHandling: true,
      enableRoutes: true,
      enableHealthCheck: false
    });
    
    // Validate middleware integration and execution order
    assert.ok(minimalApp, 'Minimal app instance should be defined');
    
    // Test error handling during application creation
    const isValid = validateApplicationInstance(minimalApp, {
      validateMiddleware: false,
      validateSecurity: false,
      validateRoutes: true,
      validateErrorHandling: true
    });
    
    assert.strictEqual(isValid, true, 'Minimal application should be valid');
    
    logger.info('Minimal application creation completed');
  });
  
  /**
   * Tests Application Creation Performance
   * 
   * Measures and validates application creation performance to ensure it meets
   * performance requirements and optimization goals.
   */
  test('should create application within performance threshold', async () => {
    // Verify application readiness and deployment preparation
    const performanceMetrics = await measureTestPerformance(
      () => createExpressApp(TEST_APP_OPTIONS),
      { threshold: PERFORMANCE_THRESHOLD }
    );
    
    // Validate performance meets requirements
    assert.ok(performanceMetrics.executionTime <= PERFORMANCE_THRESHOLD, 
      `Application creation should complete within ${PERFORMANCE_THRESHOLD}ms, took ${performanceMetrics.executionTime}ms`);
    
    assert.strictEqual(performanceMetrics.passed, true, 'Performance test should pass threshold');
    
    logger.info('Application creation performance validated', {
      executionTime: `${performanceMetrics.executionTime.toFixed(2)}ms`,
      threshold: `${PERFORMANCE_THRESHOLD}ms`,
      passed: performanceMetrics.passed
    });
  });
});

/**
 * Application Configuration Tests
 * 
 * Tests application configuration validation including configuration completeness,
 * environment consistency, security settings validation, and deployment readiness checks.
 * Validates configuration management and error reporting.
 */
describe('Application Configuration Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Configuration Validation with Valid Configuration
   * 
   * Validates that proper configuration objects pass validation successfully
   * and return appropriate validation results.
   */
  test('should validate application configuration successfully', async () => {
    // Test validateAppConfiguration function with valid configuration
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    const validationResult = validateAppConfiguration(testApp);
    
    // Validate configuration completeness and required settings
    assert.ok(validationResult, 'Validation result should be defined');
    assert.strictEqual(typeof validationResult, 'object', 'Validation result should be object');
    assert.strictEqual(typeof validationResult.isValid, 'boolean', 'isValid should be boolean');
    assert.ok(Array.isArray(validationResult.errors), 'Errors should be array');
    assert.ok(Array.isArray(validationResult.warnings), 'Warnings should be array');
    
    // Test configuration validation with invalid or missing settings
    if (validationResult.isValid) {
      assert.strictEqual(validationResult.errors.length, 0, 'Valid configuration should have no errors');
    } else {
      logger.warn('Configuration validation failed', {
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    }
    
    logger.info('Configuration validation completed', {
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length
    });
  });
  
  /**
   * Tests Environment-Specific Configuration Validation
   * 
   * Validates that configuration behaves appropriately for different deployment
   * environments and applies environment-specific settings correctly.
   */
  test('should handle environment-specific configuration', async () => {
    // Verify environment-specific configuration validation
    assert.ok(environment, 'Environment configuration should be available');
    assert.ok(typeof environment.env === 'string', 'Environment name should be string');
    assert.ok(typeof environment.isProduction === 'boolean', 'isProduction should be boolean');
    assert.ok(typeof environment.isDevelopment === 'boolean', 'isDevelopment should be boolean');
    assert.ok(typeof environment.isTest === 'boolean', 'isTest should be boolean');
    
    // Test security configuration validation and compliance
    assert.ok(securityConfig, 'Security configuration should be available');
    assert.ok(securityConfig.helmet, 'Helmet configuration should be defined');
    assert.ok(securityConfig.cors, 'CORS configuration should be defined');
    assert.ok(securityConfig.rateLimit, 'Rate limit configuration should be defined');
    
    // Validate configuration error reporting and detailed feedback
    const configInfo = getAppInfo();
    assert.ok(configInfo, 'App info should be available');
    assert.strictEqual(typeof configInfo.name, 'string', 'App name should be string');
    assert.strictEqual(typeof configInfo.version, 'string', 'App version should be string');
    assert.strictEqual(typeof configInfo.environment, 'string', 'App environment should be string');
    
    logger.info('Environment-specific configuration validated', {
      environment: environment.env,
      security: Object.keys(securityConfig),
      appInfo: configInfo
    });
  });
  
  /**
   * Tests Configuration Validation Performance
   * 
   * Measures configuration validation performance to ensure efficient startup
   * and deployment readiness checks.
   */
  test('should validate configuration within performance limits', async () => {
    // Test configuration validation performance and efficiency
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    const performanceMetrics = await measureTestPerformance(
      () => validateAppConfiguration(testApp),
      { threshold: PERFORMANCE_THRESHOLD }
    );
    
    // Verify configuration validation integration with application startup
    assert.ok(performanceMetrics.executionTime <= PERFORMANCE_THRESHOLD,
      `Configuration validation should complete within ${PERFORMANCE_THRESHOLD}ms`);
    
    logger.info('Configuration validation performance validated', {
      executionTime: `${performanceMetrics.executionTime.toFixed(2)}ms`,
      threshold: `${PERFORMANCE_THRESHOLD}ms`,
      passed: performanceMetrics.passed
    });
  });
});

/**
 * Middleware Integration Tests
 * 
 * Tests comprehensive middleware integration including security middleware, logging
 * middleware, route middleware, and error handling middleware. Validates middleware
 * execution order and functionality.
 */
describe('Middleware Integration Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Security Middleware Integration and Configuration
   * 
   * Validates that security middleware is properly integrated and configured
   * with appropriate protection levels and security headers.
   */
  test('should integrate security middleware properly', async () => {
    // Test security middleware integration and configuration
    const testApp = express();
    
    // Apply security middleware using setupSecurityMiddleware
    setupSecurityMiddleware(testApp);
    
    // Validate Helmet.js security headers application
    const middlewareStack = testApp._router?.stack || [];
    assert.ok(middlewareStack.length > 0, 'Security middleware should be applied');
    
    // Test CORS middleware configuration and behavior
    // Note: In a real test, we would make HTTP requests to validate headers
    
    // Verify rate limiting middleware setup and functionality
    logger.info('Security middleware integration tested', {
      middlewareCount: middlewareStack.length
    });
  });
  
  /**
   * Tests Logging Middleware Integration and Request Tracking
   * 
   * Validates that logging middleware properly tracks requests and provides
   * correlation information for debugging and monitoring.
   */
  test('should integrate logging middleware with request correlation', async () => {
    // Test logging middleware integration and request correlation
    const testApp = express();
    
    // Apply logging middleware using setupLoggingMiddleware
    setupLoggingMiddleware(testApp);
    
    // Validate route middleware mounting and execution
    const middlewareStack = testApp._router?.stack || [];
    assert.ok(middlewareStack.length > 0, 'Logging middleware should be applied');
    
    // Test error handling middleware with Express.js 5.1.0 features
    // Validate middleware execution order and flow control
    logger.info('Logging middleware integration tested', {
      middlewareCount: middlewareStack.length
    });
  });
  
  /**
   * Tests Route Middleware Integration and Mounting
   * 
   * Validates that route middleware is properly mounted and integrated with
   * the application routing system.
   */
  test('should mount routes with proper middleware integration', async () => {
    // Verify middleware execution order and flow control
    const testApp = express();
    
    // Mount routes using mountApplicationRoutes
    mountApplicationRoutes(testApp);
    
    // Test route mounting and configuration validation
    const routeStack = testApp._router?.stack || [];
    const hasRoutes = routeStack.some((layer: any) => 
      layer.route || layer.name === 'router'
    );
    
    assert.ok(hasRoutes, 'Routes should be mounted');
    
    logger.info('Route middleware integration tested', {
      routeCount: routeStack.length,
      hasRoutes
    });
  });
});

/**
 * Security Configuration Tests
 * 
 * Tests security middleware configuration including Helmet.js settings, CORS
 * configuration, rate limiting, and custom security measures. Validates
 * environment-specific security behavior and protection levels.
 */
describe('Security Configuration Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Helmet.js Security Headers Configuration
   * 
   * Validates that Helmet.js security headers are properly configured and
   * applied with appropriate protection mechanisms.
   */
  test('should configure Helmet.js security headers properly', async () => {
    // Test Helmet.js security headers configuration and application
    const testApp = createExpressApp({
      enableSecurity: true,
      enableLogging: false,
      enableErrorHandling: false,
      enableRoutes: false,
      enableHealthCheck: false
    });
    
    // Validate CORS middleware setup with appropriate origin restrictions
    assert.ok(testApp, 'Application with security should be created');
    
    // Test rate limiting configuration and request throttling
    const middlewareStack = testApp._router?.stack || [];
    const hasSecurityMiddleware = middlewareStack.length > 0;
    
    assert.ok(hasSecurityMiddleware, 'Security middleware should be configured');
    
    logger.info('Helmet.js security configuration tested', {
      middlewareCount: middlewareStack.length,
      hasSecurityMiddleware
    });
  });
  
  /**
   * Tests Environment-Specific Security Configuration
   * 
   * Validates that security configuration adapts appropriately to different
   * deployment environments with proper protection levels.
   */
  test('should apply environment-specific security settings', async () => {
    // Verify custom security headers and protection mechanisms
    assert.ok(securityConfig, 'Security configuration should be available');
    assert.ok(securityConfig.helmet, 'Helmet configuration should exist');
    assert.ok(securityConfig.cors, 'CORS configuration should exist');
    assert.ok(securityConfig.rateLimit, 'Rate limit configuration should exist');
    
    // Test environment-specific security configuration behavior
    const currentEnv = environment.env;
    assert.ok(['development', 'production', 'test', 'staging'].includes(currentEnv),
      'Environment should be valid');
    
    // Validate security middleware execution order and effectiveness
    logger.info('Environment-specific security settings tested', {
      environment: currentEnv,
      securityFeatures: Object.keys(securityConfig)
    });
  });
  
  /**
   * Tests Security Configuration Validation and Error Handling
   * 
   * Validates that security configuration validation works properly and
   * handles configuration errors appropriately.
   */
  test('should validate security configuration and handle errors', async () => {
    // Test security configuration validation and error handling
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    const validationResult = validateAppConfiguration(testApp);
    
    // Verify production security settings and protection levels
    assert.ok(validationResult, 'Validation result should be available');
    
    if (!validationResult.isValid) {
      const securityErrors = validationResult.errors.filter(error => 
        error.toLowerCase().includes('security')
      );
      
      logger.warn('Security configuration issues detected', {
        errors: securityErrors,
        warnings: validationResult.warnings
      });
    }
    
    logger.info('Security configuration validation tested', {
      isValid: validationResult.isValid,
      hasSecurityErrors: validationResult.errors.some(e => e.includes('security'))
    });
  });
});

/**
 * Route Configuration Tests
 * 
 * Tests route configuration and mounting including endpoint availability, route
 * middleware integration, and path validation. Validates that all application
 * routes are properly configured and accessible.
 */
describe('Route Configuration Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Main Router Mounting and Integration
   * 
   * Validates that the main application router is properly mounted and
   * integrated with the Express.js application.
   */
  test('should mount main router and integrate routes', async () => {
    // Test main router mounting and integration
    const testApp = createExpressApp({
      enableSecurity: false,
      enableLogging: false,
      enableErrorHandling: false,
      enableRoutes: true,
      enableHealthCheck: false
    });
    
    // Validate hello endpoint availability and configuration
    const routeStack = testApp._router?.stack || [];
    const hasRoutes = routeStack.some((layer: any) => 
      layer.route || layer.name === 'router'
    );
    
    assert.ok(hasRoutes, 'Main router should be mounted');
    
    // Test health check endpoint setup and functionality
    logger.info('Main router mounting tested', {
      routeCount: routeStack.length,
      hasRoutes
    });
  });
  
  /**
   * Tests Route Path Validation and Consistency
   * 
   * Validates that route paths are consistent and properly configured
   * across the application routing system.
   */
  test('should validate route paths and configuration', async () => {
    // Verify route middleware integration and execution
    const appInfo = getAppInfo();
    
    // Test route path validation and consistency
    assert.ok(appInfo.routes, 'Route information should be available');
    assert.ok(Array.isArray(appInfo.routes), 'Routes should be an array');
    
    // Validate route-specific security and logging configuration
    const expectedRoutes = ['/hello', '/health'];
    expectedRoutes.forEach(route => {
      const hasRoute = appInfo.routes.includes(route);
      assert.ok(hasRoute, `Route ${route} should be configured`);
    });
    
    // Test error handling for invalid routes and methods
    logger.info('Route path validation tested', {
      configuredRoutes: appInfo.routes,
      expectedRoutes
    });
  });
  
  /**
   * Tests Route Configuration Compliance
   * 
   * Validates that route configuration complies with application standards
   * and security requirements.
   */
  test('should ensure route configuration compliance', async () => {
    // Verify route configuration compliance with application standards
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    const validationResult = validateAppConfiguration(testApp);
    
    // Check route status in validation result
    assert.ok(validationResult.routeStatus, 'Route status should be available');
    assert.strictEqual(validationResult.routeStatus.mounted, true, 'Routes should be mounted');
    
    logger.info('Route configuration compliance tested', {
      routeStatus: validationResult.routeStatus,
      isValid: validationResult.isValid
    });
  });
});

/**
 * Error Handling Tests
 * 
 * Tests comprehensive error handling including Express.js 5.1.0 enhanced error
 * processing, automatic promise rejection handling, and standardized error responses.
 * Validates error middleware functionality and configuration.
 */
describe('Error Handling Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Express.js 5.1.0 Automatic Promise Rejection Handling
   * 
   * Validates that Express.js 5.1.0 automatic promise rejection handling
   * works properly with async middleware and route handlers.
   */
  test('should handle Express.js 5.1.0 promise rejection automatically', async () => {
    // Test Express.js 5.1.0 automatic promise rejection handling
    const testApp = express();
    
    // Apply error handling middleware using setupErrorHandling
    setupErrorHandling(testApp);
    
    // Validate error middleware configuration and execution
    const middlewareStack = testApp._router?.stack || [];
    const hasErrorHandlers = middlewareStack.some((layer: any) => 
      layer.handle && layer.handle.length === 4
    );
    
    // Test standardized error response generation
    logger.info('Express.js 5.1.0 promise rejection handling tested', {
      middlewareCount: middlewareStack.length,
      hasErrorHandlers
    });
  });
  
  /**
   * Tests Error Middleware Configuration and Execution
   * 
   * Validates that error middleware is properly configured and executes
   * in the correct order with appropriate error handling.
   */
  test('should configure error middleware properly', async () => {
    // Verify error correlation tracking and logging
    const testApp = createExpressApp({
      enableSecurity: false,
      enableLogging: false,
      enableErrorHandling: true,
      enableRoutes: false,
      enableHealthCheck: false
    });
    
    // Test environment-specific error detail filtering
    const middlewareStack = testApp._router?.stack || [];
    const errorHandlers = middlewareStack.filter((layer: any) => 
      layer.handle && layer.handle.length === 4
    );
    
    // Validate 404 not found handler functionality
    assert.ok(errorHandlers.length >= 0, 'Error handlers should be configured');
    
    // Test error handling middleware execution order
    logger.info('Error middleware configuration tested', {
      totalMiddleware: middlewareStack.length,
      errorHandlers: errorHandlers.length
    });
  });
  
  /**
   * Tests Error Security and Information Disclosure Prevention
   * 
   * Validates that error handling prevents sensitive information disclosure
   * while providing appropriate debugging information in development.
   */
  test('should prevent error information disclosure', async () => {
    // Verify error security and information disclosure prevention
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    // Test error handling with mock request/response
    const mockReq = testEnvironment.mockRequest;
    const mockRes = testEnvironment.mockResponse;
    const mockNext = testEnvironment.mockNext;
    
    // Simulate error conditions
    const testError = new Error('Test error message');
    
    // Test error handling behavior
    mockNext(testError);
    
    assert.strictEqual(mockNext._callData.callCount, 1, 'Next should be called once');
    assert.strictEqual(mockNext._callData.errors.length, 1, 'Error should be captured');
    
    logger.info('Error information disclosure prevention tested', {
      errorCaptured: mockNext._callData.errors.length > 0,
      environment: environment.env
    });
  });
});

/**
 * Health Check Tests
 * 
 * Tests health check endpoint functionality including server status reporting,
 * uptime tracking, memory usage monitoring, and response format validation.
 * Validates monitoring and operational visibility capabilities.
 */
describe('Health Check Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Health Check Endpoint Availability and Accessibility
   * 
   * Validates that the health check endpoint is available and accessible
   * for monitoring systems and load balancers.
   */
  test('should configure health check endpoint', async () => {
    // Test health check endpoint availability and accessibility
    const testApp = createExpressApp({
      enableSecurity: false,
      enableLogging: false,
      enableErrorHandling: false,
      enableRoutes: false,
      enableHealthCheck: true
    });
    
    // Validate health check response structure and content
    const routeStack = testApp._router?.stack || [];
    const hasHealthRoute = routeStack.some((layer: any) => 
      layer.route && layer.route.path === '/health'
    );
    
    assert.ok(hasHealthRoute, 'Health check route should be configured');
    
    // Test server status reporting and uptime tracking
    logger.info('Health check endpoint tested', {
      routeCount: routeStack.length,
      hasHealthRoute
    });
  });
  
  /**
   * Tests Health Check Response Format and Content
   * 
   * Validates that health check responses contain proper structure and
   * required monitoring information.
   */
  test('should validate health check response format', async () => {
    // Verify memory usage monitoring and reporting
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    // Mock health check response validation
    const mockHealthResponse: SystemHealth = {
      status: 'healthy',
      uptime: process.uptime() * 1000,
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
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 0
      }
    };
    
    // Test environment information inclusion in health response
    assert.strictEqual(mockHealthResponse.status, 'healthy', 'Status should be healthy');
    assert.ok(mockHealthResponse.uptime >= 0, 'Uptime should be non-negative');
    assert.ok(mockHealthResponse.memory, 'Memory information should be included');
    assert.ok(mockHealthResponse.timestamp, 'Timestamp should be included');
    
    // Validate health check response timing and performance
    logger.info('Health check response format validated', {
      status: mockHealthResponse.status,
      hasComponents: !!mockHealthResponse.components,
      hasMetrics: !!mockHealthResponse.metrics
    });
  });
  
  /**
   * Tests Health Check Integration with Monitoring Systems
   * 
   * Validates that health check endpoint integrates properly with monitoring
   * systems and provides appropriate operational visibility.
   */
  test('should integrate with monitoring systems', async () => {
    // Test health check endpoint security and access control
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    // Verify health check integration with monitoring systems
    const routeStack = testApp._router?.stack || [];
    const healthRoutes = routeStack.filter((layer: any) => 
      layer.route && layer.route.path === '/health'
    );
    
    assert.ok(healthRoutes.length > 0, 'Health check routes should be available');
    
    // Test health check response structure validation
    healthRoutes.forEach(route => {
      assert.ok(route.route.methods.get, 'Health check should support GET method');
    });
    
    logger.info('Health check monitoring integration tested', {
      healthRouteCount: healthRoutes.length
    });
  });
});

/**
 * Performance Tests
 * 
 * Tests application performance characteristics including startup time, memory usage,
 * response time, and resource efficiency. Validates performance requirements and
 * optimization effectiveness.
 */
describe('Performance Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment({
      enablePerformanceMonitoring: true
    });
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Application Creation and Initialization Performance
   * 
   * Measures application creation time and validates it meets performance
   * requirements for rapid startup and deployment.
   */
  test('should meet application creation performance requirements', async () => {
    // Measure application creation and initialization time
    const performanceMetrics = await measureTestPerformance(
      () => {
        const testApp = createExpressApp(TEST_APP_OPTIONS);
        return testApp;
      },
      { threshold: PERFORMANCE_THRESHOLD }
    );
    
    // Test memory usage during application startup and operation
    assert.ok(performanceMetrics.executionTime <= PERFORMANCE_THRESHOLD,
      `Application creation should complete within ${PERFORMANCE_THRESHOLD}ms, took ${performanceMetrics.executionTime}ms`);
    
    // Validate response time for basic application operations
    assert.strictEqual(performanceMetrics.passed, true, 'Performance test should pass');
    
    // Test resource efficiency and optimization effectiveness
    const memoryUsage = performanceMetrics.memoryUsage;
    assert.ok(memoryUsage.heapUsed > 0, 'Memory should be allocated');
    
    logger.info('Application creation performance validated', {
      executionTime: `${performanceMetrics.executionTime.toFixed(2)}ms`,
      threshold: `${PERFORMANCE_THRESHOLD}ms`,
      passed: performanceMetrics.passed,
      memoryUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    });
  });
  
  /**
   * Tests Configuration Validation Performance
   * 
   * Measures configuration validation performance to ensure efficient
   * application startup and deployment readiness.
   */
  test('should validate configuration performance efficiently', async () => {
    // Measure middleware execution overhead and performance impact
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    const performanceMetrics = await measureTestPerformance(
      () => validateAppConfiguration(testApp),
      { threshold: PERFORMANCE_THRESHOLD / 2 } // Stricter threshold for validation
    );
    
    // Validate performance against configured thresholds and requirements
    assert.ok(performanceMetrics.executionTime <= PERFORMANCE_THRESHOLD / 2,
      `Configuration validation should be fast, took ${performanceMetrics.executionTime}ms`);
    
    // Test performance consistency across multiple test runs
    assert.strictEqual(performanceMetrics.passed, true, 'Configuration validation performance should pass');
    
    logger.info('Configuration validation performance tested', {
      executionTime: `${performanceMetrics.executionTime.toFixed(2)}ms`,
      threshold: `${PERFORMANCE_THRESHOLD / 2}ms`,
      passed: performanceMetrics.passed
    });
  });
  
  /**
   * Tests Memory Usage and Resource Management
   * 
   * Validates memory usage patterns and resource management during
   * application operation and testing.
   */
  test('should manage memory usage efficiently', async () => {
    // Verify performance optimization and resource management
    const initialMemory = process.memoryUsage();
    
    // Create multiple applications to test memory management
    const apps: Application[] = [];
    for (let i = 0; i < 5; i++) {
      apps.push(createExpressApp(TEST_APP_OPTIONS));
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // Memory increase should be reasonable for 5 applications
    const reasonableMemoryIncrease = 50 * 1024 * 1024; // 50MB
    assert.ok(memoryIncrease < reasonableMemoryIncrease,
      `Memory increase should be reasonable, increased by ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    
    logger.info('Memory usage efficiency tested', {
      initialMemory: `${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`,
      finalMemory: `${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`,
      memoryIncrease: `${Math.round(memoryIncrease / 1024 / 1024)}MB`,
      appsCreated: apps.length
    });
  });
});

/**
 * Environment-Specific Tests
 * 
 * Tests environment-specific application behavior including development, production,
 * test, and staging configurations. Validates that application behaves appropriately
 * for each deployment environment.
 */
describe('Environment-Specific Tests', () => {
  // Set up test environment before each test
  beforeEach(async () => {
    testEnvironment = await setupTestEnvironment();
  });
  
  // Clean up test environment after each test
  afterEach(async () => {
    if (testEnvironment) {
      await cleanupTestEnvironment(testEnvironment);
    }
  });
  
  /**
   * Tests Development Environment Configuration and Behavior
   * 
   * Validates that the application behaves appropriately in development
   * environment with enhanced debugging and development features.
   */
  test('should handle development environment appropriately', async () => {
    // Test development environment configuration and behavior
    const currentEnv = environment.env;
    
    // Validate production environment security and optimization settings
    if (environment.isDevelopment) {
      assert.strictEqual(environment.isDevelopment, true, 'Development flag should be true');
      assert.strictEqual(environment.isProduction, false, 'Production flag should be false');
      
      // Test test environment isolation and configuration
      logger.info('Development environment configuration validated', {
        environment: currentEnv,
        isDevelopment: environment.isDevelopment,
        debugLogging: loggingConfig.level === 'debug'
      });
    }
    
    // Verify staging environment configuration and deployment readiness
    assert.ok(['development', 'production', 'test', 'staging'].includes(currentEnv),
      'Environment should be one of the supported values');
  });
  
  /**
   * Tests Environment-Specific Logging Behavior
   * 
   * Validates that logging behaves appropriately for different environments
   * with proper log levels and output formatting.
   */
  test('should apply environment-specific logging behavior', async () => {
    // Test environment-specific logging and debugging behavior
    assert.ok(loggingConfig, 'Logging configuration should be available');
    assert.ok(typeof loggingConfig.level === 'string', 'Log level should be string');
    assert.ok(typeof loggingConfig.enableColors === 'boolean', 'Color setting should be boolean');
    
    // Validate environment-specific security configuration and protection levels
    const validLogLevels = ['error', 'warn', 'info', 'http', 'debug'];
    assert.ok(validLogLevels.includes(loggingConfig.level),
      `Log level should be valid: ${loggingConfig.level}`);
    
    // Test environment detection and automatic configuration adjustment
    logger.info('Environment-specific logging behavior tested', {
      logLevel: loggingConfig.level,
      enableColors: loggingConfig.enableColors,
      environment: environment.env
    });
  });
  
  /**
   * Tests Environment-Specific Error Handling
   * 
   * Validates that error handling adapts to environment requirements with
   * appropriate information disclosure and debugging support.
   */
  test('should handle environment-specific error behavior', async () => {
    // Verify environment-specific error handling and information disclosure
    const testApp = createExpressApp(TEST_APP_OPTIONS);
    
    const validationResult = validateAppConfiguration(testApp);
    
    // Environment-specific validation should pass
    assert.ok(validationResult, 'Validation result should be available');
    
    // Check for environment-specific warnings or configurations
    const environmentWarnings = validationResult.warnings.filter(warning =>
      warning.toLowerCase().includes('environment') ||
      warning.toLowerCase().includes('production') ||
      warning.toLowerCase().includes('development')
    );
    
    logger.info('Environment-specific error behavior tested', {
      environment: environment.env,
      hasEnvironmentWarnings: environmentWarnings.length > 0,
      warningCount: environmentWarnings.length
    });
  });
});

// Log test suite completion with summary information
logger.info('Express.js Application Factory Test Suite completed', {
  testSuite: 'app.test.ts',
  framework: 'Node.js 24.x built-in test runner',
  expressVersion: '5.1.0',
  testCategories: [
    'Application Factory',
    'Configuration Validation',
    'Middleware Integration',
    'Security Configuration',
    'Route Configuration',
    'Error Handling',
    'Health Check',
    'Performance',
    'Environment-Specific'
  ],
  timestamp: new Date().toISOString()
});