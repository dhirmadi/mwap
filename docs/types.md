# MWAP Type System Documentation

## Overview

MWAP uses TypeScript for type safety across both frontend and backend. This document outlines the core types and their relationships.

## Core Types

### User & Authentication

```typescript
// Common role and status types
type TenantRole = 'admin' | 'deputy' | 'contributor';
type TenantStatus = 'active' | 'pending' | 'archived';

// User profile from /api/me
interface UserProfile {
  id: string;          // Auth0 user ID
  email: string;       // User's email address
  name: string;        // Display name
  picture?: string;    // Profile picture URL
  isSuperAdmin: boolean; // From superadmins collection
  tenants: Tenant[];   // User's tenant memberships
}

// Tenant membership
interface Tenant {
  tenantId: string;    // MongoDB ObjectId as string
  name: string;        // Tenant display name
  role: TenantRole;    // User's role in this tenant
  status: TenantStatus; // Current tenant status
}
```

### Tenant Context

```typescript
// Used by useTenantContext hook
interface TenantContext {
  tenantId: string | null;     // Current tenant ID
  tenantName: string | null;   // Current tenant name
  role: TenantRole | null;     // Current role
  isAdmin: boolean;            // Role-specific flags
  isDeputy: boolean;
  isContributor: boolean;
  isSuperAdmin: boolean;       // Global admin status
}

// Bootstrap result for initial routing
interface BootstrapResult {
  redirectTo: string;    // Where to redirect after auth
  isLoading: boolean;    // Loading state
  error: Error | null;   // Any bootstrap errors
}
```

### API Responses

```typescript
// Tenant operations
interface TenantJoinResponse {
  tenantId: string;
  name: string;
  role: TenantRole;
}

interface TenantRequestResponse {
  tenantId: string;
  status: TenantStatus;
}

// Member management
interface Member {
  userId: string;
  name: string;
  email: string;
  role: TenantRole;
  joinedAt: string;
}

// Invite system
interface CreateInviteRequest {
  email: string;
  role: Exclude<TenantRole, 'admin'>;  // Cannot invite as admin
  expiresInHours?: number;
}

interface InviteCodeResponse {
  code: string;
  role: Exclude<TenantRole, 'admin'>;
  expiresAt: string;
}
```

## Backend Models

### MongoDB Schemas

```typescript
// User model
interface IUser {
  auth0Id: string;
  email: EncryptedField<string>;
  name?: string;
  tenants: TenantMembership[];
  createdAt: Date;
  updatedAt: Date;
}

// Tenant membership in user model
interface TenantMembership {
  tenantId: Types.ObjectId;
  role: TenantRole;
}

// Super admin model
interface ISuperAdmin {
  auth0Id: string;    // Matches Auth0 user ID
  createdAt: Date;
}

// Encrypted field wrapper
interface EncryptedField<T> {
  value: T;
  __encrypted?: boolean;
}
```

## Type Safety Features

### Frontend

1. **Route Protection**:
```typescript
// Component props
interface RequireSuperAdminProps {
  children: React.ReactNode;
}

// Usage
<RequireSuperAdmin>
  <AdminDashboard />
</RequireSuperAdmin>
```

2. **API Client**:
```typescript
// Type-safe API calls
const { data } = await api.get<UserProfile>('/users/me');
```

3. **Context Hooks**:
```typescript
// Type-safe context usage
const { isSuperAdmin, role } = useTenantContext();
```

### Backend

1. **Request Validation**:
```typescript
// Validate Auth0 token data
function validateAuth0Data(auth: any): void {
  if (!auth.sub) throw new ApiError('Missing sub claim', 401);
  if (!auth.email) throw new ApiError('Missing email claim', 401);
}
```

2. **Response Transformation**:
```typescript
// Transform DB model to API response
function transformUserToResponse(user: IUser, auth0Data: any): UserProfile {
  // Type-safe transformation...
}
```

## Type Evolution

### Recent Changes (April 2025)

