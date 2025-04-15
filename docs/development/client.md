# Client Development Guide

## Directory Structure

```
client/src/
  core/                   # Core infrastructure
    api/                  # API client and utilities
      client.ts          # API client factory
      auth.ts            # Token management
      retry.ts           # Retry logic
      config.ts          # API configuration
    errors/              # Error handling
      types.ts           # Error classes
      handlers.ts        # Error transformation
  types/                 # Type definitions
    common/              # Shared types
      responses.ts       # API response types
    tenant/              # Feature types
    project/
    invite/
  hooks/                 # React hooks
    config.ts           # Hook configuration
    useTenant.ts        # Tenant management
    useProjects.ts      # Project management
  components/            # React components
    TenantStatus.tsx    # Tenant display/creation
    MyProjects.tsx      # Project list
```

## Type System

### Response Types

```typescript
// Base response wrapper
interface SuccessResponse<T> {
  readonly data: T;
  readonly meta: ResponseMetadata;
}

// Error response
interface ErrorResponseBase {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly requestId: string;
    readonly data?: unknown;
  };
}
```

### Feature Types

```typescript
// Tenant types
interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Project types
interface Project {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archived: boolean;
}
```

## Error Handling

### Error Classes

```typescript
// Base error
class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

// API error
class ApiError extends AppError {
  constructor(
    public readonly status: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    super(code, message, details);
  }
}
```

### Error Handling Patterns

```typescript
// In API client
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  throw handleApiError(error);
}

// In components
try {
  await submitData();
} catch (error) {
  const appError = handleApiError(error);
  
  if (isValidationError(appError)) {
    setFieldErrors(appError.fields);
  } else {
    showErrorToast(formatErrorMessage(appError));
  }
  
  console.error(formatErrorForLogging(appError));
}
```

## Data Management

### Query Configuration

```typescript
const QUERY_CONFIG = {
  tenant: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000  // 30 minutes
  },
  projects: {
    staleTime: 1 * 60 * 1000,  // 1 minute
    cacheTime: 15 * 60 * 1000  // 15 minutes
  }
} as const;
```

### Hook Patterns

```typescript
// Query hook
function useData() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['key'],
    queryFn: () => get<ResponseType>(api, '/endpoint'),
    ...QUERY_CONFIG.key
  });
}

// Mutation hook
function useCreate() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RequestType) =>
      post<ResponseType, RequestType>(api, '/endpoint', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key'] });
    }
  });
}
```

## Best Practices

### Type Safety

1. Use strict TypeScript configuration:
   ```json
   {
     "strict": true,
     "noImplicitAny": true,
     "strictNullChecks": true
   }
   ```

2. Define explicit return types:
   ```typescript
   function Component(): JSX.Element {
     // ...
   }
   
   function useHook(): HookResult {
     // ...
   }
   ```

3. Use readonly modifiers:
   ```typescript
   interface Data {
     readonly id: string;
     readonly items: readonly Item[];
   }
   ```

### Error Handling

1. Transform errors at boundaries:
   ```typescript
   // API boundary
   api.interceptors.response.use(
     response => response,
     error => Promise.reject(handleApiError(error))
   );
   ```

2. Use error boundaries for components:
   ```typescript
   class ErrorBoundary extends React.Component {
     componentDidCatch(error: Error) {
       const appError = handleApiError(error);
       logError(appError);
     }
   }
   ```

3. Provide user feedback:
   ```typescript
   try {
     await action();
     showSuccessToast('Action completed');
   } catch (error) {
     showErrorToast(formatErrorMessage(error));
   }
   ```

### Data Management

1. Configure stale time based on data volatility:
   ```typescript
   const config = {
     staleTime: isVolatile ? 30_000 : 300_000
   };
   ```

2. Use optimistic updates:
   ```typescript
   useMutation({
     onMutate: async (newData) => {
       await queryClient.cancelQueries(['key']);
       const previous = queryClient.getQueryData(['key']);
       queryClient.setQueryData(['key'], newData);
       return { previous };
     },
     onError: (err, newData, context) => {
       queryClient.setQueryData(['key'], context.previous);
     }
   });
   ```

3. Batch related mutations:
   ```typescript
   const queryClient = useQueryClient();
   
   // Batch invalidation
   queryClient.invalidateQueries({
     predicate: query => 
       query.queryKey[0] === 'projects' ||
       query.queryKey[0] === 'tenant'
   });
   ```