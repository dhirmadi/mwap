# Authentication ID Handling Guide

## Overview

This document outlines the standardized approach for handling user IDs across the MWAP platform, addressing the critical distinction between Auth0 identifiers and internal user IDs.

## ID Types

### Auth0 ID (`sub`)
- Format: `auth0|xxxxxxxxxxxxxxxxxxxx`
- Used for: Storage, database queries, and external service integration
- Access via: `getUserIdentifier(user, 'auth')`

### Internal ID (`id`)
- Format: System-generated UUID
- Used for: Logging, API responses, and internal references
- Access via: `getUserIdentifier(user, 'internal')`

## Middleware Chain

The correct middleware chain for handling authentication:

```typescript
validateToken → extractUser → requireUser → [businessLogic]
```

### validateToken
- Validates JWT token
- Extracts Auth0 claims
- Does not modify request object

### extractUser
- Transforms Auth0 claims to User object
- Adds user object to request
- Maps IDs appropriately

### requireUser
- Ensures user object exists
- Validates required fields
- Prevents unauthorized access

## ID Usage Patterns

### Database Operations

```typescript
// CORRECT
const user = await UserModel.findOne({
  userId: getUserIdentifier(req.user, 'auth')
});

// INCORRECT
const user = await UserModel.findOne({
  userId: req.user.id
});
```

### API Responses

```typescript
// CORRECT
res.json({
  data: {
    userId: getUserIdentifier(user, 'internal'),
    // other fields...
  }
});

// INCORRECT
res.json({
  data: {
    userId: user.sub,
    // other fields...
  }
});
```

### Logging

```typescript
// CORRECT
logger.info('Operation completed', {
  userId: getUserIdentifier(user, 'internal'),
  operation: 'create',
  status: 'success'
});

// INCORRECT
logger.info('Operation completed', {
  userId: user.sub,
  operation: 'create',
  status: 'success'
});
```

## Project-Specific Implementation

### Project Creation

```typescript
// Database storage - use auth ID
const project = await ProjectModel.create({
  members: [{
    userId: getUserIdentifier(req.user, 'auth'),
    role: ProjectRole.OWNER
  }]
});

// Response - use internal ID
res.json({
  data: {
    createdBy: getUserIdentifier(req.user, 'internal'),
    // other fields...
  }
});
```

### Project Queries

```typescript
// Finding projects - use auth ID
const projects = await ProjectModel.find({
  'members.userId': getUserIdentifier(req.user, 'auth')
});

// Member verification - use auth ID
const member = project.members.find(m => 
  m.userId === getUserIdentifier(req.user, 'auth')
);
```

## Common Pitfalls

1. **Mixed ID Usage**
   - Problem: Using internal ID for storage
   - Solution: Always use auth ID for storage/queries

2. **Direct ID Access**
   - Problem: Accessing req.user.id or req.user.sub directly
   - Solution: Use getUserIdentifier helper

3. **Inconsistent Middleware**
   - Problem: Skipping middleware steps
   - Solution: Always use complete middleware chain

4. **Missing Type Safety**
   - Problem: Implicit any types
   - Solution: Use proper interfaces and types

## Error Handling

```typescript
try {
  // Operation using correct ID
  const result = await operation(getUserIdentifier(user, 'auth'));
} catch (error) {
  logger.error('Operation failed', {
    userId: getUserIdentifier(user, 'internal'),
    error: error.message
  });
  throw new AppError('Operation failed', 500);
}
```

## Testing

```typescript
describe('ID handling', () => {
  it('should use auth ID for storage', async () => {
    const authId = getUserIdentifier(mockUser, 'auth');
    // Test storage operations
  });

  it('should use internal ID for responses', async () => {
    const internalId = getUserIdentifier(mockUser, 'internal');
    // Test response formatting
  });
});
```

## Migration Checklist

- [ ] Update all database queries to use auth ID
- [ ] Update all API responses to use internal ID
- [ ] Update all logging calls to use internal ID
- [ ] Add proper middleware chain to all routes
- [ ] Update tests to use correct ID types
- [ ] Add type safety checks
- [ ] Update error handling to use correct ID types

## Best Practices

1. **Always use getUserIdentifier**
   - Never access IDs directly
   - Be explicit about ID type

2. **Consistent Middleware Chain**
   - Include all required middleware
   - Maintain order
   - Handle errors appropriately

3. **Type Safety**
   - Use TypeScript interfaces
   - Avoid any types
   - Validate ID formats

4. **Documentation**
   - Document ID usage in functions
   - Include ID type in interfaces
   - Comment non-obvious cases

5. **Testing**
   - Test both ID types
   - Verify middleware chain
   - Include error cases