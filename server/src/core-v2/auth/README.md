# User Identity Management

## Overview

This module provides a centralized approach to managing user identities using Auth0 sub claims.

## Key Concepts

### User ID Format

User IDs are derived from Auth0's sub claim and follow these formats:
- `auth0|{24_character_id}`
- `{provider}|{unique_identifier}`

### Supported Providers
- Auth0 (default)
- Google OAuth
- Facebook
- GitHub
- LinkedIn

## Usage

### Validation

```typescript
import { UserIdentity, assertValidUserId } from './userIdentity';

// Validate a user ID
const isValid = UserIdentity.validate('auth0|123456789012345678901234');

// Assert validity (throws an error if invalid)
assertValidUserId('auth0|123456789012345678901234');

// Extract provider
const provider = UserIdentity.extractProvider('auth0|123456');
```

### Model Integration

```typescript
// Example Mongoose Schema
const projectSchema = new Schema({
  ownerId: {
    type: String,
    required: true,
    validate: {
      validator: UserIdentity.validate,
      message: 'Invalid user identifier'
    }
  }
});
```

## Best Practices

1. Always validate user IDs before using them
2. Use the `assertValidUserId` type guard in critical paths
3. Never trust user-provided IDs without validation
4. Use the centralized `UserIdentity` utilities for consistency

## Security Considerations

- The utilities prevent potential injection attacks
- Provides a consistent approach to ID handling
- Supports multiple authentication providers

## Troubleshooting

- If validation fails, check the ID format
- Ensure the ID matches the expected pattern
- Verify the authentication provider

## Extending Support

To add a new provider, update the validation regex in `UserIdentity.validate()`