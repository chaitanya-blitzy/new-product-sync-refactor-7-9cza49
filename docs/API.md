# Node.js Tutorial API Documentation

## API Overview

### Introduction

Welcome to the comprehensive API documentation for the Node.js Tutorial Application. This documentation provides detailed specifications for a modern HTTP API built with **Express.js 5.1.0** and **Node.js 24.x**, designed to demonstrate fundamental web server concepts while showcasing current technology standards and best practices.

The tutorial API serves as an educational foundation for understanding HTTP server implementation, request/response handling, security middleware integration, and modern JavaScript development patterns. It features Express.js 5.1.0's enhanced capabilities including automatic promise rejection handling, improved security features, and enhanced middleware architecture.

### Base URL and Versioning

- **Base URL**: `http://localhost:3000`
- **API Version**: `1.0.0`
- **Express.js Version**: `5.1.0`
- **Node.js Runtime**: `24.x (LTS)`

### Technology Stack

The API leverages cutting-edge Node.js ecosystem technologies:

- **Runtime**: Node.js 24.x with V8 engine 13.6
- **Framework**: Express.js 5.1.0 with enhanced security features
- **Security**: Helmet.js middleware for comprehensive security headers
- **TypeScript**: Full type safety with custom interface definitions
- **Error Handling**: Express.js 5.1.0 automatic promise rejection handling

### Request/Response Format

#### Content Types
- **Request Content-Type**: `application/json; charset=utf-8`
- **Response Content-Type**: `application/json; charset=utf-8` or `text/plain; charset=utf-8`

#### Common Headers
All API responses include the following security and correlation headers:

```http
Content-Type: application/json; charset=utf-8
X-Request-ID: unique-request-identifier
X-Correlation-ID: correlation-identifier
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Authentication

The tutorial API operates as a **public educational endpoint** without authentication requirements. This design choice aligns with the educational objective of demonstrating fundamental HTTP server concepts without introducing authentication complexity.

For production applications, consider implementing:
- JWT-based authentication
- API key validation
- OAuth 2.0 integration
- Role-based access control (RBAC)

### Rate Limiting

The API implements basic rate limiting for educational purposes:
- **Rate Limit Window**: 15 minutes (900 seconds)
- **Maximum Requests**: 100 requests per window
- **Rate Limit Headers**: Included in responses when limits are approached

---

## Endpoints

### GET /hello - Hello World Endpoint

#### Overview
The `/hello` endpoint represents the foundational HTTP GET endpoint that returns a simple "Hello world" message. This endpoint demonstrates Express.js 5.1.0 routing capabilities, request correlation, and standardized response formatting.

#### Endpoint Details

**HTTP Method**: `GET`  
**URL Path**: `/hello`  
**Content-Type**: `text/plain; charset=utf-8`

#### Request Specification

**URL**: `http://localhost:3000/hello`

**Headers** (Optional):
```http
X-Request-ID: client-provided-request-id
X-Correlation-ID: client-provided-correlation-id
```

**Query Parameters**: None  
**Request Body**: None

#### Response Specification

**Success Response** (HTTP 200):

**Content-Type**: `text/plain; charset=utf-8`

**Response Body**:
```
Hello world
```

**Response Headers**:
```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 11
X-Request-ID: auto-generated-uuid
X-Correlation-ID: correlation-identifier
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Date: Thu, 01 Nov 2024 10:30:00 GMT
```

#### Status Codes

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| **200 OK** | Successful request | `Hello world` |
| **405 Method Not Allowed** | HTTP method not supported | `Method not allowed for this endpoint` |
| **500 Internal Server Error** | Server processing error | `Internal server error occurred` |

#### Usage Examples

**cURL Command**:
```bash
curl -X GET http://localhost:3000/hello \
  -H "X-Request-ID: tutorial-request-001" \
  -v
```

