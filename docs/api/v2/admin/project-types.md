# Project Types API

Project types define the available types of projects that can be created in the system.

## Create Project Type

```http
POST /api/v2/admin/project-types
```

Creates a new project type.

### Request Body

```typescript
{
  projectTypeId: string;  // Unique identifier (lowercase, alphanumeric, hyphens)
  name: string;          // Display name
  description: string;   // Optional description
  iconUrl?: string;     // Optional icon URL
  configSchema: object;  // JSON Schema for project configuration
}
```

### Response

```typescript
{
  projectTypeId: string;
  name: string;
  description: string;
  iconUrl?: string;
  configSchema: object;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - Project type ID already exists

## List Project Types

```http
GET /api/v2/admin/project-types
```

Lists all project types.

### Response

```typescript
{
  projectTypes: Array<{
    projectTypeId: string;
    name: string;
    description: string;
    iconUrl?: string;
    configSchema: object;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

## Update Project Type

```http
PATCH /api/v2/admin/project-types/:projectTypeId
```

Updates an existing project type.

### Request Body

```typescript
{
  name?: string;
  description?: string;
  iconUrl?: string;
  configSchema?: object;
}
```

### Response

```typescript
{
  projectTypeId: string;
  name: string;
  description: string;
  iconUrl?: string;
  configSchema: object;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Project type not found
- `VALIDATION_ERROR` - Invalid request data

## Delete Project Type

```http
DELETE /api/v2/admin/project-types/:projectTypeId
```

Deletes a project type.

### Response

```typescript
{
  success: true;
}
```

### Errors

- `NOT_FOUND` - Project type not found
- `CONFLICT` - Project type is in use by existing projects