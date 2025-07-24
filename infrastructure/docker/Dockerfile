# Multi-stage Docker container configuration for Node.js 24.x tutorial application
# Implements production-ready containerization with security hardening and build optimization
# Demonstrates modern containerization patterns for Express.js 5.1.0 applications

# Build arguments for configuration
ARG NODE_ENV=production
ARG BUILD_VERSION=latest
ARG PORT=3000

# =============================================================================
# BASE STAGE: Common dependencies and security hardening
# =============================================================================
FROM node:24-alpine AS base

# Metadata labels for container identification and documentation
LABEL maintainer="Node.js Tutorial Team" \
      version="${BUILD_VERSION}" \
      description="Node.js tutorial application with Express.js 5.1.0 and TypeScript" \
      nodejs.version="24" \
      express.version="5.1.0" \
      typescript.enabled="true" \
      org.opencontainers.image.title="Node.js Tutorial Application" \
      org.opencontainers.image.description="Educational Node.js application demonstrating Express.js 5.1.0 with TypeScript compilation" \
      org.opencontainers.image.vendor="Node.js Tutorial Team" \
      org.opencontainers.image.licenses="MIT"

# Install system packages for security and functionality
# dumb-init for proper signal handling and zombie process reaping
# ca-certificates for HTTPS certificate validation
# tzdata for timezone support in production environments
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    tzdata \
    && apk upgrade --no-cache

# Create non-root user for security (Principle of Least Privilege)
# Using consistent UID/GID 1000 for predictable file permissions
RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node

# Create application directory with proper ownership
RUN mkdir -p /usr/src/app \
    && chown -R node:node /usr/src/app

# Set working directory
WORKDIR /usr/src/app

# Environment variables for production optimization
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_PROGRESS=false \
    NPM_CONFIG_AUDIT=false \
    PORT=3000 \
    HOST=0.0.0.0

# Switch to non-root user for security
USER node

# =============================================================================
# BUILDER STAGE: TypeScript compilation and dependency installation
# =============================================================================
FROM base AS builder

# Temporarily switch to root for build dependencies installation
USER root

# Install build dependencies for native module compilation
# python3, make, g++ for native addons and C++ modules
# git for dependency resolution from repositories
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    git

# Switch back to node user for application operations
USER node

# Copy package files for dependency caching layer optimization
# Copying package files separately allows Docker layer caching for dependencies
COPY --chown=node:node package*.json ./

# Install all dependencies (including development dependencies for compilation)
# Using npm ci for deterministic, reproducible builds
# Installing development dependencies needed for TypeScript compilation
RUN npm ci --include=dev \
    && npm cache clean --force

# Copy TypeScript configuration for compilation
COPY --chown=node:node tsconfig.json ./

# Copy source code for compilation
# Copying source after dependency installation for optimal layer caching
COPY --chown=node:node src/ ./src/

# Compile TypeScript to JavaScript
# Build script from package.json: "build": "rimraf dist && tsc"
RUN npm run build

# Validate build artifacts
# Ensure compilation succeeded and required files exist
RUN test -d dist && test -f dist/index.js \
    && echo "Build validation successful"

# Install production dependencies only
# Clean install for production deployment
RUN npm ci --only=production --omit=dev \
    && npm cache clean --force

# Remove build dependencies to reduce image size
USER root
RUN apk del .build-deps
USER node

# =============================================================================
# PRODUCTION STAGE: Minimal runtime environment
# =============================================================================
FROM base AS production

# Copy compiled application from builder stage
# Using --from=builder to copy artifacts from build stage
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Copy production dependencies from builder stage
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules

# Copy package.json for metadata and scripts
COPY --chown=node:node package*.json ./

# Create volume mount point for persistent log storage
RUN mkdir -p /usr/src/app/logs \
    && chown -R node:node /usr/src/app/logs

# Expose application port
EXPOSE 3000

# Configure volume for log persistence
VOLUME ["/usr/src/app/logs"]

# Health check for container orchestration and monitoring
# Checks /health endpoint availability every 30 seconds
# 10 second timeout with 40 second startup grace period
# 3 consecutive failures before marking unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e " \
        require('http').get('http://localhost:3000/health', (res) => { \
            process.exit(res.statusCode === 200 ? 0 : 1); \
        }).on('error', () => process.exit(1));"

# Use dumb-init as entrypoint for proper signal handling
# Ensures proper signal forwarding and zombie process reaping
ENTRYPOINT ["dumb-init", "--"]

# Start the application using the compiled JavaScript
# Uses start script from package.json: "start": "node dist/index.js"
CMD ["node", "dist/index.js"]

# =============================================================================
# DEVELOPMENT STAGE: Development environment with debugging support
# =============================================================================
FROM builder AS development

# Override environment for development
ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=info

# Install additional development tools
RUN npm install -g nodemon

# Copy all source files including development configurations
COPY --chown=node:node . .

# Expose debug port for Node.js debugging
EXPOSE 3000 9229

# Development health check with longer timeouts
HEALTHCHECK --interval=60s --timeout=15s --start-period=60s --retries=3 \
    CMD node -e " \
        require('http').get('http://localhost:3000/health', (res) => { \
            process.exit(res.statusCode === 200 ? 0 : 1); \
        }).on('error', () => process.exit(1));"

# Use development start command with hot reloading
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# =============================================================================
# BUILD CONTEXT OPTIMIZATION AND SECURITY NOTES
# =============================================================================
# 
# This Dockerfile implements the following optimizations and security measures:
#
# 1. SECURITY HARDENING:
#    - Non-root user execution (UID/GID 1000)
#    - Minimal Alpine Linux base for reduced attack surface
#    - dumb-init for proper signal handling
#    - Security-focused package management
#    - No sensitive data exposure through layer optimization
#
# 2. BUILD OPTIMIZATION:
#    - Multi-stage builds for minimal production image
#    - Docker layer caching through strategic COPY ordering
#    - Separate dependency and source code layers
#    - Build artifact validation
#    - Production-only dependencies in final stage
#
# 3. EDUCATIONAL VALUE:
#    - Demonstrates modern containerization patterns
#    - Shows TypeScript compilation in containers
#    - Implements health checks for monitoring
#    - Provides development stage for debugging
#    - Documents best practices through comments
#
# 4. OPERATIONAL READINESS:
#    - Health check endpoint integration
#    - Volume mounts for log persistence
#    - Configurable environment variables
#    - Proper signal handling for graceful shutdowns
#    - Support for container orchestration platforms
#
# 5. PERFORMANCE CONSIDERATIONS:
#    - Minimal image size through multi-stage builds
#    - Optimized layer caching for faster builds
#    - npm cache cleanup for reduced storage
#    - Alpine Linux for minimal resource footprint
#
# Usage Examples:
# Build production image: docker build --target production -t tutorial-app:latest .
# Build development image: docker build --target development -t tutorial-app:dev .
# Run with custom port: docker run -e PORT=8080 -p 8080:8080 tutorial-app:latest
# Run with log volume: docker run -v $(pwd)/logs:/usr/src/app/logs tutorial-app:latest