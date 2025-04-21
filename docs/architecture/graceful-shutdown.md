# Graceful Shutdown

The application implements a graceful shutdown mechanism to ensure proper cleanup of resources when the server is stopped, especially during local development.

## Features

### 1. Timeout Management
- Default timeout of 10 seconds for graceful shutdown
- Forced shutdown if cleanup takes too long
- Shutdown duration tracking and logging

### 2. Resource Cleanup
- Server stops accepting new connections
- Active connections are allowed to complete
- Database connections are properly closed
- Extensible for additional cleanup tasks

### 3. Error Handling
- Handles various termination signals (SIGTERM, SIGINT)
- Catches uncaught exceptions and unhandled rejections
- Logs errors during shutdown process
- Sets appropriate exit codes

### 4. Logging
- Detailed logging of shutdown process
- Timing information for shutdown steps
- Error details when problems occur
- Signal type that triggered shutdown

## Implementation

The graceful shutdown is implemented in `server/src/index.ts` and follows this sequence:

1. **Signal Detection**
   ```typescript
   process.on('SIGTERM', () => shutdown('SIGTERM'));
   process.on('SIGINT', () => shutdown('SIGINT'));
   ```

2. **Shutdown Process**
   ```typescript
   const shutdown = async (signal: string) => {
     // 1. Stop accepting new connections
     // 2. Close database connections
     // 3. Handle additional cleanup
     // 4. Exit process
   };
   ```

3. **Timeout Handling**
   ```typescript
   const SHUTDOWN_TIMEOUT = 10000; // 10 seconds
   
   // Race between shutdown tasks and timeout
   await Promise.race([shutdownPromise, timeoutPromise]);
   ```

## Error Handling

The application handles various types of errors during shutdown:

1. **Server Closure Errors**
   - Errors when stopping the HTTP server
   - Connection termination issues

2. **Database Disconnection Errors**
   - MongoDB connection closure issues
   - Timeout during disconnection

3. **Uncaught Exceptions**
   ```typescript
   process.on('uncaughtException', (error) => {
     logger.error('Uncaught exception', { error: error.message });
     shutdown('uncaughtException');
   });
   ```

4. **Unhandled Promise Rejections**
   ```typescript
   process.on('unhandledRejection', (reason) => {
     logger.error('Unhandled rejection', { 
       reason: reason instanceof Error ? reason.message : 'Unknown reason'
     });
     shutdown('unhandledRejection');
   });
   ```

## Logging

The shutdown process includes comprehensive logging:

```typescript
logger.info('Starting graceful shutdown...', { signal });
logger.info('Stopping server from accepting new connections...');
logger.info('Closing database connections...');
logger.info('Graceful shutdown completed', { 
  durationMs: shutdownDuration,
  signal 
});
```

Error logging includes:
- Error message
- Shutdown duration
- Signal that triggered shutdown
- Stack traces when available

## Best Practices

1. **Timeout Configuration**
   - Set appropriate timeout based on application needs
   - Consider environment (development vs production)
   - Account for cleanup task durations

2. **Resource Management**
   - Close resources in correct order
   - Handle cleanup task failures gracefully
   - Prevent resource leaks

3. **Error Handling**
   - Log all errors during shutdown
   - Set appropriate exit codes
   - Ensure process exits even on errors

4. **Monitoring**
   - Track shutdown durations
   - Monitor for timeout occurrences
   - Log cleanup task completion

## Future Improvements

1. **Configurable Timeouts**
   - Environment-specific timeout values
   - Per-task timeout settings
   - Configurable through environment variables

2. **Enhanced Resource Management**
   - Redis connection cleanup
   - File handle cleanup
   - Cache invalidation

3. **Health Check Integration**
   - Update health check during shutdown
   - Report shutdown status
   - Graceful load balancer removal