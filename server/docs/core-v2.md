# MWAP Core v2 Architecture

## Overview

Core v2 provides a modernized foundation for MWAP's next-generation APIs. It enforces strict separation between v1 and v2 code to enable gradual migration without regressions.

## Directory Structure

```
core-v2/
├── errors/            # Error handling system
│   ├── AppError.ts    # Base error classes
│   └── validation.ts  # Validation utilities
├── auth/              # Authentication utilities
│   └── jwt.ts        # JWT handling
├── init.ts           # Core initialization
└── types/            # Common TypeScript types
```

## Key Components

### Error Handling

The `AppError` system provides structured error handling:

```typescript
import { AppError, ValidationError } from '@core-v2/errors';

// Basic error
throw new AppError(
  'Resource not found',
  'NOT_FOUND',
  404
);

// Validation error
throw new ValidationError('Invalid input', {
  fields: ['email'],
  reason: 'invalid_format'
});

// Convert Zod errors
const result = UserSchema.safeParse(data);
if (!result.success) {
  throw AppError.fromZodError(result.error);
}
```

### Authentication

The `extractUser` middleware provides typed user information:

```typescript
import { extractUser } from '@middleware-v2/auth/extractUser';
import { requireRoles, MWAP_ROLES } from '@middleware-v2/auth/roles';

router.get('/protected',
  extractUser, // Adds req.user
  requireRoles(MWAP_ROLES.OWNER),
  (req, res) => {
    // req.user is typed
    const { sub, email, roles } = req.user;
    res.json({ message: 'Hello ' + email });
  }
);
```

### Validation

Use Zod schemas for validation:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
  roles: z.array(z.string())
});

// In controller:
const data = UserSchema.parse(req.body);
```

## Usage Guidelines

### 1. Initialization

Initialize core v2 only for v2 routes:

```typescript
// routes/v2.ts
import { Router } from 'express';
import { initCoreV2 } from '@core-v2/init';

const router = Router();
initCoreV2(router);

export default router;
```

### 2. Feature Structure

Follow the standard feature module structure:

```typescript
// features-v2/tenants/
├── model.ts       // Data models & validation
├── service.ts     // Business logic
├── controller.ts  // Request handlers
├── routes.ts      // Route definitions
└── index.ts      // Public exports
```

### 3. Import Rules

✅ Correct imports:
```typescript
// From v2 code:
import { AppError } from '@core-v2/errors';
import { extractUser } from '@middleware-v2/auth/extractUser';

// From v1 code:
import { AppError } from '@core/errors';
import { authMiddleware } from '@middleware/auth';
```

❌ Never mix v1 and v2:
```typescript
// DON'T DO THIS:
import { AppError } from '@core-v2/errors';
import { legacyUtil } from '@core/utils';
```

### 4. Error Handling

Always use the new error system in v2 code:

```typescript
// Controller error handling
try {
  const data = UserSchema.parse(req.body);
  const user = await this.service.createUser(data);
  res.status(201).json(user);
} catch (error) {
  // Error middleware will handle this
  next(error);
}
```

### 5. Testing

Test files should follow the same import rules:

```typescript
// __tests__/myFeature.test.ts
import { AppError } from '@core-v2/errors';
import { MyService } from '../service';

describe('MyService', () => {
  it('should handle errors correctly', () => {
    expect(() => service.doSomething())
      .toThrow(AppError);
  });
});
```

## Migration Guide

1. Create new features in `features-v2/`
2. Use only core-v2 imports
3. Add tests using v2 utilities
4. Mount routes under `/v2` prefix
5. Document API changes

## Best Practices

1. **Type Safety**
   - Use TypeScript strict mode
   - Define proper interfaces
   - Validate all inputs

2. **Error Handling**
   - Use AppError hierarchy
   - Include error codes
   - Add context in details

3. **Authentication**
   - Always use extractUser
   - Check roles appropriately
   - Handle missing users

4. **Validation**
   - Define Zod schemas
   - Validate early
   - Return clear errors

5. **Testing**
   - Test error cases
   - Mock authentication
   - Verify types

## Common Pitfalls

1. Mixing v1 and v2 imports
2. Forgetting to validate inputs
3. Not handling all error cases
4. Missing authentication checks
5. Incomplete type definitions

## Future Considerations

1. Gradual migration of v1 features
2. Deprecation of legacy core
3. API versioning strategy
4. Breaking change management
5. Documentation updates