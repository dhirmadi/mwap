# Error Handling System

## Overview

The error handling system provides a centralized way to handle, display, and recover from errors in the form. It uses a combination of error boundaries, error types, and error handlers.

## Error Types

```typescript
// Base error type
class AppError extends Error {
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Form validation error
class ValidationError extends AppError {
  readonly fields: FormError[];
}

// API error
class ApiError extends AppError {
  readonly status: number;
  readonly response?: unknown;
}

// Network error
class NetworkError extends AppError {
  readonly request?: Request;
}

// Auth error
class AuthError extends ApiError {
  readonly isAuthenticated: boolean;
}
```

## Error Handlers

```typescript
// Main error handler
export function handleError(error: unknown, context?: string) {
  // Convert unknown errors to Error objects
  const err = error instanceof Error ? error : new Error(String(error));

  // Log all errors
  logError(err, context);

  // Route to specific handlers
  if (isValidationError(err)) {
    handleValidationError(err);
  } else if (isApiError(err)) {
    handleApiError(err);
  } else {
    showErrorNotification(err);
  }
}

// Form validation error handler
export function handleValidationError(error: ValidationError) {
  logError(error, 'Validation');
  showErrorNotification(error);
}

// API error handler
export function handleApiError(error: ApiError) {
  logError(error, 'API');
  showErrorNotification(error);

  if (isAuthError(error)) {
    handleAuthError(error);
  }
}
```

## Error Boundaries

```typescript
// Base error boundary
export function ErrorBoundary({ children, fallback, onError }) {
  return (
    <ReactErrorBoundary
      fallback={fallback}
      onError={(error) => {
        handleError(error);
        onError?.(error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Form-specific error boundary
export function FormErrorBoundary({ children, onReset }) {
  return (
    <ErrorBoundary
      fallback={<FormErrorFallback onReset={onReset} />}
      onError={(error) => handleError(error, 'Form')}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Error Configuration

```typescript
// Error severity configuration
const ERROR_CONFIG = {
  400: { // Validation/Bad Request
    color: 'yellow',
    icon: IconExclamationMark,
    title: 'Validation Error'
  },
  401: { // Unauthorized
    color: 'red',
    icon: IconLock,
    title: 'Authentication Required'
  },
  403: { // Forbidden
    color: 'red',
    icon: IconBan,
    title: 'Access Denied'
  },
  404: { // Not Found
    color: 'yellow',
    icon: IconSearch,
    title: 'Not Found'
  },
  429: { // Rate Limit
    color: 'yellow',
    icon: IconClock,
    title: 'Rate Limit Exceeded'
  },
  500: { // Internal Error
    color: 'red',
    icon: IconAlertTriangle,
    title: 'Server Error'
  }
};
```

## Usage

### In Components

```typescript
function StepComponent({ form }) {
  return (
    <FormErrorBoundary onReset={form.reset}>
      <BaseStep>
        {/* Step content */}
      </BaseStep>
    </FormErrorBoundary>
  );
}
```

### In Hooks

```typescript
function useFormValidation() {
  const validateField = useCallback((field, value) => {
    try {
      // Validation logic
    } catch (error) {
      handleError(error, 'FieldValidation');
      return false;
    }
  }, []);

  return { validateField };
}
```

### In Event Handlers

```typescript
const handleSubmit = async (values) => {
  try {
    await submitForm(values);
  } catch (error) {
    handleError(error, 'FormSubmission');
    throw error;
  }
};
```

## Best Practices

1. **Error Types**
   - Use appropriate error types
   - Include relevant context
   - Keep error messages clear

2. **Error Boundaries**
   - Place at appropriate levels
   - Provide recovery options
   - Handle cleanup properly

3. **Error Handling**
   - Handle errors at source
   - Provide clear feedback
   - Enable recovery options

4. **Error Logging**
   - Include context
   - Log appropriate details
   - Respect privacy

## Error Recovery

The system provides several recovery mechanisms:

1. **Form Reset**
   - Clear form state
   - Reset validation
   - Clear errors

2. **Field Recovery**
   - Clear field errors
   - Reset field value
   - Restore previous value

3. **Step Recovery**
   - Reset step state
   - Clear step errors
   - Enable retry

4. **Form Recovery**
   - Save form state
   - Enable resume
   - Provide alternatives