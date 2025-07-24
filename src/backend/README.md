# Node.js Tutorial Application Backend

Educational Node.js application built with Express.js 5.1.0, TypeScript, and modern development practices. Demonstrates fundamental HTTP server concepts, RESTful API design, security implementation, and production-ready architecture patterns for learning web development with Node.js.

## Overview

This is an educational Node.js application built with Express.js 5.1.0 and TypeScript, designed to demonstrate fundamental web server concepts and modern development practices. The application serves as a practical learning resource for developers exploring Node.js, Express.js, and production-ready web application architecture.

### Key Features

- **Express.js 5.1.0** with enhanced security features and automatic promise rejection handling
- **TypeScript Integration** with strict type checking and ES2024 compilation target  
- **Comprehensive Testing** infrastructure with Jest and 100% code coverage requirements
- **Security Middleware** including Helmet.js, CORS, and rate limiting
- **Structured Logging** with Winston and request correlation tracking
- **Docker Containerization** support for consistent development and deployment
- **Production-Ready Configuration** with environment-specific settings
- **Educational Documentation** and learning resources

### Learning Objectives

- Understanding Node.js 24.x runtime features and npm 11.x package management
- Learning Express.js 5.1.0 framework with modern middleware patterns
- Implementing TypeScript for type-safe server-side development
- Building comprehensive testing strategies with Jest and Supertest
- Applying security best practices with modern middleware
- Creating production-ready deployment configurations
- Understanding RESTful API design and HTTP protocol fundamentals

## Features

### Express.js 5.1.0 Enhanced Features
- **Enhanced Security**: Built-in ReDoS attack protection and improved security headers
- **Automatic Promise Handling**: Rejected promises automatically forwarded to error-handling middleware
- **Modern Middleware**: Updated middleware stack with Express.js 5.1.0 compatibility
- **Performance Improvements**: Optimized request processing and response handling

### TypeScript Integration
- **Strict Type Checking**: Full TypeScript implementation with comprehensive type definitions
- **Modern ES2024**: Latest JavaScript features with TypeScript compilation
- **Interface Definitions**: Type-safe request/response handling and configuration
- **Development Tooling**: Integrated ESLint, Prettier, and TypeScript compiler

### Security Implementation
- **Helmet.js Security Headers**: Comprehensive HTTP security headers for production deployment
- **CORS Protection**: Cross-Origin Resource Sharing configuration with environment-specific origins
- **Rate Limiting**: Request rate limiting for abuse prevention and DoS protection
- **Input Validation**: Built-in Express.js 5.1.0 validation and sanitization

### Testing Strategy
- **Jest Testing Framework**: Modern JavaScript testing with TypeScript support
- **100% Code Coverage**: Complete test coverage requirements for educational completeness
- **Integration Testing**: End-to-end API testing with Supertest
- **Automated Testing**: CI/CD integration with comprehensive test automation

## Prerequisites

### System Requirements

- **Node.js 24.x LTS** - Latest long-term support version with V8 engine 13.6
- **npm 11.x** - Package manager included with Node.js 24
- **Git** - Version control for repository management
- **Docker Desktop** (optional) - For containerization workflows

### Development Environment

Ensure you have the following installed on your system:

```bash
# Verify Node.js version (must be 24.x or higher)
node --version

# Verify npm version (should be 11.x)
npm --version

# Verify Git installation
git --version
```

## Quick Start

Get the application running locally with minimal configuration:

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd nodejs-tutorial-app/src/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Verify Installation
```bash
curl http://localhost:3000/hello
```

**Expected Output**: `Hello world`

The server should now be running at `http://localhost:3000` with hot reloading enabled.

## Installation

### Detailed Setup Instructions

#### Step 1: Verify Node.js Installation

Ensure Node.js 24.x LTS is installed on your system:

```bash
node --version
npm --version
```

**Expected Output**: Node.js 24.x.x and npm 11.x.x or higher

