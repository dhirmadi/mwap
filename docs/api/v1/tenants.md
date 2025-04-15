# Tenant Management API Documentation

## Overview
The tenant management system provides multi-tenancy support with role-based access control and resource isolation.

## Endpoints

### GET /api/v1/tenant
Get current tenant information.

**Authentication Required**: Yes

**Response**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "ownerId": "string",
    "settings": {
      "key": "value"
    },
    "createdAt": "string",
    "updatedAt": "string"
  },
  "meta": {
    "requestId": "string"
  }
}
```

### POST /api/v1/tenant
Create a new tenant.

**Authentication Required**: Yes

**Request Body**:
```json
{
  "name": "string",
  "settings": {
    "key": "value"
  }
}
```

**Response**: Same as GET /api/v1/tenant

### PATCH /api/v1/tenant
Update tenant information.

**Authentication Required**: Yes (Owner only)

**Request Body**:
```json
{
  "name": "string",
  "settings": {
    "key": "value"
  }
}
```

**Response**: Same as GET /api/v1/tenant

### DELETE /api/v1/tenant
Archive tenant (soft delete).

**Authentication Required**: Yes (Owner only)

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

### GET /api/v1/tenant/members
List tenant members.

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

### PATCH /api/v1/tenant/members/:userId
Update member role.

**Authentication Required**: Yes (Admin or Owner)

**Request Body**:
```json
{
  "role": "string"
}
```

**Response**: Same as member object in GET /api/v1/tenant/members

### DELETE /api/v1/tenant/members/:userId
Remove member from tenant.

**Authentication Required**: Yes (Admin or Owner)

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

### 409 Conflict
```json
{
  "error": {
    "code": "CONFLICT_ERROR",
    "message": "Resource already exists",
    "requestId": "string",
    "data": {
      "field": "string",
      "value": "string"
    }
  }
}
```

## Role-Based Access Control

### Permission Matrix

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View Tenant | ✓ | ✓ | ✓ |
| Update Tenant | ✓ | - | - |
| Delete Tenant | ✓ | - | - |
| View Members | ✓ | ✓ | ✓ |
| Add Members | ✓ | ✓ | - |
| Update Members | ✓ | ✓* | - |
| Remove Members | ✓ | ✓* | - |

\* Admins cannot modify Owner or other Admin roles