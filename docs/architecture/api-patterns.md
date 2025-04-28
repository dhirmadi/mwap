# API Design Patterns

## Response Status Codes

### Success States (200)
- Return `200 OK` with `null` data for single resources that don't exist yet
- Return `200 OK` with empty array `[]` for collections with no items
- Always include metadata with request ID and optional pagination

```typescript
// Single resource - not found
{
  "data": null,
  "meta": {
    "requestId": "req-123"
  }
}

// Empty collection
{
  "data": [],
  "meta": {
    "requestId": "req-123",
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 10
    }
  }
}
```

### Error States
- `404 Not Found` only for specific resource requests that should exist
- `401 Unauthorized` for missing authentication
- `403 Forbidden` for permission issues
- `400 Bad Request` for validation errors
- `500 Server Error` for internal issues

```typescript
// Specific resource not found - error
{
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Project abc-123 not found",
    "requestId": "req-123"
  }
}

// Validation error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "requestId": "req-123",
    "data": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## API Response Patterns

### Single Resource Endpoints
```typescript
// GET /api/tenant/me
// User has no tenant yet - not an error
{
  "data": null,
  "meta": {
    "requestId": "req-123"
  }
}

// User has tenant
{
  "data": {
    "id": "tenant-123",
    "name": "My Workspace"
  },
  "meta": {
    "requestId": "req-123"
  }
}
```

### Collection Endpoints
```typescript
// GET /api/projects
// User has no projects - not an error
{
  "data": [],
  "meta": {
    "requestId": "req-123",
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 10
    }
  }
}

// User has projects
{
  "data": [
    {
      "id": "project-123",
      "name": "Project 1"
    }
  ],
  "meta": {
    "requestId": "req-123",
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

### Specific Resource Endpoints
```typescript
// GET /api/projects/abc-123
// Project doesn't exist - this IS an error
{
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Project abc-123 not found",
    "requestId": "req-123"
  }
}
```

## Client-Side Patterns

### Hooks for Single Resources
```typescript
function useTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const response = await api.get('/tenant/me');
      return response.data;  // null if no tenant
    }
  });
}
```

### Hooks for Collections
```typescript
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data ?? [];  // empty array if no projects
    }
  });
}
```

### Components
```typescript
// Single resource
function TenantStatus() {
  const { data: tenant, isLoading } = useTenant();

  if (isLoading) return <LoadingState />;
  if (!tenant) return <CreateTenantForm />;
  return <TenantDisplay tenant={tenant} />;
}

// Collection
function ProjectList() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <LoadingState />;
  if (projects.length === 0) return <EmptyState />;
  return <ProjectGrid projects={projects} />;
}
```

## Middleware Usage

### Authentication Chain
```typescript
import { validateToken } from '@core/middleware/auth/validateToken';
import { requireUser } from '@core/middleware/auth/requireUser';
import { verifyTenantAdmin } from '@core/middleware/scoping/verifyTenantAdmin';
import { validateRequest } from '@core/middleware/validation/requestValidation';

router.post('/tenant/settings',
  validateToken,        // Verify JWT token
  requireUser,         // Ensure user is authenticated
  verifyTenantAdmin,   // Check tenant admin privileges
  validateRequest(settingsSchema), // Validate request body
  tenantController.updateSettings
);
```

### Error Handling
```typescript
import { errorHandler } from '@core/middleware/errors';
import { requestLogger } from '@core/middleware/security/requestLogger';

// Global error handling
app.use(requestLogger);  // Log all requests
app.use(errorHandler);   // Transform and log errors
```

## Benefits

1. Cleaner Code:
   - Modular middleware organization
   - Clear separation of concerns
   - Type-safe middleware chains
   - Simpler component logic
   - More predictable behavior

2. Better Error Handling:
   - 404s only for actual missing resources
   - Clear distinction between empty states and errors
   - Proper error codes for actual issues

3. Better UX:
   - Empty states are normal, not errors
   - No error flashes for new users
   - Clear loading → empty → data flow

4. Type Safety:
   - Consistent response types
   - Proper null handling
   - Clear collection types