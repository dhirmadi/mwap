# Tenants API

Tenants represent isolated workspaces for users and their projects.

## Create Tenant

```http
POST /api/v2/tenants
```

Creates a new tenant for the authenticated user.

### Request Body

```typescript
{
  name: string;  // Tenant name
}
```

### Response

```typescript
{
  _id: string;
  name: string;
  ownerId: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - User already has an active tenant

## Get Tenant

```http
GET /api/v2/tenants/:tenantId
```

Gets a tenant by ID.

### Response

```typescript
{
  _id: string;
  name: string;
  ownerId: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Tenant not found
- `FORBIDDEN` - Not authorized to access tenant

## Update Tenant

```http
PATCH /api/v2/tenants/:tenantId
```

Updates an existing tenant.

### Request Body

```typescript
{
  name?: string;
}
```

### Response

```typescript
{
  _id: string;
  name: string;
  ownerId: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Tenant not found or archived
- `VALIDATION_ERROR` - Invalid request data
- `FORBIDDEN` - Not authorized to update tenant

## Archive Tenant

```http
POST /api/v2/tenants/:tenantId/archive
```

Archives a tenant.

### Response

```typescript
{
  _id: string;
  name: string;
  ownerId: string;
  archived: true;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Tenant not found
- `FORBIDDEN` - Not authorized to archive tenant
- `CONFLICT` - Tenant already archived