**JavaScript Fetch API**:
```javascript
async function callHelloEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/hello', {
      method: 'GET',
      headers: {
        'X-Request-ID': 'js-client-' + Date.now(),
        'X-Correlation-ID': 'tutorial-session-001'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Response:', text);
    console.log('Request ID:', response.headers.get('X-Request-ID'));
    
    return text;
  } catch (error) {
    console.error('Error calling hello endpoint:', error);
    throw error;
  }
}
```

**Node.js with axios**:
```javascript
const axios = require('axios');

async function helloRequest() {
  try {
    const response = await axios.get('http://localhost:3000/hello', {
      headers: {
        'X-Request-ID': 'nodejs-client-001',
        'X-Correlation-ID': 'tutorial-correlation-001'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Request ID:', response.headers['x-request-id']);
    
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    }
    throw error;
  }
}
```

### GET /health - Health Check Endpoint

#### Overview
The `/health` endpoint provides server health status and system information for monitoring and operational visibility. This endpoint returns comprehensive system metrics including uptime, memory usage, and application status.

#### Endpoint Details

**HTTP Method**: `GET`  
**URL Path**: `/health`  
**Content-Type**: `application/json; charset=utf-8`

#### Request Specification

**URL**: `http://localhost:3000/health`

**Headers**: None required  
**Query Parameters**: None  
**Request Body**: None

#### Response Specification

**Success Response** (HTTP 200):

**Content-Type**: `application/json; charset=utf-8`

**Response Body** (HealthCheckResponse interface):
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2024-11-01T10:30:00.000Z",
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 18874368,
    "external": 1683456,
    "arrayBuffers": 163840
  },
  "version": "1.0.0",
  "environment": "development"
}
```

#### Response Interface Definition

**TypeScript Interface** (HealthCheckResponse):
```typescript
interface HealthCheckResponse {
  readonly status: 'ok' | 'error';
  readonly uptime: number;              // Server uptime in seconds
  readonly timestamp: string;           // ISO timestamp
  readonly memory: NodeJS.MemoryUsage;  // Current memory usage
  readonly version: string;             // Application version
  readonly environment: string;         // Current environment
}
```

#### Status Codes

| Status Code | Description | Response Format |
|-------------|-------------|-----------------|
| **200 OK** | Server healthy and operational | HealthCheckResponse JSON |
| **500 Internal Server Error** | Server health check failed | ErrorResponse JSON |

#### Usage Examples

**cURL Command**:
```bash
curl -X GET http://localhost:3000/health \
  -H "Accept: application/json" \
  -v
```

**JavaScript Fetch API**:
```javascript
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed! status: ${response.status}`);
    }
    
    const healthData = await response.json();
    console.log('Server Status:', healthData.status);
    console.log('Uptime:', healthData.uptime, 'seconds');
    console.log('Memory Usage:', Math.round(healthData.memory.heapUsed / 1024 / 1024), 'MB');
    
    return healthData;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}
```

---

## Request/Response Formats

### Response Interface Specifications

#### HelloResponse Interface
Used for the `/hello` endpoint when returning structured data (alternative implementation):

```typescript
interface HelloResponse {
  readonly message: string;     // Hello world message
  readonly timestamp: string;   // ISO timestamp
  readonly requestId: string;   // Request correlation ID
}
```

#### HealthCheckResponse Interface
Used for the `/health` endpoint health monitoring:

```typescript
interface HealthCheckResponse {
  readonly status: 'ok' | 'error';      // Health status indicator
  readonly uptime: number;               // Server uptime in seconds
  readonly timestamp: string;            // Health check timestamp
  readonly memory: NodeJS.MemoryUsage;   // Current memory usage
  readonly version: string;              // Application version
  readonly environment: string;          // Deployment environment
}
```

#### ErrorResponse Interface
Standardized error response format for all error scenarios:

```typescript
interface ErrorResponse {
  readonly error: string;       // Error message
  readonly statusCode: number;  // HTTP status code
  readonly timestamp: string;   // Error occurrence timestamp
  readonly requestId: string;   // Request correlation ID
  readonly path: string;        // Request path where error occurred
  readonly method: string;      // HTTP method of failed request
}
```

### Common Headers

