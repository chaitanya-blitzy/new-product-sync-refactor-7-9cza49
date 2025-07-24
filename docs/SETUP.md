# Setup Guide - Node.js Tutorial Application

Complete setup and installation guide for the Node.js tutorial application with Express.js 5.1.0, TypeScript, and modern development tooling. This comprehensive guide provides step-by-step instructions for configuring your development environment, installing dependencies, and getting the application running locally for learning Node.js fundamentals.

## Prerequisites

### System Requirements

Before setting up the Node.js tutorial application, ensure your system meets the following requirements:

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| **Operating System** | Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+, CentOS 7+) | Cross-platform compatibility with Node.js 24.x runtime support |
| **Memory** | Minimum 4GB RAM, Recommended 8GB+ | Sufficient memory for Node.js development, TypeScript compilation, and testing |
| **Storage** | Minimum 2GB free disk space | Space for Node.js runtime, dependencies, and development tools |
| **Network** | Internet connection for package downloads | Required for npm package installation and updates |

### Software Prerequisites

Install the following software components in order:

#### 1. Node.js 24.x LTS (Required)
**Version**: 24.x LTS
**Installation**: Download from [https://nodejs.org/](https://nodejs.org/)
**Verification**: `node --version`

Node.js 24.x includes npm 11.x and V8 engine 13.6 with enhanced security and performance features. This version enters long-term support (LTS) status, providing stability for educational purposes.

**Installation Methods**:

**Windows/macOS (Official Installer)**:
1. Visit https://nodejs.org/ and download Node.js 24.x LTS
2. Run the installer with default settings
3. Verify installation: `node --version` and `npm --version`
4. Ensure Node.js version is 24.x.x and npm version is 11.x.x

**Linux (Package Manager)**:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

**Node Version Manager (NVM) - Recommended for Multiple Versions**:
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Install and use Node.js 24
nvm install 24
nvm use 24
nvm alias default 24

# Verify installation
node --version
npm --version
```

#### 2. npm 11.x (Included with Node.js)
**Version**: 11.x
**Verification**: `npm --version`

npm 11.x provides enhanced security features and improved performance for package management. It includes several improvements and new features for modern Node.js development.

#### 3. Git (Required)
**Version**: 2.20+
**Installation**: Download from [https://git-scm.com/](https://git-scm.com/)
**Verification**: `git --version`

Version control system for source code management and repository cloning.

#### 4. Docker Desktop (Optional)
**Version**: 4.0+
**Installation**: Download from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
**Verification**: `docker --version`

Optional for containerized development environment and deployment testing.

#### 5. Code Editor (Required)
**Recommendations**: Visual Studio Code, WebStorm, Sublime Text
**Version**: Latest

IDE with TypeScript support recommended for optimal development experience.

**Visual Studio Code Extensions (Recommended)**:
- ms-vscode.vscode-typescript-next - Enhanced TypeScript support
- esbenp.prettier-vscode - Code formatting integration
- ms-vscode.vscode-eslint - ESLint integration
- ms-vscode.vscode-jest - Jest test runner integration

## Quick Start

Get the Node.js tutorial application running in under 5 minutes with these essential commands:

### 1. Clone Repository
```bash
git clone <repository-url>
cd nodejs-tutorial-app
```
Clone the project repository and navigate to the project directory.

### 2. Navigate to Backend
```bash
cd src/backend
```
Navigate to the backend application directory containing the Node.js tutorial code.

### 3. Install Dependencies
```bash
npm install
```
Install all required dependencies including Express.js 5.1.0, TypeScript 5.3.0, and development tools.

### 4. Setup Environment
```bash
cp .env.example .env
```
Create environment configuration file with default development settings.

### 5. Start Development Server
```bash
npm run dev
```
Start the development server with hot reloading and TypeScript compilation.

### 6. Verify Installation
```bash
curl http://localhost:3000/hello
```
**Expected Output**: `Hello world`

Test the hello endpoint to verify successful setup and server functionality.

### Success Indicators
- ✅ Server starts without errors on port 3000
- ✅ TypeScript compilation completes successfully
- ✅ Hello endpoint returns 'Hello world' response
- ✅ Development server responds to file changes with hot reloading

## Detailed Installation

### Node.js Installation

#### Official Installer Method (Windows/macOS)
1. Visit https://nodejs.org/ and download Node.js 24.x LTS
2. Run the installer with default settings
3. Verify installation with `node --version` and `npm --version`
4. Ensure Node.js version is 24.x.x and npm version is 11.x.x

**Notes**: Recommended for most users, includes npm 11.x automatically

#### Package Manager Method (Linux/macOS)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo yum install -y nodejs

# macOS Homebrew
brew install node@24

# Verify installation
node --version
npm --version
```

**Notes**: Use official NodeSource repositories for latest Node.js 24.x versions

#### Node Version Manager (NVM) Method
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source ~/.bashrc
source ~/.bashrc

# Install Node.js 24
nvm install 24
nvm use 24
nvm alias default 24

# Verify installation
node --version
npm --version
```

**Notes**: Recommended for developers managing multiple Node.js versions

#### Verification Commands
```bash
node --version    # Expected: v24.x.x
npm --version     # Expected: 11.x.x
npx --version     # Expected: 11.x.x
```

### Project Setup

#### Step 1: Clone Repository
```bash
git clone <repository-url> nodejs-tutorial-app
cd nodejs-tutorial-app
```
Clone the project repository to a local directory and navigate to the project root.

#### Step 2: Navigate to Backend
```bash
cd src/backend
```
Change to the backend application directory containing the main application code.

#### Step 3: Explore Project Structure
```bash
ls -la
```
Review the project structure and available directories:

```
src/backend/
├── src/                 # TypeScript source code
│   ├── config/         # Application configuration
│   ├── handlers/       # Route handler implementations
│   ├── middleware/     # Express.js middleware stack
│   ├── routes/         # Route definitions
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express.js application factory
│   ├── index.ts        # Application entry point
│   └── server.ts       # HTTP server setup
├── tests/              # Test suites
├── dist/               # Compiled JavaScript output
├── coverage/           # Test coverage reports
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .env.example        # Environment variables template
└── README.md           # Project documentation
```

#### Step 4: Install Dependencies

**Standard Installation (Development)**:
```bash
npm install
```
Installs all dependencies including development tools and testing frameworks.

**Clean Installation (Production/CI)**:
```bash
npm ci
```
Clean installation from package-lock.json for consistent builds.

**Production Only Installation**:
```bash
npm install --production
```
Installs only production dependencies without development tools.

#### Dependency Categories

**Production Dependencies** (package.json):
- `express@^5.1.0` - Web framework with enhanced security
- `helmet@^7.1.0` - Security middleware for HTTP headers
- `cors@^2.8.5` - Cross-Origin Resource Sharing middleware
- `winston@^3.15.0` - Comprehensive logging library
- `dotenv@^16.4.7` - Environment variable management
- `express-rate-limit@^7.1.5` - Rate limiting middleware
- `compression@^1.7.4` - Response compression middleware
- `morgan@^1.10.0` - HTTP request logger middleware

**Development Dependencies**:
- `typescript@^5.3.0` - TypeScript compiler and language support
- `@types/node@^24.0.0` - Node.js type definitions
- `@types/express@^5.0.0` - Express.js type definitions
- `jest@^29.7.0` - Testing framework with TypeScript support
- `nodemon@^3.1.7` - Development server with hot reloading
- `eslint@^9.12.0` - Code quality and linting tools
- `prettier@^3.3.3` - Code formatting tool
- `ts-node@^10.9.2` - TypeScript execution engine
- `supertest@^6.3.0` - HTTP integration testing

#### Step 5: Build and Test Verification
```bash
# Compile TypeScript
npm run build

# Run test suite
npm test

# Check code quality
npm run lint

# Verify type checking
npm run type-check
```

**Expected Results**:
- ✅ TypeScript compilation successful
- ✅ All tests pass with 100% coverage
- ✅ ESLint passes with no errors
- ✅ Type checking completes without errors

## Environment Configuration

### Environment File Setup

#### Step 1: Copy Template
```bash
cp .env.example .env
```
Create local environment file from template.

#### Step 2: Review Available Variables
```bash
cat .env.example
```
Review available environment variables and their purposes.

#### Step 3: Customize Settings
Edit the `.env` file according to your development environment needs.

### Key Environment Variables

#### Core Server Configuration
```bash
# Application Environment
NODE_ENV=development          # Options: development, production, test, staging

# HTTP Server Configuration
PORT=3000                     # HTTP server port (change if 3000 is in use)
HOST=localhost                # Server binding address
TIMEOUT=30000                 # Request timeout in milliseconds
REQUEST_SIZE_LIMIT=10mb       # Maximum request body size
```

#### Logging Configuration
```bash
# Application Logging
LOG_LEVEL=info               # Options: error, warn, info, http, debug
DEBUG=tutorial:*             # Debug namespace for development logging
```

#### Security Configuration
```bash
# CORS Configuration
CORS_ORIGIN=http://localhost:3000    # Allowed CORS origins

# Security Headers
HELMET_CSP=true                      # Enable Content Security Policy

# Rate Limiting
RATE_LIMIT_WINDOW=900000            # Rate limit window (15 minutes)
RATE_LIMIT_MAX=100                  # Maximum requests per window
```

#### Development vs Production Settings

**Development Environment**:
```bash
NODE_ENV=development
PORT=3000
HOST=localhost
LOG_LEVEL=debug
DEBUG=tutorial:*
HOT_RELOAD=true
CORS_ORIGIN=*
HELMET_CSP=false
RATE_LIMIT_MAX=10000
```

**Production Environment**:
```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=info
CLUSTER_MODE=true
TRUST_PROXY=true
CORS_ORIGIN=https://yourdomain.com
HELMET_CSP=true
RATE_LIMIT_MAX=1000
TIMEOUT=60000
```

### Security Considerations

#### Best Practices
- ✅ Never commit `.env` files to version control
- ✅ Use different values for each environment (dev, staging, prod)
- ✅ Store sensitive values in secure environment variable systems
- ✅ Validate all environment variables at application startup

#### Security Levels by Environment
- **Development**: Relaxed for convenience with detailed debugging
- **Production**: Strict for security with minimal information disclosure

## Development Workflow

### npm Scripts Reference

The application provides comprehensive npm scripts for development workflow:

#### Primary Development Commands
```bash
# Start development server with hot reloading and TypeScript compilation
npm run dev
# Features: Automatic restart on file changes, TypeScript compilation, source maps, debug output

# Start development server with Node.js debugger
npm run dev:debug
# Features: Debugger port 9229, VS Code integration, breakpoint support

# Build TypeScript to JavaScript for production
npm run build
# Output: Compiled JavaScript in dist/ directory with source maps and declarations

# Start production server using compiled JavaScript
npm start
# Prerequisites: Must run npm run build first
```

#### Testing Commands
```bash
# Run complete test suite with coverage reporting
npm test
# Features: Unit tests, integration tests, coverage reporting, TypeScript compilation

# Run tests in watch mode for continuous testing
npm run test:watch
# Features: Automatic test re-run on file changes, interactive filtering, real-time feedback

# Generate detailed coverage report
npm run test:coverage
# Output: HTML coverage report in coverage/ directory

# Run tests for CI environment
npm run test:ci
# Features: CI-optimized settings, coverage validation, no watch mode
```

#### Code Quality Commands
```bash
# Check code quality and style with ESLint
npm run lint
# Scope: TypeScript files in src/ and tests/ directories

# Automatically fix ESLint issues
npm run lint:fix
# Features: Automatic error fixing, style consistency

# Format code with Prettier
npm run format
# Scope: All TypeScript and configuration files

# Check code formatting
npm run format:check
# Features: Validation without modification

# TypeScript type checking without compilation
npm run type-check
# Features: Type validation, error reporting
```

#### Utility Commands
```bash
# Clean build artifacts and cache
npm run clean
# Removes: dist/, coverage/, node_modules/.cache

# Comprehensive validation (lint + type-check + test)
npm run validate
# Features: Complete code quality validation

# Health check for running application
npm run health-check
# Tests: HTTP connectivity to /health endpoint
```

### Development Tools Integration

#### TypeScript Integration
- **Compiler**: TypeScript 5.3.0 with ES2024 target
- **Configuration**: tsconfig.json with strict type checking
- **Features**: Incremental compilation, source maps, declaration files, path mapping

#### Code Quality Tools
- **Linting**: ESLint 9.12.0 with TypeScript parser and security rules
- **Formatting**: Prettier 3.3.3 for consistent code style
- **Type Checking**: Strict TypeScript configuration for type safety

#### Development Server Features
- **Hot Reloading**: Automatic restart on file changes via nodemon
- **TypeScript Compilation**: Real-time TypeScript to JavaScript compilation
- **Source Maps**: Debug TypeScript directly in development tools
- **Error Reporting**: Clear error messages with stack traces

### Development Workflow Steps

1. **Start Development Server**: 
   ```bash
   npm run dev
   ```
   Primary development command with hot reloading and TypeScript compilation.

2. **Make Code Changes**: 
   Edit TypeScript files in the `src/` directory with automatic restart.

3. **Run Tests During Development**: 
   ```bash
   npm run test:watch
   ```
   Continuous testing with automatic re-run on file changes.

4. **Check Code Quality**: 
   ```bash
   npm run lint:fix && npm run format
   ```
   Automatic code quality and formatting fixes.

5. **Validate Before Commit**: 
   ```bash
   npm run validate
   ```
   Complete validation including linting, type checking, and testing.

6. **Build for Production**: 
   ```bash
   npm run build
   ```
   Compile TypeScript to JavaScript for deployment.

## Testing Setup

### Testing Framework Configuration

The application uses **Jest 29.7.0** with TypeScript integration for comprehensive testing:

#### Framework Features
- **TypeScript Support**: Full TypeScript integration via ts-jest
- **Coverage Requirements**: 100% code coverage for educational completeness
- **Integration Testing**: Supertest for HTTP endpoint testing
- **Parallel Execution**: Optimized test performance
- **Watch Mode**: Real-time testing during development

#### Jest Configuration (jest.config.ts)
```typescript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

### Test Execution Commands

#### Basic Test Commands
```bash
# Run all tests with coverage reporting
npm test
# Output: Test results and coverage report in terminal and coverage/ directory

# Run tests in watch mode for development
npm run test:watch
# Features: Automatic re-run on file changes, interactive test filtering, real-time feedback

# Generate detailed coverage report
npm run test:coverage
# Output: HTML coverage report in coverage/ directory for browser viewing

# Run tests for CI/CD pipeline
npm run test:ci
# Features: CI-optimized settings, coverage validation, no watch mode
```

#### Test Filtering
```bash
# Run specific test file
npm test -- --testPathPattern=hello

# Run tests matching pattern
npm test -- --testNamePattern="hello endpoint"

# Run only unit tests
npm test -- tests/unit

# Run only integration tests
npm test -- tests/integration
```

### Test Structure and Organization

#### Test Categories

**Unit Tests** (`tests/unit/`):
- **Purpose**: Test individual functions and components in isolation
- **Scope**: Handler functions, utility functions, configuration modules
- **Example**: Testing hello handler response generation

**Integration Tests** (`tests/integration/`):
- **Purpose**: Test complete request/response cycles and component integration
- **Scope**: HTTP endpoint tests, middleware integration, application startup
- **Example**: Testing complete HTTP request flow through Express.js application

#### Test Naming Conventions
```typescript
// Describe blocks for components
describe('Hello Handler', () => {
  // Test cases for specific behaviors
  it('should return Hello world with 200 status', () => {
    // Test implementation
  });
  
  it('should handle invalid requests gracefully', () => {
    // Error handling test
  });
});
```

### Coverage Requirements and Validation

The application maintains **100% code coverage** across all metrics:

#### Coverage Metrics
- **Line Coverage**: 100% - Every line of code is tested
- **Function Coverage**: 100% - Every function is tested
- **Branch Coverage**: 100% - Every code path is tested
- **Statement Coverage**: 100% - Every statement is tested

#### Coverage Validation
Coverage thresholds are enforced automatically:
- Build fails if coverage drops below 100%
- Detailed coverage reports identify uncovered code
- HTML reports provide visual coverage analysis

#### Coverage Reports
```bash
# Generate and view coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

### Writing and Running Tests

#### Example Unit Test
```typescript
import { describe, it, expect } from '@jest/globals';
import { HelloHandler } from '../src/handlers/hello.handler';

describe('Hello Handler', () => {
  it('should return Hello world response', () => {
    const handler = new HelloHandler();
    const result = handler.getHelloResponse();
    
    expect(result).toBe('Hello world');
  });
});
```

#### Example Integration Test
```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('GET /hello endpoint', () => {
  it('should return Hello world with 200 status', async () => {
    const response = await request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /text/);
    
    expect(response.text).toBe('Hello world');
  });
});
```

## Docker Setup (Optional)

Docker containerization provides a consistent development environment and demonstrates modern deployment practices.

### Prerequisites
- **Docker Desktop 4.0+** installed and running
- **Docker Compose 3.8+** support
- Basic understanding of containerization concepts

### Docker Setup Steps

#### Step 1: Verify Docker Installation
```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker is running
docker ps
```

#### Step 2: Navigate to Docker Directory
```bash
cd infrastructure/docker
```
Change to the Docker configuration directory containing docker-compose.yml.

#### Step 3: Start Development Environment
```bash
# Start containerized development environment with hot reloading
docker-compose up app-dev

