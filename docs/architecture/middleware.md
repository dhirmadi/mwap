# Middleware Architecture

## Overview

The MWAP middleware system has been refactored into a modular structure for better organization, maintainability, and reusability. Each middleware module is focused on a specific concern and follows consistent patterns for error handling and type safety.

## Middleware Structure

```
middleware/
├── auth/                 # Authentication middleware
│   ├── extractUser.ts    # Extract user from JWT
│   ├── requireAdmin.ts   # Admin role check
│   ├── requireNoTenant.ts # Prevent tenant-specific actions
│   ├── requireRoles.ts   # Role-based access control
│   ├── requireSuperAdmin.ts # Super admin check
│   ├── requireUser.ts    # User authentication check
│   ├── requireUserAndToken.ts # Combined auth check
│   └── validateToken.ts  # JWT validation
│
├── errors/              # Error handling middleware
│   └── index.ts        # Error transformation and logging
│
├── scoping/            # Resource scoping middleware
│   ├── verifyProjectRole.ts # Project permission check
│   ├── verifyTenantAdmin.ts # Tenant admin check
│   ├── verifyTenantMember.ts # Tenant membership check
│   └── verifyTenantOwner.ts # Tenant ownership check
│
├── security/           # Security middleware
│   ├── corsConfig.ts   # CORS configuration
│   ├── helmetConfig.ts # HTTP security headers
│   ├── rateLimiter.ts  # Rate limiting
│   └── requestLogger.ts # Request logging
│
└── validation/         # Request validation
    ├── requestValidation.ts # Input validation
    └── responseTransform.ts # Response formatting
```

## Middleware Categories

### Authentication Middleware
- **Purpose**: Handle user authentication and role verification
- **Key Features**:
  - JWT validation and parsing
  - Role-based access control
  - User context extraction
  - Admin privilege checks
  - Super admin verification
  - Tenant-specific auth rules

### Error Handling Middleware
- **Purpose**: Standardize error handling and logging
- **Key Features**:
  - Error transformation
  - Consistent error formats
  - Request ID tracking
  - Error logging
  - Client-safe error messages

### Scoping Middleware
- **Purpose**: Manage resource access permissions
- **Key Features**:
  - Project role verification
  - Tenant membership checks
  - Admin privilege validation
  - Owner-specific operations
  - Resource isolation

### Security Middleware
- **Purpose**: Implement security best practices
- **Key Features**:
  - CORS configuration
  - HTTP security headers
  - Rate limiting
  - Request logging
  - Security audit trail

### Validation Middleware
- **Purpose**: Ensure data integrity
- **Key Features**:
  - Request validation
  - Response transformation
  - Schema validation
  - Type checking
  - Error aggregation

## Usage Examples

### Authentication Chain
```typescript
router.get('/projects/:id',
  validateToken,        // Verify JWT
  extractUser,         // Get user context
  requireUser,         // Ensure authenticated
  verifyProjectRole,   // Check project access
  projectController.getProject
);
```

### Admin Operations
```typescript
router.post('/tenant/settings',
  validateToken,
  requireUser,
  verifyTenantAdmin,
  tenantController.updateSettings
);
```

### Super Admin Functions
```typescript
router.get('/admin/users',
  validateToken,
  requireSuperAdmin,
  adminController.listUsers
);
```

## Best Practices

1. **Middleware Composition**
   - Chain middleware in logical order
   - Start with authentication
   - Follow with authorization
   - End with validation

2. **Error Handling**
   - Use AppError with message and status code
   - Include request IDs
   - Log detailed errors
   - Return safe messages
   - Status codes:
     - 400: Bad Request/Validation
     - 401: Unauthorized
     - 403: Forbidden
     - 404: Not Found
     - 429: Rate Limit
     - 500: Internal Error

3. **Type Safety**
   - Use TypeScript interfaces
   - Validate request bodies
   - Check response formats
   - Handle edge cases

4. **Security**
   - Always validate tokens
   - Check permissions
   - Rate limit sensitive routes
   - Log security events

5. **Performance**
   - Order middleware efficiently
   - Cache where appropriate
   - Minimize database calls
   - Handle errors early

## Migration Guide

When migrating existing routes to use the new middleware structure:

1. **Replace Old Imports**
   ```typescript
   // Old
   import { validateRequest } from '@core/middleware';
   
   // New
   import { validateRequest } from '@core/middleware/validation/requestValidation';
   ```

2. **Update Middleware Chains**
   ```typescript
   // Old
   router.use(auth, validateRequest);
   
   // New
   router.use(
     validateToken,
     extractUser,
     validateRequest
   );
   ```

3. **Add Type Safety**
   ```typescript
   // Add proper types
   import { RequestHandler } from 'express';
   import { TenantRequest } from '@core/types';
   
   const handler: RequestHandler<TenantRequest> = (req, res, next) => {
     // Type-safe request handling
   };
   ```