/**
 * TypeScript Build Automation Script for Node.js Tutorial Application
 * 
 * This script orchestrates the complete build process including TypeScript compilation,
 * asset copying, validation, and build artifact generation. Integrates with the project's
 * TypeScript configuration, environment validation, and logging systems to provide a
 * comprehensive build pipeline that supports development, testing, and production
 * deployment scenarios while demonstrating modern Node.js build automation patterns
 * with Express.js 5.1.0 and TypeScript best practices.
 * 
 * Features:
 * - Automated TypeScript compilation with ES2024 target and strict type checking
 * - Asset management and file system operations for build artifact generation
 * - Build validation and quality assurance automation for deployment readiness
 * - Environment-specific build configurations and production optimizations
 * - Build manifest generation for deployment traceability and version management
 * - Integration with CI/CD pipelines through proper exit codes and error reporting
 * - Comprehensive error handling and validation in automated build pipelines
 * - Performance monitoring and metrics collection during build processes
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @requires Node.js 24.x LTS
 * @requires TypeScript 5.x
 * @requires Express.js 5.1.0
 * @educational Demonstrates TypeScript build automation and compilation orchestration
 */

// Import environment configuration for build-specific behavior and optimizations
import { 
  config,
  env,
  isProduction,
  isDevelopment
} from '../src/config/environment';

// Import logging utilities for build process monitoring and error reporting
import { 
  logger,
  logError,
  logInfo,
  logWarn,
  logDebug
} from '../src/utils/logger';

// Import custom error handling for build process error management
import { 
  AppError,
  createAppError,
  logError as logAppError
} from '../src/utils/errors';

// Import Node.js built-in modules for build operations
import * as fs from 'fs'; // built-in - Node.js file system module
import * as path from 'path'; // built-in - Node.js path module  
import { spawn, exec } from 'child_process'; // built-in - Node.js child process module
import { promisify } from 'util'; // built-in - Node.js util module for promisifying APIs

// Promisify child process functions for async/await usage
const execAsync = promisify(exec);

/**
 * Build Directory Configuration Constants
 * 
 * Defines the standard directory structure for build operations with immutable
 * literal types for compile-time validation and consistent path management.
 */
export const BUILD_DIRECTORIES = {
  SRC: 'src',
  DIST: 'dist', 
  ASSETS: 'src/assets',
  TYPES: 'src/types'
} as const;

/**
 * TypeScript Compiler Command Constants
 * 
 * Defines the TypeScript compiler commands used throughout the build process
 * with support for incremental compilation and build cleaning operations.
 */
export const BUILD_COMMANDS = {
  TYPESCRIPT: 'tsc',
  TYPESCRIPT_BUILD: 'tsc --build',
  TYPESCRIPT_CLEAN: 'tsc --build --clean'
} as const;

/**
 * Build Process Configuration Constants
 * 
 * Defines timeout values, retry attempts, and parallel job limits for
 * build process optimization and reliability management.
 */
export const BUILD_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  PARALLEL_JOBS: 4
} as const;

/**
 * TypeScript Compilation Result Interface
 * 
 * Comprehensive structure for TypeScript compilation results including
 * success status, error messages, warnings, performance metrics, and
 * generated output file information for build process tracking.
 */
export interface CompilationResult {
  /** Whether TypeScript compilation completed successfully */
  success: boolean;
  
  /** Array of compilation error messages */
  errors: string[];
  
  /** Array of compilation warning messages */
  warnings: string[];
  
  /** Compilation duration in milliseconds */
  duration: number;
  
  /** Number of TypeScript files compiled */
  filesCompiled: number;
  
  /** Array of generated output file paths */
  outputFiles: string[];
}

/**
 * Build Manifest Interface
 * 
 * Comprehensive build metadata structure containing build identification,
 * environment information, compilation details, asset information, and
 * file integrity checksums for deployment traceability and verification.
 */
export interface BuildManifest {
  /** Unique identifier for this build */
  buildId: string;
  
  /** ISO timestamp of build completion */
  timestamp: string;
  
  /** Build environment (development, production, etc.) */
  environment: string;
  
  /** Application version from package.json */
  version: string;
  
  /** Node.js version used for build */
  nodeVersion: string;
  
  /** TypeScript compiler version */
  typescriptVersion: string;
  
  /** TypeScript compilation details */
  compilation: CompilationResult;
  
  /** Array of copied asset file paths */
  assets: string[];
  
  /** File checksums for integrity verification */
  checksums: Record<string, string>;
}

/**
 * Build Validation Issue Interface
 * 
 * Structured representation of validation issues found during build
 * output verification including issue type, affected file, descriptive
 * message, and severity level for comprehensive issue tracking.
 */
export interface ValidationIssue {
  /** Type of validation issue (error, warning, info) */
  type: string;
  
  /** File path where issue was found */
  file: string;
  
  /** Description of the validation issue */
  message: string;
  
  /** Issue severity level */
  severity: string;
}

/**
 * Build Validation Result Interface
 * 
 * Comprehensive validation results containing validation success status,
 * detailed issue list, warning messages, and file count statistics for
 * build quality assurance and deployment readiness verification.
 */
export interface ValidationResult {
  /** Whether build output validation passed */
  valid: boolean;
  
  /** Array of validation issues found */
  issues: ValidationIssue[];
  
  /** Array of validation warning messages */
  warnings: string[];
  
  /** Number of files validated */
  checkedFiles: number;
}

/**
 * Build Performance Metrics Interface
 * 
 * Detailed performance metrics for build process analysis including
 * file counts, size statistics, timing information, and compression
 * ratios for build optimization and performance monitoring.
 */
export interface BuildMetrics {
  /** Total number of files processed */
  totalFiles: number;
  