**Troubleshooting**:
- If Node.js is not installed, download from [https://nodejs.org/](https://nodejs.org/)
- Use Node Version Manager (nvm) for managing multiple Node.js versions
- Ensure you have Node.js 24.x for compatibility with this tutorial

#### Step 2: Clone Repository

Clone the project repository to your local machine:

```bash
git clone <repository-url>
cd nodejs-tutorial-app/src/backend
```

**Troubleshooting**:
- Ensure Git is installed on your system
- Check network connectivity if clone fails
- Verify repository URL and access permissions

#### Step 3: Install Dependencies

Install all project dependencies using npm:

```bash
npm ci
```

**Notes**:
- Use `npm ci` for production builds or `npm install` for development
- This installs Express.js 5.1.0, TypeScript 5.3.0, and all testing dependencies
- The process may take several minutes depending on your internet connection

**Troubleshooting**:
- Clear npm cache with `npm cache clean --force` if installation fails
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check npm configuration and registry settings
- Ensure you have sufficient disk space for dependencies

#### Step 4: Environment Configuration

Set up environment variables and configuration:

```bash
cp .env.example .env
```

**Configuration Options**:
- `PORT=3000` - Server port (default: 3000)
- `NODE_ENV=development` - Environment mode
- `LOG_LEVEL=info` - Logging verbosity
- `CORS_ORIGIN=*` - CORS allowed origins for development

**Notes**:
- Review `.env.example` for all available configuration options
- Modify `.env` file according to your development environment
- Never commit `.env` files to version control

#### Step 5: Build and Test

Compile TypeScript and run tests to verify installation:

```bash
npm run build
npm test
```

**Expected Output**: Successful TypeScript compilation and 100% test coverage

**Troubleshooting**:
- Check TypeScript configuration in `tsconfig.json` if build fails
- Ensure all dependencies are properly installed
- Verify Jest configuration in `jest.config.ts` for test issues

## Development

### Available npm Scripts

| Script | Description | Use Case |
|--------|-------------|----------|
| `npm run dev` | Start development server with hot reloading and TypeScript compilation | Primary development command for code changes and testing |
| `npm run build` | Compile TypeScript to JavaScript for production deployment | Prepare application for production deployment |
| `npm start` | Start production server using compiled JavaScript | Run application in production mode |
| `npm test` | Run complete test suite with coverage reporting | Verify code quality and functionality |
| `npm run test:watch` | Run tests in watch mode for continuous testing | Test-driven development workflow |
| `npm run lint` | Check code quality and style with ESLint | Maintain code quality and consistency |
| `npm run format` | Format code with Prettier for consistent style | Ensure consistent code formatting |

### Development Workflow

1. **Start Development Server**: Use `npm run dev` for development with automatic restart on file changes
2. **Run Tests**: Use `npm test` before committing changes to ensure code quality
3. **Code Quality**: Use `npm run lint:fix` to automatically fix linting issues
4. **Monitor Logs**: Application logs provide debugging and development insights
5. **Health Checks**: Use health check endpoint to verify server status during development

### Project Structure

```
src/backend/
├── src/
│   ├── config/           # Application configuration and constants
│   ├── handlers/         # Route handler implementations
│   ├── middleware/       # Express.js middleware stack
│   ├── routes/          # Route definitions and mounting
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and helpers
│   ├── app.ts           # Express.js application factory
│   ├── index.ts         # Application entry point
│   └── server.ts        # HTTP server setup
├── tests/               # Test suites and test utilities
├── dist/                # Compiled JavaScript output
├── coverage/            # Test coverage reports
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.ts       # Jest testing configuration
└── .env.example         # Environment variables template
```

## API Documentation

### Base URL
`http://localhost:3000`

### Available Endpoints

#### GET /hello
Returns a hello world message demonstrating basic Express.js endpoint implementation.

**Request**:
```bash
curl http://localhost:3000/hello
```

**Response**:
```
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 11

Hello world
```

**Response Codes**:
- `200 OK` - Successful hello world response
- `404 Not Found` - Endpoint not found
- `405 Method Not Allowed` - HTTP method not supported

**Usage Examples**:

**cURL**:
```bash
curl http://localhost:3000/hello
```

**JavaScript Fetch**:
```javascript
fetch('http://localhost:3000/hello')
  .then(response => response.text())
  .then(data => console.log(data));
```

**Node.js with axios**:
```javascript
const axios = require('axios');
const response = await axios.get('http://localhost:3000/hello');
console.log(response.data);
```

#### GET /health
Returns server health status and operational metrics.

**Request**:
```bash
curl http://localhost:3000/health
```

**Response**:
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

**Response Codes**:
- `200 OK` - Server health information
- `503 Service Unavailable` - Server health check failed

For complete API documentation with detailed specifications, see [API Documentation](../../docs/API.md).

## Testing

### Testing Framework

The application uses **Jest** with TypeScript support for comprehensive testing:

- **Framework**: Jest 29.x with ts-jest preset
- **Coverage Requirements**: 100% code coverage for educational completeness
- **Integration Testing**: Supertest for HTTP endpoint testing
- **TypeScript Support**: Full TypeScript integration with type checking

### Test Categories

#### Unit Tests
**Location**: `tests/unit/`
**Purpose**: Test individual functions and components in isolation
**Command**: `npm test -- --testPathPattern=unit`

#### Integration Tests  
**Location**: `tests/integration/`
**Purpose**: Test complete request/response cycles and component integration
**Command**: `npm test -- --testPathPattern=integration`

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with coverage reporting |
| `npm run test:watch` | Run tests in watch mode for development |
| `npm run test:coverage` | Generate detailed coverage report |
| `npm run test:ci` | Run tests in CI environment with coverage validation |

### Coverage Requirements

The application maintains 100% code coverage across all metrics:

- **Line Coverage**: 100% - Every line of code is tested
- **Function Coverage**: 100% - Every function is tested
- **Branch Coverage**: 100% - Every code path is tested
- **Statement Coverage**: 100% - Every statement is tested

### Writing Tests

**Example Unit Test**:
```typescript
import { describe, it, expect } from '@jest/globals';
import { createExpressApp } from '../src/app';

describe('Express Application', () => {
  it('should create application instance', () => {
    const app = createExpressApp();
    expect(app).toBeDefined();
  });
});
```

**Example Integration Test**:
```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('GET /hello', () => {
  it('should return Hello world with 200 status', async () => {
    const response = await request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /text/);
    
    expect(response.text).toBe('Hello world');
  });
});
```

## Security

### Security Middleware Implementation

The application implements comprehensive security through modern middleware:

#### Helmet.js Security Headers
**Version**: ^7.1.0
**Purpose**: Comprehensive HTTP security headers including CSP, HSTS, and XSS protection
**Configuration**: Automatically configured with production-ready defaults

#### CORS Protection
**Version**: ^2.8.5  
**Purpose**: Cross-Origin Resource Sharing protection with configurable origins
**Configuration**: Environment-specific origin restrictions

#### Express Rate Limit
**Version**: ^7.1.5
**Purpose**: Request rate limiting for abuse prevention and DoS protection
**Configuration**: Configurable rate limits based on environment

### Security Features

- **Express.js 5.1.0 Built-in ReDoS Protection**: Regular Expression Denial of Service attack prevention
- **Automatic Promise Rejection Handling**: Prevents information disclosure through unhandled promises
- **Environment-Specific Security Configuration**: Different security levels for development vs production
- **Input Validation and Sanitization**: Built-in Express.js request validation
- **Structured Error Responses**: Error responses without information disclosure

### Security Best Practices

#### Development
- CORS configured for development origins (`CORS_ORIGIN=*`)
- Detailed error messages for debugging
- Security headers with development-friendly settings

#### Production
- Strict CORS origin restrictions
- Minimal error information disclosure
- Enhanced security headers with HSTS
- Rate limiting with production thresholds

### Security Testing

Security features are validated through comprehensive testing:

```typescript
describe('Security Headers', () => {
  it('should include Helmet.js security headers', async () => {
    const response = await request(app).get('/hello');
    
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
```

## Deployment

### Production Build Process

#### 1. Production Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

#### 2. Production Server
```bash
npm start
```
Starts the production server using compiled JavaScript.

#### 3. Environment Configuration
Set production environment variables:
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

#### 4. Security Optimization
Production builds automatically apply:
- Security middleware optimized for production
- Error responses with minimal information disclosure
- Performance optimizations and caching headers

### Docker Deployment

#### Multi-stage Dockerfile
The application includes a production-ready Dockerfile:

```dockerfile
# Development stage
FROM node:24-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage  
FROM node:24-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=development /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Commands
```bash
# Build production image
docker build -t node-tutorial-backend .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production node-tutorial-backend

# Health check
docker run --health-cmd="curl -f http://localhost:3000/health || exit 1" \
           --health-interval=30s \
           --health-timeout=10s \
           --health-retries=3 \
           node-tutorial-backend
```

### Cloud Deployment

The application is compatible with major cloud platforms:

#### Platform Support
- **AWS**: EC2, ECS, Lambda, Elastic Beanstalk
- **Google Cloud**: Compute Engine, Cloud Run, App Engine
- **Azure**: Virtual Machines, Container Instances, App Service
- **Heroku**: Native buildpack support

#### Environment Configuration
```bash
# Required environment variables
NODE_ENV=production
PORT=${PORT:-3000}
LOG_LEVEL=info

# Security configuration
CORS_ORIGIN=https://yourdomain.com
HELMET_CSP=default-src 'self'

# Monitoring
HEALTH_CHECK_URL=/health
METRICS_ENABLED=true
```

#### Health Check Integration
All cloud platforms can use the `/health` endpoint:
```bash
curl http://your-app.com/health
```

Response indicates application readiness for load balancer integration.

## Architecture

### Application Architecture

The application follows a **modular monolithic architecture** with clear separation of concerns:

#### Core Components

**HTTP Server Component**
- **Purpose**: Network communication and request handling  
- **Technology**: Node.js 24.x HTTP module with Express.js 5.1.0
- **Features**: Async request processing, connection management

**Express Application Component**  
- **Purpose**: Middleware orchestration and route management
- **Technology**: Express.js 5.1.0 with enhanced error handling
- **Features**: Security middleware, logging, error handling

**Route Handler Component**
- **Purpose**: Endpoint logic and response generation
- **Technology**: TypeScript with Express.js integration
- **Features**: Type-safe request/response handling

**Response Generator Component**
- **Purpose**: HTTP response formatting and delivery
- **Technology**: Express.js response objects with automatic headers
- **Features**: Content-type management, status code handling

#### Middleware Stack

The application implements a comprehensive middleware stack:

1. **Security Middleware** (Helmet.js, CORS, rate limiting)
2. **Logging Middleware** (request correlation, performance tracking)  
3. **Application Routes** (endpoint handlers)
4. **Error Handling Middleware** (Express.js 5.1.0 features)

#### Design Patterns

- **Factory Pattern**: Express.js application creation and configuration
- **Middleware Composition**: Request processing pipeline
- **Centralized Configuration**: Environment-aware configuration management
- **Modular Architecture**: Clear separation of concerns between components

### Data Flow

```
HTTP Request → Security Middleware → Logging → Route Handler → Response Generation → HTTP Response
```

Each component processes the request and passes control to the next component in the chain, ensuring proper request lifecycle management.

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
**Symptoms**: Error: EADDRINUSE, Server fails to start
**Causes**: Another process using port 3000, Previous server instance still running
**Solutions**:
- Change PORT in `.env` file to an available port
- Kill existing processes: `lsof -ti:3000 | xargs kill`
- Use different port: `PORT=3001 npm run dev`

#### TypeScript Compilation Errors
**Symptoms**: Build fails with type errors, Development server won't start
**Causes**: Type mismatches, Missing type definitions, Invalid TypeScript configuration
**Solutions**:
- Check `tsconfig.json` for correct TypeScript configuration
- Install missing type definitions: `npm install @types/package-name`
- Fix type errors identified by TypeScript compiler
- Verify TypeScript version compatibility

#### npm Install Fails
**Symptoms**: Dependency installation errors, Missing packages
**Causes**: Network issues, npm cache corruption, Node.js version mismatch
**Solutions**:
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check Node.js version: ensure Node.js 24.x is installed
- Verify npm registry configuration

#### Tests Failing
**Symptoms**: Jest test failures, Coverage requirements not met
**Causes**: Code changes without test updates, Missing test coverage, Configuration issues
**Solutions**:
- Update tests to match code changes
- Add tests for uncovered code paths
- Check `jest.config.ts` for proper configuration
- Run tests in watch mode for continuous feedback

#### CORS Errors in Development
**Symptoms**: Cross-origin request blocked, Frontend can't connect to API
**Causes**: CORS not configured for frontend origin, Incorrect CORS configuration
**Solutions**:
- Update `CORS_ORIGIN` in `.env` to include frontend URL
- Use `CORS_ORIGIN=*` for development (not production)
- Verify CORS middleware configuration in security setup

### Debugging Techniques

#### Development Debugging
- Use `npm run dev:debug` to start server with Node.js debugger
- Enable verbose logging by setting `LOG_LEVEL=debug` in `.env`
- Use VS Code debugger with launch.json configuration
- Monitor request/response in browser developer tools

#### Production Debugging
- Check server logs for error messages and stack traces
- Use `curl` or Postman to test API endpoints independently
- Monitor memory usage with process.memoryUsage()
- Use Node.js `--inspect` for performance profiling

#### Performance Troubleshooting
- Check response times with built-in performance middleware
- Analyze TypeScript compilation performance
- Monitor test execution time and optimize slow tests
- Use health check endpoint for operational monitoring

### Log Analysis

#### Log Levels and Meaning
- **error**: Application errors requiring immediate attention
- **warn**: Non-critical issues that should be reviewed
- **info**: General application events and request tracking
- **http**: HTTP request/response logging for debugging
- **debug**: Detailed debugging information for development

#### Log Structure
```json
{
  "level": "info",
  "message": "HTTP GET /hello",
  "requestId": "req-12345678-90ab-cdef",
  "method": "GET",
  "path": "/hello",
  "statusCode": 200,
  "duration": 45,
  "timestamp": "2024-11-01T10:30:00.000Z"
}
```

## Contributing

### Development Setup

1. **Fork the Repository**: Create a personal fork of the project
2. **Clone Your Fork**: `git clone <your-fork-url>`
3. **Install Dependencies**: `npm install`
4. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
5. **Make Changes**: Implement your feature with tests
6. **Run Tests**: Ensure all tests pass with `npm test`
7. **Check Code Quality**: Run `npm run lint` and `npm run format`
8. **Commit Changes**: Use conventional commit messages
9. **Push Branch**: `git push origin feature/your-feature-name`
10. **Create Pull Request**: Submit PR with detailed description

### Coding Standards

#### TypeScript Guidelines
- Use strict TypeScript configuration with `strict: true`
- Define interfaces for all API request/response objects
- Use proper typing for Express.js middleware and handlers
- Implement comprehensive error handling with typed errors

#### Code Quality
- **ESLint**: Follow configured ESLint rules for code quality
- **Prettier**: Use Prettier for consistent code formatting
- **Testing**: Maintain 100% test coverage for all new code
- **Documentation**: Update documentation for new features

#### Commit Message Format
```
type(scope): description

feat(api): add new hello endpoint with correlation tracking
fix(security): resolve CORS configuration for development
docs(readme): update installation instructions
test(integration): add comprehensive endpoint testing
```

### Pull Request Process

#### Requirements
- All tests must pass with 100% coverage
- Code quality checks must pass (ESLint, Prettier)
- TypeScript compilation must succeed without errors
- Documentation must be updated for new features
- Security considerations must be addressed

#### Review Process
1. **Automated Checks**: CI/CD pipeline validates code quality
2. **Code Review**: Maintainer reviews implementation and design
3. **Testing**: Comprehensive testing in review environment
4. **Security Review**: Security implications assessment
5. **Documentation**: Documentation accuracy verification
6. **Merge**: Approved changes merged to main branch

### Community Guidelines

- **Be Respectful**: Maintain professional and inclusive communication
- **Educational Focus**: Ensure contributions align with educational objectives
- **Quality First**: Prioritize code quality and educational value
- **Documentation**: Provide clear documentation for all changes
- **Help Others**: Support fellow contributors and learners

## License

MIT License

Copyright (c) 2024 Node.js Tutorial Application

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Additional Resources

### Educational Resources
- [Node.js Official Documentation](https://nodejs.org/docs/)
- [Express.js 5.x Guide](https://expressjs.com/en/5x/api.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Related Documentation
- [Complete API Documentation](../../docs/API.md)
- [Architecture Documentation](../../docs/ARCHITECTURE.md)
- [Security Guidelines](../../docs/SECURITY.md)
- [Deployment Guide](../../docs/DEPLOYMENT.md)

### Community and Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community discussions and questions
- **Wiki**: Additional documentation and tutorials
- **Contributing**: Guidelines for contributing to the project

---

**Happy Learning!** 🚀

This tutorial application provides a solid foundation for understanding Node.js and Express.js development. Use it as a starting point for building more complex applications and exploring advanced Node.js concepts.