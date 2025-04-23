# Permission Management API Documentation

## Overview

## Sequence Diagrams

### Permission Check Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Middleware
    participant P as Permission Service
    participant T as Tenant Service
    participant D as Database

    C->>A: Request with JWT
    A->>A: Validate JWT
    A->>A: Extract user info
    A->>P: Check permission
    
    P->>T: Get tenant details
    T->>D: Query tenant
    D-->>T: Tenant data
    T-->>P: Tenant with roles
    
    alt Super Admin
        P-->>A: Grant all permissions
    else Tenant Member
        P->>P: Check role permissions
        P-->>A: Return allowed actions
    else Not Member
        P-->>A: Return no permissions
    end
    
    A-->>C: Response with 403/200
```

### Project Creation Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Middleware
    participant P as Permission Service
    participant Pr as Project Controller
    participant D as Database

    C->>A: POST /projects
    A->>A: Validate JWT
    A->>P: Check create_project
    
    alt Has Permission
        P-->>Pr: Allow creation
        Pr->>D: Create project
        Pr->>D: Add creator as owner
        D-->>Pr: Project created
        Pr-->>C: 201 Created
    else No Permission
        P-->>A: Deny creation
        A-->>C: 403 Forbidden
    end
```

### Permission Inheritance
```mermaid
sequenceDiagram
    participant U as User
    participant T as Tenant
    participant P as Project
    participant R as Resources

    U->>T: Has tenant role
    
    alt Tenant Owner/Admin
        T->>P: Can create projects
        T->>R: Full tenant access
    else Tenant Member
        T->>P: View permitted projects
        T->>R: Limited tenant access
    end

    U->>P: Has project role
    
    alt Project Owner
        P->>R: Full project access
        P->>P: Manage members
    else Project Admin
        P->>R: Manage resources
        P->>P: Manage non-owners
    else Project Member
        P->>R: View resources
        P->>P: View members
    end
```
The permission management system provides functionality for checking and managing permissions across tenants and projects. It supports role-based access control with automatic permission inheritance and super admin privileges.

## Core Concepts

### Permission Model
Permissions are defined by:
- **Action**: The specific operation (e.g., "create_project")
- **Resource**: The target resource type (e.g., "project")
- **Context**: The tenant or project scope
- **Role**: The user's role in that context

### Role Hierarchy
1. **Super Admin**: Has all permissions across all tenants
2. **Tenant Roles**:
   - Owner: Full tenant control + project creation
   - Admin: Tenant management + project creation
   - Member: Basic tenant access
3. **Project Roles**:
   - Owner: Full project control (permanent)
   - Admin: Project management
   - Member: Basic project access

### Permission Inheritance
- Super admins inherit all permissions
- Tenant owners/admins can create projects
- Project creators become project owners
- Project permissions are independent of tenant roles

## Endpoints

### GET /api/v1/permissions
Get user permissions for a tenant.

**Authentication Required**: Yes

**Query Parameters**:
- tenantId (required): The tenant to check permissions in

**Response**:
```json
{
  "data": {
    "permissions": [
      {
        "action": "create_project",
        "resource": "project",
        "tenantId": "string",
        "allowed": true
      }
    ],
    "roles": ["owner", "admin", "member"]
  },
  "meta": {
    "requestId": "string"
  }
}
```

## Permission Actions

### Project Permissions
```typescript
export const PROJECT_PERMISSIONS = {
  CREATE: 'create_project',      // Create new projects
  READ: 'read_project',         // View project details
  UPDATE: 'update_project',     // Modify project settings
  DELETE: 'delete_project',     // Archive/delete project
  MANAGE_MEMBERS: 'manage_project_members'  // Manage project membership
};
```

## Permission Matrix

### Tenant Level

| Action | Super Admin | Owner | Admin | Member |
|--------|-------------|-------|-------|--------|
| Create Project | ✓ | ✓ | ✓ | - |
| List Projects | ✓ | ✓ | ✓ | ✓* |
| Manage Tenant | ✓ | ✓ | - | - |

\* Members can only list projects they have access to

### Project Level

| Action | Super Admin | Owner | Admin | Member |
|--------|-------------|-------|-------|--------|
| View Project | ✓ | ✓ | ✓ | ✓ |
| Update Project | ✓ | ✓ | ✓ | - |
| Delete Project | ✓ | ✓ | - | - |
| Manage Members | ✓ | ✓ | ✓ | - |

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "tenantId is required",
    "requestId": "string"
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "User not authenticated",
    "requestId": "string"
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

## Implementation Examples

### Checking Permissions
```typescript
// Check if user can create project
const canCreate = await permissionService.checkPermission(
  user,
  PERMISSIONS.PROJECT.CREATE,
  'project',
  tenantId
);

if (!canCreate) {
  throw new AuthorizationError('Insufficient permissions');
}
```

### Getting User Permissions
```typescript
// Get all permissions for user in tenant
const { permissions, roles } = await permissionService.getUserPermissions(
  user,
  tenantId
);

// Check specific permission
const hasPermission = permissions.some(p => 
  p.action === 'create_project' && 
  p.resource === 'project' && 
  p.allowed
);
```