#### Request Headers
- **X-Request-ID**: Optional client-provided request identifier
- **X-Correlation-ID**: Optional correlation identifier for distributed tracing
- **Accept**: Content type preferences (`application/json`, `text/plain`)
- **User-Agent**: Client identification string

#### Response Headers
- **Content-Type**: Response content type with character encoding
- **X-Request-ID**: Server-generated or client-provided request identifier
- **X-Correlation-ID**: Correlation identifier for request tracking
- **Content-Length**: Response body size in bytes
- **Date**: Response generation timestamp

#### Security Headers (Applied by Helmet.js)
- **X-Frame-Options**: `SAMEORIGIN` - Prevents clickjacking attacks
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-XSS-Protection**: `0` - Disables legacy XSS protection (CSP preferred)
- **Strict-Transport-Security**: HSTS header for secure connections
- **Content-Security-Policy**: Defines allowed content sources

---

## Error Handling

### Error Response Format

All API errors follow a standardized response format for consistent error handling across the application:

```json
{
  "error": "Resource not found",
  "statusCode": 404,
  "timestamp": "2024-11-01T10:30:00.000Z",
  "requestId": "req-12345678-90ab-cdef",
  "path": "/unknown-endpoint",
  "method": "GET"
}
```

### HTTP Status Codes

#### Success Codes
- **200 OK**: Request processed successfully
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned

#### Client Error Codes
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access forbidden
- **404 Not Found**: Resource not found
- **405 Method Not Allowed**: HTTP method not supported for endpoint
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Request validation failed
- **429 Too Many Requests**: Rate limit exceeded

#### Server Error Codes
- **500 Internal Server Error**: Server processing error
- **502 Bad Gateway**: Gateway or proxy error
- **503 Service Unavailable**: Service temporarily unavailable
- **504 Gateway Timeout**: Gateway timeout error

### Error Scenarios and Responses

#### 404 Not Found Example
**Request**: `GET /unknown-endpoint`

**Response**:
```json
{
  "error": "Resource not found",
  "statusCode": 404,
  "timestamp": "2024-11-01T10:30:00.000Z",
  "requestId": "req-not-found-001",
  "path": "/unknown-endpoint",
  "method": "GET"
}
```

#### 405 Method Not Allowed Example
**Request**: `POST /hello`

**Response**:
```json
{
  "error": "Method not allowed for this endpoint",
  "statusCode": 405,
  "timestamp": "2024-11-01T10:30:00.000Z",
  "requestId": "req-method-error-001",
  "path": "/hello",
  "method": "POST"
}
```

### Error Correlation and Tracking

#### Request Correlation
Every request receives a unique Request ID for tracking and debugging:
- **Client-provided**: Include `X-Request-ID` header in requests
- **Server-generated**: Automatic UUID generation when not provided
- **Response header**: Always included in `X-Request-ID` response header

#### Error Logging
All errors are logged with correlation information:
```javascript
// Example error log entry
{
  "level": "error",
  "message": "Route not found",
  "requestId": "req-12345678-90ab-cdef",
  "correlationId": "corr-abcd-efgh-ijkl",
  "path": "/unknown-endpoint",
  "method": "GET",
  "timestamp": "2024-11-01T10:30:00.000Z",
  "stack": "Error: Route not found..."
}
```

### Troubleshooting Guide

#### Common Issues and Solutions

**Issue**: 404 Not Found for `/hello` endpoint  
**Cause**: Incorrect URL path or server not running  
**Solution**: Verify server is running on port 3000 and use exact path `/hello`

**Issue**: 405 Method Not Allowed  
**Cause**: Using incorrect HTTP method  
**Solution**: Use `GET` method for both `/hello` and `/health` endpoints

**Issue**: Connection Refused  
**Cause**: Server not running or port blocked  
**Solution**: Start server with `npm start` and verify port 3000 is available

**Issue**: 500 Internal Server Error  
**Cause**: Server-side processing error  
**Solution**: Check server logs for detailed error information and stack trace

---

## Security

### Security Headers