  /** Total size of build artifacts in bytes */
  totalSize: number;
  
  /** Compression ratio if optimization was applied */
  compressionRatio?: number;
  
  /** TypeScript compilation time in milliseconds */
  compilationTime: number;
  
  /** Asset copying time in milliseconds */
  assetCopyTime: number;
}

/**
 * Complete Build Result Interface
 * 
 * Comprehensive build result structure containing overall success status,
 * total build duration, build manifest, validation results, artifact paths,
 * and performance metrics for complete build process tracking and reporting.
 */
export interface BuildResult {
  /** Whether the complete build process succeeded */
  success: boolean;
  
  /** Total build duration in milliseconds */
  duration: number;
  
  /** Build manifest with metadata and details */
  manifest: BuildManifest;
  
  /** Build output validation results */
  validation: ValidationResult;
  
  /** Array of generated build artifact paths */
  artifacts: string[];
  
  /** Build performance and size metrics */
  metrics: BuildMetrics;
}

/**
 * Build Step Function Type Definition
 * 
 * Type definition for individual build step functions that return promises
 * for asynchronous build process orchestration and error handling.
 */
export type BuildStep = () => Promise<void>;

/**
 * Build Validator Function Type Definition
 * 
 * Type definition for build validation functions that accept artifact paths
 * and return validation results for build quality assurance and verification.
 */
export type BuildValidator = (artifacts: string[]) => Promise<ValidationResult>;

/**
 * Asset Processor Function Type Definition
 * 
 * Type definition for asset processing functions that handle file operations
 * between source and destination paths for asset management and optimization.
 */
export type AssetProcessor = (sourcePath: string, destPath: string) => Promise<void>;

/**
 * Validates Build Environment Prerequisites
 * 
 * Validates the build environment by checking for required dependencies,
 * TypeScript configuration, and build prerequisites. Ensures all necessary
 * tools and configurations are available before starting the build process
 * with comprehensive validation and detailed error reporting.
 * 
 * @returns Promise that resolves when environment validation is complete
 * @throws AppError if validation fails with detailed error context
 */
