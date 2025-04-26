# Project Management API Documentation

## Overview
The project management system provides functionality for creating and managing projects within a tenant, with role-based access control.

## Sequence Diagrams

### Project Creation with Permissions
```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Middleware
    participant P as Permission Service
    participant Pr as Project Controller
    participant T as Tenant Service
    participant D as Database

    C->>A: POST /projects
    A->>A: Validate JWT
    A->>A: Extract user info

    A->>T: Get tenant
    T->>D: Query tenant
    D-->>T: Tenant data
    T-->>A: Tenant info

    A->>P: Check create_project
    P->>P: Check tenant role
    
    alt Has Permission
        P-->>Pr: Allow creation
        Pr->>D: Create project
        Pr->>D: Set creator as owner
        D-->>Pr: Project created
        Pr-->>C: 201 Created
    else No Permission
        P-->>A: Deny creation
        A-->>C: 403 Forbidden
    end
```

### Project Member Management
```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Middleware
    participant P as Permission Service
    participant Pr as Project Controller
    participant D as Database

    C->>A: PATCH /projects/:id/members
    A->>A: Validate JWT
    A->>P: Check manage_members

    P->>D: Get project
    D-->>P: Project data
    P->>P: Check user role
    
    alt Project Owner
        P-->>Pr: Allow all changes
    else Project Admin
        P->>P: Check target role
        alt Target not owner
            P-->>Pr: Allow change
        else Target is owner
            P-->>A: Deny change
        end
    else Insufficient Permission
        P-->>A: Deny change
    end

    alt Change Allowed
        Pr->>D: Update member
        D-->>Pr: Updated
        Pr-->>C: 200 Success
    else Change Denied
        A-->>C: 403 Forbidden
    end
```

### Project Access Control
```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Middleware
    participant P as Permission Service
    participant Pr as Project Controller
    participant D as Database

    C->>A: Request project action
    A->>A: Validate JWT
    A->>P: Check permission

    P->>D: Get project
    D-->>P: Project data
    P->>P: Check user role

    alt Super Admin
        P-->>Pr: Allow all actions
    else Project Owner
        P-->>Pr: Allow all actions
    else Project Admin
        P->>P: Check action type
        alt Allowed Action
            P-->>Pr: Allow action
        else Restricted Action
            P-->>A: Deny action
        end
    else Project Member
        P->>P: Check read-only
        alt Read Action
            P-->>Pr: Allow action
        else Write Action
            P-->>A: Deny action
        end
    end

    alt Action Allowed
        Pr->>D: Execute action
        D-->>Pr: Action result
        Pr-->>C: 200 Success
    else Action Denied
        A-->>C: 403 Forbidden
    end
```

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
Create a new project. The creator automatically becomes the project owner.

**Authentication Required**: Yes
**Permission Required**: `create_project` in tenant

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "tenantId": "string"
}
```

**Response**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "tenantId": "string",
    "role": "owner",
    "createdAt": "string"
  },
  "meta": {
    "requestId": "string"
  }
}
```

**Notes**:
- Project creator automatically gets owner role
- Owner role is permanent and cannot be changed
- Requires `create_project` permission in the tenant
- Only tenant owners/admins can create projects by default

### GET /api/v1/projects/:id
Get project details.

**Authentication Required**: Yes

**Response**: Same as project object in GET /api/v1/projects

### PATCH /api/v1/projects/:id
Update project details.

**Authentication Required**: Yes (Project Owner)

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

**Authentication Required**: Yes (Project Owner)

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

**Authentication Required**: Yes (Project Owner or Deputy*)

**Request Body**:
```json
{
  "role": "string"
}
```

\* Deputies cannot modify Owner roles

**Response**: Same as member object in GET /api/v1/projects/:id/members

### DELETE /api/v1/projects/:id/members/:userId
Remove member from project.

**Authentication Required**: Yes (Project Owner or Deputy*)

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

\* Deputies cannot remove Owners

## Role-Based Access Control

### Project Roles
```typescript
export enum ProjectRole {
  OWNER = 'owner',    // Highest permission level
  DEPUTY = 'deputy',  // Middle tier
  MEMBER = 'member'   // Base level
}
```

### Permission Matrix

| Action | Owner | Deputy | Member |
|--------|-------|--------|--------|
| View Project | ✓ | ✓ | ✓ |
| Update Project | ✓ | - | - |
| Delete Project | ✓ | - | - |
| View Members | ✓ | ✓ | ✓ |
| Add Members | ✓ | ✓ | - |
| Update Members | ✓ | ✓* | - |
| Remove Members | ✓ | ✓* | - |

\* Deputies cannot modify Owner roles

### Role Hierarchy
```typescript
export const PROJECT_ROLE_HIERARCHY = {
  [ProjectRole.OWNER]: 3,   // Highest level
  [ProjectRole.DEPUTY]: 2,  // Middle tier
  [ProjectRole.MEMBER]: 1   // Base level
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