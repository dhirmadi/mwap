# Permission System Guide

## Overview

MWAP implements a role-based access control (RBAC) system with:
- Tenant-level roles
- Project-level permissions
- Integration access control

## Role Standardization

### Project Roles
Project roles follow a standardized hierarchy:
1. OWNER (highest) - Full control over project
2. DEPUTY (middle) - Can manage members except owners
3. MEMBER (base) - Basic access and collaboration

This aligns with tenant roles for consistency:
- Tenant OWNER maps to Project OWNER
- Tenant ADMIN maps to Project DEPUTY
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
- MEMBER has basic access and collaboration rights

Role hierarchy ensures consistent permission checks:
```typescript
export const PROJECT_ROLE_HIERARCHY = {
  [ProjectRole.OWNER]: 3,   // Highest level
  [ProjectRole.DEPUTY]: 2,  // Middle tier
  [ProjectRole.MEMBER]: 1   // Base level
};
```

## Middleware

### Auth Middleware

```typescript
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.sub) {
    throw new AuthError('Authentication required');
  }
  next();
};
```

### Permission Middleware

```typescript
const requireTenantOwner = async (req: Request, res: Response, next: NextFunction) => {
  const hasPermission = await permissionService.checkPermission(
    req.user,
    req.tenant,
    PERMISSIONS.TENANT_OWNER
  );
  if (!hasPermission) {
    throw new AuthorizationError('Requires tenant owner permission');
  }
  next();
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
   - Check ID type used
   - Verify role assignment
   - Check hierarchy level

2. **Role Issues**:
   - Verify role exists in ProjectRole enum
   - Check role hierarchy (OWNER > DEPUTY > MEMBER)
   - Validate role change permissions
   - Ensure Deputy can't modify Owner roles

3. **Integration Access**:
   - Check provider permissions
   - Verify token access
   - Check role requirements

## Related Documentation

- [User ID Handling](./user-id-handling.md)
- [Tenant Management](./tenant-management.md)
- [Project Management](./project-management.md)
- [Security Guide](./security-guide.md)