# Start in detached mode
docker-compose up -d app-dev

# View logs
docker-compose logs -f app-dev
```

#### Step 4: Verify Container Setup
```bash
# Test the containerized application
curl http://localhost:3000/hello

# Expected output: Hello world

# Check container health
docker-compose ps
```

### Docker Configuration Options

#### Development Container (app-dev)
- **Features**: Hot reloading, debugging support, source volume mounts
- **Ports**: 3000 (HTTP), 9229 (Node.js debugger)
- **Volumes**: Source code mounted for real-time changes
- **Environment**: Development-optimized settings

#### Production Container (app)
- **Features**: Optimized image, security hardening, resource limits
- **Ports**: 3000 (HTTP only)
- **Volumes**: Log storage only
- **Environment**: Production-ready configuration

### Docker Commands Reference

#### Container Management
```bash
# Start development container
docker-compose up app-dev

# Start production container
docker-compose up app

# Stop and remove containers
docker-compose down

# View container logs
docker-compose logs app-dev

# Execute commands in running container
docker-compose exec app-dev npm test

# Rebuild containers
docker-compose build
```

#### Docker Benefits for Learning
- **Consistent Environment**: Same development environment across different machines
- **Isolated Dependencies**: No conflicts with system-installed packages
- **Easy Cleanup**: Complete environment reset with container removal
- **Production Simulation**: Container environment similar to production deployment
- **Learning Opportunity**: Hands-on experience with containerization

### Dockerfile Structure
The multi-stage Dockerfile provides both development and production targets:

```dockerfile
# Development stage with full tooling
FROM node:24-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000 9229

