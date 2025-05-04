# Permission System Guide

## Overview

MWAP implements a role-based access control (RBAC) system with:
- Tenant-level roles
- Project-level permissions
- Integration access control

## Role Standardization

### Project Roles
Project roles follow a standardized hierarchy:
1. OWNER (highest) - Full control over project and members
2. DEPUTY (middle) - Can manage resources and members (except owners)
3. CONTRIBUTOR (middle-low) - Can create and edit content
4. MEMBER (base) - Basic read access and collaboration

This aligns with tenant roles for consistency:
- Tenant OWNER maps to Project OWNER
- Tenant ADMIN maps to Project DEPUTY
- Tenant CONTRIBUTOR maps to Project CONTRIBUTOR
- Tenant MEMBER maps to Project MEMBER

### Role Validation
- Validate roles at assignment using ProjectRole enum
- Check role hierarchy using PROJECT_ROLE_HIERARCHY
- Ensure role changes maintain hierarchy integrity
- Deputies cannot modify Owner roles
- Only Owners can delete projects

## Implementation

### Permission Service

The permission service uses Auth0 IDs for all checks:

```typescript
class PermissionService {
  async checkPermission(user: User, tenant: Tenant, permission: string): Promise<boolean> {
    const member = tenant.members.find(m => 
      m.userId === getUserIdentifier(user, 'auth')
    );
    return this.hasPermission(member?.role, permission);
  }
}
```

### ID Handling

All permission checks use Auth0 ID (`user.sub`):
- Member lookup
- Role validation
- Access control

## Permission Levels

### Tenant Roles

1. **Owner**:
   ```typescript
   const isOwner = tenant.members.find(m => 
     m.userId === getUserIdentifier(user, 'auth') && 
     m.role === TenantRole.OWNER
   );
   ```

2. **Admin**:
   ```typescript
   const isAdmin = tenant.members.find(m => 
     m.userId === getUserIdentifier(user, 'auth') && 
     m.role === TenantRole.ADMIN
   );
   ```

3. **Member**:
   ```typescript
   const isMember = tenant.members.find(m => 
     m.userId === getUserIdentifier(user, 'auth') && 
     m.role === TenantRole.MEMBER
   );
   ```

### Project Permissions

Project permissions build on the standardized role system:
- OWNER has full control over project and members
- DEPUTY can manage members (except owners) and resources
- CONTRIBUTOR can create and edit project content
- MEMBER has basic read access and collaboration rights

Each role includes all permissions from lower roles:
```typescript
export const PROJECT_PERMISSIONS = {
  [ProjectRole.OWNER]: [
    ...DEPUTY_PERMISSIONS,
    'delete:project',
    'manage:owners',
    'manage:settings'
  ],
  [ProjectRole.DEPUTY]: [
    ...CONTRIBUTOR_PERMISSIONS,
    'manage:members',
    'manage:resources',
    'invite:members'
  ],
  [ProjectRole.CONTRIBUTOR]: [
    ...MEMBER_PERMISSIONS,
    'create:content',
    'edit:content',
    'delete:content'
  ],
  [ProjectRole.MEMBER]: [
    'read:project',
    'read:content',
    'comment:content'
  ]
};

Role hierarchy ensures consistent permission checks:
```typescript
export const PROJECT_ROLE_HIERARCHY = {
  [ProjectRole.OWNER]: 4,      // Highest level
  [ProjectRole.DEPUTY]: 3,     // Management level
  [ProjectRole.CONTRIBUTOR]: 2, // Content creation level
  [ProjectRole.MEMBER]: 1      // Base level
};
```

## Middleware

### Auth Middleware

```typescript
// middleware-v2/auth/extractUser.ts
export const extractUser = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = getTokenFromHeader(req);
      if (!token) {
        throw AppError.unauthorized('No token provided');
      }

      const user = await validateAndDecodeToken(token);
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

### Permission Middleware

```typescript
// middleware-v2/auth/roles.ts
export const requireRoles = (roles: MWAP_ROLES | MWAP_ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.user?.roles || [];
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        throw AppError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
```

## Best Practices

1. **ID Consistency**:
   - Always use auth IDs for permission checks
   - Use `getUserIdentifier` utility
   - Maintain ID type separation

2. **Role Validation**:
   - Validate roles at assignment
   - Check role hierarchy (OWNER > DEPUTY > MEMBER)
   - Maintain consistent role naming
   - Prevent unauthorized role changes

3. **Error Handling**:
   - Clear error messages
   - Proper status codes
   - Detailed logging

## Security Considerations

### ID Handling
- Use auth ID for all security checks
- Never mix ID types in permission logic
- Validate ID format

### Role Assignment
- Validate role changes against hierarchy
- Check assigner permissions (OWNER or DEPUTY)
- Prevent escalation of privileges
- Maintain role separation

### Access Control
- Check permissions early
- Use middleware consistently
- Log access attempts
- Validate role boundaries

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   - Check token validity and expiration
   - Verify role assignment in Auth0
   - Check role hierarchy level
   - Ensure correct role middleware is used

2. **Role Issues**:
   - Verify role exists in MWAP_ROLES enum
   - Check role hierarchy (OWNER > DEPUTY > CONTRIBUTOR > MEMBER)
   - Validate role change permissions
   - Ensure role inheritance is working
   - Check for role conflicts

3. **Integration Access**:
   - Verify OAuth2 token validity
   - Check provider configuration
   - Validate scopes and permissions
   - Ensure correct provider middleware

## Related Documentation

- [Core v2 Architecture](./core-v2.md)
- [API v2 Overview](./api/v2/README.md)
- [Tenant Management](./api/v2/tenants.md)
- [Project Management](./api/v2/projects.md)
- [Cloud Integration](./api/v2/cloud.md)
- [Admin Features](./api/v2/admin/project-types.md)