# API Documentation

## API Versioning
All API endpoints are versioned using URL prefixes. The current version is v1.

Example:
```http
GET /api/v1/projects/123/members
```

## Route Structure

### Tenant Management
- `GET /api/v1/tenant` - Get current tenant
- `POST /api/v1/tenant` - Create new tenant
- `PATCH /api/v1/tenant` - Update tenant
- `DELETE /api/v1/tenant` - Archive tenant

### Project Management
- `GET /api/v1/projects` - List all accessible projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

#### Project Members
- `PATCH /api/v1/projects/:id/members/:userId` - Update member role
- `DELETE /api/v1/projects/:id/members/:userId` - Remove member

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile

### Invitation Management
- `POST /api/v1/invites` - Create invitation
- `GET /api/v1/invites/:code` - Validate invitation
- `POST /api/v1/invites/:code/accept` - Accept invitation

### Admin Operations
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/tenants` - List all tenants
- `PATCH /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user

## Error Handling

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;      // Error code (e.g., "VALIDATION_ERROR")
    message: string;   // Human-readable message
    requestId: string; // Request ID for tracking
    data?: unknown;    // Optional error details
  };
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400) - Invalid input data
- `AUTHENTICATION_ERROR` (401) - Missing or invalid authentication
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `NOT_FOUND_ERROR` (404) - Resource not found
- `CONFLICT_ERROR` (409) - Resource conflict
- `RATE_LIMIT_ERROR` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Import Guidelines

### Feature Imports
```typescript
// Import routes
import { projectRoutes } from '@features/projects';

// Import types
import { ProjectRole } from '@features/projects/types';

// Import controllers
import { ProjectController } from '@features/projects/controllers';
```

### Core Imports
```typescript
// Import middleware
import { auth } from '@core/middleware/auth';
import { errorHandler } from '@core/middleware/error-handler';

// Import types
import { ValidationError } from '@core/types/errors';
import { AuthRequest } from '@core/types/auth-request';

// Import utilities
import { logger } from '@core/utils/logger';
```

## Authentication

All endpoints (except /health) require authentication using Bearer token:

```http
Authorization: Bearer <token>
```

## Role-Based Access Control

### Project Roles
- `admin` - Full project access
- `deputy` - Can manage members and content
- `contributor` - Can contribute content

### Tenant Roles
- `OWNER` - Full tenant access
- `ADMIN` - Can manage projects and members
- `MEMBER` - Basic access

## Rate Limiting

- Standard rate limit: 100 requests per minute
- Admin endpoints: 50 requests per minute
- Authentication endpoints: 20 requests per minute