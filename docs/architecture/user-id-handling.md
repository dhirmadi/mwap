# User ID Handling Guide

## Overview

MWAP uses two types of user identifiers:
- `user.id`: Internal ID (used for display and reference)
- `user.sub`: Auth0 ID (used for authentication and permissions)

## Usage Guidelines

### Auth ID (`user.sub`)
Used for:
- Tenant ownership
- Tenant membership
- Project membership
- Permission checks
- OAuth validation

### Internal ID (`user.id`)
Used for:
- Display purposes
- Logging
- Reference in UI
- Non-authentication purposes

## Implementation

### Utility Function
```typescript
// @core/utils/user-mapping.ts
export const getUserIdentifier = (user: User, type: 'internal' | 'auth' = 'internal'): string => {
  return type === 'internal' ? user.id : user.sub;
};
```

### Usage Examples

1. **Tenant Creation**:
```typescript
const tenant = await tenantService.createTenant(
  getUserIdentifier(user, 'auth'),
  { name: tenantName }
);
```

2. **Project Members**:
```typescript
members: [{
  userId: getUserIdentifier(user, 'auth'),
  role: 'owner'
}]
```

3. **Permission Checks**:
```typescript
const member = tenant.members.find(m => m.userId === getUserIdentifier(user, 'auth'));
```

## Best Practices

1. **Always Use the Utility**:
   - Never reference `user.id` or `user.sub` directly
   - Use `getUserIdentifier` with appropriate type

2. **ID Type Selection**:
   - Use 'auth' for:
     - Ownership records
     - Member lists
     - Permission checks
   - Use 'internal' for:
     - Display
     - Logging
     - UI references

3. **Validation**:
   - Tenant schema validates auth ID format
   - Project schema validates auth ID format
   - Member lists require valid auth IDs

4. **Error Handling**:
   - Invalid ID format triggers validation error
   - Missing ID triggers appropriate error
   - Clear error messages indicate ID issues

## Security Considerations

1. **ID Usage**:
   - Auth IDs for security operations
   - Internal IDs for display only
   - No mixing of ID types

2. **Validation**:
   - All auth IDs validated
   - Schema enforces correct format
   - No bypassing ID checks

3. **Audit Trail**:
   - Log both ID types
   - Track ID usage
   - Monitor conversions

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   - Check ID type used (should be auth)
   - Verify ID format
   - Check member list format

2. **Validation Errors**:
   - Verify ID type matches usage
   - Check ID format
   - Ensure utility usage

3. **OAuth Issues**:
   - Verify auth ID usage
   - Check token validity
   - Verify provider setup

### Debug Steps

1. Check ID type used:
```typescript
logger.debug('User identifiers', {
  internal: getUserIdentifier(user, 'internal'),
  auth: getUserIdentifier(user, 'auth')
});
```

2. Verify member format:
```typescript
logger.debug('Member check', {
  memberId: member.userId,
  expectedId: getUserIdentifier(user, 'auth')
});
```

## Migration Notes

When migrating existing code:
1. Replace direct ID references
2. Update schema validation
3. Verify permission checks
4. Test all flows
5. Monitor for issues

## Related Documentation

- [Auth0 Integration](./auth0-integration.md)
- [Permission System](./permissions.md)
- [Tenant Management](./tenant-management.md)
- [Project Structure](./project-structure.md)