# Production stage with optimized image
FROM node:24-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=development /usr/src/app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

## IDE Configuration

### Visual Studio Code Setup

#### Recommended Extensions
Install these extensions for optimal Node.js development:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

#### Workspace Settings
Create `.vscode/settings.json` for project-specific configuration:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.autoRun": "watch",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

#### Debug Configuration
Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Node.js App",
      "program": "${workspaceFolder}/src/backend/src/index.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

#### Tasks Configuration
Create `.vscode/tasks.json` for build tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "dev",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "type": "npm",
      "script": "test",
      "group": "test"
    }
  ]
}
```

### WebStorm/IntelliJ IDEA Setup

#### Configuration Steps
1. **Enable TypeScript Service**: Settings → Languages & Frameworks → TypeScript
2. **Configure ESLint**: Settings → Languages & Frameworks → JavaScript → ESLint
3. **Set up Prettier**: Settings → Languages & Frameworks → JavaScript → Prettier
4. **Configure Jest**: Settings → Languages & Frameworks → JavaScript → Jest
5. **Enable Node.js**: Settings → Languages & Frameworks → Node.js

#### Run Configurations
Create run configurations for common tasks:
- **Node.js Application**: For running the development server
- **Jest Test**: For running tests with debugging
- **npm Scripts**: For build and development tasks

### IDE-Specific Features

#### IntelliSense and Auto-completion
- TypeScript language service provides intelligent code completion
- Import auto-completion for project modules and dependencies
- Parameter hints and function signatures
- Error detection and quick fixes

#### Debugging Support
- Breakpoint debugging in TypeScript source files
- Variable inspection and watch expressions
- Call stack navigation and stepping
- Integrated terminal for running commands

#### Testing Integration
- Jest test runner integration with IDE
- Test result visualization and reporting
- Coverage highlighting in source files
- Debugging individual test cases

## Verification

### Installation Verification

#### System Checks
Verify all prerequisites are properly installed:

```bash
# Check Node.js version (must be 24.x or higher)
node --version
# Expected: v24.x.x

