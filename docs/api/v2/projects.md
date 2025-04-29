# Projects API

Projects represent workspaces linked to cloud storage folders.

## Create Project

```http
POST /api/v2/projects
```

Creates a new project.

### Request Body

```typescript
{
  name: string;           // Project name
  tenantId: string;      // Tenant ID
  cloudProvider: string;  // Cloud provider ID
  projectTypeId: string; // Project type ID
  folderId: string;      // Cloud folder ID
  folderPath: string;    // Cloud folder path
}
```

### Response

```typescript
{
  _id: string;
  name: string;
  tenantId: string;
  ownerId: string;
  cloudProvider: string;
  projectTypeId: string;
  folderId: string;
  folderPath: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Tenant, provider, or project type not found
- `FORBIDDEN` - Not authorized to create projects in tenant
- `CONFLICT` - Folder already used in another project

## Get Project

```http
GET /api/v2/projects/:projectId
```

Gets a project by ID.

### Response

```typescript
{
  _id: string;
  name: string;
  tenantId: string;
  ownerId: string;
  cloudProvider: string;
  projectTypeId: string;
  folderId: string;
  folderPath: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Project not found
- `FORBIDDEN` - Not authorized to access project

## List Projects

```http
GET /api/v2/projects?tenantId=:tenantId
```

Lists projects in a tenant.

### Query Parameters

- `tenantId` - Tenant ID (required)

### Response

```typescript
{
  projects: Array<{
    _id: string;
    name: string;
    tenantId: string;
    ownerId: string;
    cloudProvider: string;
    projectTypeId: string;
    folderId: string;
    folderPath: string;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Errors

- `NOT_FOUND` - Tenant not found
- `FORBIDDEN` - Not authorized to list tenant projects

## Update Project

```http
PATCH /api/v2/projects/:projectId
```

Updates an existing project.

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
  tenantId: string;
  ownerId: string;
  cloudProvider: string;
  projectTypeId: string;
  folderId: string;
  folderPath: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Project not found or archived
- `VALIDATION_ERROR` - Invalid request data
- `FORBIDDEN` - Not authorized to update project

## Archive Project

```http
POST /api/v2/projects/:projectId/archive
```

Archives a project.

### Response

```typescript
{
  _id: string;
  name: string;
  tenantId: string;
  ownerId: string;
  cloudProvider: string;
  projectTypeId: string;
  folderId: string;
  folderPath: string;
  archived: true;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Project not found
- `FORBIDDEN` - Not authorized to archive project
- `CONFLICT` - Project already archived