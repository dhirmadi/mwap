# MWAP API Documentation

## Base URL
All API endpoints are prefixed with `/api/v1`. For example, `/tenant` becomes `/api/v1/tenant`.

## Authentication
All routes require authentication using Auth0. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this format:
```json
{
  "data": T,  // Response data of type T
  "meta": {
    "requestId": string,
    "timestamp": string,
    "pagination?: {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```

## Error Format
Error responses follow this format:
```json
{
  "error": {
    "code": string,
    "message": string,
    "requestId": string,
    "data"?: any
  }
}
```

## Tenant Management

### Create Tenant
```http
POST /api/v1/tenant
Authorization: Required

Request:
{
  "name": string  // 3-50 chars, alphanumeric + spaces/hyphens/underscores
}

Response:
{
  "data": {
    "id": string,
    "name": string,
    "members": [{
      "userId": string,
      "role": "OWNER",
      "joinedAt": string
    }],
    "createdAt": string,
    "archived": boolean
  },
  "meta": {
    "requestId": string,
    "timestamp": string
  }
}
```
- One tenant per user
- Returns 409 if user already has a tenant
- Name validation: 3-50 chars, alphanumeric + spaces/hyphens/underscores

### Get Current Tenant
```http
GET /api/v1/tenant/me
Authorization: Required

Response:
{
  "data": {
    "id": string,
    "name": string,
    "members": Array<Member>,
    "createdAt": string,
    "archived": boolean
  },
  "meta": {
    "requestId": string
  }
}
```
- Returns null if user has no tenant (not an error)

### Update Tenant
```http
PATCH /api/v1/tenant/:id
Authorization: Required + Tenant Owner

Request:
{
  "name": string  // Same validation as create
}

Response: Same as GET /api/v1/tenant/me
```

### Archive Tenant
```http
DELETE /api/v1/tenant/:id
Authorization: Required + Tenant Owner

Response:
{
  "data": {
    "success": true
  },
  "meta": {
    "requestId": string
  }
}
```
- Soft deletes by setting archived=true
- Also archives all projects in the tenant

## Project Management

### Create Project
```http
POST /api/v1/projects
Authorization: Required + Tenant Owner

Request:
{
  "name": string,
  "description"?: string
}

Response:
{
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "tenantId": string,
    "createdBy": string,
    "createdAt": string,
    "updatedAt": string,
    "archived": boolean
  },
  "meta": {
    "requestId": string
  }
}
```

### List Projects
```http
GET /api/v1/projects
Authorization: Required

Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 20, max: 100)
- sort?: string
- order?: 'asc' | 'desc'
- archived?: boolean (default: false)

Response:
{
  "data": [{
    "id": string,
    "name": string,
    "description": string,
    "tenantId": string,
    "createdBy": string,
    "role": string,  // User's role in project
    "archived": boolean,
    "createdAt": string,
    "updatedAt": string
  }],
  "meta": {
    "requestId": string,
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```
- Returns only projects where user is a member
- Excludes archived projects by default

### Get Project
```http
GET /api/v1/projects/:id
Authorization: Required + Project Member

Response: Same as single project in List Projects
```

### Update Project
```http
PATCH /api/v1/projects/:id
Authorization: Required + Project Admin

Request:
{
  "name"?: string,
  "description"?: string,
  "archived"?: boolean
}

Response: Same as Get Project
```

### Delete Project
```http
DELETE /api/v1/projects/:id
Authorization: Required + Project Admin

Response:
{
  "data": {
    "success": true
  },
  "meta": {
    "requestId": string
  }
}
```
- Soft deletes by setting archived=true

## Project Members

### List Members
```http
GET /api/v1/projects/:id/members
Authorization: Required + Project Member

Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 20, max: 100)
- sort?: string
- order?: 'asc' | 'desc'

Response:
{
  "data": [{
    "userId": string,
    "role": string,
    "joinedAt": string
  }],
  "meta": {
    "requestId": string,
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```

### Update Member Role
```http
PATCH /api/v1/projects/:id/members/:userId
Authorization: Required + Project Admin/Deputy

Request:
{
  "role": "ADMIN" | "DEPUTY" | "CONTRIBUTOR"
}

Response: Same as member object in List Members
```
- Cannot modify own role
- Cannot promote beyond own role level
- Deputies cannot modify Admin roles

### Remove Member
```http
DELETE /api/v1/projects/:id/members/:userId
Authorization: Required + Project Admin/Deputy

Response:
{
  "data": {
    "success": true
  },
  "meta": {
    "requestId": string
  }
}
```
- Cannot remove self
- Cannot remove members with higher role

## User Profile

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Required

Response:
{
  "data": {
    "id": string,
    "email": string,
    "name": string,
    "picture"?: string,
    "roles": string[],
    "tenantId"?: string
  },
  "meta": {
    "requestId": string
  }
}
```

## Super Admin

### List All Tenants
```http
GET /api/v1/admin/tenants
Authorization: Required + Super Admin

Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 20, max: 100)
- sort?: string
- order?: 'asc' | 'desc'
- archived?: boolean

Response:
{
  "data": Array<Tenant>,
  "meta": {
    "requestId": string,
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```

### Archive Tenant
```http
PATCH /api/v1/admin/tenant/:id/archive
Authorization: Required + Super Admin

Response:
{
  "data": {
    "tenantId": string,
    "success": true
  },
  "meta": {
    "requestId": string
  }
}
```
- Archives tenant and all its projects

## Error Codes

| Code | Status | Description |
|------|---------|-------------|
| VALIDATION_ERROR | 400 | Invalid request parameters |
| AUTHENTICATION_ERROR | 401 | Missing or invalid token |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND_ERROR | 404 | Resource not found |
| CONFLICT_ERROR | 409 | Resource already exists |
| INTERNAL_ERROR | 500 | Server error |

## Role Hierarchy

### Tenant Roles
```typescript
enum TenantRole {
  OWNER = 'OWNER',    // Level 3
  ADMIN = 'ADMIN',    // Level 2
  MEMBER = 'MEMBER'   // Level 1
}
```

### Project Roles
```typescript
enum ProjectRole {
  ADMIN = 'ADMIN',          // Level 3
  DEPUTY = 'DEPUTY',        // Level 2
  CONTRIBUTOR = 'CONTRIBUTOR' // Level 1
}
```