# Check npm version (should be 11.x)
npm --version
# Expected: 11.x.x

# Check Git installation
git --version
# Expected: 2.20.0 or higher

# Optional: Check Docker installation
docker --version
# Expected: 20.10.0 or higher
```

#### Project Setup Verification
```bash
# Verify TypeScript compilation
npm run build
# Expected: Successful compilation without errors

# Verify test execution
npm test
# Expected: All tests pass with 100% coverage

# Verify code quality
npm run lint
# Expected: No ESLint errors

# Verify type checking
npm run type-check
# Expected: No TypeScript errors
```

### Application Verification

#### Server Startup Verification
```bash
# Start the development server
npm run dev
```

**Expected Console Output**:
```
TypeScript compilation successful
Server listening on port 3000
Application started successfully
Health check endpoint available at /health
```

**Verification Checklist**:
- ✅ Server starts without errors
- ✅ No TypeScript compilation errors
- ✅ Console shows successful startup messages
- ✅ Process remains running without crashes

#### Endpoint Testing

#### Hello Endpoint Verification
```bash
# Test with cURL
curl http://localhost:3000/hello

# Test with wget
wget -qO- http://localhost:3000/hello

# Test with Node.js
node -e "require('http').get('http://localhost:3000/hello', res => { res.on('data', d => console.log(d.toString())); })"
```

**Expected Response**:
- **Status Code**: 200 OK
- **Content-Type**: text/plain; charset=utf-8
- **Response Body**: `Hello world`

#### Health Endpoint Verification
```bash
# Test health endpoint
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "uptime": 12345,
  "memory": {
    "heapUsed": 18874368,
    "heapTotal": 20971520,
    "rss": 45678912
  },
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-11-01T10:30:00.000Z"
}
```

#### Browser Testing
Navigate to the following URLs in your web browser:

1. **Hello Endpoint**: http://localhost:3000/hello
   - Should display: `Hello world`

2. **Health Endpoint**: http://localhost:3000/health
   - Should display: JSON health status

### Performance Verification
Monitor application performance during startup and operation:

```bash
# Check memory usage
node -e "console.log(process.memoryUsage())"

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/hello

