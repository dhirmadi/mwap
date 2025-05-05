# User Identity Migration Guide

## Overview

This document outlines the migration to a centralized user identity management system using Auth0 sub claims.

## Key Changes

### 1. User Identification

- Previously: Inconsistent user ID handling
- Now: Centralized `UserIdentity` utility for validation

### 2. ID Format

Supported ID formats:
- `auth0|{24_character_id}`
- `{provider}|{unique_identifier}`

### 3. Validation Approach

#### Before
```typescript
// Inconsistent validation
if (userId.length > 0) {
  // Process user
}
```

#### After
```typescript
import { UserIdentity, assertValidUserId } from '@core-v2/auth';

// Validate before processing
assertValidUserId(userId);
```

## Migration Steps

1. **Import UserIdentity**
```typescript
import { UserIdentity, assertValidUserId } from '@core-v2/auth';
```

2. **Update Model Schemas**
```typescript
// Use custom Zod validator
const auth0IdSchema = z.string().refine(
  (id) => UserIdentity.validate(id), 
  { message: 'Invalid Auth0 user identifier' }
);

const UserSchema = z.object({
  id: auth0IdSchema
});
```

3. **Validate User IDs**
```typescript
// Before processing, always validate
function processUser(userId: string) {
  assertValidUserId(userId);
  // Continue with user processing
}
```

## Common Pitfalls

- Do not manually validate user IDs
- Always use `UserIdentity` utilities
- Ensure consistent ID format across the application

## Troubleshooting

### Invalid ID Errors
- Check the source of the user ID
- Verify authentication provider
- Ensure correct ID format

## Best Practices

1. Use `assertValidUserId()` in critical paths
2. Leverage Zod schema validation
3. Extract provider information when needed
4. Sanitize user IDs before processing

## Performance Considerations

- Validation is lightweight
- Minimal performance impact
- Provides robust security checks