The API implements comprehensive security headers through **Helmet.js middleware** to protect against common web vulnerabilities:

#### Content Security Policy (CSP)
```http
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none'
```

**Purpose**: Prevents XSS attacks by controlling allowed content sources

#### Frame Protection
```http
X-Frame-Options: SAMEORIGIN
```

**Purpose**: Prevents clickjacking attacks by controlling frame embedding

#### Content Type Protection
```http
X-Content-Type-Options: nosniff
```

**Purpose**: Prevents MIME type sniffing attacks

#### Strict Transport Security (HSTS)
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Purpose**: Enforces secure HTTPS connections (when applicable)

### CORS Configuration

Cross-Origin Resource Sharing is configured for development environments:

```javascript
// CORS Configuration
{
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400  // 24 hours
}
```

### Rate Limiting

Basic rate limiting protects against abuse:
- **Window**: 15 minutes (900 seconds)
- **Limit**: 100 requests per window per IP
- **Response**: HTTP 429 when limit exceeded

### Security Best Practices

#### For API Consumers
1. **Always use HTTPS** in production environments
2. **Validate response data** before processing
3. **Implement proper error handling** for security failures
4. **Store no sensitive data** in client-side code
5. **Use request correlation** for security incident investigation

#### For Server Operations
1. **Keep dependencies updated** to latest secure versions
2. **Monitor for security vulnerabilities** in npm packages
3. **Implement proper logging** for security events
4. **Use environment variables** for configuration secrets
5. **Regular security audits** with `npm audit`

### Express.js 5.1.0 Security Enhancements

The API leverages Express.js 5.1.0 security improvements:

#### ReDoS Protection
- **Path-to-regexp 8.x**: Updated to prevent Regular Expression Denial of Service attacks
- **Input validation**: Enhanced protection against malicious regex patterns
- **Route security**: Simplified route definitions reduce attack surface

#### Enhanced Error Handling
- **Automatic promise rejection**: Prevents information disclosure through unhandled promises
- **Secure error responses**: Standardized error format prevents sensitive data exposure
- **Stack trace protection**: Error details hidden in production mode

---

## Monitoring

### Health Checks

The API provides comprehensive health monitoring through the `/health` endpoint:

#### Health Check Response
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2024-11-01T10:30:00.000Z",
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 18874368,
    "external": 1683456,
    "arrayBuffers": 163840
  },
  "version": "1.0.0",
  "environment": "development"
}
```

#### Health Status Indicators
- **status**: `"ok"` for healthy, `"error"` for unhealthy
- **uptime**: Server uptime in seconds since startup
- **memory**: Detailed Node.js memory usage statistics
- **timestamp**: Health check execution time

### Request Correlation

Every API request includes correlation identifiers for tracking:

#### Correlation Headers
- **X-Request-ID**: Unique identifier for individual requests
- **X-Correlation-ID**: Session or workflow correlation identifier

#### Correlation Flow
```
Client Request → Express Middleware → Route Handler → Response
     ↓               ↓                    ↓              ↓
Request-ID      Correlation-ID      Processing      Response-ID
```

### Performance Tracking

Basic performance metrics are collected for each request:

#### Tracked Metrics
- **Response time**: Request processing duration in milliseconds
- **Memory usage**: Heap usage during request processing
- **Status codes**: HTTP response status distribution
- **Endpoint usage**: Request count per endpoint

#### Monitoring Integration
The API is designed for integration with monitoring tools:
- **Prometheus**: Metrics collection endpoint (can be added)
- **Grafana**: Dashboard visualization support
- **Application Performance Monitoring (APM)**: Ready for APM tool integration

### Logging

Structured logging provides operational visibility:

#### Log Levels
- **error**: Application errors and exceptions
- **warn**: Non-critical issues and warnings
- **info**: General application events and requests
- **http**: HTTP request/response logging
- **debug**: Development and troubleshooting information

#### Log Format
```json
{
  "level": "info",
  "message": "HTTP GET /hello",
  "requestId": "req-12345678-90ab-cdef",
  "correlationId": "corr-abcd-efgh-ijkl",
  "duration": 45,
  "statusCode": 200,
  "timestamp": "2024-11-01T10:30:00.000Z"
}
```

### Operational Monitoring

#### Health Check Automation
```bash
# Automated health check script
#!/bin/bash
HEALTH_URL="http://localhost:3000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
  echo "Health check passed"
  exit 0