# Check process uptime
curl http://localhost:3000/health | grep uptime
```

**Performance Expectations**:
- **Memory Usage**: < 50MB for development
- **Response Time**: < 100ms for hello endpoint
- **Startup Time**: < 5 seconds

## Troubleshooting

### Common Issues and Solutions

#### 1. Port 3000 Already in Use

**Symptoms**:
- Error: `EADDRINUSE :::3000`
- Server fails to start
- Port binding error messages

**Causes**:
- Another application using port 3000
- Previous server instance still running
- System service using the port

**Solutions**:
```bash
# Solution 1: Change PORT in .env file
echo "PORT=3001" >> .env

# Solution 2: Kill existing process
lsof -ti:3000 | xargs kill

# Solution 3: Use different port temporarily
PORT=8080 npm run dev

# Solution 4: Check running processes
netstat -tulpn | grep 3000
```

#### 2. Node.js Version Mismatch

**Symptoms**:
- npm install fails with version errors
- TypeScript compilation errors
- Runtime errors with modern JavaScript features

**Causes**:
- Node.js version older than 24.x
- Multiple Node.js versions installed
- npm version incompatibility

**Solutions**:
```bash
# Solution 1: Install Node.js 24.x LTS
# Download from nodejs.org

# Solution 2: Use nvm to manage versions
nvm install 24
nvm use 24
nvm alias default 24

