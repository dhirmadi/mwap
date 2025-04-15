# Project Management API Documentation

## Overview
The project management system provides functionality for creating and managing projects within a tenant, with role-based access control.

## Endpoints

### GET /api/v1/projects
List all accessible projects.

**Authentication Required**: Yes

**Query Parameters**:
- page (optional): Page number
- limit (optional): Items per page
- sort (optional): Sort field
- order (optional): 'asc' or 'desc'
- archived (optional): Include archived projects

**Response**:
```json
{
  "data": [{
    "id": "string",
    "name": "string",
    "description": "string",
    "tenantId": "string",
    "createdBy": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "archived": boolean
  }],
  "meta": {
    "requestId": "string",
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```

### POST /api/v1/projects
Create a new project.

**Authentication Required**: Yes (Admin or Owner)

**Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```

**Response**: Same as project object in GET /api/v1/projects

### GET /api/v1/projects/:id
Get project details.

**Authentication Required**: Yes

**Response**: Same as project object in GET /api/v1/projects

### PATCH /api/v1/projects/:id
Update project details.

**Authentication Required**: Yes (Project Admin)

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "archived": boolean
}
```

**Response**: Same as project object in GET /api/v1/projects

### DELETE /api/v1/projects/:id
Delete project.

**Authentication Required**: Yes (Project Admin)

**Response**:
```json
{
  "data": {
    "success": true
  },
  "meta": {
    "requestId": "string"
  }
}
```

## Member Management

### GET /api/v1/projects/:id/members
List project members.

**Authentication Required**: Yes

**Query Parameters**:
- page (optional): Page number
- limit (optional): Items per page
- sort (optional): Sort field
- order (optional): 'asc' or 'desc'

**Response**:
```json
{
  "data": [{
    "userId": "string",
    "role": "string",
    "joinedAt": "string"
  }],
  "meta": {
    "requestId": "string",
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```

### PATCH /api/v1/projects/:id/members/:userId
Update member role.

**Authentication Required**: Yes (Project Admin)

**Request Body**:
```json
{
  "role": "string"
}
```

**Response**: Same as member object in GET /api/v1/projects/:id/members

### DELETE /api/v1/projects/:id/members/:userId
Remove member from project.

**Authentication Required**: Yes (Project Admin)

**Response**:
```json
{
  "data": {
    "success": true
  },
  "meta": {
    "requestId": "string"
  }
}
```

## Role-Based Access Control

### Project Roles
```typescript
export enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}
```

### Permission Matrix

| Action | Admin | Deputy | Contributor |
|--------|-------|--------|-------------|
| View Project | ✓ | ✓ | ✓ |
| Update Project | ✓ | - | - |
| Delete Project | ✓ | - | - |
| View Members | ✓ | ✓ | ✓ |
| Add Members | ✓ | ✓ | - |
| Update Members | ✓ | ✓* | - |
| Remove Members | ✓ | ✓* | - |

\* Deputies cannot modify Admin roles

### Role Hierarchy
```typescript
export const PROJECT_ROLE_HIERARCHY = {
  [ProjectRole.ADMIN]: 3,
  [ProjectRole.DEPUTY]: 2,
  [ProjectRole.CONTRIBUTOR]: 1
};
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "requestId": "string",
    "data": [{
      "field": "string",
      "message": "string"
    }]
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions",
    "requestId": "string"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Project not found",
    "requestId": "string"
  }
}
```