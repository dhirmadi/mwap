# Tenant Management Guide

## Overview

Tenants in MWAP represent isolated workspaces with their own:
- Members
- Projects
- Cloud provider integrations
- Permission settings

## Implementation

### Tenant Creation

```typescript
// Controller
const tenant = await tenantService.createTenant(
  getUserIdentifier(req.user, 'auth'),
  { name: req.body.name }
);

// Service
const tenant = new TenantModel({
  ...input,
  ownerId: userId,  // Uses auth ID
  members: [{
    userId,         // Uses auth ID
    role: TenantRole.OWNER,
    joinedAt: new Date()
  }]
});
```

### Member Management

Members are identified by their Auth0 ID (`user.sub`):

```typescript
members: [{
  userId: string;    // Auth0 ID (user.sub)
  role: TenantRole;
  joinedAt: Date;
}]
```

### Permission Checks

Permissions use Auth0 ID for member lookup:

```typescript
const member = tenant.members.find(m => m.userId === getUserIdentifier(user, 'auth'));
```

## Data Model

### Tenant Schema
```typescript
{
  name: { type: String, required: true },
  ownerId: { type: String, required: true },  // Auth0 ID
  members: [{
    userId: { type: String, required: true }, // Auth0 ID
    role: { type: String, enum: TenantRole },
    joinedAt: { type: Date, default: Date.now }
  }],
  integrations: [{
    provider: { type: String, required: true },
    token: { type: String, required: true },
    refreshToken: { type: String },
    expiresAt: { type: Date }
  }],
  archived: { type: Boolean, default: false }
}
```

## API Endpoints

### Create Tenant
- `POST /api/v1/tenants`
- Requires authenticated user
- User must not have existing tenant
- Creates tenant with user as owner

### Get Current Tenant
- `GET /api/v1/tenants/current`
- Returns user's owned tenant
- Uses auth ID for lookup

### Update Tenant
- `PUT /api/v1/tenants/:id`
- Requires tenant owner
- Can update name and settings

### Archive Tenant
- `POST /api/v1/tenants/:id/archive`
- Requires tenant owner
- Archives tenant and all projects

## Security

### ID Handling
- Always use auth ID (`user.sub`) for:
  - Tenant ownership
  - Member management
  - Permission checks
- Use internal ID (`user.id`) for:
  - Display purposes
  - Logging
  - UI references

### Permission Levels

1. **Owner**:
   - Full control
   - Can manage members
   - Can manage integrations
   - Can archive tenant

2. **Admin**:
   - Can manage projects
   - Can manage non-owner members
   - Can manage most settings

3. **Member**:
   - Can view tenant
   - Can access assigned projects
   - Limited settings access

## Error Handling

### Common Errors

1. **Validation Errors**:
   - Invalid tenant name
   - Invalid member role
   - Invalid ID format

2. **Permission Errors**:
   - User not authorized
   - Invalid role assignment
   - Operation not allowed

3. **Conflict Errors**:
   - User already has tenant
   - Member already exists
   - Integration conflict

## Best Practices

1. **ID Usage**:
   - Use `getUserIdentifier` utility
   - Consistent auth ID usage
   - Clear ID type purpose

2. **Member Management**:
   - Validate roles
   - Check permissions
   - Maintain audit trail

3. **Integration Handling**:
   - Secure token storage
   - Handle refreshes
   - Validate providers

## Related Documentation

- [User ID Handling](./user-id-handling.md)
- [Permission System](./permissions.md)
- [Cloud Integration](./cloud-integration.md)
- [Project Management](./project-management.md)