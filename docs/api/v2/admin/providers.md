# Cloud Providers API

Cloud providers define the available storage providers that can be used for projects.

## Create Cloud Provider

```http
POST /api/v2/admin/providers
```

Creates a new cloud provider.

### Request Body

```typescript
{
  providerId: string;    // Unique identifier (lowercase, alphanumeric, hyphens)
  name: string;         // Display name
  authType: 'OAuth2' | 'APIKey';  // Authentication type
  // OAuth2 specific fields
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  // Configuration options
  configOptions: {
    authUrl?: string;    // OAuth2 authorization URL
    scope?: string;      // OAuth2 scopes
    region?: string;     // API Key region
    [key: string]: any;  // Additional provider-specific options
  };
}
```

### Response

```typescript
{
  providerId: string;
  name: string;
  authType: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  configOptions: object;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - Provider ID already exists

## List Cloud Providers

```http
GET /api/v2/admin/providers
```

Lists all cloud providers.

### Response

```typescript
{
  providers: Array<{
    providerId: string;
    name: string;
    authType: string;
    clientId?: string;
    redirectUri?: string;
    configOptions: object;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

## Update Cloud Provider

```http
PATCH /api/v2/admin/providers/:providerId
```

Updates an existing cloud provider.

### Request Body

```typescript
{
  name?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  configOptions?: object;
}
```

### Response

```typescript
{
  providerId: string;
  name: string;
  authType: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  configOptions: object;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `NOT_FOUND` - Provider not found
- `VALIDATION_ERROR` - Invalid request data

## Delete Cloud Provider

```http
DELETE /api/v2/admin/providers/:providerId
```

Deletes a cloud provider.

### Response

```typescript
{
  success: true;
}
```

### Errors

- `NOT_FOUND` - Provider not found
- `CONFLICT` - Provider is in use by existing projects