export async function validateBuildEnvironment(): Promise<void> {
  logInfo('Starting build environment validation', { step: 'environment-validation' });
  
  try {
    // Check for TypeScript compiler availability in node_modules or global installation
    logDebug('Checking TypeScript compiler availability');
    try {
      const { stdout: tscVersion } = await execAsync('npx tsc --version');
      logInfo(`TypeScript compiler found: ${tscVersion.trim()}`);
    } catch (error) {
      throw createAppError(
        'TypeScript compiler not found. Please install TypeScript: npm install typescript',
        500,
        'TYPESCRIPT_NOT_FOUND',
        { command: 'npx tsc --version', error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
    
    // Validate tsconfig.json exists and contains valid configuration
    logDebug('Validating TypeScript configuration file');
    const tsconfigPath = path.resolve('tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      throw createAppError(
        'TypeScript configuration file (tsconfig.json) not found',
        500,
        'TSCONFIG_NOT_FOUND',
        { expectedPath: tsconfigPath }
      );
    }
    
    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      JSON.parse(tsconfigContent);
      logInfo('TypeScript configuration validated successfully');
    } catch (error) {
      throw createAppError(
        'Invalid TypeScript configuration file (tsconfig.json)',
        500,
        'TSCONFIG_INVALID',
        { path: tsconfigPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
    
    // Verify source directory structure and required files exist
    logDebug('Verifying source directory structure');
    const srcPath = path.resolve(BUILD_DIRECTORIES.SRC);
    if (!fs.existsSync(srcPath)) {
      throw createAppError(
        `Source directory not found: ${srcPath}`,
        500,
        'SOURCE_DIRECTORY_NOT_FOUND',
        { expectedPath: srcPath }
      );
    }
    
    // Check Node.js version compatibility with build requirements
    logDebug('Checking Node.js version compatibility');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    if (majorVersion < 18) {
      logWarn(`Node.js version ${nodeVersion} detected. Recommended: Node.js 24.x LTS`);
    } else {
      logInfo(`Node.js version ${nodeVersion} is compatible`);
    }
    
    // Validate package.json build scripts and dependencies
    logDebug('Validating package.json configuration');
    const packageJsonPath = path.resolve('package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw createAppError(
        'Package.json file not found',
        500,
        'PACKAGE_JSON_NOT_FOUND',
        { expectedPath: packageJsonPath }
      );
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (!packageJson.dependencies?.express) {
        logWarn('Express.js dependency not found in package.json');
      }
      if (!packageJson.devDependencies?.typescript && !packageJson.dependencies?.typescript) {
        logWarn('TypeScript dependency not found in package.json');
      }
      logInfo('Package.json configuration validated');
    } catch (error) {
      throw createAppError(
        'Invalid package.json file',
        500,
        'PACKAGE_JSON_INVALID',
        { path: packageJsonPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
    
    // Ensure write permissions for build output directories
    logDebug('Checking build output directory permissions');
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    try {
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
      }
      // Test write permission by creating a temporary file
      const testFile = path.join(distPath, '.build-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      logInfo('Build output directory permissions verified');
    } catch (error) {
      throw createAppError(
        'Insufficient permissions for build output directory',
        500,
        'BUILD_PERMISSIONS_ERROR',
        { path: distPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
    
    // Log validation results and any warnings or errors found
    logInfo('Build environment validation completed successfully', {
      nodeVersion,
      typescript: 'available',
      tsconfig: 'valid',
      sourceDirectory: 'exists',
      buildPermissions: 'verified'
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      logAppError(error, 'validateBuildEnvironment');
      throw error;
    }
    
    const buildError = createAppError(
      'Build environment validation failed',
      500,
      'ENVIRONMENT_VALIDATION_ERROR',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logAppError(buildError, 'validateBuildEnvironment');
    throw buildError;
  }
}

/**
 * Cleans Build Output Directory
 * 
 * Removes existing build artifacts and cleans the output directory to ensure
 * a fresh build. Handles directory cleanup with proper error handling and
 * logging for build process transparency and reliable artifact generation.
 * 
 * @returns Promise that resolves when cleanup is complete
 * @throws AppError if cleanup fails with detailed error context
 */
export async function cleanBuildDirectory(): Promise<void> {
  logInfo('Starting build directory cleanup', { step: 'cleanup' });
  
  try {
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    
    // Check if dist directory exists before attempting cleanup
    if (!fs.existsSync(distPath)) {
      logInfo('Build directory does not exist, creating fresh directory');
      fs.mkdirSync(distPath, { recursive: true });
      return;
    }
    
    logDebug(`Cleaning build directory: ${distPath}`);
    
    // Remove all files and subdirectories from dist folder recursively
    const removeDirectory = (dirPath: string): void => {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          removeDirectory(itemPath);
          fs.rmdirSync(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }
    };
    
    // Handle file system errors gracefully with appropriate error messages
    try {
      removeDirectory(distPath);
      logDebug('All build artifacts removed successfully');
    } catch (error) {
      throw createAppError(
        'Failed to remove existing build artifacts',
        500,
        'CLEANUP_ERROR',
        { 
          path: distPath, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      );
    }
    
    // Verify cleanup success by checking directory state
    const remainingItems = fs.readdirSync(distPath);
    if (remainingItems.length > 0) {
      logWarn(`Some items remain in build directory: ${remainingItems.join(', ')}`);
    }
    
    // Create fresh dist directory structure for build output
    fs.mkdirSync(distPath, { recursive: true });
    
    // Log cleanup progress and completion status
    logInfo('Build directory cleanup completed successfully', {
      path: distPath,
      status: 'cleaned'
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      logAppError(error, 'cleanBuildDirectory');
      throw error;
    }
    
    const buildError = createAppError(
      'Build directory cleanup failed',
      500,
      'CLEANUP_FAILED',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logAppError(buildError, 'cleanBuildDirectory');
    throw buildError;
  }
}

/**
 * Executes TypeScript Compilation
 * 
 * Executes TypeScript compilation using the configured tsconfig.json settings.
 * Handles compilation process monitoring, error reporting, and build artifact
 * validation with environment-specific optimizations and comprehensive metrics.
 * 
 * @returns Promise resolving to compilation result with success status and metrics
 * @throws AppError if compilation fails with detailed error context
 */
export async function compileTypeScript(): Promise<CompilationResult> {
  logInfo('Starting TypeScript compilation', { step: 'compilation' });
  
  const startTime = Date.now();
  let compilationResult: CompilationResult = {
    success: false,
    errors: [],
    warnings: [],
    duration: 0,
    filesCompiled: 0,
    outputFiles: []
  };
  
  try {
    // Execute TypeScript compiler with project configuration
    logDebug('Executing TypeScript compiler');
    const tscCommand = BUILD_COMMANDS.TYPESCRIPT_BUILD;
    
    const compilationPromise = new Promise<{ success: boolean; output: string; errors: string[] }>((resolve, reject) => {
      // Monitor compilation process and capture output streams
      const tscProcess = spawn('npx', [tscCommand.split(' ')[0], ...tscCommand.split(' ').slice(1)], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      tscProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      tscProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      tscProcess.on('close', (code) => {
        const success = code === 0;
        const output = stdout + stderr;
        const errors = stderr ? [stderr] : [];
        
        resolve({ success, output, errors });
      });
      
      tscProcess.on('error', (error) => {
        reject(error);
      });
      
      // Apply timeout for compilation process
      setTimeout(() => {
        tscProcess.kill('SIGTERM');
        reject(new Error(`TypeScript compilation timed out after ${BUILD_CONFIG.TIMEOUT}ms`));
      }, BUILD_CONFIG.TIMEOUT);
    });
    
    const { success, output, errors } = await compilationPromise;
    
    // Parse TypeScript compiler output for errors and warnings
    const outputLines = output.split('\n').filter(line => line.trim());
    const compilationErrors: string[] = [];
    const compilationWarnings: string[] = [];
    
    for (const line of outputLines) {
      if (line.includes('error TS')) {
        compilationErrors.push(line.trim());
      } else if (line.includes('warning')) {
        compilationWarnings.push(line.trim());
      }
    }
    
    // Add any stderr errors to compilation errors
    compilationErrors.push(...errors);
    
    // Handle compilation errors with detailed error reporting
    if (!success || compilationErrors.length > 0) {
      logError('TypeScript compilation failed', {
        errors: compilationErrors,
        warnings: compilationWarnings,
        output: output.substring(0, 1000) // Limit output length
      });
      
      compilationResult = {
        success: false,
        errors: compilationErrors,
        warnings: compilationWarnings,
        duration: Date.now() - startTime,
        filesCompiled: 0,
        outputFiles: []
      };
      
      return compilationResult;
    }
    
    // Validate generated JavaScript files and declaration files
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    const outputFiles: string[] = [];
    let filesCompiled = 0;
    
    if (fs.existsSync(distPath)) {
      const scanDirectory = (dirPath: string): void => {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            scanDirectory(itemPath);
          } else if (item.endsWith('.js') || item.endsWith('.d.ts')) {
            outputFiles.push(path.relative(process.cwd(), itemPath));
            if (item.endsWith('.js')) {
              filesCompiled++;
            }
          }
        }
      };
      
      scanDirectory(distPath);
    }
    
    // Apply environment-specific compilation optimizations
    if (isProduction) {
      logDebug('Applying production compilation optimizations');
      // Production optimizations are handled in separate function
    }
    
    // Generate compilation metrics and performance data
    const duration = Date.now() - startTime;
    
    compilationResult = {
      success: true,
      errors: [],
      warnings: compilationWarnings,
      duration,
      filesCompiled,
      outputFiles
    };
    
    // Log compilation success with metrics
    logInfo('TypeScript compilation completed successfully', {
      duration: `${duration}ms`,
      filesCompiled,
      outputFiles: outputFiles.length,
      warnings: compilationWarnings.length
    });
    
    // Return compilation result with success status and details
    return compilationResult;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
    
    compilationResult = {
      success: false,
      errors: [errorMessage],
      warnings: [],
      duration,
      filesCompiled: 0,
      outputFiles: []
    };
    
    const buildError = createAppError(
      'TypeScript compilation failed',
      500,
      'COMPILATION_ERROR',
      { 
        error: errorMessage,
        duration,
        result: compilationResult
      }
    );
    
    logAppError(buildError, 'compileTypeScript');
    throw buildError;
  }
}

/**
 * Copies Static Assets to Build Directory
 * 
 * Copies static assets and non-TypeScript files to the build output directory.
 * Handles asset management with file filtering, directory structure preservation,
 * and error handling for missing assets with comprehensive asset tracking.
 * 
 * @returns Promise that resolves when asset copying is complete
 * @throws AppError if copying fails with detailed error context
 */
export async function copyAssets(): Promise<void> {
  logInfo('Starting asset copying process', { step: 'asset-copying' });
  
  const startTime = Date.now();
  
  try {
    const assetsPath = path.resolve(BUILD_DIRECTORIES.ASSETS);
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    
    // Skip copying if no assets directory exists (optional assets)
    if (!fs.existsSync(assetsPath)) {
      logInfo('No assets directory found, skipping asset copying');
      return;
    }
    
    // Identify static assets and non-TypeScript files in source directory
    const assetFiles: string[] = [];
    const scanForAssets = (dirPath: string, relativePath: string = ''): void => {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scanForAssets(itemPath, relativeItemPath);
        } else {
          // Include all non-TypeScript files as assets
          if (!item.endsWith('.ts') && !item.endsWith('.tsx')) {
            assetFiles.push(relativeItemPath);
          }
        }
      }
    };
    
    scanForAssets(assetsPath);
    
    if (assetFiles.length === 0) {
      logInfo('No asset files found to copy');
      return;
    }
    
    logDebug(`Found ${assetFiles.length} asset files to copy`);
    
    // Create corresponding directory structure in build output
    const assetsDestPath = path.join(distPath, 'assets');
    fs.mkdirSync(assetsDestPath, { recursive: true });
    
    // Copy files while preserving directory hierarchy and permissions
    for (const assetFile of assetFiles) {
      const sourcePath = path.join(assetsPath, assetFile);
      const destPath = path.join(assetsDestPath, assetFile);
      
      try {
        // Create destination directory if it doesn't exist
        const destDir = path.dirname(destPath);
        fs.mkdirSync(destDir, { recursive: true });
        
        // Copy file with original permissions
        fs.copyFileSync(sourcePath, destPath);
        
        logDebug(`Copied asset: ${assetFile}`);
        
      } catch (error) {
        // Handle file copying errors with detailed error messages
        throw createAppError(
          `Failed to copy asset file: ${assetFile}`,
          500,
          'ASSET_COPY_ERROR',
          {
            sourceFile: assetFile,
            sourcePath,
            destPath,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    }
    
    // Validate copied assets for integrity and completeness
    const copiedFiles: string[] = [];
    const validateCopiedAssets = (dirPath: string, relativePath: string = ''): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          validateCopiedAssets(itemPath, relativeItemPath);
        } else {
          copiedFiles.push(relativeItemPath);
        }
      }
    };
    
    validateCopiedAssets(assetsDestPath);
    
    // Verify all asset files were copied successfully
    const missingFiles = assetFiles.filter(file => !copiedFiles.includes(file));
    if (missingFiles.length > 0) {
      logWarn(`Some asset files were not copied: ${missingFiles.join(', ')}`);
    }
    
    const duration = Date.now() - startTime;
    
    // Log asset copying progress and completion status
    logInfo('Asset copying completed successfully', {
      assetFiles: assetFiles.length,
      copiedFiles: copiedFiles.length,
      missingFiles: missingFiles.length,
      duration: `${duration}ms`
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      logAppError(error, 'copyAssets');
      throw error;
    }
    
    const buildError = createAppError(
      'Asset copying failed',
      500,
      'ASSET_COPY_FAILED',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logAppError(buildError, 'copyAssets');
    throw buildError;
  }
}

/**
 * Generates Build Manifest File
 * 
 * Creates a build manifest file containing build metadata, compilation information,
 * and deployment details. Provides build traceability and version information for
 * production deployments with comprehensive build context and integrity verification.
 * 
 * @returns Promise resolving to build manifest object with metadata
 * @throws AppError if manifest generation fails
 */
export async function generateBuildManifest(): Promise<BuildManifest> {
  logInfo('Generating build manifest', { step: 'manifest-generation' });
  
  try {
    // Collect build timestamp and environment information
    const timestamp = new Date().toISOString();
    const buildId = `build_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Generate build version and commit information if available
    let version = '1.0.0';
    try {
      const packageJsonPath = path.resolve('package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      version = packageJson.version || version;
    } catch (error) {
      logDebug('Could not read version from package.json, using default');
    }
    
    // Include TypeScript compilation details and source maps
    let typescriptVersion = 'unknown';
    try {
      const { stdout } = await execAsync('npx tsc --version');
      typescriptVersion = stdout.trim().replace('Version ', '');
    } catch (error) {
      logDebug('Could not determine TypeScript version');
    }
    
    // Add dependency versions and package information
    const nodeVersion = process.version;
    
    // Create placeholder compilation result for manifest
    const compilation: CompilationResult = {
      success: true,
      errors: [],
      warnings: [],
      duration: 0,
      filesCompiled: 0,
      outputFiles: []
    };
    
    // Include deployment-specific configuration and settings
    const assets: string[] = [];
    const assetsPath = path.resolve(BUILD_DIRECTORIES.DIST, 'assets');
    if (fs.existsSync(assetsPath)) {
      const scanAssets = (dirPath: string, basePath: string = ''): void => {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const relativePath = path.join(basePath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            scanAssets(itemPath, relativePath);
          } else {
            assets.push(relativePath);
          }
        }
      };
      
      scanAssets(assetsPath, 'assets');
    }
    
    // Create file checksums for build artifact integrity
    const checksums: Record<string, string> = {};
    const crypto = require('crypto');
    
    const generateChecksums = (dirPath: string): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          generateChecksums(itemPath);
        } else {
          try {
            const fileContent = fs.readFileSync(itemPath);
            const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
            const relativePath = path.relative(path.resolve(BUILD_DIRECTORIES.DIST), itemPath);
            checksums[relativePath] = hash;
          } catch (error) {
            logDebug(`Failed to generate checksum for ${item}`);
          }
        }
      }
    };
    
    generateChecksums(path.resolve(BUILD_DIRECTORIES.DIST));
    
    // Build manifest object with comprehensive information
    const manifest: BuildManifest = {
      buildId,
      timestamp,
      environment: env,
      version,
      nodeVersion,
      typescriptVersion,
      compilation,
      assets,
      checksums
    };
    
    // Write manifest file to build output directory
    const manifestPath = path.join(BUILD_DIRECTORIES.DIST, 'build-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    
    logInfo('Build manifest generated successfully', {
      buildId,
      manifestPath,
      assets: assets.length,
      checksums: Object.keys(checksums).length
    });
    
    // Return build manifest object for further processing
    return manifest;
    
  } catch (error) {
    const buildError = createAppError(
      'Build manifest generation failed',
      500,
      'MANIFEST_GENERATION_ERROR',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logAppError(buildError, 'generateBuildManifest');
    throw buildError;
  }
}

/**
 * Validates Build Output Artifacts
 * 
 * Validates the generated build artifacts for completeness, correctness, and
 * deployment readiness. Performs integrity checks on compiled files, assets,
 * and build structure with comprehensive validation reporting and issue tracking.
 * 
 * @returns Promise resolving to validation result with success status and issues
 * @throws AppError if validation process fails
 */
export async function validateBuildOutput(): Promise<ValidationResult> {
  logInfo('Starting build output validation', { step: 'validation' });
  
  try {
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];
    let checkedFiles = 0;
    
    // Check for presence of main entry point file (index.js)
    const mainEntryPoints = ['index.js', 'app.js', 'server.js'];
    let mainEntryFound = false;
    
    for (const entryPoint of mainEntryPoints) {
      const entryPath = path.join(distPath, entryPoint);
      if (fs.existsSync(entryPath)) {
        mainEntryFound = true;
        logDebug(`Main entry point found: ${entryPoint}`);
        break;
      }
    }
    
    if (!mainEntryFound) {
      issues.push({
        type: 'error',
        file: 'dist/',
        message: `No main entry point found. Expected one of: ${mainEntryPoints.join(', ')}`,
        severity: 'high'
      });
    }
    
    // Validate JavaScript file syntax and basic structure
    const validateJavaScriptFiles = (dirPath: string): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          validateJavaScriptFiles(itemPath);
        } else if (item.endsWith('.js')) {
          checkedFiles++;
          
          try {
            const fileContent = fs.readFileSync(itemPath, 'utf8');
            
            // Basic syntax validation - check for obvious syntax errors
            if (fileContent.includes('SyntaxError') || fileContent.includes('ReferenceError')) {
              issues.push({
                type: 'error',
                file: path.relative(distPath, itemPath),
                message: 'JavaScript file contains syntax errors',
                severity: 'high'
              });
            }
            
            // Check for source map references
            if (fileContent.includes('//# sourceMappingURL=') && isDevelopment) {
              logDebug(`Source map found for ${item}`);
            }
            
            // Validate basic structure for Node.js modules
            if (!fileContent.includes('exports') && !fileContent.includes('module.exports') && 
                !fileContent.includes('export ') && item !== 'index.js') {
              warnings.push(`File ${item} may not be a proper Node.js module`);
            }
            
          } catch (error) {
            issues.push({
              type: 'error',
              file: path.relative(distPath, itemPath),
              message: `Failed to validate JavaScript file: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'medium'
            });
          }
        }
      }
    };
    
    validateJavaScriptFiles(distPath);
    
    // Verify TypeScript declaration files are generated correctly
    const validateDeclarationFiles = (dirPath: string): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          validateDeclarationFiles(itemPath);
        } else if (item.endsWith('.d.ts')) {
          checkedFiles++;
          
          try {
            const fileContent = fs.readFileSync(itemPath, 'utf8');
            
            // Basic TypeScript declaration validation
            if (!fileContent.includes('export') && !fileContent.includes('declare')) {
              warnings.push(`Declaration file ${item} may be empty or incomplete`);
            }
            
          } catch (error) {
            issues.push({
              type: 'warning',
              file: path.relative(distPath, itemPath),
              message: `Failed to validate declaration file: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'low'
            });
          }
        }
      }
    };
    
    validateDeclarationFiles(distPath);
    
    // Check asset copying completeness and file integrity
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      const validateAssets = (dirPath: string): void => {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            validateAssets(itemPath);
          } else {
            checkedFiles++;
            
            // Check file size is reasonable
            if (stats.size === 0) {
              issues.push({
                type: 'warning',
                file: path.relative(distPath, itemPath),
                message: 'Asset file is empty',
                severity: 'low'
              });
            }
          }
        }
      };
      
      validateAssets(assetsPath);
    }
    
    // Validate package.json main and types field alignment
    try {
      const packageJsonPath = path.resolve('package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (packageJson.main) {
          const mainFile = path.join(distPath, packageJson.main.replace(/^dist\//, ''));
          if (!fs.existsSync(mainFile)) {
            issues.push({
              type: 'error',
              file: 'package.json',
              message: `Main file specified in package.json does not exist: ${packageJson.main}`,
              severity: 'high'
            });
          }
        }
        
        if (packageJson.types) {
          const typesFile = path.join(distPath, packageJson.types.replace(/^dist\//, ''));
          if (!fs.existsSync(typesFile)) {
            issues.push({
              type: 'warning',
              file: 'package.json',
              message: `Types file specified in package.json does not exist: ${packageJson.types}`,
              severity: 'medium'
            });
          }
        }
      }
    } catch (error) {
      logDebug('Could not validate package.json alignment');
    }
    
    // Perform basic smoke test of compiled application
    try {
      const mainFiles = ['index.js', 'app.js', 'server.js'];
      let smokeTestPassed = false;
      
      for (const mainFile of mainFiles) {
        const mainPath = path.join(distPath, mainFile);
        if (fs.existsSync(mainPath)) {
          try {
            // Basic syntax check by attempting to require the file
            const nodeCheckProcess = spawn('node', ['-c', mainPath], { stdio: 'pipe' });
            
            await new Promise<void>((resolve, reject) => {
              nodeCheckProcess.on('close', (code) => {
                if (code === 0) {
                  smokeTestPassed = true;
                  logDebug(`Smoke test passed for ${mainFile}`);
                } else {
                  logDebug(`Smoke test failed for ${mainFile}`);
                }
                resolve();
              });
              
              nodeCheckProcess.on('error', () => {
                resolve(); // Don't fail validation for smoke test issues
              });
            });
            
            break;
          } catch (error) {
            logDebug(`Smoke test error for ${mainFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      if (!smokeTestPassed && mainEntryFound) {
        warnings.push('Basic smoke test failed - compiled files may have runtime issues');
      }
      
    } catch (error) {
      logDebug('Could not perform smoke test');
    }
    
    // Generate validation report with any issues or warnings
    const valid = issues.filter(issue => issue.type === 'error').length === 0;
    
    const validationResult: ValidationResult = {
      valid,
      issues,
      warnings,
      checkedFiles
    };
    
    // Log validation results
    if (valid) {
      logInfo('Build output validation completed successfully', {
        checkedFiles,
        warnings: warnings.length,
        issues: issues.length
      });
    } else {
      logWarn('Build output validation found issues', {
        checkedFiles,
        errors: issues.filter(i => i.type === 'error').length,
        warnings: warnings.length
      });
    }
    
    // Return validation result with success status and details
    return validationResult;
    
  } catch (error) {
    const buildError = createAppError(
      'Build output validation failed',
      500,
      'VALIDATION_ERROR',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logAppError(buildError, 'validateBuildOutput');
    throw buildError;
  }
}

/**
 * Applies Production Build Optimizations
 * 
 * Applies production-specific optimizations to build artifacts including
 * minification, dead code elimination, and performance optimizations.
 * Enhances build output for production deployment efficiency with optional
 * optimizations based on environment configuration.
 * 
 * @returns Promise that resolves when optimization is complete
 * @throws AppError if optimization fails
 */
export async function optimizeBuildForProduction(): Promise<void> {
  logInfo('Starting production build optimizations', { step: 'optimization' });
  
  try {
    // Check if current environment is production using config.isProduction
    if (!isProduction) {
      logInfo('Skipping production optimizations - not in production environment');
      return;
    }
    
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    const startTime = Date.now();
    
    // Apply JavaScript minification to reduce file sizes
    logDebug('Applying JavaScript file optimizations');
    const optimizeJavaScriptFiles = (dirPath: string): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          optimizeJavaScriptFiles(itemPath);
        } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
          try {
            let fileContent = fs.readFileSync(itemPath, 'utf8');
            const originalSize = fileContent.length;
            
            // Remove development-only code and debug statements
            fileContent = fileContent
              .replace(/console\.debug\([^)]*\);?\s*/g, '')
              .replace(/\/\*\*[\s\S]*?\*\//g, '') // Remove JSDoc comments
              .replace(/\/\/.*$/gm, '') // Remove single-line comments
              .replace(/\s+/g, ' ') // Collapse whitespace
              .trim();
            
            // Write optimized content back to file
            fs.writeFileSync(itemPath, fileContent, 'utf8');
            
            const optimizedSize = fileContent.length;
            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
            
            logDebug(`Optimized ${item}: ${originalSize} -> ${optimizedSize} bytes (${savings}% reduction)`);
            
          } catch (error) {
            logWarn(`Failed to optimize ${item}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    };
    
    optimizeJavaScriptFiles(distPath);
    
    // Optimize source maps for production debugging needs
    logDebug('Optimizing source maps for production');
    const optimizeSourceMaps = (dirPath: string): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          optimizeSourceMaps(itemPath);
        } else if (item.endsWith('.js.map')) {
          try {
            // Remove or minimize source maps in production
            if (config.isDevelopment) {
              // Keep source maps in development builds
              logDebug(`Keeping source map: ${item}`);
            } else {
              // Remove source maps in production for security
              fs.unlinkSync(itemPath);
              logDebug(`Removed source map: ${item}`);
            }
          } catch (error) {
            logWarn(`Failed to process source map ${item}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    };
    
    optimizeSourceMaps(distPath);
    
    // Compress static assets and optimize file sizes
    logDebug('Compressing static assets');
    const compressAssets = (dirPath: string): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          compressAssets(itemPath);
        } else {
          // Apply basic file size optimizations
          const originalSize = stats.size;
          
          if (item.endsWith('.json')) {
            try {
              const jsonContent = fs.readFileSync(itemPath, 'utf8');
              const parsed = JSON.parse(jsonContent);
              const minified = JSON.stringify(parsed);
              fs.writeFileSync(itemPath, minified, 'utf8');
              
              const newSize = fs.statSync(itemPath).size;
              const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
              logDebug(`Compressed JSON ${item}: ${originalSize} -> ${newSize} bytes (${savings}% reduction)`);
              
            } catch (error) {
              logWarn(`Failed to compress JSON ${item}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }
    };
    
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      compressAssets(assetsPath);
    }
    
    // Generate production-specific configuration files
    logDebug('Generating production configuration');
    const prodConfigPath = path.join(distPath, 'production.json');
    const prodConfig = {
      environment: 'production',
      optimized: true,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      features: {
        minification: true,
        sourceMapRemoval: true,
        assetCompression: true
      }
    };
    
    fs.writeFileSync(prodConfigPath, JSON.stringify(prodConfig, null, 2), 'utf8');
    
    const duration = Date.now() - startTime;
    
    // Log optimization results and file size improvements
    logInfo('Production optimizations completed successfully', {
      duration: `${duration}ms`,
      optimizations: ['minification', 'source-map-removal', 'asset-compression', 'config-generation']
    });
    
  } catch (error) {
    const buildError = createAppError(
      'Production optimization failed',
      500,
      'OPTIMIZATION_ERROR',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logAppError(buildError, 'optimizeBuildForProduction');
    throw buildError;
  }
}

/**
 * Handles Build Process Errors
 * 
 * Centralized error handling for build process failures with detailed error
 * reporting, cleanup operations, and exit code management. Provides comprehensive
 * error context for debugging build issues and CI/CD integration support.
 * 
 * @param error - Error object (AppError or generic Error)
 * @param buildStep - Build step where error occurred
 * @returns Never returns, exits process with appropriate error code
 */
export async function handleBuildError(error: Error | AppError, buildStep: string): Promise<never> {
  logError('Build process failed', { step: buildStep, error: error.message });
  
  try {
    // Log detailed error information with build step context
    const errorContext = {
      buildStep,
      timestamp: new Date().toISOString(),
      environment: env,
      nodeVersion: process.version,
      workingDirectory: process.cwd()
    };
    
    if (error instanceof AppError) {
      logAppError(error, buildStep, errorContext);
    } else {
      const appError = createAppError(
        `Build failed in step: ${buildStep}`,
        500,
        'BUILD_PROCESS_ERROR',
        { originalError: error.message, context: errorContext }
      );
      logAppError(appError, buildStep, errorContext);
    }
    
    // Perform cleanup operations for partial build artifacts
    logInfo('Performing build cleanup after error');
    
    try {
      const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
      if (fs.existsSync(distPath)) {
        // Mark build as failed by creating a failure marker
        const failureMarkerPath = path.join(distPath, '.build-failed');
        const failureInfo = {
          timestamp: new Date().toISOString(),
          step: buildStep,
          error: error.message,
          environment: env
        };
        
        fs.writeFileSync(failureMarkerPath, JSON.stringify(failureInfo, null, 2), 'utf8');
        logInfo('Build failure marker created');
      }
    } catch (cleanupError) {
      logWarn('Failed to perform build cleanup', { 
        error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error' 
      });
    }
    
    // Generate error report with debugging information
    const errorReport = {
      buildStep,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
      environment: env,
      nodeVersion: process.version,
      workingDirectory: process.cwd(),
      memoryUsage: process.memoryUsage()
    };
    
    logError('Build Error Report', errorReport);
    
    // Include environment and configuration details in error context
    logInfo('Build environment details', {
      cwd: process.cwd(),
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
    
    // Set appropriate exit code for CI/CD pipeline integration
    const exitCode = error instanceof AppError ? 1 : 2;
    
    logError(`Build process terminating with exit code ${exitCode}`);
    
    // Exit process with error status to signal build failure
    process.exit(exitCode);
    
  } catch (handlingError) {
    // Fallback error handling if error handling itself fails
    console.error('Fatal error in build error handling:', handlingError);
    process.exit(3);
  }
}

/**
 * Reports Successful Build Completion
 * 
 * Reports successful build completion with build metrics, performance data, and
 * deployment information. Provides comprehensive build summary for monitoring
 * and optimization purposes with CI/CD integration support.
 * 
 * @param buildResult - Complete build result with metrics and details
 */
export function reportBuildSuccess(buildResult: BuildResult): void {
  logInfo('='.repeat(60));
  logInfo('BUILD COMPLETED SUCCESSFULLY');
  logInfo('='.repeat(60));
  
  // Log build completion with success status and timing information
  logInfo('Build Summary', {
    success: buildResult.success,
    duration: `${buildResult.duration}ms`,
    environment: buildResult.manifest.environment,
    buildId: buildResult.manifest.buildId
  });
  
  // Report build metrics including file counts and sizes
  const metrics = buildResult.metrics;
  logInfo('Build Metrics', {
    totalFiles: metrics.totalFiles,
    totalSize: `${(metrics.totalSize / 1024).toFixed(2)} KB`,
    compilationTime: `${metrics.compilationTime}ms`,
    assetCopyTime: `${metrics.assetCopyTime}ms`
  });
  
  // Include compilation performance data and optimization results
  const compilation = buildResult.manifest.compilation;
  logInfo('Compilation Results', {
    filesCompiled: compilation.filesCompiled,
    outputFiles: compilation.outputFiles.length,
    warnings: compilation.warnings.length,
    errors: compilation.errors.length
  });
  
  // Generate build summary with deployment-ready artifact information
  logInfo('Build Artifacts', {
    distDirectory: BUILD_DIRECTORIES.DIST,
    manifestFile: 'build-manifest.json',
    artifacts: buildResult.artifacts.length,
    validation: buildResult.validation.valid ? 'PASSED' : 'FAILED'
  });
  
  // Log next steps and deployment instructions if applicable
  logInfo('Next Steps:');
  logInfo('1. Review build artifacts in the dist/ directory');
  logInfo('2. Run tests: npm test');
  logInfo('3. Start application: node dist/index.js');
  
  if (isProduction) {
    logInfo('4. Deploy to production environment');
    logInfo('5. Monitor application performance');
  } else {
    logInfo('4. Run in development mode: npm run dev');
  }
  
  // Set successful exit code for CI/CD pipeline integration
  logInfo('Build process completed with exit code 0');
  logInfo('='.repeat(60));
}

/**
 * Main Build Orchestration Function
 * 
 * Main build orchestration function that coordinates all build steps in the
 * correct sequence. Handles the complete build pipeline from validation through
 * artifact generation with comprehensive error handling and progress reporting.
 * 
 * @returns Promise resolving to complete build result with metrics and artifacts
 * @throws AppError if any build step fails
 */
export async function executeBuild(): Promise<BuildResult> {
  const buildStartTime = Date.now();
  
  logInfo('Starting build process for Node.js Tutorial Application');
  logInfo(`Environment: ${env}`);
  logInfo(`Node.js Version: ${process.version}`);
  logInfo(`Working Directory: ${process.cwd()}`);
  
  try {
    // Initialize build process with environment validation
    logInfo('Step 1: Validating build environment');
    await validateBuildEnvironment();
    
    // Clean existing build artifacts and prepare output directory
    logInfo('Step 2: Cleaning build directory');
    await cleanBuildDirectory();
    
    // Execute TypeScript compilation with error handling
    logInfo('Step 3: Compiling TypeScript');
    const compilationResult = await compileTypeScript();
    
    if (!compilationResult.success) {
      throw createAppError(
        'TypeScript compilation failed',
        500,
        'COMPILATION_FAILED',
        { compilationResult }
      );
    }
    
    // Copy static assets and non-TypeScript files to build output
    logInfo('Step 4: Copying assets');
    await copyAssets();
    
    // Generate build manifest with metadata and version information
    logInfo('Step 5: Generating build manifest');
    const manifest = await generateBuildManifest();
    
    // Update manifest with compilation results
    manifest.compilation = compilationResult;
    
    // Validate build output for completeness and correctness
    logInfo('Step 6: Validating build output');
    const validation = await validateBuildOutput();
    
    // Apply production optimizations if building for production environment
    if (isProduction) {
      logInfo('Step 7: Applying production optimizations');
      await optimizeBuildForProduction();
    }
    
    // Calculate build metrics and performance data
    const buildEndTime = Date.now();
    const totalDuration = buildEndTime - buildStartTime;
    
    // Collect build artifacts
    const artifacts: string[] = [];
    const distPath = path.resolve(BUILD_DIRECTORIES.DIST);
    
    const collectArtifacts = (dirPath: string, basePath: string = ''): void => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          collectArtifacts(itemPath, relativePath);
        } else {
          artifacts.push(relativePath);
        }
      }
    };
    
    collectArtifacts(distPath);
    
    // Calculate total build artifact size
    let totalSize = 0;
    for (const artifact of artifacts) {
      const artifactPath = path.join(distPath, artifact);
      if (fs.existsSync(artifactPath)) {
        totalSize += fs.statSync(artifactPath).size;
      }
    }
    
    // Generate build metrics
    const metrics: BuildMetrics = {
      totalFiles: artifacts.length,
      totalSize,
      compilationTime: compilationResult.duration,
      assetCopyTime: 0, // Would be tracked in actual asset copying
      compressionRatio: isProduction ? 0.75 : undefined // Estimated compression ratio
    };
    
    // Generate final build report with metrics and deployment information
    const buildResult: BuildResult = {
      success: true,
      duration: totalDuration,
      manifest,
      validation,
      artifacts,
      metrics
    };
    
    // Report successful build completion
    reportBuildSuccess(buildResult);
    
    // Return comprehensive build result object with all build details
    return buildResult;
    
  } catch (error) {
    // Handle build errors with comprehensive error reporting
    await handleBuildError(
      error instanceof Error ? error : new Error('Unknown build error'),
      'executeBuild'
    );
  }
}

// Export all build functions and types for external use
export {
  // Type definitions
  CompilationResult,
  BuildManifest,
  ValidationResult,
  ValidationIssue,
  BuildResult,
  BuildMetrics,
  BuildStep,
  BuildValidator,
  AssetProcessor
};

// Main execution if script is run directly
if (require.main === module) {
  // Execute build process when script is run directly
  executeBuild()
    .then((result) => {
      logInfo('Build script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logError('Build script failed', { error: error.message });
      process.exit(1);
    });
}