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

### Recent Changes

1. **Super Admin Type Changes**:
   - Removed tenant-based admin inference
   - Added dedicated `isSuperAdmin` flag
   - Updated context types to reflect changes

2. **Tenant Types**:
   - Added status field to tenant interface
   - Enhanced role type safety
   - Added proper MongoDB type mappings

3. **Auth Types**:
   - Added Auth0 token validation types
   - Enhanced error type definitions
   - Added proper type guards

### Type Migration Guide

When updating from older versions:

1. Replace tenant-based admin checks:
```typescript
// Old
const isAdmin = tenants.some(t => t.role === 'admin');

// New
const { isSuperAdmin } = useTenantContext();
```

2. Update tenant status handling:
```typescript
// Old
type TenantStatus = 'active' | 'inactive';

// New
type TenantStatus = 'active' | 'pending' | 'archived';
```

3. Use proper role types:
```typescript
// Old
role: string;

// New
role: TenantRole;
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