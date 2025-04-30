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

## Project Members

### Add Member

```http
POST /api/v2/projects/:projectId/members
```

Adds a new member to the project. Only project owners and deputies can add members, and they can only assign roles lower than their own.

### Request Body

```typescript
{
  userId: string;  // User ID to add
  role: 'OWNER' | 'DEPUTY' | 'MEMBER';  // Role to assign
}
```

### Response

```typescript
{
  userId: string;
  role: 'OWNER' | 'DEPUTY' | 'MEMBER';
  joinedAt: string;
}
```

### Errors

- `NOT_FOUND` - Project not found or archived
- `FORBIDDEN` - Not authorized to add members or attempting to assign invalid role
- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - User is already a member

### Update Member Role

```http
PATCH /api/v2/projects/:projectId/members/:userId
```

Updates a member's role in the project. Only project owners and deputies can modify roles, and they can only:
- Modify roles of members with lower roles than themselves
- Assign roles lower than their own
- Cannot modify their own role

### Request Body

```typescript
{
  role: 'OWNER' | 'DEPUTY' | 'MEMBER';  // New role to assign
}
```

### Response

```typescript
{
  userId: string;
  role: 'OWNER' | 'DEPUTY' | 'MEMBER';
  joinedAt: string;
}
```

### Errors

- `NOT_FOUND` - Project or member not found
- `FORBIDDEN` - Not authorized to modify roles or attempting invalid role change
- `VALIDATION_ERROR` - Invalid role value

### Remove Member

```http
DELETE /api/v2/projects/:projectId/members/:userId
```

Removes a member from the project. Only project owners and deputies can remove members, and they can only remove members with lower roles than themselves. Members cannot remove themselves.

### Response

Returns `204 No Content` on success.

### Errors

- `NOT_FOUND` - Project or member not found
- `FORBIDDEN` - Not authorized to remove members or attempting to remove member with equal/higher role
- `CONFLICT` - Attempting to remove self