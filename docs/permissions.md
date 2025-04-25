# Permission System Guide

## Overview

MWAP implements a role-based access control (RBAC) system with:
- Tenant-level roles
- Project-level permissions
- Integration access control

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

Project permissions inherit from tenant roles and add:
- Project-specific roles
- Resource-level access
- Integration permissions

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
   - Check inheritance rules
   - Maintain role hierarchy

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
- Validate role changes
- Check assigner permissions
- Maintain role hierarchy

### Access Control
- Check permissions early
- Use middleware consistently
- Log access attempts

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   - Check ID type used
   - Verify role assignment
   - Check inheritance

2. **Role Issues**:
   - Verify role exists
   - Check assignment
   - Validate hierarchy

3. **Integration Access**:
   - Check provider permissions
   - Verify token access
   - Check role requirements

## Related Documentation

- [User ID Handling](./user-id-handling.md)
- [Tenant Management](./tenant-management.md)
- [Project Management](./project-management.md)
- [Security Guide](./security-guide.md)