# Static File Serving and Client-Side Routing

This document describes the static file serving and client-side routing implementation in the MWAP application.

## Overview

The application uses a two-tier approach to serve the client application:
1. Static file middleware for assets (js, css, images)
2. Custom middleware for client-side routing (SPA)

## Configuration

### Static Assets

Static assets are served using Express's static middleware with the following configuration:

```typescript
app.use(express.static(clientPath, {
  etag: true,
  lastModified: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  index: false
}));
```

#### Caching Strategy

- **Production Environment**:
  - ETags enabled for strong caching
  - Last-Modified headers for validation
  - MaxAge set to 1 day (86400 seconds)
  - Immediate revalidation for index.html

- **Development Environment**:
  - No caching (maxAge: 0)
  - No-store, no-cache headers
  - Helps with debugging and hot reloading

### Single Page Application (SPA) Routing

The SPA middleware handles all non-API routes to support client-side routing:

```typescript
app.get('*', serveClientApp);
```

#### Features

- Serves index.html for all non-API routes
- Supports client-side routing
- Environment-specific caching headers
- Enhanced error logging
- Build validation at startup

## Security Measures

1. **Path Resolution**:
   - Uses `path.resolve()` for absolute paths
   - Prevents directory traversal attacks
   - Validates paths at startup

2. **File Access**:
   - Denies access to dotfiles
   - Uses root path option for security
   - Early validation of client build

3. **Headers**:
   - Proper cache control headers
   - Timestamp headers for debugging
   - Environment-specific settings

## Monitoring

The implementation includes extensive logging for monitoring and debugging:

1. **Startup Validation**:
   ```typescript
   logger.debug('Client app configuration', {
     clientPath,
     indexPath,
     exists,
     size: stats?.size,
     lastModified: stats?.mtime
   });
   ```

2. **Request Logging**:
   ```typescript
   logger.debug('Serving client app for route', {
     path: req.path,
     method: req.method,
     userAgent: req.get('user-agent')
   });
   ```

3. **Error Logging**:
   ```typescript
   logger.error('Failed to serve client app', {
     error: err.message,
     path: req.path,
     indexPath,
     code: err.code
   });
   ```

## Environment-Specific Behavior

### Production

1. **Static Assets**:
   - 1-day cache (86400 seconds)
   - ETags for validation
   - Last-Modified headers

2. **index.html**:
   - No cache storage
   - Immediate revalidation
   - Public cache setting

### Development

1. **Static Assets**:
   - No caching
   - No storage
   - Always revalidate

2. **index.html**:
   - No cache
   - No store
   - Must revalidate

## Error Handling

1. **Build Validation**:
   - Checks for client build at startup
   - Returns 500 error if build missing
   - Includes build instructions in error

2. **Serve Errors**:
   - Detailed error logging
   - Includes file paths and request details
   - Proper error propagation

## Best Practices

1. **Separation of Concerns**:
   - Static files handled by Express middleware
   - SPA routing in custom middleware
   - Clear API route separation

2. **Security First**:
   - Absolute path resolution
   - Dotfile protection
   - No directory traversal

3. **Performance**:
   - Proper caching headers
   - Environment-specific optimization
   - Startup validation

## Metrics to Monitor

1. **Response Times**:
   - Static file serving latency
   - index.html serving latency
   - Cache hit rates

2. **Errors**:
   - File not found errors
   - Build missing errors
   - Serve failures

3. **Resource Usage**:
   - Memory consumption
   - File system operations
   - Cache effectiveness