# Solution 3: Verify version
node --version  # Should show v24.x.x

# Solution 4: Clear npm cache
npm cache clean --force
```

#### 3. TypeScript Compilation Errors

**Symptoms**:
- Build fails with type errors
- Development server won't start
- Red squiggly lines in IDE

**Causes**:
- Type mismatches in code
- Missing type definitions
- Incorrect TypeScript configuration

**Solutions**:
```bash
# Solution 1: Fix type errors
npm run type-check  # View detailed errors

# Solution 2: Install missing types
npm install @types/package-name

# Solution 3: Check TypeScript configuration
cat tsconfig.json

# Solution 4: Rebuild project
npm run clean && npm run build
```

#### 4. npm Install Fails

**Symptoms**:
- Dependency installation errors
- Network timeout errors
- Permission denied errors

**Causes**:
- Network connectivity issues
- npm cache corruption
- Permission problems
- Registry configuration issues

**Solutions**:
```bash
# Solution 1: Clear npm cache
npm cache clean --force

# Solution 2: Clean install
rm -rf node_modules package-lock.json
npm install

# Solution 3: Check npm registry
npm config get registry

# Solution 4: Use clean install
npm ci

# Solution 5: Check network and proxy
npm config list
```

#### 5. Tests Failing

**Symptoms**:
- Jest test failures
- Coverage requirements not met
- Test timeout errors

**Causes**:
- Code changes without test updates
- Missing test coverage
- Jest configuration issues
- Async test handling problems

**Solutions**:
```bash
# Solution 1: Run tests in watch mode
npm run test:watch

# Solution 2: Update tests for code changes
# Edit test files to match implementation

# Solution 3: Check Jest configuration
cat jest.config.ts

