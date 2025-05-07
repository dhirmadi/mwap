# Cloud API

The Cloud API handles cloud storage provider integration.

## Start OAuth Flow

```http
POST /api/v2/cloud/oauth/start
```

Starts the OAuth2 authorization flow.

### Request Body

```typescript
{
  providerId: string;  // Cloud provider ID
}
```

### Response

```typescript
{
  authUrl: string;  // Authorization URL
  state: string;    // OAuth state parameter
}
```

### Errors

- `NOT_FOUND` - Provider not found
- `VALIDATION_ERROR` - Invalid provider type

## Complete OAuth Flow

```http
POST /api/v2/cloud/oauth/complete
```

Completes the OAuth2 authorization flow.

### Request Body

```typescript
{
  code: string;   // Authorization code
  state: string;  // OAuth state parameter
}
```

### Response

```typescript
{
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}
```

### Errors

- `VALIDATION_ERROR` - Invalid code or state
- `UNAUTHORIZED` - Authorization failed

## List Folders

```http
GET /api/v2/cloud/folders
```

Lists available folders from a cloud provider.

### Query Parameters

- `providerId` - Cloud provider ID (required)
- `accessToken` - Provider access token (required)
- `parentId` - Optional parent folder ID

### Response

```typescript
{
  folders: Array<{
    id: string;
    name: string;
    path: string;
    type: 'folder';
    parentId?: string;
  }>;
}
```

### Errors

- `NOT_FOUND` - Provider not found
- `UNAUTHORIZED` - Invalid access token
- `VALIDATION_ERROR` - Invalid provider ID