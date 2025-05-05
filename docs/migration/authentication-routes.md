# Authentication Routes Migration Guide

## Overview
This guide provides a comprehensive approach to migrating routes to the new authentication middleware.

## Old Pattern
```typescript
import { requireAuth } from '@core-v2/auth';

router.get('/resource', requireAuth(), handler);
```

## New Pattern
```typescript
import { RouterAuth } from '@core-v2/auth/router';

// Basic authenticated route
router.use(RouterAuth.authenticated());

// Role-based route
router.use(RouterAuth.withRoles(['ADMIN']));

// Tenant owner route
router.use(RouterAuth.tenantOwner());
```

## Migration Checklist

### 1. Import Changes
- Replace `import { requireAuth } from '@core-v2/auth'`
- Add `import { RouterAuth } from '@core-v2/auth/router'`

### 2. Middleware Application
- Replace `.use(requireAuth())` with appropriate `RouterAuth` method
- Use `.use()` to apply middleware to entire router or specific routes

### 3. Role-Based Access
- Use `withRoles()` for specific role requirements
- Leverage predefined roles: `SUPER_ADMIN`, `ADMIN`, `USER`, `GUEST`

### 4. Common Patterns

#### Basic Authentication
```typescript
router.use(RouterAuth.authenticated());
router.get('/profile', getProfile);
```

#### Admin-Only Routes
```typescript
router.use(RouterAuth.adminOnly());
router.post('/users', createUser);
```

#### Tenant-Specific Routes
```typescript
router.use(RouterAuth.tenantOwner());
router.get('/tenant/resources', getTenantResources);
```

## Best Practices
- Always use the least privileged role
- Apply authentication as close to the route as possible
- Use role-based middleware for granular access control
- Log authentication and authorization events

## Common Pitfalls
- Forgetting to apply authentication middleware
- Using overly broad role assignments
- Not handling unauthorized access gracefully

## Troubleshooting
- Verify Auth0 configuration
- Check role assignments
- Review middleware order
- Enable debug logging for authentication