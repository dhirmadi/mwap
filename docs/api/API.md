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
  "name": string  // 2-100 chars, trimmed
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

Error Response (400):
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "requestId": string,
    "data": [{
      "field": string,
      "message": string
    }]
  }
}

Error Response (409):
{
  "error": {
    "code": "CONFLICT_ERROR",
    "message": "User already has an active tenant",
    "requestId": string
  }
}
```
- One tenant per user
- Returns 409 if user already has a tenant
- Name validation: 2-100 chars, trimmed
- Supports OAuth user IDs (e.g., "google-oauth2|123...")

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

### Get Specific Tenant
```http
GET /api/v1/tenant/:id
Authorization: Required + Tenant Owner

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
    "requestId": string,
    "timestamp": string
  }
}
```
- Requires tenant owner permissions
- Returns 404 if tenant not found
- Returns 403 if user is not the tenant owner

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

## Cloud Storage Integrations

### List Integrations
```http
GET /api/v1/tenant/:id/integrations
Authorization: Required + Tenant Owner

Response:
{
  "data": [{
    "provider": "GDRIVE" | "DROPBOX" | "BOX" | "ONEDRIVE",
    "connectedAt": string,
    "token": {
      "accessToken": string,
      "refreshToken": string,
      "expiresAt": string
    }
  }],
  "meta": {
    "requestId": string,
    "timestamp": string
  }
}
```

### Add Integration
```http
POST /api/v1/tenant/:id/integrations
Authorization: Required + Tenant Owner

Request:
{
  "provider": "GDRIVE" | "DROPBOX" | "BOX" | "ONEDRIVE",
  "token": {
    "accessToken": string,
    "refreshToken": string,
    "expiresAt": string
  }
}

Response: Same as List Integrations
```
- Replaces existing integration if provider already exists
- Validates token format and expiry
- Preserves other provider integrations

### Delete Integration
```http
DELETE /api/v1/tenant/:id/integrations/:provider
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

### OAuth Flow
```http
GET /api/v1/auth/:provider
Authorization: Required + Tenant Owner
Query Parameters:
- tenantId: string

Response: Redirects to provider's OAuth consent screen
```

```http
GET /api/v1/auth/:provider/callback
Query Parameters:
- code: string
- state: string (base64 encoded { tenantId: string })

Response: Redirects to tenant management page
```
- Supports multiple simultaneous provider connections
- Safe merge strategy preserves existing integrations
- Enhanced logging for debugging
- Proper error handling for OAuth failures

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