# Solution 4: View detailed test output
npm test -- --verbose

# Solution 5: Check coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

#### 6. Docker Issues (If Using Docker)

**Symptoms**:
- Container build failures
- Port conflicts
- Volume mount issues

**Causes**:
- Docker not running
- Port 3000 occupied
- File permission issues

**Solutions**:
```bash
# Solution 1: Verify Docker is running
docker --version
docker ps

# Solution 2: Use different port
docker-compose -f docker-compose.yml up app-dev -p 3001:3000

# Solution 3: Rebuild containers
docker-compose build --no-cache

# Solution 4: Clean Docker resources
docker system prune -a
```

### Debugging Techniques

#### Development Debugging
```bash
# Enable debug logging
echo "LOG_LEVEL=debug" >> .env

# Start with Node.js debugger
npm run dev:debug

# Use VS Code debugger
# Set breakpoints and press F5

# Check application logs
tail -f logs/app.log
```

#### Production Debugging
```bash
# Check server logs
npm start 2>&1 | tee logs/production.log

# Test API endpoints
curl -v http://localhost:3000/hello

# Monitor memory usage
node -e "setInterval(() => console.log(process.memoryUsage()), 5000)"

# Use health check endpoint
curl http://localhost:3000/health
```

#### Network Debugging
```bash
# Test connectivity
curl -I http://localhost:3000/hello

# Check DNS resolution
nslookup localhost

# Monitor network traffic
netstat -an | grep 3000

# Test from different network
curl -I http://127.0.0.1:3000/hello
```

### Getting Help