else
  echo "Health check failed with status: $RESPONSE"
  exit 1
fi
```

#### Monitoring Best Practices
1. **Regular health checks**: Automated monitoring every 30 seconds
2. **Alert thresholds**: Set appropriate thresholds for response time and errors
3. **Log aggregation**: Centralize logs for analysis and troubleshooting
4. **Metrics dashboard**: Visual monitoring of key performance indicators
5. **Incident response**: Automated alerting for critical issues

---

## Usage Examples

### Complete Integration Examples

#### Node.js Client Implementation
```javascript
const axios = require('axios');

class TutorialAPIClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'User-Agent': 'Tutorial-API-Client/1.0.0'
      }
    });
    
    // Request interceptor for correlation
    this.client.interceptors.request.use((config) => {
      config.headers['X-Request-ID'] = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      config.headers['X-Correlation-ID'] = this.correlationId || `session-${Date.now()}`;
      return config;
    });
    
    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`Request ${response.config.headers['X-Request-ID']} completed with status ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`Request failed:`, error.message);
        return Promise.reject(error);
      }
    );
  }
  
  async hello() {
    try {
      const response = await this.client.get('/hello');
      return {
        message: response.data,
        requestId: response.headers['x-request-id'],
        statusCode: response.status
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  async health() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return new Error(`API Error ${error.response.status}: ${error.response.data.error || error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network Error: No response received from server');
    } else {
      // Request setup error
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

// Usage example
async function main() {
  const client = new TutorialAPIClient();
  
  try {
    // Test hello endpoint
    const helloResult = await client.hello();
    console.log('Hello Response:', helloResult);
    
    // Test health endpoint
    const healthResult = await client.health();
    console.log('Health Status:', healthResult.status);
    console.log('Server Uptime:', healthResult.uptime, 'seconds');
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

main();
```

#### Python Client Implementation
```python
import requests
import json
import time
import uuid
from typing import Dict, Any, Optional

class TutorialAPIClient:
    def __init__(self, base_url: str = 'http://localhost:3000'):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Tutorial-API-Python-Client/1.0.0'
        })
        self.correlation_id = f"python-session-{int(time.time())}"
    
    def _generate_request_id(self) -> str:
        return f"python-{int(time.time())}-{str(uuid.uuid4())[:8]}"
    
    def _make_request(self, method: str, path: str, **kwargs) -> requests.Response:
        url = f"{self.base_url}{path}"
        headers = kwargs.pop('headers', {})
        headers.update({
            'X-Request-ID': self._generate_request_id(),
            'X-Correlation-ID': self.correlation_id
        })
        
        response = self.session.request(method, url, headers=headers, **kwargs)
        
        print(f"Request {headers['X-Request-ID']} completed with status {response.status_code}")
        
        if not response.ok:
            error_data = response.json() if response.content else {'error': response.reason}
            raise Exception(f"API Error {response.status_code}: {error_data.get('error', 'Unknown error')}")
        
        return response
    
    def hello(self) -> Dict[str, Any]:
        """Call the hello endpoint and return response data."""
        response = self._make_request('GET', '/hello')
        return {
            'message': response.text,
            'request_id': response.headers.get('X-Request-ID'),
            'status_code': response.status_code
        }
    
    def health(self) -> Dict[str, Any]:
        """Call the health endpoint and return health data."""
        response = self._make_request('GET', '/health')
        return response.json()

# Usage example
if __name__ == "__main__":
    client = TutorialAPIClient()
    
    try:
        # Test hello endpoint
        hello_result = client.hello()
        print(f"Hello Response: {hello_result}")
        
        # Test health endpoint
        health_result = client.health()
        print(f"Health Status: {health_result['status']}")
        print(f"Server Uptime: {health_result['uptime']} seconds")
        print(f"Memory Usage: {health_result['memory']['heapUsed'] / 1024 / 1024:.2f} MB")
        
    except Exception as error:
        print(f"API Error: {error}")
```

### cURL Command Reference

#### Hello Endpoint Examples
```bash
# Basic hello request
curl -X GET http://localhost:3000/hello

# Hello request with correlation headers
curl -X GET http://localhost:3000/hello \
  -H "X-Request-ID: curl-hello-001" \
  -H "X-Correlation-ID: tutorial-session-001" \
  -v

# Hello request with detailed output
curl -X GET http://localhost:3000/hello \
  -H "User-Agent: Tutorial-cURL-Client/1.0" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\nSize: %{size_download} bytes\n" \
  -s
```

#### Health Endpoint Examples
```bash
# Basic health check
curl -X GET http://localhost:3000/health

# Health check with JSON formatting
curl -X GET http://localhost:3000/health \
  -H "Accept: application/json" \
  | python -m json.tool

# Health check with performance timing
curl -X GET http://localhost:3000/health \
  -w "Response Time: %{time_total}s\nStatus Code: %{http_code}\n" \
  -s -o /dev/null
```

### Error Handling Examples

#### JavaScript Error Handling
```javascript
async function robustAPICall() {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await fetch('http://localhost:3000/hello', {
        method: 'GET',
        headers: {
          'X-Request-ID': `retry-attempt-${attempt + 1}`,
          'X-Correlation-ID': 'error-handling-demo'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error}`);
      }
      
      const data = await response.text();
      console.log('Success:', data);
      return data;
      
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt >= maxRetries) {
        console.error('Max retries exceeded');
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

#### Response Validation
```javascript
function validateHealthResponse(healthData) {
  const requiredFields = ['status', 'uptime', 'timestamp', 'memory', 'version'];
  
  for (const field of requiredFields) {
    if (!(field in healthData)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (!['ok', 'error'].includes(healthData.status)) {
    throw new Error(`Invalid status value: ${healthData.status}`);
  }
  
  if (typeof healthData.uptime !== 'number' || healthData.uptime < 0) {
    throw new Error(`Invalid uptime value: ${healthData.uptime}`);
  }
  
  console.log('Health response validation passed');
  return true;
}
```

---

## API Documentation Summary

This comprehensive API documentation covers the Node.js Tutorial Application's HTTP API built with **Express.js 5.1.0** and **Node.js 24.x**. The documentation demonstrates modern API development practices while maintaining educational clarity for developers learning Node.js fundamentals.

### Key Features Documented
- **Express.js 5.1.0 Enhanced Features**: Automatic promise rejection handling and security improvements
- **TypeScript Integration**: Type-safe interface definitions for all API responses
- **Security Best Practices**: Helmet.js middleware and comprehensive security headers
- **Request Correlation**: End-to-end request tracking for operational visibility
- **Comprehensive Error Handling**: Standardized error responses with detailed troubleshooting
- **Health Monitoring**: Production-ready health check endpoint with system metrics
- **Practical Examples**: Real-world client implementations in multiple languages

### Educational Value
This documentation serves as a comprehensive reference for:
- Understanding modern Express.js API development patterns
- Learning HTTP server fundamentals and best practices
- Implementing security middleware and headers correctly
- Building robust error handling and monitoring systems
- Creating type-safe APIs with TypeScript integration
- Developing professional API documentation standards

### Next Steps
To extend this tutorial application:
1. **Add Database Integration**: Implement MongoDB or PostgreSQL for data persistence
2. **Implement Authentication**: Add JWT-based authentication and authorization
3. **Enhance Monitoring**: Integrate Prometheus metrics and Grafana dashboards
4. **Add More Endpoints**: Create CRUD operations for learning REST API patterns
5. **Deploy to Production**: Use Docker containers and cloud deployment strategies

For questions, issues, or contributions related to this API documentation, please refer to the project repository and development guidelines.