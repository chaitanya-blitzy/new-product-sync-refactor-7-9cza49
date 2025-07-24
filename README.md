# Node.js Tutorial Application

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)
[![Express.js Version](https://img.shields.io/badge/express-5.1.0-blue)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.0-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/nodejs-tutorial/backend)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](coverage/lcov-report/index.html)
[![Security](https://img.shields.io/badge/security-helmet.js-green)](https://helmetjs.github.io/)

A comprehensive educational project demonstrating modern Node.js development with Express.js 5.1.0 and TypeScript

---

## Overview

The **Node.js Tutorial Application** is a comprehensive educational resource designed to demonstrate fundamental web development concepts using modern Node.js technologies. Built with **Express.js 5.1.0** and **TypeScript 5.3.0**, this project showcases production-ready patterns, security best practices, and professional development workflows while maintaining educational clarity for developers learning Node.js fundamentals.

### Educational Objectives

This tutorial application is designed to provide hands-on experience with:

- **Fundamental Node.js and Express.js concepts** through practical implementation
- **Modern JavaScript development** with TypeScript integration and type safety
- **Production-ready security practices** with Helmet.js and middleware integration
- **Comprehensive testing examples** with Jest and 100% coverage requirements
- **Modern development workflows** with automated quality assurance and CI/CD

### Target Audience

- **Primary**: Developers learning Node.js and Express.js through hands-on tutorial implementation
- **Secondary**: Educators teaching modern web development and JavaScript technologies
- **Tertiary**: Contributors and maintainers working on the tutorial project

### Key Benefits

- 🎯 **Hands-on learning** with real, working code examples
- ⚡ **Modern technology stack** with latest framework versions
- 🛡️ **Production-ready patterns** and best practices
- 📚 **Comprehensive documentation** and educational resources
- 🚀 **Extensible foundation** for building larger applications

---

## Features

### Core Features

- 🚀 **Modern Node.js 24.x** with V8 engine 13.6 and npm 11 support
- ⚡ **Express.js 5.1.0** with enhanced security features and automatic promise rejection handling
- 🔷 **TypeScript** development environment with strict type checking and ES2024 features
- 🛡️ **Security-first** approach with Helmet.js, CORS, and rate limiting middleware
- 🧪 **Comprehensive testing** with Jest, 100% coverage requirements, and automated quality assurance
- 📚 **Educational focus** with detailed documentation and learning resources
- 🐳 **Docker support** for consistent development and deployment environments
- 🔄 **CI/CD pipeline** with GitHub Actions for automated testing and deployment
- 📊 **Monitoring** and observability with health checks and structured logging
- 🎯 **Production-ready** patterns and best practices for scalable applications

### API Features

- **Hello World Endpoint** (`GET /hello`) - Demonstrates basic HTTP response patterns
- **Health Check Endpoint** (`GET /health`) - Provides server status and monitoring capabilities
- **Error Handling** - Comprehensive error handling with standardized response formats
- **Request Correlation** - Request tracking and correlation for debugging and monitoring
- **Security Headers** - Automatic security header injection for enhanced protection

### Development Features

- **Hot Reloading** with nodemon for efficient development workflow
- **Code Quality** enforcement with ESLint and Prettier integration
- **Type Safety** with comprehensive TypeScript configuration and strict checking
- **Automated Testing** with Jest and Supertest for reliable code validation
- **Development Scripts** for streamlined development, testing, and deployment workflows

---

## Technology Stack

### Runtime Environment

#### Node.js 24.x LTS
- **V8 JavaScript engine 13.6** with modern ECMAScript features
- **npm 11.x** with enhanced security and performance improvements
- **Built-in test runner compatibility** for educational purposes
- **Enhanced async context tracking** and resource management

#### TypeScript 5.3.0
- **ES2024 compilation target** with modern JavaScript features
- **Strict type checking** for enhanced code quality and safety
- **Comprehensive type definitions** for Node.js and Express.js
- **Development tooling integration** with ts-node and incremental compilation

### Web Framework

#### Express.js 5.1.0
- **Enhanced security** with ReDoS attack protection and CVE-2024-45590 mitigation
- **Automatic promise rejection handling** in middleware for improved error management
- **Updated path-to-regexp@8.x** for enhanced route security and performance
- **Improved middleware ecosystem** with better TypeScript integration

### Security Middleware

- **Helmet.js 8.0.0** - Comprehensive HTTP security headers and protection mechanisms
- **CORS 2.8.5** - Cross-Origin Resource Sharing configuration and security
- **express-rate-limit 7.1.5** - Request throttling and denial-of-service protection

### Development Tools

- **Jest 29.7.0** - Testing framework with TypeScript support and coverage reporting
- **ESLint 9.12.0** - Code quality enforcement and linting with TypeScript integration
- **Prettier 3.3.3** - Code formatting and style consistency
- **nodemon 3.1.7** - Development server with automatic restart on file changes

---

## Quick Start

Get the Node.js tutorial application running in under 5 minutes:

### Prerequisites

- **Node.js 24.x or higher** - [Download from nodejs.org](https://nodejs.org/)
- **npm 11.x** (included with Node.js 24.x)
- **Git** for repository cloning

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/nodejs-tutorial/backend.git nodejs-tutorial-app
   cd nodejs-tutorial-app
   ```

2. **Navigate to the backend directory**
   ```bash
   cd src/backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment configuration**
   ```bash
   cp .env.example .env
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Test the application**
   ```bash
   curl http://localhost:3000/hello
   ```
   
   **Expected Output**: `Hello world`

### Verification

- ✅ Server should start without errors and display startup messages
- ✅ Hello endpoint should return 'Hello world' response
- ✅ Health endpoint should return server status information

---

## Installation

### System Requirements

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| **Operating System** | Windows 10+, macOS 10.15+, or Linux | Cross-platform compatibility |
| **Memory** | Minimum 4GB RAM, Recommended 8GB+ | Sufficient for development and testing |
| **Storage** | Minimum 2GB free disk space | For dependencies and development tools |
| **Network** | Internet connection | Required for package downloads |

### Detailed Setup

For comprehensive installation instructions including troubleshooting, environment configuration, and IDE setup, see our detailed [Setup Guide](docs/SETUP.md).

#### Essential Installation Commands

```bash
# Verify Node.js installation
node --version  # Should show v24.x.x
npm --version   # Should show 11.x.x

# Clone and setup project
git clone https://github.com/nodejs-tutorial/backend.git
cd backend/src/backend
npm install
cp .env.example .env

# Build and test
npm run build
npm test
npm run dev
```

---

## Usage

### Starting the Application

```bash
# Development mode with hot reloading
npm run dev

# Production build and start
npm run build
npm start

# Development with debugging
npm run dev:debug
```

### Testing the Endpoints

#### Hello World Endpoint
```bash
# Basic request
curl http://localhost:3000/hello

# With custom headers
curl -H "X-Request-ID: test-001" http://localhost:3000/hello
```

**Expected Response**: `Hello world`

#### Health Check Endpoint
```bash
# Health status
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2024-11-01T10:30:00.000Z",
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 18874368
  },
  "version": "1.0.0",
  "environment": "development"
}
```

---

## API Documentation

The tutorial application provides a simple but comprehensive HTTP API demonstrating modern Node.js development patterns.

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Configure according to deployment environment

### Available Endpoints

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| `GET` | `/hello` | Returns hello world message | `text/plain` |
| `GET` | `/health` | Server health and status | `application/json` |

### Authentication
- **None required** - This is an educational application with public endpoints

### Security Headers
All responses include comprehensive security headers via Helmet.js:
- Content Security Policy (CSP)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)

For complete API documentation with examples, request/response formats, and integration patterns, see our detailed [API Documentation](docs/API.md).

---

## Development

### npm Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run dev` | Start development server with hot reloading | Primary development command |
| `npm run build` | Compile TypeScript to JavaScript | Production build |
| `npm start` | Start production server | Requires build first |
| `npm test` | Run complete test suite with coverage | Quality assurance |
| `npm run lint` | Check code quality with ESLint | Code quality |
| `npm run format` | Format code with Prettier | Code style |

### Development Workflow

1. **Start Development Server**: `npm run dev`
2. **Make Code Changes**: Edit TypeScript files in `src/` directory
3. **Run Tests**: `npm run test:watch` for continuous testing
4. **Check Code Quality**: `npm run lint:fix && npm run format`
5. **Build for Production**: `npm run build`

### Project Structure

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
└── .env.example        # Environment variables template
```

---

## Testing

### Testing Framework

The application uses **Jest 29.7.0** with comprehensive TypeScript integration:

- **100% Code Coverage Requirement** - Educational completeness
- **Unit and Integration Tests** - Comprehensive testing strategy
- **Supertest Integration** - HTTP endpoint testing
- **TypeScript Support** - Type-safe testing environment

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Coverage Requirements

| Coverage Type | Target | Purpose |
|---------------|--------|---------|
| **Line Coverage** | 100% | Every line tested |
| **Function Coverage** | 100% | Every function tested |
| **Branch Coverage** | 100% | Every code path tested |
| **Statement Coverage** | 100% | Every statement tested |

### Test Structure

- **Unit Tests**: `tests/unit/` - Individual component testing
- **Integration Tests**: `tests/integration/` - End-to-end request flows
- **Test Utilities**: Shared testing utilities and helpers

---

## Deployment

### Development Deployment

```bash
# Local development
npm run dev

# Local production simulation
npm run build && npm start
```

### Docker Deployment

```bash
# Build and run with Docker
cd infrastructure/docker
docker-compose up app

# Development with hot reloading
docker-compose up app-dev
```

### Production Considerations

- **Environment Variables**: Configure production-specific settings
- **Process Management**: Use PM2 or similar for process management
- **Reverse Proxy**: Nginx or Apache for load balancing
- **SSL/TLS**: Configure HTTPS for production
- **Monitoring**: Set up application performance monitoring

For detailed deployment instructions, see [Infrastructure Documentation](infrastructure/README.md).

---

## Security

### Security Features

The tutorial application implements modern web security practices:

#### Express.js 5.1.0 Security Enhancements
- **ReDoS Protection**: Updated path-to-regexp@8.x prevents Regular Expression Denial of Service
- **CVE-2024-45590 Mitigation**: Enhanced input validation and processing
- **Automatic Promise Rejection Handling**: Prevents information disclosure

#### Helmet.js Security Headers
- **Content Security Policy (CSP)**: Controls allowed content sources
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS connections

#### Additional Security Measures
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Request Correlation**: Security incident tracking and investigation

### Security Best Practices

- ✅ Keep dependencies updated with `npm audit`
- ✅ Use environment variables for sensitive configuration
- ✅ Implement proper input validation
- ✅ Monitor security logs and alerts
- ✅ Regular security audits and reviews

---

## Contributing

We welcome contributions to the Node.js Tutorial Application! This project serves as an educational resource, and community contributions help improve the learning experience.

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `npm install`
4. **Create a feature branch**: `git checkout -b feature/amazing-feature`
5. **Make your changes** with appropriate tests
6. **Run quality checks**: `npm run validate`
7. **Commit your changes**: `git commit -m 'Add amazing feature'`
8. **Push to your branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request** with detailed description

### Contribution Guidelines

- **Code Quality**: Maintain 100% test coverage and ESLint compliance
- **Documentation**: Update relevant documentation for any changes
- **Educational Value**: Ensure contributions enhance learning objectives
- **Backward Compatibility**: Maintain compatibility within major versions
- **Security**: Follow security best practices and report vulnerabilities

### Areas for Contribution

- **Additional Tutorial Examples**: Extend with database integration, authentication
- **Documentation Improvements**: Enhance clarity and completeness
- **Testing Enhancements**: Additional test scenarios and edge cases
- **Performance Optimizations**: Improve application performance
- **Security Enhancements**: Additional security measures and audits

---

## Educational Resources

### Learning Objectives

This tutorial application demonstrates:

#### Node.js Fundamentals
- HTTP server creation and management
- Asynchronous programming patterns
- Module system and dependency management
- Environment configuration and deployment

#### Express.js Framework
- Middleware architecture and patterns
- Routing and request handling
- Error handling and logging
- Security middleware integration

#### Modern Development Practices
- TypeScript integration and type safety
- Test-driven development with Jest
- Code quality tools (ESLint, Prettier)
- CI/CD pipeline setup and automation

#### Production-Ready Patterns
- Security header configuration
- Health check implementation
- Request correlation and monitoring
- Graceful shutdown and error handling

### Recommended Learning Path

1. **Start with Setup**: Follow the [Setup Guide](docs/SETUP.md) for environment preparation
2. **Explore the Code**: Review `src/index.ts` for application architecture
3. **Understand Routing**: Examine `src/routes/` and `src/handlers/` directories
4. **Study Testing**: Review `tests/` directory for testing patterns
5. **Learn Security**: Investigate `src/middleware/` for security implementations
6. **Practice Extensions**: Implement additional endpoints and features

### External Resources

- [Node.js Official Documentation](https://nodejs.org/docs/latest-v24.x/)
- [Express.js 5.x Documentation](https://expressjs.com/en/5x/api.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Helmet.js Security Guide](https://helmetjs.github.io/)

---

## Changelog

### Version 1.0.0 (2024-12-19) - Initial Release

**Added**
- Express.js 5.1.0 integration with enhanced security features
- TypeScript 5.3.0 development environment with strict type checking
- Hello world endpoint implementation (`/hello`)
- Health check endpoint for monitoring (`/health`)
- Comprehensive security middleware (Helmet.js, CORS, Rate Limiting)
- Jest testing framework with 100% coverage requirements
- ESLint and Prettier for code quality and formatting
- Docker containerization support for development and deployment
- GitHub Actions CI/CD pipeline for automated testing
- Comprehensive documentation with setup guides and API reference
- Educational resources and learning objectives
- Production-ready error handling and monitoring

**Security**
- Helmet.js 8.0.0 for comprehensive HTTP security headers
- Express.js 5.1.0 ReDoS attack protection and CVE-2024-45590 mitigation
- CORS middleware for cross-origin request security
- Rate limiting for abuse prevention and DoS protection

**Technical Details**
- Node.js 24.x LTS runtime with V8 engine 13.6
- npm 11.x package management with enhanced security
- 100% test coverage with Jest and Supertest
- Docker support for consistent development environments
- Comprehensive TypeScript configuration with strict checking

### Upcoming Releases

**Version 1.1.0** - Database Integration Examples
- MongoDB integration with Mongoose ODM
- PostgreSQL examples with TypeORM
- Database testing patterns and strategies

**Version 1.2.0** - Authentication and Authorization
- JWT-based authentication implementation
- Role-based access control (RBAC) examples
- Security testing patterns

**Version 2.0.0** - Advanced Architecture Patterns
- Microservices architecture examples
- API Gateway implementation
- Advanced monitoring and observability

---

## Troubleshooting

### Common Issues

#### Port 3000 Already in Use
```bash
# Solution 1: Use different port
PORT=3001 npm run dev

# Solution 2: Kill existing process
lsof -ti:3000 | xargs kill

# Solution 3: Change .env configuration
echo "PORT=8080" >> .env
```

#### Node.js Version Mismatch
```bash
# Check current version
node --version

# Install Node.js 24.x
# Visit https://nodejs.org/ or use nvm:
nvm install 24
nvm use 24
nvm alias default 24
```

#### TypeScript Compilation Errors
```bash
# Check for type errors
npm run type-check

# Clean and rebuild
npm run clean && npm run build

# Install missing type definitions
npm install @types/package-name
```

#### npm Install Failures
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures
```bash
# Run tests in watch mode for debugging
npm run test:watch

# Check coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

### Getting Help

- **Documentation**: Check [Setup Guide](docs/SETUP.md) for detailed instructions
- **GitHub Issues**: [Report issues](https://github.com/nodejs-tutorial/backend/issues)
- **Community**: Join discussions and ask questions
- **Stack Overflow**: Use tags `nodejs`, `expressjs`, `typescript`

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### License Summary

- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify and customize the code
- ✅ **Distribution** - Share and distribute the code
- ✅ **Private use** - Use for personal and private projects
- ❗ **License and copyright notice** - Include original license

### Third-Party Licenses

This project includes open-source software components with their respective licenses:
- Express.js (MIT License)
- TypeScript (Apache License 2.0)
- Jest (MIT License)
- Helmet.js (MIT License)

---

## Acknowledgments

### Core Contributors
- **Node.js Tutorial Team** - Project development and maintenance
- **Node.js Community** - Framework development and ecosystem support
- **Express.js Team** - Web framework development and security enhancements

### Technology Acknowledgments
- **Node.js Foundation** - JavaScript runtime development
- **Express.js Team** - Minimalist web framework for Node.js
- **Microsoft** - TypeScript language development
- **Meta** - Jest testing framework development
- **Security Community** - Helmet.js security middleware

### Educational Inspiration
This project draws inspiration from the Node.js and Express.js communities' commitment to education, open-source development, and sharing knowledge to help developers learn modern web development practices.

### Special Thanks
- **Educational Technology Community** - For promoting hands-on learning
- **Open Source Contributors** - For building the ecosystem we depend on
- **Students and Educators** - For providing feedback and improving the learning experience

---

**Thank you for using the Node.js Tutorial Application!** 🎉

Start your learning journey today with modern Node.js development. Happy coding! 🚀

---

*For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/nodejs-tutorial/backend) or reach out to the maintainers.*