#### Documentation Resources
- ✅ Check project [README.md](../src/backend/README.md) for detailed documentation
- ✅ Review [GitHub issues](https://github.com/nodejs-tutorial/backend/issues) for similar problems
- ✅ Consult [Node.js documentation](https://nodejs.org/docs/latest-v24.x/) for runtime issues
- ✅ Check [Express.js documentation](https://expressjs.com/en/5x/api.html) for framework questions
- ✅ Use [TypeScript handbook](https://www.typescriptlang.org/docs/) for type-related issues

#### Community Support
- GitHub Discussions for questions and community help
- Stack Overflow with tags: nodejs, expressjs, typescript
- Node.js community forums and Discord servers
- Educational platform support (if applicable)

#### Error Reporting
When reporting issues, include:
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Operating system and version
- Complete error messages and stack traces
- Steps to reproduce the issue
- Environment configuration (without sensitive data)

## Next Steps

### Development Workflow

Now that your setup is complete, follow these steps to start development:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Begin coding with hot reloading and automatic TypeScript compilation.

2. **Make Code Changes**:
   Edit files in the `src/` directory and observe automatic server restart.

3. **Run Tests Frequently**:
   ```bash
   npm run test:watch
   ```
   Use continuous testing for immediate feedback during development.

4. **Maintain Code Quality**:
   ```bash
   npm run lint:fix && npm run format
   ```
   Keep code clean and consistent with automated tools.

5. **Build for Production**:
   ```bash
   npm run build
   ```
   Prepare your application for deployment.

### Learning Resources

#### Project Documentation
- **Location**: `docs/` directory
- **Content**: Comprehensive project documentation including API reference and architecture
- **Usage**: Start with API.md for endpoint documentation and ARCHITECTURE.md for system design

#### Framework Documentation
- **Express.js 5.1.0**: https://expressjs.com/en/5x/api.html
  - Latest features and security enhancements
  - Migration guide from Express 4.x
  - Advanced middleware patterns

- **Node.js 24.x**: https://nodejs.org/docs/latest-v24.x/
  - Node.js runtime documentation
  - V8 engine 13.6 features
  - Performance and security improvements

- **TypeScript**: https://www.typescriptlang.org/docs/
  - TypeScript handbook and reference
  - Advanced type system features
  - Integration patterns with Node.js

#### Testing and Quality
- **Jest Testing Framework**: https://jestjs.io/docs/getting-started
  - Testing best practices
  - Mocking and testing utilities
  - Coverage reporting and analysis

### Learning Progression Path

#### 1. Explore Hello Endpoint Implementation
- **File**: `src/handlers/hello.handler.ts`
- **Learning**: Route handler patterns and response generation
- **Practice**: Create additional simple endpoints

#### 2. Review Middleware Stack
- **Directory**: `src/middleware/`
- **Learning**: Express.js middleware patterns and security implementation
- **Practice**: Create custom middleware functions

#### 3. Understand Routing Configuration
- **Directory**: `src/routes/`
- **Learning**: Route organization and RESTful API design
- **Practice**: Implement new route groups

#### 4. Examine Testing Patterns
- **Directory**: `tests/`
- **Learning**: Unit testing and integration testing strategies
- **Practice**: Write tests for new features

#### 5. Study Security Middleware
- **Files**: Security middleware configuration
- **Learning**: Web security best practices and header management
- **Practice**: Configure security for different environments

#### 6. Learn Production Deployment
- **Directory**: `infrastructure/docker/`
- **Learning**: Containerization and deployment patterns
- **Practice**: Deploy to cloud platforms

#### 7. Explore Advanced Express.js Features
- **Learning**: Advanced routing, custom middleware, error handling
- **Practice**: Build more complex API endpoints

### Extension Opportunities

#### Feature Extensions
- **Add New Endpoints**: Implement additional API endpoints with different HTTP methods
- **Database Integration**: Connect to MongoDB, PostgreSQL, or other databases
- **Authentication**: Implement JWT-based authentication and authorization
- **Real-time Features**: Add WebSocket support for real-time communication
- **File Upload**: Implement file upload and processing capabilities

#### Architecture Extensions
- **Microservices**: Split application into microservices architecture
- **API Gateway**: Implement API gateway patterns
- **Caching**: Add Redis or in-memory caching layers
- **Message Queues**: Integrate with RabbitMQ or Apache Kafka
- **Monitoring**: Add comprehensive logging and monitoring

#### Deployment Extensions
- **Cloud Platforms**: Deploy to AWS, Google Cloud, or Azure
- **Container Orchestration**: Use Kubernetes for container management
- **CI/CD Pipelines**: Implement automated deployment pipelines
- **Load Balancing**: Configure load balancers and high availability
- **Performance Monitoring**: Add APM tools and performance analytics

### Educational Value Summary

This setup guide demonstrates:

#### Node.js Development Environment Setup
- ✅ Node.js 24.x installation and configuration
- ✅ npm 11.x package management
- ✅ Modern development tooling integration

#### Express.js Framework Implementation
- ✅ Express.js 5.1.0 setup with enhanced security
- ✅ Middleware configuration and security hardening
- ✅ TypeScript integration for type-safe development

#### Professional Development Practices
- ✅ Comprehensive testing with Jest and 100% coverage
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Development workflow optimization
- ✅ Environment configuration management

#### Modern Deployment Patterns
- ✅ Docker containerization setup
- ✅ Development and production environment configuration
- ✅ Health monitoring and observability implementation

#### Production-Ready Configuration
- ✅ Security middleware and best practices
- ✅ Error handling and logging strategies
- ✅ Performance optimization and monitoring
- ✅ Deployment and operational considerations

### Target Audience Alignment

This setup guide serves:

#### Primary Audience
**Developers new to Node.js and Express.js** seeking comprehensive setup guidance with:
- Step-by-step instructions for complete environment setup
- Clear explanations of each tool and configuration option
- Troubleshooting guidance for common setup issues

#### Secondary Audience
**Educators teaching web development** who need:
- Comprehensive teaching resources with detailed explanations
- Structured learning progression from setup to advanced topics
- Real-world best practices and professional development patterns

#### Tertiary Audience
**Experienced developers** setting up tutorial environment or reference implementation with:
- Quick start instructions for rapid setup
- Complete configuration reference for customization
- Advanced topics and extension opportunities

### Completion Checklist

Before proceeding to development, ensure you have completed:

- ✅ **Prerequisites**: Node.js 24.x, npm 11.x, Git installed
- ✅ **Project Setup**: Repository cloned, dependencies installed
- ✅ **Environment Configuration**: .env file created and customized
- ✅ **Build Verification**: TypeScript compilation successful
- ✅ **Test Validation**: All tests pass with 100% coverage
- ✅ **Server Startup**: Development server running on port 3000
- ✅ **Endpoint Testing**: Hello endpoint returns "Hello world"
- ✅ **Health Check**: Health endpoint returns status information
- ✅ **IDE Configuration**: Development environment optimized
- ✅ **Documentation Review**: Project structure and workflow understood

**Congratulations!** 🎉 Your Node.js tutorial application is now ready for development. You have successfully set up a modern, production-ready development environment with Express.js 5.1.0, TypeScript, comprehensive testing, and professional development tooling.

**Happy Learning and Coding!** 🚀