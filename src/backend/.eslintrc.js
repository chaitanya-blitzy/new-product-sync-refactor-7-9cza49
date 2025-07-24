// ESLint configuration for Node.js tutorial application backend
// Establishes comprehensive code quality standards, TypeScript integration, and modern JavaScript linting rules
// Supports Express.js 5.1.0 development with TypeScript 5.6.x and Node.js 24.x runtime features

module.exports = {
  // Root configuration - prevents ESLint from searching parent directories
  root: true,

  // Environment configuration for Node.js 24.x, ES2024, and Jest testing
  env: {
    node: true,        // Node.js global variables and Node.js scoping
    es2024: true,      // ES2024 globals and automatically sets the ecmaVersion to 2024
    jest: true         // Jest global variables for testing environment
  },

  // TypeScript parser for enhanced code analysis and AST generation
  parser: '@typescript-eslint/parser', // ^8.8.1

  // Parser configuration for TypeScript 5.6.x compatibility and type-aware analysis
  parserOptions: {
    ecmaVersion: 'latest',           // Use the latest ECMAScript version
    sourceType: 'module',            // Enable ES modules
    project: ['./tsconfig.json'],    // TypeScript project configuration for type-aware rules
    tsconfigRootDir: __dirname,      // Root directory for TypeScript configuration resolution
    createDefaultProgram: false      // Disable default program creation for performance
  },

  // Extended configurations for comprehensive linting coverage
  extends: [
    'eslint:recommended',                                    // ESLint core recommended rules
    '@typescript-eslint/recommended',                       // TypeScript recommended rules
    '@typescript-eslint/recommended-requiring-type-checking', // Type-aware TypeScript rules
    '@typescript-eslint/strict'                             // Strict TypeScript rules for enhanced safety
  ],

  // Plugins for enhanced linting capabilities
  plugins: [
    '@typescript-eslint', // TypeScript-specific ESLint rules and type-aware analysis ^8.8.1
    'security',           // Security-focused linting rules for identifying vulnerabilities
    'node',              // Node.js specific linting rules and best practices
    'import'             // Import/export syntax linting and organization
  ],

  // Comprehensive rule configuration for code quality enforcement
  rules: {
    // TypeScript-specific rules for type safety and modern patterns
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_' // Allow unused parameters prefixed with underscore
    }],
    '@typescript-eslint/explicit-function-return-type': ['warn', { 
      allowExpressions: true // Allow return type inference for expressions
    }],
    '@typescript-eslint/no-explicit-any': 'warn',                    // Discourage any type usage
    '@typescript-eslint/prefer-const': 'error',                     // Enforce const for immutable variables
    '@typescript-eslint/no-var-requires': 'error',                  // Require import instead of require()
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // Prefer interface over type
    '@typescript-eslint/consistent-type-imports': ['error', { 
      prefer: 'type-imports' // Enforce type-only imports for types
    }],
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',    // Remove redundant type assertions
    '@typescript-eslint/prefer-nullish-coalescing': 'error',        // Use nullish coalescing operator
    '@typescript-eslint/prefer-optional-chain': 'error',            // Use optional chaining
    '@typescript-eslint/strict-boolean-expressions': 'error',       // Strict boolean context usage

    // Security-focused rules for vulnerability detection and prevention
    'security/detect-object-injection': 'error',           // Detect potential object injection vulnerabilities
    'security/detect-non-literal-regexp': 'warn',          // Warn about non-literal RegExp constructors
    'security/detect-unsafe-regex': 'error',               // Detect ReDoS vulnerable regular expressions
    'security/detect-buffer-noassert': 'error',            // Prevent unsafe Buffer operations
    'security/detect-child-process': 'warn',               // Warn about child process usage
    'security/detect-disable-mustache-escape': 'error',    // Prevent mustache escape disabling
    'security/detect-eval-with-expression': 'error',       // Detect dangerous eval usage
    'security/detect-no-csrf-before-method-override': 'error', // Ensure CSRF protection
    'security/detect-non-literal-fs-filename': 'warn',     // Warn about non-literal fs operations
    'security/detect-non-literal-require': 'warn',         // Warn about dynamic require statements
    'security/detect-possible-timing-attacks': 'warn',     // Detect potential timing attack vulnerabilities
    'security/detect-pseudoRandomBytes': 'error',          // Ensure secure random byte generation

    // Node.js-specific rules for modern API usage and best practices
    'node/no-deprecated-api': 'error',                     // Prevent usage of deprecated Node.js APIs
    'node/no-extraneous-import': 'error',                  // Ensure imports are declared in package.json
    'node/no-extraneous-require': 'error',                 // Ensure requires are declared in package.json
    'node/no-missing-import': 'off',                       // Disabled - TypeScript handles this
    'node/no-missing-require': 'off',                      // Disabled - TypeScript handles this
    'node/no-unpublished-import': 'off',                   // Disabled - allows dev dependencies
    'node/no-unpublished-require': 'off',                  // Disabled - allows dev dependencies
    'node/no-unsupported-features/es-syntax': 'off',       // Disabled - TypeScript compiles ES features
    'node/prefer-global/buffer': 'error',                  // Prefer global Buffer over require
    'node/prefer-global/console': 'error',                 // Prefer global console over require
    'node/prefer-global/process': 'error',                 // Prefer global process over require
    'node/prefer-promises/dns': 'error',                   // Prefer promise-based DNS APIs
    'node/prefer-promises/fs': 'error',                    // Prefer promise-based filesystem APIs

    // Import organization and dependency management rules
    'import/order': ['error', {
      groups: [
        'builtin',    // Node.js built-in modules
        'external',   // External packages
        'internal',   // Internal modules
        'parent',     // Parent directory imports
        'sibling',    // Sibling file imports
        'index'       // Index file imports
      ],
      'newlines-between': 'always',    // Require newlines between import groups
      alphabetize: {
        order: 'asc',                  // Sort imports alphabetically
        caseInsensitive: true          // Case-insensitive sorting
      }
    }],
    'import/no-unresolved': 'off',                        // Disabled - TypeScript handles resolution
    'import/no-dynamic-require': 'error',                 // Prevent dynamic require for security
    'import/no-webpack-loader-syntax': 'error',           // Prevent webpack loader syntax
    'import/no-self-import': 'error',                     // Prevent modules from importing themselves
    'import/no-cycle': 'error',                           // Prevent circular dependencies
    'import/no-useless-path-segments': 'error',           // Remove useless path segments
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'], // Consistent type import style

    // General JavaScript/TypeScript best practices and modern patterns
    'no-console': 'warn',                    // Warn about console usage in production code
    'no-debugger': 'error',                  // Prevent debugger statements
    'no-alert': 'error',                     // Prevent alert/confirm/prompt usage
    'no-eval': 'error',                      // Prevent eval usage
    'no-implied-eval': 'error',              // Prevent implied eval
    'no-new-func': 'error',                  // Prevent Function constructor
    'no-script-url': 'error',                // Prevent javascript: URLs
    'no-proto': 'error',                     // Prevent __proto__ usage
    'no-iterator': 'error',                  // Prevent __iterator__ usage
    'no-restricted-syntax': ['error', 'WithStatement'], // Prevent with statements
    'prefer-const': 'error',                 // Enforce const for variables that are never reassigned
    'no-var': 'error',                       // Prevent var declarations
    'object-shorthand': 'error',             // Enforce object shorthand syntax
    'prefer-arrow-callback': 'error',        // Prefer arrow functions as callbacks
    'prefer-template': 'error',              // Prefer template literals over string concatenation
    'template-curly-spacing': 'error',       // Enforce spacing in template literals
    'prefer-rest-params': 'error',           // Prefer rest parameters over arguments
    'prefer-spread': 'error'                 // Prefer spread operator over apply()
  },

  // Environment-specific rule overrides for different file types and contexts
  overrides: [
    {
      // Test files - more relaxed rules for testing scenarios
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true // Ensure Jest environment for test files
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',        // Allow any in tests for mocking
        '@typescript-eslint/no-non-null-assertion': 'off',  // Allow non-null assertions in tests
        'security/detect-object-injection': 'off',          // Allow object injection in test scenarios
        'no-console': 'off'                                 // Allow console in tests for debugging
      }
    },
    {
      // Script files - relaxed rules for build and utility scripts
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off',              // Allow console output in scripts
        'node/no-process-exit': 'off'     // Allow process.exit() in scripts
      }
    },
    {
      // JavaScript files - adapted rules for non-TypeScript files
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',              // Allow require() in JS files
        '@typescript-eslint/explicit-function-return-type': 'off' // No return type annotations in JS
      }
    }
  ],

  // Files and directories to ignore during linting
  ignorePatterns: [
    'node_modules/',    // Package dependencies
    'dist/',           // Built/compiled output
    'coverage/',       // Test coverage reports
    '*.d.ts',         // TypeScript declaration files
    'build/',         // Build artifacts
    'tmp/',           // Temporary files
    '.cache/'         // Cache directories
  ]
};