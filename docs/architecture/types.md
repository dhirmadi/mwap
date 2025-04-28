# Type System Documentation

## Overview

The MWAP type system provides a comprehensive set of TypeScript types and validation schemas for ensuring type safety and data consistency throughout the application.

## Core Types

### Response Types

All API responses follow a standardized format:

```typescript
// Success Response
{
  data: T;  // Generic type parameter
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

// Error Response
{
  error: {
    code: string;      // Error code (e.g., "VALIDATION_ERROR")
    message: string;   // Human-readable message
    requestId: string; // Request tracking ID
    data?: unknown;    // Optional error details
  };
}
```

### Authentication Types

```typescript
interface User {
  id: string;
  email: string;
  roles: string[];
  tenantId?: string;
  sub: string;
}

interface AuthRequest extends Request {
  user: User;
}

enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}
```

## Feature Types

### Project Types

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}
```

### Tenant Types

```typescript
interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface TenantMember {
  userId: string;
  role: TenantRole;
  joinedAt: Date;
}
```

## Validation

### Request Validation

All request data is validated using Zod schemas:

```typescript
// Example: Create Project Request
const createProjectRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional()
});
```

### Usage in Routes

```typescript
import { validateRequest } from '@core/middleware/validation';

router.post(
  '/projects',
  validateRequest(createProjectRequestSchema),
  projectController.create
);
```

## Error Handling

The error handling system provides consistent error responses across the application:

### Common Error Types

1. Validation Error (400)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "requestId": "req_123",
    "data": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

2. Authentication Error (401)
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "requestId": "req_124"
  }
}
```

3. Authorization Error (403)
```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions",
    "requestId": "req_125"
  }
}
```

## Middleware

### Response Transformation

All successful responses are automatically transformed into the standard format:

```typescript
// Original response
res.json({ name: "Project 1" });

// Transformed response
{
  "data": {
    "name": "Project 1"
  }
}

// Paginated response
{
  "data": [
    { "name": "Project 1" },
    { "name": "Project 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Validation Middleware

Request validation is handled automatically:

```typescript
// Route definition
router.post(
  '/projects',
  validateRequest(createProjectRequestSchema),
  validatePagination,  // For query parameters
  projectController.create
);
```

## Best Practices

1. Type Definitions:
   - Use interfaces for object types
   - Use enums for fixed sets of values
   - Use type aliases for complex types

2. Validation:
   - Always validate request data
   - Use Zod schemas for validation
   - Include meaningful error messages

3. Error Handling:
   - Use appropriate error codes
   - Include relevant error details
   - Maintain consistent error format

4. Response Format:
   - Always use standard response format
   - Include pagination meta when applicable
   - Use type-safe response transformations

## Examples

### Controller Implementation

```typescript
import { createPaginatedResponse } from '@core/middleware/transform';

export class ProjectController {
  async list(req: AuthRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const { data, total } = await projectService.list(page, limit);
    
    res.json(createPaginatedResponse(data, total, page, limit));
  }
}
```

### Service Implementation

```typescript
import { ApiError } from '@core/middleware/error-handler';

export class ProjectService {
  async create(data: CreateProjectRequest) {
    if (!await this.canCreateProject()) {
      throw new ApiError(403, 'AUTHORIZATION_ERROR', 'Cannot create project');
    }
    
    return await this.projectRepository.create(data);
  }
}
```