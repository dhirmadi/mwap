# API Documentation

## API Versioning
All API endpoints are versioned using URL prefixes. The current version is v1.

### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.example.com/api/v1`

### Health Check
```http
GET /health

Response 200 OK:
{
  "status": "healthy",
  "timestamp": "2025-04-15T15:30:00.000Z",
  "uptime": 3600
}
```

### Version Redirect
```http
GET /api

Response 302 Found:
Location: /api/v1
```

### Example Request
```http
GET /api/v1/projects/123/members
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

Response 200 OK:
{
  "data": [{
    "userId": "user123",
    "role": "admin",
    "joinedAt": "2025-01-01T00:00:00.000Z"
  }],
  "meta": {
    "total": 1
  }
}
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

#### Validation Error (400)
```http
POST /api/v1/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": ""  // Invalid: empty name
}

Response 400 Bad Request:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "requestId": "req_123",
    "data": [{
      "field": "name",
      "message": "Name is required"
    }]
  }
}
```

#### Authentication Error (401)
```http
GET /api/v1/projects
Authorization: Bearer invalid_token

Response 401 Unauthorized:
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "requestId": "req_124"
  }
}
```

#### Authorization Error (403)
```http
PATCH /api/v1/projects/123/members/456
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "admin"
}

Response 403 Forbidden:
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Cannot promote to a role higher than your own",
    "requestId": "req_125"
  }
}
```

#### Not Found Error (404)
```http
GET /api/v1/projects/invalid_id

Response 404 Not Found:
{
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Project not found",
    "requestId": "req_126"
  }
}
```

#### Conflict Error (409)
```http
POST /api/v1/tenant
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Existing Tenant"
}

Response 409 Conflict:
{
  "error": {
    "code": "CONFLICT_ERROR",
    "message": "Tenant already exists",
    "requestId": "req_127",
    "data": {
      "field": "name",
      "value": "Existing Tenant"
    }
  }
}
```

#### Rate Limit Error (429)
```http
GET /api/v1/projects

Response 429 Too Many Requests:
{
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests. Please try again in 60 seconds",
    "requestId": "req_128",
    "data": {
      "retryAfter": 60
    }
  }
}
```

#### Internal Error (500)
```http
GET /api/v1/projects

Response 500 Internal Server Error:
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_129"
  }
}
```

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

#### Admin
- Full project access
- Can manage project settings
- Can manage all members
- Can delete project
- Can assign any role up to admin

#### Deputy
- Can manage project content
- Can manage members (except admins)
- Can assign contributor role
- Cannot delete project
- Cannot modify project settings

#### Contributor
- Can view project content
- Can create and edit own content
- Cannot manage members
- Cannot modify project settings

### Tenant Roles

#### Owner
- Full tenant access
- Can manage tenant settings
- Can create and delete projects
- Can manage all members
- Can transfer ownership

#### Admin
- Can manage projects
- Can manage members (except owner)
- Can invite new members
- Cannot modify tenant settings
- Cannot transfer ownership

#### Member
- Basic access to assigned projects
- Can view tenant information
- Cannot manage tenant or projects
- Cannot invite members

### Role Hierarchy

#### Project Roles
```typescript
export enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}

export const PROJECT_ROLE_HIERARCHY: Record<ProjectRole, number> = {
  [ProjectRole.ADMIN]: 3,      // Can manage all aspects of project
  [ProjectRole.DEPUTY]: 2,     // Can manage members except admins
  [ProjectRole.CONTRIBUTOR]: 1  // Basic access
};

// Helper function for role checks
function hasHigherOrEqualRole(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
  return PROJECT_ROLE_HIERARCHY[userRole] >= PROJECT_ROLE_HIERARCHY[requiredRole];
}
```

Example Usage:
```typescript
// Check if user can modify another user's role
if (!hasHigherOrEqualRole(currentUserRole, targetRole)) {
  throw new AuthorizationError('Cannot modify a user with higher or equal role');
}

// Check if user can perform admin action
if (!hasHigherOrEqualRole(userRole, ProjectRole.ADMIN)) {
  throw new AuthorizationError('Requires admin role');
}
```

#### Tenant Roles
```typescript
export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export const TENANT_ROLE_HIERARCHY: Record<TenantRole, number> = {
  [TenantRole.OWNER]: 3,  // Full tenant control
  [TenantRole.ADMIN]: 2,  // Project management
  [TenantRole.MEMBER]: 1  // Basic access
};
```

### Role Assignment Rules

1. Users can only assign roles equal to or lower than their own
2. Users cannot modify their own role
3. Project admins can assign any project role
4. Tenant owners can assign any tenant role
5. Role changes are logged for audit purposes

## Rate Limiting

- Standard rate limit: 100 requests per minute
- Admin endpoints: 50 requests per minute
- Authentication endpoints: 20 requests per minute