// Jest testing framework configuration with TypeScript integration for Node.js tutorial application backend
// Version: jest@^29.7.0, ts-jest@^29.2.5
// Supports Node.js 24.x runtime environment and Express.js 5.1.0 testing

import type { Config } from 'jest'; // jest@^29.7.0 - Jest configuration type definition for TypeScript type safety and configuration validation
import type { JestConfigWithTsJest } from 'ts-jest'; // ts-jest@^29.2.5 - TypeScript-specific Jest configuration interface with ts-jest integration and TypeScript compilation settings

// Global configuration constants for educational testing completeness
const JEST_TIMEOUT = 30000; // 30 seconds timeout for comprehensive testing including integration tests
const COVERAGE_THRESHOLD = 100; // 100% coverage requirement for educational completeness and comprehensive testing validation
const TEST_ENVIRONMENT = 'node'; // Node.js testing environment for server-side JavaScript testing without browser APIs
const TS_JEST_PRESET = 'ts-jest'; // Uses ts-jest preset for TypeScript compilation and testing with Jest framework integration

/**
 * Comprehensive Jest testing framework configuration for Node.js tutorial application backend
 * 
 * This configuration establishes a complete testing environment with:
 * - TypeScript integration through ts-jest for type-safe testing
 * - Strict code coverage requirements (100%) for educational purposes
 * - Performance optimization for efficient test execution
 * - Educational testing patterns with verbose reporting
 * - Integration with Node.js 24.x and Express.js 5.1.0
 * - Comprehensive test file discovery and organization
 * - Module path mapping for clean imports and consistent resolution
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive Jest configuration for production applications
 * - Shows TypeScript integration in testing frameworks
 * - Implements strict code coverage requirements and validation
 * - Configures test file discovery and organization patterns
 * - Sets up module resolution and path mapping for tests
 * - Optimizes test execution performance and resource usage
 * - Integrates testing with CI/CD pipelines and reporting
 * - Manages test environments and lifecycle procedures
 * - Applies test isolation and mock management strategies
 * - Creates educational testing configurations for learning
 */