1. **Cache System Types**:
   ```typescript
   // Cache service types
   interface CacheService {
     get<T>(key: string): Promise<T | null>;
     set(key: string, value: any, ttl?: number): Promise<void>;
     del(key: string): Promise<void>;
     
     // Tenant-specific methods
     cacheTenant(tenantId: string, data: TenantCacheData): Promise<void>;
     cacheUserTenants(userId: string, tenants: TenantMembership[]): Promise<void>;
     invalidateTenant(tenantId: string): Promise<void>;
     invalidateUserTenants(userId: string): Promise<void>;
   }

   // Cache data types
   interface TenantCacheData {
     id: string;
     name: string;
     status: TenantStatus;
     owner: string;
     archivedAt?: Date;
     archivedReason?: string;
   }
   ```

2. **Super Admin Type Changes**:
   ```typescript
   // User profile with super admin
   interface UserProfile {
     id: string;
     email: string;
     name: string;
     picture?: string;
     isSuperAdmin: boolean;  // From superadmins collection
     tenants: Tenant[];
   }

   // Super admin model
   interface ISuperAdmin {
     auth0Id: string;
     createdAt: Date;
   }
   ```

3. **Enhanced Tenant Types**:
   ```typescript
   // Tenant status type
   type TenantStatus = 'active' | 'pending' | 'archived';

   // Full tenant interface
   interface ITenant {
     name: string;
     owner: Types.ObjectId;
     status: TenantStatus;
     createdBy: Types.ObjectId;
     archivedReason?: string;
     archivedAt?: Date;
     createdAt: Date;
     updatedAt: Date;
   }

   // Tenant membership in user model
   interface TenantMembership {
     tenantId: Types.ObjectId;
     role: TenantRole;
   }
   ```

4. **Response Types**:
   ```typescript
   // Tenant response types
   interface TenantResponse {
     id: string;
     name: string;
     status: TenantStatus;
     owner?: {
       id: string;
       email: string;
       name: string;
     };
     archivedAt?: Date;
     archivedReason?: string;
   }

   // API response wrappers
   interface SuccessResponse<T> {
     message: string;
     data: T;
   }

   interface ErrorResponse {
     error: {
       message: string;
       code?: string;
       details?: any;
     };
   }
   ```

### Type Migration Guide

When updating from older versions:

1. **Cache Integration**:
```typescript
// Old: Direct database queries
const tenant = await Tenant.findById(id);

// New: Cache-aware queries
const cached = await cacheService.get<TenantCacheData>(`tenant:${id}`);
if (cached) return cached;

const tenant = await Tenant.findById(id);
await cacheService.cacheTenant(id, tenant);
```

2. **Response Type Updates**:
```typescript
// Old: Inconsistent response format
return res.json({ tenant });

// New: Standardized response format
return res.json({
  message: 'Operation successful',
  data: {
    id: tenant._id,
    name: tenant.name,
    status: tenant.status
  }
});
```

3. **Tenant Status Handling**:
```typescript
// Old
type TenantStatus = 'active' | 'inactive';
interface TenantUpdate {
  status?: boolean;  // active/inactive
}

// New
type TenantStatus = 'active' | 'pending' | 'archived';
interface TenantUpdate {
  status?: TenantStatus;
  archivedReason?: string;  // Required when status === 'archived'
}
```

4. **Super Admin Checks**:
```typescript
// Old: Role-based super admin
const isAdmin = tenants.some(t => t.role === 'admin');

// New: Dedicated super admin
const { isSuperAdmin } = useTenantContext();
```

5. **Error Handling**:
```typescript
// Old: Basic error responses
throw new Error('Something went wrong');

// New: Typed error responses
throw new ApiError('Operation failed', 400, 'VALIDATION_ERROR', {
  field: 'status',
  value: status,
  allowed: ['active', 'pending', 'archived']
});
```

## Best Practices

1. **Type Guards**:
```typescript
function isTenantRole(role: string): role is TenantRole {
  return ['admin', 'deputy', 'contributor'].includes(role);
}
```

2. **Strict Null Checks**:
```typescript
// Enable in tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

3. **Type Assertions**:
```typescript
// Avoid
const role = roleString as TenantRole;

// Prefer
if (isTenantRole(roleString)) {
  // roleString is now typed as TenantRole
}
```

4. **Generic Constraints**:
```typescript
function withTenant<T extends { tenantId: string }>(data: T): T {
  // Type-safe tenant operations
}
```