const jestConfig: JestConfigWithTsJest = {
  // Core Jest Configuration Settings
  // Uses ts-jest preset for TypeScript compilation and testing with Jest framework integration
  preset: TS_JEST_PRESET,
  
  // Configures Node.js testing environment for server-side JavaScript testing without browser APIs
  testEnvironment: TEST_ENVIRONMENT,
  
  // Defines root directories for test discovery including source code and dedicated test directories
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Glob patterns for test file discovery supporting both __tests__ directories and .test.ts/.spec.ts file naming conventions
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // TypeScript Integration and Compilation Settings
  // Configures ts-jest transformer for TypeScript file compilation during test execution
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      // Disables ES modules for CommonJS compatibility with Node.js 24.x
      useESM: false,
      // Uses project TypeScript configuration for test compilation
      tsconfig: '<rootDir>/tsconfig.json',
      // Enables isolated modules for parallel processing and performance optimization
      isolatedModules: true,
      // Configures TypeScript diagnostics for educational error reporting
      diagnostics: {
        // Treats TypeScript errors as test failures for strict validation
        warnOnly: false,
        // Excludes specific TypeScript diagnostics that are not relevant for testing
        exclude: ['TS151001']
      }
    }]
  },
  
  // Supported file extensions for module resolution and test execution
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  
  // File extensions to treat as ES modules (empty for CommonJS compatibility)
  extensionsToTreatAsEsm: [],
  
  // Comprehensive Code Coverage Configuration
  // Specifies files to include in coverage collection while excluding type definitions, test files, and test directories
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/types/**/*',
    '!src/**/__tests__/**/*'
  ],
  
  // Output directory for coverage reports and artifacts
  coverageDirectory: 'coverage',
  
  // Coverage report formats including console output, LCOV for CI/CD, HTML for browsing, and JSON for programmatic analysis
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json',
    'text-summary'
  ],
  
  // Strict 100% coverage requirements for all metrics to ensure comprehensive testing for educational purposes
  coverageThreshold: {
    global: {
      branches: COVERAGE_THRESHOLD,
      functions: COVERAGE_THRESHOLD,
      lines: COVERAGE_THRESHOLD,
      statements: COVERAGE_THRESHOLD
    }
  },
  
  // Patterns to ignore during coverage collection including dependencies, build artifacts, and type definitions
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '\\.d\\.ts$'
  ],
  
  // Test Execution and Performance Configuration
  // Test timeout in milliseconds (30 seconds) for comprehensive testing including integration tests
  testTimeout: JEST_TIMEOUT,
  
  // Enables verbose test output for educational purposes and detailed test result reporting
  verbose: true,
  
  // Detects open handles that prevent Jest from exiting cleanly, useful for debugging resource leaks
  detectOpenHandles: true,
  
  // Prevents forced exit to ensure proper cleanup and resource management
  forceExit: false,
  
  // Limits worker processes to 50% of available CPU cores for optimal performance and resource usage
  maxWorkers: '50%',
  
  // Test Environment Setup and Teardown Configuration
  // Test setup file executed after Jest environment initialization for global test configuration
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  
  // Global setup file executed once before all tests for environment preparation
  globalSetup: '<rootDir>/tests/global-setup.ts',
  
  // Global teardown file executed once after all tests for environment cleanup
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  
  // Module Resolution and Path Mapping Configuration
  // Path mapping for clean imports and consistent module resolution across test files
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@handlers/(.*)$': '<rootDir>/src/handlers/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Additional module search paths for test execution and dependency resolution
  modulePaths: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Directories to search for modules during test execution
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // Performance Optimization and Caching Configuration
  // Enables Jest caching for faster subsequent test runs
  cache: true,
  
  // Directory for Jest cache storage to improve test execution performance
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Automatically clears mock calls and instances between tests for test isolation
  clearMocks: true,
  
  // Automatically restores mocked functions to their original implementation after tests
  restoreMocks: true,
  
  // Automatically resets mock state between tests for clean test execution
  resetMocks: true,
  
  // Error Handling and Quality Configuration
  // Treats deprecated API usage as errors to ensure modern testing practices
  errorOnDeprecated: true,
  
  // Continues test execution after failures for comprehensive test result reporting
  bail: false,
  
  // Collects coverage from all specified files rather than limiting to specific files
  collectCoverageOnlyFrom: undefined,
  
  // Test Reporting and Output Configuration
  // Test reporters including default console output and JUnit XML for CI/CD integration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ],
  
  // Disables desktop notifications for test results in CI/CD environments
  notify: false,
  
  // Notification mode for test result changes
  notifyMode: 'failure-change',
  
  // TypeScript-Specific Configuration for ts-jest Integration
  globals: {
    'ts-jest': {
      // Disables ES modules for CommonJS compatibility with Node.js 24.x
      useESM: false,
      // TypeScript compiler options for test compilation
      tsconfig: {
        // ES2024 target compilation for modern features compatible with Node.js 24.x
        target: 'ES2024',
        // CommonJS module system for Node.js compatibility
        module: 'CommonJS',
        // Node.js module resolution strategy
        moduleResolution: 'node',
        // Enables ES module interoperability for mixed module systems
        esModuleInterop: true,
        // Allows synthetic default imports for better compatibility
        allowSyntheticDefaultImports: true,
        // Enables strict TypeScript checking for educational code quality
        strict: true,
        // Skips library type checking for faster compilation
        skipLibCheck: true,
        // Forces consistent casing in file names for cross-platform compatibility
        forceConsistentCasingInFileNames: true,
        // Resolves JSON modules for configuration and test data
        resolveJsonModule: true,
        // Disables declaration file generation for test compilation
        declaration: false,
        // Enables source map generation for debugging support
        sourceMap: true,
        // Disables inline source maps for separate file generation
        inlineSourceMap: false,
        // Disables inline sources for cleaner source maps
        inlineSources: false
      },
      // Enables isolated modules for parallel processing and performance optimization
      isolatedModules: true,
      // Configures TypeScript diagnostics for educational error reporting
      diagnostics: {
        // Treats TypeScript errors as test failures for strict validation
        warnOnly: false,
        // Excludes specific TypeScript diagnostics that are not relevant for testing
        exclude: ['TS151001']
      }
    }
  },
  
  // Additional Jest Configuration for Educational Testing
  // Enables automatic file watching in development mode for rapid feedback
  watchman: true,
  
  // Configures test result processor for custom output formatting
  testResultsProcessor: undefined,
  
  // Sets up custom test sequencer for deterministic test execution
  testSequencer: undefined,
  
  // Configures snapshot serializers for consistent snapshot testing
  snapshotSerializers: [],
  
  // Enables snapshot testing for regression testing and visual validation
  updateSnapshot: false,
  
  // Configures Jest to use the built-in test environment for Node.js 24.x compatibility
  testEnvironmentOptions: {},
  
  // Enables test location in results for better debugging and navigation
  testLocationInResults: true,
  
  // Configures Jest to run tests in sequence for debugging purposes when needed
  runInBand: false,
  
  // Enables coverage collection only from files that are actually tested
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/types/**/*',
    '!src/**/__tests__/**/*'
  ],
  
  // Configures Jest to use specific files for setup before each test file
  setupFiles: [],
  
  // Configures transform ignore patterns for node_modules processing
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Configures Jest to handle dynamic imports and ES modules properly
  preset: 'ts-jest/presets/default',
  
  // Configures the test environment with Node.js globals and APIs
  testEnvironment: 'node'
};

// Export the Jest configuration as the default export for Jest framework consumption
export default jestConfig;